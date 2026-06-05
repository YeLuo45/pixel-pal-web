/**
 * StrategyPlanner Tests
 * generic-agent-design Strategy Planner
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StrategyPlanner } from '../StrategyPlanner';

describe('StrategyPlanner', () => {
  let sp: StrategyPlanner;

  beforeEach(() => {
    sp = new StrategyPlanner();
  });

  afterEach(() => {
    sp.clearAll();
  });

  // ============================================================
  // define / select / execute
  // ============================================================
  describe('define / select / execute', () => {
    it('should define', () => {
      expect(sp.define('s1', 0.5)).toBe('str-1');
    });

    it('should select top N', () => {
      sp.define('low', 0.3);
      sp.define('high', 0.9);
      expect(sp.select(1)).toHaveLength(1);
    });

    it('should sort by score', () => {
      sp.define('low', 0.3);
      sp.define('high', 0.9);
      expect(sp.select(2)[0].name).toBe('high');
    });

    it('should not select inactive', () => {
      const id = sp.define('s1', 0.5);
      sp.setActive(id, false);
      expect(sp.select(1)).toHaveLength(0);
    });

    it('should execute', () => {
      const id = sp.define('s1', 0.5);
      expect(sp.execute(id)).toBe(true);
    });

    it('should not execute inactive', () => {
      const id = sp.define('s1', 0.5);
      sp.setActive(id, false);
      expect(sp.execute(id)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(sp.execute('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sp.define('s1', 0.5);
      const stats = sp.getStats();
      expect(stats.strategies).toBe(1);
    });

    it('should count executions', () => {
      const id = sp.define('s1', 0.5);
      sp.execute(id);
      expect(sp.getStats().totalExecutions).toBe(1);
    });

    it('should compute avg score', () => {
      sp.define('s1', 0.5);
      expect(sp.getStats().avgScore).toBe(0.5);
    });

    it('should count active', () => {
      sp.define('s1', 0.5);
      expect(sp.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sp.define('s1', 0.5);
      sp.setActive(id, false);
      expect(sp.getStats().inactive).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get strategy', () => {
      sp.define('s1', 0.5);
      expect(sp.getStrategy('str-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sp.define('s1', 0.5);
      expect(sp.getAllStrategies()).toHaveLength(1);
    });

    it('should remove', () => {
      sp.define('s1', 0.5);
      expect(sp.removeStrategy('str-1')).toBe(true);
    });

    it('should check existence', () => {
      sp.define('s1', 0.5);
      expect(sp.hasStrategy('str-1')).toBe(true);
    });

    it('should count', () => {
      expect(sp.getCount()).toBe(0);
      sp.define('s1', 0.5);
      expect(sp.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      sp.define('s1', 0.5);
      expect(sp.getName('str-1')).toBe('s1');
    });

    it('should get score', () => {
      sp.define('s1', 0.5);
      expect(sp.getScore('str-1')).toBe(0.5);
    });

    it('should get executions', () => {
      const id = sp.define('s1', 0.5);
      sp.execute(id);
      expect(sp.getExecutions(id)).toBe(1);
    });

    it('should check isActive', () => {
      sp.define('s1', 0.5);
      expect(sp.isActive('str-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = sp.define('s1', 0.5);
      expect(sp.setActive(id, false)).toBe(true);
    });

    it('should set score', () => {
      const id = sp.define('s1', 0.5);
      expect(sp.setScore(id, 0.8)).toBe(true);
    });

    it('should set name', () => {
      const id = sp.define('s1', 0.5);
      expect(sp.setName(id, 's2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sp.setActive('unknown', false)).toBe(false);
      expect(sp.setScore('unknown', 0.5)).toBe(false);
      expect(sp.setName('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset executions', () => {
      const id = sp.define('s1', 0.5);
      sp.execute(id);
      sp.resetExecutions();
      expect(sp.getExecutions(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = sp.define('s1', 0.5);
      sp.execute(id);
      sp.setActive(id, false);
      sp.resetAll();
      expect(sp.getExecutions(id)).toBe(0);
      expect(sp.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      sp.define('s1', 0.5);
      expect(sp.getByName('s1')).toHaveLength(1);
    });

    it('should get active', () => {
      sp.define('s1', 0.5);
      expect(sp.getActiveStrategies()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sp.define('s1', 0.5);
      sp.setActive(id, false);
      expect(sp.getInactiveStrategies()).toHaveLength(1);
    });

    it('should get by min score', () => {
      sp.define('s1', 0.5);
      sp.define('s2', 0.8);
      expect(sp.getByMinScore(0.7)).toHaveLength(1);
    });

    it('should get sorted by score', () => {
      sp.define('low', 0.3);
      sp.define('high', 0.9);
      expect(sp.getSortedByScore()[0].name).toBe('high');
    });

    it('should get all names', () => {
      sp.define('s1', 0.5);
      sp.define('s2', 0.6);
      expect(sp.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      sp.define('s1', 0.5);
      expect(sp.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most executed', () => {
      const id = sp.define('s1', 0.5);
      sp.execute(id);
      expect(sp.getMostExecuted()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sp.getMostExecuted()).toBeNull();
    });

    it('should get least executed', () => {
      sp.define('s1', 0.5);
      expect(sp.getLeastExecuted()?.id).toBe('str-1');
    });

    it('should return null for empty least', () => {
      expect(sp.getLeastExecuted()).toBeNull();
    });

    it('should get highest score', () => {
      sp.define('s1', 0.5);
      expect(sp.getHighestScore()?.id).toBe('str-1');
    });

    it('should return null for empty highest', () => {
      expect(sp.getHighestScore()).toBeNull();
    });

    it('should get lowest score', () => {
      sp.define('s1', 0.5);
      expect(sp.getLowestScore()?.id).toBe('str-1');
    });

    it('should return null for empty lowest', () => {
      expect(sp.getLowestScore()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sp.define('s1', 0.5);
      expect(sp.getCreatedAt('str-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sp.define('s1', 0.5);
      sp.execute(id);
      expect(sp.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many strategies', () => {
      for (let i = 0; i < 50; i++) {
        sp.define(`s${i}`, 0.5);
      }
      expect(sp.getCount()).toBe(50);
    });
  });
});