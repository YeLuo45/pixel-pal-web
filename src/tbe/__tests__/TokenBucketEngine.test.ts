/**
 * TokenBucketEngine Tests
 * claude-code-design Token Bucket Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TokenBucketEngine } from '../TokenBucketEngine';

describe('TokenBucketEngine', () => {
  let tbe: TokenBucketEngine;

  beforeEach(() => {
    tbe = new TokenBucketEngine();
  });

  afterEach(() => {
    tbe.clearAll();
  });

  // ============================================================
  // create / consume / refill / remove
  // ============================================================
  describe('create / consume / refill / remove', () => {
    it('should create', () => {
      expect(tbe.create('b1', 100, 10)).toBe('tbe-1');
    });

    it('should default capacity to 100', () => {
      const id = tbe.create('b1');
      expect(tbe.getCapacity(id)).toBe(100);
    });

    it('should default refill rate to 10', () => {
      const id = tbe.create('b1');
      expect(tbe.getRefillRate(id)).toBe(10);
    });

    it('should start with full tokens', () => {
      const id = tbe.create('b1', 100, 10);
      expect(tbe.getTokens(id)).toBe(100);
    });

    it('should mark as active', () => {
      const id = tbe.create('b1', 100, 10);
      expect(tbe.isActive(id)).toBe(true);
    });

    it('should consume', () => {
      const id = tbe.create('b1', 100, 10);
      expect(tbe.consume(id, 10)).toBe(true);
    });

    it('should decrement tokens on consume', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 10);
      expect(tbe.getTokens(id)).toBe(90);
    });

    it('should not consume more than available', () => {
      const id = tbe.create('b1', 10, 10);
      expect(tbe.consume(id, 100)).toBe(false);
    });

    it('should not consume inactive', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.setActive(id, false);
      expect(tbe.consume(id, 10)).toBe(false);
    });

    it('should return false for unknown consume', () => {
      expect(tbe.consume('unknown', 10)).toBe(false);
    });

    it('should refill', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 50);
      expect(tbe.refill(id, 30)).toBe(true);
    });

    it('should increment tokens on refill', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 50);
      tbe.refill(id, 30);
      expect(tbe.getTokens(id)).toBe(80);
    });

    it('should not refill above capacity', () => {
      const id = tbe.create('b1', 100, 10);
      expect(tbe.refill(id, 50)).toBe(true);
      expect(tbe.getTokens(id)).toBe(100);
    });

    it('should not refill inactive', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.setActive(id, false);
      expect(tbe.refill(id, 10)).toBe(false);
    });

    it('should return false for unknown refill', () => {
      expect(tbe.refill('unknown', 10)).toBe(false);
    });

    it('should remove', () => {
      const id = tbe.create('b1', 100, 10);
      expect(tbe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tbe.create('b1', 100, 10);
      const stats = tbe.getStats();
      expect(stats.buckets).toBe(1);
    });

    it('should count total consumed', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 10);
      expect(tbe.getStats().totalConsumed).toBe(1);
    });

    it('should count total refilled', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.refill(id, 10);
      expect(tbe.getStats().totalRefilled).toBe(1);
    });

    it('should count active', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.setActive(id, false);
      expect(tbe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 10);
      expect(tbe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 100, 10);
      expect(tbe.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg capacity', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 200, 10);
      expect(tbe.getStats().avgCapacity).toBe(150);
    });

    it('should get max capacity', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 200, 10);
      expect(tbe.getStats().maxCapacity).toBe(200);
    });

    it('should get min capacity', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 200, 10);
      expect(tbe.getStats().minCapacity).toBe(100);
    });

    it('should compute avg tokens', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 200, 10);
      expect(tbe.getStats().avgTokens).toBe(150);
    });

    it('should get max tokens', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 200, 10);
      expect(tbe.getStats().maxTokens).toBe(200);
    });

    it('should get min tokens', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 200, 10);
      expect(tbe.getStats().minTokens).toBe(100);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get bucket', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getBucket('tbe-1')?.name).toBe('b1');
    });

    it('should get all', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getAllBuckets()).toHaveLength(1);
    });

    it('should check existence', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.hasBucket('tbe-1')).toBe(true);
    });

    it('should count', () => {
      expect(tbe.getCount()).toBe(0);
      tbe.create('b1', 100, 10);
      expect(tbe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getName('tbe-1')).toBe('b1');
    });

    it('should get history', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getHistory('tbe-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 10);
      expect(tbe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.setActive('tbe-1', false)).toBe(true);
    });

    it('should set capacity', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.setCapacity('tbe-1', 200)).toBe(true);
    });

    it('should clamp tokens on setCapacity', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.setCapacity(id, 50);
      expect(tbe.getTokens(id)).toBe(50);
    });

    it('should return false for unknown', () => {
      expect(tbe.setActive('unknown', false)).toBe(false);
      expect(tbe.setCapacity('unknown', 100)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 50);
      tbe.setActive(id, false);
      tbe.resetAll();
      expect(tbe.getTokens(id)).toBe(100);
      expect(tbe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get active', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getActiveBuckets()).toHaveLength(1);
    });

    it('should get inactive', () => {
      tbe.create('b1', 100, 10);
      tbe.setActive('tbe-1', false);
      expect(tbe.getInactiveBuckets()).toHaveLength(1);
    });

    it('should get all names', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 100, 10);
      expect(tbe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      tbe.create('a', 100, 10);
      expect(tbe.getNameCount()).toBe(1);
    });

    it('should get by min capacity', () => {
      tbe.create('a', 100, 10);
      tbe.create('b', 200, 10);
      expect(tbe.getByMinCapacity(150)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getNewest()?.id).toBe('tbe-1');
    });

    it('should return null for empty newest', () => {
      expect(tbe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getOldest()?.id).toBe('tbe-1');
    });

    it('should return null for empty oldest', () => {
      expect(tbe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tbe.create('b1', 100, 10);
      expect(tbe.getCreatedAt('tbe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 10);
      expect(tbe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total consumed', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.consume(id, 10);
      expect(tbe.getTotalConsumed()).toBe(1);
    });

    it('should get total refilled', () => {
      const id = tbe.create('b1', 100, 10);
      tbe.refill(id, 10);
      expect(tbe.getTotalRefilled()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many buckets', () => {
      for (let i = 0; i < 50; i++) {
        tbe.create(`b${i}`, 100, 10);
      }
      expect(tbe.getCount()).toBe(50);
    });
  });
});