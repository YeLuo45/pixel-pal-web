/**
 * MemoryStore Tests
 * generic-agent-design Memory Store
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryStore } from '../MemoryStore';

describe('MemoryStore', () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  afterEach(() => {
    store.clearAll();
  });

  // ============================================================
  // write / read
  // ============================================================
  describe('write / read', () => {
    it('should write', () => {
      const id = store.write('k1', 'v1');
      expect(id).toBe('mem-1');
    });

    it('should read', () => {
      const id = store.write('k1', 'v1');
      expect(store.read(id)?.value).toBe('v1');
    });

    it('should return null for unknown', () => {
      expect(store.read('unknown')).toBeNull();
    });

    it('should increment access count', () => {
      const id = store.write('k1', 'v1');
      store.read(id);
      expect(store.getAccessCount(id)).toBe(1);
    });
  });

  // ============================================================
  // search
  // ============================================================
  describe('search', () => {
    it('should search by key', () => {
      store.write('hello', 'v');
      expect(store.search('hello')).toHaveLength(1);
    });

    it('should search by tag', () => {
      store.write('k1', 'v', ['greeting']);
      expect(store.search('greet')).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      expect(store.search('xyz')).toHaveLength(0);
    });
  });

  // ============================================================
  // archive
  // ============================================================
  describe('archive', () => {
    it('should archive', () => {
      const id = store.write('k1', 'v');
      expect(store.archive(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(store.archive('unknown')).toBe(false);
    });

    it('should unarchive', () => {
      const id = store.write('k1', 'v');
      store.archive(id);
      expect(store.unarchive(id)).toBe(true);
    });

    it('should not read archived', () => {
      const id = store.write('k1', 'v');
      store.archive(id);
      expect(store.read(id)).toBeNull();
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      store.write('k1', 'v');
      const stats = store.getStats();
      expect(stats.memories).toBe(1);
    });

    it('should count archived', () => {
      const id = store.write('k1', 'v');
      store.archive(id);
      expect(store.getStats().archived).toBe(1);
    });

    it('should count active', () => {
      store.write('k1', 'v');
      expect(store.getStats().active).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get memory', () => {
      const id = store.write('k1', 'v');
      expect(store.getMemory(id)?.key).toBe('k1');
    });

    it('should get all', () => {
      store.write('k1', 'v');
      expect(store.getAll()).toHaveLength(1);
    });

    it('should get active', () => {
      store.write('k1', 'v');
      expect(store.getActive()).toHaveLength(1);
    });

    it('should get archived', () => {
      const id = store.write('k1', 'v');
      store.archive(id);
      expect(store.getArchived()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = store.write('k1', 'v');
      expect(store.removeMemory(id)).toBe(true);
    });

    it('should check existence', () => {
      const id = store.write('k1', 'v');
      expect(store.hasMemory(id)).toBe(true);
    });

    it('should count', () => {
      expect(store.getCount()).toBe(0);
      store.write('k1', 'v');
      expect(store.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get value', () => {
      const id = store.write('k1', 'v');
      expect(store.getValue(id)).toBe('v');
    });

    it('should get key', () => {
      const id = store.write('k1', 'v');
      expect(store.getKey(id)).toBe('k1');
    });

    it('should get tags', () => {
      const id = store.write('k1', 'v', ['a', 'b']);
      expect(store.getTags(id)).toEqual(['a', 'b']);
    });

    it('should check hasTag', () => {
      const id = store.write('k1', 'v', ['a']);
      expect(store.hasTag(id, 'a')).toBe(true);
    });
  });

  // ============================================================
  // tag ops
  // ============================================================
  describe('tag ops', () => {
    it('should add tag', () => {
      const id = store.write('k1', 'v', ['a']);
      expect(store.addTag(id, 'b')).toBe(true);
    });

    it('should not add duplicate', () => {
      const id = store.write('k1', 'v', ['a']);
      store.addTag(id, 'a');
      expect(store.getTags(id)).toEqual(['a']);
    });

    it('should remove tag', () => {
      const id = store.write('k1', 'v', ['a', 'b']);
      expect(store.removeTag(id, 'a')).toBe(true);
    });

    it('should return false for unknown addTag', () => {
      expect(store.addTag('unknown', 'a')).toBe(false);
    });

    it('should return false for unknown removeTag', () => {
      expect(store.removeTag('unknown', 'a')).toBe(false);
    });

    it('should return false for missing tag remove', () => {
      const id = store.write('k1', 'v', ['a']);
      expect(store.removeTag(id, 'z')).toBe(false);
    });
  });

  // ============================================================
  // updaters
  // ============================================================
  describe('updaters', () => {
    it('should update value', () => {
      const id = store.write('k1', 'v1');
      expect(store.updateValue(id, 'v2')).toBe(true);
    });

    it('should update key', () => {
      const id = store.write('k1', 'v');
      expect(store.updateKey(id, 'k2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(store.updateValue('unknown', 'v')).toBe(false);
      expect(store.updateKey('unknown', 'k')).toBe(false);
    });
  });

  // ============================================================
  // by tag / by key
  // ============================================================
  describe('by tag / by key', () => {
    it('should get by tag', () => {
      store.write('k1', 'v', ['a']);
      expect(store.getByTag('a')).toHaveLength(1);
    });

    it('should get by key', () => {
      store.write('k1', 'v');
      expect(store.getByKey('k1')).toHaveLength(1);
    });
  });

  // ============================================================
  // tags aggregation
  // ============================================================
  describe('tags aggregation', () => {
    it('should get tag count', () => {
      store.write('k1', 'v', ['a', 'b']);
      expect(store.getTagCount()).toBe(2);
    });

    it('should get all tags', () => {
      store.write('k1', 'v', ['a']);
      store.write('k2', 'v', ['b']);
      expect(store.getAllTags()).toHaveLength(2);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      const id = store.write('k1', 'v');
      expect(store.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get last accessed', () => {
      const id = store.write('k1', 'v');
      expect(store.getLastAccessedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // status
  // ============================================================
  describe('status', () => {
    it('should check isArchived', () => {
      const id = store.write('k1', 'v');
      store.archive(id);
      expect(store.isArchived(id)).toBe(true);
    });

    it('should check isActive', () => {
      const id = store.write('k1', 'v');
      expect(store.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most accessed', () => {
      const id = store.write('k1', 'v');
      store.read(id);
      expect(store.getMostAccessed()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(store.getMostAccessed()).toBeNull();
    });

    it('should get least accessed', () => {
      const id = store.write('k1', 'v');
      expect(store.getLeastAccessed()?.id).toBe(id);
    });

    it('should return null for empty least', () => {
      expect(store.getLeastAccessed()).toBeNull();
    });

    it('should get newest', () => {
      const id = store.write('k1', 'v');
      expect(store.getNewest()?.id).toBe(id);
    });

    it('should return null for empty newest', () => {
      expect(store.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      const id = store.write('k1', 'v');
      expect(store.getOldest()?.id).toBe(id);
    });

    it('should return null for empty oldest', () => {
      expect(store.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many memories', () => {
      for (let i = 0; i < 50; i++) {
        store.write(`k${i}`, `v${i}`);
      }
      expect(store.getCount()).toBe(50);
    });
  });
});