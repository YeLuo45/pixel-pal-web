/**
 * APIEngine Tests
 * nanobot-design API Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { APIEngine } from '../APIEngine';

describe('APIEngine', () => {
  let api: APIEngine;

  beforeEach(() => {
    api = new APIEngine();
  });

  afterEach(() => {
    api.clearAll();
  });

  // ============================================================
  // register / call
  // ============================================================
  describe('register / call', () => {
    it('should register', () => {
      expect(api.register('/api/users', 'GET')).toBe('api-1');
    });

    it('should mark as active', () => {
      const id = api.register('/api/users', 'GET');
      expect(api.isActive(id)).toBe(true);
    });

    it('should call', () => {
      const id = api.register('/api/users', 'GET');
      expect(api.call(id, true)).toBe(true);
    });

    it('should increment calls on call', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getCalls(id)).toBe(1);
    });

    it('should increment errors on failed call', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, false);
      expect(api.getErrors(id)).toBe(1);
    });

    it('should not increment errors on success', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getErrors(id)).toBe(0);
    });

    it('should log history on call', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getHistory(id)).toEqual([true]);
    });

    it('should not call inactive', () => {
      const id = api.register('/api/users', 'GET');
      api.setActive(id, false);
      expect(api.call(id, true)).toBe(false);
    });

    it('should return false for unknown call', () => {
      expect(api.call('unknown', true)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      api.register('/api/users', 'GET');
      const stats = api.getStats();
      expect(stats.apis).toBe(1);
    });

    it('should count total calls', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getStats().totalCalls).toBe(1);
    });

    it('should count total errors', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, false);
      expect(api.getStats().totalErrors).toBe(1);
    });

    it('should count active', () => {
      api.register('/api/users', 'GET');
      expect(api.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = api.register('/api/users', 'GET');
      api.setActive(id, false);
      expect(api.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getStats().totalHits).toBe(1);
    });

    it('should count unique paths', () => {
      api.register('/api/users', 'GET');
      api.register('/api/users', 'POST');
      expect(api.getStats().uniquePaths).toBe(1);
    });

    it('should compute avg calls', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getStats().avgCalls).toBe(1);
    });

    it('should compute error rate', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, false);
      expect(api.getStats().errorRate).toBe(1);
    });

    it('should count GET', () => {
      api.register('/api/users', 'GET');
      expect(api.getStats().getCount).toBe(1);
    });

    it('should count POST', () => {
      api.register('/api/users', 'POST');
      expect(api.getStats().postCount).toBe(1);
    });

    it('should count PUT', () => {
      api.register('/api/users', 'PUT');
      expect(api.getStats().putCount).toBe(1);
    });

    it('should count DELETE', () => {
      api.register('/api/users', 'DELETE');
      expect(api.getStats().deleteCount).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get API', () => {
      api.register('/api/users', 'GET');
      expect(api.getAPI('api-1')?.path).toBe('/api/users');
    });

    it('should get all', () => {
      api.register('/api/users', 'GET');
      expect(api.getAllAPIs()).toHaveLength(1);
    });

    it('should remove', () => {
      api.register('/api/users', 'GET');
      expect(api.removeAPI('api-1')).toBe(true);
    });

    it('should check existence', () => {
      api.register('/api/users', 'GET');
      expect(api.hasAPI('api-1')).toBe(true);
    });

    it('should count', () => {
      expect(api.getCount()).toBe(0);
      api.register('/api/users', 'GET');
      expect(api.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get path', () => {
      api.register('/api/users', 'GET');
      expect(api.getPath('api-1')).toBe('/api/users');
    });

    it('should get method', () => {
      api.register('/api/users', 'GET');
      expect(api.getMethod('api-1')).toBe('GET');
    });

    it('should get calls', () => {
      api.register('/api/users', 'GET');
      expect(api.getCalls('api-1')).toBe(0);
    });

    it('should get errors', () => {
      api.register('/api/users', 'GET');
      expect(api.getErrors('api-1')).toBe(0);
    });

    it('should get history', () => {
      api.register('/api/users', 'GET');
      expect(api.getHistory('api-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      api.register('/api/users', 'GET');
      expect(api.setActive('api-1', false)).toBe(true);
    });

    it('should set path', () => {
      api.register('/api/users', 'GET');
      expect(api.setPath('api-1', '/api/posts')).toBe(true);
    });

    it('should set method', () => {
      api.register('/api/users', 'GET');
      expect(api.setMethod('api-1', 'POST')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(api.setActive('unknown', false)).toBe(false);
      expect(api.setPath('unknown', '/p')).toBe(false);
      expect(api.setMethod('unknown', 'GET')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      api.setActive(id, false);
      api.resetAll();
      expect(api.getCalls(id)).toBe(0);
      expect(api.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by path / method
  // ============================================================
  describe('by path / method', () => {
    it('should get by path', () => {
      api.register('/api/users', 'GET');
      expect(api.getByPath('/api/users')).toHaveLength(1);
    });

    it('should get by method', () => {
      api.register('/api/users', 'GET');
      expect(api.getByMethod('GET')).toHaveLength(1);
    });

    it('should get active', () => {
      api.register('/api/users', 'GET');
      expect(api.getActiveAPIs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      api.register('/api/users', 'GET');
      api.setActive('api-1', false);
      expect(api.getInactiveAPIs()).toHaveLength(1);
    });

    it('should get all paths', () => {
      api.register('/api/users', 'GET');
      api.register('/api/posts', 'GET');
      expect(api.getAllPaths()).toHaveLength(2);
    });

    it('should get path count', () => {
      api.register('/api/users', 'GET');
      expect(api.getPathCount()).toBe(1);
    });

    it('should get by min calls', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getByMinCalls(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most calls', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      api.call(id, true);
      expect(api.getMostCalls()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(api.getMostCalls()).toBeNull();
    });

    it('should get newest', () => {
      api.register('/api/users', 'GET');
      expect(api.getNewest()?.id).toBe('api-1');
    });

    it('should return null for empty newest', () => {
      expect(api.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      api.register('/api/users', 'GET');
      expect(api.getOldest()?.id).toBe('api-1');
    });

    it('should return null for empty oldest', () => {
      expect(api.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      api.register('/api/users', 'GET');
      expect(api.getCreatedAt('api-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total calls', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, true);
      expect(api.getTotalCalls()).toBe(1);
    });

    it('should get total errors', () => {
      const id = api.register('/api/users', 'GET');
      api.call(id, false);
      expect(api.getTotalErrors()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many APIs', () => {
      for (let i = 0; i < 50; i++) {
        api.register(`/api/${i}`, 'GET');
      }
      expect(api.getCount()).toBe(50);
    });
  });
});