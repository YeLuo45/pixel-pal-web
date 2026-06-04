import { describe, it, expect, beforeEach } from 'vitest';
import { FeedbackAnalytics } from '../FeedbackAnalytics';
import type { FeedbackSignal } from '../FeedbackAnalytics';

describe('FeedbackAnalytics', () => {
  let analytics: FeedbackAnalytics;

  beforeEach(() => {
    analytics = new FeedbackAnalytics();
  });

  describe('analyzeTrends', () => {
    it('should return empty array for empty signals', () => {
      const result = analytics.analyzeTrends([]);
      expect(result).toEqual([]);
    });

    it('should return empty array for null/undefined signals', () => {
      // @ts-expect-error - testing edge case
      const result = analytics.analyzeTrends(null);
      expect(result).toEqual([]);
    });

    it('should analyze single signal as stable with zero confidence', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'cpu', value: 50, timestamp: Date.now() },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result).toHaveLength(1);
      expect(result[0].metric).toBe('cpu');
      expect(result[0].direction).toBe('stable');
      expect(result[0].changeRate).toBe(0);
      expect(result[0].confidence).toBe(0);
    });

    it('should detect improving trend', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'performance', value: 10, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'performance', value: 20, timestamp: 2000 },
        { loopId: 'loop-1', metric: 'performance', value: 30, timestamp: 3000 },
        { loopId: 'loop-1', metric: 'performance', value: 40, timestamp: 4000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result).toHaveLength(1);
      expect(result[0].direction).toBe('improving');
      expect(result[0].changeRate).toBeGreaterThan(0);
    });

    it('should detect degrading trend', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'latency', value: 100, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'latency', value: 80, timestamp: 2000 },
        { loopId: 'loop-1', metric: 'latency', value: 60, timestamp: 3000 },
        { loopId: 'loop-1', metric: 'latency', value: 40, timestamp: 4000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result).toHaveLength(1);
      expect(result[0].direction).toBe('degrading');
      expect(result[0].changeRate).toBeLessThan(0);
    });

    it('should detect stable trend for flat signals', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'memory', value: 50, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'memory', value: 50, timestamp: 2000 },
        { loopId: 'loop-1', metric: 'memory', value: 50, timestamp: 3000 },
        { loopId: 'loop-1', metric: 'memory', value: 50, timestamp: 4000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result).toHaveLength(1);
      expect(result[0].direction).toBe('stable');
      expect(Math.abs(result[0].changeRate)).toBeLessThan(0.001);
    });

    it('should handle multiple metrics', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'cpu', value: 10, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'cpu', value: 20, timestamp: 2000 },
        { loopId: 'loop-1', metric: 'memory', value: 100, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'memory', value: 80, timestamp: 2000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result).toHaveLength(2);
      const cpuTrend = result.find(t => t.metric === 'cpu');
      const memTrend = result.find(t => t.metric === 'memory');
      expect(cpuTrend?.direction).toBe('improving');
      expect(memTrend?.direction).toBe('degrading');
    });

    it('should calculate correct confidence for perfect linear relationship', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'perf', value: 10, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'perf', value: 20, timestamp: 2000 },
        { loopId: 'loop-1', metric: 'perf', value: 30, timestamp: 3000 },
        { loopId: 'loop-1', metric: 'perf', value: 40, timestamp: 4000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result[0].confidence).toBeGreaterThan(0.99);
    });

    it('should sort signals by timestamp before analysis', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'load', value: 40, timestamp: 4000 },
        { loopId: 'loop-1', metric: 'load', value: 10, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'load', value: 30, timestamp: 3000 },
        { loopId: 'loop-1', metric: 'load', value: 20, timestamp: 2000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result[0].direction).toBe('improving');
    });

    it('should include tags in signal if present', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'test', value: 10, timestamp: 1000, tags: ['cpu'] },
        { loopId: 'loop-1', metric: 'test', value: 20, timestamp: 2000, tags: ['gpu'] },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result).toHaveLength(1);
      expect(result[0].metric).toBe('test');
    });
  });

  describe('evaluateStability', () => {
    it('should return critical status for empty signals', () => {
      const result = analytics.evaluateStability('loop-1', []);
      expect(result.status).toBe('critical');
      expect(result.stabilityScore).toBe(0);
      expect(result.recommendations).toContain('No signals available for analysis');
    });

    it('should return stable status for low variance signals', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'cpu', value: 50, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'cpu', value: 51, timestamp: 2000 },
        { loopId: 'loop-1', metric: 'cpu', value: 50, timestamp: 3000 },
        { loopId: 'loop-1', metric: 'cpu', value: 49, timestamp: 4000 },
        { loopId: 'loop-1', metric: 'cpu', value: 50, timestamp: 5000 },
      ];
      const result = analytics.evaluateStability('loop-1', signals);
      expect(result.status).toBe('stable');
      expect(result.stabilityScore).toBeGreaterThan(0.7);
    });

    it('should return volatile or critical for high variance signals', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'cpu', value: 10, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'cpu', value: 100, timestamp: 2000 },
        { loopId: 'loop-1', metric: 'cpu', value: 20, timestamp: 3000 },
        { loopId: 'loop-1', metric: 'cpu', value: 90, timestamp: 4000 },
        { loopId: 'loop-1', metric: 'cpu', value: 30, timestamp: 5000 },
      ];
      const result = analytics.evaluateStability('loop-1', signals);
      expect(['volatile', 'critical']).toContain(result.status);
    });

    it('should recommend for high coefficient of variation', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'err', value: 1, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'err', value: 100, timestamp: 2000 },
        { loopId: 'loop-1', metric: 'err', value: 50, timestamp: 3000 },
      ];
      const result = analytics.evaluateStability('loop-1', signals);
      expect(result.recommendations.some(r => r.includes('High variance'))).toBe(true);
    });

    it('should recommend for insufficient data', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'cpu', value: 50, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'cpu', value: 60, timestamp: 2000 },
      ];
      const result = analytics.evaluateStability('loop-1', signals);
      expect(result.recommendations.some(r => r.includes('Insufficient data'))).toBe(true);
    });

    it('should filter signals by loopId', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'loop-1', metric: 'cpu', value: 50, timestamp: 1000 },
        { loopId: 'loop-1', metric: 'cpu', value: 60, timestamp: 2000 },
        { loopId: 'loop-2', metric: 'cpu', value: 100, timestamp: 1000 },
        { loopId: 'loop-2', metric: 'cpu', value: 200, timestamp: 2000 },
      ];
      const result = analytics.evaluateStability('loop-1', signals);
      expect(result.loopId).toBe('loop-1');
    });

    it('should return stability score between 0 and 1', () => {
      const signals: FeedbackSignal[] = Array.from({ length: 20 }, (_, i) => ({
        loopId: 'loop-1',
        metric: 'cpu',
        value: 50 + Math.random() * 10,
        timestamp: 1000 + i * 1000,
      }));
      const result = analytics.evaluateStability('loop-1', signals);
      expect(result.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.stabilityScore).toBeLessThanOrEqual(1);
    });
  });

  describe('predict', () => {
    it('should return empty array for zero steps', () => {
      const result = analytics.predict('loop-1', 0);
      expect(result).toEqual([]);
    });

    it('should return empty array for negative steps', () => {
      const result = analytics.predict('loop-1', -1);
      expect(result).toEqual([]);
    });

    it('should return empty array for valid steps (no historical data stored)', () => {
      const result = analytics.predict('loop-1', 5);
      expect(result).toEqual([]);
    });
  });

  describe('generateReport', () => {
    it('should return report structure for any loopId', () => {
      const result = analytics.generateReport('loop-1');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('stability');
      expect(result.stability.loopId).toBe('loop-1');
      expect(Array.isArray(result.trends)).toBe(true);
      expect(Array.isArray(result.stability.recommendations)).toBe(true);
    });

    it('should return stable status for empty report', () => {
      const result = analytics.generateReport('loop-1');
      expect(result.stability.status).toBe('stable');
    });
  });

  describe('linearRegression (internal)', () => {
    it('should calculate correct slope for increasing data', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'l', metric: 'm', value: 1, timestamp: 1000 },
        { loopId: 'l', metric: 'm', value: 2, timestamp: 2000 },
        { loopId: 'l', metric: 'm', value: 3, timestamp: 3000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result[0].changeRate).toBeCloseTo(1, 0);
    });

    it('should calculate correct slope for decreasing data', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'l', metric: 'm', value: 30, timestamp: 1000 },
        { loopId: 'l', metric: 'm', value: 20, timestamp: 2000 },
        { loopId: 'l', metric: 'm', value: 10, timestamp: 3000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result[0].changeRate).toBeCloseTo(-10, 0);
    });

    it('should handle zero variance in Y values', () => {
      const signals: FeedbackSignal[] = [
        { loopId: 'l', metric: 'm', value: 5, timestamp: 1000 },
        { loopId: 'l', metric: 'm', value: 5, timestamp: 2000 },
        { loopId: 'l', metric: 'm', value: 5, timestamp: 3000 },
      ];
      const result = analytics.analyzeTrends(signals);
      expect(result[0].changeRate).toBe(0);
    });
  });
});