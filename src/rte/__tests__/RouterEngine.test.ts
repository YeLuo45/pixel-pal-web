/**
 * RouterEngine Tests
 * thunderbolt-design Router Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouterEngine } from '../RouterEngine';

describe('RouterEngine', () => {
  let rte: RouterEngine;

  beforeEach(() => {
    rte = new RouterEngine();
  });

  afterEach(() => {
    rte.clearAll();
  });

  // ============================================================
  // add / route / match / remove
  // ============================================================
  describe('add / route / match / remove', () => {
    it('should add', () => {
      expect(rte.add('/api', 'GET', 'handleGet')).toBe('rte-1');
    });

    it('should mark as active', () => {
      const id = rte.add('/api', 'GET', 'handleGet');
      expect(rte.isActive(id)).toBe(true);
    });

    it('should route', () => {
      rte.add('/api', 'GET', 'handleGet');
      expect(rte.route('/api', 'GET')).toHaveLength(1);
    });

    it('should return empty for mismatched path', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.route('/other', 'GET')).toHaveLength(0);
    });

    it('should return empty for mismatched method', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.route('/api', 'POST')).toHaveLength(0);
    });

    it('should match', () => {
      const id = rte.add('/api', 'GET', 'h');
      expect(rte.match(id)).toBe(true);
    });

    it('should not match inactive', () => {
      const id = rte.add('/api', 'GET', 'h');
      rte.setActive(id, false);
      expect(rte.match(id)).toBe(false);
    });

    it('should return false for unknown match', () => {
      expect(rte.match('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = rte.add('/api', 'GET', 'h');
      expect(rte.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rte.add('/api', 'GET', 'h');
      const stats = rte.getStats();
      expect(stats.routes).toBe(1);
    });

    it('should count total matches', () => {
      const id = rte.add('/api', 'GET', 'h');
      rte.match(id);
      expect(rte.getStats().totalMatches).toBe(1);
    });

    it('should count total resolves', () => {
      rte.add('/api', 'GET', 'h');
      rte.route('/api', 'GET');
      expect(rte.getStats().totalResolves).toBe(1);
    });

    it('should count active', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rte.add('/api', 'GET', 'h');
      rte.setActive(id, false);
      expect(rte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rte.add('/api', 'GET', 'h');
      rte.match(id);
      expect(rte.getStats().totalHits).toBe(1);
    });

    it('should count unique paths', () => {
      rte.add('/api', 'GET', 'h');
      rte.add('/api', 'POST', 'h');
      expect(rte.getStats().uniquePaths).toBe(1);
    });

    it('should count unique handlers', () => {
      rte.add('/a', 'GET', 'h1');
      rte.add('/b', 'GET', 'h2');
      expect(rte.getStats().uniqueHandlers).toBe(2);
    });

    it('should compute avg path length', () => {
      rte.add('/a', 'GET', 'h');
      rte.add('/bb', 'GET', 'h');
      expect(rte.getStats().avgPathLength).toBe(2.5);
    });

    it('should get max path length', () => {
      rte.add('/a', 'GET', 'h');
      rte.add('/bbb', 'GET', 'h');
      expect(rte.getStats().maxPathLength).toBe(4);
    });

    it('should get min path length', () => {
      rte.add('/a', 'GET', 'h');
      rte.add('/bbb', 'GET', 'h');
      expect(rte.getStats().minPathLength).toBe(2);
    });

    it('should count unique methods', () => {
      rte.add('/a', 'GET', 'h');
      rte.add('/b', 'POST', 'h');
      expect(rte.getStats().uniqueMethods).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get route', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getRoute('rte-1')?.path).toBe('/api');
    });

    it('should get all', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getAllRoutes()).toHaveLength(1);
    });

    it('should check existence', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.hasRoute('rte-1')).toBe(true);
    });

    it('should count', () => {
      expect(rte.getCount()).toBe(0);
      rte.add('/api', 'GET', 'h');
      expect(rte.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get path', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getPath('rte-1')).toBe('/api');
    });

    it('should get method', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getMethod('rte-1')).toBe('GET');
    });

    it('should get handler', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getHandler('rte-1')).toBe('h');
    });

    it('should get path length', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getPathLength('rte-1')).toBe(4);
    });

    it('should get history', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getHistory('rte-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = rte.add('/api', 'GET', 'h');
      rte.match(id);
      expect(rte.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.setActive('rte-1', false)).toBe(true);
    });

    it('should set handler', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.setHandler('rte-1', 'h2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rte.setActive('unknown', false)).toBe(false);
      expect(rte.setHandler('unknown', 'h')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = rte.add('/api', 'GET', 'h');
      rte.match(id);
      rte.setActive(id, false);
      rte.resetAll();
      expect(rte.getHits(id)).toBe(0);
      expect(rte.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by path / method / handler / state
  // ============================================================
  describe('by path / method / handler / state', () => {
    it('should get by path', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getByPath('/api')).toHaveLength(1);
    });

    it('should get by method', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getByMethod('GET')).toHaveLength(1);
    });

    it('should get by handler', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getByHandler('h')).toHaveLength(1);
    });

    it('should get active', () => {
      rte.add('/api', 'GET', 'h');
      expect(rte.getActiveRoutes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      rte.add('/api', 'GET', 'h');
      rte.setActive('rte-1', false);
      expect(rte.getInactiveRoutes()).toHaveLength(1);
    });

    it('should get all paths', () => {
      rte.add('/a', 'GET', 'h');
      rte.add('/b', 'GET', 'h');
      expect(rte.getAllPaths()).toHaveLength(2);
    });

    it('should get path count', () => {
      rte.add('/a', 'GET', 'h');
      expect(rte.getPathCount()).toBe(1);
    });

    it('should get all handlers', () => {
      rte.add('/a', 'GET', 'h1');
      rte.add('/b', 'GET', 'h2');
      expect(rte.getAllHandlers()).toHaveLength(2);
    });

    it('should get all methods', () => {
      rte.add('/a', 'GET', 'h');
      rte.add('/b', 'POST', 'h');
      expect(rte.getAllMethods()).toHaveLength(2);
    });

    it('should get by min path length', () => {
      rte.add('/a', 'GET', 'h');
      rte.add('/bbb', 'GET', 'h');
      expect(rte.getByMinPathLength(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      rte.add('/a', 'GET', 'h');
      expect(rte.getNewest()?.id).toBe('rte-1');
    });

    it('should return null for empty newest', () => {
      expect(rte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rte.add('/a', 'GET', 'h');
      expect(rte.getOldest()?.id).toBe('rte-1');
    });

    it('should return null for empty oldest', () => {
      expect(rte.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      rte.add('/a', 'GET', 'h');
      expect(rte.getCreatedAt('rte-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rte.add('/a', 'GET', 'h');
      rte.match(id);
      expect(rte.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total matches', () => {
      const id = rte.add('/a', 'GET', 'h');
      rte.match(id);
      expect(rte.getTotalMatches()).toBe(1);
    });

    it('should get total resolves', () => {
      rte.add('/a', 'GET', 'h');
      rte.route('/a', 'GET');
      expect(rte.getTotalResolves()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many routes', () => {
      for (let i = 0; i < 50; i++) {
        rte.add(`/path${i}`, 'GET', `h${i}`);
      }
      expect(rte.getCount()).toBe(50);
    });
  });
});