/**
 * PoolManager Tests
 * thunderbolt-design Pool Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PoolManager } from '../PoolManager';

describe('PoolManager', () => {
  let plm: PoolManager;

  beforeEach(() => {
    plm = new PoolManager();
  });

  afterEach(() => {
    plm.clearAll();
  });

  // ============================================================
  // create / allocate / release / reset / resize
  // ============================================================
  describe('create / allocate / release / reset / resize', () => {
    it('should create', () => {
      expect(plm.create('p1', 10)).toBe('plm-1');
    });

    it('should mark as active', () => {
      const id = plm.create('p1', 10);
      expect(plm.isActive(id)).toBe(true);
    });

    it('should set available to size on create', () => {
      const id = plm.create('p1', 10);
      expect(plm.getAvailable(id)).toBe(10);
    });

    it('should set allocated to 0 on create', () => {
      const id = plm.create('p1', 10);
      expect(plm.getAllocated(id)).toBe(0);
    });

    it('should allocate', () => {
      const id = plm.create('p1', 10);
      expect(plm.allocate(id)).toBe(true);
    });

    it('should increment allocated on allocate', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.getAllocated(id)).toBe(1);
    });

    it('should decrement available on allocate', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.getAvailable(id)).toBe(9);
    });

    it('should log history on allocate', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.getHistory(id)).toHaveLength(1);
    });

    it('should not allocate full', () => {
      const id = plm.create('p1', 1);
      plm.allocate(id);
      expect(plm.allocate(id)).toBe(false);
    });

    it('should not allocate inactive', () => {
      const id = plm.create('p1', 10);
      plm.setActive(id, false);
      expect(plm.allocate(id)).toBe(false);
    });

    it('should return false for unknown allocate', () => {
      expect(plm.allocate('unknown')).toBe(false);
    });

    it('should release', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.release(id)).toBe(true);
    });

    it('should decrement allocated on release', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      plm.release(id);
      expect(plm.getAllocated(id)).toBe(0);
    });

    it('should increment available on release', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      plm.release(id);
      expect(plm.getAvailable(id)).toBe(10);
    });

    it('should not release empty', () => {
      const id = plm.create('p1', 10);
      expect(plm.release(id)).toBe(false);
    });

    it('should return false for unknown release', () => {
      expect(plm.release('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      plm.reset(id);
      expect(plm.getAllocated(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(plm.reset('unknown')).toBe(false);
    });

    it('should resize', () => {
      const id = plm.create('p1', 10);
      expect(plm.resize(id, 20)).toBe(true);
    });

    it('should set new size on resize', () => {
      const id = plm.create('p1', 10);
      plm.resize(id, 20);
      expect(plm.getSize(id)).toBe(20);
    });

    it('should return false for unknown resize', () => {
      expect(plm.resize('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      plm.create('p1', 10);
      const stats = plm.getStats();
      expect(stats.pools).toBe(1);
    });

    it('should count total allocated', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.getStats().totalAllocated).toBe(1);
    });

    it('should count total available', () => {
      plm.create('p1', 10);
      expect(plm.getStats().totalAvailable).toBe(10);
    });

    it('should count active', () => {
      plm.create('p1', 10);
      expect(plm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = plm.create('p1', 10);
      plm.setActive(id, false);
      expect(plm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      plm.create('p1', 10);
      plm.create('p2', 5);
      expect(plm.getStats().uniqueNames).toBe(2);
    });

    it('should count total size', () => {
      plm.create('p1', 10);
      plm.create('p2', 5);
      expect(plm.getStats().totalSize).toBe(15);
    });

    it('should compute avg size', () => {
      plm.create('p1', 10);
      expect(plm.getStats().avgSize).toBe(10);
    });

    it('should get max size', () => {
      plm.create('p1', 10);
      plm.create('p2', 20);
      expect(plm.getStats().maxSize).toBe(20);
    });

    it('should get min size', () => {
      plm.create('p1', 10);
      plm.create('p2', 5);
      expect(plm.getStats().minSize).toBe(5);
    });

    it('should compute utilization rate', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      plm.allocate(id);
      plm.allocate(id);
      plm.allocate(id);
      plm.allocate(id);
      expect(plm.getStats().utilizationRate).toBe(0.5);
    });

    it('should count full pools', () => {
      const id = plm.create('p1', 1);
      plm.allocate(id);
      expect(plm.getStats().fullPools).toBe(1);
    });

    it('should count empty pools', () => {
      plm.create('p1', 10);
      expect(plm.getStats().emptyPools).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pool', () => {
      plm.create('p1', 10);
      expect(plm.getPool('plm-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      plm.create('p1', 10);
      expect(plm.getAllPools()).toHaveLength(1);
    });

    it('should remove', () => {
      plm.create('p1', 10);
      expect(plm.removePool('plm-1')).toBe(true);
    });

    it('should check existence', () => {
      plm.create('p1', 10);
      expect(plm.hasPool('plm-1')).toBe(true);
    });

    it('should count', () => {
      expect(plm.getCount()).toBe(0);
      plm.create('p1', 10);
      expect(plm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      plm.create('p1', 10);
      expect(plm.getName('plm-1')).toBe('p1');
    });

    it('should get size', () => {
      plm.create('p1', 10);
      expect(plm.getSize('plm-1')).toBe(10);
    });

    it('should get history', () => {
      plm.create('p1', 10);
      expect(plm.getHistory('plm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      plm.create('p1', 10);
      expect(plm.setActive('plm-1', false)).toBe(true);
    });

    it('should set name', () => {
      plm.create('p1', 10);
      expect(plm.setName('plm-1', 'p2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(plm.setActive('unknown', false)).toBe(false);
      expect(plm.setName('unknown', 'p')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      plm.setActive(id, false);
      plm.resetAll();
      expect(plm.getAllocated(id)).toBe(0);
      expect(plm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      plm.create('p1', 10);
      expect(plm.getByName('p1')).toHaveLength(1);
    });

    it('should get active', () => {
      plm.create('p1', 10);
      expect(plm.getActivePools()).toHaveLength(1);
    });

    it('should get inactive', () => {
      plm.create('p1', 10);
      plm.setActive('plm-1', false);
      expect(plm.getInactivePools()).toHaveLength(1);
    });

    it('should get full pools', () => {
      const id = plm.create('p1', 1);
      plm.allocate(id);
      expect(plm.getFullPools()).toHaveLength(1);
    });

    it('should get empty pools', () => {
      plm.create('p1', 10);
      expect(plm.getEmptyPools()).toHaveLength(1);
    });

    it('should get all names', () => {
      plm.create('p1', 10);
      plm.create('p2', 5);
      expect(plm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      plm.create('p1', 10);
      expect(plm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      plm.create('p1', 10);
      expect(plm.getNewest()?.id).toBe('plm-1');
    });

    it('should return null for empty newest', () => {
      expect(plm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      plm.create('p1', 10);
      expect(plm.getOldest()?.id).toBe('plm-1');
    });

    it('should return null for empty oldest', () => {
      expect(plm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      plm.create('p1', 10);
      expect(plm.getCreatedAt('plm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total allocated', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      expect(plm.getTotalAllocated()).toBe(1);
    });

    it('should get total releases', () => {
      const id = plm.create('p1', 10);
      plm.allocate(id);
      plm.release(id);
      expect(plm.getTotalReleases()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many pools', () => {
      for (let i = 0; i < 50; i++) {
        plm.create(`p${i}`, 10);
      }
      expect(plm.getCount()).toBe(50);
    });
  });
});