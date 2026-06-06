/**
 * GatewayManager Tests
 * nanobot-design Gateway Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GatewayManager } from '../GatewayManager';

describe('GatewayManager', () => {
  let gm: GatewayManager;

  beforeEach(() => {
    gm = new GatewayManager();
  });

  afterEach(() => {
    gm.clearAll();
  });

  // ============================================================
  // register / forward
  // ============================================================
  describe('register / forward', () => {
    it('should register', () => {
      expect(gm.register('g1', 'http://api', 100)).toBe('gw-1');
    });

    it('should mark as active', () => {
      const id = gm.register('g1', 'http://api', 100);
      expect(gm.isActive(id)).toBe(true);
    });

    it('should forward', () => {
      const id = gm.register('g1', 'http://api', 100);
      expect(gm.forward(id)).toBe(true);
    });

    it('should increment requests on forward', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getRequests(id)).toBe(1);
    });

    it('should not forward inactive', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.setActive(id, false);
      expect(gm.forward(id)).toBe(false);
    });

    it('should reject when rate limit exceeded', () => {
      const id = gm.register('g1', 'http://api', 2);
      gm.forward(id);
      gm.forward(id);
      expect(gm.forward(id)).toBe(false);
    });

    it('should increment rejected on rate limit', () => {
      const id = gm.register('g1', 'http://api', 1);
      gm.forward(id);
      gm.forward(id);
      expect(gm.getRejected(id)).toBe(1);
    });

    it('should return false for unknown forward', () => {
      expect(gm.forward('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      gm.register('g1', 'http://api', 100);
      const stats = gm.getStats();
      expect(stats.gateways).toBe(1);
    });

    it('should count total requests', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getStats().totalRequests).toBe(1);
    });

    it('should count total rejected', () => {
      const id = gm.register('g1', 'http://api', 0);
      gm.forward(id);
      expect(gm.getStats().totalRejected).toBe(1);
    });

    it('should compute avg requests', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getStats().avgRequests).toBe(1);
    });

    it('should count active', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.setActive(id, false);
      expect(gm.getStats().inactive).toBe(1);
    });

    it('should count total forwards', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getStats().totalForwards).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get gateway', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getGateway('gw-1')?.name).toBe('g1');
    });

    it('should get all', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getAllGateways()).toHaveLength(1);
    });

    it('should remove', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.removeGateway('gw-1')).toBe(true);
    });

    it('should check existence', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.hasGateway('gw-1')).toBe(true);
    });

    it('should count', () => {
      expect(gm.getCount()).toBe(0);
      gm.register('g1', 'http://api', 100);
      expect(gm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getName('gw-1')).toBe('g1');
    });

    it('should get endpoint', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getEndpoint('gw-1')).toBe('http://api');
    });

    it('should get rate limit', () => {
      gm.register('g1', 'http://api', 50);
      expect(gm.getRateLimit('gw-1')).toBe(50);
    });

    it('should get requests', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getRequests('gw-1')).toBe(0);
    });

    it('should get rejected', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getRejected('gw-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = gm.register('g1', 'http://api', 100);
      expect(gm.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = gm.register('g1', 'http://api', 100);
      expect(gm.setName(id, 'g2')).toBe(true);
    });

    it('should set endpoint', () => {
      const id = gm.register('g1', 'http://api', 100);
      expect(gm.setEndpoint(id, 'http://api2')).toBe(true);
    });

    it('should set rate limit', () => {
      const id = gm.register('g1', 'http://api', 100);
      expect(gm.setRateLimit(id, 200)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(gm.setActive('unknown', false)).toBe(false);
      expect(gm.setName('unknown', 'g')).toBe(false);
      expect(gm.setEndpoint('unknown', 'e')).toBe(false);
      expect(gm.setRateLimit('unknown', 100)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset requests', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.resetRequests(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(gm.resetRequests('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      gm.setActive(id, false);
      gm.resetAll();
      expect(gm.getRequests(id)).toBe(0);
      expect(gm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getByName('g1')).toHaveLength(1);
    });

    it('should get active', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getActiveGateways()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.setActive(id, false);
      expect(gm.getInactiveGateways()).toHaveLength(1);
    });

    it('should get all names', () => {
      gm.register('g1', 'http://api', 100);
      gm.register('g2', 'http://api2', 100);
      expect(gm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getNameCount()).toBe(1);
    });

    it('should get by min requests', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getByMinRequests(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most requests', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getMostRequests()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(gm.getMostRequests()).toBeNull();
    });

    it('should get most rejected', () => {
      const id = gm.register('g1', 'http://api', 0);
      gm.forward(id);
      expect(gm.getMostRejected()?.id).toBe(id);
    });

    it('should return null for empty most rejected', () => {
      expect(gm.getMostRejected()).toBeNull();
    });

    it('should get newest', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getNewest()?.id).toBe('gw-1');
    });

    it('should return null for empty newest', () => {
      expect(gm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getOldest()?.id).toBe('gw-1');
    });

    it('should return null for empty oldest', () => {
      expect(gm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      gm.register('g1', 'http://api', 100);
      expect(gm.getCreatedAt('gw-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total forwards
  // ============================================================
  describe('total forwards', () => {
    it('should get total forwards', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      expect(gm.getTotalForwards()).toBe(1);
    });

    it('should reset total forwards', () => {
      const id = gm.register('g1', 'http://api', 100);
      gm.forward(id);
      gm.resetTotalForwards();
      expect(gm.getTotalForwards()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many gateways', () => {
      for (let i = 0; i < 50; i++) {
        gm.register(`g${i}`, `http://api${i}`, 100);
      }
      expect(gm.getCount()).toBe(50);
    });
  });
});