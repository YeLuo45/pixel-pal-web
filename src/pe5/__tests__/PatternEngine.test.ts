/**
 * PatternEngine Tests
 * generic-agent-design Pattern Engine
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
  // define / match / reset
  // ============================================================
  describe('define / match / reset', () => {
    it('should define', () => {
      expect(pe.define('p1', 't1')).toBe('pe5-1');
    });

    it('should mark as active', () => {
      const id = pe.define('p1', 't1');
      expect(pe.isActive(id)).toBe(true);
    });

    it('should match', () => {
      const id = pe.define('p1', 't1');
      expect(pe.match(id)).toBe(true);
    });

    it('should increment matches on match', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getMatches(id)).toBe(1);
    });

    it('should log history on match', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getHistory(id)).toHaveLength(1);
    });

    it('should not match inactive', () => {
      const id = pe.define('p1', 't1');
      pe.setActive(id, false);
      expect(pe.match(id)).toBe(false);
    });

    it('should return false for unknown match', () => {
      expect(pe.match('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      pe.reset(id);
      expect(pe.getMatches(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(pe.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pe.define('p1', 't1');
      const stats = pe.getStats();
      expect(stats.patterns).toBe(1);
    });

    it('should count total matches', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getStats().totalMatches).toBe(1);
    });

    it('should count active', () => {
      pe.define('p1', 't1');
      expect(pe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pe.define('p1', 't1');
      pe.setActive(id, false);
      expect(pe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pe.define('p1', 't1');
      pe.define('p2', 't2');
      expect(pe.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg matches', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getStats().avgMatches).toBe(1);
    });

    it('should get max matches', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      pe.match(id);
      expect(pe.getStats().maxMatches).toBe(2);
    });

    it('should get min matches', () => {
      pe.define('p1', 't1');
      expect(pe.getStats().minMatches).toBe(0);
    });

    it('should compute avg template length', () => {
      pe.define('p1', 'abcde');
      expect(pe.getStats().avgTemplateLength).toBe(5);
    });

    it('should get max template length', () => {
      pe.define('p1', 'short');
      pe.define('p2', 'longer template');
      expect(pe.getStats().maxTemplateLength).toBe(15);
    });

    it('should get min template length', () => {
      pe.define('p1', 'short');
      pe.define('p2', 'longer template');
      expect(pe.getStats().minTemplateLength).toBe(5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pattern', () => {
      pe.define('p1', 't1');
      expect(pe.getPattern('pe5-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      pe.define('p1', 't1');
      expect(pe.getAllPatterns()).toHaveLength(1);
    });

    it('should remove', () => {
      pe.define('p1', 't1');
      expect(pe.removePattern('pe5-1')).toBe(true);
    });

    it('should check existence', () => {
      pe.define('p1', 't1');
      expect(pe.hasPattern('pe5-1')).toBe(true);
    });

    it('should count', () => {
      expect(pe.getCount()).toBe(0);
      pe.define('p1', 't1');
      expect(pe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pe.define('p1', 't1');
      expect(pe.getName('pe5-1')).toBe('p1');
    });

    it('should get template', () => {
      pe.define('p1', 't1');
      expect(pe.getTemplate('pe5-1')).toBe('t1');
    });

    it('should get template length', () => {
      pe.define('p1', 'abcde');
      expect(pe.getTemplateLength('pe5-1')).toBe(5);
    });

    it('should get matches', () => {
      pe.define('p1', 't1');
      expect(pe.getMatches('pe5-1')).toBe(0);
    });

    it('should get history', () => {
      pe.define('p1', 't1');
      expect(pe.getHistory('pe5-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pe.define('p1', 't1');
      expect(pe.setActive('pe5-1', false)).toBe(true);
    });

    it('should set name', () => {
      pe.define('p1', 't1');
      expect(pe.setName('pe5-1', 'p2')).toBe(true);
    });

    it('should set template', () => {
      pe.define('p1', 't1');
      expect(pe.setTemplate('pe5-1', 't2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pe.setActive('unknown', false)).toBe(false);
      expect(pe.setName('unknown', 'p')).toBe(false);
      expect(pe.setTemplate('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
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
      pe.define('p1', 't1');
      expect(pe.getByName('p1')).toHaveLength(1);
    });

    it('should get active', () => {
      pe.define('p1', 't1');
      expect(pe.getActivePatterns()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pe.define('p1', 't1');
      pe.setActive('pe5-1', false);
      expect(pe.getInactivePatterns()).toHaveLength(1);
    });

    it('should get all names', () => {
      pe.define('p1', 't1');
      pe.define('p2', 't2');
      expect(pe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pe.define('p1', 't1');
      expect(pe.getNameCount()).toBe(1);
    });

    it('should get by min matches', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getByMinMatches(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most matches', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      pe.match(id);
      expect(pe.getMostMatches()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(pe.getMostMatches()).toBeNull();
    });

    it('should get newest', () => {
      pe.define('p1', 't1');
      expect(pe.getNewest()?.id).toBe('pe5-1');
    });

    it('should return null for empty newest', () => {
      expect(pe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pe.define('p1', 't1');
      expect(pe.getOldest()?.id).toBe('pe5-1');
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
      pe.define('p1', 't1');
      expect(pe.getCreatedAt('pe5-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total matches', () => {
      const id = pe.define('p1', 't1');
      pe.match(id);
      expect(pe.getTotalMatches()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many patterns', () => {
      for (let i = 0; i < 50; i++) {
        pe.define(`p${i}`, `t${i}`);
      }
      expect(pe.getCount()).toBe(50);
    });
  });
});