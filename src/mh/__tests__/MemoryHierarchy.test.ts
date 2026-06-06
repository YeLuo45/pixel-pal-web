/**
 * MemoryHierarchy Tests
 * generic-agent-design Memory Hierarchy
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryHierarchy } from '../MemoryHierarchy';

describe('MemoryHierarchy', () => {
  let mh: MemoryHierarchy;

  beforeEach(() => {
    mh = new MemoryHierarchy();
  });

  afterEach(() => {
    mh.clearAll();
  });

  // ============================================================
  // store / recall / promote
  // ============================================================
  describe('store / recall / promote', () => {
    it('should store in long', () => {
      expect(mh.store('long', 'k1', 'v1')).toBe(true);
    });

    it('should store in short', () => {
      expect(mh.store('short', 'k1', 'v1')).toBe(true);
    });

    it('should store in working', () => {
      expect(mh.store('working', 'k1', 'v1')).toBe(true);
    });

    it('should mark as active', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.isActive('k1')).toBe(true);
    });

    it('should recall', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.recall('k1')?.value).toBe('v1');
    });

    it('should return null for missing recall', () => {
      expect(mh.recall('unknown')).toBeNull();
    });

    it('should not recall inactive', () => {
      mh.store('long', 'k1', 'v1');
      mh.setActive('k1', false);
      expect(mh.recall('k1')).toBeNull();
    });

    it('should increment hits on recall', () => {
      mh.store('long', 'k1', 'v1');
      mh.recall('k1');
      expect(mh.getHits('k1')).toBe(1);
    });

    it('should promote from working to short', () => {
      mh.store('working', 'k1', 'v1');
      expect(mh.promote('k1', 'short')).toBe(true);
    });

    it('should promote from short to long', () => {
      mh.store('short', 'k1', 'v1');
      expect(mh.promote('k1', 'long')).toBe(true);
    });

    it('should update tier on promote', () => {
      mh.store('working', 'k1', 'v1');
      mh.promote('k1', 'long');
      expect(mh.getTier('k1')).toBe('long');
    });

    it('should not promote to same tier', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.promote('k1', 'long')).toBe(false);
    });

    it('should demote', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.promote('k1', 'working')).toBe(true);
    });

    it('should return false for unknown promote', () => {
      expect(mh.promote('unknown', 'long')).toBe(false);
    });

    it('should overwrite on store', () => {
      mh.store('long', 'k1', 'v1');
      mh.store('short', 'k1', 'v2');
      expect(mh.getValue('k1')).toBe('v2');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      mh.store('long', 'k1', 'v1');
      const stats = mh.getStats();
      expect(stats.total).toBe(1);
    });

    it('should count long', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getStats().long).toBe(1);
    });

    it('should count short', () => {
      mh.store('short', 'k1', 'v1');
      expect(mh.getStats().short).toBe(1);
    });

    it('should count working', () => {
      mh.store('working', 'k1', 'v1');
      expect(mh.getStats().working).toBe(1);
    });

    it('should count active', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      mh.store('long', 'k1', 'v1');
      mh.setActive('k1', false);
      expect(mh.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      mh.store('long', 'k1', 'v1');
      mh.recall('k1');
      expect(mh.getStats().totalHits).toBe(1);
    });

    it('should compute avg importance', () => {
      mh.store('long', 'k1', 'v1', 5);
      mh.store('long', 'k2', 'v2', 10);
      expect(mh.getStats().avgImportance).toBe(7.5);
    });

    it('should count promotions', () => {
      mh.store('working', 'k1', 'v1');
      mh.promote('k1', 'long');
      expect(mh.getStats().promotions).toBe(1);
    });

    it('should count demotions', () => {
      mh.store('long', 'k1', 'v1');
      mh.promote('k1', 'working');
      expect(mh.getStats().demotions).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get item', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getItem('k1')?.value).toBe('v1');
    });

    it('should get all', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getAllItems()).toHaveLength(1);
    });

    it('should get by tier', () => {
      mh.store('long', 'k1', 'v1');
      mh.store('short', 'k2', 'v2');
      expect(mh.getByTier('long')).toHaveLength(1);
    });

    it('should remove', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.removeItem('k1')).toBe(true);
    });

    it('should check existence', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.hasItem('k1')).toBe(true);
    });

    it('should count', () => {
      expect(mh.getCount()).toBe(0);
      mh.store('long', 'k1', 'v1');
      expect(mh.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get value', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getValue('k1')).toBe('v1');
    });

    it('should get tier', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getTier('k1')).toBe('long');
    });

    it('should get importance', () => {
      mh.store('long', 'k1', 'v1', 5);
      expect(mh.getImportance('k1')).toBe(5);
    });

    it('should get hits', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getHits('k1')).toBe(0);
    });

    it('should get history', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getHistory('k1')).toEqual(['long']);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.setActive('k1', false)).toBe(true);
    });

    it('should set value', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.setValue('k1', 'v2')).toBe(true);
    });

    it('should set importance', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.setImportance('k1', 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mh.setActive('unknown', false)).toBe(false);
      expect(mh.setValue('unknown', 'v')).toBe(false);
      expect(mh.setImportance('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.touch('k1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mh.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      mh.store('long', 'k1', 'v1');
      mh.recall('k1');
      mh.setActive('k1', false);
      mh.resetAll();
      expect(mh.getHits('k1')).toBe(0);
      expect(mh.isActive('k1')).toBe(true);
    });
  });

  // ============================================================
  // tiers
  // ============================================================
  describe('tiers', () => {
    it('should get long term', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getLongTerm()).toHaveLength(1);
    });

    it('should get short term', () => {
      mh.store('short', 'k1', 'v1');
      expect(mh.getShortTerm()).toHaveLength(1);
    });

    it('should get working memory', () => {
      mh.store('working', 'k1', 'v1');
      expect(mh.getWorkingMemory()).toHaveLength(1);
    });

    it('should get long term count', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getLongTermCount()).toBe(1);
    });

    it('should get short term count', () => {
      mh.store('short', 'k1', 'v1');
      expect(mh.getShortTermCount()).toBe(1);
    });

    it('should get working memory count', () => {
      mh.store('working', 'k1', 'v1');
      expect(mh.getWorkingMemoryCount()).toBe(1);
    });
  });

  // ============================================================
  // state
  // ============================================================
  describe('state', () => {
    it('should get active', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      mh.store('long', 'k1', 'v1');
      mh.setActive('k1', false);
      expect(mh.getInactiveItems()).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get by min importance', () => {
      mh.store('long', 'k1', 'v1', 5);
      mh.store('long', 'k2', 'v2', 10);
      expect(mh.getByMinImportance(7)).toHaveLength(1);
    });

    it('should get most important', () => {
      mh.store('long', 'k1', 'v1', 10);
      expect(mh.getMostImportant()?.key).toBe('k1');
    });

    it('should return null for empty important', () => {
      expect(mh.getMostImportant()).toBeNull();
    });

    it('should get most hits', () => {
      mh.store('long', 'k1', 'v1');
      mh.recall('k1');
      expect(mh.getMostHits()?.key).toBe('k1');
    });

    it('should return null for empty most', () => {
      expect(mh.getMostHits()).toBeNull();
    });

    it('should get newest', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getNewest()?.key).toBe('k1');
    });

    it('should return null for empty newest', () => {
      expect(mh.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getOldest()?.key).toBe('k1');
    });

    it('should return null for empty oldest', () => {
      expect(mh.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getCreatedAt('k1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      mh.store('long', 'k1', 'v1');
      mh.touch('k1');
      expect(mh.getUpdatedAt('k1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // counters
  // ============================================================
  describe('counters', () => {
    it('should get promotions', () => {
      mh.store('working', 'k1', 'v1');
      mh.promote('k1', 'long');
      expect(mh.getPromotions()).toBe(1);
    });

    it('should get demotions', () => {
      mh.store('long', 'k1', 'v1');
      mh.promote('k1', 'working');
      expect(mh.getDemotions()).toBe(1);
    });
  });

  // ============================================================
  // keys
  // ============================================================
  describe('keys', () => {
    it('should get all keys', () => {
      mh.store('long', 'k1', 'v1');
      mh.store('long', 'k2', 'v2');
      expect(mh.getAllKeys()).toHaveLength(2);
    });

    it('should get key count', () => {
      mh.store('long', 'k1', 'v1');
      expect(mh.getKeyCount()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many memories', () => {
      for (let i = 0; i < 50; i++) {
        mh.store('long', `k${i}`, `v${i}`);
      }
      expect(mh.getCount()).toBe(50);
    });
  });
});