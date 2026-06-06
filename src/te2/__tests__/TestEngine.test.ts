/**
 * TestEngine Tests
 * claude-code-design Test Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestEngine } from '../TestEngine';

describe('TestEngine', () => {
  let te: TestEngine;

  beforeEach(() => {
    te = new TestEngine();
  });

  afterEach(() => {
    te.clearAll();
  });

  // ============================================================
  // define / run / reset
  // ============================================================
  describe('define / run / reset', () => {
    it('should define', () => {
      expect(te.define('s1', 't1')).toBe('te2-1');
    });

    it('should mark as active', () => {
      const id = te.define('s1', 't1');
      expect(te.isActive(id)).toBe(true);
    });

    it('should mark as not run initially', () => {
      const id = te.define('s1', 't1');
      expect(te.isRun(id)).toBe(false);
    });

    it('should run pass', () => {
      const id = te.define('s1', 't1');
      expect(te.run(id, true, 10)).toBe(true);
    });

    it('should mark as passed', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      expect(te.isPassed(id)).toBe(true);
    });

    it('should mark as run', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      expect(te.isRun(id)).toBe(true);
    });

    it('should record duration', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      expect(te.getDuration(id)).toBe(10);
    });

    it('should run fail', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      te.run(id, false);
      expect(te.isFailed(id)).toBe(true);
    });

    it('should not run inactive', () => {
      const id = te.define('s1', 't1');
      te.setActive(id, false);
      expect(te.run(id, true)).toBe(false);
    });

    it('should return false for unknown run', () => {
      expect(te.run('unknown', true)).toBe(false);
    });

    it('should reset', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      expect(te.reset(id)).toBe(true);
    });

    it('should mark as not run on reset', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      te.reset(id);
      expect(te.isRun(id)).toBe(false);
    });

    it('should return false for unknown reset', () => {
      expect(te.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      te.define('s1', 't1');
      const stats = te.getStats();
      expect(stats.tests).toBe(1);
    });

    it('should count suites', () => {
      te.define('s1', 't1');
      te.define('s2', 't1');
      expect(te.getStats().suites).toBe(2);
    });

    it('should count passed', () => {
      const id = te.define('s1', 't1');
      te.run(id, true);
      expect(te.getStats().passed).toBe(1);
    });

    it('should count failed', () => {
      const id = te.define('s1', 't1');
      te.run(id, true);
      te.run(id, false);
      expect(te.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      te.define('s1', 't1');
      expect(te.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = te.define('s1', 't1');
      te.setActive(id, false);
      expect(te.getStats().inactive).toBe(1);
    });

    it('should compute total duration', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      expect(te.getStats().totalDuration).toBe(10);
    });

    it('should compute avg duration', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      expect(te.getStats().avgDuration).toBe(10);
    });

    it('should count total hits', () => {
      const id = te.define('s1', 't1');
      te.run(id, true);
      expect(te.getStats().totalHits).toBe(1);
    });

    it('should compute pass rate', () => {
      const id = te.define('s1', 't1');
      te.run(id, true);
      expect(te.getStats().passRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get test', () => {
      te.define('s1', 't1');
      expect(te.getTest('te2-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      te.define('s1', 't1');
      expect(te.getAllTests()).toHaveLength(1);
    });

    it('should remove', () => {
      te.define('s1', 't1');
      expect(te.removeTest('te2-1')).toBe(true);
    });

    it('should check existence', () => {
      te.define('s1', 't1');
      expect(te.hasTest('te2-1')).toBe(true);
    });

    it('should count', () => {
      expect(te.getCount()).toBe(0);
      te.define('s1', 't1');
      expect(te.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get suite', () => {
      te.define('s1', 't1');
      expect(te.getSuite('te2-1')).toBe('s1');
    });

    it('should get name', () => {
      te.define('s1', 't1');
      expect(te.getName('te2-1')).toBe('t1');
    });

    it('should get duration', () => {
      te.define('s1', 't1');
      expect(te.getDuration('te2-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = te.define('s1', 't1');
      te.run(id, true);
      expect(te.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      te.define('s1', 't1');
      expect(te.setActive('te2-1', false)).toBe(true);
    });

    it('should set suite', () => {
      te.define('s1', 't1');
      expect(te.setSuite('te2-1', 's2')).toBe(true);
    });

    it('should set name', () => {
      te.define('s1', 't1');
      expect(te.setName('te2-1', 't2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(te.setActive('unknown', false)).toBe(false);
      expect(te.setSuite('unknown', 's')).toBe(false);
      expect(te.setName('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      te.setActive(id, false);
      te.resetAll();
      expect(te.isRun(id)).toBe(false);
      expect(te.getDuration(id)).toBe(0);
      expect(te.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get by suite', () => {
      te.define('s1', 't1');
      te.define('s1', 't2');
      te.define('s2', 't1');
      expect(te.getBySuite('s1')).toHaveLength(2);
    });

    it('should get passed', () => {
      const id = te.define('s1', 't1');
      te.run(id, true);
      expect(te.getPassedTests()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = te.define('s1', 't1');
      te.run(id, false);
      expect(te.getFailedTests()).toHaveLength(1);
    });

    it('should get run', () => {
      const id = te.define('s1', 't1');
      te.run(id, true);
      expect(te.getRunTests()).toHaveLength(1);
    });

    it('should get active', () => {
      te.define('s1', 't1');
      expect(te.getActiveTests()).toHaveLength(1);
    });

    it('should get inactive', () => {
      te.define('s1', 't1');
      te.setActive('te2-1', false);
      expect(te.getInactiveTests()).toHaveLength(1);
    });

    it('should get all suites', () => {
      te.define('s1', 't1');
      te.define('s2', 't1');
      expect(te.getAllSuites()).toHaveLength(2);
    });

    it('should get suite count', () => {
      te.define('s1', 't1');
      expect(te.getSuiteCount()).toBe(1);
    });

    it('should get by min duration', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 10);
      expect(te.getByMinDuration(5)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most duration', () => {
      const id = te.define('s1', 't1');
      te.run(id, true, 100);
      expect(te.getMostDuration()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(te.getMostDuration()).toBeNull();
    });

    it('should get newest', () => {
      te.define('s1', 't1');
      expect(te.getNewest()?.id).toBe('te2-1');
    });

    it('should return null for empty newest', () => {
      expect(te.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      te.define('s1', 't1');
      expect(te.getOldest()?.id).toBe('te2-1');
    });

    it('should return null for empty oldest', () => {
      expect(te.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      te.define('s1', 't1');
      expect(te.getCreatedAt('te2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = te.define('s1', 't1');
      te.run(id, true);
      expect(te.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tests', () => {
      for (let i = 0; i < 50; i++) {
        te.define('s1', `t${i}`);
      }
      expect(te.getCount()).toBe(50);
    });
  });
});