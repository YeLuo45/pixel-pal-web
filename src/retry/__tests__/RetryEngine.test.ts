/**
 * RetryEngine Tests
 * thunderbolt-design Retry Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RetryEngine } from '../RetryEngine';

describe('RetryEngine', () => {
  let engine: RetryEngine;

  beforeEach(() => {
    engine = new RetryEngine();
  });

  // ============================================================
  // execute
  // ============================================================
  describe('execute', () => {
    it('should return result on first success', async () => {
      const result = await engine.execute(async () => 'ok', { maxAttempts: 3, backoff: 'fixed', initialDelayMs: 10 });
      expect(result).toBe('ok');
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      const result = await engine.execute(async () => {
        attempts++;
        if (attempts < 2) throw new Error('fail');
        return 'ok';
      }, { maxAttempts: 3, backoff: 'fixed', initialDelayMs: 1 });
      expect(result).toBe('ok');
      expect(attempts).toBe(2);
    });

    it('should fail after max attempts', async () => {
      await expect(engine.execute(async () => {
        throw new Error('always fails');
      }, { maxAttempts: 2, backoff: 'fixed', initialDelayMs: 1 })).rejects.toThrow('always fails');
    });
  });

  // ============================================================
  // calculateDelay
  // ============================================================
  describe('calculateDelay', () => {
    it('should calculate fixed delay', () => {
      const d1 = engine.calculateDelay(1, { maxAttempts: 3, backoff: 'fixed', initialDelayMs: 100 });
      const d2 = engine.calculateDelay(2, { maxAttempts: 3, backoff: 'fixed', initialDelayMs: 100 });
      expect(d1).toBe(100);
      expect(d2).toBe(100);
    });

    it('should calculate exponential delay', () => {
      const d1 = engine.calculateDelay(1, { maxAttempts: 3, backoff: 'exponential', initialDelayMs: 100 });
      const d2 = engine.calculateDelay(2, { maxAttempts: 3, backoff: 'exponential', initialDelayMs: 100 });
      const d3 = engine.calculateDelay(3, { maxAttempts: 3, backoff: 'exponential', initialDelayMs: 100 });
      expect(d1).toBe(100);
      expect(d2).toBe(200);
      expect(d3).toBe(400);
    });

    it('should calculate linear delay', () => {
      const d1 = engine.calculateDelay(1, { maxAttempts: 3, backoff: 'linear', initialDelayMs: 100 });
      const d2 = engine.calculateDelay(2, { maxAttempts: 3, backoff: 'linear', initialDelayMs: 100 });
      expect(d1).toBe(100);
      expect(d2).toBe(200);
    });

    it('should cap at maxDelayMs', () => {
      const d = engine.calculateDelay(10, { maxAttempts: 3, backoff: 'exponential', initialDelayMs: 100, maxDelayMs: 500 });
      expect(d).toBe(500);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return initial stats', () => {
      const stats = engine.getStats();
      expect(stats.total).toBe(0);
    });

    it('should count successful', async () => {
      await engine.execute(async () => 'ok', { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 });
      const stats = engine.getStats();
      expect(stats.successful).toBe(1);
    });

    it('should count failed', async () => {
      try { await engine.execute(async () => { throw new Error('fail'); }, { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 }); } catch {}
      const stats = engine.getStats();
      expect(stats.failed).toBe(1);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all stats', async () => {
      await engine.execute(async () => 'ok', { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 });
      engine.reset();
      const stats = engine.getStats();
      expect(stats.total).toBe(0);
    });
  });

  // ============================================================
  // success/failure rate
  // ============================================================
  describe('success/failure rate', () => {
    it('should return 0 for no executions', () => {
      expect(engine.getSuccessRate()).toBe(0);
      expect(engine.getFailureRate()).toBe(0);
    });

    it('should calculate success rate', async () => {
      await engine.execute(async () => 'ok', { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 });
      try { await engine.execute(async () => { throw new Error('fail'); }, { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 }); } catch {}
      expect(engine.getSuccessRate()).toBe(0.5);
      expect(engine.getFailureRate()).toBe(0.5);
    });
  });

  // ============================================================
  // individual getters
  // ============================================================
  describe('individual getters', () => {
    it('should get total', async () => {
      await engine.execute(async () => 'ok', { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 });
      expect(engine.getTotal()).toBe(1);
    });

    it('should get successful count', async () => {
      await engine.execute(async () => 'ok', { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 });
      expect(engine.getSuccessful()).toBe(1);
    });

    it('should get failed count', async () => {
      try { await engine.execute(async () => { throw new Error('fail'); }, { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 }); } catch {}
      expect(engine.getFailed()).toBe(1);
    });

    it('should get total attempts', async () => {
      await engine.execute(async () => 'ok', { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 });
      expect(engine.getTotalAttempts()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many executions', async () => {
      for (let i = 0; i < 10; i++) {
        await engine.execute(async () => 'ok', { maxAttempts: 1, backoff: 'fixed', initialDelayMs: 1 });
      }
      expect(engine.getTotal()).toBe(10);
    });

    it('should respect max attempts for retries', async () => {
      let attempts = 0;
      try {
        await engine.execute(async () => {
          attempts++;
          throw new Error('fail');
        }, { maxAttempts: 3, backoff: 'fixed', initialDelayMs: 1 });
      } catch {}
      expect(attempts).toBe(3);
    });
  });
});