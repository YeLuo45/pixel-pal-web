/**
 * IntuitionEngine Tests
 * generic-agent-design Intuition Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntuitionEngine } from '../IntuitionEngine';

describe('IntuitionEngine', () => {
  let engine: IntuitionEngine;

  beforeEach(() => {
    engine = new IntuitionEngine();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // observe
  // ============================================================
  describe('observe', () => {
    it('should observe', () => {
      const id = engine.observe('ctx', 'hyp');
      expect(id).toBe('int-1');
    });

    it('should add to context index', () => {
      engine.observe('ctx', 'hyp');
      expect(engine.getByContext('ctx')).toHaveLength(1);
    });
  });

  // ============================================================
  // trigger
  // ============================================================
  describe('trigger', () => {
    it('should trigger matching', () => {
      engine.observe('ctx', 'hyp');
      const result = engine.trigger('ctx');
      expect(result).not.toBeNull();
    });

    it('should return null for unknown', () => {
      expect(engine.trigger('unknown')).toBeNull();
    });
  });

  // ============================================================
  // calibrate
  // ============================================================
  describe('calibrate', () => {
    it('should calibrate', () => {
      const id = engine.observe('ctx', 'hyp');
      expect(engine.calibrate(id, 0.8)).toBe(true);
    });

    it('should clamp score', () => {
      const id = engine.observe('ctx', 'hyp');
      engine.calibrate(id, 1.5);
      expect(engine.getConfidence(id)).toBeLessThanOrEqual(1);
    });

    it('should clamp score to >= 0', () => {
      const id = engine.observe('ctx', 'hyp');
      engine.calibrate(id, -1);
      expect(engine.getConfidence(id)).toBeGreaterThanOrEqual(0);
    });

    it('should return false for unknown', () => {
      expect(engine.calibrate('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // getTopIntuitions
  // ============================================================
  describe('getTopIntuitions', () => {
    it('should get top', () => {
      engine.observe('a', 'h1');
      engine.observe('b', 'h2');
      const top = engine.getTopIntuitions(1);
      expect(top).toHaveLength(1);
    });

    it('should return empty for empty', () => {
      expect(engine.getTopIntuitions(5)).toHaveLength(0);
    });
  });

  // ============================================================
  // reinforce / weaken
  // ============================================================
  describe('reinforce / weaken', () => {
    it('should reinforce', () => {
      const id = engine.observe('ctx', 'hyp');
      expect(engine.reinforce(id)).toBe(true);
    });

    it('should weaken', () => {
      const id = engine.observe('ctx', 'hyp');
      expect(engine.weaken(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(engine.reinforce('unknown')).toBe(false);
      expect(engine.weaken('unknown')).toBe(false);
    });

    it('should increase confidence on reinforce', () => {
      const id = engine.observe('ctx', 'hyp');
      const c1 = engine.getConfidence(id);
      engine.reinforce(id);
      expect(engine.getConfidence(id)).toBeGreaterThan(c1);
    });

    it('should decrease confidence on weaken', () => {
      const id = engine.observe('ctx', 'hyp');
      const c1 = engine.getConfidence(id);
      engine.weaken(id);
      expect(engine.getConfidence(id)).toBeLessThan(c1);
    });
  });

  // ============================================================
  // intuition queries
  // ============================================================
  describe('intuition queries', () => {
    it('should get intuition', () => {
      engine.observe('ctx', 'hyp');
      expect(engine.getIntuition('int-1')?.hypothesis).toBe('hyp');
    });

    it('should get all', () => {
      engine.observe('a', 'h');
      expect(engine.getAllIntuitions()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = engine.observe('ctx', 'hyp');
      expect(engine.removeIntuition(id)).toBe(true);
    });

    it('should remove from context index', () => {
      const id = engine.observe('ctx', 'hyp');
      engine.removeIntuition(id);
      expect(engine.getByContext('ctx')).toHaveLength(0);
    });

    it('should check existence', () => {
      engine.observe('ctx', 'hyp');
      expect(engine.hasIntuition('int-1')).toBe(true);
    });
  });

  // ============================================================
  // contexts
  // ============================================================
  describe('contexts', () => {
    it('should get by context', () => {
      engine.observe('ctx', 'hyp');
      expect(engine.getByContext('ctx')).toHaveLength(1);
    });

    it('should get all contexts', () => {
      engine.observe('a', 'h');
      engine.observe('b', 'h');
      expect(engine.getAllContexts()).toHaveLength(2);
    });

    it('should count contexts', () => {
      engine.observe('a', 'h');
      expect(engine.getContextCount()).toBe(1);
    });
  });

  // ============================================================
  // confidence filters
  // ============================================================
  describe('confidence filters', () => {
    it('should get by confidence', () => {
      const id = engine.observe('ctx', 'hyp');
      engine.calibrate(id, 0.8);
      // After calibrate: confidence = (0.5*1 + 0.8)/2 = 0.65
      expect(engine.getByConfidence(0.6, 0.7)).toHaveLength(1);
    });

    it('should get min confidence', () => {
      engine.observe('a', 'h1');
      engine.observe('b', 'h2');
      expect(engine.getMinConfidence()).not.toBeNull();
    });

    it('should get max confidence', () => {
      engine.observe('a', 'h1');
      engine.observe('b', 'h2');
      expect(engine.getMaxConfidence()).not.toBeNull();
    });

    it('should get avg confidence', () => {
      engine.observe('a', 'h1');
      expect(engine.getAvgConfidence()).toBeGreaterThan(0);
    });

    it('should return 0 for empty avg', () => {
      expect(engine.getAvgConfidence()).toBe(0);
    });
  });

  // ============================================================
  // getters
  // ============================================================
  describe('getters', () => {
    it('should get last observed', () => {
      engine.observe('ctx', 'hyp');
      expect(engine.getLastObserved('int-1')).toBeGreaterThan(0);
    });

    it('should return 0 for unknown', () => {
      expect(engine.getLastObserved('unknown')).toBe(0);
    });

    it('should get occurrences', () => {
      engine.observe('ctx', 'hyp');
      expect(engine.getOccurrences('int-1')).toBe(1);
    });

    it('should get hypothesis', () => {
      engine.observe('ctx', 'hyp');
      expect(engine.getHypothesis('int-1')).toBe('hyp');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many intuitions', () => {
      for (let i = 0; i < 50; i++) {
        engine.observe(`ctx${i}`, `h${i}`);
      }
      expect(engine.getCount()).toBe(50);
    });
  });
});