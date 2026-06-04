/**
 * V186: DreamMemoryStore - IndexedDB wrapper with atomic writes and auto-summary
 * 
 * Provides cross-session persistent memory using IndexedDB with:
 * - Atomic write transactions
 * - Automatic memory summarization for large memories
 * - Full L0-L4 layer support
 */

// ============================================================================
// Types
// ============================================================================

export type MemoryLayer = 'hot' | 'warm' | 'cold';

// L0-L4 Layer types
export type LayerLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export interface DreamMemory {
  id: string;
  content: string;
  summary: string | null;
  layer: MemoryLayer;
  accessCount: number;
  lastAccess: number | null;
  createdAt: number;
  embedding: Uint8Array | null;
  // L0-L4 metadata
  layerLevel?: LayerLevel;
  sessionId?: string;
  type?: 'semantic' | 'episodic' | 'procedural' | 'meta';
  importance?: number;
  keywords?: string[];
}

export interface CreateDreamMemoryInput {
  id: string;
  content: string;
  summary?: string | null;
  layer?: MemoryLayer;
  embedding?: Uint8Array | null;
  layerLevel?: LayerLevel;
  sessionId?: string;
  type?: 'semantic' | 'episodic' | 'procedural' | 'meta';
  importance?: number;
  keywords?: string[];
}

export interface UpdateDreamMemoryInput {
  content?: string;
  summary?: string | null;
  layer?: MemoryLayer;
  embedding?: Uint8Array | null;
  layerLevel?: LayerLevel;
  sessionId?: string;
  type?: 'semantic' | 'episodic' | 'procedural' | 'meta';
  importance?: number;
  keywords?: string[];
}

// Session memory for L1
export interface SessionMemory {
  sessionId: string;
  timestamp: number;
  content: string;
  emotionTag?: string;
  context: Record<string, unknown>;
}

// Semantic memory for L2
export interface SemanticMemory {
  id: string;
  content: string;
  keywords: string[];
  embedding: Uint8Array | null;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
}

// Procedural pattern for L3
export interface ProceduralPattern {
  patternId: string;
  context: string;
  actions: string[];
  successRate: number;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
}

// Meta strategy for L4
export interface MetaStrategy {
  metaId: string;
  strategyType: 'compression' | 'retention' | 'priority' | 'evolution';
  parameters: Record<string, unknown>;
  performance: number;
  updatedAt: number;
}

// Consolidation report
export interface ConsolidationReport {
  L0ToL1: number;
  L1ToL2: number;
  L2ToL3: number;
  L3ToL4: number;
  totalProcessed: number;
  tokensSaved: number;
  errors: string[];
}

// ============================================================================
// IndexedDB Constants
// ============================================================================

const DB_NAME = 'PixelPalDreamMemory';
const DB_VERSION = 1;

const STORES = {
  DREAM_MEMORIES: 'dream_memories',
  LAYER_L1_SESSIONS: 'layer_l1_sessions',
  LAYER_L2_SEMANTIC: 'layer_l2_semantic',
  LAYER_L3_PROCEDURAL: 'layer_l3_procedural',
  LAYER_L4_META: 'layer_l4_meta',
} as const;

// ============================================================================
// Simple Summarizer (inline to avoid circular deps)
// ============================================================================

function extractiveSummarize(text: string, targetSentences = 3): string {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  if (sentences.length <= targetSentences) return text;

  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = new Map<string, number>();
  for (const word of words) {
    if (word.length > 3) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  const scored = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    for (const word of sentenceWords) {
      score += wordFreq.get(word) || 0;
    }
    score += (sentences.length - index) * 0.5;
    return { sentence, score, index };
  });

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, targetSentences)
    .sort((a, b) => a.index - b.index);

  return top.map(t => t.sentence).join('. ') + '.';
}

function autoSummarize(content: string): string | null {
  if (content.length > 1000) {
    return extractiveSummarize(content, 3);
  }
  return null;
}

// ============================================================================
// DreamMemoryStore
// ============================================================================

