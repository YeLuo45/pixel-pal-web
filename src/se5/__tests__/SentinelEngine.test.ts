/**
 * SentinelEngine Tests
 * generic-agent-design Sentinel Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SentinelEngine } from '../SentinelEngine';

describe('SentinelEngine', () => {
  let se: SentinelEngine;

  beforeEach(() => {
    se = new SentinelEngine();
  });

  afterEach(() => {
    se.clearAll();
  });

  // ============================================================
  // register / watch / unwatch / alert / reset
  // ============================================================
  describe('register / watch / unwatch / alert / reset', () => {
    it('should register', () => {
      expect(se.register('s1')).toBe('se5-1');
    });

    it('should mark as active', () => {
      const id = se.register('s1');
      expect(se.isActive(id)).toBe(true);
    });

    it('should mark as idle', () => {
      const id = se.register('s1');
      expect(se.isIdle(id)).toBe(true);
    });

    it('should watch', () => {
      const id = se.register('s1');
      expect(se.watch(id)).toBe(true);
    });

    it('should mark as watching', () => {
      const id = se.register('s1');
      se.watch(id);
      expect(se.isWatching(id)).toBe(true);
    });

    it('should not watch inactive', () => {
      const id = se.register('s1');
      se.setActive(id, false);
      expect(se.watch(id)).toBe(false);
    });

    it('should not watch twice', () => {
      const id = se.register('s1');
      se.watch(id);
      expect(se.watch(id)).toBe(false);
    });

    it('should return false for unknown watch', () => {
      expect(se.watch('unknown')).toBe(false);
    });

    it('should unwatch', () => {
      const id = se.register('s1');
      se.watch(id);
      expect(se.unwatch(id)).toBe(true);
    });

    it('should mark as idle on unwatch', () => {
      const id = se.register('s1');
      se.watch(id);
      se.unwatch(id);
      expect(se.isIdle(id)).toBe(true);
    });

    it('should not unwatch not watching', () => {
      const id = se.register('s1');
      expect(se.unwatch(id)).toBe(false);
    });

    it('should return false for unknown unwatch', () => {
      expect(se.unwatch('unknown')).toBe(false);
    });

    it('should alert', () => {
      const id = se.register('s1');
      expect(se.alert(id)).toBe(true);
    });

    it('should increment alerts on alert', () => {
      const id = se.register('s1');
      se.alert(id);
      expect(se.getAlerts(id)).toBe(1);
    });

    it('should not alert inactive', () => {
      const id = se.register('s1');
      se.setActive(id, false);
      expect(se.alert(id)).toBe(false);
    });

    it('should return false for unknown alert', () => {
      expect(se.alert('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = se.register('s1');
      se.alert(id);
      expect(se.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = se.register('s1');
      se.alert(id);
      se.reset(id);
      expect(se.getAlerts(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(se.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      se.register('s1');
      const stats = se.getStats();
      expect(stats.sentinels).toBe(1);
    });

    it('should count watching', () => {
      const id = se.register('s1');
      se.watch(id);
      expect(se.getStats().watching).toBe(1);
    });

    it('should count idle', () => {
      se.register('s1');
      expect(se.getStats().idle).toBe(1);
    });

    it('should count total alerts', () => {
      const id = se.register('s1');
      se.alert(id);
      expect(se.getStats().totalAlerts).toBe(1);
    });

    it('should count active', () => {
      se.register('s1');
      expect(se.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = se.register('s1');
      se.setActive(id, false);
      expect(se.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = se.register('s1');
      se.watch(id);
      expect(se.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      se.register('s1');
      se.register('s2');
      expect(se.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg alerts', () => {
      const id = se.register('s1');
      se.alert(id);
      expect(se.getStats().avgAlerts).toBe(1);
    });

    it('should get max alerts', () => {
      const id = se.register('s1');
      se.alert(id);
      se.alert(id);
      expect(se.getStats().maxAlerts).toBe(2);
    });

    it('should get min alerts', () => {
      se.register('s1');
      expect(se.getStats().minAlerts).toBe(0);
    });

    it('should compute alert rate', () => {
      const id = se.register('s1');
      se.alert(id);
      expect(se.getStats().alertRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get sentinel', () => {
      se.register('s1');
      expect(se.getSentinel('se5-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      se.register('s1');
      expect(se.getAllSentinels()).toHaveLength(1);
    });

    it('should remove', () => {
      se.register('s1');
      expect(se.removeSentinel('se5-1')).toBe(true);
    });

    it('should check existence', () => {
      se.register('s1');
      expect(se.hasSentinel('se5-1')).toBe(true);
    });

    it('should count', () => {
      expect(se.getCount()).toBe(0);
      se.register('s1');
      expect(se.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      se.register('s1');
      expect(se.getName('se5-1')).toBe('s1');
    });

    it('should get alerts', () => {
      se.register('s1');
      expect(se.getAlerts('se5-1')).toBe(0);
    });

    it('should get history', () => {
      se.register('s1');
      expect(se.getHistory('se5-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = se.register('s1');
      se.watch(id);
      expect(se.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      se.register('s1');
      expect(se.setActive('se5-1', false)).toBe(true);
    });

    it('should set name', () => {
      se.register('s1');
      expect(se.setName('se5-1', 's2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(se.setActive('unknown', false)).toBe(false);
      expect(se.setName('unknown', 's')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = se.register('s1');
      se.alert(id);
      se.setActive(id, false);
      se.resetAll();
      expect(se.getAlerts(id)).toBe(0);
      expect(se.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      se.register('s1');
      expect(se.getByName('s1')).toHaveLength(1);
    });

    it('should get watching', () => {
      const id = se.register('s1');
      se.watch(id);
      expect(se.getWatchingSentinels()).toHaveLength(1);
    });

    it('should get idle', () => {
      se.register('s1');
      expect(se.getIdleSentinels()).toHaveLength(1);
    });

    it('should get active', () => {
      se.register('s1');
      expect(se.getActiveSentinels()).toHaveLength(1);
    });

    it('should get inactive', () => {
      se.register('s1');
      se.setActive('se5-1', false);
      expect(se.getInactiveSentinels()).toHaveLength(1);
    });

    it('should get all names', () => {
      se.register('s1');
      se.register('s2');
      expect(se.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      se.register('s1');
      expect(se.getNameCount()).toBe(1);
    });

    it('should get by min alerts', () => {
      const id = se.register('s1');
      se.alert(id);
      expect(se.getByMinAlerts(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most alerts', () => {
      const id = se.register('s1');
      se.alert(id);
      se.alert(id);
      expect(se.getMostAlerts()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(se.getMostAlerts()).toBeNull();
    });

    it('should get newest', () => {
      se.register('s1');
      expect(se.getNewest()?.id).toBe('se5-1');
    });

    it('should return null for empty newest', () => {
      expect(se.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      se.register('s1');
      expect(se.getOldest()?.id).toBe('se5-1');
    });

    it('should return null for empty oldest', () => {
      expect(se.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      se.register('s1');
      expect(se.getCreatedAt('se5-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = se.register('s1');
      se.watch(id);
      expect(se.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total alerts', () => {
      const id = se.register('s1');
      se.alert(id);
      expect(se.getTotalAlerts()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many sentinels', () => {
      for (let i = 0; i < 50; i++) {
        se.register(`s${i}`);
      }
      expect(se.getCount()).toBe(50);
    });
  });
});