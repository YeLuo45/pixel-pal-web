/**
 * CoverageReporter Tests
 * claude-code-design Coverage Reporter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CoverageReporter } from '../CoverageReporter';

describe('CoverageReporter', () => {
  let reporter: CoverageReporter;

  beforeEach(() => {
    reporter = new CoverageReporter();
  });

  afterEach(() => {
    reporter.clearAll();
  });

  // ============================================================
  // addReport
  // ============================================================
  describe('addReport', () => {
    it('should add report', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(id).toBe('cov-1');
    });

    it('should calculate percent', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getPercent(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // getReport
  // ============================================================
  describe('getReport', () => {
    it('should get report', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getReport(id)?.file).toBe('a.ts');
    });

    it('should return undefined for unknown', () => {
      expect(reporter.getReport('unknown')).toBeUndefined();
    });
  });

  // ============================================================
  // getOverallCoverage
  // ============================================================
  describe('getOverallCoverage', () => {
    it('should get overall', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      const overall = reporter.getOverallCoverage();
      expect(overall.lines).toBe(0.8);
    });

    it('should return 0 for empty', () => {
      const overall = reporter.getOverallCoverage();
      expect(overall.lines).toBe(0);
    });
  });

  // ============================================================
  // getThreshold
  // ============================================================
  describe('getThreshold', () => {
    it('should get above threshold', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 90, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getThreshold(0.5)).toHaveLength(1);
    });
  });

  // ============================================================
  // by file / below threshold
  // ============================================================
  describe('by file / below threshold', () => {
    it('should get by file', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getByFile('a.ts')).toHaveLength(1);
    });

    it('should get below threshold', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 5, linesTotal: 100, branchesCovered: 1, branchesTotal: 20, functionsCovered: 1, functionsTotal: 10 });
      expect(reporter.getBelowThreshold(0.5)).toHaveLength(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get all', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getAllReports()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.removeReport(id)).toBe(true);
    });

    it('should check existence', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.hasReport(id)).toBe(true);
    });

    it('should count', () => {
      expect(reporter.getCount()).toBe(0);
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get file', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getFile(id)).toBe('a.ts');
    });

    it('should get lines', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getLines(id)?.percent).toBe(0.8);
    });

    it('should get branches', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getBranches(id)?.percent).toBe(0.9);
    });

    it('should get functions', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getFunctions(id)?.percent).toBe(0.9);
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should get avg', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getAvgPercent()).toBeGreaterThan(0);
    });

    it('should get max', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getMaxPercent()).toBeGreaterThan(0);
    });

    it('should get min', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getMinPercent()).toBeGreaterThan(0);
    });

    it('should return 0 for empty', () => {
      expect(reporter.getAvgPercent()).toBe(0);
      expect(reporter.getMaxPercent()).toBe(0);
      expect(reporter.getMinPercent()).toBe(0);
    });
  });

  // ============================================================
  // pass / fail
  // ============================================================
  describe('pass / fail', () => {
    it('should get passing', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 90, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getPassing(0.5)).toHaveLength(1);
    });

    it('should get failing', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 5, linesTotal: 100, branchesCovered: 1, branchesTotal: 20, functionsCovered: 1, functionsTotal: 10 });
      expect(reporter.getFailing(0.5)).toHaveLength(1);
    });

    it('should get pass rate', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 90, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getPassRate(0.5)).toBe(1);
    });

    it('should return 0 for empty pass rate', () => {
      expect(reporter.getPassRate()).toBe(0);
    });
  });

  // ============================================================
  // files
  // ============================================================
  describe('files', () => {
    it('should get all files', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getAllFiles()).toContain('a.ts');
    });

    it('should count files', () => {
      reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getFileCount()).toBe(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      const id = reporter.addReport({ file: 'a.ts', linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      expect(reporter.getCreatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many reports', () => {
      for (let i = 0; i < 50; i++) {
        reporter.addReport({ file: `f${i}.ts`, linesCovered: 80, linesTotal: 100, branchesCovered: 18, branchesTotal: 20, functionsCovered: 9, functionsTotal: 10 });
      }
      expect(reporter.getCount()).toBe(50);
    });
  });
});