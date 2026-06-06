/**
 * GoalEngine Tests
 * generic-agent-design Goal Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoalEngine } from '../GoalEngine';

describe('GoalEngine', () => {
  let ge: GoalEngine;

  beforeEach(() => {
    ge = new GoalEngine();
  });

  afterEach(() => {
    ge.clearAll();
  });

  // ============================================================
  // define / advance / getProgress
  // ============================================================
  describe('define / advance / getProgress', () => {
    it('should define', () => {
      expect(ge.define('g1', 100)).toBe('goal-1');
    });

    it('should set initial progress to 0', () => {
      const id = ge.define('g1', 100);
      expect(ge.getProgressValue(id)).toBe(0);
    });

    it('should advance', () => {
      const id = ge.define('g1', 100);
      expect(ge.advance(id, 10)).toBe(true);
    });

    it('should increment progress on advance', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 10);
      expect(ge.getProgressValue(id)).toBe(10);
    });

    it('should clamp progress to target', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 150);
      expect(ge.getProgressValue(id)).toBe(100);
    });

    it('should mark completed when target reached', () => {
      const id = ge.define('g1', 10);
      ge.advance(id, 10);
      expect(ge.isCompleted(id)).toBe(true);
    });

    it('should not advance completed', () => {
      const id = ge.define('g1', 10);
      ge.advance(id, 10);
      expect(ge.advance(id, 5)).toBe(false);
    });

    it('should not advance inactive', () => {
      const id = ge.define('g1', 100);
      ge.setActive(id, false);
      expect(ge.advance(id, 10)).toBe(false);
    });

    it('should return false for unknown advance', () => {
      expect(ge.advance('unknown', 10)).toBe(false);
    });

    it('should get progress', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 50);
      expect(ge.getProgress(id)).toBe(0.5);
    });

    it('should return 0 progress for unknown', () => {
      expect(ge.getProgress('unknown')).toBe(0);
    });

    it('should return 1 progress for empty target', () => {
      const id = ge.define('g1', 0);
      expect(ge.getProgress(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ge.define('g1', 100);
      const stats = ge.getStats();
      expect(stats.goals).toBe(1);
    });

    it('should count completed', () => {
      const id = ge.define('g1', 10);
      ge.advance(id, 10);
      expect(ge.getStats().completed).toBe(1);
    });

    it('should count in progress', () => {
      ge.define('g1', 100);
      expect(ge.getStats().inProgress).toBe(1);
    });

    it('should compute avg progress', () => {
      ge.define('g1', 100);
      expect(ge.getStats().avgProgress).toBe(0);
    });

    it('should count total advances', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 10);
      expect(ge.getStats().totalAdvances).toBe(1);
    });

    it('should count total progress', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 10);
      expect(ge.getStats().totalProgress).toBe(10);
    });

    it('should count active', () => {
      ge.define('g1', 100);
      expect(ge.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ge.define('g1', 100);
      ge.setActive(id, false);
      expect(ge.getStats().inactive).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get goal', () => {
      ge.define('g1', 100);
      expect(ge.getGoal('goal-1')?.name).toBe('g1');
    });

    it('should get all', () => {
      ge.define('g1', 100);
      expect(ge.getAllGoals()).toHaveLength(1);
    });

    it('should remove', () => {
      ge.define('g1', 100);
      expect(ge.removeGoal('goal-1')).toBe(true);
    });

    it('should check existence', () => {
      ge.define('g1', 100);
      expect(ge.hasGoal('goal-1')).toBe(true);
    });

    it('should count', () => {
      expect(ge.getCount()).toBe(0);
      ge.define('g1', 100);
      expect(ge.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ge.define('g1', 100);
      expect(ge.getName('goal-1')).toBe('g1');
    });

    it('should get target', () => {
      ge.define('g1', 100);
      expect(ge.getTarget('goal-1')).toBe(100);
    });

    it('should get progress value', () => {
      ge.define('g1', 100);
      expect(ge.getProgressValue('goal-1')).toBe(0);
    });

    it('should get advances', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 10);
      expect(ge.getAdvances(id)).toBe(1);
    });

    it('should get history', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 10);
      expect(ge.getHistory(id)).toEqual([0, 10]);
    });

    it('should check isCompleted', () => {
      ge.define('g1', 100);
      expect(ge.isCompleted('goal-1')).toBe(false);
    });

    it('should check isInProgress', () => {
      ge.define('g1', 100);
      expect(ge.isInProgress('goal-1')).toBe(true);
    });

    it('should check isActive', () => {
      ge.define('g1', 100);
      expect(ge.isActive('goal-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = ge.define('g1', 100);
      expect(ge.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ge.define('g1', 100);
      expect(ge.setName(id, 'g2')).toBe(true);
    });

    it('should set target', () => {
      const id = ge.define('g1', 100);
      expect(ge.setTarget(id, 200)).toBe(true);
    });

    it('should mark completed when setting target below progress', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 50);
      ge.setTarget(id, 30);
      expect(ge.isCompleted(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ge.setActive('unknown', false)).toBe(false);
      expect(ge.setName('unknown', 'g')).toBe(false);
      expect(ge.setTarget('unknown', 100)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset progress', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 50);
      expect(ge.resetProgress(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ge.resetProgress('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 50);
      ge.setActive(id, false);
      ge.resetAll();
      expect(ge.getProgressValue(id)).toBe(0);
      expect(ge.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      ge.define('g1', 100);
      expect(ge.getByName('g1')).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = ge.define('g1', 10);
      ge.advance(id, 10);
      expect(ge.getCompletedGoals()).toHaveLength(1);
    });

    it('should get in progress', () => {
      ge.define('g1', 100);
      expect(ge.getInProgressGoals()).toHaveLength(1);
    });

    it('should get active', () => {
      ge.define('g1', 100);
      expect(ge.getActiveGoals()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ge.define('g1', 100);
      ge.setActive(id, false);
      expect(ge.getInactiveGoals()).toHaveLength(1);
    });

    it('should get all names', () => {
      ge.define('g1', 100);
      ge.define('g2', 100);
      expect(ge.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ge.define('g1', 100);
      expect(ge.getNameCount()).toBe(1);
    });

    it('should get by min progress', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 50);
      expect(ge.getByMinProgress(0.3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most progress', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 50);
      expect(ge.getMostProgress()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ge.getMostProgress()).toBeNull();
    });

    it('should get newest', () => {
      ge.define('g1', 100);
      expect(ge.getNewest()?.id).toBe('goal-1');
    });

    it('should return null for empty newest', () => {
      expect(ge.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ge.define('g1', 100);
      expect(ge.getOldest()?.id).toBe('goal-1');
    });

    it('should return null for empty oldest', () => {
      expect(ge.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ge.define('g1', 100);
      expect(ge.getCreatedAt('goal-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ge.define('g1', 100);
      ge.advance(id, 10);
      expect(ge.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many goals', () => {
      for (let i = 0; i < 50; i++) {
        ge.define(`g${i}`, 100);
      }
      expect(ge.getCount()).toBe(50);
    });
  });
});