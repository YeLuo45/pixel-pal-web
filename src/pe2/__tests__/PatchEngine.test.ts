/**
 * PatchEngine Tests
 * claude-code-design Patch Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PatchEngine } from '../PatchEngine';

describe('PatchEngine', () => {
  let pe: PatchEngine;

  beforeEach(() => {
    pe = new PatchEngine();
  });

  afterEach(() => {
    pe.clearAll();
  });

  // ============================================================
  // create / apply / rollback
  // ============================================================
  describe('create / apply / rollback', () => {
    it('should create', () => {
      expect(pe.create('p1', ['h1'])).toBe('pe2-1');
    });

    it('should mark as active', () => {
      const id = pe.create('p1', ['h1']);
      expect(pe.isActive(id)).toBe(true);
    });

    it('should mark as reversible by default', () => {
      const id = pe.create('p1', ['h1']);
      expect(pe.isReversible(id)).toBe(true);
    });

    it('should mark as non-reversible', () => {
      const id = pe.create('p1', ['h1'], false);
      expect(pe.isReversible(id)).toBe(false);
    });

    it('should apply', () => {
      const id = pe.create('p1', ['h1']);
      expect(pe.apply(id)).toBe(true);
    });

    it('should mark as applied', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.isApplied(id)).toBe(true);
    });

    it('should not apply twice', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.apply(id)).toBe(false);
    });

    it('should not apply inactive', () => {
      const id = pe.create('p1', ['h1']);
      pe.setActive(id, false);
      expect(pe.apply(id)).toBe(false);
    });

    it('should return false for unknown apply', () => {
      expect(pe.apply('unknown')).toBe(false);
    });

    it('should rollback', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.rollback(id)).toBe(true);
    });

    it('should mark as not applied on rollback', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      pe.rollback(id);
      expect(pe.isApplied(id)).toBe(false);
    });

    it('should not rollback non-reversible', () => {
      const id = pe.create('p1', ['h1'], false);
      pe.apply(id);
      expect(pe.rollback(id)).toBe(false);
    });

    it('should not rollback non-applied', () => {
      const id = pe.create('p1', ['h1']);
      expect(pe.rollback(id)).toBe(false);
    });

    it('should return false for unknown rollback', () => {
      expect(pe.rollback('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pe.create('p1', ['h1']);
      const stats = pe.getStats();
      expect(stats.patches).toBe(1);
    });

    it('should count applied', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.getStats().applied).toBe(1);
    });

    it('should count rolled', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      pe.rollback(id);
      expect(pe.getStats().rolled).toBe(1);
    });

    it('should count pending', () => {
      pe.create('p1', ['h1']);
      expect(pe.getStats().pending).toBe(1);
    });

    it('should count active', () => {
      pe.create('p1', ['h1']);
      expect(pe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pe.create('p1', ['h1']);
      pe.setActive(id, false);
      expect(pe.getStats().inactive).toBe(1);
    });

    it('should count reversible', () => {
      pe.create('p1', ['h1'], true);
      pe.create('p2', ['h2'], false);
      expect(pe.getStats().reversible).toBe(1);
    });

    it('should count non-reversible', () => {
      pe.create('p1', ['h1'], false);
      expect(pe.getStats().nonReversible).toBe(1);
    });

    it('should count total hunks', () => {
      pe.create('p1', ['h1', 'h2']);
      pe.create('p2', ['h3']);
      expect(pe.getStats().totalHunks).toBe(3);
    });

    it('should count total hits', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.getStats().totalHits).toBe(1);
    });

    it('should compute avg hunks', () => {
      pe.create('p1', ['h1', 'h2']);
      expect(pe.getStats().avgHunks).toBe(2);
    });

    it('should compute apply rate', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.getStats().applyRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get patch', () => {
      pe.create('p1', ['h1']);
      expect(pe.getPatch('pe2-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      pe.create('p1', ['h1']);
      expect(pe.getAllPatches()).toHaveLength(1);
    });

    it('should remove', () => {
      pe.create('p1', ['h1']);
      expect(pe.removePatch('pe2-1')).toBe(true);
    });

    it('should check existence', () => {
      pe.create('p1', ['h1']);
      expect(pe.hasPatch('pe2-1')).toBe(true);
    });

    it('should count', () => {
      expect(pe.getCount()).toBe(0);
      pe.create('p1', ['h1']);
      expect(pe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pe.create('p1', ['h1']);
      expect(pe.getName('pe2-1')).toBe('p1');
    });

    it('should get hunks', () => {
      pe.create('p1', ['h1', 'h2']);
      expect(pe.getHunks('pe2-1')).toEqual(['h1', 'h2']);
    });

    it('should get hunk count', () => {
      pe.create('p1', ['h1']);
      expect(pe.getHunkCount('pe2-1')).toBe(1);
    });

    it('should get hits', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      pe.create('p1', ['h1']);
      expect(pe.getHistory('pe2-1').length).toBeGreaterThan(0);
    });

    it('should get applied at', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.getAppliedAt(id)).toBeGreaterThan(0);
    });

    it('should get null applied at for not applied', () => {
      pe.create('p1', ['h1']);
      expect(pe.getAppliedAt('pe2-1')).toBeNull();
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pe.create('p1', ['h1']);
      expect(pe.setActive('pe2-1', false)).toBe(true);
    });

    it('should set name', () => {
      pe.create('p1', ['h1']);
      expect(pe.setName('pe2-1', 'p2')).toBe(true);
    });

    it('should set hunks', () => {
      pe.create('p1', ['h1']);
      expect(pe.setHunks('pe2-1', ['h2', 'h3'])).toBe(true);
    });

    it('should set reversible', () => {
      pe.create('p1', ['h1']);
      expect(pe.setReversible('pe2-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pe.setActive('unknown', false)).toBe(false);
      expect(pe.setName('unknown', 'p')).toBe(false);
      expect(pe.setHunks('unknown', [])).toBe(false);
      expect(pe.setReversible('unknown', true)).toBe(false);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isPending', () => {
      pe.create('p1', ['h1']);
      expect(pe.isPending('pe2-1')).toBe(true);
    });

    it('should check not pending after apply', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.isPending(id)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      pe.setActive(id, false);
      pe.resetAll();
      expect(pe.isApplied(id)).toBe(false);
      expect(pe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      pe.create('p1', ['h1']);
      expect(pe.getByName('p1')).toHaveLength(1);
    });

    it('should get applied', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.getAppliedPatches()).toHaveLength(1);
    });

    it('should get pending', () => {
      pe.create('p1', ['h1']);
      expect(pe.getPendingPatches()).toHaveLength(1);
    });

    it('should get active', () => {
      pe.create('p1', ['h1']);
      expect(pe.getActivePatches()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pe.create('p1', ['h1']);
      pe.setActive('pe2-1', false);
      expect(pe.getInactivePatches()).toHaveLength(1);
    });

    it('should get all names', () => {
      pe.create('p1', ['h1']);
      pe.create('p2', ['h2']);
      expect(pe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pe.create('p1', ['h1']);
      expect(pe.getNameCount()).toBe(1);
    });

    it('should get by min hunks', () => {
      pe.create('p1', ['h1', 'h2']);
      pe.create('p2', ['h3']);
      expect(pe.getByMinHunks(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hunks', () => {
      pe.create('p1', ['h1', 'h2']);
      expect(pe.getMostHunks()?.id).toBe('pe2-1');
    });

    it('should return null for empty most', () => {
      expect(pe.getMostHunks()).toBeNull();
    });

    it('should get newest', () => {
      pe.create('p1', ['h1']);
      expect(pe.getNewest()?.id).toBe('pe2-1');
    });

    it('should return null for empty newest', () => {
      expect(pe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pe.create('p1', ['h1']);
      expect(pe.getOldest()?.id).toBe('pe2-1');
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
      pe.create('p1', ['h1']);
      expect(pe.getCreatedAt('pe2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total applied', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      expect(pe.getTotalApplied()).toBe(1);
    });

    it('should get total rolled', () => {
      const id = pe.create('p1', ['h1']);
      pe.apply(id);
      pe.rollback(id);
      expect(pe.getTotalRolled()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many patches', () => {
      for (let i = 0; i < 50; i++) {
        pe.create(`p${i}`, [`h${i}`]);
      }
      expect(pe.getCount()).toBe(50);
    });
  });
});