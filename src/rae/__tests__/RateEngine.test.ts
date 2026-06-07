/**
 * RateEngine Tests
 * thunderbolt-design Rate Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RateEngine } from '../RateEngine';

describe('RateEngine', () => {
  let rae: RateEngine;

  beforeEach(() => {
    rae = new RateEngine();
  });

  afterEach(() => {
    rae.clearAll();
  });

  describe('add / tick / block / reset / remove', () => {
    it('should add', () => {
      expect(rae.add('r1', 10)).toMatch(/^rae-/);
    });

    it('should default state to ok', () => {
      rae.add('r1', 10);
      expect(rae.getState(rae.getAllRates()[0].id)).toBe('ok');
    });

    it('should default count to 0', () => {
      rae.add('r1', 10);
      expect(rae.getCurrent(rae.getAllRates()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      rae.add('r1', 10);
      expect(rae.isActive(rae.getAllRates()[0].id)).toBe(true);
    });

    it('should tick', () => {
      const id = rae.add('r1', 10);
      expect(rae.tick(id)).toBe(true);
    });

    it('should increment count', () => {
      const id = rae.add('r1', 10);
      rae.tick(id);
      expect(rae.getCurrent(id)).toBe(1);
    });

    it('should set limited when count equals limit', () => {
      const id = rae.add('r1', 1);
      rae.tick(id);
      expect(rae.isLimited(id)).toBe(true);
    });

    it('should not tick inactive', () => {
      const id = rae.add('r1', 10);
      rae.setActive(id, false);
      expect(rae.tick(id)).toBe(false);
    });

    it('should return false for unknown tick', () => {
      expect(rae.tick('unknown')).toBe(false);
    });

    it('should block', () => {
      const id = rae.add('r1', 10);
      expect(rae.block(id)).toBe(true);
    });

    it('should set blocked', () => {
      const id = rae.add('r1', 10);
      rae.block(id);
      expect(rae.isBlocked(id)).toBe(true);
    });

    it('should return false for unknown block', () => {
      expect(rae.block('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = rae.add('r1', 10);
      rae.tick(id);
      expect(rae.reset(id)).toBe(true);
    });

    it('should reset count to 0', () => {
      const id = rae.add('r1', 10);
      rae.tick(id);
      rae.reset(id);
      expect(rae.getCurrent(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(rae.reset('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = rae.add('r1', 10);
      expect(rae.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      rae.add('r1', 10);
      expect(rae.getStats().rates).toBe(1);
    });

    it('should count total added', () => {
      rae.add('r1', 10);
      expect(rae.getStats().totalAdded).toBe(1);
    });

    it('should count total limited', () => {
      const id = rae.add('r1', 1);
      rae.tick(id);
      expect(rae.getStats().totalLimited).toBe(1);
    });

    it('should count total blocked', () => {
      const id = rae.add('r1', 10);
      rae.block(id);
      expect(rae.getStats().totalBlocked).toBe(1);
    });

    it('should count ok', () => {
      rae.add('r1', 10);
      expect(rae.getStats().ok).toBe(1);
    });

    it('should count limited', () => {
      const id = rae.add('r1', 1);
      rae.tick(id);
      expect(rae.getStats().limited).toBe(1);
    });

    it('should count blocked', () => {
      const id = rae.add('r1', 10);
      rae.block(id);
      expect(rae.getStats().blocked).toBe(1);
    });

    it('should count active', () => {
      rae.add('r1', 10);
      expect(rae.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rae.add('r1', 10);
      rae.setActive(id, false);
      expect(rae.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rae.add('r1', 10);
      rae.tick(id);
      expect(rae.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      rae.add('a', 10);
      rae.add('a', 10);
      expect(rae.getStats().uniqueNames).toBe(1);
    });

    it('should count total limit', () => {
      rae.add('a', 10);
      expect(rae.getStats().totalLimit).toBe(10);
    });
  });

  describe('queries', () => {
    it('should get rate', () => {
      const id = rae.add('r1', 10);
      expect(rae.getRate(id)?.name).toBe('r1');
    });

    it('should get all', () => {
      rae.add('r1', 10);
      expect(rae.getAllRates()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = rae.add('r1', 10);
      expect(rae.hasRate(id)).toBe(true);
    });

    it('should count', () => {
      expect(rae.getCount()).toBe(0);
      rae.add('r1', 10);
      expect(rae.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = rae.add('r1', 10);
      expect(rae.getName(id)).toBe('r1');
    });

    it('should get limit', () => {
      const id = rae.add('r1', 10);
      expect(rae.getLimit(id)).toBe(10);
    });

    it('should get hits', () => {
      const id = rae.add('r1', 10);
      rae.tick(id);
      expect(rae.getHits(id)).toBe(1);
    });

    it('should check ok', () => {
      rae.add('r1', 10);
      expect(rae.isOK(rae.getAllRates()[0].id)).toBe(true);
    });

    it('should check limited', () => {
      const id = rae.add('r1', 1);
      rae.tick(id);
      expect(rae.isLimited(id)).toBe(true);
    });

    it('should check blocked', () => {
      const id = rae.add('r1', 10);
      rae.block(id);
      expect(rae.isBlocked(id)).toBe(true);
    });

    it('should check over limit', () => {
      const id = rae.add('r1', 1);
      rae.tick(id);
      expect(rae.isOverLimit(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = rae.add('r1', 10);
      expect(rae.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = rae.add('r1', 10);
      expect(rae.setName(id, 'r2')).toBe(true);
    });

    it('should set limit', () => {
      const id = rae.add('r1', 10);
      expect(rae.setLimit(id, 20)).toBe(true);
    });

    it('should set count', () => {
      const id = rae.add('r1', 10);
      expect(rae.setCount(id, 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rae.setActive('unknown', false)).toBe(false);
      expect(rae.setName('unknown', 'r')).toBe(false);
      expect(rae.setLimit('unknown', 1)).toBe(false);
      expect(rae.setCount('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = rae.add('r1', 10);
      rae.tick(id);
      rae.setActive(id, false);
      rae.resetAll();
      expect(rae.getCurrent(id)).toBe(0);
      expect(rae.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      rae.add('r1', 10);
      expect(rae.getByState('ok')).toHaveLength(1);
    });

    it('should get active', () => {
      rae.add('r1', 10);
      expect(rae.getActiveRates()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = rae.add('r1', 10);
      rae.setActive(id, false);
      expect(rae.getInactiveRates()).toHaveLength(1);
    });

    it('should get all names', () => {
      rae.add('a', 10);
      rae.add('b', 10);
      expect(rae.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      rae.add('r1', 10);
      expect(rae.getNewest()?.name).toBe('r1');
    });

    it('should return null for empty newest', () => {
      expect(rae.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rae.add('r1', 10);
      expect(rae.getOldest()?.name).toBe('r1');
    });

    it('should return null for empty oldest', () => {
      expect(rae.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = rae.add('r1', 10);
      expect(rae.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rae.add('r1', 10);
      rae.tick(id);
      expect(rae.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      rae.add('r1', 10);
      expect(rae.getTotalAdded()).toBe(1);
    });

    it('should get total limited', () => {
      const id = rae.add('r1', 1);
      rae.tick(id);
      expect(rae.getTotalLimited()).toBe(1);
    });

    it('should get total blocked', () => {
      const id = rae.add('r1', 10);
      rae.block(id);
      expect(rae.getTotalBlocked()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many rates', () => {
      for (let i = 0; i < 50; i++) {
        rae.add(`r${i}`, 10);
      }
      expect(rae.getCount()).toBe(50);
    });
  });
});