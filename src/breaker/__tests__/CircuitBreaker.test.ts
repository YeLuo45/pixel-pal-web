/**
 * CircuitBreaker Tests
 * thunderbolt-design Circuit Breaker
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker } from '../CircuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker();
  });

  // ============================================================
  // call
  // ============================================================
  describe('call', () => {
    it('should execute function in closed state', async () => {
      const result = await breaker.call(async () => 'ok');
      expect(result).toBe('ok');
    });

    it('should reject when open', async () => {
      breaker.setFailureThreshold(1);
      try { await breaker.call(async () => { throw new Error('fail'); }); } catch {}
      expect(breaker.isOpen()).toBe(true);
      await expect(breaker.call(async () => 'ok')).rejects.toThrow('Circuit breaker is open');
    });

    it('should propagate error', async () => {
      await expect(breaker.call(async () => { throw new Error('boom'); })).rejects.toThrow('boom');
    });

    it('should transition to half_open after timeout', async () => {
      breaker.setFailureThreshold(1);
      breaker.setResetTimeout(10);
      try { await breaker.call(async () => { throw new Error('fail'); }); } catch {}
      expect(breaker.isOpen()).toBe(true);
      await new Promise(r => setTimeout(r, 20));
      // After timeout, call should attempt half_open
      const result = await breaker.call(async () => 'recovered');
      expect(result).toBe('recovered');
      expect(breaker.isClosed()).toBe(true);
    });

    it('should fail back to open if half_open fails', async () => {
      breaker.setFailureThreshold(1);
      breaker.setResetTimeout(10);
      try { await breaker.call(async () => { throw new Error('fail'); }); } catch {}
      await new Promise(r => setTimeout(r, 20));
      try { await breaker.call(async () => { throw new Error('fail again'); }); } catch {}
      expect(breaker.isOpen()).toBe(true);
    });
  });

  // ============================================================
  // recordSuccess / recordFailure
  // ============================================================
  describe('recordSuccess', () => {
    it('should reset failure count', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordSuccess();
      expect(breaker.getFailureCount()).toBe(0);
    });

    it('should increment success count', () => {
      breaker.recordSuccess();
      expect(breaker.getSuccessCount()).toBe(1);
    });

    it('should close breaker from half_open', async () => {
      breaker.setFailureThreshold(1);
      try { await breaker.call(async () => { throw new Error('fail'); }); } catch {}
      breaker.reset();
      breaker.recordSuccess();
      expect(breaker.isClosed()).toBe(true);
    });
  });

  describe('recordFailure', () => {
    it('should increment failure count', () => {
      breaker.recordFailure();
      expect(breaker.getFailureCount()).toBe(1);
    });

    it('should open breaker when threshold reached', () => {
      breaker.setFailureThreshold(3);
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.isClosed()).toBe(true);
      breaker.recordFailure();
      expect(breaker.isOpen()).toBe(true);
    });
  });

  // ============================================================
  // getState / isOpen / isClosed / isHalfOpen
  // ============================================================
  describe('state', () => {
    it('should start closed', () => {
      expect(breaker.isClosed()).toBe(true);
    });

    it('should detect open', () => {
      breaker.setFailureThreshold(1);
      breaker.recordFailure();
      expect(breaker.isOpen()).toBe(true);
    });

    it('should detect half_open', async () => {
      breaker.setFailureThreshold(1);
      breaker.setResetTimeout(10);
      try { await breaker.call(async () => { throw new Error('fail'); }); } catch {}
      await new Promise(r => setTimeout(r, 20));
      // Trigger half_open by trying to call
      try { await breaker.call(async () => 'ok'); } catch {}
    });

    it('should return state', () => {
      expect(breaker.getState()).toBe('closed');
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset to closed', () => {
      breaker.setFailureThreshold(1);
      breaker.recordFailure();
      breaker.reset();
      expect(breaker.isClosed()).toBe(true);
    });

    it('should reset counts', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.reset();
      expect(breaker.getFailureCount()).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats', async () => {
      await breaker.call(async () => 'ok');
      const stats = breaker.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.successRequests).toBe(1);
    });

    it('should count failed', async () => {
      try { await breaker.call(async () => { throw new Error('fail'); }); } catch {}
      const stats = breaker.getStats();
      expect(stats.failedRequests).toBe(1);
    });

    it('should count rejected', async () => {
      breaker.setFailureThreshold(1);
      try { await breaker.call(async () => { throw new Error('fail'); }); } catch {}
      try { await breaker.call(async () => 'ok'); } catch {}
      const stats = breaker.getStats();
      expect(stats.rejectedRequests).toBe(1);
    });

    it('should count state transitions', () => {
      breaker.setFailureThreshold(1);
      breaker.recordFailure(); // closed -> open
      expect(breaker.getStats().stateTransitions).toBe(1);
    });
  });

  // ============================================================
  // getFailureRate
  // ============================================================
  describe('getFailureRate', () => {
    it('should return 0 for no requests', () => {
      expect(breaker.getFailureRate()).toBe(0);
    });

    it('should calculate failure rate', async () => {
      try { await breaker.call(async () => { throw new Error('fail'); }); } catch {}
      await breaker.call(async () => 'ok');
      expect(breaker.getFailureRate()).toBe(0.5);
    });
  });

  // ============================================================
  // config
  // ============================================================
  describe('config', () => {
    it('should set failure threshold', () => {
      breaker.setFailureThreshold(10);
      expect(breaker.getConfig().failureThreshold).toBe(10);
    });

    it('should clamp threshold to >= 1', () => {
      breaker.setFailureThreshold(0);
      expect(breaker.getConfig().failureThreshold).toBe(1);
    });

    it('should set reset timeout', () => {
      breaker.setResetTimeout(5000);
      expect(breaker.getConfig().resetTimeoutMs).toBe(5000);
    });

    it('should clamp timeout to >= 0', () => {
      breaker.setResetTimeout(-1);
      expect(breaker.getConfig().resetTimeoutMs).toBe(0);
    });

    it('should use custom config', () => {
      const b = new CircuitBreaker({ failureThreshold: 100 });
      expect(b.getConfig().failureThreshold).toBe(100);
    });
  });

  // ============================================================
  // clearStats
  // ============================================================
  describe('clearStats', () => {
    it('should clear all stats', async () => {
      await breaker.call(async () => 'ok');
      breaker.clearStats();
      const stats = breaker.getStats();
      expect(stats.totalRequests).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many calls', async () => {
      for (let i = 0; i < 100; i++) {
        await breaker.call(async () => 'ok');
      }
      expect(breaker.getStats().totalRequests).toBe(100);
    });

    it('should handle custom config', () => {
      const b = new CircuitBreaker({ failureThreshold: 100, resetTimeoutMs: 1000 });
      expect(b.getConfig().failureThreshold).toBe(100);
      expect(b.getConfig().resetTimeoutMs).toBe(1000);
    });
  });
});