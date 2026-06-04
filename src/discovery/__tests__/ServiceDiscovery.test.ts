/**
 * ServiceDiscovery Tests
 * nanobot-design Service Discovery
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceDiscovery } from '../ServiceDiscovery';

describe('ServiceDiscovery', () => {
  let discovery: ServiceDiscovery;

  beforeEach(() => {
    discovery = new ServiceDiscovery();
  });

  afterEach(() => {
    discovery.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register service instance', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      expect(discovery.getInstanceCount()).toBe(1);
    });

    it('should register multiple instances of same service', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a1.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      discovery.register({ id: 'i2', name: 'auth', url: 'http://a2.com', healthy: true, load: 0.2, lastHeartbeat: Date.now() });
      expect(discovery.discover('auth')).toHaveLength(2);
    });

    it('should register different services', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      discovery.register({ id: 'i2', name: 'payment', url: 'http://p.com', healthy: true, load: 0.2, lastHeartbeat: Date.now() });
      expect(discovery.getServiceCount()).toBe(2);
    });

    it('should not mutate input', () => {
      const inst = { id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: 1000 };
      discovery.register(inst);
      inst.load = 0.9;
      expect(discovery.getById('i1')?.load).toBe(0.1);
    });
  });

  // ============================================================
  // deregister
  // ============================================================
  describe('deregister', () => {
    it('should deregister by id', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      expect(discovery.deregister('i1')).toBe(true);
      expect(discovery.getInstanceCount()).toBe(0);
    });

    it('should return false for unknown id', () => {
      expect(discovery.deregister('unknown')).toBe(false);
    });

    it('should remove service name when last instance deregistered', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      discovery.deregister('i1');
      expect(discovery.hasService('auth')).toBe(false);
    });
  });

  // ============================================================
  // discover
  // ============================================================
  describe('discover', () => {
    it('should return instances of a service', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      expect(discovery.discover('auth')).toHaveLength(1);
    });

    it('should return empty for unknown service', () => {
      expect(discovery.discover('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // heartbeat
  // ============================================================
  describe('heartbeat', () => {
    it('should update heartbeat and mark healthy', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: false, load: 0.1, lastHeartbeat: 0 });
      expect(discovery.heartbeat('i1')).toBe(true);
      expect(discovery.isHealthy('i1')).toBe(true);
    });

    it('should return false for unknown id', () => {
      expect(discovery.heartbeat('unknown')).toBe(false);
    });
  });

  // ============================================================
  // select
  // ============================================================
  describe('select', () => {
    it('should return least loaded healthy instance', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.9, lastHeartbeat: Date.now() });
      discovery.register({ id: 'i2', name: 'auth', url: 'http://b.com', healthy: true, load: 0.2, lastHeartbeat: Date.now() });
      expect(discovery.select('auth')?.id).toBe('i2');
    });

    it('should return null for no healthy instances', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: false, load: 0.1, lastHeartbeat: Date.now() });
      expect(discovery.select('auth')).toBeNull();
    });

    it('should return null for unknown service', () => {
      expect(discovery.select('unknown')).toBeNull();
    });
  });

  // ============================================================
  // cleanup
  // ============================================================
  describe('cleanup', () => {
    it('should remove stale instances', () => {
      const now = Date.now();
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: now - 20000 });
      discovery.register({ id: 'i2', name: 'auth', url: 'http://b.com', healthy: true, load: 0.1, lastHeartbeat: now });
      const removed = discovery.cleanup(10000);
      expect(removed).toBe(1);
      expect(discovery.getInstanceCount()).toBe(1);
    });

    it('should return 0 when no stale', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      expect(discovery.cleanup(10000)).toBe(0);
    });
  });

  // ============================================================
  // getServiceCount / getInstanceCount / getAllNames
  // ============================================================
  describe('counts', () => {
    it('should return service count', () => {
      discovery.register({ id: 'i1', name: 'a', url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      discovery.register({ id: 'i2', name: 'b', url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      expect(discovery.getServiceCount()).toBe(2);
    });

    it('should return instance count', () => {
      discovery.register({ id: 'i1', name: 'a', url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      discovery.register({ id: 'i2', name: 'a', url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      expect(discovery.getInstanceCount()).toBe(2);
    });

    it('should return all service names', () => {
      discovery.register({ id: 'i1', name: 'a', url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      discovery.register({ id: 'i2', name: 'b', url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      expect(discovery.getAllNames()).toHaveLength(2);
    });
  });

  // ============================================================
  // markUnhealthy / updateLoad
  // ============================================================
  describe('markUnhealthy / updateLoad', () => {
    it('should mark unhealthy', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      expect(discovery.markUnhealthy('i1')).toBe(true);
      expect(discovery.isHealthy('i1')).toBe(false);
    });

    it('should return false for unknown when marking unhealthy', () => {
      expect(discovery.markUnhealthy('unknown')).toBe(false);
    });

    it('should update load clamped to 0-1', () => {
      discovery.register({ id: 'i1', name: 'auth', url: 'http://a.com', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      discovery.updateLoad('i1', 1.5);
      expect(discovery.getById('i1')?.load).toBe(1);
    });

    it('should return false for unknown when updating load', () => {
      expect(discovery.updateLoad('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // getHealthyInstances / getAverageLoad / hasService
  // ============================================================
  describe('healthy / load / has', () => {
    it('should return only healthy instances', () => {
      discovery.register({ id: 'i1', name: 'a', url: 'x', healthy: true, load: 0.1, lastHeartbeat: Date.now() });
      discovery.register({ id: 'i2', name: 'a', url: 'x', healthy: false, load: 0.2, lastHeartbeat: Date.now() });
      expect(discovery.getHealthyInstances('a')).toHaveLength(1);
    });

    it('should calculate average load', () => {
      discovery.register({ id: 'i1', name: 'a', url: 'x', healthy: true, load: 0.4, lastHeartbeat: Date.now() });
      discovery.register({ id: 'i2', name: 'a', url: 'x', healthy: true, load: 0.6, lastHeartbeat: Date.now() });
      expect(discovery.getAverageLoad('a')).toBe(0.5);
    });

    it('should check service existence', () => {
      expect(discovery.hasService('a')).toBe(false);
      discovery.register({ id: 'i1', name: 'a', url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      expect(discovery.hasService('a')).toBe(true);
    });

    it('should return 0 average for empty', () => {
      expect(discovery.getAverageLoad('unknown')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many services', () => {
      for (let i = 0; i < 50; i++) {
        discovery.register({ id: `i${i}`, name: `s${i}`, url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      }
      expect(discovery.getInstanceCount()).toBe(50);
    });

    it('should not expose internal array', () => {
      discovery.register({ id: 'i1', name: 'a', url: 'x', healthy: true, load: 0, lastHeartbeat: Date.now() });
      const list = discovery.discover('a');
      list.push({ id: 'fake', name: 'a', url: 'x', healthy: true, load: 0, lastHeartbeat: 0 });
      expect(discovery.discover('a')).toHaveLength(1);
    });
  });
});