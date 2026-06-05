/**
 * Coordinator Tests
 * thunderbolt-design Coordinator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Coordinator } from '../Coordinator';

describe('Coordinator', () => {
  let coord: Coordinator;

  beforeEach(() => {
    coord = new Coordinator();
  });

  afterEach(() => {
    coord.clearAll();
  });

  // ============================================================
  // addTask / start / complete / fail
  // ============================================================
  describe('addTask / start / complete / fail', () => {
    it('should add task', () => {
      const id = coord.addTask('t1');
      expect(id).toBe('task-1');
    });

    it('should start', () => {
      const id = coord.addTask('t1');
      expect(coord.start(id)).toBe(true);
    });

    it('should complete', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      expect(coord.complete(id)).toBe(true);
    });

    it('should fail', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      expect(coord.fail(id, 'oops')).toBe(true);
    });

    it('should not start running task', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      expect(coord.start(id)).toBe(false);
    });

    it('should not complete non-running', () => {
      const id = coord.addTask('t1');
      expect(coord.complete(id)).toBe(false);
    });

    it('should return false for unknown start', () => {
      expect(coord.start('unknown')).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(coord.complete('unknown')).toBe(false);
    });

    it('should return false for unknown fail', () => {
      expect(coord.fail('unknown', 'r')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      coord.addTask('t1');
      const stats = coord.getStats();
      expect(stats.tasks).toBe(1);
    });

    it('should count done', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.complete(id);
      expect(coord.getStats().done).toBe(1);
    });

    it('should count failed', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.fail(id, 'r');
      expect(coord.getStats().failed).toBe(1);
    });

    it('should count running', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      expect(coord.getStats().running).toBe(1);
    });

    it('should count pending', () => {
      coord.addTask('t1');
      expect(coord.getStats().pending).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get task', () => {
      coord.addTask('t1');
      expect(coord.getTask('task-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      coord.addTask('t1');
      expect(coord.getAllTasks()).toHaveLength(1);
    });

    it('should remove', () => {
      coord.addTask('t1');
      expect(coord.removeTask('task-1')).toBe(true);
    });

    it('should check existence', () => {
      coord.addTask('t1');
      expect(coord.hasTask('task-1')).toBe(true);
    });

    it('should count', () => {
      expect(coord.getCount()).toBe(0);
      coord.addTask('t1');
      expect(coord.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      coord.addTask('t1');
      expect(coord.getName('task-1')).toBe('t1');
    });

    it('should get state', () => {
      coord.addTask('t1');
      expect(coord.getState('task-1')).toBe('pending');
    });

    it('should get reason', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.fail(id, 'oops');
      expect(coord.getReason('task-1')).toBe('oops');
    });

    it('should get duration', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.complete(id);
      expect(coord.getDuration('task-1')).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isPending', () => {
      coord.addTask('t1');
      expect(coord.isPending('task-1')).toBe(true);
    });

    it('should check isRunning', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      expect(coord.isRunning('task-1')).toBe(true);
    });

    it('should check isDone', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.complete(id);
      expect(coord.isDone('task-1')).toBe(true);
    });

    it('should check isFailed', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.fail(id, 'r');
      expect(coord.isFailed('task-1')).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get by state', () => {
      coord.addTask('t1');
      expect(coord.getByState('pending')).toHaveLength(1);
    });

    it('should get done', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.complete(id);
      expect(coord.getDoneTasks()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.fail(id, 'r');
      expect(coord.getFailedTasks()).toHaveLength(1);
    });

    it('should get running', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      expect(coord.getRunningTasks()).toHaveLength(1);
    });

    it('should get pending', () => {
      coord.addTask('t1');
      expect(coord.getPendingTasks()).toHaveLength(1);
    });
  });

  // ============================================================
  // by name
  // ============================================================
  describe('by name', () => {
    it('should get by name', () => {
      coord.addTask('t1');
      expect(coord.getByName('t1')).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      coord.addTask('t1');
      expect(coord.getCreatedAt('task-1')).toBeGreaterThan(0);
    });

    it('should get started at', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      expect(coord.getStartedAt('task-1')).toBeGreaterThan(0);
    });

    it('should get ended at', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.complete(id);
      expect(coord.getEndedAt('task-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get longest task', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.complete(id);
      expect(coord.getLongestTask()?.id).toBe('task-1');
    });

    it('should return null for empty longest', () => {
      expect(coord.getLongestTask()).toBeNull();
    });

    it('should get shortest task', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.complete(id);
      expect(coord.getShortestTask()?.id).toBe('task-1');
    });

    it('should return null for empty shortest', () => {
      expect(coord.getShortestTask()).toBeNull();
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset task', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      expect(coord.resetTask('task-1')).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(coord.resetTask('unknown')).toBe(false);
    });

    it('should reset state to pending', () => {
      const id = coord.addTask('t1');
      coord.start(id);
      coord.resetTask('task-1');
      expect(coord.isPending('task-1')).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        coord.addTask(`t${i}`);
      }
      expect(coord.getCount()).toBe(50);
    });
  });
});