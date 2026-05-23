/**
 * V136: ForkDetector — genome similarity detection to flag potential forks
 */
import type { SkillGenome } from '../skills/types';

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!keysB.includes(k) || !deepEqual((a as object)[k], (b as object)[k])) return false;
  }
  return true;
}

function genomeSimilarity(a: SkillGenome, b: SkillGenome): number {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  const shared = keysA.filter(k => keysB.includes(k) && deepEqual(a[k], b[k]));
  const total = new Set([...keysA, ...keysB]).size;
  return shared.length / total;
}

export function detectFork(
  candidate: SkillGenome,
  existingProvs: Array<{ skillId: string; version: string; genomeSnapshot: SkillGenome }>
): Array<{ skillId: string; version: string; similarity: number }> {
  const threshold = 0.7;
  return existingProvs
    .map(p => ({ skillId: p.skillId, version: p.version, similarity: genomeSimilarity(candidate, p.genomeSnapshot) }))
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}