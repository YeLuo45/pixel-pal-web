/**
 * TemplateEngine Tests
 * claude-code-design Template Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TemplateEngine } from '../TemplateEngine';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register', () => {
      expect(engine.register({ id: 't1', content: 'Hello {{name}}', variables: ['name'] })).toBe(true);
    });

    it('should reject duplicate', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.register({ id: 't1', content: 'b', variables: [] })).toBe(false);
    });
  });

  // ============================================================
  // render
  // ============================================================
  describe('render', () => {
    it('should render with variables', () => {
      engine.register({ id: 't1', content: 'Hello {{name}}', variables: ['name'] });
      const result = engine.render('t1', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should render with multiple variables', () => {
      engine.register({ id: 't1', content: '{{greeting}} {{name}}', variables: ['greeting', 'name'] });
      const result = engine.render('t1', { greeting: 'Hi', name: 'Alice' });
      expect(result).toBe('Hi Alice');
    });

    it('should return empty for unknown', () => {
      expect(engine.render('unknown')).toBe('');
    });

    it('should handle conditionals', () => {
      engine.register({ id: 't1', content: '{{#if show}}visible{{/if}}', variables: [] });
      expect(engine.render('t1', { show: true })).toBe('visible');
    });

    it('should handle false conditionals', () => {
      engine.register({ id: 't1', content: '{{#if show}}visible{{/if}}', variables: [] });
      expect(engine.render('t1', { show: false })).toBe('');
    });

    it('should inherit from parent', () => {
      engine.register({ id: 'parent', content: 'parent', variables: [] });
      engine.register({ id: 'child', content: 'child', variables: [], parent: 'parent' });
      expect(engine.render('child')).toContain('parent');
    });
  });

  // ============================================================
  // hasTemplate / listTemplates
  // ============================================================
  describe('hasTemplate / listTemplates', () => {
    it('should check existence', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.hasTemplate('t1')).toBe(true);
    });

    it('should list', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      engine.register({ id: 't2', content: 'b', variables: [] });
      expect(engine.listTemplates()).toHaveLength(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get template', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.getTemplate('t1')?.content).toBe('a');
    });

    it('should get all', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.getAllTemplates()).toHaveLength(1);
    });

    it('should remove', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.removeTemplate('t1')).toBe(true);
    });

    it('should count', () => {
      expect(engine.getCount()).toBe(0);
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.getCount()).toBe(1);
    });
  });

  // ============================================================
  // variables
  // ============================================================
  describe('variables', () => {
    it('should get variables', () => {
      engine.register({ id: 't1', content: 'a', variables: ['x', 'y'] });
      expect(engine.getVariables('t1')).toEqual(['x', 'y']);
    });

    it('should check hasVariable', () => {
      engine.register({ id: 't1', content: 'a', variables: ['x'] });
      expect(engine.hasVariable('t1', 'x')).toBe(true);
    });

    it('should add variable', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.addVariable('t1', 'x')).toBe(true);
    });

    it('should not add duplicate', () => {
      engine.register({ id: 't1', content: 'a', variables: ['x'] });
      engine.addVariable('t1', 'x');
      expect(engine.getVariables('t1')).toHaveLength(1);
    });

    it('should remove variable', () => {
      engine.register({ id: 't1', content: 'a', variables: ['x'] });
      expect(engine.removeVariable('t1', 'x')).toBe(true);
    });

    it('should return false for unknown add/remove', () => {
      expect(engine.addVariable('unknown', 'x')).toBe(false);
      expect(engine.removeVariable('unknown', 'x')).toBe(false);
    });
  });

  // ============================================================
  // parent / inheritance
  // ============================================================
  describe('parent / inheritance', () => {
    it('should get parent', () => {
      engine.register({ id: 'parent', content: 'a', variables: [] });
      engine.register({ id: 'child', content: 'b', variables: [], parent: 'parent' });
      expect(engine.getParent('child')).toBe('parent');
    });

    it('should check hasParent', () => {
      engine.register({ id: 'parent', content: 'a', variables: [] });
      engine.register({ id: 'child', content: 'b', variables: [], parent: 'parent' });
      expect(engine.hasParent('child')).toBe(true);
    });

    it('should get children', () => {
      engine.register({ id: 'parent', content: 'a', variables: [] });
      engine.register({ id: 'c1', content: 'b', variables: [], parent: 'parent' });
      engine.register({ id: 'c2', content: 'c', variables: [], parent: 'parent' });
      expect(engine.getChildren('parent')).toHaveLength(2);
    });

    it('should get roots', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      engine.register({ id: 'c1', content: 'b', variables: [], parent: 't1' });
      expect(engine.getRoots()).toContain('t1');
    });

    it('should count roots', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.getRootsCount()).toBe(1);
    });

    it('should update parent', () => {
      engine.register({ id: 'parent', content: 'a', variables: [] });
      engine.register({ id: 'child', content: 'b', variables: [] });
      expect(engine.updateParent('child', 'parent')).toBe(true);
    });

    it('should return false for unknown parent', () => {
      engine.register({ id: 'child', content: 'a', variables: [] });
      expect(engine.updateParent('child', 'unknown')).toBe(false);
    });
  });

  // ============================================================
  // content
  // ============================================================
  describe('content', () => {
    it('should update content', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.updateContent('t1', 'b')).toBe(true);
    });

    it('should return false for unknown update', () => {
      expect(engine.updateContent('unknown', 'a')).toBe(false);
    });

    it('should get content', () => {
      engine.register({ id: 't1', content: 'a', variables: [] });
      expect(engine.getContent('t1')).toBe('a');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many templates', () => {
      for (let i = 0; i < 50; i++) {
        engine.register({ id: `t${i}`, content: `c${i}`, variables: [] });
      }
      expect(engine.getCount()).toBe(50);
    });
  });
});