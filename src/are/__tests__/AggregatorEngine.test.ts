/**
 * AggregatorEngine Tests
 * nanobot-design Aggregator Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AggregatorEngine } from '../AggregatorEngine';

describe('AggregatorEngine', () => {
  let are: AggregatorEngine;

  beforeEach(() => {
    are = new AggregatorEngine();
  });

  afterEach(() => {
    are.clearAll();
  });

  describe('add / aggregate / remove', () => {
    it('should add', () => {
      expect(are.add('sum', [1, 2, 3])).toMatch(/^are-/);
    });

    it('should compute sum', () => {
      are.add('sum', [1, 2, 3]);
      expect(are.getAggregate(are.getAllResults()[0].id)).toBe(6);
    });

    it('should compute avg', () => {
      are.add('avg', [2, 4, 6]);
      expect(are.getAggregate(are.getAllResults()[0].id)).toBe(4);
    });

    it('should compute min', () => {
      are.add('min', [3, 1, 2]);
      expect(are.getAggregate(are.getAllResults()[0].id)).toBe(1);
    });

    it('should compute max', () => {
      are.add('max', [1, 3, 2]);
      expect(are.getAggregate(are.getAllResults()[0].id)).toBe(3);
    });

    it('should compute count', () => {
      are.add('count', [1, 2, 3, 4]);
      expect(are.getAggregate(are.getAllResults()[0].id)).toBe(4);
    });

    it('should compute median odd', () => {
      are.add('median', [3, 1, 2]);
      expect(are.getAggregate(are.getAllResults()[0].id)).toBe(2);
    });

    it('should compute median even', () => {
      are.add('median', [1, 2, 3, 4]);
      expect(are.getAggregate(are.getAllResults()[0].id)).toBe(2.5);
    });

    it('should mark as active', () => {
      are.add('sum', [1, 2, 3]);
      expect(are.isActive(are.getAllResults()[0].id)).toBe(true);
    });

    it('should aggregate', () => {
      const id = are.add('sum', [1, 2]);
      expect(are.aggregate(id, [5, 6])).toBe(true);
    });

    it('should not aggregate inactive', () => {
      const id = are.add('sum', [1, 2]);
      are.setActive(id, false);
      expect(are.aggregate(id, [5, 6])).toBe(false);
    });

    it('should return false for unknown aggregate', () => {
      expect(are.aggregate('unknown', [1, 2])).toBe(false);
    });

    it('should remove', () => {
      const id = are.add('sum', [1, 2]);
      expect(are.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      are.add('sum', [1, 2, 3]);
      expect(are.getStats().results).toBe(1);
    });

    it('should count total added', () => {
      are.add('sum', [1, 2, 3]);
      expect(are.getStats().totalAdded).toBe(1);
    });

    it('should count total aggregated', () => {
      const id = are.add('sum', [1, 2]);
      are.aggregate(id, [5, 6]);
      expect(are.getStats().totalAggregated).toBe(1);
    });

    it('should count sum', () => {
      are.add('sum', [1, 2]);
      expect(are.getStats().sum).toBe(1);
    });

    it('should count avg', () => {
      are.add('avg', [1, 2]);
      expect(are.getStats().avg).toBe(1);
    });

    it('should count min', () => {
      are.add('min', [1, 2]);
      expect(are.getStats().min).toBe(1);
    });

    it('should count max', () => {
      are.add('max', [1, 2]);
      expect(are.getStats().max).toBe(1);
    });

    it('should count count', () => {
      are.add('count', [1, 2]);
      expect(are.getStats().count).toBe(1);
    });

    it('should count median', () => {
      are.add('median', [1, 2]);
      expect(are.getStats().median).toBe(1);
    });

    it('should count active', () => {
      are.add('sum', [1, 2]);
      expect(are.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = are.add('sum', [1, 2]);
      are.setActive(id, false);
      expect(are.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = are.add('sum', [1, 2]);
      are.aggregate(id, [5, 6]);
      expect(are.getStats().totalHits).toBe(1);
    });

    it('should count total values', () => {
      are.add('sum', [1, 2, 3]);
      expect(are.getStats().totalValues).toBe(3);
    });
  });

  describe('queries', () => {
    it('should get result', () => {
      const id = are.add('sum', [1, 2]);
      expect(are.getResult(id)?.op).toBe('sum');
    });

    it('should get all', () => {
      are.add('sum', [1, 2]);
      expect(are.getAllResults()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = are.add('sum', [1, 2]);
      expect(are.hasResult(id)).toBe(true);
    });

    it('should count', () => {
      expect(are.getCount()).toBe(0);
      are.add('sum', [1, 2]);
      expect(are.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get values', () => {
      const id = are.add('sum', [1, 2, 3]);
      expect(are.getValues(id)).toEqual([1, 2, 3]);
    });

    it('should get hits', () => {
      const id = are.add('sum', [1, 2]);
      are.aggregate(id, [5, 6]);
      expect(are.getHits(id)).toBe(1);
    });

    it('should check sum', () => {
      are.add('sum', [1, 2]);
      expect(are.isSum(are.getAllResults()[0].id)).toBe(true);
    });

    it('should check avg', () => {
      are.add('avg', [1, 2]);
      expect(are.isAvg(are.getAllResults()[0].id)).toBe(true);
    });

    it('should check min', () => {
      are.add('min', [1, 2]);
      expect(are.isMin(are.getAllResults()[0].id)).toBe(true);
    });

    it('should check max', () => {
      are.add('max', [1, 2]);
      expect(are.isMax(are.getAllResults()[0].id)).toBe(true);
    });

    it('should check count', () => {
      are.add('count', [1, 2]);
      expect(are.isCount(are.getAllResults()[0].id)).toBe(true);
    });

    it('should check median', () => {
      are.add('median', [1, 2]);
      expect(are.isMedian(are.getAllResults()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = are.add('sum', [1, 2]);
      expect(are.setActive(id, false)).toBe(true);
    });

    it('should set op', () => {
      const id = are.add('sum', [1, 2]);
      expect(are.setOp(id, 'avg')).toBe(true);
    });

    it('should set values', () => {
      const id = are.add('sum', [1, 2]);
      expect(are.setValues(id, [5, 6])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(are.setActive('unknown', false)).toBe(false);
      expect(are.setOp('unknown', 'sum')).toBe(false);
      expect(are.setValues('unknown', [1])).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = are.add('sum', [1, 2]);
      are.setActive(id, false);
      are.resetAll();
      expect(are.isActive(id)).toBe(true);
    });
  });

  describe('by op / state', () => {
    it('should get by op', () => {
      are.add('sum', [1, 2]);
      expect(are.getByOp('sum')).toHaveLength(1);
    });

    it('should get active', () => {
      are.add('sum', [1, 2]);
      expect(are.getActiveResults()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = are.add('sum', [1, 2]);
      are.setActive(id, false);
      expect(are.getInactiveResults()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      are.add('sum', [1, 2]);
      expect(are.getNewest()?.op).toBe('sum');
    });

    it('should return null for empty newest', () => {
      expect(are.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      are.add('sum', [1, 2]);
      expect(are.getOldest()?.op).toBe('sum');
    });

    it('should return null for empty oldest', () => {
      expect(are.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = are.add('sum', [1, 2]);
      expect(are.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = are.add('sum', [1, 2]);
      are.aggregate(id, [5, 6]);
      expect(are.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      are.add('sum', [1, 2]);
      expect(are.getTotalAdded()).toBe(1);
    });

    it('should get total aggregated', () => {
      const id = are.add('sum', [1, 2]);
      are.aggregate(id, [5, 6]);
      expect(are.getTotalAggregated()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many results', () => {
      for (let i = 0; i < 50; i++) {
        are.add('sum', [1, 2, 3]);
      }
      expect(are.getCount()).toBe(50);
    });
  });
});