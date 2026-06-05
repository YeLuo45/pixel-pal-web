/**
 * MemoryStoreV2 Tests
 * chatdev-design Memory Store v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryStoreV2 } from '../MemoryStoreV2';

describe('MemoryStoreV2', () => {
  let ms: MemoryStoreV2;

  beforeEach(() => {
    ms = new MemoryStoreV2();
  });

  afterEach(() => {
    ms.clearAll();
  });

  // ============================================================
  // write / read / relate
  // ============================================================
  describe('write / read / relate', () => {
    it('should write', () => {
      expect(ms.write('k1', 'v1')).toBe('mem-1');
    });

    it('should read', () => {
      const id = ms.write('k1', 'v1');
      expect(ms.read(id)?.key).toBe('k1');
    });

    it('should return null for unknown read', () => {
      expect(ms.read('unknown')).toBeNull();
    });

    it('should increment hits on read', () => {
      const id = ms.write('k1', 'v1');
      ms.read(id);
      expect(ms.getHits(id)).toBe(1);
    });

    it('should relate', () => {
      const id1 = ms.write('k1', 'v1');
      const id2 = ms.write('k2', 'v2');
      expect(ms.relate(id1, id2)).toBe(true);
    });

    it('should return false for unknown relate', () => {
      expect(ms.relate('unknown', 'other')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ms.write('k1', 'v1');
      const stats = ms.getStats();
      expect(stats.memories).toBe(1);
    });

    it('should count total hits', () => {
      const id = ms.write('k1', 'v1');
      ms.read(id);
      expect(ms.getStats().totalHits).toBe(1);
    });

    it('should count total relations', () => {
      const id1 = ms.write('k1', 'v1');
      const id2 = ms.write('k2', 'v2');
      ms.relate(id1, id2);
      expect(ms.getStats().totalRelations).toBe(2);
    });

    it('should compute avg hits', () => {
      ms.write('k1', 'v1');
      expect(ms.getStats().avgHits).toBe(0);
    });

    it('should count keys', () => {
      ms.write('k1', 'v1');
      ms.write('k2', 'v2');
      expect(ms.getStats().keys).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get memory', () => {
      ms.write('k1', 'v1');
      expect(ms.getMemory('mem-1')?.key).toBe('k1');
    });

    it('should get all', () => {
      ms.write('k1', 'v1');
      expect(ms.getAllMemories()).toHaveLength(1);
    });

    it('should remove', () => {
      ms.write('k1', 'v1');
      expect(ms.removeMemory('mem-1')).toBe(true);
    });

    it('should check existence', () => {
      ms.write('k1', 'v1');
      expect(ms.hasMemory('mem-1')).toBe(true);
    });

    it('should count', () => {
      expect(ms.getCount()).toBe(0);
      ms.write('k1', 'v1');
      expect(ms.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get key', () => {
      ms.write('k1', 'v1');
      expect(ms.getKey('mem-1')).toBe('k1');
    });

    it('should get value', () => {
      ms.write('k1', 'hello');
      expect(ms.getValue('mem-1')).toBe('hello');
    });

    it('should get hits', () => {
      const id = ms.write('k1', 'v1');
      ms.read(id);
      expect(ms.getHits(id)).toBe(1);
    });

    it('should get related', () => {
      const id1 = ms.write('k1', 'v1');
      const id2 = ms.write('k2', 'v2');
      ms.relate(id1, id2);
      expect(ms.getRelated(id1)).toContain(id2);
    });

    it('should count related', () => {
      const id1 = ms.write('k1', 'v1');
      const id2 = ms.write('k2', 'v2');
      ms.relate(id1, id2);
      expect(ms.getRelatedCount(id1)).toBe(1);
    });

    it('should check isRelated', () => {
      const id1 = ms.write('k1', 'v1');
      const id2 = ms.write('k2', 'v2');
      ms.relate(id1, id2);
      expect(ms.isRelated(id1, id2)).toBe(true);
    });
  });

  // ============================================================
  // unrelate
  // ============================================================
  describe('unrelate', () => {
    it('should unrelate', () => {
      const id1 = ms.write('k1', 'v1');
      const id2 = ms.write('k2', 'v2');
      ms.relate(id1, id2);
      expect(ms.unrelate(id1, id2)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ms.unrelate('unknown', 'other')).toBe(false);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set value', () => {
      const id = ms.write('k1', 'v1');
      expect(ms.setValue(id, 'v2')).toBe(true);
    });

    it('should set key', () => {
      const id = ms.write('k1', 'v1');
      expect(ms.setKey(id, 'k2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ms.setValue('unknown', 'v')).toBe(false);
      expect(ms.setKey('unknown', 'k')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = ms.write('k1', 'v1');
      ms.read(id);
      ms.resetHits();
      expect(ms.getHits(id)).toBe(0);
    });
  });

  // ============================================================
  // by key
  // ============================================================
  describe('by key', () => {
    it('should get by key', () => {
      ms.write('k1', 'v1');
      expect(ms.getByKey('k1')).toHaveLength(1);
    });

    it('should get all keys', () => {
      ms.write('k1', 'v1');
      ms.write('k2', 'v2');
      expect(ms.getAllKeys()).toHaveLength(2);
    });

    it('should get key count', () => {
      ms.write('k1', 'v1');
      expect(ms.getKeyCount()).toBe(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ms.write('k1', 'v1');
      expect(ms.getCreatedAt('mem-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ms.write('k1', 'v1');
      ms.read(id);
      expect(ms.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = ms.write('k1', 'v1');
      ms.read(id);
      expect(ms.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ms.getMostHit()).toBeNull();
    });

    it('should get most related', () => {
      const id1 = ms.write('k1', 'v1');
      const id2 = ms.write('k2', 'v2');
      ms.relate(id1, id2);
      expect(ms.getMostRelated()?.id).toBe(id1);
    });

    it('should return null for empty most related', () => {
      expect(ms.getMostRelated()).toBeNull();
    });

    it('should get newest', () => {
      ms.write('k1', 'v1');
      expect(ms.getNewest()?.id).toBe('mem-1');
    });

    it('should return null for empty newest', () => {
      expect(ms.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ms.write('k1', 'v1');
      expect(ms.getOldest()?.id).toBe('mem-1');
    });

    it('should return null for empty oldest', () => {
      expect(ms.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many memories', () => {
      for (let i = 0; i < 50; i++) {
        ms.write(`k${i}`, i);
      }
      expect(ms.getCount()).toBe(50);
    });
  });
});