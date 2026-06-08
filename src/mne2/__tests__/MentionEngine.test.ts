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

  describe('add / mention / remove', () => {
    it('should add', () => {
      expect(mne.add('alice', 'comment')).toMatch(/^mne-/);
    });

    it('should default context to comment', () => {
      mne.add('alice');
      expect(mne.getContext(mne.getAllMentions()[0].id)).toBe('comment');
    });

    it('should mark as active', () => {
      mne.add('alice');
      expect(mne.isActive(mne.getAllMentions()[0].id)).toBe(true);
    });

    it('should mention', () => {
      const id = mne.add('alice', 'comment');
      expect(mne.mention(id)).toBe(true);
    });

    it('should increment count', () => {
      const id = mne.add('alice', 'comment');
      mne.mention(id);
      expect(mne.getMentionedCount(id)).toBe(1);
    });

    it('should not mention inactive', () => {
      const id = mne.add('alice', 'comment');
      mne.setActive(id, false);
      expect(mne.mention(id)).toBe(false);
    });

    it('should return false for unknown mention', () => {
      expect(mne.mention('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = mne.add('alice', 'comment');
      expect(mne.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      mne.add('alice', 'comment');
      expect(mne.getStats().mentions).toBe(1);
    });

    it('should count total added', () => {
      mne.add('alice', 'comment');
      expect(mne.getStats().totalAdded).toBe(1);
    });

    it('should count total mentioned', () => {
      const id = mne.add('alice', 'comment');
      mne.mention(id);
      expect(mne.getStats().totalMentioned).toBe(1);
    });

    it('should count comment', () => {
      mne.add('alice', 'comment');
      expect(mne.getStats().comment).toBe(1);
    });

    it('should count post', () => {
      mne.add('alice', 'post');
      expect(mne.getStats().post).toBe(1);
    });

    it('should count reply', () => {
      mne.add('alice', 'reply');
      expect(mne.getStats().reply).toBe(1);
    });

    it('should count thread', () => {
      mne.add('alice', 'thread');
      expect(mne.getStats().thread).toBe(1);
    });

    it('should count bio', () => {
      mne.add('alice', 'bio');
      expect(mne.getStats().bio).toBe(1);
    });

    it('should count active', () => {
      mne.add('alice', 'comment');
      expect(mne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mne.add('alice', 'comment');
      mne.setActive(id, false);
      expect(mne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = mne.add('alice', 'comment');
      mne.mention(id);
      expect(mne.getStats().totalHits).toBe(1);
    });

    it('should count unique users', () => {
      mne.add('a', 'comment');
      mne.add('a', 'comment');
      expect(mne.getStats().uniqueUsers).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get mention', () => {
      const id = mne.add('alice', 'comment');
      expect(mne.getMention(id)?.user).toBe('alice');
    });

    it('should get all', () => {
      mne.add('alice', 'comment');
      expect(mne.getAllMentions()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = mne.add('alice', 'comment');
      expect(mne.hasMention(id)).toBe(true);
    });

    it('should count', () => {
      expect(mne.getCount()).toBe(0);
      mne.add('alice', 'comment');
      expect(mne.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get user', () => {
      const id = mne.add('hello', 'comment');
      expect(mne.getUser(id)).toBe('hello');
    });

    it('should get hits', () => {
      const id = mne.add('alice', 'comment');
      mne.mention(id);
      expect(mne.getHits(id)).toBe(1);
    });

    it('should check comment', () => {
      mne.add('alice', 'comment');
      expect(mne.isComment(mne.getAllMentions()[0].id)).toBe(true);
    });

    it('should check post', () => {
      mne.add('alice', 'post');
      expect(mne.isPost(mne.getAllMentions()[0].id)).toBe(true);
    });

    it('should check reply', () => {
      mne.add('alice', 'reply');
      expect(mne.isReply(mne.getAllMentions()[0].id)).toBe(true);
    });

    it('should check thread', () => {
      mne.add('alice', 'thread');
      expect(mne.isThread(mne.getAllMentions()[0].id)).toBe(true);
    });

    it('should check bio', () => {
      mne.add('alice', 'bio');
      expect(mne.isBio(mne.getAllMentions()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = mne.add('alice', 'comment');
      expect(mne.setActive(id, false)).toBe(true);
    });

    it('should set user', () => {
      const id = mne.add('alice', 'comment');
      expect(mne.setUser(id, 'bob')).toBe(true);
    });

    it('should set context', () => {
      const id = mne.add('alice', 'comment');
      expect(mne.setContext(id, 'post')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mne.setActive('unknown', false)).toBe(false);
      expect(mne.setUser('unknown', 'a')).toBe(false);
      expect(mne.setContext('unknown', 'comment')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = mne.add('alice', 'comment');
      mne.mention(id);
      mne.setActive(id, false);
      mne.resetAll();
      expect(mne.getMentionedCount(id)).toBe(0);
      expect(mne.isActive(id)).toBe(true);
    });
  });

  describe('by context / state', () => {
    it('should get by context', () => {
      mne.add('alice', 'comment');
      expect(mne.getByContext('comment')).toHaveLength(1);
    });

    it('should get active', () => {
      mne.add('alice', 'comment');
      expect(mne.getActiveMentions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = mne.add('alice', 'comment');
      mne.setActive(id, false);
      expect(mne.getInactiveMentions()).toHaveLength(1);
    });

    it('should get all users', () => {
      mne.add('a', 'comment');
      mne.add('b', 'comment');
      expect(mne.getAllUsers()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      mne.add('alice', 'comment');
      expect(mne.getNewest()?.user).toBe('alice');
    });

    it('should return null for empty newest', () => {
      expect(mne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mne.add('alice', 'comment');
      expect(mne.getOldest()?.user).toBe('alice');
    });

    it('should return null for empty oldest', () => {
      expect(mne.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = mne.add('alice', 'comment');
      expect(mne.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mne.add('alice', 'comment');
      mne.mention(id);
      expect(mne.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      mne.add('alice', 'comment');
      expect(mne.getTotalAdded()).toBe(1);
    });

    it('should get total mentioned', () => {
      const id = mne.add('alice', 'comment');
      mne.mention(id);
      expect(mne.getTotalMentioned()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many mentions', () => {
      for (let i = 0; i < 50; i++) {
        mne.add(`u${i}`, 'comment');
      }
      expect(mne.getCount()).toBe(50);
    });
  });
});