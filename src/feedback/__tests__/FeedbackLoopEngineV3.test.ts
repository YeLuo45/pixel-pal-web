/**
 * FeedbackLoopEngineV3 Tests
 * thunderbolt-design Feedback Loop Engine v3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeedbackLoopEngineV3 } from '../FeedbackLoopEngineV3';

describe('FeedbackLoopEngineV3', () => {
  let engine: FeedbackLoopEngineV3;

  beforeEach(() => {
    engine = new FeedbackLoopEngineV3();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // addFeedback
  // ============================================================
  describe('addFeedback', () => {
    it('should add feedback', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.8, timestamp: 1000, weight: 1 });
      expect(engine.getFeedbackCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const fb = { source: 's1', target: 't1', type: 'positive' as const, value: 0.8, timestamp: 1000, weight: 1 };
      engine.addFeedback(fb);
      fb.value = 0.1;
      expect(engine.getAverageValue()).toBe(0.8);
    });
  });

  // ============================================================
  // aggregateBySource / Target / Type
  // ============================================================
  describe('aggregate', () => {
    it('should aggregate by source', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't2', type: 'negative', value: 0.3, timestamp: 1001, weight: 1 });
      engine.addFeedback({ source: 's2', target: 't1', type: 'positive', value: 0.7, timestamp: 1002, weight: 1 });
      expect(engine.aggregateBySource('s1')).toHaveLength(2);
    });

    it('should aggregate by target', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't2', type: 'negative', value: 0.3, timestamp: 1001, weight: 1 });
      expect(engine.aggregateByTarget('t1')).toHaveLength(1);
    });

    it('should aggregate by type', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'negative', value: 0.3, timestamp: 1001, weight: 1 });
      expect(engine.aggregateByType('positive')).toHaveLength(1);
    });
  });

  // ============================================================
  // learn (with adaptive)
  // ============================================================
  describe('learn', () => {
    it('should return 0 for empty', () => {
      expect(engine.learn()).toBe(0);
    });

    it('should return positive for all positive', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.8, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's2', target: 't1', type: 'positive', value: 0.6, timestamp: 1001, weight: 1 });
      const result = engine.learn();
      expect(result).toBeGreaterThan(0);
    });

    it('should return negative for all negative', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'negative', value: 0.5, timestamp: 1000, weight: 1 });
      const result = engine.learn();
      expect(result).toBeLessThan(0);
    });

    it('should consider weights', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 1.0, timestamp: 1000, weight: 10 });
      engine.addFeedback({ source: 's2', target: 't1', type: 'negative', value: 0.5, timestamp: 1001, weight: 1 });
      const result = engine.learn();
      // Weighted average: (1*10 + -0.5*1) / 11 = 9.5/11 = 0.864
      expect(result).toBeGreaterThan(0.5);
    });
  });

  // ============================================================
  // getStability
  // ============================================================
  describe('getStability', () => {
    it('should return zero for empty', () => {
      const stability = engine.getStability();
      expect(stability.variance).toBe(0);
      expect(stability.oscillation).toBe(0);
      expect(stability.trend).toBe(0);
    });

    it('should calculate variance', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.2, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.8, timestamp: 1001, weight: 1 });
      const stability = engine.getStability();
      expect(stability.variance).toBeGreaterThan(0);
    });

    it('should detect oscillation', () => {
      // Pattern: up, down, up (2 oscillations)
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.1, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.9, timestamp: 1001, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.2, timestamp: 1002, weight: 1 });
      const stability = engine.getStability();
      expect(stability.oscillation).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // predictTrend
  // ============================================================
  describe('predictTrend', () => {
    it('should predict rising trend', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.1, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1001, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.9, timestamp: 1002, weight: 1 });
      expect(engine.predictTrend()).toBe('rising');
    });

    it('should predict falling trend', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.9, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1001, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.1, timestamp: 1002, weight: 1 });
      expect(engine.predictTrend()).toBe('falling');
    });

    it('should predict stable trend', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1001, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1002, weight: 1 });
      expect(engine.predictTrend()).toBe('stable');
    });
  });

  // ============================================================
  // getAverageValue / getWeightedAverageValue
  // ============================================================
  describe('average values', () => {
    it('should calculate average value', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.4, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.6, timestamp: 1001, weight: 1 });
      expect(engine.getAverageValue()).toBe(0.5);
    });

    it('should return 0 for empty', () => {
      expect(engine.getAverageValue()).toBe(0);
    });

    it('should calculate weighted average', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 1.0, timestamp: 1000, weight: 2 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.0, timestamp: 1001, weight: 1 });
      // (1*2 + 0*1) / 3 = 0.67
      expect(engine.getWeightedAverageValue()).toBeCloseTo(0.67, 1);
    });

    it('should handle zero total weight', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 0 });
      expect(engine.getWeightedAverageValue()).toBe(0);
    });
  });

  // ============================================================
  // count by type
  // ============================================================
  describe('count by type', () => {
    it('should count positive feedbacks', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1001, weight: 1 });
      expect(engine.getPositiveCount()).toBe(2);
    });

    it('should count negative feedbacks', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'negative', value: 0.5, timestamp: 1000, weight: 1 });
      expect(engine.getNegativeCount()).toBe(1);
    });

    it('should count neutral feedbacks', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'neutral', value: 0.5, timestamp: 1000, weight: 1 });
      expect(engine.getNeutralCount()).toBe(1);
    });
  });

  // ============================================================
  // getSources / getTargets
  // ============================================================
  describe('getSources / getTargets', () => {
    it('should return unique sources', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't2', type: 'negative', value: 0.3, timestamp: 1001, weight: 1 });
      engine.addFeedback({ source: 's2', target: 't1', type: 'positive', value: 0.7, timestamp: 1002, weight: 1 });
      expect(engine.getSources()).toHaveLength(2);
    });

    it('should return unique targets', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's2', target: 't1', type: 'negative', value: 0.3, timestamp: 1001, weight: 1 });
      expect(engine.getTargets()).toHaveLength(1);
    });
  });

  // ============================================================
  // getFeedbackByTimeRange
  // ============================================================
  describe('getFeedbackByTimeRange', () => {
    it('should filter by time range', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 2000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 3000, weight: 1 });
      expect(engine.getFeedbackByTimeRange(1500, 2500)).toHaveLength(1);
    });
  });

  // ============================================================
  // setLearningRate
  // ============================================================
  describe('setLearningRate', () => {
    it('should clamp to 0-1', () => {
      engine.setLearningRate(2);
      expect(engine.getLearningRate()).toBe(1);
      engine.setLearningRate(-1);
      expect(engine.getLearningRate()).toBe(0);
    });
  });

  // ============================================================
  // removeFeedback
  // ============================================================
  describe('removeFeedback', () => {
    it('should remove by index', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      expect(engine.removeFeedback(0)).toBe(true);
      expect(engine.getFeedbackCount()).toBe(0);
    });

    it('should return false for invalid index', () => {
      expect(engine.removeFeedback(0)).toBe(false);
      expect(engine.removeFeedback(-1)).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many feedbacks', () => {
      for (let i = 0; i < 100; i++) {
        engine.addFeedback({ source: `s${i % 5}`, target: `t${i % 3}`, type: 'positive', value: i / 100, timestamp: 1000 + i, weight: 1 });
      }
      expect(engine.getFeedbackCount()).toBe(100);
    });

    it('should handle single feedback', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 0.5, timestamp: 1000, weight: 1 });
      const stability = engine.getStability();
      expect(stability.variance).toBe(0);
    });

    it('should handle extreme values', () => {
      engine.addFeedback({ source: 's1', target: 't1', type: 'positive', value: 1.0, timestamp: 1000, weight: 1 });
      engine.addFeedback({ source: 's1', target: 't1', type: 'negative', value: 0.0, timestamp: 1001, weight: 1 });
      expect(engine.getAverageValue()).toBe(0.5);
    });
  });
});