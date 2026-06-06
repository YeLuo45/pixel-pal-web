/**
 * DiffEngine Tests
 * claude-code-design Diff Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DiffEngine } from '../DiffEngine';

describe('DiffEngine', () => {
  let dfe: DiffEngine;

  beforeEach(() => {
    dfe = new DiffEngine();
  });

  afterEach(() => {
    dfe.clearAll();
  });

  // ============================================================
  // compute / apply / remove
  // ============================================================
  describe('compute / apply / remove', () => {
    it('should compute same', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(ids.length).toBeGreaterThan(0);
    });

    it('should compute add empty to new', () => {
      const ids = dfe.compute('', 'abc');
      expect(ids).toHaveLength(3);
    });

    it('should compute remove old to empty', () => {
      const ids = dfe.compute('abc', '');
      expect(ids).toHaveLength(3);
    });

    it('should compute changes', () => {
      const ids = dfe.compute('abc', 'xyz');
      expect(ids.length).toBeGreaterThan(0);
    });

    it('should apply', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.apply(ids[0])).toBe(true);
    });

    it('should return false for unknown apply', () => {
      expect(dfe.apply('unknown')).toBe(false);
    });

    it('should remove', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.remove(ids[0])).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(dfe.remove('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      dfe.compute('abc', 'abc');
      const stats = dfe.getStats();
      expect(stats.diffs).toBeGreaterThan(0);
    });

    it('should count total adds', () => {
      dfe.compute('', 'abc');
      expect(dfe.getStats().totalAdds).toBe(3);
    });

    it('should count total removes', () => {
      dfe.compute('abc', '');
      expect(dfe.getStats().totalRemoves).toBe(3);
    });

    it('should count total sames', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getStats().totalSames).toBeGreaterThan(0);
    });

    it('should count active', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getStats().active).toBeGreaterThan(0);
    });

    it('should count inactive', () => {
      const ids = dfe.compute('abc', 'abc');
      dfe.setActive(ids[0], false);
      expect(dfe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const ids = dfe.compute('abc', 'abc');
      dfe.apply(ids[0]);
      expect(dfe.getStats().totalHits).toBe(1);
    });

    it('should count total length', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getStats().totalLength).toBeGreaterThan(0);
    });

    it('should compute avg length', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getStats().avgLength).toBeGreaterThan(0);
    });

    it('should get max length', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getStats().maxLength).toBeGreaterThan(0);
    });

    it('should get min length', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getStats().minLength).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get diff', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.getDiff(ids[0])).toBeDefined();
    });

    it('should get all', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getAllDiffs()).toHaveLength(3);
    });

    it('should check existence', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.hasDiff(ids[0])).toBe(true);
    });

    it('should count', () => {
      expect(dfe.getCount()).toBe(0);
      dfe.compute('abc', 'abc');
      expect(dfe.getCount()).toBe(3);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get type', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.getType(ids[0])).toBe('same');
    });

    it('should get old text', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.getOldText(ids[0])).toBe('a');
    });

    it('should get new text', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.getNewText(ids[0])).toBe('a');
    });

    it('should get length', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.getLength(ids[0])).toBe(1);
    });

    it('should get hits', () => {
      const ids = dfe.compute('abc', 'abc');
      dfe.apply(ids[0]);
      expect(dfe.getHits(ids[0])).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.setActive(ids[0], false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(dfe.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      dfe.compute('abc', 'abc');
      dfe.resetAll();
      expect(dfe.getCount()).toBe(0);
    });
  });

  // ============================================================
  // by type
  // ============================================================
  describe('by type', () => {
    it('should get adds', () => {
      dfe.compute('', 'abc');
      expect(dfe.getAdds()).toHaveLength(3);
    });

    it('should get removes', () => {
      dfe.compute('abc', '');
      expect(dfe.getRemoves()).toHaveLength(3);
    });

    it('should get sames', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getSames()).toHaveLength(3);
    });

    it('should get by type', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getByType('same')).toHaveLength(3);
    });

    it('should get active', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getActiveDiffs()).toHaveLength(3);
    });

    it('should get inactive', () => {
      const ids = dfe.compute('abc', 'abc');
      dfe.setActive(ids[0], false);
      expect(dfe.getInactiveDiffs()).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getNewest()).toBeDefined();
    });

    it('should return null for empty newest', () => {
      expect(dfe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getOldest()).toBeDefined();
    });

    it('should return null for empty oldest', () => {
      expect(dfe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      const ids = dfe.compute('abc', 'abc');
      expect(dfe.getCreatedAt(ids[0])).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const ids = dfe.compute('abc', 'abc');
      dfe.apply(ids[0]);
      expect(dfe.getUpdatedAt(ids[0])).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total adds', () => {
      dfe.compute('', 'abc');
      expect(dfe.getTotalAdds()).toBe(3);
    });

    it('should get total removes', () => {
      dfe.compute('abc', '');
      expect(dfe.getTotalRemoves()).toBe(3);
    });

    it('should get total sames', () => {
      dfe.compute('abc', 'abc');
      expect(dfe.getTotalSames()).toBe(3);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle large diff', () => {
      const ids = dfe.compute('a'.repeat(50), 'b'.repeat(50));
      expect(ids.length).toBeGreaterThan(50);
    });
  });
});