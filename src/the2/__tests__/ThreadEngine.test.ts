/**
 * ThreadEngine Tests
 * chatdev-design Thread Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThreadEngine } from '../ThreadEngine';

describe('ThreadEngine', () => {
  let the2: ThreadEngine;

  beforeEach(() => {
    the2 = new ThreadEngine();
  });

  afterEach(() => {
    the2.clearAll();
  });

  describe('create / reply / close / archive / reopen / remove', () => {
    it('should create', () => {
      expect(the2.create('title', 'alice')).toMatch(/^the2-/);
    });

    it('should default status to open', () => {
      the2.create('title', 'alice');
      expect(the2.getStatus(the2.getAllThreads()[0].id)).toBe('open');
    });

    it('should default replies to 0', () => {
      the2.create('title', 'alice');
      expect(the2.getReplies(the2.getAllThreads()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      the2.create('title', 'alice');
      expect(the2.isActive(the2.getAllThreads()[0].id)).toBe(true);
    });

    it('should reply', () => {
      const id = the2.create('title', 'alice');
      expect(the2.reply(id)).toBe(true);
    });

    it('should increment replies', () => {
      const id = the2.create('title', 'alice');
      the2.reply(id);
      expect(the2.getReplies(id)).toBe(1);
    });

    it('should not reply inactive', () => {
      const id = the2.create('title', 'alice');
      the2.setActive(id, false);
      expect(the2.reply(id)).toBe(false);
    });

    it('should not reply closed', () => {
      const id = the2.create('title', 'alice');
      the2.close(id);
      expect(the2.reply(id)).toBe(false);
    });

    it('should return false for unknown reply', () => {
      expect(the2.reply('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = the2.create('title', 'alice');
      expect(the2.close(id)).toBe(true);
    });

    it('should set closed', () => {
      const id = the2.create('title', 'alice');
      the2.close(id);
      expect(the2.isClosed(id)).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(the2.close('unknown')).toBe(false);
    });

    it('should archive', () => {
      const id = the2.create('title', 'alice');
      expect(the2.archive(id)).toBe(true);
    });

    it('should set archived', () => {
      const id = the2.create('title', 'alice');
      the2.archive(id);
      expect(the2.isArchived(id)).toBe(true);
    });

    it('should return false for unknown archive', () => {
      expect(the2.archive('unknown')).toBe(false);
    });

    it('should reopen', () => {
      const id = the2.create('title', 'alice');
      the2.close(id);
      expect(the2.reopen(id)).toBe(true);
    });

    it('should set open after reopen', () => {
      const id = the2.create('title', 'alice');
      the2.close(id);
      the2.reopen(id);
      expect(the2.isOpen(id)).toBe(true);
    });

    it('should return false for unknown reopen', () => {
      expect(the2.reopen('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = the2.create('title', 'alice');
      expect(the2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      the2.create('title', 'alice');
      expect(the2.getStats().threads).toBe(1);
    });

    it('should count total created', () => {
      the2.create('title', 'alice');
      expect(the2.getStats().totalCreated).toBe(1);
    });

    it('should count total replied', () => {
      const id = the2.create('title', 'alice');
      the2.reply(id);
      expect(the2.getStats().totalReplied).toBe(1);
    });

    it('should count total closed', () => {
      const id = the2.create('title', 'alice');
      the2.close(id);
      expect(the2.getStats().totalClosed).toBe(1);
    });

    it('should count open', () => {
      the2.create('title', 'alice');
      expect(the2.getStats().open).toBe(1);
    });

    it('should count closed', () => {
      const id = the2.create('title', 'alice');
      the2.close(id);
      expect(the2.getStats().closed).toBe(1);
    });

    it('should count archived', () => {
      const id = the2.create('title', 'alice');
      the2.archive(id);
      expect(the2.getStats().archived).toBe(1);
    });

    it('should count active', () => {
      the2.create('title', 'alice');
      expect(the2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = the2.create('title', 'alice');
      the2.setActive(id, false);
      expect(the2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = the2.create('title', 'alice');
      the2.reply(id);
      expect(the2.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      the2.create('a', 'alice');
      the2.create('a', 'alice');
      expect(the2.getStats().uniqueTitles).toBe(1);
    });

    it('should count unique authors', () => {
      the2.create('t1', 'alice');
      the2.create('t2', 'alice');
      expect(the2.getStats().uniqueAuthors).toBe(1);
    });

    it('should count total replies', () => {
      const id = the2.create('title', 'alice');
      the2.reply(id);
      expect(the2.getStats().totalReplies).toBe(1);
    });

    it('should count total title len', () => {
      the2.create('hi', 'alice');
      expect(the2.getStats().totalTitleLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get thread', () => {
      const id = the2.create('title', 'alice');
      expect(the2.getThread(id)?.title).toBe('title');
    });

    it('should get all', () => {
      the2.create('title', 'alice');
      expect(the2.getAllThreads()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = the2.create('title', 'alice');
      expect(the2.hasThread(id)).toBe(true);
    });

    it('should count', () => {
      expect(the2.getCount()).toBe(0);
      the2.create('title', 'alice');
      expect(the2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get title', () => {
      const id = the2.create('title', 'alice');
      expect(the2.getTitle(id)).toBe('title');
    });

    it('should get author', () => {
      const id = the2.create('title', 'alice');
      expect(the2.getAuthor(id)).toBe('alice');
    });

    it('should get hits', () => {
      const id = the2.create('title', 'alice');
      the2.reply(id);
      expect(the2.getHits(id)).toBe(1);
    });

    it('should check open', () => {
      the2.create('title', 'alice');
      expect(the2.isOpen(the2.getAllThreads()[0].id)).toBe(true);
    });

    it('should check closed', () => {
      const id = the2.create('title', 'alice');
      the2.close(id);
      expect(the2.isClosed(id)).toBe(true);
    });

    it('should check archived', () => {
      const id = the2.create('title', 'alice');
      the2.archive(id);
      expect(the2.isArchived(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = the2.create('title', 'alice');
      expect(the2.setActive(id, false)).toBe(true);
    });

    it('should set title', () => {
      const id = the2.create('title', 'alice');
      expect(the2.setTitle(id, 'new')).toBe(true);
    });

    it('should set author', () => {
      const id = the2.create('title', 'alice');
      expect(the2.setAuthor(id, 'bob')).toBe(true);
    });

    it('should set replies', () => {
      const id = the2.create('title', 'alice');
      expect(the2.setReplies(id, 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(the2.setActive('unknown', false)).toBe(false);
      expect(the2.setTitle('unknown', 't')).toBe(false);
      expect(the2.setAuthor('unknown', 'a')).toBe(false);
      expect(the2.setReplies('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = the2.create('title', 'alice');
      the2.reply(id);
      the2.setActive(id, false);
      the2.resetAll();
      expect(the2.getReplies(id)).toBe(0);
      expect(the2.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      the2.create('title', 'alice');
      expect(the2.getByStatus('open')).toHaveLength(1);
    });

    it('should get active', () => {
      the2.create('title', 'alice');
      expect(the2.getActiveThreads()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = the2.create('title', 'alice');
      the2.setActive(id, false);
      expect(the2.getInactiveThreads()).toHaveLength(1);
    });

    it('should get all titles', () => {
      the2.create('a', 'alice');
      the2.create('b', 'alice');
      expect(the2.getAllTitles()).toHaveLength(2);
    });

    it('should get all authors', () => {
      the2.create('a', 'alice');
      the2.create('a', 'bob');
      expect(the2.getAllAuthors()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      the2.create('title', 'alice');
      expect(the2.getNewest()?.title).toBe('title');
    });

    it('should return null for empty newest', () => {
      expect(the2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      the2.create('title', 'alice');
      expect(the2.getOldest()?.title).toBe('title');
    });

    it('should return null for empty oldest', () => {
      expect(the2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = the2.create('title', 'alice');
      expect(the2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = the2.create('title', 'alice');
      the2.reply(id);
      expect(the2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total created', () => {
      the2.create('title', 'alice');
      expect(the2.getTotalCreated()).toBe(1);
    });

    it('should get total replied', () => {
      const id = the2.create('title', 'alice');
      the2.reply(id);
      expect(the2.getTotalReplied()).toBe(1);
    });

    it('should get total closed', () => {
      const id = the2.create('title', 'alice');
      the2.close(id);
      expect(the2.getTotalClosed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many threads', () => {
      for (let i = 0; i < 50; i++) {
        the2.create(`title${i}`, 'alice');
      }
      expect(the2.getCount()).toBe(50);
    });
  });
});