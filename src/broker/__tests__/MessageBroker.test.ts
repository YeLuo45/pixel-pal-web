/**
 * MessageBroker Tests
 * chatdev-design Message Broker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageBroker } from '../MessageBroker';

describe('MessageBroker', () => {
  let broker: MessageBroker;

  beforeEach(() => {
    broker = new MessageBroker();
  });

  afterEach(() => {
    broker.clearAll();
  });

  // ============================================================
  // publish
  // ============================================================
  describe('publish', () => {
    it('should publish', () => {
      const id = broker.publish('topic1', { data: 1 });
      expect(id).toBe('msg-1');
    });

    it('should get published message', () => {
      const id = broker.publish('topic1', 'payload');
      expect(broker.getMessage(id)?.topic).toBe('topic1');
    });
  });

  // ============================================================
  // subscribe
  // ============================================================
  describe('subscribe', () => {
    it('should subscribe', () => {
      const id = broker.subscribe('topic1', () => {});
      expect(id).toBe('sub-1');
    });

    it('should call callback on publish', () => {
      let received = false;
      broker.subscribe('topic1', () => { received = true; });
      broker.publish('topic1', 'data');
      expect(received).toBe(true);
    });
  });

  // ============================================================
  // unsubscribe
  // ============================================================
  describe('unsubscribe', () => {
    it('should unsubscribe', () => {
      const id = broker.subscribe('topic1', () => {});
      expect(broker.unsubscribe(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(broker.unsubscribe('unknown')).toBe(false);
    });

    it('should stop receiving after unsubscribe', () => {
      let count = 0;
      const id = broker.subscribe('topic1', () => { count++; });
      broker.publish('topic1', 'a');
      broker.unsubscribe(id);
      broker.publish('topic1', 'b');
      expect(count).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      broker.publish('t1', 'd');
      broker.subscribe('t1', () => {});
      const stats = broker.getStats();
      expect(stats.messages).toBe(1);
    });
  });

  // ============================================================
  // messages
  // ============================================================
  describe('messages', () => {
    it('should get all messages', () => {
      broker.publish('t1', 'a');
      broker.publish('t1', 'b');
      expect(broker.getAllMessages()).toHaveLength(2);
    });

    it('should get by topic', () => {
      broker.publish('t1', 'a');
      broker.publish('t2', 'b');
      expect(broker.getMessagesByTopic('t1')).toHaveLength(1);
    });

    it('should remove message', () => {
      const id = broker.publish('t1', 'a');
      expect(broker.removeMessage(id)).toBe(true);
    });

    it('should check hasMessage', () => {
      const id = broker.publish('t1', 'a');
      expect(broker.hasMessage(id)).toBe(true);
    });

    it('should count messages', () => {
      broker.publish('t1', 'a');
      expect(broker.getMessageCount()).toBe(1);
    });

    it('should clear messages', () => {
      broker.publish('t1', 'a');
      broker.clearAllMessages();
      expect(broker.getMessageCount()).toBe(0);
    });
  });

  // ============================================================
  // subscriptions
  // ============================================================
  describe('subscriptions', () => {
    it('should get subscription', () => {
      const id = broker.subscribe('t1', () => {});
      expect(broker.getSubscription(id)?.topic).toBe('t1');
    });

    it('should get all subscriptions', () => {
      broker.subscribe('t1', () => {});
      broker.subscribe('t2', () => {});
      expect(broker.getAllSubscriptions()).toHaveLength(2);
    });

    it('should get by topic', () => {
      broker.subscribe('t1', () => {});
      expect(broker.getSubscriptionsByTopic('t1')).toHaveLength(1);
    });

    it('should check hasSubscription', () => {
      const id = broker.subscribe('t1', () => {});
      expect(broker.hasSubscription(id)).toBe(true);
    });

    it('should count subscriptions', () => {
      broker.subscribe('t1', () => {});
      expect(broker.getSubscriptionCount()).toBe(1);
    });

    it('should clear subscriptions', () => {
      broker.subscribe('t1', () => {});
      broker.clearAllSubscriptions();
      expect(broker.getSubscriptionCount()).toBe(0);
    });
  });

  // ============================================================
  // topics
  // ============================================================
  describe('topics', () => {
    it('should get topics', () => {
      broker.subscribe('t1', () => {});
      broker.subscribe('t2', () => {});
      expect(broker.getTopics()).toHaveLength(2);
    });

    it('should check hasTopic', () => {
      broker.subscribe('t1', () => {});
      expect(broker.hasTopic('t1')).toBe(true);
    });

    it('should count topics', () => {
      broker.subscribe('t1', () => {});
      expect(broker.getTopicCount()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many messages', () => {
      for (let i = 0; i < 50; i++) {
        broker.publish('t1', `m${i}`);
      }
      expect(broker.getMessageCount()).toBe(50);
    });
  });
});