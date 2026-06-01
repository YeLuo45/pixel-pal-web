import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemorySearch, MemorySearchOptions } from '../MemorySearch';
import { SearchResult } from '../SemanticSearchEngine';

describe('MemorySearch', () => {
  let memorySearch: MemorySearch;

  beforeEach(() => {
    memorySearch = new MemorySearch();
  });

  afterEach(() => {
    memorySearch.clearHistory();
  });

  describe('constructor()', () => {
    it('should create instance successfully', () => {
      expect(memorySearch).toBeInstanceOf(MemorySearch);
    });
  });

  describe('indexMemory()', () => {
    it('should index a memory object', () => {
      const memory = {
        id: 'mem1',
        content: 'Test memory content',
        tier: 'L1',
        tags: ['test'],
        timestamp: Date.now()
      };
      memorySearch.indexMemory('mem1', memory);
      const results = memorySearch.searchMemories('Test');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should index multiple memories', () => {
      const memory1 = { id: 'mem1', content: 'First memory', tier: 'L1', tags: ['a'] };
      const memory2 = { id: 'mem2', content: 'Second memory', tier: 'L2', tags: ['b'] };
      memorySearch.indexMemory('mem1', memory1);
      memorySearch.indexMemory('mem2', memory2);
      expect(memorySearch.searchMemories('memory').length).toBe(2);
    });
  });

  describe('removeMemory()', () => {
    it('should remove an existing memory', () => {
      const memory = { id: 'mem1', content: 'To be removed', tier: 'L1' };
      memorySearch.indexMemory('mem1', memory);
      memorySearch.removeMemory('mem1');
      const results = memorySearch.searchMemories('removed');
      expect(results.length).toBe(0);
    });

    it('should handle removing non-existent memory', () => {
      expect(() => memorySearch.removeMemory('nonexistent')).not.toThrow();
    });
  });

  describe('searchMemories()', () => {
    beforeEach(() => {
      memorySearch.indexMemory('mem1', {
        id: 'mem1',
        content: 'Working on the project',
        tier: 'L1',
        tags: ['work', 'project'],
        timestamp: Date.now()
      });
      memorySearch.indexMemory('mem2', {
        id: 'mem2',
        content: 'Learning TypeScript',
        tier: 'L2',
        tags: ['learning', 'coding'],
        timestamp: Date.now()
      });
      memorySearch.indexMemory('mem3', {
        id: 'mem3',
        content: 'Project deadline approaching',
        tier: 'L3',
        tags: ['work', 'deadline'],
        timestamp: Date.now()
      });
    });

    it('should find memories by content', () => {
      const results = memorySearch.searchMemories('project');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by tier', () => {
      const options: MemorySearchOptions = { tiers: ['L1'] };
      const results = memorySearch.searchMemories('Working', options);
      expect(results.every(r => r.metadata.tier === 'L1')).toBe(true);
    });

    it('should filter by multiple tiers', () => {
      const options: MemorySearchOptions = { tiers: ['L1', 'L2'] };
      const results = memorySearch.searchMemories('learning', options);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by tags', () => {
      const options: MemorySearchOptions = { tags: ['work'] };
      const results = memorySearch.searchMemories('project', options);
      expect(results.length).toBe(2);
    });

    it('should filter by dateRange', () => {
      const now = Date.now();
      const options: MemorySearchOptions = {
        dateRange: { start: now - 1000, end: now + 1000 }
      };
      const results = memorySearch.searchMemories('project', options);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should combine multiple filters', () => {
      const options: MemorySearchOptions = {
        tiers: ['L1', 'L2'],
        tags: ['work']
      };
      const results = memorySearch.searchMemories('project', options);
      expect(results.length).toBe(1);
    });

    it('should return empty for no matches', () => {
      const results = memorySearch.searchMemories('nonexistentquery123');
      expect(results).toEqual([]);
    });

    it('should limit results', () => {
      const options: MemorySearchOptions = { limit: 1 };
      const results = memorySearch.searchMemories('project', options);
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should respect threshold', () => {
      const options: MemorySearchOptions = { threshold: 0.9 };
      const results = memorySearch.searchMemories('project', options);
      results.forEach(r => expect(r.score).toBeGreaterThanOrEqual(0.9));
    });
  });

  describe('findRelated()', () => {
    beforeEach(() => {
      memorySearch.indexMemory('mem1', {
        id: 'mem1',
        content: 'Python programming language',
        tier: 'L1'
      });
      memorySearch.indexMemory('mem2', {
        id: 'mem2',
        content: 'JavaScript programming language',
        tier: 'L1'
      });
      memorySearch.indexMemory('mem3', {
        id: 'mem3',
        content: 'Cooking recipes',
        tier: 'L2'
      });
    });

    it('should find related memories', () => {
      const results = memorySearch.findRelated('mem1', 5);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should exclude the source memory', () => {
      const results = memorySearch.findRelated('mem1', 5);
      expect(results.some(r => r.id === 'mem1')).toBe(false);
    });

    it('should respect limit parameter', () => {
      const results = memorySearch.findRelated('mem1', 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should handle non-existent memory id', () => {
      const results = memorySearch.findRelated('nonexistent', 5);
      expect(results).toEqual([]);
    });
  });

  describe('getSearchHistory()', () => {
    it('should return empty array initially', () => {
      expect(memorySearch.getSearchHistory()).toEqual([]);
    });

    it('should record search history', () => {
      memorySearch.searchMemories('query1');
      memorySearch.searchMemories('query2');
      const history = memorySearch.getSearchHistory();
      expect(history.length).toBe(2);
    });

    it('should store query and results in history', () => {
      memorySearch.searchMemories('test query');
      const history = memorySearch.getSearchHistory();
      expect(history[0].query).toBe('test query');
      expect(history[0].results).toBeDefined();
    });

    it('should store timestamp in history', () => {
      memorySearch.searchMemories('timestamp test');
      const history = memorySearch.getSearchHistory();
      expect(history[0].timestamp).toBeDefined();
      expect(typeof history[0].timestamp).toBe('number');
    });
  });

  describe('clearHistory()', () => {
    it('should clear search history', () => {
      memorySearch.searchMemories('query1');
      memorySearch.searchMemories('query2');
      memorySearch.clearHistory();
      expect(memorySearch.getSearchHistory()).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle memory without tier', () => {
      memorySearch.indexMemory('mem1', { id: 'mem1', content: 'No tier' });
      const results = memorySearch.searchMemories('tier');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle memory without tags', () => {
      memorySearch.indexMemory('mem1', { id: 'mem1', content: 'No tags', tier: 'L1' });
      const results = memorySearch.searchMemories('tags');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle empty content memory', () => {
      memorySearch.indexMemory('mem1', { id: 'mem1', content: '', tier: 'L1' });
      const results = memorySearch.searchMemories('content');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('tier filtering', () => {
    beforeEach(() => {
      for (let i = 1; i <= 5; i++) {
        memorySearch.indexMemory(`mem${i}`, {
          id: `mem${i}`,
          content: `Tier ${i} content`,
          tier: `L${i}`,
          timestamp: Date.now()
        });
      }
    });

    it('should filter single tier', () => {
      const results = memorySearch.searchMemories('Tier', { tiers: ['L1'] });
      expect(results.length).toBe(1);
    });

    it('should filter multiple tiers', () => {
      const results = memorySearch.searchMemories('Tier', { tiers: ['L1', 'L2'] });
      expect(results.length).toBe(2);
    });

    it('should return empty for non-existent tier', () => {
      const results = memorySearch.searchMemories('Tier', { tiers: ['L99'] });
      expect(results.length).toBe(0);
    });
  });

  describe('tag filtering', () => {
    beforeEach(() => {
      memorySearch.indexMemory('mem1', { id: 'mem1', content: 'Tag test', tier: 'L1', tags: ['important', 'urgent'] });
      memorySearch.indexMemory('mem2', { id: 'mem2', content: 'Another tag test', tier: 'L1', tags: ['important'] });
      memorySearch.indexMemory('mem3', { id: 'mem3', content: 'No matching tags', tier: 'L1', tags: ['low'] });
    });

    it('should filter by single tag', () => {
      const results = memorySearch.searchMemories('tag', { tags: ['important'] });
      expect(results.length).toBe(2);
    });

    it('should filter by multiple tags (OR logic)', () => {
      const results = memorySearch.searchMemories('tag', { tags: ['urgent', 'low'] });
      expect(results.length).toBe(2);
    });
  });

  describe('dateRange filtering', () => {
    it('should filter by date range', () => {
      const now = Date.now();
      memorySearch.indexMemory('mem1', { id: 'mem1', content: 'Recent memory', tier: 'L1', timestamp: now });
      memorySearch.indexMemory('mem2', { id: 'mem2', content: 'Old memory', tier: 'L1', timestamp: now - 100000 });

      const results = memorySearch.searchMemories('memory', {
        dateRange: { start: now - 1000, end: now + 1000 }
      });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('mem1');
    });

    it('should return empty when no memories in range', () => {
      const now = Date.now();
      memorySearch.indexMemory('mem1', { id: 'mem1', content: 'Memory', tier: 'L1', timestamp: now - 1000000 });

      const results = memorySearch.searchMemories('memory', {
        dateRange: { start: now - 1000, end: now + 1000 }
      });
      expect(results.length).toBe(0);
    });
  });

  describe('search options combinations', () => {
    beforeEach(() => {
      const now = Date.now();
      memorySearch.indexMemory('mem1', {
        id: 'mem1',
        content: 'Important project work',
        tier: 'L1',
        tags: ['important', 'work'],
        timestamp: now
      });
      memorySearch.indexMemory('mem2', {
        id: 'mem2',
        content: 'Important personal task',
        tier: 'L2',
        tags: ['important', 'personal'],
        timestamp: now - 5000
      });
    });

    it('should combine tier and tag filters', () => {
      const results = memorySearch.searchMemories('Important', {
        tiers: ['L1'],
        tags: ['work']
      });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('mem1');
    });

    it('should combine all filters', () => {
      const now = Date.now();
      const results = memorySearch.searchMemories('Important', {
        tiers: ['L1', 'L2'],
        tags: ['important'],
        dateRange: { start: now - 10000, end: now + 10000 }
      });
      expect(results.length).toBe(2);
    });
  });

  describe('search result metadata', () => {
    it('should preserve memory metadata in results', () => {
      const memory = {
        id: 'mem1',
        content: 'Test content',
        tier: 'L1',
        tags: ['test'],
        timestamp: 123456,
        customField: 'customValue'
      };
      memorySearch.indexMemory('mem1', memory);
      const results = memorySearch.searchMemories('Test');
      expect(results[0].metadata.customField).toBe('customValue');
    });
  });
});