/**
 * ThreadEngine Tests
 * chatdev-design Thread Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThreadEngine } from '../ThreadEngine';

describe('ThreadEngine', () => {
  let te: ThreadEngine;

  beforeEach(() => {
    te = new ThreadEngine();
  });

  afterEach(() => {
    te.clearAll();
  });

  // ============================================================
  // create / post / lock / unlock / reset
  // ============================================================
  describe('create / post / lock / unlock / reset', () => {
    it('should create', () => {
      expect(te.create('t1', ['alice', 'bob'])).toBe('te4-1');
    });

    it('should mark as active', () => {
      const id = te.create('t1', ['alice']);
      expect(te.isActive(id)).toBe(true);
    });

    it('should mark as unlocked', () => {
      const id = te.create('t1', ['alice']);
      expect(te.isUnlocked(id)).toBe(true);
    });

    it('should post', () => {
      const id = te.create('t1', ['alice']);
      expect(te.post(id)).toBe(true);
    });

    it('should increment messages on post', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getMessages(id)).toBe(1);
    });

    it('should log history on post', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getHistory(id)).toHaveLength(1);
    });

    it('should not post inactive', () => {
      const id = te.create('t1', ['alice']);
      te.setActive(id, false);
      expect(te.post(id)).toBe(false);
    });

    it('should not post locked', () => {
      const id = te.create('t1', ['alice']);
      te.lock(id);
      expect(te.post(id)).toBe(false);
    });

    it('should return false for unknown post', () => {
      expect(te.post('unknown')).toBe(false);
    });

    it('should lock', () => {
      const id = te.create('t1', ['alice']);
      expect(te.lock(id)).toBe(true);
    });

    it('should mark as locked', () => {
      const id = te.create('t1', ['alice']);
      te.lock(id);
      expect(te.isLocked(id)).toBe(true);
    });

    it('should not lock twice', () => {
      const id = te.create('t1', ['alice']);
      te.lock(id);
      expect(te.lock(id)).toBe(false);
    });

    it('should return false for unknown lock', () => {
      expect(te.lock('unknown')).toBe(false);
    });

    it('should unlock', () => {
      const id = te.create('t1', ['alice']);
      te.lock(id);
      expect(te.unlock(id)).toBe(true);
    });

    it('should mark as unlocked on unlock', () => {
      const id = te.create('t1', ['alice']);
      te.lock(id);
      te.unlock(id);
      expect(te.isUnlocked(id)).toBe(true);
    });

    it('should not unlock not locked', () => {
      const id = te.create('t1', ['alice']);
      expect(te.unlock(id)).toBe(false);
    });

    it('should return false for unknown unlock', () => {
      expect(te.unlock('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      te.reset(id);
      expect(te.getMessages(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(te.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      te.create('t1', ['alice']);
      const stats = te.getStats();
      expect(stats.threads).toBe(1);
    });

    it('should count total messages', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getStats().totalMessages).toBe(1);
    });

    it('should count locked', () => {
      const id = te.create('t1', ['alice']);
      te.lock(id);
      expect(te.getStats().locked).toBe(1);
    });

    it('should count unlocked', () => {
      te.create('t1', ['alice']);
      expect(te.getStats().unlocked).toBe(1);
    });

    it('should count active', () => {
      te.create('t1', ['alice']);
      expect(te.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = te.create('t1', ['alice']);
      te.setActive(id, false);
      expect(te.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      te.create('t1', ['alice']);
      te.create('t2', ['alice']);
      expect(te.getStats().uniqueTitles).toBe(2);
    });

    it('should compute avg messages', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getStats().avgMessages).toBe(1);
    });

    it('should get max messages', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      te.post(id);
      expect(te.getStats().maxMessages).toBe(2);
    });

    it('should get min messages', () => {
      te.create('t1', ['alice']);
      expect(te.getStats().minMessages).toBe(0);
    });

    it('should compute avg participants', () => {
      te.create('t1', ['a', 'b', 'c']);
      expect(te.getStats().avgParticipants).toBe(3);
    });

    it('should count total participants', () => {
      te.create('t1', ['a', 'b']);
      te.create('t2', ['c']);
      expect(te.getStats().totalParticipants).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get thread', () => {
      te.create('t1', ['alice']);
      expect(te.getThread('te4-1')?.title).toBe('t1');
    });

    it('should get all', () => {
      te.create('t1', ['alice']);
      expect(te.getAllThreads()).toHaveLength(1);
    });

    it('should remove', () => {
      te.create('t1', ['alice']);
      expect(te.removeThread('te4-1')).toBe(true);
    });

    it('should check existence', () => {
      te.create('t1', ['alice']);
      expect(te.hasThread('te4-1')).toBe(true);
    });

    it('should count', () => {
      expect(te.getCount()).toBe(0);
      te.create('t1', ['alice']);
      expect(te.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get title', () => {
      te.create('t1', ['alice']);
      expect(te.getTitle('te4-1')).toBe('t1');
    });

    it('should get participants', () => {
      te.create('t1', ['alice', 'bob']);
      expect(te.getParticipants('te4-1')).toEqual(['alice', 'bob']);
    });

    it('should get participant count', () => {
      te.create('t1', ['alice', 'bob']);
      expect(te.getParticipantCount('te4-1')).toBe(2);
    });

    it('should get history', () => {
      te.create('t1', ['alice']);
      expect(te.getHistory('te4-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      te.create('t1', ['alice']);
      expect(te.setActive('te4-1', false)).toBe(true);
    });

    it('should set title', () => {
      te.create('t1', ['alice']);
      expect(te.setTitle('te4-1', 't2')).toBe(true);
    });

    it('should set participants', () => {
      te.create('t1', ['alice']);
      expect(te.setParticipants('te4-1', ['bob'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(te.setActive('unknown', false)).toBe(false);
      expect(te.setTitle('unknown', 't')).toBe(false);
      expect(te.setParticipants('unknown', [])).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      te.setActive(id, false);
      te.resetAll();
      expect(te.getMessages(id)).toBe(0);
      expect(te.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by title / state
  // ============================================================
  describe('by title / state', () => {
    it('should get by title', () => {
      te.create('t1', ['alice']);
      expect(te.getByTitle('t1')).toHaveLength(1);
    });

    it('should get locked', () => {
      const id = te.create('t1', ['alice']);
      te.lock(id);
      expect(te.getLockedThreads()).toHaveLength(1);
    });

    it('should get unlocked', () => {
      te.create('t1', ['alice']);
      expect(te.getUnlockedThreads()).toHaveLength(1);
    });

    it('should get active', () => {
      te.create('t1', ['alice']);
      expect(te.getActiveThreads()).toHaveLength(1);
    });

    it('should get inactive', () => {
      te.create('t1', ['alice']);
      te.setActive('te4-1', false);
      expect(te.getInactiveThreads()).toHaveLength(1);
    });

    it('should get all titles', () => {
      te.create('t1', ['alice']);
      te.create('t2', ['alice']);
      expect(te.getAllTitles()).toHaveLength(2);
    });

    it('should get title count', () => {
      te.create('t1', ['alice']);
      expect(te.getTitleCount()).toBe(1);
    });

    it('should get by min messages', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getByMinMessages(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most messages', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      te.post(id);
      expect(te.getMostMessages()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(te.getMostMessages()).toBeNull();
    });

    it('should get newest', () => {
      te.create('t1', ['alice']);
      expect(te.getNewest()?.id).toBe('te4-1');
    });

    it('should return null for empty newest', () => {
      expect(te.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      te.create('t1', ['alice']);
      expect(te.getOldest()?.id).toBe('te4-1');
    });

    it('should return null for empty oldest', () => {
      expect(te.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      te.create('t1', ['alice']);
      expect(te.getCreatedAt('te4-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total messages', () => {
      const id = te.create('t1', ['alice']);
      te.post(id);
      expect(te.getTotalMessages()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many threads', () => {
      for (let i = 0; i < 50; i++) {
        te.create(`t${i}`, [`u${i}`]);
      }
      expect(te.getCount()).toBe(50);
    });
  });
});