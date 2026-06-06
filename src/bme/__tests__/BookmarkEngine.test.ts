/**
 * BookmarkEngine Tests
 * chatdev-design Bookmark Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BookmarkEngine } from '../BookmarkEngine';

describe('BookmarkEngine', () => {
  let bme: BookmarkEngine;

  beforeEach(() => {
    bme = new BookmarkEngine();
  });

  afterEach(() => {
    bme.clearAll();
  });

  // ============================================================
  // add / remove
  // ============================================================
  describe('add / remove', () => {
    it('should add', () => {
      expect(bme.add('https://a.com', 'A', 'alice')).toBe('bme-1');
    });

    it('should mark as active', () => {
      const id = bme.add('https://a.com', 'A', 'alice');
      expect(bme.isActive(id)).toBe(true);
    });

    it('should remove', () => {
      const id = bme.add('https://a.com', 'A', 'alice');
      expect(bme.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      bme.add('https://a.com', 'A', 'alice');
      const stats = bme.getStats();
      expect(stats.bookmarks).toBe(1);
    });

    it('should count total bookmarks', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getStats().totalBookmarks).toBe(1);
    });

    it('should count active', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bme.add('https://a.com', 'A', 'alice');
      bme.setActive(id, false);
      expect(bme.getStats().inactive).toBe(1);
    });

    it('should count unique users', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.com', 'B', 'alice');
      expect(bme.getStats().uniqueUsers).toBe(1);
    });

    it('should count unique urls', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://a.com', 'A', 'bob');
      expect(bme.getStats().uniqueUrls).toBe(1);
    });

    it('should compute avg title length', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getStats().avgTitleLength).toBe(1);
    });

    it('should get max title length', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.com', 'Hello', 'alice');
      expect(bme.getStats().maxTitleLength).toBe(5);
    });

    it('should get min title length', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.com', 'Hello', 'alice');
      expect(bme.getStats().minTitleLength).toBe(1);
    });

    it('should compute avg url length', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getStats().avgUrlLength).toBe(13);
    });

    it('should get max url length', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.co', 'B', 'alice');
      expect(bme.getStats().maxUrlLength).toBe(13);
    });

    it('should get min url length', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.co', 'B', 'alice');
      expect(bme.getStats().minUrlLength).toBe(12);
    });

    it('should count unique titles', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.com', 'A', 'bob');
      expect(bme.getStats().uniqueTitles).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get bookmark', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getBookmark('bme-1')?.url).toBe('https://a.com');
    });

    it('should get all', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getAllBookmarks()).toHaveLength(1);
    });

    it('should check existence', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.hasBookmark('bme-1')).toBe(true);
    });

    it('should count', () => {
      expect(bme.getCount()).toBe(0);
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get url', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getUrl('bme-1')).toBe('https://a.com');
    });

    it('should get title', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getTitle('bme-1')).toBe('A');
    });

    it('should get user', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getUser('bme-1')).toBe('alice');
    });

    it('should get title length', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getTitleLength('bme-1')).toBe(1);
    });

    it('should get url length', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getUrlLength('bme-1')).toBe(13);
    });

    it('should get history', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getHistory('bme-1')).toEqual([]);
    });

    it('should get hits', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getHits('bme-1')).toBe(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.setActive('bme-1', false)).toBe(true);
    });

    it('should set title', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.setTitle('bme-1', 'B')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bme.setActive('unknown', false)).toBe(false);
      expect(bme.setTitle('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = bme.add('https://a.com', 'A', 'alice');
      bme.setActive(id, false);
      bme.resetAll();
      expect(bme.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by user / url / state
  // ============================================================
  describe('by user / url / state', () => {
    it('should get by user', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getByUser('alice')).toHaveLength(1);
    });

    it('should get by url', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getByUrl('https://a.com')).toHaveLength(1);
    });

    it('should get active', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getActiveBookmarks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.setActive('bme-1', false);
      expect(bme.getInactiveBookmarks()).toHaveLength(1);
    });

    it('should get all users', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.com', 'B', 'bob');
      expect(bme.getAllUsers()).toHaveLength(2);
    });

    it('should get user count', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getUserCount()).toBe(1);
    });

    it('should get all urls', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.com', 'B', 'alice');
      expect(bme.getAllUrls()).toHaveLength(2);
    });

    it('should get all titles', () => {
      bme.add('https://a.com', 'A', 'alice');
      bme.add('https://b.com', 'B', 'alice');
      expect(bme.getAllTitles()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getNewest()?.id).toBe('bme-1');
    });

    it('should return null for empty newest', () => {
      expect(bme.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getOldest()?.id).toBe('bme-1');
    });

    it('should return null for empty oldest', () => {
      expect(bme.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getCreatedAt('bme-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bme.add('https://a.com', 'A', 'alice');
      bme.setTitle(id, 'B');
      expect(bme.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total bookmarks', () => {
      bme.add('https://a.com', 'A', 'alice');
      expect(bme.getTotalBookmarks()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many bookmarks', () => {
      for (let i = 0; i < 50; i++) {
        bme.add(`https://a${i}.com`, `T${i}`, 'alice');
      }
      expect(bme.getCount()).toBe(50);
    });
  });
});