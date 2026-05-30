/**
 * V167: L1 Index Layer
 * 
 * Quick lookup index, recent accesses, and tags.
 * Uses in-memory Map with tag-based indexing.
 */

import type { MemoryEntry, Layer, TagIndex } from '../MemoryTypes';

const LAYER: Layer = 'L1';

/**
 * L1 Index layer for tag-based and quick lookup operations
 */
export class L1Index {
  private memories: Map<string, MemoryEntry> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private recentAccesses: string[] = [];
  private maxRecentAccesses = 100;

  constructor() {
    // Initialize empty structures
  }

  /**
   * Add a memory entry to L1
   */
  add(entry: MemoryEntry): void {
    if (entry.layer !== LAYER) {
      throw new Error(`L1Index can only store L1 layer entries, got ${entry.layer}`);
    }
    
    const memoryWithAccess = {
      ...entry,
      accessCount: 0,
      lastAccessed: Date.now(),
    };
    
    this.memories.set(entry.id, memoryWithAccess);
    this.updateTagIndex(entry.id, entry.tags);
    this.addRecentAccess(entry.id);
  }

  /**
   * Get a memory by ID
   */
  get(id: string): MemoryEntry | null {
    const entry = this.memories.get(id);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.addRecentAccess(entry.id);
    }
    return entry || null;
  }

  /**
   * Get all memories indexed by a specific tag
   */
  getIndexed(tag: string): MemoryEntry[] {
    const ids = this.tagIndex.get(tag.toLowerCase());
    if (!ids) return [];
    
    return Array.from(ids)
      .map(id => this.memories.get(id))
      .filter((e): e is MemoryEntry => e !== undefined);
  }

  /**
   * Get memories that have ALL the specified tags
   */
  getByTags(tags: string[]): MemoryEntry[] {
    if (tags.length === 0) return [];
    
    // Find IDs that have all tags
    const tagSets = tags
      .map(t => this.tagIndex.get(t.toLowerCase()))
      .filter((s): s is Set<string> => s !== undefined);
    
    if (tagSets.length === 0) return [];
    
    // Intersection of all tag sets
    const intersection = tagSets.reduce((acc, set) => {
      return new Set([...acc].filter(id => set.has(id)));
    });
    
    return Array.from(intersection)
      .map(id => this.memories.get(id))
      .filter((e): e is MemoryEntry => e !== undefined);
  }

  /**
   * Add a tag to a memory entry
   */
  addTag(id: string, tag: string): boolean {
    const entry = this.memories.get(id);
    if (!entry) return false;
    
    const normalizedTag = tag.toLowerCase();
    if (!entry.tags.includes(normalizedTag)) {
      entry.tags.push(normalizedTag);
    }
    
    // Update tag index
    if (!this.tagIndex.has(normalizedTag)) {
      this.tagIndex.set(normalizedTag, new Set());
    }
    this.tagIndex.get(normalizedTag)!.add(id);
    
    return true;
  }

  /**
   * Remove a tag from a memory entry
   */
  removeTag(id: string, tag: string): boolean {
    const entry = this.memories.get(id);
    if (!entry) return false;
    
    const normalizedTag = tag.toLowerCase();
    const index = entry.tags.indexOf(normalizedTag);
    if (index !== -1) {
      entry.tags.splice(index, 1);
    }
    
    // Update tag index
    this.tagIndex.get(normalizedTag)?.delete(id);
    
    return true;
  }

  /**
   * Get recently accessed memories
   */
  getRecent(limit: number): MemoryEntry[] {
    return this.recentAccesses
      .slice(0, limit)
      .map(id => this.memories.get(id))
      .filter((e): e is MemoryEntry => e !== undefined);
  }

  /**
   * Get all entries
   */
  getAll(): MemoryEntry[] {
    return Array.from(this.memories.values());
  }

  /**
   * Get all tags
   */
  getAllTags(): string[] {
    return Array.from(this.tagIndex.keys());
  }

  /**
   * Remove a memory entry
   */
  remove(id: string): boolean {
    const entry = this.memories.get(id);
    if (!entry) return false;
    
    // Remove from tag index
    for (const tag of entry.tags) {
      this.tagIndex.get(tag)?.delete(id);
    }
    
    // Remove from recent accesses
    const recentIndex = this.recentAccesses.indexOf(id);
    if (recentIndex !== -1) {
      this.recentAccesses.splice(recentIndex, 1);
    }
    
    return this.memories.delete(id);
  }

  /**
   * Clear all L1 data
   */
  clear(): void {
    this.memories.clear();
    this.tagIndex.clear();
    this.recentAccesses = [];
  }

  /**
   * Get size
   */
  size(): number {
    return this.memories.size;
  }

  /**
   * Update tag index for an entry
   */
  private updateTagIndex(id: string, tags: string[]): void {
    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase();
      if (!this.tagIndex.has(normalizedTag)) {
        this.tagIndex.set(normalizedTag, new Set());
      }
      this.tagIndex.get(normalizedTag)!.add(id);
    }
  }

  /**
   * Add to recent accesses list
   */
  private addRecentAccess(id: string): void {
    // Remove if already exists to avoid duplicates
    const index = this.recentAccesses.indexOf(id);
    if (index !== -1) {
      this.recentAccesses.splice(index, 1);
    }
    
    // Add to front
    this.recentAccesses.unshift(id);
    
    // Trim if over limit
    if (this.recentAccesses.length > this.maxRecentAccesses) {
      this.recentAccesses = this.recentAccesses.slice(0, this.maxRecentAccesses);
    }
  }
}