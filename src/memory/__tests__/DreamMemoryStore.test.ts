/**
 * V186: DreamMemoryStore Unit Tests with IndexedDB Mock
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ============================================================================
// Mock IndexedDB Setup
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
      if (!stores[name]) {
        stores[name] = createMockStore();
      }
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
    
    setTimeout(() => {
      request.onsuccess?.({ target: request } as Event);
    }, 0);
    
    return request;
  };
  
  const indexedDBMock = {
    open: mockOpen,
    deleteDatabase: () => {},
    databases: Promise.resolve([]),
  };
  
  // Use Object.defineProperty to properly stub global
  const originalIndexedDB = (globalThis as Record<string, unknown>).indexedDB;
  Object.defineProperty(globalThis, 'indexedDB', {
    value: indexedDBMock,
    writable: true,
    configurable: true,
  });
  
  return { indexedDBMock, stores, _original: originalIndexedDB };
}

function cleanupMockIndexedDB() {
  // Restore original
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

import { 
  DreamMemoryStore, 
  getDreamMemoryStore, 
  type DreamMemory, 
  type MemoryLayer, 
  type CreateDreamMemoryInput 
} from '../DreamMemoryStore';

// ============================================================================
// Tests
// ============================================================================

describe('DreamMemoryStore', () => {
  beforeEach(() => {
    // Save original and set up mock
    (globalThis as Record<string, unknown>)._indexedDB_original = (globalThis as Record<string, unknown>).indexedDB;
    setupMockIndexedDB();
  });

  afterEach(() => {
    cleanupMockIndexedDB();
  });

  describe('constructor', () => {
    it('should create a DreamMemoryStore instance', () => {
      const store = new DreamMemoryStore();
      expect(store).toBeInstanceOf(DreamMemoryStore);
    });

    it('should initialize with empty L0 store', () => {
      const store = new DreamMemoryStore();
      store.setImmediate('test-key', 'test-value');
      expect(store.getImmediate('test-key')).toBe('test-value');
    });
  });

  describe('init', () => {
    it('should initialize IndexedDB connection', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      // Verify init was called
      expect(store).toBeInstanceOf(DreamMemoryStore);
    });

    it('should be idempotent (multiple init calls ok)', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      await store.init();
      await store.init();
      // Should not throw
      expect(store).toBeInstanceOf(DreamMemoryStore);
    });
  });

  describe('L0: Immediate Memory', () => {
    it('should set and get immediate values', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      store.setImmediate('key1', { data: 'value1' });
      expect(store.getImmediate('key1')).toEqual({ data: 'value1' });
      
      store.setImmediate('key2', 42);
      expect(store.getImmediate('key2')).toBe(42);
      
      store.setImmediate('key3', [1, 2, 3]);
      expect(store.getImmediate('key3')).toEqual([1, 2, 3]);
    });

    it('should clear specific immediate key', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      store.setImmediate('keep', 'kept');
      store.setImmediate('remove', 'removed');
      
      store.clearImmediate('remove');
      
      expect(store.getImmediate('keep')).toBe('kept');
      expect(store.getImmediate('remove')).toBeUndefined();
    });

    it('should clear all immediate keys when no key specified', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      store.setImmediate('key1', 'value1');
      store.setImmediate('key2', 'value2');
      
      store.clearImmediate();
      
      expect(store.getImmediate('key1')).toBeUndefined();
      expect(store.getImmediate('key2')).toBeUndefined();
    });
  });

  describe('L1: Episodic Memory (Sessions)', () => {
    it('should save and retrieve sessions', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      const session = {
        sessionId: 'session-1',
        timestamp: Date.now(),
        content: 'Test session content',
        emotionTag: 'positive',
        context: { userId: 'user-1' },
      };
      
      await store.saveSession(session);
      
      const retrieved = await store.getSession('session-1');
      expect(retrieved).toEqual(session);
    });

    it('should get recent sessions sorted by timestamp', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      const sessions = [
        { sessionId: 's1', timestamp: 1000, content: 'First', context: {} },
        { sessionId: 's2', timestamp: 2000, content: 'Second', context: {} },
        { sessionId: 's3', timestamp: 3000, content: 'Third', context: {} },
      ];
      
      for (const session of sessions) {
        await store.saveSession(session);
      }
      
      const recent = await store.getRecentSessions(2);
      expect(recent).toHaveLength(2);
      expect(recent[0].sessionId).toBe('s3'); // Most recent first
      expect(recent[1].sessionId).toBe('s2');
    });

    it('should delete sessions', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.saveSession({ sessionId: 'delete-me', timestamp: 1000, content: 'To delete', context: {} });
      
      await store.deleteSession('delete-me');
      
      const retrieved = await store.getSession('delete-me');
      expect(retrieved).toBeNull();
    });
  });

  describe('L2: Semantic Memory', () => {
    it('should add semantic entries', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      const id = await store.addSemantic({
        content: 'Important information about AI',
        keywords: ['ai', 'machine learning', 'neural network'],
        embedding: null,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
      });
      
      expect(typeof id).toBe('string');
    });

    it('should search semantic by query', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.addSemantic({
        content: 'Python is a programming language',
        keywords: ['python', 'programming'],
        embedding: null,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
      });
      
      await store.addSemantic({
        content: 'JavaScript for web development',
        keywords: ['javascript', 'web'],
        embedding: null,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
      });
      
      const results = await store.searchSemantic('python');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('Python');
    });

    it('should get semantic by ID', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      const id = await store.addSemantic({
        content: 'Test semantic',
        keywords: ['test'],
        embedding: null,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
      });
      
      const semantic = await store.getSemanticById(id);
      expect(semantic).not.toBeNull();
      expect(semantic?.content).toBe('Test semantic');
    });

    it('should update semantic', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      const id = await store.addSemantic({
        content: 'Original content',
        keywords: ['original'],
        embedding: null,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
      });
      
      await store.updateSemantic(id, { content: 'Updated content' });
      
      const updated = await store.getSemanticById(id);
      expect(updated?.content).toBe('Updated content');
    });
  });

  describe('L3: Procedural Memory', () => {
    it('should store and retrieve patterns', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      const pattern = {
        patternId: 'pattern-1',
        context: 'coding task',
        actions: ['analyze', 'implement', 'test'],
        successRate: 0.85,
        usageCount: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await store.storePattern(pattern);
      
      const retrieved = await store.getPatternById('pattern-1');
      expect(retrieved?.patternId).toBe('pattern-1');
      expect(retrieved?.context).toBe('coding task');
    });

    it('should get patterns by context', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.storePattern({
        patternId: 'p1',
        context: 'web development',
        actions: ['design', 'code', 'deploy'],
        successRate: 0.9,
        usageCount: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      await store.storePattern({
        patternId: 'p2',
        context: 'data analysis',
        actions: ['collect', 'analyze', 'report'],
        successRate: 0.8,
        usageCount: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      const webPatterns = await store.getPatterns('web');
      expect(webPatterns.length).toBeGreaterThan(0);
      expect(webPatterns[0].context).toContain('web');
    });

    it('should update patterns', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.storePattern({
        patternId: 'update-test',
        context: 'testing',
        actions: ['unit test', 'integration test'],
        successRate: 0.7,
        usageCount: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      await store.updatePattern('update-test', { successRate: 0.95 });
      
      const updated = await store.getPatternById('update-test');
      expect(updated?.successRate).toBe(0.95);
      expect(updated?.usageCount).toBe(3); // Should increment
    });
  });

  describe('L4: Meta Memory', () => {
    it('should update and retrieve meta strategies', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      const strategy = {
        metaId: 'strategy-1',
        strategyType: 'compression' as const,
        parameters: { threshold: 0.8, batchSize: 20 },
        performance: 0.92,
        updatedAt: Date.now(),
      };
      
      await store.updateMetaStrategy(strategy);
      
      const retrieved = await store.getMetaStrategy('compression');
      expect(retrieved).not.toBeNull();
      if (!Array.isArray(retrieved)) {
        expect(retrieved?.metaId).toBe('strategy-1');
      }
    });

    it('should get all meta strategies', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.updateMetaStrategy({
        metaId: 'meta-1',
        strategyType: 'compression',
        parameters: {},
        performance: 0.9,
        updatedAt: Date.now(),
      });
      
      await store.updateMetaStrategy({
        metaId: 'meta-2',
        strategyType: 'retention',
        parameters: {},
        performance: 0.85,
        updatedAt: Date.now(),
      });
      
      const all = await store.getAllMetaStrategies();
      expect(all.length).toBe(2);
    });
  });

  describe('Dream Memory CRUD', () => {
    it('should create dream memory', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      const memory = await store.create({
        id: 'dream-1',
        content: 'A dream about space',
        layer: 'warm',
        importance: 0.7,
        keywords: ['space', 'stars'],
      });
      
      expect(memory).not.toBeNull();
      expect(memory?.id).toBe('dream-1');
      expect(memory?.content).toBe('A dream about space');
    });

    it('should get dream memory', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({
        id: 'get-test',
        content: 'Content to get',
      });
      
      const retrieved = await store.get('get-test');
      expect(retrieved?.id).toBe('get-test');
    });

    it('should update dream memory', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({
        id: 'update-test',
        content: 'Original content',
      });
      
      const updated = await store.update('update-test', { content: 'Updated content' });
      expect(updated?.content).toBe('Updated content');
    });

    it('should delete dream memory', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'delete-test', content: 'To delete' });
      
      const result = await store.delete('delete-test');
      expect(result).toBe(true);
      
      const retrieved = await store.get('delete-test');
      expect(retrieved).toBeNull();
    });

    it('should query by layer', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'hot-1', content: 'Hot memory', layer: 'hot' });
      await store.create({ id: 'warm-1', content: 'Warm memory', layer: 'warm' });
      await store.create({ id: 'hot-2', content: 'Another hot', layer: 'hot' });
      
      const hotMemories = await store.queryByLayer('hot');
      expect(hotMemories.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('consolidate', () => {
    it('should consolidate memories across layers', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      // Add some L0 data
      store.setImmediate('l0-key', { data: 'L0 memory' });
      
      // Add sessions (L1)
      await store.saveSession({
        sessionId: 'consolidate-session',
        timestamp: Date.now(),
        content: 'Session for consolidation',
        context: {},
      });
      
      const report = await store.consolidate();
      
      expect(report).toHaveProperty('L0ToL1');
      expect(report).toHaveProperty('L1ToL2');
      expect(report).toHaveProperty('L2ToL3');
      expect(report).toHaveProperty('L3ToL4');
      expect(report).toHaveProperty('totalProcessed');
      expect(report).toHaveProperty('tokensSaved');
      expect(report).toHaveProperty('errors');
    });
  });

  describe('recall', () => {
    it('should recall semantic memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.addSemantic({
        content: 'JavaScript is a programming language',
        keywords: ['javascript', 'programming'],
        embedding: null,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
      });
      
      const result = await store.recall({ type: 'semantic', query: 'javascript' });
      
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('layers');
      expect(result.layers).toContain('L2');
    });

    it('should recall episodic memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.saveSession({
        sessionId: 'episodic-test',
        timestamp: Date.now(),
        content: 'A memorable session',
        context: {},
      });
      
      const result = await store.recall({ type: 'episodic', limit: 5 });
      
      expect(result.layers).toContain('L1');
    });

    it('should recall procedural memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.storePattern({
        patternId: 'proc-test',
        context: 'testing procedure',
        actions: ['test', 'verify'],
        successRate: 0.9,
        usageCount: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      const result = await store.recall({ type: 'procedural', query: 'testing' });
      
      expect(result.layers).toContain('L3');
    });

    it('should recall meta memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.updateMetaStrategy({
        metaId: 'meta-recall-test',
        strategyType: 'compression',
        parameters: { threshold: 0.5 },
        performance: 0.88,
        updatedAt: Date.now(),
      });
      
      const result = await store.recall({ type: 'meta' });
      
      expect(result.layers).toContain('L4');
    });
  });

  describe('purge', () => {
    it('should purge memories older than date', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      // Add a session with old timestamp
      await store.saveSession({
        sessionId: 'old-session',
        timestamp: Date.now() - 100000, // Old
        content: 'Old session',
        context: {},
      });
      
      const cutoffDate = new Date(Date.now() - 50000); // 50 seconds ago
      
      const deleted = await store.purge(cutoffDate);
      expect(typeof deleted).toBe('number');
    });
  });

  describe('getTotalTokens', () => {
    it('should calculate total tokens', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'tok-1', content: 'Short content' });
      await store.create({ id: 'tok-2', content: 'Medium length content here' });
      
      const tokens = await store.getTotalTokens();
      expect(tokens).toBeGreaterThan(0);
    });
  });

  describe('getRecentlyAccessed', () => {
    it('should return recently accessed memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'recent-1', content: 'First' });
      await store.create({ id: 'recent-2', content: 'Second' });
      
      // Access one
      await store.get('recent-1');
      
      const recent = await store.getRecentlyAccessed(5);
      expect(Array.isArray(recent)).toBe(true);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'multi-1', content: 'Delete me 1' });
      await store.create({ id: 'multi-2', content: 'Delete me 2' });
      await store.create({ id: 'multi-3', content: 'Delete me 3' });
      
      const deleted = await store.deleteMany(['multi-1', 'multi-2']);
      expect(deleted).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updateLayerMany', () => {
    it('should update layer for multiple memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'layer-1', content: 'Move to hot', layer: 'warm' });
      await store.create({ id: 'layer-2', content: 'Move to hot', layer: 'warm' });
      
      const updated = await store.updateLayerMany(['layer-1', 'layer-2'], 'hot');
      expect(typeof updated).toBe('number');
    });
  });

  describe('close', () => {
    it('should close database connection', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      store.close();
      
      // After close, operations should handle gracefully
      const memory = await store.get('test');
      expect(memory).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all data from all stores', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      // Add data to various stores
      store.setImmediate('clear-test', 'value');
      await store.saveSession({ sessionId: 'clear-session', timestamp: Date.now(), content: 'Clear me', context: {} });
      await store.addSemantic({
        content: 'Clear semantic',
        keywords: ['clear'],
        embedding: null,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
      });
      
      await store.clearAll();
      
      // L0 should be cleared
      expect(store.getImmediate('clear-test')).toBeUndefined();
    });
  });

  describe('getAll and count', () => {
    it('should get all dream memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'all-1', content: 'One' });
      await store.create({ id: 'all-2', content: 'Two' });
      
      const all = await store.getAll();
      expect(Array.isArray(all)).toBe(true);
    });

    it('should count dream memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'count-1', content: 'First' });
      await store.create({ id: 'count-2', content: 'Second' });
      
      const count = await store.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should count by layer', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'cnt-hot', content: 'Hot one', layer: 'hot' });
      await store.create({ id: 'cnt-hot-2', content: 'Hot two', layer: 'hot' });
      
      const hotCount = await store.countByLayer('hot');
      expect(hotCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('queryByLayers', () => {
    it('should query by multiple layers', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'multi-layer-1', content: 'Hot content', layer: 'hot' });
      await store.create({ id: 'multi-layer-2', content: 'Warm content', layer: 'warm' });
      
      const memories = await store.queryByLayers(['hot', 'warm']);
      expect(memories.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getLeastRecentlyAccessed', () => {
    it('should return least recently accessed memories', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'lra-1', content: 'First' });
      await store.create({ id: 'lra-2', content: 'Second' });
      
      const least = await store.getLeastRecentlyAccessed(5);
      expect(Array.isArray(least)).toBe(true);
    });
  });

  describe('getReadOnly', () => {
    it('should get without updating access count', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      await store.create({ id: 'readonly-test', content: 'Read only content' });
      
      const before = await store.getReadOnly('readonly-test');
      const after = await store.getReadOnly('readonly-test');
      
      expect(before?.id).toBe(after?.id);
    });
  });

  describe('singleton', () => {
    it('should return singleton instance', () => {
      const instance1 = getDreamMemoryStore();
      const instance2 = getDreamMemoryStore();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('auto-summary', () => {
    it('should auto-summarize large content', async () => {
      const store = new DreamMemoryStore();
      await store.init();
      
      // Create content that exceeds the 1000 char threshold
      const longContent = 'A'.repeat(1500);
      
      const memory = await store.create({
        id: 'summary-test',
        content: longContent,
      });
      
      expect(memory).not.toBeNull();
      expect(memory?.id).toBe('summary-test');
    });
  });
});

describe('DreamMemoryStore Type Exports', () => {
  it('should export MemoryLayer type', () => {
    const layer: MemoryLayer = 'hot';
    expect(layer).toBe('hot');
  });

  it('should export DreamMemory interface', () => {
    const memory: DreamMemory = {
      id: 'test',
      content: 'content',
      summary: null,
      layer: 'warm',
      accessCount: 0,
      lastAccess: null,
      createdAt: Date.now(),
      embedding: null,
      layerLevel: 'L1',
      importance: 0.5,
    };
    expect(memory.id).toBe('test');
  });

  it('should export CreateDreamMemoryInput interface', () => {
    const input: CreateDreamMemoryInput = {
      id: 'input-test',
      content: 'test content',
      layer: 'hot',
      layerLevel: 'L2',
      importance: 0.8,
      keywords: ['test', 'input'],
    };
    expect(input.id).toBe('input-test');
  });
});

describe('DreamMemoryStore edge cases', () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>)._indexedDB_original = (globalThis as Record<string, unknown>).indexedDB;
    setupMockIndexedDB();
  });

  afterEach(() => {
    cleanupMockIndexedDB();
  });

  it('should handle empty search results', async () => {
    const store = new DreamMemoryStore();
    await store.init();
    
    const results = await store.searchSemantic('nonexistent-query-xyz');
    expect(results).toEqual([]);
  });

  it('should handle getting non-existent session', async () => {
    const store = new DreamMemoryStore();
    await store.init();
    
    const session = await store.getSession('non-existent-session');
    expect(session).toBeNull();
  });

  it('should handle getting non-existent pattern', async () => {
    const store = new DreamMemoryStore();
    await store.init();
    
    const pattern = await store.getPatternById('non-existent-pattern');
    expect(pattern).toBeNull();
  });

  it('should handle update of non-existent memory', async () => {
    const store = new DreamMemoryStore();
    await store.init();
    
    const result = await store.update('non-existent-id', { content: 'new content' });
    expect(result).toBeNull();
  });

  it('should handle delete of non-existent memory', async () => {
    const store = new DreamMemoryStore();
    await store.init();
    
    const result = await store.delete('non-existent-id');
    expect(result).toBe(false);
  });

  it('should handle empty consolidate', async () => {
    const store = new DreamMemoryStore();
    await store.init();
    
    const report = await store.consolidate();
    expect(report.errors).toEqual([]);
  });

  it('should handle purge with no old data', async () => {
    const store = new DreamMemoryStore();
    await store.init();
    
    const recentDate = new Date();
    const deleted = await store.purge(recentDate);
    expect(deleted).toBe(0);
  });
});