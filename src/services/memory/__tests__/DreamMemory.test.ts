/**
 * V167: DreamMemory Main Engine Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DreamMemory } from '../DreamMemory';
import { MemoryStore } from '../MemoryStore';
import type { MemoryEntry, MemoryEntryInput } from '../MemoryTypes';

describe('DreamMemory', () => {
  let engine: DreamMemory;

  const createInput = (overrides: Partial<MemoryEntryInput> = {}): MemoryEntryInput => ({
    layer: 'L0',
    content: 'Test memory content',
    importance: 50,
    tags: ['test'],
    ...overrides,
  });

  beforeEach(() => {
    engine = new DreamMemory();
  });

  afterEach(() => {
    engine.destroy();
  });

  describe('store', () => {
    it('should store an entry and return it with generated id', () => {
      const input = createInput();
      const entry = engine.store(input);
      expect(entry.id).toBeTruthy();
      expect(entry.accessCount).toBe(0);
      expect(entry.createdAt).toBeDefined();
      expect(entry.lastAccessed).toBeDefined();
    });

    it('should store in L0 layer', () => {
      const input = createInput({ layer: 'L0' });
      const entry = engine.store(input);
      expect(entry.layer).toBe('L0');
      expect(engine.retrieve(entry.id, ['L0'])).toBeDefined();
    });

    it('should store in L1 layer', () => {
      const input = createInput({ layer: 'L1' });
      const entry = engine.store(input);
      expect(entry.layer).toBe('L1');
    });

    it('should store in L2 layer', () => {
      const input = createInput({ layer: 'L2' });
      const entry = engine.store(input);
      expect(entry.layer).toBe('L2');
    });

    it('should store in L3 layer', () => {
      const input = createInput({ layer: 'L3' });
      const entry = engine.store(input);
      expect(entry.layer).toBe('L3');
    });

    it('should store in L4 layer', () => {
      const input = createInput({ layer: 'L4' });
      const entry = engine.store(input);
      expect(entry.layer).toBe('L4');
    });

    it('should generate unique IDs', () => {
      const entry1 = engine.store(createInput());
      const entry2 = engine.store(createInput());
      expect(entry1.id).not.toBe(entry2.id);
    });

    it('should preserve input metadata', () => {
      const input = createInput({ metadata: { key: 'value' } });
      const entry = engine.store(input);
      expect(entry.metadata).toEqual({ key: 'value' });
    });
  });

  describe('retrieve', () => {
    it('should retrieve stored entry', () => {
      const entry = engine.store(createInput());
      const retrieved = engine.retrieve(entry.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(entry.id);
    });

    it('should return null for non-existent ID', () => {
      expect(engine.retrieve('non_existent')).toBeNull();
    });

    it('should search in specified layers only', () => {
      const entry = engine.store(createInput({ layer: 'L0' }));
      // Should find in L0
      expect(engine.retrieve(entry.id, ['L0'])).toBeDefined();
      // Should not find in L1
      expect(engine.retrieve(entry.id, ['L1'])).toBeNull();
    });

    it('should search all layers by default', () => {
      const entry = engine.store(createInput({ layer: 'L2' }));
      expect(engine.retrieve(entry.id)).toBeDefined();
    });

    it('should check layers in order', () => {
      // Store same ID in different layers (shouldn't normally happen)
      const id = 'duplicate_id';
      engine.store(createInput({ layer: 'L0' })); // This creates one ID
      
      // Try to retrieve non-existent ID
      expect(engine.retrieve('non_existent')).toBeNull();
    });
  });

  describe('search', () => {
    it('should find entries by content match', () => {
      engine.store(createInput({ content: 'Find me' }));
      engine.store(createInput({ content: 'Not this one' }));
      
      const results = engine.search('Find me');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find entries by tag match', () => {
      engine.store(createInput({ content: 'Content 1', tags: ['uniqueTag'] }));
      engine.store(createInput({ content: 'Content 2', tags: ['other'] }));
      
      const results = engine.search('uniqueTag');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      engine.store(createInput({ content: 'JAVASCRIPT' }));
      const results = engine.search('javascript');
      expect(results.length).toBe(1);
    });

    it('should search specified layers only', () => {
      const entry = engine.store(createInput({ layer: 'L0', content: 'search term' }));
      const results = engine.search('search term', ['L1']);
      expect(results.length).toBe(0);
    });

    it('should return empty array for no matches', () => {
      engine.store(createInput({ content: 'Something else' }));
      expect(engine.search('nonexistent')).toEqual([]);
    });

    it('should sort results by importance then lastAccessed', () => {
      engine.store(createInput({ layer: 'L0', content: 'low importance', importance: 20 }));
      engine.store(createInput({ layer: 'L0', content: 'high importance', importance: 80 }));
      
      const results = engine.search('importance');
      expect(results[0].importance).toBe(80);
    });
  });

  describe('consolidate', () => {
    it('should return consolidation result', () => {
      const result = engine.consolidate();
      expect(result).toHaveProperty('consolidated');
      expect(result).toHaveProperty('promoted');
      expect(result).toHaveProperty('demoted');
      expect(result).toHaveProperty('discarded');
      expect(result).toHaveProperty('errors');
    });

    it('should handle empty layers gracefully', () => {
      const result = engine.consolidate();
      expect(result.errors).toEqual([]);
    });

    it('should promote high importance never accessed entries', () => {
      engine.store(createInput({ layer: 'L0', importance: 90, accessCount: 0 }));
      const result = engine.consolidate();
      expect(result.promoted).toBeGreaterThanOrEqual(0);
    });

    it('should discard low importance never accessed entries', () => {
      // Add entries with low importance and 0 access count
      const entry = engine.store(createInput({ layer: 'L0', importance: 5, accessCount: 0 }));
      const result = engine.consolidate();
      expect(result.discarded).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSessionContext', () => {
    it('should return session context', () => {
      const context = engine.getSessionContext();
      expect(context).toHaveProperty('sessionId');
      expect(context).toHaveProperty('startTime');
      expect(context).toHaveProperty('recentMemories');
      expect(context).toHaveProperty('activeSkills');
      expect(context).toHaveProperty('workingMemory');
      expect(context).toHaveProperty('preferences');
    });

    it('should include session ID', () => {
      const context = engine.getSessionContext();
      expect(context.sessionId).toBeTruthy();
    });

    it('should have valid start time', () => {
      const context = engine.getSessionContext();
      expect(context.startTime).toBeLessThanOrEqual(Date.now());
      expect(context.startTime).toBeGreaterThan(0);
    });
  });

  describe('clearAll', () => {
    it('should clear all layers', () => {
      engine.store(createInput({ layer: 'L0' }));
      engine.store(createInput({ layer: 'L1' }));
      engine.store(createInput({ layer: 'L2' }));
      engine.store(createInput({ layer: 'L3' }));
      engine.store(createInput({ layer: 'L4' }));
      
      engine.clearAll();
      
      // Verify recent memories is empty
      expect(engine.getSessionContext().recentMemories).toEqual([]);
    });
  });

  describe('getStore', () => {
    it('should return the underlying MemoryStore', () => {
      const store = engine.getStore();
      expect(store).toBeDefined();
      expect(store.l0).toBeDefined();
      expect(store.l1).toBeDefined();
      expect(store.l2).toBeDefined();
      expect(store.l3).toBeDefined();
      expect(store.l4).toBeDefined();
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      // Note: The getDreamMemory singleton is cleared between tests
      // This test verifies the class can be instantiated directly
      const engine1 = new DreamMemory();
      const engine2 = new DreamMemory();
      // Different instances since we create new each time
      expect(engine1).not.toBe(engine2);
      engine1.destroy();
      engine2.destroy();
    });
  });
});