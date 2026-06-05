/**
 * ConversationManager Tests
 * chatdev-design Conversation Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConversationManager } from '../ConversationManager';

describe('ConversationManager', () => {
  let manager: ConversationManager;

  beforeEach(() => {
    manager = new ConversationManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  // ============================================================
  // createConversation
  // ============================================================
  describe('createConversation', () => {
    it('should create conversation', () => {
      const id = manager.createConversation(['a', 'b']);
      expect(id).toBe('conv-1');
    });
  });

  // ============================================================
  // addMessage
  // ============================================================
  describe('addMessage', () => {
    it('should add message', () => {
      const id = manager.createConversation(['a', 'b']);
      expect(manager.addMessage(id, { id: 'm1', sender: 'a', content: 'hello', timestamp: 1000 })).toBe(true);
    });

    it('should return false for unknown conversation', () => {
      expect(manager.addMessage('unknown', { id: 'm1', sender: 'a', content: 'hello', timestamp: 1000 })).toBe(false);
    });

    it('should add new participant if message from new sender', () => {
      const id = manager.createConversation(['a']);
      manager.addMessage(id, { id: 'm1', sender: 'b', content: 'hi', timestamp: 1000 });
      expect(manager.getParticipants(id)).toContain('b');
    });
  });

  // ============================================================
  // getContext
  // ============================================================
  describe('getContext', () => {
    it('should get context', () => {
      const id = manager.createConversation(['a']);
      expect(manager.getContext(id)).toEqual({});
    });

    it('should return empty for unknown', () => {
      expect(manager.getContext('unknown')).toEqual({});
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats for empty', () => {
      const stats = manager.getStats();
      expect(stats.conversations).toBe(0);
      expect(stats.avgMessagesPerConversation).toBe(0);
    });

    it('should calculate stats', () => {
      const id = manager.createConversation(['a']);
      manager.addMessage(id, { id: 'm1', sender: 'a', content: 'hi', timestamp: 1000 });
      const stats = manager.getStats();
      expect(stats.conversations).toBe(1);
      expect(stats.messages).toBe(1);
    });
  });

  // ============================================================
  // getConversation / getAllConversations
  // ============================================================
  describe('conversation queries', () => {
    it('should get conversation', () => {
      const id = manager.createConversation(['a']);
      expect(manager.getConversation(id)?.id).toBe(id);
    });

    it('should get all', () => {
      manager.createConversation(['a']);
      manager.createConversation(['b']);
      expect(manager.getAllConversations()).toHaveLength(2);
    });

    it('should remove', () => {
      const id = manager.createConversation(['a']);
      expect(manager.removeConversation(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(manager.removeConversation('unknown')).toBe(false);
    });

    it('should check existence', () => {
      const id = manager.createConversation(['a']);
      expect(manager.hasConversation(id)).toBe(true);
    });
  });

  // ============================================================
  // messages
  // ============================================================
  describe('messages', () => {
    it('should get messages', () => {
      const id = manager.createConversation(['a']);
      manager.addMessage(id, { id: 'm1', sender: 'a', content: 'hi', timestamp: 1000 });
      expect(manager.getMessages(id)).toHaveLength(1);
    });

    it('should get message count', () => {
      const id = manager.createConversation(['a']);
      expect(manager.getMessageCount(id)).toBe(0);
    });

    it('should remove message', () => {
      const id = manager.createConversation(['a']);
      manager.addMessage(id, { id: 'm1', sender: 'a', content: 'hi', timestamp: 1000 });
      expect(manager.removeMessage(id, 'm1')).toBe(true);
    });

    it('should return false for unknown conversation', () => {
      expect(manager.removeMessage('unknown', 'm1')).toBe(false);
    });

    it('should return false for unknown message', () => {
      const id = manager.createConversation(['a']);
      expect(manager.removeMessage(id, 'unknown')).toBe(false);
    });

    it('should get messages by sender', () => {
      const id = manager.createConversation(['a', 'b']);
      manager.addMessage(id, { id: 'm1', sender: 'a', content: 'hi', timestamp: 1000 });
      manager.addMessage(id, { id: 'm2', sender: 'b', content: 'hello', timestamp: 1001 });
      expect(manager.getMessagesBySender(id, 'a')).toHaveLength(1);
    });

    it('should get last message', () => {
      const id = manager.createConversation(['a']);
      manager.addMessage(id, { id: 'm1', sender: 'a', content: 'first', timestamp: 1000 });
      manager.addMessage(id, { id: 'm2', sender: 'a', content: 'last', timestamp: 1001 });
      expect(manager.getLastMessage(id)?.content).toBe('last');
    });

    it('should return undefined for empty', () => {
      const id = manager.createConversation(['a']);
      expect(manager.getLastMessage(id)).toBeUndefined();
    });
  });

  // ============================================================
  // participants
  // ============================================================
  describe('participants', () => {
    it('should get participants', () => {
      const id = manager.createConversation(['a', 'b']);
      expect(manager.getParticipants(id)).toHaveLength(2);
    });

    it('should check isParticipant', () => {
      const id = manager.createConversation(['a']);
      expect(manager.isParticipant(id, 'a')).toBe(true);
      expect(manager.isParticipant(id, 'b')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(manager.isParticipant('unknown', 'a')).toBe(false);
    });

    it('should get by participant', () => {
      const id = manager.createConversation(['a']);
      expect(manager.getConversationsByParticipant('a')).toHaveLength(1);
    });
  });

  // ============================================================
  // context
  // ============================================================
  describe('context', () => {
    it('should set context', () => {
      const id = manager.createConversation(['a']);
      expect(manager.setContext(id, 'topic', 'work')).toBe(true);
    });

    it('should get context value', () => {
      const id = manager.createConversation(['a']);
      manager.setContext(id, 'topic', 'work');
      expect(manager.getContextValue(id, 'topic')).toBe('work');
    });

    it('should clear context', () => {
      const id = manager.createConversation(['a']);
      manager.setContext(id, 'topic', 'work');
      expect(manager.clearContext(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(manager.setContext('unknown', 'k', 'v')).toBe(false);
      expect(manager.clearContext('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getRecentConversations
  // ============================================================
  describe('getRecentConversations', () => {
    it('should get recent', () => {
      manager.createConversation(['a']);
      manager.createConversation(['b']);
      expect(manager.getRecentConversations(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      const id = manager.createConversation(['a']);
      expect(manager.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = manager.createConversation(['a']);
      expect(manager.getUpdatedAt(id)).toBeGreaterThan(0);
    });

    it('should return 0 for unknown', () => {
      expect(manager.getCreatedAt('unknown')).toBe(0);
      expect(manager.getUpdatedAt('unknown')).toBe(0);
    });
  });

  // ============================================================
  // count
  // ============================================================
  describe('count', () => {
    it('should count', () => {
      expect(manager.getCount()).toBe(0);
      manager.createConversation(['a']);
      expect(manager.getCount()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many conversations', () => {
      for (let i = 0; i < 50; i++) {
        manager.createConversation([`p${i}`]);
      }
      expect(manager.getCount()).toBe(50);
    });
  });
});