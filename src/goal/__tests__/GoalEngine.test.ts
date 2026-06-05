/**
 * GoalEngine Tests
 * generic-agent-design Goal Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoalEngine } from '../GoalEngine';

describe('GoalEngine', () => {
  let engine: GoalEngine;

  beforeEach(() => {
    engine = new GoalEngine();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // define
  // ============================================================
  describe('define', () => {
    it('should define', () => {
      const id = engine.define('test');
      expect(id).toBe('goal-1');
    });

    it('should set initial status to pending', () => {
      const id = engine.define('test');
      expect(engine.isPending(id)).toBe(true);
    });
  });

  // ============================================================
  // decompose
  // ============================================================
  describe('decompose', () => {
    it('should decompose', () => {
      const id = engine.define('parent');
      expect(engine.decompose(id, ['a', 'b'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(engine.decompose('unknown', ['a'])).toBe(false);
    });
  });

  // ============================================================
  // achieve
  // ============================================================
  describe('achieve', () => {
    it('should achieve when no subgoals', () => {
      const id = engine.define('test');
      expect(engine.achieve(id)).toBe(true);
    });

    it('should not achieve when subgoals pending', () => {
      const id = engine.define('parent');
      engine.decompose(id, ['a']);
      expect(engine.achieve(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(engine.achieve('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getActiveGoals
  // ============================================================
  describe('getActiveGoals', () => {
    it('should get active', () => {
      const id = engine.define('test');
      engine.activate(id);
      expect(engine.getActiveGoals()).toHaveLength(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      engine.define('test');
      const stats = engine.getStats();
      expect(stats.goals).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get goal', () => {
      engine.define('test');
      expect(engine.getGoal('goal-1')?.name).toBe('test');
    });

    it('should get all', () => {
      engine.define('a');
      engine.define('b');
      expect(engine.getAllGoals()).toHaveLength(2);
    });

    it('should remove', () => {
      const id = engine.define('test');
      expect(engine.removeGoal(id)).toBe(true);
    });

    it('should check existence', () => {
      engine.define('test');
      expect(engine.hasGoal('goal-1')).toBe(true);
    });

    it('should count', () => {
      expect(engine.getCount()).toBe(0);
      engine.define('test');
      expect(engine.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      engine.define('test');
      expect(engine.getName('goal-1')).toBe('test');
    });

    it('should get status', () => {
      engine.define('test');
      expect(engine.getStatus('goal-1')).toBe('pending');
    });

    it('should get priority', () => {
      engine.define('test', 5);
      expect(engine.getPriority('goal-1')).toBe(5);
    });

    it('should set priority', () => {
      const id = engine.define('test');
      expect(engine.setPriority(id, 10)).toBe(true);
    });

    it('should return false for setPriority unknown', () => {
      expect(engine.setPriority('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // status
  // ============================================================
  describe('status', () => {
    it('should activate', () => {
      const id = engine.define('test');
      expect(engine.activate(id)).toBe(true);
    });

    it('should check isActive', () => {
      const id = engine.define('test');
      engine.activate(id);
      expect(engine.isActive(id)).toBe(true);
    });

    it('should check isCompleted', () => {
      const id = engine.define('test');
      engine.achieve(id);
      expect(engine.isCompleted(id)).toBe(true);
    });

    it('should check isPending', () => {
      engine.define('test');
      expect(engine.isPending('goal-1')).toBe(true);
    });
  });

  // ============================================================
  // subgoals
  // ============================================================
  describe('subgoals', () => {
    it('should get subgoals', () => {
      const id = engine.define('parent');
      engine.decompose(id, ['a']);
      expect(engine.getSubgoals(id)).toHaveLength(1);
    });

    it('should get subgoal count', () => {
      const id = engine.define('parent');
      engine.decompose(id, ['a', 'b']);
      expect(engine.getSubgoalCount(id)).toBe(2);
    });

    it('should get parent', () => {
      const id = engine.define('parent');
      engine.decompose(id, ['a']);
      const subgoals = engine.getSubgoals(id);
      expect(engine.getParent(subgoals[0])).toBe(id);
    });

    it('should check hasParent', () => {
      const id = engine.define('parent');
      engine.decompose(id, ['a']);
      const subgoals = engine.getSubgoals(id);
      expect(engine.hasParent(subgoals[0])).toBe(true);
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get by status', () => {
      engine.define('test');
      expect(engine.getByStatus('pending')).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = engine.define('test');
      engine.achieve(id);
      expect(engine.getCompletedGoals()).toHaveLength(1);
    });

    it('should get pending', () => {
      engine.define('test');
      expect(engine.getPendingGoals()).toHaveLength(1);
    });
  });

  // ============================================================
  // roots
  // ============================================================
  describe('roots', () => {
    it('should get roots', () => {
      engine.define('test');
      expect(engine.getRoots()).toHaveLength(1);
    });

    it('should count roots', () => {
      engine.define('test');
      expect(engine.getRootsCount()).toBe(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      engine.define('test');
      expect(engine.getCreatedAt('goal-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      engine.define('test');
      expect(engine.getUpdatedAt('goal-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many goals', () => {
      for (let i = 0; i < 50; i++) {
        engine.define(`g${i}`);
      }
      expect(engine.getCount()).toBe(50);
    });
  });
});