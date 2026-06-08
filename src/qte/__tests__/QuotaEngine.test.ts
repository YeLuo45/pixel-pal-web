/**
 * QuotaEngine Tests
 * nanobot-design Quota Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuotaEngine } from '../QuotaEngine';

describe('QuotaEngine', () => {
  let qte: QuotaEngine;

  beforeEach(() => {
    qte = new QuotaEngine();
  });

  afterEach(() => {
    qte.clearAll();
  });

  describe('add / use / reset / remove', () => {
    it('should add', () => {
      expect(qte.add('q1', 'hour', 100)).toMatch(/^qte-/);
    });

    it('should mark as active', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.isActive(qte.getAllQuotas()[0].id)).toBe(true);
    });

    it('should use', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.use(id, 1)).toBe(true);
    });

    it('should increment used', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 5);
      expect(qte.getUsed(id)).toBe(5);
    });

    it('should not use when exhausted', () => {
      const id = qte.add('q1', 'hour', 10);
      qte.use(id, 10);
      expect(qte.use(id, 1)).toBe(false);
    });

    it('should not use inactive', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.setActive(id, false);
      expect(qte.use(id, 1)).toBe(false);
    });

    it('should return false for unknown use', () => {
      expect(qte.use('unknown', 1)).toBe(false);
    });

    it('should reset', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 5);
      expect(qte.reset(id)).toBe(true);
    });

    it('should clear used on reset', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 5);
      qte.reset(id);
      expect(qte.getUsed(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(qte.reset('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getStats().quotas).toBe(1);
    });

    it('should count total added', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getStats().totalAdded).toBe(1);
    });

    it('should count total used', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 5);
      expect(qte.getStats().totalUsed).toBe(5);
    });

    it('should count total reset', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 5);
      qte.reset(id);
      expect(qte.getStats().totalReset).toBe(1);
    });

    it('should count minute', () => {
      qte.add('q1', 'minute', 100);
      expect(qte.getStats().minute).toBe(1);
    });

    it('should count hour', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getStats().hour).toBe(1);
    });

    it('should count day', () => {
      qte.add('q1', 'day', 100);
      expect(qte.getStats().day).toBe(1);
    });

    it('should count week', () => {
      qte.add('q1', 'week', 100);
      expect(qte.getStats().week).toBe(1);
    });

    it('should count month', () => {
      qte.add('q1', 'month', 100);
      expect(qte.getStats().month).toBe(1);
    });

    it('should count active', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.setActive(id, false);
      expect(qte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 1);
      expect(qte.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      qte.add('a', 'hour', 100);
      qte.add('a', 'hour', 100);
      expect(qte.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get quota', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.getQuota(id)?.name).toBe('q1');
    });

    it('should get all', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getAllQuotas()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.hasQuota(id)).toBe(true);
    });

    it('should count', () => {
      expect(qte.getCount()).toBe(0);
      qte.add('q1', 'hour', 100);
      expect(qte.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = qte.add('hello', 'hour', 100);
      expect(qte.getName(id)).toBe('hello');
    });

    it('should get period', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.getPeriod(id)).toBe('hour');
    });

    it('should get limit', () => {
      const id = qte.add('q1', 'hour', 50);
      expect(qte.getLimit(id)).toBe(50);
    });

    it('should get remaining', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 30);
      expect(qte.getRemaining(id)).toBe(70);
    });

    it('should get hits', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 1);
      expect(qte.getHits(id)).toBe(1);
    });

    it('should get reset at', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.getResetAt(id)).toBeGreaterThan(0);
    });

    it('should check exhausted', () => {
      const id = qte.add('q1', 'hour', 10);
      qte.use(id, 10);
      expect(qte.isExhausted(id)).toBe(true);
    });

    it('should check minute', () => {
      qte.add('q1', 'minute', 100);
      expect(qte.isMinute(qte.getAllQuotas()[0].id)).toBe(true);
    });

    it('should check hour', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.isHour(qte.getAllQuotas()[0].id)).toBe(true);
    });

    it('should check day', () => {
      qte.add('q1', 'day', 100);
      expect(qte.isDay(qte.getAllQuotas()[0].id)).toBe(true);
    });

    it('should check week', () => {
      qte.add('q1', 'week', 100);
      expect(qte.isWeek(qte.getAllQuotas()[0].id)).toBe(true);
    });

    it('should check month', () => {
      qte.add('q1', 'month', 100);
      expect(qte.isMonth(qte.getAllQuotas()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.setName(id, 'q2')).toBe(true);
    });

    it('should set period', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.setPeriod(id, 'day')).toBe(true);
    });

    it('should set limit', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.setLimit(id, 200)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(qte.setActive('unknown', false)).toBe(false);
      expect(qte.setName('unknown', 'q')).toBe(false);
      expect(qte.setPeriod('unknown', 'hour')).toBe(false);
      expect(qte.setLimit('unknown', 100)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 5);
      qte.setActive(id, false);
      qte.resetAll();
      expect(qte.getUsed(id)).toBe(0);
      expect(qte.isActive(id)).toBe(true);
    });
  });

  describe('by period / state', () => {
    it('should get by period', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getByPeriod('hour')).toHaveLength(1);
    });

    it('should get active', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getActiveQuotas()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.setActive(id, false);
      expect(qte.getInactiveQuotas()).toHaveLength(1);
    });

    it('should get all names', () => {
      qte.add('a', 'hour', 100);
      qte.add('b', 'hour', 100);
      expect(qte.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getNewest()?.name).toBe('q1');
    });

    it('should return null for empty newest', () => {
      expect(qte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getOldest()?.name).toBe('q1');
    });

    it('should return null for empty oldest', () => {
      expect(qte.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = qte.add('q1', 'hour', 100);
      expect(qte.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 1);
      expect(qte.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      qte.add('q1', 'hour', 100);
      expect(qte.getTotalAdded()).toBe(1);
    });

    it('should get total used', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 5);
      expect(qte.getTotalUsed()).toBe(5);
    });

    it('should get total reset', () => {
      const id = qte.add('q1', 'hour', 100);
      qte.use(id, 5);
      qte.reset(id);
      expect(qte.getTotalReset()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many quotas', () => {
      for (let i = 0; i < 50; i++) {
        qte.add(`q${i}`, 'hour', 100);
      }
      expect(qte.getCount()).toBe(50);
    });
  });
});