/**
 * ConnectionManager Tests
 * thunderbolt-design Connection Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConnectionManager } from '../ConnectionManager';

describe('ConnectionManager', () => {
  let cm: ConnectionManager;

  beforeEach(() => {
    cm = new ConnectionManager();
  });

  afterEach(() => {
    cm.clearAll();
  });

  // ============================================================
  // create / exchange / close / reopen
  // ============================================================
  describe('create / exchange / close / reopen', () => {
    it('should create', () => {
      expect(cm.create('a', 'b')).toBe('cm-1');
    });

    it('should mark as open', () => {
      const id = cm.create('a', 'b');
      expect(cm.isOpen(id)).toBe(true);
    });

    it('should mark as active', () => {
      const id = cm.create('a', 'b');
      expect(cm.isActive(id)).toBe(true);
    });

    it('should exchange', () => {
      const id = cm.create('a', 'b');
      expect(cm.exchange(id)).toBe(true);
    });

    it('should increment messages on exchange', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getMessages(id)).toBe(1);
    });

    it('should log history on exchange', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getHistory(id)).toHaveLength(1);
    });

    it('should not exchange inactive', () => {
      const id = cm.create('a', 'b');
      cm.setActive(id, false);
      expect(cm.exchange(id)).toBe(false);
    });

    it('should not exchange closed', () => {
      const id = cm.create('a', 'b');
      cm.close(id);
      expect(cm.exchange(id)).toBe(false);
    });

    it('should return false for unknown exchange', () => {
      expect(cm.exchange('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = cm.create('a', 'b');
      expect(cm.close(id)).toBe(true);
    });

    it('should mark as closed', () => {
      const id = cm.create('a', 'b');
      cm.close(id);
      expect(cm.isOpen(id)).toBe(false);
    });

    it('should not close twice', () => {
      const id = cm.create('a', 'b');
      cm.close(id);
      expect(cm.close(id)).toBe(false);
    });

    it('should return false for unknown close', () => {
      expect(cm.close('unknown')).toBe(false);
    });

    it('should reopen', () => {
      const id = cm.create('a', 'b');
      cm.close(id);
      expect(cm.reopen(id)).toBe(true);
    });

    it('should mark as open on reopen', () => {
      const id = cm.create('a', 'b');
      cm.close(id);
      cm.reopen(id);
      expect(cm.isOpen(id)).toBe(true);
    });

    it('should not reopen open', () => {
      const id = cm.create('a', 'b');
      expect(cm.reopen(id)).toBe(false);
    });

    it('should return false for unknown reopen', () => {
      expect(cm.reopen('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cm.create('a', 'b');
      const stats = cm.getStats();
      expect(stats.connections).toBe(1);
    });

    it('should count open', () => {
      cm.create('a', 'b');
      expect(cm.getStats().open).toBe(1);
    });

    it('should count closed', () => {
      const id = cm.create('a', 'b');
      cm.close(id);
      expect(cm.getStats().closed).toBe(1);
    });

    it('should count total messages', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getStats().totalMessages).toBe(1);
    });

    it('should count active', () => {
      cm.create('a', 'b');
      expect(cm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cm.create('a', 'b');
      cm.setActive(id, false);
      expect(cm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getStats().totalHits).toBe(1);
    });

    it('should count unique from', () => {
      cm.create('a', 'b');
      cm.create('a', 'c');
      expect(cm.getStats().uniqueFrom).toBe(1);
    });

    it('should count unique to', () => {
      cm.create('a', 'b');
      cm.create('c', 'b');
      expect(cm.getStats().uniqueTo).toBe(1);
    });

    it('should count unique pairs', () => {
      cm.create('a', 'b');
      cm.create('c', 'd');
      expect(cm.getStats().uniquePairs).toBe(2);
    });

    it('should compute avg messages', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getStats().avgMessages).toBe(1);
    });

    it('should get max messages', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      cm.exchange(id);
      expect(cm.getStats().maxMessages).toBe(2);
    });

    it('should get min messages', () => {
      cm.create('a', 'b');
      expect(cm.getStats().minMessages).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get connection', () => {
      cm.create('a', 'b');
      expect(cm.getConnection('cm-1')?.from).toBe('a');
    });

    it('should get all', () => {
      cm.create('a', 'b');
      expect(cm.getAllConnections()).toHaveLength(1);
    });

    it('should remove', () => {
      cm.create('a', 'b');
      expect(cm.removeConnection('cm-1')).toBe(true);
    });

    it('should check existence', () => {
      cm.create('a', 'b');
      expect(cm.hasConnection('cm-1')).toBe(true);
    });

    it('should count', () => {
      expect(cm.getCount()).toBe(0);
      cm.create('a', 'b');
      expect(cm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get from', () => {
      cm.create('a', 'b');
      expect(cm.getFrom('cm-1')).toBe('a');
    });

    it('should get to', () => {
      cm.create('a', 'b');
      expect(cm.getTo('cm-1')).toBe('b');
    });

    it('should get messages', () => {
      cm.create('a', 'b');
      expect(cm.getMessages('cm-1')).toBe(0);
    });

    it('should get history', () => {
      cm.create('a', 'b');
      expect(cm.getHistory('cm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cm.create('a', 'b');
      expect(cm.setActive('cm-1', false)).toBe(true);
    });

    it('should set from', () => {
      cm.create('a', 'b');
      expect(cm.setFrom('cm-1', 'x')).toBe(true);
    });

    it('should set to', () => {
      cm.create('a', 'b');
      expect(cm.setTo('cm-1', 'y')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cm.setActive('unknown', false)).toBe(false);
      expect(cm.setFrom('unknown', 'x')).toBe(false);
      expect(cm.setTo('unknown', 'y')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      cm.setActive(id, false);
      cm.resetAll();
      expect(cm.getMessages(id)).toBe(0);
      expect(cm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by from / to / state
  // ============================================================
  describe('by from / to / state', () => {
    it('should get by from', () => {
      cm.create('a', 'b');
      expect(cm.getByFrom('a')).toHaveLength(1);
    });

    it('should get by to', () => {
      cm.create('a', 'b');
      expect(cm.getByTo('b')).toHaveLength(1);
    });

    it('should get open', () => {
      cm.create('a', 'b');
      expect(cm.getOpenConnections()).toHaveLength(1);
    });

    it('should get closed', () => {
      const id = cm.create('a', 'b');
      cm.close(id);
      expect(cm.getClosedConnections()).toHaveLength(1);
    });

    it('should get active', () => {
      cm.create('a', 'b');
      expect(cm.getActiveConnections()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cm.create('a', 'b');
      cm.setActive('cm-1', false);
      expect(cm.getInactiveConnections()).toHaveLength(1);
    });

    it('should get by min messages', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getByMinMessages(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most messages', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      cm.exchange(id);
      expect(cm.getMostMessages()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(cm.getMostMessages()).toBeNull();
    });

    it('should get newest', () => {
      cm.create('a', 'b');
      expect(cm.getNewest()?.id).toBe('cm-1');
    });

    it('should return null for empty newest', () => {
      expect(cm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cm.create('a', 'b');
      expect(cm.getOldest()?.id).toBe('cm-1');
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
      cm.create('a', 'b');
      expect(cm.getCreatedAt('cm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total messages', () => {
      const id = cm.create('a', 'b');
      cm.exchange(id);
      expect(cm.getTotalMessages()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many connections', () => {
      for (let i = 0; i < 50; i++) {
        cm.create(`a${i}`, `b${i}`);
      }
      expect(cm.getCount()).toBe(50);
    });
  });
});