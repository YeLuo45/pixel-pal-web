/**
 * LoadPredictor Tests
 * nanobot-design Load Predictor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LoadPredictor } from '../LoadPredictor';

describe('LoadPredictor', () => {
  let lp: LoadPredictor;

  beforeEach(() => {
    lp = new LoadPredictor();
  });

  afterEach(() => {
    lp.clearAll();
  });

  // ============================================================
  // record / predict
  // ============================================================
  describe('record / predict', () => {
    it('should record', () => {
      lp.record(10);
      expect(lp.getCount()).toBe(1);
    });

    it('should predict', () => {
      lp.record(10);
      const pred = lp.predict();
      expect(pred.next).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for empty predict', () => {
      const pred = lp.predict();
      expect(pred.next).toBe(0);
    });

    it('should detect up trend', () => {
      lp.record(1);
      lp.record(2);
      lp.record(3);
      lp.record(4);
      const pred = lp.predict();
      expect(pred.trend).toBe('up');
    });

    it('should detect down trend', () => {
      lp.record(4);
      lp.record(3);
      lp.record(2);
      lp.record(1);
      const pred = lp.predict();
      expect(pred.trend).toBe('down');
    });

    it('should detect stable trend', () => {
      lp.record(5);
      lp.record(5);
      lp.record(5);
      const pred = lp.predict();
      expect(pred.trend).toBe('stable');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      lp.record(10);
      const stats = lp.getStats();
      expect(stats.samples).toBe(1);
    });

    it('should compute avg', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getStats().avg).toBe(15);
    });

    it('should compute max', () => {
      lp.record(10);
      lp.record(30);
      expect(lp.getStats().max).toBe(30);
    });

    it('should compute min', () => {
      lp.record(10);
      lp.record(30);
      expect(lp.getStats().min).toBe(10);
    });

    it('should compute variance', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getStats().variance).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // samples
  // ============================================================
  describe('samples', () => {
    it('should get samples', () => {
      lp.record(10);
      expect(lp.getSamples()).toHaveLength(1);
    });

    it('should get latest', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getLatest()?.value).toBe(20);
    });

    it('should get oldest', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getOldest()?.value).toBe(10);
    });

    it('should get value at', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getValueAt(0)?.value).toBe(10);
    });

    it('should get first N', () => {
      lp.record(10);
      lp.record(20);
      lp.record(30);
      expect(lp.getFirstN(2)).toHaveLength(2);
    });

    it('should get last N', () => {
      lp.record(10);
      lp.record(20);
      lp.record(30);
      expect(lp.getLastN(2)).toHaveLength(2);
    });
  });

  // ============================================================
  // threshold
  // ============================================================
  describe('threshold', () => {
    it('should set threshold', () => {
      lp.setThreshold(10);
      expect(lp.getThreshold()).toBe(10);
    });

    it('should alert above threshold', () => {
      lp.setThreshold(5);
      lp.record(10);
      expect(lp.getAlertCount()).toBe(1);
    });

    it('should not alert below threshold', () => {
      lp.setThreshold(20);
      lp.record(10);
      expect(lp.getAlertCount()).toBe(0);
    });

    it('should get alerts', () => {
      lp.setThreshold(5);
      lp.record(10);
      expect(lp.getAlerts()).toHaveLength(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get above', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getAbove(15)).toHaveLength(1);
    });

    it('should get below', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getBelow(15)).toHaveLength(1);
    });

    it('should get range', () => {
      const now = Date.now();
      lp.record(10);
      expect(lp.getRange(now - 1000, now + 1000)).toHaveLength(1);
    });
  });

  // ============================================================
  // trend
  // ============================================================
  describe('trend', () => {
    it('should detect increasing', () => {
      lp.record(1);
      lp.record(2);
      lp.record(3);
      expect(lp.isIncreasing()).toBe(true);
    });

    it('should detect decreasing', () => {
      lp.record(3);
      lp.record(2);
      lp.record(1);
      expect(lp.isDecreasing()).toBe(true);
    });

    it('should return false for non-increasing', () => {
      lp.record(3);
      lp.record(2);
      expect(lp.isIncreasing()).toBe(false);
    });

    it('should return false for non-decreasing', () => {
      lp.record(1);
      lp.record(2);
      expect(lp.isDecreasing()).toBe(false);
    });

    it('should get trend up', () => {
      lp.record(1);
      lp.record(2);
      lp.record(3);
      expect(lp.getTrend()).toBe('up');
    });

    it('should get trend down', () => {
      lp.record(3);
      lp.record(2);
      lp.record(1);
      expect(lp.getTrend()).toBe('down');
    });

    it('should get trend stable', () => {
      lp.record(5);
      lp.record(5);
      lp.record(5);
      expect(lp.getTrend()).toBe('stable');
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should get sum', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getSum()).toBe(30);
    });

    it('should get median', () => {
      lp.record(10);
      lp.record(20);
      lp.record(30);
      expect(lp.getMedian()).toBe(20);
    });

    it('should return 0 for empty median', () => {
      expect(lp.getMedian()).toBe(0);
    });

    it('should get std dev', () => {
      lp.record(10);
      lp.record(20);
      expect(lp.getStdDev()).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset', () => {
      lp.record(10);
      lp.reset();
      expect(lp.getCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many samples', () => {
      for (let i = 0; i < 50; i++) {
        lp.record(i);
      }
      expect(lp.getCount()).toBe(50);
    });
  });
});