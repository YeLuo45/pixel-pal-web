/**
 * V137: VerificationEngine — runs invariant checks and produces certification report
 */
import { BUILT_IN_INVARIANTS } from './Invariants';
import type { SkillInvariant, VerificationResult } from './types';

export interface SkillGenome {
  skillId: string;
  coreKeywords?: string[];
  maxDepth?: number;
  maxIterations?: number;
  expectedResponseTime?: number;
  [key: string]: unknown;
}

export interface SkillRegistryEntry {
  id: string;
  coreKeywords?: string[];
  [key: string]: unknown;
}

export interface VerificationReport {
  skillId: string;
  version: string;
  timestamp: string;
  results: VerificationResult[];
  overallPassed: boolean;
  overallScore: number;
  certifiedAt: string | null;
}

export function runInvariant(
  invariant: SkillInvariant,
  genome: SkillGenome,
  registry: SkillRegistryEntry[] = []
): VerificationResult {
  const start = Date.now();
  try {
    const fn = new Function('genome', 'registry', `return ${invariant.checkFn}`)(genome, registry);
    const passed = fn.passed;
    const score = Math.max(0, Math.min(1, fn.score));
    return {
      invariantId: invariant.id,
      passed,
      score,
      details: passed ? 'PASS' : `FAIL: score=${score.toFixed(2)} < threshold=${invariant.threshold}`,
      duration_ms: Date.now() - start,
    };
  } catch (e) {
    return {
      invariantId: invariant.id,
      passed: false,
      score: 0,
      details: `ERROR: ${(e as Error).message}`,
      duration_ms: Date.now() - start,
    };
  }
}

export function verifySkill(
  skillId: string,
  version: string,
  genome: SkillGenome,
  registry: SkillRegistryEntry[] = []
): VerificationReport {
  const timestamp = new Date().toISOString();
  const results = BUILT_IN_INVARIANTS.map(inv => runInvariant(inv, genome, registry));
  const overallScore = results.reduce((s, r) => s + r.score, 0) / results.length;
  const criticalFailed = results.some(r => r.invariantId.startsWith('inv_safety') && !r.passed);
  const overallPassed = overallScore >= 0.8 && !criticalFailed;
  return {
    skillId,
    version,
    timestamp,
    results,
    overallPassed,
    overallScore: Math.round(overallScore * 100) / 100,
    certifiedAt: overallPassed ? timestamp : null,
  };
}