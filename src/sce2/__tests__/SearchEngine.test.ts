/**
 * SearchEngine Tests
 * chatdev-design Search Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SearchEngine } from '../SearchEngine';

describe('SearchEngine', () => {
  let sce: SearchEngine;

  beforeEach(() => {
    sce = new SearchEngine();
  });

  afterEach(() => {
    sce.clearAll();
  });

  describe('index / query / remove', () => {
    it('should index', () => {
      expect(sce.index('t1', 'b1', ['tag1'])).toMatch(/^sce-/);
    });

    it('should mark as active', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.isActive(sce.getAllDocs()[0].id)).toBe(true);
    });

    it('should query by title', () => {
      sce.index('hello world', 'b1', []);
      const results = sce.query('hello', 'title');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should query by body', () => {
      sce.index('t1', 'hello body', []);
      const results = sce.query('hello', 'body');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should query by tags', () => {
      sce.index('t1', 'b1', ['hello']);
      const results = sce.query('hello', 'tags');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should query all', () => {
      sce.index('hello', 'world', ['foo']);
      const results = sce.query('hello', 'all');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty for no match', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.query('nonexistent', 'all')).toEqual([]);
    });

    it('should not query inactive', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      sce.setActive(id, false);
      expect(sce.query('t1', 'all')).toEqual([]);
    });

    it('should remove', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getStats().docs).toBe(1);
    });

    it('should count total indexed', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getStats().totalIndexed).toBe(1);
    });

    it('should count total queried', () => {
      sce.index('t1', 'b1', ['tag1']);
      sce.query('t1', 'all');
      expect(sce.getStats().totalQueried).toBe(1);
    });

    it('should count active', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      sce.setActive(id, false);
      expect(sce.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      sce.index('hello', 'b1', []);
      sce.query('hello', 'title');
      expect(sce.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      sce.index('a', 'b1', []);
      sce.index('a', 'b2', []);
      expect(sce.getStats().uniqueTitles).toBe(1);
    });

    it('should count total body len', () => {
      sce.index('t1', '12345', []);
      expect(sce.getStats().totalBodyLen).toBe(5);
    });

    it('should count total tags', () => {
      sce.index('t1', 'b1', ['a', 'b', 'c']);
      expect(sce.getStats().totalTags).toBe(3);
    });
  });

  describe('queries', () => {
    it('should get doc', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.getDoc(id)?.title).toBe('t1');
    });

    it('should get all', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getAllDocs()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.hasDoc(id)).toBe(true);
    });

    it('should count', () => {
      expect(sce.getCount()).toBe(0);
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get title', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.getTitle(id)).toBe('t1');
    });

    it('should get body', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.getBody(id)).toBe('b1');
    });

    it('should get tags', () => {
      const id = sce.index('t1', 'b1', ['a', 'b']);
      expect(sce.getTags(id)).toEqual(['a', 'b']);
    });

    it('should get hits', () => {
      sce.index('hello', 'b1', []);
      sce.query('hello', 'title');
      const id = sce.getAllDocs()[0].id;
      expect(sce.getHits(id)).toBe(1);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.setActive(id, false)).toBe(true);
    });

    it('should set title', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.setTitle(id, 't2')).toBe(true);
    });

    it('should set body', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.setBody(id, 'b2')).toBe(true);
    });

    it('should set tags', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.setTags(id, ['x'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sce.setActive('unknown', false)).toBe(false);
      expect(sce.setTitle('unknown', 't')).toBe(false);
      expect(sce.setBody('unknown', 'b')).toBe(false);
      expect(sce.setTags('unknown', [])).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      sce.setActive(id, false);
      sce.resetAll();
      expect(sce.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get active', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getActiveDocs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      sce.setActive(id, false);
      expect(sce.getInactiveDocs()).toHaveLength(1);
    });

    it('should get all titles', () => {
      sce.index('a', 'b1', []);
      sce.index('b', 'b2', []);
      expect(sce.getAllTitles()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getNewest()?.title).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(sce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getOldest()?.title).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(sce.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      expect(sce.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sce.index('t1', 'b1', ['tag1']);
      sce.query('t1', 'all');
      expect(sce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total indexed', () => {
      sce.index('t1', 'b1', ['tag1']);
      expect(sce.getTotalIndexed()).toBe(1);
    });

    it('should get total queried', () => {
      sce.index('t1', 'b1', ['tag1']);
      sce.query('t1', 'all');
      expect(sce.getTotalQueried()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many docs', () => {
      for (let i = 0; i < 50; i++) {
        sce.index(`t${i}`, 'b', []);
      }
      expect(sce.getCount()).toBe(50);
    });
  });
});