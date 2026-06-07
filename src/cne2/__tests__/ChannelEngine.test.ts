/**
 * ChannelEngine Tests
 * nanobot-design Channel Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChannelEngine } from '../ChannelEngine';

describe('ChannelEngine', () => {
  let cne2: ChannelEngine;

  beforeEach(() => {
    cne2 = new ChannelEngine();
  });

  afterEach(() => {
    cne2.clearAll();
  });

  describe('create / publish / subscribe / remove', () => {
    it('should create', () => {
      expect(cne2.create('ch1', 'alice', 'hello')).toMatch(/^cne2-/);
    });

    it('should default type to broadcast', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getType(cne2.getAllMessages()[0].id)).toBe('broadcast');
    });

    it('should mark as active', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.isActive(cne2.getAllMessages()[0].id)).toBe(true);
    });

    it('should publish', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.publish(id)).toBe(true);
    });

    it('should increment delivered', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.publish(id);
      expect(cne2.getDelivered(id)).toBe(1);
    });

    it('should not publish inactive', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.setActive(id, false);
      expect(cne2.publish(id)).toBe(false);
    });

    it('should return false for unknown publish', () => {
      expect(cne2.publish('unknown')).toBe(false);
    });

    it('should subscribe', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.subscribe('ch1')).toHaveLength(1);
    });

    it('should subscribe to empty channel', () => {
      expect(cne2.subscribe('unknown')).toHaveLength(0);
    });

    it('should remove', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getStats().messages).toBe(1);
    });

    it('should count total created', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getStats().totalCreated).toBe(1);
    });

    it('should count total published', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.publish(id);
      expect(cne2.getStats().totalPublished).toBe(1);
    });

    it('should count total subscribed', () => {
      cne2.create('ch1', 'alice', 'hi');
      cne2.subscribe('ch1');
      expect(cne2.getStats().totalSubscribed).toBe(1);
    });

    it('should count broadcast', () => {
      cne2.create('ch1', 'alice', 'hi', 'broadcast');
      expect(cne2.getStats().broadcast).toBe(1);
    });

    it('should count unicast', () => {
      cne2.create('ch1', 'alice', 'hi', 'unicast');
      expect(cne2.getStats().unicast).toBe(1);
    });

    it('should count multicast', () => {
      cne2.create('ch1', 'alice', 'hi', 'multicast');
      expect(cne2.getStats().multicast).toBe(1);
    });

    it('should count active', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.setActive(id, false);
      expect(cne2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.publish(id);
      expect(cne2.getStats().totalHits).toBe(1);
    });

    it('should count unique channels', () => {
      cne2.create('a', 'alice', 'hi');
      cne2.create('a', 'alice', 'hi');
      expect(cne2.getStats().uniqueChannels).toBe(1);
    });

    it('should count unique senders', () => {
      cne2.create('ch1', 'alice', 'hi');
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getStats().uniqueSenders).toBe(1);
    });

    it('should count total delivered', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.publish(id);
      expect(cne2.getStats().totalDelivered).toBe(1);
    });

    it('should count total content len', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getStats().totalContentLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get message', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getMessage(id)?.content).toBe('hi');
    });

    it('should get all', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getAllMessages()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.hasMessage(id)).toBe(true);
    });

    it('should count', () => {
      expect(cne2.getCount()).toBe(0);
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get channel', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getChannel(id)).toBe('ch1');
    });

    it('should get sender', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getSender(id)).toBe('alice');
    });

    it('should get content', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getContent(id)).toBe('hi');
    });

    it('should get hits', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.publish(id);
      expect(cne2.getHits(id)).toBe(1);
    });

    it('should check broadcast', () => {
      cne2.create('ch1', 'alice', 'hi', 'broadcast');
      expect(cne2.isBroadcast(cne2.getAllMessages()[0].id)).toBe(true);
    });

    it('should check unicast', () => {
      cne2.create('ch1', 'alice', 'hi', 'unicast');
      expect(cne2.isUnicast(cne2.getAllMessages()[0].id)).toBe(true);
    });

    it('should check multicast', () => {
      cne2.create('ch1', 'alice', 'hi', 'multicast');
      expect(cne2.isMulticast(cne2.getAllMessages()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.setActive(id, false)).toBe(true);
    });

    it('should set channel', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.setChannel(id, 'ch2')).toBe(true);
    });

    it('should set sender', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.setSender(id, 'bob')).toBe(true);
    });

    it('should set content', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.setContent(id, 'world')).toBe(true);
    });

    it('should set type', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.setType(id, 'unicast')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cne2.setActive('unknown', false)).toBe(false);
      expect(cne2.setChannel('unknown', 'ch')).toBe(false);
      expect(cne2.setSender('unknown', 's')).toBe(false);
      expect(cne2.setContent('unknown', 'c')).toBe(false);
      expect(cne2.setType('unknown', 'unicast')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.publish(id);
      cne2.setActive(id, false);
      cne2.resetAll();
      expect(cne2.getDelivered(id)).toBe(0);
      expect(cne2.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      cne2.create('ch1', 'alice', 'hi', 'unicast');
      expect(cne2.getByType('unicast')).toHaveLength(1);
    });

    it('should get by channel', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getByChannel('ch1')).toHaveLength(1);
    });

    it('should get active', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getActiveMessages()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.setActive(id, false);
      expect(cne2.getInactiveMessages()).toHaveLength(1);
    });

    it('should get all channels', () => {
      cne2.create('a', 'alice', 'hi');
      cne2.create('b', 'alice', 'hi');
      expect(cne2.getAllChannels()).toHaveLength(2);
    });

    it('should get all senders', () => {
      cne2.create('ch1', 'alice', 'hi');
      cne2.create('ch1', 'bob', 'hi');
      expect(cne2.getAllSenders()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getNewest()?.content).toBe('hi');
    });

    it('should return null for empty newest', () => {
      expect(cne2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getOldest()?.content).toBe('hi');
    });

    it('should return null for empty oldest', () => {
      expect(cne2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.publish(id);
      expect(cne2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total created', () => {
      cne2.create('ch1', 'alice', 'hi');
      expect(cne2.getTotalCreated()).toBe(1);
    });

    it('should get total published', () => {
      const id = cne2.create('ch1', 'alice', 'hi');
      cne2.publish(id);
      expect(cne2.getTotalPublished()).toBe(1);
    });

    it('should get total subscribed', () => {
      cne2.create('ch1', 'alice', 'hi');
      cne2.subscribe('ch1');
      expect(cne2.getTotalSubscribed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many messages', () => {
      for (let i = 0; i < 50; i++) {
        cne2.create('ch1', 'alice', `m${i}`);
      }
      expect(cne2.getCount()).toBe(50);
    });
  });
});