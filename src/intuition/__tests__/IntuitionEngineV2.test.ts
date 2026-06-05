/**
 * IntuitionEngineV2 Tests
 * generic-agent-design Intuition Engine v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntuitionEngineV2 } from '../IntuitionEngineV2';

describe('IntuitionEngineV2', () => {
  let engine: IntuitionEngineV2;

  beforeEach(() => {
    engine = new IntuitionEngineV2();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // observe
  // ============================================================
  describe('observe', () => {
    it('should observe', () => {
      const id = engine.observe('ctx1', 'pattern1');
      expect(id).toBe('obs-1');
    });

    it('should set initial confidence to 0.5', () => {
      const id = engine.observe('ctx1', 'pattern1');
      expect(engine.getConfidence(id)).toBe(0.5);
    });

    it('should set initial occurrences to 1', () => {
      const id = engine.observe('ctx1', 'pattern1');
      expect(engine.getOccurrences(id)).toBe(1);
    });
  });

  // ============================================================
  // trigger
  // ============================================================
  describe('trigger', () => {
    it('should trigger', () => {
      engine.observe('ctx1', 'pattern1');
      expect(engine.trigger('ctx1')).toBe('obs-1');
    });

    it('should return null for unknown context', () => {
      expect(engine.trigger('unknown')).toBeNull();
    });

    it('should trigger most confident', () => {
      const id1 = engine.observe('ctx1', 'a');
      engine.observe('ctx1', 'b');
      engine.calibrate(id1, 0.9);
      expect(engine.trigger('ctx1')).toBe(id1);
    });
  });

  // ============================================================
  // evaluate
  // ============================================================
  describe('evaluate', () => {
    it('should evaluate true', () => {
      const id = engine.observe('ctx1', 'p1');
      expect(engine.evaluate(id, true)).toBe(true);
    });

    it('should boost confidence on true', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.evaluate(id, true);
      expect(engine.getConfidence(id)).toBe(0.6);
    });

    it('should lower confidence on false', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.evaluate(id, false);
      expect(engine.getConfidence(id)).toBe(0.4);
    });

    it('should return false for unknown', () => {
      expect(engine.evaluate('unknown', true)).toBe(false);
    });
  });

  // ============================================================
  // calibrate
  // ============================================================
  describe('calibrate', () => {
    it('should calibrate', () => {
      const id = engine.observe('ctx1', 'p1');
      expect(engine.calibrate(id, 0.9)).toBe(true);
    });

    it('should clamp to 0-1', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.calibrate(id, 1.5);
      expect(engine.getConfidence(id)).toBe(1);
    });

    it('should return false for unknown', () => {
      expect(engine.calibrate('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get observation', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getObservation('obs-1')?.pattern).toBe('p1');
    });

    it('should get all', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getAllObservations()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = engine.observe('ctx1', 'p1');
      expect(engine.removeObservation(id)).toBe(true);
    });

    it('should check existence', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.hasObservation('obs-1')).toBe(true);
    });

    it('should count', () => {
      expect(engine.getCount()).toBe(0);
      engine.observe('ctx1', 'p1');
      expect(engine.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get context', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getContext('obs-1')).toBe('ctx1');
    });

    it('should get pattern', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getPattern('obs-1')).toBe('p1');
    });
  });

  // ============================================================
  // by context
  // ============================================================
  describe('by context', () => {
    it('should get by context', () => {
      engine.observe('ctx1', 'a');
      engine.observe('ctx2', 'b');
      expect(engine.getByContext('ctx1')).toHaveLength(1);
    });
  });

  // ============================================================
  // by confidence
  // ============================================================
  describe('by confidence', () => {
    it('should get by confidence range', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.calibrate(id, 0.9);
      expect(engine.getByConfidence(0.7, 1.0)).toHaveLength(1);
    });

    it('should get high confidence', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.calibrate(id, 0.9);
      expect(engine.getHighConfidence(0.7)).toHaveLength(1);
    });

    it('should get low confidence', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.calibrate(id, 0.1);
      expect(engine.getLowConfidence(0.3)).toHaveLength(1);
    });
  });

  // ============================================================
  // contexts
  // ============================================================
  describe('contexts', () => {
    it('should get contexts', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getContexts()).toContain('ctx1');
    });

    it('should check hasContext', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.hasContext('ctx1')).toBe(true);
    });

    it('should count contexts', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getContextCount()).toBe(1);
    });
  });

  // ============================================================
  // evaluations
  // ============================================================
  describe('evaluations', () => {
    it('should get evaluations', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.evaluate(id, true);
      expect(engine.getEvaluations(id)).toHaveLength(1);
    });

    it('should get count', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.evaluate(id, true);
      expect(engine.getEvaluationCount(id)).toBe(1);
    });

    it('should get accuracy', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.evaluate(id, true);
      expect(engine.getAccuracy(id)).toBe(1);
    });

    it('should return 0 for no evaluations', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getAccuracy('obs-1')).toBe(0);
    });
  });

  // ============================================================
  // boost / penalize
  // ============================================================
  describe('boost / penalize', () => {
    it('should boost', () => {
      const id = engine.observe('ctx1', 'p1');
      expect(engine.boostConfidence(id, 0.2)).toBe(true);
    });

    it('should penalize', () => {
      const id = engine.observe('ctx1', 'p1');
      expect(engine.penalizeConfidence(id, 0.2)).toBe(true);
    });

    it('should reset', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.calibrate(id, 0.9);
      expect(engine.resetConfidence(id)).toBe(true);
    });

    it('should return false for boost unknown', () => {
      expect(engine.boostConfidence('unknown', 0.1)).toBe(false);
    });
  });

  // ============================================================
  // most / least
  // ============================================================
  describe('most / least', () => {
    it('should get most confident', () => {
      const id = engine.observe('ctx1', 'p1');
      engine.calibrate(id, 0.9);
      expect(engine.getMostConfident()?.id).toBe(id);
    });

    it('should return null for empty', () => {
      expect(engine.getMostConfident()).toBeNull();
    });

    it('should get least confident', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getLeastConfident()?.id).toBe('obs-1');
    });

    it('should return null for empty least', () => {
      expect(engine.getLeastConfident()).toBeNull();
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should get avg', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getAvgConfidence()).toBe(0.5);
    });

    it('should return 0 for empty', () => {
      expect(engine.getAvgConfidence()).toBe(0);
    });

    it('should get total occurrences', () => {
      engine.observe('ctx1', 'p1');
      expect(engine.getTotalOccurrences()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many observations', () => {
      for (let i = 0; i < 50; i++) {
        engine.observe(`ctx${i}`, `p${i}`);
      }
      expect(engine.getCount()).toBe(50);
    });
  });
});