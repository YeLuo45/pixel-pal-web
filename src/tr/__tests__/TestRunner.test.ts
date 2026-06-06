/**
 * TestRunner Tests
 * claude-code-design Test Runner
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestRunner } from '../TestRunner';

describe('TestRunner', () => {
  let tr: TestRunner;

  beforeEach(() => {
    tr = new TestRunner();
  });

  afterEach(() => {
    tr.clearAll();
  });

  // ============================================================
  // register / run
  // ============================================================
  describe('register / run', () => {
    it('should register', () => {
      expect(tr.register('t1')).toBe('tr-1');
    });

    it('should mark as pending', () => {
      const id = tr.register('t1');
      expect(tr.getStatus(id)).toBe('pending');
    });

    it('should run pass', () => {
      const id = tr.register('t1');
      expect(tr.run(id, true, 10)).toBe(true);
    });

    it('should mark as passed on run true', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      expect(tr.isPassed(id)).toBe(true);
    });

    it('should mark as failed on run false', () => {
      const id = tr.register('t1');
      tr.run(id, false);
      expect(tr.isFailed(id)).toBe(true);
    });

    it('should not run inactive', () => {
      const id = tr.register('t1');
      tr.setActive(id, false);
      expect(tr.run(id, true)).toBe(false);
    });

    it('should return false for unknown run', () => {
      expect(tr.run('unknown', true)).toBe(false);
    });

    it('should increment runs on run', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      expect(tr.getRuns(id)).toBe(1);
    });

    it('should accumulate duration', () => {
      const id = tr.register('t1');
      tr.run(id, true, 10);
      tr.run(id, true, 20);
      expect(tr.getDuration(id)).toBe(30);
    });

    it('should start test', () => {
      const id = tr.register('t1');
      expect(tr.start(id)).toBe(true);
    });

    it('should mark as running on start', () => {
      const id = tr.register('t1');
      tr.start(id);
      expect(tr.isRunning(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tr.register('t1');
      const stats = tr.getStats();
      expect(stats.tests).toBe(1);
    });

    it('should count passed', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      expect(tr.getStats().passed).toBe(1);
    });

    it('should count failed', () => {
      const id = tr.register('t1');
      tr.run(id, false);
      expect(tr.getStats().failed).toBe(1);
    });

    it('should count pending', () => {
      tr.register('t1');
      expect(tr.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      const id = tr.register('t1');
      tr.start(id);
      expect(tr.getStats().running).toBe(1);
    });

    it('should count total runs', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      expect(tr.getStats().totalRuns).toBe(1);
    });

    it('should compute avg duration', () => {
      const id = tr.register('t1');
      tr.run(id, true, 10);
      expect(tr.getStats().avgDuration).toBe(10);
    });

    it('should count total duration', () => {
      const id = tr.register('t1');
      tr.run(id, true, 10);
      expect(tr.getStats().totalDuration).toBe(10);
    });

    it('should count active', () => {
      tr.register('t1');
      expect(tr.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tr.register('t1');
      tr.setActive(id, false);
      expect(tr.getStats().inactive).toBe(1);
    });

    it('should compute pass rate', () => {
      const id1 = tr.register('t1');
      const id2 = tr.register('t2');
      tr.run(id1, true);
      tr.run(id2, false);
      expect(tr.getStats().passRate).toBe(0.5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get test', () => {
      tr.register('t1');
      expect(tr.getTest('tr-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      tr.register('t1');
      expect(tr.getAllTests()).toHaveLength(1);
    });

    it('should remove', () => {
      tr.register('t1');
      expect(tr.removeTest('tr-1')).toBe(true);
    });

    it('should check existence', () => {
      tr.register('t1');
      expect(tr.hasTest('tr-1')).toBe(true);
    });

    it('should count', () => {
      expect(tr.getCount()).toBe(0);
      tr.register('t1');
      expect(tr.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      tr.register('t1');
      expect(tr.getName('tr-1')).toBe('t1');
    });

    it('should get status', () => {
      tr.register('t1');
      expect(tr.getStatus('tr-1')).toBe('pending');
    });

    it('should get duration', () => {
      tr.register('t1');
      expect(tr.getDuration('tr-1')).toBe(0);
    });

    it('should get runs', () => {
      tr.register('t1');
      expect(tr.getRuns('tr-1')).toBe(0);
    });

    it('should get history', () => {
      tr.register('t1');
      expect(tr.getHistory('tr-1')).toEqual(['pending']);
    });

    it('should get error', () => {
      const id = tr.register('t1');
      tr.run(id, false, 0, 'failed');
      expect(tr.getError(id)).toBe('failed');
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isPassed', () => {
      tr.register('t1');
      expect(tr.isPassed('tr-1')).toBe(false);
    });

    it('should check isFailed', () => {
      tr.register('t1');
      expect(tr.isFailed('tr-1')).toBe(false);
    });

    it('should check isPending', () => {
      tr.register('t1');
      expect(tr.isPending('tr-1')).toBe(true);
    });

    it('should check isRunning', () => {
      tr.register('t1');
      expect(tr.isRunning('tr-1')).toBe(false);
    });

    it('should check isActive', () => {
      tr.register('t1');
      expect(tr.isActive('tr-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = tr.register('t1');
      expect(tr.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = tr.register('t1');
      expect(tr.setName(id, 't2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tr.setActive('unknown', false)).toBe(false);
      expect(tr.setName('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset runs', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      expect(tr.resetRuns(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tr.resetRuns('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      tr.setActive(id, false);
      tr.resetAll();
      expect(tr.getRuns(id)).toBe(0);
      expect(tr.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      tr.register('t1');
      expect(tr.getByName('t1')).toHaveLength(1);
    });

    it('should get by status', () => {
      tr.register('t1');
      expect(tr.getByStatus('pending')).toHaveLength(1);
    });

    it('should get passed', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      expect(tr.getPassedTests()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = tr.register('t1');
      tr.run(id, false);
      expect(tr.getFailedTests()).toHaveLength(1);
    });

    it('should get pending', () => {
      tr.register('t1');
      expect(tr.getPendingTests()).toHaveLength(1);
    });

    it('should get running', () => {
      const id = tr.register('t1');
      tr.start(id);
      expect(tr.getRunningTests()).toHaveLength(1);
    });

    it('should get active', () => {
      tr.register('t1');
      expect(tr.getActiveTests()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = tr.register('t1');
      tr.setActive(id, false);
      expect(tr.getInactiveTests()).toHaveLength(1);
    });

    it('should get all names', () => {
      tr.register('t1');
      tr.register('t2');
      expect(tr.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      tr.register('t1');
      expect(tr.getNameCount()).toBe(1);
    });

    it('should get by min duration', () => {
      const id = tr.register('t1');
      tr.run(id, true, 100);
      expect(tr.getByMinDuration(50)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most runs', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      tr.run(id, true);
      expect(tr.getMostRuns()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(tr.getMostRuns()).toBeNull();
    });

    it('should get newest', () => {
      tr.register('t1');
      expect(tr.getNewest()?.id).toBe('tr-1');
    });

    it('should return null for empty newest', () => {
      expect(tr.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tr.register('t1');
      expect(tr.getOldest()?.id).toBe('tr-1');
    });

    it('should return null for empty oldest', () => {
      expect(tr.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tr.register('t1');
      expect(tr.getCreatedAt('tr-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tr.register('t1');
      tr.run(id, true);
      expect(tr.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tests', () => {
      for (let i = 0; i < 50; i++) {
        tr.register(`t${i}`);
      }
      expect(tr.getCount()).toBe(50);
    });
  });
});