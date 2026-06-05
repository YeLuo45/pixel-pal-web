/**
 * DecisionEngine Tests
 * generic-agent-design Decision Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DecisionEngine } from '../DecisionEngine';

describe('DecisionEngine', () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // addRule
  // ============================================================
  describe('addRule', () => {
    it('should add rule', () => {
      expect(engine.addRule({ id: 'r1', name: 'test', condition: () => true, action: 'do' })).toBe(true);
    });

    it('should reject duplicate', () => {
      engine.addRule({ id: 'r1', name: 'test', condition: () => true, action: 'do' });
      expect(engine.addRule({ id: 'r1', name: 'test', condition: () => true, action: 'do' })).toBe(false);
    });
  });

  // ============================================================
  // evaluate
  // ============================================================
  describe('evaluate', () => {
    it('should evaluate', () => {
      engine.addRule({ id: 'r1', name: 'test', condition: () => true, action: 'do' });
      expect(engine.evaluate({ x: 1 })).not.toBeNull();
    });

    it('should return null for no match', () => {
      engine.addRule({ id: 'r1', name: 'test', condition: () => false, action: 'do' });
      expect(engine.evaluate({ x: 1 })).toBeNull();
    });

    it('should pick by priority', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'low', priority: 1 });
      engine.addRule({ id: 'r2', name: 'b', condition: () => true, action: 'high', priority: 10 });
      expect(engine.evaluate({})?.action).toBe('high');
    });

    it('should use cache', () => {
      engine.addRule({ id: 'r1', name: 'test', condition: () => true, action: 'do' });
      const d1 = engine.evaluate({ x: 1 });
      const d2 = engine.evaluate({ x: 1 });
      expect(d2?.fromCache).toBe(true);
    });

    it('should skip cache when useCache is false', () => {
      engine.addRule({ id: 'r1', name: 'test', condition: () => true, action: 'do' });
      const d = engine.evaluate({ x: 1 }, false);
      expect(d?.fromCache).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      engine.addRule({ id: 'r1', name: 'test', condition: () => true, action: 'do' });
      const stats = engine.getStats();
      expect(stats.rules).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get rule', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      expect(engine.getRule('r1')?.name).toBe('a');
    });

    it('should get all', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      expect(engine.getAllRules()).toHaveLength(1);
    });

    it('should remove', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      expect(engine.removeRule('r1')).toBe(true);
    });

    it('should check existence', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      expect(engine.hasRule('r1')).toBe(true);
    });

    it('should count', () => {
      expect(engine.getCount()).toBe(0);
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      expect(engine.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      expect(engine.getName('r1')).toBe('a');
    });

    it('should get action', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'something' });
      expect(engine.getAction('r1')).toBe('something');
    });

    it('should get priority', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do', priority: 5 });
      expect(engine.getPriority('r1')).toBe(5);
    });

    it('should set priority', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      expect(engine.setPriority('r1', 10)).toBe(true);
    });

    it('should return false for setPriority unknown', () => {
      expect(engine.setPriority('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // decisions
  // ============================================================
  describe('decisions', () => {
    it('should get decision', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      const d = engine.evaluate({});
      expect(engine.getDecision(d!.id)?.action).toBe('do');
    });

    it('should get all decisions', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      engine.evaluate({});
      expect(engine.getAllDecisions()).toHaveLength(1);
    });

    it('should get decisions for rule', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      engine.evaluate({});
      expect(engine.getDecisionsForRule('r1')).toHaveLength(1);
    });

    it('should count decisions', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      engine.evaluate({});
      expect(engine.getDecisionCount()).toBe(1);
    });

    it('should clear decisions', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      engine.evaluate({});
      engine.clearDecisions();
      expect(engine.getDecisionCount()).toBe(0);
    });
  });

  // ============================================================
  // usage
  // ============================================================
  describe('usage', () => {
    it('should get usage count', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      engine.evaluate({});
      expect(engine.getUsageCount('r1')).toBe(1);
    });

    it('should get most used', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      engine.evaluate({});
      expect(engine.getMostUsed()?.id).toBe('r1');
    });

    it('should return null for empty', () => {
      expect(engine.getMostUsed()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      expect(engine.getCreatedAt('r1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // cache
  // ============================================================
  describe('cache', () => {
    it('should clear cache', () => {
      engine.addRule({ id: 'r1', name: 'a', condition: () => true, action: 'do' });
      engine.evaluate({});
      engine.clearCache();
      expect(engine.getStats().cacheHits).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many rules', () => {
      for (let i = 0; i < 50; i++) {
        engine.addRule({ id: `r${i}`, name: `r${i}`, condition: () => true, action: 'do' });
      }
      expect(engine.getCount()).toBe(50);
    });
  });
});