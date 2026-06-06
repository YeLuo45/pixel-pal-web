/**
 * RegistryEngine Tests
 * nanobot-design Registry Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RegistryEngine } from '../RegistryEngine';

describe('RegistryEngine', () => {
  let rge: RegistryEngine;

  beforeEach(() => {
    rge = new RegistryEngine();
  });

  afterEach(() => {
    rge.clearAll();
  });

  // ============================================================
  // register / lookup / resolve / deregister / remove
  // ============================================================
  describe('register / lookup / resolve / deregister / remove', () => {
    it('should register', () => {
      expect(rge.register('s1', '127.0.0.1', 8080)).toBe('rge-1');
    });

    it('should default port to 80', () => {
      const id = rge.register('s1', '127.0.0.1');
      expect(rge.getPort(id)).toBe(80);
    });

    it('should default status to registered', () => {
      const id = rge.register('s1', '127.0.0.1');
      expect(rge.getStatus(id)).toBe('registered');
    });

    it('should mark as active', () => {
      const id = rge.register('s1', '127.0.0.1');
      expect(rge.isActive(id)).toBe(true);
    });

    it('should lookup', () => {
      rge.register('s1', '127.0.0.1', 8080);
      expect(rge.lookup('s1')?.port).toBe(8080);
    });

    it('should return undefined for unknown lookup', () => {
      expect(rge.lookup('unknown')).toBeUndefined();
    });

    it('should resolve', () => {
      const id = rge.register('s1', '127.0.0.1');
      expect(rge.resolve(id)).toBe(true);
    });

    it('should return false for unknown resolve', () => {
      expect(rge.resolve('unknown')).toBe(false);
    });

    it('should not resolve deregistered', () => {
      const id = rge.register('s1', '127.0.0.1');
      rge.deregister(id);
      expect(rge.resolve(id)).toBe(false);
    });

    it('should deregister', () => {
      const id = rge.register('s1', '127.0.0.1');
      expect(rge.deregister(id)).toBe(true);
    });

    it('should return false for unknown deregister', () => {
      expect(rge.deregister('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = rge.register('s1', '127.0.0.1');
      expect(rge.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rge.register('s1', '127.0.0.1');
      const stats = rge.getStats();
      expect(stats.services).toBe(1);
    });

    it('should count total registered', () => {
      rge.register('s1', '127.0.0.1');
      expect(rge.getStats().totalRegistered).toBe(1);
    });

    it('should count total deregistered', () => {
      const id = rge.register('s1', '127.0.0.1');
      rge.deregister(id);
      expect(rge.getStats().totalDeregistered).toBe(1);
    });

    it('should count registered', () => {
      rge.register('s1', '127.0.0.1');
      expect(rge.getStats().registered).toBe(1);
    });

    it('should count deregistered', () => {
      const id = rge.register('s1', '127.0.0.1');
      rge.deregister(id);
      expect(rge.getStats().deregistered).toBe(1);
    });

    it('should count active', () => {
      rge.register('s1', '127.0.0.1');
      expect(rge.getStats().active).toBe(0);
    });

    it('should count enabled', () => {
      rge.register('s1', '127.0.0.1');
      expect(rge.getStats().enabled).toBe(1);
    });

    it('should count disabled', () => {
      const id = rge.register('s1', '127.0.0.1');
      rge.setActive(id, false);
      expect(rge.getStats().disabled).toBe(1);
    });

    it('should count total hits', () => {
      const id = rge.register('s1', '127.0.0.1');
      rge.resolve(id);
      expect(rge.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      rge.register('a', '127.0.0.1');
      rge.register('b', '127.0.0.1');
      expect(rge.getStats().uniqueNames).toBe(2);
    });

    it('should count unique addresses', () => {
      rge.register('s1', 'a');
      rge.register('s2', 'b');
      expect(rge.getStats().uniqueAddresses).toBe(2);
    });

    it('should compute total ports', () => {
      rge.register('s1', 'a', 1000);
      rge.register('s2', 'b', 2000);
      expect(rge.getStats().totalPorts).toBe(3000);
    });

    it('should compute avg port', () => {
      rge.register('s1', 'a', 1000);
      rge.register('s2', 'b', 2000);
      expect(rge.getStats().avgPort).toBe(1500);
    });

    it('should get max port', () => {
      rge.register('s1', 'a', 1000);
      rge.register('s2', 'b', 2000);
      expect(rge.getStats().maxPort).toBe(2000);
    });

    it('should get min port', () => {
      rge.register('s1', 'a', 1000);
      rge.register('s2', 'b', 2000);
      expect(rge.getStats().minPort).toBe(1000);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get service', () => {
      rge.register('s1', 'a');
      expect(rge.getService('rge-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      rge.register('s1', 'a');
      expect(rge.getAllServices()).toHaveLength(1);
    });

    it('should check existence', () => {
      rge.register('s1', 'a');
      expect(rge.hasService('rge-1')).toBe(true);
    });

    it('should count', () => {
      expect(rge.getCount()).toBe(0);
      rge.register('s1', 'a');
      expect(rge.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      rge.register('s1', 'a');
      expect(rge.getName('rge-1')).toBe('s1');
    });

    it('should get address', () => {
      rge.register('s1', 'a');
      expect(rge.getAddress('rge-1')).toBe('a');
    });

    it('should get hits', () => {
      const id = rge.register('s1', 'a');
      rge.resolve(id);
      expect(rge.getHits(id)).toBe(1);
    });

    it('should check registered', () => {
      rge.register('s1', 'a');
      expect(rge.isRegistered('rge-1')).toBe(true);
    });

    it('should check deregistered', () => {
      const id = rge.register('s1', 'a');
      rge.deregister(id);
      expect(rge.isDeregistered(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      rge.register('s1', 'a');
      expect(rge.setActive('rge-1', false)).toBe(true);
    });

    it('should set name', () => {
      rge.register('s1', 'a');
      expect(rge.setName('rge-1', 's2')).toBe(true);
    });

    it('should set address', () => {
      rge.register('s1', 'a');
      expect(rge.setAddress('rge-1', 'b')).toBe(true);
    });

    it('should set port', () => {
      rge.register('s1', 'a');
      expect(rge.setPort('rge-1', 9000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rge.setActive('unknown', false)).toBe(false);
      expect(rge.setName('unknown', 's')).toBe(false);
      expect(rge.setAddress('unknown', 'a')).toBe(false);
      expect(rge.setPort('unknown', 80)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = rge.register('s1', 'a');
      rge.deregister(id);
      rge.setActive(id, false);
      rge.resetAll();
      expect(rge.getStatus(id)).toBe('registered');
      expect(rge.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by status / state
  // ============================================================
  describe('by status / state', () => {
    it('should get by status', () => {
      rge.register('s1', 'a');
      expect(rge.getByStatus('registered')).toHaveLength(1);
    });

    it('should get by name', () => {
      rge.register('s1', 'a');
      expect(rge.getByName('s1')).toHaveLength(1);
    });

    it('should get by address', () => {
      rge.register('s1', 'a');
      expect(rge.getByAddress('a')).toHaveLength(1);
    });

    it('should get active', () => {
      rge.register('s1', 'a');
      expect(rge.getActiveServices()).toHaveLength(1);
    });

    it('should get inactive', () => {
      rge.register('s1', 'a');
      rge.setActive('rge-1', false);
      expect(rge.getInactiveServices()).toHaveLength(1);
    });

    it('should get all names', () => {
      rge.register('a', 'x');
      rge.register('b', 'y');
      expect(rge.getAllNames()).toHaveLength(2);
    });

    it('should get all addresses', () => {
      rge.register('s1', 'a');
      rge.register('s2', 'b');
      expect(rge.getAllAddresses()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      rge.register('s1', 'a');
      expect(rge.getNewest()?.id).toBe('rge-1');
    });

    it('should return null for empty newest', () => {
      expect(rge.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rge.register('s1', 'a');
      expect(rge.getOldest()?.id).toBe('rge-1');
    });

    it('should return null for empty oldest', () => {
      expect(rge.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      rge.register('s1', 'a');
      expect(rge.getCreatedAt('rge-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rge.register('s1', 'a');
      rge.resolve(id);
      expect(rge.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total registered', () => {
      rge.register('s1', 'a');
      expect(rge.getTotalRegistered()).toBe(1);
    });

    it('should get total deregistered', () => {
      const id = rge.register('s1', 'a');
      rge.deregister(id);
      expect(rge.getTotalDeregistered()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many services', () => {
      for (let i = 0; i < 50; i++) {
        rge.register(`s${i}`, `a${i}`, 1000 + i);
      }
      expect(rge.getCount()).toBe(50);
    });
  });
});