/**
 * RangeEngine Tests
 * nanobot-design Range Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RangeEngine } from '../RangeEngine';

describe('RangeEngine', () => {
  let rne: RangeEngine;

  beforeEach(() => {
    rne = new RangeEngine();
  });

  afterEach(() => {
    rne.clearAll();
  });

  describe('add / check / remove', () => {
    it('should add', () => {
      expect(rne.add('r1', 0, 10, 'numeric')).toMatch(/^rne-/);
    });

    it('should mark as active', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.isActive(rne.getAllRanges()[0].id)).toBe(true);
    });

    it('should check in range', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.check(id, 5)).toBe(true);
    });

    it('should check below range', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.check(id, -1)).toBe(false);
    });

    it('should check above range', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.check(id, 11)).toBe(false);
    });

    it('should check at boundary', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.check(id, 0)).toBe(true);
      expect(rne.check(id, 10)).toBe(true);
    });

    it('should check string range', () => {
      const id = rne.add('r1', 'a', 'z', 'string');
      expect(rne.check(id, 'm')).toBe(true);
    });

    it('should not check inactive', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.setActive(id, false);
      expect(rne.check(id, 5)).toBe(false);
    });

    it('should return false for unknown check', () => {
      expect(rne.check('unknown', 5)).toBe(false);
    });

    it('should remove', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getStats().ranges).toBe(1);
    });

    it('should count total added', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getStats().totalAdded).toBe(1);
    });

    it('should count total checked', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.check(id, 5);
      expect(rne.getStats().totalChecked).toBe(1);
    });

    it('should count numeric', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getStats().numeric).toBe(1);
    });

    it('should count date', () => {
      rne.add('r1', '2020-01-01', '2025-01-01', 'date');
      expect(rne.getStats().date).toBe(1);
    });

    it('should count time', () => {
      rne.add('r1', '00:00', '23:59', 'time');
      expect(rne.getStats().time).toBe(1);
    });

    it('should count string', () => {
      rne.add('r1', 'a', 'z', 'string');
      expect(rne.getStats().string).toBe(1);
    });

    it('should count active', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.setActive(id, false);
      expect(rne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.check(id, 5);
      expect(rne.getStats().totalHits).toBe(1);
    });

    it('should count total matches', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.check(id, 5);
      expect(rne.getStats().totalMatches).toBe(1);
    });

    it('should count unique names', () => {
      rne.add('a', 0, 10, 'numeric');
      rne.add('a', 0, 10, 'numeric');
      expect(rne.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get range', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.getRange(id)?.name).toBe('r1');
    });

    it('should get all', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getAllRanges()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.hasRange(id)).toBe(true);
    });

    it('should count', () => {
      expect(rne.getCount()).toBe(0);
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.getName(id)).toBe('r1');
    });

    it('should get min', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.getMin(id)).toBe(0);
    });

    it('should get max', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.getMax(id)).toBe(10);
    });

    it('should get hits', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.check(id, 5);
      expect(rne.getHits(id)).toBe(1);
    });

    it('should get matches', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.check(id, 5);
      expect(rne.getMatches(id)).toBe(1);
    });

    it('should check numeric', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.isNumeric(rne.getAllRanges()[0].id)).toBe(true);
    });

    it('should check date', () => {
      rne.add('r1', 'a', 'b', 'date');
      expect(rne.isDate(rne.getAllRanges()[0].id)).toBe(true);
    });

    it('should check time', () => {
      rne.add('r1', 'a', 'b', 'time');
      expect(rne.isTime(rne.getAllRanges()[0].id)).toBe(true);
    });

    it('should check string', () => {
      rne.add('r1', 'a', 'z', 'string');
      expect(rne.isString(rne.getAllRanges()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.setName(id, 'r2')).toBe(true);
    });

    it('should set min', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.setMin(id, 5)).toBe(true);
    });

    it('should set max', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.setMax(id, 20)).toBe(true);
    });

    it('should set kind', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.setKind(id, 'string')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rne.setActive('unknown', false)).toBe(false);
      expect(rne.setName('unknown', 'r')).toBe(false);
      expect(rne.setMin('unknown', 0)).toBe(false);
      expect(rne.setMax('unknown', 10)).toBe(false);
      expect(rne.setKind('unknown', 'numeric')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.check(id, 5);
      rne.setActive(id, false);
      rne.resetAll();
      expect(rne.getHits(id)).toBe(0);
      expect(rne.isActive(id)).toBe(true);
    });
  });

  describe('by kind / state', () => {
    it('should get by kind', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getByKind('numeric')).toHaveLength(1);
    });

    it('should get active', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getActiveRanges()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.setActive(id, false);
      expect(rne.getInactiveRanges()).toHaveLength(1);
    });

    it('should get all names', () => {
      rne.add('a', 0, 10, 'numeric');
      rne.add('b', 0, 10, 'numeric');
      expect(rne.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getNewest()?.name).toBe('r1');
    });

    it('should return null for empty newest', () => {
      expect(rne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getOldest()?.name).toBe('r1');
    });

    it('should return null for empty oldest', () => {
      expect(rne.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      expect(rne.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.check(id, 5);
      expect(rne.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      rne.add('r1', 0, 10, 'numeric');
      expect(rne.getTotalAdded()).toBe(1);
    });

    it('should get total checked', () => {
      const id = rne.add('r1', 0, 10, 'numeric');
      rne.check(id, 5);
      expect(rne.getTotalChecked()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many ranges', () => {
      for (let i = 0; i < 50; i++) {
        rne.add(`r${i}`, 0, 10, 'numeric');
      }
      expect(rne.getCount()).toBe(50);
    });
  });
});