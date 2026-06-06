/**
 * CadenceEngine Tests
 * generic-agent-design Cadence Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CadenceEngine } from '../CadenceEngine';

describe('CadenceEngine', () => {
  let cde: CadenceEngine;

  beforeEach(() => {
    cde = new CadenceEngine();
  });

  afterEach(() => {
    cde.clearAll();
  });

  // ============================================================
  // set / tick / reset
  // ============================================================
  describe('set / tick / reset', () => {
    it('should set', () => {
      expect(cde.set('c1', 'normal', 1000)).toBe('cde-1');
    });

    it('should mark as active', () => {
      const id = cde.set('c1', 'normal', 1000);
      expect(cde.isActive(id)).toBe(true);
    });

    it('should default to normal', () => {
      const id = cde.set('c1', 'normal', 1000);
      expect(cde.isNormal(id)).toBe(true);
    });

    it('should mark as fast', () => {
      const id = cde.set('c1', 'fast', 100);
      expect(cde.isFast(id)).toBe(true);
    });

    it('should mark as slow', () => {
      const id = cde.set('c1', 'slow', 5000);
      expect(cde.isSlow(id)).toBe(true);
    });

    it('should mark as idle', () => {
      const id = cde.set('c1', 'idle', 10000);
      expect(cde.isIdle(id)).toBe(true);
    });

    it('should tick', () => {
      const id = cde.set('c1', 'normal', 1000);
      expect(cde.tick(id)).toBe(true);
    });

    it('should increment ticks on tick', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getTicks(id)).toBe(1);
    });

    it('should set lastTick on tick', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getLastTick(id)).toBeGreaterThan(0);
    });

    it('should log history on tick', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getHistory(id)).toHaveLength(1);
    });

    it('should not tick inactive', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.setActive(id, false);
      expect(cde.tick(id)).toBe(false);
    });

    it('should return false for unknown tick', () => {
      expect(cde.tick('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      cde.reset(id);
      expect(cde.getTicks(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(cde.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cde.set('c1', 'normal', 1000);
      const stats = cde.getStats();
      expect(stats.cadences).toBe(1);
    });

    it('should count total ticks', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getStats().totalTicks).toBe(1);
    });

    it('should count fast', () => {
      cde.set('c1', 'fast', 100);
      expect(cde.getStats().fast).toBe(1);
    });

    it('should count normal', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getStats().normal).toBe(1);
    });

    it('should count slow', () => {
      cde.set('c1', 'slow', 5000);
      expect(cde.getStats().slow).toBe(1);
    });

    it('should count idle', () => {
      cde.set('c1', 'idle', 10000);
      expect(cde.getStats().idle).toBe(1);
    });

    it('should count active', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.setActive(id, false);
      expect(cde.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      cde.set('c1', 'normal', 1000);
      cde.set('c2', 'normal', 1000);
      expect(cde.getStats().uniqueNames).toBe(2);
    });

    it('should count unique types', () => {
      cde.set('c1', 'fast', 100);
      cde.set('c2', 'slow', 5000);
      expect(cde.getStats().uniqueTypes).toBe(2);
    });

    it('should compute avg ticks', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getStats().avgTicks).toBe(1);
    });

    it('should get max ticks', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      cde.tick(id);
      expect(cde.getStats().maxTicks).toBe(2);
    });

    it('should get min ticks', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getStats().minTicks).toBe(0);
    });

    it('should compute avg interval', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getStats().avgInterval).toBe(1000);
    });

    it('should get max interval', () => {
      cde.set('c1', 'fast', 100);
      cde.set('c2', 'slow', 5000);
      expect(cde.getStats().maxInterval).toBe(5000);
    });

    it('should get min interval', () => {
      cde.set('c1', 'fast', 100);
      cde.set('c2', 'slow', 5000);
      expect(cde.getStats().minInterval).toBe(100);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get cadence', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getCadence('cde-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getAllCadences()).toHaveLength(1);
    });

    it('should remove', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.removeCadence('cde-1')).toBe(true);
    });

    it('should check existence', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.hasCadence('cde-1')).toBe(true);
    });

    it('should count', () => {
      expect(cde.getCount()).toBe(0);
      cde.set('c1', 'normal', 1000);
      expect(cde.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getName('cde-1')).toBe('c1');
    });

    it('should get type', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getType('cde-1')).toBe('normal');
    });

    it('should get interval', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getInterval('cde-1')).toBe(1000);
    });

    it('should get history', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getHistory('cde-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.setActive('cde-1', false)).toBe(true);
    });

    it('should set name', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.setName('cde-1', 'c2')).toBe(true);
    });

    it('should set type', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.setType('cde-1', 'fast')).toBe(true);
    });

    it('should set interval', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.setInterval('cde-1', 2000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cde.setActive('unknown', false)).toBe(false);
      expect(cde.setName('unknown', 'c')).toBe(false);
      expect(cde.setType('unknown', 'normal')).toBe(false);
      expect(cde.setInterval('unknown', 1000)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      cde.setActive(id, false);
      cde.resetAll();
      expect(cde.getTicks(id)).toBe(0);
      expect(cde.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / type / state
  // ============================================================
  describe('by name / type / state', () => {
    it('should get by name', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getByName('c1')).toHaveLength(1);
    });

    it('should get by type', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getByType('normal')).toHaveLength(1);
    });

    it('should get fast', () => {
      cde.set('c1', 'fast', 100);
      expect(cde.getFastCadences()).toHaveLength(1);
    });

    it('should get normal', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getNormalCadences()).toHaveLength(1);
    });

    it('should get slow', () => {
      cde.set('c1', 'slow', 5000);
      expect(cde.getSlowCadences()).toHaveLength(1);
    });

    it('should get idle', () => {
      cde.set('c1', 'idle', 10000);
      expect(cde.getIdleCadences()).toHaveLength(1);
    });

    it('should get active', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getActiveCadences()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cde.set('c1', 'normal', 1000);
      cde.setActive('cde-1', false);
      expect(cde.getInactiveCadences()).toHaveLength(1);
    });

    it('should get all names', () => {
      cde.set('c1', 'normal', 1000);
      cde.set('c2', 'normal', 1000);
      expect(cde.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getNameCount()).toBe(1);
    });

    it('should get by min ticks', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getByMinTicks(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most ticks', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      cde.tick(id);
      expect(cde.getMostTicks()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(cde.getMostTicks()).toBeNull();
    });

    it('should get newest', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getNewest()?.id).toBe('cde-1');
    });

    it('should return null for empty newest', () => {
      expect(cde.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getOldest()?.id).toBe('cde-1');
    });

    it('should return null for empty oldest', () => {
      expect(cde.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cde.set('c1', 'normal', 1000);
      expect(cde.getCreatedAt('cde-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total ticks', () => {
      const id = cde.set('c1', 'normal', 1000);
      cde.tick(id);
      expect(cde.getTotalTicks()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many cadences', () => {
      for (let i = 0; i < 50; i++) {
        cde.set(`c${i}`, 'normal', 1000);
      }
      expect(cde.getCount()).toBe(50);
    });
  });
});