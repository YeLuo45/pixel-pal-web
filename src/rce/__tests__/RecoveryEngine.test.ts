/**
 * RecoveryEngine Tests
 * thunderbolt-design Recovery Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RecoveryEngine } from '../RecoveryEngine';

describe('RecoveryEngine', () => {
  let rce: RecoveryEngine;

  beforeEach(() => {
    rce = new RecoveryEngine();
  });

  afterEach(() => {
    rce.clearAll();
  });

  // ============================================================
  // register / attempt / recover / fail / retry / remove
  // ============================================================
  describe('register / attempt / recover / fail / retry / remove', () => {
    it('should register', () => {
      expect(rce.register('task1', 3)).toBe('rce-1');
    });

    it('should default max attempts to 3', () => {
      const id = rce.register('task1');
      expect(rce.getMaxAttempts(id)).toBe(3);
    });

    it('should default attempts to 0', () => {
      const id = rce.register('task1');
      expect(rce.getAttempts(id)).toBe(0);
    });

    it('should default status to pending', () => {
      const id = rce.register('task1');
      expect(rce.getStatus(id)).toBe('pending');
    });

    it('should mark as active', () => {
      const id = rce.register('task1');
      expect(rce.isActive(id)).toBe(true);
    });

    it('should attempt', () => {
      const id = rce.register('task1');
      expect(rce.attempt(id)).toBe(true);
    });

    it('should increment attempts', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      expect(rce.getAttempts(id)).toBe(1);
    });

    it('should not attempt inactive', () => {
      const id = rce.register('task1');
      rce.setActive(id, false);
      expect(rce.attempt(id)).toBe(false);
    });

    it('should not attempt recovered', () => {
      const id = rce.register('task1');
      rce.recover(id);
      expect(rce.attempt(id)).toBe(false);
    });

    it('should return false for unknown attempt', () => {
      expect(rce.attempt('unknown')).toBe(false);
    });

    it('should recover', () => {
      const id = rce.register('task1');
      expect(rce.recover(id)).toBe(true);
    });

    it('should return false for unknown recover', () => {
      expect(rce.recover('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = rce.register('task1');
      expect(rce.fail(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(rce.fail('unknown')).toBe(false);
    });

    it('should retry', () => {
      const id = rce.register('task1', 3);
      rce.attempt(id);
      expect(rce.retry(id)).toBe(true);
    });

    it('should reset attempts on retry', () => {
      const id = rce.register('task1', 3);
      rce.attempt(id);
      rce.attempt(id);
      rce.retry(id);
      expect(rce.getAttempts(id)).toBe(0);
    });

    it('should not retry when max reached', () => {
      const id = rce.register('task1', 1);
      rce.attempt(id);
      expect(rce.retry(id)).toBe(false);
    });

    it('should not retry inactive', () => {
      const id = rce.register('task1', 3);
      rce.setActive(id, false);
      expect(rce.retry(id)).toBe(false);
    });

    it('should check canRetry', () => {
      const id = rce.register('task1', 1);
      expect(rce.canRetry(id)).toBe(true);
    });

    it('should return false for unknown canRetry', () => {
      expect(rce.canRetry('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = rce.register('task1');
      expect(rce.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rce.register('task1');
      const stats = rce.getStats();
      expect(stats.recoveries).toBe(1);
    });

    it('should count total attempts', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      expect(rce.getStats().totalAttempts).toBe(1);
    });

    it('should count total recovered', () => {
      const id = rce.register('task1');
      rce.recover(id);
      expect(rce.getStats().totalRecovered).toBe(1);
    });

    it('should count total failed', () => {
      const id = rce.register('task1');
      rce.fail(id);
      expect(rce.getStats().totalFailed).toBe(1);
    });

    it('should count pending', () => {
      rce.register('task1');
      expect(rce.getStats().pending).toBe(1);
    });

    it('should count in progress', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      expect(rce.getStats().inProgress).toBe(1);
    });

    it('should count recovered', () => {
      const id = rce.register('task1');
      rce.recover(id);
      expect(rce.getStats().recovered).toBe(1);
    });

    it('should count failed', () => {
      const id = rce.register('task1');
      rce.fail(id);
      expect(rce.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      rce.register('task1');
      expect(rce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rce.register('task1');
      rce.setActive(id, false);
      expect(rce.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      expect(rce.getStats().totalHits).toBe(1);
    });

    it('should count unique tasks', () => {
      rce.register('a');
      rce.register('b');
      expect(rce.getStats().uniqueTasks).toBe(2);
    });

    it('should compute avg attempts', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      expect(rce.getStats().avgAttempts).toBe(1);
    });

    it('should get max attempts', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      rce.attempt(id);
      expect(rce.getStats().maxAttempts).toBe(2);
    });

    it('should get min attempts', () => {
      rce.register('task1');
      expect(rce.getStats().minAttempts).toBe(0);
    });

    it('should compute avg max attempts', () => {
      rce.register('a', 1);
      rce.register('b', 5);
      expect(rce.getStats().avgMaxAttempts).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get recovery', () => {
      rce.register('task1');
      expect(rce.getRecovery('rce-1')?.task).toBe('task1');
    });

    it('should get all', () => {
      rce.register('task1');
      expect(rce.getAllRecoveries()).toHaveLength(1);
    });

    it('should check existence', () => {
      rce.register('task1');
      expect(rce.hasRecovery('rce-1')).toBe(true);
    });

    it('should count', () => {
      expect(rce.getCount()).toBe(0);
      rce.register('task1');
      expect(rce.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get task', () => {
      rce.register('task1');
      expect(rce.getTask('rce-1')).toBe('task1');
    });

    it('should get hits', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      expect(rce.getHits(id)).toBe(1);
    });

    it('should check recovered', () => {
      const id = rce.register('task1');
      rce.recover(id);
      expect(rce.isRecovered(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = rce.register('task1');
      rce.fail(id);
      expect(rce.isFailed(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      rce.register('task1');
      expect(rce.setActive('rce-1', false)).toBe(true);
    });

    it('should set max attempts', () => {
      rce.register('task1');
      expect(rce.setMaxAttempts('rce-1', 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rce.setActive('unknown', false)).toBe(false);
      expect(rce.setMaxAttempts('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      rce.recover(id);
      rce.setActive(id, false);
      rce.resetAll();
      expect(rce.getAttempts(id)).toBe(0);
      expect(rce.getStatus(id)).toBe('pending');
    });
  });

  // ============================================================
  // by status / task / state
  // ============================================================
  describe('by status / task / state', () => {
    it('should get by status', () => {
      rce.register('task1');
      expect(rce.getByStatus('pending')).toHaveLength(1);
    });

    it('should get by task', () => {
      rce.register('task1');
      expect(rce.getByTask('task1')).toHaveLength(1);
    });

    it('should get active', () => {
      rce.register('task1');
      expect(rce.getActiveRecoveries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      rce.register('task1');
      rce.setActive('rce-1', false);
      expect(rce.getInactiveRecoveries()).toHaveLength(1);
    });

    it('should get all tasks', () => {
      rce.register('a');
      rce.register('b');
      expect(rce.getAllTasks()).toHaveLength(2);
    });

    it('should get task count', () => {
      rce.register('a');
      expect(rce.getTaskCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      rce.register('task1');
      expect(rce.getNewest()?.id).toBe('rce-1');
    });

    it('should return null for empty newest', () => {
      expect(rce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rce.register('task1');
      expect(rce.getOldest()?.id).toBe('rce-1');
    });

    it('should return null for empty oldest', () => {
      expect(rce.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      rce.register('task1');
      expect(rce.getCreatedAt('rce-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      expect(rce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total attempts', () => {
      const id = rce.register('task1');
      rce.attempt(id);
      expect(rce.getTotalAttempts()).toBe(1);
    });

    it('should get total recovered', () => {
      const id = rce.register('task1');
      rce.recover(id);
      expect(rce.getTotalRecovered()).toBe(1);
    });

    it('should get total failed', () => {
      const id = rce.register('task1');
      rce.fail(id);
      expect(rce.getTotalFailed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many recoveries', () => {
      for (let i = 0; i < 50; i++) {
        rce.register(`t${i}`);
      }
      expect(rce.getCount()).toBe(50);
    });
  });
});