/**
 * QueueManager Tests
 * nanobot-design Queue Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueueManager } from '../QueueManager';

describe('QueueManager', () => {
  let qm: QueueManager;

  beforeEach(() => {
    qm = new QueueManager();
  });

  afterEach(() => {
    qm.clearAll();
  });

  // ============================================================
  // enqueue / dequeue / complete / peek / size / clear / remove
  // ============================================================
  describe('enqueue / dequeue / complete / peek / size / clear / remove', () => {
    it('should enqueue', () => {
      expect(qm.enqueue('task1', 1)).toBe('qm3-1');
    });

    it('should mark as active', () => {
      const id = qm.enqueue('task1', 1);
      expect(qm.isActive(id)).toBe(true);
    });

    it('should mark as queued', () => {
      const id = qm.enqueue('task1', 1);
      expect(qm.isQueued(id)).toBe(true);
    });

    it('should dequeue', () => {
      qm.enqueue('task1', 1);
      expect(qm.dequeue()).toBe('qm3-1');
    });

    it('should mark as processing on dequeue', () => {
      qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.isProcessing('qm3-1')).toBe(true);
    });

    it('should dequeue highest priority first', () => {
      qm.enqueue('low', 1);
      qm.enqueue('high', 10);
      expect(qm.dequeue()).toBe('qm3-2');
    });

    it('should return null for empty dequeue', () => {
      expect(qm.dequeue()).toBeNull();
    });

    it('should complete', () => {
      const id = qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.complete(id)).toBe(true);
    });

    it('should mark as done on complete', () => {
      const id = qm.enqueue('task1', 1);
      qm.dequeue();
      qm.complete(id);
      expect(qm.isDone(id)).toBe(true);
    });

    it('should not complete not processing', () => {
      const id = qm.enqueue('task1', 1);
      expect(qm.complete(id)).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(qm.complete('unknown')).toBe(false);
    });

    it('should peek', () => {
      qm.enqueue('task1', 1);
      expect(qm.peek()).toBe('qm3-1');
    });

    it('should not remove on peek', () => {
      qm.enqueue('task1', 1);
      qm.peek();
      expect(qm.size()).toBe(1);
    });

    it('should return null for empty peek', () => {
      expect(qm.peek()).toBeNull();
    });

    it('should get size', () => {
      qm.enqueue('task1', 1);
      expect(qm.size()).toBe(1);
    });

    it('should get size 0 for empty', () => {
      expect(qm.size()).toBe(0);
    });

    it('should clear done items', () => {
      const id = qm.enqueue('task1', 1);
      qm.dequeue();
      qm.complete(id);
      qm.clear();
      expect(qm.isQueued(id)).toBe(true);
    });

    it('should remove', () => {
      qm.enqueue('task1', 1);
      expect(qm.remove('qm3-1')).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      qm.enqueue('task1', 1);
      const stats = qm.getStats();
      expect(stats.totalTasks).toBe(1);
    });

    it('should count queued', () => {
      qm.enqueue('task1', 1);
      expect(qm.getStats().queued).toBe(1);
    });

    it('should count processing', () => {
      qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.getStats().processing).toBe(1);
    });

    it('should count done', () => {
      const id = qm.enqueue('task1', 1);
      qm.dequeue();
      qm.complete(id);
      expect(qm.getStats().done).toBe(1);
    });

    it('should count total enqueued', () => {
      qm.enqueue('task1', 1);
      expect(qm.getStats().totalEnqueued).toBe(1);
    });

    it('should count total dequeued', () => {
      qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.getStats().totalDequeued).toBe(1);
    });

    it('should count active', () => {
      qm.enqueue('task1', 1);
      expect(qm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = qm.enqueue('task1', 1);
      qm.setActive(id, false);
      expect(qm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.getStats().totalHits).toBe(1);
    });

    it('should count unique tasks', () => {
      qm.enqueue('task1', 1);
      qm.enqueue('task1', 2);
      expect(qm.getStats().uniqueTasks).toBe(1);
    });

    it('should compute avg priority', () => {
      qm.enqueue('a', 1);
      qm.enqueue('b', 2);
      expect(qm.getStats().avgPriority).toBe(1.5);
    });

    it('should get max priority', () => {
      qm.enqueue('a', 1);
      qm.enqueue('b', 5);
      expect(qm.getStats().maxPriority).toBe(5);
    });

    it('should get min priority', () => {
      qm.enqueue('a', 1);
      qm.enqueue('b', 5);
      expect(qm.getStats().minPriority).toBe(1);
    });

    it('should get current size', () => {
      qm.enqueue('a', 1);
      expect(qm.getStats().currentSize).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get item', () => {
      qm.enqueue('task1', 1);
      expect(qm.getItem('qm3-1')?.task).toBe('task1');
    });

    it('should get all', () => {
      qm.enqueue('task1', 1);
      expect(qm.getAllItems()).toHaveLength(1);
    });

    it('should check existence', () => {
      qm.enqueue('task1', 1);
      expect(qm.hasItem('qm3-1')).toBe(true);
    });

    it('should count', () => {
      expect(qm.getCount()).toBe(0);
      qm.enqueue('task1', 1);
      expect(qm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get task', () => {
      qm.enqueue('task1', 1);
      expect(qm.getTask('qm3-1')).toBe('task1');
    });

    it('should get priority', () => {
      qm.enqueue('task1', 5);
      expect(qm.getPriority('qm3-1')).toBe(5);
    });

    it('should get history', () => {
      qm.enqueue('task1', 1);
      expect(qm.getHistory('qm3-1')).toEqual(['queued']);
    });

    it('should get hits', () => {
      qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.getHits('qm3-1')).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      qm.enqueue('task1', 1);
      expect(qm.setActive('qm3-1', false)).toBe(true);
    });

    it('should set task', () => {
      qm.enqueue('task1', 1);
      expect(qm.setTask('qm3-1', 'task2')).toBe(true);
    });

    it('should set priority', () => {
      qm.enqueue('task1', 1);
      expect(qm.setPriority('qm3-1', 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(qm.setActive('unknown', false)).toBe(false);
      expect(qm.setTask('unknown', 't')).toBe(false);
      expect(qm.setPriority('unknown', 1)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = qm.enqueue('task1', 1);
      qm.dequeue();
      qm.complete(id);
      qm.setActive(id, false);
      qm.resetAll();
      expect(qm.isQueued(id)).toBe(true);
      expect(qm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by task / status / state
  // ============================================================
  describe('by task / status / state', () => {
    it('should get by task', () => {
      qm.enqueue('task1', 1);
      expect(qm.getByTask('task1')).toHaveLength(1);
    });

    it('should get by status', () => {
      qm.enqueue('task1', 1);
      expect(qm.getByStatus('queued')).toHaveLength(1);
    });

    it('should get queued', () => {
      qm.enqueue('task1', 1);
      expect(qm.getQueuedItems()).toHaveLength(1);
    });

    it('should get processing', () => {
      qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.getProcessingItems()).toHaveLength(1);
    });

    it('should get done', () => {
      const id = qm.enqueue('task1', 1);
      qm.dequeue();
      qm.complete(id);
      expect(qm.getDoneItems()).toHaveLength(1);
    });

    it('should get active', () => {
      qm.enqueue('task1', 1);
      expect(qm.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      qm.enqueue('task1', 1);
      qm.setActive('qm3-1', false);
      expect(qm.getInactiveItems()).toHaveLength(1);
    });

    it('should get all tasks', () => {
      qm.enqueue('task1', 1);
      qm.enqueue('task2', 1);
      expect(qm.getAllTasks()).toHaveLength(2);
    });

    it('should get task count', () => {
      qm.enqueue('task1', 1);
      expect(qm.getTaskCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      qm.enqueue('task1', 1);
      expect(qm.getNewest()?.id).toBe('qm3-1');
    });

    it('should return null for empty newest', () => {
      expect(qm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      qm.enqueue('task1', 1);
      expect(qm.getOldest()?.id).toBe('qm3-1');
    });

    it('should return null for empty oldest', () => {
      expect(qm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      qm.enqueue('task1', 1);
      expect(qm.getCreatedAt('qm3-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total enqueued', () => {
      qm.enqueue('task1', 1);
      expect(qm.getTotalEnqueued()).toBe(1);
    });

    it('should get total dequeued', () => {
      qm.enqueue('task1', 1);
      qm.dequeue();
      expect(qm.getTotalDequeued()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many items', () => {
      for (let i = 0; i < 50; i++) {
        qm.enqueue(`task${i}`, i);
      }
      expect(qm.getCount()).toBe(50);
    });
  });
});