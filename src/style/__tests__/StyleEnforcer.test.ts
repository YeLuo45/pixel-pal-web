/**
 * StyleEnforcer Tests
 * claude-code-design Style Enforcer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StyleEnforcer } from '../StyleEnforcer';

describe('StyleEnforcer', () => {
  let enforcer: StyleEnforcer;

  beforeEach(() => {
    enforcer = new StyleEnforcer();
  });

  afterEach(() => {
    enforcer.clearAll();
  });

  // ============================================================
  // addRule
  // ============================================================
  describe('addRule', () => {
    it('should add rule', () => {
      enforcer.addRule({ name: 'no-var', pattern: /\bvar\b/g, message: 'Use let/const', severity: 'error' });
      expect(enforcer.getRuleCount()).toBe(1);
    });
  });

  // ============================================================
  // check
  // ============================================================
  describe('check', () => {
    it('should detect violations', () => {
      enforcer.addRule({ name: 'no-var', pattern: /\bvar\b/g, message: 'Use let/const', severity: 'error' });
      const v = enforcer.check('var x = 1;');
      expect(v).toHaveLength(1);
    });

    it('should return empty for clean code', () => {
      enforcer.addRule({ name: 'no-var', pattern: /\bvar\b/g, message: 'Use let/const', severity: 'error' });
      const v = enforcer.check('let x = 1;');
      expect(v).toHaveLength(0);
    });

    it('should detect multiple violations', () => {
      enforcer.addRule({ name: 'no-var', pattern: /\bvar\b/g, message: 'Use let/const', severity: 'error' });
      const v = enforcer.check('var x = 1;\nvar y = 2;');
      expect(v).toHaveLength(2);
    });

    it('should track line numbers', () => {
      enforcer.addRule({ name: 'no-var', pattern: /\bvar\b/g, message: 'Use let/const', severity: 'error' });
      const v = enforcer.check('let x = 1;\nvar y = 2;');
      expect(v[0].line).toBe(2);
    });
  });

  // ============================================================
  // fix
  // ============================================================
  describe('fix', () => {
    it('should fix violations', () => {
      enforcer.addRule({ name: 'no-var', pattern: /\bvar\b/g, message: 'Use let/const', severity: 'error' });
      const result = enforcer.fix('var x = 1;', 'no-var', 'let');
      expect(result).toBe('let x = 1;');
    });

    it('should return original for unknown rule', () => {
      const result = enforcer.fix('var x = 1;', 'unknown', 'let');
      expect(result).toBe('var x = 1;');
    });
  });

  // ============================================================
  // generateReport
  // ============================================================
  describe('generateReport', () => {
    it('should generate report', () => {
      enforcer.addRule({ name: 'r1', pattern: /\bvar\b/g, message: 'm', severity: 'error' });
      enforcer.addRule({ name: 'r2', pattern: /TODO/g, message: 'm', severity: 'warning' });
      enforcer.addRule({ name: 'r3', pattern: /INFO/g, message: 'm', severity: 'info' });
      enforcer.check('var x; TODO; INFO;');
      const r = enforcer.generateReport();
      expect(r.errors).toBe(1);
      expect(r.warnings).toBe(1);
      expect(r.info).toBe(1);
      expect(r.total).toBe(3);
    });

    it('should return empty report for no violations', () => {
      const r = enforcer.generateReport();
      expect(r.total).toBe(0);
    });
  });

  // ============================================================
  // rule queries
  // ============================================================
  describe('rule queries', () => {
    it('should get rule', () => {
      enforcer.addRule({ name: 'r1', pattern: /x/g, message: 'm', severity: 'error' });
      expect(enforcer.getRule('r1')?.message).toBe('m');
    });

    it('should return undefined for unknown', () => {
      expect(enforcer.getRule('unknown')).toBeUndefined();
    });

    it('should get all rules', () => {
      enforcer.addRule({ name: 'r1', pattern: /x/g, message: 'm', severity: 'error' });
      enforcer.addRule({ name: 'r2', pattern: /y/g, message: 'm', severity: 'error' });
      expect(enforcer.getAllRules()).toHaveLength(2);
    });

    it('should remove rule', () => {
      enforcer.addRule({ name: 'r1', pattern: /x/g, message: 'm', severity: 'error' });
      expect(enforcer.removeRule('r1')).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(enforcer.removeRule('unknown')).toBe(false);
    });

    it('should check rule existence', () => {
      enforcer.addRule({ name: 'r1', pattern: /x/g, message: 'm', severity: 'error' });
      expect(enforcer.hasRule('r1')).toBe(true);
    });
  });

  // ============================================================
  // violation filters
  // ============================================================
  describe('violation filters', () => {
    beforeEach(() => {
      enforcer.addRule({ name: 'r1', pattern: /\bvar\b/g, message: 'm1', severity: 'error' });
      enforcer.addRule({ name: 'r2', pattern: /TODO/g, message: 'm2', severity: 'warning' });
      enforcer.check('var x;\nTODO;');
    });

    it('should get violations', () => {
      expect(enforcer.getViolations()).toHaveLength(2);
    });

    it('should filter by rule', () => {
      expect(enforcer.getViolationsByRule('r1')).toHaveLength(1);
    });

    it('should filter by severity', () => {
      expect(enforcer.getViolationsBySeverity('error')).toHaveLength(1);
    });

    it('should filter by line', () => {
      expect(enforcer.getViolationsByLine(1)).toHaveLength(1);
    });

    it('should not expose internal array', () => {
      const v = enforcer.getViolations();
      v.push({ rule: 'fake', line: 0, message: 'fake', severity: 'error' });
      expect(enforcer.getViolations()).toHaveLength(2);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear violations', () => {
      enforcer.addRule({ name: 'r1', pattern: /var/g, message: 'm', severity: 'error' });
      enforcer.check('var x;');
      enforcer.clearViolations();
      expect(enforcer.getViolations()).toHaveLength(0);
    });
  });

  // ============================================================
  // checkRule
  // ============================================================
  describe('checkRule', () => {
    it('should check specific rule', () => {
      enforcer.addRule({ name: 'r1', pattern: /var/g, message: 'm', severity: 'error' });
      enforcer.addRule({ name: 'r2', pattern: /TODO/g, message: 'm', severity: 'warning' });
      const v = enforcer.checkRule('var x; TODO;', 'r1');
      expect(v).toHaveLength(1);
    });

    it('should return empty for unknown rule', () => {
      expect(enforcer.checkRule('var x;', 'unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // counts
  // ============================================================
  describe('counts', () => {
    it('should get error count', () => {
      enforcer.addRule({ name: 'r1', pattern: /var/g, message: 'm', severity: 'error' });
      enforcer.check('var x;');
      expect(enforcer.getErrorCount()).toBe(1);
    });

    it('should get warning count', () => {
      enforcer.addRule({ name: 'r1', pattern: /TODO/g, message: 'm', severity: 'warning' });
      enforcer.check('TODO;');
      expect(enforcer.getWarningCount()).toBe(1);
    });

    it('should get info count', () => {
      enforcer.addRule({ name: 'r1', pattern: /INFO/g, message: 'm', severity: 'info' });
      enforcer.check('INFO;');
      expect(enforcer.getInfoCount()).toBe(1);
    });

    it('should check hasErrors', () => {
      enforcer.addRule({ name: 'r1', pattern: /var/g, message: 'm', severity: 'error' });
      enforcer.check('var x;');
      expect(enforcer.hasErrors()).toBe(true);
    });

    it('should check hasWarnings', () => {
      enforcer.addRule({ name: 'r1', pattern: /TODO/g, message: 'm', severity: 'warning' });
      enforcer.check('TODO;');
      expect(enforcer.hasWarnings()).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many rules', () => {
      for (let i = 0; i < 20; i++) {
        enforcer.addRule({ name: `r${i}`, pattern: new RegExp(`p${i}`), message: 'm', severity: 'error' });
      }
      expect(enforcer.getRuleCount()).toBe(20);
    });

    it('should handle many violations', () => {
      enforcer.addRule({ name: 'r1', pattern: /var/g, message: 'm', severity: 'error' });
      enforcer.check('var var var var var;');
      // One violation per line per rule
      expect(enforcer.getViolations().length).toBeGreaterThanOrEqual(1);
    });
  });
});