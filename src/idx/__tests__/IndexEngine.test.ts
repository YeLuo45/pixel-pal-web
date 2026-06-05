/**
 * IndexEngine Tests
 * claude-code-design Index Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexEngine } from '../IndexEngine';

describe('IndexEngine', () => {
  let ie: IndexEngine;

  beforeEach(() => {
    ie = new IndexEngine();
  });

  afterEach(() => {
    ie.clearAll();
  });

  // ============================================================
  // build / query
  // ============================================================
  describe('build / query', () => {
    it('should build', () => {
      expect(ie.build('k1', 'v1')).toBe('idx-1');
    });

    it('should query', () => {
      ie.build('k1', 'v1');
      expect(ie.query('k1')).toHaveLength(1);
    });

    it('should return empty for unknown', () => {
      expect(ie.query('unknown')).toHaveLength(0);
    });

    it('should increment hits on query', () => {
      const id = ie.build('k1', 'v1');
      ie.query('k1');
      expect(ie.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // rebuild
  // ============================================================
  describe('rebuild', () => {
    it('should rebuild', () => {
      expect(ie.rebuild()).toBe(true);
    });

    it('should count rebuilds', () => {
      ie.rebuild();
      ie.rebuild();
      expect(ie.getRebuildCount()).toBe(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ie.build('k1', 'v1');
      const stats = ie.getStats();
      expect(stats.entries).toBe(1);
    });

    it('should count keys', () => {
      ie.build('k1', 'v1');
      ie.build('k2', 'v2');
      expect(ie.getStats().keys).toBe(2);
    });

    it('should count hits', () => {
      ie.build('k1', 'v1');
      ie.query('k1');
      expect(ie.getStats().totalHits).toBe(1);
    });

    it('should compute avg hits', () => {
      ie.build('k1', 'v1');
      ie.query('k1');
      expect(ie.getStats().avgHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      ie.build('k1', 'v1');
      expect(ie.getEntry('idx-1')?.key).toBe('k1');
    });

    it('should get all', () => {
      ie.build('k1', 'v1');
      expect(ie.getAllEntries()).toHaveLength(1);
    });

    it('should remove', () => {
      ie.build('k1', 'v1');
      expect(ie.removeEntry('idx-1')).toBe(true);
    });

    it('should check existence', () => {
      ie.build('k1', 'v1');
      expect(ie.hasEntry('idx-1')).toBe(true);
    });

    it('should count', () => {
      expect(ie.getCount()).toBe(0);
      ie.build('k1', 'v1');
      expect(ie.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get key', () => {
      ie.build('k1', 'v1');
      expect(ie.getKey('idx-1')).toBe('k1');
    });

    it('should get value', () => {
      ie.build('k1', 'hello');
      expect(ie.getValue('idx-1')).toBe('hello');
    });

    it('should get hits', () => {
      const id = ie.build('k1', 'v1');
      ie.query('k1');
      expect(ie.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set value', () => {
      const id = ie.build('k1', 'v1');
      expect(ie.setValue(id, 'v2')).toBe(true);
    });

    it('should set key', () => {
      const id = ie.build('k1', 'v1');
      expect(ie.setKey(id, 'k2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ie.setValue('unknown', 'v')).toBe(false);
      expect(ie.setKey('unknown', 'k')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = ie.build('k1', 'v1');
      ie.query('k1');
      ie.resetHits();
      expect(ie.getHits(id)).toBe(0);
    });
  });

  // ============================================================
  // by key
  // ============================================================
  describe('by key', () => {
    it('should get by key', () => {
      ie.build('k1', 'v1');
      expect(ie.getByKey('k1')).toHaveLength(1);
    });

    it('should get keys', () => {
      ie.build('k1', 'v1');
      ie.build('k2', 'v2');
      expect(ie.getKeys()).toHaveLength(2);
    });

    it('should get key count', () => {
      ie.build('k1', 'v1');
      ie.build('k2', 'v2');
      expect(ie.getKeyCount()).toBe(2);
    });

    it('should count entries for key', () => {
      ie.build('k1', 'v1');
      expect(ie.getEntriesForKey('k1')).toBe(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ie.build('k1', 'v1');
      expect(ie.getCreatedAt('idx-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      ie.build('k1', 'v1');
      expect(ie.getUpdatedAt('idx-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = ie.build('k1', 'v1');
      ie.query('k1');
      expect(ie.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ie.getMostHit()).toBeNull();
    });

    it('should get least hit', () => {
      ie.build('k1', 'v1');
      expect(ie.getLeastHit()?.id).toBe('idx-1');
    });

    it('should return null for empty least', () => {
      expect(ie.getLeastHit()).toBeNull();
    });

    it('should get newest', () => {
      ie.build('k1', 'v1');
      expect(ie.getNewest()?.id).toBe('idx-1');
    });

    it('should return null for empty newest', () => {
      expect(ie.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ie.build('k1', 'v1');
      expect(ie.getOldest()?.id).toBe('idx-1');
    });

    it('should return null for empty oldest', () => {
      expect(ie.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        ie.build(`k${i}`, i);
      }
      expect(ie.getCount()).toBe(50);
    });
  });
});