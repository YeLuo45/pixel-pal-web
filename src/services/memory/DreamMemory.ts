/**
 * V167: DreamMemory - Main Engine
 * 
 * The main engine for the Dream Memory system providing:
 * - store(entry): Store in appropriate layer
 * - retrieve(id, layers?): Retrieve from specified layers
 * - search(query, layers?): Search across layers
 * - consolidate(): Consolidate memories (for idle/sleep)
 * - getSessionContext(): Get context for new session
 */

import type { MemoryEntry, MemoryEntryInput, Layer, ConsolidationResult, SessionContext } from './MemoryTypes';
import { MemoryStore } from './MemoryStore';

const DEFAULT_LAYERS: Layer[] = ['L0', 'L1', 'L2', 'L3', 'L4'];
const LAYER_ORDER: Layer[] = ['L4', 'L1', 'L0', 'L2', 'L3'];

export class DreamMemory {
  private memoryStore: MemoryStore;
  private idCounter: number = 0;

  constructor() {
    this.memoryStore = new MemoryStore();
  }

  /**
   * Generate a unique ID for a memory entry
   */
  private generateId(): string {
    this.idCounter++;
    return `mem_${Date.now()}_${this.idCounter}_${crypto.randomUUID().slice(0, 8)}`;
  }

  /**
   * Store a memory entry in the appropriate layer
   */
  store(input: MemoryEntryInput): MemoryEntry {
    const now = Date.now();
    const entry: MemoryEntry = {
      ...input,
      id: this.generateId(),
      accessCount: 0,
      lastAccessed: now,
      createdAt: now,
    };

    switch (entry.layer) {
      case 'L0':
        this.memoryStore.l0.add(entry);
        break;
      case 'L1':
        this.memoryStore.l1.add(entry);
        break;
      case 'L2':
        this.memoryStore.l2.add(entry);
        break;
      case 'L3':
        this.memoryStore.l3.add(entry);
        break;
      case 'L4':
        this.memoryStore.l4.add(entry);
        break;
    }

    return entry;
  }

  /**
   * Retrieve a memory by ID from specified layers
   */
  retrieve(id: string, layers?: Layer[]): MemoryEntry | null {
    const searchLayers = layers || DEFAULT_LAYERS;
    
    for (const layer of searchLayers) {
      let entry: MemoryEntry | null = null;
      
      switch (layer) {
        case 'L0':
          entry = this.memoryStore.l0.get(id);
          break;
        case 'L1':
          entry = this.memoryStore.l1.get(id);
          break;
        case 'L2':
          entry = this.memoryStore.l2.get(id);
          break;
        case 'L3':
          entry = this.memoryStore.l3.get(id);
          break;
        case 'L4':
          entry = this.memoryStore.l4.get(id);
          break;
      }
      
      if (entry) {
        return entry;
      }
    }
    
    return null;
  }

  /**
   * Search memories across specified layers
   */
  search(query: string, layers?: Layer[]): MemoryEntry[] {
    const searchLayers = layers || DEFAULT_LAYERS;
    const lowerQuery = query.toLowerCase();
    const results: MemoryEntry[] = [];

    for (const layer of searchLayers) {
      let entries: MemoryEntry[] = [];
      
      switch (layer) {
        case 'L0':
          entries = this.memoryStore.l0.getAll();
          break;
        case 'L1':
          entries = this.memoryStore.l1.getAll();
          break;
        case 'L2':
          entries = this.memoryStore.l2.getAll();
          break;
        case 'L3':
          entries = this.memoryStore.l3.getAll();
          break;
        case 'L4':
          entries = this.memoryStore.l4.getAll();
          break;
      }
      
      // Filter by query match in content or tags
      const matches = entries.filter(e =>
        e.content.toLowerCase().includes(lowerQuery) ||
        e.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
      
      results.push(...matches);
    }

    // Sort by importance, then by lastAccessed
    return results.sort((a, b) => {
      if (b.importance !== a.importance) {
        return b.importance - a.importance;
      }
      return b.lastAccessed - a.lastAccessed;
    });
  }

  /**
   * Consolidate memories - called during idle/sleep periods
   * Promotes important memories, demotes unused ones, discards trash
   */
  consolidate(): ConsolidationResult {
    const result: ConsolidationResult = {
      consolidated: 0,
      promoted: 0,
      demoted: 0,
      discarded: 0,
      errors: [],
    };

    try {
      // Get all L0 entries for importance analysis
      const l0Entries = this.memoryStore.l0.getAll();
      
      for (const entry of l0Entries) {
        // High importance, never accessed - promote to L2/L3
        if (entry.importance >= 80 && entry.accessCount === 0) {
          result.promoted++;
          result.consolidated++;
        }
        // Low importance, never accessed - discard
        else if (entry.importance <= 10 && entry.accessCount === 0) {
          this.memoryStore.l0.remove(entry.id);
          result.discarded++;
          result.consolidated++;
        }
        // Low importance, low access - demote to lower layer
        else if (entry.importance <= 20 && entry.accessCount <= 2) {
          result.demoted++;
          result.consolidated++;
        }
      }

      // L1 consolidation - remove entries with no tags after threshold
      const l1Entries = this.memoryStore.l1.getAll();
      for (const entry of l1Entries) {
        if (entry.tags.length === 0 && entry.accessCount === 0) {
          this.memoryStore.l1.remove(entry.id);
          result.discarded++;
          result.consolidated++;
        }
      }

      // L4 consolidation - expire old working memory
      const l4Entries = this.memoryStore.l4.getAll();
      const now = Date.now();
      for (const entry of l4Entries) {
        // Remove entries older than 24 hours
        if (now - entry.lastAccessed > 24 * 60 * 60 * 1000) {
          this.memoryStore.l4.remove(entry.id);
          result.discarded++;
          result.consolidated++;
        }
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Get session context for a new session
   */
  getSessionContext(): SessionContext {
    return {
      sessionId: this.memoryStore.l4.getSessionId(),
      startTime: this.memoryStore.l4.getSessionStart(),
      recentMemories: this.memoryStore.getRecent(10),
      activeSkills: this.memoryStore.getSkills().slice(0, 5),
      workingMemory: this.memoryStore.getWorking(),
      preferences: this.memoryStore.getGlobal(e => {
        const meta = e.metadata as Record<string, unknown> | undefined;
        return meta?.type === 'preference';
      }),
    };
  }

  /**
   * Get the underlying MemoryStore (for direct layer access if needed)
   */
  getStore(): MemoryStore {
    return this.memoryStore;
  }

  /**
   * Clear all memories (use with caution)
   */
  clearAll(): void {
    this.memoryStore.clearAll();
  }

  /**
   * Destroy the dream memory engine
   */
  destroy(): void {
    this.memoryStore.destroy();
  }
}

// Singleton instance
let dreamMemoryInstance: DreamMemory | null = null;

export function getDreamMemory(): DreamMemory {
  if (!dreamMemoryInstance) {
    dreamMemoryInstance = new DreamMemory();
  }
  return dreamMemoryInstance;
}