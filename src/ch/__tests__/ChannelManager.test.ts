/**
 * ChannelManager Tests
 * chatdev-design Channel Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChannelManager } from '../ChannelManager';

describe('ChannelManager', () => {
  let cm: ChannelManager;

  beforeEach(() => {
    cm = new ChannelManager();
  });

  afterEach(() => {
    cm.clearAll();
  });

  // ============================================================
  // create / join / broadcast
  // ============================================================
  describe('create / join / broadcast', () => {
    it('should create', () => {
      expect(cm.create('c1')).toBe('ch-1');
    });

    it('should join', () => {
      const id = cm.create('c1');
      expect(cm.join(id, 'u1')).toBe(true);
    });

    it('should not join same user twice', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      expect(cm.join(id, 'u1')).toBe(false);
    });

    it('should not join inactive', () => {
      const id = cm.create('c1');
      cm.setActive(id, false);
      expect(cm.join(id, 'u1')).toBe(false);
    });

    it('should return false for unknown join', () => {
      expect(cm.join('unknown', 'u1')).toBe(false);
    });

    it('should broadcast', () => {
      const id = cm.create('c1');
      expect(cm.broadcast(id, 'msg')).toBe(true);
    });

    it('should not broadcast inactive', () => {
      const id = cm.create('c1');
      cm.setActive(id, false);
      expect(cm.broadcast(id, 'msg')).toBe(false);
    });

    it('should return false for unknown broadcast', () => {
      expect(cm.broadcast('unknown', 'msg')).toBe(false);
    });

    it('should increment messages on broadcast', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'msg');
      expect(cm.getMessages(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cm.create('c1');
      const stats = cm.getStats();
      expect(stats.channels).toBe(1);
    });

    it('should count total members', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      cm.join(id, 'u2');
      expect(cm.getStats().totalMembers).toBe(2);
    });

    it('should count total messages', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm1');
      cm.broadcast(id, 'm2');
      expect(cm.getStats().totalMessages).toBe(2);
    });

    it('should compute avg members', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      cm.join(id, 'u2');
      expect(cm.getStats().avgMembers).toBe(2);
    });

    it('should compute avg messages', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm1');
      expect(cm.getStats().avgMessages).toBe(1);
    });

    it('should count active', () => {
      cm.create('c1');
      expect(cm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cm.create('c1');
      cm.setActive(id, false);
      expect(cm.getStats().inactive).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get channel', () => {
      cm.create('c1');
      expect(cm.getChannel('ch-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      cm.create('c1');
      expect(cm.getAllChannels()).toHaveLength(1);
    });

    it('should remove', () => {
      cm.create('c1');
      expect(cm.removeChannel('ch-1')).toBe(true);
    });

    it('should check existence', () => {
      cm.create('c1');
      expect(cm.hasChannel('ch-1')).toBe(true);
    });

    it('should count', () => {
      expect(cm.getCount()).toBe(0);
      cm.create('c1');
      expect(cm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      cm.create('c1');
      expect(cm.getName('ch-1')).toBe('c1');
    });

    it('should get members', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      expect(cm.getMembers(id)).toContain('u1');
    });

    it('should get member count', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      expect(cm.getMemberCount(id)).toBe(1);
    });

    it('should get messages', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm');
      expect(cm.getMessages(id)).toBe(1);
    });

    it('should get history', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm');
      expect(cm.getHistory(id)).toEqual(['m']);
    });

    it('should get hits', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm');
      expect(cm.getHits(id)).toBe(1);
    });

    it('should check isActive', () => {
      cm.create('c1');
      expect(cm.isActive('ch-1')).toBe(true);
    });

    it('should check isMember', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      expect(cm.isMember(id, 'u1')).toBe(true);
    });
  });

  // ============================================================
  // leave
  // ============================================================
  describe('leave', () => {
    it('should leave', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      expect(cm.leave(id, 'u1')).toBe(true);
    });

    it('should not leave non-member', () => {
      const id = cm.create('c1');
      expect(cm.leave(id, 'u1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(cm.leave('unknown', 'u1')).toBe(false);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set name', () => {
      const id = cm.create('c1');
      expect(cm.setName(id, 'c2')).toBe(true);
    });

    it('should set active', () => {
      const id = cm.create('c1');
      expect(cm.setActive(id, false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cm.setName('unknown', 'c')).toBe(false);
      expect(cm.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // clear / reset
  // ============================================================
  describe('clear / reset', () => {
    it('should clear history', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm');
      expect(cm.clearHistory(id)).toBe(true);
    });

    it('should reset messages', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm');
      expect(cm.resetMessages(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cm.clearHistory('unknown')).toBe(false);
      expect(cm.resetMessages('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      cm.broadcast(id, 'm');
      cm.resetAll();
      expect(cm.getMemberCount(id)).toBe(0);
    });
  });

  // ============================================================
  // by name / member
  // ============================================================
  describe('by name / member', () => {
    it('should get by name', () => {
      cm.create('c1');
      expect(cm.getByName('c1')).toHaveLength(1);
    });

    it('should get by member', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      expect(cm.getByMember('u1')).toHaveLength(1);
    });

    it('should get active', () => {
      cm.create('c1');
      expect(cm.getActiveChannels()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = cm.create('c1');
      cm.setActive(id, false);
      expect(cm.getInactiveChannels()).toHaveLength(1);
    });

    it('should get all names', () => {
      cm.create('c1');
      cm.create('c2');
      expect(cm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      cm.create('c1');
      expect(cm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // by min
  // ============================================================
  describe('by min', () => {
    it('should get by min members', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      expect(cm.getByMinMembers(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most members', () => {
      const id = cm.create('c1');
      cm.join(id, 'u1');
      expect(cm.getMostMembers()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(cm.getMostMembers()).toBeNull();
    });

    it('should get most messages', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm');
      expect(cm.getMostMessages()?.id).toBe(id);
    });

    it('should return null for empty most messages', () => {
      expect(cm.getMostMessages()).toBeNull();
    });

    it('should get newest', () => {
      cm.create('c1');
      expect(cm.getNewest()?.id).toBe('ch-1');
    });

    it('should return null for empty newest', () => {
      expect(cm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cm.create('c1');
      expect(cm.getOldest()?.id).toBe('ch-1');
    });

    it('should return null for empty oldest', () => {
      expect(cm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cm.create('c1');
      expect(cm.getCreatedAt('ch-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cm.create('c1');
      cm.broadcast(id, 'm');
      expect(cm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many channels', () => {
      for (let i = 0; i < 50; i++) {
        cm.create(`c${i}`);
      }
      expect(cm.getCount()).toBe(50);
    });
  });
});