/**
 * ThrottleManager Tests
 * thunderbolt-design Throttle Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThrottleManager } from '../ThrottleManager';

describe('ThrottleManager', () => {
  let thm: ThrottleManager;

  beforeEach(() => {
    thm = new ThrottleManager();
  });

  afterEach(() => {
    thm.clearAll();
  });

  // ============================================================
  // create / acquire / release / reset / remove
  // ============================================================
  describe('create / acquire / release / reset / remove', () => {
    it('should create', () => {
      expect(thm.create('t1', 10)).toBe('thm-1');
    });

    it('should mark as active', () => {
      const id = thm.create('t1', 10);
      expect(thm.isActive(id)).toBe(true);
    });

    it('should default limit to 10', () => {
      const id = thm.create('t1');
      expect(thm.getLimit(id)).toBe(10);
    });

    it('should acquire', () => {
      const id = thm.create('t1', 10);
      expect(thm.acquire(id)).toBe(true);
    });

    it('should increment acquired on acquire', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getAcquired(id)).toBe(1);
    });

    it('should not acquire beyond limit', () => {
      const id = thm.create('t1', 1);
      thm.acquire(id);
      expect(thm.acquire(id)).toBe(false);
    });

    it('should not acquire inactive', () => {
      const id = thm.create('t1', 10);
      thm.setActive(id, false);
      expect(thm.acquire(id)).toBe(false);
    });

    it('should return false for unknown acquire', () => {
      expect(thm.acquire('unknown')).toBe(false);
    });

    it('should release', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.release(id)).toBe(true);
    });

    it('should decrement acquired on release', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      thm.release(id);
      expect(thm.getAcquired(id)).toBe(0);
    });

    it('should not release to negative', () => {
      const id = thm.create('t1', 10);
      expect(thm.release(id)).toBe(false);
    });

    it('should return false for unknown release', () => {
      expect(thm.release('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      thm.reset(id);
      expect(thm.getAcquired(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(thm.reset('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = thm.create('t1', 10);
      expect(thm.remove(id)).toBe(true);
    });

    it('should get available', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getAvailable(id)).toBe(9);
    });

    it('should not go negative on available', () => {
      const id = thm.create('t1', 1);
      thm.acquire(id);
      expect(thm.getAvailable(id)).toBe(0);
    });

    it('should return 0 for unknown available', () => {
      expect(thm.getAvailable('unknown')).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      thm.create('t1', 10);
      const stats = thm.getStats();
      expect(stats.throttles).toBe(1);
    });

    it('should count total acquired', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getStats().totalAcquired).toBe(1);
    });

    it('should count total released', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      thm.release(id);
      expect(thm.getStats().totalReleased).toBe(1);
    });

    it('should count active', () => {
      thm.create('t1', 10);
      expect(thm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = thm.create('t1', 10);
      thm.setActive(id, false);
      expect(thm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      thm.create('t1', 10);
      thm.create('t2', 10);
      expect(thm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg limit', () => {
      thm.create('t1', 10);
      expect(thm.getStats().avgLimit).toBe(10);
    });

    it('should get max limit', () => {
      thm.create('t1', 5);
      thm.create('t2', 10);
      expect(thm.getStats().maxLimit).toBe(10);
    });

    it('should get min limit', () => {
      thm.create('t1', 5);
      thm.create('t2', 10);
      expect(thm.getStats().minLimit).toBe(5);
    });

    it('should compute avg acquired', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getStats().avgAcquired).toBe(1);
    });

    it('should get max acquired', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      thm.acquire(id);
      expect(thm.getStats().maxAcquired).toBe(2);
    });

    it('should get min acquired', () => {
      thm.create('t1', 10);
      expect(thm.getStats().minAcquired).toBe(0);
    });

    it('should compute total available', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getStats().totalAvailable).toBe(9);
    });

    it('should compute utilization rate', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getStats().utilizationRate).toBe(0.1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get throttle', () => {
      thm.create('t1', 10);
      expect(thm.getThrottle('thm-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      thm.create('t1', 10);
      expect(thm.getAllThrottles()).toHaveLength(1);
    });

    it('should check existence', () => {
      thm.create('t1', 10);
      expect(thm.hasThrottle('thm-1')).toBe(true);
    });

    it('should count', () => {
      expect(thm.getCount()).toBe(0);
      thm.create('t1', 10);
      expect(thm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      thm.create('t1', 10);
      expect(thm.getName('thm-1')).toBe('t1');
    });

    it('should get limit', () => {
      thm.create('t1', 10);
      expect(thm.getLimit('thm-1')).toBe(10);
    });

    it('should get history', () => {
      thm.create('t1', 10);
      expect(thm.getHistory('thm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      thm.create('t1', 10);
      expect(thm.setActive('thm-1', false)).toBe(true);
    });

    it('should set limit', () => {
      thm.create('t1', 10);
      expect(thm.setLimit('thm-1', 20)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(thm.setActive('unknown', false)).toBe(false);
      expect(thm.setLimit('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      thm.setActive(id, false);
      thm.resetAll();
      expect(thm.getAcquired(id)).toBe(0);
      expect(thm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      thm.create('t1', 10);
      expect(thm.getByName('t1')).toHaveLength(1);
    });

    it('should get active', () => {
      thm.create('t1', 10);
      expect(thm.getActiveThrottles()).toHaveLength(1);
    });

    it('should get inactive', () => {
      thm.create('t1', 10);
      thm.setActive('thm-1', false);
      expect(thm.getInactiveThrottles()).toHaveLength(1);
    });

    it('should get at limit', () => {
      const id = thm.create('t1', 1);
      thm.acquire(id);
      expect(thm.getAtLimitThrottles()).toHaveLength(1);
    });

    it('should get all names', () => {
      thm.create('t1', 10);
      thm.create('t2', 10);
      expect(thm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      thm.create('t1', 10);
      expect(thm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      thm.create('t1', 10);
      expect(thm.getNewest()?.id).toBe('thm-1');
    });

    it('should return null for empty newest', () => {
      expect(thm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      thm.create('t1', 10);
      expect(thm.getOldest()?.id).toBe('thm-1');
    });

    it('should return null for empty oldest', () => {
      expect(thm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      thm.create('t1', 10);
      expect(thm.getCreatedAt('thm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total acquired', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      expect(thm.getTotalAcquired()).toBe(1);
    });

    it('should get total released', () => {
      const id = thm.create('t1', 10);
      thm.acquire(id);
      thm.release(id);
      expect(thm.getTotalReleased()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many throttles', () => {
      for (let i = 0; i < 50; i++) {
        thm.create(`t${i}`, 10);
      }
      expect(thm.getCount()).toBe(50);
    });
  });
});