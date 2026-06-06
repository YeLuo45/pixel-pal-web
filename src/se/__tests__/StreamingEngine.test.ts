/**
 * StreamingEngine Tests
 * thunderbolt-design Streaming Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StreamingEngine } from '../StreamingEngine';

describe('StreamingEngine', () => {
  let se: StreamingEngine;

  beforeEach(() => {
    se = new StreamingEngine();
  });

  afterEach(() => {
    se.clearAll();
  });

  // ============================================================
  // create / push / subscribe
  // ============================================================
  describe('create / push / subscribe', () => {
    it('should create', () => {
      expect(se.create('s1')).toBe('se-1');
    });

    it('should mark as active', () => {
      const id = se.create('s1');
      expect(se.isActive(id)).toBe(true);
    });

    it('should push', () => {
      const id = se.create('s1');
      expect(se.push(id, 'data1')).toBe(true);
    });

    it('should increment chunks on push', () => {
      const id = se.create('s1');
      se.push(id, 'data1');
      expect(se.getChunkCount(id)).toBe(1);
    });

    it('should increment totalPushed on push', () => {
      const id = se.create('s1');
      se.push(id, 'data1');
      expect(se.getTotalPushed(id)).toBe(1);
    });

    it('should not push inactive', () => {
      const id = se.create('s1');
      se.setActive(id, false);
      expect(se.push(id, 'data1')).toBe(false);
    });

    it('should return false for unknown push', () => {
      expect(se.push('unknown', 'data1')).toBe(false);
    });

    it('should subscribe', () => {
      const id = se.create('s1');
      expect(se.subscribe(id, 'handler1')).toBe(true);
    });

    it('should increment subscriber count', () => {
      const id = se.create('s1');
      se.subscribe(id, 'handler1');
      expect(se.getSubscriberCount(id)).toBe(1);
    });

    it('should not subscribe duplicate', () => {
      const id = se.create('s1');
      se.subscribe(id, 'handler1');
      se.subscribe(id, 'handler1');
      expect(se.getSubscriberCount(id)).toBe(1);
    });

    it('should not subscribe inactive', () => {
      const id = se.create('s1');
      se.setActive(id, false);
      expect(se.subscribe(id, 'handler1')).toBe(false);
    });

    it('should return false for unknown subscribe', () => {
      expect(se.subscribe('unknown', 'h1')).toBe(false);
    });

    it('should unsubscribe', () => {
      const id = se.create('s1');
      se.subscribe(id, 'handler1');
      expect(se.unsubscribe(id, 'handler1')).toBe(true);
    });

    it('should remove subscriber', () => {
      const id = se.create('s1');
      se.subscribe(id, 'handler1');
      se.unsubscribe(id, 'handler1');
      expect(se.getSubscriberCount(id)).toBe(0);
    });

    it('should return false for unknown unsubscribe', () => {
      expect(se.unsubscribe('unknown', 'h1')).toBe(false);
    });

    it('should notify subscribers on push', () => {
      const id = se.create('s1');
      se.subscribe(id, 'handler1');
      se.subscribe(id, 'handler2');
      se.push(id, 'data1');
      expect(se.getTotalReceived(id)).toBe(2);
    });

    it('should check isSubscribed', () => {
      const id = se.create('s1');
      se.subscribe(id, 'handler1');
      expect(se.isSubscribed(id, 'handler1')).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      se.create('s1');
      const stats = se.getStats();
      expect(stats.streams).toBe(1);
    });

    it('should count total chunks', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      se.push(id, 'd2');
      expect(se.getStats().totalChunks).toBe(2);
    });

    it('should count total pushed', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      expect(se.getStats().totalPushed).toBe(1);
    });

    it('should count total received', () => {
      const id = se.create('s1');
      se.subscribe(id, 'h1');
      se.push(id, 'd1');
      expect(se.getStats().totalReceived).toBe(1);
    });

    it('should count total subscribers', () => {
      const id = se.create('s1');
      se.subscribe(id, 'h1');
      se.subscribe(id, 'h2');
      expect(se.getStats().totalSubscribers).toBe(2);
    });

    it('should count active', () => {
      se.create('s1');
      expect(se.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = se.create('s1');
      se.setActive(id, false);
      expect(se.getStats().inactive).toBe(1);
    });

    it('should compute avg chunks', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      expect(se.getStats().avgChunks).toBe(1);
    });

    it('should compute avg subscribers', () => {
      const id = se.create('s1');
      se.subscribe(id, 'h1');
      expect(se.getStats().avgSubscribers).toBe(1);
    });

    it('should compute avg pushed', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      expect(se.getStats().avgPushed).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get stream', () => {
      se.create('s1');
      expect(se.getStream('se-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      se.create('s1');
      expect(se.getAllStreams()).toHaveLength(1);
    });

    it('should remove', () => {
      se.create('s1');
      expect(se.removeStream('se-1')).toBe(true);
    });

    it('should check existence', () => {
      se.create('s1');
      expect(se.hasStream('se-1')).toBe(true);
    });

    it('should count', () => {
      expect(se.getCount()).toBe(0);
      se.create('s1');
      expect(se.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      se.create('s1');
      expect(se.getName('se-1')).toBe('s1');
    });

    it('should get chunks', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      expect(se.getChunks(id)).toEqual(['d1']);
    });

    it('should get chunk count', () => {
      se.create('s1');
      expect(se.getChunkCount('se-1')).toBe(0);
    });

    it('should get subscribers', () => {
      const id = se.create('s1');
      se.subscribe(id, 'h1');
      expect(se.getSubscribers(id)).toEqual(['h1']);
    });

    it('should get subscriber count', () => {
      se.create('s1');
      expect(se.getSubscriberCount('se-1')).toBe(0);
    });

    it('should get total pushed', () => {
      se.create('s1');
      expect(se.getTotalPushed('se-1')).toBe(0);
    });

    it('should get total received', () => {
      se.create('s1');
      expect(se.getTotalReceived('se-1')).toBe(0);
    });

    it('should get history', () => {
      se.create('s1');
      expect(se.getHistory('se-1').length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      se.create('s1');
      expect(se.setActive('se-1', false)).toBe(true);
    });

    it('should set name', () => {
      se.create('s1');
      expect(se.setName('se-1', 's2')).toBe(true);
    });

    it('should clear chunks', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      expect(se.clearChunks(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(se.setActive('unknown', false)).toBe(false);
      expect(se.setName('unknown', 's')).toBe(false);
      expect(se.clearChunks('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      se.setActive(id, false);
      se.resetAll();
      expect(se.getChunkCount(id)).toBe(0);
      expect(se.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      se.create('s1');
      expect(se.getByName('s1')).toHaveLength(1);
    });

    it('should get active', () => {
      se.create('s1');
      expect(se.getActiveStreams()).toHaveLength(1);
    });

    it('should get inactive', () => {
      se.create('s1');
      se.setActive('se-1', false);
      expect(se.getInactiveStreams()).toHaveLength(1);
    });

    it('should get all names', () => {
      se.create('s1');
      se.create('s2');
      expect(se.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      se.create('s1');
      expect(se.getNameCount()).toBe(1);
    });

    it('should get all handlers', () => {
      const id = se.create('s1');
      se.subscribe(id, 'h1');
      se.subscribe(id, 'h2');
      expect(se.getAllHandlers()).toHaveLength(2);
    });

    it('should get handler count', () => {
      const id = se.create('s1');
      se.subscribe(id, 'h1');
      expect(se.getHandlerCount()).toBe(1);
    });

    it('should get by min chunks', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      expect(se.getByMinChunks(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most chunks', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      se.push(id, 'd2');
      expect(se.getMostChunks()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(se.getMostChunks()).toBeNull();
    });

    it('should get most subscribers', () => {
      const id = se.create('s1');
      se.subscribe(id, 'h1');
      se.subscribe(id, 'h2');
      expect(se.getMostSubscribers()?.id).toBe(id);
    });

    it('should return null for empty most subs', () => {
      expect(se.getMostSubscribers()).toBeNull();
    });

    it('should get most pushed', () => {
      const id = se.create('s1');
      se.push(id, 'd1');
      se.push(id, 'd2');
      expect(se.getMostPushed()?.id).toBe(id);
    });

    it('should return null for empty most pushed', () => {
      expect(se.getMostPushed()).toBeNull();
    });

    it('should get newest', () => {
      se.create('s1');
      expect(se.getNewest()?.id).toBe('se-1');
    });

    it('should return null for empty newest', () => {
      expect(se.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      se.create('s1');
      expect(se.getOldest()?.id).toBe('se-1');
    });

    it('should return null for empty oldest', () => {
      expect(se.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      se.create('s1');
      expect(se.getCreatedAt('se-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      se.create('s1');
      se.push('se-1', 'd1');
      expect(se.getUpdatedAt('se-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many streams', () => {
      for (let i = 0; i < 50; i++) {
        se.create(`s${i}`);
      }
      expect(se.getCount()).toBe(50);
    });
  });
});