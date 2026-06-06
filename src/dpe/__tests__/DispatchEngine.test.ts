/**
 * DispatchEngine Tests
 * nanobot-design Dispatch Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DispatchEngine } from '../DispatchEngine';

describe('DispatchEngine', () => {
  let dpe: DispatchEngine;

  beforeEach(() => {
    dpe = new DispatchEngine();
  });

  afterEach(() => {
    dpe.clearAll();
  });

  // ============================================================
  // register / dispatch / complete / fail / remove
  // ============================================================
  describe('register / dispatch / complete / fail / remove', () => {
    it('should register', () => {
      expect(dpe.register('task1', 'worker1')).toBe('dpe-1');
    });

    it('should default status to pending', () => {
      const id = dpe.register('task1', 'worker1');
      expect(dpe.getStatus(id)).toBe('pending');
    });

    it('should mark as active', () => {
      const id = dpe.register('task1', 'worker1');
      expect(dpe.isActive(id)).toBe(true);
    });

    it('should dispatch', () => {
      const id = dpe.register('task1', 'worker1');
      expect(dpe.dispatch(id)).toBe(true);
    });

    it('should set status to running on dispatch', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.dispatch(id);
      expect(dpe.getStatus(id)).toBe('running');
    });

    it('should not dispatch inactive', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.setActive(id, false);
      expect(dpe.dispatch(id)).toBe(false);
    });

    it('should return false for unknown dispatch', () => {
      expect(dpe.dispatch('unknown')).toBe(false);
    });

    it('should complete', () => {
      const id = dpe.register('task1', 'worker1');
      expect(dpe.complete(id)).toBe(true);
    });

    it('should return false for unknown complete', () => {
      expect(dpe.complete('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = dpe.register('task1', 'worker1');
      expect(dpe.fail(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(dpe.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = dpe.register('task1', 'worker1');
      expect(dpe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      dpe.register('task1', 'worker1');
      const stats = dpe.getStats();
      expect(stats.dispatches).toBe(1);
    });

    it('should count total completed', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.complete(id);
      expect(dpe.getStats().totalCompleted).toBe(1);
    });

    it('should count total failed', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.fail(id);
      expect(dpe.getStats().totalFailed).toBe(1);
    });

    it('should count active', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.setActive(id, false);
      expect(dpe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.dispatch(id);
      expect(dpe.getStats().totalHits).toBe(1);
    });

    it('should count unique tasks', () => {
      dpe.register('task1', 'worker1');
      dpe.register('task1', 'worker2');
      expect(dpe.getStats().uniqueTasks).toBe(1);
    });

    it('should count unique targets', () => {
      dpe.register('task1', 'worker1');
      dpe.register('task2', 'worker1');
      expect(dpe.getStats().uniqueTargets).toBe(1);
    });

    it('should compute avg task length', () => {
      dpe.register('a', 'w1');
      dpe.register('bb', 'w1');
      expect(dpe.getStats().avgTaskLength).toBe(1.5);
    });

    it('should get max task length', () => {
      dpe.register('a', 'w1');
      dpe.register('bbb', 'w1');
      expect(dpe.getStats().maxTaskLength).toBe(3);
    });

    it('should get min task length', () => {
      dpe.register('a', 'w1');
      dpe.register('bbb', 'w1');
      expect(dpe.getStats().minTaskLength).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get dispatch', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getDispatch('dpe-1')?.task).toBe('task1');
    });

    it('should get all', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getAllDispatches()).toHaveLength(1);
    });

    it('should check existence', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.hasDispatch('dpe-1')).toBe(true);
    });

    it('should count', () => {
      expect(dpe.getCount()).toBe(0);
      dpe.register('task1', 'worker1');
      expect(dpe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get task', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getTask('dpe-1')).toBe('task1');
    });

    it('should get target', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getTarget('dpe-1')).toBe('worker1');
    });

    it('should get task length', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getTaskLength('dpe-1')).toBe(5);
    });

    it('should get history', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getHistory('dpe-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.dispatch(id);
      expect(dpe.getHits(id)).toBe(1);
    });

    it('should check completed', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.complete(id);
      expect(dpe.isCompleted(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.fail(id);
      expect(dpe.isFailed(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.setActive('dpe-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(dpe.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = dpe.register('task1', 'worker1');
      dpe.dispatch(id);
      dpe.complete(id);
      dpe.resetAll();
      expect(dpe.getStatus(id)).toBe('pending');
    });
  });

  // ============================================================
  // by status / task / target / state
  // ============================================================
  describe('by status / task / target / state', () => {
    it('should get by status', () => {
      dpe.register('t1', 'w1');
      expect(dpe.getByStatus('pending')).toHaveLength(1);
    });

    it('should get by task', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getByTask('task1')).toHaveLength(1);
    });

    it('should get by target', () => {
      dpe.register('task1', 'worker1');
      expect(dpe.getByTarget('worker1')).toHaveLength(1);
    });

    it('should get active', () => {
      dpe.register('t1', 'w1');
      expect(dpe.getActiveDispatches()).toHaveLength(1);
    });

    it('should get inactive', () => {
      dpe.register('t1', 'w1');
      dpe.setActive('dpe-1', false);
      expect(dpe.getInactiveDispatches()).toHaveLength(1);
    });

    it('should get all tasks', () => {
      dpe.register('a', 'w1');
      dpe.register('b', 'w1');
      expect(dpe.getAllTasks()).toHaveLength(2);
    });

    it('should get task count', () => {
      dpe.register('a', 'w1');
      expect(dpe.getTaskCount()).toBe(1);
    });

    it('should get all targets', () => {
      dpe.register('a', 'w1');
      dpe.register('b', 'w2');
      expect(dpe.getAllTargets()).toHaveLength(2);
    });

    it('should get target count', () => {
      dpe.register('a', 'w1');
      expect(dpe.getTargetCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      dpe.register('t1', 'w1');
      expect(dpe.getNewest()?.id).toBe('dpe-1');
    });

    it('should return null for empty newest', () => {
      expect(dpe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      dpe.register('t1', 'w1');
      expect(dpe.getOldest()?.id).toBe('dpe-1');
    });

    it('should return null for empty oldest', () => {
      expect(dpe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      dpe.register('t1', 'w1');
      expect(dpe.getCreatedAt('dpe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = dpe.register('t1', 'w1');
      dpe.dispatch(id);
      expect(dpe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total completed', () => {
      const id = dpe.register('t1', 'w1');
      dpe.complete(id);
      expect(dpe.getTotalCompleted()).toBe(1);
    });

    it('should get total failed', () => {
      const id = dpe.register('t1', 'w1');
      dpe.fail(id);
      expect(dpe.getTotalFailed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many dispatches', () => {
      for (let i = 0; i < 50; i++) {
        dpe.register(`t${i}`, `w${i}`);
      }
      expect(dpe.getCount()).toBe(50);
    });
  });
});