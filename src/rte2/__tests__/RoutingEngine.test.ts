/**
 * RoutingEngine Tests
 * thunderbolt-design Routing Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RoutingEngine } from '../RoutingEngine';

describe('RoutingEngine', () => {
  let rte: RoutingEngine;

  beforeEach(() => {
    rte = new RoutingEngine();
  });

  afterEach(() => {
    rte.clearAll();
  });

  describe('addRoute / match / remove', () => {
    it('should add route', () => {
      expect(rte.addRoute('/api/*', 'GET')).toMatch(/^rte-/);
    });

    it('should mark as active', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.isActive(rte.getAllRoutes()[0].id)).toBe(true);
    });

    it('should match', () => {
      const id = rte.addRoute('/api/users', 'GET');
      expect(rte.match(id, '/api/users')).toBe(true);
    });

    it('should increment matched', () => {
      const id = rte.addRoute('/api/users', 'GET');
      rte.match(id, '/api/users');
      expect(rte.getMatched(id)).toBe(1);
    });

    it('should not match different path', () => {
      const id = rte.addRoute('/api/users', 'GET');
      expect(rte.match(id, '/api/posts')).toBe(false);
    });

    it('should match with wildcard', () => {
      const id = rte.addRoute('/api/*', 'GET');
      expect(rte.match(id, '/api/anything')).toBe(true);
    });

    it('should not match inactive', () => {
      const id = rte.addRoute('/api/users', 'GET');
      rte.setActive(id, false);
      expect(rte.match(id, '/api/users')).toBe(false);
    });

    it('should return false for unknown match', () => {
      expect(rte.match('unknown', '/api/users')).toBe(false);
    });

    it('should remove', () => {
      const id = rte.addRoute('/api/users', 'GET');
      expect(rte.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getStats().routes).toBe(1);
    });

    it('should count total added', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getStats().totalAdded).toBe(1);
    });

    it('should count total matched', () => {
      const id = rte.addRoute('/api/users', 'GET');
      rte.match(id, '/api/users');
      expect(rte.getStats().totalMatched).toBe(1);
    });

    it('should count GET', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getStats().GET).toBe(1);
    });

    it('should count POST', () => {
      rte.addRoute('/api/*', 'POST');
      expect(rte.getStats().POST).toBe(1);
    });

    it('should count PUT', () => {
      rte.addRoute('/api/*', 'PUT');
      expect(rte.getStats().PUT).toBe(1);
    });

    it('should count DELETE', () => {
      rte.addRoute('/api/*', 'DELETE');
      expect(rte.getStats().DELETE).toBe(1);
    });

    it('should count PATCH', () => {
      rte.addRoute('/api/*', 'PATCH');
      expect(rte.getStats().PATCH).toBe(1);
    });

    it('should count active', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rte.addRoute('/api/*', 'GET');
      rte.setActive(id, false);
      expect(rte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rte.addRoute('/api/users', 'GET');
      rte.match(id, '/api/users');
      expect(rte.getStats().totalHits).toBe(1);
    });

    it('should count unique patterns', () => {
      rte.addRoute('/a', 'GET');
      rte.addRoute('/a', 'GET');
      expect(rte.getStats().uniquePatterns).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get route', () => {
      const id = rte.addRoute('/api/*', 'GET');
      expect(rte.getRoute(id)?.pattern).toBe('/api/*');
    });

    it('should get all', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getAllRoutes()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = rte.addRoute('/api/*', 'GET');
      expect(rte.hasRoute(id)).toBe(true);
    });

    it('should count', () => {
      expect(rte.getCount()).toBe(0);
      rte.addRoute('/api/*', 'GET');
      expect(rte.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get pattern', () => {
      const id = rte.addRoute('/api/users', 'GET');
      expect(rte.getPattern(id)).toBe('/api/users');
    });

    it('should get method', () => {
      const id = rte.addRoute('/api/users', 'GET');
      expect(rte.getMethod(id)).toBe('GET');
    });

    it('should get hits', () => {
      const id = rte.addRoute('/api/users', 'GET');
      rte.match(id, '/api/users');
      expect(rte.getHits(id)).toBe(1);
    });

    it('should check GET', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.isGET(rte.getAllRoutes()[0].id)).toBe(true);
    });

    it('should check POST', () => {
      rte.addRoute('/api/*', 'POST');
      expect(rte.isPOST(rte.getAllRoutes()[0].id)).toBe(true);
    });

    it('should check PUT', () => {
      rte.addRoute('/api/*', 'PUT');
      expect(rte.isPUT(rte.getAllRoutes()[0].id)).toBe(true);
    });

    it('should check DELETE', () => {
      rte.addRoute('/api/*', 'DELETE');
      expect(rte.isDELETE(rte.getAllRoutes()[0].id)).toBe(true);
    });

    it('should check PATCH', () => {
      rte.addRoute('/api/*', 'PATCH');
      expect(rte.isPATCH(rte.getAllRoutes()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = rte.addRoute('/api/*', 'GET');
      expect(rte.setActive(id, false)).toBe(true);
    });

    it('should set pattern', () => {
      const id = rte.addRoute('/api/*', 'GET');
      expect(rte.setPattern(id, '/api/v2/*')).toBe(true);
    });

    it('should set method', () => {
      const id = rte.addRoute('/api/*', 'GET');
      expect(rte.setMethod(id, 'POST')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rte.setActive('unknown', false)).toBe(false);
      expect(rte.setPattern('unknown', '/p')).toBe(false);
      expect(rte.setMethod('unknown', 'GET')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = rte.addRoute('/api/users', 'GET');
      rte.match(id, '/api/users');
      rte.setActive(id, false);
      rte.resetAll();
      expect(rte.getMatched(id)).toBe(0);
      expect(rte.isActive(id)).toBe(true);
    });
  });

  describe('by method / state', () => {
    it('should get by method', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getByMethod('GET')).toHaveLength(1);
    });

    it('should get active', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getActiveRoutes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = rte.addRoute('/api/*', 'GET');
      rte.setActive(id, false);
      expect(rte.getInactiveRoutes()).toHaveLength(1);
    });

    it('should get all patterns', () => {
      rte.addRoute('/a', 'GET');
      rte.addRoute('/b', 'GET');
      expect(rte.getAllPatterns()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getNewest()?.pattern).toBe('/api/*');
    });

    it('should return null for empty newest', () => {
      expect(rte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getOldest()?.pattern).toBe('/api/*');
    });

    it('should return null for empty oldest', () => {
      expect(rte.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = rte.addRoute('/api/*', 'GET');
      expect(rte.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rte.addRoute('/api/users', 'GET');
      rte.match(id, '/api/users');
      expect(rte.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      rte.addRoute('/api/*', 'GET');
      expect(rte.getTotalAdded()).toBe(1);
    });

    it('should get total matched', () => {
      const id = rte.addRoute('/api/users', 'GET');
      rte.match(id, '/api/users');
      expect(rte.getTotalMatched()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many routes', () => {
      for (let i = 0; i < 50; i++) {
        rte.addRoute(`/api/r${i}`, 'GET');
      }
      expect(rte.getCount()).toBe(50);
    });
  });
});