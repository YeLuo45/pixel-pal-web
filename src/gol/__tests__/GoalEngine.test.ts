/**
 * GoalEngine Tests
 * generic-agent-design Goal Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoalEngine } from '../GoalEngine';

describe('GoalEngine', () => {
  let gol: GoalEngine;

  beforeEach(() => {
    gol = new GoalEngine();
  });

  afterEach(() => {
    gol.clearAll();
  });

  // ============================================================
  // set / update / complete / fail / pause / resume / remove
  // ============================================================
  describe('set / update / complete / fail / pause / resume / remove', () => {
    it('should set', () => {
      expect(gol.set('g1', 'desc', 1)).toBe('gol-1');
    });

    it('should default progress to 0', () => {
      const id = gol.set('g1');
      expect(gol.getProgress(id)).toBe(0);
    });

    it('should default status to pending', () => {
      const id = gol.set('g1');
      expect(gol.getStatus(id)).toBe('pending');
    });

    it('should default priority to 1', () => {
      const id = gol.set('g1');
      expect(gol.getPriority(id)).toBe(1);
    });

    it('should mark as active', () => {
      const id = gol.set('g1');
      expect(gol.isActive(id)).toBe(true);
    });

    it('should update', () => {
      const id = gol.set('g1');
      expect(gol.update(id, 50)).toBe(true);
    });

    it('should set progress on update', () => {
      const id = gol.set('g1');
      gol.update(id, 50);
      expect(gol.getProgress(id)).toBe(50);
    });

    it('should set status to in-progress on partial update', () => {
      const id = gol.set('g1');
      gol.update(id, 50);
      expect(gol.getStatus(id)).toBe('in-progress');
    });

    it('should set status to completed on 100 update', () => {
      const id = gol.set('g1');
      gol.update(id, 100);
      expect(gol.getStatus(id)).toBe('completed');
    });

    it('should clamp progress to 0-100', () => {
      const id = gol.set('g1');
      gol.update(id, 200);
      expect(gol.getProgress(id)).toBe(100);
    });

    it('should clamp progress to min 0', () => {
      const id = gol.set('g1');
      gol.update(id, -50);
      expect(gol.getProgress(id)).toBe(0);
    });

    it('should not update inactive', () => {
      const id = gol.set('g1');
      gol.setActive(id, false);
      expect(gol.update(id, 50)).toBe(false);
    });

    it('should not update completed', () => {
      const id = gol.set('g1');
      gol.complete(id);
      expect(gol.update(id, 50)).toBe(false);
    });

    it('should return false for unknown update', () => {
      expect(gol.update('unknown', 50)).toBe(false);
    });

    it('should complete', () => {
      const id = gol.set('g1');
      expect(gol.complete(id)).toBe(true);
    });

    it('should set progress to 100 on complete', () => {
      const id = gol.set('g1');
      gol.complete(id);
      expect(gol.getProgress(id)).toBe(100);
    });

    it('should return false for unknown complete', () => {
      expect(gol.complete('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = gol.set('g1');
      expect(gol.fail(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(gol.fail('unknown')).toBe(false);
    });

    it('should pause', () => {
      const id = gol.set('g1');
      expect(gol.pause(id)).toBe(true);
    });

    it('should return false for unknown pause', () => {
      expect(gol.pause('unknown')).toBe(false);
    });

    it('should resume', () => {
      const id = gol.set('g1');
      gol.pause(id);
      expect(gol.resume(id)).toBe(true);
    });

    it('should not resume non-paused', () => {
      const id = gol.set('g1');
      expect(gol.resume(id)).toBe(false);
    });

    it('should return false for unknown resume', () => {
      expect(gol.resume('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = gol.set('g1');
      expect(gol.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      gol.set('g1');
      const stats = gol.getStats();
      expect(stats.goals).toBe(1);
    });

    it('should count total completed', () => {
      const id = gol.set('g1');
      gol.complete(id);
      expect(gol.getStats().totalCompleted).toBe(1);
    });

    it('should count total failed', () => {
      const id = gol.set('g1');
      gol.fail(id);
      expect(gol.getStats().totalFailed).toBe(1);
    });

    it('should count total paused', () => {
      const id = gol.set('g1');
      gol.pause(id);
      expect(gol.getStats().totalPaused).toBe(1);
    });

    it('should count active', () => {
      gol.set('g1');
      expect(gol.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = gol.set('g1');
      gol.setActive(id, false);
      expect(gol.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = gol.set('g1');
      gol.update(id, 50);
      expect(gol.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      gol.set('a');
      gol.set('b');
      expect(gol.getStats().uniqueNames).toBe(2);
    });

    it('should count unique statuses', () => {
      const id1 = gol.set('a');
      const id2 = gol.set('b');
      gol.fail(id1);
      gol.complete(id2);
      expect(gol.getStats().uniqueStatuses).toBe(2);
    });

    it('should compute avg progress', () => {
      const id = gol.set('g1');
      gol.update(id, 50);
      expect(gol.getStats().avgProgress).toBe(50);
    });

    it('should get max progress', () => {
      const id = gol.set('g1');
      gol.update(id, 80);
      expect(gol.getStats().maxProgress).toBe(80);
    });

    it('should get min progress', () => {
      const id = gol.set('g1');
      gol.update(id, 30);
      expect(gol.getStats().minProgress).toBe(30);
    });

    it('should compute avg priority', () => {
      gol.set('a', '', 1);
      gol.set('b', '', 3);
      expect(gol.getStats().avgPriority).toBe(2);
    });

    it('should get max priority', () => {
      gol.set('a', '', 1);
      gol.set('b', '', 5);
      expect(gol.getStats().maxPriority).toBe(5);
    });

    it('should get min priority', () => {
      gol.set('a', '', 1);
      gol.set('b', '', 5);
      expect(gol.getStats().minPriority).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get goal', () => {
      gol.set('g1');
      expect(gol.getGoal('gol-1')?.name).toBe('g1');
    });

    it('should get all', () => {
      gol.set('g1');
      expect(gol.getAllGoals()).toHaveLength(1);
    });

    it('should check existence', () => {
      gol.set('g1');
      expect(gol.hasGoal('gol-1')).toBe(true);
    });

    it('should count', () => {
      expect(gol.getCount()).toBe(0);
      gol.set('g1');
      expect(gol.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      gol.set('g1');
      expect(gol.getName('gol-1')).toBe('g1');
    });

    it('should get description', () => {
      gol.set('g1', 'desc1');
      expect(gol.getDescription('gol-1')).toBe('desc1');
    });

    it('should get history', () => {
      gol.set('g1');
      expect(gol.getHistory('gol-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = gol.set('g1');
      gol.update(id, 50);
      expect(gol.getHits(id)).toBe(1);
    });

    it('should check completed', () => {
      const id = gol.set('g1');
      gol.complete(id);
      expect(gol.isCompleted(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = gol.set('g1');
      gol.fail(id);
      expect(gol.isFailed(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      gol.set('g1');
      expect(gol.setActive('gol-1', false)).toBe(true);
    });

    it('should set priority', () => {
      gol.set('g1');
      expect(gol.setPriority('gol-1', 10)).toBe(true);
    });

    it('should set name', () => {
      gol.set('g1');
      expect(gol.setName('gol-1', 'g2')).toBe(true);
    });

    it('should set description', () => {
      gol.set('g1');
      expect(gol.setDescription('gol-1', 'd2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(gol.setActive('unknown', false)).toBe(false);
      expect(gol.setPriority('unknown', 1)).toBe(false);
      expect(gol.setName('unknown', 'g')).toBe(false);
      expect(gol.setDescription('unknown', 'd')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = gol.set('g1');
      gol.update(id, 50);
      gol.complete(id);
      gol.resetAll();
      expect(gol.getProgress(id)).toBe(0);
      expect(gol.getStatus(id)).toBe('pending');
    });
  });

  // ============================================================
  // by name / status / state
  // ============================================================
  describe('by name / status / state', () => {
    it('should get by name', () => {
      gol.set('g1');
      expect(gol.getByName('g1')).toHaveLength(1);
    });

    it('should get by status', () => {
      const id = gol.set('g1');
      gol.complete(id);
      expect(gol.getByStatus('completed')).toHaveLength(1);
    });

    it('should get active', () => {
      gol.set('g1');
      expect(gol.getActiveGoals()).toHaveLength(1);
    });

    it('should get inactive', () => {
      gol.set('g1');
      gol.setActive('gol-1', false);
      expect(gol.getInactiveGoals()).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = gol.set('g1');
      gol.complete(id);
      expect(gol.getCompletedGoals()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = gol.set('g1');
      gol.fail(id);
      expect(gol.getFailedGoals()).toHaveLength(1);
    });

    it('should get all names', () => {
      gol.set('a');
      gol.set('b');
      expect(gol.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      gol.set('a');
      expect(gol.getNameCount()).toBe(1);
    });

    it('should get by min priority', () => {
      gol.set('a', '', 1);
      gol.set('b', '', 5);
      expect(gol.getByMinPriority(3)).toHaveLength(1);
    });

    it('should get by min progress', () => {
      const id = gol.set('g1');
      gol.update(id, 50);
      expect(gol.getByMinProgress(30)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      gol.set('g1');
      expect(gol.getNewest()?.id).toBe('gol-1');
    });

    it('should return null for empty newest', () => {
      expect(gol.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      gol.set('g1');
      expect(gol.getOldest()?.id).toBe('gol-1');
    });

    it('should return null for empty oldest', () => {
      expect(gol.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      gol.set('g1');
      expect(gol.getCreatedAt('gol-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = gol.set('g1');
      gol.update(id, 50);
      expect(gol.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total completed', () => {
      const id = gol.set('g1');
      gol.complete(id);
      expect(gol.getTotalCompleted()).toBe(1);
    });

    it('should get total failed', () => {
      const id = gol.set('g1');
      gol.fail(id);
      expect(gol.getTotalFailed()).toBe(1);
    });

    it('should get total paused', () => {
      const id = gol.set('g1');
      gol.pause(id);
      expect(gol.getTotalPaused()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many goals', () => {
      for (let i = 0; i < 50; i++) {
        gol.set(`g${i}`);
      }
      expect(gol.getCount()).toBe(50);
    });
  });
});