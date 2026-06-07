/**
 * DesireEngine Tests
 * generic-agent-design Desire Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DesireEngine } from '../DesireEngine';

describe('DesireEngine', () => {
  let dre: DesireEngine;

  beforeEach(() => {
    dre = new DesireEngine();
  });

  afterEach(() => {
    dre.clearAll();
  });

  describe('add / satisfy / unsatisfy / remove', () => {
    it('should add', () => {
      expect(dre.add('d1', 'normal', 5)).toMatch(/^dre-/);
    });

    it('should default satisfied to false', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.isSatisfied(dre.getAllDesires()[0].id)).toBe(false);
    });

    it('should mark as active', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.isActive(dre.getAllDesires()[0].id)).toBe(true);
    });

    it('should clamp intensity to 0-10', () => {
      dre.add('d1', 'normal', 20);
      expect(dre.getIntensity(dre.getAllDesires()[0].id)).toBe(10);
    });

    it('should satisfy', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.satisfy(id)).toBe(true);
    });

    it('should set satisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.isSatisfied(id)).toBe(true);
    });

    it('should not satisfy inactive', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.setActive(id, false);
      expect(dre.satisfy(id)).toBe(false);
    });

    it('should not double satisfy', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.satisfy(id)).toBe(false);
    });

    it('should return false for unknown satisfy', () => {
      expect(dre.satisfy('unknown')).toBe(false);
    });

    it('should unsatisfy', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.unsatisfy(id)).toBe(true);
    });

    it('should set unsatisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      dre.unsatisfy(id);
      expect(dre.isSatisfied(id)).toBe(false);
    });

    it('should not unsatisfy unsatisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.unsatisfy(id)).toBe(false);
    });

    it('should return false for unknown unsatisfy', () => {
      expect(dre.unsatisfy('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getStats().desires).toBe(1);
    });

    it('should count total added', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getStats().totalAdded).toBe(1);
    });

    it('should count total satisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.getStats().totalSatisfied).toBe(1);
    });

    it('should count total unsatisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      dre.unsatisfy(id);
      expect(dre.getStats().totalUnsatisfied).toBe(1);
    });

    it('should count low', () => {
      dre.add('d1', 'low', 1);
      expect(dre.getStats().low).toBe(1);
    });

    it('should count normal', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getStats().normal).toBe(1);
    });

    it('should count high', () => {
      dre.add('d1', 'high', 7);
      expect(dre.getStats().high).toBe(1);
    });

    it('should count urgent', () => {
      dre.add('d1', 'urgent', 10);
      expect(dre.getStats().urgent).toBe(1);
    });

    it('should count satisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.getStats().satisfied).toBe(1);
    });

    it('should count unsatisfied', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getStats().unsatisfied).toBe(1);
    });

    it('should count active', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.setActive(id, false);
      expect(dre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      dre.add('a', 'normal', 5);
      dre.add('a', 'normal', 5);
      expect(dre.getStats().uniqueNames).toBe(1);
    });

    it('should count total intensity', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getStats().totalIntensity).toBe(5);
    });
  });

  describe('queries', () => {
    it('should get desire', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.getDesire(id)?.name).toBe('d1');
    });

    it('should get all', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getAllDesires()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.hasDesire(id)).toBe(true);
    });

    it('should count', () => {
      expect(dre.getCount()).toBe(0);
      dre.add('d1', 'normal', 5);
      expect(dre.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.getName(id)).toBe('d1');
    });

    it('should get intensity', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.getIntensity(id)).toBe(5);
    });

    it('should get hits', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.getHits(id)).toBe(1);
    });

    it('should check low', () => {
      dre.add('d1', 'low', 1);
      expect(dre.isLow(dre.getAllDesires()[0].id)).toBe(true);
    });

    it('should check normal', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.isNormal(dre.getAllDesires()[0].id)).toBe(true);
    });

    it('should check high', () => {
      dre.add('d1', 'high', 7);
      expect(dre.isHigh(dre.getAllDesires()[0].id)).toBe(true);
    });

    it('should check urgent', () => {
      dre.add('d1', 'urgent', 10);
      expect(dre.isUrgent(dre.getAllDesires()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.setName(id, 'd2')).toBe(true);
    });

    it('should set priority', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.setPriority(id, 'high')).toBe(true);
    });

    it('should set intensity', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.setIntensity(id, 8)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(dre.setActive('unknown', false)).toBe(false);
      expect(dre.setName('unknown', 'd')).toBe(false);
      expect(dre.setPriority('unknown', 'low')).toBe(false);
      expect(dre.setIntensity('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      dre.setActive(id, false);
      dre.resetAll();
      expect(dre.isSatisfied(id)).toBe(false);
      expect(dre.isActive(id)).toBe(true);
    });
  });

  describe('by priority / state', () => {
    it('should get by priority', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getByPriority('normal')).toHaveLength(1);
    });

    it('should get satisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.getSatisfiedDesires()).toHaveLength(1);
    });

    it('should get unsatisfied', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getUnsatisfiedDesires()).toHaveLength(1);
    });

    it('should get active', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getActiveDesires()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.setActive(id, false);
      expect(dre.getInactiveDesires()).toHaveLength(1);
    });

    it('should get all names', () => {
      dre.add('a', 'normal', 5);
      dre.add('b', 'normal', 5);
      expect(dre.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getNewest()?.name).toBe('d1');
    });

    it('should return null for empty newest', () => {
      expect(dre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getOldest()?.name).toBe('d1');
    });

    it('should return null for empty oldest', () => {
      expect(dre.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = dre.add('d1', 'normal', 5);
      expect(dre.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      dre.add('d1', 'normal', 5);
      expect(dre.getTotalAdded()).toBe(1);
    });

    it('should get total satisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      expect(dre.getTotalSatisfied()).toBe(1);
    });

    it('should get total unsatisfied', () => {
      const id = dre.add('d1', 'normal', 5);
      dre.satisfy(id);
      dre.unsatisfy(id);
      expect(dre.getTotalUnsatisfied()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many desires', () => {
      for (let i = 0; i < 50; i++) {
        dre.add(`d${i}`, 'normal', 5);
      }
      expect(dre.getCount()).toBe(50);
    });
  });
});