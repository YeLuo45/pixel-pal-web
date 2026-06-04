/**
 * Quality Gates v3
 * claude-code-design Quality Gates v3 - Multi-dimension + Compliance + Reporting
 */

export interface QualityMetricsV3 {
  maintainability: number;
  testability: number;
  reusability: number;
  security: number;
}

export interface QualityGate {
  name: string;
  threshold: number;
  weight: number;
}

export interface ComplianceResult {
  passed: boolean;
  failedGates: string[];
  overallScore: number;
}

export class QualityGatesV3 {
  private metrics: QualityMetricsV3;
  private gates: QualityGate[];

  constructor(metrics: QualityMetricsV3) {
    this.metrics = { ...metrics };
    this.gates = [
      { name: 'maintainability', threshold: 70, weight: 1 },
      { name: 'testability', threshold: 75, weight: 1 },
      { name: 'reusability', threshold: 65, weight: 1 },
      { name: 'security', threshold: 80, weight: 1 },
    ];
  }

  evaluate(): number {
    const scores = [
      this.metrics.maintainability,
      this.metrics.testability,
      this.metrics.reusability,
      this.metrics.security,
    ];
    const weights = [0.25, 0.25, 0.25, 0.25];
    const total = scores.reduce((sum, score, i) => sum + score * weights[i], 0);
    return Math.round(total * 100) / 100;
  }

  canPass(threshold: number): boolean {
    return this.evaluate() >= threshold;
  }

  getReport(): string {
    const score = this.evaluate();
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    return `Quality Report: Score=${score} Grade=${grade}`;
  }

  checkCompliance(): ComplianceResult {
    let totalScore = 0;
    let totalWeight = 0;
    const failedGates: string[] = [];

    for (const gate of this.gates) {
      const metricValue = this.metrics[gate.name as keyof QualityMetricsV3];
      if (metricValue < gate.threshold) {
        failedGates.push(gate.name);
      }
      totalScore += metricValue * gate.weight;
      totalWeight += gate.weight;
    }

    return {
      passed: failedGates.length === 0,
      failedGates,
      overallScore: totalWeight > 0 ? Math.round(totalScore / totalWeight * 100) / 100 : 0,
    };
  }

  getGates(): QualityGate[] {
    return [...this.gates];
  }

  addGate(gate: QualityGate): void {
    this.gates.push(gate);
  }

  getMetrics(): QualityMetricsV3 {
    return { ...this.metrics };
  }

  getWeightedScore(): number {
    let totalScore = 0;
    let totalWeight = 0;
    for (const gate of this.gates) {
      const metricValue = this.metrics[gate.name as keyof QualityMetricsV3];
      totalScore += metricValue * gate.weight;
      totalWeight += gate.weight;
    }
    return totalWeight > 0 ? Math.round(totalScore / totalWeight * 100) / 100 : 0;
  }

  getThresholdForGate(gateName: string): number {
    const gate = this.gates.find(g => g.name === gateName);
    return gate?.threshold ?? 0;
  }

  isGatePassed(gateName: string): boolean {
    const gate = this.gates.find(g => g.name === gateName);
    if (!gate) return false;
    const metricValue = this.metrics[gate.name as keyof QualityMetricsV3];
    return metricValue >= gate.threshold;
  }

  setMetrics(metrics: QualityMetricsV3): void {
    this.metrics = { ...metrics };
  }

  getGrade(): string {
    const score = this.evaluate();
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  getSummary(): string {
    const score = this.evaluate();
    const compliance = this.checkCompliance();
    return `Score: ${score}, Grade: ${this.getGrade()}, Passed: ${compliance.passed}`;
  }
}

export default QualityGatesV3;