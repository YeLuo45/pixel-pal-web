/**
 * WatchdogEngine Tests
 * thunderbolt-design Watchdog Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WatchdogEngine } from '../WatchdogEngine';

describe('WatchdogEngine', () => {
  let wde: WatchdogEngine;

  beforeEach(() => {
    wde = new WatchdogEngine();
  });

  afterEach(() => {
    wde.clearAll();
  });

  describe('register / feed / check / remove', () => {
    it('should register', () => {
      expect(wde.register('w1')).toBe('wde-1');
    });

    it('should default state to healthy', () => {
      wde.register('w1');
      expect(wde.getState('wde-1')).toBe('healthy');
    });

    it('should mark as active', () => {
      wde.register('w1');
      expect(wde.isActive('wde-1')).toBe(true);
    });

    it('should feed', () => {
      wde.register('w1');
      expect(wde.feed('wde-1')).toBe(true);
    });

    it('should increment feeds on feed', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getFeeds('wde-1')).toBe(1);
    });

    it('should not feed inactive', () => {
      wde.register('w1');
      wde.setActive('wde-1', false);
      expect(wde.feed('wde-1')).toBe(false);
    });

    it('should return false for unknown feed', () => {
      expect(wde.feed('unknown')).toBe(false);
    });

    it('should check', () => {
      wde.register('w1');
      expect(wde.check('wde-1')).toBe('healthy');
    });

    it('should return dead for unknown check', () => {
      expect(wde.check('unknown')).toBe('dead');
    });

    it('should remove', () => {
      wde.register('w1');
      expect(wde.remove('wde-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      wde.register('w1');
      expect(wde.getStats().watchdogs).toBe(1);
    });

    it('should count total fed', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getStats().totalFed).toBe(1);
    });

    it('should count total dead', () => {
      wde.register('w1', 0);
      wde.check('wde-1');
      expect(wde.getStats().totalDead).toBe(0);
    });

    it('should count healthy', () => {
      wde.register('w1');
      expect(wde.getStats().healthy).toBe(1);
    });

    it('should count active', () => {
      wde.register('w1');
      expect(wde.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      wde.register('w1');
      wde.setActive('wde-1', false);
      expect(wde.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      wde.register('a');
      wde.register('a');
      expect(wde.getStats().uniqueNames).toBe(1);
    });

    it('should count total feeds', () => {
      wde.register('w1');
      wde.feed('wde-1');
      wde.feed('wde-1');
      expect(wde.getStats().totalFeeds).toBe(2);
    });

    it('should compute avg feeds', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getStats().avgFeeds).toBe(1);
    });

    it('should get max feeds', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getStats().maxFeeds).toBe(1);
    });

    it('should get min feeds', () => {
      wde.register('w1');
      expect(wde.getStats().minFeeds).toBe(0);
    });
  });

  describe('queries', () => {
    it('should get watchdog', () => {
      wde.register('w1');
      expect(wde.getWatchdog('wde-1')?.name).toBe('w1');
    });

    it('should get all', () => {
      wde.register('w1');
      expect(wde.getAllWatchdogs()).toHaveLength(1);
    });

    it('should check existence', () => {
      wde.register('w1');
      expect(wde.hasWatchdog('wde-1')).toBe(true);
    });

    it('should count', () => {
      expect(wde.getCount()).toBe(0);
      wde.register('w1');
      expect(wde.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      wde.register('w1');
      expect(wde.getName('wde-1')).toBe('w1');
    });

    it('should get feeds', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getFeeds('wde-1')).toBe(1);
    });

    it('should get last feed', () => {
      wde.register('w1');
      expect(wde.getLastFeed('wde-1')).toBeGreaterThan(0);
    });

    it('should get threshold', () => {
      wde.register('w1', 5000);
      expect(wde.getThreshold('wde-1')).toBe(5000);
    });

    it('should get hits', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getHits('wde-1')).toBe(1);
    });

    it('should check healthy', () => {
      wde.register('w1');
      expect(wde.isHealthy('wde-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      wde.register('w1');
      expect(wde.setActive('wde-1', false)).toBe(true);
    });

    it('should set name', () => {
      wde.register('w1');
      expect(wde.setName('wde-1', 'w2')).toBe(true);
    });

    it('should set threshold', () => {
      wde.register('w1');
      expect(wde.setThreshold('wde-1', 5000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wde.setActive('unknown', false)).toBe(false);
      expect(wde.setName('unknown', 'w')).toBe(false);
      expect(wde.setThreshold('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      wde.register('w1');
      wde.feed('wde-1');
      wde.setActive('wde-1', false);
      wde.resetAll();
      expect(wde.getFeeds('wde-1')).toBe(0);
      expect(wde.isActive('wde-1')).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      wde.register('w1');
      expect(wde.getByState('healthy')).toHaveLength(1);
    });

    it('should get active', () => {
      wde.register('w1');
      expect(wde.getActiveWatchdogs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      wde.register('w1');
      wde.setActive('wde-1', false);
      expect(wde.getInactiveWatchdogs()).toHaveLength(1);
    });

    it('should get all names', () => {
      wde.register('a');
      wde.register('b');
      expect(wde.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      wde.register('w1');
      expect(wde.getNewest()?.id).toBe('wde-1');
    });

    it('should return null for empty newest', () => {
      expect(wde.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      wde.register('w1');
      expect(wde.getOldest()?.id).toBe('wde-1');
    });

    it('should return null for empty oldest', () => {
      expect(wde.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      wde.register('w1');
      expect(wde.getCreatedAt('wde-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getUpdatedAt('wde-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total fed', () => {
      wde.register('w1');
      wde.feed('wde-1');
      expect(wde.getTotalFed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many watchdogs', () => {
      for (let i = 0; i < 50; i++) {
        wde.register(`w${i}`);
      }
      expect(wde.getCount()).toBe(50);
    });
  });
});