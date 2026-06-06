/**
 * DiscoveryEngine Tests
 * nanobot-design Discovery Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DiscoveryEngine } from '../DiscoveryEngine';

describe('DiscoveryEngine', () => {
  let de: DiscoveryEngine;

  beforeEach(() => {
    de = new DiscoveryEngine();
  });

  afterEach(() => {
    de.clearAll();
  });

  // ============================================================
  // discover / setHealth
  // ============================================================
  describe('discover / setHealth', () => {
    it('should discover', () => {
      expect(de.discover('h1', 8080)).toBe('de2-1');
    });

    it('should mark as healthy by default', () => {
      const id = de.discover('h1', 8080);
      expect(de.isHealthy(id)).toBe(true);
    });

    it('should mark as active', () => {
      const id = de.discover('h1', 8080);
      expect(de.isActive(id)).toBe(true);
    });

    it('should discover unhealthy', () => {
      const id = de.discover('h1', 8080, false);
      expect(de.isUnhealthy(id)).toBe(true);
    });

    it('should set health', () => {
      const id = de.discover('h1', 8080);
      expect(de.setHealth(id, false)).toBe(true);
    });

    it('should mark as unhealthy on setHealth false', () => {
      const id = de.discover('h1', 8080);
      de.setHealth(id, false);
      expect(de.isUnhealthy(id)).toBe(true);
    });

    it('should not set health inactive', () => {
      const id = de.discover('h1', 8080);
      de.setActive(id, false);
      expect(de.setHealth(id, false)).toBe(false);
    });

    it('should return false for unknown setHealth', () => {
      expect(de.setHealth('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // query
  // ============================================================
  describe('query', () => {
    it('should query by health', () => {
      de.discover('h1', 8080, true);
      de.discover('h2', 8081, false);
      expect(de.queryByHealth(true)).toHaveLength(1);
    });

    it('should query by host', () => {
      de.discover('h1', 8080);
      de.discover('h1', 8081);
      de.discover('h2', 8082);
      expect(de.queryByHost('h1')).toHaveLength(2);
    });

    it('should query by port', () => {
      de.discover('h1', 8080);
      de.discover('h2', 8080);
      expect(de.queryByPort(8080)).toHaveLength(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      de.discover('h1', 8080);
      const stats = de.getStats();
      expect(stats.discovered).toBe(1);
    });

    it('should count healthy', () => {
      de.discover('h1', 8080, true);
      expect(de.getStats().healthy).toBe(1);
    });

    it('should count unhealthy', () => {
      de.discover('h1', 8080, false);
      expect(de.getStats().unhealthy).toBe(1);
    });

    it('should count active', () => {
      de.discover('h1', 8080);
      expect(de.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = de.discover('h1', 8080);
      de.setActive(id, false);
      expect(de.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = de.discover('h1', 8080);
      de.touch(id);
      expect(de.getStats().totalHits).toBe(1);
    });

    it('should count unique hosts', () => {
      de.discover('h1', 8080);
      de.discover('h2', 8081);
      expect(de.getStats().uniqueHosts).toBe(2);
    });

    it('should count unique ports', () => {
      de.discover('h1', 8080);
      de.discover('h1', 8081);
      expect(de.getStats().uniquePorts).toBe(2);
    });

    it('should compute avg hits', () => {
      const id = de.discover('h1', 8080);
      de.touch(id);
      de.touch(id);
      expect(de.getStats().avgHits).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get node', () => {
      de.discover('h1', 8080);
      expect(de.getNode('de2-1')?.host).toBe('h1');
    });

    it('should get all', () => {
      de.discover('h1', 8080);
      expect(de.getAllNodes()).toHaveLength(1);
    });

    it('should remove', () => {
      de.discover('h1', 8080);
      expect(de.removeNode('de2-1')).toBe(true);
    });

    it('should check existence', () => {
      de.discover('h1', 8080);
      expect(de.hasNode('de2-1')).toBe(true);
    });

    it('should count', () => {
      expect(de.getCount()).toBe(0);
      de.discover('h1', 8080);
      expect(de.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get host', () => {
      de.discover('h1', 8080);
      expect(de.getHost('de2-1')).toBe('h1');
    });

    it('should get port', () => {
      de.discover('h1', 8080);
      expect(de.getPort('de2-1')).toBe(8080);
    });

    it('should get hits', () => {
      const id = de.discover('h1', 8080);
      de.touch(id);
      expect(de.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      de.discover('h1', 8080);
      expect(de.setActive('de2-1', false)).toBe(true);
    });

    it('should set host', () => {
      de.discover('h1', 8080);
      expect(de.setHost('de2-1', 'h2')).toBe(true);
    });

    it('should set port', () => {
      de.discover('h1', 8080);
      expect(de.setPort('de2-1', 9090)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(de.setActive('unknown', false)).toBe(false);
      expect(de.setHost('unknown', 'h')).toBe(false);
      expect(de.setPort('unknown', 8080)).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      de.discover('h1', 8080);
      expect(de.touch('de2-1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(de.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = de.discover('h1', 8080);
      de.touch(id);
      de.setActive(id, false);
      de.resetAll();
      expect(de.getHits(id)).toBe(0);
      expect(de.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get healthy', () => {
      de.discover('h1', 8080, true);
      expect(de.getHealthyNodes()).toHaveLength(1);
    });

    it('should get unhealthy', () => {
      de.discover('h1', 8080, false);
      expect(de.getUnhealthyNodes()).toHaveLength(1);
    });

    it('should get active', () => {
      de.discover('h1', 8080);
      expect(de.getActiveNodes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      de.discover('h1', 8080);
      de.setActive('de2-1', false);
      expect(de.getInactiveNodes()).toHaveLength(1);
    });

    it('should get all hosts', () => {
      de.discover('h1', 8080);
      de.discover('h2', 8081);
      expect(de.getAllHosts()).toHaveLength(2);
    });

    it('should get host count', () => {
      de.discover('h1', 8080);
      expect(de.getHostCount()).toBe(1);
    });

    it('should get all ports', () => {
      de.discover('h1', 8080);
      de.discover('h1', 8081);
      expect(de.getAllPorts()).toHaveLength(2);
    });

    it('should get port count', () => {
      de.discover('h1', 8080);
      expect(de.getPortCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      de.discover('h1', 8080);
      expect(de.getNewest()?.id).toBe('de2-1');
    });

    it('should return null for empty newest', () => {
      expect(de.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      de.discover('h1', 8080);
      expect(de.getOldest()?.id).toBe('de2-1');
    });

    it('should return null for empty oldest', () => {
      expect(de.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      de.discover('h1', 8080);
      expect(de.getCreatedAt('de2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = de.discover('h1', 8080);
      de.setHealth(id, false);
      expect(de.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        de.discover(`h${i}`, 8080 + i);
      }
      expect(de.getCount()).toBe(50);
    });
  });
});