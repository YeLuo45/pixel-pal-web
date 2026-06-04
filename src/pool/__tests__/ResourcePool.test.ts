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
  // addResource
  // ============================================================
  describe('addResource', () => {
    it('should add resource', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      expect(pool.getResourceCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const r = { id: 'r1', type: 'cpu', inUse: false };
      pool.addResource(r);
      r.inUse = true;
      expect(pool.getResource('r1')?.inUse).toBe(false);
    });
  });

  // ============================================================
  // acquire
  // ============================================================
  describe('acquire', () => {
    it('should acquire available resource', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      const resource = pool.acquire('cpu');
      expect(resource).not.toBeNull();
      expect(resource?.inUse).toBe(true);
    });

    it('should return null when no available', () => {
      expect(pool.acquire('cpu')).toBeNull();
    });

    it('should return null when type not found', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      expect(pool.acquire('memory')).toBeNull();
    });

    it('should skip in-use resources', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: true });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: false });
      const resource = pool.acquire('cpu');
      expect(resource?.id).toBe('r2');
    });

    it('should mark resource as in-use', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.acquire('cpu');
      expect(pool.getResource('r1')?.inUse).toBe(true);
    });
  });

  // ============================================================
  // release
  // ============================================================
  describe('release', () => {
    it('should release acquired resource', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.acquire('cpu');
      expect(pool.release('r1')).toBe(true);
      expect(pool.getResource('r1')?.inUse).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(pool.release('unknown')).toBe(false);
    });

    it('should return false for not in use', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      expect(pool.release('r1')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: true });
      const stats = pool.getStats();
      expect(stats.total).toBe(2);
      expect(stats.inUse).toBe(1);
      expect(stats.available).toBe(1);
    });

    it('should include byType', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'memory', inUse: false });
      const stats = pool.getStats();
      expect(stats.byType['cpu']).toBeDefined();
      expect(stats.byType['memory']).toBeDefined();
    });
  });

  // ============================================================
  // getUtilization
  // ============================================================
  describe('getUtilization', () => {
    it('should return 0 for empty', () => {
      expect(pool.getUtilization()).toBe(0);
    });

    it('should calculate utilization', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: true });
      expect(pool.getUtilization()).toBe(0.5);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get resources by type', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'memory', inUse: false });
      expect(pool.getResourcesByType('cpu')).toHaveLength(1);
    });

    it('should get available resources', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: true });
      expect(pool.getAvailableResources()).toHaveLength(1);
    });

    it('should get in-use resources', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: true });
      expect(pool.getInUseResources()).toHaveLength(1);
    });

    it('should filter by type', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'memory', inUse: false });
      expect(pool.getAvailableResources('cpu')).toHaveLength(1);
    });
  });

  // ============================================================
  // counts
  // ============================================================
  describe('counts', () => {
    it('should get type count', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: false });
      expect(pool.getTypeCount('cpu')).toBe(2);
    });

    it('should get available count', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: true });
      expect(pool.getAvailableCount('cpu')).toBe(1);
    });

    it('should get in-use count', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: true });
      expect(pool.getInUseCount('cpu')).toBe(1);
    });

    it('should get all types', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'memory', inUse: false });
      expect(pool.getAllTypes()).toHaveLength(2);
    });
  });

  // ============================================================
  // getTypeUtilization
  // ============================================================
  describe('getTypeUtilization', () => {
    it('should return 0 for empty', () => {
      expect(pool.getTypeUtilization('cpu')).toBe(0);
    });

    it('should calculate type utilization', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.addResource({ id: 'r2', type: 'cpu', inUse: true });
      expect(pool.getTypeUtilization('cpu')).toBe(0.5);
    });
  });

  // ============================================================
  // counters
  // ============================================================
  describe('counters', () => {
    it('should count acquire', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.acquire('cpu');
      expect(pool.getAcquireCount()).toBe(1);
    });

    it('should count release', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.acquire('cpu');
      pool.release('r1');
      expect(pool.getReleaseCount()).toBe(1);
    });

    it('should reset counters', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      pool.acquire('cpu');
      pool.resetCounters();
      expect(pool.getAcquireCount()).toBe(0);
    });
  });

  // ============================================================
  // isExhausted
  // ============================================================
  describe('isExhausted', () => {
    it('should return true when no available', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: true });
      expect(pool.isExhausted('cpu')).toBe(true);
    });

    it('should return false when available', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      expect(pool.isExhausted('cpu')).toBe(false);
    });
  });

  // ============================================================
  // has / remove
  // ============================================================
  describe('has / remove', () => {
    it('should check existence', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      expect(pool.hasResource('r1')).toBe(true);
    });

    it('should remove resource', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      expect(pool.removeResource('r1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pool.removeResource('unknown')).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many resources', () => {
      for (let i = 0; i < 100; i++) {
        pool.addResource({ id: `r${i}`, type: 'cpu', inUse: false });
      }
      expect(pool.getResourceCount()).toBe(100);
    });

    it('should handle multiple acquire/release cycles', () => {
      pool.addResource({ id: 'r1', type: 'cpu', inUse: false });
      for (let i = 0; i < 10; i++) {
        const r = pool.acquire('cpu');
        if (r) pool.release(r.id);
      }
      expect(pool.getResource('r1')?.inUse).toBe(false);
    });
  });
});