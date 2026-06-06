/**
 * InviteEngine Tests
 * chatdev-design Invite Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InviteEngine } from '../InviteEngine';

describe('InviteEngine', () => {
  let ine3: InviteEngine;

  beforeEach(() => {
    ine3 = new InviteEngine();
  });

  afterEach(() => {
    ine3.clearAll();
  });

  // ============================================================
  // invite / accept / decline / expire / remove
  // ============================================================
  describe('invite / accept / decline / expire / remove', () => {
    it('should invite', () => {
      expect(ine3.invite('alice', 'bob', 'room1')).toBe('ine3-1');
    });

    it('should default status to pending', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getStatus(id)).toBe('pending');
    });

    it('should mark as active', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      expect(ine3.isActive(id)).toBe(true);
    });

    it('should accept', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      expect(ine3.accept(id)).toBe(true);
    });

    it('should not accept inactive', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.setActive(id, false);
      expect(ine3.accept(id)).toBe(false);
    });

    it('should not accept non-pending', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.decline(id);
      expect(ine3.accept(id)).toBe(false);
    });

    it('should return false for unknown accept', () => {
      expect(ine3.accept('unknown')).toBe(false);
    });

    it('should decline', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      expect(ine3.decline(id)).toBe(true);
    });

    it('should return false for unknown decline', () => {
      expect(ine3.decline('unknown')).toBe(false);
    });

    it('should expire', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      expect(ine3.expire(id)).toBe(true);
    });

    it('should not expire non-pending', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.accept(id);
      expect(ine3.expire(id)).toBe(false);
    });

    it('should return false for unknown expire', () => {
      expect(ine3.expire('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      expect(ine3.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ine3.invite('alice', 'bob', 'room1');
      const stats = ine3.getStats();
      expect(stats.invites).toBe(1);
    });

    it('should count total accepted', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.accept(id);
      expect(ine3.getStats().totalAccepted).toBe(1);
    });

    it('should count total declined', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.decline(id);
      expect(ine3.getStats().totalDeclined).toBe(1);
    });

    it('should count total expired', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.expire(id);
      expect(ine3.getStats().totalExpired).toBe(1);
    });

    it('should count pending', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getStats().pending).toBe(1);
    });

    it('should count accepted', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.accept(id);
      expect(ine3.getStats().accepted).toBe(1);
    });

    it('should count declined', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.decline(id);
      expect(ine3.getStats().declined).toBe(1);
    });

    it('should count expired', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.expire(id);
      expect(ine3.getStats().expired).toBe(1);
    });

    it('should count active', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.setActive(id, false);
      expect(ine3.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.accept(id);
      expect(ine3.getStats().totalHits).toBe(1);
    });

    it('should count unique rooms', () => {
      ine3.invite('a', 'b', 'r1');
      ine3.invite('a', 'b', 'r1');
      expect(ine3.getStats().uniqueRooms).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get invite', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getInvite('ine3-1')?.room).toBe('room1');
    });

    it('should get all', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getAllInvites()).toHaveLength(1);
    });

    it('should check existence', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.hasInvite('ine3-1')).toBe(true);
    });

    it('should count', () => {
      expect(ine3.getCount()).toBe(0);
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get from', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getFrom('ine3-1')).toBe('alice');
    });

    it('should get to', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getTo('ine3-1')).toBe('bob');
    });

    it('should get room', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.getRoom('ine3-1')).toBe('room1');
    });

    it('should get hits', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.accept(id);
      expect(ine3.getHits(id)).toBe(1);
    });

    it('should check pending', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.isPending('ine3-1')).toBe(true);
    });

    it('should check accepted', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.accept(id);
      expect(ine3.isAccepted(id)).toBe(true);
    });

    it('should check declined', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.decline(id);
      expect(ine3.isDeclined(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ine3.invite('alice', 'bob', 'room1');
      expect(ine3.setActive('ine3-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ine3.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ine3.invite('alice', 'bob', 'room1');
      ine3.accept(id);
      ine3.setActive(id, false);
      ine3.resetAll();
      expect(ine3.getStatus(id)).toBe('pending');
      expect(ine3.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by status / room / user / state
  // ============================================================
  describe('by status / room / user / state', () => {
    it('should get by status', () => {
      ine3.invite('a', 'b', 'r1');
      expect(ine3.getByStatus('pending')).toHaveLength(1);
    });

    it('should get by room', () => {
      ine3.invite('a', 'b', 'r1');
      expect(ine3.getByRoom('r1')).toHaveLength(1);
    });

    it('should get by user', () => {
      ine3.invite('alice', 'bob', 'r1');
      expect(ine3.getByUser('alice')).toHaveLength(1);
    });

    it('should get active', () => {
      ine3.invite('a', 'b', 'r1');
      expect(ine3.getActiveInvites()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ine3.invite('a', 'b', 'r1');
      ine3.setActive('ine3-1', false);
      expect(ine3.getInactiveInvites()).toHaveLength(1);
    });

    it('should get all rooms', () => {
      ine3.invite('a', 'b', 'r1');
      ine3.invite('a', 'b', 'r2');
      expect(ine3.getAllRooms()).toHaveLength(2);
    });

    it('should get room count', () => {
      ine3.invite('a', 'b', 'r1');
      expect(ine3.getRoomCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      ine3.invite('a', 'b', 'r1');
      expect(ine3.getNewest()?.id).toBe('ine3-1');
    });

    it('should return null for empty newest', () => {
      expect(ine3.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ine3.invite('a', 'b', 'r1');
      expect(ine3.getOldest()?.id).toBe('ine3-1');
    });

    it('should return null for empty oldest', () => {
      expect(ine3.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ine3.invite('a', 'b', 'r1');
      expect(ine3.getCreatedAt('ine3-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ine3.invite('a', 'b', 'r1');
      ine3.accept(id);
      expect(ine3.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total accepted', () => {
      const id = ine3.invite('a', 'b', 'r1');
      ine3.accept(id);
      expect(ine3.getTotalAccepted()).toBe(1);
    });

    it('should get total declined', () => {
      const id = ine3.invite('a', 'b', 'r1');
      ine3.decline(id);
      expect(ine3.getTotalDeclined()).toBe(1);
    });

    it('should get total expired', () => {
      const id = ine3.invite('a', 'b', 'r1');
      ine3.expire(id);
      expect(ine3.getTotalExpired()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many invites', () => {
      for (let i = 0; i < 50; i++) {
        ine3.invite('a', 'b', `r${i}`);
      }
      expect(ine3.getCount()).toBe(50);
    });
  });
});