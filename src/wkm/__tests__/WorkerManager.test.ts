/**
 * WorkerManager Tests
 * nanobot-design Worker Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkerManager } from '../WorkerManager';

describe('WorkerManager', () => {
  let wkm: WorkerManager;

  beforeEach(() => {
    wkm = new WorkerManager();
  });

  afterEach(() => {
    wkm.clearAll();
  });

  // ============================================================
  // register / assign / release / reset
  // ============================================================
  describe('register / assign / release / reset', () => {
    it('should register', () => {
      expect(wkm.register('w1', 'task1')).toBe('wkm-1');
    });

    it('should mark as active', () => {
      const id = wkm.register('w1', 'task1');
      expect(wkm.isActive(id)).toBe(true);
    });

    it('should mark as idle', () => {
      const id = wkm.register('w1', 'task1');
      expect(wkm.isIdle(id)).toBe(true);
    });

    it('should assign', () => {
      const id = wkm.register('w1', 'task1');
      expect(wkm.assign(id, 'task2')).toBe(true);
    });

    it('should mark as busy on assign', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.isBusy(id)).toBe(true);
    });

    it('should set task on assign', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getTask(id)).toBe('task2');
    });

    it('should increment tasks on assign', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getTasks(id)).toBe(1);
    });

    it('should log history on assign', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getHistory(id)).toHaveLength(1);
    });

    it('should not assign busy', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.assign(id, 'task3')).toBe(false);
    });

    it('should not assign inactive', () => {
      const id = wkm.register('w1', 'task1');
      wkm.setActive(id, false);
      expect(wkm.assign(id, 'task2')).toBe(false);
    });

    it('should return false for unknown assign', () => {
      expect(wkm.assign('unknown', 'task')).toBe(false);
    });

    it('should release', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.release(id)).toBe(true);
    });

    it('should mark as idle on release', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      wkm.release(id);
      expect(wkm.isIdle(id)).toBe(true);
    });

    it('should clear task on release', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      wkm.release(id);
      expect(wkm.getTask(id)).toBe('');
    });

    it('should not release not busy', () => {
      const id = wkm.register('w1', 'task1');
      expect(wkm.release(id)).toBe(false);
    });

    it('should return false for unknown release', () => {
      expect(wkm.release('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      wkm.reset(id);
      expect(wkm.getTasks(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(wkm.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      wkm.register('w1', 'task1');
      const stats = wkm.getStats();
      expect(stats.workers).toBe(1);
    });

    it('should count busy', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getStats().busy).toBe(1);
    });

    it('should count idle', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getStats().idle).toBe(1);
    });

    it('should count total tasks', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getStats().totalTasks).toBe(1);
    });

    it('should count active', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = wkm.register('w1', 'task1');
      wkm.setActive(id, false);
      expect(wkm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      wkm.register('w1', 'task1');
      wkm.register('w2', 'task2');
      expect(wkm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg tasks', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getStats().avgTasks).toBe(1);
    });

    it('should get max tasks', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      wkm.release(id);
      wkm.assign(id, 'task3');
      expect(wkm.getStats().maxTasks).toBe(2);
    });

    it('should get min tasks', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getStats().minTasks).toBe(0);
    });

    it('should compute avg task length', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getStats().avgTaskLength).toBe(5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get worker', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getWorker('wkm-1')?.name).toBe('w1');
    });

    it('should get all', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getAllWorkers()).toHaveLength(1);
    });

    it('should remove', () => {
      wkm.register('w1', 'task1');
      expect(wkm.removeWorker('wkm-1')).toBe(true);
    });

    it('should check existence', () => {
      wkm.register('w1', 'task1');
      expect(wkm.hasWorker('wkm-1')).toBe(true);
    });

    it('should count', () => {
      expect(wkm.getCount()).toBe(0);
      wkm.register('w1', 'task1');
      expect(wkm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getName('wkm-1')).toBe('w1');
    });

    it('should get task', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getTask('wkm-1')).toBe('task1');
    });

    it('should get task length', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getTaskLength('wkm-1')).toBe(5);
    });

    it('should get history', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getHistory('wkm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      wkm.register('w1', 'task1');
      expect(wkm.setActive('wkm-1', false)).toBe(true);
    });

    it('should set name', () => {
      wkm.register('w1', 'task1');
      expect(wkm.setName('wkm-1', 'w2')).toBe(true);
    });

    it('should set task', () => {
      wkm.register('w1', 'task1');
      expect(wkm.setTask('wkm-1', 'task2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wkm.setActive('unknown', false)).toBe(false);
      expect(wkm.setName('unknown', 'w')).toBe(false);
      expect(wkm.setTask('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      wkm.setActive(id, false);
      wkm.resetAll();
      expect(wkm.getTasks(id)).toBe(0);
      expect(wkm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getByName('w1')).toHaveLength(1);
    });

    it('should get busy', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getBusyWorkers()).toHaveLength(1);
    });

    it('should get idle', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getIdleWorkers()).toHaveLength(1);
    });

    it('should get active', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getActiveWorkers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      wkm.register('w1', 'task1');
      wkm.setActive('wkm-1', false);
      expect(wkm.getInactiveWorkers()).toHaveLength(1);
    });

    it('should get all names', () => {
      wkm.register('w1', 'task1');
      wkm.register('w2', 'task2');
      expect(wkm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getNameCount()).toBe(1);
    });

    it('should get by min tasks', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getByMinTasks(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most tasks', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      wkm.release(id);
      wkm.assign(id, 'task3');
      expect(wkm.getMostTasks()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(wkm.getMostTasks()).toBeNull();
    });

    it('should get newest', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getNewest()?.id).toBe('wkm-1');
    });

    it('should return null for empty newest', () => {
      expect(wkm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getOldest()?.id).toBe('wkm-1');
    });

    it('should return null for empty oldest', () => {
      expect(wkm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      wkm.register('w1', 'task1');
      expect(wkm.getCreatedAt('wkm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total tasks', () => {
      const id = wkm.register('w1', 'task1');
      wkm.assign(id, 'task2');
      expect(wkm.getTotalTasks()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many workers', () => {
      for (let i = 0; i < 50; i++) {
        wkm.register(`w${i}`, 'task1');
      }
      expect(wkm.getCount()).toBe(50);
    });
  });
});