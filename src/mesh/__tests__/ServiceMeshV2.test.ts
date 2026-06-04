/**
 * ServiceMeshV2 Tests
 * nanobot-design Service Mesh v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceMeshV2 } from '../ServiceMeshV2';

describe('ServiceMeshV2', () => {
  let mesh: ServiceMeshV2;

  beforeEach(() => {
    mesh = new ServiceMeshV2();
  });

  afterEach(() => {
    mesh.clearAll();
  });

  // ============================================================
  // addRoute
  // ============================================================
  describe('addRoute', () => {
    it('should add route', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      expect(mesh.getRouteCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const r = { source: 'a', destination: 'b', weight: 1, enabled: true };
      mesh.addRoute(r);
      r.weight = 100;
      expect(mesh.getRoute('a', 'b')?.weight).toBe(1);
    });
  });

  // ============================================================
  // selectRoute
  // ============================================================
  describe('selectRoute', () => {
    it('should return enabled routes for source', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      mesh.addRoute({ source: 'a', destination: 'c', weight: 1, enabled: true });
      expect(mesh.selectRoute('a')).toHaveLength(2);
    });

    it('should not return disabled routes', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: false });
      expect(mesh.selectRoute('a')).toHaveLength(0);
    });

    it('should return empty for unknown source', () => {
      expect(mesh.selectRoute('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // enableRoute / disableRoute
  // ============================================================
  describe('enableRoute / disableRoute', () => {
    it('should enable route', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: false });
      expect(mesh.enableRoute('a', 'b')).toBe(true);
      expect(mesh.getRoute('a', 'b')?.enabled).toBe(true);
    });

    it('should disable route', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      expect(mesh.disableRoute('a', 'b')).toBe(true);
      expect(mesh.getRoute('a', 'b')?.enabled).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(mesh.enableRoute('unknown', 'b')).toBe(false);
      expect(mesh.disableRoute('unknown', 'b')).toBe(false);
    });
  });

  // ============================================================
  // getMetrics
  // ============================================================
  describe('getMetrics', () => {
    it('should return metrics', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      mesh.addRoute({ source: 'a', destination: 'c', weight: 1, enabled: false });
      const m = mesh.getMetrics();
      expect(m.total).toBe(2);
      expect(m.enabled).toBe(1);
      expect(m.disabled).toBe(1);
    });
  });

  // ============================================================
  // getRoute / getAllRoutes / getEnabledRoutes / getDisabledRoutes
  // ============================================================
  describe('route queries', () => {
    it('should get route', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      expect(mesh.getRoute('a', 'b')?.weight).toBe(1);
    });

    it('should get all routes', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      mesh.addRoute({ source: 'a', destination: 'c', weight: 1, enabled: true });
      expect(mesh.getAllRoutes()).toHaveLength(2);
    });

    it('should get enabled routes', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      mesh.addRoute({ source: 'a', destination: 'c', weight: 1, enabled: false });
      expect(mesh.getEnabledRoutes()).toHaveLength(1);
    });

    it('should get disabled routes', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      mesh.addRoute({ source: 'a', destination: 'c', weight: 1, enabled: false });
      expect(mesh.getDisabledRoutes()).toHaveLength(1);
    });
  });

  // ============================================================
  // removeRoute
  // ============================================================
  describe('removeRoute', () => {
    it('should remove route', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      expect(mesh.removeRoute('a', 'b')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mesh.removeRoute('unknown', 'b')).toBe(false);
    });
  });

  // ============================================================
  // sources / destinations
  // ============================================================
  describe('sources / destinations', () => {
    it('should get all sources', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      mesh.addRoute({ source: 'a', destination: 'c', weight: 1, enabled: true });
      mesh.addRoute({ source: 'b', destination: 'c', weight: 1, enabled: true });
      expect(mesh.getAllSources()).toHaveLength(2);
    });

    it('should get all destinations', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      mesh.addRoute({ source: 'a', destination: 'c', weight: 1, enabled: true });
      expect(mesh.getAllDestinations()).toHaveLength(2);
    });

    it('should get routes by source', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      expect(mesh.getRoutesBySource('a')).toHaveLength(1);
    });

    it('should get routes by destination', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      expect(mesh.getRoutesByDestination('b')).toHaveLength(1);
    });
  });

  // ============================================================
  // traffic
  // ============================================================
  describe('traffic', () => {
    it('should record traffic', () => {
      mesh.recordTraffic('a', 'b');
      expect(mesh.getTrafficCount()).toBe(1);
    });

    it('should filter by source', () => {
      mesh.recordTraffic('a', 'b');
      mesh.recordTraffic('a', 'c');
      mesh.recordTraffic('b', 'c');
      expect(mesh.getTrafficBySource('a')).toBe(2);
    });

    it('should filter by destination', () => {
      mesh.recordTraffic('a', 'b');
      mesh.recordTraffic('a', 'b');
      mesh.recordTraffic('a', 'c');
      expect(mesh.getTrafficByDestination('b')).toBe(2);
    });
  });

  // ============================================================
  // weight management
  // ============================================================
  describe('weight management', () => {
    it('should set weight', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      expect(mesh.setRouteWeight('a', 'b', 100)).toBe(true);
      expect(mesh.getRouteWeight('a', 'b')).toBe(100);
    });

    it('should clamp to >= 0', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      mesh.setRouteWeight('a', 'b', -10);
      expect(mesh.getRouteWeight('a', 'b')).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(mesh.setRouteWeight('unknown', 'b', 10)).toBe(false);
      expect(mesh.getRouteWeight('unknown', 'b')).toBe(0);
    });

    it('should get total weight', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 5, enabled: true });
      mesh.addRoute({ source: 'a', destination: 'c', weight: 3, enabled: true });
      expect(mesh.getTotalWeight('a')).toBe(8);
    });
  });

  // ============================================================
  // selectByWeight
  // ============================================================
  describe('selectByWeight', () => {
    it('should return null for no routes', () => {
      expect(mesh.selectByWeight('a')).toBeNull();
    });

    it('should return single route', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      expect(mesh.selectByWeight('a')?.destination).toBe('b');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many routes', () => {
      for (let i = 0; i < 100; i++) {
        mesh.addRoute({ source: 'a', destination: `d${i}`, weight: 1, enabled: true });
      }
      expect(mesh.getRouteCount()).toBe(100);
    });

    it('should not expose internal array', () => {
      mesh.addRoute({ source: 'a', destination: 'b', weight: 1, enabled: true });
      const routes = mesh.getAllRoutes();
      routes.push({ source: 'fake', destination: 'x', weight: 0, enabled: false });
      expect(mesh.getRouteCount()).toBe(1);
    });
  });
});