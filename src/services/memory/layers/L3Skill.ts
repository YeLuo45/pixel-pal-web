/**
 * V167: L3 Skill Crystallization Layer
 * 
 * Crystallized skills, learned patterns, procedures.
 * Uses SqliteStorage for persistence.
 */

import type { MemoryEntry, Layer } from '../MemoryTypes';
import { getSqliteStorage, SqliteStorage } from '../../storage/SqliteStorage';

const LAYER: Layer = 'L3';
const TABLE = 'dream_memory_l3';

export class L3Skill {
  private storage: SqliteStorage;

  constructor() {
    this.storage = getSqliteStorage();
    this.initTable();
  }

  /**
   * Initialize the L3 table if it doesn't exist
   */
  private initTable(): void {
    // Note: actual table creation would be handled by db migration
    // This is a stub since the actual DB may not be available
  }

  /**
   * Add or update a skill memory
   */
  add(entry: MemoryEntry): void {
    if (entry.layer !== LAYER) {
      throw new Error(`L3Skill can only store L3 layer entries, got ${entry.layer}`);
    }
    this.storage.set(TABLE, entry.id, entry);
  }

  /**
   * Get a skill by ID
   */
  get(id: string): MemoryEntry | null {
    return this.storage.get<MemoryEntry>(TABLE, id);
  }

  /**
   * Get all skills
   */
  getAll(): MemoryEntry[] {
    return this.storage.query<MemoryEntry>(TABLE, { layer: LAYER });
  }

  /**
   * Get all skills (alias for getAll)
   */
  getSkills(): MemoryEntry[] {
    return this.getAll();
  }

  /**
   * Get skills by category (using metadata.category)
   */
  getSkillsByCategory(category: string): MemoryEntry[] {
    return this.getAll().filter(e => {
      const meta = e.metadata as Record<string, unknown> | undefined;
      return meta?.category === category;
    });
  }

  /**
   * Get skills by tag
   */
  getByTag(tag: string): MemoryEntry[] {
    const lowerTag = tag.toLowerCase();
    return this.getAll().filter(e => 
      e.tags.some(t => t.toLowerCase() === lowerTag)
    );
  }

  /**
   * Search skills by query
   */
  search(query: string): MemoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(e => 
      e.content.toLowerCase().includes(lowerQuery) ||
      e.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Remove a skill
   */
  remove(id: string): void {
    this.storage.delete(TABLE, id);
  }

  /**
   * Clear all L3 data (use with caution)
   */
  clear(): void {
    const all = this.getAll();
    for (const entry of all) {
      this.storage.delete(TABLE, entry.id);
    }
  }

  /**
   * Get count of skills
   */
  size(): number {
    return this.getAll().length;
  }
}