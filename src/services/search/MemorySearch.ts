import { SemanticSearchEngine, SearchResult, SearchOptions } from './SemanticSearchEngine';

export interface MemorySearchOptions extends SearchOptions {
  tiers?: string[];
  tags?: string[];
  dateRange?: { start: number; end: number };
}

interface MemorySearchRecord {
  id: string;
  content: string;
  tier: string;
  tags: string[];
  timestamp: number;
  metadata: Record<string, any>;
}

export class MemorySearch {
  private engine: SemanticSearchEngine;
  private memories: Map<string, MemorySearchRecord>;
  private searchHistory: Array<{ query: string; timestamp: number; results: SearchResult[] }>;

  constructor() {
    this.engine = new SemanticSearchEngine();
    this.memories = new Map();
    this.searchHistory = [];
  }

  searchMemories(query: string, options?: MemorySearchOptions): SearchResult[] {
    let results = this.engine.search(query, options);

    if (options?.tiers && options.tiers.length > 0) {
      results = results.filter(r => {
        const tier = r.metadata?.tier;
        return tier && options.tiers!.includes(tier);
      });
    }

    if (options?.tags && options.tags.length > 0) {
      results = results.filter(r => {
        const tags = r.metadata?.tags || [];
        return options.tags!.some(tag => tags.includes(tag));
      });
    }

    if (options?.dateRange) {
      results = results.filter(r => {
        const timestamp = r.metadata?.timestamp;
        if (typeof timestamp !== 'number') return false;
        return timestamp >= options.dateRange!.start && timestamp <= options.dateRange!.end;
      });
    }

    const historyEntry = {
      query,
      timestamp: Date.now(),
      results: results
    };
    this.searchHistory.push(historyEntry);

    return results;
  }

  indexMemory(id: string, memory: any): void {
    this.memories.set(id, {
      id,
      content: memory.content || '',
      tier: memory.tier || 'L0',
      tags: memory.tags || [],
      timestamp: memory.timestamp || Date.now(),
      metadata: memory
    });

    this.engine.index(id, memory.content || '', memory);
  }

  removeMemory(id: string): void {
    this.memories.delete(id);
    this.engine.remove(id);
  }

  findRelated(memoryId: string, limit: number = 5): SearchResult[] {
    const memory = this.memories.get(memoryId);
    if (!memory) {
      return [];
    }

    const results = this.engine.search(memory.content, { limit: limit + 1 });
    return results.filter(r => r.id !== memoryId).slice(0, limit);
  }

  getSearchHistory(): Array<{ query: string; timestamp: number; results: SearchResult[] }> {
    return [...this.searchHistory];
  }

  clearHistory(): void {
    this.searchHistory = [];
  }
}