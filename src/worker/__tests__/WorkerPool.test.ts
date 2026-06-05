/**
 * WorkerPool Tests
 * nanobot-design Worker Pool
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkerPool } from '../WorkerPool';

describe('WorkerPool', () => {
  let wp: WorkerPool;

  beforeEach(() => {
    wp = new WorkerPool();
  });

  afterEach(() => {
    wp.clearAll();
  });

  // ============================================================
  // register / assign / release
  // ============================================================
  describe('register / assign / release', () => {
    it('should register', () => {
      expect(wp.register('w1')).toBe('wrk-1');
    });

    it('should assign', () => {
      const id = wp.register('w1');
      expect(wp.assign(id)).toBe(true);
    });

    it('should not assign busy', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.assign(id)).toBe(false);
    });

    it('should release', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.release(id)).toBe(true);
    });

    it('should not release idle', () => {
      const id = wp.register('w1');
      expect(wp.release(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(wp.assign('unknown')).toBe(false);
      expect(wp.release('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      wp.register('w1');
      const stats = wp.getStats();
      expect(stats.workers).toBe(1);
    });

    it('should count busy', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getStats().busy).toBe(1);
    });

    it('should count idle', () => {
      wp.register('w1');
      expect(wp.getStats().idle).toBe(1);
    });

    it('should count total tasks', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getStats().totalTasks).toBe(1);
    });

    it('should count total assigned', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getStats().totalAssigned).toBe(1);
    });

    it('should count total released', () => {
      const id = wp.register('w1');
      wp.assign(id);
      wp.release(id);
      expect(wp.getStats().totalReleased).toBe(1);
    });

    it('should compute avg tasks', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getStats().avgTasks).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get worker', () => {
      wp.register('w1');
      expect(wp.getWorker('wrk-1')?.name).toBe('w1');
    });

    it('should get all', () => {
      wp.register('w1');
      expect(wp.getAllWorkers()).toHaveLength(1);
    });

    it('should remove', () => {
      wp.register('w1');
      expect(wp.removeWorker('wrk-1')).toBe(true);
    });

    it('should check existence', () => {
      wp.register('w1');
      expect(wp.hasWorker('wrk-1')).toBe(true);
    });

    it('should count', () => {
      expect(wp.getCount()).toBe(0);
      wp.register('w1');
      expect(wp.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      wp.register('w1');
      expect(wp.getName('wrk-1')).toBe('w1');
    });

    it('should get tasks', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getTasks(id)).toBe(1);
    });

    it('should get total assigned', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getTotalAssigned(id)).toBe(1);
    });

    it('should get total released', () => {
      const id = wp.register('w1');
      wp.assign(id);
      wp.release(id);
      expect(wp.getTotalReleased(id)).toBe(1);
    });

    it('should get created at', () => {
      wp.register('w1');
      expect(wp.getCreatedAt('wrk-1')).toBeGreaterThan(0);
    });

    it('should get assigned at', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getAssignedAt(id)).toBeGreaterThan(0);
    });

    it('should get released at', () => {
      const id = wp.register('w1');
      wp.assign(id);
      wp.release(id);
      expect(wp.getReleasedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // state
  // ============================================================
  describe('state', () => {
    it('should check isBusy', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.isBusy(id)).toBe(true);
    });

    it('should check isIdle', () => {
      wp.register('w1');
      expect(wp.isIdle('wrk-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set name', () => {
      const id = wp.register('w1');
      expect(wp.setName(id, 'w2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wp.setName('unknown', 'w')).toBe(false);
    });
  });

  // ============================================================
  // force release
  // ============================================================
  describe('force release', () => {
    it('should force release', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.forceRelease(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wp.forceRelease('unknown')).toBe(false);
    });

    it('should force release all', () => {
      const id1 = wp.register('w1');
      const id2 = wp.register('w2');
      wp.assign(id1);
      wp.assign(id2);
      expect(wp.forceReleaseAll()).toBe(2);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      wp.register('w1');
      expect(wp.getByName('w1')).toHaveLength(1);
    });

    it('should get busy', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getBusyWorkers()).toHaveLength(1);
    });

    it('should get idle', () => {
      wp.register('w1');
      expect(wp.getIdleWorkers()).toHaveLength(1);
    });

    it('should get by min tasks', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getByMinTasks(1)).toHaveLength(1);
    });

    it('should get all names', () => {
      wp.register('w1');
      wp.register('w2');
      expect(wp.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      wp.register('w1');
      wp.register('w2');
      expect(wp.getNameCount()).toBe(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most tasks', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getMostTasks()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(wp.getMostTasks()).toBeNull();
    });

    it('should get least tasks', () => {
      wp.register('w1');
      expect(wp.getLeastTasks()?.id).toBe('wrk-1');
    });

    it('should return null for empty least', () => {
      expect(wp.getLeastTasks()).toBeNull();
    });

    it('should get oldest', () => {
      wp.register('w1');
      expect(wp.getOldest()?.id).toBe('wrk-1');
    });

    it('should return null for empty oldest', () => {
      expect(wp.getOldest()).toBeNull();
    });

    it('should get newest', () => {
      wp.register('w1');
      wp.register('w2');
      expect(['wrk-1', 'wrk-2']).toContain(wp.getNewest()?.id);
    });

    it('should return null for empty newest', () => {
      expect(wp.getNewest()).toBeNull();
    });
  });

  // ============================================================
  // utilization
  // ============================================================
  describe('utilization', () => {
    it('should get utilization', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.getUtilization()).toBe(1);
    });

    it('should return 0 for empty', () => {
      expect(wp.getUtilization()).toBe(0);
    });
  });

  // ============================================================
  // pick
  // ============================================================
  describe('pick', () => {
    it('should pick available', () => {
      wp.register('w1');
      expect(wp.pickAvailable()?.id).toBe('wrk-1');
    });

    it('should return null for empty', () => {
      expect(wp.pickAvailable()).toBeNull();
    });

    it('should return null for all busy', () => {
      const id = wp.register('w1');
      wp.assign(id);
      expect(wp.pickAvailable()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many workers', () => {
      for (let i = 0; i < 50; i++) {
        wp.register(`w${i}`);
      }
      expect(wp.getCount()).toBe(50);
    });
  });
});