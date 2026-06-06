/**
 * MemoryEngine Tests
 * generic-agent-design Memory Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryEngine } from '../MemoryEngine';

describe('MemoryEngine', () => {
  let mre: MemoryEngine;

  beforeEach(() => {
    mre = new MemoryEngine();
  });

  afterEach(() => {
    mre.clearAll();
  });

  // ============================================================
  // store / recall / forget / reset
  // ============================================================
  describe('store / recall / forget / reset', () => {
    it('should store', () => {
      expect(mre.store('remember this', 5)).toBe('mre-1');
    });

    it('should mark as active', () => {
      const id = mre.store('remember this', 5);
      expect(mre.isActive(id)).toBe(true);
    });

    it('should default importance to 1', () => {
      const id = mre.store('remember this', 1);
      expect(mre.getImportance(id)).toBe(1);
    });

    it('should recall', () => {
      const id = mre.store('remember this', 5);
      const m = mre.recall(id);
      expect(m?.content).toBe('remember this');
    });

    it('should increment access count on recall', () => {
      const id = mre.store('remember this', 5);
      mre.recall(id);
      expect(mre.getAccessCount(id)).toBe(1);
    });

    it('should not recall inactive', () => {
      const id = mre.store('remember this', 5);
      mre.setActive(id, false);
      expect(mre.recall(id)).toBeNull();
    });

    it('should return null for unknown recall', () => {
      expect(mre.recall('unknown')).toBeNull();
    });

    it('should forget', () => {
      const id = mre.store('remember this', 5);
      expect(mre.forget(id)).toBe(true);
    });

    it('should remove from map on forget', () => {
      const id = mre.store('remember this', 5);
      mre.forget(id);
      expect(mre.hasMemory(id)).toBe(false);
    });

    it('should reset', () => {
      const id = mre.store('remember this', 5);
      mre.recall(id);
      expect(mre.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = mre.store('remember this', 5);
      mre.recall(id);
      mre.reset(id);
      expect(mre.getAccessCount(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(mre.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      mre.store('mem1', 5);
      const stats = mre.getStats();
      expect(stats.memories).toBe(1);
    });

    it('should count total access', () => {
      const id = mre.store('mem1', 5);
      mre.recall(id);
      expect(mre.getStats().totalAccess).toBe(1);
    });

    it('should compute avg importance', () => {
      mre.store('a', 1);
      mre.store('b', 2);
      expect(mre.getStats().avgImportance).toBe(1.5);
    });

    it('should get max importance', () => {
      mre.store('a', 1);
      mre.store('b', 5);
      expect(mre.getStats().maxImportance).toBe(5);
    });

    it('should get min importance', () => {
      mre.store('a', 1);
      mre.store('b', 5);
      expect(mre.getStats().minImportance).toBe(1);
    });

    it('should count active', () => {
      mre.store('a', 1);
      expect(mre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mre.store('a', 1);
      mre.setActive(id, false);
      expect(mre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = mre.store('a', 1);
      mre.recall(id);
      expect(mre.getStats().totalHits).toBe(1);
    });

    it('should count unique contents', () => {
      mre.store('a', 1);
      mre.store('a', 1);
      expect(mre.getStats().uniqueContents).toBe(1);
    });

    it('should compute avg content length', () => {
      mre.store('a', 1);
      expect(mre.getStats().avgContentLength).toBe(1);
    });

    it('should get max content length', () => {
      mre.store('a', 1);
      mre.store('hello', 1);
      expect(mre.getStats().maxContentLength).toBe(5);
    });

    it('should get min content length', () => {
      mre.store('a', 1);
      mre.store('hello', 1);
      expect(mre.getStats().minContentLength).toBe(1);
    });

    it('should compute avg access count', () => {
      const id = mre.store('a', 1);
      mre.recall(id);
      expect(mre.getStats().avgAccessCount).toBe(1);
    });

    it('should get max access count', () => {
      const id = mre.store('a', 1);
      mre.recall(id);
      mre.recall(id);
      expect(mre.getStats().maxAccessCount).toBe(2);
    });

    it('should get min access count', () => {
      mre.store('a', 1);
      expect(mre.getStats().minAccessCount).toBe(0);
    });

    it('should count total stores', () => {
      mre.store('a', 1);
      expect(mre.getStats().totalStores).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get memory', () => {
      mre.store('a', 1);
      expect(mre.getMemory('mre-1')?.content).toBe('a');
    });

    it('should get all', () => {
      mre.store('a', 1);
      expect(mre.getAllMemories()).toHaveLength(1);
    });

    it('should check existence', () => {
      mre.store('a', 1);
      expect(mre.hasMemory('mre-1')).toBe(true);
    });

    it('should count', () => {
      expect(mre.getCount()).toBe(0);
      mre.store('a', 1);
      expect(mre.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get content', () => {
      mre.store('a', 1);
      expect(mre.getContent('mre-1')).toBe('a');
    });

    it('should get content length', () => {
      mre.store('a', 1);
      expect(mre.getContentLength('mre-1')).toBe(1);
    });

    it('should get history', () => {
      mre.store('a', 1);
      expect(mre.getHistory('mre-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = mre.store('a', 1);
      mre.recall(id);
      expect(mre.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      mre.store('a', 1);
      expect(mre.setActive('mre-1', false)).toBe(true);
    });

    it('should set content', () => {
      mre.store('a', 1);
      expect(mre.setContent('mre-1', 'b')).toBe(true);
    });

    it('should set importance', () => {
      mre.store('a', 1);
      expect(mre.setImportance('mre-1', 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mre.setActive('unknown', false)).toBe(false);
      expect(mre.setContent('unknown', 'c')).toBe(false);
      expect(mre.setImportance('unknown', 1)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = mre.store('a', 1);
      mre.recall(id);
      mre.setActive(id, false);
      mre.resetAll();
      expect(mre.getAccessCount(id)).toBe(0);
      expect(mre.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by importance / state
  // ============================================================
  describe('by importance / state', () => {
    it('should get by importance', () => {
      mre.store('a', 1);
      mre.store('b', 10);
      expect(mre.getByImportance(5)).toHaveLength(1);
    });

    it('should get active', () => {
      mre.store('a', 1);
      expect(mre.getActiveMemories()).toHaveLength(1);
    });

    it('should get inactive', () => {
      mre.store('a', 1);
      mre.setActive('mre-1', false);
      expect(mre.getInactiveMemories()).toHaveLength(1);
    });

    it('should get all contents', () => {
      mre.store('a', 1);
      mre.store('b', 1);
      expect(mre.getAllContents()).toHaveLength(2);
    });

    it('should get content count', () => {
      mre.store('a', 1);
      expect(mre.getContentCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most accessed', () => {
      const id = mre.store('a', 1);
      mre.recall(id);
      mre.recall(id);
      expect(mre.getMostAccessed()?.id).toBe(id);
    });

    it('should return null for empty most accessed', () => {
      expect(mre.getMostAccessed()).toBeNull();
    });

    it('should get most important', () => {
      mre.store('a', 1);
      mre.store('b', 10);
      expect(mre.getMostImportant()?.id).toBe('mre-2');
    });

    it('should return null for empty most important', () => {
      expect(mre.getMostImportant()).toBeNull();
    });

    it('should get newest', () => {
      mre.store('a', 1);
      expect(mre.getNewest()?.id).toBe('mre-1');
    });

    it('should return null for empty newest', () => {
      expect(mre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mre.store('a', 1);
      expect(mre.getOldest()?.id).toBe('mre-1');
    });

    it('should return null for empty oldest', () => {
      expect(mre.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      mre.store('a', 1);
      expect(mre.getCreatedAt('mre-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mre.store('a', 1);
      mre.recall(id);
      expect(mre.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total access', () => {
      const id = mre.store('a', 1);
      mre.recall(id);
      expect(mre.getTotalAccess()).toBe(1);
    });

    it('should get total stores', () => {
      mre.store('a', 1);
      expect(mre.getTotalStores()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many memories', () => {
      for (let i = 0; i < 50; i++) {
        mre.store(`mem${i}`, i);
      }
      expect(mre.getCount()).toBe(50);
    });
  });
});