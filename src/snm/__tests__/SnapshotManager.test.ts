/**
 * SnapshotManager Tests
 * thunderbolt-design Snapshot Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SnapshotManager } from '../SnapshotManager';

describe('SnapshotManager', () => {
  let snm: SnapshotManager;

  beforeEach(() => {
    snm = new SnapshotManager();
  });

  afterEach(() => {
    snm.clearAll();
  });

  // ============================================================
  // create / restore / delete
  // ============================================================
  describe('create / restore / delete', () => {
    it('should create', () => {
      expect(snm.create('snap1', 'data1')).toBe('snm-1');
    });

    it('should mark as active', () => {
      const id = snm.create('snap1', 'data1');
      expect(snm.isActive(id)).toBe(true);
    });

    it('should restore', () => {
      const id = snm.create('snap1', 'data1');
      expect(snm.restore(id)).toBe('data1');
    });

    it('should not restore inactive', () => {
      const id = snm.create('snap1', 'data1');
      snm.setActive(id, false);
      expect(snm.restore(id)).toBeNull();
    });

    it('should return null for unknown restore', () => {
      expect(snm.restore('unknown')).toBeNull();
    });

    it('should delete', () => {
      const id = snm.create('snap1', 'data1');
      expect(snm.delete(id)).toBe(true);
    });

    it('should return false for unknown delete', () => {
      expect(snm.delete('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      snm.create('snap1', 'data1');
      const stats = snm.getStats();
      expect(stats.snapshots).toBe(1);
    });

    it('should count total restores', () => {
      const id = snm.create('snap1', 'data1');
      snm.restore(id);
      expect(snm.getStats().totalRestores).toBe(1);
    });

    it('should count total deletes', () => {
      const id = snm.create('snap1', 'data1');
      snm.delete(id);
      expect(snm.getStats().totalDeletes).toBe(1);
    });

    it('should count active', () => {
      snm.create('snap1', 'data1');
      expect(snm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = snm.create('snap1', 'data1');
      snm.setActive(id, false);
      expect(snm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = snm.create('snap1', 'data1');
      snm.restore(id);
      expect(snm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      snm.create('a', 'd');
      snm.create('b', 'd');
      expect(snm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg size', () => {
      snm.create('a', 'hello');
      expect(snm.getStats().avgSize).toBe(5);
    });

    it('should get max size', () => {
      snm.create('a', 'hi');
      snm.create('b', 'hello');
      expect(snm.getStats().maxSize).toBe(5);
    });

    it('should get min size', () => {
      snm.create('a', 'hi');
      snm.create('b', 'hello');
      expect(snm.getStats().minSize).toBe(2);
    });

    it('should compute total size', () => {
      snm.create('a', 'hi');
      snm.create('b', 'hello');
      expect(snm.getStats().totalSize).toBe(7);
    });

    it('should count unique data', () => {
      snm.create('a', 'd');
      snm.create('b', 'd');
      expect(snm.getStats().uniqueData).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get snapshot', () => {
      snm.create('snap1', 'data1');
      expect(snm.getSnapshot('snm-1')?.name).toBe('snap1');
    });

    it('should get all', () => {
      snm.create('snap1', 'data1');
      expect(snm.getAllSnapshots()).toHaveLength(1);
    });

    it('should check existence', () => {
      snm.create('snap1', 'data1');
      expect(snm.hasSnapshot('snm-1')).toBe(true);
    });

    it('should count', () => {
      expect(snm.getCount()).toBe(0);
      snm.create('snap1', 'data1');
      expect(snm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      snm.create('snap1', 'data1');
      expect(snm.getName('snm-1')).toBe('snap1');
    });

    it('should get data', () => {
      snm.create('snap1', 'data1');
      expect(snm.getData('snm-1')).toBe('data1');
    });

    it('should get size', () => {
      snm.create('snap1', 'data1');
      expect(snm.getSize('snm-1')).toBe(5);
    });

    it('should get history', () => {
      snm.create('snap1', 'data1');
      expect(snm.getHistory('snm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = snm.create('snap1', 'data1');
      snm.restore(id);
      expect(snm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      snm.create('snap1', 'data1');
      expect(snm.setActive('snm-1', false)).toBe(true);
    });

    it('should set name', () => {
      snm.create('snap1', 'data1');
      expect(snm.setName('snm-1', 'snap2')).toBe(true);
    });

    it('should set data', () => {
      snm.create('snap1', 'data1');
      expect(snm.setData('snm-1', 'data2')).toBe(true);
    });

    it('should update size on setData', () => {
      const id = snm.create('snap1', 'data1');
      snm.setData(id, 'data22');
      expect(snm.getSize(id)).toBe(6);
    });

    it('should return false for unknown', () => {
      expect(snm.setActive('unknown', false)).toBe(false);
      expect(snm.setName('unknown', 's')).toBe(false);
      expect(snm.setData('unknown', 'd')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = snm.create('snap1', 'data1');
      snm.restore(id);
      snm.setActive(id, false);
      snm.resetAll();
      expect(snm.getHits(id)).toBe(0);
      expect(snm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      snm.create('snap1', 'data1');
      expect(snm.getByName('snap1')).toHaveLength(1);
    });

    it('should get active', () => {
      snm.create('snap1', 'data1');
      expect(snm.getActiveSnapshots()).toHaveLength(1);
    });

    it('should get inactive', () => {
      snm.create('snap1', 'data1');
      snm.setActive('snm-1', false);
      expect(snm.getInactiveSnapshots()).toHaveLength(1);
    });

    it('should get all names', () => {
      snm.create('a', 'd');
      snm.create('b', 'd');
      expect(snm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      snm.create('a', 'd');
      expect(snm.getNameCount()).toBe(1);
    });

    it('should get by min size', () => {
      snm.create('a', 'hello');
      expect(snm.getByMinSize(5)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get largest', () => {
      snm.create('a', 'hello');
      expect(snm.getLargest()?.id).toBe('snm-1');
    });

    it('should return null for empty largest', () => {
      expect(snm.getLargest()).toBeNull();
    });

    it('should get newest', () => {
      snm.create('a', 'd');
      expect(snm.getNewest()?.id).toBe('snm-1');
    });

    it('should return null for empty newest', () => {
      expect(snm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      snm.create('a', 'd');
      expect(snm.getOldest()?.id).toBe('snm-1');
    });

    it('should return null for empty oldest', () => {
      expect(snm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      snm.create('a', 'd');
      expect(snm.getCreatedAt('snm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = snm.create('a', 'd');
      snm.setData(id, 'd2');
      expect(snm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total restores', () => {
      const id = snm.create('a', 'd');
      snm.restore(id);
      expect(snm.getTotalRestores()).toBe(1);
    });

    it('should get total deletes', () => {
      const id = snm.create('a', 'd');
      snm.delete(id);
      expect(snm.getTotalDeletes()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many snapshots', () => {
      for (let i = 0; i < 50; i++) {
        snm.create(`s${i}`, `d${i}`);
      }
      expect(snm.getCount()).toBe(50);
    });
  });
});