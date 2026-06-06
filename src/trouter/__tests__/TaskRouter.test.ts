/**
 * TaskRouter Tests
 * chatdev-design Task Router
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskRouter } from '../TaskRouter';

describe('TaskRouter', () => {
  let tr2: TaskRouter;

  beforeEach(() => {
    tr2 = new TaskRouter();
  });

  afterEach(() => {
    tr2.clearAll();
  });

  // ============================================================
  // add / route
  // ============================================================
  describe('add / route', () => {
    it('should add', () => {
      expect(tr2.add('login', 'auth-handler', 5)).toBe('tr2-1');
    });

    it('should mark as active', () => {
      const id = tr2.add('login', 'auth-handler', 5);
      expect(tr2.isActive(id)).toBe(true);
    });

    it('should route', () => {
      tr2.add('login', 'auth-handler', 5);
      expect(tr2.route('user-login')).toBe('auth-handler');
    });

    it('should return null for no match', () => {
      tr2.add('login', 'auth-handler', 5);
      expect(tr2.route('user-signup')).toBeNull();
    });

    it('should match in priority order', () => {
      tr2.add('user', 'low-handler', 1);
      tr2.add('user-login', 'high-handler', 10);
      expect(tr2.route('user-login')).toBe('high-handler');
    });

    it('should not route inactive', () => {
      const id = tr2.add('login', 'auth-handler', 5);
      tr2.setActive(id, false);
      expect(tr2.route('user-login')).toBeNull();
    });

    it('should increment hits on route', () => {
      const id = tr2.add('login', 'auth-handler', 5);
      tr2.route('user-login');
      expect(tr2.getHits(id)).toBe(1);
    });

    it('should increment total routes', () => {
      tr2.add('login', 'auth-handler', 5);
      tr2.route('user-login');
      expect(tr2.getTotalRoutes()).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tr2.add('login', 'auth-handler', 5);
      const stats = tr2.getStats();
      expect(stats.routes).toBe(1);
    });

    it('should count total hits', () => {
      const id = tr2.add('login', 'auth-handler', 5);
      tr2.route('user-login');
      expect(tr2.getStats().totalHits).toBe(1);
    });

    it('should compute avg hits', () => {
      const id = tr2.add('login', 'auth-handler', 5);
      tr2.route('user-login');
      expect(tr2.getStats().avgHits).toBe(1);
    });

    it('should compute avg priority', () => {
      tr2.add('a', 'ha', 5);
      tr2.add('b', 'hb', 15);
      expect(tr2.getStats().avgPriority).toBe(10);
    });

    it('should count active', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tr2.add('a', 'ha', 5);
      tr2.setActive(id, false);
      expect(tr2.getStats().inactive).toBe(1);
    });

    it('should count total routes', () => {
      tr2.add('a', 'ha', 5);
      tr2.route('abc');
      expect(tr2.getStats().totalRoutes).toBe(1);
    });

    it('should count handlers', () => {
      tr2.add('a', 'h1', 5);
      tr2.add('b', 'h2', 5);
      expect(tr2.getStats().handlers).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get route', () => {
      tr2.add('login', 'auth-handler', 5);
      expect(tr2.getRoute('tr2-1')?.pattern).toBe('login');
    });

    it('should get all', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.getAllRoutes()).toHaveLength(1);
    });

    it('should remove', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.removeRoute('tr2-1')).toBe(true);
    });

    it('should check existence', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.hasRoute('tr2-1')).toBe(true);
    });

    it('should count', () => {
      expect(tr2.getCount()).toBe(0);
      tr2.add('a', 'ha', 5);
      expect(tr2.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get pattern', () => {
      tr2.add('login', 'auth-handler', 5);
      expect(tr2.getPattern('tr2-1')).toBe('login');
    });

    it('should get handler', () => {
      tr2.add('login', 'auth-handler', 5);
      expect(tr2.getHandler('tr2-1')).toBe('auth-handler');
    });

    it('should get priority', () => {
      tr2.add('login', 'auth-handler', 5);
      expect(tr2.getPriority('tr2-1')).toBe(5);
    });

    it('should get hits', () => {
      tr2.add('login', 'auth-handler', 5);
      expect(tr2.getHits('tr2-1')).toBe(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = tr2.add('a', 'ha', 5);
      expect(tr2.setActive(id, false)).toBe(true);
    });

    it('should set pattern', () => {
      const id = tr2.add('a', 'ha', 5);
      expect(tr2.setPattern(id, 'b')).toBe(true);
    });

    it('should set handler', () => {
      const id = tr2.add('a', 'ha', 5);
      expect(tr2.setHandler(id, 'hb')).toBe(true);
    });

    it('should set priority', () => {
      const id = tr2.add('a', 'ha', 5);
      expect(tr2.setPriority(id, 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tr2.setActive('unknown', false)).toBe(false);
      expect(tr2.setPattern('unknown', 'p')).toBe(false);
      expect(tr2.setHandler('unknown', 'h')).toBe(false);
      expect(tr2.setPriority('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = tr2.add('a', 'ha', 5);
      tr2.route('abc');
      tr2.resetHits();
      expect(tr2.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = tr2.add('a', 'ha', 5);
      tr2.route('abc');
      tr2.setActive(id, false);
      tr2.resetAll();
      expect(tr2.getHits(id)).toBe(0);
      expect(tr2.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by handler / state
  // ============================================================
  describe('by handler / state', () => {
    it('should get by handler', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.getByHandler('ha')).toHaveLength(1);
    });

    it('should get active', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.getActiveRoutes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = tr2.add('a', 'ha', 5);
      tr2.setActive(id, false);
      expect(tr2.getInactiveRoutes()).toHaveLength(1);
    });

    it('should get all handlers', () => {
      tr2.add('a', 'h1', 5);
      tr2.add('b', 'h2', 5);
      expect(tr2.getAllHandlers()).toHaveLength(2);
    });

    it('should get handler count', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.getHandlerCount()).toBe(1);
    });

    it('should get by min priority', () => {
      tr2.add('a', 'ha', 5);
      tr2.add('b', 'hb', 15);
      expect(tr2.getByMinPriority(10)).toHaveLength(1);
    });

    it('should get by min hits', () => {
      const id = tr2.add('a', 'ha', 5);
      tr2.route('abc');
      expect(tr2.getByMinHits(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hits', () => {
      const id = tr2.add('a', 'ha', 5);
      tr2.route('abc');
      expect(tr2.getMostHits()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(tr2.getMostHits()).toBeNull();
    });

    it('should get highest priority', () => {
      const id = tr2.add('a', 'ha', 10);
      expect(tr2.getHighestPriority()?.id).toBe(id);
    });

    it('should return null for empty highest', () => {
      expect(tr2.getHighestPriority()).toBeNull();
    });

    it('should get newest', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.getNewest()?.id).toBe('tr2-1');
    });

    it('should return null for empty newest', () => {
      expect(tr2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.getOldest()?.id).toBe('tr2-1');
    });

    it('should return null for empty oldest', () => {
      expect(tr2.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tr2.add('a', 'ha', 5);
      expect(tr2.getCreatedAt('tr2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tr2.add('a', 'ha', 5);
      tr2.route('abc');
      expect(tr2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total routes
  // ============================================================
  describe('total routes', () => {
    it('should get total routes', () => {
      tr2.add('a', 'ha', 5);
      tr2.route('abc');
      expect(tr2.getTotalRoutes()).toBe(1);
    });

    it('should reset total routes', () => {
      tr2.add('a', 'ha', 5);
      tr2.route('abc');
      tr2.resetTotalRoutes();
      expect(tr2.getTotalRoutes()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many routes', () => {
      for (let i = 0; i < 50; i++) {
        tr2.add(`p${i}`, `h${i}`, i);
      }
      expect(tr2.getCount()).toBe(50);
    });
  });
});