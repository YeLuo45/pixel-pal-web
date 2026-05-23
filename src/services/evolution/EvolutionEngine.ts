/**
 * V132 Evolution Engine — periodic scan, threshold detection, LLM optimization, skill growth
 * 
 * Scans every 5 minutes:
 * 1. Read L4 EpisodicMemory recent task records
 * 2. Aggregate by skillId: success rate / correction count
 * 3. For skills hitting threshold:
 *    - If version too old -> generate new version (LLM optimize prompt)
 *    - If pattern repeats -> distill new Skill gene from episodic
 * 4. New Skill validated via SkillGenome -> write to Registry
 * 5. InsightIndexer auto-updates L1 routing table
 */

import type { SkillGenome, EvolutionReport, SkillVersion } from './SkillGenome';
import { createSkillGenome, recordCall, addGrowthEvent, checkEvolutionThreshold, getSuccessRate } from './SkillGenome';
import { saveVersion, loadVersion, saveGenome, loadGenome } from './SkillVersionStore';
import { skillRegistry } from '../skills/skillRegistry';
import { chatCompletionWithTools } from '../ai/model-registry-adapter';

const SCAN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const THRESHOLD_CALL_COUNT = 10;
const LOW_SUCCESS_THRESHOLD = 60;
const HIGH_CALL_COUNT = 50;
const HIGH_SUCCESS_THRESHOLD = 80;

interface SkillFeedback {
  skillId: string;
  callCount: number;
  successCount: number;
  failCount: number;
  lastCallTimestamp: string | null;
}

/**
 * EvolutionEngine — singleton managing skill self-evolution
 */
class EvolutionEngineImpl {
  private running = false;
  private scanTimer: ReturnType<typeof setInterval> | null = null;
  private feedbackBuffer: SkillFeedback[] = [];
  private onEvolutionStateChange?: (evolvingIds: string[]) => void;

  /**
   * Start the evolution engine periodic scan
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    console.log('[EvolutionEngine] Started');
    
    // Initial scan after 30 seconds
    setTimeout(() => this.scan(), 30_000);
    
    // Then periodic scan every 5 minutes
    this.scanTimer = setInterval(() => this.scan(), SCAN_INTERVAL_MS);
  }

  /**
   * Stop the evolution engine
   */
  stop(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    this.running = false;
    console.log('[EvolutionEngine] Stopped');
  }

