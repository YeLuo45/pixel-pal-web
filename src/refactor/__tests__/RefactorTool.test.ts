/**
 * RefactorTool Tests
 * claude-code-design Refactor Tool
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RefactorTool } from '../RefactorTool';

describe('RefactorTool', () => {
  let tool: RefactorTool;

  beforeEach(() => {
    tool = new RefactorTool();
  });

  afterEach(() => {
    tool.clearAll();
  });

  // ============================================================
  // addRule
  // ============================================================
  describe('addRule', () => {
    it('should add rule', () => {
      expect(tool.addRule({ id: 'r1', name: 'test', pattern: 'a', replacement: 'b', description: 'd' })).toBe(true);
    });

    it('should reject duplicate', () => {
      tool.addRule({ id: 'r1', name: 'test', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.addRule({ id: 'r1', name: 'test', pattern: 'a', replacement: 'b', description: 'd' })).toBe(false);
    });
  });

  // ============================================================
  // transform
  // ============================================================
  describe('transform', () => {
    it('should transform', () => {
      tool.addRule({ id: 'r1', name: 'test', pattern: 'foo', replacement: 'bar', description: 'd' });
      const result = tool.transform('foo', 'r1');
      expect(result?.transformed).toBe('bar');
    });

    it('should return null for unknown rule', () => {
      expect(tool.transform('foo', 'unknown')).toBeNull();
    });

    it('should set changed to true', () => {
      tool.addRule({ id: 'r1', name: 'test', pattern: 'foo', replacement: 'bar', description: 'd' });
      const result = tool.transform('foo', 'r1');
      expect(result?.changed).toBe(true);
    });

    it('should set changed to false when no match', () => {
      tool.addRule({ id: 'r1', name: 'test', pattern: 'foo', replacement: 'bar', description: 'd' });
      const result = tool.transform('baz', 'r1');
      expect(result?.changed).toBe(false);
    });

    it('should increment usage', () => {
      tool.addRule({ id: 'r1', name: 'test', pattern: 'foo', replacement: 'bar', description: 'd' });
      tool.transform('foo', 'r1');
      expect(tool.getUsageCount('r1')).toBe(1);
    });
  });

  // ============================================================
  // detectPatterns
  // ============================================================
  describe('detectPatterns', () => {
    it('should detect patterns', () => {
      tool.addRule({ id: 'r1', name: 'test', pattern: 'foo', replacement: 'bar', description: 'd' });
      expect(tool.detectPatterns('foo bar')).toContain('r1');
    });

    it('should return empty for no match', () => {
      expect(tool.detectPatterns('xyz')).toEqual([]);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tool.addRule({ id: 'r1', name: 'test', pattern: 'a', replacement: 'b', description: 'd' });
      const stats = tool.getStats();
      expect(stats.rules).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get rule', () => {
      tool.addRule({ id: 'r1', name: 'test', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.getRule('r1')?.name).toBe('test');
    });

    it('should get all', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.getAllRules()).toHaveLength(1);
    });

    it('should remove', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.removeRule('r1')).toBe(true);
    });

    it('should check existence', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.hasRule('r1')).toBe(true);
    });

    it('should count', () => {
      expect(tool.getCount()).toBe(0);
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.getName('r1')).toBe('a');
    });

    it('should get description', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'desc' });
      expect(tool.getDescription('r1')).toBe('desc');
    });

    it('should get pattern', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'foo', replacement: 'b', description: 'd' });
      expect(tool.getPattern('r1')).toBe('foo');
    });

    it('should get replacement', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'bar', description: 'd' });
      expect(tool.getReplacement('r1')).toBe('bar');
    });
  });

  // ============================================================
  // updaters
  // ============================================================
  describe('updaters', () => {
    it('should update pattern', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.updatePattern('r1', 'foo')).toBe(true);
    });

    it('should update replacement', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.updateReplacement('r1', 'bar')).toBe(true);
    });

    it('should update name', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.updateName('r1', 'new')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tool.updatePattern('unknown', 'a')).toBe(false);
      expect(tool.updateReplacement('unknown', 'b')).toBe(false);
      expect(tool.updateName('unknown', 'n')).toBe(false);
    });
  });

  // ============================================================
  // usage
  // ============================================================
  describe('usage', () => {
    it('should get most used', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      tool.addRule({ id: 'r2', name: 'b', pattern: 'a', replacement: 'b', description: 'd' });
      tool.transform('a', 'r1');
      tool.transform('a', 'r1');
      expect(tool.getMostUsed()?.id).toBe('r1');
    });

    it('should return null for empty', () => {
      expect(tool.getMostUsed()).toBeNull();
    });

    it('should get least used', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.getLeastUsed()?.id).toBe('r1');
    });

    it('should return null for empty least', () => {
      expect(tool.getLeastUsed()).toBeNull();
    });
  });

  // ============================================================
  // transformations
  // ============================================================
  describe('transformations', () => {
    it('should get transformations', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'foo', replacement: 'bar', description: 'd' });
      tool.transform('foo', 'r1');
      expect(tool.getTransformations()).toHaveLength(1);
    });

    it('should get for rule', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'foo', replacement: 'bar', description: 'd' });
      tool.transform('foo', 'r1');
      expect(tool.getTransformationsForRule('r1')).toHaveLength(1);
    });

    it('should count', () => {
      expect(tool.getTransformationCount()).toBe(0);
    });

    it('should count changed', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'foo', replacement: 'bar', description: 'd' });
      tool.transform('foo', 'r1');
      expect(tool.getChangedTransformationCount()).toBe(1);
    });

    it('should count unchanged', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'foo', replacement: 'bar', description: 'd' });
      tool.transform('xyz', 'r1');
      expect(tool.getUnchangedTransformationCount()).toBe(1);
    });

    it('should clear', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'foo', replacement: 'bar', description: 'd' });
      tool.transform('foo', 'r1');
      tool.clearTransformations();
      expect(tool.getTransformationCount()).toBe(0);
    });
  });

  // ============================================================
  // created
  // ============================================================
  describe('created', () => {
    it('should get created at', () => {
      tool.addRule({ id: 'r1', name: 'a', pattern: 'a', replacement: 'b', description: 'd' });
      expect(tool.getCreatedAt('r1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many rules', () => {
      for (let i = 0; i < 50; i++) {
        tool.addRule({ id: `r${i}`, name: `r${i}`, pattern: `a${i}`, replacement: `b${i}`, description: 'd' });
      }
      expect(tool.getCount()).toBe(50);
    });
  });
});