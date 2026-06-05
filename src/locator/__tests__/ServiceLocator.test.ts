/**
 * ServiceLocator Tests
 * chatdev-design Service Locator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceLocator } from '../ServiceLocator';

describe('ServiceLocator', () => {
  let loc: ServiceLocator;

  beforeEach(() => {
    loc = new ServiceLocator();
  });

  afterEach(() => {
    loc.clearAll();
  });

  // ============================================================
  // register / find
  // ============================================================
  describe('register / find', () => {
    it('should register', () => {
      expect(loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] })).toBe(true);
    });

    it('should reject duplicate', () => {
      loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] });
      expect(loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] })).toBe(false);
    });

    it('should find', () => {
      loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] });
      expect(loc.find('s1')?.id).toBe('s1');
    });

    it('should return null for unknown', () => {
      expect(loc.find('unknown')).toBeNull();
    });
  });

  // ============================================================
  // resolve
  // ============================================================
  describe('resolve', () => {
    it('should resolve', () => {
      loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] });
      expect(loc.resolve('s1')).toEqual({ x: 1 });
    });

    it('should return null for unknown', () => {
      expect(loc.resolve('unknown')).toBeNull();
    });

    it('should cache', () => {
      loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] });
      loc.resolve('s1');
      loc.resolve('s1');
      expect(loc.getStats().cacheHits).toBe(1);
    });

    it('should not cache when disabled', () => {
      loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [], cached: false });
      loc.resolve('s1');
      loc.resolve('s1');
      expect(loc.getStats().cacheHits).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] });
      const stats = loc.getStats();
      expect(stats.services).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get service', () => {
      loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] });
      expect(loc.getService('s1')?.name).toBe('a');
    });

    it('should get all', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.getAllServices()).toHaveLength(1);
    });

    it('should remove', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.removeService('s1')).toBe(true);
    });

    it('should check existence', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.hasService('s1')).toBe(true);
    });

    it('should count', () => {
      expect(loc.getCount()).toBe(0);
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.getName('s1')).toBe('a');
    });

    it('should get instance', () => {
      loc.register({ id: 's1', name: 'a', instance: { x: 1 }, dependencies: [] });
      expect(loc.getInstance('s1')).toEqual({ x: 1 });
    });

    it('should get dependencies', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: ['d1'] });
      expect(loc.getDependencies('s1')).toEqual(['d1']);
    });

    it('should check hasDependency', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: ['d1'] });
      expect(loc.hasDependency('s1', 'd1')).toBe(true);
    });
  });

  // ============================================================
  // dependency ops
  // ============================================================
  describe('dependency ops', () => {
    it('should add dependency', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.addDependency('s1', 'd1')).toBe(true);
    });

    it('should not add duplicate', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: ['d1'] });
      loc.addDependency('s1', 'd1');
      expect(loc.getDependencies('s1')).toEqual(['d1']);
    });

    it('should remove dependency', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: ['d1'] });
      expect(loc.removeDependency('s1', 'd1')).toBe(true);
    });

    it('should return false for unknown add', () => {
      expect(loc.addDependency('unknown', 'd')).toBe(false);
    });

    it('should return false for unknown remove', () => {
      expect(loc.removeDependency('unknown', 'd')).toBe(false);
    });

    it('should return false for missing remove', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.removeDependency('s1', 'z')).toBe(false);
    });
  });

  // ============================================================
  // resolved
  // ============================================================
  describe('resolved', () => {
    it('should get resolved count', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      expect(loc.getResolvedCount('s1')).toBe(1);
    });
  });

  // ============================================================
  // cache
  // ============================================================
  describe('cache', () => {
    it('should check isCached', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.isCached('s1')).toBe(true);
    });

    it('should set cached', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.setCached('s1', false)).toBe(true);
    });

    it('should return false for unknown setCached', () => {
      expect(loc.setCached('unknown', false)).toBe(false);
    });

    it('should clear cache', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      loc.clearCache();
      expect(loc.getCachedIds()).toHaveLength(0);
    });

    it('should get cached ids', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      expect(loc.getCachedIds()).toContain('s1');
    });
  });

  // ============================================================
  // counts
  // ============================================================
  describe('counts', () => {
    it('should get resolutions', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      expect(loc.getResolutions()).toBe(1);
    });

    it('should get cache hits', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      loc.resolve('s1');
      expect(loc.getCacheHits()).toBe(1);
    });

    it('should get cache misses', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      expect(loc.getCacheMisses()).toBe(1);
    });
  });

  // ============================================================
  // timestamps / rate
  // ============================================================
  describe('timestamps / rate', () => {
    it('should get created at', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      expect(loc.getCreatedAt('s1')).toBeGreaterThan(0);
    });

    it('should get hit rate', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      loc.resolve('s1');
      expect(loc.getHitRate()).toBe(0.5);
    });

    it('should return 0 for empty hit rate', () => {
      expect(loc.getHitRate()).toBe(0);
    });
  });

  // ============================================================
  // by dep
  // ============================================================
  describe('by dep', () => {
    it('should get by dependency', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: ['d1'] });
      expect(loc.getByDependency('d1')).toHaveLength(1);
    });
  });

  // ============================================================
  // most
  // ============================================================
  describe('most', () => {
    it('should get most resolved', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      expect(loc.getMostResolved()?.id).toBe('s1');
    });

    it('should return null for empty', () => {
      expect(loc.getMostResolved()).toBeNull();
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset stats', () => {
      loc.register({ id: 's1', name: 'a', instance: {}, dependencies: [] });
      loc.resolve('s1');
      loc.resetStats();
      expect(loc.getResolutions()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many services', () => {
      for (let i = 0; i < 50; i++) {
        loc.register({ id: `s${i}`, name: `s${i}`, instance: {}, dependencies: [] });
      }
      expect(loc.getCount()).toBe(50);
    });
  });
});