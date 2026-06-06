/**
 * ReactionEngine Tests
 * chatdev-design Reaction Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReactionEngine } from '../ReactionEngine';

describe('ReactionEngine', () => {
  let rxe: ReactionEngine;

  beforeEach(() => {
    rxe = new ReactionEngine();
  });

  afterEach(() => {
    rxe.clearAll();
  });

  // ============================================================
  // add / remove / increment / decrement / reset
  // ============================================================
  describe('add / remove / increment / decrement / reset', () => {
    it('should add', () => {
      expect(rxe.add('m1', 'alice', '👍')).toBe('rxe-1');
    });

    it('should mark as active', () => {
      const id = rxe.add('m1', 'alice', '👍');
      expect(rxe.isActive(id)).toBe(true);
    });

    it('should default emoji to thumbs up', () => {
      const id = rxe.add('m1', 'alice');
      expect(rxe.getEmoji(id)).toBe('👍');
    });

    it('should start count at 1', () => {
      const id = rxe.add('m1', 'alice', '👍');
      expect(rxe.getReactionCount(id)).toBe(1);
    });

    it('should remove', () => {
      const id = rxe.add('m1', 'alice', '👍');
      expect(rxe.remove(id)).toBe(true);
    });

    it('should remove from map on remove', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.remove(id);
      expect(rxe.hasReaction(id)).toBe(false);
    });

    it('should increment', () => {
      const id = rxe.add('m1', 'alice', '👍');
      expect(rxe.increment(id)).toBe(true);
    });

    it('should increment count on increment', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getReactionCount(id)).toBe(2);
    });

    it('should log history on increment', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getHistory(id)).toEqual([1, 2]);
    });

    it('should not increment inactive', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.setActive(id, false);
      expect(rxe.increment(id)).toBe(false);
    });

    it('should return false for unknown increment', () => {
      expect(rxe.increment('unknown')).toBe(false);
    });

    it('should decrement', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.decrement(id)).toBe(true);
    });

    it('should decrement count on decrement', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      rxe.decrement(id);
      expect(rxe.getReactionCount(id)).toBe(1);
    });

    it('should not decrement to negative', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.decrement(id);
      expect(rxe.decrement(id)).toBe(false);
    });

    it('should not decrement inactive', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.setActive(id, false);
      expect(rxe.decrement(id)).toBe(false);
    });

    it('should return false for unknown decrement', () => {
      expect(rxe.decrement('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      rxe.reset(id);
      expect(rxe.getReactionCount(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(rxe.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rxe.add('m1', 'alice', '👍');
      const stats = rxe.getStats();
      expect(stats.reactions).toBe(1);
    });

    it('should count total count', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getStats().totalCount).toBe(2);
    });

    it('should count unique emojis', () => {
      rxe.add('m1', 'alice', '👍');
      rxe.add('m1', 'alice', '❤️');
      expect(rxe.getStats().uniqueEmojis).toBe(2);
    });

    it('should count unique users', () => {
      rxe.add('m1', 'alice', '👍');
      rxe.add('m1', 'bob', '👍');
      expect(rxe.getStats().uniqueUsers).toBe(2);
    });

    it('should count unique messages', () => {
      rxe.add('m1', 'alice', '👍');
      rxe.add('m2', 'alice', '👍');
      expect(rxe.getStats().uniqueMessages).toBe(2);
    });

    it('should count active', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.setActive(id, false);
      expect(rxe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getStats().totalHits).toBe(1);
    });

    it('should compute avg count', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getStats().avgCount).toBe(2);
    });

    it('should get max count', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      rxe.increment(id);
      expect(rxe.getStats().maxCount).toBe(3);
    });

    it('should get min count', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getStats().minCount).toBe(1);
    });

    it('should compute avg emoji length', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getStats().avgEmojiLength).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get reaction', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getReaction('rxe-1')?.messageId).toBe('m1');
    });

    it('should get all', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getAllReactions()).toHaveLength(1);
    });

    it('should remove reaction', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.removeReaction('rxe-1')).toBe(true);
    });

    it('should check existence', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.hasReaction('rxe-1')).toBe(true);
    });

    it('should count', () => {
      expect(rxe.getCount()).toBe(0);
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getCount()).toBe(1);
    });

    it('should get by message', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getByMessage('m1')).toHaveLength(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get message id', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getMessageId('rxe-1')).toBe('m1');
    });

    it('should get user', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getUser('rxe-1')).toBe('alice');
    });

    it('should get emoji', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getEmoji('rxe-1')).toBe('👍');
    });

    it('should get emoji length', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getEmojiLength('rxe-1')).toBe(2);
    });

    it('should get history', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getHistory('rxe-1')).toEqual([1]);
    });

    it('should get hits', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.setActive('rxe-1', false)).toBe(true);
    });

    it('should set emoji', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.setEmoji('rxe-1', '❤️')).toBe(true);
    });

    it('should set user', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.setUser('rxe-1', 'bob')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rxe.setActive('unknown', false)).toBe(false);
      expect(rxe.setEmoji('unknown', '👍')).toBe(false);
      expect(rxe.setUser('unknown', 'u')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      rxe.setActive(id, false);
      rxe.resetAll();
      expect(rxe.getReactionCount(id)).toBe(0);
      expect(rxe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by message / user / emoji / state
  // ============================================================
  describe('by message / user / emoji / state', () => {
    it('should get by message', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getByMessage('m1')).toHaveLength(1);
    });

    it('should get by user', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getByUser('alice')).toHaveLength(1);
    });

    it('should get by emoji', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getByEmoji('👍')).toHaveLength(1);
    });

    it('should get active', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getActiveReactions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      rxe.add('m1', 'alice', '👍');
      rxe.setActive('rxe-1', false);
      expect(rxe.getInactiveReactions()).toHaveLength(1);
    });

    it('should get all users', () => {
      rxe.add('m1', 'alice', '👍');
      rxe.add('m2', 'bob', '👍');
      expect(rxe.getAllUsers()).toHaveLength(2);
    });

    it('should get user count', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getUserCount()).toBe(1);
    });

    it('should get all emojis', () => {
      rxe.add('m1', 'alice', '👍');
      rxe.add('m2', 'alice', '❤️');
      expect(rxe.getAllEmojis()).toHaveLength(2);
    });

    it('should get emoji count', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getEmojiCount()).toBe(1);
    });

    it('should get all messages', () => {
      rxe.add('m1', 'alice', '👍');
      rxe.add('m2', 'alice', '👍');
      expect(rxe.getAllMessages()).toHaveLength(2);
    });

    it('should get message count', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getMessageCount()).toBe(1);
    });

    it('should get by min count', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getByMinCount(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most count', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      rxe.increment(id);
      expect(rxe.getMostCount()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(rxe.getMostCount()).toBeNull();
    });

    it('should get newest', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getNewest()?.id).toBe('rxe-1');
    });

    it('should return null for empty newest', () => {
      expect(rxe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getOldest()?.id).toBe('rxe-1');
    });

    it('should return null for empty oldest', () => {
      expect(rxe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      rxe.add('m1', 'alice', '👍');
      expect(rxe.getCreatedAt('rxe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total count', () => {
      const id = rxe.add('m1', 'alice', '👍');
      rxe.increment(id);
      expect(rxe.getTotalCount()).toBe(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many reactions', () => {
      for (let i = 0; i < 50; i++) {
        rxe.add(`m${i}`, 'alice', '👍');
      }
      expect(rxe.getCount()).toBe(50);
    });
  });
});