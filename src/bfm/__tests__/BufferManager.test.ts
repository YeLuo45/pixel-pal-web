/**
 * BufferManager Tests
 * thunderbolt-design Buffer Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BufferManager } from '../BufferManager';

describe('BufferManager', () => {
  let bfm: BufferManager;

  beforeEach(() => {
    bfm = new BufferManager();
  });

  afterEach(() => {
    bfm.clearAll();
  });

  // ============================================================
  // create / write / read / clear / reset / resize
  // ============================================================
  describe('create / write / read / clear / reset / resize', () => {
    it('should create', () => {
      expect(bfm.create('b1', 100)).toBe('bfm-1');
    });

    it('should mark as active', () => {
      const id = bfm.create('b1', 100);
      expect(bfm.isActive(id)).toBe(true);
    });

    it('should mark as empty', () => {
      const id = bfm.create('b1', 100);
      expect(bfm.isEmpty(id)).toBe(true);
    });

    it('should set used to 0 on create', () => {
      const id = bfm.create('b1', 100);
      expect(bfm.getUsed(id)).toBe(0);
    });

    it('should write', () => {
      const id = bfm.create('b1', 100);
      expect(bfm.write(id, 'hello')).toBe(true);
    });

    it('should increment writes on write', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getWrites(id)).toBe(1);
    });

    it('should set used on write', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getUsed(id)).toBe(5);
    });

    it('should log history on write', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getHistory(id)).toHaveLength(1);
    });

    it('should not write when exceeding capacity', () => {
      const id = bfm.create('b1', 5);
      expect(bfm.write(id, 'hello world')).toBe(false);
    });

    it('should not write inactive', () => {
      const id = bfm.create('b1', 100);
      bfm.setActive(id, false);
      expect(bfm.write(id, 'hello')).toBe(false);
    });

    it('should return false for unknown write', () => {
      expect(bfm.write('unknown', 'data')).toBe(false);
    });

    it('should read', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.read(id)).toBe('hello');
    });

    it('should increment reads on read', () => {
      const id = bfm.create('b1', 100);
      bfm.read(id);
      expect(bfm.getReads(id)).toBe(1);
    });

    it('should return empty for unknown read', () => {
      expect(bfm.read('unknown')).toBe('');
    });

    it('should return empty for inactive read', () => {
      const id = bfm.create('b1', 100);
      bfm.setActive(id, false);
      expect(bfm.read(id)).toBe('');
    });

    it('should clear', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.clear(id)).toBe(true);
    });

    it('should mark as zero on clear', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      bfm.clear(id);
      expect(bfm.getUsed(id)).toBe(0);
    });

    it('should return false for unknown clear', () => {
      expect(bfm.clear('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      bfm.reset(id);
      expect(bfm.getWrites(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(bfm.reset('unknown')).toBe(false);
    });

    it('should resize', () => {
      const id = bfm.create('b1', 100);
      expect(bfm.resize(id, 200)).toBe(true);
    });

    it('should set new capacity on resize', () => {
      const id = bfm.create('b1', 100);
      bfm.resize(id, 200);
      expect(bfm.getCapacity(id)).toBe(200);
    });

    it('should return false for unknown resize', () => {
      expect(bfm.resize('unknown', 100)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      bfm.create('b1', 100);
      const stats = bfm.getStats();
      expect(stats.buffers).toBe(1);
    });

    it('should count total used', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getStats().totalUsed).toBe(5);
    });

    it('should count total capacity', () => {
      bfm.create('b1', 100);
      bfm.create('b2', 50);
      expect(bfm.getStats().totalCapacity).toBe(150);
    });

    it('should count total writes', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getStats().totalWrites).toBe(1);
    });

    it('should count total reads', () => {
      const id = bfm.create('b1', 100);
      bfm.read(id);
      expect(bfm.getStats().totalReads).toBe(1);
    });

    it('should count active', () => {
      bfm.create('b1', 100);
      expect(bfm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bfm.create('b1', 100);
      bfm.setActive(id, false);
      expect(bfm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      bfm.create('b1', 100);
      bfm.create('b2', 100);
      expect(bfm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg used', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getStats().avgUsed).toBe(5);
    });

    it('should get max used', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      bfm.write(id, 'world');
      expect(bfm.getStats().maxUsed).toBe(10);
    });

    it('should get min used', () => {
      bfm.create('b1', 100);
      expect(bfm.getStats().minUsed).toBe(0);
    });

    it('should compute avg capacity', () => {
      bfm.create('b1', 100);
      expect(bfm.getStats().avgCapacity).toBe(100);
    });

    it('should compute utilization rate', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getStats().utilizationRate).toBe(0.05);
    });

    it('should count empty buffers', () => {
      bfm.create('b1', 100);
      expect(bfm.getStats().emptyBuffers).toBe(1);
    });

    it('should count full buffers', () => {
      const id = bfm.create('b1', 5);
      bfm.write(id, 'hello');
      expect(bfm.getStats().fullBuffers).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get buffer', () => {
      bfm.create('b1', 100);
      expect(bfm.getBuffer('bfm-1')?.name).toBe('b1');
    });

    it('should get all', () => {
      bfm.create('b1', 100);
      expect(bfm.getAllBuffers()).toHaveLength(1);
    });

    it('should remove', () => {
      bfm.create('b1', 100);
      expect(bfm.removeBuffer('bfm-1')).toBe(true);
    });

    it('should check existence', () => {
      bfm.create('b1', 100);
      expect(bfm.hasBuffer('bfm-1')).toBe(true);
    });

    it('should count', () => {
      expect(bfm.getCount()).toBe(0);
      bfm.create('b1', 100);
      expect(bfm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      bfm.create('b1', 100);
      expect(bfm.getName('bfm-1')).toBe('b1');
    });

    it('should get capacity', () => {
      bfm.create('b1', 100);
      expect(bfm.getCapacity('bfm-1')).toBe(100);
    });

    it('should get history', () => {
      bfm.create('b1', 100);
      expect(bfm.getHistory('bfm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      bfm.create('b1', 100);
      expect(bfm.setActive('bfm-1', false)).toBe(true);
    });

    it('should set name', () => {
      bfm.create('b1', 100);
      expect(bfm.setName('bfm-1', 'b2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bfm.setActive('unknown', false)).toBe(false);
      expect(bfm.setName('unknown', 'b')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      bfm.setActive(id, false);
      bfm.resetAll();
      expect(bfm.getWrites(id)).toBe(0);
      expect(bfm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      bfm.create('b1', 100);
      expect(bfm.getByName('b1')).toHaveLength(1);
    });

    it('should get active', () => {
      bfm.create('b1', 100);
      expect(bfm.getActiveBuffers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      bfm.create('b1', 100);
      bfm.setActive('bfm-1', false);
      expect(bfm.getInactiveBuffers()).toHaveLength(1);
    });

    it('should get empty buffers', () => {
      bfm.create('b1', 100);
      expect(bfm.getEmptyBuffers()).toHaveLength(1);
    });

    it('should get full buffers', () => {
      const id = bfm.create('b1', 5);
      bfm.write(id, 'hello');
      expect(bfm.getFullBuffers()).toHaveLength(1);
    });

    it('should get all names', () => {
      bfm.create('b1', 100);
      bfm.create('b2', 100);
      expect(bfm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      bfm.create('b1', 100);
      expect(bfm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      bfm.create('b1', 100);
      expect(bfm.getNewest()?.id).toBe('bfm-1');
    });

    it('should return null for empty newest', () => {
      expect(bfm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bfm.create('b1', 100);
      expect(bfm.getOldest()?.id).toBe('bfm-1');
    });

    it('should return null for empty oldest', () => {
      expect(bfm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      bfm.create('b1', 100);
      expect(bfm.getCreatedAt('bfm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total writes', () => {
      const id = bfm.create('b1', 100);
      bfm.write(id, 'hello');
      expect(bfm.getTotalWrites()).toBe(1);
    });

    it('should get total reads', () => {
      const id = bfm.create('b1', 100);
      bfm.read(id);
      expect(bfm.getTotalReads()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many buffers', () => {
      for (let i = 0; i < 50; i++) {
        bfm.create(`b${i}`, 100);
      }
      expect(bfm.getCount()).toBe(50);
    });
  });
});