/**
 * Load Predictor
 * nanobot-design Load Predictor - Record + Predict + Stats
 */

export interface LoadSample {
  timestamp: number;
  value: number;
}

export interface LoadPrediction {
  next: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export interface LoadStats {
  samples: number;
  avg: number;
  max: number;
  min: number;
  variance: number;
}

export class LoadPredictor {
  private samples: LoadSample[] = [];
  private threshold: number = 0;
  private alerts: LoadSample[] = [];

  record(value: number): void {
    this.samples.push({ timestamp: Date.now(), value });
    if (this.threshold > 0 && value > this.threshold) {
      this.alerts.push({ timestamp: Date.now(), value });
    }
  }

  predict(window: number = 5): LoadPrediction {
    if (this.samples.length === 0) {
      return { next: 0, confidence: 0, trend: 'stable' };
    }
    const recent = this.samples.slice(-window);
    const avg = recent.reduce((s, x) => s + x.value, 0) / recent.length;
    if (recent.length < 2) {
      return { next: avg, confidence: 0.3, trend: 'stable' };
    }
    // Simple linear regression
    const n = recent.length;
    const sumX = recent.reduce((s, _, i) => s + i, 0);
    const sumY = recent.reduce((s, x) => s + x.value, 0);
    const sumXY = recent.reduce((s, x, i) => s + i * x.value, 0);
    const sumXX = recent.reduce((s, _, i) => s + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const next = intercept + slope * n;
    const variance = recent.reduce((s, x) => s + Math.pow(x.value - avg, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const confidence = stdDev === 0 ? 1 : Math.max(0, 1 - stdDev / Math.abs(avg));
    const trend: LoadPrediction['trend'] = slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable';
    return { next, confidence: Math.round(confidence * 100) / 100, trend };
  }

  getStats(): LoadStats {
    const all = this.samples;
    const values = all.map(s => s.value);
    const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    const variance = values.length > 0 ? values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length : 0;
    return {
      samples: all.length,
      avg: Math.round(avg * 100) / 100,
      max: values.length > 0 ? Math.max(...values) : 0,
      min: values.length > 0 ? Math.min(...values) : 0,
      variance: Math.round(variance * 100) / 100,
    };
  }

  getSamples(): LoadSample[] {
    return [...this.samples];
  }

  getAlerts(): LoadSample[] {
    return [...this.alerts];
  }

  getAlertCount(): number {
    return this.alerts.length;
  }

  setThreshold(value: number): void {
    this.threshold = value;
  }

  getThreshold(): number {
    return this.threshold;
  }

  getCount(): number {
    return this.samples.length;
  }

  getLatest(): LoadSample | undefined {
    return this.samples[this.samples.length - 1];
  }

  getOldest(): LoadSample | undefined {
    return this.samples[0];
  }

  getValueAt(index: number): LoadSample | undefined {
    return this.samples[index];
  }

  getFirstN(n: number): LoadSample[] {
    return this.samples.slice(0, n);
  }

  getLastN(n: number): LoadSample[] {
    return this.samples.slice(-n);
  }

  getAbove(threshold: number): LoadSample[] {
    return this.samples.filter(s => s.value > threshold);
  }

  getBelow(threshold: number): LoadSample[] {
    return this.samples.filter(s => s.value < threshold);
  }

  getRange(start: number, end: number): LoadSample[] {
    return this.samples.filter(s => s.timestamp >= start && s.timestamp <= end);
  }

  isIncreasing(window: number = 3): boolean {
    const recent = this.samples.slice(-window);
    if (recent.length < 2) return false;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].value <= recent[i - 1].value) return false;
    }
    return true;
  }

  isDecreasing(window: number = 3): boolean {
    const recent = this.samples.slice(-window);
    if (recent.length < 2) return false;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].value >= recent[i - 1].value) return false;
    }
    return true;
  }

  getTrend(window: number = 3): 'up' | 'down' | 'stable' {
    if (this.isIncreasing(window)) return 'up';
    if (this.isDecreasing(window)) return 'down';
    return 'stable';
  }

  getSum(): number {
    return this.samples.reduce((s, x) => s + x.value, 0);
  }

  getMedian(): number {
    if (this.samples.length === 0) return 0;
    const sorted = [...this.samples.map(s => s.value)].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  getStdDev(): number {
    return Math.sqrt(this.getStats().variance);
  }

  reset(): void {
    this.samples = [];
    this.alerts = [];
  }

  clearAll(): void {
    this.samples = [];
    this.alerts = [];
    this.threshold = 0;
  }
}

export default LoadPredictor;