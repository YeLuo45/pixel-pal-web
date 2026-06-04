/**
 * TestGenerator Tests
 * claude-code-design Test Generator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TestGenerator } from '../TestGenerator';

describe('TestGenerator', () => {
  let gen: TestGenerator;

  beforeEach(() => {
    gen = new TestGenerator();
  });

  // ============================================================
  // generateTests
  // ============================================================
  describe('generateTests', () => {
    it('should generate test code', () => {
      const code = gen.generateTests({ name: 'add', params: [{ name: 'a', type: 'number' }, { name: 'b', type: 'number' }], returnType: 'number' });
      expect(code).toContain('describe');
      expect(code).toContain('add');
    });

    it('should include function call', () => {
      const code = gen.generateTests({ name: 'foo', params: [], returnType: 'void' });
      expect(code).toContain('foo()');
    });
  });

  // ============================================================
  // detectBoundaries
  // ============================================================
  describe('detectBoundaries', () => {
    it('should detect number boundaries', () => {
      const boundaries = gen.detectBoundaries({ name: 'f', params: [{ name: 'x', type: 'number' }], returnType: 'void' });
      expect(boundaries).toContain('x: 0');
      expect(boundaries).toContain('x: -1');
    });

    it('should detect string boundaries', () => {
      const boundaries = gen.detectBoundaries({ name: 'f', params: [{ name: 's', type: 'string' }], returnType: 'void' });
      expect(boundaries).toContain("s: ''");
    });

    it('should detect array boundaries', () => {
      const boundaries = gen.detectBoundaries({ name: 'f', params: [{ name: 'arr', type: 'array' }], returnType: 'void' });
      expect(boundaries).toContain('arr: []');
    });

    it('should detect boolean boundaries', () => {
      const boundaries = gen.detectBoundaries({ name: 'f', params: [{ name: 'b', type: 'boolean' }], returnType: 'void' });
      expect(boundaries).toContain('b: true');
      expect(boundaries).toContain('b: false');
    });

    it('should return empty for no params', () => {
      const boundaries = gen.detectBoundaries({ name: 'f', params: [], returnType: 'void' });
      expect(boundaries).toEqual([]);
    });
  });

  // ============================================================
  // getCoverageEstimate
  // ============================================================
  describe('getCoverageEstimate', () => {
    it('should return 100 for no params', () => {
      expect(gen.getCoverageEstimate({ name: 'f', params: [], returnType: 'void' })).toBe(100);
    });

    it('should return higher for many params', () => {
      const params = Array.from({ length: 20 }, (_, i) => ({ name: `p${i}`, type: 'number' }));
      const estimate = gen.getCoverageEstimate({ name: 'f', params, returnType: 'void' });
      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThanOrEqual(100);
    });

    it('should return lower for few params', () => {
      expect(gen.getCoverageEstimate({ name: 'f', params: [{ name: 'x', type: 'number' }], returnType: 'void' })).toBeLessThan(100);
    });
  });

  // ============================================================
  // generateTestName
  // ============================================================
  describe('generateTestName', () => {
    it('should generate test name', () => {
      const name = gen.generateTestName({ name: 'foo', params: [], returnType: 'void' });
      expect(name).toContain('foo');
    });
  });

  // ============================================================
  // generateTestArgs
  // ============================================================
  describe('generateTestArgs', () => {
    it('should generate args for number', () => {
      const args = gen.generateTestArgs({ name: 'f', params: [{ name: 'x', type: 'number' }], returnType: 'void' });
      expect(args).toContain('0');
    });

    it('should generate args for string', () => {
      const args = gen.generateTestArgs({ name: 'f', params: [{ name: 's', type: 'string' }], returnType: 'void' });
      expect(args).toContain("''");
    });

    it('should generate multiple args', () => {
      const args = gen.generateTestArgs({ name: 'f', params: [{ name: 'a', type: 'number' }, { name: 'b', type: 'string' }], returnType: 'void' });
      expect(args.split(',').length).toBe(2);
    });

    it('should return empty for no params', () => {
      const args = gen.generateTestArgs({ name: 'f', params: [], returnType: 'void' });
      expect(args).toBe('');
    });
  });

  // ============================================================
  // param queries
  // ============================================================
  describe('param queries', () => {
    it('should get param count', () => {
      expect(gen.getParamCount({ name: 'f', params: [{ name: 'a', type: 'number' }], returnType: 'void' })).toBe(1);
    });

    it('should check hasParams', () => {
      expect(gen.hasParams({ name: 'f', params: [{ name: 'a', type: 'number' }], returnType: 'void' })).toBe(true);
      expect(gen.hasParams({ name: 'f', params: [], returnType: 'void' })).toBe(false);
    });

    it('should get return type', () => {
      expect(gen.getReturnType({ name: 'f', params: [], returnType: 'string' })).toBe('string');
    });

    it('should get param names', () => {
      const names = gen.getParamNames({ name: 'f', params: [{ name: 'a', type: 'number' }, { name: 'b', type: 'string' }], returnType: 'void' });
      expect(names).toEqual(['a', 'b']);
    });

    it('should get param types', () => {
      const types = gen.getParamTypes({ name: 'f', params: [{ name: 'a', type: 'number' }], returnType: 'void' });
      expect(types).toEqual(['number']);
    });

    it('should filter number params', () => {
      const names = gen.getNumberTypeParamNames({ name: 'f', params: [{ name: 'a', type: 'number' }, { name: 'b', type: 'string' }], returnType: 'void' });
      expect(names).toEqual(['a']);
    });

    it('should filter string params', () => {
      const names = gen.getStringTypeParamNames({ name: 'f', params: [{ name: 'a', type: 'number' }, { name: 'b', type: 'string' }], returnType: 'void' });
      expect(names).toEqual(['b']);
    });
  });

  // ============================================================
  // other generators
  // ============================================================
  describe('other generators', () => {
    it('should generate mock import', () => {
      const imp = gen.generateMockImport({ name: 'foo', params: [], returnType: 'void' });
      expect(imp).toContain('foo');
    });

    it('should generate suite name', () => {
      const suite = gen.generateSuiteName({ name: 'foo', params: [], returnType: 'void' });
      expect(suite).toContain('foo');
    });

    it('should generate empty test', () => {
      const test = gen.generateEmptyTest({ name: 'foo', params: [], returnType: 'void' });
      expect(test).toContain('foo');
    });
  });

  // ============================================================
  // isValidSpec
  // ============================================================
  describe('isValidSpec', () => {
    it('should return true for valid spec', () => {
      expect(gen.isValidSpec({ name: 'f', params: [], returnType: 'void' })).toBe(true);
    });

    it('should return false for empty name', () => {
      expect(gen.isValidSpec({ name: '', params: [], returnType: 'void' })).toBe(false);
    });
  });

  // ============================================================
  // getComplexityScore
  // ============================================================
  describe('getComplexityScore', () => {
    it('should calculate score for void return', () => {
      const score = gen.getComplexityScore({ name: 'f', params: [{ name: 'a', type: 'number' }], returnType: 'void' });
      expect(score).toBe(2);
    });

    it('should calculate score for non-void return', () => {
      const score = gen.getComplexityScore({ name: 'f', params: [{ name: 'a', type: 'number' }], returnType: 'number' });
      expect(score).toBe(3);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many params', () => {
      const params = Array.from({ length: 50 }, (_, i) => ({ name: `p${i}`, type: 'number' }));
      const boundaries = gen.detectBoundaries({ name: 'f', params, returnType: 'void' });
      expect(boundaries.length).toBe(200);
    });
  });
});