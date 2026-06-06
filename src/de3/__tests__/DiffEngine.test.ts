/**
 * DiffEngine Tests
 * claude-code-design Diff Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DiffEngine } from '../DiffEngine';

describe('DiffEngine', () => {
  let de: DiffEngine;

  beforeEach(() => {
    de = new DiffEngine();
  });

  afterEach(() => {
    de.clearAll();
  });

  // ============================================================
  // create / update / reset
  // ============================================================
  describe('create / update / reset', () => {
    it('should create', () => {
      expect(de.create('d1', 'old', 'new')).toBe('de3-1');
    });

    it('should mark as active', () => {
      const id = de.create('d1', 'old', 'new');
      expect(de.isActive(id)).toBe(true);
    });

    it('should compute changes', () => {
      const id = de.create('d1', 'old', 'new');
      expect(de.getChanges(id)).toBe(3);
    });

    it('should compute 0 changes for identical texts', () => {
      const id = de.create('d1', 'same', 'same');
      expect(de.getChanges(id)).toBe(0);
    });

    it('should update', () => {
      const id = de.create('d1', 'old', 'new');
      expect(de.update(id, 'newer')).toBe(true);
    });

    it('should set new text on update', () => {
      const id = de.create('d1', 'old', 'new');
      de.update(id, 'newer');
      expect(de.getNewText(id)).toBe('newer');
    });

    it('should recompute changes on update', () => {
      const id = de.create('d1', 'old', 'new');
      de.update(id, 'newer');
      expect(de.getChanges(id)).toBe(5);
    });

    it('should not update inactive', () => {
      const id = de.create('d1', 'old', 'new');
      de.setActive(id, false);
      expect(de.update(id, 'newer')).toBe(false);
    });

    it('should return false for unknown update', () => {
      expect(de.update('unknown', 'newer')).toBe(false);
    });

    it('should reset', () => {
      const id = de.create('d1', 'old', 'new');
      expect(de.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = de.create('d1', 'old', 'new');
      de.reset(id);
      expect(de.getChanges(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(de.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      de.create('d1', 'old', 'new');
      const stats = de.getStats();
      expect(stats.diffs).toBe(1);
    });

    it('should count total changes', () => {
      de.create('d1', 'old', 'new');
      expect(de.getStats().totalChanges).toBe(3);
    });

    it('should count active', () => {
      de.create('d1', 'old', 'new');
      expect(de.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = de.create('d1', 'old', 'new');
      de.setActive(id, false);
      expect(de.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = de.create('d1', 'old', 'new');
      de.update(id, 'newer');
      expect(de.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      de.create('d1', 'old', 'new');
      de.create('d2', 'a', 'b');
      expect(de.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg changes', () => {
      de.create('d1', 'old', 'new');
      expect(de.getStats().avgChanges).toBe(3);
    });

    it('should get max changes', () => {
      de.create('d1', 'old', 'new');
      de.create('d2', 'a', 'bbbb');
      expect(de.getStats().maxChanges).toBe(4);
    });

    it('should get min changes', () => {
      de.create('d1', 'old', 'new');
      de.create('d2', 'same', 'same');
      expect(de.getStats().minChanges).toBe(0);
    });

    it('should compute avg old text length', () => {
      de.create('d1', 'old', 'new');
      expect(de.getStats().avgOldTextLength).toBe(3);
    });

    it('should compute avg new text length', () => {
      de.create('d1', 'old', 'new');
      expect(de.getStats().avgNewTextLength).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get diff', () => {
      de.create('d1', 'old', 'new');
      expect(de.getDiff('de3-1')?.name).toBe('d1');
    });

    it('should get all', () => {
      de.create('d1', 'old', 'new');
      expect(de.getAllDiffs()).toHaveLength(1);
    });

    it('should remove', () => {
      de.create('d1', 'old', 'new');
      expect(de.removeDiff('de3-1')).toBe(true);
    });

    it('should check existence', () => {
      de.create('d1', 'old', 'new');
      expect(de.hasDiff('de3-1')).toBe(true);
    });

    it('should count', () => {
      expect(de.getCount()).toBe(0);
      de.create('d1', 'old', 'new');
      expect(de.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      de.create('d1', 'old', 'new');
      expect(de.getName('de3-1')).toBe('d1');
    });

    it('should get old text', () => {
      de.create('d1', 'old', 'new');
      expect(de.getOldText('de3-1')).toBe('old');
    });

    it('should get new text', () => {
      de.create('d1', 'old', 'new');
      expect(de.getNewText('de3-1')).toBe('new');
    });

    it('should get history', () => {
      de.create('d1', 'old', 'new');
      expect(de.getHistory('de3-1')).toEqual([3]);
    });

    it('should get hits', () => {
      const id = de.create('d1', 'old', 'new');
      de.update(id, 'newer');
      expect(de.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      de.create('d1', 'old', 'new');
      expect(de.setActive('de3-1', false)).toBe(true);
    });

    it('should set name', () => {
      de.create('d1', 'old', 'new');
      expect(de.setName('de3-1', 'd2')).toBe(true);
    });

    it('should set old text', () => {
      de.create('d1', 'old', 'new');
      expect(de.setOldText('de3-1', 'older')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(de.setActive('unknown', false)).toBe(false);
      expect(de.setName('unknown', 'd')).toBe(false);
      expect(de.setOldText('unknown', 'o')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = de.create('d1', 'old', 'new');
      de.setActive(id, false);
      de.resetAll();
      expect(de.getChanges(id)).toBe(0);
      expect(de.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      de.create('d1', 'old', 'new');
      expect(de.getByName('d1')).toHaveLength(1);
    });

    it('should get active', () => {
      de.create('d1', 'old', 'new');
      expect(de.getActiveDiffs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      de.create('d1', 'old', 'new');
      de.setActive('de3-1', false);
      expect(de.getInactiveDiffs()).toHaveLength(1);
    });

    it('should get all names', () => {
      de.create('d1', 'old', 'new');
      de.create('d2', 'a', 'b');
      expect(de.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      de.create('d1', 'old', 'new');
      expect(de.getNameCount()).toBe(1);
    });

    it('should get by min changes', () => {
      de.create('d1', 'old', 'new');
      de.create('d2', 'same', 'same');
      expect(de.getByMinChanges(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most changes', () => {
      de.create('d1', 'old', 'new');
      de.create('d2', 'a', 'bbbbb');
      expect(de.getMostChanges()?.id).toBe('de3-2');
    });

    it('should return null for empty most', () => {
      expect(de.getMostChanges()).toBeNull();
    });

    it('should get newest', () => {
      de.create('d1', 'old', 'new');
      expect(de.getNewest()?.id).toBe('de3-1');
    });

    it('should return null for empty newest', () => {
      expect(de.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      de.create('d1', 'old', 'new');
      expect(de.getOldest()?.id).toBe('de3-1');
    });

    it('should return null for empty oldest', () => {
      expect(de.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      de.create('d1', 'old', 'new');
      expect(de.getCreatedAt('de3-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = de.create('d1', 'old', 'new');
      de.update(id, 'newer');
      expect(de.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total changes', () => {
      de.create('d1', 'old', 'new');
      expect(de.getTotalChanges()).toBe(3);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many diffs', () => {
      for (let i = 0; i < 50; i++) {
        de.create(`d${i}`, `old${i}`, `new${i}`);
      }
      expect(de.getCount()).toBe(50);
    });
  });
});