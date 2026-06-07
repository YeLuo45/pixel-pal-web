/**
 * CoverageEngine Tests
 * claude-code-design Coverage Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CoverageEngine } from '../CoverageEngine';

describe('CoverageEngine', () => {
  let cve: CoverageEngine;

  beforeEach(() => {
    cve = new CoverageEngine();
  });

  afterEach(() => {
    cve.clearAll();
  });

  describe('track / report / updateCoverage / remove', () => {
    it('should track', () => {
      expect(cve.track('file.ts', 100, 80)).toMatch(/^cve-/);
    });

    it('should default status partial', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getAllCoverages()[0].status).toBe('partial');
    });

    it('should default status full when 100%', () => {
      cve.track('file.ts', 100, 100);
      expect(cve.getAllCoverages()[0].status).toBe('full');
    });

    it('should default status uncovered when 0%', () => {
      cve.track('file.ts', 100, 0);
      expect(cve.getAllCoverages()[0].status).toBe('uncovered');
    });

    it('should mark as active', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.isActive(cve.getAllCoverages()[0].id)).toBe(true);
    });

    it('should report', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.report(id)).toBe(true);
    });

    it('should not report inactive', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.setActive(id, false);
      expect(cve.report(id)).toBe(false);
    });

    it('should return false for unknown report', () => {
      expect(cve.report('unknown')).toBe(false);
    });

    it('should update coverage', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.updateCoverage(id, 100)).toBe(true);
    });

    it('should change status on update', () => {
      const id = cve.track('file.ts', 100, 50);
      cve.updateCoverage(id, 100);
      expect(cve.isFull(id)).toBe(true);
    });

    it('should return false for unknown update', () => {
      expect(cve.updateCoverage('unknown', 100)).toBe(false);
    });

    it('should remove', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getStats().coverages).toBe(1);
    });

    it('should count total added', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getStats().totalAdded).toBe(1);
    });

    it('should count total reported', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.report(id);
      expect(cve.getStats().totalReported).toBe(1);
    });

    it('should count uncovered', () => {
      cve.track('file.ts', 100, 0);
      expect(cve.getStats().uncovered).toBe(1);
    });

    it('should count partial', () => {
      cve.track('file.ts', 100, 50);
      expect(cve.getStats().partial).toBe(1);
    });

    it('should count full', () => {
      cve.track('file.ts', 100, 100);
      expect(cve.getStats().full).toBe(1);
    });

    it('should count active', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.setActive(id, false);
      expect(cve.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.report(id);
      expect(cve.getStats().totalHits).toBe(1);
    });

    it('should count unique files', () => {
      cve.track('a.ts', 100, 80);
      cve.track('a.ts', 100, 80);
      expect(cve.getStats().uniqueFiles).toBe(1);
    });

    it('should count total lines', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getStats().totalLines).toBe(100);
    });

    it('should count total covered', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getStats().totalCovered).toBe(80);
    });
  });

  describe('queries', () => {
    it('should get coverage', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.getCoverage(id)?.file).toBe('file.ts');
    });

    it('should get all', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getAllCoverages()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.hasCoverage(id)).toBe(true);
    });

    it('should count', () => {
      expect(cve.getCount()).toBe(0);
      cve.track('file.ts', 100, 80);
      expect(cve.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get file', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.getFile(id)).toBe('file.ts');
    });

    it('should get total lines', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.getTotalLines(id)).toBe(100);
    });

    it('should get covered lines', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.getCoveredLines(id)).toBe(80);
    });

    it('should get ratio', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.getRatio(id)).toBe(0.8);
    });

    it('should get ratio 0 for no lines', () => {
      const id = cve.track('file.ts', 0, 0);
      expect(cve.getRatio(id)).toBe(0);
    });

    it('should get hits', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.report(id);
      expect(cve.getHits(id)).toBe(1);
    });

    it('should check full', () => {
      cve.track('file.ts', 100, 100);
      expect(cve.isFull(cve.getAllCoverages()[0].id)).toBe(true);
    });

    it('should check partial', () => {
      cve.track('file.ts', 100, 50);
      expect(cve.isPartial(cve.getAllCoverages()[0].id)).toBe(true);
    });

    it('should check uncovered', () => {
      cve.track('file.ts', 100, 0);
      expect(cve.isUncovered(cve.getAllCoverages()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.setActive(id, false)).toBe(true);
    });

    it('should set file', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.setFile(id, 'other.ts')).toBe(true);
    });

    it('should set total lines', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.setTotalLines(id, 200)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cve.setActive('unknown', false)).toBe(false);
      expect(cve.setFile('unknown', 'f')).toBe(false);
      expect(cve.setTotalLines('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.setActive(id, false);
      cve.resetAll();
      expect(cve.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      cve.track('file.ts', 100, 100);
      expect(cve.getByStatus('full')).toHaveLength(1);
    });

    it('should get active', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getActiveCoverages()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.setActive(id, false);
      expect(cve.getInactiveCoverages()).toHaveLength(1);
    });

    it('should get all files', () => {
      cve.track('a.ts', 100, 80);
      cve.track('b.ts', 100, 80);
      expect(cve.getAllFiles()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getNewest()?.file).toBe('file.ts');
    });

    it('should return null for empty newest', () => {
      expect(cve.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getOldest()?.file).toBe('file.ts');
    });

    it('should return null for empty oldest', () => {
      expect(cve.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = cve.track('file.ts', 100, 80);
      expect(cve.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.report(id);
      expect(cve.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      cve.track('file.ts', 100, 80);
      expect(cve.getTotalAdded()).toBe(1);
    });

    it('should get total reported', () => {
      const id = cve.track('file.ts', 100, 80);
      cve.report(id);
      expect(cve.getTotalReported()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many coverages', () => {
      for (let i = 0; i < 50; i++) {
        cve.track(`file${i}.ts`, 100, 80);
      }
      expect(cve.getCount()).toBe(50);
    });
  });
});