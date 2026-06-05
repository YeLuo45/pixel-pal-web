/**
 * HeuristicEngine Tests
 * generic-agent-design Heuristic Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HeuristicEngine } from '../HeuristicEngine';

describe('HeuristicEngine', () => {
  let he: HeuristicEngine;

  beforeEach(() => {
    he = new HeuristicEngine();
  });

  afterEach(() => {
    he.clearAll();
  });

  // ============================================================
  // register / evaluate
  // ============================================================
  describe('register / evaluate', () => {
    it('should register', () => {
      const id = he.register('h1', 5, (x: unknown) => (x as number) > 0, 'act');
      expect(id).toBe('he-1');
    });

    it('should evaluate matching', () => {
      he.register('h1', 5, (x: unknown) => (x as number) > 0, 'act');
      expect(he.evaluate(10)).toHaveLength(1);
    });

    it('should not evaluate non-matching', () => {
      he.register('h1', 5, (x: unknown) => (x as number) > 0, 'act');
      expect(he.evaluate(-1)).toHaveLength(0);
    });

    it('should sort by priority', () => {
      he.register('low', 1, () => true, 'act');
      he.register('high', 10, () => true, 'act');
      const results = he.evaluate(0);
      expect(results[0].name).toBe('high');
    });

    it('should not evaluate disabled', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.disable(id);
      expect(he.evaluate(0)).toHaveLength(0);
    });

    it('should increment matches on evaluate', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.evaluate(0);
      expect(he.getMatches(id)).toBe(1);
    });
  });

  // ============================================================
  // enable / disable
  // ============================================================
  describe('enable / disable', () => {
    it('should enable', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.disable(id);
      expect(he.enable(id)).toBe(true);
    });

    it('should disable', () => {
      const id = he.register('h1', 5, () => true, 'act');
      expect(he.disable(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(he.enable('unknown')).toBe(false);
      expect(he.disable('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      he.register('h1', 5, () => true, 'act');
      const stats = he.getStats();
      expect(stats.heuristics).toBe(1);
    });

    it('should count enabled', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getStats().enabled).toBe(1);
    });

    it('should count disabled', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.disable(id);
      expect(he.getStats().disabled).toBe(1);
    });

    it('should count matches', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.evaluate(0);
      expect(he.getStats().matches).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get heuristic', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getHeuristic('he-1')?.name).toBe('h1');
    });

    it('should get all', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getAllHeuristics()).toHaveLength(1);
    });

    it('should remove', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.removeHeuristic('he-1')).toBe(true);
    });

    it('should check existence', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.hasHeuristic('he-1')).toBe(true);
    });

    it('should count', () => {
      expect(he.getCount()).toBe(0);
      he.register('h1', 5, () => true, 'act');
      expect(he.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getName('he-1')).toBe('h1');
    });

    it('should get priority', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getPriority('he-1')).toBe(5);
    });

    it('should get action', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getAction('he-1')).toBe('act');
    });

    it('should get matches', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.evaluate(0);
      expect(he.getMatches(id)).toBe(1);
    });

    it('should check isEnabled', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.isEnabled('he-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set priority', () => {
      const id = he.register('h1', 5, () => true, 'act');
      expect(he.setPriority(id, 10)).toBe(true);
    });

    it('should set action', () => {
      const id = he.register('h1', 5, () => true, 'act');
      expect(he.setAction(id, 'new')).toBe(true);
    });

    it('should set condition', () => {
      const id = he.register('h1', 5, () => true, 'act');
      expect(he.setCondition(id, (x: unknown) => (x as number) < 0)).toBe(true);
    });

    it('should set name', () => {
      const id = he.register('h1', 5, () => true, 'act');
      expect(he.setName(id, 'h2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(he.setPriority('unknown', 10)).toBe(false);
      expect(he.setAction('unknown', 'a')).toBe(false);
      expect(he.setCondition('unknown', () => true)).toBe(false);
      expect(he.setName('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset matches', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.evaluate(0);
      he.resetMatches();
      expect(he.getMatches(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.evaluate(0);
      he.disable(id);
      he.resetAll();
      expect(he.getMatches(id)).toBe(0);
      expect(he.isEnabled(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getByName('h1')).toHaveLength(1);
    });

    it('should get enabled', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getEnabled()).toHaveLength(1);
    });

    it('should get disabled', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.disable(id);
      expect(he.getDisabled()).toHaveLength(1);
    });

    it('should get by priority', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getByPriority(5)).toHaveLength(1);
    });

    it('should get by action', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getByAction('act')).toHaveLength(1);
    });

    it('should get by min priority', () => {
      he.register('h1', 5, () => true, 'act');
      he.register('h2', 10, () => true, 'act');
      expect(he.getByMinPriority(7)).toHaveLength(1);
    });

    it('should get sorted by priority', () => {
      he.register('low', 1, () => true, 'act');
      he.register('high', 10, () => true, 'act');
      const sorted = he.getSortedByPriority();
      expect(sorted[0].name).toBe('high');
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most matched', () => {
      he.register('h1', 5, () => true, 'act');
      he.evaluate(0);
      expect(he.getMostMatched()?.id).toBe('he-1');
    });

    it('should return null for empty most', () => {
      expect(he.getMostMatched()).toBeNull();
    });

    it('should get least matched', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getLeastMatched()?.id).toBe('he-1');
    });

    it('should return null for empty least', () => {
      expect(he.getLeastMatched()).toBeNull();
    });

    it('should get avg matches', () => {
      const id = he.register('h1', 5, () => true, 'act');
      he.evaluate(0);
      expect(he.getAvgMatches()).toBe(1);
    });

    it('should return 0 for empty avg', () => {
      expect(he.getAvgMatches()).toBe(0);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getCreatedAt('he-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      he.register('h1', 5, () => true, 'act');
      expect(he.getUpdatedAt('he-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many heuristics', () => {
      for (let i = 0; i < 50; i++) {
        he.register(`h${i}`, i, () => true, 'act');
      }
      expect(he.getCount()).toBe(50);
    });
  });
});