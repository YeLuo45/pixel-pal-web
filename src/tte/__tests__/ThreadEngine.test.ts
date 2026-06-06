/**
 * ThreadEngine Tests
 * chatdev-design Thread Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThreadEngine } from '../ThreadEngine';

describe('ThreadEngine', () => {
  let tte: ThreadEngine;

  beforeEach(() => {
    tte = new ThreadEngine();
  });

  afterEach(() => {
    tte.clearAll();
  });

  // ============================================================
  // create / reply / pin / unpin / close / archive / remove
  // ============================================================
  describe('create / reply / pin / unpin / close / archive / remove', () => {
    it('should create', () => {
      expect(tte.create('thread1', 'alice')).toBe('tte-1');
    });

    it('should default status to open', () => {
      const id = tte.create('thread1', 'alice');
      expect(tte.getStatus(id)).toBe('open');
    });

    it('should default pinned to false', () => {
      const id = tte.create('thread1', 'alice');
      expect(tte.isPinned(id)).toBe(false);
    });

    it('should mark as active', () => {
      const id = tte.create('thread1', 'alice');
      expect(tte.isActive(id)).toBe(true);
    });

    it('should reply', () => {
      const id = tte.create('thread1', 'alice');
      expect(tte.reply(id, 'bob', 'reply content')).toBe('tte-1-p-1');
    });

    it('should not reply to inactive', () => {
      const id = tte.create('thread1', 'alice');
      tte.setActive(id, false);
      expect(tte.reply(id, 'bob', 'r')).toBeNull();
    });

    it('should not reply to closed', () => {
      const id = tte.create('thread1', 'alice');
      tte.close(id);
      expect(tte.reply(id, 'bob', 'r')).toBeNull();
    });

    it('should return null for unknown reply', () => {
      expect(tte.reply('unknown', 'bob', 'r')).toBeNull();
    });

    it('should pin', () => {
      const id = tte.create('thread1', 'alice');
      expect(tte.pin(id)).toBe(true);
    });

    it('should unpin', () => {
      const id = tte.create('thread1', 'alice');
      tte.pin(id);
      expect(tte.unpin(id)).toBe(true);
    });

    it('should return false for unknown pin', () => {
      expect(tte.pin('unknown')).toBe(false);
      expect(tte.unpin('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = tte.create('thread1', 'alice');
      expect(tte.close(id)).toBe(true);
    });

    it('should archive', () => {
      const id = tte.create('thread1', 'alice');
      expect(tte.archive(id)).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(tte.close('unknown')).toBe(false);
      expect(tte.archive('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = tte.create('thread1', 'alice');
      expect(tte.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tte.create('thread1', 'alice');
      const stats = tte.getStats();
      expect(stats.threads).toBe(1);
    });

    it('should count total replies', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      expect(tte.getStats().totalReplies).toBe(1);
    });

    it('should count total closed', () => {
      const id = tte.create('thread1', 'alice');
      tte.close(id);
      expect(tte.getStats().totalClosed).toBe(1);
    });

    it('should count total archived', () => {
      const id = tte.create('thread1', 'alice');
      tte.archive(id);
      expect(tte.getStats().totalArchived).toBe(1);
    });

    it('should count open', () => {
      tte.create('thread1', 'alice');
      expect(tte.getStats().open).toBe(1);
    });

    it('should count closed', () => {
      const id = tte.create('thread1', 'alice');
      tte.close(id);
      expect(tte.getStats().closed).toBe(1);
    });

    it('should count archived', () => {
      const id = tte.create('thread1', 'alice');
      tte.archive(id);
      expect(tte.getStats().archived).toBe(1);
    });

    it('should count pinned', () => {
      const id = tte.create('thread1', 'alice');
      tte.pin(id);
      expect(tte.getStats().pinned).toBe(1);
    });

    it('should count unpinned', () => {
      tte.create('thread1', 'alice');
      expect(tte.getStats().unpinned).toBe(1);
    });

    it('should count active', () => {
      tte.create('thread1', 'alice');
      expect(tte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tte.create('thread1', 'alice');
      tte.setActive(id, false);
      expect(tte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      expect(tte.getStats().totalHits).toBe(1);
    });

    it('should count unique authors', () => {
      tte.create('a', 'alice');
      tte.create('b', 'bob');
      expect(tte.getStats().uniqueAuthors).toBe(2);
    });

    it('should count unique titles', () => {
      tte.create('a', 'alice');
      tte.create('b', 'alice');
      expect(tte.getStats().uniqueTitles).toBe(2);
    });

    it('should count total posts', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r1');
      tte.reply(id, 'charlie', 'r2');
      expect(tte.getStats().totalPosts).toBe(2);
    });

    it('should compute avg posts', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      expect(tte.getStats().avgPosts).toBe(1);
    });

    it('should get max posts', () => {
      const id1 = tte.create('t1', 'alice');
      const id2 = tte.create('t2', 'alice');
      tte.reply(id1, 'bob', 'r');
      tte.reply(id2, 'bob', 'r');
      tte.reply(id2, 'charlie', 'r');
      expect(tte.getStats().maxPosts).toBe(2);
    });

    it('should get min posts', () => {
      tte.create('thread1', 'alice');
      expect(tte.getStats().minPosts).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get thread', () => {
      tte.create('thread1', 'alice');
      expect(tte.getThread('tte-1')?.title).toBe('thread1');
    });

    it('should get all', () => {
      tte.create('thread1', 'alice');
      expect(tte.getAllThreads()).toHaveLength(1);
    });

    it('should check existence', () => {
      tte.create('thread1', 'alice');
      expect(tte.hasThread('tte-1')).toBe(true);
    });

    it('should count', () => {
      expect(tte.getCount()).toBe(0);
      tte.create('thread1', 'alice');
      expect(tte.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get title', () => {
      tte.create('thread1', 'alice');
      expect(tte.getTitle('tte-1')).toBe('thread1');
    });

    it('should get author', () => {
      tte.create('thread1', 'alice');
      expect(tte.getAuthor('tte-1')).toBe('alice');
    });

    it('should get posts', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      expect(tte.getPosts(id)).toHaveLength(1);
    });

    it('should get post count', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      expect(tte.getPostCount(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      expect(tte.getHits(id)).toBe(1);
    });

    it('should check open', () => {
      tte.create('thread1', 'alice');
      expect(tte.isOpen('tte-1')).toBe(true);
    });

    it('should check closed', () => {
      const id = tte.create('thread1', 'alice');
      tte.close(id);
      expect(tte.isClosed(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      tte.create('thread1', 'alice');
      expect(tte.setActive('tte-1', false)).toBe(true);
    });

    it('should set title', () => {
      tte.create('thread1', 'alice');
      expect(tte.setTitle('tte-1', 't2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tte.setActive('unknown', false)).toBe(false);
      expect(tte.setTitle('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      tte.pin(id);
      tte.close(id);
      tte.setActive(id, false);
      tte.resetAll();
      expect(tte.isActive(id)).toBe(true);
      expect(tte.isOpen(id)).toBe(true);
    });
  });

  // ============================================================
  // by status / state
  // ============================================================
  describe('by status / state', () => {
    it('should get by status', () => {
      tte.create('thread1', 'alice');
      expect(tte.getByStatus('open')).toHaveLength(1);
    });

    it('should get pinned', () => {
      const id = tte.create('thread1', 'alice');
      tte.pin(id);
      expect(tte.getPinnedThreads()).toHaveLength(1);
    });

    it('should get unpinned', () => {
      tte.create('thread1', 'alice');
      expect(tte.getUnpinnedThreads()).toHaveLength(1);
    });

    it('should get active', () => {
      tte.create('thread1', 'alice');
      expect(tte.getActiveThreads()).toHaveLength(1);
    });

    it('should get inactive', () => {
      tte.create('thread1', 'alice');
      tte.setActive('tte-1', false);
      expect(tte.getInactiveThreads()).toHaveLength(1);
    });

    it('should get all titles', () => {
      tte.create('a', 'alice');
      tte.create('b', 'alice');
      expect(tte.getAllTitles()).toHaveLength(2);
    });

    it('should get title count', () => {
      tte.create('a', 'alice');
      expect(tte.getTitleCount()).toBe(1);
    });

    it('should get all authors', () => {
      tte.create('a', 'alice');
      tte.create('b', 'bob');
      expect(tte.getAllAuthors()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      tte.create('thread1', 'alice');
      expect(tte.getNewest()?.id).toBe('tte-1');
    });

    it('should return null for empty newest', () => {
      expect(tte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tte.create('thread1', 'alice');
      expect(tte.getOldest()?.id).toBe('tte-1');
    });

    it('should return null for empty oldest', () => {
      expect(tte.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tte.create('thread1', 'alice');
      expect(tte.getCreatedAt('tte-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      expect(tte.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total replies', () => {
      const id = tte.create('thread1', 'alice');
      tte.reply(id, 'bob', 'r');
      expect(tte.getTotalReplies()).toBe(1);
    });

    it('should get total closed', () => {
      const id = tte.create('thread1', 'alice');
      tte.close(id);
      expect(tte.getTotalClosed()).toBe(1);
    });

    it('should get total archived', () => {
      const id = tte.create('thread1', 'alice');
      tte.archive(id);
      expect(tte.getTotalArchived()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many threads', () => {
      for (let i = 0; i < 50; i++) {
        tte.create(`t${i}`, 'alice');
      }
      expect(tte.getCount()).toBe(50);
    });
  });
});