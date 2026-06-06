/**
 * ConversationTracker Tests
 * chatdev-design Conversation Tracker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConversationTracker } from '../ConversationTracker';

describe('ConversationTracker', () => {
  let ct: ConversationTracker;

  beforeEach(() => {
    ct = new ConversationTracker();
  });

  afterEach(() => {
    ct.clearAll();
  });

  // ============================================================
  // start / addMessage / join
  // ============================================================
  describe('start / addMessage / join', () => {
    it('should start', () => {
      expect(ct.start('topic1')).toBe('conv-1');
    });

    it('should add message', () => {
      const id = ct.start('topic1');
      expect(ct.addMessage(id, 'hello')).toBe(true);
    });

    it('should increment turns on add', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'hello');
      expect(ct.getTurns(id)).toBe(1);
    });

    it('should not add to closed', () => {
      const id = ct.start('topic1');
      ct.close(id);
      expect(ct.addMessage(id, 'hello')).toBe(false);
    });

    it('should return false for unknown add', () => {
      expect(ct.addMessage('unknown', 'hello')).toBe(false);
    });

    it('should join', () => {
      const id = ct.start('topic1');
      expect(ct.join(id, 'user1')).toBe(true);
    });

    it('should not join same twice', () => {
      const id = ct.start('topic1');
      ct.join(id, 'user1');
      expect(ct.join(id, 'user1')).toBe(false);
    });

    it('should not join closed', () => {
      const id = ct.start('topic1');
      ct.close(id);
      expect(ct.join(id, 'user1')).toBe(false);
    });
  });

  // ============================================================
  // close / reopen
  // ============================================================
  describe('close / reopen', () => {
    it('should close', () => {
      const id = ct.start('topic1');
      expect(ct.close(id)).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(ct.close('unknown')).toBe(false);
    });

    it('should reopen', () => {
      const id = ct.start('topic1');
      ct.close(id);
      expect(ct.reopen(id)).toBe(true);
    });

    it('should return false for unknown reopen', () => {
      expect(ct.reopen('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getTurns / getStats
  // ============================================================
  describe('getTurns / getStats', () => {
    it('should get turns', () => {
      ct.start('topic1');
      expect(ct.getTurns('conv-1')).toBe(0);
    });

    it('should return 0 turns for unknown', () => {
      expect(ct.getTurns('unknown')).toBe(0);
    });

    it('should get stats', () => {
      ct.start('topic1');
      const stats = ct.getStats();
      expect(stats.conversations).toBe(1);
    });

    it('should count total turns', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      ct.addMessage(id, 'm2');
      expect(ct.getStats().totalTurns).toBe(2);
    });

    it('should count total messages', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      expect(ct.getStats().totalMessages).toBe(1);
    });

    it('should compute avg turns', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      expect(ct.getStats().avgTurns).toBe(1);
    });

    it('should count open', () => {
      ct.start('topic1');
      expect(ct.getStats().open).toBe(1);
    });

    it('should count closed', () => {
      const id = ct.start('topic1');
      ct.close(id);
      expect(ct.getStats().closed).toBe(1);
    });

    it('should count topics', () => {
      ct.start('t1');
      ct.start('t2');
      expect(ct.getStats().topics).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get conversation', () => {
      ct.start('topic1');
      expect(ct.getConversation('conv-1')?.topic).toBe('topic1');
    });

    it('should get all', () => {
      ct.start('topic1');
      expect(ct.getAllConversations()).toHaveLength(1);
    });

    it('should remove', () => {
      ct.start('topic1');
      expect(ct.removeConversation('conv-1')).toBe(true);
    });

    it('should check existence', () => {
      ct.start('topic1');
      expect(ct.hasConversation('conv-1')).toBe(true);
    });

    it('should count', () => {
      expect(ct.getCount()).toBe(0);
      ct.start('topic1');
      expect(ct.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get topic', () => {
      ct.start('topic1');
      expect(ct.getTopic('conv-1')).toBe('topic1');
    });

    it('should get participants', () => {
      const id = ct.start('topic1');
      ct.join(id, 'u1');
      expect(ct.getParticipants(id)).toContain('u1');
    });

    it('should get participant count', () => {
      const id = ct.start('topic1');
      ct.join(id, 'u1');
      expect(ct.getParticipantCount(id)).toBe(1);
    });

    it('should get messages', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      expect(ct.getMessages(id)).toEqual(['m1']);
    });

    it('should get message count', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      expect(ct.getMessageCount(id)).toBe(1);
    });

    it('should get last message', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      expect(ct.getLastMessage(id)).toBe('m1');
    });

    it('should return undefined for empty last message', () => {
      const id = ct.start('topic1');
      expect(ct.getLastMessage(id)).toBeUndefined();
    });

    it('should get history', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      expect(ct.getHistory(id)).toEqual([1]);
    });

    it('should get hits', () => {
      const id = ct.start('topic1');
      ct.touch(id);
      expect(ct.getHits(id)).toBe(1);
    });

    it('should check isClosed', () => {
      ct.start('topic1');
      expect(ct.isClosed('conv-1')).toBe(false);
    });

    it('should check isOpen', () => {
      ct.start('topic1');
      expect(ct.isOpen('conv-1')).toBe(true);
    });

    it('should check isParticipant', () => {
      const id = ct.start('topic1');
      ct.join(id, 'u1');
      expect(ct.isParticipant(id, 'u1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set topic', () => {
      const id = ct.start('topic1');
      expect(ct.setTopic(id, 'topic2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ct.setTopic('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // leave
  // ============================================================
  describe('leave', () => {
    it('should leave', () => {
      const id = ct.start('topic1');
      ct.join(id, 'u1');
      expect(ct.leave(id, 'u1')).toBe(true);
    });

    it('should not leave non-participant', () => {
      const id = ct.start('topic1');
      expect(ct.leave(id, 'u1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(ct.leave('unknown', 'u1')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset turns', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      expect(ct.resetTurns(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ct.resetTurns('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = ct.start('topic1');
      ct.addMessage(id, 'm1');
      ct.close(id);
      ct.resetAll();
      expect(ct.getTurns(id)).toBe(0);
      expect(ct.isOpen(id)).toBe(true);
    });
  });

  // ============================================================
  // by topic / participant
  // ============================================================
  describe('by topic / participant', () => {
    it('should get by topic', () => {
      ct.start('t1');
      expect(ct.getByTopic('t1')).toHaveLength(1);
    });

    it('should get by participant', () => {
      const id = ct.start('t1');
      ct.join(id, 'u1');
      expect(ct.getByParticipant('u1')).toHaveLength(1);
    });

    it('should get open', () => {
      ct.start('t1');
      expect(ct.getOpenConversations()).toHaveLength(1);
    });

    it('should get closed', () => {
      const id = ct.start('t1');
      ct.close(id);
      expect(ct.getClosedConversations()).toHaveLength(1);
    });

    it('should get all topics', () => {
      ct.start('t1');
      ct.start('t2');
      expect(ct.getAllTopics()).toHaveLength(2);
    });

    it('should get topic count', () => {
      ct.start('t1');
      expect(ct.getTopicCount()).toBe(1);
    });

    it('should get by min turns', () => {
      const id = ct.start('t1');
      ct.addMessage(id, 'm1');
      expect(ct.getByMinTurns(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most turns', () => {
      const id = ct.start('t1');
      ct.addMessage(id, 'm1');
      expect(ct.getMostTurns()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ct.getMostTurns()).toBeNull();
    });

    it('should get newest', () => {
      ct.start('t1');
      expect(ct.getNewest()?.id).toBe('conv-1');
    });

    it('should return null for empty newest', () => {
      expect(ct.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ct.start('t1');
      expect(ct.getOldest()?.id).toBe('conv-1');
    });

    it('should return null for empty oldest', () => {
      expect(ct.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ct.start('t1');
      expect(ct.getCreatedAt('conv-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ct.start('t1');
      ct.addMessage(id, 'm1');
      expect(ct.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      const id = ct.start('t1');
      expect(ct.touch(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ct.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many conversations', () => {
      for (let i = 0; i < 50; i++) {
        ct.start(`t${i}`);
      }
      expect(ct.getCount()).toBe(50);
    });
  });
});