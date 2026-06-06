/**
 * CacheEngine Tests
 * thunderbolt-design Cache Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheEngine } from '../CacheEngine';

describe('CacheEngine', () => {
  let ce: CacheEngine;

  beforeEach(() => {
    ce = new CacheEngine();
  });

  afterEach(() => {
    ce.clearAll();
  });

  // ============================================================
  // set / get / has / delete
  // ============================================================
  describe('set / get / has / delete', () => {
    it('should set', () => {
      expect(ce.set('k1', 'v1')).toBe(true);
    });

    it('should get', () => {
      ce.set('k1', 'v1');
      expect(ce.get('k1')).toBe('v1');
    });

    it('should return undefined for missing', () => {
      expect(ce.get('unknown')).toBeUndefined();
    });

    it('should overwrite', () => {
      ce.set('k1', 'v1');
      ce.set('k1', 'v2');
      expect(ce.get('k1')).toBe('v2');
    });

    it('should has', () => {
      ce.set('k1', 'v1');
      expect(ce.has('k1')).toBe(true);
    });

    it('should not has missing', () => {
      expect(ce.has('unknown')).toBe(false);
    });

    it('should delete', () => {
      ce.set('k1', 'v1');
      expect(ce.delete('k1')).toBe(true);
    });

    it('should not delete missing', () => {
      expect(ce.delete('unknown')).toBe(false);
    });

    it('should clear', () => {
      ce.set('k1', 'v1');
      ce.clear();
      expect(ce.getCount()).toBe(0);
    });

    it('should set with ttl', () => {
      expect(ce.set('k1', 'v1', 1000)).toBe(true);
    });

    it('should get with ttl', () => {
      ce.set('k1', 'v1', 1000);
      expect(ce.get('k1')).toBe('v1');
    });

    it('should return undefined for expired', async () => {
      ce.set('k1', 'v1', 1);
      await new Promise(r => setTimeout(r, 10));
      expect(ce.get('k1')).toBeUndefined();
    });

    it('should has return false for expired', async () => {
      ce.set('k1', 'v1', 1);
      await new Promise(r => setTimeout(r, 10));
      expect(ce.has('k1')).toBe(false);
    });

    it('should purge expired', async () => {
      ce.set('k1', 'v1', 1);
      ce.set('k2', 'v2', 0);
      await new Promise(r => setTimeout(r, 10));
      expect(ce.purgeExpired()).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ce.set('k1', 'v1');
      const stats = ce.getStats();
      expect(stats.keys).toBe(1);
    });

    it('should count total hits', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      expect(ce.getStats().totalHits).toBe(1);
    });

    it('should count total sets', () => {
      ce.set('k1', 'v1');
      ce.set('k2', 'v2');
      expect(ce.getStats().totalSets).toBe(2);
    });

    it('should count total deletes', () => {
      ce.set('k1', 'v1');
      ce.delete('k1');
      expect(ce.getStats().totalDeletes).toBe(1);
    });

    it('should count active', () => {
      ce.set('k1', 'v1');
      expect(ce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      ce.set('k1', 'v1');
      ce.setActive('k1', false);
      expect(ce.getStats().inactive).toBe(1);
    });

    it('should compute hit rate', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      expect(ce.getStats().hitRate).toBe(1);
    });

    it('should compute avg hits', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      expect(ce.getStats().avgHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      ce.set('k1', 'v1');
      expect(ce.getEntry('k1')?.value).toBe('v1');
    });

    it('should get all', () => {
      ce.set('k1', 'v1');
      expect(ce.getAllEntries()).toHaveLength(1);
    });

    it('should get value', () => {
      ce.set('k1', 'v1');
      expect(ce.getValue('k1')).toBe('v1');
    });

    it('should get hits', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      expect(ce.getHits('k1')).toBe(1);
    });

    it('should get expires', () => {
      ce.set('k1', 'v1', 1000);
      expect(ce.getExpires('k1')).toBeGreaterThan(0);
    });

    it('should count', () => {
      expect(ce.getCount()).toBe(0);
      ce.set('k1', 'v1');
      expect(ce.getCount()).toBe(1);
    });

    it('should isActive', () => {
      ce.set('k1', 'v1');
      expect(ce.isActive('k1')).toBe(true);
    });

    it('should isExpired for no-ttl', () => {
      ce.set('k1', 'v1', 0);
      expect(ce.isExpired('k1')).toBe(false);
    });

    it('should isExpired for ttl', async () => {
      ce.set('k1', 'v1', 1);
      await new Promise(r => setTimeout(r, 10));
      expect(ce.isExpired('k1')).toBe(true);
    });

    it('should isExpired false for missing', () => {
      expect(ce.isExpired('unknown')).toBe(false);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ce.set('k1', 'v1');
      expect(ce.setActive('k1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ce.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      ce.set('k1', 'v1');
      expect(ce.touch('k1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ce.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      ce.setActive('k1', false);
      ce.resetAll();
      expect(ce.getHits('k1')).toBe(0);
      expect(ce.isActive('k1')).toBe(true);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get by min hits', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      expect(ce.getByMinHits(1)).toHaveLength(1);
    });

    it('should get most hits', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      expect(ce.getMostHits()?.key).toBe('k1');
    });

    it('should return null for empty most', () => {
      expect(ce.getMostHits()).toBeNull();
    });

    it('should get newest', () => {
      ce.set('k1', 'v1');
      expect(ce.getNewest()?.key).toBe('k1');
    });

    it('should return null for empty newest', () => {
      expect(ce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ce.set('k1', 'v1');
      expect(ce.getOldest()?.key).toBe('k1');
    });

    it('should return null for empty oldest', () => {
      expect(ce.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ce.set('k1', 'v1');
      expect(ce.getCreatedAt('k1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      expect(ce.getUpdatedAt('k1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // keys
  // ============================================================
  describe('keys', () => {
    it('should get all keys', () => {
      ce.set('k1', 'v1');
      ce.set('k2', 'v2');
      expect(ce.getAllKeys()).toHaveLength(2);
    });

    it('should get key count', () => {
      ce.set('k1', 'v1');
      expect(ce.getKeyCount()).toBe(1);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total sets', () => {
      ce.set('k1', 'v1');
      expect(ce.getTotalSets()).toBe(1);
    });

    it('should get total deletes', () => {
      ce.set('k1', 'v1');
      ce.delete('k1');
      expect(ce.getTotalDeletes()).toBe(1);
    });

    it('should get total expired', () => {
      ce.set('k1', 'v1', 1);
      setTimeout(() => {}, 5);
      expect(ce.getTotalExpired()).toBe(0);
    });

    it('should get total hits', () => {
      ce.set('k1', 'v1');
      ce.get('k1');
      expect(ce.getTotalHits()).toBe(1);
    });
  });

  // ============================================================
  // batch
  // ============================================================
  describe('batch', () => {
    it('should has many', () => {
      ce.set('k1', 'v1');
      ce.set('k2', 'v2');
      expect(ce.hasMany(['k1', 'k2'])).toBe(true);
    });

    it('should not has many when one missing', () => {
      ce.set('k1', 'v1');
      expect(ce.hasMany(['k1', 'k2'])).toBe(false);
    });

    it('should get many', () => {
      ce.set('k1', 'v1');
      ce.set('k2', 'v2');
      const r = ce.getMany(['k1', 'k2']);
      expect(r.k1).toBe('v1');
      expect(r.k2).toBe('v2');
    });

    it('should set many', () => {
      expect(ce.setMany([['k1', 'v1'], ['k2', 'v2']])).toBe(2);
    });

    it('should delete many', () => {
      ce.set('k1', 'v1');
      ce.set('k2', 'v2');
      expect(ce.deleteMany(['k1', 'k2'])).toBe(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many keys', () => {
      for (let i = 0; i < 50; i++) {
        ce.set(`k${i}`, `v${i}`);
      }
      expect(ce.getCount()).toBe(50);
    });
  });
});