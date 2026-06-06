/**
 * DIEngine Tests
 * claude-code-design DI Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DIEngine } from '../DIEngine';

describe('DIEngine', () => {
  let di: DIEngine;

  beforeEach(() => {
    di = new DIEngine();
  });

  afterEach(() => {
    di.clearAll();
  });

  // ============================================================
  // register / resolve
  // ============================================================
  describe('register / resolve', () => {
    it('should register', () => {
      expect(di.register('d1', 'v1')).toBe('di-1');
    });

    it('should mark as active', () => {
      const id = di.register('d1', 'v1');
      expect(di.isActive(id)).toBe(true);
    });

    it('should resolve', () => {
      const id = di.register('d1', 'v1');
      expect(di.resolve(id)).toBe(true);
    });

    it('should increment resolved on resolve', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getResolved(id)).toBe(1);
    });

    it('should log history on resolve', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getHistory(id)).toHaveLength(1);
    });

    it('should not resolve inactive', () => {
      const id = di.register('d1', 'v1');
      di.setActive(id, false);
      expect(di.resolve(id)).toBe(false);
    });

    it('should return false for unknown resolve', () => {
      expect(di.resolve('unknown')).toBe(false);
    });

    it('should get value', () => {
      const id = di.register('d1', 'v1');
      expect(di.getValue(id)).toBe('v1');
    });

    it('should not get value inactive', () => {
      const id = di.register('d1', 'v1');
      di.setActive(id, false);
      expect(di.getValue(id)).toBeUndefined();
    });

    it('should return undefined for unknown getValue', () => {
      expect(di.getValue('unknown')).toBeUndefined();
    });

    it('should resolve by name', () => {
      di.register('d1', 'v1');
      expect(di.resolveByName('d1')).toBe(true);
    });

    it('should return false for unknown resolveByName', () => {
      expect(di.resolveByName('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      di.register('d1', 'v1');
      const stats = di.getStats();
      expect(stats.dependencies).toBe(1);
    });

    it('should count total resolved', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getStats().totalResolved).toBe(1);
    });

    it('should count active', () => {
      di.register('d1', 'v1');
      expect(di.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = di.register('d1', 'v1');
      di.setActive(id, false);
      expect(di.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      di.register('d1', 'v1');
      di.register('d2', 'v2');
      expect(di.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg resolved', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getStats().avgResolved).toBe(1);
    });

    it('should get max resolved', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      di.resolve(id);
      expect(di.getStats().maxResolved).toBe(2);
    });

    it('should get min resolved', () => {
      di.register('d1', 'v1');
      expect(di.getStats().minResolved).toBe(0);
    });

    it('should compute total value length', () => {
      di.register('d1', 'abcde');
      expect(di.getStats().totalValueLength).toBe(5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get dependency', () => {
      di.register('d1', 'v1');
      expect(di.getDependency('di-1')?.name).toBe('d1');
    });

    it('should get all', () => {
      di.register('d1', 'v1');
      expect(di.getAllDependencies()).toHaveLength(1);
    });

    it('should remove', () => {
      di.register('d1', 'v1');
      expect(di.removeDependency('di-1')).toBe(true);
    });

    it('should check existence', () => {
      di.register('d1', 'v1');
      expect(di.hasDependency('di-1')).toBe(true);
    });

    it('should count', () => {
      expect(di.getCount()).toBe(0);
      di.register('d1', 'v1');
      expect(di.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      di.register('d1', 'v1');
      expect(di.getName('di-1')).toBe('d1');
    });

    it('should get resolved', () => {
      di.register('d1', 'v1');
      expect(di.getResolved('di-1')).toBe(0);
    });

    it('should get history', () => {
      di.register('d1', 'v1');
      expect(di.getHistory('di-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      di.register('d1', 'v1');
      expect(di.setActive('di-1', false)).toBe(true);
    });

    it('should set name', () => {
      di.register('d1', 'v1');
      expect(di.setName('di-1', 'd2')).toBe(true);
    });

    it('should set value', () => {
      di.register('d1', 'v1');
      expect(di.setValue('di-1', 'v2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(di.setActive('unknown', false)).toBe(false);
      expect(di.setName('unknown', 'd')).toBe(false);
      expect(di.setValue('unknown', 'v')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      di.setActive(id, false);
      di.resetAll();
      expect(di.getResolved(id)).toBe(0);
      expect(di.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      di.register('d1', 'v1');
      expect(di.getByName('d1')).toHaveLength(1);
    });

    it('should get active', () => {
      di.register('d1', 'v1');
      expect(di.getActiveDependencies()).toHaveLength(1);
    });

    it('should get inactive', () => {
      di.register('d1', 'v1');
      di.setActive('di-1', false);
      expect(di.getInactiveDependencies()).toHaveLength(1);
    });

    it('should get all names', () => {
      di.register('d1', 'v1');
      di.register('d2', 'v2');
      expect(di.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      di.register('d1', 'v1');
      expect(di.getNameCount()).toBe(1);
    });

    it('should get by min resolved', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getByMinResolved(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most resolved', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      di.resolve(id);
      expect(di.getMostResolved()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(di.getMostResolved()).toBeNull();
    });

    it('should get newest', () => {
      di.register('d1', 'v1');
      expect(di.getNewest()?.id).toBe('di-1');
    });

    it('should return null for empty newest', () => {
      expect(di.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      di.register('d1', 'v1');
      expect(di.getOldest()?.id).toBe('di-1');
    });

    it('should return null for empty oldest', () => {
      expect(di.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      di.register('d1', 'v1');
      expect(di.getCreatedAt('di-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total resolved', () => {
      const id = di.register('d1', 'v1');
      di.resolve(id);
      expect(di.getTotalResolved()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many dependencies', () => {
      for (let i = 0; i < 50; i++) {
        di.register(`d${i}`, `v${i}`);
      }
      expect(di.getCount()).toBe(50);
    });
  });
});