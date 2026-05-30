/**
 * V167: L0 Metadata Layer
 * 
 * Manages memory metadata, access patterns, and importance scores.
 * Uses in-memory Map with periodic persistence.
 */

import type { MemoryEntry, Layer } from '../MemoryTypes';

const LAYER: Layer = 'L0';

/**
 * L0 Metadata layer for tracking memory access patterns and importance
 */
export class L0Meta {
  private metadata: Map<string, MemoryEntry> = new Map();
  private persistenceTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Periodic persistence every 30 seconds
    this.startPersistenceTimer();
  }

  /**
   * Add or update a memory entry in L0
   */
  add(entry: MemoryEntry): void {
    if (entry.layer !== LAYER) {
      throw new Error(`L0Meta can only store L0 layer entries, got ${entry.layer}`);
    }
    this.metadata.set(entry.id, { ...entry });
  }

  /**
   * Get a memory by ID
   */
  get(id: string): MemoryEntry | null {
    const entry = this.metadata.get(id) || null;
    if (entry) {
      // Update access metadata
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }
    return entry;
  }

  /**
   * Get recent memories up to limit
   */
  getRecent(limit: number): MemoryEntry[] {
    const entries = Array.from(this.metadata.values());
    return entries
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, limit);
  }

  /**
   * Update importance score with delta (-100 to +100)
   */
  updateImportance(id: string, delta: number): boolean {
    const entry = this.metadata.get(id);
    if (!entry) return false;
    
    const newImportance = Math.max(0, Math.min(100, entry.importance + delta));
    entry.importance = newImportance;
    return true;
  }

  /**
   * Get all entries
   */
  getAll(): MemoryEntry[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Get entries by importance threshold
   */
  getByImportance(threshold: number): MemoryEntry[] {
    return Array.from(this.metadata.values())
      .filter(e => e.importance >= threshold);
  }

  /**
   * Remove a memory entry
   */
  remove(id: string): boolean {
    return this.metadata.delete(id);
  }

  /**
   * Clear all L0 metadata
   */
  clear(): void {
    this.metadata.clear();
  }

  /**
   * Get size of the metadata store
   */
  size(): number {
    return this.metadata.size;
  }

  /**
   * Persist metadata to storage (stub for now)
   */
  private persist(): void {
    // Stub: actual persistence would save to SQLite
    // This would be called periodically or on session end
  }

  /**
   * Start periodic persistence timer
   */
  private startPersistenceTimer(): void {
    this.persistenceTimer = setInterval(() => {
      this.persist();
    }, 30000);
  }

  /**
   * Stop persistence timer
   */
  destroy(): void {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
      this.persistenceTimer = null;
    }
    this.persist();
    this.clear();
  }
}