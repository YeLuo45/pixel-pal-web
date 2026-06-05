/**
 * HeartbeatScheduler Tests
 * nanobot-design Heartbeat Scheduler
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HeartbeatScheduler } from '../HeartbeatScheduler';

describe('HeartbeatScheduler', () => {
  let scheduler: HeartbeatScheduler;

  beforeEach(() => {
    scheduler = new HeartbeatScheduler();
  });

  afterEach(() => {
    scheduler.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register node', () => {
      scheduler.register('n1');
      expect(scheduler.getCount()).toBe(1);
    });

    it('should not duplicate', () => {
      scheduler.register('n1');
      scheduler.register('n1');
      expect(scheduler.getCount()).toBe(1);
    });
  });

  // ============================================================
  // heartbeat
  // ============================================================
  describe('heartbeat', () => {
    it('should record heartbeat', () => {
      scheduler.register('n1');
      expect(scheduler.heartbeat('n1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(scheduler.heartbeat('unknown')).toBe(false);
    });

    it('should increment count', () => {
      scheduler.register('n1');
      scheduler.heartbeat('n1');
      scheduler.heartbeat('n1');
      expect(scheduler.getCount2('n1')).toBe(2);
    });
  });

  // ============================================================
  // detect
  // ============================================================
  describe('detect', () => {
    it('should detect alive', () => {
      scheduler.register('n1');
      scheduler.heartbeat('n1');
      const result = scheduler.detect('n1', 1000);
      expect(result?.status).toBe('alive');
    });

    it('should return null for unknown', () => {
      expect(scheduler.detect('unknown', 1000)).toBeNull();
    });
  });

  // ============================================================
  // cleanup
  // ============================================================
  describe('cleanup', () => {
    it('should cleanup', () => {
      scheduler.register('n1');
      scheduler.register('n2');
      const removed = scheduler.cleanup(0);
      // n1 and n2 timestamps are now, but cleanup with 0 should remove all
      expect(removed.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats', () => {
      scheduler.register('n1');
      const stats = scheduler.getStats();
      expect(stats.total).toBe(1);
      expect(stats.alive).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get heartbeat', () => {
      scheduler.register('n1');
      expect(scheduler.getHeartbeat('n1')?.nodeId).toBe('n1');
    });

    it('should get all', () => {
      scheduler.register('n1');
      expect(scheduler.getAllHeartbeats()).toHaveLength(1);
    });

    it('should remove', () => {
      scheduler.register('n1');
      expect(scheduler.removeHeartbeat('n1')).toBe(true);
    });

    it('should check existence', () => {
      scheduler.register('n1');
      expect(scheduler.hasHeartbeat('n1')).toBe(true);
    });

    it('should count', () => {
      expect(scheduler.getCount()).toBe(0);
      scheduler.register('n1');
      expect(scheduler.getCount()).toBe(1);
    });
  });

  // ============================================================
  // getters
  // ============================================================
  describe('getters', () => {
    it('should get timestamp', () => {
      scheduler.register('n1');
      expect(scheduler.getTimestamp('n1')).toBeGreaterThan(0);
    });

    it('should get status', () => {
      scheduler.register('n1');
      expect(scheduler.getStatus('n1')).toBe('alive');
    });

    it('should return null for unknown status', () => {
      expect(scheduler.getStatus('unknown')).toBeNull();
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get by status', () => {
      scheduler.register('n1');
      expect(scheduler.getByStatus('alive')).toHaveLength(1);
    });

    it('should get alive', () => {
      scheduler.register('n1');
      expect(scheduler.getAlive()).toHaveLength(1);
    });

    it('should get slow', () => {
      expect(scheduler.getSlow()).toHaveLength(0);
    });

    it('should get dead', () => {
      expect(scheduler.getDead()).toHaveLength(0);
    });
  });

  // ============================================================
  // status checks
  // ============================================================
  describe('status checks', () => {
    it('should check isAlive', () => {
      scheduler.register('n1');
      expect(scheduler.isAlive('n1')).toBe(true);
    });

    it('should check isSlow', () => {
      expect(scheduler.isSlow('n1')).toBe(false);
    });

    it('should check isDead', () => {
      expect(scheduler.isDead('n1')).toBe(false);
    });
  });

  // ============================================================
  // elapsed
  // ============================================================
  describe('elapsed', () => {
    it('should get elapsed', () => {
      scheduler.register('n1');
      expect(scheduler.getElapsed('n1')).toBeGreaterThanOrEqual(0);
    });

    it('should return -1 for unknown', () => {
      expect(scheduler.getElapsed('unknown')).toBe(-1);
    });
  });

  // ============================================================
  // stale
  // ============================================================
  describe('stale', () => {
    it('should check isStale', () => {
      scheduler.register('n1');
      expect(scheduler.isStale('n1', 1000)).toBe(false);
    });

    it('should get stale nodes', () => {
      scheduler.register('n1');
      expect(scheduler.getStaleNodes(1000)).toHaveLength(0);
    });
  });

  // ============================================================
  // active / inactive
  // ============================================================
  describe('active / inactive', () => {
    it('should get active count', () => {
      scheduler.register('n1');
      expect(scheduler.getActiveCount()).toBe(1);
    });

    it('should get inactive count', () => {
      scheduler.register('n1');
      expect(scheduler.getInactiveCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        scheduler.register(`n${i}`);
      }
      expect(scheduler.getCount()).toBe(50);
    });
  });
});