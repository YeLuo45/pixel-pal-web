/**
 * HookEngine Tests
 * thunderbolt-design Hook Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HookEngine } from '../HookEngine';

describe('HookEngine', () => {
  let he: HookEngine;

  beforeEach(() => {
    he = new HookEngine();
  });

  afterEach(() => {
    he.clearAll();
  });

  // ============================================================
  // register / fire
  // ============================================================
  describe('register / fire', () => {
    it('should register', () => {
      expect(he.register('e1', 'h1')).toBe('he-1');
    });

    it('should mark as active', () => {
      const id = he.register('e1', 'h1');
      expect(he.isActive(id)).toBe(true);
    });

    it('should fire', () => {
      const id = he.register('e1', 'h1');
      expect(he.fire(id)).toBe(true);
    });

    it('should increment fired on fire', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getFired(id)).toBe(1);
    });

    it('should log history on fire', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getHistory(id)).toHaveLength(1);
    });

    it('should not fire inactive', () => {
      const id = he.register('e1', 'h1');
      he.setActive(id, false);
      expect(he.fire(id)).toBe(false);
    });

    it('should return false for unknown fire', () => {
      expect(he.fire('unknown')).toBe(false);
    });

    it('should reset fired', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.resetFired(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      he.resetFired(id);
      expect(he.getFired(id)).toBe(0);
    });

    it('should return false for unknown resetFired', () => {
      expect(he.resetFired('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      he.register('e1', 'h1');
      const stats = he.getStats();
      expect(stats.hooks).toBe(1);
    });

    it('should count total fired', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getStats().totalFired).toBe(1);
    });

    it('should count active', () => {
      he.register('e1', 'h1');
      expect(he.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = he.register('e1', 'h1');
      he.setActive(id, false);
      expect(he.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getStats().totalHits).toBe(1);
    });

    it('should compute avg fired', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getStats().avgFired).toBe(1);
    });

    it('should count unique events', () => {
      he.register('e1', 'h1');
      he.register('e2', 'h1');
      expect(he.getStats().uniqueEvents).toBe(2);
    });

    it('should count unique handlers', () => {
      he.register('e1', 'h1');
      he.register('e1', 'h2');
      expect(he.getStats().uniqueHandlers).toBe(2);
    });

    it('should get max fired', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      he.fire(id);
      expect(he.getStats().maxFired).toBe(2);
    });

    it('should get min fired', () => {
      he.register('e1', 'h1');
      expect(he.getStats().minFired).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get hook', () => {
      he.register('e1', 'h1');
      expect(he.getHook('he-1')?.event).toBe('e1');
    });

    it('should get all', () => {
      he.register('e1', 'h1');
      expect(he.getAllHooks()).toHaveLength(1);
    });

    it('should remove', () => {
      he.register('e1', 'h1');
      expect(he.removeHook('he-1')).toBe(true);
    });

    it('should check existence', () => {
      he.register('e1', 'h1');
      expect(he.hasHook('he-1')).toBe(true);
    });

    it('should count', () => {
      expect(he.getCount()).toBe(0);
      he.register('e1', 'h1');
      expect(he.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get event', () => {
      he.register('e1', 'h1');
      expect(he.getEvent('he-1')).toBe('e1');
    });

    it('should get handler', () => {
      he.register('e1', 'h1');
      expect(he.getHandler('he-1')).toBe('h1');
    });

    it('should get fired', () => {
      he.register('e1', 'h1');
      expect(he.getFired('he-1')).toBe(0);
    });

    it('should get history', () => {
      he.register('e1', 'h1');
      expect(he.getHistory('he-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      he.register('e1', 'h1');
      expect(he.setActive('he-1', false)).toBe(true);
    });

    it('should set event', () => {
      he.register('e1', 'h1');
      expect(he.setEvent('he-1', 'e2')).toBe(true);
    });

    it('should set handler', () => {
      he.register('e1', 'h1');
      expect(he.setHandler('he-1', 'h2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(he.setActive('unknown', false)).toBe(false);
      expect(he.setEvent('unknown', 'e')).toBe(false);
      expect(he.setHandler('unknown', 'h')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      he.setActive(id, false);
      he.resetAll();
      expect(he.getFired(id)).toBe(0);
      expect(he.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by event / handler
  // ============================================================
  describe('by event / handler', () => {
    it('should get by event', () => {
      he.register('e1', 'h1');
      he.register('e1', 'h2');
      expect(he.getByEvent('e1')).toHaveLength(2);
    });

    it('should get by handler', () => {
      he.register('e1', 'h1');
      he.register('e2', 'h1');
      expect(he.getByHandler('h1')).toHaveLength(2);
    });

    it('should get active', () => {
      he.register('e1', 'h1');
      expect(he.getActiveHooks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      he.register('e1', 'h1');
      he.setActive('he-1', false);
      expect(he.getInactiveHooks()).toHaveLength(1);
    });

    it('should get all events', () => {
      he.register('e1', 'h1');
      he.register('e2', 'h1');
      expect(he.getAllEvents()).toHaveLength(2);
    });

    it('should get event count', () => {
      he.register('e1', 'h1');
      expect(he.getEventCount()).toBe(1);
    });

    it('should get all handlers', () => {
      he.register('e1', 'h1');
      he.register('e1', 'h2');
      expect(he.getAllHandlers()).toHaveLength(2);
    });

    it('should get handler count', () => {
      he.register('e1', 'h1');
      expect(he.getHandlerCount()).toBe(1);
    });

    it('should get by min fired', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getByMinFired(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most fired', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      he.fire(id);
      expect(he.getMostFired()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(he.getMostFired()).toBeNull();
    });

    it('should get newest', () => {
      he.register('e1', 'h1');
      expect(he.getNewest()?.id).toBe('he-1');
    });

    it('should return null for empty newest', () => {
      expect(he.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      he.register('e1', 'h1');
      expect(he.getOldest()?.id).toBe('he-1');
    });

    it('should return null for empty oldest', () => {
      expect(he.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      he.register('e1', 'h1');
      expect(he.getCreatedAt('he-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total fired', () => {
      const id = he.register('e1', 'h1');
      he.fire(id);
      expect(he.getTotalFired()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many hooks', () => {
      for (let i = 0; i < 50; i++) {
        he.register(`e${i}`, 'h1');
      }
      expect(he.getCount()).toBe(50);
    });
  });
});