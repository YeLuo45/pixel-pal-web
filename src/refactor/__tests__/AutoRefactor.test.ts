/**
 * AutoRefactor Tests
 * claude-code-design Automated Refactoring Engine v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AutoRefactor } from '../AutoRefactor';

describe('AutoRefactor', () => {
  let refactor: AutoRefactor;

  beforeEach(() => {
    refactor = new AutoRefactor();
  });

  afterEach(() => {
    refactor.resetStats();
  });

  // ============================================================
  // scan
  // ============================================================
  describe('scan', () => {
    it('should scan files and detect smells', () => {
      const results = refactor.scan(['file1.ts', 'file2.ts']);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should increment scanned count', () => {
      refactor.scan(['file1.ts', 'file2.ts']);
      expect(refactor.getStats().scanned).toBe(2);
    });

    it('should return candidates with severity', () => {
      const results = refactor.scan(['file1.ts']);
      for (const r of results) {
        expect(r.severity).toBeGreaterThanOrEqual(1);
        expect(r.severity).toBeLessThanOrEqual(10);
      }
    });

    it('should include fix function', () => {
      const results = refactor.scan(['file1.ts']);
      expect(typeof results[0].fix).toBe('function');
    });

    it('should handle empty list', () => {
      const results = refactor.scan([]);
      expect(results).toHaveLength(0);
    });

    it('should handle many files', () => {
      const files = Array.from({ length: 100 }, (_, i) => `file${i}.ts`);
      const results = refactor.scan(files);
      expect(refactor.getStats().scanned).toBe(100);
    });
  });

  // ============================================================
  // prioritize
  // ============================================================
  describe('prioritize', () => {
    it('should sort by severity descending', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 3, fix: () => '' },
        { fileId: 'f2', smell: 'god-class' as const, severity: 9, fix: () => '' },
        { fileId: 'f3', smell: 'dead-code' as const, severity: 5, fix: () => '' },
      ];
      const prioritized = refactor.prioritize(candidates);
      expect(prioritized[0].severity).toBe(9);
      expect(prioritized[2].severity).toBe(3);
    });

    it('should not mutate original', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 3, fix: () => '' },
      ];
      const original = [...candidates];
      refactor.prioritize(candidates);
      expect(candidates).toEqual(original);
    });

    it('should handle empty list', () => {
      expect(refactor.prioritize([])).toHaveLength(0);
    });
  });

  // ============================================================
  // apply
  // ============================================================
  describe('apply', () => {
    it('should call fix function for each candidate', () => {
      let callCount = 0;
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 5, fix: () => { callCount++; return 'ok'; } },
        { fileId: 'f2', smell: 'dead-code' as const, severity: 7, fix: () => { callCount++; return 'ok'; } },
      ];
      const result = refactor.apply(candidates);
      expect(callCount).toBe(2);
      expect(result.success).toHaveLength(2);
    });

    it('should increment refactored count', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 5, fix: () => 'ok' },
      ];
      refactor.apply(candidates);
      expect(refactor.getStats().refactored).toBe(1);
    });

    it('should handle empty list', () => {
      const result = refactor.apply([]);
      expect(result.success).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
    });

    it('should track failed refactorings', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 5, fix: () => { throw new Error('fail'); } },
      ];
      const result = refactor.apply(candidates);
      expect(result.failed).toHaveLength(1);
      expect(refactor.getStats().failed).toBe(1);
    });

    it('should continue on individual failure', () => {
      let callCount = 0;
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 5, fix: () => { throw new Error('fail'); } },
        { fileId: 'f2', smell: 'dead-code' as const, severity: 7, fix: () => { callCount++; return 'ok'; } },
      ];
      const result = refactor.apply(candidates);
      expect(callCount).toBe(1);
      expect(result.success).toHaveLength(1);
    });
  });

  // ============================================================
  // getSmellCount
  // ============================================================
  describe('getSmellCount', () => {
    it('should return count', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 5, fix: () => '' },
        { fileId: 'f2', smell: 'dead-code' as const, severity: 7, fix: () => '' },
      ];
      expect(refactor.getSmellCount(candidates)).toBe(2);
    });

    it('should return 0 for empty', () => {
      expect(refactor.getSmellCount([])).toBe(0);
    });
  });

  // ============================================================
  // getSmellsByType
  // ============================================================
  describe('getSmellsByType', () => {
    it('should filter by type', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 5, fix: () => '' },
        { fileId: 'f2', smell: 'god-class' as const, severity: 9, fix: () => '' },
        { fileId: 'f3', smell: 'long-method' as const, severity: 6, fix: () => '' },
      ];
      expect(refactor.getSmellsByType(candidates, 'long-method')).toHaveLength(2);
      expect(refactor.getSmellsByType(candidates, 'god-class')).toHaveLength(1);
    });

    it('should return empty for unknown type', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 5, fix: () => '' },
      ];
      expect(refactor.getSmellsByType(candidates, 'dead-code')).toHaveLength(0);
    });
  });

  // ============================================================
  // getTotalSeverity / getAverageSeverity
  // ============================================================
  describe('getTotalSeverity / getAverageSeverity', () => {
    it('should calculate total severity', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 5, fix: () => '' },
        { fileId: 'f2', smell: 'dead-code' as const, severity: 7, fix: () => '' },
      ];
      expect(refactor.getTotalSeverity(candidates)).toBe(12);
    });

    it('should calculate average severity', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 4, fix: () => '' },
        { fileId: 'f2', smell: 'dead-code' as const, severity: 8, fix: () => '' },
      ];
      expect(refactor.getAverageSeverity(candidates)).toBe(6);
    });

    it('should return 0 for empty', () => {
      expect(refactor.getTotalSeverity([])).toBe(0);
      expect(refactor.getAverageSeverity([])).toBe(0);
    });
  });

  // ============================================================
  // filterBySeverity
  // ============================================================
  describe('filterBySeverity', () => {
    it('should filter by min severity', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 3, fix: () => '' },
        { fileId: 'f2', smell: 'dead-code' as const, severity: 7, fix: () => '' },
        { fileId: 'f3', smell: 'god-class' as const, severity: 9, fix: () => '' },
      ];
      expect(refactor.filterBySeverity(candidates, 7)).toHaveLength(2);
    });

    it('should return empty for no matches', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 3, fix: () => '' },
      ];
      expect(refactor.filterBySeverity(candidates, 8)).toHaveLength(0);
    });
  });

  // ============================================================
  // getCriticalCount
  // ============================================================
  describe('getCriticalCount', () => {
    it('should count critical (severity >= 8)', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 3, fix: () => '' },
        { fileId: 'f2', smell: 'god-class' as const, severity: 9, fix: () => '' },
        { fileId: 'f3', smell: 'dead-code' as const, severity: 8, fix: () => '' },
      ];
      expect(refactor.getCriticalCount(candidates)).toBe(2);
    });

    it('should return 0 for none', () => {
      expect(refactor.getCriticalCount([])).toBe(0);
    });
  });

  // ============================================================
  // scanAndPrioritize
  // ============================================================
  describe('scanAndPrioritize', () => {
    it('should scan and prioritize', () => {
      const results = refactor.scanAndPrioritize(['file1.ts', 'file2.ts']);
      // Highest severity first
      expect(results[0].severity).toBeGreaterThanOrEqual(results[1].severity);
    });

    it('should handle empty', () => {
      expect(refactor.scanAndPrioritize([])).toHaveLength(0);
    });
  });

  // ============================================================
  // fullRefactor
  // ============================================================
  describe('fullRefactor', () => {
    it('should scan, prioritize and apply', () => {
      const result = refactor.fullRefactor(['file1.ts', 'file2.ts']);
      expect(result.success.length + result.failed.length).toBeGreaterThan(0);
    });

    it('should handle empty', () => {
      const result = refactor.fullRefactor([]);
      expect(result.success).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
    });
  });

  // ============================================================
  // resetStats
  // ============================================================
  describe('resetStats', () => {
    it('should reset all stats', () => {
      refactor.scan(['file1.ts']);
      refactor.resetStats();
      expect(refactor.getStats().scanned).toBe(0);
      expect(refactor.getStats().refactored).toBe(0);
      expect(refactor.getStats().failed).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle duplicate fileIds', () => {
      const results = refactor.scan(['file1.ts', 'file1.ts', 'file1.ts']);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle all smell types', () => {
      const results = refactor.scan(['LargeController.ts']);
      const smells = results.map(r => r.smell);
      expect(smells).toContain('god-class');
    });

    it('should handle extreme severity values', () => {
      const candidates = [
        { fileId: 'f1', smell: 'long-method' as const, severity: 1, fix: () => '' },
        { fileId: 'f2', smell: 'dead-code' as const, severity: 10, fix: () => '' },
      ];
      expect(refactor.getAverageSeverity(candidates)).toBe(5.5);
    });

    it('should handle large batch', () => {
      const files = Array.from({ length: 1000 }, (_, i) => `file${i}.ts`);
      refactor.scan(files);
      expect(refactor.getStats().scanned).toBe(1000);
    });
  });
});