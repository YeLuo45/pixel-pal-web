/**
 * Feedback Loop Engine v3
 * thunderbolt-design Feedback Loop Engine v3 - Multi-source + Adaptive + Stability + Prediction
 */

export type FeedbackType = 'positive' | 'negative' | 'neutral';

export interface FeedbackV3 {
  source: string;
  target: string;
  type: FeedbackType;
  value: number;
  timestamp: number;
  weight: number;
}

export interface StabilityMetricsV3 {
  variance: number;
  oscillation: number;
  trend: number;
}

export class FeedbackLoopEngineV3 {
  private feedbacks: FeedbackV3[] = [];
  private learningRate = 0.1;
  private lastLearningResult = 0;

  addFeedback(feedback: FeedbackV3): void {
    this.feedbacks.push({ ...feedback });
  }

  aggregateBySource(source: string): FeedbackV3[] {
    return this.feedbacks.filter(f => f.source === source);
  }

  aggregateByTarget(target: string): FeedbackV3[] {
    return this.feedbacks.filter(f => f.target === target);
  }

  aggregateByType(type: FeedbackType): FeedbackV3[] {
    return this.feedbacks.filter(f => f.type === type);
  }

  learn(): number {
    if (this.feedbacks.length === 0) {
      this.lastLearningResult = 0;
      return 0;
    }

    let totalWeightedValue = 0;
    let totalWeight = 0;
    let negativeCount = 0;
    let positiveCount = 0;

    for (const f of this.feedbacks) {
      const signedValue = f.type === 'negative' ? -f.value : f.value;
      totalWeightedValue += signedValue * f.weight;
      totalWeight += f.weight;
      if (f.type === 'positive') positiveCount++;
      if (f.type === 'negative') negativeCount++;
    }

    const weightedAvg = totalWeight > 0 ? totalWeightedValue / totalWeight : 0;
    // Adaptive learning: weight by ratio of positive to total
    const ratio = this.feedbacks.length > 0 ? positiveCount / this.feedbacks.length : 0.5;
    const adjusted = weightedAvg * (1 + this.learningRate * (ratio - 0.5));
    this.lastLearningResult = Math.round(adjusted * 100) / 100;
    return this.lastLearningResult;
  }

  getStability(): StabilityMetricsV3 {
    if (this.feedbacks.length === 0) {
      return { variance: 0, oscillation: 0, trend: 0 };
    }

    const values = this.feedbacks.map(f => f.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;

    // Oscillation: number of times direction changes
    let oscillation = 0;
    for (let i = 1; i < this.feedbacks.length; i++) {
      const prev = this.feedbacks[i - 1].value;
      const curr = this.feedbacks[i].value;
      const diff1 = curr - prev;
      if (i >= 2) {
        const prevPrev = this.feedbacks[i - 2].value;
        const diff2 = prev - prevPrev;
        if (diff1 * diff2 < 0) oscillation++;
      }
    }

    // Trend: linear regression slope
    const n = this.feedbacks.length;
    const indices = this.feedbacks.map((_, i) => i);
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x) => sum + x * values[x], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
    const trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);

    return {
      variance: Math.round(variance * 100) / 100,
      oscillation,
      trend: Math.round(trend * 100) / 100,
    };
  }

  predictTrend(): 'rising' | 'falling' | 'stable' {
    const { trend } = this.getStability();
    if (trend > 0.1) return 'rising';
    if (trend < -0.1) return 'falling';
    return 'stable';
  }

  getFeedbackCount(): number {
    return this.feedbacks.length;
  }

  getAverageValue(): number {
    if (this.feedbacks.length === 0) return 0;
    const sum = this.feedbacks.reduce((acc, f) => acc + f.value, 0);
    return Math.round(sum / this.feedbacks.length * 100) / 100;
  }

  getWeightedAverageValue(): number {
    if (this.feedbacks.length === 0) return 0;
    const totalWeight = this.feedbacks.reduce((acc, f) => acc + f.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedSum = this.feedbacks.reduce((acc, f) => acc + f.value * f.weight, 0);
    return Math.round(weightedSum / totalWeight * 100) / 100;
  }

  getPositiveCount(): number {
    return this.feedbacks.filter(f => f.type === 'positive').length;
  }

  getNegativeCount(): number {
    return this.feedbacks.filter(f => f.type === 'negative').length;
  }

  getNeutralCount(): number {
    return this.feedbacks.filter(f => f.type === 'neutral').length;
  }

  getSources(): string[] {
    return [...new Set(this.feedbacks.map(f => f.source))];
  }

  getTargets(): string[] {
    return [...new Set(this.feedbacks.map(f => f.target))];
  }

  getFeedbackByTimeRange(start: number, end: number): FeedbackV3[] {
    return this.feedbacks.filter(f => f.timestamp >= start && f.timestamp <= end);
  }

  clearAll(): void {
    this.feedbacks = [];
    this.lastLearningResult = 0;
  }

  setLearningRate(rate: number): void {
    this.learningRate = Math.max(0, Math.min(1, rate));
  }

  getLearningRate(): number {
    return this.learningRate;
  }

  getLastLearningResult(): number {
    return this.lastLearningResult;
  }

  removeFeedback(index: number): boolean {
    if (index < 0 || index >= this.feedbacks.length) return false;
    this.feedbacks.splice(index, 1);
    return true;
  }
}

export default FeedbackLoopEngineV3;