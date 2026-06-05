/**
 * TestHelper Tests
 * claude-code-design Test Helper
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../TestHelper';

describe('TestHelper', () => {
  let helper: TestHelper;

  beforeEach(() => {
    helper = new TestHelper();
  });

  afterEach(() => {
    helper.clearAll();
  });

  // ============================================================
  // run
  // ============================================================
  describe('run', () => {
    it('should pass equal values', () => {
      const result = helper.run({ name: 't', input: 5, expected: 5, result: 'pass', duration: 0 });
      expect(result.result).toBe('pass');
    });

    it('should fail different values', () => {
      const result = helper.run({ name: 't', input: 5, expected: 6, result: 'pass', duration: 0 });
      expect(result.result).toBe('fail');
    });

    it('should handle deep equal objects', () => {
      const result = helper.run({ name: 't', input: { a: 1 }, expected: { a: 1 }, result: 'pass', duration: 0 });
      expect(result.result).toBe('pass');
    });

    it('should handle arrays', () => {
      const result = helper.run({ name: 't', input: [1, 2, 3], expected: [1, 2, 3], result: 'pass', duration: 0 });
      expect(result.result).toBe('pass');
    });
  });

  // ============================================================
  // assertions
  // ============================================================
  describe('assertions', () => {
    it('should assertEqual', () => {
      expect(helper.assertEqual(5, 5)).toBe(true);
    });

    it('should assertNotEqual', () => {
      expect(helper.assertNotEqual(5, 6)).toBe(true);
    });

    it('should assertTrue', () => {
      expect(helper.assertTrue(true)).toBe(true);
    });

    it('should assertFalse', () => {
      expect(helper.assertFalse(false)).toBe(true);
    });

    it('should assertNull', () => {
      expect(helper.assertNull(null)).toBe(true);
    });

    it('should assertNotNull', () => {
      expect(helper.assertNotNull(5)).toBe(true);
    });

    it('should assertUndefined', () => {
      expect(helper.assertUndefined(undefined)).toBe(true);
    });

    it('should assertDefined', () => {
      expect(helper.assertDefined(5)).toBe(true);
    });
  });

  // ============================================================
  // snapshot
  // ============================================================
  describe('snapshot', () => {
    it('should create snapshot', () => {
      const hash = helper.snapshot({ a: 1 });
      expect(hash).toBeDefined();
    });

    it('should match snapshot', () => {
      helper.snapshot({ a: 1 });
      expect(helper.matchesSnapshot({ a: 1 })).toBe(true);
    });

    it('should not match different snapshot', () => {
      helper.snapshot({ a: 1 });
      expect(helper.matchesSnapshot({ a: 2 })).toBe(false);
    });

    it('should count snapshots', () => {
      helper.snapshot({ a: 1 });
      expect(helper.getSnapshotCount()).toBe(1);
    });

    it('should clear snapshots', () => {
      helper.snapshot({ a: 1 });
      helper.clearSnapshots();
      expect(helper.getSnapshotCount()).toBe(0);
    });
  });

  // ============================================================
  // getReport
  // ============================================================
  describe('getReport', () => {
    it('should return empty report', () => {
      const report = helper.getReport();
      expect(report.total).toBe(0);
    });

    it('should calculate report', () => {
      helper.run({ name: 't1', input: 1, expected: 1, result: 'pass', duration: 0 });
      helper.run({ name: 't2', input: 2, expected: 3, result: 'fail', duration: 0 });
      const report = helper.getReport();
      expect(report.passed).toBe(1);
      expect(report.failed).toBe(1);
    });
  });

  // ============================================================
  // test queries
  // ============================================================
  describe('test queries', () => {
    it('should get all', () => {
      helper.run({ name: 't', input: 1, expected: 1, result: 'pass', duration: 0 });
      expect(helper.getAllTests()).toHaveLength(1);
    });

    it('should get passed', () => {
      helper.run({ name: 't', input: 1, expected: 1, result: 'pass', duration: 0 });
      expect(helper.getPassedTests()).toHaveLength(1);
    });

    it('should get failed', () => {
      helper.run({ name: 't', input: 1, expected: 2, result: 'pass', duration: 0 });
      expect(helper.getFailedTests()).toHaveLength(1);
    });

    it('should get skipped', () => {
      helper.skip('t');
      expect(helper.getSkippedTests()).toHaveLength(1);
    });

    it('should get by name', () => {
      helper.run({ name: 't1', input: 1, expected: 1, result: 'pass', duration: 0 });
      expect(helper.getTestByName('t1')?.input).toBe(1);
    });
  });

  // ============================================================
  // skip / stats
  // ============================================================
  describe('skip / stats', () => {
    it('should skip', () => {
      expect(helper.skip('t')).toBe(true);
    });

    it('should calculate pass rate', () => {
      helper.run({ name: 't', input: 1, expected: 1, result: 'pass', duration: 0 });
      expect(helper.getPassRate()).toBe(1);
    });

    it('should return 0 for empty pass rate', () => {
      expect(helper.getPassRate()).toBe(0);
    });

    it('should calculate total duration', () => {
      helper.run({ name: 't', input: 1, expected: 1, result: 'pass', duration: 0 });
      expect(helper.getTotalDuration()).toBeGreaterThanOrEqual(0);
    });

    it('should check hasFailures', () => {
      helper.run({ name: 't', input: 1, expected: 2, result: 'pass', duration: 0 });
      expect(helper.hasFailures()).toBe(true);
    });

    it('should check hasPassed', () => {
      helper.run({ name: 't', input: 1, expected: 1, result: 'pass', duration: 0 });
      expect(helper.hasPassed()).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tests', () => {
      for (let i = 0; i < 50; i++) {
        helper.run({ name: `t${i}`, input: i, expected: i, result: 'pass', duration: 0 });
      }
      expect(helper.getReport().total).toBe(50);
    });
  });
});