/**
 * ResourcePool Tests
 * nanobot-design Resource Pool
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResourcePool } from '../ResourcePool';

describe('ResourcePool', () => {
  let pool: ResourcePool;

  beforeEach(() => {
    pool = new ResourcePool();
  });

  afterEach(() => {
    pool.clearAll();
  });

  // ============================================================
  // add / acquire / release
  // ============================================================
  describe('add / acquire / release', () => {
    it('should add', () => {
      expect(pool.add('db', 3)).toBe(true);
    });

    it('should acquire', () => {
      pool.add('db', 3);
      expect(pool.acquire('db')).toMatch(/res-/);
    });

    it('should return null for unknown type', () => {
      expect(pool.acquire('unknown')).toBeNull();
    });

    it('should release', () => {
      pool.add('db', 3);
      const id = pool.acquire('db')!;
      expect(pool.release(id)).toBe(true);
    });

    it('should not release available resource', () => {
      pool.add('db', 3);
      const id = pool.acquire('db')!;
      pool.release(id);
      expect(pool.release(id)).toBe(false);
    });

    it('should return false for unknown release', () => {
      expect(pool.release('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pool.add('db', 3);
      const stats = pool.getStats();
      expect(stats.total).toBe(3);
    });

    it('should count available', () => {
      pool.add('db', 3);
      expect(pool.getStats().available).toBe(3);
    });

    it('should count in use', () => {
      pool.add('db', 3);
      pool.acquire('db');
      expect(pool.getStats().inUse).toBe(1);
    });

    it('should count types', () => {
      pool.add('db', 2);
      pool.add('cache', 2);
      expect(pool.getStats().types).toBe(2);
    });

    it('should count acquires', () => {
      pool.add('db', 3);
      pool.acquire('db');
      expect(pool.getStats().totalAcquires).toBe(1);
    });

    it('should count releases', () => {
      pool.add('db', 3);
      const id = pool.acquire('db')!;
      pool.release(id);
      expect(pool.getStats().totalReleases).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get resource', () => {
      pool.add('db', 1);
      expect(pool.getResource('res-1')?.type).toBe('db');
    });

    it('should get all', () => {
      pool.add('db', 3);
      expect(pool.getAllResources()).toHaveLength(3);
    });

    it('should remove', () => {
      pool.add('db', 1);
      expect(pool.removeResource('res-1')).toBe(true);
    });

    it('should check existence', () => {
      pool.add('db', 1);
      expect(pool.hasResource('res-1')).toBe(true);
    });

    it('should count', () => {
      expect(pool.getCount()).toBe(0);
      pool.add('db', 3);
      expect(pool.getCount()).toBe(3);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get type', () => {
      pool.add('db', 1);
      expect(pool.getType('res-1')).toBe('db');
    });

    it('should check isInUse', () => {
      pool.add('db', 1);
      const id = pool.acquire('db')!;
      expect(pool.isInUse(id)).toBe(true);
    });

    it('should check isAvailable', () => {
      pool.add('db', 1);
      expect(pool.isAvailable('res-1')).toBe(true);
    });

    it('should get acquired', () => {
      pool.add('db', 1);
      pool.acquire('db');
      expect(pool.getAcquired('res-1')).toBe(1);
    });

    it('should get released', () => {
      pool.add('db', 1);
      const id = pool.acquire('db')!;
      pool.release(id);
      expect(pool.getReleased(id)).toBe(1);
    });

    it('should get acquired at', () => {
      pool.add('db', 1);
      pool.acquire('db');
      expect(pool.getAcquiredAt('res-1')).toBeGreaterThan(0);
    });

    it('should get created at', () => {
      pool.add('db', 1);
      expect(pool.getCreatedAt('res-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // by type
  // ============================================================
  describe('by type', () => {
    it('should get by type', () => {
      pool.add('db', 3);
      expect(pool.getByType('db')).toHaveLength(3);
    });

    it('should count by type', () => {
      pool.add('db', 3);
      expect(pool.getByTypeCount('db')).toBe(3);
    });

    it('should get available', () => {
      pool.add('db', 3);
      expect(pool.getAvailable('db')).toHaveLength(3);
    });

    it('should get in use', () => {
      pool.add('db', 3);
      pool.acquire('db');
      expect(pool.getInUse('db')).toHaveLength(1);
    });

    it('should count available', () => {
      pool.add('db', 3);
      expect(pool.getAvailableCount('db')).toBe(3);
    });

    it('should count in use', () => {
      pool.add('db', 3);
      pool.acquire('db');
      expect(pool.getInUseCount('db')).toBe(1);
    });
  });

  // ============================================================
  // types
  // ============================================================
  describe('types', () => {
    it('should get all types', () => {
      pool.add('db', 2);
      pool.add('cache', 2);
      expect(pool.getAllTypes()).toHaveLength(2);
    });

    it('should get type count', () => {
      pool.add('db', 2);
      pool.add('cache', 2);
      expect(pool.getTypeCount()).toBe(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most used', () => {
      pool.add('db', 2);
      pool.acquire('db');
      expect(pool.getMostUsed()?.acquired).toBe(1);
    });

    it('should return null for empty most', () => {
      expect(pool.getMostUsed()).toBeNull();
    });

    it('should get most released', () => {
      pool.add('db', 1);
      const id = pool.acquire('db')!;
      pool.release(id);
      expect(pool.getMostReleased()?.id).toBe(id);
    });

    it('should return null for empty most released', () => {
      expect(pool.getMostReleased()).toBeNull();
    });

    it('should get oldest', () => {
      pool.add('db', 2);
      expect(pool.getOldest()?.id).toBe('res-1');
    });

    it('should return null for empty oldest', () => {
      expect(pool.getOldest()).toBeNull();
    });

    it('should get newest', () => {
      pool.add('db', 2);
      // Both have same created timestamp; just verify it returns one
      expect(['res-1', 'res-2']).toContain(pool.getNewest()?.id);
    });

    it('should return null for empty newest', () => {
      expect(pool.getNewest()).toBeNull();
    });
  });

  // ============================================================
  // force release
  // ============================================================
  describe('force release', () => {
    it('should force release', () => {
      pool.add('db', 1);
      const id = pool.acquire('db')!;
      expect(pool.forceRelease(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pool.forceRelease('unknown')).toBe(false);
    });

    it('should force release all', () => {
      pool.add('db', 3);
      pool.acquire('db');
      pool.acquire('db');
      expect(pool.forceReleaseAll()).toBe(2);
    });
  });

  // ============================================================
  // utilization
  // ============================================================
  describe('utilization', () => {
    it('should get utilization', () => {
      pool.add('db', 4);
      pool.acquire('db');
      pool.acquire('db');
      expect(pool.getUtilization()).toBe(0.5);
    });

    it('should return 0 for empty', () => {
      expect(pool.getUtilization()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many resources', () => {
      pool.add('db', 50);
      expect(pool.getCount()).toBe(50);
    });
  });
});