/**
 * WorkerPoolManager Tests
 * nanobot-design Worker Pool Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkerPoolManager } from '../WorkerPoolManager';

describe('WorkerPoolManager', () => {
  let wpm: WorkerPoolManager;

  beforeEach(() => {
    wpm = new WorkerPoolManager();
  });

  afterEach(() => {
    wpm.clearAll();
  });

  // ============================================================
  // create / addWorker / removeWorker / remove
  // ============================================================
  describe('create / addWorker / removeWorker / remove', () => {
    it('should create', () => {
      expect(wpm.create('p1', 5)).toBe('wpm-1');
    });

    it('should mark as active', () => {
      const id = wpm.create('p1', 5);
      expect(wpm.isActive(id)).toBe(true);
    });

    it('should mark as empty', () => {
      const id = wpm.create('p1', 5);
      expect(wpm.isEmpty(id)).toBe(true);
    });

    it('should default size to 5', () => {
      const id = wpm.create('p1');
      expect(wpm.getSize(id)).toBe(5);
    });

    it('should add worker', () => {
      const id = wpm.create('p1', 5);
      expect(wpm.addWorker(id, 'w1')).toBe(true);
    });

    it('should not add beyond size', () => {
      const id = wpm.create('p1', 1);
      wpm.addWorker(id, 'w1');
      expect(wpm.addWorker(id, 'w2')).toBe(false);
    });

    it('should not add duplicate worker', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      wpm.addWorker(id, 'w1');
      expect(wpm.getWorkerCount(id)).toBe(1);
    });

    it('should not add inactive', () => {
      const id = wpm.create('p1', 5);
      wpm.setActive(id, false);
      expect(wpm.addWorker(id, 'w1')).toBe(false);
    });

    it('should return false for unknown addWorker', () => {
      expect(wpm.addWorker('unknown', 'w1')).toBe(false);
    });

    it('should remove worker', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      expect(wpm.removeWorker(id, 'w1')).toBe(true);
    });

    it('should not remove missing worker', () => {
      const id = wpm.create('p1', 5);
      expect(wpm.removeWorker(id, 'w1')).toBe(false);
    });

    it('should return false for unknown removeWorker', () => {
      expect(wpm.removeWorker('unknown', 'w1')).toBe(false);
    });

    it('should remove pool', () => {
      const id = wpm.create('p1', 5);
      expect(wpm.remove(id)).toBe(true);
    });

    it('should detect full', () => {
      const id = wpm.create('p1', 1);
      wpm.addWorker(id, 'w1');
      expect(wpm.isFull(id)).toBe(true);
    });

    it('should get available', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      expect(wpm.getAvailable(id)).toBe(4);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      wpm.create('p1', 5);
      const stats = wpm.getStats();
      expect(stats.pools).toBe(1);
    });

    it('should count total workers', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      wpm.addWorker(id, 'w2');
      expect(wpm.getStats().totalWorkers).toBe(2);
    });

    it('should count active', () => {
      wpm.create('p1', 5);
      expect(wpm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = wpm.create('p1', 5);
      wpm.setActive(id, false);
      expect(wpm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      expect(wpm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      wpm.create('p1', 5);
      wpm.create('p2', 5);
      expect(wpm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg size', () => {
      wpm.create('p1', 10);
      expect(wpm.getStats().avgSize).toBe(10);
    });

    it('should get max size', () => {
      wpm.create('p1', 5);
      wpm.create('p2', 10);
      expect(wpm.getStats().maxSize).toBe(10);
    });

    it('should get min size', () => {
      wpm.create('p1', 5);
      wpm.create('p2', 10);
      expect(wpm.getStats().minSize).toBe(5);
    });

    it('should compute avg workers', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      expect(wpm.getStats().avgWorkers).toBe(1);
    });

    it('should get max workers', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      wpm.addWorker(id, 'w2');
      expect(wpm.getStats().maxWorkers).toBe(2);
    });

    it('should get min workers', () => {
      wpm.create('p1', 5);
      expect(wpm.getStats().minWorkers).toBe(0);
    });

    it('should count empty pools', () => {
      wpm.create('p1', 5);
      expect(wpm.getStats().emptyPools).toBe(1);
    });

    it('should count full pools', () => {
      const id = wpm.create('p1', 1);
      wpm.addWorker(id, 'w1');
      expect(wpm.getStats().fullPools).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pool', () => {
      wpm.create('p1', 5);
      expect(wpm.getPool('wpm-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      wpm.create('p1', 5);
      expect(wpm.getAllPools()).toHaveLength(1);
    });

    it('should check existence', () => {
      wpm.create('p1', 5);
      expect(wpm.hasPool('wpm-1')).toBe(true);
    });

    it('should count', () => {
      expect(wpm.getCount()).toBe(0);
      wpm.create('p1', 5);
      expect(wpm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      wpm.create('p1', 5);
      expect(wpm.getName('wpm-1')).toBe('p1');
    });

    it('should get size', () => {
      wpm.create('p1', 5);
      expect(wpm.getSize('wpm-1')).toBe(5);
    });

    it('should get workers', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      expect(wpm.getWorkers(id)).toEqual(['w1']);
    });

    it('should get worker count', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      expect(wpm.getWorkerCount(id)).toBe(1);
    });

    it('should get history', () => {
      wpm.create('p1', 5);
      expect(wpm.getHistory('wpm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      expect(wpm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      wpm.create('p1', 5);
      expect(wpm.setActive('wpm-1', false)).toBe(true);
    });

    it('should set size', () => {
      wpm.create('p1', 5);
      expect(wpm.setSize('wpm-1', 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wpm.setActive('unknown', false)).toBe(false);
      expect(wpm.setSize('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      wpm.setActive(id, false);
      wpm.resetAll();
      expect(wpm.getWorkerCount(id)).toBe(0);
      expect(wpm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      wpm.create('p1', 5);
      expect(wpm.getByName('p1')).toHaveLength(1);
    });

    it('should get active', () => {
      wpm.create('p1', 5);
      expect(wpm.getActivePools()).toHaveLength(1);
    });

    it('should get inactive', () => {
      wpm.create('p1', 5);
      wpm.setActive('wpm-1', false);
      expect(wpm.getInactivePools()).toHaveLength(1);
    });

    it('should get empty pools', () => {
      wpm.create('p1', 5);
      expect(wpm.getEmptyPools()).toHaveLength(1);
    });

    it('should get full pools', () => {
      const id = wpm.create('p1', 1);
      wpm.addWorker(id, 'w1');
      expect(wpm.getFullPools()).toHaveLength(1);
    });

    it('should get all names', () => {
      wpm.create('p1', 5);
      wpm.create('p2', 5);
      expect(wpm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      wpm.create('p1', 5);
      expect(wpm.getNameCount()).toBe(1);
    });

    it('should get by min workers', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      wpm.addWorker(id, 'w2');
      expect(wpm.getByMinWorkers(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get largest', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      wpm.addWorker(id, 'w2');
      expect(wpm.getLargest()?.id).toBe(id);
    });

    it('should return null for empty largest', () => {
      expect(wpm.getLargest()).toBeNull();
    });

    it('should get newest', () => {
      wpm.create('p1', 5);
      expect(wpm.getNewest()?.id).toBe('wpm-1');
    });

    it('should return null for empty newest', () => {
      expect(wpm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      wpm.create('p1', 5);
      expect(wpm.getOldest()?.id).toBe('wpm-1');
    });

    it('should return null for empty oldest', () => {
      expect(wpm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      wpm.create('p1', 5);
      expect(wpm.getCreatedAt('wpm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = wpm.create('p1', 5);
      wpm.addWorker(id, 'w1');
      expect(wpm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many pools', () => {
      for (let i = 0; i < 50; i++) {
        wpm.create(`p${i}`, 5);
      }
      expect(wpm.getCount()).toBe(50);
    });
  });
});