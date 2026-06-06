/**
 * AnalyzerEngine Tests
 * claude-code-design Analyzer Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AnalyzerEngine } from '../AnalyzerEngine';

describe('AnalyzerEngine', () => {
  let azr: AnalyzerEngine;

  beforeEach(() => {
    azr = new AnalyzerEngine();
  });

  afterEach(() => {
    azr.clearAll();
  });

  // ============================================================
  // analyze / getReport / remove
  // ============================================================
  describe('analyze / getReport / remove', () => {
    it('should analyze', () => {
      expect(azr.analyze('hello')).toBe('azr-1');
    });

    it('should mark as active', () => {
      const id = azr.analyze('hello');
      expect(azr.isActive(id)).toBe(true);
    });

    it('should default type to text', () => {
      const id = azr.analyze('hello');
      expect(azr.getType(id)).toBe('text');
    });

    it('should compute length result', () => {
      const id = azr.analyze('hello', 'length');
      expect(azr.getResult(id)).toBe('5');
    });

    it('should compute word-count result', () => {
      const id = azr.analyze('hello world', 'word-count');
      expect(azr.getResult(id)).toBe('2');
    });

    it('should compute uppercase result', () => {
      const id = azr.analyze('hello', 'uppercase');
      expect(azr.getResult(id)).toBe('HELLO');
    });

    it('should compute lowercase result', () => {
      const id = azr.analyze('HELLO', 'lowercase');
      expect(azr.getResult(id)).toBe('hello');
    });

    it('should compute reverse result', () => {
      const id = azr.analyze('hello', 'reverse');
      expect(azr.getResult(id)).toBe('olleh');
    });

    it('should compute hash result', () => {
      const id = azr.analyze('hello', 'hash');
      expect(azr.getResult(id)).toMatch(/^-?\d+$/);
    });

    it('should pass through for unknown type', () => {
      const id = azr.analyze('hello', 'unknown');
      expect(azr.getResult(id)).toBe('hello');
    });

    it('should get report', () => {
      const id = azr.analyze('hello');
      expect(azr.getReport(id)?.input).toBe('hello');
    });

    it('should not get inactive report', () => {
      const id = azr.analyze('hello');
      azr.setActive(id, false);
      expect(azr.getReport(id)).toBeUndefined();
    });

    it('should return undefined for unknown report', () => {
      expect(azr.getReport('unknown')).toBeUndefined();
    });

    it('should remove', () => {
      const id = azr.analyze('hello');
      expect(azr.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      azr.analyze('hello');
      const stats = azr.getStats();
      expect(stats.analyses).toBe(1);
    });

    it('should count total runs', () => {
      azr.analyze('hello');
      expect(azr.getStats().totalRuns).toBe(1);
    });

    it('should count active', () => {
      azr.analyze('hello');
      expect(azr.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = azr.analyze('hello');
      azr.setActive(id, false);
      expect(azr.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = azr.analyze('hello');
      azr.getReport(id);
      expect(azr.getStats().totalHits).toBe(1);
    });

    it('should count unique types', () => {
      azr.analyze('hello', 'length');
      azr.analyze('world', 'length');
      azr.analyze('foo', 'uppercase');
      expect(azr.getStats().uniqueTypes).toBe(2);
    });

    it('should count unique inputs', () => {
      azr.analyze('hello');
      azr.analyze('hello');
      expect(azr.getStats().uniqueInputs).toBe(1);
    });

    it('should compute avg input length', () => {
      azr.analyze('hello');
      expect(azr.getStats().avgInputLength).toBe(5);
    });

    it('should get max input length', () => {
      azr.analyze('a');
      azr.analyze('hello');
      expect(azr.getStats().maxInputLength).toBe(5);
    });

    it('should get min input length', () => {
      azr.analyze('a');
      azr.analyze('hello');
      expect(azr.getStats().minInputLength).toBe(1);
    });

    it('should compute avg result length', () => {
      azr.analyze('hello', 'uppercase');
      expect(azr.getStats().avgResultLength).toBe(5);
    });

    it('should get max result length', () => {
      azr.analyze('a', 'uppercase');
      azr.analyze('hello', 'uppercase');
      expect(azr.getStats().maxResultLength).toBe(5);
    });

    it('should get min result length', () => {
      azr.analyze('hello', 'length');
      expect(azr.getStats().minResultLength).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get analysis', () => {
      azr.analyze('hello');
      expect(azr.getAnalysis('azr-1')?.input).toBe('hello');
    });

    it('should get all', () => {
      azr.analyze('hello');
      expect(azr.getAllAnalyses()).toHaveLength(1);
    });

    it('should check existence', () => {
      azr.analyze('hello');
      expect(azr.hasAnalysis('azr-1')).toBe(true);
    });

    it('should count', () => {
      expect(azr.getCount()).toBe(0);
      azr.analyze('hello');
      expect(azr.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get input', () => {
      azr.analyze('hello');
      expect(azr.getInput('azr-1')).toBe('hello');
    });

    it('should get input length', () => {
      azr.analyze('hello');
      expect(azr.getInputLength('azr-1')).toBe(5);
    });

    it('should get result length', () => {
      azr.analyze('hello', 'uppercase');
      expect(azr.getResultLength('azr-1')).toBe(5);
    });

    it('should get history', () => {
      azr.analyze('hello');
      expect(azr.getHistory('azr-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = azr.analyze('hello');
      azr.getReport(id);
      expect(azr.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      azr.analyze('hello');
      expect(azr.setActive('azr-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(azr.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = azr.analyze('hello');
      azr.getReport(id);
      azr.setActive(id, false);
      azr.resetAll();
      expect(azr.getHits(id)).toBe(0);
      expect(azr.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by type / state
  // ============================================================
  describe('by type / state', () => {
    it('should get by type', () => {
      azr.analyze('hello', 'length');
      expect(azr.getByType('length')).toHaveLength(1);
    });

    it('should get active', () => {
      azr.analyze('hello');
      expect(azr.getActiveAnalyses()).toHaveLength(1);
    });

    it('should get inactive', () => {
      azr.analyze('hello');
      azr.setActive('azr-1', false);
      expect(azr.getInactiveAnalyses()).toHaveLength(1);
    });

    it('should get all types', () => {
      azr.analyze('a', 'length');
      azr.analyze('b', 'uppercase');
      expect(azr.getAllTypes()).toHaveLength(2);
    });

    it('should get type count', () => {
      azr.analyze('a', 'length');
      expect(azr.getTypeCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      azr.analyze('hello');
      expect(azr.getNewest()?.id).toBe('azr-1');
    });

    it('should return null for empty newest', () => {
      expect(azr.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      azr.analyze('hello');
      expect(azr.getOldest()?.id).toBe('azr-1');
    });

    it('should return null for empty oldest', () => {
      expect(azr.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      azr.analyze('hello');
      expect(azr.getCreatedAt('azr-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = azr.analyze('hello');
      azr.getReport(id);
      expect(azr.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total runs', () => {
      azr.analyze('hello');
      expect(azr.getTotalRuns()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many analyses', () => {
      for (let i = 0; i < 50; i++) {
        azr.analyze(`i${i}`);
      }
      expect(azr.getCount()).toBe(50);
    });
  });
});