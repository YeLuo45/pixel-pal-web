/**
 * V167: L2 Global Persistent Layer
 * 
 * Cross-session facts, user preferences, long-term context.
 * Uses SqliteStorage for persistence.
 */

import type { MemoryEntry, Layer, MemoryFilter } from '../MemoryTypes';
import { getSqliteStorage, SqliteStorage } from '../../storage/SqliteStorage';

const LAYER: Layer = 'L2';
const TABLE = 'dream_memory_l2';

export class L2Global {
  private storage: SqliteStorage;

  constructor() {
    this.storage = getSqliteStorage();
    this.initTable();
  }

  /**
   * Initialize the L2 table if it doesn't exist
   */
  private initTable(): void {
    // Note: actual table creation would be handled by db migration
    // This is a stub since the actual DB may not be available
  }

  /**
   * Add or update a global memory
   */
  add(entry: MemoryEntry): void {
    if (entry.layer !== LAYER) {
      throw new Error(`L2Global can only store L2 layer entries, got ${entry.layer}`);
    }
    this.storage.set(TABLE, entry.id, entry);
  }

  /**
   * Get a memory by ID
   */
  get(id: string): MemoryEntry | null {
    return this.storage.get<MemoryEntry>(TABLE, id);
  }

  /**
   * Get all global memories
   */
  getAll(): MemoryEntry[] {
    return this.storage.query<MemoryEntry>(TABLE, { layer: LAYER });
  }

  /**
   * Search global memories by predicate
   */
  searchGlobal(predicate: MemoryFilter): MemoryEntry[] {
    return this.getAll().filter(predicate);
  }

  /**
   * Get global memories matching a query string (content search)
   */
  searchGlobalByQuery(query: string): MemoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(e => 
      e.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get memories by importance threshold
   */
  getByImportance(threshold: number): MemoryEntry[] {
    return this.getAll().filter(e => e.importance >= threshold);
  }

  /**
   * Get memories by tag
   */
  getByTag(tag: string): MemoryEntry[] {
    const lowerTag = tag.toLowerCase();
    return this.getAll().filter(e => 
      e.tags.some(t => t.toLowerCase() === lowerTag)
    );
  }

  /**
   * Remove a memory
   */
  remove(id: string): void {
    this.storage.delete(TABLE, id);
  }

  /**
   * Clear all L2 data (use with caution)
   */
  clear(): void {
    const all = this.getAll();
    for (const entry of all) {
      this.storage.delete(TABLE, entry.id);
    }
  }

  /**
   * Get count of entries
   */
  size(): number {
    return this.getAll().length;
  }
}