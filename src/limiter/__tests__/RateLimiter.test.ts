/**
 * RateLimiter Tests
 * thunderbolt-design Rate Limiter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '../RateLimiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  afterEach(() => {
    limiter.clearAll();
  });

  // ============================================================
  // configure
  // ============================================================
  describe('configure', () => {
    it('should configure', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.getCount()).toBe(1);
    });
  });

  // ============================================================
  // check
  // ============================================================
  describe('check', () => {
    it('should check', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.check('key1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(limiter.check('unknown')).toBe(false);
    });
  });

  // ============================================================
  // consume
  // ============================================================
  describe('consume', () => {
    it('should consume', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.consume('key1')).toBe(true);
    });

    it('should reject when exhausted', () => {
      limiter.configure('key1', 2, 1000);
      limiter.consume('key1');
      limiter.consume('key1');
      expect(limiter.consume('key1')).toBe(false);
    });

    it('should consume amount', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.consume('key1', 5)).toBe(true);
    });

    it('should reject for unknown', () => {
      expect(limiter.consume('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset', () => {
      limiter.configure('key1', 10, 1000);
      limiter.consume('key1');
      limiter.reset('key1');
      expect(limiter.getCurrent('key1')).toBe(0);
    });

    it('should reset all', () => {
      limiter.configure('key1', 10, 1000);
      limiter.configure('key2', 10, 1000);
      limiter.consume('key1');
      limiter.resetAll();
      expect(limiter.getCurrent('key1')).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      limiter.configure('key1', 10, 1000);
      limiter.consume('key1', 3);
      const stats = limiter.getStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].count).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get limit', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.getLimit('key1')?.limit).toBe(10);
    });

    it('should get all', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.getAllLimits()).toHaveLength(1);
    });

    it('should remove', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.removeLimit('key1')).toBe(true);
    });

    it('should check existence', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.hasLimit('key1')).toBe(true);
    });
  });

  // ============================================================
  // counts
  // ============================================================
  describe('counts', () => {
    it('should get remaining', () => {
      limiter.configure('key1', 10, 1000);
      limiter.consume('key1', 3);
      expect(limiter.getRemaining('key1')).toBe(7);
    });

    it('should get current', () => {
      limiter.configure('key1', 10, 1000);
      limiter.consume('key1', 3);
      expect(limiter.getCurrent('key1')).toBe(3);
    });

    it('should get utilization', () => {
      limiter.configure('key1', 10, 1000);
      limiter.consume('key1', 5);
      expect(limiter.getUtilization('key1')).toBe(0.5);
    });

    it('should return 0 for unknown remaining', () => {
      expect(limiter.getRemaining('unknown')).toBe(0);
    });
  });

  // ============================================================
  // status
  // ============================================================
  describe('status', () => {
    it('should check isExhausted', () => {
      limiter.configure('key1', 2, 1000);
      limiter.consume('key1');
      limiter.consume('key1');
      expect(limiter.isExhausted('key1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(limiter.isExhausted('unknown')).toBe(false);
    });
  });

  // ============================================================
  // timing
  // ============================================================
  describe('timing', () => {
    it('should get reset at', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.getResetAt('key1')).toBeGreaterThan(0);
    });

    it('should get time until reset', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.getTimeUntilReset('key1')).toBeGreaterThan(0);
    });

    it('should return 0 for unknown time', () => {
      expect(limiter.getTimeUntilReset('unknown')).toBe(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set limit', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.setLimit('key1', 20)).toBe(true);
    });

    it('should set window', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.setWindow('key1', 500)).toBe(true);
    });

    it('should return false for unknown setLimit', () => {
      expect(limiter.setLimit('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // keys
  // ============================================================
  describe('keys', () => {
    it('should get all keys', () => {
      limiter.configure('key1', 10, 1000);
      limiter.configure('key2', 10, 1000);
      expect(limiter.getAllKeys()).toHaveLength(2);
    });
  });

  // ============================================================
  // stats for key
  // ============================================================
  describe('stats for key', () => {
    it('should get stats for key', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.getStatsForKey('key1')?.key).toBe('key1');
    });

    it('should return null for unknown', () => {
      expect(limiter.getStatsForKey('unknown')).toBeNull();
    });
  });

  // ============================================================
  // exhausted
  // ============================================================
  describe('exhausted', () => {
    it('should check hasExhausted', () => {
      limiter.configure('key1', 2, 1000);
      limiter.consume('key1');
      limiter.consume('key1');
      expect(limiter.hasExhausted()).toBe(true);
    });

    it('should get exhausted keys', () => {
      limiter.configure('key1', 2, 1000);
      limiter.consume('key1');
      limiter.consume('key1');
      expect(limiter.getExhaustedKeys()).toContain('key1');
    });

    it('should get active count', () => {
      limiter.configure('key1', 10, 1000);
      limiter.consume('key1', 3);
      expect(limiter.getActiveCount()).toBe(1);
    });
  });

  // ============================================================
  // created
  // ============================================================
  describe('created', () => {
    it('should get created at', () => {
      limiter.configure('key1', 10, 1000);
      expect(limiter.getCreatedAt('key1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many limits', () => {
      for (let i = 0; i < 50; i++) {
        limiter.configure(`key${i}`, 10, 1000);
      }
      expect(limiter.getCount()).toBe(50);
    });
  });
});