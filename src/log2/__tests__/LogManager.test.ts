/**
 * LogManager Tests
 * claude-code-design Log Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LogManager } from '../LogManager';

describe('LogManager', () => {
  let lm: LogManager;

  beforeEach(() => {
    lm = new LogManager();
  });

  afterEach(() => {
    lm.clear();
  });

  // ============================================================
  // log / query / clear
  // ============================================================
  describe('log / query / clear', () => {
    it('should log', () => {
      expect(lm.log('info', 'msg', 'src')).toBe('log-1');
    });

    it('should query', () => {
      lm.log('info', 'msg', 'src');
      expect(lm.query()).toHaveLength(1);
    });

    it('should filter by level', () => {
      lm.log('info', 'msg1');
      lm.log('error', 'msg2');
      expect(lm.query({ level: 'error' })).toHaveLength(1);
    });

    it('should filter by source', () => {
      lm.log('info', 'msg1', 'src1');
      lm.log('info', 'msg2', 'src2');
      expect(lm.query({ source: 'src1' })).toHaveLength(1);
    });

    it('should clear', () => {
      lm.log('info', 'msg');
      expect(lm.clear()).toBe(1);
    });

    it('should return 0 for empty clear', () => {
      expect(lm.clear()).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      lm.log('info', 'msg');
      const stats = lm.getStats();
      expect(stats.entries).toBe(1);
    });

    it('should count by level', () => {
      lm.log('info', 'msg');
      lm.log('error', 'msg');
      expect(lm.getStats().byLevel.info).toBe(1);
      expect(lm.getStats().byLevel.error).toBe(1);
    });

    it('should count sources', () => {
      lm.log('info', 'msg', 's1');
      lm.log('info', 'msg', 's2');
      expect(lm.getStats().sources).toBe(2);
    });

    it('should track oldest/newest', () => {
      lm.log('info', 'msg');
      const stats = lm.getStats();
      expect(stats.oldest).toBeGreaterThan(0);
      expect(stats.newest).toBeGreaterThan(0);
    });

    it('should return 0 for empty oldest/newest', () => {
      const stats = lm.getStats();
      expect(stats.oldest).toBe(0);
      expect(stats.newest).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      lm.log('info', 'msg', 'src');
      expect(lm.getEntry('log-1')?.message).toBe('msg');
    });

    it('should get all', () => {
      lm.log('info', 'msg');
      expect(lm.getAllEntries()).toHaveLength(1);
    });

    it('should remove', () => {
      lm.log('info', 'msg');
      expect(lm.removeEntry('log-1')).toBe(true);
    });

    it('should check existence', () => {
      lm.log('info', 'msg');
      expect(lm.hasEntry('log-1')).toBe(true);
    });

    it('should count', () => {
      expect(lm.getCount()).toBe(0);
      lm.log('info', 'msg');
      expect(lm.getCount()).toBe(1);
    });

    it('should get max entries', () => {
      expect(lm.getMaxEntries()).toBe(10000);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get level', () => {
      lm.log('info', 'msg');
      expect(lm.getLevel('log-1')).toBe('info');
    });

    it('should get message', () => {
      lm.log('info', 'hello');
      expect(lm.getMessage('log-1')).toBe('hello');
    });

    it('should get source', () => {
      lm.log('info', 'msg', 'src');
      expect(lm.getSource('log-1')).toBe('src');
    });

    it('should get timestamp', () => {
      lm.log('info', 'msg');
      expect(lm.getTimestamp('log-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // by level / source
  // ============================================================
  describe('by level / source', () => {
    it('should get by level', () => {
      lm.log('info', 'msg');
      expect(lm.getByLevel('info')).toHaveLength(1);
    });

    it('should get by source', () => {
      lm.log('info', 'msg', 'src');
      expect(lm.getBySource('src')).toHaveLength(1);
    });

    it('should get by level count', () => {
      lm.log('info', 'msg');
      expect(lm.getByLevelCount('info')).toBe(1);
    });

    it('should get by source count', () => {
      lm.log('info', 'msg', 'src');
      expect(lm.getBySourceCount('src')).toBe(1);
    });

    it('should get all sources', () => {
      lm.log('info', 'msg', 's1');
      lm.log('info', 'msg', 's2');
      expect(lm.getAllSources()).toHaveLength(2);
    });

    it('should get source count', () => {
      lm.log('info', 'msg', 's1');
      expect(lm.getSourceCount()).toBe(1);
    });
  });

  // ============================================================
  // time range
  // ============================================================
  describe('time range', () => {
    it('should get by time range', () => {
      lm.log('info', 'msg');
      const t = Date.now();
      expect(lm.getByTimeRange(t - 100, t + 100)).toHaveLength(1);
    });

    it('should return empty for far past', () => {
      lm.log('info', 'msg');
      expect(lm.getByTimeRange(0, 100)).toHaveLength(0);
    });
  });

  // ============================================================
  // clear by level / source
  // ============================================================
  describe('clear by level / source', () => {
    it('should clear by level', () => {
      lm.log('info', 'msg');
      lm.log('error', 'msg');
      expect(lm.clearByLevel('info')).toBe(1);
    });

    it('should clear by source', () => {
      lm.log('info', 'msg', 's1');
      lm.log('info', 'msg', 's2');
      expect(lm.clearBySource('s1')).toBe(1);
    });

    it('should return 0 for no match', () => {
      lm.log('info', 'msg');
      expect(lm.clearByLevel('error')).toBe(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      lm.log('info', 'msg');
      expect(lm.getNewest()?.id).toBe('log-1');
    });

    it('should return null for empty newest', () => {
      expect(lm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      lm.log('info', 'msg');
      expect(lm.getOldest()?.id).toBe('log-1');
    });

    it('should return null for empty oldest', () => {
      expect(lm.getOldest()).toBeNull();
    });

    it('should get newest by level', () => {
      lm.log('info', 'msg');
      expect(lm.getNewestByLevel('info')?.id).toBe('log-1');
    });

    it('should return null for empty newest by level', () => {
      expect(lm.getNewestByLevel('info')).toBeNull();
    });

    it('should get oldest by level', () => {
      lm.log('info', 'msg');
      expect(lm.getOldestByLevel('info')?.id).toBe('log-1');
    });

    it('should return null for empty oldest by level', () => {
      expect(lm.getOldestByLevel('info')).toBeNull();
    });
  });

  // ============================================================
  // count by level
  // ============================================================
  describe('count by level', () => {
    it('should get count by level', () => {
      lm.log('info', 'msg');
      lm.log('info', 'msg');
      expect(lm.getCountByLevel('info')).toBe(2);
    });

    it('should return 0 for no match', () => {
      expect(lm.getCountByLevel('error')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        lm.log('info', `msg${i}`);
      }
      expect(lm.getCount()).toBe(50);
    });

    it('should enforce max entries', () => {
      const small = new LogManager(3);
      small.log('info', 'a');
      small.log('info', 'b');
      small.log('info', 'c');
      small.log('info', 'd');
      expect(small.getCount()).toBe(3);
    });
  });
});