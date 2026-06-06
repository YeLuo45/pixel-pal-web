/**
 * AuditManager Tests
 * thunderbolt-design Audit Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuditManager } from '../AuditManager';

describe('AuditManager', () => {
  let am: AuditManager;

  beforeEach(() => {
    am = new AuditManager();
  });

  afterEach(() => {
    am.clearAll();
  });

  // ============================================================
  // record / query
  // ============================================================
  describe('record / query', () => {
    it('should record', () => {
      expect(am.record('alice', 'login', 'app')).toBe('au-1');
    });

    it('should mark as active', () => {
      const id = am.record('alice', 'login', 'app');
      expect(am.isActive(id)).toBe(true);
    });

    it('should query all', () => {
      am.record('alice', 'login', 'app');
      expect(am.query()).toHaveLength(1);
    });

    it('should query by actor', () => {
      am.record('alice', 'login', 'app');
      expect(am.query('alice')).toHaveLength(1);
    });

    it('should filter query by actor', () => {
      am.record('alice', 'login', 'app');
      am.record('bob', 'login', 'app');
      expect(am.query('alice')).toHaveLength(1);
    });

    it('should query by action', () => {
      am.record('alice', 'login', 'app');
      expect(am.query(undefined, 'login')).toHaveLength(1);
    });

    it('should query by actor and action', () => {
      am.record('alice', 'login', 'app');
      expect(am.query('alice', 'login')).toHaveLength(1);
    });
  });

  // ============================================================
  // queryByTarget / queryByActor / queryByAction
  // ============================================================
  describe('queryByTarget / queryByActor / queryByAction', () => {
    it('should query by target', () => {
      am.record('alice', 'login', 'app');
      expect(am.queryByTarget('app')).toHaveLength(1);
    });

    it('should query by actor', () => {
      am.record('alice', 'login', 'app');
      expect(am.queryByActor('alice')).toHaveLength(1);
    });

    it('should query by action', () => {
      am.record('alice', 'login', 'app');
      expect(am.queryByAction('login')).toHaveLength(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      am.record('alice', 'login', 'app');
      const stats = am.getStats();
      expect(stats.entries).toBe(1);
    });

    it('should count actors', () => {
      am.record('alice', 'login', 'app');
      am.record('bob', 'login', 'app');
      expect(am.getStats().actors).toBe(2);
    });

    it('should count actions', () => {
      am.record('alice', 'login', 'app');
      am.record('alice', 'logout', 'app');
      expect(am.getStats().actions).toBe(2);
    });

    it('should count targets', () => {
      am.record('alice', 'login', 'app');
      am.record('alice', 'login', 'web');
      expect(am.getStats().targets).toBe(2);
    });

    it('should count active', () => {
      am.record('alice', 'login', 'app');
      expect(am.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = am.record('alice', 'login', 'app');
      am.setActive(id, false);
      expect(am.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = am.record('alice', 'login', 'app');
      am.touch(id);
      expect(am.getStats().totalHits).toBe(1);
    });

    it('should count unique actors', () => {
      am.record('alice', 'login', 'app');
      am.record('bob', 'login', 'app');
      expect(am.getStats().uniqueActors).toBe(2);
    });

    it('should count unique actions', () => {
      am.record('alice', 'login', 'app');
      am.record('alice', 'logout', 'app');
      expect(am.getStats().uniqueActions).toBe(2);
    });

    it('should count unique targets', () => {
      am.record('alice', 'login', 'app');
      am.record('alice', 'login', 'web');
      expect(am.getStats().uniqueTargets).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      am.record('alice', 'login', 'app');
      expect(am.getEntry('au-1')?.actor).toBe('alice');
    });

    it('should get all', () => {
      am.record('alice', 'login', 'app');
      expect(am.getAllEntries()).toHaveLength(1);
    });

    it('should remove', () => {
      am.record('alice', 'login', 'app');
      expect(am.removeEntry('au-1')).toBe(true);
    });

    it('should check existence', () => {
      am.record('alice', 'login', 'app');
      expect(am.hasEntry('au-1')).toBe(true);
    });

    it('should count', () => {
      expect(am.getCount()).toBe(0);
      am.record('alice', 'login', 'app');
      expect(am.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get actor', () => {
      am.record('alice', 'login', 'app');
      expect(am.getActor('au-1')).toBe('alice');
    });

    it('should get action', () => {
      am.record('alice', 'login', 'app');
      expect(am.getAction('au-1')).toBe('login');
    });

    it('should get target', () => {
      am.record('alice', 'login', 'app');
      expect(am.getTarget('au-1')).toBe('app');
    });

    it('should get timestamp', () => {
      am.record('alice', 'login', 'app');
      expect(am.getTimestamp('au-1')).toBeGreaterThan(0);
    });

    it('should get hits', () => {
      const id = am.record('alice', 'login', 'app');
      am.touch(id);
      expect(am.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      am.record('alice', 'login', 'app');
      expect(am.setActive('au-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(am.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      am.record('alice', 'login', 'app');
      expect(am.touch('au-1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(am.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = am.record('alice', 'login', 'app');
      am.touch(id);
      am.setActive(id, false);
      am.resetAll();
      expect(am.getHits(id)).toBe(0);
      expect(am.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by actor / action / target
  // ============================================================
  describe('by actor / action / target', () => {
    it('should get by actor', () => {
      am.record('alice', 'login', 'app');
      expect(am.getByActor('alice')).toHaveLength(1);
    });

    it('should get by action', () => {
      am.record('alice', 'login', 'app');
      expect(am.getByAction('login')).toHaveLength(1);
    });

    it('should get by target', () => {
      am.record('alice', 'login', 'app');
      expect(am.getByTarget('app')).toHaveLength(1);
    });

    it('should get active', () => {
      am.record('alice', 'login', 'app');
      expect(am.getActiveEntries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      am.record('alice', 'login', 'app');
      am.setActive('au-1', false);
      expect(am.getInactiveEntries()).toHaveLength(1);
    });

    it('should get all actors', () => {
      am.record('alice', 'login', 'app');
      am.record('bob', 'login', 'app');
      expect(am.getAllActors()).toHaveLength(2);
    });

    it('should get actor count', () => {
      am.record('alice', 'login', 'app');
      expect(am.getActorCount()).toBe(1);
    });

    it('should get all actions', () => {
      am.record('alice', 'login', 'app');
      am.record('alice', 'logout', 'app');
      expect(am.getAllActions()).toHaveLength(2);
    });

    it('should get action count', () => {
      am.record('alice', 'login', 'app');
      expect(am.getActionCount()).toBe(1);
    });

    it('should get all targets', () => {
      am.record('alice', 'login', 'app');
      am.record('alice', 'login', 'web');
      expect(am.getAllTargets()).toHaveLength(2);
    });

    it('should get target count', () => {
      am.record('alice', 'login', 'app');
      expect(am.getTargetCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      am.record('alice', 'login', 'app');
      expect(am.getNewest()?.id).toBe('au-1');
    });

    it('should return null for empty newest', () => {
      expect(am.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      am.record('alice', 'login', 'app');
      expect(am.getOldest()?.id).toBe('au-1');
    });

    it('should return null for empty oldest', () => {
      expect(am.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      am.record('alice', 'login', 'app');
      expect(am.getCreatedAt('au-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      am.record('alice', 'login', 'app');
      am.touch('au-1');
      expect(am.getUpdatedAt('au-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        am.record(`actor${i}`, 'login', 'app');
      }
      expect(am.getCount()).toBe(50);
    });
  });
});