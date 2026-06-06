/**
 * SnippetEngine Tests
 * claude-code-design Snippet Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SnippetEngine } from '../SnippetEngine';

describe('SnippetEngine', () => {
  let sne: SnippetEngine;

  beforeEach(() => {
    sne = new SnippetEngine();
  });

  afterEach(() => {
    sne.clearAll();
  });

  // ============================================================
  // create / get / search / remove / addTag / removeTag
  // ============================================================
  describe('create / get / search / remove / addTag / removeTag', () => {
    it('should create', () => {
      expect(sne.create('Hello', 'js', 'console.log("hi")', ['log'])).toBe('sne-1');
    });

    it('should mark as active', () => {
      const id = sne.create('Hello', 'js', 'code');
      expect(sne.isActive(id)).toBe(true);
    });

    it('should default tags to empty', () => {
      const id = sne.create('Hello', 'js', 'code');
      expect(sne.getTags(id)).toEqual([]);
    });

    it('should get', () => {
      const id = sne.create('Hello', 'js', 'code');
      expect(sne.get(id)?.title).toBe('Hello');
    });

    it('should not get inactive', () => {
      const id = sne.create('Hello', 'js', 'code');
      sne.setActive(id, false);
      expect(sne.get(id)).toBeUndefined();
    });

    it('should return undefined for unknown get', () => {
      expect(sne.get('unknown')).toBeUndefined();
    });

    it('should search by title', () => {
      sne.create('Hello world', 'js', 'code');
      expect(sne.search('Hello')).toHaveLength(1);
    });

    it('should search by content', () => {
      sne.create('A', 'js', 'hello world');
      expect(sne.search('hello')).toHaveLength(1);
    });

    it('should search by tag', () => {
      sne.create('A', 'js', 'code', ['log']);
      expect(sne.search('log')).toHaveLength(1);
    });

    it('should not search inactive', () => {
      const id = sne.create('Hello', 'js', 'code');
      sne.setActive(id, false);
      expect(sne.search('Hello')).toHaveLength(0);
    });

    it('should remove', () => {
      const id = sne.create('Hello', 'js', 'code');
      expect(sne.remove(id)).toBe(true);
    });

    it('should add tag', () => {
      const id = sne.create('Hello', 'js', 'code');
      expect(sne.addTag(id, 'log')).toBe(true);
    });

    it('should not add duplicate tag', () => {
      const id = sne.create('Hello', 'js', 'code', ['log']);
      sne.addTag(id, 'log');
      expect(sne.getTags(id)).toEqual(['log']);
    });

    it('should return false for unknown addTag', () => {
      expect(sne.addTag('unknown', 't')).toBe(false);
    });

    it('should remove tag', () => {
      const id = sne.create('Hello', 'js', 'code', ['log']);
      expect(sne.removeTag(id, 'log')).toBe(true);
    });

    it('should return false for missing removeTag', () => {
      const id = sne.create('Hello', 'js', 'code');
      expect(sne.removeTag(id, 'missing')).toBe(false);
    });

    it('should return false for unknown removeTag', () => {
      expect(sne.removeTag('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sne.create('Hello', 'js', 'code');
      const stats = sne.getStats();
      expect(stats.snippets).toBe(1);
    });

    it('should count active', () => {
      sne.create('Hello', 'js', 'code');
      expect(sne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sne.create('Hello', 'js', 'code');
      sne.setActive(id, false);
      expect(sne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sne.create('Hello', 'js', 'code');
      sne.get(id);
      expect(sne.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      sne.create('A', 'js', 'a');
      sne.create('B', 'js', 'b');
      expect(sne.getStats().uniqueTitles).toBe(2);
    });

    it('should count unique languages', () => {
      sne.create('A', 'js', 'a');
      sne.create('B', 'py', 'b');
      expect(sne.getStats().uniqueLanguages).toBe(2);
    });

    it('should compute avg content length', () => {
      sne.create('A', 'js', 'code');
      expect(sne.getStats().avgContentLength).toBe(4);
    });

    it('should get max content length', () => {
      sne.create('A', 'js', 'a');
      sne.create('B', 'js', 'hello');
      expect(sne.getStats().maxContentLength).toBe(5);
    });

    it('should get min content length', () => {
      sne.create('A', 'js', 'a');
      sne.create('B', 'js', 'hello');
      expect(sne.getStats().minContentLength).toBe(1);
    });

    it('should compute avg tags', () => {
      sne.create('A', 'js', 'a', ['x', 'y']);
      expect(sne.getStats().avgTags).toBe(2);
    });

    it('should get max tags', () => {
      sne.create('A', 'js', 'a', ['x', 'y', 'z']);
      expect(sne.getStats().maxTags).toBe(3);
    });

    it('should get min tags', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getStats().minTags).toBe(0);
    });

    it('should count total tags', () => {
      sne.create('A', 'js', 'a', ['x', 'y']);
      expect(sne.getStats().totalTags).toBe(2);
    });

    it('should count unique tags', () => {
      sne.create('A', 'js', 'a', ['x', 'y']);
      sne.create('B', 'js', 'b', ['y', 'z']);
      expect(sne.getStats().uniqueTags).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get snippet', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getSnippet('sne-1')?.title).toBe('A');
    });

    it('should get all', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getAllSnippets()).toHaveLength(1);
    });

    it('should check existence', () => {
      sne.create('A', 'js', 'a');
      expect(sne.hasSnippet('sne-1')).toBe(true);
    });

    it('should count', () => {
      expect(sne.getCount()).toBe(0);
      sne.create('A', 'js', 'a');
      expect(sne.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get title', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getTitle('sne-1')).toBe('A');
    });

    it('should get language', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getLanguage('sne-1')).toBe('js');
    });

    it('should get content', () => {
      sne.create('A', 'js', 'code');
      expect(sne.getContent('sne-1')).toBe('code');
    });

    it('should get content length', () => {
      sne.create('A', 'js', 'code');
      expect(sne.getContentLength('sne-1')).toBe(4);
    });

    it('should get history', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getHistory('sne-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = sne.create('A', 'js', 'a');
      sne.get(id);
      expect(sne.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      sne.create('A', 'js', 'a');
      expect(sne.setActive('sne-1', false)).toBe(true);
    });

    it('should set content', () => {
      sne.create('A', 'js', 'a');
      expect(sne.setContent('sne-1', 'b')).toBe(true);
    });

    it('should set title', () => {
      sne.create('A', 'js', 'a');
      expect(sne.setTitle('sne-1', 'B')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sne.setActive('unknown', false)).toBe(false);
      expect(sne.setContent('unknown', 'c')).toBe(false);
      expect(sne.setTitle('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = sne.create('A', 'js', 'a');
      sne.get(id);
      sne.setActive(id, false);
      sne.resetAll();
      expect(sne.getHits(id)).toBe(0);
      expect(sne.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by language / tag / state
  // ============================================================
  describe('by language / tag / state', () => {
    it('should get by language', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getByLanguage('js')).toHaveLength(1);
    });

    it('should get by tag', () => {
      sne.create('A', 'js', 'a', ['log']);
      expect(sne.getByTag('log')).toHaveLength(1);
    });

    it('should get active', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getActiveSnippets()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sne.create('A', 'js', 'a');
      sne.setActive('sne-1', false);
      expect(sne.getInactiveSnippets()).toHaveLength(1);
    });

    it('should get all titles', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getAllTitles()).toHaveLength(1);
    });

    it('should get title count', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getTitleCount()).toBe(1);
    });

    it('should get all languages', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getAllLanguages()).toHaveLength(1);
    });

    it('should get language count', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getLanguageCount()).toBe(1);
    });

    it('should get all tags', () => {
      sne.create('A', 'js', 'a', ['x', 'y']);
      expect(sne.getAllTags()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getNewest()?.id).toBe('sne-1');
    });

    it('should return null for empty newest', () => {
      expect(sne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getOldest()?.id).toBe('sne-1');
    });

    it('should return null for empty oldest', () => {
      expect(sne.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sne.create('A', 'js', 'a');
      expect(sne.getCreatedAt('sne-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sne.create('A', 'js', 'a');
      sne.setContent(id, 'b');
      expect(sne.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many snippets', () => {
      for (let i = 0; i < 50; i++) {
        sne.create(`s${i}`, 'js', `c${i}`);
      }
      expect(sne.getCount()).toBe(50);
    });
  });
});