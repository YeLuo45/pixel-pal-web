/**
 * FilterEngine Tests
 * claude-code-design Filter Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FilterEngine } from '../FilterEngine';

describe('FilterEngine', () => {
  let fle: FilterEngine;

  beforeEach(() => {
    fle = new FilterEngine();
  });

  afterEach(() => {
    fle.clearAll();
  });

  describe('add / apply / remove', () => {
    it('should add', () => {
      expect(fle.add('f1', 'age', 'eq', '5')).toMatch(/^fle-/);
    });

    it('should mark as active', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.isActive(fle.getAllFilters()[0].id)).toBe(true);
    });

    it('should apply with eq match', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.apply(id, { age: '5' })).toBe(true);
    });

    it('should apply with eq non-match', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.apply(id, { age: '10' })).toBe(false);
    });

    it('should apply with contains', () => {
      const id = fle.add('f1', 'name', 'contains', 'al');
      expect(fle.apply(id, { name: 'alex' })).toBe(true);
    });

    it('should apply with gt', () => {
      const id = fle.add('f1', 'age', 'gt', '5');
      expect(fle.apply(id, { age: '10' })).toBe(true);
    });

    it('should apply with lt', () => {
      const id = fle.add('f1', 'age', 'lt', '5');
      expect(fle.apply(id, { age: '10' })).toBe(false);
    });

    it('should apply with ne', () => {
      const id = fle.add('f1', 'age', 'ne', '5');
      expect(fle.apply(id, { age: '10' })).toBe(true);
    });

    it('should not apply inactive', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.setActive(id, false);
      expect(fle.apply(id, { age: '5' })).toBe(false);
    });

    it('should return false for unknown apply', () => {
      expect(fle.apply('unknown', { age: '5' })).toBe(false);
    });

    it('should remove', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.remove(id)).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(fle.remove('unknown')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getStats().filters).toBe(1);
    });

    it('should count total added', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getStats().totalAdded).toBe(1);
    });

    it('should count total applied', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      expect(fle.getStats().totalApplied).toBe(1);
    });

    it('should count total matched', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      expect(fle.getStats().totalMatched).toBe(1);
    });

    it('should count total removed', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.remove(id);
      expect(fle.getStats().totalRemoved).toBe(1);
    });

    it('should count eq', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getStats().eq).toBe(1);
    });

    it('should count ne', () => {
      fle.add('f1', 'age', 'ne', '5');
      expect(fle.getStats().ne).toBe(1);
    });

    it('should count gt', () => {
      fle.add('f1', 'age', 'gt', '5');
      expect(fle.getStats().gt).toBe(1);
    });

    it('should count lt', () => {
      fle.add('f1', 'age', 'lt', '5');
      expect(fle.getStats().lt).toBe(1);
    });

    it('should count contains', () => {
      fle.add('f1', 'name', 'contains', 'a');
      expect(fle.getStats().contains).toBe(1);
    });

    it('should count active', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.setActive(id, false);
      expect(fle.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      expect(fle.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      fle.add('a', 'age', 'eq', '5');
      fle.add('a', 'age', 'eq', '5');
      expect(fle.getStats().uniqueNames).toBe(1);
    });

    it('should count total matched2', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      expect(fle.getStats().totalMatched2).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get filter', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.getFilter(id)?.name).toBe('f1');
    });

    it('should get all', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getAllFilters()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.hasFilter(id)).toBe(true);
    });

    it('should count', () => {
      expect(fle.getCount()).toBe(0);
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.getName(id)).toBe('f1');
    });

    it('should get field', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.getField(id)).toBe('age');
    });

    it('should get value', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.getValue(id)).toBe('5');
    });

    it('should get hits', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      expect(fle.getHits(id)).toBe(1);
    });

    it('should check eq', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.isEq(fle.getAllFilters()[0].id)).toBe(true);
    });

    it('should check ne', () => {
      fle.add('f1', 'age', 'ne', '5');
      expect(fle.isNe(fle.getAllFilters()[0].id)).toBe(true);
    });

    it('should check gt', () => {
      fle.add('f1', 'age', 'gt', '5');
      expect(fle.isGt(fle.getAllFilters()[0].id)).toBe(true);
    });

    it('should check lt', () => {
      fle.add('f1', 'age', 'lt', '5');
      expect(fle.isLt(fle.getAllFilters()[0].id)).toBe(true);
    });

    it('should check contains', () => {
      fle.add('f1', 'name', 'contains', 'a');
      expect(fle.isContains(fle.getAllFilters()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.setName(id, 'f2')).toBe(true);
    });

    it('should set field', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.setField(id, 'name')).toBe(true);
    });

    it('should set op', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.setOp(id, 'gt')).toBe(true);
    });

    it('should set value', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.setValue(id, '10')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(fle.setActive('unknown', false)).toBe(false);
      expect(fle.setName('unknown', 'n')).toBe(false);
      expect(fle.setField('unknown', 'f')).toBe(false);
      expect(fle.setOp('unknown', 'eq')).toBe(false);
      expect(fle.setValue('unknown', 'v')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      fle.setActive(id, false);
      fle.resetAll();
      expect(fle.getMatched(id)).toBe(0);
      expect(fle.isActive(id)).toBe(true);
    });
  });

  describe('by op / state', () => {
    it('should get by op', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getByOp('eq')).toHaveLength(1);
    });

    it('should get active', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getActiveFilters()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.setActive(id, false);
      expect(fle.getInactiveFilters()).toHaveLength(1);
    });

    it('should get all names', () => {
      fle.add('a', 'age', 'eq', '5');
      fle.add('b', 'age', 'eq', '5');
      expect(fle.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getNewest()?.name).toBe('f1');
    });

    it('should return null for empty newest', () => {
      expect(fle.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getOldest()?.name).toBe('f1');
    });

    it('should return null for empty oldest', () => {
      expect(fle.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      expect(fle.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      expect(fle.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      fle.add('f1', 'age', 'eq', '5');
      expect(fle.getTotalAdded()).toBe(1);
    });

    it('should get total applied', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      expect(fle.getTotalApplied()).toBe(1);
    });

    it('should get total matched', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.apply(id, { age: '5' });
      expect(fle.getTotalMatched()).toBe(1);
    });

    it('should get total removed', () => {
      const id = fle.add('f1', 'age', 'eq', '5');
      fle.remove(id);
      expect(fle.getTotalRemoved()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many filters', () => {
      for (let i = 0; i < 50; i++) {
        fle.add(`f${i}`, 'age', 'eq', '5');
      }
      expect(fle.getCount()).toBe(50);
    });
  });
});