/**
 * TaskScheduler Tests
 * thunderbolt-design Task Scheduler
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskScheduler } from '../TaskScheduler';

describe('TaskScheduler', () => {
  let scheduler: TaskScheduler;

  beforeEach(() => {
    scheduler = new TaskScheduler();
  });

  afterEach(() => {
    scheduler.clearAll();
  });

  // ============================================================
  // schedule
  // ============================================================
  describe('schedule', () => {
    it('should schedule', () => {
      const id = scheduler.schedule('test', async () => true);
      expect(id).toBe('task-1');
    });

    it('should set initial status to pending', () => {
      const id = scheduler.schedule('test', async () => true);
      expect(scheduler.isPending(id)).toBe(true);
    });
  });

  // ============================================================
  // runNext
  // ============================================================
  describe('runNext', () => {
    it('should run next', async () => {
      scheduler.schedule('test', async () => true);
      expect(await scheduler.runNext()).toBe(true);
    });

    it('should return false for empty', async () => {
      expect(await scheduler.runNext()).toBe(false);
    });

    it('should run by priority', async () => {
      const low = scheduler.schedule('low', async () => true, 1);
      const high = scheduler.schedule('high', async () => true, 10);
      await scheduler.runNext();
      expect(scheduler.isRunning(high) || scheduler.isCompleted(high)).toBe(true);
      expect(scheduler.isPending(low)).toBe(true);
    });
  });

  // ============================================================
  // runTask
  // ============================================================
  describe('runTask', () => {
    it('should run task', async () => {
      const id = scheduler.schedule('test', async () => true);
      expect(await scheduler.runTask(id)).toBe(true);
    });

    it('should mark completed on success', async () => {
      const id = scheduler.schedule('test', async () => true);
      await scheduler.runTask(id);
      expect(scheduler.isCompleted(id)).toBe(true);
    });

    it('should mark failed on false result', async () => {
      const id = scheduler.schedule('test', async () => false);
      await scheduler.runTask(id);
      expect(scheduler.isFailed(id)).toBe(true);
    });

    it('should mark failed on throw', async () => {
      const id = scheduler.schedule('test', async () => { throw 'err'; });
      await scheduler.runTask(id);
      expect(scheduler.isFailed(id)).toBe(true);
    });

    it('should return false for unknown', async () => {
      expect(await scheduler.runTask('unknown')).toBe(false);
    });
  });

  // ============================================================
  // cancel
  // ============================================================
  describe('cancel', () => {
    it('should cancel', () => {
      const id = scheduler.schedule('test', async () => true);
      expect(scheduler.cancel(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(scheduler.cancel('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      scheduler.schedule('test', async () => true);
      const stats = scheduler.getStats();
      expect(stats.pending).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get task', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getTask('task-1')?.name).toBe('test');
    });

    it('should get all', () => {
      scheduler.schedule('a', async () => true);
      scheduler.schedule('b', async () => true);
      expect(scheduler.getAllTasks()).toHaveLength(2);
    });

    it('should remove', () => {
      const id = scheduler.schedule('test', async () => true);
      expect(scheduler.removeTask(id)).toBe(true);
    });

    it('should check existence', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.hasTask('task-1')).toBe(true);
    });

    it('should count', () => {
      expect(scheduler.getCount()).toBe(0);
      scheduler.schedule('test', async () => true);
      expect(scheduler.getCount()).toBe(1);
    });
  });

  // ============================================================
  // name/status/priority
  // ============================================================
  describe('name/status/priority', () => {
    it('should get name', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getName('task-1')).toBe('test');
    });

    it('should get status', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getStatus('task-1')).toBe('pending');
    });

    it('should get priority', () => {
      scheduler.schedule('test', async () => true, 5);
      expect(scheduler.getPriority('task-1')).toBe(5);
    });

    it('should set priority', () => {
      const id = scheduler.schedule('test', async () => true);
      expect(scheduler.setPriority(id, 10)).toBe(true);
    });

    it('should return false for setPriority unknown', () => {
      expect(scheduler.setPriority('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // status checks
  // ============================================================
  describe('status checks', () => {
    it('should check isRunning', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.isRunning('task-1')).toBe(false);
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get by status', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getByStatus('pending')).toHaveLength(1);
    });

    it('should get pending', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getPending()).toHaveLength(1);
    });

    it('should get running', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getRunning()).toHaveLength(0);
    });

    it('should get completed', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getCompleted()).toHaveLength(0);
    });

    it('should get failed', () => {
      scheduler.schedule('test', async () => false);
      expect(scheduler.getFailed()).toHaveLength(0);
    });

    it('should get cancelled', () => {
      const id = scheduler.schedule('test', async () => true);
      scheduler.cancel(id);
      expect(scheduler.getCancelled()).toHaveLength(1);
    });
  });

  // ============================================================
  // retries / result / error / duration
  // ============================================================
  describe('retries / result / error / duration', () => {
    it('should get retries', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getRetries('task-1')).toBe(0);
    });

    it('should get result', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getResult('task-1')).toBeUndefined();
    });

    it('should get error', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getError('task-1')).toBeUndefined();
    });

    it('should get duration', () => {
      scheduler.schedule('test', async () => true);
      expect(scheduler.getDuration('task-1')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        scheduler.schedule(`t${i}`, async () => true);
      }
      expect(scheduler.getCount()).toBe(50);
    });
  });
});