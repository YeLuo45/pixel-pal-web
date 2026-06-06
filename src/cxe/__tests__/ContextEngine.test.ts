/**
 * ContextEngine Tests
 * generic-agent-design Context Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContextEngine } from '../ContextEngine';

describe('ContextEngine', () => {
  let cxe: ContextEngine;

  beforeEach(() => {
    cxe = new ContextEngine();
  });

  afterEach(() => {
    cxe.clearAll();
  });

  // ============================================================
  // set / get / getByKey / switch / remove
  // ============================================================
  describe('set / get / getByKey / switch / remove', () => {
    it('should set', () => {
      expect(cxe.set('k1', 'v1', 1)).toBe('cxe-1');
    });

    it('should mark as active', () => {
      const id = cxe.set('k1', 'v1', 1);
      expect(cxe.isActive(id)).toBe(true);
    });

    it('should default priority to 0', () => {
      const id = cxe.set('k1', 'v1');
      expect(cxe.getPriority(id)).toBe(0);
    });

    it('should get', () => {
      const id = cxe.set('k1', 'v1', 1);
      expect(cxe.get(id)).toBe('v1');
    });

    it('should not get inactive', () => {
      const id = cxe.set('k1', 'v1', 1);
      cxe.setActive(id, false);
      expect(cxe.get(id)).toBeUndefined();
    });

    it('should return undefined for unknown get', () => {
      expect(cxe.get('unknown')).toBeUndefined();
    });

    it('should get by key', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getByKey('k1')?.value).toBe('v1');
    });

    it('should get by key highest priority', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k1', 'v2', 10);
      expect(cxe.getByKey('k1')?.value).toBe('v2');
    });

    it('should return undefined for missing key', () => {
      expect(cxe.getByKey('missing')).toBeUndefined();
    });

    it('should switch', () => {
      const id = cxe.set('k1', 'v1', 1);
      expect(cxe.switch(id, 'v2')).toBe(true);
    });

    it('should not switch unknown', () => {
      expect(cxe.switch('unknown', 'v2')).toBe(false);
    });

    it('should remove', () => {
      const id = cxe.set('k1', 'v1', 1);
      expect(cxe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cxe.set('k1', 'v1', 1);
      const stats = cxe.getStats();
      expect(stats.contexts).toBe(1);
    });

    it('should count total gets', () => {
      const id = cxe.set('k1', 'v1', 1);
      cxe.get(id);
      expect(cxe.getStats().totalGets).toBe(1);
    });

    it('should count total sets', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getStats().totalSets).toBe(1);
    });

    it('should count active', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cxe.set('k1', 'v1', 1);
      cxe.setActive(id, false);
      expect(cxe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cxe.set('k1', 'v1', 1);
      cxe.get(id);
      expect(cxe.getStats().totalHits).toBe(1);
    });

    it('should count unique keys', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k2', 'v2', 1);
      expect(cxe.getStats().uniqueKeys).toBe(2);
    });

    it('should compute avg priority', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k2', 'v2', 2);
      expect(cxe.getStats().avgPriority).toBe(1.5);
    });

    it('should get max priority', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k2', 'v2', 5);
      expect(cxe.getStats().maxPriority).toBe(5);
    });

    it('should get min priority', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k2', 'v2', 5);
      expect(cxe.getStats().minPriority).toBe(1);
    });

    it('should compute avg value length', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getStats().avgValueLength).toBe(2);
    });

    it('should get max value length', () => {
      cxe.set('k1', 'a', 1);
      cxe.set('k2', 'hello', 1);
      expect(cxe.getStats().maxValueLength).toBe(5);
    });

    it('should get min value length', () => {
      cxe.set('k1', 'a', 1);
      cxe.set('k2', 'hello', 1);
      expect(cxe.getStats().minValueLength).toBe(1);
    });

    it('should count unique values', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k2', 'v1', 1);
      expect(cxe.getStats().uniqueValues).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get context', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getContext('cxe-1')?.key).toBe('k1');
    });

    it('should get all', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getAllContexts()).toHaveLength(1);
    });

    it('should check existence', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.hasContext('cxe-1')).toBe(true);
    });

    it('should count', () => {
      expect(cxe.getCount()).toBe(0);
      cxe.set('k1', 'v1', 1);
      expect(cxe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get key', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getKey('cxe-1')).toBe('k1');
    });

    it('should get value', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getValue('cxe-1')).toBe('v1');
    });

    it('should get priority', () => {
      cxe.set('k1', 'v1', 5);
      expect(cxe.getPriority('cxe-1')).toBe(5);
    });

    it('should get value length', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getValueLength('cxe-1')).toBe(2);
    });

    it('should get history', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getHistory('cxe-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = cxe.set('k1', 'v1', 1);
      cxe.get(id);
      expect(cxe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.setActive('cxe-1', false)).toBe(true);
    });

    it('should set key', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.setKey('cxe-1', 'k2')).toBe(true);
    });

    it('should set priority', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.setPriority('cxe-1', 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cxe.setActive('unknown', false)).toBe(false);
      expect(cxe.setKey('unknown', 'k')).toBe(false);
      expect(cxe.setPriority('unknown', 1)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cxe.set('k1', 'v1', 1);
      cxe.get(id);
      cxe.setActive(id, false);
      cxe.resetAll();
      expect(cxe.getHits(id)).toBe(0);
      expect(cxe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by key / state
  // ============================================================
  describe('by key / state', () => {
    it('should get by key all', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k1', 'v2', 2);
      expect(cxe.getByKeyAll('k1')).toHaveLength(2);
    });

    it('should get active', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getActiveContexts()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cxe.set('k1', 'v1', 1);
      cxe.setActive('cxe-1', false);
      expect(cxe.getInactiveContexts()).toHaveLength(1);
    });

    it('should get all keys', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k2', 'v2', 1);
      expect(cxe.getAllKeys()).toHaveLength(2);
    });

    it('should get key count', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getKeyCount()).toBe(1);
    });

    it('should get by min priority', () => {
      cxe.set('k1', 'v1', 1);
      cxe.set('k2', 'v2', 10);
      expect(cxe.getByMinPriority(5)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getNewest()?.id).toBe('cxe-1');
    });

    it('should return null for empty newest', () => {
      expect(cxe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getOldest()?.id).toBe('cxe-1');
    });

    it('should return null for empty oldest', () => {
      expect(cxe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getCreatedAt('cxe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cxe.set('k1', 'v1', 1);
      cxe.get(id);
      expect(cxe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total gets', () => {
      const id = cxe.set('k1', 'v1', 1);
      cxe.get(id);
      expect(cxe.getTotalGets()).toBe(1);
    });

    it('should get total sets', () => {
      cxe.set('k1', 'v1', 1);
      expect(cxe.getTotalSets()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many contexts', () => {
      for (let i = 0; i < 50; i++) {
        cxe.set(`k${i}`, `v${i}`, i);
      }
      expect(cxe.getCount()).toBe(50);
    });
  });
});