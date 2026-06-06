/**
 * ServiceMesh Tests
 * nanobot-design Service Mesh
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceMesh } from '../ServiceMesh';

describe('ServiceMesh', () => {
  let sm: ServiceMesh;

  beforeEach(() => {
    sm = new ServiceMesh();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // register / addPolicy / route
  // ============================================================
  describe('register / addPolicy / route', () => {
    it('should register', () => {
      expect(sm.register('svc1', '1.0')).toBe('mesh-1');
    });

    it('should mark as active', () => {
      const id = sm.register('svc1', '1.0');
      expect(sm.isActive(id)).toBe(true);
    });

    it('should add policy', () => {
      const id = sm.register('svc1', '1.0');
      expect(sm.addPolicy(id, 'auth')).toBe(true);
    });

    it('should not add duplicate policy', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      sm.addPolicy(id, 'auth');
      expect(sm.getPolicyCount(id)).toBe(1);
    });

    it('should not add policy to inactive', () => {
      const id = sm.register('svc1', '1.0');
      sm.setActive(id, false);
      expect(sm.addPolicy(id, 'auth')).toBe(false);
    });

    it('should return false for unknown addPolicy', () => {
      expect(sm.addPolicy('unknown', 'auth')).toBe(false);
    });

    it('should remove policy', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      expect(sm.removePolicy(id, 'auth')).toBe(true);
    });

    it('should route', () => {
      const id = sm.register('svc1', '1.0');
      expect(sm.route(id)).toBe(true);
    });

    it('should increment traffic on route', () => {
      const id = sm.register('svc1', '1.0');
      sm.route(id, 5);
      expect(sm.getTraffic(id)).toBe(5);
    });

    it('should not route inactive', () => {
      const id = sm.register('svc1', '1.0');
      sm.setActive(id, false);
      expect(sm.route(id)).toBe(false);
    });

    it('should return false for unknown route', () => {
      expect(sm.route('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sm.register('svc1', '1.0');
      const stats = sm.getStats();
      expect(stats.nodes).toBe(1);
    });

    it('should count total policies', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      sm.addPolicy(id, 'rate');
      expect(sm.getStats().totalPolicies).toBe(2);
    });

    it('should count total hits', () => {
      const id = sm.register('svc1', '1.0');
      sm.route(id);
      expect(sm.getStats().totalHits).toBe(1);
    });

    it('should count total traffic', () => {
      const id = sm.register('svc1', '1.0');
      sm.route(id, 10);
      expect(sm.getStats().totalTraffic).toBe(10);
    });

    it('should count active', () => {
      sm.register('svc1', '1.0');
      expect(sm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sm.register('svc1', '1.0');
      sm.setActive(id, false);
      expect(sm.getStats().inactive).toBe(1);
    });

    it('should count services', () => {
      sm.register('svc1', '1.0');
      sm.register('svc2', '1.0');
      expect(sm.getStats().services).toBe(2);
    });

    it('should count versions', () => {
      sm.register('svc1', '1.0');
      sm.register('svc1', '2.0');
      expect(sm.getStats().versions).toBe(2);
    });

    it('should compute avg policies', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      expect(sm.getStats().avgPolicies).toBe(1);
    });

    it('should compute avg traffic', () => {
      const id = sm.register('svc1', '1.0');
      sm.route(id, 10);
      expect(sm.getStats().avgTraffic).toBe(10);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get node', () => {
      sm.register('svc1', '1.0');
      expect(sm.getNode('mesh-1')?.service).toBe('svc1');
    });

    it('should get all', () => {
      sm.register('svc1', '1.0');
      expect(sm.getAllNodes()).toHaveLength(1);
    });

    it('should remove', () => {
      sm.register('svc1', '1.0');
      expect(sm.removeNode('mesh-1')).toBe(true);
    });

    it('should check existence', () => {
      sm.register('svc1', '1.0');
      expect(sm.hasNode('mesh-1')).toBe(true);
    });

    it('should count', () => {
      expect(sm.getCount()).toBe(0);
      sm.register('svc1', '1.0');
      expect(sm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get service', () => {
      sm.register('svc1', '1.0');
      expect(sm.getService('mesh-1')).toBe('svc1');
    });

    it('should get version', () => {
      sm.register('svc1', '1.0');
      expect(sm.getVersion('mesh-1')).toBe('1.0');
    });

    it('should get policies', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      expect(sm.getPolicies(id)).toEqual(['auth']);
    });

    it('should get policy count', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      expect(sm.getPolicyCount(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = sm.register('svc1', '1.0');
      sm.route(id);
      expect(sm.getHits(id)).toBe(1);
    });

    it('should get traffic', () => {
      const id = sm.register('svc1', '1.0');
      sm.route(id, 5);
      expect(sm.getTraffic(id)).toBe(5);
    });

    it('should check hasPolicy', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      expect(sm.hasPolicy(id, 'auth')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = sm.register('svc1', '1.0');
      expect(sm.setActive(id, false)).toBe(true);
    });

    it('should set service', () => {
      const id = sm.register('svc1', '1.0');
      expect(sm.setService(id, 'svc2')).toBe(true);
    });

    it('should set version', () => {
      const id = sm.register('svc1', '1.0');
      expect(sm.setVersion(id, '2.0')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sm.setActive('unknown', false)).toBe(false);
      expect(sm.setService('unknown', 's')).toBe(false);
      expect(sm.setVersion('unknown', 'v')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      sm.route(id, 10);
      sm.setActive(id, false);
      sm.resetAll();
      expect(sm.getPolicyCount(id)).toBe(0);
      expect(sm.getTraffic(id)).toBe(0);
      expect(sm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by service / version / policy
  // ============================================================
  describe('by service / version / policy', () => {
    it('should get by service', () => {
      sm.register('svc1', '1.0');
      expect(sm.getByService('svc1')).toHaveLength(1);
    });

    it('should get by version', () => {
      sm.register('svc1', '1.0');
      expect(sm.getByVersion('1.0')).toHaveLength(1);
    });

    it('should get by policy', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      expect(sm.getByPolicy('auth')).toHaveLength(1);
    });

    it('should get active', () => {
      sm.register('svc1', '1.0');
      expect(sm.getActiveNodes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sm.register('svc1', '1.0');
      sm.setActive(id, false);
      expect(sm.getInactiveNodes()).toHaveLength(1);
    });
  });

  // ============================================================
  // services / versions
  // ============================================================
  describe('services / versions', () => {
    it('should get all services', () => {
      sm.register('svc1', '1.0');
      sm.register('svc2', '1.0');
      expect(sm.getAllServices()).toHaveLength(2);
    });

    it('should get service count', () => {
      sm.register('svc1', '1.0');
      expect(sm.getServiceCount()).toBe(1);
    });

    it('should get all versions', () => {
      sm.register('svc1', '1.0');
      sm.register('svc1', '2.0');
      expect(sm.getAllVersions()).toHaveLength(2);
    });

    it('should get version count', () => {
      sm.register('svc1', '1.0');
      expect(sm.getVersionCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most traffic', () => {
      const id = sm.register('svc1', '1.0');
      sm.route(id, 10);
      expect(sm.getMostTraffic()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sm.getMostTraffic()).toBeNull();
    });

    it('should get by min traffic', () => {
      const id = sm.register('svc1', '1.0');
      sm.route(id, 10);
      expect(sm.getByMinTraffic(5)).toHaveLength(1);
    });

    it('should get newest', () => {
      sm.register('svc1', '1.0');
      expect(sm.getNewest()?.id).toBe('mesh-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.register('svc1', '1.0');
      expect(sm.getOldest()?.id).toBe('mesh-1');
    });

    it('should return null for empty oldest', () => {
      expect(sm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sm.register('svc1', '1.0');
      expect(sm.getCreatedAt('mesh-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.register('svc1', '1.0');
      sm.addPolicy(id, 'auth');
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        sm.register(`svc${i}`, '1.0');
      }
      expect(sm.getCount()).toBe(50);
    });
  });
});