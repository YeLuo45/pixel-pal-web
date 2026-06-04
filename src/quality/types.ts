/**
 * Enterprise Quality Gates Types
 */

export interface QualityCheck {
  name: string;
  passed: boolean;
  score: number;
  message?: string;
}

export interface QualityLayer {
  name: 'L1' | 'L2' | 'L3' | 'L4';
  score: number;
  passed: boolean;
  checks: QualityCheck[];
}

export interface ArchitectureScore {
  modularity: number;
  maintainability: number;
  reusability: number;
  overall: number;
}

export interface QualityDashboard {
  metrics: DashboardMetrics;
  trends: QualityTrend[];
  breakdown: QualityBreakdown;
}

export interface DashboardMetrics {
  averageScore: number;
  minScore: number;
  maxScore: number;
  totalScans: number;
  lastScanScore: number;
}

export interface QualityTrend {
  timestamp: number;
  score: number;
  direction: 'improving' | 'degrading' | 'stable';
}

export interface QualityBreakdown {
  L1: number;
  L2: number;
  L3: number;
  L4: number;
}