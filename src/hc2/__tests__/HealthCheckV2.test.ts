/**
 * HealthCheckV2 Tests
 * nanobot-design Health Check v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HealthCheckV2 } from '../HealthCheckV2';

describe('HealthCheckV2', () => {
  let hc: HealthCheckV2;

  beforeEach(() => {
    hc = new HealthCheckV2();
  });

  afterEach(() => {
    hc.clearAll();
  });

  // ============================================================
  // check / recheck / isHealthy
  // ============================================================
  describe('check / recheck / isHealthy', () => {
    it('should check healthy', () => {
      const id = hc.check('node1', 80, 50);
      expect(hc.isHealthy(id)).toBe(true);
    });

    it('should check degraded', () => {
      const id = hc.check('node1', 30, 50);
      expect(hc.isDegraded(id)).toBe(true);
    });

    it('should check unhealthy', () => {
      const id = hc.check('node1', 10, 50);
      expect(hc.isUnhealthy(id)).toBe(true);
    });

    it('should recheck', () => {
      const id = hc.check('node1', 10, 50);
      expect(hc.recheck(id, 80)).toBe(true);
    });

    it('should update status on recheck', () => {
      const id = hc.check('node1', 10, 50);
      hc.recheck(id, 80);
      expect(hc.isHealthy(id)).toBe(true);
    });

    it('should not recheck inactive', () => {
      const id = hc.check('node1', 80, 50);
      hc.setActive(id, false);
      expect(hc.recheck(id, 80)).toBe(false);
    });

    it('should return false for unknown recheck', () => {
      expect(hc.recheck('unknown', 80)).toBe(false);
    });

    it('should increment checks on recheck', () => {
      const id = hc.check('node1', 80, 50);
      hc.recheck(id, 80);
      expect(hc.getCheckCount(id)).toBe(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      hc.check('n1', 80, 50);
      const stats = hc.getStats();
      expect(stats.checks).toBe(1);
    });

    it('should count healthy', () => {
      hc.check('n1', 80, 50);
      expect(hc.getStats().healthy).toBe(1);
    });

    it('should count degraded', () => {
      hc.check('n1', 30, 50);
      expect(hc.getStats().degraded).toBe(1);
    });

    it('should count unhealthy', () => {
      hc.check('n1', 10, 50);
      expect(hc.getStats().unhealthy).toBe(1);
    });

    it('should count total checks', () => {
      const id = hc.check('n1', 80, 50);
      hc.recheck(id, 80);
      expect(hc.getStats().totalChecks).toBe(2);
    });

    it('should compute avg value', () => {
      hc.check('n1', 80, 50);
      expect(hc.getStats().avgValue).toBe(80);
    });

    it('should count active', () => {
      hc.check('n1', 80, 50);
      expect(hc.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = hc.check('n1', 80, 50);
      hc.setActive(id, false);
      expect(hc.getStats().inactive).toBe(1);
    });

    it('should compute healthy rate', () => {
      hc.check('n1', 80, 50);
      hc.check('n2', 80, 50);
      expect(hc.getStats().healthyRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get check', () => {
      hc.check('n1', 80, 50);
      expect(hc.getCheck('hc2-1')?.node).toBe('n1');
    });

    it('should get all', () => {
      hc.check('n1', 80, 50);
      expect(hc.getAllChecks()).toHaveLength(1);
    });

    it('should remove', () => {
      hc.check('n1', 80, 50);
      expect(hc.removeCheck('hc2-1')).toBe(true);
    });

    it('should check existence', () => {
      hc.check('n1', 80, 50);
      expect(hc.hasCheck('hc2-1')).toBe(true);
    });

    it('should count', () => {
      expect(hc.getCount()).toBe(0);
      hc.check('n1', 80, 50);
      expect(hc.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get node', () => {
      hc.check('n1', 80, 50);
      expect(hc.getNode('hc2-1')).toBe('n1');
    });

    it('should get status', () => {
      hc.check('n1', 80, 50);
      expect(hc.getStatus('hc2-1')).toBe('healthy');
    });

    it('should get threshold', () => {
      hc.check('n1', 80, 50);
      expect(hc.getThreshold('hc2-1')).toBe(50);
    });

    it('should get last value', () => {
      hc.check('n1', 80, 50);
      expect(hc.getLastValue('hc2-1')).toBe(80);
    });

    it('should get check count', () => {
      hc.check('n1', 80, 50);
      expect(hc.getCheckCount('hc2-1')).toBe(1);
    });

    it('should get history', () => {
      hc.check('n1', 80, 50);
      expect(hc.getHistory('hc2-1')).toEqual(['healthy']);
    });

    it('should check isActive', () => {
      hc.check('n1', 80, 50);
      expect(hc.isActive('hc2-1')).toBe(true);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isHealthy', () => {
      hc.check('n1', 80, 50);
      expect(hc.isHealthy('hc2-1')).toBe(true);
    });

    it('should check isDegraded', () => {
      hc.check('n1', 30, 50);
      expect(hc.isDegraded('hc2-1')).toBe(true);
    });

    it('should check isUnhealthy', () => {
      hc.check('n1', 10, 50);
      expect(hc.isUnhealthy('hc2-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = hc.check('n1', 80, 50);
      expect(hc.setActive(id, false)).toBe(true);
    });

    it('should set threshold', () => {
      const id = hc.check('n1', 80, 50);
      expect(hc.setThreshold(id, 100)).toBe(true);
    });

    it('should recompute status on threshold change', () => {
      const id = hc.check('n1', 80, 50);
      hc.setThreshold(id, 100);
      expect(hc.isDegraded(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(hc.setActive('unknown', false)).toBe(false);
      expect(hc.setThreshold('unknown', 100)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset checks', () => {
      const id = hc.check('n1', 80, 50);
      hc.recheck(id, 80);
      expect(hc.resetChecks(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(hc.resetChecks('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = hc.check('n1', 80, 50);
      hc.recheck(id, 80);
      hc.setActive(id, false);
      hc.resetAll();
      expect(hc.getCheckCount(id)).toBe(0);
      expect(hc.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by node / status
  // ============================================================
  describe('by node / status', () => {
    it('should get by node', () => {
      hc.check('n1', 80, 50);
      expect(hc.getByNode('n1')).toHaveLength(1);
    });

    it('should get by status', () => {
      hc.check('n1', 80, 50);
      expect(hc.getByStatus('healthy')).toHaveLength(1);
    });

    it('should get healthy', () => {
      hc.check('n1', 80, 50);
      expect(hc.getHealthyChecks()).toHaveLength(1);
    });

    it('should get degraded', () => {
      hc.check('n1', 30, 50);
      expect(hc.getDegradedChecks()).toHaveLength(1);
    });

    it('should get unhealthy', () => {
      hc.check('n1', 10, 50);
      expect(hc.getUnhealthyChecks()).toHaveLength(1);
    });

    it('should get active', () => {
      hc.check('n1', 80, 50);
      expect(hc.getActiveChecks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = hc.check('n1', 80, 50);
      hc.setActive(id, false);
      expect(hc.getInactiveChecks()).toHaveLength(1);
    });

    it('should get all nodes', () => {
      hc.check('n1', 80, 50);
      hc.check('n2', 80, 50);
      expect(hc.getAllNodes()).toHaveLength(2);
    });

    it('should get node count', () => {
      hc.check('n1', 80, 50);
      expect(hc.getNodeCount()).toBe(1);
    });

    it('should get by min checks', () => {
      const id = hc.check('n1', 80, 50);
      hc.recheck(id, 80);
      expect(hc.getByMinChecks(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most checks', () => {
      const id = hc.check('n1', 80, 50);
      hc.recheck(id, 80);
      expect(hc.getMostChecks()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(hc.getMostChecks()).toBeNull();
    });

    it('should get newest', () => {
      hc.check('n1', 80, 50);
      expect(hc.getNewest()?.id).toBe('hc2-1');
    });

    it('should return null for empty newest', () => {
      expect(hc.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      hc.check('n1', 80, 50);
      expect(hc.getOldest()?.id).toBe('hc2-1');
    });

    it('should return null for empty oldest', () => {
      expect(hc.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      hc.check('n1', 80, 50);
      expect(hc.getCreatedAt('hc2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = hc.check('n1', 80, 50);
      hc.recheck(id, 80);
      expect(hc.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many checks', () => {
      for (let i = 0; i < 50; i++) {
        hc.check(`n${i}`, 80, 50);
      }
      expect(hc.getCount()).toBe(50);
    });
  });
});