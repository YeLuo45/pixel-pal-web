/**
 * PresenceEngine Tests
 * chatdev-design Presence Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PresenceEngine } from '../PresenceEngine';

describe('PresenceEngine', () => {
  let pr: PresenceEngine;

  beforeEach(() => {
    pr = new PresenceEngine();
  });

  afterEach(() => {
    pr.clearAll();
  });

  // ============================================================
  // register / setStatus / heartbeat
  // ============================================================
  describe('register / setStatus / heartbeat', () => {
    it('should register', () => {
      expect(pr.register('alice', 'online')).toBe('pr-1');
    });

    it('should mark as active', () => {
      const id = pr.register('alice', 'online');
      expect(pr.isActive(id)).toBe(true);
    });

    it('should set status to online', () => {
      const id = pr.register('alice', 'online');
      expect(pr.getStatus(id)).toBe('online');
    });

    it('should set status to offline by default', () => {
      const id = pr.register('alice');
      expect(pr.getStatus(id)).toBe('offline');
    });

    it('should set status', () => {
      const id = pr.register('alice', 'online');
      expect(pr.setStatus(id, 'away')).toBe(true);
    });

    it('should mark as away on setStatus', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'away');
      expect(pr.getStatus(id)).toBe('away');
    });

    it('should mark as busy on setStatus', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'busy');
      expect(pr.getStatus(id)).toBe('busy');
    });

    it('should not set status inactive', () => {
      const id = pr.register('alice', 'online');
      pr.setActive(id, false);
      expect(pr.setStatus(id, 'away')).toBe(false);
    });

    it('should return false for unknown setStatus', () => {
      expect(pr.setStatus('unknown', 'online')).toBe(false);
    });

    it('should heartbeat', () => {
      const id = pr.register('alice', 'online');
      expect(pr.heartbeat(id)).toBe(true);
    });

    it('should set lastSeen on heartbeat', () => {
      const id = pr.register('alice', 'online');
      pr.heartbeat(id);
      expect(pr.getLastSeen(id)).toBeGreaterThan(0);
    });

    it('should not heartbeat inactive', () => {
      const id = pr.register('alice', 'online');
      pr.setActive(id, false);
      expect(pr.heartbeat(id)).toBe(false);
    });

    it('should return false for unknown heartbeat', () => {
      expect(pr.heartbeat('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pr.register('alice', 'online');
      const stats = pr.getStats();
      expect(stats.presences).toBe(1);
    });

    it('should count online', () => {
      pr.register('alice', 'online');
      expect(pr.getStats().online).toBe(1);
    });

    it('should count offline', () => {
      pr.register('alice', 'offline');
      expect(pr.getStats().offline).toBe(1);
    });

    it('should count away', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'away');
      expect(pr.getStats().away).toBe(1);
    });

    it('should count busy', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'busy');
      expect(pr.getStats().busy).toBe(1);
    });

    it('should count active', () => {
      pr.register('alice', 'online');
      expect(pr.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pr.register('alice', 'online');
      pr.setActive(id, false);
      expect(pr.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'away');
      expect(pr.getStats().totalHits).toBe(1);
    });

    it('should count unique users', () => {
      pr.register('alice', 'online');
      pr.register('bob', 'online');
      expect(pr.getStats().uniqueUsers).toBe(2);
    });

    it('should count unique statuses', () => {
      pr.register('alice', 'online');
      pr.register('bob', 'offline');
      expect(pr.getStats().uniqueStatuses).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get presence', () => {
      pr.register('alice', 'online');
      expect(pr.getPresence('pr-1')?.user).toBe('alice');
    });

    it('should get all', () => {
      pr.register('alice', 'online');
      expect(pr.getAllPresences()).toHaveLength(1);
    });

    it('should remove', () => {
      pr.register('alice', 'online');
      expect(pr.removePresence('pr-1')).toBe(true);
    });

    it('should check existence', () => {
      pr.register('alice', 'online');
      expect(pr.hasPresence('pr-1')).toBe(true);
    });

    it('should count', () => {
      expect(pr.getCount()).toBe(0);
      pr.register('alice', 'online');
      expect(pr.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get user', () => {
      pr.register('alice', 'online');
      expect(pr.getUser('pr-1')).toBe('alice');
    });

    it('should get lastSeen', () => {
      pr.register('alice', 'online');
      expect(pr.getLastSeen('pr-1')).toBe(0);
    });

    it('should get history', () => {
      pr.register('alice', 'online');
      expect(pr.getHistory('pr-1')).toEqual(['online']);
    });

    it('should get hits', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'away');
      expect(pr.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pr.register('alice', 'online');
      expect(pr.setActive('pr-1', false)).toBe(true);
    });

    it('should set user', () => {
      pr.register('alice', 'online');
      expect(pr.setUser('pr-1', 'bob')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pr.setActive('unknown', false)).toBe(false);
      expect(pr.setUser('unknown', 'u')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pr.register('alice', 'online');
      pr.heartbeat(id);
      pr.setActive(id, false);
      pr.resetAll();
      expect(pr.getLastSeen(id)).toBe(0);
      expect(pr.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by user / status
  // ============================================================
  describe('by user / status', () => {
    it('should get by user', () => {
      pr.register('alice', 'online');
      expect(pr.getByUser('alice')).toHaveLength(1);
    });

    it('should get by status', () => {
      pr.register('alice', 'online');
      expect(pr.getByStatus('online')).toHaveLength(1);
    });

    it('should get active', () => {
      pr.register('alice', 'online');
      expect(pr.getActivePresences()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pr.register('alice', 'online');
      pr.setActive('pr-1', false);
      expect(pr.getInactivePresences()).toHaveLength(1);
    });

    it('should get online', () => {
      pr.register('alice', 'online');
      expect(pr.getOnlinePresences()).toHaveLength(1);
    });

    it('should get offline', () => {
      pr.register('alice', 'offline');
      expect(pr.getOfflinePresences()).toHaveLength(1);
    });

    it('should get away', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'away');
      expect(pr.getAwayPresences()).toHaveLength(1);
    });

    it('should get busy', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'busy');
      expect(pr.getBusyPresences()).toHaveLength(1);
    });

    it('should get all users', () => {
      pr.register('alice', 'online');
      pr.register('bob', 'online');
      expect(pr.getAllUsers()).toHaveLength(2);
    });

    it('should get user count', () => {
      pr.register('alice', 'online');
      expect(pr.getUserCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      pr.register('alice', 'online');
      expect(pr.getNewest()?.id).toBe('pr-1');
    });

    it('should return null for empty newest', () => {
      expect(pr.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pr.register('alice', 'online');
      expect(pr.getOldest()?.id).toBe('pr-1');
    });

    it('should return null for empty oldest', () => {
      expect(pr.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pr.register('alice', 'online');
      expect(pr.getCreatedAt('pr-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pr.register('alice', 'online');
      pr.setStatus(id, 'away');
      expect(pr.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total heartbeats', () => {
      const id = pr.register('alice', 'online');
      pr.heartbeat(id);
      expect(pr.getTotalHeartbeats()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many presences', () => {
      for (let i = 0; i < 50; i++) {
        pr.register(`user${i}`, 'online');
      }
      expect(pr.getCount()).toBe(50);
    });
  });
});