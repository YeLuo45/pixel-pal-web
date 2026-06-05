/**
 * TaskSchedulerV2 Tests
 * nanobot-design Task Scheduler v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskSchedulerV2 } from '../TaskSchedulerV2';

describe('TaskSchedulerV2', () => {
  let ts: TaskSchedulerV2;

  beforeEach(() => {
    ts = new TaskSchedulerV2();
  });

  afterEach(() => {
    ts.clearAll();
  });

  // ============================================================
  // enqueue / next / complete / cancel
  // ============================================================
  describe('enqueue / next / complete / cancel', () => {
    it('should enqueue', () => {
      expect(ts.enqueue('t1', 5)).toBe('tsk-1');
    });

    it('should get next', () => {
      ts.enqueue('t1', 5);
      expect(ts.next()).toBe('tsk-1');
    });

    it('should return null for empty next', () => {
      expect(ts.next()).toBeNull();
    });

    it('should pick highest priority', () => {
      ts.enqueue('low', 1);
      ts.enqueue('high', 10);
      expect(ts.next()).toBe('tsk-2');
    });

    it('should complete', () => {
      const id = ts.enqueue('t1', 5);
      ts.next();
      expect(ts.complete(id)).toBe(true);
    });

    it('should not complete non-running', () => {
      const id = ts.enqueue('t1', 5);
      expect(ts.complete(id)).toBe(false);
    });

    it('should cancel', () => {
      const id = ts.enqueue('t1', 5);
      expect(ts.cancel(id)).toBe(true);
    });

    it('should not cancel done', () => {
      const id = ts.enqueue('t1', 5);
      ts.next();
      ts.complete(id);
      expect(ts.cancel(id)).toBe(false);
    });

    it('should not cancel already cancelled', () => {
      const id = ts.enqueue('t1', 5);
      ts.cancel(id);
      expect(ts.cancel(id)).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(ts.complete('unknown')).toBe(false);
    });

    it('should return false for unknown cancel', () => {
      expect(ts.cancel('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ts.enqueue('t1', 5);
      const stats = ts.getStats();
      expect(stats.tasks).toBe(1);
    });

    it('should count pending', () => {
      ts.enqueue('t1', 5);
      expect(ts.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      ts.enqueue('t1', 5);
      ts.next();
      expect(ts.getStats().running).toBe(1);
    });

    it('should count done', () => {
      const id = ts.enqueue('t1', 5);
      ts.next();
      ts.complete(id);
      expect(ts.getStats().done).toBe(1);
    });

    it('should count cancelled', () => {
      const id = ts.enqueue('t1', 5);
      ts.cancel(id);
      expect(ts.getStats().cancelled).toBe(1);
    });

    it('should compute avg priority', () => {
      ts.enqueue('t1', 5);
      expect(ts.getStats().avgPriority).toBe(5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get task', () => {
      ts.enqueue('t1', 5);
      expect(ts.getTask('tsk-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      ts.enqueue('t1', 5);
      expect(ts.getAllTasks()).toHaveLength(1);
    });

    it('should remove', () => {
      ts.enqueue('t1', 5);
      expect(ts.removeTask('tsk-1')).toBe(true);
    });

    it('should check existence', () => {
      ts.enqueue('t1', 5);
      expect(ts.hasTask('tsk-1')).toBe(true);
    });

    it('should count', () => {
      expect(ts.getCount()).toBe(0);
      ts.enqueue('t1', 5);
      expect(ts.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ts.enqueue('t1', 5);
      expect(ts.getName('tsk-1')).toBe('t1');
    });

    it('should get priority', () => {
      ts.enqueue('t1', 5);
      expect(ts.getPriority('tsk-1')).toBe(5);
    });

    it('should get state', () => {
      ts.enqueue('t1', 5);
      expect(ts.getState('tsk-1')).toBe('pending');
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isPending', () => {
      ts.enqueue('t1', 5);
      expect(ts.isPending('tsk-1')).toBe(true);
    });

    it('should check isRunning', () => {
      ts.enqueue('t1', 5);
      ts.next();
      expect(ts.isRunning('tsk-1')).toBe(true);
    });

    it('should check isDone', () => {
      const id = ts.enqueue('t1', 5);
      ts.next();
      ts.complete(id);
      expect(ts.isDone('tsk-1')).toBe(true);
    });

    it('should check isCancelled', () => {
      const id = ts.enqueue('t1', 5);
      ts.cancel(id);
      expect(ts.isCancelled('tsk-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set priority', () => {
      const id = ts.enqueue('t1', 5);
      expect(ts.setPriority(id, 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ts.setPriority('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // by state / name
  // ============================================================
  describe('by state / name', () => {
    it('should get by state', () => {
      ts.enqueue('t1', 5);
      expect(ts.getByState('pending')).toHaveLength(1);
    });

    it('should get pending', () => {
      ts.enqueue('t1', 5);
      expect(ts.getPendingTasks()).toHaveLength(1);
    });

    it('should get running', () => {
      ts.enqueue('t1', 5);
      ts.next();
      expect(ts.getRunningTasks()).toHaveLength(1);
    });

    it('should get done', () => {
      const id = ts.enqueue('t1', 5);
      ts.next();
      ts.complete(id);
      expect(ts.getDoneTasks()).toHaveLength(1);
    });

    it('should get cancelled', () => {
      const id = ts.enqueue('t1', 5);
      ts.cancel(id);
      expect(ts.getCancelledTasks()).toHaveLength(1);
    });

    it('should get by name', () => {
      ts.enqueue('t1', 5);
      expect(ts.getByName('t1')).toHaveLength(1);
    });

    it('should get by min priority', () => {
      ts.enqueue('t1', 5);
      expect(ts.getByMinPriority(3)).toHaveLength(1);
    });

    it('should get sorted by priority', () => {
      ts.enqueue('low', 1);
      ts.enqueue('high', 10);
      expect(ts.getSortedByPriority()[0].name).toBe('high');
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ts.enqueue('t1', 5);
      expect(ts.getCreatedAt('tsk-1')).toBeGreaterThan(0);
    });

    it('should get started at', () => {
      ts.enqueue('t1', 5);
      ts.next();
      expect(ts.getStartedAt('tsk-1')).toBeGreaterThan(0);
    });

    it('should get ended at', () => {
      const id = ts.enqueue('t1', 5);
      ts.next();
      ts.complete(id);
      expect(ts.getEndedAt('tsk-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get highest priority', () => {
      ts.enqueue('t1', 5);
      ts.enqueue('t2', 10);
      expect(ts.getHighestPriority()?.name).toBe('t2');
    });

    it('should return null for empty highest', () => {
      expect(ts.getHighestPriority()).toBeNull();
    });

    it('should get lowest priority', () => {
      ts.enqueue('t1', 5);
      ts.enqueue('t2', 10);
      expect(ts.getLowestPriority()?.name).toBe('t1');
    });

    it('should return null for empty lowest', () => {
      expect(ts.getLowestPriority()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        ts.enqueue(`t${i}`, i);
      }
      expect(ts.getCount()).toBe(50);
    });
  });
});