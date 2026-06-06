/**
 * PresenceEngine Tests
 * chatdev-design Presence Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PresenceEngine } from '../PresenceEngine';

describe('PresenceEngine', () => {
  let pre: PresenceEngine;

  beforeEach(() => {
    pre = new PresenceEngine();
  });

  afterEach(() => {
    pre.clearAll();
  });

  // ============================================================
  // join / heartbeat / setAway / setOnline / leave / remove
  // ============================================================
  describe('join / heartbeat / setAway / setOnline / leave / remove', () => {
    it('should join', () => {
      expect(pre.join('alice')).toBe('pre-1');
    });

    it('should default status to online', () => {
      const id = pre.join('alice');
      expect(pre.getStatus(id)).toBe('online');
    });

    it('should mark as active', () => {
      const id = pre.join('alice');
      expect(pre.isActive(id)).toBe(true);
    });

    it('should heartbeat', () => {
      const id = pre.join('alice');
      expect(pre.heartbeat(id)).toBe(true);
    });

    it('should not heartbeat on inactive', () => {
      const id = pre.join('alice');
      pre.setActive(id, false);
      expect(pre.heartbeat(id)).toBe(false);
    });

    it('should return false for unknown heartbeat', () => {
      expect(pre.heartbeat('unknown')).toBe(false);
    });

    it('should set away', () => {
      const id = pre.join('alice');
      expect(pre.setAway(id)).toBe(true);
    });

    it('should return false for unknown setAway', () => {
      expect(pre.setAway('unknown')).toBe(false);
    });

    it('should set online', () => {
      const id = pre.join('alice');
      pre.setAway(id);
      expect(pre.setOnline(id)).toBe(true);
    });

    it('should return false for unknown setOnline', () => {
      expect(pre.setOnline('unknown')).toBe(false);
    });

    it('should leave', () => {
      const id = pre.join('alice');
      expect(pre.leave(id)).toBe(true);
    });

    it('should return false for unknown leave', () => {
      expect(pre.leave('unknown')).toBe(false);
    });

    it('should check isStale', () => {
      const id = pre.join('alice');
      expect(pre.isStale(id, 1000000)).toBe(false);
    });

    it('should return false for unknown isStale', () => {
      expect(pre.isStale('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = pre.join('alice');
      expect(pre.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pre.join('alice');
      const stats = pre.getStats();
      expect(stats.presences).toBe(1);
    });

    it('should count total joins', () => {
      pre.join('alice');
      expect(pre.getStats().totalJoins).toBe(1);
    });

    it('should count total leaves', () => {
      const id = pre.join('alice');
      pre.leave(id);
      expect(pre.getStats().totalLeaves).toBe(1);
    });

    it('should count total heartbeats', () => {
      const id = pre.join('alice');
      pre.heartbeat(id);
      expect(pre.getStats().totalHeartbeats).toBe(1);
    });

    it('should count online', () => {
      pre.join('alice');
      expect(pre.getStats().online).toBe(1);
    });

    it('should count away', () => {
      const id = pre.join('alice');
      pre.setAway(id);
      expect(pre.getStats().away).toBe(1);
    });

    it('should count offline', () => {
      const id = pre.join('alice');
      pre.leave(id);
      expect(pre.getStats().offline).toBe(1);
    });

    it('should count active', () => {
      pre.join('alice');
      expect(pre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pre.join('alice');
      pre.setActive(id, false);
      expect(pre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pre.join('alice');
      pre.heartbeat(id);
      expect(pre.getStats().totalHits).toBe(1);
    });

    it('should count unique users', () => {
      pre.join('alice');
      pre.join('bob');
      expect(pre.getStats().uniqueUsers).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get presence', () => {
      pre.join('alice');
      expect(pre.getPresence('pre-1')?.user).toBe('alice');
    });

    it('should get all', () => {
      pre.join('alice');
      expect(pre.getAllPresences()).toHaveLength(1);
    });

    it('should check existence', () => {
      pre.join('alice');
      expect(pre.hasPresence('pre-1')).toBe(true);
    });

    it('should count', () => {
      expect(pre.getCount()).toBe(0);
      pre.join('alice');
      expect(pre.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get user', () => {
      pre.join('alice');
      expect(pre.getUser('pre-1')).toBe('alice');
    });

    it('should get last seen', () => {
      pre.join('alice');
      expect(pre.getLastSeen('pre-1')).toBeGreaterThan(0);
    });

    it('should get hits', () => {
      const id = pre.join('alice');
      pre.heartbeat(id);
      expect(pre.getHits(id)).toBe(1);
    });

    it('should check online', () => {
      pre.join('alice');
      expect(pre.isOnline('pre-1')).toBe(true);
    });

    it('should check away', () => {
      const id = pre.join('alice');
      pre.setAway(id);
      expect(pre.isAway(id)).toBe(true);
    });

    it('should check offline', () => {
      const id = pre.join('alice');
      pre.leave(id);
      expect(pre.isOffline(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pre.join('alice');
      expect(pre.setActive('pre-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pre.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pre.join('alice');
      pre.leave(id);
      pre.setActive(id, false);
      pre.resetAll();
      expect(pre.getStatus(id)).toBe('online');
      expect(pre.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by status / user / state
  // ============================================================
  describe('by status / user / state', () => {
    it('should get by status', () => {
      pre.join('alice');
      expect(pre.getByStatus('online')).toHaveLength(1);
    });

    it('should get by user', () => {
      pre.join('alice');
      expect(pre.getByUser('alice')).toHaveLength(1);
    });

    it('should get active', () => {
      pre.join('alice');
      expect(pre.getActivePresences()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pre.join('alice');
      pre.setActive('pre-1', false);
      expect(pre.getInactivePresences()).toHaveLength(1);
    });

    it('should get all users', () => {
      pre.join('alice');
      pre.join('bob');
      expect(pre.getAllUsers()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      pre.join('alice');
      expect(pre.getNewest()?.id).toBe('pre-1');
    });

    it('should return null for empty newest', () => {
      expect(pre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pre.join('alice');
      expect(pre.getOldest()?.id).toBe('pre-1');
    });

    it('should return null for empty oldest', () => {
      expect(pre.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pre.join('alice');
      expect(pre.getCreatedAt('pre-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pre.join('alice');
      pre.heartbeat(id);
      expect(pre.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total joins', () => {
      pre.join('alice');
      expect(pre.getTotalJoins()).toBe(1);
    });

    it('should get total leaves', () => {
      const id = pre.join('alice');
      pre.leave(id);
      expect(pre.getTotalLeaves()).toBe(1);
    });

    it('should get total heartbeats', () => {
      const id = pre.join('alice');
      pre.heartbeat(id);
      expect(pre.getTotalHeartbeats()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many presences', () => {
      for (let i = 0; i < 50; i++) {
        pre.join(`u${i}`);
      }
      expect(pre.getCount()).toBe(50);
    });
  });
});