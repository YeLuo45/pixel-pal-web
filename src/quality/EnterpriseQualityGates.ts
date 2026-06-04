/**
 * Enterprise Quality Gates
 * claude-code Enterprise Code Quality Gates V2
 */

import { SecurityScanner, type SecurityResult, type Severity } from './SecurityScanner';
import type { QualityCheck, QualityLayer, ArchitectureScore, QualityDashboard, DashboardMetrics, QualityTrend, QualityBreakdown } from './types';

export { type SecurityResult, type Severity };

export interface QualityLayer {
  name: 'L1' | 'L2' | 'L3' | 'L4';
  score: number; // 0-100
  passed: boolean;
  checks: QualityCheck[];
}

export interface EnterpriseQualityResult {
  overallScore: number;
  passed: boolean;
  layers: QualityLayer[];
  securityResults: SecurityResult[];
  architectureScore: ArchitectureScore;
  recommendations: string[];
}

const L1_CHECKS = [
  { name: 'non-empty', fn: (c: string) => c.length > 0 },
  { name: 'minimum-length', fn: (c: string) => c.length >= 20 },
  { name: 'valid-characters', fn: (c: string) => !/[^\w\s{}()\[\];.,:?!<>=+*/%&-]/.test(c) },
  { name: 'has-line-breaks', fn: (c: string) => c.includes('\n') },
  { name: 'balanced-brackets', fn: (c: string) => {
    let depth = 0;
    for (const ch of c) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth < 0) return false;
    }
    return depth === 0;
  }},
];

export class EnterpriseQualityGates {
  private securityScanner: SecurityScanner;
  private history: { score: number; timestamp: number }[] = [];

  constructor() {
    this.securityScanner = new SecurityScanner();
  }

  /**
   * Run all four quality layers
   */
  async runAllLayers(code: string): Promise<QualityLayer[]> {
    const [l1, l2, l3] = await Promise.all([
      this.runL1Checks(code),
      this.runL2SecurityScan(code),
      this.runL3ArchitectureScore(code),
    ]);

    return [l1, l2, l3, this.runL4Dashboard()];
  }

  /**
   * L1: Basic quality checks
   */
  async runL1Checks(code: string): Promise<QualityLayer> {
    const checks: QualityCheck[] = L1_CHECKS.map(({ name, fn }) => {
      const passed = fn(code);
      const score = passed ? 100 : 0;
      return { name, passed, score, message: passed ? undefined : `Failed ${name}` };
    });

    const avgScore = checks.reduce((s, c) => s + c.score, 0) / checks.length;
    return { name: 'L1', score: avgScore, passed: checks.every((c) => c.passed), checks };
  }

  /**
   * L2: Security scan
   */
  async runL2SecurityScan(code: string): Promise<QualityLayer> {
    const results = this.securityScanner.scan(code);
    const score = this.securityScanner.getSecurityScore(code);
    const passed = score >= 70;

    const checks: QualityCheck[] = [
      { name: 'security-scan', passed, score, message: passed ? undefined : `${results.length} security issue(s) found` },
    ];

    return { name: 'L2', score, passed, checks };
  }

  /**
   * L3: Architecture scoring
   */
  async runL3ArchitectureScore(code: string): Promise<QualityLayer> {
    const score = this.calculateArchitectureScore(code);
    const passed = score >= 60;

    return {
      name: 'L3',
      score,
      passed,
      checks: [{ name: 'architecture-score', passed, score, message: passed ? undefined : `Architecture score ${score} below threshold` }],
    };
  }

  /**
   * L4: Dashboard data
   */
  runL4Dashboard(): QualityLayer {
    const metrics = this.getDashboardMetrics();
    const score = metrics.averageScore;
    const passed = score >= 70;

    return {
      name: 'L4',
      score,
      passed,
      checks: [{ name: 'dashboard', passed, score, message: passed ? undefined : `Dashboard score ${score} below threshold` }],
    };
  }

  /**
   * Comprehensive evaluation
   */
  async evaluate(code: string): Promise<EnterpriseQualityResult> {
    const layers = await this.runAllLayers(code);
    const securityResults = this.securityScanner.scan(code);
    const architectureScore = this.calculateArchitectureScoreDetailed(code);
    const overallScore = this.calculateOverallScore(layers);
    const passed = layers.every((l) => l.passed);
    const recommendations = this.generateRecommendations(layers, securityResults);

    this.history.push({ score: overallScore, timestamp: Date.now() });

    return { overallScore, passed, layers, securityResults, architectureScore, recommendations };
  }

