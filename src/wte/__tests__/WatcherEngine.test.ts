/**
 * WatcherEngine Tests
 * claude-code-design Watcher Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WatcherEngine } from '../WatcherEngine';

describe('WatcherEngine', () => {
  let wte: WatcherEngine;

  beforeEach(() => {
    wte = new WatcherEngine();
  });

  afterEach(() => {
    wte.clearAll();
  });

  describe('watch / trigger / stop / reset / remove', () => {
    it('should watch', () => {
      expect(wte.watch('n1', 'c1')).toBe('wte-1');
    });

    it('should default triggered to false', () => {
      wte.watch('n1', 'c1');
      expect(wte.isTriggered('wte-1')).toBe(false);
    });

    it('should mark as active', () => {
      wte.watch('n1', 'c1');
      expect(wte.isActive('wte-1')).toBe(true);
    });

    it('should trigger', () => {
      wte.watch('n1', 'c1');
      expect(wte.trigger('wte-1')).toBe(true);
    });

    it('should set triggered on trigger', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.isTriggered('wte-1')).toBe(true);
    });

    it('should not trigger inactive', () => {
      wte.watch('n1', 'c1');
      wte.setActive('wte-1', false);
      expect(wte.trigger('wte-1')).toBe(false);
    });

    it('should return false for unknown trigger', () => {
      expect(wte.trigger('unknown')).toBe(false);
    });

    it('should stop', () => {
      wte.watch('n1', 'c1');
      expect(wte.stop('wte-1')).toBe(true);
    });

    it('should return false for unknown stop', () => {
      expect(wte.stop('unknown')).toBe(false);
    });

    it('should reset', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.reset('wte-1')).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(wte.reset('unknown')).toBe(false);
    });

    it('should remove', () => {
      wte.watch('n1', 'c1');
      expect(wte.remove('wte-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      wte.watch('n1', 'c1');
      expect(wte.getStats().watchers).toBe(1);
    });

    it('should count total triggered', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getStats().totalTriggered).toBe(1);
    });

    it('should count total stopped', () => {
      wte.watch('n1', 'c1');
      wte.stop('wte-1');
      expect(wte.getStats().totalStopped).toBe(1);
    });

    it('should count active', () => {
      wte.watch('n1', 'c1');
      expect(wte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      wte.watch('n1', 'c1');
      wte.setActive('wte-1', false);
      expect(wte.getStats().inactive).toBe(1);
    });

    it('should count triggered', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getStats().triggered).toBe(1);
    });

    it('should count untriggered', () => {
      wte.watch('n1', 'c1');
      expect(wte.getStats().untriggered).toBe(1);
    });

    it('should count total hits', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      wte.watch('a', 'c1');
      wte.watch('a', 'c2');
      expect(wte.getStats().uniqueNames).toBe(1);
    });

    it('should count unique conditions', () => {
      wte.watch('n1', 'c1');
      wte.watch('n2', 'c1');
      expect(wte.getStats().uniqueConditions).toBe(1);
    });

    it('should count total fires', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      wte.trigger('wte-1');
      expect(wte.getStats().totalFires).toBe(2);
    });

    it('should compute avg fires', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getStats().avgFires).toBe(1);
    });

    it('should get max fires', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getStats().maxFires).toBe(1);
    });

    it('should get min fires', () => {
      wte.watch('n1', 'c1');
      expect(wte.getStats().minFires).toBe(0);
    });
  });

  describe('queries', () => {
    it('should get watcher', () => {
      wte.watch('n1', 'c1');
      expect(wte.getWatcher('wte-1')?.name).toBe('n1');
    });

    it('should get all', () => {
      wte.watch('n1', 'c1');
      expect(wte.getAllWatchers()).toHaveLength(1);
    });

    it('should check existence', () => {
      wte.watch('n1', 'c1');
      expect(wte.hasWatcher('wte-1')).toBe(true);
    });

    it('should count', () => {
      expect(wte.getCount()).toBe(0);
      wte.watch('n1', 'c1');
      expect(wte.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      wte.watch('n1', 'c1');
      expect(wte.getName('wte-1')).toBe('n1');
    });

    it('should get condition', () => {
      wte.watch('n1', 'c1');
      expect(wte.getCondition('wte-1')).toBe('c1');
    });

    it('should get fires', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getFires('wte-1')).toBe(1);
    });

    it('should get hits', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getHits('wte-1')).toBe(1);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      wte.watch('n1', 'c1');
      expect(wte.setActive('wte-1', false)).toBe(true);
    });

    it('should set name', () => {
      wte.watch('n1', 'c1');
      expect(wte.setName('wte-1', 'n2')).toBe(true);
    });

    it('should set condition', () => {
      wte.watch('n1', 'c1');
      expect(wte.setCondition('wte-1', 'c2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wte.setActive('unknown', false)).toBe(false);
      expect(wte.setName('unknown', 'n')).toBe(false);
      expect(wte.setCondition('unknown', 'c')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      wte.setActive('wte-1', false);
      wte.resetAll();
      expect(wte.getFires('wte-1')).toBe(0);
      expect(wte.isActive('wte-1')).toBe(true);
    });
  });

  describe('by name / state', () => {
    it('should get by name', () => {
      wte.watch('n1', 'c1');
      expect(wte.getByName('n1')).toHaveLength(1);
    });

    it('should get active', () => {
      wte.watch('n1', 'c1');
      expect(wte.getActiveWatchers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      wte.watch('n1', 'c1');
      wte.setActive('wte-1', false);
      expect(wte.getInactiveWatchers()).toHaveLength(1);
    });

    it('should get triggered', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getTriggeredWatchers()).toHaveLength(1);
    });

    it('should get all names', () => {
      wte.watch('a', 'c1');
      wte.watch('b', 'c1');
      expect(wte.getAllNames()).toHaveLength(2);
    });

    it('should get all conditions', () => {
      wte.watch('n1', 'a');
      wte.watch('n2', 'b');
      expect(wte.getAllConditions()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      wte.watch('n1', 'c1');
      expect(wte.getNewest()?.id).toBe('wte-1');
    });

    it('should return null for empty newest', () => {
      expect(wte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      wte.watch('n1', 'c1');
      expect(wte.getOldest()?.id).toBe('wte-1');
    });

    it('should return null for empty oldest', () => {
      expect(wte.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      wte.watch('n1', 'c1');
      expect(wte.getCreatedAt('wte-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getUpdatedAt('wte-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total triggered', () => {
      wte.watch('n1', 'c1');
      wte.trigger('wte-1');
      expect(wte.getTotalTriggered()).toBe(1);
    });

    it('should get total stopped', () => {
      wte.watch('n1', 'c1');
      wte.stop('wte-1');
      expect(wte.getTotalStopped()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many watchers', () => {
      for (let i = 0; i < 50; i++) {
        wte.watch(`n${i}`, `c${i}`);
      }
      expect(wte.getCount()).toBe(50);
    });
  });
});