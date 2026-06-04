/**
 * TaskSchedulerV2 Tests
 * thunderbolt-design Task Scheduler v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskSchedulerV2 } from '../TaskSchedulerV2';

describe('TaskSchedulerV2', () => {
  let scheduler: TaskSchedulerV2;

  beforeEach(() => {
    scheduler = new TaskSchedulerV2();
  });

  afterEach(() => {
    scheduler.clearAll();
  });

  // ============================================================
  // addTask
  // ============================================================
  describe('addTask', () => {
    it('should add task', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      expect(scheduler.getTaskCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const task = { id: 't1', priority: 1, status: 'pending' as const };
      scheduler.addTask(task);
      task.priority = 100;
      expect(scheduler.getTask('t1')?.priority).toBe(1);
    });
  });

  // ============================================================
  // schedule
  // ============================================================
  describe('schedule', () => {
    it('should return highest priority task', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      scheduler.addTask({ id: 't2', priority: 5, status: 'pending' });
      const next = scheduler.schedule();
      expect(next?.id).toBe('t2');
    });

    it('should return null for no pending', () => {
      expect(scheduler.schedule()).toBeNull();
    });

    it('should respect max concurrency', () => {
      scheduler.setMaxConcurrency(1);
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      scheduler.addTask({ id: 't2', priority: 5, status: 'pending' });
      const first = scheduler.schedule();
      expect(first?.id).toBe('t2');
      // After scheduling, no more should be available
      const second = scheduler.schedule();
      expect(second).toBeNull();
    });
  });

  // ============================================================
  // execute
  // ============================================================
  describe('execute', () => {
    it('should execute task and complete', async () => {
      const task: any = { id: 't1', priority: 1, status: 'pending', payload: () => 'result' };
      scheduler.addTask(task);
      const next = scheduler.schedule()!;
      await scheduler.execute(next);
      expect(scheduler.getTask('t1')?.status).toBe('completed');
    });

    it('should fail on throwing payload', async () => {
      const task: any = { id: 't1', priority: 1, status: 'pending', payload: () => { throw new Error('fail'); } };
      scheduler.addTask(task);
      const next = scheduler.schedule()!;
      await scheduler.execute(next);
      expect(scheduler.getTask('t1')?.status).toBe('failed');
    });

    it('should handle task without payload', async () => {
      const task: any = { id: 't1', priority: 1, status: 'pending' };
      scheduler.addTask(task);
      const next = scheduler.schedule()!;
      await scheduler.execute(next);
      expect(scheduler.getTask('t1')?.status).toBe('completed');
    });

    it('should set duration', async () => {
      const task: any = { id: 't1', priority: 1, status: 'pending', payload: async () => {
        await new Promise(r => setTimeout(r, 10));
        return 'ok';
      } };
      scheduler.addTask(task);
      const next = scheduler.schedule()!;
      await scheduler.execute(next);
      expect(scheduler.getTask('t1')?.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // setMaxConcurrency
  // ============================================================
  describe('setMaxConcurrency', () => {
    it('should set max concurrency', () => {
      scheduler.setMaxConcurrency(5);
      expect(scheduler.getMaxConcurrency()).toBe(5);
    });

    it('should clamp to >= 1', () => {
      scheduler.setMaxConcurrency(0);
      expect(scheduler.getMaxConcurrency()).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats for empty', () => {
      const stats = scheduler.getStats();
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
    });

    it('should count by status', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      scheduler.addTask({ id: 't2', priority: 1, status: 'completed' });
      scheduler.addTask({ id: 't3', priority: 1, status: 'failed' });
      const stats = scheduler.getStats();
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.pending).toBe(1);
    });

    it('should calculate average duration', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'completed', duration: 100 });
      scheduler.addTask({ id: 't2', priority: 1, status: 'completed', duration: 200 });
      const stats = scheduler.getStats();
      expect(stats.avgDuration).toBe(150);
    });
  });

  // ============================================================
  // filter by status
  // ============================================================
  describe('filter by status', () => {
    it('should get pending tasks', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      expect(scheduler.getPendingTasks()).toHaveLength(1);
    });

    it('should get running tasks', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'running' });
      expect(scheduler.getRunningTasks()).toHaveLength(1);
    });

    it('should get completed tasks', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'completed' });
      expect(scheduler.getCompletedTasks()).toHaveLength(1);
    });

    it('should get failed tasks', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'failed' });
      expect(scheduler.getFailedTasks()).toHaveLength(1);
    });
  });

  // ============================================================
  // removeTask
  // ============================================================
  describe('removeTask', () => {
    it('should remove task', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      expect(scheduler.removeTask('t1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(scheduler.removeTask('unknown')).toBe(false);
    });
  });

  // ============================================================
  // resetAll
  // ============================================================
  describe('resetAll', () => {
    it('should reset non-completed tasks', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      scheduler.addTask({ id: 't2', priority: 1, status: 'completed' });
      scheduler.resetAll();
      expect(scheduler.getTask('t1')?.status).toBe('pending');
      expect(scheduler.getTask('t2')?.status).toBe('completed');
    });
  });

  // ============================================================
  // setTaskStatus / setTaskPriority
  // ============================================================
  describe('setTaskStatus / setTaskPriority', () => {
    it('should set status', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      expect(scheduler.setTaskStatus('t1', 'running')).toBe(true);
    });

    it('should set priority', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      expect(scheduler.setTaskPriority('t1', 10)).toBe(true);
      expect(scheduler.getTask('t1')?.priority).toBe(10);
    });

    it('should return false for unknown', () => {
      expect(scheduler.setTaskStatus('unknown', 'completed')).toBe(false);
      expect(scheduler.setTaskPriority('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // getNextTaskId
  // ============================================================
  describe('getNextTaskId', () => {
    it('should return next id', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      expect(scheduler.getNextTaskId()).toBe('t1');
    });

    it('should return null for empty', () => {
      expect(scheduler.getNextTaskId()).toBeNull();
    });
  });

  // ============================================================
  // getAveragePriority
  // ============================================================
  describe('getAveragePriority', () => {
    it('should calculate average', () => {
      scheduler.addTask({ id: 't1', priority: 10, status: 'pending' });
      scheduler.addTask({ id: 't2', priority: 20, status: 'pending' });
      expect(scheduler.getAveragePriority()).toBe(15);
    });

    it('should return 0 for empty', () => {
      expect(scheduler.getAveragePriority()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 100; i++) {
        scheduler.addTask({ id: `t${i}`, priority: i, status: 'pending' });
      }
      expect(scheduler.getTaskCount()).toBe(100);
    });

    it('should handle equal priority', () => {
      scheduler.addTask({ id: 't1', priority: 1, status: 'pending' });
      scheduler.addTask({ id: 't2', priority: 1, status: 'pending' });
      const next = scheduler.schedule();
      expect(next).not.toBeNull();
    });
  });
});