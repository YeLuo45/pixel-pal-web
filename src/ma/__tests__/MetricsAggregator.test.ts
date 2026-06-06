/**
 * MetricsAggregator Tests
 * thunderbolt-design Metrics Aggregator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MetricsAggregator } from '../MetricsAggregator';

describe('MetricsAggregator', () => {
  let ma: MetricsAggregator;

  beforeEach(() => {
    ma = new MetricsAggregator();
  });

  afterEach(() => {
    ma.clearAll();
  });

  // ============================================================
  // record / aggregate
  // ============================================================
  describe('record / aggregate', () => {
    it('should record', () => {
      expect(ma.record('m1', 10)).toBe('ma-1');
    });

    it('should record with type', () => {
      expect(ma.record('m1', 10, 'counter')).toBe('ma-1');
    });

    it('should mark as active', () => {
      const id = ma.record('m1', 10);
      expect(ma.isActive(id)).toBe(true);
    });

    it('should aggregate empty', () => {
      const agg = ma.aggregate('unknown');
      expect(agg.count).toBe(0);
    });

    it('should aggregate single', () => {
      ma.record('m1', 10);
      const agg = ma.aggregate('m1');
      expect(agg.count).toBe(1);
      expect(agg.sum).toBe(10);
      expect(agg.avg).toBe(10);
    });

    it('should aggregate multiple', () => {
      ma.record('m1', 10);
      ma.record('m1', 20);
      ma.record('m1', 30);
      const agg = ma.aggregate('m1');
      expect(agg.count).toBe(3);
      expect(agg.sum).toBe(60);
      expect(agg.avg).toBe(20);
      expect(agg.min).toBe(10);
      expect(agg.max).toBe(30);
    });

    it('should get latest', () => {
      ma.record('m1', 10);
      ma.record('m1', 20);
      const agg = ma.aggregate('m1');
      expect(agg.latest).toBe(20);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ma.record('m1', 10);
      const stats = ma.getStats();
      expect(stats.metrics).toBe(1);
    });

    it('should count active', () => {
      ma.record('m1', 10);
      expect(ma.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ma.record('m1', 10);
      ma.setActive(id, false);
      expect(ma.getStats().inactive).toBe(1);
    });

    it('should count counters', () => {
      ma.record('m1', 10, 'counter');
      expect(ma.getStats().counters).toBe(1);
    });

    it('should count gauges', () => {
      ma.record('m1', 10, 'gauge');
      expect(ma.getStats().gauges).toBe(1);
    });

    it('should count histograms', () => {
      ma.record('m1', 10, 'histogram');
      expect(ma.getStats().histograms).toBe(1);
    });

    it('should count names', () => {
      ma.record('m1', 10);
      ma.record('m2', 20);
      expect(ma.getStats().names).toBe(2);
    });

    it('should count total hits', () => {
      const id = ma.record('m1', 10);
      ma.setValue(id, 20);
      expect(ma.getStats().totalHits).toBe(1);
    });

    it('should compute avg value', () => {
      ma.record('m1', 10);
      ma.record('m2', 20);
      expect(ma.getStats().avgValue).toBe(15);
    });

    it('should get max value', () => {
      ma.record('m1', 10);
      ma.record('m2', 20);
      expect(ma.getStats().maxValue).toBe(20);
    });

    it('should get min value', () => {
      ma.record('m1', 10);
      ma.record('m2', 20);
      expect(ma.getStats().minValue).toBe(10);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get metric', () => {
      ma.record('m1', 10);
      expect(ma.getMetric('ma-1')?.name).toBe('m1');
    });

    it('should get all', () => {
      ma.record('m1', 10);
      expect(ma.getAllMetrics()).toHaveLength(1);
    });

    it('should remove', () => {
      ma.record('m1', 10);
      expect(ma.removeMetric('ma-1')).toBe(true);
    });

    it('should check existence', () => {
      ma.record('m1', 10);
      expect(ma.hasMetric('ma-1')).toBe(true);
    });

    it('should count', () => {
      expect(ma.getCount()).toBe(0);
      ma.record('m1', 10);
      expect(ma.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ma.record('m1', 10);
      expect(ma.getName('ma-1')).toBe('m1');
    });

    it('should get value', () => {
      ma.record('m1', 10);
      expect(ma.getValue('ma-1')).toBe(10);
    });

    it('should get type', () => {
      ma.record('m1', 10, 'counter');
      expect(ma.getType('ma-1')).toBe('counter');
    });

    it('should get history', () => {
      ma.record('m1', 10);
      expect(ma.getHistory('ma-1')).toEqual([10]);
    });

    it('should get hits', () => {
      const id = ma.record('m1', 10);
      ma.setValue(id, 20);
      expect(ma.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ma.record('m1', 10);
      expect(ma.setActive('ma-1', false)).toBe(true);
    });

    it('should set name', () => {
      ma.record('m1', 10);
      expect(ma.setName('ma-1', 'm2')).toBe(true);
    });

    it('should set value', () => {
      ma.record('m1', 10);
      expect(ma.setValue('ma-1', 20)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ma.setActive('unknown', false)).toBe(false);
      expect(ma.setName('unknown', 'm')).toBe(false);
      expect(ma.setValue('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      ma.record('m1', 10);
      expect(ma.touch('ma-1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ma.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ma.record('m1', 10);
      ma.setValue(id, 20);
      ma.setActive(id, false);
      ma.resetAll();
      expect(ma.getHistory(id)).toEqual([20]);
      expect(ma.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / type
  // ============================================================
  describe('by name / type', () => {
    it('should get by name', () => {
      ma.record('m1', 10);
      expect(ma.getByName('m1')).toHaveLength(1);
    });

    it('should get by type', () => {
      ma.record('m1', 10, 'counter');
      expect(ma.getByType('counter')).toHaveLength(1);
    });

    it('should get active', () => {
      ma.record('m1', 10);
      expect(ma.getActiveMetrics()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ma.record('m1', 10);
      ma.setActive('ma-1', false);
      expect(ma.getInactiveMetrics()).toHaveLength(1);
    });

    it('should get all names', () => {
      ma.record('m1', 10);
      ma.record('m2', 20);
      expect(ma.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ma.record('m1', 10);
      expect(ma.getNameCount()).toBe(1);
    });

    it('should get by min value', () => {
      ma.record('m1', 5);
      ma.record('m2', 10);
      expect(ma.getByMinValue(7)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hits', () => {
      const id = ma.record('m1', 10);
      ma.setValue(id, 20);
      ma.setValue(id, 30);
      expect(ma.getMostHits()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ma.getMostHits()).toBeNull();
    });

    it('should get newest', () => {
      ma.record('m1', 10);
      expect(ma.getNewest()?.id).toBe('ma-1');
    });

    it('should return null for empty newest', () => {
      expect(ma.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ma.record('m1', 10);
      expect(ma.getOldest()?.id).toBe('ma-1');
    });

    it('should return null for empty oldest', () => {
      expect(ma.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ma.record('m1', 10);
      expect(ma.getCreatedAt('ma-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      ma.record('m1', 10);
      ma.touch('ma-1');
      expect(ma.getUpdatedAt('ma-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many metrics', () => {
      for (let i = 0; i < 50; i++) {
        ma.record(`m${i}`, i);
      }
      expect(ma.getCount()).toBe(50);
    });
  });
});