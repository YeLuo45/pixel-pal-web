/**
 * Linter Tests
 * claude-code-design Linter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Linter } from '../Linter';

describe('Linter', () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  afterEach(() => {
    linter.clearAll();
  });

  // ============================================================
  // addRule / check
  // ============================================================
  describe('addRule / check', () => {
    it('should add rule', () => {
      expect(linter.addRule({ id: 'r1', name: 'no-var', check: (c) => c.includes('var '), severity: 'error', message: 'no var' })).toBe(true);
    });

    it('should reject duplicate', () => {
      linter.addRule({ id: 'r1', name: 'no-var', check: (c) => c.includes('var '), severity: 'error', message: 'no var' });
      expect(linter.addRule({ id: 'r1', name: 'no-var', check: (c) => c.includes('var '), severity: 'error', message: 'no var' })).toBe(false);
    });

    it('should detect issue', () => {
      linter.addRule({ id: 'r1', name: 'no-var', check: (c) => c.includes('var '), severity: 'error', message: 'no var' });
      const issues = linter.check('var x = 1;');
      expect(issues).toHaveLength(1);
    });

    it('should not detect when no match', () => {
      linter.addRule({ id: 'r1', name: 'no-var', check: (c) => c.includes('var '), severity: 'error', message: 'no var' });
      expect(linter.check('const x = 1;')).toHaveLength(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      linter.addRule({ id: 'r1', name: 'r1', check: () => false, severity: 'error', message: 'm' });
      const stats = linter.getStats();
      expect(stats.rules).toBe(1);
    });

    it('should count errors', () => {
      linter.addRule({ id: 'r1', name: 'r1', check: (c) => c.includes('var '), severity: 'error', message: 'm' });
      linter.check('var x');
      expect(linter.getStats().errors).toBe(1);
    });

    it('should count warnings', () => {
      linter.addRule({ id: 'r1', name: 'r1', check: (c) => c.includes('x'), severity: 'warning', message: 'm' });
      linter.check('x');
      expect(linter.getStats().warnings).toBe(1);
    });

    it('should count info', () => {
      linter.addRule({ id: 'r1', name: 'r1', check: (c) => c.includes('x'), severity: 'info', message: 'm' });
      linter.check('x');
      expect(linter.getStats().info).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get rule', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'm' });
      expect(linter.getRule('r1')?.name).toBe('a');
    });

    it('should get all', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'm' });
      expect(linter.getAllRules()).toHaveLength(1);
    });

    it('should remove', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'm' });
      expect(linter.removeRule('r1')).toBe(true);
    });

    it('should check existence', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'm' });
      expect(linter.hasRule('r1')).toBe(true);
    });

    it('should count', () => {
      expect(linter.getCount()).toBe(0);
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'm' });
      expect(linter.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'm' });
      expect(linter.getName('r1')).toBe('a');
    });

    it('should get message', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'msg' });
      expect(linter.getMessage('r1')).toBe('msg');
    });

    it('should get severity', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'warning', message: 'm' });
      expect(linter.getSeverity('r1')).toBe('warning');
    });

    it('should check isEnabled', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'm' });
      expect(linter.isEnabled('r1')).toBe(true);
    });
  });

  // ============================================================
  // enable/disable
  // ============================================================
  describe('enable/disable', () => {
    it('should disable rule', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => true, severity: 'error', message: 'm' });
      linter.setEnabled('r1', false);
      expect(linter.check('x')).toHaveLength(0);
    });

    it('should re-enable', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => true, severity: 'error', message: 'm' }, );
      linter.setEnabled('r1', false);
      linter.setEnabled('r1', true);
      expect(linter.check('x')).toHaveLength(1);
    });

    it('should return false for unknown setEnabled', () => {
      expect(linter.setEnabled('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // hits
  // ============================================================
  describe('hits', () => {
    it('should get hits', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'error', message: 'm' });
      linter.check('x');
      expect(linter.getHits('r1')).toBe(1);
    });

    it('should reset hits', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'error', message: 'm' });
      linter.check('x');
      linter.resetHits();
      expect(linter.getHits('r1')).toBe(0);
    });
  });

  // ============================================================
  // issues
  // ============================================================
  describe('issues', () => {
    it('should get all issues', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'error', message: 'm' });
      linter.check('x');
      expect(linter.getAllIssues()).toHaveLength(1);
    });

    it('should get for rule', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'error', message: 'm' });
      linter.check('x');
      expect(linter.getIssuesForRule('r1')).toHaveLength(1);
    });

    it('should count', () => {
      expect(linter.getIssueCount()).toBe(0);
    });

    it('should clear', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'error', message: 'm' });
      linter.check('x');
      linter.clearIssues();
      expect(linter.getIssueCount()).toBe(0);
    });
  });

  // ============================================================
  // by severity
  // ============================================================
  describe('by severity', () => {
    it('should get errors', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'error', message: 'm' });
      linter.check('x');
      expect(linter.getErrors()).toHaveLength(1);
    });

    it('should get warnings', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'warning', message: 'm' });
      linter.check('x');
      expect(linter.getWarnings()).toHaveLength(1);
    });

    it('should get info', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'info', message: 'm' });
      linter.check('x');
      expect(linter.getInfo()).toHaveLength(1);
    });

    it('should get by severity', () => {
      linter.addRule({ id: 'r1', name: 'a', check: (c) => c.includes('x'), severity: 'error', message: 'm' });
      linter.check('x');
      expect(linter.getBySeverity('error')).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      linter.addRule({ id: 'r1', name: 'a', check: () => false, severity: 'error', message: 'm' });
      expect(linter.getCreatedAt('r1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many rules', () => {
      for (let i = 0; i < 50; i++) {
        linter.addRule({ id: `r${i}`, name: `r${i}`, check: () => false, severity: 'error', message: 'm' });
      }
      expect(linter.getCount()).toBe(50);
    });
  });
});