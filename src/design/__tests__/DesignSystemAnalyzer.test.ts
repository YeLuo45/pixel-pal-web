/**
 * DesignSystemAnalyzer Tests
 * claude-code-design Design System Analyzer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DesignSystemAnalyzer } from '../DesignSystemAnalyzer';

describe('DesignSystemAnalyzer', () => {
  let analyzer: DesignSystemAnalyzer;

  beforeEach(() => {
    analyzer = new DesignSystemAnalyzer();
  });

  afterEach(() => {
    analyzer.clearAll();
  });

  // ============================================================
  // addToken
  // ============================================================
  describe('addToken', () => {
    it('should add a token', () => {
      analyzer.addToken({ name: 'primary-color', value: '#FF5733', type: 'color' });
      expect(analyzer.hasToken('primary-color')).toBe(true);
    });

    it('should allow multiple tokens', () => {
      analyzer.addToken({ name: 'color-1', value: '#FF5733', type: 'color' });
      analyzer.addToken({ name: 'spacing-1', value: '8px', type: 'spacing' });
      expect(analyzer.getTokens()).toHaveLength(2);
    });

    it('should overwrite existing token', () => {
      analyzer.addToken({ name: 'primary', value: '#FF5733', type: 'color' });
      analyzer.addToken({ name: 'primary', value: '#000000', type: 'color' });
      expect(analyzer.getToken('primary')?.value).toBe('#000000');
    });

    it('should accept all token types', () => {
      analyzer.addToken({ name: 'c1', value: '#fff', type: 'color' });
      analyzer.addToken({ name: 's1', value: '8px', type: 'spacing' });
      analyzer.addToken({ name: 't1', value: '16px', type: 'typography' });
      analyzer.addToken({ name: 'sh1', value: '2px 2px 4px #000', type: 'shadow' });
      expect(analyzer.getTokens()).toHaveLength(4);
    });
  });

  // ============================================================
  // addRule
  // ============================================================
  describe('addRule', () => {
    it('should add a rule', () => {
      analyzer.addRule({
        id: 'no-hardcode-color',
        description: 'No hardcoded colors',
        severity: 'error',
        check: (code) => !/#([0-9A-Fa-f]{3}){1,2}/.test(code),
      });
      expect(analyzer.getRules()).toHaveLength(1);
    });

    it('should allow multiple rules', () => {
      analyzer.addRule({ id: 'r1', description: 'R1', severity: 'error', check: () => true });
      analyzer.addRule({ id: 'r2', description: 'R2', severity: 'warning', check: () => true });
      expect(analyzer.getRules()).toHaveLength(2);
    });

    it('should not deduplicate by id (allows multiple rules with same id)', () => {
      analyzer.addRule({ id: 'same', description: 'S1', severity: 'error', check: () => true });
      analyzer.addRule({ id: 'same', description: 'S2', severity: 'error', check: () => true });
      // Implementation allows duplicates - different description
      expect(analyzer.getRules()).toHaveLength(2);
    });
  });

  // ============================================================
  // analyze
  // ============================================================
  describe('analyze', () => {
    it('should pass code when all rules pass', () => {
      analyzer.addRule({ id: 'always-pass', description: 'Always passes', severity: 'info', check: () => true });
      const report = analyzer.analyze('any code');
      expect(report.passed).toBe(1);
      expect(report.failed).toBe(0);
      expect(report.score).toBe(100);
    });

    it('should fail code when rule fails', () => {
      analyzer.addRule({ id: 'always-fail', description: 'Always fails', severity: 'error', check: () => false });
      const report = analyzer.analyze('any code');
      expect(report.passed).toBe(0);
      expect(report.failed).toBe(1);
      expect(report.issues).toHaveLength(1);
    });

    it('should calculate correct score', () => {
      analyzer.addRule({ id: 'p1', description: 'P1', severity: 'info', check: () => true });
      analyzer.addRule({ id: 'p2', description: 'P2', severity: 'info', check: () => true });
      analyzer.addRule({ id: 'f1', description: 'F1', severity: 'info', check: () => false });
      const report = analyzer.analyze('code');
      expect(report.score).toBe(67);
    });

    it('should handle zero rules', () => {
      const report = analyzer.analyze('any code');
      expect(report.score).toBe(100);
      expect(report.passed).toBe(0);
      expect(report.failed).toBe(0);
    });

    it('should catch rule exceptions as failures', () => {
      analyzer.addRule({ id: 'throws', description: 'Throws', severity: 'error', check: () => { throw new Error('test'); } });
      const report = analyzer.analyze('code');
      expect(report.failed).toBe(1);
      expect(report.issues[0].ruleId).toBe('throws');
    });

    it('should report issue without location when check fails', () => {
      analyzer.addRule({
        id: 'loc-test',
        description: 'Location test',
        severity: 'info',
        check: (code) => false, // always fails
      });
      const report = analyzer.analyze('some code');
      expect(report.issues[0]).toBeDefined();
      expect(report.issues[0].location).toBeUndefined();
    });

    it('should handle complex code with multiple patterns', () => {
      analyzer.addRule({
        id: 'no-shadow',
        description: 'No box-shadow without variable',
        severity: 'warning',
        check: (code) => !/box-shadow:\s*[^$]/.test(code),
      });
      analyzer.addRule({
        id: 'no-inline-style',
        description: 'No inline styles',
        severity: 'info',
        check: (code) => !/style=/.test(code),
      });
      const report = analyzer.analyze('<div style="color: red; box-shadow: 0 0 5px black"></div>');
      expect(report.failed).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // getScore
  // ============================================================
  describe('getScore', () => {
    it('should return last analyzed score', () => {
      analyzer.addRule({ id: 'r1', description: 'R1', severity: 'info', check: () => true });
      analyzer.analyze('code');
      expect(analyzer.getScore()).toBe(100);
    });

    it('should return 0 initially', () => {
      expect(analyzer.getScore()).toBe(0);
    });

    it('should update after each analyze', () => {
      analyzer.addRule({ id: 'r1', description: 'R1', severity: 'info', check: () => false });
      analyzer.analyze('code');
      expect(analyzer.getScore()).toBe(0);
    });
  });

  // ============================================================
  // getToken / hasToken
  // ============================================================
  describe('getToken / hasToken', () => {
    it('should retrieve token by name', () => {
      analyzer.addToken({ name: 'primary', value: '#FF5733', type: 'color' });
      const token = analyzer.getToken('primary');
      expect(token?.value).toBe('#FF5733');
    });

    it('should return undefined for unknown token', () => {
      expect(analyzer.getToken('unknown')).toBeUndefined();
    });

    it('should check token existence', () => {
      analyzer.addToken({ name: 'exists', value: '#fff', type: 'color' });
      expect(analyzer.hasToken('exists')).toBe(true);
      expect(analyzer.hasToken('missing')).toBe(false);
    });
  });

  // ============================================================
  // removeToken
  // ============================================================
  describe('removeToken', () => {
    it('should remove existing token', () => {
      analyzer.addToken({ name: 'removable', value: '#fff', type: 'color' });
      expect(analyzer.removeToken('removable')).toBe(true);
      expect(analyzer.hasToken('removable')).toBe(false);
    });

    it('should return false for unknown token', () => {
      expect(analyzer.removeToken('unknown')).toBe(false);
    });
  });

  // ============================================================
  // removeRule
  // ============================================================
  describe('removeRule', () => {
    it('should remove rule by id', () => {
      analyzer.addRule({ id: 'to-remove', description: 'D', severity: 'error', check: () => true });
      analyzer.removeRule('to-remove');
      expect(analyzer.getRules()).toHaveLength(0);
    });

    it('should do nothing for unknown id', () => {
      analyzer.addRule({ id: 'keep', description: 'K', severity: 'error', check: () => true });
      analyzer.removeRule('unknown');
      expect(analyzer.getRules()).toHaveLength(1);
    });
  });

  // ============================================================
  // checkTokenUsage
  // ============================================================
  describe('checkTokenUsage', () => {
    it('should find used token', () => {
      expect(analyzer.checkTokenUsage('use $primary-color here', 'primary-color')).toBe(true);
    });

    it('should not find unused token', () => {
      expect(analyzer.checkTokenUsage('some code', 'unused-token')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(analyzer.checkTokenUsage('Use Primary-Color', 'primary-color')).toBe(false);
    });
  });

  // ============================================================
  // calculateCoverage
  // ============================================================
  describe('calculateCoverage', () => {
    it('should return 100 for empty tokens', () => {
      expect(analyzer.calculateCoverage(['any'])).toBe(100);
    });

    it('should calculate coverage correctly', () => {
      analyzer.addToken({ name: 't1', value: '#fff', type: 'color' });
      analyzer.addToken({ name: 't2', value: '#000', type: 'color' });
      expect(analyzer.calculateCoverage(['t1'])).toBe(50);
      expect(analyzer.calculateCoverage(['t1', 't2'])).toBe(100);
    });

    it('should ignore unknown tokens in usage', () => {
      analyzer.addToken({ name: 't1', value: '#fff', type: 'color' });
      expect(analyzer.calculateCoverage(['t1', 'unknown'])).toBe(100);
    });
  });

  // ============================================================
  // generateTokenReport
  // ============================================================
  describe('generateTokenReport', () => {
    it('should count tokens by type', () => {
      analyzer.addToken({ name: 'c1', value: '#fff', type: 'color' });
      analyzer.addToken({ name: 'c2', value: '#000', type: 'color' });
      analyzer.addToken({ name: 's1', value: '8px', type: 'spacing' });
      const report = analyzer.generateTokenReport();
      expect(report.total).toBe(3);
      expect(report.byType.color).toBe(2);
      expect(report.byType.spacing).toBe(1);
    });

    it('should show zero for unused types', () => {
      analyzer.addToken({ name: 'c1', value: '#fff', type: 'color' });
      const report = analyzer.generateTokenReport();
      expect(report.byType.typography).toBe(0);
      expect(report.byType.shadow).toBe(0);
    });
  });

  // ============================================================
  // validateTokenValue
  // ============================================================
  describe('validateTokenValue', () => {
    it('should validate hex color', () => {
      expect(analyzer.validateTokenValue({ name: 'n', value: '#FF5733', type: 'color' })).toBe(true);
      expect(analyzer.validateTokenValue({ name: 'n', value: '#a1b2c3', type: 'color' })).toBe(true);
      expect(analyzer.validateTokenValue({ name: 'n', value: '#GGG', type: 'color' })).toBe(false);
    });

    it('should validate rgb color', () => {
      expect(analyzer.validateTokenValue({ name: 'n', value: 'rgb(255, 0, 0)', type: 'color' })).toBe(true);
    });

    it('should validate spacing', () => {
      expect(analyzer.validateTokenValue({ name: 'n', value: '8px', type: 'spacing' })).toBe(true);
      expect(analyzer.validateTokenValue({ name: 'n', value: '1.5rem', type: 'spacing' })).toBe(true);
      expect(analyzer.validateTokenValue({ name: 'n', value: 'abc', type: 'spacing' })).toBe(false);
    });

    it('should validate typography', () => {
      expect(analyzer.validateTokenValue({ name: 'n', value: '16px', type: 'typography' })).toBe(true);
      expect(analyzer.validateTokenValue({ name: 'n', value: 'bold', type: 'typography' })).toBe(true);
    });

    it('should validate shadow', () => {
      expect(analyzer.validateTokenValue({ name: 'n', value: '2px 2px 4px rgba(0,0,0,0.5)', type: 'shadow' })).toBe(true);
      expect(analyzer.validateTokenValue({ name: 'n', value: '1px 0 3px #333', type: 'shadow' })).toBe(true);
    });
  });

  // ============================================================
  // getRulesBySeverity
  // ============================================================
  describe('getRulesBySeverity', () => {
    it('should filter by severity', () => {
      analyzer.addRule({ id: 'e1', description: 'E1', severity: 'error', check: () => true });
      analyzer.addRule({ id: 'w1', description: 'W1', severity: 'warning', check: () => true });
      analyzer.addRule({ id: 'i1', description: 'I1', severity: 'info', check: () => true });
      expect(analyzer.getRulesBySeverity('error')).toHaveLength(1);
      expect(analyzer.getRulesBySeverity('warning')).toHaveLength(1);
      expect(analyzer.getRulesBySeverity('info')).toHaveLength(1);
    });
  });

  // ============================================================
  // getIssueCountBySeverity
  // ============================================================
  describe('getIssueCountBySeverity', () => {
    it('should count issues by severity', () => {
      analyzer.addRule({ id: 'e1', description: 'E1', severity: 'error', check: () => false });
      analyzer.addRule({ id: 'e2', description: 'E2', severity: 'error', check: () => true });
      analyzer.addRule({ id: 'w1', description: 'W1', severity: 'warning', check: () => false });
      const issues = analyzer.analyze('code').issues;
      const counts = analyzer.getIssueCountBySeverity(issues);
      expect(counts.error).toBe(1);
      expect(counts.warning).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tokens', () => {
      for (let i = 0; i < 100; i++) {
        analyzer.addToken({ name: `t${i}`, value: '#fff', type: 'color' });
      }
      expect(analyzer.getTokens()).toHaveLength(100);
    });

    it('should handle many rules', () => {
      for (let i = 0; i < 50; i++) {
        analyzer.addRule({ id: `r${i}`, description: `R${i}`, severity: 'info', check: () => true });
      }
      const report = analyzer.analyze('code');
      expect(report.score).toBe(100);
    });

    it('should handle empty code', () => {
      analyzer.addRule({ id: 'r1', description: 'R1', severity: 'error', check: () => false });
      const report = analyzer.analyze('');
      expect(report.failed).toBe(1);
    });

    it('should handle unicode in code', () => {
      analyzer.addRule({ id: 'unicode', description: 'Unicode', severity: 'info', check: () => true });
      const report = analyzer.analyze('const 变量 = "你好"');
      expect(report.passed).toBe(1);
    });
  });
});