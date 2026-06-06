/**
 * ChannelEngine Tests
 * chatdev-design Channel Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChannelEngine } from '../ChannelEngine';

describe('ChannelEngine', () => {
  let cnl: ChannelEngine;

  beforeEach(() => {
    cnl = new ChannelEngine();
  });

  afterEach(() => {
    cnl.clearAll();
  });

  // ============================================================
  // create / join / leave / send / remove
  // ============================================================
  describe('create / join / leave / send / remove', () => {
    it('should create', () => {
      expect(cnl.create('c1', 'public')).toBe('cnl-1');
    });

    it('should default type to public', () => {
      const id = cnl.create('c1');
      expect(cnl.getType(id)).toBe('public');
    });

    it('should mark as active', () => {
      const id = cnl.create('c1', 'public');
      expect(cnl.isActive(id)).toBe(true);
    });

    it('should join', () => {
      const id = cnl.create('c1', 'public');
      expect(cnl.join(id, 'alice')).toBe(true);
    });

    it('should not join inactive', () => {
      const id = cnl.create('c1', 'public');
      cnl.setActive(id, false);
      expect(cnl.join(id, 'alice')).toBe(false);
    });

    it('should not add duplicate member', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      cnl.join(id, 'alice');
      expect(cnl.getMemberCount(id)).toBe(1);
    });

    it('should return false for unknown join', () => {
      expect(cnl.join('unknown', 'alice')).toBe(false);
    });

    it('should leave', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      expect(cnl.leave(id, 'alice')).toBe(true);
    });

    it('should not leave non-member', () => {
      const id = cnl.create('c1', 'public');
      expect(cnl.leave(id, 'alice')).toBe(false);
    });

    it('should return false for unknown leave', () => {
      expect(cnl.leave('unknown', 'alice')).toBe(false);
    });

    it('should send', () => {
      const id = cnl.create('c1', 'public');
      expect(cnl.send(id, 'alice', 'hello')).toMatch(/^cnl-1-msg-1$/);
    });

    it('should not send to inactive', () => {
      const id = cnl.create('c1', 'public');
      cnl.setActive(id, false);
      expect(cnl.send(id, 'alice', 'hello')).toBeNull();
    });

    it('should return null for unknown send', () => {
      expect(cnl.send('unknown', 'alice', 'hello')).toBeNull();
    });

    it('should remove', () => {
      const id = cnl.create('c1', 'public');
      expect(cnl.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cnl.create('c1', 'public');
      const stats = cnl.getStats();
      expect(stats.channels).toBe(1);
    });

    it('should count total sent', () => {
      const id = cnl.create('c1', 'public');
      cnl.send(id, 'alice', 'hi');
      expect(cnl.getStats().totalSent).toBe(1);
    });

    it('should count total joins', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      expect(cnl.getStats().totalJoins).toBe(1);
    });

    it('should count total leaves', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      cnl.leave(id, 'alice');
      expect(cnl.getStats().totalLeaves).toBe(1);
    });

    it('should count public', () => {
      cnl.create('c1', 'public');
      expect(cnl.getStats().public).toBe(1);
    });

    it('should count private', () => {
      cnl.create('c1', 'private');
      expect(cnl.getStats().private).toBe(1);
    });

    it('should count direct', () => {
      cnl.create('c1', 'direct');
      expect(cnl.getStats().direct).toBe(1);
    });

    it('should count active', () => {
      cnl.create('c1', 'public');
      expect(cnl.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cnl.create('c1', 'public');
      cnl.setActive(id, false);
      expect(cnl.getStats().inactive).toBe(1);
    });

    it('should count total members', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      cnl.join(id, 'bob');
      expect(cnl.getStats().totalMembers).toBe(2);
    });

    it('should count total messages', () => {
      const id = cnl.create('c1', 'public');
      cnl.send(id, 'alice', 'hi');
      cnl.send(id, 'bob', 'hey');
      expect(cnl.getStats().totalMessages).toBe(2);
    });

    it('should count unique names', () => {
      cnl.create('a', 'public');
      cnl.create('b', 'public');
      expect(cnl.getStats().uniqueNames).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get channel', () => {
      cnl.create('c1', 'public');
      expect(cnl.getChannel('cnl-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      cnl.create('c1', 'public');
      expect(cnl.getAllChannels()).toHaveLength(1);
    });

    it('should check existence', () => {
      cnl.create('c1', 'public');
      expect(cnl.hasChannel('cnl-1')).toBe(true);
    });

    it('should count', () => {
      expect(cnl.getCount()).toBe(0);
      cnl.create('c1', 'public');
      expect(cnl.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      cnl.create('c1', 'public');
      expect(cnl.getName('cnl-1')).toBe('c1');
    });

    it('should get members', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      expect(cnl.getMembers(id)).toEqual(['alice']);
    });

    it('should get member count', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      expect(cnl.getMemberCount(id)).toBe(1);
    });

    it('should get messages', () => {
      const id = cnl.create('c1', 'public');
      cnl.send(id, 'alice', 'hi');
      expect(cnl.getMessages(id)).toHaveLength(1);
    });

    it('should get message count', () => {
      const id = cnl.create('c1', 'public');
      cnl.send(id, 'alice', 'hi');
      expect(cnl.getMessageCount(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      expect(cnl.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cnl.create('c1', 'public');
      expect(cnl.setActive('cnl-1', false)).toBe(true);
    });

    it('should set name', () => {
      cnl.create('c1', 'public');
      expect(cnl.setName('cnl-1', 'c2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cnl.setActive('unknown', false)).toBe(false);
      expect(cnl.setName('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      cnl.send(id, 'alice', 'hi');
      cnl.setActive(id, false);
      cnl.resetAll();
      expect(cnl.getMemberCount(id)).toBe(0);
      expect(cnl.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / type / state
  // ============================================================
  describe('by name / type / state', () => {
    it('should get by name', () => {
      cnl.create('c1', 'public');
      expect(cnl.getByName('c1')).toHaveLength(1);
    });

    it('should get by type', () => {
      cnl.create('c1', 'public');
      expect(cnl.getByType('public')).toHaveLength(1);
    });

    it('should get active', () => {
      cnl.create('c1', 'public');
      expect(cnl.getActiveChannels()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cnl.create('c1', 'public');
      cnl.setActive('cnl-1', false);
      expect(cnl.getInactiveChannels()).toHaveLength(1);
    });

    it('should get all names', () => {
      cnl.create('a', 'public');
      cnl.create('b', 'public');
      expect(cnl.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      cnl.create('a', 'public');
      expect(cnl.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      cnl.create('c1', 'public');
      expect(cnl.getNewest()?.id).toBe('cnl-1');
    });

    it('should return null for empty newest', () => {
      expect(cnl.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cnl.create('c1', 'public');
      expect(cnl.getOldest()?.id).toBe('cnl-1');
    });

    it('should return null for empty oldest', () => {
      expect(cnl.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cnl.create('c1', 'public');
      expect(cnl.getCreatedAt('cnl-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      expect(cnl.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total sent', () => {
      const id = cnl.create('c1', 'public');
      cnl.send(id, 'alice', 'hi');
      expect(cnl.getTotalSent()).toBe(1);
    });

    it('should get total joins', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      expect(cnl.getTotalJoins()).toBe(1);
    });

    it('should get total leaves', () => {
      const id = cnl.create('c1', 'public');
      cnl.join(id, 'alice');
      cnl.leave(id, 'alice');
      expect(cnl.getTotalLeaves()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many channels', () => {
      for (let i = 0; i < 50; i++) {
        cnl.create(`c${i}`, 'public');
      }
      expect(cnl.getCount()).toBe(50);
    });
  });
});