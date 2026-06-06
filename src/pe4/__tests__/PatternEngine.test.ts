/**
 * PatternEngine Tests
 * chatdev-design Pattern Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PatternEngine } from '../PatternEngine';

describe('PatternEngine', () => {
  let pe: PatternEngine;

  beforeEach(() => {
    pe = new PatternEngine();
  });

  afterEach(() => {
    pe.clearAll();
  });

  // ============================================================
  // register / match
  // ============================================================
  describe('register / match', () => {
    it('should register', () => {
      expect(pe.register('p1', '\\d+')).toBe('pe4-1');
    });

    it('should mark as active', () => {
      const id = pe.register('p1', '\\d+');
      expect(pe.isActive(id)).toBe(true);
    });

    it('should match', () => {
      const id = pe.register('p1', '\\d+');
      expect(pe.match(id, 'abc123')).toBe(true);
    });

    it('should not match', () => {
      const id = pe.register('p1', '\\d+');
      expect(pe.match(id, 'abc')).toBe(false);
    });

    it('should increment matches on match', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getMatches(id)).toBe(1);
    });

    it('should increment misses on no match', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, 'abc');
      expect(pe.getMisses(id)).toBe(1);
    });

    it('should set lastMatch on match', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getLastMatch(id)).toBe('123');
    });

    it('should log history', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      pe.match(id, 'abc');
      expect(pe.getHistory(id)).toEqual([true, false]);
    });

    it('should not match inactive', () => {
      const id = pe.register('p1', '\\d+');
      pe.setActive(id, false);
      expect(pe.match(id, '123')).toBe(false);
    });

    it('should return false for unknown match', () => {
      expect(pe.match('unknown', '123')).toBe(false);
    });

    it('should handle invalid regex', () => {
      const id = pe.register('p1', '[invalid');
      expect(pe.match(id, '123')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pe.register('p1', '\\d+');
      const stats = pe.getStats();
      expect(stats.patterns).toBe(1);
    });

    it('should count total matches', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getStats().totalMatches).toBe(1);
    });

    it('should count total misses', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, 'abc');
      expect(pe.getStats().totalMisses).toBe(1);
    });

    it('should count active', () => {
      pe.register('p1', '\\d+');
      expect(pe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pe.register('p1', '\\d+');
      pe.setActive(id, false);
      expect(pe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getStats().totalHits).toBe(1);
    });

    it('should compute avg matches', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getStats().avgMatches).toBe(1);
    });

    it('should count unique names', () => {
      pe.register('p1', '\\d+');
      pe.register('p2', '\\w+');
      expect(pe.getStats().uniqueNames).toBe(2);
    });

    it('should count unique regex', () => {
      pe.register('p1', '\\d+');
      pe.register('p2', '\\d+');
      expect(pe.getStats().uniqueRegex).toBe(1);
    });

    it('should compute match rate', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getStats().matchRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pattern', () => {
      pe.register('p1', '\\d+');
      expect(pe.getPattern('pe4-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      pe.register('p1', '\\d+');
      expect(pe.getAllPatterns()).toHaveLength(1);
    });

    it('should remove', () => {
      pe.register('p1', '\\d+');
      expect(pe.removePattern('pe4-1')).toBe(true);
    });

    it('should check existence', () => {
      pe.register('p1', '\\d+');
      expect(pe.hasPattern('pe4-1')).toBe(true);
    });

    it('should count', () => {
      expect(pe.getCount()).toBe(0);
      pe.register('p1', '\\d+');
      expect(pe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pe.register('p1', '\\d+');
      expect(pe.getName('pe4-1')).toBe('p1');
    });

    it('should get regex', () => {
      pe.register('p1', '\\d+');
      expect(pe.getRegex('pe4-1')).toBe('\\d+');
    });

    it('should get matches', () => {
      pe.register('p1', '\\d+');
      expect(pe.getMatches('pe4-1')).toBe(0);
    });

    it('should get misses', () => {
      pe.register('p1', '\\d+');
      expect(pe.getMisses('pe4-1')).toBe(0);
    });

    it('should get last match', () => {
      pe.register('p1', '\\d+');
      expect(pe.getLastMatch('pe4-1')).toBeNull();
    });

    it('should get history', () => {
      pe.register('p1', '\\d+');
      expect(pe.getHistory('pe4-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pe.register('p1', '\\d+');
      expect(pe.setActive('pe4-1', false)).toBe(true);
    });

    it('should set name', () => {
      pe.register('p1', '\\d+');
      expect(pe.setName('pe4-1', 'p2')).toBe(true);
    });

    it('should set regex', () => {
      pe.register('p1', '\\d+');
      expect(pe.setRegex('pe4-1', '\\w+')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pe.setActive('unknown', false)).toBe(false);
      expect(pe.setName('unknown', 'p')).toBe(false);
      expect(pe.setRegex('unknown', '\\d+')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      pe.setActive(id, false);
      pe.resetAll();
      expect(pe.getMatches(id)).toBe(0);
      expect(pe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      pe.register('p1', '\\d+');
      expect(pe.getByName('p1')).toHaveLength(1);
    });

    it('should get active', () => {
      pe.register('p1', '\\d+');
      expect(pe.getActivePatterns()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pe.register('p1', '\\d+');
      pe.setActive('pe4-1', false);
      expect(pe.getInactivePatterns()).toHaveLength(1);
    });

    it('should get all names', () => {
      pe.register('p1', '\\d+');
      pe.register('p2', '\\w+');
      expect(pe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pe.register('p1', '\\d+');
      expect(pe.getNameCount()).toBe(1);
    });

    it('should get by min matches', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getByMinMatches(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most matches', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      pe.match(id, '456');
      expect(pe.getMostMatches()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(pe.getMostMatches()).toBeNull();
    });

    it('should get newest', () => {
      pe.register('p1', '\\d+');
      expect(pe.getNewest()?.id).toBe('pe4-1');
    });

    it('should return null for empty newest', () => {
      expect(pe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pe.register('p1', '\\d+');
      expect(pe.getOldest()?.id).toBe('pe4-1');
    });

    it('should return null for empty oldest', () => {
      expect(pe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pe.register('p1', '\\d+');
      expect(pe.getCreatedAt('pe4-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total matches', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, '123');
      expect(pe.getTotalMatches()).toBe(1);
    });

    it('should get total misses', () => {
      const id = pe.register('p1', '\\d+');
      pe.match(id, 'abc');
      expect(pe.getTotalMisses()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many patterns', () => {
      for (let i = 0; i < 50; i++) {
        pe.register(`p${i}`, '\\d+');
      }
      expect(pe.getCount()).toBe(50);
    });
  });
});