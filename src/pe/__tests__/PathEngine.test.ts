/**
 * PathEngine Tests
 * claude-code-design Path Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PathEngine, normalizePath, resolvePath, joinPath } from '../PathEngine';

describe('PathEngine', () => {
  let pe: PathEngine;

  beforeEach(() => {
    pe = new PathEngine();
  });

  afterEach(() => {
    pe.clearAll();
  });

  // ============================================================
  // add / resolve / resolveWith / remove
  // ============================================================
  describe('add / resolve / resolveWith / remove', () => {
    it('should add', () => {
      expect(pe.add('/a/b/c')).toBe('pe-1');
    });

    it('should mark as active', () => {
      const id = pe.add('/a');
      expect(pe.isActive(id)).toBe(true);
    });

    it('should resolve', () => {
      const id = pe.add('/a/b/c');
      expect(pe.resolve(id)).toBe('/a/b/c');
    });

    it('should not resolve inactive', () => {
      const id = pe.add('/a');
      pe.setActive(id, false);
      expect(pe.resolve(id)).toBeUndefined();
    });

    it('should return undefined for unknown resolve', () => {
      expect(pe.resolve('unknown')).toBeUndefined();
    });

    it('should resolve with extension', () => {
      const id = pe.add('/a');
      expect(pe.resolveWith(id, 'b.txt')).toBe('/a/b.txt');
    });

    it('should remove', () => {
      const id = pe.add('/a');
      expect(pe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pe.add('/a');
      const stats = pe.getStats();
      expect(stats.paths).toBe(1);
    });

    it('should count total resolves', () => {
      const id = pe.add('/a');
      pe.resolve(id);
      expect(pe.getStats().totalResolves).toBe(1);
    });

    it('should count active', () => {
      pe.add('/a');
      expect(pe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pe.add('/a');
      pe.setActive(id, false);
      expect(pe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pe.add('/a');
      pe.resolve(id);
      expect(pe.getStats().totalHits).toBe(1);
    });

    it('should count unique paths', () => {
      pe.add('/a');
      pe.add('/a');
      expect(pe.getStats().uniquePaths).toBe(1);
    });

    it('should compute avg path length', () => {
      pe.add('/a');
      pe.add('/bb');
      expect(pe.getStats().avgPathLength).toBe(2.5);
    });

    it('should get max path length', () => {
      pe.add('/a');
      pe.add('/bbb');
      expect(pe.getStats().maxPathLength).toBe(4);
    });

    it('should get min path length', () => {
      pe.add('/a');
      pe.add('/bbb');
      expect(pe.getStats().minPathLength).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get path', () => {
      pe.add('/a');
      expect(pe.getPath('pe-1')?.path).toBe('/a');
    });

    it('should get all', () => {
      pe.add('/a');
      expect(pe.getAllPaths()).toHaveLength(1);
    });

    it('should check existence', () => {
      pe.add('/a');
      expect(pe.hasPath('pe-1')).toBe(true);
    });

    it('should count', () => {
      expect(pe.getCount()).toBe(0);
      pe.add('/a');
      expect(pe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get original path', () => {
      pe.add('/a');
      expect(pe.getOriginalPath('pe-1')).toBe('/a');
    });

    it('should get resolved', () => {
      pe.add('/a');
      expect(pe.getResolved('pe-1')).toBe('/a');
    });

    it('should get path length', () => {
      pe.add('/a');
      expect(pe.getPathLength('pe-1')).toBe(2);
    });

    it('should get hits', () => {
      const id = pe.add('/a');
      pe.resolve(id);
      expect(pe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pe.add('/a');
      expect(pe.setActive('pe-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pe.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pe.add('/a');
      pe.resolve(id);
      pe.setActive(id, false);
      pe.resetAll();
      expect(pe.getHits(id)).toBe(0);
      expect(pe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get active', () => {
      pe.add('/a');
      expect(pe.getActivePaths()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pe.add('/a');
      pe.setActive('pe-1', false);
      expect(pe.getInactivePaths()).toHaveLength(1);
    });

    it('should get all originals', () => {
      pe.add('/a');
      pe.add('/b');
      expect(pe.getAllOriginals()).toHaveLength(2);
    });

    it('should get by min length', () => {
      pe.add('/a');
      pe.add('/bbb');
      expect(pe.getByMinLength(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      pe.add('/a');
      expect(pe.getNewest()?.id).toBe('pe-1');
    });

    it('should return null for empty newest', () => {
      expect(pe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pe.add('/a');
      expect(pe.getOldest()?.id).toBe('pe-1');
    });

    it('should return null for empty oldest', () => {
      expect(pe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pe.add('/a');
      expect(pe.getCreatedAt('pe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pe.add('/a');
      pe.resolve(id);
      expect(pe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total resolves', () => {
      const id = pe.add('/a');
      pe.resolve(id);
      expect(pe.getTotalResolves()).toBe(1);
    });
  });

  // ============================================================
  // helpers
  // ============================================================
  describe('helpers', () => {
    it('should normalize path', () => {
      expect(normalizePath('/a//b/')).toBe('/a/b');
    });

    it('should add leading slash', () => {
      expect(normalizePath('a/b')).toBe('/a/b');
    });

    it('should keep root', () => {
      expect(normalizePath('/')).toBe('/');
    });

    it('should resolve path', () => {
      expect(resolvePath('a', 'b', 'c')).toBe('/a/b/c');
    });

    it('should join path', () => {
      expect(joinPath('/a', 'b')).toBe('/a/b');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many paths', () => {
      for (let i = 0; i < 50; i++) {
        pe.add(`/path${i}`);
      }
      expect(pe.getCount()).toBe(50);
    });
  });
});