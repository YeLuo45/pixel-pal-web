/**
 * Feedback Loop Analytics Engine
 * 
 * Signal → Aggregation → Pattern Recognition → Trend Analysis → Stability Assessment
 */

export interface FeedbackSignal {
  loopId: string;
  metric: string;
  value: number;
  timestamp: number;
  tags?: string[];
}

export interface FeedbackTrend {
  metric: string;
  direction: 'improving' | 'degrading' | 'stable';
  changeRate: number;
  confidence: number;
}

export interface LoopStability {
  loopId: string;
  stabilityScore: number; // 0-1
  status: 'stable' | 'volatile' | 'critical';
  recommendations: string[];
}

export interface Prediction {
  metric: string;
  value: number;
}

export interface AnalyticsReport {
  trends: FeedbackTrend[];
  stability: LoopStability;
}

export class FeedbackAnalytics {
  /**
   * Analyze trends from feedback signals
   * Uses linear regression to determine direction and change rate
   */
  analyzeTrends(signals: FeedbackSignal[]): FeedbackTrend[] {
    if (!signals || signals.length === 0) {
      return [];
    }

    // Group signals by metric
    const byMetric = new Map<string, FeedbackSignal[]>();
    for (const signal of signals) {
      const existing = byMetric.get(signal.metric) || [];
      existing.push(signal);
      byMetric.set(signal.metric, existing);
    }

    const trends: FeedbackTrend[] = [];

    for (const [metric, metricSignals] of byMetric) {
      // Sort by timestamp
      const sorted = [...metricSignals].sort((a, b) => a.timestamp - b.timestamp);
      
      if (sorted.length < 2) {
        // Not enough data points - default to stable
        trends.push({
          metric,
          direction: 'stable',
          changeRate: 0,
          confidence: 0,
        });
        continue;
      }

      // Linear regression
      const { slope, intercept, rSquared } = this.linearRegression(sorted);
      
      // Determine direction
      let direction: 'improving' | 'degrading' | 'stable';
      if (Math.abs(slope) < 0.001) {
        direction = 'stable';
      } else if (slope > 0) {
        // For metrics where higher is better (like performance)
        direction = 'improving';
      } else {
        direction = 'degrading';
      }

      trends.push({
        metric,
        direction,
        changeRate: slope,
        confidence: Math.max(0, Math.min(1, rSquared)),
      });
    }

    return trends;
  }

  /**
   * Evaluate loop stability based on signal variance and trends
   */
  evaluateStability(loopId: string, signals: FeedbackSignal[]): LoopStability {
    const loopSignals = signals.filter(s => s.loopId === loopId);
    
    if (loopSignals.length === 0) {
      return {
        loopId,
        stabilityScore: 0,
        status: 'critical',
        recommendations: ['No signals available for analysis'],
      };
    }

    const recommendations: string[] = [];
    
    // Calculate variance of values
    const values = loopSignals.map(s => s.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean !== 0 ? stdDev / Math.abs(mean) : 0; // coefficient of variation

    // Calculate trend for this loop
    const trends = this.analyzeTrends(loopSignals);
    const avgConfidence = trends.length > 0 
      ? trends.reduce((sum, t) => sum + t.confidence, 0) / trends.length 
      : 0;

    // Determine stability score (0-1, higher is more stable)
    let stabilityScore: number;
    let status: 'stable' | 'volatile' | 'critical';

    // Factor 1: Variance (lower variance = higher stability)
    const varianceScore = Math.max(0, 1 - Math.min(cv, 2));
    
    // Factor 2: Trend consistency (high confidence stable trends = higher stability)
    const trendScore = avgConfidence * 0.5 + 0.5;
    
    // Factor 3: Signal count (more signals = more reliable)
    const countScore = Math.min(1, loopSignals.length / 10);

    stabilityScore = varianceScore * 0.5 + trendScore * 0.3 + countScore * 0.2;

    // Determine status
    if (stabilityScore >= 0.7) {
      status = 'stable';
    } else if (stabilityScore >= 0.4) {
      status = 'volatile';
    } else {
      status = 'critical';
    }

    // Generate recommendations
    if (cv > 0.5) {
      recommendations.push('High variance detected - consider stabilizing input parameters');
    }
    if (status === 'volatile' || status === 'critical') {
      recommendations.push('Increase sampling frequency to capture more signal patterns');
    }
    if (loopSignals.length < 5) {
      recommendations.push('Insufficient data points - need at least 5 signals for reliable analysis');
    }
    if (trends.some(t => t.direction === 'degrading')) {
      recommendations.push('Degrading trend detected - review loop configuration');
    }
    if (stabilityScore < 0.4) {
      recommendations.push('Consider resetting loop to baseline state');
    }

    return {
      loopId,
      stabilityScore: Math.round(stabilityScore * 1000) / 1000,
      status,
      recommendations,
    };
  }

  /**
   * Predict future states using linear extrapolation
   */
  predict(loopId: string, steps: number): Prediction[] {
    if (steps <= 0) {
      return [];
    }

    // This is a simple prediction based on stored historical data
    // In a real system, this would use more sophisticated forecasting
    const predictions: Prediction[] = [];
    
    // Simple linear prediction based on last known state
    // This method would be replaced with actual model-based prediction
    // For now, return empty as we need historical data storage
    
    return predictions;
  }

  /**
   * Generate comprehensive analysis report for a loop
   */
  generateReport(loopId: string): AnalyticsReport {
    // Note: In a full implementation, signals would be stored/retrieved
    // For now, return empty report structure
    return {
      trends: [],
      stability: {
        loopId,
        stabilityScore: 0,
        status: 'stable',
        recommendations: [],
      },
    };
  }

  /**
   * Internal method: Linear regression on sorted data points
   */
  private linearRegression(signals: FeedbackSignal[]): { slope: number; intercept: number; rSquared: number } {
    const n = signals.length;
    const times = signals.map((_, i) => i); // Use index as time proxy
    const values = signals.map(s => s.value);

    const sumX = times.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = times.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = times.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = values.reduce((sum, y) => sum + y * y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const meanY = sumY / n;
    const ssTotal = values.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const ssResidual = signals.reduce((sum, _, i) => {
      const predicted = slope * times[i] + intercept;
      return sum + Math.pow(values[i] - predicted, 2);
    }, 0);
    const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

    return { slope, intercept, rSquared };
  }
}