/**
 * V168: MemoryQueryEngine - Unified Query Interface
 * 
 * Unified query interface with layer-aware search:
 * - query(): Search across specified layers with filters
 * - explain(): Provide human-readable explanation of query
 * - getLayerStats(): Get statistics per layer
 */

import type { MemoryEntry, Layer, QueryOptions, QueryResult } from '../MemoryTypes';
import { DreamMemory } from '../DreamMemory';

export interface QueryOptions {
  layers?: Layer[];
  limit?: number;
  minImportance?: number;
  tags?: string[];
}

export interface QueryResult {
  entries: MemoryEntry[];
  total: number;
  layerBreakdown: Record<Layer, number>;
}

const ALL_LAYERS: Layer[] = ['L0', 'L1', 'L2', 'L3', 'L4'];
const DEFAULT_LIMIT = 10;

export class MemoryQueryEngine {
  private dm: DreamMemory;

  constructor(dm?: DreamMemory) {
    this.dm = dm || new DreamMemory();
  }

  /**
   * Query memories across layers with optional filters
   */
  query(text: string, options?: QueryOptions): QueryResult {
    const layers = options?.layers || ALL_LAYERS;
    const limit = options?.limit ?? DEFAULT_LIMIT;
    const minImportance = options?.minImportance;
    const tags = options?.tags;

    // Use DreamMemory.search for unified search across all accessible layers
    // This works better with the current storage implementation
    const allSearchResults = this.dm.search(text);

    // Filter by specified layers
    let filtered = allSearchResults.filter(e => layers.includes(e.layer));

    // Apply minImportance filter
    if (minImportance !== undefined) {
      filtered = filtered.filter(e => e.importance >= minImportance);
    }

    // Apply tags filter
    if (tags && tags.length > 0) {
      const lowerTags = tags.map(t => t.toLowerCase());
      filtered = filtered.filter(e =>
        e.tags.some(t => lowerTags.includes(t.toLowerCase()))
      );
    }

    // Sort by importance descending, then by lastAccessed descending
    filtered.sort((a, b) => {
      if (b.importance !== a.importance) {
        return b.importance - a.importance;
      }
      return b.lastAccessed - a.lastAccessed;
    });

    // Build layer breakdown
    const layerBreakdown: Record<Layer, number> = {
      L0: 0, L1: 0, L2: 0, L3: 0, L4: 0,
    };
    for (const entry of filtered) {
      layerBreakdown[entry.layer]++;
    }

    // Return result
    const entries = filtered.slice(0, limit);
    return {
      entries,
      total: filtered.length,
      layerBreakdown,
    };
  }

  /**
   * Provide human-readable explanation of query
   */
  explain(text: string, options?: QueryOptions): string {
    const layers = options?.layers || ALL_LAYERS;
    const limit = options?.limit ?? DEFAULT_LIMIT;
    const minImportance = options?.minImportance;
    const tags = options?.tags;

    const parts: string[] = [];

    parts.push(`Query: "${text}"`);
    parts.push(`Layers: ${layers.join(', ')}`);
    parts.push(`Limit: ${limit}`);

    if (minImportance !== undefined) {
      parts.push(`Min Importance: ${minImportance}`);
    }

    if (tags && tags.length > 0) {
      parts.push(`Tags: ${tags.join(', ')}`);
    }

    // Get result for explanation
    const result = this.query(text, options);
    parts.push(`Total matches: ${result.total}`);
    parts.push(`Layer breakdown: ${JSON.stringify(result.layerBreakdown)}`);

    return parts.join('\n');
  }

  /**
   * Get statistics per layer
   * Note: For L0, L1, L4 we can get accurate counts. L2/L3 use SQLite storage
   * which may return empty in test environment.
   */
  getLayerStats(): Record<Layer, { count: number; avgImportance: number }> {
    const store = this.dm.getStore();

    const stats: Record<Layer, { count: number; avgImportance: number }> = {
      L0: { count: 0, avgImportance: 0 },
      L1: { count: 0, avgImportance: 0 },
      L2: { count: 0, avgImportance: 0 },
      L3: { count: 0, avgImportance: 0 },
      L4: { count: 0, avgImportance: 0 },
    };

    // L0 - in-memory, accurate
    const l0Entries = store.l0.getAll();
    stats.L0.count = l0Entries.length;
    if (l0Entries.length > 0) {
      stats.L0.avgImportance = l0Entries.reduce((acc, e) => acc + e.importance, 0) / l0Entries.length;
    }

    // L1 - in-memory, accurate
    const l1Entries = store.l1.getAll();
    stats.L1.count = l1Entries.length;
    if (l1Entries.length > 0) {
      stats.L1.avgImportance = l1Entries.reduce((acc, e) => acc + e.importance, 0) / l1Entries.length;
    }

    // L2 - SQLite storage (may be empty in test env)
    const l2Entries = store.l2.getAll();
    stats.L2.count = l2Entries.length;
    if (l2Entries.length > 0) {
      stats.L2.avgImportance = l2Entries.reduce((acc, e) => acc + e.importance, 0) / l2Entries.length;
    }

    // L3 - SQLite storage (may be empty in test env)
    const l3Entries = store.l3.getAll();
    stats.L3.count = l3Entries.length;
    if (l3Entries.length > 0) {
      stats.L3.avgImportance = l3Entries.reduce((acc, e) => acc + e.importance, 0) / l3Entries.length;
    }

    // L4 - in-memory, accurate
    const l4Entries = store.l4.getAll();
    stats.L4.count = l4Entries.length;
    if (l4Entries.length > 0) {
      stats.L4.avgImportance = l4Entries.reduce((acc, e) => acc + e.importance, 0) / l4Entries.length;
    }

    return stats;
  }
}
