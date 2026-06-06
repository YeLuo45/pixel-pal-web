/**
 * TagEngine Tests
 * chatdev-design Tag Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TagEngine } from '../TagEngine';

describe('TagEngine', () => {
  let tge: TagEngine;

  beforeEach(() => {
    tge = new TagEngine();
  });

  afterEach(() => {
    tge.clearAll();
  });

  // ============================================================
  // tag / untag / increment
  // ============================================================
  describe('tag / untag / increment', () => {
    it('should tag', () => {
      expect(tge.tag('item1', 'tag1')).toBe('tge-1');
    });

    it('should mark as active', () => {
      const id = tge.tag('item1', 'tag1');
      expect(tge.isActive(id)).toBe(true);
    });

    it('should default count to 1', () => {
      const id = tge.tag('item1', 'tag1');
      expect(tge.getCount_(id)).toBe(1);
    });

    it('should untag', () => {
      const id = tge.tag('item1', 'tag1');
      expect(tge.untag(id)).toBe(true);
    });

    it('should return false for unknown untag', () => {
      expect(tge.untag('unknown')).toBe(false);
    });

    it('should increment', () => {
      const id = tge.tag('item1', 'tag1');
      expect(tge.increment(id)).toBe(true);
    });

    it('should increment count', () => {
      const id = tge.tag('item1', 'tag1');
      tge.increment(id);
      expect(tge.getCount_(id)).toBe(2);
    });

    it('should not increment inactive', () => {
      const id = tge.tag('item1', 'tag1');
      tge.setActive(id, false);
      expect(tge.increment(id)).toBe(false);
    });

    it('should not increment unknown', () => {
      expect(tge.increment('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tge.tag('item1', 'tag1');
      const stats = tge.getStats();
      expect(stats.tags).toBe(1);
    });

    it('should count total tags', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getStats().totalTags).toBe(1);
    });

    it('should count active', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tge.tag('item1', 'tag1');
      tge.setActive(id, false);
      expect(tge.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tge.tag('item1', 'tag1');
      tge.increment(id);
      expect(tge.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      tge.tag('item1', 'tag1');
      tge.tag('item1', 'tag2');
      expect(tge.getStats().uniqueNames).toBe(2);
    });

    it('should count unique items', () => {
      tge.tag('item1', 'tag1');
      tge.tag('item2', 'tag1');
      expect(tge.getStats().uniqueItems).toBe(2);
    });

    it('should compute avg count', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getStats().avgCount).toBe(1);
    });

    it('should get max count', () => {
      const id = tge.tag('item1', 'tag1');
      tge.increment(id);
      tge.increment(id);
      expect(tge.getStats().maxCount).toBe(3);
    });

    it('should get min count', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getStats().minCount).toBe(1);
    });

    it('should compute avg name length', () => {
      tge.tag('item1', 'a');
      expect(tge.getStats().avgNameLength).toBe(1);
    });

    it('should get max name length', () => {
      tge.tag('item1', 'a');
      tge.tag('item1', 'hello');
      expect(tge.getStats().maxNameLength).toBe(5);
    });

    it('should get min name length', () => {
      tge.tag('item1', 'a');
      tge.tag('item1', 'hello');
      expect(tge.getStats().minNameLength).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get tag', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getTag('tge-1')?.name).toBe('tag1');
    });

    it('should get all', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getAllTags()).toHaveLength(1);
    });

    it('should check existence', () => {
      tge.tag('item1', 'tag1');
      expect(tge.hasTag('tge-1')).toBe(true);
    });

    it('should count', () => {
      expect(tge.getCount()).toBe(0);
      tge.tag('item1', 'tag1');
      expect(tge.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get item id', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getItemId('tge-1')).toBe('item1');
    });

    it('should get name', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getName('tge-1')).toBe('tag1');
    });

    it('should get name length', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getNameLength('tge-1')).toBe(4);
    });

    it('should get hits', () => {
      const id = tge.tag('item1', 'tag1');
      tge.increment(id);
      expect(tge.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      tge.tag('item1', 'tag1');
      expect(tge.setActive('tge-1', false)).toBe(true);
    });

    it('should set name', () => {
      tge.tag('item1', 'tag1');
      expect(tge.setName('tge-1', 'tag2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tge.setActive('unknown', false)).toBe(false);
      expect(tge.setName('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = tge.tag('item1', 'tag1');
      tge.increment(id);
      tge.setActive(id, false);
      tge.resetAll();
      expect(tge.getCount_(id)).toBe(1);
      expect(tge.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by item / name / state
  // ============================================================
  describe('by item / name / state', () => {
    it('should get by item', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getByItem('item1')).toHaveLength(1);
    });

    it('should get by name', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getByName('tag1')).toHaveLength(1);
    });

    it('should get active', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getActiveTags()).toHaveLength(1);
    });

    it('should get inactive', () => {
      tge.tag('item1', 'tag1');
      tge.setActive('tge-1', false);
      expect(tge.getInactiveTags()).toHaveLength(1);
    });

    it('should get all names', () => {
      tge.tag('item1', 'tag1');
      tge.tag('item1', 'tag2');
      expect(tge.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getNameCount()).toBe(1);
    });

    it('should get all items', () => {
      tge.tag('item1', 'tag1');
      tge.tag('item2', 'tag1');
      expect(tge.getAllItems()).toHaveLength(2);
    });

    it('should get item count', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getItemCount()).toBe(1);
    });

    it('should get by min count', () => {
      const id = tge.tag('item1', 'tag1');
      tge.increment(id);
      tge.increment(id);
      expect(tge.getByMinCount(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most counted', () => {
      const id = tge.tag('item1', 'tag1');
      tge.increment(id);
      tge.increment(id);
      expect(tge.getMostCounted()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(tge.getMostCounted()).toBeNull();
    });

    it('should get newest', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getNewest()?.id).toBe('tge-1');
    });

    it('should return null for empty newest', () => {
      expect(tge.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getOldest()?.id).toBe('tge-1');
    });

    it('should return null for empty oldest', () => {
      expect(tge.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getCreatedAt('tge-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tge.tag('item1', 'tag1');
      tge.increment(id);
      expect(tge.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total tags', () => {
      tge.tag('item1', 'tag1');
      expect(tge.getTotalTags()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tags', () => {
      for (let i = 0; i < 50; i++) {
        tge.tag(`item${i}`, `tag${i}`);
      }
      expect(tge.getCount()).toBe(50);
    });
  });
});