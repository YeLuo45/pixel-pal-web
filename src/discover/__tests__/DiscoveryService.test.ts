/**
 * DiscoveryService Tests
 * nanobot-design Discovery Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DiscoveryService } from '../DiscoveryService';

describe('DiscoveryService', () => {
  let service: DiscoveryService;

  beforeEach(() => {
    service = new DiscoveryService();
  });

  afterEach(() => {
    service.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register service', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://auth', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const meta = { region: 'us' };
      service.register({ id: 's1', name: 'auth', url: 'http://auth', healthy: true, registered: 1000, lastCheck: 0, metadata: meta });
      meta.region = 'eu';
      expect(service.getMetadata('s1', 'region')).toBe('us');
    });
  });

  // ============================================================
  // discover
  // ============================================================
  describe('discover', () => {
    it('should discover by name', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://auth', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      service.register({ id: 's2', name: 'db', url: 'http://db', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.discover('auth')).toHaveLength(1);
    });

    it('should return empty for unknown', () => {
      expect(service.discover('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // checkHealth
  // ============================================================
  describe('checkHealth', () => {
    it('should check health', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://auth', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.checkHealth('s1')).toBe(true);
    });

    it('should return false for unhealthy', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://auth', healthy: false, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.checkHealth('s1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(service.checkHealth('unknown')).toBe(false);
    });

    it('should update lastCheck', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://auth', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      service.checkHealth('s1');
      expect(service.getLastCheck('s1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // announce
  // ============================================================
  describe('announce', () => {
    it('should return healthy only', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://auth', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      service.register({ id: 's2', name: 'db', url: 'http://db', healthy: false, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.announce()).toHaveLength(1);
    });
  });

  // ============================================================
  // service queries
  // ============================================================
  describe('service queries', () => {
    it('should get service', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://auth', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getService('s1')?.name).toBe('auth');
    });

    it('should get all', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getAllServices()).toHaveLength(1);
    });

    it('should remove', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.removeService('s1')).toBe(true);
    });

    it('should check existence', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.hasService('s1')).toBe(true);
    });
  });

  // ============================================================
  // setHealthy
  // ============================================================
  describe('setHealthy', () => {
    it('should set health', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.setHealthy('s1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(service.setHealthy('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // health filters
  // ============================================================
  describe('health filters', () => {
    it('should get healthy', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getHealthy()).toHaveLength(1);
    });

    it('should get unhealthy', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: false, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getUnhealthy()).toHaveLength(1);
    });
  });

  // ============================================================
  // byUrl
  // ============================================================
  describe('byUrl', () => {
    it('should get by URL', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getByUrl('http://a')).toHaveLength(1);
    });
  });

  // ============================================================
  // names
  // ============================================================
  describe('names', () => {
    it('should get all names', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      service.register({ id: 's2', name: 'db', url: 'http://d', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getAllNames()).toHaveLength(2);
    });

    it('should count names', () => {
      service.register({ id: 's1', name: 'auth', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // metadata
  // ============================================================
  describe('metadata', () => {
    it('should set metadata', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.setMetadata('s1', 'region', 'us')).toBe(true);
    });

    it('should get metadata', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: { region: 'us' } });
      expect(service.getMetadata('s1', 'region')).toBe('us');
    });

    it('should return false for unknown', () => {
      expect(service.setMetadata('unknown', 'k', 'v')).toBe(false);
      expect(service.getMetadata('unknown', 'k')).toBeUndefined();
    });
  });

  // ============================================================
  // registeredAfter / totalCount
  // ============================================================
  describe('registeredAfter / totalCount', () => {
    it('should get registered after', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 2000, lastCheck: 0, metadata: {} });
      expect(service.getByRegisteredAfter(1000)).toHaveLength(1);
    });

    it('should get total count', () => {
      service.register({ id: 's1', name: 'a', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      expect(service.getTotalCount()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many services', () => {
      for (let i = 0; i < 50; i++) {
        service.register({ id: `s${i}`, name: 'auth', url: 'http://a', healthy: true, registered: 1000, lastCheck: 0, metadata: {} });
      }
      expect(service.getCount()).toBe(50);
    });
  });
});