/**
 * CircuitBreaker Tests
 * nanobot-design Circuit Breaker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker } from '../CircuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({ failureThreshold: 3, successThreshold: 2, resetTimeout: 1000 });
  });

  // ============================================================
  // recordSuccess
  // ============================================================
  describe('recordSuccess', () => {
    it('should record success', () => {
      breaker.recordSuccess();
      expect(breaker.getSuccesses()).toBe(1);
    });

    it('should reset failures in closed state', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordSuccess();
      expect(breaker.getFailures()).toBe(0);
    });

    it('should transition from half-open to closed on enough successes', () => {
      breaker.forceHalfOpen();
      breaker.recordSuccess();
      breaker.recordSuccess();
      expect(breaker.isClosed()).toBe(true);
    });
  });

  // ============================================================
  // recordFailure
  // ============================================================
  describe('recordFailure', () => {
    it('should record failure', () => {
      breaker.recordFailure();
      expect(breaker.getFailures()).toBe(1);
    });

    it('should trip on threshold', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.isOpen()).toBe(true);
    });

    it('should open from half-open on failure', () => {
      breaker.forceHalfOpen();
      breaker.recordFailure();
      expect(breaker.isOpen()).toBe(true);
    });
  });

  // ============================================================
  // canRequest
  // ============================================================
  describe('canRequest', () => {
    it('should allow when closed', () => {
      expect(breaker.canRequest()).toBe(true);
    });

    it('should block when open', () => {
      breaker.forceOpen();
      expect(breaker.canRequest()).toBe(false);
    });

    it('should allow when half-open', () => {
      breaker.forceHalfOpen();
      expect(breaker.canRequest()).toBe(true);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset', () => {
      breaker.recordFailure();
      breaker.reset();
      expect(breaker.isClosed()).toBe(true);
      expect(breaker.getFailures()).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      breaker.recordSuccess();
      breaker.recordFailure();
      const stats = breaker.getStats();
      expect(stats.successes).toBe(1);
      expect(stats.failures).toBe(1);
    });

    it('should compute failure rate', () => {
      breaker.recordSuccess();
      breaker.recordFailure();
      expect(breaker.getStats().failureRate).toBeCloseTo(0.5, 1);
    });

    it('should return 0 for empty', () => {
      expect(breaker.getStats().failureRate).toBe(0);
    });
  });

  // ============================================================
  // state accessors
  // ============================================================
  describe('state accessors', () => {
    it('should get state', () => {
      expect(breaker.getState()).toBe('closed');
    });

    it('should check isOpen', () => {
      breaker.forceOpen();
      expect(breaker.isOpen()).toBe(true);
    });

    it('should check isClosed', () => {
      expect(breaker.isClosed()).toBe(true);
    });

    it('should check isHalfOpen', () => {
      breaker.forceHalfOpen();
      expect(breaker.isHalfOpen()).toBe(true);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get last failure time', () => {
      breaker.recordFailure();
      expect(breaker.getLastFailureTime()).toBeGreaterThan(0);
    });

    it('should compute time since last failure', () => {
      breaker.recordFailure();
      expect(breaker.timeSinceLastFailure()).toBeGreaterThanOrEqual(0);
    });

    it('should return -1 for no failures', () => {
      expect(breaker.timeSinceLastFailure()).toBe(-1);
    });

    it('should get time until reset', () => {
      breaker.forceOpen();
      expect(breaker.timeUntilReset()).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 when not open', () => {
      expect(breaker.timeUntilReset()).toBe(0);
    });
  });

  // ============================================================
  // config
  // ============================================================
  describe('config', () => {
    it('should get config', () => {
      const config = breaker.getConfig();
      expect(config.failureThreshold).toBe(3);
    });

    it('should set failure threshold', () => {
      breaker.setFailureThreshold(10);
      expect(breaker.getFailureThreshold()).toBe(10);
    });

    it('should set success threshold', () => {
      breaker.setSuccessThreshold(5);
      expect(breaker.getSuccessThreshold()).toBe(5);
    });

    it('should set reset timeout', () => {
      breaker.setResetTimeout(5000);
      expect(breaker.getResetTimeout()).toBe(5000);
    });
  });

  // ============================================================
  // half-open
  // ============================================================
  describe('half-open', () => {
    it('should get half-open successes', () => {
      breaker.forceHalfOpen();
      breaker.recordSuccess();
      expect(breaker.getHalfOpenSuccesses()).toBe(1);
    });
  });

  // ============================================================
  // force
  // ============================================================
  describe('force', () => {
    it('should force open', () => {
      breaker.forceOpen();
      expect(breaker.isOpen()).toBe(true);
    });

    it('should force closed', () => {
      breaker.forceOpen();
      breaker.forceClosed();
      expect(breaker.isClosed()).toBe(true);
    });

    it('should force half-open', () => {
      breaker.forceHalfOpen();
      expect(breaker.isHalfOpen()).toBe(true);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get total', () => {
      breaker.recordSuccess();
      expect(breaker.getTotal()).toBe(1);
    });

    it('should check shouldTrip', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.shouldTrip()).toBe(false);
      breaker.recordFailure();
      expect(breaker.shouldTrip()).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many operations', () => {
      for (let i = 0; i < 50; i++) {
        breaker.recordSuccess();
      }
      expect(breaker.getSuccesses()).toBe(50);
    });
  });
});