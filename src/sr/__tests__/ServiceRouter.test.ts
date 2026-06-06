/**
 * ServiceRouter Tests
 * nanobot-design Service Router
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceRouter } from '../ServiceRouter';

describe('ServiceRouter', () => {
  let sr: ServiceRouter;

  beforeEach(() => {
    sr = new ServiceRouter();
  });

  afterEach(() => {
    sr.clearAll();
  });

  // ============================================================
  // register / route
  // ============================================================
  describe('register / route', () => {
    it('should register', () => {
      expect(sr.register('/api/users', 'http://users-svc')).toBe('sr-1');
    });

    it('should route', () => {
      sr.register('/api/users', 'http://users-svc');
      expect(sr.route('/api/users')).toBe('http://users-svc');
    });

    it('should return null for unknown', () => {
      expect(sr.route('/unknown')).toBeNull();
    });

    it('should not route inactive', () => {
      const id = sr.register('/api/users', 'http://users-svc');
      sr.setActive(id, false);
      expect(sr.route('/api/users')).toBeNull();
    });

    it('should increment hits on route', () => {
      const id = sr.register('/api/users', 'http://users-svc');
      sr.route('/api/users');
      expect(sr.getHits(id)).toBe(1);
    });

    it('should increment total calls', () => {
      sr.register('/api/users', 'http://users-svc');
      sr.route('/api/users');
      expect(sr.getTotalCalls()).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sr.register('/api/users', 'http://users-svc');
      const stats = sr.getStats();
      expect(stats.routes).toBe(1);
    });

    it('should count total hits', () => {
      const id = sr.register('/api/users', 'http://users-svc');
      sr.route('/api/users');
      expect(sr.getStats().totalHits).toBe(1);
    });

    it('should compute avg hits', () => {
      const id = sr.register('/api/users', 'http://users-svc');
      sr.route('/api/users');
      expect(sr.getStats().avgHits).toBe(1);
    });

    it('should count targets', () => {
      sr.register('/a', 'http://a');
      sr.register('/b', 'http://b');
      expect(sr.getStats().targets).toBe(2);
    });

    it('should count active', () => {
      sr.register('/a', 'http://a');
      expect(sr.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sr.register('/a', 'http://a');
      sr.setActive(id, false);
      expect(sr.getStats().inactive).toBe(1);
    });

    it('should count total calls', () => {
      sr.register('/a', 'http://a');
      sr.route('/a');
      sr.route('/unknown');
      expect(sr.getStats().totalCalls).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get route', () => {
      sr.register('/a', 'http://a');
      expect(sr.getRoute('sr-1')?.path).toBe('/a');
    });

    it('should get all', () => {
      sr.register('/a', 'http://a');
      expect(sr.getAllRoutes()).toHaveLength(1);
    });

    it('should remove', () => {
      sr.register('/a', 'http://a');
      expect(sr.removeRoute('sr-1')).toBe(true);
    });

    it('should check existence', () => {
      sr.register('/a', 'http://a');
      expect(sr.hasRoute('sr-1')).toBe(true);
    });

    it('should count', () => {
      expect(sr.getCount()).toBe(0);
      sr.register('/a', 'http://a');
      expect(sr.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get path', () => {
      sr.register('/a', 'http://a');
      expect(sr.getPath('sr-1')).toBe('/a');
    });

    it('should get target', () => {
      sr.register('/a', 'http://a');
      expect(sr.getTarget('sr-1')).toBe('http://a');
    });

    it('should get hits', () => {
      const id = sr.register('/a', 'http://a');
      sr.route('/a');
      expect(sr.getHits(id)).toBe(1);
    });

    it('should check isActive', () => {
      sr.register('/a', 'http://a');
      expect(sr.isActive('sr-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = sr.register('/a', 'http://a');
      expect(sr.setActive(id, false)).toBe(true);
    });

    it('should set path', () => {
      const id = sr.register('/a', 'http://a');
      expect(sr.setPath(id, '/b')).toBe(true);
    });

    it('should set target', () => {
      const id = sr.register('/a', 'http://a');
      expect(sr.setTarget(id, 'http://b')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sr.setActive('unknown', false)).toBe(false);
      expect(sr.setPath('unknown', '/a')).toBe(false);
      expect(sr.setTarget('unknown', 'http://a')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = sr.register('/a', 'http://a');
      sr.route('/a');
      sr.resetHits();
      expect(sr.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = sr.register('/a', 'http://a');
      sr.route('/a');
      sr.setActive(id, false);
      sr.resetAll();
      expect(sr.getHits(id)).toBe(0);
      expect(sr.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by path / target
  // ============================================================
  describe('by path / target', () => {
    it('should get by path', () => {
      sr.register('/a', 'http://a');
      expect(sr.getByPath('/a')).toHaveLength(1);
    });

    it('should get by target', () => {
      sr.register('/a', 'http://a');
      expect(sr.getByTarget('http://a')).toHaveLength(1);
    });

    it('should get active', () => {
      sr.register('/a', 'http://a');
      expect(sr.getActiveRoutes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sr.register('/a', 'http://a');
      sr.setActive(id, false);
      expect(sr.getInactiveRoutes()).toHaveLength(1);
    });
  });

  // ============================================================
  // paths / targets
  // ============================================================
  describe('paths / targets', () => {
    it('should get all paths', () => {
      sr.register('/a', 'http://a');
      sr.register('/b', 'http://b');
      expect(sr.getAllPaths()).toHaveLength(2);
    });

    it('should get all targets', () => {
      sr.register('/a', 'http://a');
      sr.register('/b', 'http://b');
      expect(sr.getAllTargets()).toHaveLength(2);
    });

    it('should get path count', () => {
      sr.register('/a', 'http://a');
      expect(sr.getPathCount()).toBe(1);
    });

    it('should get target count', () => {
      sr.register('/a', 'http://a');
      expect(sr.getTargetCount()).toBe(1);
    });

    it('should get by path count', () => {
      sr.register('/a', 'http://a');
      expect(sr.getByPathCount('/a')).toBe(1);
    });

    it('should get by target count', () => {
      sr.register('/a', 'http://a');
      expect(sr.getByTargetCount('http://a')).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = sr.register('/a', 'http://a');
      sr.route('/a');
      expect(sr.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sr.getMostHit()).toBeNull();
    });

    it('should get newest', () => {
      sr.register('/a', 'http://a');
      expect(sr.getNewest()?.id).toBe('sr-1');
    });

    it('should return null for empty newest', () => {
      expect(sr.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sr.register('/a', 'http://a');
      expect(sr.getOldest()?.id).toBe('sr-1');
    });

    it('should return null for empty oldest', () => {
      expect(sr.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sr.register('/a', 'http://a');
      expect(sr.getCreatedAt('sr-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sr.register('/a', 'http://a');
      sr.route('/a');
      expect(sr.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total calls
  // ============================================================
  describe('total calls', () => {
    it('should get total calls', () => {
      sr.register('/a', 'http://a');
      sr.route('/a');
      expect(sr.getTotalCalls()).toBe(1);
    });

    it('should reset total calls', () => {
      sr.register('/a', 'http://a');
      sr.route('/a');
      sr.resetTotalCalls();
      expect(sr.getTotalCalls()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many routes', () => {
      for (let i = 0; i < 50; i++) {
        sr.register(`/api/${i}`, `http://svc-${i}`);
      }
      expect(sr.getCount()).toBe(50);
    });
  });
});