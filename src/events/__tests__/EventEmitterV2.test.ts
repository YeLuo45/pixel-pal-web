/**
 * EventEmitterV2 Tests
 * thunderbolt-design Event Emitter v2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitterV2 } from '../EventEmitterV2';

describe('EventEmitterV2', () => {
  let emitter: EventEmitterV2;

  beforeEach(() => {
    emitter = new EventEmitterV2();
  });

  afterEach(() => {
    emitter.clearAll();
  });

  // ============================================================
  // on / emit
  // ============================================================
  describe('on / emit', () => {
    it('should call handler on emit', () => {
      const handler = vi.fn();
      emitter.on('test', handler);
      emitter.emit('test', 'data');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should pass event data to handler', () => {
      const handler = vi.fn();
      emitter.on('test', handler);
      emitter.emit('test', 'hello');
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: 'test', data: 'hello' }));
    });

    it('should support multiple handlers', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      emitter.on('test', h1);
      emitter.on('test', h2);
      emitter.emit('test', 'data');
      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).toHaveBeenCalledTimes(1);
    });

    it('should not call unrelated handlers', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      emitter.on('type1', h1);
      emitter.on('type2', h2);
      emitter.emit('type1', 'data');
      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // off
  // ============================================================
  describe('off', () => {
    it('should remove handler', () => {
      const handler = vi.fn();
      emitter.on('test', handler);
      emitter.off('test', handler);
      emitter.emit('test', 'data');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // onAny / offAny
  // ============================================================
  describe('onAny / offAny', () => {
    it('should call wildcard handler for any event', () => {
      const handler = vi.fn();
      emitter.onAny(handler);
      emitter.emit('type1', 'data1');
      emitter.emit('type2', 'data2');
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should remove wildcard handler', () => {
      const handler = vi.fn();
      emitter.onAny(handler);
      emitter.offAny(handler);
      emitter.emit('type1', 'data');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // history
  // ============================================================
  describe('history', () => {
    it('should track history', () => {
      emitter.emit('t1', 'd1');
      emitter.emit('t2', 'd2');
      expect(emitter.getHistoryCount()).toBe(2);
    });

    it('should filter history by type', () => {
      emitter.emit('t1', 'd1');
      emitter.emit('t2', 'd2');
      emitter.emit('t1', 'd3');
      expect(emitter.getHistory('t1')).toHaveLength(2);
    });

    it('should clear history', () => {
      emitter.emit('t1', 'd1');
      emitter.clearHistory();
      expect(emitter.getHistoryCount()).toBe(0);
    });
  });

  // ============================================================
  // listenerCount / hasListeners
  // ============================================================
  describe('listenerCount / hasListeners', () => {
    it('should count listeners', () => {
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(2);
    });

    it('should return 0 for no listeners', () => {
      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('should check hasListeners', () => {
      emitter.on('test', () => {});
      expect(emitter.hasListeners('test')).toBe(true);
    });
  });

  // ============================================================
  // getEventTypes
  // ============================================================
  describe('getEventTypes', () => {
    it('should return all types', () => {
      emitter.on('t1', () => {});
      emitter.on('t2', () => {});
      expect(emitter.getEventTypes()).toHaveLength(2);
    });
  });

  // ============================================================
  // removeAllListeners
  // ============================================================
  describe('removeAllListeners', () => {
    it('should remove all listeners for type', () => {
      emitter.on('test', () => {});
      emitter.removeAllListeners('test');
      expect(emitter.listenerCount('test')).toBe(0);
    });

    it('should remove all listeners', () => {
      emitter.on('t1', () => {});
      emitter.on('t2', () => {});
      emitter.removeAllListeners();
      expect(emitter.getEventTypes()).toHaveLength(0);
    });
  });

  // ============================================================
  // maxHistory
  // ============================================================
  describe('maxHistory', () => {
    it('should set max history', () => {
      emitter.setMaxHistory(100);
      expect(emitter.getMaxHistory()).toBe(100);
    });

    it('should clamp to >= 0', () => {
      emitter.setMaxHistory(-1);
      expect(emitter.getMaxHistory()).toBe(0);
    });

    it('should trim history when over max', () => {
      emitter.setMaxHistory(5);
      for (let i = 0; i < 10; i++) emitter.emit('t', i);
      expect(emitter.getHistoryCount()).toBe(5);
    });
  });

  // ============================================================
  // getEventByType
  // ============================================================
  describe('getEventByType', () => {
    it('should count by type', () => {
      emitter.emit('t1', 'd');
      emitter.emit('t1', 'd');
      emitter.emit('t2', 'd');
      expect(emitter.getEventByType('t1')).toBe(2);
    });
  });

  // ============================================================
  // getFirstEvent / getLastEvent
  // ============================================================
  describe('getFirstEvent / getLastEvent', () => {
    it('should get first event', () => {
      emitter.emit('t', 'first');
      emitter.emit('t', 'last');
      expect(emitter.getFirstEvent()?.data).toBe('first');
    });

    it('should get last event', () => {
      emitter.emit('t', 'first');
      emitter.emit('t', 'last');
      expect(emitter.getLastEvent()?.data).toBe('last');
    });

    it('should filter by type', () => {
      emitter.emit('t1', 'd1');
      emitter.emit('t2', 'd2');
      expect(emitter.getFirstEvent('t1')?.data).toBe('d1');
    });

    it('should return undefined for empty', () => {
      expect(emitter.getFirstEvent()).toBeUndefined();
    });
  });

  // ============================================================
  // getWildcardCount
  // ============================================================
  describe('getWildcardCount', () => {
    it('should count wildcard handlers', () => {
      emitter.onAny(() => {});
      emitter.onAny(() => {});
      expect(emitter.getWildcardCount()).toBe(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many events', () => {
      for (let i = 0; i < 100; i++) {
        emitter.emit('t', i);
      }
      expect(emitter.getHistoryCount()).toBe(100);
    });

    it('should handle handler errors gracefully', () => {
      const goodHandler = vi.fn();
      emitter.on('test', () => { throw new Error('boom'); });
      emitter.on('test', goodHandler);
      emitter.emit('test', 'data');
      expect(goodHandler).toHaveBeenCalled();
    });
  });
});