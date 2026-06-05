/**
 * EventBus Tests
 * thunderbolt-design Event Bus
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../EventBus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  afterEach(() => {
    bus.clearAll();
  });

  // ============================================================
  // subscribe / publish
  // ============================================================
  describe('subscribe / publish', () => {
    it('should subscribe', () => {
      expect(bus.subscribe('topic1', () => {})).toBe('sub-1');
    });

    it('should publish', () => {
      bus.subscribe('topic1', () => {});
      expect(bus.publish('topic1', { x: 1 })).toBe(1);
    });

    it('should return 0 for no subscribers', () => {
      expect(bus.publish('topic1', {})).toBe(0);
    });

    it('should not publish to inactive', () => {
      const id = bus.subscribe('topic1', () => {});
      bus.setActive(id, false);
      expect(bus.publish('topic1', {})).toBe(0);
    });

    it('should pass data to handler', () => {
      let received: unknown = null;
      bus.subscribe('topic1', (d) => { received = d; });
      bus.publish('topic1', 'hello');
      expect(received).toBe('hello');
    });

    it('should call multiple subscribers', () => {
      let count = 0;
      bus.subscribe('topic1', () => count++);
      bus.subscribe('topic1', () => count++);
      bus.publish('topic1', {});
      expect(count).toBe(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      bus.subscribe('t1', () => {});
      const stats = bus.getStats();
      expect(stats.subscriptions).toBe(1);
    });

    it('should count topics', () => {
      bus.subscribe('t1', () => {});
      bus.subscribe('t2', () => {});
      expect(bus.getStats().topics).toBe(2);
    });

    it('should count published', () => {
      bus.subscribe('t1', () => {});
      bus.publish('t1', {});
      expect(bus.getStats().published).toBe(1);
    });

    it('should count total hits', () => {
      bus.subscribe('t1', () => {});
      bus.publish('t1', {});
      expect(bus.getStats().totalHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get subscription', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getSubscription('sub-1')?.topic).toBe('t1');
    });

    it('should get all', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getAllSubscriptions()).toHaveLength(1);
    });

    it('should remove', () => {
      bus.subscribe('t1', () => {});
      expect(bus.removeSubscription('sub-1')).toBe(true);
    });

    it('should check existence', () => {
      bus.subscribe('t1', () => {});
      expect(bus.hasSubscription('sub-1')).toBe(true);
    });

    it('should count', () => {
      expect(bus.getCount()).toBe(0);
      bus.subscribe('t1', () => {});
      expect(bus.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get topic', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getTopic('sub-1')).toBe('t1');
    });

    it('should get hits', () => {
      bus.subscribe('t1', () => {});
      bus.publish('t1', {});
      expect(bus.getHits('sub-1')).toBe(1);
    });

    it('should check isActive', () => {
      bus.subscribe('t1', () => {});
      expect(bus.isActive('sub-1')).toBe(true);
    });

    it('should set active', () => {
      const id = bus.subscribe('t1', () => {});
      expect(bus.setActive(id, false)).toBe(true);
    });

    it('should return false for unknown setActive', () => {
      expect(bus.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // unsubscribe
  // ============================================================
  describe('unsubscribe', () => {
    it('should unsubscribe', () => {
      const id = bus.subscribe('t1', () => {});
      expect(bus.unsubscribe(id)).toBe(true);
    });
  });

  // ============================================================
  // by topic
  // ============================================================
  describe('by topic', () => {
    it('should get by topic', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getByTopic('t1')).toHaveLength(1);
    });

    it('should get active', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getActiveSubscriptions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bus.subscribe('t1', () => {});
      bus.setActive(id, false);
      expect(bus.getInactiveSubscriptions()).toHaveLength(1);
    });

    it('should get all topics', () => {
      bus.subscribe('t1', () => {});
      bus.subscribe('t2', () => {});
      expect(bus.getAllTopics()).toHaveLength(2);
    });

    it('should get topic count', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getTopicCount()).toBe(1);
    });

    it('should count subscriptions for topic', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getSubscriptionsForTopic('t1')).toBe(1);
    });

    it('should get published count', () => {
      bus.subscribe('t1', () => {});
      bus.publish('t1', {});
      expect(bus.getPublishedCount()).toBe(1);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      bus.subscribe('t1', () => {});
      bus.publish('t1', {});
      bus.resetHits();
      expect(bus.getHits('sub-1')).toBe(0);
    });

    it('should reset published', () => {
      bus.subscribe('t1', () => {});
      bus.publish('t1', {});
      bus.resetPublished();
      expect(bus.getPublishedCount()).toBe(0);
    });

    it('should reset all', () => {
      bus.subscribe('t1', () => {});
      bus.publish('t1', {});
      bus.resetAll();
      expect(bus.getHits('sub-1')).toBe(0);
      expect(bus.getPublishedCount()).toBe(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      bus.subscribe('t1', () => {});
      bus.publish('t1', {});
      expect(bus.getMostHit()?.id).toBe('sub-1');
    });

    it('should return null for empty most', () => {
      expect(bus.getMostHit()).toBeNull();
    });

    it('should get newest', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getNewest()?.id).toBe('sub-1');
    });

    it('should return null for empty newest', () => {
      expect(bus.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getOldest()?.id).toBe('sub-1');
    });

    it('should return null for empty oldest', () => {
      expect(bus.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      bus.subscribe('t1', () => {});
      expect(bus.getCreatedAt('sub-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many subscriptions', () => {
      for (let i = 0; i < 50; i++) {
        bus.subscribe(`t${i}`, () => {});
      }
      expect(bus.getCount()).toBe(50);
    });
  });
});