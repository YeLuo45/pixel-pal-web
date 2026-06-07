/**
 * SubscriptionEngine Tests
 * nanobot-design Subscription Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SubscriptionEngine } from '../SubscriptionEngine';

describe('SubscriptionEngine', () => {
  let sue: SubscriptionEngine;

  beforeEach(() => {
    sue = new SubscriptionEngine();
  });

  afterEach(() => {
    sue.clearAll();
  });

  describe('subscribe / notify / unsubscribe / remove', () => {
    it('should subscribe', () => {
      expect(sue.subscribe('topic1', 'sub1')).toBe('sue-1');
    });

    it('should mark as active', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.isActive('sue-1')).toBe(true);
    });

    it('should notify', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.notify('topic1')).toBe(1);
    });

    it('should return 0 for no subscribers', () => {
      expect(sue.notify('topic1')).toBe(0);
    });

    it('should notify to multiple', () => {
      sue.subscribe('topic1', 'sub1');
      sue.subscribe('topic1', 'sub2');
      expect(sue.notify('topic1')).toBe(2);
    });

    it('should only notify matching topic', () => {
      sue.subscribe('topic1', 'sub1');
      sue.subscribe('topic2', 'sub2');
      expect(sue.notify('topic1')).toBe(1);
    });

    it('should not notify inactive', () => {
      sue.subscribe('topic1', 'sub1');
      sue.setActive('sue-1', false);
      expect(sue.notify('topic1')).toBe(0);
    });

    it('should unsubscribe', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.unsubscribe('sue-1')).toBe(true);
    });

    it('should return false for unknown unsubscribe', () => {
      expect(sue.unsubscribe('unknown')).toBe(false);
    });

    it('should remove', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.remove('sue-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getStats().subscriptions).toBe(1);
    });

    it('should count total delivered', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getStats().totalDelivered).toBe(1);
    });

    it('should count active', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      sue.subscribe('topic1', 'sub1');
      sue.setActive('sue-1', false);
      expect(sue.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getStats().totalHits).toBe(1);
    });

    it('should count unique topics', () => {
      sue.subscribe('a', 'sub1');
      sue.subscribe('b', 'sub1');
      expect(sue.getStats().uniqueTopics).toBe(2);
    });

    it('should count unique subscribers', () => {
      sue.subscribe('topic1', 'a');
      sue.subscribe('topic2', 'a');
      expect(sue.getStats().uniqueSubscribers).toBe(1);
    });

    it('should count total delivered2', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getStats().totalDelivered2).toBe(1);
    });

    it('should compute avg delivered', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getStats().avgDelivered).toBe(1);
    });

    it('should get max delivered', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getStats().maxDelivered).toBe(1);
    });

    it('should get min delivered', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getStats().minDelivered).toBe(0);
    });
  });

  describe('queries', () => {
    it('should get sub', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getSub('sue-1')?.topic).toBe('topic1');
    });

    it('should get all', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getAllSubs()).toHaveLength(1);
    });

    it('should check existence', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.hasSub('sue-1')).toBe(true);
    });

    it('should count', () => {
      expect(sue.getCount()).toBe(0);
      sue.subscribe('topic1', 'sub1');
      expect(sue.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get topic', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getTopic('sue-1')).toBe('topic1');
    });

    it('should get subscriber', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getSubscriber('sue-1')).toBe('sub1');
    });

    it('should get delivered', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getDelivered('sue-1')).toBe(1);
    });

    it('should get hits', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getHits('sue-1')).toBe(1);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.setActive('sue-1', false)).toBe(true);
    });

    it('should set topic', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.setTopic('sue-1', 'topic2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sue.setActive('unknown', false)).toBe(false);
      expect(sue.setTopic('unknown', 't')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      sue.setActive('sue-1', false);
      sue.resetAll();
      expect(sue.getDelivered('sue-1')).toBe(0);
      expect(sue.isActive('sue-1')).toBe(true);
    });
  });

  describe('by topic / subscriber / state', () => {
    it('should get by topic', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getByTopic('topic1')).toHaveLength(1);
    });

    it('should get by subscriber', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getBySubscriber('sub1')).toHaveLength(1);
    });

    it('should get active', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getActiveSubs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sue.subscribe('topic1', 'sub1');
      sue.setActive('sue-1', false);
      expect(sue.getInactiveSubs()).toHaveLength(1);
    });

    it('should get all topics', () => {
      sue.subscribe('a', 'sub1');
      sue.subscribe('b', 'sub1');
      expect(sue.getAllTopics()).toHaveLength(2);
    });

    it('should get all subscribers', () => {
      sue.subscribe('topic1', 'a');
      sue.subscribe('topic2', 'b');
      expect(sue.getAllSubscribers()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getNewest()?.id).toBe('sue-1');
    });

    it('should return null for empty newest', () => {
      expect(sue.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getOldest()?.id).toBe('sue-1');
    });

    it('should return null for empty oldest', () => {
      expect(sue.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      sue.subscribe('topic1', 'sub1');
      expect(sue.getCreatedAt('sue-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getUpdatedAt('sue-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total delivered', () => {
      sue.subscribe('topic1', 'sub1');
      sue.notify('topic1');
      expect(sue.getTotalDelivered()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many subs', () => {
      for (let i = 0; i < 50; i++) {
        sue.subscribe(`t${i}`, `s${i}`);
      }
      expect(sue.getCount()).toBe(50);
    });
  });
});