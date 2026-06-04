/**
 * V188: SkillCrystallizer - Self-Crystallization Engine
 * 
 * Converts interaction traces into crystallized skill rules.
 * Pattern extraction → Crystallization judgment → Skill rule generation → Pruning
 * 
 * PRD: P-20260604-038 Direction D Iteration 1/9
 */

import type { Database } from 'wa-sqlite';
import { getDatabase, generateChangeId, now } from '../db/index';
import { addChangeLogEntry } from '../db/syncLog';
import { hookManager } from '../core/hooks/HookManager';

// Skill storage table name
const SKILLS_TABLE = 'evolution_crystallized_skills';

/**
 * Interaction trace from user/agent interactions
 */
export interface InteractionTrace {
  id: string;
  timestamp: number;
  type: 'task' | 'query' | 'response' | 'feedback';
  input: string;
  output: string;
  success: boolean;
  latency?: number;
}

/**
 * Pattern extracted from interaction traces
 */
export interface Pattern {
  id: string;
  trigger: string;
  action: string;
  frequency: number;
  confidence: number;
  avgLatency?: number;
  traces: string[];  // trace IDs
}

/**
 * Crystallized skill rule
 */
export interface CrystallizedSkill {
  skillId: string;
  trigger: string;
  action: string;
  successRate: number;
  usageCount: number;
  confidence: number;
  createdAt: number;
  expiresAt?: number;
}

/**
 * Skill quality evaluation result
 */
export interface SkillQuality {
  skillId: string;
  score: number;
  healthStatus: 'excellent' | 'good' | 'poor' | 'expired';
  recommendations: string[];
}

/**
 * SkillCrystallizer converts patterns into executable skill rules
 */
export class SkillCrystallizer {
  private db: Database | null;
  private skills: Map<string, CrystallizedSkill> = new Map();
  private patterns: Map<string, Pattern> = new Map();

  constructor() {
    this.db = getDatabase();
    this.initTable();
  }

  /**
   * Initialize the skills table
   */
  private initTable(): void {
    const db = this.db;
    if (!db) return;

    const SQL = db.getSQL();
    SQL`
      CREATE TABLE IF NOT EXISTS evolution_crystallized_skills (
        skill_id TEXT PRIMARY KEY,
        trigger TEXT NOT NULL,
        action TEXT NOT NULL,
        success_rate REAL NOT NULL DEFAULT 0,
        usage_count INTEGER NOT NULL DEFAULT 0,
        confidence REAL NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        expires_at INTEGER
      )
    `;
    SQL`CREATE INDEX IF NOT EXISTS idx_skills_trigger ON evolution_crystallized_skills(trigger)`;
    SQL`CREATE INDEX IF NOT EXISTS idx_skills_confidence ON evolution_crystallized_skills(confidence)`;
  }

  /**
   * Extract patterns from interaction traces
   * Groups similar traces by input/output patterns and calculates frequency/confidence
   */
  async extractPatterns(traces: InteractionTrace[]): Promise<Pattern[]> {
    if (!traces || traces.length === 0) {
      return [];
    }

    const patternGroups = new Map<string, InteractionTrace[]>();

    // Group traces by input keyword extraction (simple tokenization)
    for (const trace of traces) {
      const key = this.extractKeyFromTrace(trace);
      if (!patternGroups.has(key)) {
        patternGroups.set(key, []);
      }
      patternGroups.get(key)!.push(trace);
    }

    const patterns: Pattern[] = [];

    for (const [key, groupTraces] of patternGroups) {
      if (groupTraces.length < 2) continue;  // Minimum 2 occurrences

      const successCount = groupTraces.filter(t => t.success).length;
      const confidence = groupTraces.length > 0 ? successCount / groupTraces.length : 0;

      // Calculate average latency
      const latencies = groupTraces.filter(t => t.latency !== undefined).map(t => t.latency!);
      const avgLatency = latencies.length > 0 
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
        : undefined;

      // Determine trigger and action from trace content
      const trigger = this.generateTrigger(groupTraces[0]);
      const action = this.generateAction(groupTraces[0]);

      const pattern: Pattern = {
        id: crypto.randomUUID(),
        trigger,
        action,
        frequency: groupTraces.length,
        confidence,
        avgLatency,
        traces: groupTraces.map(t => t.id),
      };

      this.patterns.set(pattern.id, pattern);
      patterns.push(pattern);
    }

    // Trigger hook for pattern extraction
    hookManager.trigger('onPatternsExtracted', {
      data: { patterns, totalTraces: traces.length },
    }).catch(console.error);

    return patterns;
  }

