/**
 * CacheManager Tests
 * thunderbolt-design Cache Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../CacheManager';

describe('CacheManager', () => {
  let cam: CacheManager;

  beforeEach(() => {
    cam = new CacheManager();
  });

  afterEach(() => {
    cam.clearAll();
  });

  // ============================================================
  // set / get / delete / clear / purgeExpired
  // ============================================================
  describe('set / get / delete / clear / purgeExpired', () => {
    it('should set', () => {
      expect(cam.set('k1', 'v1')).toBe('cam-1');
    });

    it('should mark as active', () => {
      const id = cam.set('k1', 'v1');
      expect(cam.isActive(id)).toBe(true);
    });

    it('should get', () => {
      cam.set('k1', 'v1');
      expect(cam.get('k1')).toBe('v1');
    });

    it('should increment hits on get', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getStats().hits).toBe(1);
    });

    it('should return null for missing key', () => {
      expect(cam.get('missing')).toBeNull();
    });

    it('should delete by key', () => {
      cam.set('k1', 'v1');
      expect(cam.delete('k1')).toBe(true);
    });

    it('should return false for unknown delete', () => {
      expect(cam.delete('unknown')).toBe(false);
    });

    it('should delete by id', () => {
      const id = cam.set('k1', 'v1');
      expect(cam.deleteById(id)).toBe(true);
    });

    it('should clear', () => {
      cam.set('k1', 'v1');
      cam.clear();
      expect(cam.getCount()).toBe(0);
    });

    it('should purge expired', () => {
      cam.set('k1', 'v1', -1000);
      cam.purgeExpired();
      expect(cam.getStats().expired).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cam.set('k1', 'v1');
      const stats = cam.getStats();
      expect(stats.items).toBe(1);
    });

    it('should count hits', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getStats().hits).toBe(1);
    });

    it('should count misses', () => {
      cam.get('missing');
      expect(cam.getStats().misses).toBe(1);
    });

    it('should count expired', () => {
      cam.set('k1', 'v1', -1000);
      cam.get('k1');
      expect(cam.getStats().expired).toBe(1);
    });

    it('should count active', () => {
      cam.set('k1', 'v1');
      expect(cam.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cam.set('k1', 'v1');
      cam.setActive(id, false);
      expect(cam.getStats().inactive).toBe(1);
    });

    it('should count total gets', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getStats().totalGets).toBe(1);
    });

    it('should count total sets', () => {
      cam.set('k1', 'v1');
      expect(cam.getStats().totalSets).toBe(1);
    });

    it('should count unique keys', () => {
      cam.set('k1', 'v1');
      cam.set('k1', 'v2');
      expect(cam.getStats().uniqueKeys).toBe(1);
    });

    it('should compute avg hits', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getStats().avgHits).toBe(1);
    });

    it('should get max hits', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      cam.get('k1');
      expect(cam.getStats().maxHits).toBe(2);
    });

    it('should get min hits', () => {
      cam.set('k1', 'v1');
      expect(cam.getStats().minHits).toBe(0);
    });

    it('should compute avg value length', () => {
      cam.set('k1', 'v1');
      expect(cam.getStats().avgValueLength).toBe(2);
    });

    it('should compute hit rate', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getStats().hitRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get item', () => {
      cam.set('k1', 'v1');
      expect(cam.getItem('cam-1')?.key).toBe('k1');
    });

    it('should get all', () => {
      cam.set('k1', 'v1');
      expect(cam.getAllItems()).toHaveLength(1);
    });

    it('should check existence', () => {
      cam.set('k1', 'v1');
      expect(cam.hasItem('cam-1')).toBe(true);
    });

    it('should count', () => {
      expect(cam.getCount()).toBe(0);
      cam.set('k1', 'v1');
      expect(cam.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get key', () => {
      cam.set('k1', 'v1');
      expect(cam.getKey('cam-1')).toBe('k1');
    });

    it('should get value', () => {
      cam.set('k1', 'v1');
      expect(cam.getValue('cam-1')).toBe('v1');
    });

    it('should get value length', () => {
      cam.set('k1', 'v1');
      expect(cam.getValueLength('cam-1')).toBe(2);
    });

    it('should get hits', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getHits('cam-1')).toBe(1);
    });

    it('should get expires', () => {
      cam.set('k1', 'v1', 1000);
      expect(cam.getExpires('cam-1')).toBeGreaterThan(0);
    });

    it('should get history', () => {
      cam.set('k1', 'v1');
      expect(cam.getHistory('cam-1')).toEqual([]);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cam.set('k1', 'v1');
      expect(cam.setActive('cam-1', false)).toBe(true);
    });

    it('should set key', () => {
      cam.set('k1', 'v1');
      expect(cam.setKey('cam-1', 'k2')).toBe(true);
    });

    it('should set value', () => {
      cam.set('k1', 'v1');
      expect(cam.setValue('cam-1', 'v2')).toBe(true);
    });

    it('should set expires', () => {
      cam.set('k1', 'v1');
      expect(cam.setExpires('cam-1', 5000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cam.setActive('unknown', false)).toBe(false);
      expect(cam.setKey('unknown', 'k')).toBe(false);
      expect(cam.setValue('unknown', 'v')).toBe(false);
      expect(cam.setExpires('unknown', 1000)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cam.set('k1', 'v1');
      cam.get('k1');
      cam.setActive(id, false);
      cam.resetAll();
      expect(cam.getHits(id)).toBe(0);
      expect(cam.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by key / state
  // ============================================================
  describe('by key / state', () => {
    it('should get by key', () => {
      cam.set('k1', 'v1');
      expect(cam.getByKey('k1')).toHaveLength(1);
    });

    it('should get active', () => {
      cam.set('k1', 'v1');
      expect(cam.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cam.set('k1', 'v1');
      cam.setActive('cam-1', false);
      expect(cam.getInactiveItems()).toHaveLength(1);
    });

    it('should get all keys', () => {
      cam.set('k1', 'v1');
      cam.set('k2', 'v2');
      expect(cam.getAllKeys()).toHaveLength(2);
    });

    it('should get key count', () => {
      cam.set('k1', 'v1');
      expect(cam.getKeyCount()).toBe(1);
    });

    it('should get by min hits', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getByMinHits(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hits', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      cam.get('k1');
      expect(cam.getMostHits()?.id).toBe('cam-1');
    });

    it('should return null for empty most', () => {
      expect(cam.getMostHits()).toBeNull();
    });

    it('should get newest', () => {
      cam.set('k1', 'v1');
      expect(cam.getNewest()?.id).toBe('cam-1');
    });

    it('should return null for empty newest', () => {
      expect(cam.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cam.set('k1', 'v1');
      expect(cam.getOldest()?.id).toBe('cam-1');
    });

    it('should return null for empty oldest', () => {
      expect(cam.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cam.set('k1', 'v1');
      expect(cam.getCreatedAt('cam-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total gets', () => {
      cam.set('k1', 'v1');
      cam.get('k1');
      expect(cam.getTotalGets()).toBe(1);
    });

    it('should get total sets', () => {
      cam.set('k1', 'v1');
      expect(cam.getTotalSets()).toBe(1);
    });

    it('should get misses', () => {
      cam.get('missing');
      expect(cam.getMisses()).toBe(1);
    });

    it('should get expired count', () => {
      cam.set('k1', 'v1', -1000);
      cam.get('k1');
      expect(cam.getExpiredCount()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many items', () => {
      for (let i = 0; i < 50; i++) {
        cam.set(`k${i}`, `v${i}`);
      }
      expect(cam.getCount()).toBe(50);
    });
  });
});