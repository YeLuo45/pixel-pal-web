/**
 * BuildEngine Tests
 * claude-code-design Build Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BuildEngine } from '../BuildEngine';

describe('BuildEngine', () => {
  let be: BuildEngine;

  beforeEach(() => {
    be = new BuildEngine();
  });

  afterEach(() => {
    be.clearAll();
  });

  // ============================================================
  // define / start / finish
  // ============================================================
  describe('define / start / finish', () => {
    it('should define', () => {
      expect(be.define('b1')).toBe('be-1');
    });

    it('should mark as pending', () => {
      const id = be.define('b1');
      expect(be.isPending(id)).toBe(true);
    });

    it('should mark as active', () => {
      const id = be.define('b1');
      expect(be.isActive(id)).toBe(true);
    });

    it('should start', () => {
      const id = be.define('b1');
      expect(be.start(id)).toBe(true);
    });

    it('should mark as running', () => {
      const id = be.define('b1');
      be.start(id);
      expect(be.isRunning(id)).toBe(true);
    });

    it('should not start non-pending', () => {
      const id = be.define('b1');
      be.start(id);
      expect(be.start(id)).toBe(false);
    });

    it('should not start inactive', () => {
      const id = be.define('b1');
      be.setActive(id, false);
      expect(be.start(id)).toBe(false);
    });

    it('should return false for unknown start', () => {
      expect(be.start('unknown')).toBe(false);
    });

    it('should finish success', () => {
      const id = be.define('b1');
      be.start(id);
      expect(be.finish(id, true)).toBe(true);
    });

    it('should mark as success', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      expect(be.isSuccess(id)).toBe(true);
    });

    it('should mark as failed', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, false);
      expect(be.isFailed(id)).toBe(true);
    });

    it('should compute duration on finish', async () => {
      const id = be.define('b1');
      be.start(id);
      await new Promise(r => setTimeout(r, 5));
      be.finish(id, true);
      expect(be.getDuration(id)).toBeGreaterThan(0);
    });

    it('should not finish non-running', () => {
      const id = be.define('b1');
      expect(be.finish(id, true)).toBe(false);
    });

    it('should return false for unknown finish', () => {
      expect(be.finish('unknown', true)).toBe(false);
    });

    it('should reset', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      expect(be.reset(id)).toBe(true);
    });

    it('should mark as pending on reset', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      be.reset(id);
      expect(be.isPending(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(be.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      be.define('b1');
      const stats = be.getStats();
      expect(stats.builds).toBe(1);
    });

    it('should count pending', () => {
      be.define('b1');
      expect(be.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      const id = be.define('b1');
      be.start(id);
      expect(be.getStats().running).toBe(1);
    });

    it('should count success', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      expect(be.getStats().success).toBe(1);
    });

    it('should count failed', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, false);
      expect(be.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      be.define('b1');
      expect(be.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = be.define('b1');
      be.setActive(id, false);
      expect(be.getStats().inactive).toBe(1);
    });

    it('should compute avg duration', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      expect(be.getStats().avgDuration).toBeGreaterThanOrEqual(0);
    });

    it('should compute success rate', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      expect(be.getStats().successRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get build', () => {
      be.define('b1');
      expect(be.getBuild('be-1')?.name).toBe('b1');
    });

    it('should get all', () => {
      be.define('b1');
      expect(be.getAllBuilds()).toHaveLength(1);
    });

    it('should remove', () => {
      be.define('b1');
      expect(be.removeBuild('be-1')).toBe(true);
    });

    it('should check existence', () => {
      be.define('b1');
      expect(be.hasBuild('be-1')).toBe(true);
    });

    it('should count', () => {
      expect(be.getCount()).toBe(0);
      be.define('b1');
      expect(be.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      be.define('b1');
      expect(be.getName('be-1')).toBe('b1');
    });

    it('should get status', () => {
      be.define('b1');
      expect(be.getStatus('be-1')).toBe('pending');
    });

    it('should get duration', () => {
      be.define('b1');
      expect(be.getDuration('be-1')).toBe(0);
    });

    it('should get null started for pending', () => {
      be.define('b1');
      expect(be.getStarted('be-1')).toBeNull();
    });

    it('should get null finished for pending', () => {
      be.define('b1');
      expect(be.getFinished('be-1')).toBeNull();
    });

    it('should get history', () => {
      be.define('b1');
      expect(be.getHistory('be-1')).toEqual(['pending']);
    });

    it('should get hits', () => {
      const id = be.define('b1');
      be.start(id);
      expect(be.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isFinished for success', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      expect(be.isFinished(id)).toBe(true);
    });

    it('should check isFinished for failed', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, false);
      expect(be.isFinished(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      be.define('b1');
      expect(be.setActive('be-1', false)).toBe(true);
    });

    it('should set name', () => {
      be.define('b1');
      expect(be.setName('be-1', 'b2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(be.setActive('unknown', false)).toBe(false);
      expect(be.setName('unknown', 'b')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      be.setActive(id, false);
      be.resetAll();
      expect(be.isPending(id)).toBe(true);
      expect(be.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      be.define('b1');
      expect(be.getByName('b1')).toHaveLength(1);
    });

    it('should get by status', () => {
      be.define('b1');
      expect(be.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      be.define('b1');
      expect(be.getActiveBuilds()).toHaveLength(1);
    });

    it('should get inactive', () => {
      be.define('b1');
      be.setActive('be-1', false);
      expect(be.getInactiveBuilds()).toHaveLength(1);
    });

    it('should get all names', () => {
      be.define('b1');
      be.define('b2');
      expect(be.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      be.define('b1');
      expect(be.getNameCount()).toBe(1);
    });

    it('should get by min duration', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      expect(be.getByMinDuration(0)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most duration', () => {
      const id = be.define('b1');
      be.start(id);
      be.finish(id, true);
      expect(be.getMostDuration()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(be.getMostDuration()).toBeNull();
    });

    it('should get newest', () => {
      be.define('b1');
      expect(be.getNewest()?.id).toBe('be-1');
    });

    it('should return null for empty newest', () => {
      expect(be.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      be.define('b1');
      expect(be.getOldest()?.id).toBe('be-1');
    });

    it('should return null for empty oldest', () => {
      expect(be.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      be.define('b1');
      expect(be.getCreatedAt('be-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      be.define('b1');
      be.start('be-1');
      expect(be.getUpdatedAt('be-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many builds', () => {
      for (let i = 0; i < 50; i++) {
        be.define(`b${i}`);
      }
      expect(be.getCount()).toBe(50);
    });
  });
});