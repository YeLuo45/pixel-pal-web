/**
 * FeedbackLoopEngine Tests
 * thunderbolt-design Feedback Loop Engine v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeedbackLoopEngine } from '../FeedbackLoopEngine';

describe('FeedbackLoopEngine', () => {
  let engine: FeedbackLoopEngine;

  beforeEach(() => {
    engine = new FeedbackLoopEngine();
  });

  afterEach(() => {
    engine.reset();
  });

  // ============================================================
  // addFeedback
  // ============================================================
  describe('addFeedback', () => {
    it('should add feedback to history', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      expect(engine.getHistory()).toHaveLength(1);
    });

    it('should allow multiple feedbacks', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.5, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'negative', value: 0.3, timestamp: 1001 });
      expect(engine.getHistory()).toHaveLength(2);
    });

    it('should track value for stability', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'negative', value: 0.2, timestamp: 1001 });
      expect(engine.getStability()).toBeLessThan(100);
    });

    it('should not mutate original feedback', () => {
      const fb = { source: 's1', type: 'positive', value: 0.8, timestamp: 1000 };
      engine.addFeedback(fb);
      fb.value = 0.1; // modify
      expect(engine.getHistory()[0].value).toBe(0.8);
    });
  });

  // ============================================================
  // analyze
  // ============================================================
  describe('analyze', () => {
    it('should return positive adjustment for positive feedback', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      const { adjustment } = engine.analyze();
      expect(adjustment).toBeCloseTo(0.16, 2);
    });

    it('should return negative adjustment for negative feedback', () => {
      engine.addFeedback({ source: 's1', type: 'negative', value: 0.6, timestamp: 1000 });
      const { adjustment } = engine.analyze();
      expect(adjustment).toBeCloseTo(-0.12, 2);
    });

    it('should return zero for neutral feedback', () => {
      engine.addFeedback({ source: 's1', type: 'neutral', value: 0.5, timestamp: 1000 });
      const { adjustment } = engine.analyze();
      expect(adjustment).toBe(0);
    });

    it('should return zero for empty history', () => {
      const { adjustment } = engine.analyze();
      expect(adjustment).toBe(0);
    });

    it('should include state in result', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      const { state } = engine.analyze();
      expect(state).toBeDefined();
      expect('stable' in state).toBe(true);
    });
  });

  // ============================================================
  // getStability
  // ============================================================
  describe('getStability', () => {
    it('should return 100 for empty history', () => {
      expect(engine.getStability()).toBe(100);
    });

    it('should return 100 for single value', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      expect(engine.getStability()).toBe(100);
    });

    it('should return high stability for low variance', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.82, timestamp: 1001 });
      engine.addFeedback({ source: 's3', type: 'positive', value: 0.79, timestamp: 1002 });
      expect(engine.getStability()).toBeGreaterThan(80);
    });

    it('should return lower stability for high variance', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.1, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.9, timestamp: 1001 });
      engine.addFeedback({ source: 's3', type: 'positive', value: 0.1, timestamp: 1002 });
      engine.addFeedback({ source: 's4', type: 'positive', value: 0.9, timestamp: 1003 });
      expect(engine.getStability()).toBeLessThan(85);
    });
  });

  // ============================================================
  // getHistory
  // ============================================================
  describe('getHistory', () => {
    it('should return copy of history', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      const history = engine.getHistory();
      history.push({ source: 'fake', type: 'neutral', value: 0, timestamp: 0 });
      expect(engine.getHistory()).toHaveLength(1);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should clear history', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      engine.reset();
      expect(engine.getHistory()).toHaveLength(0);
    });

    it('should reset stability to 100', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.1, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.9, timestamp: 1001 });
      engine.reset();
      expect(engine.getStability()).toBe(100);
    });
  });

  // ============================================================
  // getOscillationCount
  // ============================================================
  describe('getOscillationCount', () => {
    it('should return 0 for empty', () => {
      expect(engine.getOscillationCount()).toBe(0);
    });

    it('should return 0 for single value', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.8, timestamp: 1000 });
      expect(engine.getOscillationCount()).toBe(0);
    });

    it('should count sign changes', () => {
      // values: 0.1, 0.9, 0.1 - two oscillations (above/below mean)
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.1, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.9, timestamp: 1001 });
      engine.addFeedback({ source: 's3', type: 'positive', value: 0.1, timestamp: 1002 });
      expect(engine.getOscillationCount()).toBe(2);
    });
  });

  // ============================================================
  // getAverageValue
  // ============================================================
  describe('getAverageValue', () => {
    it('should return 0 for empty', () => {
      expect(engine.getAverageValue()).toBe(0);
    });

    it('should calculate average', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.2, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.4, timestamp: 1001 });
      expect(engine.getAverageValue()).toBe(0.3);
    });
  });

  // ============================================================
  // isStable
  // ============================================================
  describe('isStable', () => {
    it('should return true for empty', () => {
      expect(engine.isStable()).toBe(true);
    });

    it('should return true for low oscillations', () => {
      // Values close to mean=0.5, only 1 value above mean
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.3, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.3, timestamp: 1001 });
      engine.addFeedback({ source: 's3', type: 'positive', value: 0.35, timestamp: 1002 });
      expect(engine.isStable()).toBe(true);
    });

    it('should return false for high oscillations', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.1, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.9, timestamp: 1001 });
      engine.addFeedback({ source: 's3', type: 'positive', value: 0.1, timestamp: 1002 });
      engine.addFeedback({ source: 's4', type: 'positive', value: 0.9, timestamp: 1003 });
      expect(engine.isStable()).toBe(false);
    });
  });

  // ============================================================
  // getLatest
  // ============================================================
  describe('getLatest', () => {
    it('should return null for empty', () => {
      expect(engine.getLatest()).toBeNull();
    });

    it('should return latest feedback', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.5, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'negative', value: 0.3, timestamp: 1001 });
      expect(engine.getLatest()?.source).toBe('s2');
    });
  });

  // ============================================================
  // getFeedbackBySource
  // ============================================================
  describe('getFeedbackBySource', () => {
    it('should return feedbacks from source', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.5, timestamp: 1000 });
      engine.addFeedback({ source: 's1', type: 'negative', value: 0.3, timestamp: 1001 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.7, timestamp: 1002 });
      expect(engine.getFeedbackBySource('s1')).toHaveLength(2);
    });

    it('should return empty for unknown source', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.5, timestamp: 1000 });
      expect(engine.getFeedbackBySource('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // getFeedbackByType
  // ============================================================
  describe('getFeedbackByType', () => {
    it('should filter by type', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.5, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'negative', value: 0.3, timestamp: 1001 });
      engine.addFeedback({ source: 's3', type: 'neutral', value: 0.5, timestamp: 1002 });
      expect(engine.getFeedbackByType('positive')).toHaveLength(1);
      expect(engine.getFeedbackByType('negative')).toHaveLength(1);
      expect(engine.getFeedbackByType('neutral')).toHaveLength(1);
    });
  });

  // ============================================================
  // getPositiveCount / getNegativeCount
  // ============================================================
  describe('getPositiveCount / getNegativeCount', () => {
    it('should count positive feedbacks', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.5, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.7, timestamp: 1001 });
      engine.addFeedback({ source: 's3', type: 'negative', value: 0.3, timestamp: 1002 });
      expect(engine.getPositiveCount()).toBe(2);
    });

    it('should count negative feedbacks', () => {
      engine.addFeedback({ source: 's1', type: 'negative', value: 0.3, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'negative', value: 0.5, timestamp: 1001 });
      expect(engine.getNegativeCount()).toBe(2);
    });
  });

  // ============================================================
  // pruneFeedback
  // ============================================================
  describe('pruneFeedback', () => {
    it('should keep only last n feedbacks', () => {
      for (let i = 0; i < 10; i++) {
        engine.addFeedback({ source: `s${i}`, type: 'positive', value: 0.5, timestamp: 1000 + i });
      }
      engine.pruneFeedback(5);
      expect(engine.getHistory()).toHaveLength(5);
      // Last feedback should be from s9
      expect(engine.getLatest()?.source).toBe('s9');
    });

    it('should not prune if less than keepLast', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.5, timestamp: 1000 });
      engine.pruneFeedback(5);
      expect(engine.getHistory()).toHaveLength(1);
    });
  });

  // ============================================================
  // getFeedbackCount
  // ============================================================
  describe('getFeedbackCount', () => {
    it('should return count', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 0.5, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'negative', value: 0.3, timestamp: 1001 });
      expect(engine.getFeedbackCount()).toBe(2);
    });

    it('should return 0 for empty', () => {
      expect(engine.getFeedbackCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many feedbacks', () => {
      for (let i = 0; i < 100; i++) {
        engine.addFeedback({ source: `s${i}`, type: 'positive', value: Math.random(), timestamp: 1000 + i });
      }
      expect(engine.getFeedbackCount()).toBe(100);
      expect(engine.getStability()).toBeGreaterThan(0);
    });

    it('should handle zero value feedback', () => {
      engine.addFeedback({ source: 's1', type: 'neutral', value: 0, timestamp: 1000 });
      expect(engine.analyze().adjustment).toBe(0);
    });

    it('should handle extreme values', () => {
      engine.addFeedback({ source: 's1', type: 'positive', value: 1.0, timestamp: 1000 });
      engine.addFeedback({ source: 's2', type: 'positive', value: 0.0, timestamp: 1001 });
      expect(engine.getStability()).toBeLessThan(100);
    });

    it('should handle negative value in history', () => {
      engine.addFeedback({ source: 's1', type: 'negative', value: -0.5, timestamp: 1000 });
      const { adjustment } = engine.analyze();
      expect(adjustment).toBeCloseTo(0.1, 2); // negative * -0.2 = positive?
    });
  });
});