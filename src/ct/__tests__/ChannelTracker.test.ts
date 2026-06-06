/**
 * ChannelTracker Tests
 * chatdev-design Channel Tracker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChannelTracker } from '../ChannelTracker';

describe('ChannelTracker', () => {
  let ct: ChannelTracker;

  beforeEach(() => {
    ct = new ChannelTracker();
  });

  afterEach(() => {
    ct.clearAll();
  });

  // ============================================================
  // record / setStatus / addEvent
  // ============================================================
  describe('record / setStatus / addEvent', () => {
    it('should record', () => {
      expect(ct.record('c1')).toBe('ct-1');
    });

    it('should mark as open by default', () => {
      const id = ct.record('c1');
      expect(ct.isOpen(id)).toBe(true);
    });

    it('should mark as active', () => {
      const id = ct.record('c1');
      expect(ct.isActive(id)).toBe(true);
    });

    it('should set status', () => {
      const id = ct.record('c1');
      expect(ct.setStatus(id, 'closed')).toBe(true);
    });

    it('should mark as closed', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'closed');
      expect(ct.isClosed(id)).toBe(true);
    });

    it('should mark as busy', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'busy');
      expect(ct.isBusy(id)).toBe(true);
    });

    it('should increment events on setStatus', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'closed');
      expect(ct.getEvents(id)).toBe(1);
    });

    it('should not set status inactive', () => {
      const id = ct.record('c1');
      ct.setActive(id, false);
      expect(ct.setStatus(id, 'closed')).toBe(false);
    });

    it('should return false for unknown setStatus', () => {
      expect(ct.setStatus('unknown', 'closed')).toBe(false);
    });

    it('should add event', () => {
      const id = ct.record('c1');
      expect(ct.addEvent(id)).toBe(true);
    });

    it('should increment events on addEvent', () => {
      const id = ct.record('c1');
      ct.addEvent(id);
      expect(ct.getEvents(id)).toBe(1);
    });

    it('should not add event inactive', () => {
      const id = ct.record('c1');
      ct.setActive(id, false);
      expect(ct.addEvent(id)).toBe(false);
    });

    it('should return false for unknown addEvent', () => {
      expect(ct.addEvent('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ct.record('c1');
      const stats = ct.getStats();
      expect(stats.channels).toBe(1);
    });

    it('should count open', () => {
      ct.record('c1');
      expect(ct.getStats().open).toBe(1);
    });

    it('should count closed', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'closed');
      expect(ct.getStats().closed).toBe(1);
    });

    it('should count busy', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'busy');
      expect(ct.getStats().busy).toBe(1);
    });

    it('should count active', () => {
      ct.record('c1');
      expect(ct.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ct.record('c1');
      ct.setActive(id, false);
      expect(ct.getStats().inactive).toBe(1);
    });

    it('should count total events', () => {
      const id = ct.record('c1');
      ct.addEvent(id);
      ct.addEvent(id);
      expect(ct.getStats().totalEvents).toBe(2);
    });

    it('should count total hits', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'closed');
      expect(ct.getStats().totalHits).toBe(1);
    });

    it('should compute avg events', () => {
      const id = ct.record('c1');
      ct.addEvent(id);
      expect(ct.getStats().avgEvents).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get channel', () => {
      ct.record('c1');
      expect(ct.getChannel('ct-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      ct.record('c1');
      expect(ct.getAllChannels()).toHaveLength(1);
    });

    it('should remove', () => {
      ct.record('c1');
      expect(ct.removeChannel('ct-1')).toBe(true);
    });

    it('should check existence', () => {
      ct.record('c1');
      expect(ct.hasChannel('ct-1')).toBe(true);
    });

    it('should count', () => {
      expect(ct.getCount()).toBe(0);
      ct.record('c1');
      expect(ct.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ct.record('c1');
      expect(ct.getName('ct-1')).toBe('c1');
    });

    it('should get status', () => {
      ct.record('c1');
      expect(ct.getStatus('ct-1')).toBe('open');
    });

    it('should get events', () => {
      ct.record('c1');
      expect(ct.getEvents('ct-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'closed');
      expect(ct.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'closed');
      expect(ct.getHistory(id)).toEqual(['open', 'closed']);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ct.record('c1');
      expect(ct.setActive('ct-1', false)).toBe(true);
    });

    it('should set name', () => {
      ct.record('c1');
      expect(ct.setName('ct-1', 'c2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ct.setActive('unknown', false)).toBe(false);
      expect(ct.setName('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ct.record('c1');
      ct.addEvent(id);
      ct.setActive(id, false);
      ct.resetAll();
      expect(ct.getEvents(id)).toBe(0);
      expect(ct.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      ct.record('c1');
      expect(ct.getByName('c1')).toHaveLength(1);
    });

    it('should get by status', () => {
      ct.record('c1');
      expect(ct.getByStatus('open')).toHaveLength(1);
    });

    it('should get active', () => {
      ct.record('c1');
      expect(ct.getActiveChannels()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ct.record('c1');
      ct.setActive('ct-1', false);
      expect(ct.getInactiveChannels()).toHaveLength(1);
    });

    it('should get open', () => {
      ct.record('c1');
      expect(ct.getOpenChannels()).toHaveLength(1);
    });

    it('should get closed', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'closed');
      expect(ct.getClosedChannels()).toHaveLength(1);
    });

    it('should get busy', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'busy');
      expect(ct.getBusyChannels()).toHaveLength(1);
    });

    it('should get all names', () => {
      ct.record('c1');
      ct.record('c2');
      expect(ct.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ct.record('c1');
      expect(ct.getNameCount()).toBe(1);
    });

    it('should get by min events', () => {
      const id = ct.record('c1');
      ct.addEvent(id);
      expect(ct.getByMinEvents(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most events', () => {
      const id = ct.record('c1');
      ct.addEvent(id);
      ct.addEvent(id);
      expect(ct.getMostEvents()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ct.getMostEvents()).toBeNull();
    });

    it('should get newest', () => {
      ct.record('c1');
      expect(ct.getNewest()?.id).toBe('ct-1');
    });

    it('should return null for empty newest', () => {
      expect(ct.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ct.record('c1');
      expect(ct.getOldest()?.id).toBe('ct-1');
    });

    it('should return null for empty oldest', () => {
      expect(ct.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ct.record('c1');
      expect(ct.getCreatedAt('ct-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ct.record('c1');
      ct.setStatus(id, 'closed');
      expect(ct.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many channels', () => {
      for (let i = 0; i < 50; i++) {
        ct.record(`c${i}`);
      }
      expect(ct.getCount()).toBe(50);
    });
  });
});