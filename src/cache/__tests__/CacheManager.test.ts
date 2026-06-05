/**
 * CacheManager Tests
 * claude-code-design Cache Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../CacheManager';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager(100, 0, 'lru');
  });

  afterEach(() => {
    cache.clear();
  });

  // ============================================================
  // set / get
  // ============================================================
  describe('set / get', () => {
    it('should set and get', () => {
      cache.set('k1', 'v1');
      expect(cache.get('k1')).toBe('v1');
    });

    it('should return undefined for missing', () => {
      expect(cache.get('unknown')).toBeUndefined();
    });

    it('should overwrite existing', () => {
      cache.set('k1', 'v1');
      cache.set('k1', 'v2');
      expect(cache.get('k1')).toBe('v2');
    });
  });

  // ============================================================
  // has
  // ============================================================
  describe('has', () => {
    it('should check existence', () => {
      cache.set('k1', 'v1');
      expect(cache.has('k1')).toBe(true);
    });

    it('should return false for missing', () => {
      expect(cache.has('unknown')).toBe(false);
    });
  });

  // ============================================================
  // delete
  // ============================================================
  describe('delete', () => {
    it('should delete', () => {
      cache.set('k1', 'v1');
      expect(cache.delete('k1')).toBe(true);
    });

    it('should return false for missing', () => {
      expect(cache.delete('unknown')).toBe(false);
    });
  });

  // ============================================================
  // TTL
  // ============================================================
  describe('TTL', () => {
    it('should expire entries', async () => {
      cache.set('k1', 'v1', 10);
      await new Promise(r => setTimeout(r, 20));
      expect(cache.get('k1')).toBeUndefined();
    });

    it('should check isExpired', async () => {
      cache.set('k1', 'v1', 10);
      await new Promise(r => setTimeout(r, 20));
      // Entry is still in store but expired - isExpired returns true
      expect(cache.isExpired('k1')).toBe(true);
    });

    it('should get expiresAt', () => {
      cache.set('k1', 'v1', 1000);
      expect(cache.getExpiresAt('k1')).toBeGreaterThan(Date.now());
    });

    it('should get ttl', () => {
      cache.set('k1', 'v1', 1000);
      expect(cache.getTtl('k1')).toBeGreaterThan(0);
    });

    it('should return -1 for no expiry', () => {
      cache.set('k1', 'v1');
      expect(cache.getTtl('k1')).toBe(-1);
    });
  });

  // ============================================================
  // stats
  // ============================================================
  describe('stats', () => {
    it('should track hits', () => {
      cache.set('k1', 'v1');
      cache.get('k1');
      expect(cache.getStats().hits).toBe(1);
    });

    it('should track misses', () => {
      cache.get('unknown');
      expect(cache.getStats().misses).toBe(1);
    });

    it('should track sets', () => {
      cache.set('k1', 'v1');
      expect(cache.getStats().sets).toBe(1);
    });

    it('should track deletes', () => {
      cache.set('k1', 'v1');
      cache.delete('k1');
      expect(cache.getStats().deletes).toBe(1);
    });

    it('should compute hit rate', () => {
      cache.set('k1', 'v1');
      cache.get('k1');
      cache.get('k1');
      cache.get('unknown');
      expect(cache.getStats().hitRate).toBeCloseTo(0.67, 1);
    });

    it('should reset stats', () => {
      cache.set('k1', 'v1');
      cache.get('k1');
      cache.resetStats();
      expect(cache.getStats().hits).toBe(0);
    });
  });

  // ============================================================
  // capacity / eviction
  // ============================================================
  describe('capacity / eviction', () => {
    it('should get size', () => {
      cache.set('k1', 'v1');
      expect(cache.getSize()).toBe(1);
    });

    it('should get capacity', () => {
      expect(cache.getCapacity()).toBe(100);
    });

    it('should set capacity', () => {
      cache.setCapacity(50);
      expect(cache.getCapacity()).toBe(50);
    });

    it('should evict when full (lru)', () => {
      const small = new CacheManager(2, 0, 'lru');
      small.set('k1', 'v1');
      small.set('k2', 'v2');
      small.set('k3', 'v3');
      expect(small.getSize()).toBe(2);
    });

    it('should evict when full (fifo)', () => {
      const small = new CacheManager(2, 0, 'fifo');
      small.set('k1', 'v1');
      small.set('k2', 'v2');
      small.set('k3', 'v3');
      expect(small.getSize()).toBe(2);
    });

    it('should not evict when policy is none', () => {
      const small = new CacheManager(2, 0, 'none');
      small.set('k1', 'v1');
      small.set('k2', 'v2');
      small.set('k3', 'v3');
      expect(small.getSize()).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get keys', () => {
      cache.set('k1', 'v1');
      expect(cache.keys()).toEqual(['k1']);
    });

    it('should get values', () => {
      cache.set('k1', 'v1');
      expect(cache.values()).toEqual(['v1']);
    });

    it('should get all entries', () => {
      cache.set('k1', 'v1');
      expect(cache.getAllEntries()).toHaveLength(1);
    });
  });

  // ============================================================
  // configuration
  // ============================================================
  describe('configuration', () => {
    it('should set eviction policy', () => {
      cache.setEvictionPolicy('fifo');
      expect(cache.getEvictionPolicy()).toBe('fifo');
    });

    it('should get default ttl', () => {
      expect(cache.getDefaultTtl()).toBe(0);
    });

    it('should set default ttl', () => {
      cache.setDefaultTtl(1000);
      expect(cache.getDefaultTtl()).toBe(1000);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear', () => {
      cache.set('k1', 'v1');
      cache.clear();
      expect(cache.getSize()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        cache.set(`k${i}`, `v${i}`);
      }
      expect(cache.getSize()).toBe(50);
    });
  });
});