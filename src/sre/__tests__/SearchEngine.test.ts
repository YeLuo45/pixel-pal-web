/**
 * SearchEngine Tests
 * chatdev-design Search Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SearchEngine } from '../SearchEngine';

describe('SearchEngine', () => {
  let sre: SearchEngine;

  beforeEach(() => {
    sre = new SearchEngine();
  });

  afterEach(() => {
    sre.clearAll();
  });

  describe('index / search / suggest / remove', () => {
    it('should index', () => {
      expect(sre.index('apple')).toBe('sre-1');
    });

    it('should default score to 0.5', () => {
      sre.index('apple');
      expect(sre.getScore('sre-1')).toBe(0.5);
    });

    it('should clamp score', () => {
      sre.index('apple', 2);
      expect(sre.getScore('sre-1')).toBe(1);
    });

    it('should mark as active', () => {
      sre.index('apple');
      expect(sre.isActive('sre-1')).toBe(true);
    });

    it('should search', () => {
      sre.index('apple pie');
      expect(sre.search('apple')).toHaveLength(1);
    });

    it('should be case insensitive', () => {
      sre.index('Apple Pie');
      expect(sre.search('apple')).toHaveLength(1);
    });

    it('should not search inactive', () => {
      sre.index('apple');
      sre.setActive('sre-1', false);
      expect(sre.search('apple')).toHaveLength(0);
    });

    it('should suggest', () => {
      sre.index('apple', 0.9);
      sre.index('apricot', 0.7);
      expect(sre.suggest('ap')).toContain('apple');
    });

    it('should suggest limit', () => {
      sre.index('apple', 0.9);
      sre.index('apricot', 0.7);
      expect(sre.suggest('ap', 1)).toHaveLength(1);
    });

    it('should remove', () => {
      sre.index('apple');
      expect(sre.remove('sre-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sre.index('apple');
      expect(sre.getStats().results).toBe(1);
    });

    it('should count total indexed', () => {
      sre.index('apple');
      expect(sre.getStats().totalIndexed).toBe(1);
    });

    it('should count total searched', () => {
      sre.index('apple');
      sre.search('apple');
      expect(sre.getStats().totalSearched).toBe(1);
    });

    it('should count active', () => {
      sre.index('apple');
      expect(sre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      sre.index('apple');
      sre.setActive('sre-1', false);
      expect(sre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      sre.index('apple');
      sre.search('apple');
      expect(sre.getStats().totalHits).toBe(1);
    });

    it('should count unique queries', () => {
      sre.index('apple');
      sre.search('apple');
      expect(sre.getStats().uniqueQueries).toBe(1);
    });

    it('should count unique results', () => {
      sre.index('apple');
      sre.index('apple');
      expect(sre.getStats().uniqueResults).toBe(1);
    });

    it('should compute avg score', () => {
      sre.index('a', 0.5);
      sre.index('b', 0.7);
      expect(sre.getStats().avgScore).toBe(0.6);
    });

    it('should get max score', () => {
      sre.index('a', 0.5);
      sre.index('b', 0.7);
      expect(sre.getStats().maxScore).toBe(0.7);
    });

    it('should get min score', () => {
      sre.index('a', 0.5);
      sre.index('b', 0.7);
      expect(sre.getStats().minScore).toBe(0.5);
    });
  });

  describe('queries', () => {
    it('should get result', () => {
      sre.index('apple');
      expect(sre.getResult('sre-1')?.result).toBe('apple');
    });

    it('should get all', () => {
      sre.index('apple');
      expect(sre.getAllResults()).toHaveLength(1);
    });

    it('should check existence', () => {
      sre.index('apple');
      expect(sre.hasResult('sre-1')).toBe(true);
    });

    it('should count', () => {
      expect(sre.getCount()).toBe(0);
      sre.index('apple');
      expect(sre.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get result2', () => {
      sre.index('apple');
      expect(sre.getResult2('sre-1')).toBe('apple');
    });

    it('should get query', () => {
      sre.index('apple');
      sre.search('app');
      expect(sre.getQuery('sre-1')).toBe('app');
    });

    it('should get hits', () => {
      sre.index('apple');
      sre.search('apple');
      expect(sre.getHits('sre-1')).toBe(1);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      sre.index('apple');
      expect(sre.setActive('sre-1', false)).toBe(true);
    });

    it('should set result', () => {
      sre.index('apple');
      expect(sre.setResult('sre-1', 'banana')).toBe(true);
    });

    it('should set score', () => {
      sre.index('apple');
      expect(sre.setScore('sre-1', 0.8)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sre.setActive('unknown', false)).toBe(false);
      expect(sre.setResult('unknown', 'x')).toBe(false);
      expect(sre.setScore('unknown', 0.5)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      sre.index('apple');
      sre.search('apple');
      sre.setActive('sre-1', false);
      sre.resetAll();
      expect(sre.getHits('sre-1')).toBe(0);
      expect(sre.isActive('sre-1')).toBe(true);
    });
  });

  describe('by state', () => {
    it('should get active', () => {
      sre.index('apple');
      expect(sre.getActiveResults()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sre.index('apple');
      sre.setActive('sre-1', false);
      expect(sre.getInactiveResults()).toHaveLength(1);
    });

    it('should get all results list', () => {
      sre.index('apple');
      sre.index('banana');
      expect(sre.getAllResultsList()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sre.index('apple');
      expect(sre.getNewest()?.id).toBe('sre-1');
    });

    it('should return null for empty newest', () => {
      expect(sre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sre.index('apple');
      expect(sre.getOldest()?.id).toBe('sre-1');
    });

    it('should return null for empty oldest', () => {
      expect(sre.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      sre.index('apple');
      expect(sre.getCreatedAt('sre-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      sre.index('apple');
      sre.search('apple');
      expect(sre.getUpdatedAt('sre-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total indexed', () => {
      sre.index('apple');
      expect(sre.getTotalIndexed()).toBe(1);
    });

    it('should get total searched', () => {
      sre.index('apple');
      sre.search('apple');
      expect(sre.getTotalSearched()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many results', () => {
      for (let i = 0; i < 50; i++) {
        sre.index(`r${i}`);
      }
      expect(sre.getCount()).toBe(50);
    });
  });
});