  /**
   * Extract a grouping key from a trace based on input tokens
   */
  private extractKeyFromTrace(trace: InteractionTrace): string {
    // Simple tokenization: extract first 3 significant words
    const words = trace.input.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 3);
    return words.join(' ');
  }

  /**
   * Generate trigger description from trace
   */
  private generateTrigger(trace: InteractionTrace): string {
    const typeLabel = trace.type;
    const inputPreview = trace.input.length > 50 
      ? trace.input.substring(0, 50) + '...' 
      : trace.input;
    return `[${typeLabel}] ${inputPreview}`;
  }

  /**
   * Generate action description from trace
   */
  private generateAction(trace: InteractionTrace): string {
    const outputPreview = trace.output.length > 50 
      ? trace.output.substring(0, 50) + '...' 
      : trace.output;
    return outputPreview;
  }

  /**
   * Determine if a pattern should be crystallized into a skill
   */
  shouldCrystallize(pattern: Pattern, threshold: number = 0.7): boolean {
    // Pattern must have sufficient frequency and confidence
    return pattern.confidence >= threshold && pattern.frequency >= 3;
  }

  /**
   * Crystallize a pattern into a skill rule
   */
  async crystallize(pattern: Pattern): Promise<CrystallizedSkill> {
    const skillId = crypto.randomUUID();
    const ts = now();

    const skill: CrystallizedSkill = {
      skillId,
      trigger: pattern.trigger,
      action: pattern.action,
      successRate: pattern.confidence,
      usageCount: 0,
      confidence: pattern.confidence,
      createdAt: ts,
      expiresAt: ts + (30 * 24 * 60 * 60 * 1000),  // 30 days default
    };

    this.skills.set(skillId, skill);
    this.persistSkill(skill);

    // Trigger hook for skill crystallization
    hookManager.trigger('onSkillCrystallized', {
      data: skill,
    }).catch(console.error);

    return skill;
  }

  /**
   * Persist skill to database
   */
  private persistSkill(skill: CrystallizedSkill): void {
    const db = this.db;
    if (!db) return;

    const SQL = db.getSQL();
    SQL`
      INSERT INTO evolution_crystallized_skills 
      (skill_id, trigger, action, success_rate, usage_count, confidence, created_at, expires_at)
      VALUES (
        ${skill.skillId}, ${skill.trigger}, ${skill.action}, 
        ${skill.successRate}, ${skill.usageCount}, ${skill.confidence},
        ${skill.createdAt}, ${skill.expiresAt ?? null}
      )
    `;

    addChangeLogEntry(SKILLS_TABLE, skill.skillId, 'INSERT', skill);
  }

  /**
   * Evaluate skill quality
   */
  evaluateSkill(skill: CrystallizedSkill): SkillQuality {
    const recommendations: string[] = [];
    let score = 0;
    let healthStatus: SkillQuality['healthStatus'];

    // Calculate base score from confidence and success rate
    score = (skill.confidence * 0.4) + (skill.successRate * 0.4) + (Math.min(skill.usageCount / 10, 1) * 0.2);

    // Check expiration
    const isExpired = skill.expiresAt && skill.expiresAt < now();
    if (isExpired) {
      healthStatus = 'expired';
      recommendations.push('Skill has expired and should be archived or renewed');
    } else if (score >= 0.8) {
      healthStatus = 'excellent';
      recommendations.push('Skill is performing at optimal level');
    } else if (score >= 0.6) {
      healthStatus = 'good';
      recommendations.push('Skill is performing well, consider minor tuning');
    } else {
      healthStatus = 'poor';
      recommendations.push('Skill needs improvement or should be pruned');
    }

    // Low usage warning
    if (skill.usageCount < 5 && skill.usageCount > 0) {
      recommendations.push('Skill has low usage, verify it is being triggered appropriately');
    }

    // Confidence warning
    if (skill.confidence < 0.7) {
      recommendations.push('Skill confidence is below threshold, consider retraining');
    }

    return {
      skillId: skill.skillId,
      score,
      healthStatus,
      recommendations,
    };
  }

  /**
   * Prune skills with confidence below threshold
   * Returns count of pruned skills
   */
  async pruneLowQuality(minConfidence: number = 0.5): Promise<number> {
    let prunedCount = 0;

    // Load from DB if needed
    if (this.skills.size === 0) {
      this.loadAllSkills();
    }

    const toDelete: string[] = [];

    for (const [skillId, skill] of this.skills) {
      if (skill.confidence < minConfidence) {
        toDelete.push(skillId);
      }
    }

    // Delete pruned skills
    for (const skillId of toDelete) {
      this.deleteSkill(skillId);
      prunedCount++;
    }

    if (prunedCount > 0) {
      hookManager.trigger('onSkillsPruned', {
        data: { count: prunedCount, minConfidence },
      }).catch(console.error);
    }

    return prunedCount;
  }

  /**
   * Load all skills from database into memory
   */
  private loadAllSkills(): void {
    const db = this.db;
    if (!db) return;

    const SQL = db.getSQL();
    try {
      const stmt = SQL`SELECT * FROM evolution_crystallized_skills`;
      const rows = stmt.toArray() as Array<{
        skill_id: string;
        trigger: string;
        action: string;
        success_rate: number;
        usage_count: number;
        confidence: number;
        created_at: number;
        expires_at: number | null;
      }>;

      for (const row of rows) {
        const skill: CrystallizedSkill = {
          skillId: row.skill_id,
          trigger: row.trigger,
          action: row.action,
          successRate: row.success_rate,
          usageCount: row.usage_count,
          confidence: row.confidence,
          createdAt: row.created_at,
          expiresAt: row.expires_at ?? undefined,
        };
        this.skills.set(skill.skillId, skill);
      }
    } catch {
      // Table might not exist yet
    }
  }

  /**
   * Get a skill by ID
   */
  getSkill(skillId: string): CrystallizedSkill | null {
    return this.skills.get(skillId) ?? null;
  }

  /**
   * Get all crystallized skills
   */
  getAllSkills(): CrystallizedSkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Update skill usage count
   */
  incrementUsage(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (!skill) return;

    skill.usageCount++;

    const db = this.db;
    if (!db) return;

    const SQL = db.getSQL();
    SQL`UPDATE evolution_crystallized_skills SET usage_count = ${skill.usageCount} WHERE skill_id = ${skillId}`;
    addChangeLogEntry(SKILLS_TABLE, skillId, 'UPDATE', { skillId, usageCount: skill.usageCount });
  }

  /**
   * Delete a skill
   */
  deleteSkill(skillId: string): boolean {
    const db = this.db;
    if (!db) return false;

    this.skills.delete(skillId);

    const SQL = db.getSQL();
    SQL`DELETE FROM evolution_crystallized_skills WHERE skill_id = ${skillId}`;
    addChangeLogEntry(SKILLS_TABLE, skillId, 'DELETE', { skillId });

    return true;
  }

  /**
   * Get skills statistics
   */
  getStats(): {
    total: number;
    avgConfidence: number;
    avgSuccessRate: number;
    totalUsage: number;
    byHealthStatus: Record<string, number>;
  } {
    const skills = this.getAllSkills();
    if (skills.length === 0) {
      return {
        total: 0,
        avgConfidence: 0,
        avgSuccessRate: 0,
        totalUsage: 0,
        byHealthStatus: {},
      };
    }

    let totalConfidence = 0;
    let totalSuccessRate = 0;
    let totalUsage = 0;
    const byHealthStatus: Record<string, number> = {};

    for (const skill of skills) {
      totalConfidence += skill.confidence;
      totalSuccessRate += skill.successRate;
      totalUsage += skill.usageCount;

      const quality = this.evaluateSkill(skill);
      byHealthStatus[quality.healthStatus] = (byHealthStatus[quality.healthStatus] ?? 0) + 1;
    }

    return {
      total: skills.length,
      avgConfidence: totalConfidence / skills.length,
      avgSuccessRate: totalSuccessRate / skills.length,
      totalUsage,
      byHealthStatus,
    };
  }
}

// Singleton instance
let skillCrystallizerInstance: SkillCrystallizer | null = null;

export function getSkillCrystallizer(): SkillCrystallizer {
  if (!skillCrystallizerInstance) {
    skillCrystallizerInstance = new SkillCrystallizer();
  }
  return skillCrystallizerInstance;
}

export default SkillCrystallizer;