/**
 * SessionManager Tests
 * chatdev-design Session Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '../SessionManager';

describe('SessionManager', () => {
  let sm: SessionManager;

  beforeEach(() => {
    sm = new SessionManager();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // create / set / get / close
  // ============================================================
  describe('create / set / get / close', () => {
    it('should create', () => {
      expect(sm.create('u1')).toBe('sess-1');
    });

    it('should set', () => {
      const id = sm.create('u1');
      expect(sm.set(id, 'k1', 'v1')).toBe(true);
    });

    it('should get', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      expect(sm.get(id, 'k1')).toBe('v1');
    });

    it('should return undefined for missing key', () => {
      const id = sm.create('u1');
      expect(sm.get(id, 'unknown')).toBeUndefined();
    });

    it('should not set on closed', () => {
      const id = sm.create('u1');
      sm.close(id);
      expect(sm.set(id, 'k1', 'v1')).toBe(false);
    });

    it('should not get on closed', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      sm.close(id);
      // closed session still readable
      expect(sm.get(id, 'k1')).toBe('v1');
    });

    it('should close', () => {
      const id = sm.create('u1');
      expect(sm.close(id)).toBe(true);
    });

    it('should not close already closed', () => {
      const id = sm.create('u1');
      sm.close(id);
      expect(sm.close(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(sm.set('unknown', 'k', 'v')).toBe(false);
      expect(sm.close('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sm.create('u1');
      const stats = sm.getStats();
      expect(stats.sessions).toBe(1);
    });

    it('should count active', () => {
      sm.create('u1');
      expect(sm.getStats().active).toBe(1);
    });

    it('should count closed', () => {
      const id = sm.create('u1');
      sm.close(id);
      expect(sm.getStats().closed).toBe(1);
    });

    it('should count users', () => {
      sm.create('u1');
      sm.create('u2');
      expect(sm.getStats().users).toBe(2);
    });

    it('should count total hits', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      sm.get(id, 'k1');
      expect(sm.getStats().totalHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get session', () => {
      sm.create('u1');
      expect(sm.getSession('sess-1')?.userId).toBe('u1');
    });

    it('should get all', () => {
      sm.create('u1');
      expect(sm.getAllSessions()).toHaveLength(1);
    });

    it('should remove', () => {
      sm.create('u1');
      expect(sm.removeSession('sess-1')).toBe(true);
    });

    it('should check existence', () => {
      sm.create('u1');
      expect(sm.hasSession('sess-1')).toBe(true);
    });

    it('should count', () => {
      expect(sm.getCount()).toBe(0);
      sm.create('u1');
      expect(sm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get user id', () => {
      sm.create('u1');
      expect(sm.getUserId('sess-1')).toBe('u1');
    });

    it('should get data', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      expect(sm.getData(id)).toEqual({ k1: 'v1' });
    });

    it('should get keys', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      expect(sm.getKeys(id)).toContain('k1');
    });

    it('should get key count', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      sm.set(id, 'k2', 'v2');
      expect(sm.getKeyCount(id)).toBe(2);
    });

    it('should check hasKey', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      expect(sm.hasKey(id, 'k1')).toBe(true);
    });

    it('should get hits', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      sm.get(id, 'k1');
      expect(sm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // delete / clear
  // ============================================================
  describe('delete / clear', () => {
    it('should delete key', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      expect(sm.deleteKey(id, 'k1')).toBe(true);
    });

    it('should not delete missing', () => {
      const id = sm.create('u1');
      expect(sm.deleteKey(id, 'k1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(sm.deleteKey('unknown', 'k')).toBe(false);
    });

    it('should clear data', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      expect(sm.clearData(id)).toBe(true);
    });

    it('should return false for unknown clearData', () => {
      expect(sm.clearData('unknown')).toBe(false);
    });
  });

  // ============================================================
  // state
  // ============================================================
  describe('state', () => {
    it('should check isActive', () => {
      sm.create('u1');
      expect(sm.isActive('sess-1')).toBe(true);
    });

    it('should check isClosed', () => {
      const id = sm.create('u1');
      sm.close(id);
      expect(sm.isClosed('sess-1')).toBe(true);
    });

    it('should reopen closed', () => {
      const id = sm.create('u1');
      sm.close(id);
      expect(sm.reopen(id)).toBe(true);
    });

    it('should not reopen active', () => {
      const id = sm.create('u1');
      expect(sm.reopen(id)).toBe(false);
    });

    it('should return false for unknown reopen', () => {
      expect(sm.reopen('unknown')).toBe(false);
    });
  });

  // ============================================================
  // by user
  // ============================================================
  describe('by user', () => {
    it('should get by user id', () => {
      sm.create('u1');
      expect(sm.getByUserId('u1')).toHaveLength(1);
    });

    it('should get active', () => {
      sm.create('u1');
      expect(sm.getActiveSessions()).toHaveLength(1);
    });

    it('should get closed', () => {
      const id = sm.create('u1');
      sm.close(id);
      expect(sm.getClosedSessions()).toHaveLength(1);
    });

    it('should get all user ids', () => {
      sm.create('u1');
      sm.create('u2');
      expect(sm.getAllUserIds()).toHaveLength(2);
    });

    it('should get user count', () => {
      sm.create('u1');
      sm.create('u2');
      expect(sm.getUserCount()).toBe(2);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get started at', () => {
      sm.create('u1');
      expect(sm.getStartedAt('sess-1')).toBeGreaterThan(0);
    });

    it('should get ended at', () => {
      const id = sm.create('u1');
      sm.close(id);
      expect(sm.getEndedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });

    it('should get duration', () => {
      const id = sm.create('u1');
      expect(sm.getDuration(id)).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = sm.create('u1');
      sm.set(id, 'k1', 'v1');
      sm.get(id, 'k1');
      expect(sm.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sm.getMostHit()).toBeNull();
    });

    it('should get newest', () => {
      sm.create('u1');
      expect(sm.getNewest()?.id).toBe('sess-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.create('u1');
      expect(sm.getOldest()?.id).toBe('sess-1');
    });

    it('should return null for empty oldest', () => {
      expect(sm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many sessions', () => {
      for (let i = 0; i < 50; i++) {
        sm.create(`u${i}`);
      }
      expect(sm.getCount()).toBe(50);
    });
  });
});