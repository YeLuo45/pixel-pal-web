/**
 * V132 Skill Genome — Skill genome types and version chain management
 * 
 * Each Skill has a genome that tracks:
 * - coreKeywords: L1 InsightIndexer keywords
 * - applicableEmotions: emotion dimension adaptation
 * - successConditions: task success patterns
 * - failurePatterns: lessons from failures
 * - growthLog: version evolution history
 */

export type GrowthTrigger = 'threshold' | 'user_correction' | 'pattern_detected';

export interface GrowthEvent {
  version: string;
  trigger: GrowthTrigger;
  before: string;  // JSON diff
  after: string;
  timestamp: string;
  callCountAtTrigger: number;
  successRateAtTrigger: number;
}

export interface SkillGenome {
  skillId: string;
  currentVersion: string;
  coreKeywords: string[];
  applicableEmotions: string[];
  successConditions: string[];
  failurePatterns: string[];
  growthLog: GrowthEvent[];
  callCount: number;
  successCount: number;
  failCount: number;
  lastCallTimestamp: string | null;
  versionChain: string[]; // ordered list of versions: ['v1', 'v2', 'v3']
}

export interface SkillVersion {
  version: string;
  skillId: string;
  systemPrompt: string;
  description: string;
  createdAt: string;
  optimizedFrom?: string; // previous version if this was generated
  optimizationReason?: string;
}

export interface EvolutionState {
  activeSkillId: string | null;
  versionChain: Record<string, string[]>; // skillId -> ['v1', 'v2', ...]
  evolvingSkillIds: Set<string>; // skills currently being evolved
  lastScanTimestamp: number;
}

export interface EvolutionReport {
  skillId: string;
  version: string;
  callCount: number;
  successRate: number;
  recommendation: 'optimize' | 'generalize' | 'none';
  reason: string;
  suggestedChanges?: string;
}

/**
 * Create an empty SkillGenome for a new skill
 */
export function createSkillGenome(skillId: string, initialVersion = 'v1'): SkillGenome {
  return {
    skillId,
    currentVersion: initialVersion,
    coreKeywords: [],
    applicableEmotions: [],
    successConditions: [],
    failurePatterns: [],
    growthLog: [],
    callCount: 0,
    successCount: 0,
    failCount: 0,
    lastCallTimestamp: null,
    versionChain: [initialVersion],
  };
}

/**
 * Record a call event in the genome
 */
export function recordCall(genome: SkillGenome, success: boolean): SkillGenome {
  const now = new Date().toISOString();
  return {
    ...genome,
    callCount: genome.callCount + 1,
    successCount: success ? genome.successCount + 1 : genome.successCount,
    failCount: success ? genome.failCount : genome.failCount + 1,
    lastCallTimestamp: now,
  };
}

/**
 * Add a growth event to the genome
 */
export function addGrowthEvent(
  genome: SkillGenome,
  event: Omit<GrowthEvent, 'timestamp' | 'callCountAtTrigger' | 'successRateAtTrigger'>
): SkillGenome {
  const successRate = genome.callCount > 0 
    ? Math.round((genome.successCount / genome.callCount) * 100) 
    : 0;
    
  const growthEvent: GrowthEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    callCountAtTrigger: genome.callCount,
    successRateAtTrigger: successRate,
  };

  return {
    ...genome,
    growthLog: [...genome.growthLog, growthEvent],
  };
}

/**
 * Get success rate percentage
 */
export function getSuccessRate(genome: SkillGenome): number {
  if (genome.callCount === 0) return 0;
  return Math.round((genome.successCount / genome.callCount) * 100);
}

/**
 * Check if evolution threshold is met
 * callCount >= 10 -> effect evaluation
 * successRate < 60% -> version split (generate vN+1)
 * callCount >= 50 && successRate >= 80% -> capability generalization (new skill)
 */
export function checkEvolutionThreshold(genome: SkillGenome): EvolutionReport['recommendation'] {
  const successRate = getSuccessRate(genome);
  
  if (genome.callCount >= 50 && successRate >= 80) {
    return 'generalize';
  }
  if (genome.callCount >= 10) {
    if (successRate < 60) {
      return 'optimize';
    }
  }
  return 'none';
}