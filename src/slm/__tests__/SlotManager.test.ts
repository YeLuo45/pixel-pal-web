/**
 * SlotManager Tests
 * nanobot-design Slot Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SlotManager } from '../SlotManager';

describe('SlotManager', () => {
  let slm: SlotManager;

  beforeEach(() => {
    slm = new SlotManager();
  });

  afterEach(() => {
    slm.clearAll();
  });

  // ============================================================
  // add / reserve / release / remove
  // ============================================================
  describe('add / reserve / release / remove', () => {
    it('should add', () => {
      expect(slm.add('slot1')).toBe('slm-1');
    });

    it('should default reserved to false', () => {
      const id = slm.add('slot1');
      expect(slm.isReserved(id)).toBe(false);
    });

    it('should mark as active', () => {
      const id = slm.add('slot1');
      expect(slm.isActive(id)).toBe(true);
    });

    it('should mark as available', () => {
      const id = slm.add('slot1');
      expect(slm.isAvailable(id)).toBe(true);
    });

    it('should reserve', () => {
      const id = slm.add('slot1');
      expect(slm.reserve(id, 'alice')).toBe(true);
    });

    it('should set owner on reserve', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getOwner(id)).toBe('alice');
    });

    it('should not double reserve', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.reserve(id, 'bob')).toBe(false);
    });

    it('should not reserve inactive', () => {
      const id = slm.add('slot1');
      slm.setActive(id, false);
      expect(slm.reserve(id, 'alice')).toBe(false);
    });

    it('should return false for unknown reserve', () => {
      expect(slm.reserve('unknown', 'alice')).toBe(false);
    });

    it('should release', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.release(id)).toBe(true);
    });

    it('should clear owner on release', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      slm.release(id);
      expect(slm.getOwner(id)).toBe('');
    });

    it('should not release unreserved', () => {
      const id = slm.add('slot1');
      expect(slm.release(id)).toBe(false);
    });

    it('should return false for unknown release', () => {
      expect(slm.release('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = slm.add('slot1');
      expect(slm.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      slm.add('slot1');
      const stats = slm.getStats();
      expect(stats.slots).toBe(1);
    });

    it('should count total reserves', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getStats().totalReserves).toBe(1);
    });

    it('should count total releases', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      slm.release(id);
      expect(slm.getStats().totalReleases).toBe(1);
    });

    it('should count reserved', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getStats().reserved).toBe(1);
    });

    it('should count unreserved', () => {
      slm.add('slot1');
      expect(slm.getStats().unreserved).toBe(1);
    });

    it('should count active', () => {
      slm.add('slot1');
      expect(slm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = slm.add('slot1');
      slm.setActive(id, false);
      expect(slm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      slm.add('a');
      slm.add('b');
      expect(slm.getStats().uniqueNames).toBe(2);
    });

    it('should count unique owners', () => {
      const id1 = slm.add('a');
      const id2 = slm.add('b');
      slm.reserve(id1, 'alice');
      slm.reserve(id2, 'bob');
      expect(slm.getStats().uniqueOwners).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get slot', () => {
      slm.add('slot1');
      expect(slm.getSlot('slm-1')?.name).toBe('slot1');
    });

    it('should get all', () => {
      slm.add('slot1');
      expect(slm.getAllSlots()).toHaveLength(1);
    });

    it('should check existence', () => {
      slm.add('slot1');
      expect(slm.hasSlot('slm-1')).toBe(true);
    });

    it('should count', () => {
      expect(slm.getCount()).toBe(0);
      slm.add('slot1');
      expect(slm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      slm.add('slot1');
      expect(slm.getName('slm-1')).toBe('slot1');
    });

    it('should get owner', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getOwner(id)).toBe('alice');
    });

    it('should get history', () => {
      slm.add('slot1');
      expect(slm.getHistory('slm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      slm.add('slot1');
      expect(slm.setActive('slm-1', false)).toBe(true);
    });

    it('should set name', () => {
      slm.add('slot1');
      expect(slm.setName('slm-1', 'slot2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(slm.setActive('unknown', false)).toBe(false);
      expect(slm.setName('unknown', 's')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      slm.setActive(id, false);
      slm.resetAll();
      expect(slm.isReserved(id)).toBe(false);
      expect(slm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / owner / state
  // ============================================================
  describe('by name / owner / state', () => {
    it('should get by name', () => {
      slm.add('slot1');
      expect(slm.getByName('slot1')).toHaveLength(1);
    });

    it('should get by owner', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getByOwner('alice')).toHaveLength(1);
    });

    it('should get reserved', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getReservedSlots()).toHaveLength(1);
    });

    it('should get unreserved', () => {
      slm.add('slot1');
      expect(slm.getUnreservedSlots()).toHaveLength(1);
    });

    it('should get available', () => {
      slm.add('slot1');
      expect(slm.getAvailableSlots()).toHaveLength(1);
    });

    it('should get active', () => {
      slm.add('slot1');
      expect(slm.getActiveSlots()).toHaveLength(1);
    });

    it('should get inactive', () => {
      slm.add('slot1');
      slm.setActive('slm-1', false);
      expect(slm.getInactiveSlots()).toHaveLength(1);
    });

    it('should get all names', () => {
      slm.add('a');
      slm.add('b');
      expect(slm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      slm.add('a');
      expect(slm.getNameCount()).toBe(1);
    });

    it('should get all owners', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getAllOwners()).toEqual(['alice']);
    });

    it('should get owner count', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getOwnerCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      slm.add('slot1');
      expect(slm.getNewest()?.id).toBe('slm-1');
    });

    it('should return null for empty newest', () => {
      expect(slm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      slm.add('slot1');
      expect(slm.getOldest()?.id).toBe('slm-1');
    });

    it('should return null for empty oldest', () => {
      expect(slm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      slm.add('slot1');
      expect(slm.getCreatedAt('slm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total reserves', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      expect(slm.getTotalReserves()).toBe(1);
    });

    it('should get total releases', () => {
      const id = slm.add('slot1');
      slm.reserve(id, 'alice');
      slm.release(id);
      expect(slm.getTotalReleases()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many slots', () => {
      for (let i = 0; i < 50; i++) {
        slm.add(`s${i}`);
      }
      expect(slm.getCount()).toBe(50);
    });
  });
});