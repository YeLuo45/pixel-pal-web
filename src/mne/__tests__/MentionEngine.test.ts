/**
 * MentionEngine Tests
 * chatdev-design Mention Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MentionEngine } from '../MentionEngine';

describe('MentionEngine', () => {
  let mne: MentionEngine;

  beforeEach(() => {
    mne = new MentionEngine();
  });

  afterEach(() => {
    mne.clearAll();
  });

  // ============================================================
  // mention / read / unread / remove
  // ============================================================
  describe('mention / read / unread / remove', () => {
    it('should mention', () => {
      expect(mne.mention('alice', 'bob', 'hello')).toBe('mne-1');
    });

    it('should mark as active', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      expect(mne.isActive(id)).toBe(true);
    });

    it('should mark as unread', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      expect(mne.isUnread(id)).toBe(true);
    });

    it('should read', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      expect(mne.read(id)).toBe(true);
    });

    it('should mark as read on read', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.isRead(id)).toBe(true);
    });

    it('should not read already read', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.read(id)).toBe(false);
    });

    it('should return false for unknown read', () => {
      expect(mne.read('unknown')).toBe(false);
    });

    it('should unread', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.unread(id)).toBe(true);
    });

    it('should mark as unread on unread', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      mne.unread(id);
      expect(mne.isUnread(id)).toBe(true);
    });

    it('should not unread already unread', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      expect(mne.unread(id)).toBe(false);
    });

    it('should return false for unknown unread', () => {
      expect(mne.unread('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      expect(mne.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      mne.mention('alice', 'bob', 'hello');
      const stats = mne.getStats();
      expect(stats.mentions).toBe(1);
    });

    it('should count read', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.getStats().read).toBe(1);
    });

    it('should count unread', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getStats().unread).toBe(1);
    });

    it('should count total messages', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getStats().totalMessages).toBe(1);
    });

    it('should count active', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.setActive(id, false);
      expect(mne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.getStats().totalHits).toBe(1);
    });

    it('should count unique from', () => {
      mne.mention('alice', 'bob', 'hello');
      mne.mention('alice', 'carol', 'hello');
      expect(mne.getStats().uniqueFrom).toBe(1);
    });

    it('should count unique to', () => {
      mne.mention('alice', 'bob', 'hello');
      mne.mention('carol', 'bob', 'hello');
      expect(mne.getStats().uniqueTo).toBe(1);
    });

    it('should count unique users', () => {
      mne.mention('alice', 'bob', 'hello');
      mne.mention('carol', 'dave', 'hello');
      expect(mne.getStats().uniqueUsers).toBe(4);
    });

    it('should compute avg message length', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getStats().avgMessageLength).toBe(5);
    });

    it('should get max message length', () => {
      mne.mention('alice', 'bob', 'hi');
      mne.mention('alice', 'bob', 'hello world');
      expect(mne.getStats().maxMessageLength).toBe(11);
    });

    it('should get min message length', () => {
      mne.mention('alice', 'bob', 'hi');
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getStats().minMessageLength).toBe(2);
    });

    it('should compute read rate', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.getStats().readRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get mention', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getMention('mne-1')?.message).toBe('hello');
    });

    it('should get all', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getAllMentions()).toHaveLength(1);
    });

    it('should check existence', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.hasMention('mne-1')).toBe(true);
    });

    it('should count', () => {
      expect(mne.getCount()).toBe(0);
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getCount()).toBe(1);
    });

    it('should get by user', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getByUser('alice')).toHaveLength(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get from', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getFrom('mne-1')).toBe('alice');
    });

    it('should get to', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getTo('mne-1')).toBe('bob');
    });

    it('should get message', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getMessage('mne-1')).toBe('hello');
    });

    it('should get message length', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getMessageLength('mne-1')).toBe(5);
    });

    it('should get history', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getHistory('mne-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.setActive('mne-1', false)).toBe(true);
    });

    it('should set message', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.setMessage('mne-1', 'world')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mne.setActive('unknown', false)).toBe(false);
      expect(mne.setMessage('unknown', 'm')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      mne.setActive(id, false);
      mne.resetAll();
      expect(mne.isRead(id)).toBe(false);
      expect(mne.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by user / from / to / state
  // ============================================================
  describe('by user / from / to / state', () => {
    it('should get by user', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getByUser('alice')).toHaveLength(1);
    });

    it('should get by from', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getByFrom('alice')).toHaveLength(1);
    });

    it('should get by to', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getByTo('bob')).toHaveLength(1);
    });

    it('should get read', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.getReadMentions()).toHaveLength(1);
    });

    it('should get unread', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getUnreadMentions()).toHaveLength(1);
    });

    it('should get active', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getActiveMentions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      mne.mention('alice', 'bob', 'hello');
      mne.setActive('mne-1', false);
      expect(mne.getInactiveMentions()).toHaveLength(1);
    });

    it('should get all users', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getAllUsers()).toHaveLength(2);
    });

    it('should get user count', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getUserCount()).toBe(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getNewest()?.id).toBe('mne-1');
    });

    it('should return null for empty newest', () => {
      expect(mne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getOldest()?.id).toBe('mne-1');
    });

    it('should return null for empty oldest', () => {
      expect(mne.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getCreatedAt('mne-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mne.mention('alice', 'bob', 'hello');
      mne.read(id);
      expect(mne.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total messages', () => {
      mne.mention('alice', 'bob', 'hello');
      expect(mne.getTotalMessages()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many mentions', () => {
      for (let i = 0; i < 50; i++) {
        mne.mention('alice', 'bob', `msg${i}`);
      }
      expect(mne.getCount()).toBe(50);
    });
  });
});