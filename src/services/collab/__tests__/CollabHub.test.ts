import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CollabHub, CollabSession, CollabMessage } from '../CollabHub';

describe('CollabHub', () => {
  let hub: CollabHub;

  beforeEach(() => {
    vi.useRealTimers();  // Ensure fake timers are reset
    hub = new CollabHub();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Session Management', () => {
    it('should create a session with name and participants', () => {
      const session = hub.createSession('Test Session', ['user1', 'user2']);
      expect(session).toBeDefined();
      expect(session.name).toBe('Test Session');
      expect(session.participants).toContain('user1');
      expect(session.participants).toContain('user2');
      expect(session.status).toBe('active');
      expect(session.createdAt).toBeGreaterThan(0);
    });

    it('should generate unique session IDs', () => {
      const session1 = hub.createSession('Session 1', ['user1']);
      const session2 = hub.createSession('Session 2', ['user2']);
      expect(session1.id).not.toBe(session2.id);
    });

    it('should get session by ID', () => {
      const created = hub.createSession('Test', ['user1']);
      const retrieved = hub.getSession(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test');
    });

    it('should return null for non-existent session', () => {
      const result = hub.getSession('non-existent-id');
      expect(result).toBeNull();
    });

    it('should end a session', () => {
      const session = hub.createSession('Test', ['user1']);
      const result = hub.endSession(session.id);
      expect(result).toBe(true);
      const ended = hub.getSession(session.id);
      expect(ended?.status).toBe('ended');
    });

    it('should return false when ending non-existent session', () => {
      const result = hub.endSession('non-existent-id');
      expect(result).toBe(false);
    });

    it('should get all active sessions', () => {
      hub.createSession('Active 1', ['user1']);
      hub.createSession('Active 2', ['user2']);
      const paused = hub.createSession('Paused', ['user3']);
      hub.endSession(paused.id);
      
      const active = hub.getActiveSessions();
      expect(active).toHaveLength(2);
      expect(active.every(s => s.status === 'active')).toBe(true);
    });

    it('should track session creation time', () => {
      const before = Date.now();
      const session = hub.createSession('Test', ['user1']);
      const after = Date.now();
      expect(session.createdAt).toBeGreaterThanOrEqual(before);
      expect(session.createdAt).toBeLessThanOrEqual(after);
    });
  });

  describe('Message Management', () => {
    it('should send a message to a session', () => {
      const session = hub.createSession('Test', ['user1', 'user2']);
      const message = hub.sendMessage(session.id, 'user1', 'Hello everyone!');
      expect(message).toBeDefined();
      expect(message.content).toBe('Hello everyone!');
      expect(message.senderId).toBe('user1');
      expect(message.sessionId).toBe(session.id);
      expect(message.type).toBe('text');
    });

    it('should send action message', () => {
      const session = hub.createSession('Test', ['user1']);
      const message = hub.sendMessage(session.id, 'user1', 'User joined', 'action');
      expect(message.type).toBe('action');
    });

    it('should send system message', () => {
      const session = hub.createSession('Test', ['user1']);
      const message = hub.sendMessage(session.id, 'system', 'Session started', 'system');
      expect(message.type).toBe('system');
    });

    it('should get messages for a session', () => {
      const session = hub.createSession('Test', ['user1', 'user2']);
      hub.sendMessage(session.id, 'user1', 'Message 1');
      hub.sendMessage(session.id, 'user2', 'Message 2');
      
      const messages = hub.getMessages(session.id);
      expect(messages).toHaveLength(2);
    });

    it('should get messages since a timestamp', () => {
      const session = hub.createSession('Test', ['user1']);
      const msg1 = hub.sendMessage(session.id, 'user1', 'First');
      const msg2 = hub.sendMessage(session.id, 'user1', 'Second');

      // Since all timestamps are equal, all messages have timestamp >= msg1.timestamp
      // This verifies >= semantics even when all timestamps are the same
      const messages = hub.getMessages(session.id, msg1.timestamp);
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe(msg1.id);
      expect(messages[1].id).toBe(msg2.id);

      // Query with a timestamp in the future - no messages beyond
      const future = hub.getMessages(session.id, msg1.timestamp + 10000);
      expect(future).toHaveLength(0);
    });

    it('should return empty array for session with no messages', () => {
      const session = hub.createSession('Test', ['user1']);
      const messages = hub.getMessages(session.id);
      expect(messages).toHaveLength(0);
    });

    it('should generate unique message IDs', () => {
      const session = hub.createSession('Test', ['user1']);
      const msg1 = hub.sendMessage(session.id, 'user1', 'Msg 1');
      const msg2 = hub.sendMessage(session.id, 'user1', 'Msg 2');
      expect(msg1.id).not.toBe(msg2.id);
    });

    it('should track message timestamps', () => {
      const session = hub.createSession('Test', ['user1']);
      const before = Date.now();
      const message = hub.sendMessage(session.id, 'user1', 'Test');
      const after = Date.now();
      expect(message.timestamp).toBeGreaterThanOrEqual(before);
      expect(message.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('Participant Management', () => {
    it('should add participant to session', () => {
      const session = hub.createSession('Test', ['user1']);
      const result = hub.addParticipant(session.id, 'user2');
      expect(result).toBe(true);
      const updated = hub.getSession(session.id);
      expect(updated?.participants).toContain('user2');
    });

    it('should not add duplicate participant', () => {
      const session = hub.createSession('Test', ['user1']);
      const result = hub.addParticipant(session.id, 'user1');
      expect(result).toBe(false);
    });

    it('should return false when adding to non-existent session', () => {
      const result = hub.addParticipant('non-existent', 'user1');
      expect(result).toBe(false);
    });

    it('should remove participant from session', () => {
      const session = hub.createSession('Test', ['user1', 'user2']);
      const result = hub.removeParticipant(session.id, 'user2');
      expect(result).toBe(true);
      const updated = hub.getSession(session.id);
      expect(updated?.participants).not.toContain('user2');
    });

    it('should return false when removing non-existent participant', () => {
      const session = hub.createSession('Test', ['user1']);
      const result = hub.removeParticipant(session.id, 'user2');
      expect(result).toBe(false);
    });

    it('should return false when removing from non-existent session', () => {
      const result = hub.removeParticipant('non-existent', 'user1');
      expect(result).toBe(false);
    });

    it('should maintain participant order', () => {
      const session = hub.createSession('Test', ['user1']);
      hub.addParticipant(session.id, 'user2');
      hub.addParticipant(session.id, 'user3');
      const updated = hub.getSession(session.id);
      expect(updated?.participants).toEqual(['user1', 'user2', 'user3']);
    });
  });

  describe('Broadcast', () => {
    it('should broadcast message to all participants', () => {
      const session = hub.createSession('Test', ['user1', 'user2', 'user3']);
      const messages = hub.broadcast(session.id, 'Hello everyone!');
      expect(messages).toHaveLength(3);
      expect(messages.map(m => m.senderId)).toEqual(['user1', 'user2', 'user3']);
      messages.forEach(msg => {
        expect(msg.content).toBe('Hello everyone!');
        expect(msg.sessionId).toBe(session.id);
      });
    });

    it('should exclude specified participants from broadcast', () => {
      const session = hub.createSession('Test', ['user1', 'user2', 'user3']);
      const messages = hub.broadcast(session.id, 'Hello', ['user2']);
      expect(messages).toHaveLength(2);
      expect(messages.map(m => m.senderId)).toEqual(['user1', 'user3']);
    });

    it('should return empty array when excluding all participants', () => {
      const session = hub.createSession('Test', ['user1', 'user2']);
      const messages = hub.broadcast(session.id, 'Hello', ['user1', 'user2']);
      expect(messages).toHaveLength(0);
    });

    it('should return empty array for non-existent session broadcast', () => {
      const messages = hub.broadcast('non-existent', 'Hello');
      expect(messages).toHaveLength(0);
    });

    it('should create messages with correct types for broadcast', () => {
      const session = hub.createSession('Test', ['user1', 'user2']);
      const messages = hub.broadcast(session.id, 'Hello');
      messages.forEach(msg => {
        expect(msg.type).toBe('text');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple sessions independently', () => {
      const session1 = hub.createSession('Session 1', ['user1']);
      const session2 = hub.createSession('Session 2', ['user2']);
      
      hub.sendMessage(session1.id, 'user1', 'Message in session 1');
      hub.sendMessage(session2.id, 'user2', 'Message in session 2');
      
      expect(hub.getMessages(session1.id)).toHaveLength(1);
      expect(hub.getMessages(session2.id)).toHaveLength(1);
      expect(hub.getMessages(session1.id)[0].content).toBe('Message in session 1');
      expect(hub.getMessages(session2.id)[0].content).toBe('Message in session 2');
    });

    it('should handle empty content message', () => {
      const session = hub.createSession('Test', ['user1']);
      const message = hub.sendMessage(session.id, 'user1', '');
      expect(message.content).toBe('');
    });

    it('should handle session with no participants', () => {
      const session = hub.createSession('Empty', []);
      expect(session.participants).toHaveLength(0);
      expect(hub.getActiveSessions()).toHaveLength(1);
    });

    it('should handle ending already ended session', () => {
      const session = hub.createSession('Test', ['user1']);
      hub.endSession(session.id);
      const result = hub.endSession(session.id);
      expect(result).toBe(false);
    });
  });
});