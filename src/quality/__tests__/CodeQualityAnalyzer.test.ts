/**
 * CodeQualityAnalyzer Tests
 * claude-code-design Quality Analyzer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CodeQualityAnalyzer } from '../CodeQualityAnalyzer';

describe('CodeQualityAnalyzer', () => {
  let analyzer: CodeQualityAnalyzer;

  beforeEach(() => {
    analyzer = new CodeQualityAnalyzer();
  });

  // ============================================================
  // analyze
  // ============================================================
  describe('analyze', () => {
    it('should return quality report', () => {
      const report = analyzer.analyze({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 });
      expect(report.score).toBeGreaterThan(80);
      expect(report.smells).toHaveLength(0);
    });

    it('should detect smells', () => {
      const report = analyzer.analyze({ path: 'a.ts', lines: 1000, functions: 50, cyclomaticComplexity: 20 });
      expect(report.smells.length).toBeGreaterThan(0);
      expect(report.suggestions.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // getSmells
  // ============================================================
  describe('getSmells', () => {
    it('should detect long file', () => {
      const smells = analyzer.getSmells({ path: 'a.ts', lines: 600, functions: 5, cyclomaticComplexity: 3 });
      expect(smells).toContain('long-file');
    });

    it('should detect too many functions', () => {
      const smells = analyzer.getSmells({ path: 'a.ts', lines: 100, functions: 40, cyclomaticComplexity: 3 });
      expect(smells).toContain('too-many-functions');
    });

    it('should detect high complexity', () => {
      const smells = analyzer.getSmells({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 20 });
      expect(smells).toContain('high-complexity');
    });

    it('should detect long methods', () => {
      const smells = analyzer.getSmells({ path: 'a.ts', lines: 1000, functions: 5, cyclomaticComplexity: 5 });
      expect(smells).toContain('long-method');
    });

    it('should detect complex functions', () => {
      const smells = analyzer.getSmells({ path: 'a.ts', lines: 100, functions: 2, cyclomaticComplexity: 20 });
      expect(smells).toContain('complex-function');
    });

    it('should return empty for clean code', () => {
      const smells = analyzer.getSmells({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 });
      expect(smells).toHaveLength(0);
    });
  });

  // ============================================================
  // suggest
  // ============================================================
  describe('suggest', () => {
    it('should suggest splitting for long file', () => {
      const suggestions = analyzer.suggest({ path: 'a.ts', lines: 600, functions: 5, cyclomaticComplexity: 3 });
      expect(suggestions).toContain('Split file into multiple smaller modules');
    });

    it('should suggest extraction for too many functions', () => {
      const suggestions = analyzer.suggest({ path: 'a.ts', lines: 100, functions: 40, cyclomaticComplexity: 3 });
      expect(suggestions).toContain('Extract related functions into separate classes/modules');
    });

    it('should suggest refactoring for high complexity', () => {
      const suggestions = analyzer.suggest({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 20 });
      expect(suggestions).toContain('Refactor to reduce cyclomatic complexity');
    });

    it('should default to good for clean code', () => {
      const suggestions = analyzer.suggest({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 });
      expect(suggestions).toContain('Code quality looks good');
    });
  });

  // ============================================================
  // getScore
  // ============================================================
  describe('getScore', () => {
    it('should return 100 for clean code', () => {
      expect(analyzer.getScore({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 })).toBe(100);
    });

    it('should reduce score for long file', () => {
      const score = analyzer.getScore({ path: 'a.ts', lines: 600, functions: 5, cyclomaticComplexity: 3 });
      expect(score).toBeLessThan(100);
    });

    it('should reduce score for high complexity', () => {
      const score = analyzer.getScore({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 30 });
      expect(score).toBeLessThan(80);
    });

    it('should not go below 0', () => {
      const score = analyzer.getScore({ path: 'a.ts', lines: 5000, functions: 100, cyclomaticComplexity: 50 });
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // isHighQuality / isLowQuality
  // ============================================================
  describe('isHighQuality / isLowQuality', () => {
    it('should detect high quality', () => {
      expect(analyzer.isHighQuality({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 })).toBe(true);
    });

    it('should detect low quality', () => {
      expect(analyzer.isLowQuality({ path: 'a.ts', lines: 5000, functions: 100, cyclomaticComplexity: 50 })).toBe(true);
    });
  });

  // ============================================================
  // getComplexityCategory
  // ============================================================
  describe('getComplexityCategory', () => {
    it('should return low', () => {
      expect(analyzer.getComplexityCategory(3)).toBe('low');
    });

    it('should return medium', () => {
      expect(analyzer.getComplexityCategory(7)).toBe('medium');
    });

    it('should return high', () => {
      expect(analyzer.getComplexityCategory(15)).toBe('high');
    });
  });

  // ============================================================
  // getSizeCategory
  // ============================================================
  describe('getSizeCategory', () => {
    it('should return small', () => {
      expect(analyzer.getSizeCategory(50)).toBe('small');
    });

    it('should return medium', () => {
      expect(analyzer.getSizeCategory(300)).toBe('medium');
    });

    it('should return large', () => {
      expect(analyzer.getSizeCategory(800)).toBe('large');
    });
  });

  // ============================================================
  // getReportSummary
  // ============================================================
  describe('getReportSummary', () => {
    it('should return summary', () => {
      const summary = analyzer.getReportSummary({ score: 80, smells: ['a'], suggestions: ['b'] });
      expect(summary).toContain('Score: 80');
      expect(summary).toContain('Smells: 1');
      expect(summary).toContain('Suggestions: 1');
    });
  });

  // ============================================================
  // getTopSuggestion
  // ============================================================
  describe('getTopSuggestion', () => {
    it('should return first suggestion', () => {
      const top = analyzer.getTopSuggestion({ path: 'a.ts', lines: 600, functions: 5, cyclomaticComplexity: 3 });
      expect(top).toBe('Split file into multiple smaller modules');
    });

    it('should return default for clean code', () => {
      const top = analyzer.getTopSuggestion({ path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 });
      expect(top).toBe('Code quality looks good');
    });
  });

  // ============================================================
  // hasSmell / countSmells
  // ============================================================
  describe('hasSmell / countSmells', () => {
    it('should check smell existence', () => {
      expect(analyzer.hasSmell({ path: 'a.ts', lines: 600, functions: 5, cyclomaticComplexity: 3 }, 'long-file')).toBe(true);
    });

    it('should count smells', () => {
      const count = analyzer.countSmells({ path: 'a.ts', lines: 1000, functions: 50, cyclomaticComplexity: 20 });
      expect(count).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // compareQuality
  // ============================================================
  describe('compareQuality', () => {
    it('should return positive when b is better', () => {
      const a = { path: 'a.ts', lines: 1000, functions: 50, cyclomaticComplexity: 20 };
      const b = { path: 'b.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 };
      expect(analyzer.compareQuality(a, b)).toBeGreaterThan(0);
    });

    it('should return negative when a is better', () => {
      const a = { path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 };
      const b = { path: 'b.ts', lines: 1000, functions: 50, cyclomaticComplexity: 20 };
      expect(analyzer.compareQuality(a, b)).toBeLessThan(0);
    });

    it('should return 0 for equal quality', () => {
      const a = { path: 'a.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 };
      const b = { path: 'b.ts', lines: 100, functions: 5, cyclomaticComplexity: 3 };
      expect(analyzer.compareQuality(a, b)).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle zero values', () => {
      const score = analyzer.getScore({ path: 'a.ts', lines: 0, functions: 0, cyclomaticComplexity: 0 });
      expect(score).toBe(100);
    });

    it('should handle very large files', () => {
      const score = analyzer.getScore({ path: 'a.ts', lines: 100000, functions: 1000, cyclomaticComplexity: 200 });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThan(50);
    });
  });
});