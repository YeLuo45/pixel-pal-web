/**
 * IndexManager Tests
 * nanobot-design Index Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexManager } from '../IndexManager';

describe('IndexManager', () => {
  let ixm: IndexManager;

  beforeEach(() => {
    ixm = new IndexManager();
  });

  afterEach(() => {
    ixm.clearAll();
  });

  // ============================================================
  // create / add / query / remove / clear / removeKey
  // ============================================================
  describe('create / add / query / remove / clear / removeKey', () => {
    it('should create', () => {
      expect(ixm.create('idx1', 'name')).toBe('ixm-1');
    });

    it('should mark as active', () => {
      const id = ixm.create('idx1', 'name');
      expect(ixm.isActive(id)).toBe(true);
    });

    it('should default field to default', () => {
      const id = ixm.create('idx1');
      expect(ixm.getField(id)).toBe('default');
    });

    it('should add', () => {
      const id = ixm.create('idx1', 'name');
      expect(ixm.add(id, 'alice', 'a')).toBe(true);
    });

    it('should not add inactive', () => {
      const id = ixm.create('idx1', 'name');
      ixm.setActive(id, false);
      expect(ixm.add(id, 'alice', 'a')).toBe(false);
    });

    it('should return false for unknown add', () => {
      expect(ixm.add('unknown', 'k', 'v')).toBe(false);
    });

    it('should query', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.query(id, 'alice')).toEqual(['a']);
    });

    it('should return empty for missing key', () => {
      const id = ixm.create('idx1', 'name');
      expect(ixm.query(id, 'missing')).toEqual([]);
    });

    it('should not query inactive', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      ixm.setActive(id, false);
      expect(ixm.query(id, 'alice')).toEqual([]);
    });

    it('should return empty for unknown query', () => {
      expect(ixm.query('unknown', 'k')).toEqual([]);
    });

    it('should remove index', () => {
      const id = ixm.create('idx1', 'name');
      expect(ixm.remove(id)).toBe(true);
    });

    it('should clear index', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.clear(id)).toBe(true);
    });

    it('should return false for unknown clear', () => {
      expect(ixm.clear('unknown')).toBe(false);
    });

    it('should remove key', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.removeKey(id, 'alice')).toBe(true);
    });

    it('should return false for unknown removeKey', () => {
      expect(ixm.removeKey('unknown', 'k')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ixm.create('idx1', 'name');
      const stats = ixm.getStats();
      expect(stats.indexes).toBe(1);
    });

    it('should count total entries', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getStats().totalEntries).toBe(1);
    });

    it('should count active', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ixm.create('idx1', 'name');
      ixm.setActive(id, false);
      expect(ixm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ixm.create('idx1', 'name');
      ixm.create('idx2', 'name');
      expect(ixm.getStats().uniqueNames).toBe(2);
    });

    it('should count unique fields', () => {
      ixm.create('idx1', 'name');
      ixm.create('idx2', 'email');
      expect(ixm.getStats().uniqueFields).toBe(2);
    });

    it('should compute avg entries', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getStats().avgEntries).toBe(1);
    });

    it('should get max entries', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      ixm.add(id, 'bob', 'b');
      expect(ixm.getStats().maxEntries).toBe(2);
    });

    it('should get min entries', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getStats().minEntries).toBe(0);
    });

    it('should compute avg name length', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getStats().avgNameLength).toBe(4);
    });

    it('should compute avg field length', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getStats().avgFieldLength).toBe(4);
    });

    it('should count total queries', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      ixm.query(id, 'alice');
      expect(ixm.getStats().totalQueries).toBe(1);
    });

    it('should count total adds', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getStats().totalAdds).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get index', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getIndex('ixm-1')?.name).toBe('idx1');
    });

    it('should get all', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getAllIndexes()).toHaveLength(1);
    });

    it('should check existence', () => {
      ixm.create('idx1', 'name');
      expect(ixm.hasIndex('ixm-1')).toBe(true);
    });

    it('should count', () => {
      expect(ixm.getCount()).toBe(0);
      ixm.create('idx1', 'name');
      expect(ixm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getName('ixm-1')).toBe('idx1');
    });

    it('should get field', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getField('ixm-1')).toBe('name');
    });

    it('should get name length', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getNameLength('ixm-1')).toBe(4);
    });

    it('should get field length', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getFieldLength('ixm-1')).toBe(4);
    });

    it('should get entries count', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getEntriesCount('ixm-1')).toBe(0);
    });

    it('should get keys', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getKeys(id)).toEqual(['alice']);
    });

    it('should get key count', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getKeyCount(id)).toBe(1);
    });

    it('should get values', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getValues(id, 'alice')).toEqual(['a']);
    });

    it('should get history', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getHistory('ixm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ixm.create('idx1', 'name');
      expect(ixm.setActive('ixm-1', false)).toBe(true);
    });

    it('should set name', () => {
      ixm.create('idx1', 'name');
      expect(ixm.setName('ixm-1', 'idx2')).toBe(true);
    });

    it('should set field', () => {
      ixm.create('idx1', 'name');
      expect(ixm.setField('ixm-1', 'email')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ixm.setActive('unknown', false)).toBe(false);
      expect(ixm.setName('unknown', 'i')).toBe(false);
      expect(ixm.setField('unknown', 'f')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      ixm.setActive(id, false);
      ixm.resetAll();
      expect(ixm.getEntriesCount(id)).toBe(0);
      expect(ixm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / field / state
  // ============================================================
  describe('by name / field / state', () => {
    it('should get by name', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getByName('idx1')).toHaveLength(1);
    });

    it('should get by field', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getByField('name')).toHaveLength(1);
    });

    it('should get active', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getActiveIndexes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ixm.create('idx1', 'name');
      ixm.setActive('ixm-1', false);
      expect(ixm.getInactiveIndexes()).toHaveLength(1);
    });

    it('should get all names', () => {
      ixm.create('idx1', 'name');
      ixm.create('idx2', 'name');
      expect(ixm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getNameCount()).toBe(1);
    });

    it('should get all fields', () => {
      ixm.create('idx1', 'name');
      ixm.create('idx2', 'email');
      expect(ixm.getAllFields()).toHaveLength(2);
    });

    it('should get field count', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getFieldCount()).toBe(1);
    });

    it('should get by min entries', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getByMinEntries(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getNewest()?.id).toBe('ixm-1');
    });

    it('should return null for empty newest', () => {
      expect(ixm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getOldest()?.id).toBe('ixm-1');
    });

    it('should return null for empty oldest', () => {
      expect(ixm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ixm.create('idx1', 'name');
      expect(ixm.getCreatedAt('ixm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total queries', () => {
      const id = ixm.create('idx1', 'name');
      ixm.query(id, 'alice');
      expect(ixm.getTotalQueries()).toBe(1);
    });

    it('should get total adds', () => {
      const id = ixm.create('idx1', 'name');
      ixm.add(id, 'alice', 'a');
      expect(ixm.getTotalAdds()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many indexes', () => {
      for (let i = 0; i < 50; i++) {
        ixm.create(`idx${i}`, 'name');
      }
      expect(ixm.getCount()).toBe(50);
    });
  });
});