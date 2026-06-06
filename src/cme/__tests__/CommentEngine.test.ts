/**
 * CommentEngine Tests
 * claude-code-design Comment Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CommentEngine } from '../CommentEngine';

describe('CommentEngine', () => {
  let cme: CommentEngine;

  beforeEach(() => {
    cme = new CommentEngine();
  });

  afterEach(() => {
    cme.clearAll();
  });

  // ============================================================
  // add / resolve / unresolve
  // ============================================================
  describe('add / resolve / unresolve', () => {
    it('should add', () => {
      expect(cme.add('alice', 'comment1')).toBe('cme-1');
    });

    it('should mark as active', () => {
      const id = cme.add('alice', 'comment1');
      expect(cme.isActive(id)).toBe(true);
    });

    it('should mark as unresolved', () => {
      const id = cme.add('alice', 'comment1');
      expect(cme.isResolved(id)).toBe(false);
    });

    it('should resolve', () => {
      const id = cme.add('alice', 'comment1');
      expect(cme.resolve(id)).toBe(true);
    });

    it('should mark as resolved', () => {
      const id = cme.add('alice', 'comment1');
      cme.resolve(id);
      expect(cme.isResolved(id)).toBe(true);
    });

    it('should log history on resolve', () => {
      const id = cme.add('alice', 'comment1');
      cme.resolve(id);
      expect(cme.getHistory(id)).toEqual([true]);
    });

    it('should not resolve inactive', () => {
      const id = cme.add('alice', 'comment1');
      cme.setActive(id, false);
      expect(cme.resolve(id)).toBe(false);
    });

    it('should not resolve twice', () => {
      const id = cme.add('alice', 'comment1');
      cme.resolve(id);
      expect(cme.resolve(id)).toBe(false);
    });

    it('should return false for unknown resolve', () => {
      expect(cme.resolve('unknown')).toBe(false);
    });

    it('should unresolve', () => {
      const id = cme.add('alice', 'comment1');
      cme.resolve(id);
      expect(cme.unresolve(id)).toBe(true);
    });

    it('should mark as unresolved on unresolve', () => {
      const id = cme.add('alice', 'comment1');
      cme.resolve(id);
      cme.unresolve(id);
      expect(cme.isResolved(id)).toBe(false);
    });

    it('should not unresolve not resolved', () => {
      const id = cme.add('alice', 'comment1');
      expect(cme.unresolve(id)).toBe(false);
    });

    it('should return false for unknown unresolve', () => {
      expect(cme.unresolve('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cme.add('alice', 'comment1');
      const stats = cme.getStats();
      expect(stats.comments).toBe(1);
    });

    it('should count resolved', () => {
      const id = cme.add('alice', 'comment1');
      cme.resolve(id);
      expect(cme.getStats().resolved).toBe(1);
    });

    it('should count unresolved', () => {
      cme.add('alice', 'comment1');
      expect(cme.getStats().unresolved).toBe(1);
    });

    it('should count active', () => {
      cme.add('alice', 'comment1');
      expect(cme.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cme.add('alice', 'comment1');
      cme.setActive(id, false);
      expect(cme.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cme.add('alice', 'comment1');
      cme.resolve(id);
      expect(cme.getStats().totalHits).toBe(1);
    });

    it('should count unique authors', () => {
      cme.add('alice', 'c1');
      cme.add('bob', 'c2');
      expect(cme.getStats().uniqueAuthors).toBe(2);
    });

    it('should compute avg text length', () => {
      cme.add('alice', 'abcdef');
      expect(cme.getStats().avgTextLength).toBe(6);
    });

    it('should get max text length', () => {
      cme.add('alice', 'short');
      cme.add('alice', 'longer comment');
      expect(cme.getStats().maxTextLength).toBe(14);
    });

    it('should get min text length', () => {
      cme.add('alice', 'short');
      cme.add('alice', 'longer comment');
      expect(cme.getStats().minTextLength).toBe(5);
    });

    it('should compute total text length', () => {
      cme.add('alice', 'abc');
      cme.add('alice', 'defg');
      expect(cme.getStats().totalTextLength).toBe(7);
    });

    it('should compute resolution rate', () => {
      const id = cme.add('alice', 'c1');
      cme.resolve(id);
      expect(cme.getStats().resolutionRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get comment', () => {
      cme.add('alice', 'c1');
      expect(cme.getComment('cme-1')?.author).toBe('alice');
    });

    it('should get all', () => {
      cme.add('alice', 'c1');
      expect(cme.getAllComments()).toHaveLength(1);
    });

    it('should remove', () => {
      cme.add('alice', 'c1');
      expect(cme.removeComment('cme-1')).toBe(true);
    });

    it('should check existence', () => {
      cme.add('alice', 'c1');
      expect(cme.hasComment('cme-1')).toBe(true);
    });

    it('should count', () => {
      expect(cme.getCount()).toBe(0);
      cme.add('alice', 'c1');
      expect(cme.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get author', () => {
      cme.add('alice', 'c1');
      expect(cme.getAuthor('cme-1')).toBe('alice');
    });

    it('should get text', () => {
      cme.add('alice', 'c1');
      expect(cme.getText('cme-1')).toBe('c1');
    });

    it('should get history', () => {
      cme.add('alice', 'c1');
      expect(cme.getHistory('cme-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = cme.add('alice', 'c1');
      cme.resolve(id);
      expect(cme.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cme.add('alice', 'c1');
      expect(cme.setActive('cme-1', false)).toBe(true);
    });

    it('should set author', () => {
      cme.add('alice', 'c1');
      expect(cme.setAuthor('cme-1', 'bob')).toBe(true);
    });

    it('should set text', () => {
      cme.add('alice', 'c1');
      expect(cme.setText('cme-1', 'c2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cme.setActive('unknown', false)).toBe(false);
      expect(cme.setAuthor('unknown', 'a')).toBe(false);
      expect(cme.setText('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cme.add('alice', 'c1');
      cme.resolve(id);
      cme.setActive(id, false);
      cme.resetAll();
      expect(cme.isResolved(id)).toBe(false);
      expect(cme.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by author / state
  // ============================================================
  describe('by author / state', () => {
    it('should get by author', () => {
      cme.add('alice', 'c1');
      expect(cme.getByAuthor('alice')).toHaveLength(1);
    });

    it('should get resolved', () => {
      const id = cme.add('alice', 'c1');
      cme.resolve(id);
      expect(cme.getResolvedComments()).toHaveLength(1);
    });

    it('should get unresolved', () => {
      cme.add('alice', 'c1');
      expect(cme.getUnresolvedComments()).toHaveLength(1);
    });

    it('should get active', () => {
      cme.add('alice', 'c1');
      expect(cme.getActiveComments()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cme.add('alice', 'c1');
      cme.setActive('cme-1', false);
      expect(cme.getInactiveComments()).toHaveLength(1);
    });

    it('should get all authors', () => {
      cme.add('alice', 'c1');
      cme.add('bob', 'c2');
      expect(cme.getAllAuthors()).toHaveLength(2);
    });

    it('should get author count', () => {
      cme.add('alice', 'c1');
      expect(cme.getAuthorCount()).toBe(1);
    });

    it('should get by min text length', () => {
      cme.add('alice', 'long comment');
      cme.add('alice', 'x');
      expect(cme.getByMinTextLength(5)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most text length', () => {
      cme.add('alice', 'long comment');
      cme.add('alice', 'x');
      expect(cme.getMostTextLength()?.id).toBe('cme-1');
    });

    it('should return null for empty most', () => {
      expect(cme.getMostTextLength()).toBeNull();
    });

    it('should get newest', () => {
      cme.add('alice', 'c1');
      expect(cme.getNewest()?.id).toBe('cme-1');
    });

    it('should return null for empty newest', () => {
      expect(cme.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cme.add('alice', 'c1');
      expect(cme.getOldest()?.id).toBe('cme-1');
    });

    it('should return null for empty oldest', () => {
      expect(cme.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cme.add('alice', 'c1');
      expect(cme.getCreatedAt('cme-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cme.add('alice', 'c1');
      cme.resolve(id);
      expect(cme.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total resolved', () => {
      const id = cme.add('alice', 'c1');
      cme.resolve(id);
      expect(cme.getTotalResolved()).toBe(1);
    });

    it('should get total unresolved', () => {
      const id = cme.add('alice', 'c1');
      cme.resolve(id);
      expect(cme.getTotalUnresolved()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many comments', () => {
      for (let i = 0; i < 50; i++) {
        cme.add(`author${i}`, `comment${i}`);
      }
      expect(cme.getCount()).toBe(50);
    });
  });
});