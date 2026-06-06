/**
 * StreamManager Tests
 * nanobot-design Stream Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StreamManager } from '../StreamManager';

describe('StreamManager', () => {
  let stm: StreamManager;

  beforeEach(() => {
    stm = new StreamManager();
  });

  afterEach(() => {
    stm.clearAll();
  });

  // ============================================================
  // create / push / subscribe / unsubscribe / reset / clearChunks
  // ============================================================
  describe('create / push / subscribe / unsubscribe / reset / clearChunks', () => {
    it('should create', () => {
      expect(stm.create('s1')).toBe('stm-1');
    });

    it('should mark as active', () => {
      const id = stm.create('s1');
      expect(stm.isActive(id)).toBe(true);
    });

    it('should mark as empty', () => {
      const id = stm.create('s1');
      expect(stm.isEmpty(id)).toBe(true);
    });

    it('should push', () => {
      const id = stm.create('s1');
      expect(stm.push(id, 'hello')).toBe(true);
    });

    it('should append chunk on push', () => {
      const id = stm.create('s1');
      stm.push(id, 'hello');
      expect(stm.getChunks(id)).toEqual(['hello']);
    });

    it('should not push inactive', () => {
      const id = stm.create('s1');
      stm.setActive(id, false);
      expect(stm.push(id, 'hello')).toBe(false);
    });

    it('should return false for unknown push', () => {
      expect(stm.push('unknown', 'data')).toBe(false);
    });

    it('should subscribe', () => {
      const id = stm.create('s1');
      expect(stm.subscribe(id)).toBe(true);
    });

    it('should increment subscribers on subscribe', () => {
      const id = stm.create('s1');
      stm.subscribe(id);
      expect(stm.getSubscribers(id)).toBe(1);
    });

    it('should not subscribe inactive', () => {
      const id = stm.create('s1');
      stm.setActive(id, false);
      expect(stm.subscribe(id)).toBe(false);
    });

    it('should return false for unknown subscribe', () => {
      expect(stm.subscribe('unknown')).toBe(false);
    });

    it('should unsubscribe', () => {
      const id = stm.create('s1');
      stm.subscribe(id);
      expect(stm.unsubscribe(id)).toBe(true);
    });

    it('should decrement subscribers on unsubscribe', () => {
      const id = stm.create('s1');
      stm.subscribe(id);
      stm.unsubscribe(id);
      expect(stm.getSubscribers(id)).toBe(0);
    });

    it('should not unsubscribe to negative', () => {
      const id = stm.create('s1');
      expect(stm.unsubscribe(id)).toBe(false);
    });

    it('should return false for unknown unsubscribe', () => {
      expect(stm.unsubscribe('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = stm.create('s1');
      stm.push(id, 'hello');
      expect(stm.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = stm.create('s1');
      stm.push(id, 'hello');
      stm.reset(id);
      expect(stm.getChunkCount(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(stm.reset('unknown')).toBe(false);
    });

    it('should clear chunks', () => {
      const id = stm.create('s1');
      stm.push(id, 'hello');
      expect(stm.clearChunks(id)).toBe(true);
    });

    it('should mark as zero on clear chunks', () => {
      const id = stm.create('s1');
      stm.push(id, 'hello');
      stm.clearChunks(id);
      expect(stm.getChunkCount(id)).toBe(0);
    });

    it('should return false for unknown clearChunks', () => {
      expect(stm.clearChunks('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      stm.create('s1');
      const stats = stm.getStats();
      expect(stats.streams).toBe(1);
    });

    it('should count total chunks', () => {
      const id = stm.create('s1');
      stm.push(id, 'hello');
      expect(stm.getStats().totalChunks).toBe(1);
    });

    it('should count total subscribers', () => {
      const id = stm.create('s1');
      stm.subscribe(id);
      expect(stm.getStats().totalSubscribers).toBe(1);
    });

    it('should count active', () => {
      stm.create('s1');
      expect(stm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = stm.create('s1');
      stm.setActive(id, false);
      expect(stm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = stm.create('s1');
      stm.push(id, 'hello');
      expect(stm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      stm.create('s1');
      stm.create('s2');
      expect(stm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg chunks', () => {
      const id = stm.create('s1');
      stm.push(id, 'hello');
      expect(stm.getStats().avgChunks).toBe(1);
    });

    it('should get max chunks', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      stm.push(id, 'b');
      expect(stm.getStats().maxChunks).toBe(2);
    });

    it('should get min chunks', () => {
      stm.create('s1');
      expect(stm.getStats().minChunks).toBe(0);
    });

    it('should compute avg subscribers', () => {
      const id = stm.create('s1');
      stm.subscribe(id);
      expect(stm.getStats().avgSubscribers).toBe(1);
    });

    it('should count total pushes', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      expect(stm.getStats().totalPushes).toBe(1);
    });

    it('should compute avg pushes', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      expect(stm.getStats().avgPushes).toBe(1);
    });

    it('should count empty streams', () => {
      stm.create('s1');
      expect(stm.getStats().emptyStreams).toBe(1);
    });

    it('should count popular streams', () => {
      const id = stm.create('s1');
      stm.subscribe(id);
      expect(stm.getStats().popularStreams).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get stream', () => {
      stm.create('s1');
      expect(stm.getStream('stm-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      stm.create('s1');
      expect(stm.getAllStreams()).toHaveLength(1);
    });

    it('should remove', () => {
      stm.create('s1');
      expect(stm.removeStream('stm-1')).toBe(true);
    });

    it('should check existence', () => {
      stm.create('s1');
      expect(stm.hasStream('stm-1')).toBe(true);
    });

    it('should count', () => {
      expect(stm.getCount()).toBe(0);
      stm.create('s1');
      expect(stm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      stm.create('s1');
      expect(stm.getName('stm-1')).toBe('s1');
    });

    it('should get chunk count', () => {
      stm.create('s1');
      expect(stm.getChunkCount('stm-1')).toBe(0);
    });

    it('should get total pushes', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      expect(stm.getTotalPushes(id)).toBe(1);
    });

    it('should get history', () => {
      stm.create('s1');
      expect(stm.getHistory('stm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      expect(stm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      stm.create('s1');
      expect(stm.setActive('stm-1', false)).toBe(true);
    });

    it('should set name', () => {
      stm.create('s1');
      expect(stm.setName('stm-1', 's2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(stm.setActive('unknown', false)).toBe(false);
      expect(stm.setName('unknown', 's')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      stm.setActive(id, false);
      stm.resetAll();
      expect(stm.getChunkCount(id)).toBe(0);
      expect(stm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      stm.create('s1');
      expect(stm.getByName('s1')).toHaveLength(1);
    });

    it('should get active', () => {
      stm.create('s1');
      expect(stm.getActiveStreams()).toHaveLength(1);
    });

    it('should get inactive', () => {
      stm.create('s1');
      stm.setActive('stm-1', false);
      expect(stm.getInactiveStreams()).toHaveLength(1);
    });

    it('should get empty streams', () => {
      stm.create('s1');
      expect(stm.getEmptyStreams()).toHaveLength(1);
    });

    it('should get popular streams', () => {
      const id = stm.create('s1');
      stm.subscribe(id);
      expect(stm.getPopularStreams()).toHaveLength(1);
    });

    it('should get all names', () => {
      stm.create('s1');
      stm.create('s2');
      expect(stm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      stm.create('s1');
      expect(stm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      stm.create('s1');
      expect(stm.getNewest()?.id).toBe('stm-1');
    });

    it('should return null for empty newest', () => {
      expect(stm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      stm.create('s1');
      expect(stm.getOldest()?.id).toBe('stm-1');
    });

    it('should return null for empty oldest', () => {
      expect(stm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      stm.create('s1');
      expect(stm.getCreatedAt('stm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      expect(stm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total chunks', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      expect(stm.getTotalChunks()).toBe(1);
    });

    it('should get total subscribers', () => {
      const id = stm.create('s1');
      stm.subscribe(id);
      expect(stm.getTotalSubscribers()).toBe(1);
    });

    it('should get total stream pushes', () => {
      const id = stm.create('s1');
      stm.push(id, 'a');
      expect(stm.getTotalStreamPushes()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many streams', () => {
      for (let i = 0; i < 50; i++) {
        stm.create(`s${i}`);
      }
      expect(stm.getCount()).toBe(50);
    });
  });
});