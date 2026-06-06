/**
 * LoadBalancer Tests
 * nanobot-design Load Balancer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LoadBalancer } from '../LoadBalancer';

describe('LoadBalancer', () => {
  let lb: LoadBalancer;

  beforeEach(() => {
    lb = new LoadBalancer();
  });

  afterEach(() => {
    lb.clearAll();
  });

  // ============================================================
  // add / distribute / complete
  // ============================================================
  describe('add / distribute / complete', () => {
    it('should add', () => {
      expect(lb.add('b1', 1)).toBe('lb-1');
    });

    it('should mark as active', () => {
      const id = lb.add('b1', 1);
      expect(lb.isActive(id)).toBe(true);
    });

    it('should distribute to backend', () => {
      const id = lb.add('b1', 1);
      expect(lb.distribute()).toBe(id);
    });

    it('should return empty when no backends', () => {
      expect(lb.distribute()).toBe('');
    });

    it('should not distribute to inactive', () => {
      const id1 = lb.add('b1', 1);
      lb.add('b2', 1);
      lb.setActive(id1, false);
      // both active distribute, but only b2 active
      const result = lb.distribute();
      expect(result).toBe('lb-2');
    });

    it('should return empty when all inactive', () => {
      const id = lb.add('b1', 1);
      lb.setActive(id, false);
      expect(lb.distribute()).toBe('');
    });

    it('should increment requests on distribute', () => {
      const id = lb.add('b1', 1);
      lb.distribute();
      expect(lb.getRequests(id)).toBe(1);
    });

    it('should log history on distribute', () => {
      const id = lb.add('b1', 1);
      lb.distribute();
      expect(lb.getHistory(id)).toHaveLength(1);
    });

    it('should complete', () => {
      const id = lb.add('b1', 1);
      expect(lb.complete(id)).toBe(true);
    });

    it('should not complete inactive', () => {
      const id = lb.add('b1', 1);
      lb.setActive(id, false);
      expect(lb.complete(id)).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(lb.complete('unknown')).toBe(false);
    });
  });

  // ============================================================
  // round-robin strategy
  // ============================================================
  describe('round-robin strategy', () => {
    it('should round-robin', () => {
      const id1 = lb.add('b1', 1);
      const id2 = lb.add('b2', 1);
      expect(lb.distribute()).toBe(id1);
      expect(lb.distribute()).toBe(id2);
    });

    it('should wrap around', () => {
      const id1 = lb.add('b1', 1);
      const id2 = lb.add('b2', 1);
      lb.distribute(); // b1
      lb.distribute(); // b2
      expect(lb.distribute()).toBe(id1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      lb.add('b1', 1);
      const stats = lb.getStats();
      expect(stats.backends).toBe(1);
    });

    it('should count total requests', () => {
      lb.add('b1', 1);
      lb.distribute();
      expect(lb.getStats().totalRequests).toBe(1);
    });

    it('should count active', () => {
      lb.add('b1', 1);
      expect(lb.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = lb.add('b1', 1);
      lb.setActive(id, false);
      expect(lb.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = lb.add('b1', 1);
      lb.distribute();
      expect(lb.getStats().totalHits).toBe(1);
    });

    it('should compute avg requests', () => {
      lb.add('b1', 1);
      lb.distribute();
      expect(lb.getStats().avgRequests).toBe(1);
    });

    it('should compute avg weight', () => {
      lb.add('b1', 5);
      lb.add('b2', 5);
      expect(lb.getStats().avgWeight).toBe(5);
    });

    it('should get max weight', () => {
      lb.add('b1', 1);
      lb.add('b2', 10);
      expect(lb.getStats().maxWeight).toBe(10);
    });

    it('should get min weight', () => {
      lb.add('b1', 1);
      lb.add('b2', 10);
      expect(lb.getStats().minWeight).toBe(1);
    });

    it('should count unique names', () => {
      lb.add('b1', 1);
      lb.add('b2', 1);
      expect(lb.getStats().uniqueNames).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get backend', () => {
      lb.add('b1', 1);
      expect(lb.getBackend('lb-1')?.name).toBe('b1');
    });

    it('should get all', () => {
      lb.add('b1', 1);
      expect(lb.getAllBackends()).toHaveLength(1);
    });

    it('should remove', () => {
      lb.add('b1', 1);
      expect(lb.removeBackend('lb-1')).toBe(true);
    });

    it('should check existence', () => {
      lb.add('b1', 1);
      expect(lb.hasBackend('lb-1')).toBe(true);
    });

    it('should count', () => {
      expect(lb.getCount()).toBe(0);
      lb.add('b1', 1);
      expect(lb.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      lb.add('b1', 1);
      expect(lb.getName('lb-1')).toBe('b1');
    });

    it('should get weight', () => {
      lb.add('b1', 5);
      expect(lb.getWeight('lb-1')).toBe(5);
    });

    it('should get requests', () => {
      lb.add('b1', 1);
      expect(lb.getRequests('lb-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = lb.add('b1', 1);
      lb.distribute();
      expect(lb.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      lb.add('b1', 1);
      expect(lb.getHistory('lb-1')).toEqual([]);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      lb.add('b1', 1);
      expect(lb.setActive('lb-1', false)).toBe(true);
    });

    it('should set name', () => {
      lb.add('b1', 1);
      expect(lb.setName('lb-1', 'b2')).toBe(true);
    });

    it('should set weight', () => {
      lb.add('b1', 1);
      expect(lb.setWeight('lb-1', 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(lb.setActive('unknown', false)).toBe(false);
      expect(lb.setName('unknown', 'b')).toBe(false);
      expect(lb.setWeight('unknown', 1)).toBe(false);
    });
  });

  // ============================================================
  // strategy
  // ============================================================
  describe('strategy', () => {
    it('should set strategy', () => {
      lb.setStrategy('random');
      expect(lb.getStrategy()).toBe('random');
    });

    it('should default to round-robin', () => {
      expect(new LoadBalancer().getStrategy()).toBe('round-robin');
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = lb.add('b1', 1);
      lb.distribute();
      lb.setActive(id, false);
      lb.resetAll();
      expect(lb.getRequests(id)).toBe(0);
      expect(lb.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      lb.add('b1', 1);
      expect(lb.getByName('b1')).toHaveLength(1);
    });

    it('should get active', () => {
      lb.add('b1', 1);
      expect(lb.getActiveBackends()).toHaveLength(1);
    });

    it('should get inactive', () => {
      lb.add('b1', 1);
      lb.setActive('lb-1', false);
      expect(lb.getInactiveBackends()).toHaveLength(1);
    });

    it('should get all names', () => {
      lb.add('b1', 1);
      lb.add('b2', 1);
      expect(lb.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      lb.add('b1', 1);
      expect(lb.getNameCount()).toBe(1);
    });

    it('should get by min weight', () => {
      lb.add('b1', 1);
      lb.add('b2', 5);
      expect(lb.getByMinWeight(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most requests', () => {
      const id = lb.add('b1', 1);
      lb.distribute();
      lb.distribute();
      expect(lb.getMostRequests()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(lb.getMostRequests()).toBeNull();
    });

    it('should get newest', () => {
      lb.add('b1', 1);
      expect(lb.getNewest()?.id).toBe('lb-1');
    });

    it('should return null for empty newest', () => {
      expect(lb.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      lb.add('b1', 1);
      expect(lb.getOldest()?.id).toBe('lb-1');
    });

    it('should return null for empty oldest', () => {
      expect(lb.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      lb.add('b1', 1);
      expect(lb.getCreatedAt('lb-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = lb.add('b1', 1);
      lb.distribute();
      expect(lb.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total requests', () => {
      lb.add('b1', 1);
      lb.distribute();
      expect(lb.getTotalRequests()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many backends', () => {
      for (let i = 0; i < 50; i++) {
        lb.add(`b${i}`, 1);
      }
      expect(lb.getCount()).toBe(50);
    });
  });
});