  /**
   * Record skill call feedback for later aggregation
   */
  recordFeedback(skillId: string, success: boolean): void {
    const existing = this.feedbackBuffer.find(f => f.skillId === skillId);
    
    if (existing) {
      existing.callCount++;
      if (success) existing.successCount++;
      else existing.failCount++;
      existing.lastCallTimestamp = new Date().toISOString();
    } else {
      this.feedbackBuffer.push({
        skillId,
        callCount: 1,
        successCount: success ? 1 : 0,
        failCount: success ? 0 : 1,
        lastCallTimestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Set callback for evolution state changes
   */
  setOnEvolutionStateChange(cb?: (evolvingIds: string[]) => void): void {
    this.onEvolutionStateChange = cb;
  }

  /**
   * Get genome for a skill (create if not exists)
   */
  getOrCreateGenome(skillId: string): SkillGenome {
    const existing = loadGenome(skillId);
    if (existing) return existing;
    
    const skill = skillRegistry.getSkill(skillId);
    const version = skill?.version || 'v1';
    const genome = createSkillGenome(skillId, version);
    saveGenome(genome);
    return genome;
  }

  /**
   * Main scan function — check all skills for evolution eligibility
   */
  async scan(): Promise<void> {
    console.log('[EvolutionEngine] Running evolution scan...');
    
    // Aggregate feedback with skill genomes
    const skillsToCheck = this.collectSkillsToCheck();
    
    for (const skillId of skillsToCheck) {
      const genome = this.getOrCreateGenome(skillId);
      
      // Apply buffered feedback
      const feedback = this.feedbackBuffer.find(f => f.skillId === skillId);
      let updatedGenome = genome;
      
      if (feedback) {
        updatedGenome = recordCall(genome, feedback.successCount > (genome.successCount || 0));
        // Also apply pending feedback
        updatedGenome = {
          ...updatedGenome,
          callCount: genome.callCount + feedback.callCount,
          successCount: genome.successCount + feedback.successCount,
          failCount: genome.failCount + feedback.failCount,
          lastCallTimestamp: feedback.lastCallTimestamp,
        };
      }
      
      // Clear feedback for this skill after applying
      this.feedbackBuffer = this.feedbackBuffer.filter(f => f.skillId !== skillId);
      
      // Check threshold
      const recommendation = checkEvolutionThreshold(updatedGenome);
      
      if (recommendation !== 'none') {
        // Mark as evolving
        this.notifyEvolving(skillId, true);
        
        try {
          const report = this.generateReport(updatedGenome, recommendation);
          await this.evolveSkill(updatedGenome, report);
        } catch (err) {
          console.error(`[EvolutionEngine] Failed to evolve skill ${skillId}:`, err);
        } finally {
          this.notifyEvolving(skillId, false);
        }
      }
      
      // Always save updated genome
      saveGenome(updatedGenome);
    }
    
    console.log('[EvolutionEngine] Scan complete');
  }

  /**
   * Collect all skill IDs to check (from registry + genomes)
   */
  private collectSkillsToCheck(): string[] {
    const skillIds = new Set<string>();
    
    // Add all registered skills
    for (const skill of skillRegistry.getAllSkills()) {
      skillIds.add(skill.id);
    }
    
    // Add skills that have genomes
    for (const skillId of this.getSkillIdsWithGenomes()) {
      skillIds.add(skillId);
    }
    
    return Array.from(skillIds);
  }

  /**
   * Get skill IDs that have genomes in storage
   */
  private getSkillIdsWithGenomes(): string[] {
    const prefix = 'pixelpal_skill_versions/';
    const skillIds = new Set<string>();
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(prefix) && key.endsWith('/genome')) {
          const match = key.match(/pixelpal_skill_versions\/([^/]+)\/genome/);
          if (match) {
            skillIds.add(match[1]);
          }
        }
      }
    } catch {
      // localStorage not available
    }
    
    return Array.from(skillIds);
  }

  /**
   * Generate an evolution report for a skill
   */
  private generateReport(genome: SkillGenome, recommendation: EvolutionReport['recommendation']): EvolutionReport {
    const successRate = getSuccessRate(genome);
    
    return {
      skillId: genome.skillId,
      version: genome.currentVersion,
      callCount: genome.callCount,
      successRate,
      recommendation,
      reason: recommendation === 'generalize'
        ? `callCount(${genome.callCount}) >= 50 && successRate(${successRate}) >= 80%`
        : `callCount(${genome.callCount}) >= 10 && successRate(${successRate}) < 60%`,
    };
  }

  /**
   * Evolve a skill based on the report
   */
  private async evolveSkill(genome: SkillGenome, report: EvolutionReport): Promise<void> {
    console.log(`[EvolutionEngine] Evolving skill ${genome.skillId}:`, report);
    
    const skill = skillRegistry.getSkill(genome.skillId);
    if (!skill) {
      console.warn(`[EvolutionEngine] Skill not found: ${genome.skillId}`);
      return;
    }
    
    if (report.recommendation === 'optimize') {
      // Generate optimized version via LLM
      const newVersion = await this.generateOptimizedVersion(genome, skill.systemPrompt);
      
      if (newVersion) {
        // Record growth event
        const nextGenome = addGrowthEvent(genome, {
          version: newVersion.version,
          trigger: 'threshold',
          before: JSON.stringify({ systemPrompt: skill.systemPrompt }),
          after: JSON.stringify({ systemPrompt: newVersion.systemPrompt }),
        });
        
        // Update genome
        const updatedGenome: SkillGenome = {
          ...nextGenome,
          currentVersion: newVersion.version,
          versionChain: [...genome.versionChain, newVersion.version],
        };
        
        saveGenome(updatedGenome);
        saveVersion(genome.skillId, newVersion);
        
        console.log(`[EvolutionEngine] Created new version ${newVersion.version} for ${genome.skillId}`);
      }
    } else if (report.recommendation === 'generalize') {
      // Capability generalization — from episodic memory patterns
      console.log(`[EvolutionEngine] Skill ${genome.skillId} eligible for capability generalization`);
      // TODO: Implement new skill distillation from episodic memory
    }
  }

  /**
   * Generate an optimized version using LLM
   */
  private async generateOptimizedVersion(genome: SkillGenome, currentPrompt: string): Promise<SkillVersion | null> {
    const nextVersionNum = genome.versionChain.length + 1;
    const nextVersion = `v${nextVersionNum}`;
    
    const optimizationPrompt = `You are the skill optimization module.
Analyze the following skill and generate an improved version.

Current version: ${genome.currentVersion}
Call count: ${genome.callCount}
Success rate: ${getSuccessRate(genome)}%
Failure patterns: ${genome.failurePatterns.join(', ') || 'none recorded'}

Current system prompt:
${currentPrompt}

Generate an improved system prompt that:
1. Addresses common failure patterns
2. Improves task success rate
3. Maintains backward compatibility with existing usage patterns

Return a JSON object with:
- "systemPrompt": the optimized system prompt (string)
- "description": brief description of what was improved

Return ONLY the JSON object, no other text.`;

    try {
      const response = await chatCompletionWithTools(
        [{ role: 'user', content: optimizationPrompt }],
        [],
        `evolution-${genome.skillId}`
      );
      
      const content = typeof response === 'string' ? response : JSON.stringify(response);
      
      // Try to parse JSON from response
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        
        return {
          version: nextVersion,
          skillId: genome.skillId,
          systemPrompt: parsed.systemPrompt || currentPrompt,
          description: parsed.description || `Optimized version generated at ${new Date().toISOString()}`,
          createdAt: new Date().toISOString(),
          optimizedFrom: genome.currentVersion,
          optimizationReason: `callCount >= ${THRESHOLD_CALL_COUNT}, successRate < ${LOW_SUCCESS_THRESHOLD}%`,
        };
      }
    } catch (err) {
      console.error('[EvolutionEngine] LLM optimization failed:', err);
    }
    
    return null;
  }

  /**
   * Notify about evolution state change
   */
  private notifyEvolving(skillId: string, isEvolving: boolean): void {
    // In a full implementation, this would update a shared state
    // For now, just log
    console.log(`[EvolutionEngine] Skill ${skillId} evolution state: ${isEvolving ? 'evolving' : 'idle'}`);
    this.onEvolutionStateChange?.([]);
  }
}

// Singleton instance
export const evolutionEngine = new EvolutionEngineImpl();