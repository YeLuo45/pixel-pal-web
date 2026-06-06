/**
 * AuditEngine Tests
 * claude-code-design Audit Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuditEngine } from '../AuditEngine';

describe('AuditEngine', () => {
  let aue: AuditEngine;

  beforeEach(() => {
    aue = new AuditEngine();
  });

  afterEach(() => {
    aue.clearAll();
  });

  // ============================================================
  // add / resolve / verify / remove
  // ============================================================
  describe('add / resolve / verify / remove', () => {
    it('should add', () => {
      expect(aue.add('login', 'info', 'alice')).toBe('aue-1');
    });

    it('should default resolved to false', () => {
      const id = aue.add('login', 'info', 'alice');
      expect(aue.isResolved(id)).toBe(false);
    });

    it('should mark as active', () => {
      const id = aue.add('login', 'info', 'alice');
      expect(aue.isActive(id)).toBe(true);
    });

    it('should resolve', () => {
      const id = aue.add('login', 'info', 'alice');
      expect(aue.resolve(id)).toBe(true);
    });

    it('should not double resolve', () => {
      const id = aue.add('login', 'info', 'alice');
      aue.resolve(id);
      expect(aue.resolve(id)).toBe(false);
    });

    it('should return false for unknown resolve', () => {
      expect(aue.resolve('unknown')).toBe(false);
    });

    it('should verify', () => {
      const id = aue.add('login', 'info', 'alice');
      expect(aue.verify(id)).toBe(true);
    });

    it('should return false for unknown verify', () => {
      expect(aue.verify('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = aue.add('login', 'info', 'alice');
      expect(aue.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      aue.add('login', 'info', 'alice');
      const stats = aue.getStats();
      expect(stats.events).toBe(1);
    });

    it('should count total resolved', () => {
      const id = aue.add('login', 'info', 'alice');
      aue.resolve(id);
      expect(aue.getStats().totalResolved).toBe(1);
    });

    it('should count total unresolved', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.getStats().totalUnresolved).toBe(1);
    });

    it('should count info', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.getStats().info).toBe(1);
    });

    it('should count warning', () => {
      aue.add('a', 'warning', 'alice');
      expect(aue.getStats().warning).toBe(1);
    });

    it('should count error', () => {
      aue.add('a', 'error', 'alice');
      expect(aue.getStats().error).toBe(1);
    });

    it('should count critical', () => {
      aue.add('a', 'critical', 'alice');
      expect(aue.getStats().critical).toBe(1);
    });

    it('should count active', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = aue.add('login', 'info', 'alice');
      aue.setActive(id, false);
      expect(aue.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = aue.add('login', 'info', 'alice');
      aue.verify(id);
      expect(aue.getStats().totalHits).toBe(1);
    });

    it('should count unique actions', () => {
      aue.add('a', 'info', 'alice');
      aue.add('a', 'info', 'bob');
      expect(aue.getStats().uniqueActions).toBe(1);
    });

    it('should count unique users', () => {
      aue.add('a', 'info', 'alice');
      aue.add('b', 'info', 'bob');
      expect(aue.getStats().uniqueUsers).toBe(2);
    });

    it('should count unique severities', () => {
      aue.add('a', 'info', 'alice');
      aue.add('b', 'error', 'alice');
      expect(aue.getStats().uniqueSeverities).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get event', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.getEvent('aue-1')?.action).toBe('login');
    });

    it('should get all', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.getAllEvents()).toHaveLength(1);
    });

    it('should check existence', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.hasEvent('aue-1')).toBe(true);
    });

    it('should count', () => {
      expect(aue.getCount()).toBe(0);
      aue.add('login', 'info', 'alice');
      expect(aue.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get action', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.getAction('aue-1')).toBe('login');
    });

    it('should get severity', () => {
      aue.add('login', 'error', 'alice');
      expect(aue.getSeverity('aue-1')).toBe('error');
    });

    it('should get user', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.getUser('aue-1')).toBe('alice');
    });

    it('should get hits', () => {
      const id = aue.add('login', 'info', 'alice');
      aue.verify(id);
      expect(aue.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.setActive('aue-1', false)).toBe(true);
    });

    it('should set severity', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.setSeverity('aue-1', 'error')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(aue.setActive('unknown', false)).toBe(false);
      expect(aue.setSeverity('unknown', 'error')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = aue.add('login', 'info', 'alice');
      aue.resolve(id);
      aue.setActive(id, false);
      aue.resetAll();
      expect(aue.isResolved(id)).toBe(false);
      expect(aue.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by severity / user / action / state
  // ============================================================
  describe('by severity / user / action / state', () => {
    it('should get by severity', () => {
      aue.add('a', 'error', 'alice');
      expect(aue.getBySeverity('error')).toHaveLength(1);
    });

    it('should get by user', () => {
      aue.add('a', 'info', 'alice');
      expect(aue.getByUser('alice')).toHaveLength(1);
    });

    it('should get by action', () => {
      aue.add('login', 'info', 'alice');
      expect(aue.getByAction('login')).toHaveLength(1);
    });

    it('should get resolved', () => {
      const id = aue.add('a', 'info', 'alice');
      aue.resolve(id);
      expect(aue.getResolvedEvents()).toHaveLength(1);
    });

    it('should get unresolved', () => {
      aue.add('a', 'info', 'alice');
      expect(aue.getUnresolvedEvents()).toHaveLength(1);
    });

    it('should get active', () => {
      aue.add('a', 'info', 'alice');
      expect(aue.getActiveEvents()).toHaveLength(1);
    });

    it('should get inactive', () => {
      aue.add('a', 'info', 'alice');
      aue.setActive('aue-1', false);
      expect(aue.getInactiveEvents()).toHaveLength(1);
    });

    it('should get all actions', () => {
      aue.add('a', 'info', 'alice');
      aue.add('b', 'info', 'alice');
      expect(aue.getAllActions()).toHaveLength(2);
    });

    it('should get all users', () => {
      aue.add('a', 'info', 'alice');
      aue.add('b', 'info', 'bob');
      expect(aue.getAllUsers()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      aue.add('a', 'info', 'alice');
      expect(aue.getNewest()?.id).toBe('aue-1');
    });

    it('should return null for empty newest', () => {
      expect(aue.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      aue.add('a', 'info', 'alice');
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
      aue.add('a', 'info', 'alice');
      expect(aue.getCreatedAt('aue-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = aue.add('a', 'info', 'alice');
      aue.verify(id);
      expect(aue.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total resolved', () => {
      const id = aue.add('a', 'info', 'alice');
      aue.resolve(id);
      expect(aue.getTotalResolved()).toBe(1);
    });

    it('should get total unresolved', () => {
      aue.add('a', 'info', 'alice');
      expect(aue.getTotalUnresolved()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many events', () => {
      for (let i = 0; i < 50; i++) {
        aue.add(`a${i}`, 'info', 'alice');
      }
      expect(aue.getCount()).toBe(50);
    });
  });
});