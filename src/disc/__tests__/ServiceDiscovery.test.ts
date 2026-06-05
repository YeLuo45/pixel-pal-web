/**
 * ServiceDiscovery Tests
 * chatdev-design Service Discovery
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceDiscovery } from '../ServiceDiscovery';

describe('ServiceDiscovery', () => {
  let disc: ServiceDiscovery;

  beforeEach(() => {
    disc = new ServiceDiscovery();
  });

  afterEach(() => {
    disc.clearAll();
  });

  // ============================================================
  // register / discover
  // ============================================================
  describe('register / discover', () => {
    it('should register', () => {
      expect(disc.register({ id: 's1', name: 'api', url: 'http://api:3000' })).toBe(true);
    });

    it('should reject duplicate', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.register({ id: 's1', name: 'api', url: 'http://api:3000' })).toBe(false);
    });

    it('should discover', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.discover('api')).toHaveLength(1);
    });

    it('should return empty for unknown', () => {
      expect(disc.discover('unknown')).toHaveLength(0);
    });

    it('should not discover unhealthy', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.setHealthy('s1', false);
      expect(disc.discover('api')).toHaveLength(0);
    });
  });

  // ============================================================
  // pick
  // ============================================================
  describe('pick', () => {
    it('should pick', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.pick('api')?.id).toBe('s1');
    });

    it('should return null for unknown', () => {
      expect(disc.pick('unknown')).toBeNull();
    });

    it('should pick least loaded', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.register({ id: 's2', name: 'api', url: 'http://api:3001' });
      disc.setLoad('s1', 5);
      expect(disc.pick('api')?.id).toBe('s2');
    });

    it('should increment load on pick', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.pick('api');
      expect(disc.getLoad('s1')).toBe(1);
    });

    it('should increment picks on pick', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.pick('api');
      expect(disc.getPicks('s1')).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      const stats = disc.getStats();
      expect(stats.entries).toBe(1);
    });

    it('should count healthy', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getStats().healthy).toBe(1);
    });

    it('should count unhealthy', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.setHealthy('s1', false);
      expect(disc.getStats().unhealthy).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getEntry('s1')?.name).toBe('api');
    });

    it('should get all', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getAllEntries()).toHaveLength(1);
    });

    it('should remove', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.removeEntry('s1')).toBe(true);
    });

    it('should check existence', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.hasEntry('s1')).toBe(true);
    });

    it('should count', () => {
      expect(disc.getCount()).toBe(0);
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getName('s1')).toBe('api');
    });

    it('should get url', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getUrl('s1')).toBe('http://api:3000');
    });

    it('should check isHealthy', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.isHealthy('s1')).toBe(true);
    });

    it('should set healthy', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.setHealthy('s1', false)).toBe(true);
    });

    it('should return false for unknown setHealthy', () => {
      expect(disc.setHealthy('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // load
  // ============================================================
  describe('load', () => {
    it('should get load', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getLoad('s1')).toBe(0);
    });

    it('should set load', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.setLoad('s1', 10)).toBe(true);
    });

    it('should increment load', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.incrementLoad('s1')).toBe(true);
    });

    it('should decrement load', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.decrementLoad('s1')).toBe(true);
    });

    it('should return false for unknown setLoad', () => {
      expect(disc.setLoad('unknown', 10)).toBe(false);
    });

    it('should return false for unknown increment', () => {
      expect(disc.incrementLoad('unknown')).toBe(false);
    });

    it('should return false for unknown decrement', () => {
      expect(disc.decrementLoad('unknown')).toBe(false);
    });
  });

  // ============================================================
  // by name / health
  // ============================================================
  describe('by name / health', () => {
    it('should get by name', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getByName('api')).toHaveLength(1);
    });

    it('should get healthy', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getHealthy()).toHaveLength(1);
    });

    it('should get unhealthy', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.setHealthy('s1', false);
      expect(disc.getUnhealthy()).toHaveLength(1);
    });

    it('should get by health', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getByHealth(true)).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get last checked', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getLastChecked('s1')).toBeGreaterThan(0);
    });

    it('should get created at', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getCreatedAt('s1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most picked', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.pick('api');
      expect(disc.getMostPicked()?.id).toBe('s1');
    });

    it('should return null for empty most', () => {
      expect(disc.getMostPicked()).toBeNull();
    });

    it('should get most loaded', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.setLoad('s1', 5);
      expect(disc.getMostLoaded()?.id).toBe('s1');
    });

    it('should return null for empty most loaded', () => {
      expect(disc.getMostLoaded()).toBeNull();
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should get all names', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getAllNames()).toHaveLength(1);
    });

    it('should get name count', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      expect(disc.getNameCount()).toBe(1);
    });

    it('should get avg load', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.setLoad('s1', 10);
      expect(disc.getAvgLoad()).toBe(10);
    });

    it('should return 0 for empty avg', () => {
      expect(disc.getAvgLoad()).toBe(0);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset picks', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.pick('api');
      disc.resetPicks();
      expect(disc.getPicks('s1')).toBe(0);
    });

    it('should reset all', () => {
      disc.register({ id: 's1', name: 'api', url: 'http://api:3000' });
      disc.pick('api');
      disc.resetAll();
      expect(disc.getLoad('s1')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        disc.register({ id: `s${i}`, name: `api${i}`, url: `http://api${i}:3000` });
      }
      expect(disc.getCount()).toBe(50);
    });
  });
});