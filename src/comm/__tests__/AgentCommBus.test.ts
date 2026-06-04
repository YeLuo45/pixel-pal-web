/**
 * AgentCommBus Tests
 * chatdev Agent Communication Bus v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentCommBus } from '../AgentCommBus';

describe('AgentCommBus', () => {
  let bus: AgentCommBus;

  beforeEach(() => {
    bus = new AgentCommBus();
  });

  afterEach(() => {
    bus.clearAll();
  });

  // ============================================================
  // publish
  // ============================================================
  describe('publish', () => {
    it('should publish a message and return id', () => {
      const id = bus.publish({
        from: 'agent-a',
        to: 'agent-b',
        topic: 'chat',
        payload: { text: 'hello' },
        priority: 'normal',
      });
      expect(id).toMatch(/^msg-/);
    });

    it('should store message in bus', () => {
      const id = bus.publish({
        from: 'a',
        to: 'b',
        topic: 't',
        payload: {},
        priority: 'normal',
      });
      expect(bus.getMessage(id)).not.toBeNull();
    });

    it('should set pending status', () => {
      const id = bus.publish({
        from: 'a',
        to: 'b',
        topic: 't',
        payload: {},
        priority: 'normal',
      });
      expect(bus.getMessage(id)?.status).toBe('pending');
    });

    it('should set timestamp', () => {
      const before = Date.now();
      const id = bus.publish({
        from: 'a',
        to: 'b',
        topic: 't',
        payload: {},
        priority: 'normal',
      });
      const after = Date.now();
      const msg = bus.getMessage(id);
      expect(msg?.timestamp).toBeGreaterThanOrEqual(before);
      expect(msg?.timestamp).toBeLessThanOrEqual(after);
    });

    it('should support broadcast', () => {
      const id = bus.publish({
        from: 'a',
        to: '*',
        topic: 'broadcast',
        payload: {},
        priority: 'high',
      });
      expect(bus.getMessage(id)?.to).toBe('*');
    });

    it('should support different priorities', () => {
      const highId = bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'high' });
      const lowId = bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'low' });
      expect(bus.getMessage(highId)?.priority).toBe('high');
      expect(bus.getMessage(lowId)?.priority).toBe('low');
    });
  });

  // ============================================================
  // subscribe / unsubscribe
  // ============================================================
  describe('subscribe', () => {
    it('should add subscriber', () => {
      bus.subscribe({ agentId: 'agent-a', topics: ['chat'], callback: () => {} });
      expect(bus.getSubscriberCount('chat')).toBe(1);
    });

    it('should allow multiple topics', () => {
      bus.subscribe({ agentId: 'agent-a', topics: ['chat', 'system'], callback: () => {} });
      expect(bus.getSubscriberCount('chat')).toBe(1);
      expect(bus.getSubscriberCount('system')).toBe(1);
    });

    it('should deduplicate same agent same topic', () => {
      bus.subscribe({ agentId: 'agent-a', topics: ['chat'], callback: () => {} });
      bus.subscribe({ agentId: 'agent-a', topics: ['chat'], callback: () => {} });
      expect(bus.getSubscriberCount('chat')).toBe(1);
    });
  });

  describe('unsubscribe', () => {
    it('should remove subscriber', () => {
      bus.subscribe({ agentId: 'a', topics: ['chat'], callback: () => {} });
      bus.unsubscribe('a');
      expect(bus.getSubscriberCount('chat')).toBe(0);
    });

    it('should do nothing for unknown agent', () => {
      expect(() => bus.unsubscribe('unknown')).not.toThrow();
    });
  });

  // ============================================================
  // getQueueSize
  // ============================================================
  describe('getQueueSize', () => {
    it('should return total messages', () => {
      bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      bus.publish({ from: 'a', to: 'c', topic: 't', payload: {}, priority: 'normal' });
      expect(bus.getQueueSize()).toBe(2);
    });

    it('should return topic-specific count', () => {
      bus.publish({ from: 'a', to: 'b', topic: 'chat', payload: {}, priority: 'normal' });
      bus.publish({ from: 'a', to: 'b', topic: 'system', payload: {}, priority: 'normal' });
      expect(bus.getQueueSize('chat')).toBe(1);
      expect(bus.getQueueSize('system')).toBe(1);
    });

    it('should return 0 for unknown topic', () => {
      expect(bus.getQueueSize('unknown')).toBe(0);
    });
  });

  // ============================================================
  // getMessages
  // ============================================================
  describe('getMessages', () => {
    it('should return messages for agent', () => {
      bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      const msgs = bus.getMessages('b');
      expect(msgs).toHaveLength(1);
    });

    it('should return broadcast messages for any agent', () => {
      bus.publish({ from: 'a', to: '*', topic: 'broadcast', payload: {}, priority: 'normal' });
      const msgs = bus.getMessages('any-agent');
      expect(msgs).toHaveLength(1);
    });

    it('should not return messages from agent', () => {
      bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      const msgs = bus.getMessages('a');
      expect(msgs).toHaveLength(0);
    });

    it('should return empty for agent with no messages', () => {
      expect(bus.getMessages('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // retry
  // ============================================================
  describe('retry', () => {
    it('should retry pending message', () => {
      const id = bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      const result = bus.retry(id);
      expect(result).toBe(true);
    });

    it('should increment retry count', () => {
      const id = bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      bus.retry(id);
      bus.retry(id);
      expect(bus.getMessage(id)?.retries).toBe(2);
    });

    it('should fail for unknown message', () => {
      expect(bus.retry('unknown')).toBe(false);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear all messages', () => {
      bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      bus.publish({ from: 'a', to: 'c', topic: 't', payload: {}, priority: 'normal' });
      bus.clear();
      expect(bus.getQueueSize()).toBe(0);
    });

    it('should clear only for specific agent', () => {
      bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      bus.publish({ from: 'c', to: 'd', topic: 't', payload: {}, priority: 'normal' });
      bus.clear('b');
      expect(bus.getQueueSize()).toBe(1);
    });
  });

  // ============================================================
  // getMessage
  // ============================================================
  describe('getMessage', () => {
    it('should return message by id', () => {
      const id = bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      expect(bus.getMessage(id)?.from).toBe('a');
    });

    it('should return null for unknown id', () => {
      expect(bus.getMessage('unknown')).toBeNull();
    });
  });

  // ============================================================
  // updateStatus
  // ============================================================
  describe('updateStatus', () => {
    it('should update message status', () => {
      const id = bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      bus.updateStatus(id, 'delivered');
      expect(bus.getMessage(id)?.status).toBe('delivered');
    });

    it('should fail for unknown message', () => {
      expect(bus.updateStatus('unknown', 'delivered')).toBe(false);
    });
  });

  // ============================================================
  // getMessagesByTopic
  // ============================================================
  describe('getMessagesByTopic', () => {
    it('should return messages for topic', () => {
      bus.publish({ from: 'a', to: 'b', topic: 'chat', payload: {}, priority: 'normal' });
      bus.publish({ from: 'c', to: 'd', topic: 'chat', payload: {}, priority: 'normal' });
      expect(bus.getMessagesByTopic('chat')).toHaveLength(2);
    });

    it('should return empty for unknown topic', () => {
      expect(bus.getMessagesByTopic('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // getTopics
  // ============================================================
  describe('getTopics', () => {
    it('should return all topics', () => {
      bus.publish({ from: 'a', to: 'b', topic: 'chat', payload: {}, priority: 'normal' });
      bus.publish({ from: 'a', to: 'b', topic: 'system', payload: {}, priority: 'normal' });
      const topics = bus.getTopics();
      expect(topics).toContain('chat');
      expect(topics).toContain('system');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many messages', () => {
      for (let i = 0; i < 100; i++) {
        bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' });
      }
      expect(bus.getQueueSize()).toBe(100);
    });

    it('should handle many subscribers', () => {
      for (let i = 0; i < 20; i++) {
        bus.subscribe({ agentId: `agent-${i}`, topics: ['chat'], callback: () => {} });
      }
      expect(bus.getSubscriberCount('chat')).toBe(20);
    });

    it('should handle concurrent publishes', () => {
      const ids = [];
      for (let i = 0; i < 10; i++) {
        ids.push(bus.publish({ from: 'a', to: 'b', topic: 't', payload: {}, priority: 'normal' }));
      }
      expect(bus.getQueueSize()).toBe(10);
      expect(new Set(ids).size).toBe(10); // all unique
    });

    it('should handle empty payload', () => {
      const id = bus.publish({ from: 'a', to: 'b', topic: 't', payload: null, priority: 'normal' });
      expect(bus.getMessage(id)).not.toBeNull();
    });
  });
});