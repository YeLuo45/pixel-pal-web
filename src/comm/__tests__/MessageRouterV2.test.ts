/**
 * MessageRouterV2 Tests
 * chatdev-design Message Router v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageRouterV2 } from '../MessageRouterV2';

describe('MessageRouterV2', () => {
  let router: MessageRouterV2;

  beforeEach(() => {
    router = new MessageRouterV2();
  });

  afterEach(() => {
    router.clearAll();
  });

  // ============================================================
  // route
  // ============================================================
  describe('route', () => {
    it('should route valid message', () => {
      const result = router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(result).toBe(true);
    });

    it('should fail disallowed message', () => {
      router.addRoute('b', ['c']);
      const result = router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(result).toBe(false);
    });

    it('should auto-generate id when missing', () => {
      const result = router.route({ id: '', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(result).toBe(true);
    });

    it('should track delivered', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(router.getDeliveredCount()).toBe(1);
    });

    it('should track failed', () => {
      router.addRoute('b', ['c']);
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(router.getFailedCount()).toBe(1);
    });
  });

  // ============================================================
  // transform
  // ============================================================
  describe('transform', () => {
    it('should transform message', () => {
      const result = router.transform(
        { id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' },
        m => ({ ...m, payload: 'transformed' })
      );
      expect(result.payload).toBe('transformed');
    });

    it('should not mutate original', () => {
      const orig = { id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' as const };
      const result = router.transform(orig, m => ({ ...m, payload: 'x' }));
      expect(orig.payload).toBe('data');
      expect(result.payload).toBe('x');
    });
  });

  // ============================================================
  // queue / flush
  // ============================================================
  describe('queue / flush', () => {
    it('should queue message', () => {
      router.queue({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(router.getQueueSize()).toBe(1);
    });

    it('should flush queue', () => {
      router.queue({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      router.queue({ id: 'm2', from: 'a', to: 'b', payload: 'data', timestamp: 1001, status: 'pending' });
      const items = router.flush();
      expect(items).toHaveLength(2);
      expect(router.getQueueSize()).toBe(0);
    });

    it('should not expose internal queue', () => {
      router.queue({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      const peek = router.peekQueue();
      peek.push({ id: 'fake', from: 'x', to: 'y', payload: 'x', timestamp: 0, status: 'pending' });
      expect(router.getQueueSize()).toBe(1);
    });
  });

  // ============================================================
  // getTrackedMessages
  // ============================================================
  describe('getTrackedMessages', () => {
    it('should return tracked messages', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(router.getTrackedMessages()).toHaveLength(1);
    });

    it('should not expose internal array', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      const tracked = router.getTrackedMessages();
      tracked.push({ id: 'fake', from: 'x', to: 'y', payload: 'x', timestamp: 0, status: 'pending' });
      expect(router.getTrackedCount()).toBe(1);
    });
  });

  // ============================================================
  // routes
  // ============================================================
  describe('routes', () => {
    it('should add route', () => {
      router.addRoute('b', ['a']);
      expect(router.hasRoute('b')).toBe(true);
    });

    it('should remove route', () => {
      router.addRoute('b', ['a']);
      expect(router.removeRoute('b')).toBe(true);
    });

    it('should return false for unknown route', () => {
      expect(router.removeRoute('unknown')).toBe(false);
    });

    it('should check isAllowed', () => {
      router.addRoute('b', ['a']);
      expect(router.isAllowed('a', 'b')).toBe(true);
      expect(router.isAllowed('c', 'b')).toBe(false);
    });

    it('should allow if no restrictions', () => {
      expect(router.isAllowed('a', 'b')).toBe(true);
    });

    it('should add allowed sender', () => {
      router.addRoute('b', []);
      router.addAllowedSender('b', 'a');
      expect(router.isAllowed('a', 'b')).toBe(true);
    });

    it('should remove allowed sender', () => {
      router.addRoute('b', ['a']);
      expect(router.removeAllowedSender('b', 'a')).toBe(true);
      expect(router.isAllowed('a', 'b')).toBe(false);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get by from', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      router.route({ id: 'm2', from: 'a', to: 'c', payload: 'data', timestamp: 1001, status: 'pending' });
      expect(router.getMessagesByFrom('a')).toHaveLength(2);
    });

    it('should get by to', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(router.getMessagesByTo('b')).toHaveLength(1);
    });

    it('should get by status', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(router.getMessagesByStatus('delivered')).toHaveLength(1);
    });

    it('should get by id', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      expect(router.getMessageById('m1')?.from).toBe('a');
    });

    it('should return undefined for unknown id', () => {
      expect(router.getMessageById('unknown')).toBeUndefined();
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear tracked', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      router.clearTracked();
      expect(router.getTrackedCount()).toBe(0);
    });

    it('should clear queue', () => {
      router.queue({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      router.clearQueue();
      expect(router.getQueueSize()).toBe(0);
    });
  });

  // ============================================================
  // getSuccessRate
  // ============================================================
  describe('getSuccessRate', () => {
    it('should return 0 for empty', () => {
      expect(router.getSuccessRate()).toBe(0);
    });

    it('should calculate rate', () => {
      router.route({ id: 'm1', from: 'a', to: 'b', payload: 'data', timestamp: 1000, status: 'pending' });
      router.addRoute('b', ['c']);
      router.route({ id: 'm2', from: 'a', to: 'b', payload: 'data', timestamp: 1001, status: 'pending' });
      expect(router.getSuccessRate()).toBe(0.5);
    });
  });

  // ============================================================
  // getAllowedSenders / hasRoute / getRouteCount
  // ============================================================
  describe('route queries', () => {
    it('should get allowed senders', () => {
      router.addRoute('b', ['a', 'c']);
      expect(router.getAllowedSenders('b')).toHaveLength(2);
    });

    it('should return empty for unknown', () => {
      expect(router.getAllowedSenders('unknown')).toHaveLength(0);
    });

    it('should get route count', () => {
      router.addRoute('b', ['a']);
      router.addRoute('c', ['a']);
      expect(router.getRouteCount()).toBe(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many messages', () => {
      for (let i = 0; i < 100; i++) {
        router.route({ id: `m${i}`, from: 'a', to: 'b', payload: 'data', timestamp: 1000 + i, status: 'pending' });
      }
      expect(router.getTrackedCount()).toBe(100);
    });
  });
});