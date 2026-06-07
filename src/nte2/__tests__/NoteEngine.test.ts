/**
 * NoteEngine Tests
 * chatdev-design Note Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NoteEngine } from '../NoteEngine';

describe('NoteEngine', () => {
  let nte: NoteEngine;

  beforeEach(() => {
    nte = new NoteEngine();
  });

  afterEach(() => {
    nte.clearAll();
  });

  describe('add / update / pin / unpin / remove', () => {
    it('should add', () => {
      expect(nte.add('t1', 'c1', 'a1')).toBe('nte-1');
    });

    it('should default pinned to false', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.isPinned('nte-1')).toBe(false);
    });

    it('should mark as active', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.isActive('nte-1')).toBe(true);
    });

    it('should update', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.update('nte-1', 'c2')).toBe(true);
    });

    it('should not update inactive', () => {
      nte.add('t1', 'c1', 'a1');
      nte.setActive('nte-1', false);
      expect(nte.update('nte-1', 'c2')).toBe(false);
    });

    it('should return false for unknown update', () => {
      expect(nte.update('unknown', 'c2')).toBe(false);
    });

    it('should pin', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.pin('nte-1')).toBe(true);
    });

    it('should return false for unknown pin', () => {
      expect(nte.pin('unknown')).toBe(false);
    });

    it('should unpin', () => {
      nte.add('t1', 'c1', 'a1');
      nte.pin('nte-1');
      expect(nte.unpin('nte-1')).toBe(true);
    });

    it('should return false for unknown unpin', () => {
      expect(nte.unpin('unknown')).toBe(false);
    });

    it('should remove', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.remove('nte-1')).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(nte.remove('unknown')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getStats().notes).toBe(1);
    });

    it('should count total added', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getStats().totalAdded).toBe(1);
    });

    it('should count total updated', () => {
      nte.add('t1', 'c1', 'a1');
      nte.update('nte-1', 'c2');
      expect(nte.getStats().totalUpdated).toBe(1);
    });

    it('should count total deleted', () => {
      nte.add('t1', 'c1', 'a1');
      nte.remove('nte-1');
      expect(nte.getStats().totalDeleted).toBe(1);
    });

    it('should count pinned', () => {
      nte.add('t1', 'c1', 'a1');
      nte.pin('nte-1');
      expect(nte.getStats().pinned).toBe(1);
    });

    it('should count unpinned', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getStats().unpinned).toBe(1);
    });

    it('should count active', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      nte.add('t1', 'c1', 'a1');
      nte.setActive('nte-1', false);
      expect(nte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      nte.add('t1', 'c1', 'a1');
      nte.update('nte-1', 'c2');
      expect(nte.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      nte.add('a', 'c1', 'a1');
      nte.add('a', 'c2', 'a1');
      expect(nte.getStats().uniqueTitles).toBe(1);
    });

    it('should count unique authors', () => {
      nte.add('t1', 'c1', 'a');
      nte.add('t2', 'c2', 'a');
      expect(nte.getStats().uniqueAuthors).toBe(1);
    });

    it('should compute avg content length', () => {
      nte.add('t1', 'hi', 'a1');
      nte.add('t2', 'hello', 'a1');
      expect(nte.getStats().avgContentLength).toBe(3.5);
    });

    it('should get max content length', () => {
      nte.add('t1', 'hi', 'a1');
      nte.add('t2', 'hello', 'a1');
      expect(nte.getStats().maxContentLength).toBe(5);
    });

    it('should get min content length', () => {
      nte.add('t1', 'hi', 'a1');
      nte.add('t2', 'hello', 'a1');
      expect(nte.getStats().minContentLength).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get note', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getNote('nte-1')?.title).toBe('t1');
    });

    it('should get all', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getAllNotes()).toHaveLength(1);
    });

    it('should check existence', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.hasNote('nte-1')).toBe(true);
    });

    it('should count', () => {
      expect(nte.getCount()).toBe(0);
      nte.add('t1', 'c1', 'a1');
      expect(nte.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get title', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getTitle('nte-1')).toBe('t1');
    });

    it('should get content', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getContent('nte-1')).toBe('c1');
    });

    it('should get author', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getAuthor('nte-1')).toBe('a1');
    });

    it('should get content length', () => {
      nte.add('t1', 'hi', 'a1');
      expect(nte.getContentLength('nte-1')).toBe(2);
    });

    it('should get hits', () => {
      nte.add('t1', 'c1', 'a1');
      nte.update('nte-1', 'c2');
      expect(nte.getHits('nte-1')).toBe(1);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.setActive('nte-1', false)).toBe(true);
    });

    it('should set title', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.setTitle('nte-1', 't2')).toBe(true);
    });

    it('should set author', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.setAuthor('nte-1', 'a2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(nte.setActive('unknown', false)).toBe(false);
      expect(nte.setTitle('unknown', 't')).toBe(false);
      expect(nte.setAuthor('unknown', 'a')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      nte.add('t1', 'c1', 'a1');
      nte.pin('nte-1');
      nte.setActive('nte-1', false);
      nte.resetAll();
      expect(nte.isPinned('nte-1')).toBe(false);
      expect(nte.isActive('nte-1')).toBe(true);
    });
  });

  describe('by author / pinned / state', () => {
    it('should get by author', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getByAuthor('a1')).toHaveLength(1);
    });

    it('should get pinned', () => {
      nte.add('t1', 'c1', 'a1');
      nte.pin('nte-1');
      expect(nte.getPinnedNotes()).toHaveLength(1);
    });

    it('should get unpinned', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getUnpinnedNotes()).toHaveLength(1);
    });

    it('should get active', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getActiveNotes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      nte.add('t1', 'c1', 'a1');
      nte.setActive('nte-1', false);
      expect(nte.getInactiveNotes()).toHaveLength(1);
    });

    it('should get all titles', () => {
      nte.add('a', 'c1', 'a1');
      nte.add('b', 'c2', 'a1');
      expect(nte.getAllTitles()).toHaveLength(2);
    });

    it('should get all authors', () => {
      nte.add('t1', 'c1', 'a');
      nte.add('t2', 'c2', 'b');
      expect(nte.getAllAuthors()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getNewest()?.id).toBe('nte-1');
    });

    it('should return null for empty newest', () => {
      expect(nte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getOldest()?.id).toBe('nte-1');
    });

    it('should return null for empty oldest', () => {
      expect(nte.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getCreatedAt('nte-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      nte.add('t1', 'c1', 'a1');
      nte.update('nte-1', 'c2');
      expect(nte.getUpdatedAt('nte-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      nte.add('t1', 'c1', 'a1');
      expect(nte.getTotalAdded()).toBe(1);
    });

    it('should get total updated', () => {
      nte.add('t1', 'c1', 'a1');
      nte.update('nte-1', 'c2');
      expect(nte.getTotalUpdated()).toBe(1);
    });

    it('should get total deleted', () => {
      nte.add('t1', 'c1', 'a1');
      nte.remove('nte-1');
      expect(nte.getTotalDeleted()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many notes', () => {
      for (let i = 0; i < 50; i++) {
        nte.add(`t${i}`, `c${i}`, 'a1');
      }
      expect(nte.getCount()).toBe(50);
    });
  });
});