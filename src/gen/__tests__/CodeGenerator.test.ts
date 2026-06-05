/**
 * CodeGenerator Tests
 * claude-code-design Code Generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CodeGenerator } from '../CodeGenerator';

describe('CodeGenerator', () => {
  let gen: CodeGenerator;

  beforeEach(() => {
    gen = new CodeGenerator();
  });

  afterEach(() => {
    gen.clearAll();
  });

  // ============================================================
  // addTemplate
  // ============================================================
  describe('addTemplate', () => {
    it('should add template', () => {
      expect(gen.addTemplate({ id: 't1', language: 'ts', template: 'const x = 1;', description: 'd' })).toBe(true);
    });

    it('should reject duplicate', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' })).toBe(false);
    });
  });

  // ============================================================
  // generate
  // ============================================================
  describe('generate', () => {
    it('should generate', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'const {{name}} = 1;', description: 'd' });
      const result = gen.generate('t1', { name: 'foo' });
      expect(result?.code).toBe('const foo = 1;');
    });

    it('should return null for unknown', () => {
      expect(gen.generate('unknown', {})).toBeNull();
    });

    it('should increment usage', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      gen.generate('t1', {});
      expect(gen.getUsageCount('t1')).toBe(1);
    });

    it('should use cache', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      gen.generate('t1', { x: 'y' });
      gen.generate('t1', { x: 'y' });
      expect(gen.getGeneratedCount()).toBe(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      const stats = gen.getStats();
      expect(stats.templates).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get template', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.getTemplate('t1')?.language).toBe('ts');
    });

    it('should get all', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.getAllTemplates()).toHaveLength(1);
    });

    it('should remove', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.removeTemplate('t1')).toBe(true);
    });

    it('should check existence', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.hasTemplate('t1')).toBe(true);
    });

    it('should count', () => {
      expect(gen.getCount()).toBe(0);
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get language', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.getLanguage('t1')).toBe('ts');
    });

    it('should get description', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'desc' });
      expect(gen.getDescription('t1')).toBe('desc');
    });
  });

  // ============================================================
  // updaters
  // ============================================================
  describe('updaters', () => {
    it('should update template', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.updateTemplate('t1', 'b')).toBe(true);
    });

    it('should update language', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.updateLanguage('t1', 'js')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(gen.updateTemplate('unknown', 'a')).toBe(false);
      expect(gen.updateLanguage('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // languages
  // ============================================================
  describe('languages', () => {
    it('should get all languages', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      gen.addTemplate({ id: 't2', language: 'js', template: 'a', description: 'd' });
      expect(gen.getAllLanguages()).toHaveLength(2);
    });

    it('should get by language', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.getByLanguage('ts')).toHaveLength(1);
    });
  });

  // ============================================================
  // generated
  // ============================================================
  describe('generated', () => {
    it('should get generated', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      gen.generate('t1', {});
      expect(gen.getGenerated()).toHaveLength(1);
    });

    it('should get by template', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      gen.generate('t1', {});
      expect(gen.getGeneratedByTemplate('t1')).toHaveLength(1);
    });

    it('should count', () => {
      expect(gen.getGeneratedCount()).toBe(0);
    });

    it('should clear generated', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      gen.generate('t1', {});
      gen.clearGenerated();
      expect(gen.getGeneratedCount()).toBe(0);
    });
  });

  // ============================================================
  // timestamps / cache
  // ============================================================
  describe('timestamps / cache', () => {
    it('should get created at', () => {
      gen.addTemplate({ id: 't1', language: 'ts', template: 'a', description: 'd' });
      expect(gen.getCreatedAt('t1')).toBeGreaterThan(0);
    });

    it('should clear cache', () => {
      gen.clearCache();
      expect(gen.getGeneratedCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many templates', () => {
      for (let i = 0; i < 50; i++) {
        gen.addTemplate({ id: `t${i}`, language: 'ts', template: 'a', description: 'd' });
      }
      expect(gen.getCount()).toBe(50);
    });
  });
});