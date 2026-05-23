/**
 * V137: Built-in invariants library for Skill verification
 */
export interface SkillInvariant {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'compatibility' | 'memory_integrity' | 'performance';
  severity: 'critical' | 'warning' | 'info';
  checkFn: string;
  threshold: number;
}

export const BUILT_IN_INVARIANTS: SkillInvariant[] = [
  {
    id: 'inv_safety_memory_leak',
    name: 'no_memory_leak',
    description: 'Skill does not write more than 1MB of sensitive data to L0',
    category: 'safety',
    severity: 'critical',
    checkFn: '(genome) => { const size = JSON.stringify(genome).length; return { passed: size < 1048576, score: Math.max(0, 1 - size / 1048576) }; }',
    threshold: 0.8,
  },
  {
    id: 'inv_safety_harmful',
    name: 'no_harmful_output',
    description: 'Skill output does not contain known harmful content patterns',
    category: 'safety',
    severity: 'critical',
    checkFn: '(genome) => { const harmful = ["password", "secret", "api_key", "token"]; const ks = Object.keys(genome); const found = harmful.filter(h => ks.includes(h)); return { passed: found.length === 0, score: found.length === 0 ? 1 : 0 }; }',
    threshold: 1.0,
  },
  {
    id: 'inv_compat_conflict',
    name: 'no_conflict',
    description: 'Skill does not share coreKeywords with other installed skills',
    category: 'compatibility',
    severity: 'warning',
    checkFn: '(genome, registry) => { const myKw = (genome.coreKeywords || []).slice(0, 5); const conflicts = registry.filter(s => s.id !== genome.skillId && (s.coreKeywords || []).some(k => myKw.includes(k))); return { passed: conflicts.length === 0, score: conflicts.length === 0 ? 1 : 1 / (conflicts.length + 1) }; }',
    threshold: 0.5,
  },
  {
    id: 'inv_memory_pii',
    name: 'preserve_pii',
    description: 'Skill does not modify PII entries in L1 memory',
    category: 'memory_integrity',
    severity: 'critical',
    checkFn: '(genome) => { const piiOps = ['pii_write', 'pii_delete', 'pii_modify']; const hasPii = piiOps.some(op => JSON.stringify(genome).includes(op)); return { passed: !hasPii, score: hasPii ? 0 : 1 }; }',
    threshold: 1.0,
  },
  {
    id: 'inv_perf_loop',
    name: 'no_infinite_loop',
    description: 'Skill execution path depth is less than 50',
    category: 'performance',
    severity: 'warning',
    checkFn: '(genome) => { const maxDepth = (genome.maxDepth || genome.maxIterations || 100); return { passed: maxDepth < 50, score: maxDepth < 50 ? 1 : Math.max(0, 1 - maxDepth / 200) }; }',
    threshold: 0.8,
  },
  {
    id: 'inv_perf_response',
    name: 'response_time',
    description: 'Skill single response time is under 500ms',
    category: 'performance',
    severity: 'info',
    checkFn: '(genome) => { const rt = genome.expectedResponseTime || 1000; return { passed: rt < 500, score: rt < 500 ? 1 : Math.max(0, 1 - rt / 2000) }; }',
    threshold: 0.5,
  },
];