/**
 * HookEngine Tests
 * claude-code-design Hook Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HookEngine } from '../HookEngine';

describe('HookEngine', () => {
  let hoe: HookEngine;

  beforeEach(() => {
    hoe = new HookEngine();
  });

  afterEach(() => {
    hoe.clearAll();
  });

  describe('register / trigger / remove', () => {
    it('should register', () => {
      expect(hoe.register('h1', 'before', 'target1', 'callback1')).toMatch(/^hoe-/);
    });

    it('should mark as active', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.isActive(hoe.getAllHooks()[0].id)).toBe(true);
    });

    it('should trigger', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.trigger(id)).toBe(true);
    });

    it('should increment hits', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.trigger(id);
      expect(hoe.getHits(id)).toBe(1);
    });

    it('should not trigger inactive', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.setActive(id, false);
      expect(hoe.trigger(id)).toBe(false);
    });

    it('should return false for unknown trigger', () => {
      expect(hoe.trigger('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getStats().hooks).toBe(1);
    });

    it('should count total added', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getStats().totalAdded).toBe(1);
    });

    it('should count total triggered', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.trigger(id);
      expect(hoe.getStats().totalTriggered).toBe(1);
    });

    it('should count before', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getStats().before).toBe(1);
    });

    it('should count after', () => {
      hoe.register('h1', 'after', 't1', 'c1');
      expect(hoe.getStats().after).toBe(1);
    });

    it('should count success', () => {
      hoe.register('h1', 'success', 't1', 'c1');
      expect(hoe.getStats().success).toBe(1);
    });

    it('should count error', () => {
      hoe.register('h1', 'error', 't1', 'c1');
      expect(hoe.getStats().error).toBe(1);
    });

    it('should count always', () => {
      hoe.register('h1', 'always', 't1', 'c1');
      expect(hoe.getStats().always).toBe(1);
    });

    it('should count active', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.setActive(id, false);
      expect(hoe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.trigger(id);
      expect(hoe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      hoe.register('a', 'before', 't1', 'c1');
      hoe.register('a', 'before', 't2', 'c2');
      expect(hoe.getStats().uniqueNames).toBe(1);
    });

    it('should count unique targets', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      hoe.register('h2', 'before', 't2', 'c2');
      expect(hoe.getStats().uniqueTargets).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get hook', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getHook(id)?.name).toBe('h1');
    });

    it('should get all', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getAllHooks()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.hasHook(id)).toBe(true);
    });

    it('should count', () => {
      expect(hoe.getCount()).toBe(0);
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getName(id)).toBe('h1');
    });

    it('should get target', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getTarget(id)).toBe('t1');
    });

    it('should get callback', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getCallback(id)).toBe('c1');
    });

    it('should get hits', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.trigger(id);
      expect(hoe.getHits(id)).toBe(1);
    });

    it('should check before', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.isBefore(hoe.getAllHooks()[0].id)).toBe(true);
    });

    it('should check after', () => {
      hoe.register('h1', 'after', 't1', 'c1');
      expect(hoe.isAfter(hoe.getAllHooks()[0].id)).toBe(true);
    });

    it('should check success', () => {
      hoe.register('h1', 'success', 't1', 'c1');
      expect(hoe.isSuccess(hoe.getAllHooks()[0].id)).toBe(true);
    });

    it('should check error', () => {
      hoe.register('h1', 'error', 't1', 'c1');
      expect(hoe.isError(hoe.getAllHooks()[0].id)).toBe(true);
    });

    it('should check always', () => {
      hoe.register('h1', 'always', 't1', 'c1');
      expect(hoe.isAlways(hoe.getAllHooks()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.setName(id, 'h2')).toBe(true);
    });

    it('should set event', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.setEvent(id, 'after')).toBe(true);
    });

    it('should set target', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.setTarget(id, 't2')).toBe(true);
    });

    it('should set callback', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.setCallback(id, 'c2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(hoe.setActive('unknown', false)).toBe(false);
      expect(hoe.setName('unknown', 'h')).toBe(false);
      expect(hoe.setEvent('unknown', 'before')).toBe(false);
      expect(hoe.setTarget('unknown', 't')).toBe(false);
      expect(hoe.setCallback('unknown', 'c')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.trigger(id);
      hoe.setActive(id, false);
      hoe.resetAll();
      expect(hoe.getHits(id)).toBe(0);
      expect(hoe.isActive(id)).toBe(true);
    });
  });

  describe('by event / state', () => {
    it('should get by event', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getByEvent('before')).toHaveLength(1);
    });

    it('should get by target', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getByTarget('t1')).toHaveLength(1);
    });

    it('should get active', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getActiveHooks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.setActive(id, false);
      expect(hoe.getInactiveHooks()).toHaveLength(1);
    });

    it('should get all names', () => {
      hoe.register('a', 'before', 't1', 'c1');
      hoe.register('b', 'before', 't2', 'c2');
      expect(hoe.getAllNames()).toHaveLength(2);
    });

    it('should get all targets', () => {
      hoe.register('h1', 'before', 'a', 'c1');
      hoe.register('h2', 'before', 'b', 'c2');
      expect(hoe.getAllTargets()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getNewest()?.name).toBe('h1');
    });

    it('should return null for empty newest', () => {
      expect(hoe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getOldest()?.name).toBe('h1');
    });

    it('should return null for empty oldest', () => {
      expect(hoe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.trigger(id);
      expect(hoe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      hoe.register('h1', 'before', 't1', 'c1');
      expect(hoe.getTotalAdded()).toBe(1);
    });

    it('should get total triggered', () => {
      const id = hoe.register('h1', 'before', 't1', 'c1');
      hoe.trigger(id);
      expect(hoe.getTotalTriggered()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many hooks', () => {
      for (let i = 0; i < 50; i++) {
        hoe.register(`h${i}`, 'before', 't1', 'c1');
      }
      expect(hoe.getCount()).toBe(50);
    });
  });
});