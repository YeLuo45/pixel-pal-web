/**
 * HeartbeatEngine Tests
 * nanobot-design Heartbeat Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HeartbeatEngine } from '../HeartbeatEngine';

describe('HeartbeatEngine', () => {
  let hbe: HeartbeatEngine;

  beforeEach(() => {
    hbe = new HeartbeatEngine();
  });

  afterEach(() => {
    hbe.clearAll();
  });

  // ============================================================
  // start / beat / stop / expire / remove
  // ============================================================
  describe('start / beat / stop / expire / remove', () => {
    it('should start', () => {
      expect(hbe.start('h1', 1000)).toBe('hbe-1');
    });

    it('should default interval to 1000', () => {
      const id = hbe.start('h1');
      expect(hbe.getInterval(id)).toBe(1000);
    });

    it('should default state to running', () => {
      const id = hbe.start('h1', 1000);
      expect(hbe.getState(id)).toBe('running');
    });

    it('should mark as active', () => {
      const id = hbe.start('h1', 1000);
      expect(hbe.isActive(id)).toBe(true);
    });

    it('should beat', () => {
      const id = hbe.start('h1', 1000);
      expect(hbe.beat(id)).toBe(true);
    });

    it('should increment beats on beat', () => {
      const id = hbe.start('h1', 1000);
      hbe.beat(id);
      expect(hbe.getBeats(id)).toBe(1);
    });

    it('should not beat inactive', () => {
      const id = hbe.start('h1', 1000);
      hbe.setActive(id, false);
      expect(hbe.beat(id)).toBe(false);
    });

    it('should return false for unknown beat', () => {
      expect(hbe.beat('unknown')).toBe(false);
    });

    it('should stop', () => {
      const id = hbe.start('h1', 1000);
      expect(hbe.stop(id)).toBe(true);
    });

    it('should return false for unknown stop', () => {
      expect(hbe.stop('unknown')).toBe(false);
    });

    it('should expire', () => {
      const id = hbe.start('h1', 1000);
      expect(hbe.expire(id)).toBe(true);
    });

    it('should return false for unknown expire', () => {
      expect(hbe.expire('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = hbe.start('h1', 1000);
      expect(hbe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      hbe.start('h1', 1000);
      const stats = hbe.getStats();
      expect(stats.heartbeats).toBe(1);
    });

    it('should count total beats', () => {
      const id = hbe.start('h1', 1000);
      hbe.beat(id);
      expect(hbe.getStats().totalBeats).toBe(1);
    });

    it('should count total starts', () => {
      hbe.start('h1', 1000);
      expect(hbe.getStats().totalStarts).toBe(1);
    });

    it('should count total stops', () => {
      const id = hbe.start('h1', 1000);
      hbe.stop(id);
      expect(hbe.getStats().totalStops).toBe(1);
    });

    it('should count stopped', () => {
      const id = hbe.start('h1', 1000);
      hbe.stop(id);
      expect(hbe.getStats().stopped).toBe(1);
    });

    it('should count running', () => {
      hbe.start('h1', 1000);
      expect(hbe.getStats().running).toBe(1);
    });

    it('should count expired', () => {
      const id = hbe.start('h1', 1000);
      hbe.expire(id);
      expect(hbe.getStats().expired).toBe(1);
    });

    it('should count active', () => {
      hbe.start('h1', 1000);
      expect(hbe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = hbe.start('h1', 1000);
      hbe.setActive(id, false);
      expect(hbe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = hbe.start('h1', 1000);
      hbe.beat(id);
      expect(hbe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      hbe.start('a', 1000);
      hbe.start('b', 1000);
      expect(hbe.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg interval', () => {
      hbe.start('a', 1000);
      hbe.start('b', 2000);
      expect(hbe.getStats().avgInterval).toBe(1500);
    });

    it('should get max interval', () => {
      hbe.start('a', 1000);
      hbe.start('b', 2000);
      expect(hbe.getStats().maxInterval).toBe(2000);
    });

    it('should get min interval', () => {
      hbe.start('a', 1000);
      hbe.start('b', 2000);
      expect(hbe.getStats().minInterval).toBe(1000);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get heartbeat', () => {
      hbe.start('h1', 1000);
      expect(hbe.getHeartbeat('hbe-1')?.name).toBe('h1');
    });

    it('should get all', () => {
      hbe.start('h1', 1000);
      expect(hbe.getAllHeartbeats()).toHaveLength(1);
    });

    it('should check existence', () => {
      hbe.start('h1', 1000);
      expect(hbe.hasHeartbeat('hbe-1')).toBe(true);
    });

    it('should count', () => {
      expect(hbe.getCount()).toBe(0);
      hbe.start('h1', 1000);
      expect(hbe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      hbe.start('h1', 1000);
      expect(hbe.getName('hbe-1')).toBe('h1');
    });

    it('should get last beat', () => {
      hbe.start('h1', 1000);
      expect(hbe.getLastBeat('hbe-1')).toBeGreaterThan(0);
    });

    it('should get hits', () => {
      const id = hbe.start('h1', 1000);
      hbe.beat(id);
      expect(hbe.getHits(id)).toBe(1);
    });

    it('should check running', () => {
      hbe.start('h1', 1000);
      expect(hbe.isRunning('hbe-1')).toBe(true);
    });

    it('should check stopped', () => {
      const id = hbe.start('h1', 1000);
      hbe.stop(id);
      expect(hbe.isStopped(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      hbe.start('h1', 1000);
      expect(hbe.setActive('hbe-1', false)).toBe(true);
    });

    it('should set interval', () => {
      hbe.start('h1', 1000);
      expect(hbe.setInterval('hbe-1', 2000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(hbe.setActive('unknown', false)).toBe(false);
      expect(hbe.setInterval('unknown', 1000)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = hbe.start('h1', 1000);
      hbe.beat(id);
      hbe.setActive(id, false);
      hbe.resetAll();
      expect(hbe.getBeats(id)).toBe(0);
      expect(hbe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get by state', () => {
      hbe.start('h1', 1000);
      expect(hbe.getByState('running')).toHaveLength(1);
    });

    it('should get active', () => {
      hbe.start('h1', 1000);
      expect(hbe.getActiveHeartbeats()).toHaveLength(1);
    });

    it('should get inactive', () => {
      hbe.start('h1', 1000);
      hbe.setActive('hbe-1', false);
      expect(hbe.getInactiveHeartbeats()).toHaveLength(1);
    });

    it('should get all names', () => {
      hbe.start('a', 1000);
      hbe.start('b', 1000);
      expect(hbe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      hbe.start('a', 1000);
      expect(hbe.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      hbe.start('h1', 1000);
      expect(hbe.getNewest()?.id).toBe('hbe-1');
    });

    it('should return null for empty newest', () => {
      expect(hbe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      hbe.start('h1', 1000);
      expect(hbe.getOldest()?.id).toBe('hbe-1');
    });

    it('should return null for empty oldest', () => {
      expect(hbe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      hbe.start('h1', 1000);
      expect(hbe.getCreatedAt('hbe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = hbe.start('h1', 1000);
      hbe.beat(id);
      expect(hbe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total beats', () => {
      const id = hbe.start('h1', 1000);
      hbe.beat(id);
      expect(hbe.getTotalBeats()).toBe(1);
    });

    it('should get total starts', () => {
      hbe.start('h1', 1000);
      expect(hbe.getTotalStarts()).toBe(1);
    });

    it('should get total stops', () => {
      const id = hbe.start('h1', 1000);
      hbe.stop(id);
      expect(hbe.getTotalStops()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many heartbeats', () => {
      for (let i = 0; i < 50; i++) {
        hbe.start(`h${i}`, 1000);
      }
      expect(hbe.getCount()).toBe(50);
    });
  });
});