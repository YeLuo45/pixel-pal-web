/**
 * LoadEngine Tests
 * nanobot-design Load Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LoadEngine } from '../LoadEngine';

describe('LoadEngine', () => {
  let lde: LoadEngine;

  beforeEach(() => {
    lde = new LoadEngine();
  });

  afterEach(() => {
    lde.clearAll();
  });

  describe('record / balance / remove', () => {
    it('should record', () => {
      expect(lde.record('n1', 50)).toMatch(/^lde-/);
    });

    it('should set status by value (low)', () => {
      lde.record('n1', 10);
      expect(lde.getStatus(lde.getAllLoads()[0].id)).toBe('low');
    });

    it('should set status by value (normal)', () => {
      lde.record('n1', 50);
      expect(lde.getStatus(lde.getAllLoads()[0].id)).toBe('normal');
    });

    it('should set status by value (high)', () => {
      lde.record('n1', 80);
      expect(lde.getStatus(lde.getAllLoads()[0].id)).toBe('high');
    });

    it('should set status by value (critical)', () => {
      lde.record('n1', 95);
      expect(lde.getStatus(lde.getAllLoads()[0].id)).toBe('critical');
    });

    it('should mark as active', () => {
      lde.record('n1', 50);
      expect(lde.isActive(lde.getAllLoads()[0].id)).toBe(true);
    });

    it('should balance', () => {
      const id = lde.record('n1', 50);
      expect(lde.balance(id, 80)).toBe(true);
    });

    it('should update status on balance', () => {
      const id = lde.record('n1', 50);
      lde.balance(id, 95);
      expect(lde.isCritical(id)).toBe(true);
    });

    it('should not balance inactive', () => {
      const id = lde.record('n1', 50);
      lde.setActive(id, false);
      expect(lde.balance(id, 80)).toBe(false);
    });

    it('should return false for unknown balance', () => {
      expect(lde.balance('unknown', 50)).toBe(false);
    });

    it('should remove', () => {
      const id = lde.record('n1', 50);
      expect(lde.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      lde.record('n1', 50);
      expect(lde.getStats().loads).toBe(1);
    });

    it('should count total recorded', () => {
      lde.record('n1', 50);
      expect(lde.getStats().totalRecorded).toBe(1);
    });

    it('should count total balanced', () => {
      const id = lde.record('n1', 50);
      lde.balance(id, 80);
      expect(lde.getStats().totalBalanced).toBe(1);
    });

    it('should count low', () => {
      lde.record('n1', 10);
      expect(lde.getStats().low).toBe(1);
    });

    it('should count normal', () => {
      lde.record('n1', 50);
      expect(lde.getStats().normal).toBe(1);
    });

    it('should count high', () => {
      lde.record('n1', 80);
      expect(lde.getStats().high).toBe(1);
    });

    it('should count critical', () => {
      lde.record('n1', 95);
      expect(lde.getStats().critical).toBe(1);
    });

    it('should count active', () => {
      lde.record('n1', 50);
      expect(lde.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = lde.record('n1', 50);
      lde.setActive(id, false);
      expect(lde.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = lde.record('n1', 50);
      lde.balance(id, 80);
      expect(lde.getStats().totalHits).toBe(1);
    });

    it('should count unique nodes', () => {
      lde.record('a', 50);
      lde.record('a', 50);
      expect(lde.getStats().uniqueNodes).toBe(1);
    });

    it('should count total value', () => {
      lde.record('n1', 50);
      expect(lde.getStats().totalValue).toBe(50);
    });
  });

  describe('queries', () => {
    it('should get load', () => {
      const id = lde.record('n1', 50);
      expect(lde.getLoad(id)?.node).toBe('n1');
    });

    it('should get all', () => {
      lde.record('n1', 50);
      expect(lde.getAllLoads()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = lde.record('n1', 50);
      expect(lde.hasLoad(id)).toBe(true);
    });

    it('should count', () => {
      expect(lde.getCount()).toBe(0);
      lde.record('n1', 50);
      expect(lde.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get node', () => {
      const id = lde.record('n1', 50);
      expect(lde.getNode(id)).toBe('n1');
    });

    it('should get value', () => {
      const id = lde.record('n1', 50);
      expect(lde.getValue(id)).toBe(50);
    });

    it('should get hits', () => {
      const id = lde.record('n1', 50);
      lde.balance(id, 80);
      expect(lde.getHits(id)).toBe(1);
    });

    it('should check low', () => {
      lde.record('n1', 10);
      expect(lde.isLow(lde.getAllLoads()[0].id)).toBe(true);
    });

    it('should check normal', () => {
      lde.record('n1', 50);
      expect(lde.isNormal(lde.getAllLoads()[0].id)).toBe(true);
    });

    it('should check high', () => {
      lde.record('n1', 80);
      expect(lde.isHigh(lde.getAllLoads()[0].id)).toBe(true);
    });

    it('should check critical', () => {
      lde.record('n1', 95);
      expect(lde.isCritical(lde.getAllLoads()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = lde.record('n1', 50);
      expect(lde.setActive(id, false)).toBe(true);
    });

    it('should set node', () => {
      const id = lde.record('n1', 50);
      expect(lde.setNode(id, 'n2')).toBe(true);
    });

    it('should set value', () => {
      const id = lde.record('n1', 50);
      expect(lde.setValue(id, 80)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(lde.setActive('unknown', false)).toBe(false);
      expect(lde.setNode('unknown', 'n')).toBe(false);
      expect(lde.setValue('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = lde.record('n1', 50);
      lde.balance(id, 80);
      lde.setActive(id, false);
      lde.resetAll();
      expect(lde.getValue(id)).toBe(0);
      expect(lde.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      lde.record('n1', 10);
      expect(lde.getByStatus('low')).toHaveLength(1);
    });

    it('should get active', () => {
      lde.record('n1', 50);
      expect(lde.getActiveLoads()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = lde.record('n1', 50);
      lde.setActive(id, false);
      expect(lde.getInactiveLoads()).toHaveLength(1);
    });

    it('should get all nodes', () => {
      lde.record('a', 50);
      lde.record('b', 50);
      expect(lde.getAllNodes()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      lde.record('n1', 50);
      expect(lde.getNewest()?.node).toBe('n1');
    });

    it('should return null for empty newest', () => {
      expect(lde.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      lde.record('n1', 50);
      expect(lde.getOldest()?.node).toBe('n1');
    });

    it('should return null for empty oldest', () => {
      expect(lde.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = lde.record('n1', 50);
      expect(lde.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = lde.record('n1', 50);
      lde.balance(id, 80);
      expect(lde.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total recorded', () => {
      lde.record('n1', 50);
      expect(lde.getTotalRecorded()).toBe(1);
    });

    it('should get total balanced', () => {
      const id = lde.record('n1', 50);
      lde.balance(id, 80);
      expect(lde.getTotalBalanced()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many loads', () => {
      for (let i = 0; i < 50; i++) {
        lde.record(`n${i}`, 50);
      }
      expect(lde.getCount()).toBe(50);
    });
  });
});