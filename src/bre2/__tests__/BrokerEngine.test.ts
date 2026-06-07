/**
 * BrokerEngine Tests
 * nanobot-design Broker Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrokerEngine } from '../BrokerEngine';

describe('BrokerEngine', () => {
  let bre2: BrokerEngine;

  beforeEach(() => {
    bre2 = new BrokerEngine();
  });

  afterEach(() => {
    bre2.clearAll();
  });

  describe('publish / subscribe / unsubscribe / route / remove', () => {
    it('should publish', () => {
      expect(bre2.publish('t1', 'alice', 'data')).toMatch(/^bre2-/);
    });

    it('should default mode to topic', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getMode(bre2.getAllMessages()[0].id)).toBe('topic');
    });

    it('should mark as active', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.isActive(bre2.getAllMessages()[0].id)).toBe(true);
    });

    it('should subscribe', () => {
      expect(bre2.subscribe('t1', 'sub1')).toBe(true);
    });

    it('should not subscribe twice to same', () => {
      bre2.subscribe('t1', 'sub1');
      expect(bre2.subscribe('t1', 'sub1')).toBe(false);
    });

    it('should unsubscribe', () => {
      bre2.subscribe('t1', 'sub1');
      expect(bre2.unsubscribe('t1', 'sub1')).toBe(true);
    });

    it('should not unsubscribe unknown topic', () => {
      expect(bre2.unsubscribe('unknown', 'sub1')).toBe(false);
    });

    it('should not unsubscribe unknown sub', () => {
      bre2.subscribe('t1', 'sub1');
      expect(bre2.unsubscribe('t1', 'unknown')).toBe(false);
    });

    it('should route direct', () => {
      bre2.subscribe('t1', 'sub1');
      const id = bre2.publish('t1', 'alice', 'data', 'direct');
      expect(bre2.route(id)).toBe(1);
    });

    it('should route topic without subs', () => {
      const id = bre2.publish('t1', 'alice', 'data', 'topic');
      expect(bre2.route(id)).toBe(0);
    });

    it('should route topic with subs', () => {
      bre2.subscribe('t1', 'sub1');
      const id = bre2.publish('t1', 'alice', 'data', 'topic');
      expect(bre2.route(id)).toBe(1);
    });

    it('should route fanout to all subs', () => {
      bre2.subscribe('t1', 'sub1');
      bre2.subscribe('t1', 'sub2');
      const id = bre2.publish('t1', 'alice', 'data', 'fanout');
      expect(bre2.route(id)).toBe(2);
    });

    it('should not route inactive', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      bre2.setActive(id, false);
      expect(bre2.route(id)).toBe(0);
    });

    it('should return 0 for unknown route', () => {
      expect(bre2.route('unknown')).toBe(0);
    });

    it('should remove', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getStats().messages).toBe(1);
    });

    it('should count total published', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getStats().totalPublished).toBe(1);
    });

    it('should count total subscribed', () => {
      bre2.subscribe('t1', 'sub1');
      expect(bre2.getStats().totalSubscribed).toBe(1);
    });

    it('should count total routed', () => {
      bre2.subscribe('t1', 'sub1');
      const id = bre2.publish('t1', 'alice', 'data', 'direct');
      bre2.route(id);
      expect(bre2.getStats().totalRouted).toBe(1);
    });

    it('should count direct', () => {
      bre2.publish('t1', 'alice', 'data', 'direct');
      expect(bre2.getStats().direct).toBe(1);
    });

    it('should count fanout', () => {
      bre2.publish('t1', 'alice', 'data', 'fanout');
      expect(bre2.getStats().fanout).toBe(1);
    });

    it('should count topic', () => {
      bre2.publish('t1', 'alice', 'data', 'topic');
      expect(bre2.getStats().topic).toBe(1);
    });

    it('should count active', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      bre2.setActive(id, false);
      expect(bre2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      bre2.subscribe('t1', 'sub1');
      const id = bre2.publish('t1', 'alice', 'data', 'direct');
      bre2.route(id);
      expect(bre2.getStats().totalHits).toBe(1);
    });

    it('should count unique topics', () => {
      bre2.publish('a', 'alice', 'data');
      bre2.publish('a', 'alice', 'data');
      expect(bre2.getStats().uniqueTopics).toBe(1);
    });

    it('should count unique senders', () => {
      bre2.publish('t1', 'alice', 'data');
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getStats().uniqueSenders).toBe(1);
    });

    it('should count total delivered', () => {
      bre2.subscribe('t1', 'sub1');
      const id = bre2.publish('t1', 'alice', 'data', 'fanout');
      bre2.route(id);
      expect(bre2.getStats().totalDelivered).toBe(1);
    });

    it('should count total payload len', () => {
      bre2.publish('t1', 'alice', 'hi');
      expect(bre2.getStats().totalPayloadLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get message', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.getMessage(id)?.topic).toBe('t1');
    });

    it('should get all', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getAllMessages()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.hasMessage(id)).toBe(true);
    });

    it('should count', () => {
      expect(bre2.getCount()).toBe(0);
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get topic', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.getTopic(id)).toBe('t1');
    });

    it('should get sender', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.getSender(id)).toBe('alice');
    });

    it('should get payload', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.getPayload(id)).toBe('data');
    });

    it('should get hits', () => {
      bre2.subscribe('t1', 'sub1');
      const id = bre2.publish('t1', 'alice', 'data', 'direct');
      bre2.route(id);
      expect(bre2.getHits(id)).toBe(1);
    });

    it('should check direct', () => {
      bre2.publish('t1', 'alice', 'data', 'direct');
      expect(bre2.isDirect(bre2.getAllMessages()[0].id)).toBe(true);
    });

    it('should check fanout', () => {
      bre2.publish('t1', 'alice', 'data', 'fanout');
      expect(bre2.isFanout(bre2.getAllMessages()[0].id)).toBe(true);
    });

    it('should check topic', () => {
      bre2.publish('t1', 'alice', 'data', 'topic');
      expect(bre2.isTopic(bre2.getAllMessages()[0].id)).toBe(true);
    });
  });

  describe('subscribers', () => {
    it('should get subscribers', () => {
      bre2.subscribe('t1', 'sub1');
      expect(bre2.getSubscribers('t1')).toHaveLength(1);
    });

    it('should check has subscriber', () => {
      bre2.subscribe('t1', 'sub1');
      expect(bre2.hasSubscriber('t1', 'sub1')).toBe(true);
    });

    it('should return false for unknown subscriber check', () => {
      expect(bre2.hasSubscriber('t1', 'sub1')).toBe(false);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.setActive(id, false)).toBe(true);
    });

    it('should set topic', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.setTopic(id, 't2')).toBe(true);
    });

    it('should set sender', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.setSender(id, 'bob')).toBe(true);
    });

    it('should set payload', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.setPayload(id, 'new')).toBe(true);
    });

    it('should set mode', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.setMode(id, 'fanout')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bre2.setActive('unknown', false)).toBe(false);
      expect(bre2.setTopic('unknown', 't')).toBe(false);
      expect(bre2.setSender('unknown', 's')).toBe(false);
      expect(bre2.setPayload('unknown', 'p')).toBe(false);
      expect(bre2.setMode('unknown', 'direct')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = bre2.publish('t1', 'alice', 'data', 'direct');
      bre2.route(id);
      bre2.subscribe('t1', 'sub1');
      bre2.setActive(id, false);
      bre2.resetAll();
      expect(bre2.getDelivered(id)).toBe(0);
      expect(bre2.isActive(id)).toBe(true);
    });
  });

  describe('by mode / state', () => {
    it('should get by mode', () => {
      bre2.publish('t1', 'alice', 'data', 'direct');
      expect(bre2.getByMode('direct')).toHaveLength(1);
    });

    it('should get active', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getActiveMessages()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      bre2.setActive(id, false);
      expect(bre2.getInactiveMessages()).toHaveLength(1);
    });

    it('should get all topics', () => {
      bre2.publish('a', 'alice', 'data');
      bre2.publish('b', 'alice', 'data');
      expect(bre2.getAllTopics()).toHaveLength(2);
    });

    it('should get all subscribed topics', () => {
      bre2.subscribe('a', 'sub1');
      bre2.subscribe('b', 'sub2');
      expect(bre2.getAllSubscribedTopics()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getNewest()?.topic).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(bre2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getOldest()?.topic).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(bre2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = bre2.publish('t1', 'alice', 'data');
      expect(bre2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bre2.publish('t1', 'alice', 'data', 'direct');
      bre2.route(id);
      expect(bre2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total published', () => {
      bre2.publish('t1', 'alice', 'data');
      expect(bre2.getTotalPublished()).toBe(1);
    });

    it('should get total subscribed', () => {
      bre2.subscribe('t1', 'sub1');
      expect(bre2.getTotalSubscribed()).toBe(1);
    });

    it('should get total routed', () => {
      bre2.subscribe('t1', 'sub1');
      const id = bre2.publish('t1', 'alice', 'data', 'direct');
      bre2.route(id);
      expect(bre2.getTotalRouted()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many messages', () => {
      for (let i = 0; i < 50; i++) {
        bre2.publish(`t${i}`, 'alice', `p${i}`);
      }
      expect(bre2.getCount()).toBe(50);
    });
  });
});