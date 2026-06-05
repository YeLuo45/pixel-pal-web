/**
 * EventAggregator Tests
 * thunderbolt-design Event Aggregator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventAggregator } from '../EventAggregator';

describe('EventAggregator', () => {
  let agg: EventAggregator;

  beforeEach(() => {
    agg = new EventAggregator();
  });

  afterEach(() => {
    agg.clearAll();
  });

  // ============================================================
  // addEvent
  // ============================================================
  describe('addEvent', () => {
    it('should add event', () => {
      const id = agg.addEvent('click', 'button', { x: 1 });
      expect(id).toBe('evt-1');
    });

    it('should get event by id', () => {
      const id = agg.addEvent('click', 'button', { x: 1 });
      expect(agg.getEvent(id)?.type).toBe('click');
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should aggregate', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('click', 'b', null);
      const result = agg.aggregate();
      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(2);
    });

    it('should track sources', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('click', 'b', null);
      const result = agg.aggregate();
      expect(result[0].sources).toHaveLength(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      agg.addEvent('click', 'a', null);
      const stats = agg.getStats();
      expect(stats.events).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get all', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getAllEvents()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = agg.addEvent('click', 'a', null);
      expect(agg.removeEvent(id)).toBe(true);
    });

    it('should check existence', () => {
      const id = agg.addEvent('click', 'a', null);
      expect(agg.hasEvent(id)).toBe(true);
    });

    it('should count', () => {
      expect(agg.getCount()).toBe(0);
      agg.addEvent('click', 'a', null);
      expect(agg.getCount()).toBe(1);
    });
  });

  // ============================================================
  // types / sources
  // ============================================================
  describe('types / sources', () => {
    it('should get types', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('hover', 'a', null);
      expect(agg.getTypes()).toHaveLength(2);
    });

    it('should get sources', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('click', 'b', null);
      expect(agg.getSources()).toHaveLength(2);
    });

    it('should get by type', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getByType('click')).toHaveLength(1);
    });

    it('should get by source', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getBySource('a')).toHaveLength(1);
    });

    it('should count types', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getTypeCount()).toBe(1);
    });

    it('should count sources', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getSourceCount()).toBe(1);
    });

    it('should count events', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getEventCount()).toBe(1);
    });

    it('should count for type', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getCountForType('click')).toBe(1);
    });

    it('should count for source', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getCountForSource('a')).toBe(1);
    });
  });

  // ============================================================
  // first / last / range
  // ============================================================
  describe('first / last / range', () => {
    it('should get first for type', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getFirstForType('click')?.type).toBe('click');
    });

    it('should get last for type', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('click', 'b', null);
      expect(agg.getLastForType('click')?.source).toBe('b');
    });

    it('should get time range', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('click', 'b', null);
      expect(agg.getTimeRangeForType('click')).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // rate / most
  // ============================================================
  describe('rate / most', () => {
    it('should get type rate', () => {
      agg.addEvent('click', 'a', null);
      expect(agg.getTypeRate('click')).toBe(1);
    });

    it('should return 0 for empty', () => {
      expect(agg.getTypeRate('click')).toBe(0);
    });

    it('should get most frequent type', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('click', 'b', null);
      agg.addEvent('hover', 'a', null);
      expect(agg.getMostFrequentType()).toBe('click');
    });

    it('should return null for empty most', () => {
      expect(agg.getMostFrequentType()).toBeNull();
    });

    it('should get most active source', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('click', 'a', null);
      agg.addEvent('click', 'b', null);
      expect(agg.getMostActiveSource()).toBe('a');
    });

    it('should return null for empty most active', () => {
      expect(agg.getMostActiveSource()).toBeNull();
    });
  });

  // ============================================================
  // aggregate stats
  // ============================================================
  describe('aggregate stats', () => {
    it('should get avg per type', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('hover', 'a', null);
      expect(agg.getAvgEventsPerType()).toBe(1);
    });

    it('should get avg per source', () => {
      agg.addEvent('click', 'a', null);
      agg.addEvent('hover', 'b', null);
      expect(agg.getAvgEventsPerSource()).toBe(1);
    });

    it('should return 0 for empty avg', () => {
      expect(agg.getAvgEventsPerType()).toBe(0);
      expect(agg.getAvgEventsPerSource()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many events', () => {
      for (let i = 0; i < 50; i++) {
        agg.addEvent('e', 's', null);
      }
      expect(agg.getCount()).toBe(50);
    });
  });
});