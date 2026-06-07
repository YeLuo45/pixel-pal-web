/**
 * TimeoutEngine Tests
 * thunderbolt-design Timeout Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TimeoutEngine } from '../TimeoutEngine';

describe('TimeoutEngine', () => {
  let toe2: TimeoutEngine;

  beforeEach(() => {
    toe2 = new TimeoutEngine();
  });

  afterEach(() => {
    toe2.clearAll();
  });

  describe('set / check / cancel / clear', () => {
    it('should set', () => {
      expect(toe2.set('t1', 100)).toMatch(/^toe2-/);
    });

    it('should default status to pending', () => {
      toe2.set('t1', 100);
      expect(toe2.getStatus(toe2.getAllTimeouts()[0].id)).toBe('pending');
    });

    it('should mark as active', () => {
      toe2.set('t1', 100);
      expect(toe2.isActive(toe2.getAllTimeouts()[0].id)).toBe(true);
    });

    it('should check pending', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.check(id, 10)).toBe('pending');
    });

    it('should check expired', () => {
      const id = toe2.set('t1', 10);
      expect(toe2.check(id, 10)).toBe('expired');
    });

    it('should return cancelled for unknown check', () => {
      expect(toe2.check('unknown', 10)).toBe('cancelled');
    });

    it('should cancel', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.cancel(id)).toBe(true);
    });

    it('should return false for unknown cancel', () => {
      expect(toe2.cancel('unknown')).toBe(false);
    });

    it('should clear', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.clear(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      toe2.set('t1', 100);
      expect(toe2.getStats().timeouts).toBe(1);
    });

    it('should count total set', () => {
      toe2.set('t1', 100);
      expect(toe2.getStats().totalSet).toBe(1);
    });

    it('should count total expired', () => {
      const id = toe2.set('t1', 1);
      toe2.check(id, 1);
      expect(toe2.getStats().totalExpired).toBe(1);
    });

    it('should count total cancelled', () => {
      const id = toe2.set('t1', 100);
      toe2.cancel(id);
      expect(toe2.getStats().totalCancelled).toBe(1);
    });

    it('should count pending', () => {
      toe2.set('t1', 100);
      expect(toe2.getStats().pending).toBe(1);
    });

    it('should count expired', () => {
      const id = toe2.set('t1', 1);
      toe2.check(id, 1);
      expect(toe2.getStats().expired).toBe(1);
    });

    it('should count cancelled', () => {
      const id = toe2.set('t1', 100);
      toe2.cancel(id);
      expect(toe2.getStats().cancelled).toBe(1);
    });

    it('should count active', () => {
      toe2.set('t1', 100);
      expect(toe2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = toe2.set('t1', 100);
      toe2.setActive(id, false);
      expect(toe2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = toe2.set('t1', 100);
      toe2.check(id, 10);
      expect(toe2.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      toe2.set('a', 100);
      toe2.set('a', 100);
      expect(toe2.getStats().uniqueNames).toBe(1);
    });

    it('should count total duration', () => {
      toe2.set('t1', 100);
      expect(toe2.getStats().totalDuration).toBe(100);
    });

    it('should count total elapsed', () => {
      const id = toe2.set('t1', 100);
      toe2.check(id, 10);
      expect(toe2.getStats().totalElapsed).toBe(10);
    });
  });

  describe('queries', () => {
    it('should get timeout', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.getTimeout(id)?.name).toBe('t1');
    });

    it('should get all', () => {
      toe2.set('t1', 100);
      expect(toe2.getAllTimeouts()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.hasTimeout(id)).toBe(true);
    });

    it('should count', () => {
      expect(toe2.getCount()).toBe(0);
      toe2.set('t1', 100);
      expect(toe2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.getName(id)).toBe('t1');
    });

    it('should get duration', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.getDuration(id)).toBe(100);
    });

    it('should get remaining', () => {
      const id = toe2.set('t1', 100);
      toe2.check(id, 10);
      expect(toe2.getRemaining(id)).toBe(90);
    });

    it('should get hits', () => {
      const id = toe2.set('t1', 100);
      toe2.check(id, 10);
      expect(toe2.getHits(id)).toBe(1);
    });

    it('should check pending', () => {
      toe2.set('t1', 100);
      expect(toe2.isPending(toe2.getAllTimeouts()[0].id)).toBe(true);
    });

    it('should check expired', () => {
      const id = toe2.set('t1', 1);
      toe2.check(id, 1);
      expect(toe2.isExpired(id)).toBe(true);
    });

    it('should check cancelled', () => {
      const id = toe2.set('t1', 100);
      toe2.cancel(id);
      expect(toe2.isCancelled(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.setActive(id, false)).toBe(true);
    });

    it('should set duration', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.setDuration(id, 200)).toBe(true);
    });

    it('should set elapsed', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.setElapsed(id, 50)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(toe2.setActive('unknown', false)).toBe(false);
      expect(toe2.setDuration('unknown', 1)).toBe(false);
      expect(toe2.setElapsed('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = toe2.set('t1', 100);
      toe2.check(id, 50);
      toe2.setActive(id, false);
      toe2.resetAll();
      expect(toe2.getElapsed(id)).toBe(0);
      expect(toe2.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      toe2.set('t1', 100);
      expect(toe2.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      toe2.set('t1', 100);
      expect(toe2.getActiveTimeouts()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = toe2.set('t1', 100);
      toe2.setActive(id, false);
      expect(toe2.getInactiveTimeouts()).toHaveLength(1);
    });

    it('should get all names', () => {
      toe2.set('a', 100);
      toe2.set('b', 100);
      expect(toe2.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      toe2.set('t1', 100);
      expect(toe2.getNewest()?.name).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(toe2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      toe2.set('t1', 100);
      expect(toe2.getOldest()?.name).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(toe2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = toe2.set('t1', 100);
      expect(toe2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = toe2.set('t1', 100);
      toe2.check(id, 10);
      expect(toe2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total set', () => {
      toe2.set('t1', 100);
      expect(toe2.getTotalSet()).toBe(1);
    });

    it('should get total expired', () => {
      const id = toe2.set('t1', 1);
      toe2.check(id, 1);
      expect(toe2.getTotalExpired()).toBe(1);
    });

    it('should get total cancelled', () => {
      const id = toe2.set('t1', 100);
      toe2.cancel(id);
      expect(toe2.getTotalCancelled()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many timeouts', () => {
      for (let i = 0; i < 50; i++) {
        toe2.set(`t${i}`, 100);
      }
      expect(toe2.getCount()).toBe(50);
    });
  });
});