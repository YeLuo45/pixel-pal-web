/**
 * HealthEngine Tests
 * nanobot-design Health Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HealthEngine } from '../HealthEngine';

describe('HealthEngine', () => {
  let hee: HealthEngine;

  beforeEach(() => {
    hee = new HealthEngine();
  });

  afterEach(() => {
    hee.clearAll();
  });

  describe('addCheck / report / remove', () => {
    it('should add check', () => {
      expect(hee.addCheck('c1')).toMatch(/^hee-/);
    });

    it('should default level to healthy', () => {
      hee.addCheck('c1');
      expect(hee.getLevel(hee.getAllChecks()[0].id)).toBe('healthy');
    });

    it('should default latency to 0', () => {
      hee.addCheck('c1');
      expect(hee.getLatency(hee.getAllChecks()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      hee.addCheck('c1');
      expect(hee.isActive(hee.getAllChecks()[0].id)).toBe(true);
    });

    it('should report', () => {
      const id = hee.addCheck('c1');
      expect(hee.report(id, 'degraded', 50)).toBe(true);
    });

    it('should update level on report', () => {
      const id = hee.addCheck('c1');
      hee.report(id, 'degraded', 50);
      expect(hee.isDegraded(id)).toBe(true);
    });

    it('should not report inactive', () => {
      const id = hee.addCheck('c1');
      hee.setActive(id, false);
      expect(hee.report(id, 'degraded', 50)).toBe(false);
    });

    it('should return false for unknown report', () => {
      expect(hee.report('unknown', 'degraded', 50)).toBe(false);
    });

    it('should remove', () => {
      const id = hee.addCheck('c1');
      expect(hee.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      hee.addCheck('c1');
      expect(hee.getStats().checks).toBe(1);
    });

    it('should count total added', () => {
      hee.addCheck('c1');
      expect(hee.getStats().totalAdded).toBe(1);
    });

    it('should count total reported', () => {
      const id = hee.addCheck('c1');
      hee.report(id, 'degraded', 50);
      expect(hee.getStats().totalReported).toBe(1);
    });

    it('should count healthy', () => {
      hee.addCheck('c1', 'healthy');
      expect(hee.getStats().healthy).toBe(1);
    });

    it('should count degraded', () => {
      hee.addCheck('c1', 'degraded');
      expect(hee.getStats().degraded).toBe(1);
    });

    it('should count unhealthy', () => {
      hee.addCheck('c1', 'unhealthy');
      expect(hee.getStats().unhealthy).toBe(1);
    });

    it('should count critical', () => {
      hee.addCheck('c1', 'critical');
      expect(hee.getStats().critical).toBe(1);
    });

    it('should count active', () => {
      hee.addCheck('c1');
      expect(hee.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = hee.addCheck('c1');
      hee.setActive(id, false);
      expect(hee.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = hee.addCheck('c1');
      hee.report(id, 'degraded', 50);
      expect(hee.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      hee.addCheck('a');
      hee.addCheck('a');
      expect(hee.getStats().uniqueNames).toBe(1);
    });

    it('should count total latency', () => {
      hee.addCheck('c1', 'healthy', 100);
      expect(hee.getStats().totalLatency).toBe(100);
    });
  });

  describe('queries', () => {
    it('should get check', () => {
      const id = hee.addCheck('c1');
      expect(hee.getCheck(id)?.name).toBe('c1');
    });

    it('should get all', () => {
      hee.addCheck('c1');
      expect(hee.getAllChecks()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = hee.addCheck('c1');
      expect(hee.hasCheck(id)).toBe(true);
    });

    it('should count', () => {
      expect(hee.getCount()).toBe(0);
      hee.addCheck('c1');
      expect(hee.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = hee.addCheck('c1');
      expect(hee.getName(id)).toBe('c1');
    });

    it('should get latency', () => {
      const id = hee.addCheck('c1', 'healthy', 100);
      expect(hee.getLatency(id)).toBe(100);
    });

    it('should get hits', () => {
      const id = hee.addCheck('c1');
      hee.report(id, 'degraded', 50);
      expect(hee.getHits(id)).toBe(1);
    });

    it('should check healthy', () => {
      hee.addCheck('c1', 'healthy');
      expect(hee.isHealthy(hee.getAllChecks()[0].id)).toBe(true);
    });

    it('should check degraded', () => {
      hee.addCheck('c1', 'degraded');
      expect(hee.isDegraded(hee.getAllChecks()[0].id)).toBe(true);
    });

    it('should check unhealthy', () => {
      hee.addCheck('c1', 'unhealthy');
      expect(hee.isUnhealthy(hee.getAllChecks()[0].id)).toBe(true);
    });

    it('should check critical', () => {
      hee.addCheck('c1', 'critical');
      expect(hee.isCritical(hee.getAllChecks()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = hee.addCheck('c1');
      expect(hee.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = hee.addCheck('c1');
      expect(hee.setName(id, 'c2')).toBe(true);
    });

    it('should set level', () => {
      const id = hee.addCheck('c1');
      expect(hee.setLevel(id, 'unhealthy')).toBe(true);
    });

    it('should set latency', () => {
      const id = hee.addCheck('c1');
      expect(hee.setLatency(id, 200)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(hee.setActive('unknown', false)).toBe(false);
      expect(hee.setName('unknown', 'c')).toBe(false);
      expect(hee.setLevel('unknown', 'healthy')).toBe(false);
      expect(hee.setLatency('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = hee.addCheck('c1');
      hee.setActive(id, false);
      hee.resetAll();
      expect(hee.isActive(id)).toBe(true);
    });
  });

  describe('by level / state', () => {
    it('should get by level', () => {
      hee.addCheck('c1', 'degraded');
      expect(hee.getByLevel('degraded')).toHaveLength(1);
    });

    it('should get active', () => {
      hee.addCheck('c1');
      expect(hee.getActiveChecks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = hee.addCheck('c1');
      hee.setActive(id, false);
      expect(hee.getInactiveChecks()).toHaveLength(1);
    });

    it('should get all names', () => {
      hee.addCheck('a');
      hee.addCheck('b');
      expect(hee.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      hee.addCheck('c1');
      expect(hee.getNewest()?.name).toBe('c1');
    });

    it('should return null for empty newest', () => {
      expect(hee.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      hee.addCheck('c1');
      expect(hee.getOldest()?.name).toBe('c1');
    });

    it('should return null for empty oldest', () => {
      expect(hee.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = hee.addCheck('c1');
      expect(hee.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = hee.addCheck('c1');
      hee.report(id, 'degraded', 50);
      expect(hee.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      hee.addCheck('c1');
      expect(hee.getTotalAdded()).toBe(1);
    });

    it('should get total reported', () => {
      const id = hee.addCheck('c1');
      hee.report(id, 'degraded', 50);
      expect(hee.getTotalReported()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many checks', () => {
      for (let i = 0; i < 50; i++) {
        hee.addCheck(`c${i}`);
      }
      expect(hee.getCount()).toBe(50);
    });
  });
});