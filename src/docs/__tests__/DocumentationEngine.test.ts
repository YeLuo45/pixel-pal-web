/**
 * DocumentationEngine Tests
 * claude-code-design Documentation Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DocumentationEngine } from '../DocumentationEngine';

describe('DocumentationEngine', () => {
  let eng: DocumentationEngine;

  beforeEach(() => {
    eng = new DocumentationEngine();
  });

  afterEach(() => {
    eng.clearAll();
  });

  // ============================================================
  // add / retrieve
  // ============================================================
  describe('add / retrieve', () => {
    it('should add', () => {
      const id = eng.add({ title: 't', content: 'c', tags: [] });
      expect(id).toBe('doc-1');
    });

    it('should retrieve', () => {
      const id = eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.retrieve(id)?.title).toBe('t');
    });

    it('should return null for unknown', () => {
      expect(eng.retrieve('unknown')).toBeNull();
    });

    it('should increment views', () => {
      const id = eng.add({ title: 't', content: 'c', tags: [] });
      eng.retrieve(id);
      expect(eng.getViews(id)).toBe(1);
    });
  });

  // ============================================================
  // search
  // ============================================================
  describe('search', () => {
    it('should search by title', () => {
      eng.add({ title: 'Hello World', content: 'c', tags: [] });
      expect(eng.search('Hello')).toHaveLength(1);
    });

    it('should search by content', () => {
      eng.add({ title: 't', content: 'Hello World', tags: [] });
      expect(eng.search('Hello')).toHaveLength(1);
    });

    it('should search by tag', () => {
      eng.add({ title: 't', content: 'c', tags: ['greeting'] });
      expect(eng.search('greet')).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      expect(eng.search('xyz')).toHaveLength(0);
    });
  });

  // ============================================================
  // bumpVersion
  // ============================================================
  describe('bumpVersion', () => {
    it('should bump version', () => {
      const id = eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.bumpVersion(id, '2.0.0')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(eng.bumpVersion('unknown', '2.0.0')).toBe(false);
    });

    it('should track version history', () => {
      const id = eng.add({ title: 't', content: 'c', tags: [] });
      eng.bumpVersion(id, '2.0.0');
      expect(eng.getVersionsCount(id)).toBe(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      const stats = eng.getStats();
      expect(stats.documents).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get document', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getDocument('doc-1')?.title).toBe('t');
    });

    it('should get all', () => {
      eng.add({ title: 'a', content: 'c', tags: [] });
      expect(eng.getAllDocuments()).toHaveLength(1);
    });

    it('should remove', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.removeDocument('doc-1')).toBe(true);
    });

    it('should check existence', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.hasDocument('doc-1')).toBe(true);
    });

    it('should count', () => {
      expect(eng.getCount()).toBe(0);
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get title', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getTitle('doc-1')).toBe('t');
    });

    it('should get content', () => {
      eng.add({ title: 't', content: 'hello', tags: [] });
      expect(eng.getContent('doc-1')).toBe('hello');
    });

    it('should get version', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getVersion('doc-1')).toBe('1.0.0');
    });

    it('should get version history', () => {
      const id = eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getVersionHistory(id)).toEqual(['1.0.0']);
    });

    it('should get tags', () => {
      eng.add({ title: 't', content: 'c', tags: ['a'] });
      expect(eng.getTags('doc-1')).toEqual(['a']);
    });

    it('should check hasTag', () => {
      eng.add({ title: 't', content: 'c', tags: ['a'] });
      expect(eng.hasTag('doc-1', 'a')).toBe(true);
    });
  });

  // ============================================================
  // tag ops
  // ============================================================
  describe('tag ops', () => {
    it('should add tag', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.addTag('doc-1', 'a')).toBe(true);
    });

    it('should remove tag', () => {
      eng.add({ title: 't', content: 'c', tags: ['a'] });
      expect(eng.removeTag('doc-1', 'a')).toBe(true);
    });

    it('should return false for unknown addTag', () => {
      expect(eng.addTag('unknown', 'a')).toBe(false);
    });

    it('should return false for unknown removeTag', () => {
      expect(eng.removeTag('unknown', 'a')).toBe(false);
    });

    it('should return false for missing removeTag', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.removeTag('doc-1', 'z')).toBe(false);
    });
  });

  // ============================================================
  // updaters
  // ============================================================
  describe('updaters', () => {
    it('should update title', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.updateTitle('doc-1', 'new')).toBe(true);
    });

    it('should update content', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.updateContent('doc-1', 'new')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(eng.updateTitle('unknown', 't')).toBe(false);
      expect(eng.updateContent('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getCreatedAt('doc-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getUpdatedAt('doc-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // by tag / version
  // ============================================================
  describe('by tag / version', () => {
    it('should get by tag', () => {
      eng.add({ title: 't', content: 'c', tags: ['a'] });
      expect(eng.getByTag('a')).toHaveLength(1);
    });

    it('should get by version', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getByVersion('1.0.0')).toHaveLength(1);
    });
  });

  // ============================================================
  // tags aggregation
  // ============================================================
  describe('tags aggregation', () => {
    it('should get all tags', () => {
      eng.add({ title: 't', content: 'c', tags: ['a', 'b'] });
      expect(eng.getAllTags()).toHaveLength(2);
    });

    it('should get tag count', () => {
      eng.add({ title: 't', content: 'c', tags: ['a'] });
      expect(eng.getTagCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most viewed', () => {
      const id = eng.add({ title: 't', content: 'c', tags: [] });
      eng.retrieve(id);
      expect(eng.getMostViewed()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(eng.getMostViewed()).toBeNull();
    });

    it('should get newest', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getNewest()?.id).toBe('doc-1');
    });

    it('should return null for empty newest', () => {
      expect(eng.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      eng.add({ title: 't', content: 'c', tags: [] });
      expect(eng.getOldest()?.id).toBe('doc-1');
    });

    it('should return null for empty oldest', () => {
      expect(eng.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many documents', () => {
      for (let i = 0; i < 50; i++) {
        eng.add({ title: `t${i}`, content: 'c', tags: [] });
      }
      expect(eng.getCount()).toBe(50);
    });
  });
});