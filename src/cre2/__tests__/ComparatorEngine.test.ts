/**
 * ComparatorEngine Tests
 * claude-code-design Comparator Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComparatorEngine } from '../ComparatorEngine';

describe('ComparatorEngine', () => {
  let cre2: ComparatorEngine;

  beforeEach(() => {
    cre2 = new ComparatorEngine();
  });

  afterEach(() => {
    cre2.clearAll();
  });

  describe('add / compare / remove', () => {
    it('should add', () => {
      expect(cre2.add(1, 2, 'eq')).toMatch(/^cre2-/);
    });

    it('should set result for eq true', () => {
      cre2.add(1, 1, 'eq');
      expect(cre2.getResult(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should set result for eq false', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getResult(cre2.getAllComparisons()[0].id)).toBe(false);
    });

    it('should set result for gt', () => {
      cre2.add(2, 1, 'gt');
      expect(cre2.getResult(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should set result for lt', () => {
      cre2.add(1, 2, 'lt');
      expect(cre2.getResult(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should set result for ge', () => {
      cre2.add(1, 1, 'ge');
      expect(cre2.getResult(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should set result for le', () => {
      cre2.add(1, 1, 'le');
      expect(cre2.getResult(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should set result for ne', () => {
      cre2.add(1, 2, 'ne');
      expect(cre2.getResult(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should mark as active', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.isActive(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should compare', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.compare(id, 3, 4)).toBe(true);
    });

    it('should not compare inactive', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.setActive(id, false);
      expect(cre2.compare(id, 3, 4)).toBe(false);
    });

    it('should return false for unknown compare', () => {
      expect(cre2.compare('unknown', 1, 2)).toBe(false);
    });

    it('should remove', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getStats().comparisons).toBe(1);
    });

    it('should count total added', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getStats().totalAdded).toBe(1);
    });

    it('should count total compared', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.compare(id, 3, 4);
      expect(cre2.getStats().totalCompared).toBe(1);
    });

    it('should count eq', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getStats().eq).toBe(1);
    });

    it('should count ne', () => {
      cre2.add(1, 2, 'ne');
      expect(cre2.getStats().ne).toBe(1);
    });

    it('should count gt', () => {
      cre2.add(1, 2, 'gt');
      expect(cre2.getStats().gt).toBe(1);
    });

    it('should count lt', () => {
      cre2.add(1, 2, 'lt');
      expect(cre2.getStats().lt).toBe(1);
    });

    it('should count le', () => {
      cre2.add(1, 2, 'le');
      expect(cre2.getStats().le).toBe(1);
    });

    it('should count ge', () => {
      cre2.add(1, 2, 'ge');
      expect(cre2.getStats().ge).toBe(1);
    });

    it('should count active', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.setActive(id, false);
      expect(cre2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.compare(id, 3, 4);
      expect(cre2.getStats().totalHits).toBe(1);
    });

    it('should count total a sum', () => {
      cre2.add(10, 2, 'eq');
      expect(cre2.getStats().totalASum).toBe(10);
    });
  });

  describe('queries', () => {
    it('should get comparison', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.getComparison(id)?.op).toBe('eq');
    });

    it('should get all', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getAllComparisons()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.hasComparison(id)).toBe(true);
    });

    it('should count', () => {
      expect(cre2.getCount()).toBe(0);
      cre2.add(1, 2, 'eq');
      expect(cre2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get a', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.getA(id)).toBe(1);
    });

    it('should get b', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.getB(id)).toBe(2);
    });

    it('should get hits', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.compare(id, 3, 4);
      expect(cre2.getHits(id)).toBe(1);
    });

    it('should check eq', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.isEq(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should check ne', () => {
      cre2.add(1, 2, 'ne');
      expect(cre2.isNe(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should check gt', () => {
      cre2.add(1, 2, 'gt');
      expect(cre2.isGt(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should check lt', () => {
      cre2.add(1, 2, 'lt');
      expect(cre2.isLt(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should check le', () => {
      cre2.add(1, 2, 'le');
      expect(cre2.isLe(cre2.getAllComparisons()[0].id)).toBe(true);
    });

    it('should check ge', () => {
      cre2.add(1, 2, 'ge');
      expect(cre2.isGe(cre2.getAllComparisons()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.setActive(id, false)).toBe(true);
    });

    it('should set a', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.setA(id, 5)).toBe(true);
    });

    it('should set b', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.setB(id, 5)).toBe(true);
    });

    it('should set op', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.setOp(id, 'gt')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cre2.setActive('unknown', false)).toBe(false);
      expect(cre2.setA('unknown', 1)).toBe(false);
      expect(cre2.setB('unknown', 1)).toBe(false);
      expect(cre2.setOp('unknown', 'eq')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.setActive(id, false);
      cre2.resetAll();
      expect(cre2.isActive(id)).toBe(true);
    });
  });

  describe('by op / state', () => {
    it('should get by op', () => {
      cre2.add(1, 2, 'gt');
      expect(cre2.getByOp('gt')).toHaveLength(1);
    });

    it('should get active', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getActiveComparisons()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.setActive(id, false);
      expect(cre2.getInactiveComparisons()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getNewest()?.op).toBe('eq');
    });

    it('should return null for empty newest', () => {
      expect(cre2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getOldest()?.op).toBe('eq');
    });

    it('should return null for empty oldest', () => {
      expect(cre2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = cre2.add(1, 2, 'eq');
      expect(cre2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.compare(id, 3, 4);
      expect(cre2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      cre2.add(1, 2, 'eq');
      expect(cre2.getTotalAdded()).toBe(1);
    });

    it('should get total compared', () => {
      const id = cre2.add(1, 2, 'eq');
      cre2.compare(id, 3, 4);
      expect(cre2.getTotalCompared()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many comparisons', () => {
      for (let i = 0; i < 50; i++) {
        cre2.add(i, i + 1, 'lt');
      }
      expect(cre2.getCount()).toBe(50);
    });
  });
});