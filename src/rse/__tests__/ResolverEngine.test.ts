/**
 * ResolverEngine Tests
 * claude-code-design Resolver Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResolverEngine } from '../ResolverEngine';

describe('ResolverEngine', () => {
  let rse: ResolverEngine;

  beforeEach(() => {
    rse = new ResolverEngine();
  });

  afterEach(() => {
    rse.clearAll();
  });

  describe('add / resolve / remove', () => {
    it('should add', () => {
      expect(rse.add('k1', 'v1', 'strict')).toMatch(/^rse-/);
    });

    it('should mark as active', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.isActive(rse.getAllResolves()[0].id)).toBe(true);
    });

    it('should resolve strict', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.resolve(id)).toBe('k1');
    });

    it('should return null for strict empty', () => {
      const id = rse.add('', 'v1', 'strict');
      expect(rse.resolve(id)).toBeNull();
    });

    it('should resolve lenient', () => {
      const id = rse.add('k1', 'v1', 'lenient');
      expect(rse.resolve(id)).toBe('k1');
    });

    it('should resolve default', () => {
      const id = rse.add('k1', 'v1', 'default');
      expect(rse.resolve(id)).toBe('k1');
    });

    it('should not resolve inactive', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.setActive(id, false);
      expect(rse.resolve(id)).toBeNull();
    });

    it('should return null for unknown resolve', () => {
      expect(rse.resolve('unknown')).toBeNull();
    });

    it('should remove', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getStats().resolves).toBe(1);
    });

    it('should count total added', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getStats().totalAdded).toBe(1);
    });

    it('should count total resolved', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.resolve(id);
      expect(rse.getStats().totalResolved).toBe(1);
    });

    it('should count strict', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getStats().strict).toBe(1);
    });

    it('should count lenient', () => {
      rse.add('k1', 'v1', 'lenient');
      expect(rse.getStats().lenient).toBe(1);
    });

    it('should count default', () => {
      rse.add('k1', 'v1', 'default');
      expect(rse.getStats().default).toBe(1);
    });

    it('should count active', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.setActive(id, false);
      expect(rse.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.resolve(id);
      expect(rse.getStats().totalHits).toBe(1);
    });

    it('should count unique keys', () => {
      rse.add('a', 'v1', 'strict');
      rse.add('a', 'v2', 'strict');
      expect(rse.getStats().uniqueKeys).toBe(1);
    });

    it('should count unique values', () => {
      rse.add('k1', 'v', 'strict');
      rse.add('k2', 'v', 'strict');
      expect(rse.getStats().uniqueValues).toBe(1);
    });

    it('should count total key len', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getStats().totalKeyLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get resolve', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.getResolve(id)?.key).toBe('k1');
    });

    it('should get all', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getAllResolves()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.hasResolve(id)).toBe(true);
    });

    it('should count', () => {
      expect(rse.getCount()).toBe(0);
      rse.add('k1', 'v1', 'strict');
      expect(rse.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get key', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.getKey(id)).toBe('k1');
    });

    it('should get value', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.getValue(id)).toBe('v1');
    });

    it('should get hits', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.resolve(id);
      expect(rse.getHits(id)).toBe(1);
    });

    it('should check strict', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.isStrict(rse.getAllResolves()[0].id)).toBe(true);
    });

    it('should check lenient', () => {
      rse.add('k1', 'v1', 'lenient');
      expect(rse.isLenient(rse.getAllResolves()[0].id)).toBe(true);
    });

    it('should check default', () => {
      rse.add('k1', 'v1', 'default');
      expect(rse.isDefault(rse.getAllResolves()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.setActive(id, false)).toBe(true);
    });

    it('should set key', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.setKey(id, 'k2')).toBe(true);
    });

    it('should set value', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.setValue(id, 'v2')).toBe(true);
    });

    it('should set mode', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.setMode(id, 'lenient')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rse.setActive('unknown', false)).toBe(false);
      expect(rse.setKey('unknown', 'k')).toBe(false);
      expect(rse.setValue('unknown', 'v')).toBe(false);
      expect(rse.setMode('unknown', 'strict')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.setActive(id, false);
      rse.resetAll();
      expect(rse.isActive(id)).toBe(true);
    });
  });

  describe('by mode / state', () => {
    it('should get by mode', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getByMode('strict')).toHaveLength(1);
    });

    it('should get active', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getActiveResolves()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.setActive(id, false);
      expect(rse.getInactiveResolves()).toHaveLength(1);
    });

    it('should get all keys', () => {
      rse.add('a', 'v1', 'strict');
      rse.add('b', 'v2', 'strict');
      expect(rse.getAllKeys()).toHaveLength(2);
    });

    it('should get all values', () => {
      rse.add('k1', 'a', 'strict');
      rse.add('k2', 'b', 'strict');
      expect(rse.getAllValues()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getNewest()?.key).toBe('k1');
    });

    it('should return null for empty newest', () => {
      expect(rse.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getOldest()?.key).toBe('k1');
    });

    it('should return null for empty oldest', () => {
      expect(rse.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = rse.add('k1', 'v1', 'strict');
      expect(rse.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.resolve(id);
      expect(rse.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      rse.add('k1', 'v1', 'strict');
      expect(rse.getTotalAdded()).toBe(1);
    });

    it('should get total resolved', () => {
      const id = rse.add('k1', 'v1', 'strict');
      rse.resolve(id);
      expect(rse.getTotalResolved()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many resolves', () => {
      for (let i = 0; i < 50; i++) {
        rse.add(`k${i}`, 'v', 'strict');
      }
      expect(rse.getCount()).toBe(50);
    });
  });
});