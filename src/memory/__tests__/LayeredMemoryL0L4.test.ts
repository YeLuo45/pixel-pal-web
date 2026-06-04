/**
 * V186: LayeredMemoryL0L4 Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ============================================================================
// Mock IndexedDB Setup (same pattern as DreamMemoryStore tests)
// ============================================================================

function createMockStore() {
  const data = new Map<unknown, unknown>();
  return {
    add: (value: unknown) => {
      const key = (value as Record<string, unknown>).id ?? Date.now();
      data.set(key, value);
      return { result: Promise.resolve(key), onsuccess: null, onerror: null };
    },
    put: (value: unknown) => {
      const key = (value as Record<string, unknown>).id ?? Date.now();
      data.set(key, value);
      return { result: Promise.resolve(key), onsuccess: null, onerror: null };
    },
    get: (key: unknown) => ({
      result: Promise.resolve(data.get(key) ?? null),
      onsuccess: null,
      onerror: null,
    }),
    getAll: () => ({
      result: Promise.resolve(Array.from(data.values())),
      onsuccess: null,
      onerror: null,
    }),
    delete: (key: unknown) => {
      data.delete(key);
      return { result: Promise.resolve(undefined), onsuccess: null, onerror: null };
    },
    clear: () => {
      data.clear();
      return { result: Promise.resolve(undefined), onsuccess: null, onerror: null };
    },
  };
}

function setupMockIndexedDB() {
  const stores: Record<string, ReturnType<typeof createMockStore>> = {};
  const mockTx = {
    objectStore: (name: string) => {
      if (!stores[name]) stores[name] = createMockStore();
      return stores[name];
    },
    oncomplete: null,
    onerror: null,
    onabort: null,
  };
  const mockDB = {
    transaction: () => mockTx,
    objectStoreNames: { contains: (name: string) => !!stores[name] },
    close: () => {},
  };
  const mockOpen = () => {
    const request = {
      result: mockDB as unknown as IDBDatabase,
      error: null as Error | null,
      onsuccess: null as ((e: Event) => void) | null,
      onerror: null as ((e: Event) => void) | null,
      onupgradeneeded: null as ((e: Event) => void) | null,
    };
    setTimeout(() => request.onsuccess?.({ target: request } as Event), 0);
    return request;
  };
  const indexedDBMock = { open: mockOpen, deleteDatabase: () => {}, databases: Promise.resolve([]) };
  const originalIndexedDB = (globalThis as Record<string, unknown>).indexedDB;
  Object.defineProperty(globalThis, 'indexedDB', { value: indexedDBMock, writable: true, configurable: true });
  return { indexedDBMock, stores, _original: originalIndexedDB };
}

function cleanupMockIndexedDB() {
  if ((globalThis as Record<string, unknown>)._indexedDB_original) {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: (globalThis as Record<string, unknown>)._indexedDB_original,
      writable: true,
      configurable: true,
    });
  }
}

// ============================================================================
// Imports
// ============================================================================

import { LayeredMemoryL0L4, type LayerConfig } from '../LayeredMemoryL0L4';
import { getDreamMemoryStore } from '../DreamMemoryStore';

// ============================================================================
// Tests
// ============================================================================

describe('LayeredMemoryL0L4', () => {
  let memory: LayeredMemoryL0L4;

  beforeEach(() => {
    (globalThis as Record<string, unknown>)._indexedDB_original = (globalThis as Record<string, unknown>).indexedDB;
    setupMockIndexedDB();
    // Reset singleton
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanupMockIndexedDB();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      memory = new LayeredMemoryL0L4();
      expect(memory).toBeDefined();
    });

    it('should create instance with custom config', () => {
      const customConfig: Partial<LayerConfig> = {
        L0MaxSize: 50,
        L1MaxSessions: 10,
      };
      memory = new LayeredMemoryL0L4(customConfig);
      expect(memory).toBeDefined();
    });
  });

  describe('start/stop', () => {
    it('should start without errors', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      expect(true).toBe(true);
    });

    it('should stop without errors', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      memory.stop();
      expect(true).toBe(true);
    });

    it('should not double-start', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      await memory.start(); // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('L0 immediate memory', () => {
    it('should set and get immediate memory', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      memory.storeImmediate('key1', { data: 'test' });
      const value = memory.recallImmediate('key1');
      expect(value).toEqual({ data: 'test' });
      memory.stop();
    });

    it('should return undefined for non-existent key', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const value = memory.recallImmediate('non-existent');
      expect(value).toBeUndefined();
      memory.stop();
    });

    it('should overwrite existing key', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      memory.storeImmediate('key1', { data: 'original' });
      memory.storeImmediate('key1', { data: 'updated' });
      const value = memory.recallImmediate('key1');
      expect(value).toEqual({ data: 'updated' });
      memory.stop();
    });
  });

  describe('L1 episodic memory', () => {
    it('should save and retrieve recent sessions', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const session = {
        sessionId: 'session-1',
        timestamp: Date.now(),
        content: 'Test conversation',
        emotionTag: 'neutral',
        context: { channel: 'test' },
      };
      await memory.storeEpisode(session);
      const sessions = await memory.recallEpisodes(10);
      expect(sessions.length).toBeGreaterThan(0);
      memory.stop();
    });

    it('should limit recent sessions', async () => {
      memory = new LayeredMemoryL0L4({ L1MaxSessions: 3 });
      await memory.start();
      for (let i = 0; i < 5; i++) {
        await memory.storeEpisode({
          sessionId: `session-${i}`,
          timestamp: Date.now() - i * 1000,
          content: `Session ${i}`,
          context: {},
        });
      }
      const sessions = await memory.recallEpisodes(10);
      expect(sessions.length).toBeLessThanOrEqual(3);
      memory.stop();
    });
  });

  describe('L2 semantic memory', () => {
    it('should add and search semantic memories', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const id = await memory.addSemantic('JavaScript is a programming language', ['javascript', 'programming']);
      expect(id).toBeDefined();
      const results = await memory.searchSemantic('JavaScript', 10);
      expect(results.length).toBeGreaterThan(0);
      memory.stop();
    });

    it('should return empty for no match', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const results = await memory.searchSemantic('xyznone', 10);
      expect(results).toEqual([]);
      memory.stop();
    });
  });

  describe('L3 procedural memory', () => {
    it('should store and retrieve patterns', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const pattern = {
        patternId: 'pattern-1',
        context: 'code-review',
        actions: ['review', 'approve'],
        successRate: 0.85,
        usageCount: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await memory.storePattern(pattern);
      const patterns = await memory.getProcedures('code-review');
      expect(patterns.length).toBeGreaterThan(0);
      memory.stop();
    });
  });

  describe('L4 meta memory', () => {
    it('should update and get meta strategy', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const strategy = {
        metaId: 'meta-1',
        strategyType: 'compression' as const,
        parameters: { ratio: 0.5 },
        performance: 0.9,
        updatedAt: Date.now(),
      };
      await memory.updateMetaStrategy(strategy);
      const retrieved = await memory.getMetaStrategies();
      expect(retrieved).toBeDefined();
      memory.stop();
    });
  });

  describe('consolidate', () => {
    it('should run consolidation', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const report = await memory.consolidate();
      expect(report).toHaveProperty('totalProcessed');
      expect(report).toHaveProperty('L0ToL1');
      expect(report).toHaveProperty('L1ToL2');
      expect(report).toHaveProperty('L2ToL3');
      expect(report).toHaveProperty('L3ToL4');
      expect(report).toHaveProperty('tokensSaved');
      expect(report).toHaveProperty('errors');
      memory.stop();
    });
  });

  describe('recall', () => {
    it('should recall with semantic query', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const result = await memory.recall({ type: 'semantic', query: 'test', limit: 10 });
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('layers');
      expect(Array.isArray(result.layers)).toBe(true);
      memory.stop();
    });

    it('should recall with episodic type', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const result = await memory.recall({ type: 'episodic', limit: 5 });
      expect(result.items).toBeDefined();
      expect(result.layers).toContain('L1');
      memory.stop();
    });

    it('should enforce limit', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const result = await memory.recall({ type: 'semantic', query: 'test', limit: 3 });
      expect(result.items.length).toBeLessThanOrEqual(3);
      memory.stop();
    });
  });

  describe('purge', () => {
    it('should purge old memories', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const deleted = await memory.purge(oldDate);
      expect(typeof deleted).toBe('number');
      memory.stop();
    });
  });

  describe('getAllStats', () => {
    it('should return layer statistics', async () => {
      memory = new LayeredMemoryL0L4();
      await memory.start();
      const stats = await memory.getAllStats();
      expect(stats).toHaveProperty('L0');
      expect(stats).toHaveProperty('L1');
      expect(stats).toHaveProperty('L2');
      expect(stats).toHaveProperty('L3');
      expect(stats).toHaveProperty('L4');
      expect(stats.L0).toHaveProperty('size');
      expect(stats.L0).toHaveProperty('maxSize');
      expect(stats.L0).toHaveProperty('utilization');
      memory.stop();
    });
  });
});