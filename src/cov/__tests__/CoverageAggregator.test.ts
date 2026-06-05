/**
 * CoverageAggregator Tests
 * claude-code-design Coverage Aggregator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CoverageAggregator } from '../CoverageAggregator';

describe('CoverageAggregator', () => {
  let ca: CoverageAggregator;

  beforeEach(() => {
    ca = new CoverageAggregator();
  });

  afterEach(() => {
    ca.clearAll();
  });

  // ============================================================
  // add / getOverall / getFailing
  // ============================================================
  describe('add / getOverall / getFailing', () => {
    it('should add', () => {
      expect(ca.add('a.ts', 100)).toBe('cov-1');
    });

    it('should get overall', () => {
      ca.add('a.ts', 80);
      ca.add('b.ts', 100);
      expect(ca.getOverall()).toBe(90);
    });

    it('should return 0 for empty', () => {
      expect(ca.getOverall()).toBe(0);
    });

    it('should get failing', () => {
      ca.add('a.ts', 50);
      expect(ca.getFailing()).toHaveLength(1);
    });

    it('should not get passing as failing', () => {
      ca.add('a.ts', 100);
      expect(ca.getFailing()).toHaveLength(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ca.add('a.ts', 100);
      const stats = ca.getStats();
      expect(stats.files).toBe(1);
    });

    it('should count failing', () => {
      ca.add('a.ts', 50);
      expect(ca.getStats().failing).toBe(1);
    });

    it('should count passing', () => {
      ca.add('a.ts', 100);
      expect(ca.getStats().passing).toBe(1);
    });

    it('should compute avg coverage', () => {
      ca.add('a.ts', 100);
      expect(ca.getStats().avgCoverage).toBe(100);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get coverage', () => {
      ca.add('a.ts', 100);
      expect(ca.getCoverage('cov-1')?.file).toBe('a.ts');
    });

    it('should get all', () => {
      ca.add('a.ts', 100);
      expect(ca.getAllCoverages()).toHaveLength(1);
    });

    it('should remove', () => {
      ca.add('a.ts', 100);
      expect(ca.removeCoverage('cov-1')).toBe(true);
    });

    it('should check existence', () => {
      ca.add('a.ts', 100);
      expect(ca.hasCoverage('cov-1')).toBe(true);
    });

    it('should count', () => {
      expect(ca.getCount()).toBe(0);
      ca.add('a.ts', 100);
      expect(ca.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get file', () => {
      ca.add('a.ts', 100);
      expect(ca.getFile('cov-1')).toBe('a.ts');
    });

    it('should get coverage value', () => {
      ca.add('a.ts', 80);
      expect(ca.getCoverageValue('cov-1')).toBe(80);
    });

    it('should get threshold', () => {
      ca.add('a.ts', 100);
      expect(ca.getThreshold('cov-1')).toBe(99);
    });

    it('should check isPassing', () => {
      ca.add('a.ts', 100);
      expect(ca.isPassing('cov-1')).toBe(true);
    });
  });

  // ============================================================
  // threshold
  // ============================================================
  describe('threshold', () => {
    it('should set default threshold', () => {
      ca.setDefaultThreshold(80);
      expect(ca.getDefaultThreshold()).toBe(80);
    });

    it('should set threshold', () => {
      const id = ca.add('a.ts', 100);
      expect(ca.setThreshold(id, 80)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ca.setThreshold('unknown', 80)).toBe(false);
    });

    it('should recheck passing on threshold change', () => {
      const id = ca.add('a.ts', 50);
      ca.setThreshold(id, 30);
      expect(ca.isPassing(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set coverage', () => {
      const id = ca.add('a.ts', 50);
      expect(ca.setCoverage(id, 100)).toBe(true);
    });

    it('should set file', () => {
      const id = ca.add('a.ts', 100);
      expect(ca.setFile(id, 'b.ts')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ca.setCoverage('unknown', 100)).toBe(false);
      expect(ca.setFile('unknown', 'a.ts')).toBe(false);
    });
  });

  // ============================================================
  // recheck
  // ============================================================
  describe('recheck', () => {
    it('should recheck', () => {
      ca.add('a.ts', 100);
      ca.recheck();
      expect(ca.isPassing('cov-1')).toBe(true);
    });
  });

  // ============================================================
  // by file / coverage
  // ============================================================
  describe('by file / coverage', () => {
    it('should get by file', () => {
      ca.add('a.ts', 100);
      expect(ca.getByFile('a.ts')).toHaveLength(1);
    });

    it('should get passing', () => {
      ca.add('a.ts', 100);
      expect(ca.getPassing()).toHaveLength(1);
    });

    it('should get by min coverage', () => {
      ca.add('a.ts', 100);
      ca.add('b.ts', 50);
      expect(ca.getByMinCoverage(80)).toHaveLength(1);
    });

    it('should get by max coverage', () => {
      ca.add('a.ts', 100);
      ca.add('b.ts', 50);
      expect(ca.getByMaxCoverage(60)).toHaveLength(1);
    });
  });

  // ============================================================
  // files
  // ============================================================
  describe('files', () => {
    it('should get all files', () => {
      ca.add('a.ts', 100);
      ca.add('b.ts', 100);
      expect(ca.getAllFiles()).toHaveLength(2);
    });

    it('should get file count', () => {
      ca.add('a.ts', 100);
      expect(ca.getFileCount()).toBe(1);
    });
  });

  // ============================================================
  // coverage range
  // ============================================================
  describe('coverage range', () => {
    it('should get min coverage', () => {
      ca.add('a.ts', 80);
      ca.add('b.ts', 100);
      expect(ca.getMinCoverage()).toBe(80);
    });

    it('should get max coverage', () => {
      ca.add('a.ts', 80);
      ca.add('b.ts', 100);
      expect(ca.getMaxCoverage()).toBe(100);
    });

    it('should return 0 for empty min', () => {
      expect(ca.getMinCoverage()).toBe(0);
    });

    it('should return 0 for empty max', () => {
      expect(ca.getMaxCoverage()).toBe(0);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ca.add('a.ts', 100);
      expect(ca.getCreatedAt('cov-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ca.add('a.ts', 100);
      ca.setCoverage(id, 80);
      expect(ca.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get lowest', () => {
      ca.add('a.ts', 80);
      ca.add('b.ts', 100);
      expect(ca.getLowest()?.file).toBe('a.ts');
    });

    it('should return null for empty lowest', () => {
      expect(ca.getLowest()).toBeNull();
    });

    it('should get highest', () => {
      ca.add('a.ts', 80);
      ca.add('b.ts', 100);
      expect(ca.getHighest()?.file).toBe('b.ts');
    });

    it('should return null for empty highest', () => {
      expect(ca.getHighest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many files', () => {
      for (let i = 0; i < 50; i++) {
        ca.add(`f${i}.ts`, 100);
      }
      expect(ca.getCount()).toBe(50);
    });
  });
});