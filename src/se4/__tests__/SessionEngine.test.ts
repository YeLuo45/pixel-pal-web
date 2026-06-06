/**
 * SessionEngine Tests
 * chatdev-design Session Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionEngine } from '../SessionEngine';

describe('SessionEngine', () => {
  let se: SessionEngine;

  beforeEach(() => {
    se = new SessionEngine();
  });

  afterEach(() => {
    se.clearAll();
  });

  // ============================================================
  // create / send / end
  // ============================================================
  describe('create / send / end', () => {
    it('should create', () => {
      expect(se.create('alice')).toBe('se4-1');
    });

    it('should mark as active', () => {
      const id = se.create('alice');
      expect(se.isActive(id)).toBe(true);
    });

    it('should send', () => {
      const id = se.create('alice');
      expect(se.send(id)).toBe(true);
    });

    it('should increment messages on send', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getMessages(id)).toBe(1);
    });

    it('should log history on send', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getHistory(id)).toHaveLength(1);
    });

    it('should not send inactive', () => {
      const id = se.create('alice');
      se.end(id);
      expect(se.send(id)).toBe(false);
    });

    it('should not send ended', () => {
      const id = se.create('alice');
      se.end(id);
      expect(se.send(id)).toBe(false);
    });

    it('should return false for unknown send', () => {
      expect(se.send('unknown')).toBe(false);
    });

    it('should end', () => {
      const id = se.create('alice');
      expect(se.end(id)).toBe(true);
    });

    it('should mark as ended', () => {
      const id = se.create('alice');
      se.end(id);
      expect(se.isEnded(id)).toBe(true);
    });

    it('should mark as inactive on end', () => {
      const id = se.create('alice');
      se.end(id);
      expect(se.isActive(id)).toBe(false);
    });

    it('should not end twice', () => {
      const id = se.create('alice');
      se.end(id);
      expect(se.end(id)).toBe(false);
    });

    it('should return false for unknown end', () => {
      expect(se.end('unknown')).toBe(false);
    });

    it('should reopen', () => {
      const id = se.create('alice');
      se.end(id);
      expect(se.reopen(id)).toBe(true);
    });

    it('should mark as not ended on reopen', () => {
      const id = se.create('alice');
      se.end(id);
      se.reopen(id);
      expect(se.isEnded(id)).toBe(false);
    });

    it('should not reopen not ended', () => {
      const id = se.create('alice');
      expect(se.reopen(id)).toBe(false);
    });

    it('should return false for unknown reopen', () => {
      expect(se.reopen('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      se.create('alice');
      const stats = se.getStats();
      expect(stats.sessions).toBe(1);
    });

    it('should count total messages', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getStats().totalMessages).toBe(1);
    });

    it('should count active', () => {
      se.create('alice');
      expect(se.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      se.create('alice');
      se.create('alice');
      se.end('se4-1');
      expect(se.getStats().inactive).toBe(1);
    });

    it('should count ended', () => {
      const id = se.create('alice');
      se.end(id);
      expect(se.getStats().ended).toBe(1);
    });

    it('should count total hits', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getStats().totalHits).toBe(1);
    });

    it('should count unique users', () => {
      se.create('alice');
      se.create('bob');
      expect(se.getStats().uniqueUsers).toBe(2);
    });

    it('should compute avg messages', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getStats().avgMessages).toBe(1);
    });

    it('should get max messages', () => {
      const id = se.create('alice');
      se.send(id);
      se.send(id);
      expect(se.getStats().maxMessages).toBe(2);
    });

    it('should get min messages', () => {
      se.create('alice');
      expect(se.getStats().minMessages).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get session', () => {
      se.create('alice');
      expect(se.getSession('se4-1')?.user).toBe('alice');
    });

    it('should get all', () => {
      se.create('alice');
      expect(se.getAllSessions()).toHaveLength(1);
    });

    it('should remove', () => {
      se.create('alice');
      expect(se.removeSession('se4-1')).toBe(true);
    });

    it('should check existence', () => {
      se.create('alice');
      expect(se.hasSession('se4-1')).toBe(true);
    });

    it('should count', () => {
      expect(se.getCount()).toBe(0);
      se.create('alice');
      expect(se.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get user', () => {
      se.create('alice');
      expect(se.getUser('se4-1')).toBe('alice');
    });

    it('should get messages', () => {
      se.create('alice');
      expect(se.getMessages('se4-1')).toBe(0);
    });

    it('should get history', () => {
      se.create('alice');
      expect(se.getHistory('se4-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set user', () => {
      se.create('alice');
      expect(se.setUser('se4-1', 'bob')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(se.setUser('unknown', 'u')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = se.create('alice');
      se.send(id);
      se.end(id);
      se.resetAll();
      expect(se.getMessages(id)).toBe(0);
      expect(se.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by user / state
  // ============================================================
  describe('by user / state', () => {
    it('should get by user', () => {
      se.create('alice');
      expect(se.getByUser('alice')).toHaveLength(1);
    });

    it('should get active', () => {
      se.create('alice');
      expect(se.getActiveSessions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      se.create('alice');
      se.create('bob');
      se.end('se4-1');
      expect(se.getInactiveSessions()).toHaveLength(1);
    });

    it('should get ended', () => {
      const id = se.create('alice');
      se.end(id);
      expect(se.getEndedSessions()).toHaveLength(1);
    });

    it('should get all users', () => {
      se.create('alice');
      se.create('bob');
      expect(se.getAllUsers()).toHaveLength(2);
    });

    it('should get user count', () => {
      se.create('alice');
      expect(se.getUserCount()).toBe(1);
    });

    it('should get by min messages', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getByMinMessages(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most messages', () => {
      const id = se.create('alice');
      se.send(id);
      se.send(id);
      expect(se.getMostMessages()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(se.getMostMessages()).toBeNull();
    });

    it('should get newest', () => {
      se.create('alice');
      expect(se.getNewest()?.id).toBe('se4-1');
    });

    it('should return null for empty newest', () => {
      expect(se.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      se.create('alice');
      expect(se.getOldest()?.id).toBe('se4-1');
    });

    it('should return null for empty oldest', () => {
      expect(se.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      se.create('alice');
      expect(se.getCreatedAt('se4-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total messages', () => {
      const id = se.create('alice');
      se.send(id);
      expect(se.getTotalMessages()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many sessions', () => {
      for (let i = 0; i < 50; i++) {
        se.create(`user${i}`);
      }
      expect(se.getCount()).toBe(50);
    });
  });
});