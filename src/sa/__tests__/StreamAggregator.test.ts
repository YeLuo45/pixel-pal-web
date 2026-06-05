/**
 * StreamAggregator Tests
 * thunderbolt-design Stream Aggregator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StreamAggregator } from '../StreamAggregator';

describe('StreamAggregator', () => {
  let agg: StreamAggregator;

  beforeEach(() => {
    agg = new StreamAggregator();
  });

  afterEach(() => {
    agg.clearAll();
  });

  // ============================================================
  // createStream / emit
  // ============================================================
  describe('createStream / emit', () => {
    it('should create stream', () => {
      expect(agg.createStream('s1')).toBe(true);
    });

    it('should reject duplicate', () => {
      agg.createStream('s1');
      expect(agg.createStream('s1')).toBe(false);
    });

    it('should emit', () => {
      agg.createStream('s1');
      expect(agg.emit('s1', { x: 1 })).toBe(true);
    });

    it('should return false for unknown emit', () => {
      expect(agg.emit('unknown', {})).toBe(false);
    });

    it('should return false for inactive emit', () => {
      agg.createStream('s1');
      agg.setActive('s1', false);
      expect(agg.emit('s1', {})).toBe(false);
    });
  });

  // ============================================================
  // flush
  // ============================================================
  describe('flush', () => {
    it('should flush', () => {
      agg.createStream('s1', 5);
      agg.emit('s1', 1);
      expect(agg.flush('s1')).toHaveLength(1);
    });

    it('should return empty for unknown', () => {
      expect(agg.flush('unknown')).toEqual([]);
    });

    it('should respect window size', () => {
      agg.createStream('s1', 2);
      agg.emit('s1', 1);
      agg.emit('s1', 2);
      agg.emit('s1', 3);
      const flushed = agg.flush('s1');
      expect(flushed).toHaveLength(2);
    });

    it('should flush all', () => {
      agg.createStream('s1');
      agg.createStream('s2');
      agg.emit('s1', 1);
      agg.emit('s2', 2);
      const result = agg.flushAll();
      expect(result.size).toBe(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      agg.createStream('s1');
      const stats = agg.getStats();
      expect(stats.streams).toBe(1);
    });

    it('should count events', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      agg.emit('s1', 2);
      expect(agg.getStats().events).toBe(2);
    });

    it('should count flushes', () => {
      agg.createStream('s1');
      agg.flush('s1');
      expect(agg.getStats().flushes).toBe(1);
    });

    it('should count active', () => {
      agg.createStream('s1');
      expect(agg.getStats().active).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get stream', () => {
      agg.createStream('s1');
      expect(agg.getStream('s1')?.id).toBe('s1');
    });

    it('should get all', () => {
      agg.createStream('s1');
      expect(agg.getAllStreams()).toHaveLength(1);
    });

    it('should remove', () => {
      agg.createStream('s1');
      expect(agg.removeStream('s1')).toBe(true);
    });

    it('should check existence', () => {
      agg.createStream('s1');
      expect(agg.hasStream('s1')).toBe(true);
    });

    it('should count', () => {
      expect(agg.getCount()).toBe(0);
      agg.createStream('s1');
      expect(agg.getCount()).toBe(1);
    });
  });

  // ============================================================
  // events
  // ============================================================
  describe('events', () => {
    it('should get events', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      expect(agg.getEvents('s1')).toEqual([1]);
    });

    it('should count events', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      expect(agg.getEventCount('s1')).toBe(1);
    });

    it('should get total emitted', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      expect(agg.getTotalEmitted('s1')).toBe(1);
    });

    it('should get total flushed', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      agg.flush('s1');
      expect(agg.getTotalFlushed('s1')).toBe(1);
    });
  });

  // ============================================================
  // watermark
  // ============================================================
  describe('watermark', () => {
    it('should get watermark', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      expect(agg.getWatermark('s1')).toBe(1);
    });

    it('should increment watermark', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      agg.emit('s1', 2);
      expect(agg.getWatermark('s1')).toBe(2);
    });
  });

  // ============================================================
  // window
  // ============================================================
  describe('window', () => {
    it('should get window size', () => {
      agg.createStream('s1', 5);
      expect(agg.getWindowSize('s1')).toBe(5);
    });

    it('should set window size', () => {
      agg.createStream('s1');
      expect(agg.setWindowSize('s1', 20)).toBe(true);
    });

    it('should return false for unknown setWindowSize', () => {
      expect(agg.setWindowSize('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // active
  // ============================================================
  describe('active', () => {
    it('should check isActive', () => {
      agg.createStream('s1');
      expect(agg.isActive('s1')).toBe(true);
    });

    it('should set active', () => {
      agg.createStream('s1');
      expect(agg.setActive('s1', false)).toBe(true);
    });

    it('should return false for unknown setActive', () => {
      expect(agg.setActive('unknown', false)).toBe(false);
    });

    it('should get active streams', () => {
      agg.createStream('s1');
      expect(agg.getActiveStreams()).toHaveLength(1);
    });

    it('should get inactive streams', () => {
      agg.createStream('s1');
      agg.setActive('s1', false);
      expect(agg.getInactiveStreams()).toHaveLength(1);
    });
  });

  // ============================================================
  // flushes
  // ============================================================
  describe('flushes', () => {
    it('should get flushes', () => {
      agg.createStream('s1');
      agg.flush('s1');
      expect(agg.getFlushes()).toBe(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      agg.createStream('s1');
      expect(agg.getCreatedAt('s1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should get avg window size', () => {
      agg.createStream('s1', 5);
      agg.createStream('s2', 15);
      expect(agg.getAvgWindowSize()).toBe(10);
    });

    it('should return 0 for empty', () => {
      expect(agg.getAvgWindowSize()).toBe(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most active stream', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      expect(agg.getMostActiveStream()?.id).toBe('s1');
    });

    it('should return null for empty', () => {
      expect(agg.getMostActiveStream()).toBeNull();
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      agg.createStream('s1');
      agg.emit('s1', 1);
      agg.resetAll();
      expect(agg.getEventCount('s1')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many streams', () => {
      for (let i = 0; i < 50; i++) {
        agg.createStream(`s${i}`);
      }
      expect(agg.getCount()).toBe(50);
    });
  });
});