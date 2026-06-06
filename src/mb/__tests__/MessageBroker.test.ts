/**
 * MessageBroker Tests
 * chatdev-design Message Broker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageBroker } from '../MessageBroker';

describe('MessageBroker', () => {
  let mb: MessageBroker;

  beforeEach(() => {
    mb = new MessageBroker();
  });

  afterEach(() => {
    mb.clearAll();
  });

  // ============================================================
  // subscribe / publish / unsubscribe
  // ============================================================
  describe('subscribe / publish / unsubscribe', () => {
    it('should subscribe', () => {
      expect(mb.subscribe('topic1', 'handler1')).toBe('mb-s-1');
    });

    it('should mark as active', () => {
      const id = mb.subscribe('topic1', 'handler1');
      expect(mb.isActive(id)).toBe(true);
    });

    it('should publish', () => {
      expect(mb.publish('topic1', { data: 1 })).toBe('mb-m-1');
    });

    it('should deliver to matching subscribers', () => {
      mb.subscribe('topic1', 'handler1');
      const id = mb.publish('topic1', { data: 1 });
      expect(mb.getDelivered(id)).toBe(1);
    });

    it('should not deliver to non-matching', () => {
      mb.subscribe('topic1', 'handler1');
      const id = mb.publish('topic2', { data: 1 });
      expect(mb.getDelivered(id)).toBe(0);
    });

    it('should deliver to multiple matching', () => {
      mb.subscribe('topic1', 'handler1');
      mb.subscribe('topic1', 'handler2');
      const id = mb.publish('topic1', { data: 1 });
      expect(mb.getDelivered(id)).toBe(2);
    });

    it('should not deliver to inactive', () => {
      const subId = mb.subscribe('topic1', 'handler1');
      mb.unsubscribe(subId);
      const msgId = mb.publish('topic1', { data: 1 });
      expect(mb.getDelivered(msgId)).toBe(0);
    });

    it('should unsubscribe', () => {
      const id = mb.subscribe('topic1', 'handler1');
      expect(mb.unsubscribe(id)).toBe(true);
    });

    it('should return false for unknown unsubscribe', () => {
      expect(mb.unsubscribe('unknown')).toBe(false);
    });

    it('should resubscribe', () => {
      const id = mb.subscribe('topic1', 'handler1');
      mb.unsubscribe(id);
      expect(mb.resubscribe(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      mb.subscribe('t1', 'h1');
      const stats = mb.getStats();
      expect(stats.subscribers).toBe(1);
    });

    it('should count messages', () => {
      mb.publish('t1', {});
      expect(mb.getStats().messages).toBe(1);
    });

    it('should count total delivered', () => {
      mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      expect(mb.getStats().totalDelivered).toBe(1);
    });

    it('should count total hits', () => {
      const id = mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      expect(mb.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mb.subscribe('t1', 'h1');
      mb.unsubscribe(id);
      expect(mb.getStats().inactive).toBe(1);
    });

    it('should count topics', () => {
      mb.subscribe('t1', 'h1');
      mb.subscribe('t2', 'h2');
      expect(mb.getStats().topics).toBe(2);
    });

    it('should compute avg delivered', () => {
      mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      expect(mb.getStats().avgDelivered).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get subscriber', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getSubscriber('mb-s-1')?.topic).toBe('t1');
    });

    it('should get message', () => {
      mb.publish('t1', { data: 1 });
      expect(mb.getMessage('mb-m-1')?.topic).toBe('t1');
    });

    it('should get all subscribers', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getAllSubscribers()).toHaveLength(1);
    });

    it('should get all messages', () => {
      mb.publish('t1', {});
      expect(mb.getAllMessages()).toHaveLength(1);
    });

    it('should remove subscriber', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.removeSubscriber('mb-s-1')).toBe(true);
    });

    it('should remove message', () => {
      mb.publish('t1', {});
      expect(mb.removeMessage('mb-m-1')).toBe(true);
    });

    it('should check existence', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.hasSubscriber('mb-s-1')).toBe(true);
    });

    it('should count subscribers', () => {
      expect(mb.getSubscriberCount()).toBe(0);
      mb.subscribe('t1', 'h1');
      expect(mb.getSubscriberCount()).toBe(1);
    });

    it('should count messages', () => {
      expect(mb.getMessageCount()).toBe(0);
      mb.publish('t1', {});
      expect(mb.getMessageCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get topic', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getTopic('mb-s-1')).toBe('t1');
    });

    it('should get handler', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getHandler('mb-s-1')).toBe('h1');
    });

    it('should get payload', () => {
      mb.publish('t1', { data: 1 });
      expect(mb.getPayload('mb-m-1')).toEqual({ data: 1 });
    });

    it('should get delivered', () => {
      mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      expect(mb.getDelivered('mb-m-1')).toBe(1);
    });

    it('should get hits', () => {
      const id = mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      expect(mb.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = mb.subscribe('t1', 'h1');
      expect(mb.setActive(id, false)).toBe(true);
    });

    it('should set topic', () => {
      const id = mb.subscribe('t1', 'h1');
      expect(mb.setTopic(id, 't2')).toBe(true);
    });

    it('should set handler', () => {
      const id = mb.subscribe('t1', 'h1');
      expect(mb.setHandler(id, 'h2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mb.setActive('unknown', false)).toBe(false);
      expect(mb.setTopic('unknown', 't')).toBe(false);
      expect(mb.setHandler('unknown', 'h')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      mb.unsubscribe(id);
      mb.resetAll();
      expect(mb.getMessageCount()).toBe(0);
      expect(mb.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by topic
  // ============================================================
  describe('by topic', () => {
    it('should get by topic', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getByTopic('t1')).toHaveLength(1);
    });

    it('should get messages by topic', () => {
      mb.publish('t1', {});
      expect(mb.getMessagesByTopic('t1')).toHaveLength(1);
    });

    it('should get active', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getActiveSubscribers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = mb.subscribe('t1', 'h1');
      mb.unsubscribe(id);
      expect(mb.getInactiveSubscribers()).toHaveLength(1);
    });

    it('should get all topics', () => {
      mb.subscribe('t1', 'h1');
      mb.subscribe('t2', 'h2');
      expect(mb.getAllTopics()).toHaveLength(2);
    });

    it('should get topic count', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getTopicCount()).toBe(1);
    });

    it('should get all handlers', () => {
      mb.subscribe('t1', 'h1');
      mb.subscribe('t2', 'h2');
      expect(mb.getAllHandlers()).toHaveLength(2);
    });

    it('should get handler count', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getHandlerCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get by min hits', () => {
      const id = mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      expect(mb.getByMinHits(1)).toHaveLength(1);
    });

    it('should get most hits', () => {
      const id = mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      expect(mb.getMostHits()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(mb.getMostHits()).toBeNull();
    });

    it('should get newest', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getNewest()?.id).toBe('mb-s-1');
    });

    it('should return null for empty newest', () => {
      expect(mb.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getOldest()?.id).toBe('mb-s-1');
    });

    it('should return null for empty oldest', () => {
      expect(mb.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      mb.subscribe('t1', 'h1');
      expect(mb.getCreatedAt('mb-s-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total delivered', () => {
      mb.subscribe('t1', 'h1');
      mb.publish('t1', {});
      expect(mb.getTotalDelivered()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many subscribers', () => {
      for (let i = 0; i < 50; i++) {
        mb.subscribe(`t${i}`, `h${i}`);
      }
      expect(mb.getSubscriberCount()).toBe(50);
    });
  });
});