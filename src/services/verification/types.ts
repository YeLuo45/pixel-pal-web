/**
 * V137: Verification types shared across services
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

export interface VerificationResult {
  invariantId: string;
  passed: boolean;
  score: number;
  details: string;
  duration_ms: number;
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