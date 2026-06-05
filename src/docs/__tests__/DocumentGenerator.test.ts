/**
 * DocumentGenerator Tests
 * claude-code-design Document Generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DocumentGenerator } from '../DocumentGenerator';

describe('DocumentGenerator', () => {
  let gen: DocumentGenerator;

  beforeEach(() => {
    gen = new DocumentGenerator();
  });

  afterEach(() => {
    gen.clearAll();
  });

  // ============================================================
  // addTemplate
  // ============================================================
  describe('addTemplate', () => {
    it('should add template', () => {
      gen.addTemplate({ name: 't1', sections: ['intro', 'body'] });
      expect(gen.getTemplateCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const sections = ['a'];
      gen.addTemplate({ name: 't1', sections });
      sections.push('b');
      expect(gen.getSections('t1')).toEqual(['a']);
    });
  });

  // ============================================================
  // generate
  // ============================================================
  describe('generate', () => {
    it('should generate document', () => {
      gen.addTemplate({ name: 't1', sections: ['intro'] });
      const doc = gen.generate('t1', { intro: 'Hello' });
      expect(doc.sections).toHaveLength(1);
    });

    it('should return empty for unknown template', () => {
      const doc = gen.generate('unknown', {});
      expect(doc.sections).toHaveLength(0);
    });

    it('should use template data', () => {
      gen.addTemplate({ name: 't1', sections: ['intro', 'body'] });
      const doc = gen.generate('t1', { intro: 'Hello', body: 'World' });
      expect(doc.sections[0].body).toBe('Hello');
      expect(doc.sections[1].body).toBe('World');
    });

    it('should use empty for missing data', () => {
      gen.addTemplate({ name: 't1', sections: ['intro'] });
      const doc = gen.generate('t1', {});
      expect(doc.sections[0].body).toBe('');
    });
  });

  // ============================================================
  // validate
  // ============================================================
  describe('validate', () => {
    it('should validate valid document', () => {
      const doc = { title: 'Test', content: '', sections: [{ name: 'a', body: 'b' }] };
      expect(gen.validate(doc)).toBe(true);
    });

    it('should reject empty title', () => {
      const doc = { title: '', content: '', sections: [{ name: 'a', body: 'b' }] };
      expect(gen.validate(doc)).toBe(false);
    });

    it('should reject no sections', () => {
      const doc = { title: 'Test', content: '', sections: [] };
      expect(gen.validate(doc)).toBe(false);
    });

    it('should reject empty section name', () => {
      const doc = { title: 'Test', content: '', sections: [{ name: '', body: 'b' }] };
      expect(gen.validate(doc)).toBe(false);
    });
  });

  // ============================================================
  // export
  // ============================================================
  describe('export', () => {
    const doc = { title: 'Test', content: '', sections: [{ name: 'a', body: 'b' }] };

    it('should export as json', () => {
      const result = gen.export(doc, 'json');
      expect(result).toContain('Test');
    });

    it('should export as md', () => {
      const result = gen.export(doc, 'md');
      expect(result).toContain('# Test');
    });

    it('should export as html', () => {
      const result = gen.export(doc, 'html');
      expect(result).toContain('<h1>');
    });
  });

  // ============================================================
  // template queries
  // ============================================================
  describe('template queries', () => {
    it('should get template', () => {
      gen.addTemplate({ name: 't1', sections: ['a'] });
      expect(gen.getTemplate('t1')?.name).toBe('t1');
    });

    it('should get all templates', () => {
      gen.addTemplate({ name: 't1', sections: ['a'] });
      gen.addTemplate({ name: 't2', sections: ['b'] });
      expect(gen.getAllTemplates()).toHaveLength(2);
    });

    it('should remove template', () => {
      gen.addTemplate({ name: 't1', sections: ['a'] });
      expect(gen.removeTemplate('t1')).toBe(true);
    });

    it('should check existence', () => {
      gen.addTemplate({ name: 't1', sections: ['a'] });
      expect(gen.hasTemplate('t1')).toBe(true);
    });

    it('should count', () => {
      expect(gen.getTemplateCount()).toBe(0);
      gen.addTemplate({ name: 't1', sections: ['a'] });
      expect(gen.getTemplateCount()).toBe(1);
    });
  });

  // ============================================================
  // section management
  // ============================================================
  describe('section management', () => {
    it('should get section count', () => {
      gen.addTemplate({ name: 't1', sections: ['a', 'b'] });
      expect(gen.getSectionCount('t1')).toBe(2);
    });

    it('should add section', () => {
      gen.addTemplate({ name: 't1', sections: ['a'] });
      expect(gen.addSection('t1', 'b')).toBe(true);
    });

    it('should not add duplicate', () => {
      gen.addTemplate({ name: 't1', sections: ['a'] });
      gen.addSection('t1', 'a');
      expect(gen.getSectionCount('t1')).toBe(1);
    });

    it('should remove section', () => {
      gen.addTemplate({ name: 't1', sections: ['a', 'b'] });
      expect(gen.removeSection('t1', 'a')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(gen.addSection('unknown', 'a')).toBe(false);
      expect(gen.removeSection('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // validateTemplate
  // ============================================================
  describe('validateTemplate', () => {
    it('should validate', () => {
      expect(gen.validateTemplate({ name: 't1', sections: ['a'] })).toBe(true);
    });

    it('should reject empty name', () => {
      expect(gen.validateTemplate({ name: '', sections: ['a'] })).toBe(false);
    });

    it('should reject empty sections', () => {
      expect(gen.validateTemplate({ name: 't1', sections: [] })).toBe(false);
    });
  });

  // ============================================================
  // generateSummary
  // ============================================================
  describe('generateSummary', () => {
    it('should generate summary', () => {
      const doc = { title: 'Test', content: 'hello world', sections: [{ name: 'a', body: 'b' }] };
      const summary = gen.generateSummary(doc);
      expect(summary).toContain('Test');
    });
  });

  // ============================================================
  // searchSections
  // ============================================================
  describe('searchSections', () => {
    it('should search sections', () => {
      const doc = { title: 'Test', content: '', sections: [{ name: 'a', body: 'hello world' }] };
      const results = gen.searchSections(doc, 'hello');
      expect(results).toHaveLength(1);
    });

    it('should be case-insensitive', () => {
      const doc = { title: 'Test', content: '', sections: [{ name: 'a', body: 'Hello World' }] };
      const results = gen.searchSections(doc, 'hello');
      expect(results).toHaveLength(1);
    });
  });

  // ============================================================
  // section helpers
  // ============================================================
  describe('section helpers', () => {
    const doc = { title: 'Test', content: '', sections: [{ name: 'a', body: 'b' }, { name: 'c', body: 'd' }] };

    it('should get section names', () => {
      expect(gen.getSectionNames(doc)).toEqual(['a', 'c']);
    });

    it('should get section body', () => {
      expect(gen.getSectionBody(doc, 'a')).toBe('b');
    });

    it('should return undefined for unknown', () => {
      expect(gen.getSectionBody(doc, 'unknown')).toBeUndefined();
    });

    it('should update section', () => {
      const updated = gen.updateSection(doc, 'a', 'new body');
      expect(updated.sections[0].body).toBe('new body');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many templates', () => {
      for (let i = 0; i < 50; i++) {
        gen.addTemplate({ name: `t${i}`, sections: ['a'] });
      }
      expect(gen.getTemplateCount()).toBe(50);
    });
  });
});