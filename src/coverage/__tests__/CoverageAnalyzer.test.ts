/**
 * CoverageAnalyzer Tests
 * claude-code-design Coverage Analyzer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CoverageAnalyzer } from '../CoverageAnalyzer';

describe('CoverageAnalyzer', () => {
  let analyzer: CoverageAnalyzer;

  beforeEach(() => {
    analyzer = new CoverageAnalyzer();
  });

  afterEach(() => {
    analyzer.clearAll();
  });

  // ============================================================
  // addCoverage
  // ============================================================
  describe('addCoverage', () => {
    it('should add coverage data', () => {
      analyzer.addCoverage({
        file: 'a.ts', totalLines: 100, coveredLines: 80,
        totalBranches: 10, coveredBranches: 8,
        totalFunctions: 5, coveredFunctions: 4,
      });
      expect(analyzer.getFileCount()).toBe(1);
    });
  });

  // ============================================================
  // calculateOverall
  // ============================================================
  describe('calculateOverall', () => {
    it('should return 0 for empty', () => {
      expect(analyzer.calculateOverall()).toBe(0);
    });

    it('should calculate overall coverage', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      analyzer.addCoverage({ file: 'b.ts', totalLines: 100, coveredLines: 60, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.calculateOverall()).toBe(70);
    });

    it('should return 0 for zero total lines', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 0, coveredLines: 0, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.calculateOverall()).toBe(0);
    });
  });

  // ============================================================
  // generateReport
  // ============================================================
  describe('generateReport', () => {
    it('should generate report', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 10, coveredBranches: 8, totalFunctions: 5, coveredFunctions: 4 });
      const report = analyzer.generateReport();
      expect(report.overall).toBe(80);
      expect(report.files).toHaveLength(1);
    });

    it('should include gaps in report', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 30, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      const report = analyzer.generateReport();
      expect(report.gaps).toContain('a.ts');
    });
  });

  // ============================================================
  // findGaps
  // ============================================================
  describe('findGaps', () => {
    it('should find files below threshold', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 30, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.findGaps()).toContain('a.ts');
    });

    it('should not flag files above threshold', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 90, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.findGaps()).not.toContain('a.ts');
    });
  });

  // ============================================================
  // file coverage
  // ============================================================
  describe('file coverage', () => {
    it('should get file coverage', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getFileCoverage('a.ts')?.totalLines).toBe(100);
    });

    it('should return undefined for unknown', () => {
      expect(analyzer.getFileCoverage('unknown')).toBeUndefined();
    });

    it('should check existence', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.hasFile('a.ts')).toBe(true);
    });

    it('should remove file', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.removeFile('a.ts')).toBe(true);
    });
  });

  // ============================================================
  // threshold
  // ============================================================
  describe('threshold', () => {
    it('should set threshold', () => {
      analyzer.setThreshold(90);
      expect(analyzer.getThreshold()).toBe(90);
    });

    it('should clamp to 0-100', () => {
      analyzer.setThreshold(150);
      expect(analyzer.getThreshold()).toBe(100);
    });

    it('should check meetsThreshold', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 90, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.meetsThreshold()).toBe(true);
    });
  });

  // ============================================================
  // coverage queries
  // ============================================================
  describe('coverage queries', () => {
    it('should get line coverage', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getLineCoverage('a.ts')).toBe(0.8);
    });

    it('should get branch coverage', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 0, coveredLines: 0, totalBranches: 10, coveredBranches: 5, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getBranchCoverage('a.ts')).toBe(0.5);
    });

    it('should get function coverage', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 0, coveredLines: 0, totalBranches: 0, coveredBranches: 0, totalFunctions: 10, coveredFunctions: 8 });
      expect(analyzer.getFunctionCoverage('a.ts')).toBe(0.8);
    });

    it('should return 0 for no data', () => {
      expect(analyzer.getLineCoverage('unknown')).toBe(0);
    });
  });

  // ============================================================
  // averages
  // ============================================================
  describe('averages', () => {
    it('should calculate average line coverage', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      analyzer.addCoverage({ file: 'b.ts', totalLines: 100, coveredLines: 60, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getAverageLineCoverage()).toBe(0.7);
    });

    it('should return 0 for empty', () => {
      expect(analyzer.getAverageLineCoverage()).toBe(0);
    });

    it('should calculate average branch coverage', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 0, coveredLines: 0, totalBranches: 10, coveredBranches: 8, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getAverageBranchCoverage()).toBe(0.8);
    });

    it('should calculate average function coverage', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 0, coveredLines: 0, totalBranches: 0, coveredBranches: 0, totalFunctions: 10, coveredFunctions: 8 });
      expect(analyzer.getAverageFunctionCoverage()).toBe(0.8);
    });
  });

  // ============================================================
  // file classification
  // ============================================================
  describe('file classification', () => {
    it('should get fully covered', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 100, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getFullyCoveredFiles()).toContain('a.ts');
    });

    it('should get partially covered', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 50, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getPartiallyCoveredFiles()).toContain('a.ts');
    });

    it('should get uncovered', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 0, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getUncoveredFiles()).toContain('a.ts');
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total lines', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getTotalLines()).toBe(100);
    });

    it('should get total covered lines', () => {
      analyzer.addCoverage({ file: 'a.ts', totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      expect(analyzer.getTotalCoveredLines()).toBe(80);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many files', () => {
      for (let i = 0; i < 50; i++) {
        analyzer.addCoverage({ file: `f${i}.ts`, totalLines: 100, coveredLines: 80, totalBranches: 0, coveredBranches: 0, totalFunctions: 0, coveredFunctions: 0 });
      }
      expect(analyzer.getFileCount()).toBe(50);
    });
  });
});