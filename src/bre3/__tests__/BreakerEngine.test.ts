/**
 * BreakerEngine Tests
 * thunderbolt-design Breaker Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BreakerEngine } from '../BreakerEngine';

describe('BreakerEngine', () => {
  let bre3: BreakerEngine;

  beforeEach(() => {
    bre3 = new BreakerEngine();
  });

  afterEach(() => {
    bre3.clearAll();
  });

  describe('open / trip / reset / halfOpen / remove', () => {
    it('should open', () => {
      expect(bre3.open('b1')).toMatch(/^bre3-/);
    });

    it('should default state to closed', () => {
      bre3.open('b1');
      expect(bre3.getState(bre3.getAllBreakers()[0].id)).toBe('closed');
    });

    it('should default threshold to 5', () => {
      bre3.open('b1');
      expect(bre3.getThreshold(bre3.getAllBreakers()[0].id)).toBe(5);
    });

    it('should default failures to 0', () => {
      bre3.open('b1');
      expect(bre3.getFailures(bre3.getAllBreakers()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      bre3.open('b1');
      expect(bre3.isActive(bre3.getAllBreakers()[0].id)).toBe(true);
    });

    it('should trip', () => {
      const id = bre3.open('b1');
      expect(bre3.trip(id)).toBe(true);
    });

    it('should increment failures', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.getFailures(id)).toBe(1);
    });

    it('should set half-open after first trip', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.isHalfOpen(id)).toBe(true);
    });

    it('should set open after threshold', () => {
      const id = bre3.open('b1', 2);
      bre3.trip(id);
      bre3.trip(id);
      expect(bre3.isOpen(id)).toBe(true);
    });

    it('should not trip inactive', () => {
      const id = bre3.open('b1');
      bre3.setActive(id, false);
      expect(bre3.trip(id)).toBe(false);
    });

    it('should return false for unknown trip', () => {
      expect(bre3.trip('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.reset(id)).toBe(true);
    });

    it('should reset failures to 0', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      bre3.reset(id);
      expect(bre3.getFailures(id)).toBe(0);
    });

    it('should reset state to closed', () => {
      const id = bre3.open('b1', 1);
      bre3.trip(id);
      bre3.reset(id);
      expect(bre3.isClosed(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(bre3.reset('unknown')).toBe(false);
    });

    it('should half-open', () => {
      const id = bre3.open('b1');
      expect(bre3.halfOpen(id)).toBe(true);
    });

    it('should return false for unknown half-open', () => {
      expect(bre3.halfOpen('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = bre3.open('b1');
      expect(bre3.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      bre3.open('b1');
      expect(bre3.getStats().breakers).toBe(1);
    });

    it('should count total opened', () => {
      bre3.open('b1');
      expect(bre3.getStats().totalOpened).toBe(1);
    });

    it('should count total tripped', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.getStats().totalTripped).toBe(1);
    });

    it('should count total reset', () => {
      const id = bre3.open('b1');
      bre3.reset(id);
      expect(bre3.getStats().totalReset).toBe(1);
    });

    it('should count closed', () => {
      bre3.open('b1');
      expect(bre3.getStats().closed).toBe(1);
    });

    it('should count open', () => {
      const id = bre3.open('b1', 1);
      bre3.trip(id);
      expect(bre3.getStats().open).toBe(1);
    });

    it('should count half-open', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.getStats().halfOpen).toBe(1);
    });

    it('should count active', () => {
      bre3.open('b1');
      expect(bre3.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bre3.open('b1');
      bre3.setActive(id, false);
      expect(bre3.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      bre3.open('a');
      bre3.open('a');
      expect(bre3.getStats().uniqueNames).toBe(1);
    });

    it('should count total failures', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.getStats().totalFailures).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get breaker', () => {
      const id = bre3.open('b1');
      expect(bre3.getBreaker(id)?.name).toBe('b1');
    });

    it('should get all', () => {
      bre3.open('b1');
      expect(bre3.getAllBreakers()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = bre3.open('b1');
      expect(bre3.hasBreaker(id)).toBe(true);
    });

    it('should count', () => {
      expect(bre3.getCount()).toBe(0);
      bre3.open('b1');
      expect(bre3.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = bre3.open('b1');
      expect(bre3.getName(id)).toBe('b1');
    });

    it('should get hits', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.getHits(id)).toBe(1);
    });

    it('should check closed', () => {
      bre3.open('b1');
      expect(bre3.isClosed(bre3.getAllBreakers()[0].id)).toBe(true);
    });

    it('should check open', () => {
      const id = bre3.open('b1', 1);
      bre3.trip(id);
      expect(bre3.isOpen(id)).toBe(true);
    });

    it('should check half-open', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.isHalfOpen(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = bre3.open('b1');
      expect(bre3.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = bre3.open('b1');
      expect(bre3.setName(id, 'b2')).toBe(true);
    });

    it('should set threshold', () => {
      const id = bre3.open('b1');
      expect(bre3.setThreshold(id, 10)).toBe(true);
    });

    it('should set failures', () => {
      const id = bre3.open('b1');
      expect(bre3.setFailures(id, 3)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bre3.setActive('unknown', false)).toBe(false);
      expect(bre3.setName('unknown', 'b')).toBe(false);
      expect(bre3.setThreshold('unknown', 1)).toBe(false);
      expect(bre3.setFailures('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      bre3.setActive(id, false);
      bre3.resetAll();
      expect(bre3.getFailures(id)).toBe(0);
      expect(bre3.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      bre3.open('b1');
      expect(bre3.getByState('closed')).toHaveLength(1);
    });

    it('should get active', () => {
      bre3.open('b1');
      expect(bre3.getActiveBreakers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bre3.open('b1');
      bre3.setActive(id, false);
      expect(bre3.getInactiveBreakers()).toHaveLength(1);
    });

    it('should get all names', () => {
      bre3.open('a');
      bre3.open('b');
      expect(bre3.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      bre3.open('b1');
      expect(bre3.getNewest()?.name).toBe('b1');
    });

    it('should return null for empty newest', () => {
      expect(bre3.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bre3.open('b1');
      expect(bre3.getOldest()?.name).toBe('b1');
    });

    it('should return null for empty oldest', () => {
      expect(bre3.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = bre3.open('b1');
      expect(bre3.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total opened', () => {
      bre3.open('b1');
      expect(bre3.getTotalOpened()).toBe(1);
    });

    it('should get total tripped', () => {
      const id = bre3.open('b1');
      bre3.trip(id);
      expect(bre3.getTotalTripped()).toBe(1);
    });

    it('should get total reset', () => {
      const id = bre3.open('b1');
      bre3.reset(id);
      expect(bre3.getTotalReset()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many breakers', () => {
      for (let i = 0; i < 50; i++) {
        bre3.open(`b${i}`);
      }
      expect(bre3.getCount()).toBe(50);
    });
  });
});