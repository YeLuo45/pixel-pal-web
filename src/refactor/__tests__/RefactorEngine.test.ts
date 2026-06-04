/**
 * RefactorEngine Tests
 * claude-code-design Refactor Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RefactorEngine } from '../RefactorEngine';

describe('RefactorEngine', () => {
  let engine: RefactorEngine;

  beforeEach(() => {
    engine = new RefactorEngine();
    engine.addPattern({ name: 'long-file', description: 'Split long files', risk: 'medium' });
    engine.addPattern({ name: 'complex-conditionals', description: 'Simplify conditionals', risk: 'low' });
    engine.addPattern({ name: 'nested-loops', description: 'Flatten nested loops', risk: 'high' });
    engine.addPattern({ name: 'var-usage', description: 'Replace var with let', risk: 'low' });
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // addPattern
  // ============================================================
  describe('addPattern', () => {
    it('should add pattern', () => {
      engine.addPattern({ name: 'p1', description: 'd', risk: 'low' });
      expect(engine.getPatternCount()).toBe(5);
    });

    it('should not mutate input', () => {
      const p = { name: 'p1', description: 'd', risk: 'low' as const };
      engine.addPattern(p);
      p.description = 'changed';
      expect(engine.getPattern('p1')?.description).toBe('d');
    });
  });

  // ============================================================
  // recognize
  // ============================================================
  describe('recognize', () => {
    it('should recognize long file', () => {
      const code = 'x'.repeat(600);
      const patterns = engine.recognize(code);
      expect(patterns.some(p => p.name === 'long-file')).toBe(true);
    });

    it('should recognize complex conditionals', () => {
      const code = 'if (a) {} if (b) {} if (c) {} if (d) {} if (e) {} if (f) {}';
      const patterns = engine.recognize(code);
      expect(patterns.some(p => p.name === 'complex-conditionals')).toBe(true);
    });

    it('should recognize nested loops', () => {
      const code = 'for (i) {} for (j) {} for (k) {} for (l) {}';
      const patterns = engine.recognize(code);
      expect(patterns.some(p => p.name === 'nested-loops')).toBe(true);
    });

    it('should recognize var usage', () => {
      const code = 'var x = 1;';
      const patterns = engine.recognize(code);
      expect(patterns.some(p => p.name === 'var-usage')).toBe(true);
    });

    it('should return empty for clean code', () => {
      const code = 'let x = 1;';
      const patterns = engine.recognize(code);
      expect(patterns).toHaveLength(0);
    });
  });

  // ============================================================
  // refactor
  // ============================================================
  describe('refactor', () => {
    it('should replace var with let', () => {
      const result = engine.refactor('var x = 1;', 'var-usage');
      expect(result).toContain('let x');
    });

    it('should add comment for long file', () => {
      const result = engine.refactor('code', 'long-file');
      expect(result).toContain('// Refactored');
    });

    it('should simplify conditionals', () => {
      const result = engine.refactor('if (x) {', 'complex-conditionals');
      expect(result).toContain('((');
    });

    it('should return original for unknown pattern', () => {
      const result = engine.refactor('code', 'unknown');
      expect(result).toBe('code');
    });
  });

  // ============================================================
  // assessRisk
  // ============================================================
  describe('assessRisk', () => {
    it('should return risk for pattern', () => {
      expect(engine.assessRisk('nested-loops')).toBe('high');
    });

    it('should return medium for unknown', () => {
      expect(engine.assessRisk('unknown')).toBe('medium');
    });
  });

  // ============================================================
  // getHistory / clearHistory
  // ============================================================
  describe('history', () => {
    it('should track refactor', () => {
      engine.refactor('code', 'var-usage');
      expect(engine.getHistoryCount()).toBe(1);
    });

    it('should clear history', () => {
      engine.refactor('code', 'var-usage');
      engine.clearHistory();
      expect(engine.getHistoryCount()).toBe(0);
    });
  });

  // ============================================================
  // getPattern / getAllPatterns / removePattern
  // ============================================================
  describe('pattern queries', () => {
    it('should get pattern', () => {
      expect(engine.getPattern('var-usage')?.description).toBe('Replace var with let');
    });

    it('should get all patterns', () => {
      expect(engine.getAllPatterns().length).toBeGreaterThan(0);
    });

    it('should remove pattern', () => {
      expect(engine.removePattern('var-usage')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(engine.removePattern('unknown')).toBe(false);
    });
  });

  // ============================================================
  // success/failure
  // ============================================================
  describe('success/failure', () => {
    it('should track successful refactor', () => {
      engine.refactor('var x = 1;', 'var-usage');
      expect(engine.getSuccessfulRefactors()).toHaveLength(1);
    });

    it('should calculate success rate', () => {
      engine.refactor('var x = 1;', 'var-usage');
      expect(engine.getSuccessRate()).toBe(1);
    });
  });

  // ============================================================
  // getRefactorByPattern
  // ============================================================
  describe('getRefactorByPattern', () => {
    it('should filter by pattern', () => {
      engine.refactor('var x = 1;', 'var-usage');
      engine.refactor('var y = 2;', 'var-usage');
      expect(engine.getRefactorByPattern('var-usage')).toHaveLength(2);
    });
  });

  // ============================================================
  // risk queries
  // ============================================================
  describe('risk queries', () => {
    it('should get high risk patterns', () => {
      const high = engine.getHighRiskPatterns();
      expect(high.some(p => p.name === 'nested-loops')).toBe(true);
    });

    it('should get low risk patterns', () => {
      const low = engine.getLowRiskPatterns();
      expect(low.some(p => p.name === 'var-usage')).toBe(true);
    });
  });

  // ============================================================
  // getLastRefactor / hasPattern
  // ============================================================
  describe('getLastRefactor / hasPattern', () => {
    it('should get last refactor', () => {
      engine.refactor('var x = 1;', 'var-usage');
      expect(engine.getLastRefactor()?.pattern).toBe('var-usage');
    });

    it('should check pattern existence', () => {
      expect(engine.hasPattern('var-usage')).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many patterns', () => {
      for (let i = 0; i < 20; i++) {
        engine.addPattern({ name: `p${i}`, description: 'd', risk: 'low' });
      }
      expect(engine.getPatternCount()).toBeGreaterThan(20);
    });

    it('should handle many refactors', () => {
      for (let i = 0; i < 30; i++) {
        engine.refactor(`var x${i} = ${i};`, 'var-usage');
      }
      expect(engine.getHistoryCount()).toBe(30);
    });
  });
});