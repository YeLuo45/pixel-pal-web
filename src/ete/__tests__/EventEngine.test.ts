/**
 * EventEngine Tests
 * thunderbolt-design Event Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventEngine } from '../EventEngine';

describe('EventEngine', () => {
  let ete: EventEngine;

  beforeEach(() => {
    ete = new EventEngine();
  });

  afterEach(() => {
    ete.clearAll();
  });

  // ============================================================
  // subscribe / publish / unsubscribe / remove
  // ============================================================
  describe('subscribe / publish / unsubscribe / remove', () => {
    it('should subscribe', () => {
      expect(ete.subscribe('click', 'handler1')).toBe('ete-1');
    });

    it('should mark as active', () => {
      const id = ete.subscribe('click', 'handler1');
      expect(ete.isActive(id)).toBe(true);
    });

    it('should publish', () => {
      ete.subscribe('click', 'handler1');
      expect(ete.publish('click')).toBe(1);
    });

    it('should return 0 for no subscribers', () => {
      expect(ete.publish('click')).toBe(0);
    });

    it('should publish to multiple subscribers', () => {
      ete.subscribe('click', 'h1');
      ete.subscribe('click', 'h2');
      expect(ete.publish('click')).toBe(2);
    });

    it('should only publish to matching event', () => {
      ete.subscribe('click', 'h1');
      ete.subscribe('hover', 'h2');
      expect(ete.publish('click')).toBe(1);
    });

    it('should not publish to inactive', () => {
      const id = ete.subscribe('click', 'h1');
      ete.setActive(id, false);
      expect(ete.publish('click')).toBe(0);
    });

    it('should unsubscribe', () => {
      const id = ete.subscribe('click', 'h1');
      expect(ete.unsubscribe(id)).toBe(true);
    });

    it('should return false for unknown unsubscribe', () => {
      expect(ete.unsubscribe('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ete.subscribe('click', 'h1');
      expect(ete.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ete.subscribe('click', 'h1');
      const stats = ete.getStats();
      expect(stats.subscribers).toBe(1);
    });

    it('should count total published', () => {
      ete.subscribe('click', 'h1');
      ete.publish('click');
      expect(ete.getStats().totalPublished).toBe(1);
    });

    it('should count total received', () => {
      ete.subscribe('click', 'h1');
      ete.publish('click');
      expect(ete.getStats().totalReceived).toBe(1);
    });

    it('should count active', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ete.subscribe('click', 'h1');
      ete.setActive(id, false);
      expect(ete.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      ete.subscribe('click', 'h1');
      ete.publish('click');
      expect(ete.getStats().totalHits).toBe(1);
    });

    it('should count unique events', () => {
      ete.subscribe('a', 'h1');
      ete.subscribe('b', 'h1');
      expect(ete.getStats().uniqueEvents).toBe(2);
    });

    it('should count unique callbacks', () => {
      ete.subscribe('a', 'h1');
      ete.subscribe('b', 'h2');
      expect(ete.getStats().uniqueCallbacks).toBe(2);
    });

    it('should compute avg hits', () => {
      const id = ete.subscribe('click', 'h1');
      ete.publish('click');
      ete.publish('click');
      expect(ete.getStats().avgHits).toBe(2);
    });

    it('should get max hits', () => {
      const id = ete.subscribe('click', 'h1');
      ete.publish('click');
      ete.publish('click');
      expect(ete.getStats().maxHits).toBe(2);
    });

    it('should get min hits', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getStats().minHits).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get subscriber', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getSubscriber('ete-1')?.event).toBe('click');
    });

    it('should get all', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getAllSubscribers()).toHaveLength(1);
    });

    it('should check existence', () => {
      ete.subscribe('click', 'h1');
      expect(ete.hasSubscriber('ete-1')).toBe(true);
    });

    it('should count', () => {
      expect(ete.getCount()).toBe(0);
      ete.subscribe('click', 'h1');
      expect(ete.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get event', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getEvent('ete-1')).toBe('click');
    });

    it('should get callback', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getCallback('ete-1')).toBe('h1');
    });

    it('should get hits', () => {
      ete.subscribe('click', 'h1');
      ete.publish('click');
      expect(ete.getHits('ete-1')).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ete.subscribe('click', 'h1');
      expect(ete.setActive('ete-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ete.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ete.subscribe('click', 'h1');
      ete.publish('click');
      ete.setActive(id, false);
      ete.resetAll();
      expect(ete.getHits(id)).toBe(0);
      expect(ete.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by event / callback / state
  // ============================================================
  describe('by event / callback / state', () => {
    it('should get by event', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getByEvent('click')).toHaveLength(1);
    });

    it('should get by callback', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getByCallback('h1')).toHaveLength(1);
    });

    it('should get active', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getActiveSubscribers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ete.subscribe('click', 'h1');
      ete.setActive('ete-1', false);
      expect(ete.getInactiveSubscribers()).toHaveLength(1);
    });

    it('should get all events', () => {
      ete.subscribe('a', 'h1');
      ete.subscribe('b', 'h1');
      expect(ete.getAllEvents()).toHaveLength(2);
    });

    it('should get all callbacks', () => {
      ete.subscribe('a', 'h1');
      ete.subscribe('b', 'h2');
      expect(ete.getAllCallbacks()).toHaveLength(2);
    });

    it('should get event count', () => {
      ete.subscribe('click', 'h1');
      ete.publish('click');
      ete.publish('click');
      expect(ete.getEventCount('click')).toBe(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getNewest()?.id).toBe('ete-1');
    });

    it('should return null for empty newest', () => {
      expect(ete.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getOldest()?.id).toBe('ete-1');
    });

    it('should return null for empty oldest', () => {
      expect(ete.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ete.subscribe('click', 'h1');
      expect(ete.getCreatedAt('ete-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      ete.subscribe('click', 'h1');
      ete.publish('click');
      expect(ete.getUpdatedAt('ete-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total published', () => {
      ete.subscribe('click', 'h1');
      ete.publish('click');
      expect(ete.getTotalPublished()).toBe(1);
    });

    it('should get total received', () => {
      ete.subscribe('click', 'h1');
      ete.publish('click');
      expect(ete.getTotalReceived()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many subscribers', () => {
      for (let i = 0; i < 50; i++) {
        ete.subscribe(`e${i}`, `h${i}`);
      }
      expect(ete.getCount()).toBe(50);
    });
  });
});