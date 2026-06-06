/**
 * BridgeEngine Tests
 * chatdev-design Bridge Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BridgeEngine } from '../BridgeEngine';

describe('BridgeEngine', () => {
  let be: BridgeEngine;

  beforeEach(() => {
    be = new BridgeEngine();
  });

  afterEach(() => {
    be.clearAll();
  });

  // ============================================================
  // register / dispatch
  // ============================================================
  describe('register / dispatch', () => {
    it('should register', () => {
      expect(be.register('b1', 's1', 't1')).toBe('be2-1');
    });

    it('should mark as active', () => {
      const id = be.register('b1', 's1', 't1');
      expect(be.isActive(id)).toBe(true);
    });

    it('should dispatch', () => {
      const id = be.register('b1', 's1', 't1');
      expect(be.dispatch(id, 'hello')).toBe(true);
    });

    it('should increment messages on dispatch', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getMessages(id)).toBe(1);
    });

    it('should log message on dispatch', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getMessageLog(id)).toEqual(['hello']);
    });

    it('should not dispatch inactive', () => {
      const id = be.register('b1', 's1', 't1');
      be.setActive(id, false);
      expect(be.dispatch(id, 'hello')).toBe(false);
    });

    it('should return false for unknown dispatch', () => {
      expect(be.dispatch('unknown', 'hello')).toBe(false);
    });

    it('should clear messages', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.clearMessages(id)).toBe(true);
    });

    it('should reset messages on clear', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      be.clearMessages(id);
      expect(be.getMessages(id)).toBe(0);
    });

    it('should return false for unknown clearMessages', () => {
      expect(be.clearMessages('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      be.register('b1', 's1', 't1');
      const stats = be.getStats();
      expect(stats.bridges).toBe(1);
    });

    it('should count total messages', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getStats().totalMessages).toBe(1);
    });

    it('should count active', () => {
      be.register('b1', 's1', 't1');
      expect(be.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = be.register('b1', 's1', 't1');
      be.setActive(id, false);
      expect(be.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getStats().totalHits).toBe(1);
    });

    it('should compute avg messages', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getStats().avgMessages).toBe(1);
    });

    it('should count unique sources', () => {
      be.register('b1', 's1', 't1');
      be.register('b2', 's2', 't1');
      expect(be.getStats().uniqueSources).toBe(2);
    });

    it('should count unique targets', () => {
      be.register('b1', 's1', 't1');
      be.register('b1', 's2', 't2');
      expect(be.getStats().uniqueTargets).toBe(2);
    });

    it('should count unique names', () => {
      be.register('b1', 's1', 't1');
      be.register('b2', 's1', 't1');
      expect(be.getStats().uniqueNames).toBe(2);
    });

    it('should count unique pairs', () => {
      be.register('b1', 's1', 't1');
      be.register('b2', 's1', 't1');
      expect(be.getStats().uniquePairs).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get bridge', () => {
      be.register('b1', 's1', 't1');
      expect(be.getBridge('be2-1')?.name).toBe('b1');
    });

    it('should get all', () => {
      be.register('b1', 's1', 't1');
      expect(be.getAllBridges()).toHaveLength(1);
    });

    it('should remove', () => {
      be.register('b1', 's1', 't1');
      expect(be.removeBridge('be2-1')).toBe(true);
    });

    it('should check existence', () => {
      be.register('b1', 's1', 't1');
      expect(be.hasBridge('be2-1')).toBe(true);
    });

    it('should count', () => {
      expect(be.getCount()).toBe(0);
      be.register('b1', 's1', 't1');
      expect(be.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      be.register('b1', 's1', 't1');
      expect(be.getName('be2-1')).toBe('b1');
    });

    it('should get source', () => {
      be.register('b1', 's1', 't1');
      expect(be.getSource('be2-1')).toBe('s1');
    });

    it('should get target', () => {
      be.register('b1', 's1', 't1');
      expect(be.getTarget('be2-1')).toBe('t1');
    });

    it('should get messages', () => {
      be.register('b1', 's1', 't1');
      expect(be.getMessages('be2-1')).toBe(0);
    });

    it('should get message log', () => {
      be.register('b1', 's1', 't1');
      expect(be.getMessageLog('be2-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      be.register('b1', 's1', 't1');
      expect(be.setActive('be2-1', false)).toBe(true);
    });

    it('should set name', () => {
      be.register('b1', 's1', 't1');
      expect(be.setName('be2-1', 'b2')).toBe(true);
    });

    it('should set source', () => {
      be.register('b1', 's1', 't1');
      expect(be.setSource('be2-1', 's2')).toBe(true);
    });

    it('should set target', () => {
      be.register('b1', 's1', 't1');
      expect(be.setTarget('be2-1', 't2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(be.setActive('unknown', false)).toBe(false);
      expect(be.setName('unknown', 'b')).toBe(false);
      expect(be.setSource('unknown', 's')).toBe(false);
      expect(be.setTarget('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      be.setActive(id, false);
      be.resetAll();
      expect(be.getMessages(id)).toBe(0);
      expect(be.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      be.register('b1', 's1', 't1');
      expect(be.getByName('b1')).toHaveLength(1);
    });

    it('should get by source', () => {
      be.register('b1', 's1', 't1');
      be.register('b2', 's1', 't2');
      expect(be.getBySource('s1')).toHaveLength(2);
    });

    it('should get by target', () => {
      be.register('b1', 's1', 't1');
      be.register('b2', 's2', 't1');
      expect(be.getByTarget('t1')).toHaveLength(2);
    });

    it('should get active', () => {
      be.register('b1', 's1', 't1');
      expect(be.getActiveBridges()).toHaveLength(1);
    });

    it('should get inactive', () => {
      be.register('b1', 's1', 't1');
      be.setActive('be2-1', false);
      expect(be.getInactiveBridges()).toHaveLength(1);
    });

    it('should get all names', () => {
      be.register('b1', 's1', 't1');
      be.register('b2', 's1', 't1');
      expect(be.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      be.register('b1', 's1', 't1');
      expect(be.getNameCount()).toBe(1);
    });

    it('should get all sources', () => {
      be.register('b1', 's1', 't1');
      be.register('b2', 's2', 't1');
      expect(be.getAllSources()).toHaveLength(2);
    });

    it('should get source count', () => {
      be.register('b1', 's1', 't1');
      expect(be.getSourceCount()).toBe(1);
    });

    it('should get all targets', () => {
      be.register('b1', 's1', 't1');
      be.register('b2', 's1', 't2');
      expect(be.getAllTargets()).toHaveLength(2);
    });

    it('should get target count', () => {
      be.register('b1', 's1', 't1');
      expect(be.getTargetCount()).toBe(1);
    });

    it('should get by min messages', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getByMinMessages(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most messages', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      be.dispatch(id, 'world');
      expect(be.getMostMessages()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(be.getMostMessages()).toBeNull();
    });

    it('should get newest', () => {
      be.register('b1', 's1', 't1');
      expect(be.getNewest()?.id).toBe('be2-1');
    });

    it('should return null for empty newest', () => {
      expect(be.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      be.register('b1', 's1', 't1');
      expect(be.getOldest()?.id).toBe('be2-1');
    });

    it('should return null for empty oldest', () => {
      expect(be.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      be.register('b1', 's1', 't1');
      expect(be.getCreatedAt('be2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total messages', () => {
      const id = be.register('b1', 's1', 't1');
      be.dispatch(id, 'hello');
      expect(be.getTotalMessages()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many bridges', () => {
      for (let i = 0; i < 50; i++) {
        be.register(`b${i}`, 's1', 't1');
      }
      expect(be.getCount()).toBe(50);
    });
  });
});