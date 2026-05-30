/**
 * V167: L3Skill Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { L3Skill } from '../layers/L3Skill';
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

describe('L3Skill', () => {
  let layer: L3Skill;

  const createEntry = (overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
    id: `test_${crypto.randomUUID().slice(0, 8)}`,
    layer: 'L3',
    content: 'Test skill content',
    importance: 70,
    accessCount: 5,
    lastAccessed: Date.now(),
    createdAt: Date.now(),
    tags: ['skill', 'test'],
    metadata: { category: 'general' },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.query.mockReturnValue([]);
    layer = new L3Skill();
  });

  describe('add', () => {
    it('should add a valid L3 entry via storage', () => {
      const entry = createEntry();
      layer.add(entry);
      expect(mockStorage.set).toHaveBeenCalledWith('dream_memory_l3', entry.id, entry);
    });

    it('should throw for non-L3 layer', () => {
      const entry = createEntry({ layer: 'L2' });
      expect(() => layer.add(entry)).toThrow('L3Skill can only store L3 layer entries');
    });
  });

  describe('get', () => {
    it('should retrieve entry from storage', () => {
      const entry = createEntry();
      mockStorage.get.mockReturnValue(entry);
      const retrieved = layer.get(entry.id);
      expect(mockStorage.get).toHaveBeenCalledWith('dream_memory_l3', entry.id);
      expect(retrieved).toEqual(entry);
    });

    it('should return null for non-existent entry', () => {
      mockStorage.get.mockReturnValue(null);
      expect(layer.get('non_existent')).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should query all L3 entries from storage', () => {
      const entries = [createEntry(), createEntry()];
      mockStorage.query.mockReturnValue(entries);
      expect(layer.getAll()).toEqual(entries);
      expect(mockStorage.query).toHaveBeenCalledWith('dream_memory_l3', { layer: 'L3' });
    });
  });

  describe('getSkills', () => {
    it('should return all skills', () => {
      const entries = [createEntry(), createEntry()];
      mockStorage.query.mockReturnValue(entries);
      expect(layer.getSkills()).toEqual(entries);
    });
  });

  describe('getSkillsByCategory', () => {
    it('should filter skills by category in metadata', () => {
      const skill1 = createEntry({ id: '1', metadata: { category: 'coding' } });
      const skill2 = createEntry({ id: '2', metadata: { category: 'writing' } });
      const skill3 = createEntry({ id: '3', metadata: { category: 'coding' } });
      mockStorage.query.mockReturnValue([skill1, skill2, skill3]);
      
      const results = layer.getSkillsByCategory('coding');
      expect(results.length).toBe(2);
    });

    it('should return empty array for non-existent category', () => {
      mockStorage.query.mockReturnValue([createEntry({ metadata: { category: 'other' } })]);
      expect(layer.getSkillsByCategory('coding')).toEqual([]);
    });
  });

  describe('getByTag', () => {
    it('should filter skills by tag', () => {
      const skill1 = createEntry({ id: '1', tags: ['javascript'] });
      const skill2 = createEntry({ id: '2', tags: ['python'] });
      mockStorage.query.mockReturnValue([skill1, skill2]);
      
      const results = layer.getByTag('javascript');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });

    it('should be case insensitive', () => {
      const skill = createEntry({ tags: ['JavaScript'] });
      mockStorage.query.mockReturnValue([skill]);
      
      const results = layer.getByTag('javascript');
      expect(results.length).toBe(1);
    });
  });

  describe('search', () => {
    it('should search skills by content', () => {
      const skill1 = createEntry({ id: '1', content: 'React hooks' });
      const skill2 = createEntry({ id: '2', content: 'Vue composition API' });
      mockStorage.query.mockReturnValue([skill1, skill2]);
      
      const results = layer.search('React');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });

    it('should search skills by tag', () => {
      const skill1 = createEntry({ id: '1', tags: ['frontend'] });
      const skill2 = createEntry({ id: '2', tags: ['backend'] });
      mockStorage.query.mockReturnValue([skill1, skill2]);
      
      const results = layer.search('frontend');
      expect(results.length).toBe(1);
    });

    it('should be case insensitive', () => {
      const skill = createEntry({ content: 'JAVASCRIPT' });
      mockStorage.query.mockReturnValue([skill]);
      
      const results = layer.search('javascript');
      expect(results.length).toBe(1);
    });
  });

  describe('remove', () => {
    it('should delete skill from storage', () => {
      layer.remove('test_id');
      expect(mockStorage.delete).toHaveBeenCalledWith('dream_memory_l3', 'test_id');
    });
  });

  describe('clear', () => {
    it('should delete all skills', () => {
      const entries = [createEntry({ id: '1' }), createEntry({ id: '2' })];
      mockStorage.query.mockReturnValue(entries);
      layer.clear();
      expect(mockStorage.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('size', () => {
    it('should return count of skills', () => {
      mockStorage.query.mockReturnValue([createEntry(), createEntry(), createEntry()]);
      expect(layer.size()).toBe(3);
    });
  });
});