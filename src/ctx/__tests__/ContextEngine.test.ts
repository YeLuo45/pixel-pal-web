/**
 * ContextEngine Tests
 * claude-code-design Context Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContextEngine } from '../ContextEngine';

describe('ContextEngine', () => {
  let ce: ContextEngine;

  beforeEach(() => {
    ce = new ContextEngine();
  });

  afterEach(() => {
    ce.clearAll();
  });

  // ============================================================
  // create / set / get / activate
  // ============================================================
  describe('create / set / get / activate', () => {
    it('should create', () => {
      expect(ce.create('c1')).toBe('ctx-1');
    });

    it('should set', () => {
      const id = ce.create('c1');
      expect(ce.set(id, 'k1', 'v1')).toBe(true);
    });

    it('should get', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      expect(ce.get(id, 'k1')).toBe('v1');
    });

    it('should return undefined for missing key', () => {
      const id = ce.create('c1');
      expect(ce.get(id, 'unknown')).toBeUndefined();
    });

    it('should activate', () => {
      const id = ce.create('c1');
      expect(ce.activate(id)).toBe(true);
    });

    it('should not activate inactive', () => {
      const id = ce.create('c1');
      ce.setActive(id, false);
      expect(ce.activate(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(ce.set('unknown', 'k', 'v')).toBe(false);
      expect(ce.activate('unknown')).toBe(false);
    });

    it('should increment hits on get', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      ce.get(id, 'k1');
      expect(ce.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ce.create('c1');
      const stats = ce.getStats();
      expect(stats.contexts).toBe(1);
    });

    it('should count total keys', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      ce.set(id, 'k2', 'v2');
      expect(ce.getStats().totalKeys).toBe(2);
    });

    it('should count active', () => {
      ce.create('c1');
      expect(ce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ce.create('c1');
      ce.setActive(id, false);
      expect(ce.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      ce.get(id, 'k1');
      expect(ce.getStats().totalHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get context', () => {
      ce.create('c1');
      expect(ce.getContext('ctx-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      ce.create('c1');
      expect(ce.getAllContexts()).toHaveLength(1);
    });

    it('should remove', () => {
      ce.create('c1');
      expect(ce.removeContext('ctx-1')).toBe(true);
    });

    it('should check existence', () => {
      ce.create('c1');
      expect(ce.hasContext('ctx-1')).toBe(true);
    });

    it('should count', () => {
      expect(ce.getCount()).toBe(0);
      ce.create('c1');
      expect(ce.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ce.create('c1');
      expect(ce.getName('ctx-1')).toBe('c1');
    });

    it('should get data', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      expect(ce.getData(id)).toEqual({ k1: 'v1' });
    });

    it('should get keys', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      expect(ce.getKeys(id)).toContain('k1');
    });

    it('should get key count', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      ce.set(id, 'k2', 'v2');
      expect(ce.getKeyCount(id)).toBe(2);
    });

    it('should check hasKey', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      expect(ce.hasKey(id, 'k1')).toBe(true);
    });
  });

  // ============================================================
  // delete / clear
  // ============================================================
  describe('delete / clear', () => {
    it('should delete key', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      expect(ce.deleteKey(id, 'k1')).toBe(true);
    });

    it('should not delete missing key', () => {
      const id = ce.create('c1');
      expect(ce.deleteKey(id, 'k1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(ce.deleteKey('unknown', 'k')).toBe(false);
    });

    it('should clear data', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      expect(ce.clearData(id)).toBe(true);
    });

    it('should return false for unknown clearData', () => {
      expect(ce.clearData('unknown')).toBe(false);
    });
  });

  // ============================================================
  // state
  // ============================================================
  describe('state', () => {
    it('should check isActive', () => {
      ce.create('c1');
      expect(ce.isActive('ctx-1')).toBe(true);
    });

    it('should set active', () => {
      const id = ce.create('c1');
      expect(ce.setActive(id, false)).toBe(true);
    });

    it('should clear active on setActive false', () => {
      const id = ce.create('c1');
      ce.activate(id);
      ce.setActive(id, false);
      expect(ce.getActiveId()).toBeNull();
    });

    it('should return false for unknown setActive', () => {
      expect(ce.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set name', () => {
      const id = ce.create('c1');
      expect(ce.setName(id, 'c2')).toBe(true);
    });

    it('should return false for unknown setName', () => {
      expect(ce.setName('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // active context
  // ============================================================
  describe('active context', () => {
    it('should get active id', () => {
      const id = ce.create('c1');
      ce.activate(id);
      expect(ce.getActiveId()).toBe(id);
    });

    it('should return null for empty active id', () => {
      expect(ce.getActiveId()).toBeNull();
    });

    it('should get active context', () => {
      const id = ce.create('c1');
      ce.activate(id);
      expect(ce.getActiveContext()?.id).toBe(id);
    });

    it('should return null for empty active context', () => {
      expect(ce.getActiveContext()).toBeNull();
    });

    it('should clear active on remove', () => {
      const id = ce.create('c1');
      ce.activate(id);
      ce.removeContext(id);
      expect(ce.getActiveId()).toBeNull();
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      ce.create('c1');
      expect(ce.getByName('c1')).toHaveLength(1);
    });

    it('should get active', () => {
      ce.create('c1');
      expect(ce.getActiveContexts()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ce.create('c1');
      ce.setActive(id, false);
      expect(ce.getInactiveContexts()).toHaveLength(1);
    });

    it('should get all names', () => {
      ce.create('c1');
      ce.create('c2');
      expect(ce.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ce.create('c1');
      expect(ce.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      ce.get(id, 'k1');
      expect(ce.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ce.getMostHit()).toBeNull();
    });

    it('should get most keys', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      ce.set(id, 'k2', 'v2');
      expect(ce.getMostKeys()?.id).toBe(id);
    });

    it('should return null for empty most keys', () => {
      expect(ce.getMostKeys()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ce.create('c1');
      expect(ce.getCreatedAt('ctx-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ce.create('c1');
      ce.set(id, 'k1', 'v1');
      expect(ce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many contexts', () => {
      for (let i = 0; i < 50; i++) {
        ce.create(`c${i}`);
      }
      expect(ce.getCount()).toBe(50);
    });
  });
});