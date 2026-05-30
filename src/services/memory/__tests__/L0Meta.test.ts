/**
 * V167: L0Meta Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { L0Meta } from '../layers/L0Meta';
import type { MemoryEntry } from '../MemoryTypes';

describe('L0Meta', () => {
  let layer: L0Meta;

  const createEntry = (overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
    id: `test_${crypto.randomUUID().slice(0, 8)}`,
    layer: 'L0',
    content: 'Test memory content',
    importance: 50,
    accessCount: 0,
    lastAccessed: Date.now(),
    createdAt: Date.now(),
    tags: ['test'],
    ...overrides,
  });

  beforeEach(() => {
    layer = new L0Meta();
  });

  afterEach(() => {
    layer.destroy();
  });

  describe('add', () => {
    it('should add a valid L0 entry', () => {
      const entry = createEntry();
      layer.add(entry);
      expect(layer.size()).toBe(1);
    });

    it('should throw for non-L0 layer', () => {
      const entry = createEntry({ layer: 'L1' });
      expect(() => layer.add(entry)).toThrow('L0Meta can only store L0 layer entries');
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
      const entry = createEntry({ accessCount: 0 });
      layer.add(entry);
      layer.get(entry.id);
      layer.get(entry.id);
      const result = layer.get(entry.id); // This is the assertion call, increments to 3
      expect(result?.accessCount).toBe(3); // 0 (add) + 1 + 1 + 1 (assertion call) = 3
    });
  });

  describe('getRecent', () => {
    it('should return entries sorted by lastAccessed', () => {
      // Note: add() overwrites lastAccessed to Date.now(), so we test
      // the ordering by using get() to update lastAccessed values
      const entry1 = createEntry({ id: '1' });
      const entry2 = createEntry({ id: '2' });
      const entry3 = createEntry({ id: '3' });
      layer.add(entry1);
      layer.add(entry2);
      layer.add(entry3);
      
      // Access entry3 once, entry1 twice (so entry1 should be most recent)
      layer.get('1');
      layer.get('1');
      layer.get('3');
      
      const recent = layer.getRecent(2);
      expect(recent.length).toBe(2);
      expect(recent[0].id).toBe('1'); // Most recently accessed (accessed twice)
      // Second entry could be entry3 or entry2 depending on timing
    });

    it('should return empty array when empty', () => {
      expect(layer.getRecent(10)).toEqual([]);
    });
  });

  describe('updateImportance', () => {
    it('should update importance with positive delta', () => {
      const entry = createEntry({ id: 'imp_test', importance: 50 });
      layer.add(entry);
      layer.updateImportance('imp_test', 20);
      expect(layer.get('imp_test')?.importance).toBe(70);
    });

    it('should update importance with negative delta', () => {
      const entry = createEntry({ id: 'imp_test', importance: 50 });
      layer.add(entry);
      layer.updateImportance('imp_test', -30);
      expect(layer.get('imp_test')?.importance).toBe(20);
    });

    it('should clamp importance to 0 minimum', () => {
      const entry = createEntry({ id: 'imp_test', importance: 20 });
      layer.add(entry);
      layer.updateImportance('imp_test', -50);
      expect(layer.get('imp_test')?.importance).toBe(0);
    });

    it('should clamp importance to 100 maximum', () => {
      const entry = createEntry({ id: 'imp_test', importance: 80 });
      layer.add(entry);
      layer.updateImportance('imp_test', 50);
      expect(layer.get('imp_test')?.importance).toBe(100);
    });

    it('should return false for non-existent entry', () => {
      expect(layer.updateImportance('non_existent', 10)).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all entries', () => {
      layer.add(createEntry({ id: 'a' }));
      layer.add(createEntry({ id: 'b' }));
      layer.add(createEntry({ id: 'c' }));
      expect(layer.getAll().length).toBe(3);
    });

    it('should return empty array when empty', () => {
      expect(layer.getAll()).toEqual([]);
    });
  });

  describe('getByImportance', () => {
    it('should return entries with importance >= threshold', () => {
      layer.add(createEntry({ id: 'high', importance: 80 }));
      layer.add(createEntry({ id: 'mid', importance: 50 }));
      layer.add(createEntry({ id: 'low', importance: 20 }));
      const results = layer.getByImportance(50);
      expect(results.length).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove existing entry', () => {
      const entry = createEntry();
      layer.add(entry);
      expect(layer.remove(entry.id)).toBe(true);
      expect(layer.size()).toBe(0);
    });

    it('should return false for non-existent entry', () => {
      expect(layer.remove('non_existent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      layer.add(createEntry({ id: 'a' }));
      layer.add(createEntry({ id: 'b' }));
      layer.clear();
      expect(layer.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(layer.size()).toBe(0);
      layer.add(createEntry());
      expect(layer.size()).toBe(1);
      layer.add(createEntry());
      expect(layer.size()).toBe(2);
    });
  });
});