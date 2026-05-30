/**
 * V167: L2Global Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { L2Global } from '../layers/L2Global';
import type { MemoryEntry } from '../MemoryTypes';

// Mock SqliteStorage
const mockStorage = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  query: vi.fn(),
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
};

vi.mock('../../storage/SqliteStorage', () => ({
  getSqliteStorage: () => mockStorage,
  SqliteStorage: class {},
}));

describe('L2Global', () => {
  let layer: L2Global;

  const createEntry = (overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
    id: `test_${crypto.randomUUID().slice(0, 8)}`,
    layer: 'L2',
    content: 'Test global content',
    importance: 50,
    accessCount: 0,
    lastAccessed: Date.now(),
    createdAt: Date.now(),
    tags: ['test'],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock behavior
    mockStorage.query.mockReturnValue([]);
    layer = new L2Global();
  });

  describe('add', () => {
    it('should add a valid L2 entry via storage', () => {
      const entry = createEntry();
      layer.add(entry);
      expect(mockStorage.set).toHaveBeenCalledWith('dream_memory_l2', entry.id, entry);
    });

    it('should throw for non-L2 layer', () => {
      const entry = createEntry({ layer: 'L0' });
      expect(() => layer.add(entry)).toThrow('L2Global can only store L2 layer entries');
    });
  });

  describe('get', () => {
    it('should retrieve entry from storage', () => {
      const entry = createEntry();
      mockStorage.get.mockReturnValue(entry);
      const retrieved = layer.get(entry.id);
      expect(mockStorage.get).toHaveBeenCalledWith('dream_memory_l2', entry.id);
      expect(retrieved).toEqual(entry);
    });

    it('should return null for non-existent entry', () => {
      mockStorage.get.mockReturnValue(null);
      expect(layer.get('non_existent')).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should query all L2 entries from storage', () => {
      const entries = [createEntry(), createEntry()];
      mockStorage.query.mockReturnValue(entries);
      expect(layer.getAll()).toEqual(entries);
      expect(mockStorage.query).toHaveBeenCalledWith('dream_memory_l2', { layer: 'L2' });
    });
  });

  describe('searchGlobal', () => {
    it('should filter entries by predicate', () => {
      const entry1 = createEntry({ id: '1', importance: 80 });
      const entry2 = createEntry({ id: '2', importance: 30 });
      mockStorage.query.mockReturnValue([entry1, entry2]);
      
      const results = layer.searchGlobal(e => e.importance >= 50);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });
  });

  describe('searchGlobalByQuery', () => {
    it('should search entries by content', () => {
      const entry1 = createEntry({ id: '1', content: 'javascript is great' });
      const entry2 = createEntry({ id: '2', content: 'typescript is great' });
      mockStorage.query.mockReturnValue([entry1, entry2]);
      
      const results = layer.searchGlobalByQuery('javascript');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });

    it('should be case insensitive', () => {
      const entry = createEntry({ content: 'JAVASCRIPT' });
      mockStorage.query.mockReturnValue([entry]);
      
      const results = layer.searchGlobalByQuery('javascript');
      expect(results.length).toBe(1);
    });
  });

  describe('getByImportance', () => {
    it('should filter entries by importance threshold', () => {
      const entry1 = createEntry({ id: '1', importance: 80 });
      const entry2 = createEntry({ id: '2', importance: 30 });
      mockStorage.query.mockReturnValue([entry1, entry2]);
      
      const results = layer.getByImportance(50);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });
  });

  describe('getByTag', () => {
    it('should filter entries by tag', () => {
      const entry1 = createEntry({ id: '1', tags: ['important'] });
      const entry2 = createEntry({ id: '2', tags: ['normal'] });
      mockStorage.query.mockReturnValue([entry1, entry2]);
      
      const results = layer.getByTag('important');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });
  });

  describe('remove', () => {
    it('should delete entry from storage', () => {
      layer.remove('test_id');
      expect(mockStorage.delete).toHaveBeenCalledWith('dream_memory_l2', 'test_id');
    });
  });

  describe('clear', () => {
    it('should delete all entries', () => {
      const entries = [createEntry({ id: '1' }), createEntry({ id: '2' })];
      mockStorage.query.mockReturnValue(entries);
      layer.clear();
      expect(mockStorage.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('size', () => {
    it('should return count of entries', () => {
      mockStorage.query.mockReturnValue([createEntry(), createEntry()]);
      expect(layer.size()).toBe(2);
    });
  });
});