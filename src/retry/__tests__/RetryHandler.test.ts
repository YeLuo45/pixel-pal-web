/**
 * RetryHandler Tests
 * thunderbolt-design Retry Handler
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RetryHandler } from '../RetryHandler';

describe('RetryHandler', () => {
  let handler: RetryHandler;

  beforeEach(() => {
    handler = new RetryHandler();
  });

  // ============================================================
  // execute
  // ============================================================
  describe('execute', () => {
    it('should succeed on first try', async () => {
      const result = await handler.execute(async () => 'ok');
      expect(result).toBe('ok');
    });

    it('should retry on failure', async () => {
      let count = 0;
      const result = await handler.execute(async () => {
        count++;
        if (count < 3) throw new Error('fail');
        return 'ok';
      }, { maxRetries: 5, baseDelay: 1 });
      expect(result).toBe('ok');
      expect(count).toBe(3);
    });

    it('should throw after max retries', async () => {
      await expect(handler.execute(async () => {
        throw new Error('fail');
      }, { maxRetries: 2, baseDelay: 1 })).rejects.toThrow('fail');
    });
  });

  // ============================================================
  // strategies
  // ============================================================
  describe('strategies', () => {
    it('should use fixed strategy', () => {
      expect(handler.calculateDelay(0, 'fixed', 100, 5000)).toBe(100);
    });

    it('should use linear strategy', () => {
      expect(handler.calculateDelay(0, 'linear', 100, 5000)).toBe(100);
      expect(handler.calculateDelay(1, 'linear', 100, 5000)).toBe(200);
    });

    it('should use exponential strategy', () => {
      expect(handler.calculateDelay(0, 'exponential', 100, 5000)).toBe(100);
      expect(handler.calculateDelay(1, 'exponential', 100, 5000)).toBe(200);
      expect(handler.calculateDelay(2, 'exponential', 100, 5000)).toBe(400);
    });

    it('should cap at max delay', () => {
      expect(handler.calculateDelay(10, 'exponential', 100, 500)).toBe(500);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', async () => {
      await handler.execute(async () => 'ok');
      const stats = handler.getStats();
      expect(stats.successes).toBe(1);
    });
  });

  // ============================================================
  // delays
  // ============================================================
  describe('delays', () => {
    it('should track delays', async () => {
      let count = 0;
      try {
        await handler.execute(async () => {
          count++;
          throw new Error('fail');
        }, { maxRetries: 2, baseDelay: 1 });
      } catch {}
      expect(handler.getDelayCount()).toBe(2);
    });

    it('should get delays', async () => {
      let count = 0;
      try {
        await handler.execute(async () => {
          count++;
          throw new Error('fail');
        }, { maxRetries: 1, baseDelay: 1 });
      } catch {}
      expect(handler.getDelays()).toHaveLength(1);
    });

    it('should get total delay', async () => {
      let count = 0;
      try {
        await handler.execute(async () => {
          count++;
          throw new Error('fail');
        }, { maxRetries: 2, baseDelay: 10 });
      } catch {}
      expect(handler.getTotalDelay()).toBeGreaterThanOrEqual(0);
    });

    it('should get avg delay', () => {
      expect(handler.getAvgDelay()).toBe(0);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get attempts', async () => {
      await handler.execute(async () => 'ok');
      expect(handler.getAttempts()).toBe(1);
    });

    it('should get successes', async () => {
      await handler.execute(async () => 'ok');
      expect(handler.getSuccesses()).toBe(1);
    });

    it('should get failures', async () => {
      try {
        await handler.execute(async () => { throw new Error('fail'); }, { maxRetries: 1, baseDelay: 1 });
      } catch {}
      expect(handler.getFailures()).toBe(1);
    });

    it('should get total executions', async () => {
      await handler.execute(async () => 'ok');
      expect(handler.getTotalExecutions()).toBe(1);
    });
  });

  // ============================================================
  // rates
  // ============================================================
  describe('rates', () => {
    it('should get success rate', async () => {
      await handler.execute(async () => 'ok');
      expect(handler.getSuccessRate()).toBe(1);
    });

    it('should get failure rate', async () => {
      try {
        await handler.execute(async () => { throw new Error('fail'); }, { maxRetries: 1, baseDelay: 1 });
      } catch {}
      // 2 attempts, 1 failure (counted when all retries exhausted)
      expect(handler.getFailureRate()).toBeCloseTo(0.5, 1);
    });

    it('should return 0 for empty rates', () => {
      expect(handler.getSuccessRate()).toBe(0);
      expect(handler.getFailureRate()).toBe(0);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset', async () => {
      await handler.execute(async () => 'ok');
      handler.reset();
      expect(handler.getAttempts()).toBe(0);
    });
  });

  // ============================================================
  // callback
  // ============================================================
  describe('callback', () => {
    it('should call onSuccess', async () => {
      let called = false;
      await handler.executeWithCallback(
        async () => 'ok',
        () => { called = true; },
        undefined,
        { maxRetries: 0 }
      );
      expect(called).toBe(true);
    });

    it('should call onFailure', async () => {
      let called = false;
      try {
        await handler.executeWithCallback(
          async () => { throw new Error('fail'); },
          undefined,
          () => { called = true; },
          { maxRetries: 1, baseDelay: 1 }
        );
      } catch {}
      expect(called).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many retries', async () => {
      let count = 0;
      try {
        await handler.execute(async () => {
          count++;
          throw new Error('fail');
        }, { maxRetries: 5, baseDelay: 1 });
      } catch {}
      expect(count).toBe(6);
    });
  });
});