/**
 * BehaviorEngine Tests
 * generic-agent-design Behavior Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BehaviorEngine } from '../BehaviorEngine';

describe('BehaviorEngine', () => {
  let engine: BehaviorEngine;

  beforeEach(() => {
    engine = new BehaviorEngine();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // registerBehavior
  // ============================================================
  describe('registerBehavior', () => {
    it('should register behavior', () => {
      engine.registerBehavior({ id: 'b1', name: 'test', trigger: 'click', action: 'log', priority: 1 });
      expect(engine.getCount()).toBe(1);
    });
  });

  // ============================================================
  // trigger
  // ============================================================
  describe('trigger', () => {
    it('should trigger matching behaviors', () => {
      engine.registerBehavior({ id: 'b1', name: 'test', trigger: 'click', action: 'log', priority: 1 });
      const result = engine.trigger('click');
      expect(result).toHaveLength(1);
    });

    it('should sort by priority', () => {
      engine.registerBehavior({ id: 'b1', name: 'low', trigger: 'click', action: 'log1', priority: 1 });
      engine.registerBehavior({ id: 'b2', name: 'high', trigger: 'click', action: 'log2', priority: 10 });
      const result = engine.trigger('click');
      expect(result[0].id).toBe('b2');
    });

    it('should return empty for no match', () => {
      expect(engine.trigger('unknown')).toHaveLength(0);
    });

    it('should track history', () => {
      engine.registerBehavior({ id: 'b1', name: 'test', trigger: 'click', action: 'log', priority: 1 });
      engine.trigger('click');
      expect(engine.getHistoryCount()).toBe(1);
    });
  });

  // ============================================================
  // compose
  // ============================================================
  describe('compose', () => {
    it('should compose behaviors', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'act1', priority: 5 });
      engine.registerBehavior({ id: 'b2', name: 'b', trigger: 't', action: 'act2', priority: 3 });
      const composed = engine.compose(['b1', 'b2']);
      expect(composed).not.toBeNull();
    });

    it('should return null for no behaviors', () => {
      expect(engine.compose([])).toBeNull();
    });

    it('should return null for unknown behaviors', () => {
      expect(engine.compose(['unknown'])).toBeNull();
    });
  });

  // ============================================================
  // getHistory
  // ============================================================
  describe('getHistory', () => {
    it('should return empty for no history', () => {
      expect(engine.getHistory()).toHaveLength(0);
    });
  });

  // ============================================================
  // behavior queries
  // ============================================================
  describe('behavior queries', () => {
    it('should get behavior', () => {
      engine.registerBehavior({ id: 'b1', name: 'test', trigger: 't', action: 'a', priority: 1 });
      expect(engine.getBehavior('b1')?.name).toBe('test');
    });

    it('should get all', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 1 });
      expect(engine.getAllBehaviors()).toHaveLength(1);
    });

    it('should remove', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 1 });
      expect(engine.removeBehavior('b1')).toBe(true);
    });

    it('should check existence', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 1 });
      expect(engine.hasBehavior('b1')).toBe(true);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get by trigger', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 'click', action: 'a', priority: 1 });
      engine.registerBehavior({ id: 'b2', name: 'b', trigger: 'hover', action: 'a', priority: 1 });
      expect(engine.getBehaviorsByTrigger('click')).toHaveLength(1);
    });

    it('should get by priority', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 5 });
      engine.registerBehavior({ id: 'b2', name: 'b', trigger: 't', action: 'a', priority: 10 });
      expect(engine.getBehaviorsByPriority(1, 5)).toHaveLength(1);
    });

    it('should get highest priority', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 5 });
      engine.registerBehavior({ id: 'b2', name: 'b', trigger: 't', action: 'a', priority: 10 });
      expect(engine.getHighestPriority('t')?.id).toBe('b2');
    });

    it('should return null for no match', () => {
      expect(engine.getHighestPriority('unknown')).toBeNull();
    });
  });

  // ============================================================
  // updatePriority
  // ============================================================
  describe('updatePriority', () => {
    it('should update', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 1 });
      expect(engine.updatePriority('b1', 10)).toBe(true);
    });

    it('should clamp to >= 0', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 1 });
      engine.updatePriority('b1', -5);
      expect(engine.getBehavior('b1')?.priority).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(engine.updatePriority('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // triggers
  // ============================================================
  describe('triggers', () => {
    it('should get all triggers', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 'click', action: 'a', priority: 1 });
      engine.registerBehavior({ id: 'b2', name: 'b', trigger: 'hover', action: 'a', priority: 1 });
      expect(engine.getAllTriggers()).toHaveLength(2);
    });

    it('should get trigger count', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 'click', action: 'a', priority: 1 });
      expect(engine.getTriggerCount()).toBe(1);
    });
  });

  // ============================================================
  // history filters
  // ============================================================
  describe('history filters', () => {
    it('should clear history', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 1 });
      engine.trigger('t');
      engine.clearHistory();
      expect(engine.getHistoryCount()).toBe(0);
    });

    it('should get history by behavior', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 1 });
      engine.trigger('t');
      expect(engine.getHistoryByBehavior('b1')).toHaveLength(1);
    });

    it('should get most triggered', () => {
      engine.registerBehavior({ id: 'b1', name: 'a', trigger: 't', action: 'a', priority: 1 });
      engine.registerBehavior({ id: 'b2', name: 'b', trigger: 't', action: 'a', priority: 1 });
      engine.trigger('t');
      engine.trigger('t');
      expect(engine.getMostTriggered()).not.toBeNull();
    });

    it('should return null for no history', () => {
      expect(engine.getMostTriggered()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many behaviors', () => {
      for (let i = 0; i < 50; i++) {
        engine.registerBehavior({ id: `b${i}`, name: `b${i}`, trigger: 't', action: 'a', priority: 1 });
      }
      expect(engine.getCount()).toBe(50);
    });
  });
});