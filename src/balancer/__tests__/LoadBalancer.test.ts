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
  // addBackend
  // ============================================================
  describe('addBackend', () => {
    it('should add backend', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      expect(lb.getBackendCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const b = { id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 };
      lb.addBackend(b);
      b.weight = 100;
      expect(lb.getBackend('b1')?.weight).toBe(1);
    });
  });

  // ============================================================
  // select
  // ============================================================
  describe('select - round-robin', () => {
    it('should select healthy backend', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 1, healthy: true, activeConnections: 0 });
      const selected = lb.select('round-robin');
      expect(selected).not.toBeNull();
    });

    it('should cycle through backends', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 1, healthy: true, activeConnections: 0 });
      const ids = new Set();
      for (let i = 0; i < 4; i++) {
        ids.add(lb.select('round-robin')?.id);
      }
      expect(ids.size).toBe(2);
    });

    it('should skip unhealthy', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: false, activeConnections: 0 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 1, healthy: true, activeConnections: 0 });
      expect(lb.select('round-robin')?.id).toBe('b2');
    });

    it('should return null for no healthy', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: false, activeConnections: 0 });
      expect(lb.select('round-robin')).toBeNull();
    });
  });

  // ============================================================
  // select - weighted
  // ============================================================
  describe('select - weighted', () => {
    it('should select by weight', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 10, healthy: true, activeConnections: 0 });
      let count1 = 0;
      let count2 = 0;
      for (let i = 0; i < 100; i++) {
        const selected = lb.select('weighted');
        if (selected?.id === 'b1') count1++;
        if (selected?.id === 'b2') count2++;
      }
      expect(count2).toBeGreaterThan(count1);
    });
  });

  // ============================================================
  // select - least-connections
  // ============================================================
  describe('select - least-connections', () => {
    it('should select least connections', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 10 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 1, healthy: true, activeConnections: 2 });
      expect(lb.select('least-connections')?.id).toBe('b2');
    });
  });

  // ============================================================
  // connections
  // ============================================================
  describe('connections', () => {
    it('should increment connections', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.incrementConnections('b1');
      expect(lb.getActiveConnections('b1')).toBe(1);
    });

    it('should decrement connections', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 5 });
      lb.decrementConnections('b1');
      expect(lb.getActiveConnections('b1')).toBe(4);
    });

    it('should clamp to 0', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.decrementConnections('b1');
      expect(lb.getActiveConnections('b1')).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(lb.incrementConnections('unknown')).toBe(false);
      expect(lb.decrementConnections('unknown')).toBe(false);
    });

    it('should sum total active connections', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 5 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 1, healthy: true, activeConnections: 3 });
      expect(lb.getTotalActiveConnections()).toBe(8);
    });
  });

  // ============================================================
  // markHealthy / markUnhealthy
  // ============================================================
  describe('health', () => {
    it('should mark healthy', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: false, activeConnections: 0 });
      expect(lb.markHealthy('b1')).toBe(true);
      expect(lb.getBackend('b1')?.healthy).toBe(true);
    });

    it('should mark unhealthy', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      expect(lb.markUnhealthy('b1')).toBe(true);
      expect(lb.getBackend('b1')?.healthy).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(lb.markHealthy('unknown')).toBe(false);
      expect(lb.markUnhealthy('unknown')).toBe(false);
    });
  });

  // ============================================================
  // canServe
  // ============================================================
  describe('canServe', () => {
    it('should return true for healthy with capacity', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 5 });
      expect(lb.canServe('b1')).toBe(true);
    });

    it('should return false for unhealthy', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: false, activeConnections: 0 });
      expect(lb.canServe('b1')).toBe(false);
    });

    it('should return false for overloaded', () => {
      lb.setMaxConnections(5);
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 5 });
      expect(lb.canServe('b1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(lb.canServe('unknown')).toBe(false);
    });
  });

  // ============================================================
  // remove / has / count
  // ============================================================
  describe('remove / has / count', () => {
    it('should remove backend', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      expect(lb.removeBackend('b1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(lb.removeBackend('unknown')).toBe(false);
    });

    it('should check backend existence', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      expect(lb.hasBackend('b1')).toBe(true);
    });
  });

  // ============================================================
  // getHealthyBackends
  // ============================================================
  describe('getHealthyBackends', () => {
    it('should return only healthy', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 1, healthy: false, activeConnections: 0 });
      expect(lb.getHealthyBackends()).toHaveLength(1);
    });

    it('should count total healthy', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 1, healthy: true, activeConnections: 0 });
      expect(lb.getTotalHealthy()).toBe(2);
    });
  });

  // ============================================================
  // max connections
  // ============================================================
  describe('max connections', () => {
    it('should set max connections', () => {
      lb.setMaxConnections(50);
      expect(lb.getMaxConnections()).toBe(50);
    });

    it('should clamp to >= 1', () => {
      lb.setMaxConnections(0);
      expect(lb.getMaxConnections()).toBe(1);
    });
  });

  // ============================================================
  // isOverloaded
  // ============================================================
  describe('isOverloaded', () => {
    it('should detect overload', () => {
      lb.setMaxConnections(5);
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 5 });
      expect(lb.isOverloaded('b1')).toBe(true);
    });

    it('should return false for not overloaded', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      expect(lb.isOverloaded('b1')).toBe(false);
    });
  });

  // ============================================================
  // resetRoundRobin
  // ============================================================
  describe('resetRoundRobin', () => {
    it('should reset index', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.addBackend({ id: 'b2', url: 'http://b', weight: 1, healthy: true, activeConnections: 0 });
      lb.select('round-robin');
      lb.select('round-robin');
      lb.resetRoundRobin();
      // After reset, should start from index 0
      const selected = lb.select('round-robin');
      expect(selected).not.toBeNull();
    });
  });

  // ============================================================
  // setWeight / getWeight
  // ============================================================
  describe('setWeight / getWeight', () => {
    it('should set weight', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      expect(lb.setWeight('b1', 100)).toBe(true);
      expect(lb.getWeight('b1')).toBe(100);
    });

    it('should clamp to >= 0', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      lb.setWeight('b1', -10);
      expect(lb.getWeight('b1')).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(lb.setWeight('unknown', 10)).toBe(false);
      expect(lb.getWeight('unknown')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many backends', () => {
      for (let i = 0; i < 50; i++) {
        lb.addBackend({ id: `b${i}`, url: 'x', weight: 1, healthy: true, activeConnections: 0 });
      }
      expect(lb.getBackendCount()).toBe(50);
    });

    it('should not mutate backend list', () => {
      lb.addBackend({ id: 'b1', url: 'http://a', weight: 1, healthy: true, activeConnections: 0 });
      const list = lb.getAllBackends();
      list.push({ id: 'fake', url: 'x', weight: 0, healthy: false, activeConnections: 0 });
      expect(lb.getBackendCount()).toBe(1);
    });
  });
});