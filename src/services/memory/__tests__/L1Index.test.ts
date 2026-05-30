/**
 * V167: L1Index Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { L1Index } from '../layers/L1Index';
import type { MemoryEntry } from '../MemoryTypes';

describe('L1Index', () => {
  let layer: L1Index;

  const createEntry = (overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
    id: `test_${crypto.randomUUID().slice(0, 8)}`,
    layer: 'L1',
    content: 'Test memory content',
    importance: 50,
    accessCount: 0,
    lastAccessed: Date.now(),
    createdAt: Date.now(),
    tags: ['test', 'unit'],
    ...overrides,
  });

  beforeEach(() => {
    layer = new L1Index();
  });

  afterEach(() => {
    layer.clear();
  });

  describe('add', () => {
    it('should add a valid L1 entry', () => {
      const entry = createEntry();
      layer.add(entry);
      expect(layer.size()).toBe(1);
    });

    it('should throw for non-L1 layer', () => {
      const entry = createEntry({ layer: 'L0' });
      expect(() => layer.add(entry)).toThrow('L1Index can only store L1 layer entries');
    });

    it('should build tag index', () => {
      const entry = createEntry({ tags: ['tag1', 'tag2'] });
      layer.add(entry);
      expect(layer.getIndexed('tag1').length).toBe(1);
      expect(layer.getIndexed('tag2').length).toBe(1);
    });

    it('should update existing entry', () => {
      const entry = createEntry({ id: 'same_id' });
      layer.add(entry);
      const updated = createEntry({ id: 'same_id', content: 'Updated content' });
      layer.add(updated);
      expect(layer.size()).toBe(1);
      expect(layer.get('same_id')?.content).toBe('Updated content');
    });
  });

  describe('get', () => {
    it('should retrieve existing entry', () => {
      const entry = createEntry();
      layer.add(entry);
      const retrieved = layer.get(entry.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(entry.id);
    });

    it('should return null for non-existent entry', () => {
      const retrieved = layer.get('non_existent');
      expect(retrieved).toBeNull();
    });

    it('should increment accessCount on get', () => {
      const entry = createEntry({ accessCount: 0, id: 'inc_test' });
      layer.add(entry);
      layer.get('inc_test');
      layer.get('inc_test');
      const result = layer.get('inc_test'); // This increments to 3
      expect(result?.accessCount).toBe(3); // 0 (add) + 1 + 1 + 1 = 3
    });
  });

  describe('getIndexed', () => {
    it('should return entries with matching tag', () => {
      layer.add(createEntry({ id: 'a', tags: ['javascript'] }));
      layer.add(createEntry({ id: 'b', tags: ['typescript'] }));
      layer.add(createEntry({ id: 'c', tags: ['javascript'] }));
      
      const results = layer.getIndexed('javascript');
      expect(results.length).toBe(2);
    });

    it('should be case insensitive', () => {
      layer.add(createEntry({ id: 'a', tags: ['JavaScript'] }));
      const results = layer.getIndexed('JAVASCRIPT');
      expect(results.length).toBe(1);
    });

    it('should return empty array for non-existent tag', () => {
      expect(layer.getIndexed('non_existent')).toEqual([]);
    });
  });

  describe('getByTags', () => {
    it('should return entries with ALL specified tags', () => {
      layer.add(createEntry({ id: 'a', tags: ['a', 'b'] }));
      layer.add(createEntry({ id: 'b', tags: ['a'] }));
      layer.add(createEntry({ id: 'c', tags: ['b'] }));
      
      const results = layer.getByTags(['a', 'b']);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('a');
    });

    it('should return empty array for empty tags', () => {
      expect(layer.getByTags([])).toEqual([]);
    });
  });

  describe('addTag', () => {
    it('should add a new tag to entry', () => {
      const entry = createEntry({ id: 'tag_test', tags: [] });
      layer.add(entry);
      expect(layer.addTag('tag_test', 'newTag')).toBe(true);
      expect(layer.get('tag_test')?.tags).toContain('newtag');
    });

    it('should not add duplicate tag', () => {
      const entry = createEntry({ id: 'tag_test', tags: ['duplicate'] });
      layer.add(entry);
      layer.addTag('tag_test', 'duplicate');
      expect(layer.get('tag_test')?.tags.filter(t => t === 'duplicate').length).toBe(1);
    });

    it('should return false for non-existent entry', () => {
      expect(layer.addTag('non_existent', 'tag')).toBe(false);
    });
  });

  describe('removeTag', () => {
    it('should remove a tag from entry', () => {
      const entry = createEntry({ id: 'tag_test', tags: ['toRemove'] });
      layer.add(entry);
      expect(layer.removeTag('tag_test', 'toRemove')).toBe(true);
      expect(layer.get('tag_test')?.tags).not.toContain('toremove');
    });

    it('should return false for non-existent entry', () => {
      expect(layer.removeTag('non_existent', 'tag')).toBe(false);
    });
  });

  describe('getRecent', () => {
    it('should return recently accessed entries', () => {
      const entry1 = createEntry({ id: '1' });
      const entry2 = createEntry({ id: '2' });
      const entry3 = createEntry({ id: '3' });
      layer.add(entry1);
      layer.add(entry2);
      layer.add(entry3);
      
      // Access entry1 twice
      layer.get('1');
      layer.get('1');
      
      const recent = layer.getRecent(2);
      expect(recent.length).toBe(2);
      expect(recent[0].id).toBe('1'); // Most recently accessed
    });
  });

  describe('getAll', () => {
    it('should return all entries', () => {
      layer.add(createEntry({ id: 'a' }));
      layer.add(createEntry({ id: 'b' }));
      expect(layer.getAll().length).toBe(2);
    });
  });

  describe('getAllTags', () => {
    it('should return all unique tags', () => {
      layer.add(createEntry({ id: 'a', tags: ['tag1'] }));
      layer.add(createEntry({ id: 'b', tags: ['tag2', 'tag1'] }));
      const tags = layer.getAllTags();
      expect(tags).toContain('tag1');
      expect(tags).toContain('tag2');
    });
  });

  describe('remove', () => {
    it('should remove entry and update indexes', () => {
      const entry = createEntry({ id: 'remove_test', tags: ['removetag'] });
      layer.add(entry);
      expect(layer.remove('remove_test')).toBe(true);
      expect(layer.get('remove_test')).toBeNull();
      expect(layer.getIndexed('removetag')).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      layer.add(createEntry());
      layer.add(createEntry());
      layer.clear();
      expect(layer.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(layer.size()).toBe(0);
      layer.add(createEntry());
      expect(layer.size()).toBe(1);
    });
  });
});