  /**
   * Get dashboard metrics
   */
  getDashboardMetrics(): DashboardMetrics {
    const scores = this.history.map((h) => h.score);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 100;
    const min = scores.length ? Math.min(...scores) : 100;
    const max = scores.length ? Math.max(...scores) : 100;

    return {
      averageScore: avg,
      minScore: min,
      maxScore: max,
      totalScans: this.history.length,
      lastScanScore: scores[scores.length - 1] ?? 100,
    };
  }

  /**
   * Get quality trends
   */
  getQualityTrends(): QualityTrend[] {
    if (this.history.length < 2) return [];

    const sorted = [...this.history].sort((a, b) => a.timestamp - b.timestamp);
    const windowSize = Math.min(5, sorted.length);
    const trends: QualityTrend[] = [];

    for (let i = windowSize - 1; i < sorted.length; i++) {
      const window = sorted.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((s, h) => s + h.score, 0) / window.length;
      trends.push({
        timestamp: window[window.length - 1].timestamp,
        score: avg,
        direction: i > 0 && window[window.length - 1].score > window[0].score ? 'improving' : 'degrading',
      });
    }

    return trends;
  }

  /**
   * Get quality breakdown by layer
   */
  getQualityBreakdown(): QualityBreakdown {
    const breakdown: QualityBreakdown = { L1: 0, L2: 0, L3: 0, L4: 0 };
    for (const h of this.history) {
      breakdown.L1 += h.score * 0.25;
      breakdown.L2 += h.score * 0.25;
      breakdown.L3 += h.score * 0.25;
      breakdown.L4 += h.score * 0.25;
    }
    const count = this.history.length || 1;
    return {
      L1: breakdown.L1 / count,
      L2: breakdown.L2 / count,
      L3: breakdown.L3 / count,
      L4: breakdown.L4 / count,
    };
  }

  /**
   * Get security scanner for direct access
   */
  getSecurityScanner(): SecurityScanner {
    return this.securityScanner;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }

  private calculateArchitectureScore(code: string): number {
    let score = 50;

    // Modular: has functions/classes
    if (/function\s+\w+/.test(code)) score += 10;
    if (/class\s+\w+/.test(code)) score += 10;

    // Maintainable: reasonable line length
    const lines = code.split('\n');
    const avgLineLen = lines.reduce((s, l) => s + l.length, 0) / lines.length;
    if (avgLineLen < 100) score += 10;
    if (/export\s+(const|function|class)/.test(code)) score += 10;

    return Math.min(100, score);
  }

  private calculateArchitectureScoreDetailed(code: string): ArchitectureScore {
    const modularity = this.scoreModularity(code);
    const maintainability = this.scoreMaintainability(code);
    const reusability = this.scoreReusability(code);
    const overall = (modularity + maintainability + reusability) / 3;

    return { modularity, maintainability, reusability, overall };
  }

  private scoreModularity(code: string): number {
    let score = 50;
    if (/function\s+\w+/.test(code)) score += 20;
    if (/class\s+\w+/.test(code)) score += 20;
    if (/interface\s+\w+/.test(code)) score += 10;
    return Math.min(100, score);
  }

  private scoreMaintainability(code: string): number {
    const lines = code.split('\n');
    const avgLen = lines.reduce((s, l) => s + l.length, 0) / lines.length;
    let score = avgLen < 80 ? 70 : avgLen < 120 ? 50 : 30;
    if (/TODO|FIXME|BUG/.test(code)) score -= 10;
    if (/\/\*[\s\S]*?\*\//.test(code)) score += 15;
    return Math.max(0, Math.min(100, score));
  }

  private scoreReusability(code: string): number {
    let score = 50;
    if (/export\s+(const|function|class)/.test(code)) score += 30;
    if (/interface\s+\w+/.test(code)) score += 20;
    return Math.min(100, score);
  }

  private calculateOverallScore(layers: QualityLayer[]): number {
    return layers.reduce((s, l) => s + l.score, 0) / layers.length;
  }

  private generateRecommendations(layers: QualityLayer[], securityResults: SecurityResult[]): string[] {
    const recs: string[] = [];

    for (const layer of layers) {
      if (!layer.passed) {
        recs.push(`Improve ${layer.name} score (currently ${layer.score.toFixed(1)})`);
      }
    }

    for (const result of securityResults.slice(0, 3)) {
      if (result.severity === 'critical' || result.severity === 'high') {
        recs.push(`Security: ${result.message}`);
      }
    }

    return recs;
  }
}

export default EnterpriseQualityGates;