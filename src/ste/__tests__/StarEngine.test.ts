/**
 * StarEngine Tests
 * chatdev-design Star Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StarEngine } from '../StarEngine';

describe('StarEngine', () => {
  let ste: StarEngine;

  beforeEach(() => {
    ste = new StarEngine();
  });

  afterEach(() => {
    ste.clearAll();
  });

  // ============================================================
  // star / unstar / restar / remove
  // ============================================================
  describe('star / unstar / restar / remove', () => {
    it('should star', () => {
      expect(ste.star('item1', 'alice')).toBe('ste-1');
    });

    it('should mark as active', () => {
      const id = ste.star('item1', 'alice');
      expect(ste.isActive(id)).toBe(true);
    });

    it('should mark as starred', () => {
      const id = ste.star('item1', 'alice');
      expect(ste.isStarred(id)).toBe(true);
    });

    it('should unstar', () => {
      const id = ste.star('item1', 'alice');
      expect(ste.unstar(id)).toBe(true);
    });

    it('should mark as unstarred on unstar', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      expect(ste.isUnstarred(id)).toBe(true);
    });

    it('should not unstar already unstarred', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      expect(ste.unstar(id)).toBe(false);
    });

    it('should return false for unknown unstar', () => {
      expect(ste.unstar('unknown')).toBe(false);
    });

    it('should restar', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      expect(ste.restar(id)).toBe(true);
    });

    it('should not restar already starred', () => {
      const id = ste.star('item1', 'alice');
      expect(ste.restar(id)).toBe(false);
    });

    it('should return false for unknown restar', () => {
      expect(ste.restar('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ste.star('item1', 'alice');
      expect(ste.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ste.star('item1', 'alice');
      const stats = ste.getStats();
      expect(stats.stars).toBe(1);
    });

    it('should count starred', () => {
      ste.star('item1', 'alice');
      expect(ste.getStats().starred).toBe(1);
    });

    it('should count unstarred', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      expect(ste.getStats().unstarred).toBe(1);
    });

    it('should count total stars', () => {
      ste.star('item1', 'alice');
      expect(ste.getStats().totalStars).toBe(1);
    });

    it('should count active', () => {
      ste.star('item1', 'alice');
      expect(ste.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ste.star('item1', 'alice');
      ste.setActive(id, false);
      expect(ste.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      expect(ste.getStats().totalHits).toBe(1);
    });

    it('should count unique users', () => {
      ste.star('item1', 'alice');
      ste.star('item2', 'alice');
      expect(ste.getStats().uniqueUsers).toBe(1);
    });

    it('should count unique items', () => {
      ste.star('item1', 'alice');
      ste.star('item1', 'bob');
      expect(ste.getStats().uniqueItems).toBe(1);
    });

    it('should compute avg stars per item', () => {
      ste.star('item1', 'alice');
      ste.star('item1', 'bob');
      expect(ste.getStats().avgStarsPerItem).toBe(2);
    });

    it('should get max stars per item', () => {
      ste.star('item1', 'alice');
      ste.star('item1', 'bob');
      expect(ste.getStats().maxStarsPerItem).toBe(2);
    });

    it('should get min stars per item', () => {
      ste.star('item1', 'alice');
      expect(ste.getStats().minStarsPerItem).toBe(1);
    });

    it('should compute star rate', () => {
      ste.star('item1', 'alice');
      expect(ste.getStats().starRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get star', () => {
      ste.star('item1', 'alice');
      expect(ste.getStar('ste-1')?.user).toBe('alice');
    });

    it('should get all', () => {
      ste.star('item1', 'alice');
      expect(ste.getAllStars()).toHaveLength(1);
    });

    it('should check existence', () => {
      ste.star('item1', 'alice');
      expect(ste.hasStar('ste-1')).toBe(true);
    });

    it('should count', () => {
      expect(ste.getCount()).toBe(0);
      ste.star('item1', 'alice');
      expect(ste.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get item id', () => {
      ste.star('item1', 'alice');
      expect(ste.getItemId('ste-1')).toBe('item1');
    });

    it('should get user', () => {
      ste.star('item1', 'alice');
      expect(ste.getUser('ste-1')).toBe('alice');
    });

    it('should get history', () => {
      ste.star('item1', 'alice');
      expect(ste.getHistory('ste-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      expect(ste.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ste.star('item1', 'alice');
      expect(ste.setActive('ste-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ste.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      ste.setActive(id, false);
      ste.resetAll();
      expect(ste.isStarred(id)).toBe(true);
      expect(ste.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by item / user / state
  // ============================================================
  describe('by item / user / state', () => {
    it('should get by item', () => {
      ste.star('item1', 'alice');
      expect(ste.getByItem('item1')).toHaveLength(1);
    });

    it('should get by user', () => {
      ste.star('item1', 'alice');
      expect(ste.getByUser('alice')).toHaveLength(1);
    });

    it('should get starred', () => {
      ste.star('item1', 'alice');
      expect(ste.getStarredStars()).toHaveLength(1);
    });

    it('should get unstarred', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      expect(ste.getUnstarredStars()).toHaveLength(1);
    });

    it('should get active', () => {
      ste.star('item1', 'alice');
      expect(ste.getActiveStars()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ste.star('item1', 'alice');
      ste.setActive('ste-1', false);
      expect(ste.getInactiveStars()).toHaveLength(1);
    });

    it('should get all users', () => {
      ste.star('item1', 'alice');
      ste.star('item2', 'bob');
      expect(ste.getAllUsers()).toHaveLength(2);
    });

    it('should get user count', () => {
      ste.star('item1', 'alice');
      expect(ste.getUserCount()).toBe(1);
    });

    it('should get all items', () => {
      ste.star('item1', 'alice');
      ste.star('item2', 'alice');
      expect(ste.getAllItems()).toHaveLength(2);
    });

    it('should get item count', () => {
      ste.star('item1', 'alice');
      expect(ste.getItemCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      ste.star('item1', 'alice');
      expect(ste.getNewest()?.id).toBe('ste-1');
    });

    it('should return null for empty newest', () => {
      expect(ste.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ste.star('item1', 'alice');
      expect(ste.getOldest()?.id).toBe('ste-1');
    });

    it('should return null for empty oldest', () => {
      expect(ste.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ste.star('item1', 'alice');
      expect(ste.getCreatedAt('ste-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ste.star('item1', 'alice');
      ste.unstar(id);
      expect(ste.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total stars', () => {
      ste.star('item1', 'alice');
      expect(ste.getTotalStars()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many stars', () => {
      for (let i = 0; i < 50; i++) {
        ste.star(`item${i}`, `user${i}`);
      }
      expect(ste.getCount()).toBe(50);
    });
  });
});