export class DreamMemoryStore {
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Noop - lazy init
  }

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = this._initDB();
    await this.initPromise;
    this.isInitialized = true;
  }

  private async _initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.DREAM_MEMORIES)) {
          const dreamStore = db.createObjectStore(STORES.DREAM_MEMORIES, { keyPath: 'id' });
          dreamStore.createIndex('timestamp', 'createdAt', { unique: false });
          dreamStore.createIndex('type', 'type', { unique: false });
          dreamStore.createIndex('importance', 'importance', { unique: false });
          dreamStore.createIndex('sessionId', 'sessionId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.LAYER_L1_SESSIONS)) {
          db.createObjectStore(STORES.LAYER_L1_SESSIONS, { keyPath: 'sessionId' });
        }

        if (!db.objectStoreNames.contains(STORES.LAYER_L2_SEMANTIC)) {
          const semanticStore = db.createObjectStore(STORES.LAYER_L2_SEMANTIC, { keyPath: 'id', autoIncrement: true });
          semanticStore.createIndex('keywords', 'keywords', { unique: false, multiEntry: true });
        }

        if (!db.objectStoreNames.contains(STORES.LAYER_L3_PROCEDURAL)) {
          db.createObjectStore(STORES.LAYER_L3_PROCEDURAL, { keyPath: 'patternId' });
        }

        if (!db.objectStoreNames.contains(STORES.LAYER_L4_META)) {
          db.createObjectStore(STORES.LAYER_L4_META, { keyPath: 'metaId' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }
    return this.db;
  }

  // ===========================================================================
  // L0: Immediate (in-memory) operations
  // ===========================================================================

  private l0Store: Map<string, unknown> = new Map();

  setImmediate(key: string, value: unknown): void {
    this.l0Store.set(key, value);
  }

  getImmediate(key: string): unknown {
    return this.l0Store.get(key);
  }

  clearImmediate(key?: string): void {
    if (key) {
      this.l0Store.delete(key);
    } else {
      this.l0Store.clear();
    }
  }

  // ===========================================================================
  // L1: Episodic (Session) operations
  // ===========================================================================

  async saveSession(session: SessionMemory): Promise<void> {
    const db = await this.ensureDB();
    return this.atomicWrite(STORES.LAYER_L1_SESSIONS, session);
  }

  async getSession(sessionId: string): Promise<SessionMemory | null> {
    const db = await this.ensureDB();
    return this.getOne(STORES.LAYER_L1_SESSIONS, sessionId);
  }

  async getRecentSessions(limit: number = 10): Promise<SessionMemory[]> {
    const all = await this.getAll<SessionMemory>(STORES.LAYER_L1_SESSIONS);
    return all
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const db = await this.ensureDB();
    return this.deleteOne(STORES.LAYER_L1_SESSIONS, sessionId);
  }

  // ===========================================================================
  // L2: Semantic operations
  // ===========================================================================

  async addSemantic(semantic: Omit<SemanticMemory, 'id'>): Promise<string> {
    const db = await this.ensureDB();
    const id = await this.atomicWrite(STORES.LAYER_L2_SEMANTIC, semantic, true);
    return String(id);
  }

  async searchSemantic(query: string, limit: number = 10): Promise<SemanticMemory[]> {
    const all = await this.getAll<SemanticMemory>(STORES.LAYER_L2_SEMANTIC);
    
    const queryLower = query.toLowerCase();
    const scored = all.map(item => {
      const keywordMatch = item.keywords.some(k => queryLower.includes(k.toLowerCase()));
      const contentMatch = item.content.toLowerCase().includes(queryLower);
      const score = (keywordMatch ? 2 : 0) + (contentMatch ? 1 : 0);
      return { item, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.item);
  }

  async getSemanticById(id: string | number): Promise<SemanticMemory | null> {
    return this.getOne(STORES.LAYER_L2_SEMANTIC, id);
  }

  async updateSemantic(id: string | number, updates: Partial<SemanticMemory>): Promise<void> {
    const existing = await this.getOne<SemanticMemory>(STORES.LAYER_L2_SEMANTIC, id);
    if (existing) {
      await this.atomicWrite(STORES.LAYER_L2_SEMANTIC, { ...existing, ...updates });
    }
  }

  // ===========================================================================
  // L3: Procedural operations
  // ===========================================================================

  async storePattern(pattern: ProceduralPattern): Promise<void> {
    const db = await this.ensureDB();
    return this.atomicWrite(STORES.LAYER_L3_PROCEDURAL, pattern);
  }

  async getPatterns(context?: string): Promise<ProceduralPattern[]> {
    const all = await this.getAll<ProceduralPattern>(STORES.LAYER_L3_PROCEDURAL);
    
    if (!context) {
      return all;
    }

    const contextLower = context.toLowerCase();
    return all.filter(p => 
      p.context.toLowerCase().includes(contextLower) ||
      p.actions.some(a => a.toLowerCase().includes(contextLower))
    );
  }

  async getPatternById(patternId: string): Promise<ProceduralPattern | null> {
    return this.getOne(STORES.LAYER_L3_PROCEDURAL, patternId);
  }

  async updatePattern(patternId: string, updates: Partial<ProceduralPattern>): Promise<void> {
    const existing = await this.getOne<ProceduralPattern>(STORES.LAYER_L3_PROCEDURAL, patternId);
    if (existing) {
      await this.atomicWrite(STORES.LAYER_L3_PROCEDURAL, { ...existing, ...updates, updatedAt: Date.now() });
    }
  }

  // ===========================================================================
  // L4: Meta operations
  // ===========================================================================

  async updateMetaStrategy(strategy: MetaStrategy): Promise<void> {
    const db = await this.ensureDB();
    return this.atomicWrite(STORES.LAYER_L4_META, strategy);
  }

  async getMetaStrategy(strategyType?: string): Promise<MetaStrategy | MetaStrategy[] | null> {
    const all = await this.getAll<MetaStrategy>(STORES.LAYER_L4_META);
    
    if (!strategyType) {
      return all;
    }

    const found = all.find(s => s.strategyType === strategyType);
    return found || null;
  }

  async getAllMetaStrategies(): Promise<MetaStrategy[]> {
    return this.getAll<MetaStrategy>(STORES.LAYER_L4_META);
  }

  // ===========================================================================
  // Cross-layer operations
  // ===========================================================================

  async consolidate(): Promise<ConsolidationReport> {
    const report: ConsolidationReport = {
      L0ToL1: 0,
      L1ToL2: 0,
      L2ToL3: 0,
      L3ToL4: 0,
      totalProcessed: 0,
      tokensSaved: 0,
      errors: [],
    };

    try {
      if (this.l0Store.size > 0) {
        const l0Keys = Array.from(this.l0Store.keys());
        for (const key of l0Keys) {
          const value = this.l0Store.get(key);
          if (value && typeof value === 'object') {
            const session: SessionMemory = {
              sessionId: `l0-${key}-${Date.now()}`,
              timestamp: Date.now(),
              content: JSON.stringify(value),
              context: { origin: 'L0', key },
            };
            await this.saveSession(session);
            this.l0Store.delete(key);
            report.L0ToL1++;
            report.totalProcessed++;
          }
        }
      }

      const recentSessions = await this.getRecentSessions(20);
      for (const session of recentSessions) {
        const keywords = this.extractKeywords(session.content);
        await this.addSemantic({
          content: session.content,
          keywords,
          embedding: null,
          createdAt: session.timestamp,
          lastAccessed: session.timestamp,
          accessCount: 1,
        });
        report.L1ToL2++;
        report.totalProcessed++;
      }

      const semantics = await this.getAll<SemanticMemory>(STORES.LAYER_L2_SEMANTIC);
      for (const semantic of semantics.slice(0, 10)) {
        const pattern: ProceduralPattern = {
          patternId: `pattern-${semantic.id}`,
          context: semantic.keywords.join(' '),
          actions: [semantic.content.substring(0, 100)],
          successRate: 0.8,
          usageCount: semantic.accessCount,
          createdAt: semantic.createdAt,
          updatedAt: Date.now(),
        };
        await this.storePattern(pattern);
        report.L2ToL3++;
        report.totalProcessed++;
      }

      const patterns = await this.getAll<ProceduralPattern>(STORES.LAYER_L3_PROCEDURAL);
      const avgSuccess = patterns.length > 0 
        ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length 
        : 0.5;
      
      const metaStrategy: MetaStrategy = {
        metaId: 'meta-compression-1',
        strategyType: 'compression',
        parameters: { threshold: 0.7, priority: 'high' },
        performance: avgSuccess,
        updatedAt: Date.now(),
      };
      await this.updateMetaStrategy(metaStrategy);
      report.L3ToL4++;
      report.totalProcessed++;

    } catch (error) {
      report.errors.push(String(error));
    }

    return report;
  }

  async recall(query: RecallQuery): Promise<RecallResult> {
    const items: MemoryItem[] = [];
    const layers: LayerLevel[] = [];
    let confidence = 0;

    try {
      switch (query.type) {
        case 'semantic': {
          const semantics = await this.searchSemantic(query.query || '', query.limit || 10);
          for (const s of semantics) {
            items.push({
              id: String(s.id),
              content: s.content,
              layer: 'L2',
              timestamp: s.createdAt,
              metadata: { keywords: s.keywords, accessCount: s.accessCount },
            });
          }
          layers.push('L2');
          confidence = items.length > 0 ? 0.85 : 0;
          break;
        }
        case 'episodic': {
          const sessions = await this.getRecentSessions(query.limit || 10);
          for (const s of sessions) {
            items.push({
              id: s.sessionId,
              content: s.content,
              layer: 'L1',
              timestamp: s.timestamp,
              metadata: { emotionTag: s.emotionTag },
            });
          }
          layers.push('L1');
          confidence = items.length > 0 ? 0.75 : 0;
          break;
        }
        case 'procedural': {
          const patterns = await this.getPatterns(query.query);
          for (const p of patterns) {
            items.push({
              id: p.patternId,
              content: p.context,
              layer: 'L3',
              timestamp: p.updatedAt,
              metadata: { successRate: p.successRate, actions: p.actions },
            });
          }
          layers.push('L3');
          confidence = items.length > 0 ? 0.9 : 0;
          break;
        }
        case 'meta': {
          const strategies = await this.getAllMetaStrategies();
          for (const s of strategies) {
            items.push({
              id: s.metaId,
              content: JSON.stringify(s.parameters),
              layer: 'L4',
              timestamp: s.updatedAt,
              metadata: { strategyType: s.strategyType, performance: s.performance },
            });
          }
          layers.push('L4');
          confidence = items.length > 0 ? 0.95 : 0;
          break;
        }
      }
    } catch (error) {
      console.error('Recall error:', error);
    }

    return { items, confidence, layers };
  }

  async purge(olderThan: Date): Promise<number> {
    let deleted = 0;
    const cutoff = olderThan.getTime();

    try {
      const sessions = await this.getAll<SessionMemory>(STORES.LAYER_L1_SESSIONS);
      for (const session of sessions) {
        if (session.timestamp < cutoff) {
          await this.deleteSession(session.sessionId);
          deleted++;
        }
      }

      const semantics = await this.getAll<SemanticMemory>(STORES.LAYER_L2_SEMANTIC);
      for (const semantic of semantics) {
        if (semantic.createdAt < cutoff) {
          await this.deleteOne(STORES.LAYER_L2_SEMANTIC, semantic.id);
          deleted++;
        }
      }

      const patterns = await this.getAll<ProceduralPattern>(STORES.LAYER_L3_PROCEDURAL);
      for (const pattern of patterns) {
        if (pattern.createdAt < cutoff) {
          await this.deleteOne(STORES.LAYER_L3_PROCEDURAL, pattern.patternId);
          deleted++;
        }
      }
    } catch (error) {
      console.error('Purge error:', error);
    }

    return deleted;
  }

  // ===========================================================================
  // Dream Memory CRUD
  // ===========================================================================

  async create(input: CreateDreamMemoryInput): Promise<DreamMemory | null> {
    const db = await this.ensureDB();
    
    const memory: DreamMemory = {
      id: input.id,
      content: input.content,
      summary: input.summary ?? null,
      layer: input.layer ?? 'warm',
      accessCount: 0,
      lastAccess: null,
      createdAt: Date.now(),
      embedding: input.embedding ?? null,
      layerLevel: input.layerLevel,
      sessionId: input.sessionId,
      type: input.type,
      importance: input.importance ?? 0.5,
      keywords: input.keywords ?? [],
    };

    if (memory.content.length > 1000 && !memory.summary) {
      memory.summary = autoSummarize(memory.content);
    }

    try {
      await this.atomicWrite(STORES.DREAM_MEMORIES, memory);
      return memory;
    } catch (error) {
      console.error('Create memory error:', error);
      return null;
    }
  }

  async get(id: string): Promise<DreamMemory | null> {
    const db = await this.ensureDB();
    const memory = await this.getOne<DreamMemory>(STORES.DREAM_MEMORIES, id);
    
    if (memory) {
      memory.accessCount++;
      memory.lastAccess = Date.now();
      await this.atomicWrite(STORES.DREAM_MEMORIES, memory);
    }

    return memory;
  }

  async getReadOnly(id: string): Promise<DreamMemory | null> {
    return this.getOne<DreamMemory>(STORES.DREAM_MEMORIES, id);
  }

  async update(id: string, updates: UpdateDreamMemoryInput): Promise<DreamMemory | null> {
    const existing = await this.getReadOnly(id);
    if (!existing) return null;

    const updated: DreamMemory = {
      ...existing,
      content: updates.content ?? existing.content,
      summary: updates.summary !== undefined ? updates.summary : existing.summary,
      layer: updates.layer ?? existing.layer,
      embedding: updates.embedding !== undefined ? updates.embedding : existing.embedding,
      layerLevel: updates.layerLevel ?? existing.layerLevel,
      sessionId: updates.sessionId ?? existing.sessionId,
      type: updates.type ?? existing.type,
      importance: updates.importance ?? existing.importance,
      keywords: updates.keywords ?? existing.keywords,
    };

    if (updates.content && updates.content.length > 1000 && !updated.summary) {
      updated.summary = autoSummarize(updated.content);
    }

    await this.atomicWrite(STORES.DREAM_MEMORIES, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.deleteOne(STORES.DREAM_MEMORIES, id);
      return true;
    } catch {
      return false;
    }
  }

  async queryByLayer(layer: MemoryLayer): Promise<DreamMemory[]> {
    const all = await this.getAll<DreamMemory>(STORES.DREAM_MEMORIES);
    return all.filter(m => m.layer === layer);
  }

  async queryByLayers(layers: MemoryLayer[]): Promise<DreamMemory[]> {
    const all = await this.getAll<DreamMemory>(STORES.DREAM_MEMORIES);
    return all.filter(m => layers.includes(m.layer));
  }

  async getAll(): Promise<DreamMemory[]> {
    return this.getAll<DreamMemory>(STORES.DREAM_MEMORIES);
  }

  async count(): Promise<number> {
    const all = await this.getAll<DreamMemory>(STORES.DREAM_MEMORIES);
    return all.length;
  }

  async countByLayer(layer: MemoryLayer): Promise<number> {
    const all = await this.getAll<DreamMemory>(STORES.DREAM_MEMORIES);
    return all.filter(m => m.layer === layer).length;
  }

  async getTotalTokens(): Promise<number> {
    const memories = await this.getAll();
    return memories.reduce((sum, m) => sum + this.estimateTokens(m.content), 0);
  }

  async getRecentlyAccessed(limit: number = 20): Promise<DreamMemory[]> {
    const all = await this.getAll<DreamMemory>(STORES.DREAM_MEMORIES);
    return all
      .filter(m => m.lastAccess !== null)
      .sort((a, b) => (b.lastAccess || 0) - (a.lastAccess || 0))
      .slice(0, limit);
  }

  async getLeastRecentlyAccessed(limit: number = 50): Promise<DreamMemory[]> {
    const all = await this.getAll<DreamMemory>(STORES.DREAM_MEMORIES);
    return all
      .sort((a, b) => (a.lastAccess || a.createdAt) - (b.lastAccess || b.createdAt))
      .slice(0, limit);
  }

  async deleteMany(ids: string[]): Promise<number> {
    let deleted = 0;
    for (const id of ids) {
      const success = await this.delete(id);
      if (success) deleted++;
    }
    return deleted;
  }

  async updateLayerMany(ids: string[], layer: MemoryLayer): Promise<number> {
    let updated = 0;
    for (const id of ids) {
      const result = await this.update(id, { layer });
      if (result) updated++;
    }
    return updated;
  }

  // ===========================================================================
  // Helper methods
  // ===========================================================================

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return [...new Set(words.filter(w => w.length > 3 && !stopWords.has(w)))].slice(0, 20);
  }

  private async atomicWrite<T>(storeName: string, data: T, _autoIncrement = false): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getOne<T>(storeName: string, key: unknown): Promise<T | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result as T | null);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOne(storeName: string, key: unknown): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    const storeNames = Object.values(STORES);

    for (const storeName of storeNames) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    this.l0Store.clear();
  }
}

// ============================================================================
// Recall Types
// ============================================================================

export interface RecallQuery {
  type: 'semantic' | 'episodic' | 'procedural' | 'meta';
  query?: string;
  limit?: number;
  timeRange?: { start: Date; end: Date };
}

export interface RecallResult {
  items: MemoryItem[];
  confidence: number;
  layers: LayerLevel[];
}

export interface MemoryItem {
  id: string;
  content: string;
  layer: LayerLevel;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Singleton instance
// ============================================================================

let dreamMemoryStoreInstance: DreamMemoryStore | null = null;

export function getDreamMemoryStore(): DreamMemoryStore {
  if (!dreamMemoryStoreInstance) {
    dreamMemoryStoreInstance = new DreamMemoryStore();
  }
  return dreamMemoryStoreInstance;
}

export default DreamMemoryStore;