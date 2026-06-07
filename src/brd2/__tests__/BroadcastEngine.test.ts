/**
 * BroadcastEngine Tests
 * nanobot-design Broadcast Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BroadcastEngine } from '../BroadcastEngine';

describe('BroadcastEngine', () => {
  let brd2: BroadcastEngine;

  beforeEach(() => {
    brd2 = new BroadcastEngine();
  });

  afterEach(() => {
    brd2.clearAll();
  });

  describe('send / receive / ack / remove', () => {
    it('should send', () => {
      expect(brd2.send('hi', 'alice', 'group1')).toMatch(/^bre2-/);
    });

    it('should default mode to all', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getMode(brd2.getAllBroadcasts()[0].id)).toBe('all');
    });

    it('should mark as active', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.isActive(brd2.getAllBroadcasts()[0].id)).toBe(true);
    });

    it('should receive', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.receive(id)).toBe(true);
    });

    it('should not receive inactive', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.setActive(id, false);
      expect(brd2.receive(id)).toBe(false);
    });

    it('should return false for unknown receive', () => {
      expect(brd2.receive('unknown')).toBe(false);
    });

    it('should ack', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.ack(id)).toBe(true);
    });

    it('should increment acks', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.ack(id);
      expect(brd2.getAcks(id)).toBe(1);
    });

    it('should not ack inactive', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.setActive(id, false);
      expect(brd2.ack(id)).toBe(false);
    });

    it('should return false for unknown ack', () => {
      expect(brd2.ack('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getStats().broadcasts).toBe(1);
    });

    it('should count total sent', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getStats().totalSent).toBe(1);
    });

    it('should count total received', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.receive(id);
      expect(brd2.getStats().totalReceived).toBe(1);
    });

    it('should count total acked', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.ack(id);
      expect(brd2.getStats().totalAcked).toBe(1);
    });

    it('should count all', () => {
      brd2.send('hi', 'alice', 'group1', 'all');
      expect(brd2.getStats().all).toBe(1);
    });

    it('should count group', () => {
      brd2.send('hi', 'alice', 'group1', 'group');
      expect(brd2.getStats().group).toBe(1);
    });

    it('should count region', () => {
      brd2.send('hi', 'alice', 'group1', 'region');
      expect(brd2.getStats().region).toBe(1);
    });

    it('should count active', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.setActive(id, false);
      expect(brd2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.receive(id);
      expect(brd2.getStats().totalHits).toBe(1);
    });

    it('should count unique messages', () => {
      brd2.send('a', 'alice', 'g1');
      brd2.send('a', 'alice', 'g1');
      expect(brd2.getStats().uniqueMessages).toBe(1);
    });

    it('should count unique senders', () => {
      brd2.send('a', 'alice', 'g1');
      brd2.send('b', 'alice', 'g1');
      expect(brd2.getStats().uniqueSenders).toBe(1);
    });

    it('should count total acks', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.ack(id);
      expect(brd2.getStats().totalAcks).toBe(1);
    });

    it('should count total message len', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getStats().totalMessageLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get broadcast', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.getBroadcast(id)?.message).toBe('hi');
    });

    it('should get all', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getAllBroadcasts()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.hasBroadcast(id)).toBe(true);
    });

    it('should count', () => {
      expect(brd2.getCount()).toBe(0);
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get message', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.getMessage(id)).toBe('hi');
    });

    it('should get sender', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.getSender(id)).toBe('alice');
    });

    it('should get target', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.getTarget(id)).toBe('group1');
    });

    it('should get hits', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.receive(id);
      expect(brd2.getHits(id)).toBe(1);
    });

    it('should check all', () => {
      brd2.send('hi', 'alice', 'group1', 'all');
      expect(brd2.isAll(brd2.getAllBroadcasts()[0].id)).toBe(true);
    });

    it('should check group', () => {
      brd2.send('hi', 'alice', 'group1', 'group');
      expect(brd2.isGroup(brd2.getAllBroadcasts()[0].id)).toBe(true);
    });

    it('should check region', () => {
      brd2.send('hi', 'alice', 'group1', 'region');
      expect(brd2.isRegion(brd2.getAllBroadcasts()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.setActive(id, false)).toBe(true);
    });

    it('should set message', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.setMessage(id, 'new')).toBe(true);
    });

    it('should set target', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.setTarget(id, 'group2')).toBe(true);
    });

    it('should set mode', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.setMode(id, 'group')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(brd2.setActive('unknown', false)).toBe(false);
      expect(brd2.setMessage('unknown', 'm')).toBe(false);
      expect(brd2.setTarget('unknown', 't')).toBe(false);
      expect(brd2.setMode('unknown', 'all')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.ack(id);
      brd2.setActive(id, false);
      brd2.resetAll();
      expect(brd2.getAcks(id)).toBe(0);
      expect(brd2.isActive(id)).toBe(true);
    });
  });

  describe('by mode / state', () => {
    it('should get by mode', () => {
      brd2.send('hi', 'alice', 'group1', 'group');
      expect(brd2.getByMode('group')).toHaveLength(1);
    });

    it('should get active', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getActiveBroadcasts()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.setActive(id, false);
      expect(brd2.getInactiveBroadcasts()).toHaveLength(1);
    });

    it('should get all messages', () => {
      brd2.send('a', 'alice', 'g1');
      brd2.send('b', 'alice', 'g1');
      expect(brd2.getAllMessages()).toHaveLength(2);
    });

    it('should get all senders', () => {
      brd2.send('a', 'alice', 'g1');
      brd2.send('a', 'bob', 'g1');
      expect(brd2.getAllSenders()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getNewest()?.message).toBe('hi');
    });

    it('should return null for empty newest', () => {
      expect(brd2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getOldest()?.message).toBe('hi');
    });

    it('should return null for empty oldest', () => {
      expect(brd2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      expect(brd2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.receive(id);
      expect(brd2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total sent', () => {
      brd2.send('hi', 'alice', 'group1');
      expect(brd2.getTotalSent()).toBe(1);
    });

    it('should get total received', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.receive(id);
      expect(brd2.getTotalReceived()).toBe(1);
    });

    it('should get total acked', () => {
      const id = brd2.send('hi', 'alice', 'group1');
      brd2.ack(id);
      expect(brd2.getTotalAcked()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many broadcasts', () => {
      for (let i = 0; i < 50; i++) {
        brd2.send(`m${i}`, 'alice', 'g1');
      }
      expect(brd2.getCount()).toBe(50);
    });
  });
});