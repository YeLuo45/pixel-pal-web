/**
 * ChatdevAuditEngine Tests
 * chatdev-design Audit Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChatdevAuditEngine } from '../ChatdevAuditEngine';

describe('ChatdevAuditEngine', () => {
  let aue: ChatdevAuditEngine;

  beforeEach(() => {
    aue = new ChatdevAuditEngine();
  });

  afterEach(() => {
    aue.clearAll();
  });

  // ============================================================
  // log / flag / unflag / inspect / remove
  // ============================================================
  describe('log / flag / unflag / inspect / remove', () => {
    it('should log', () => {
      expect(aue.log('auth', 'login', 'alice')).toBe('aue-1');
    });

    it('should default flagged to false', () => {
      const id = aue.log('auth', 'login', 'alice');
      expect(aue.isFlagged(id)).toBe(false);
    });

    it('should default inspected to false', () => {
      const id = aue.log('auth', 'login', 'alice');
      expect(aue.isInspected(id)).toBe(false);
    });

    it('should mark as active', () => {
      const id = aue.log('auth', 'login', 'alice');
      expect(aue.isActive(id)).toBe(true);
    });

    it('should flag', () => {
      const id = aue.log('auth', 'login', 'alice');
      expect(aue.flag(id)).toBe(true);
    });

    it('should not double flag', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.flag(id)).toBe(false);
    });

    it('should return false for unknown flag', () => {
      expect(aue.flag('unknown')).toBe(false);
    });

    it('should unflag', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.unflag(id)).toBe(true);
    });

    it('should return false for unknown unflag', () => {
      expect(aue.unflag('unknown')).toBe(false);
    });

    it('should inspect', () => {
      const id = aue.log('auth', 'login', 'alice');
      expect(aue.inspect(id)).toBe(true);
    });

    it('should not double inspect', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.inspect(id);
      expect(aue.inspect(id)).toBe(false);
    });

    it('should return false for unknown inspect', () => {
      expect(aue.inspect('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = aue.log('auth', 'login', 'alice');
      expect(aue.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      aue.log('auth', 'login', 'alice');
      const stats = aue.getStats();
      expect(stats.entries).toBe(1);
    });

    it('should count total flagged', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.getStats().totalFlagged).toBe(1);
    });

    it('should count total inspected', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.inspect(id);
      expect(aue.getStats().totalInspected).toBe(1);
    });

    it('should count active', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.setActive(id, false);
      expect(aue.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.getStats().totalHits).toBe(1);
    });

    it('should count unique actions', () => {
      aue.log('auth', 'login', 'a');
      aue.log('auth', 'logout', 'a');
      expect(aue.getStats().uniqueActions).toBe(2);
    });

    it('should count unique actors', () => {
      aue.log('auth', 'login', 'alice');
      aue.log('auth', 'login', 'bob');
      expect(aue.getStats().uniqueActors).toBe(2);
    });

    it('should count auth', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getStats().auth).toBe(1);
    });

    it('should count data', () => {
      aue.log('data', 'read', 'alice');
      expect(aue.getStats().data).toBe(1);
    });

    it('should count system', () => {
      aue.log('system', 'start', 'admin');
      expect(aue.getStats().system).toBe(1);
    });

    it('should count user', () => {
      aue.log('user', 'create', 'alice');
      expect(aue.getStats().user).toBe(1);
    });

    it('should count security', () => {
      aue.log('security', 'alert', 'admin');
      expect(aue.getStats().security).toBe(1);
    });

    it('should count flagged', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.getStats().flagged).toBe(1);
    });

    it('should count inspected', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.inspect(id);
      expect(aue.getStats().inspected).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getEntry('aue-1')?.action).toBe('login');
    });

    it('should get all', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getAllEntries()).toHaveLength(1);
    });

    it('should check existence', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.hasEntry('aue-1')).toBe(true);
    });

    it('should count', () => {
      expect(aue.getCount()).toBe(0);
      aue.log('auth', 'login', 'alice');
      expect(aue.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get category', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getCategory('aue-1')).toBe('auth');
    });

    it('should get action', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getAction('aue-1')).toBe('login');
    });

    it('should get actor', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getActor('aue-1')).toBe('alice');
    });

    it('should get hits', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.setActive('aue-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(aue.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      aue.inspect(id);
      aue.setActive(id, false);
      aue.resetAll();
      expect(aue.isFlagged(id)).toBe(false);
      expect(aue.isInspected(id)).toBe(false);
    });
  });

  // ============================================================
  // by category / state
  // ============================================================
  describe('by category / state', () => {
    it('should get by category', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getByCategory('auth')).toHaveLength(1);
    });

    it('should get by actor', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getByActor('alice')).toHaveLength(1);
    });

    it('should get flagged', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.getFlaggedEntries()).toHaveLength(1);
    });

    it('should get inspected', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.inspect(id);
      expect(aue.getInspectedEntries()).toHaveLength(1);
    });

    it('should get uninspected', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getUninspectedEntries()).toHaveLength(1);
    });

    it('should get active', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getActiveEntries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      aue.log('auth', 'login', 'alice');
      aue.setActive('aue-1', false);
      expect(aue.getInactiveEntries()).toHaveLength(1);
    });

    it('should get all actions', () => {
      aue.log('auth', 'login', 'a');
      aue.log('auth', 'logout', 'a');
      expect(aue.getAllActions()).toHaveLength(2);
    });

    it('should get all actors', () => {
      aue.log('auth', 'login', 'alice');
      aue.log('auth', 'login', 'bob');
      expect(aue.getAllActors()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getNewest()?.id).toBe('aue-1');
    });

    it('should return null for empty newest', () => {
      expect(aue.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getOldest()?.id).toBe('aue-1');
    });

    it('should return null for empty oldest', () => {
      expect(aue.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      aue.log('auth', 'login', 'alice');
      expect(aue.getCreatedAt('aue-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total flagged', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.flag(id);
      expect(aue.getTotalFlagged()).toBe(1);
    });

    it('should get total inspected', () => {
      const id = aue.log('auth', 'login', 'alice');
      aue.inspect(id);
      expect(aue.getTotalInspected()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        aue.log('auth', `act${i}`, `actor${i}`);
      }
      expect(aue.getCount()).toBe(50);
    });
  });
});