/**
 * Profiler Tests
 * claude-code-design Profiler
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Profiler } from '../Profiler';

describe('Profiler', () => {
  let prof: Profiler;

  beforeEach(() => {
    prof = new Profiler();
  });

  afterEach(() => {
    prof.clearAll();
  });

  // ============================================================
  // start / stop
  // ============================================================
  describe('start / stop', () => {
    it('should start', () => {
      expect(prof.start('task')).toBe('prof-1');
    });

    it('should stop', async () => {
      const id = prof.start('task');
      await new Promise(r => setTimeout(r, 10));
      const duration = prof.stop(id);
      expect(duration).toBeGreaterThanOrEqual(10);
    });

    it('should return 0 for unknown stop', () => {
      expect(prof.stop('unknown')).toBe(0);
    });
  });

  // ============================================================
  // getReport
  // ============================================================
  describe('getReport', () => {
    it('should get report', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getReport()).toHaveLength(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      const id = prof.start('task');
      prof.stop(id);
      const stats = prof.getStats();
      expect(stats.samples).toBe(1);
    });

    it('should compute avg', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getStats().avg).toBeGreaterThanOrEqual(0);
    });

    it('should compute max', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getStats().max).toBeGreaterThanOrEqual(0);
    });

    it('should compute min', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getStats().min).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for empty', () => {
      const stats = prof.getStats();
      expect(stats.max).toBe(0);
      expect(stats.min).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get sample', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getSample(id)?.name).toBe('task');
    });

    it('should get all', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getAllSamples()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.removeSample(id)).toBe(true);
    });

    it('should check existence', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.hasSample(id)).toBe(true);
    });

    it('should count', () => {
      expect(prof.getCount()).toBe(0);
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getName(id)).toBe('task');
    });

    it('should get duration', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getDuration(id)).toBeGreaterThanOrEqual(0);
    });

    it('should get timestamp', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getTimestamp(id)).toBeGreaterThan(0);
    });

    it('should get started at', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getStartedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // active
  // ============================================================
  describe('active', () => {
    it('should check isActive', () => {
      const id = prof.start('task');
      expect(prof.isActive(id)).toBe(true);
    });

    it('should get active count', () => {
      prof.start('task');
      expect(prof.getActiveCount()).toBe(1);
    });

    it('should get active ids', () => {
      prof.start('task');
      expect(prof.getActiveIds()).toHaveLength(1);
    });

    it('should be inactive after stop', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.isActive(id)).toBe(false);
    });
  });

  // ============================================================
  // by name
  // ============================================================
  describe('by name', () => {
    it('should get by name', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getByName('task')).toHaveLength(1);
    });

    it('should get names', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getNames()).toEqual(['task']);
    });

    it('should get name count', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getNameCount()).toBe(1);
    });

    it('should get avg by name', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getAvgByName('task')).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get slowest', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getSlowest()?.id).toBe(id);
    });

    it('should return null for empty slowest', () => {
      expect(prof.getSlowest()).toBeNull();
    });

    it('should get fastest', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getFastest()?.id).toBe(id);
    });

    it('should return null for empty fastest', () => {
      expect(prof.getFastest()).toBeNull();
    });
  });

  // ============================================================
  // bottleneck
  // ============================================================
  describe('bottleneck', () => {
    it('should get bottleneck', async () => {
      const id = prof.start('task');
      await new Promise(r => setTimeout(r, 10));
      prof.stop(id);
      expect(prof.getBottleneck(0)).toHaveLength(1);
    });

    it('should return empty for high threshold', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getBottleneck(Infinity)).toHaveLength(0);
    });
  });

  // ============================================================
  // time order
  // ============================================================
  describe('time order', () => {
    it('should get newest', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getNewest()?.id).toBe(id);
    });

    it('should return null for empty newest', () => {
      expect(prof.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      const id = prof.start('task');
      prof.stop(id);
      expect(prof.getOldest()?.id).toBe(id);
    });

    it('should return null for empty oldest', () => {
      expect(prof.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many samples', () => {
      for (let i = 0; i < 50; i++) {
        const id = prof.start(`t${i}`);
        prof.stop(id);
      }
      expect(prof.getCount()).toBe(50);
    });
  });
});