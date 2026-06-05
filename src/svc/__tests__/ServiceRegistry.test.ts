/**
 * ServiceRegistry Tests
 * nanobot-design Service Registry
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceRegistry } from '../ServiceRegistry';

describe('ServiceRegistry', () => {
  let registry: ServiceRegistry;

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  afterEach(() => {
    registry.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register', () => {
      const id = registry.register({ name: 'api', url: 'http://api', version: '1.0.0', metadata: {} });
      expect(id).toBe('svc-1');
    });

    it('should set initial health to true', () => {
      const id = registry.register({ name: 'api', url: 'http://api', version: '1.0.0', metadata: {} });
      expect(registry.isHealthy(id)).toBe(true);
    });
  });

  // ============================================================
  // unregister
  // ============================================================
  describe('unregister', () => {
    it('should unregister', () => {
      const id = registry.register({ name: 'api', url: 'http://api', version: '1.0.0', metadata: {} });
      expect(registry.unregister(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(registry.unregister('unknown')).toBe(false);
    });
  });

  // ============================================================
  // find
  // ============================================================
  describe('find', () => {
    it('should find by name', () => {
      registry.register({ name: 'api', url: 'http://api', version: '1.0.0', metadata: {} });
      expect(registry.find('api')?.name).toBe('api');
    });

    it('should return null for unknown', () => {
      expect(registry.find('unknown')).toBeNull();
    });

    it('should find all', () => {
      registry.register({ name: 'api', url: 'http://a', version: '1.0.0', metadata: {} });
      registry.register({ name: 'api', url: 'http://b', version: '1.0.0', metadata: {} });
      expect(registry.findAll('api')).toHaveLength(2);
    });
  });

  // ============================================================
  // setHealth
  // ============================================================
  describe('setHealth', () => {
    it('should set health', () => {
      const id = registry.register({ name: 'api', url: 'http://api', version: '1.0.0', metadata: {} });
      expect(registry.setHealth(id, false)).toBe(true);
      expect(registry.isHealthy(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(registry.setHealth('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // setVersion
  // ============================================================
  describe('setVersion', () => {
    it('should set version', () => {
      const id = registry.register({ name: 'api', url: 'http://api', version: '1.0.0', metadata: {} });
      expect(registry.setVersion(id, '2.0.0')).toBe(true);
      expect(registry.getVersion(id)).toBe('2.0.0');
    });

    it('should return false for unknown', () => {
      expect(registry.setVersion('unknown', '2.0.0')).toBe(false);
    });
  });

  // ============================================================
  // listByVersion
  // ============================================================
  describe('listByVersion', () => {
    it('should list by version', () => {
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      registry.register({ name: 'b', url: 'http://b', version: '2.0.0', metadata: {} });
      expect(registry.listByVersion('1.0.0')).toHaveLength(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get service', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getService(id)?.name).toBe('a');
    });

    it('should get all', () => {
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getAllServices()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.hasService(id)).toBe(true);
    });

    it('should count', () => {
      expect(registry.getCount()).toBe(0);
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getName(id)).toBe('a');
    });

    it('should get url', () => {
      const id = registry.register({ name: 'a', url: 'http://api.com', version: '1.0.0', metadata: {} });
      expect(registry.getUrl(id)).toBe('http://api.com');
    });

    it('should get version', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getVersion(id)).toBe('1.0.0');
    });
  });

  // ============================================================
  // metadata
  // ============================================================
  describe('metadata', () => {
    it('should get metadata', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: { k: 'v' } });
      expect(registry.getMetadata(id).k).toBe('v');
    });

    it('should set metadata', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.setMetadata(id, 'k', 'v')).toBe(true);
    });

    it('should get metadata value', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: { k: 'v' } });
      expect(registry.getMetadataValue(id, 'k')).toBe('v');
    });

    it('should return false for unknown setMetadata', () => {
      expect(registry.setMetadata('unknown', 'k', 'v')).toBe(false);
    });
  });

  // ============================================================
  // health
  // ============================================================
  describe('health', () => {
    it('should get healthy', () => {
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getHealthy()).toHaveLength(1);
    });

    it('should get unhealthy', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      registry.setHealth(id, false);
      expect(registry.getUnhealthy()).toHaveLength(1);
    });

    it('should get healthy count', () => {
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getHealthyCount()).toBe(1);
    });

    it('should get unhealthy count', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      registry.setHealth(id, false);
      expect(registry.getUnhealthyCount()).toBe(1);
    });

    it('should get health ratio', () => {
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getHealthRatio()).toBe(1);
    });
  });

  // ============================================================
  // versions / names
  // ============================================================
  describe('versions / names', () => {
    it('should get versions', () => {
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      registry.register({ name: 'b', url: 'http://b', version: '2.0.0', metadata: {} });
      expect(registry.getVersions()).toHaveLength(2);
    });

    it('should get by version', () => {
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getByVersion('1.0.0')).toHaveLength(1);
    });

    it('should get name set', () => {
      registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getNameSet()).toContain('a');
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = registry.register({ name: 'a', url: 'http://a', version: '1.0.0', metadata: {} });
      expect(registry.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many services', () => {
      for (let i = 0; i < 50; i++) {
        registry.register({ name: `s${i}`, url: `http://s${i}`, version: '1.0.0', metadata: {} });
      }
      expect(registry.getCount()).toBe(50);
    });
  });
});