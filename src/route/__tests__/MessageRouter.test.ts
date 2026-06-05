/**
 * MessageRouter Tests
 * chatdev-design Message Router
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageRouter } from '../MessageRouter';

describe('MessageRouter', () => {
  let router: MessageRouter;

  beforeEach(() => {
    router = new MessageRouter();
  });

  afterEach(() => {
    router.clearAll();
  });

  // ============================================================
  // register / route
  // ============================================================
  describe('register / route', () => {
    it('should register', () => {
      expect(router.register('hello', 'handler1')).toBe('rt-1');
    });

    it('should route matching', () => {
      router.register('hello', 'handler1');
      expect(router.route('hello world')).toBe('handler1');
    });

    it('should return null for unmatched', () => {
      router.register('hello', 'handler1');
      expect(router.route('goodbye')).toBeNull();
    });

    it('should increment hits on route', () => {
      router.register('hello', 'handler1');
      router.route('hello');
      expect(router.getStats().totalHits).toBe(1);
    });

    it('should increment unmatched', () => {
      router.register('hello', 'handler1');
      router.route('xyz');
      expect(router.getUnmatchedCount()).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      router.register('a', 'h1');
      const stats = router.getStats();
      expect(stats.routes).toBe(1);
    });

    it('should count destinations', () => {
      router.register('a', 'h1');
      router.register('b', 'h2');
      expect(router.getStats().destinations).toBe(2);
    });

    it('should compute avg hits', () => {
      router.register('a', 'h1');
      router.route('a');
      expect(router.getStats().avgHits).toBe(1);
    });

    it('should return 0 for empty avg', () => {
      expect(router.getStats().avgHits).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get route', () => {
      router.register('a', 'h1');
      expect(router.getRoute('rt-1')?.pattern).toBe('a');
    });

    it('should get all', () => {
      router.register('a', 'h1');
      expect(router.getAllRoutes()).toHaveLength(1);
    });

    it('should remove', () => {
      router.register('a', 'h1');
      expect(router.removeRoute('rt-1')).toBe(true);
    });

    it('should check existence', () => {
      router.register('a', 'h1');
      expect(router.hasRoute('rt-1')).toBe(true);
    });

    it('should count', () => {
      expect(router.getCount()).toBe(0);
      router.register('a', 'h1');
      expect(router.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get pattern', () => {
      router.register('hello', 'h1');
      expect(router.getPattern('rt-1')).toBe('hello');
    });

    it('should get destination', () => {
      router.register('hello', 'h1');
      expect(router.getDestination('rt-1')).toBe('h1');
    });

    it('should get hits', () => {
      router.register('a', 'h1');
      router.route('a');
      expect(router.getHits('rt-1')).toBe(1);
    });

    it('should get created at', () => {
      router.register('a', 'h1');
      expect(router.getCreatedAt('rt-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set pattern', () => {
      const id = router.register('a', 'h1');
      expect(router.setPattern(id, 'b')).toBe(true);
    });

    it('should set destination', () => {
      const id = router.register('a', 'h1');
      expect(router.setDestination(id, 'h2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(router.setPattern('unknown', 'a')).toBe(false);
      expect(router.setDestination('unknown', 'h')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      router.register('a', 'h1');
      router.route('a');
      router.resetHits();
      expect(router.getHits('rt-1')).toBe(0);
    });

    it('should reset unmatched', () => {
      router.register('a', 'h1');
      router.route('xyz');
      router.resetUnmatched();
      expect(router.getUnmatchedCount()).toBe(0);
    });

    it('should reset all', () => {
      router.register('a', 'h1');
      router.route('a');
      router.route('xyz');
      router.resetAll();
      expect(router.getHits('rt-1')).toBe(0);
      expect(router.getUnmatchedCount()).toBe(0);
    });
  });

  // ============================================================
  // by pattern / destination
  // ============================================================
  describe('by pattern / destination', () => {
    it('should get by pattern', () => {
      router.register('a', 'h1');
      expect(router.getByPattern('a')).toHaveLength(1);
    });

    it('should get by destination', () => {
      router.register('a', 'h1');
      expect(router.getByDestination('h1')).toHaveLength(1);
    });

    it('should get all destinations', () => {
      router.register('a', 'h1');
      router.register('b', 'h2');
      expect(router.getAllDestinations()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      router.register('a', 'h1');
      router.route('a');
      expect(router.getMostHit()?.id).toBe('rt-1');
    });

    it('should return null for empty most', () => {
      expect(router.getMostHit()).toBeNull();
    });

    it('should get least hit', () => {
      router.register('a', 'h1');
      expect(router.getLeastHit()?.id).toBe('rt-1');
    });

    it('should return null for empty least', () => {
      expect(router.getLeastHit()).toBeNull();
    });

    it('should get newest', () => {
      router.register('a', 'h1');
      expect(router.getNewest()?.id).toBe('rt-1');
    });

    it('should return null for empty newest', () => {
      expect(router.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      router.register('a', 'h1');
      expect(router.getOldest()?.id).toBe('rt-1');
    });

    it('should return null for empty oldest', () => {
      expect(router.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many routes', () => {
      for (let i = 0; i < 50; i++) {
        router.register(`p${i}`, 'h');
      }
      expect(router.getCount()).toBe(50);
    });
  });
});