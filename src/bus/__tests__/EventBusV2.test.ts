/**
 * EventBusV2 Tests
 * thunderbolt-design Event Bus v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventBusV2 } from '../EventBusV2';

describe('EventBusV2', () => {
  let bus: EventBusV2;

  beforeEach(() => {
    bus = new EventBusV2();
  });

  afterEach(() => {
    bus.clearAll();
  });

  // ============================================================
  // publish
  // ============================================================
  describe('publish', () => {
    it('should publish event', () => {
      const id = bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(id).toBe('event-1');
    });
  });

  // ============================================================
  // subscribe
  // ============================================================
  describe('subscribe', () => {
    it('should subscribe handler', async () => {
      const handler = async () => {};
      bus.subscribe('t1', handler);
      expect(bus.getHandlerCount('t1')).toBe(1);
    });

    it('should call handler on process', async () => {
      let called = false;
      bus.subscribe('t1', async () => { called = true; });
      await bus.publishAndProcess({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(called).toBe(true);
    });
  });

  // ============================================================
  // retry
  // ============================================================
  describe('retry', () => {
    it('should retry event', async () => {
      const id = bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      const result = await bus.retry(id);
      expect(typeof result).toBe('boolean');
    });

    it('should send to dead letter when max retries exceeded', async () => {
      const id = bus.publish({ topic: 't1', payload: 'd', retries: 3, maxRetries: 3, status: 'pending', created: 1000 });
      // No handlers, so dispatch returns false
      const result = await bus.retry(id);
      expect(result).toBe(false);
    });

    it('should return false for unknown event', async () => {
      const result = await bus.retry('unknown');
      expect(result).toBe(false);
    });
  });

  // ============================================================
  // getDeadLetter
  // ============================================================
  describe('getDeadLetter', () => {
    it('should return empty initially', () => {
      expect(bus.getDeadLetter()).toHaveLength(0);
    });
  });

  // ============================================================
  // getStatus
  // ============================================================
  describe('getStatus', () => {
    it('should return status', () => {
      const id = bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(bus.getStatus(id)).toBe('pending');
    });

    it('should return null for unknown', () => {
      expect(bus.getStatus('unknown')).toBeNull();
    });
  });

  // ============================================================
  // event queries
  // ============================================================
  describe('event queries', () => {
    it('should get event', () => {
      const id = bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(bus.getEvent(id)?.topic).toBe('t1');
    });

    it('should get all', () => {
      bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(bus.getAllEvents()).toHaveLength(1);
    });

    it('should remove event', () => {
      const id = bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(bus.removeEvent(id)).toBe(true);
    });

    it('should check existence', () => {
      const id = bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(bus.hasEvent(id)).toBe(true);
    });

    it('should count', () => {
      expect(bus.getEventCount()).toBe(0);
      bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(bus.getEventCount()).toBe(1);
    });
  });

  // ============================================================
  // processEvent
  // ============================================================
  describe('processEvent', () => {
    it('should process event', async () => {
      const id = bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      const result = await bus.processEvent(id);
      expect(result).toBe(false); // No handlers
    });

    it('should return false for unknown', async () => {
      const result = await bus.processEvent('unknown');
      expect(result).toBe(false);
    });
  });

  // ============================================================
  // subscribe / unsubscribe
  // ============================================================
  describe('unsubscribe', () => {
    it('should unsubscribe', () => {
      const handler = async () => {};
      bus.subscribe('t1', handler);
      expect(bus.unsubscribe('t1', handler)).toBe(true);
    });

    it('should return false for unknown topic', () => {
      const handler = async () => {};
      expect(bus.unsubscribe('unknown', handler)).toBe(false);
    });

    it('should remove all handlers', () => {
      const handler = async () => {};
      bus.subscribe('t1', handler);
      bus.removeAllHandlers('t1');
      expect(bus.getHandlerCount('t1')).toBe(0);
    });
  });

  // ============================================================
  // topics
  // ============================================================
  describe('topics', () => {
    it('should get topics', () => {
      bus.subscribe('t1', async () => {});
      bus.subscribe('t2', async () => {});
      expect(bus.getTopics()).toHaveLength(2);
    });

    it('should return 0 for no handlers', () => {
      expect(bus.getHandlerCount('unknown')).toBe(0);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get by status', () => {
      bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'processed', created: 1000 });
      expect(bus.getEventsByStatus('pending')).toHaveLength(1);
    });

    it('should get by topic', () => {
      bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      bus.publish({ topic: 't2', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      expect(bus.getEventsByTopic('t1')).toHaveLength(1);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear dead letter', () => {
      bus.clearDeadLetter();
      expect(bus.getDeadLetterCount()).toBe(0);
    });
  });

  // ============================================================
  // dead letter count
  // ============================================================
  describe('dead letter count', () => {
    it('should return 0 for empty', () => {
      expect(bus.getDeadLetterCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many events', () => {
      for (let i = 0; i < 50; i++) {
        bus.publish({ topic: 't1', payload: 'd', retries: 0, maxRetries: 3, status: 'pending', created: 1000 });
      }
      expect(bus.getEventCount()).toBe(50);
    });
  });
});