/**
 * RefactorEngine Tests
 * claude-code-design Refactor Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RefactorEngine } from '../RefactorEngine';

describe('RefactorEngine', () => {
  let rfe: RefactorEngine;

  beforeEach(() => {
    rfe = new RefactorEngine();
  });

  afterEach(() => {
    rfe.clearAll();
  });

  // ============================================================
  // define / apply / reset
  // ============================================================
  describe('define / apply / reset', () => {
    it('should define', () => {
      expect(rfe.define('r1', 'old', 'new')).toBe('rfe-1');
    });

    it('should mark as active', () => {
      const id = rfe.define('r1', 'old', 'new');
      expect(rfe.isActive(id)).toBe(true);
    });

    it('should default to empty', () => {
      const id = rfe.define('r1', 'old');
      expect(rfe.getTo(id)).toBe('');
    });

    it('should apply', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old code');
    });

    it('should replace in apply', () => {
      const id = rfe.define('r1', 'old', 'new');
      expect(rfe.apply(id, 'old code')).toBe('new code');
    });

    it('should replace all occurrences', () => {
      const id = rfe.define('r1', 'old', 'new');
      expect(rfe.apply(id, 'old old old')).toBe('new new new');
    });

    it('should increment applications on apply', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old code');
      expect(rfe.getApplications(id)).toBe(1);
    });

    it('should log history on apply', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old code');
      expect(rfe.getHistory(id)).toHaveLength(1);
    });

    it('should return unchanged code for unknown', () => {
      expect(rfe.apply('unknown', 'code')).toBe('code');
    });

    it('should return unchanged for inactive', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.setActive(id, false);
      expect(rfe.apply(id, 'old code')).toBe('old code');
    });

    it('should reset', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      expect(rfe.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      rfe.reset(id);
      expect(rfe.getApplications(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(rfe.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rfe.define('r1', 'old', 'new');
      const stats = rfe.getStats();
      expect(stats.refactors).toBe(1);
    });

    it('should count total applications', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      expect(rfe.getStats().totalApplications).toBe(1);
    });

    it('should count active', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.setActive(id, false);
      expect(rfe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      expect(rfe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      rfe.define('r1', 'old', 'new');
      rfe.define('r2', 'old', 'new');
      expect(rfe.getStats().uniqueNames).toBe(2);
    });

    it('should count unique from', () => {
      rfe.define('r1', 'a', 'b');
      rfe.define('r2', 'c', 'd');
      expect(rfe.getStats().uniqueFrom).toBe(2);
    });

    it('should count unique to', () => {
      rfe.define('r1', 'a', 'b');
      rfe.define('r2', 'c', 'd');
      expect(rfe.getStats().uniqueTo).toBe(2);
    });

    it('should compute avg applications', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      expect(rfe.getStats().avgApplications).toBe(1);
    });

    it('should get max applications', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'a');
      rfe.apply(id, 'b');
      expect(rfe.getStats().maxApplications).toBe(2);
    });

    it('should get min applications', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getStats().minApplications).toBe(0);
    });

    it('should compute avg from length', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getStats().avgFromLength).toBe(3);
    });

    it('should compute avg to length', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getStats().avgToLength).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get refactor', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getRefactor('rfe-1')?.name).toBe('r1');
    });

    it('should get all', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getAllRefactors()).toHaveLength(1);
    });

    it('should remove', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.removeRefactor('rfe-1')).toBe(true);
    });

    it('should check existence', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.hasRefactor('rfe-1')).toBe(true);
    });

    it('should count', () => {
      expect(rfe.getCount()).toBe(0);
      rfe.define('r1', 'old', 'new');
      expect(rfe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getName('rfe-1')).toBe('r1');
    });

    it('should get from', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getFrom('rfe-1')).toBe('old');
    });

    it('should get to', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getTo('rfe-1')).toBe('new');
    });

    it('should get from length', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getFromLength('rfe-1')).toBe(3);
    });

    it('should get to length', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getToLength('rfe-1')).toBe(3);
    });

    it('should get history', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getHistory('rfe-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      expect(rfe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.setActive('rfe-1', false)).toBe(true);
    });

    it('should set name', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.setName('rfe-1', 'r2')).toBe(true);
    });

    it('should set from', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.setFrom('rfe-1', 'older')).toBe(true);
    });

    it('should set to', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.setTo('rfe-1', 'newer')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rfe.setActive('unknown', false)).toBe(false);
      expect(rfe.setName('unknown', 'r')).toBe(false);
      expect(rfe.setFrom('unknown', 'a')).toBe(false);
      expect(rfe.setTo('unknown', 'b')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      rfe.setActive(id, false);
      rfe.resetAll();
      expect(rfe.getApplications(id)).toBe(0);
      expect(rfe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getByName('r1')).toHaveLength(1);
    });

    it('should get active', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getActiveRefactors()).toHaveLength(1);
    });

    it('should get inactive', () => {
      rfe.define('r1', 'old', 'new');
      rfe.setActive('rfe-1', false);
      expect(rfe.getInactiveRefactors()).toHaveLength(1);
    });

    it('should get all names', () => {
      rfe.define('r1', 'old', 'new');
      rfe.define('r2', 'old', 'new');
      expect(rfe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getNameCount()).toBe(1);
    });

    it('should get by min applications', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      expect(rfe.getByMinApplications(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most applications', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'a');
      rfe.apply(id, 'b');
      expect(rfe.getMostApplications()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(rfe.getMostApplications()).toBeNull();
    });

    it('should get newest', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getNewest()?.id).toBe('rfe-1');
    });

    it('should return null for empty newest', () => {
      expect(rfe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getOldest()?.id).toBe('rfe-1');
    });

    it('should return null for empty oldest', () => {
      expect(rfe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      rfe.define('r1', 'old', 'new');
      expect(rfe.getCreatedAt('rfe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      expect(rfe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total applications', () => {
      const id = rfe.define('r1', 'old', 'new');
      rfe.apply(id, 'old');
      expect(rfe.getTotalApplications()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many refactors', () => {
      for (let i = 0; i < 50; i++) {
        rfe.define(`r${i}`, 'a', 'b');
      }
      expect(rfe.getCount()).toBe(50);
    });
  });
});