/**
 * V167: L4 Session Working Memory Layer
 * 
 * Current session context, working memory.
 * In-memory Map, cleared on session end.
 */

import type { MemoryEntry, Layer } from '../MemoryTypes';

const LAYER: Layer = 'L4';

/**
 * L4 Session working memory - cleared on session end
 */
export class L4Session {
  private working: Map<string, MemoryEntry> = new Map();
  private sessionId: string;
  private sessionStart: number;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || crypto.randomUUID();
    this.sessionStart = Date.now();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get session start time
   */
  getSessionStart(): number {
    return this.sessionStart;
  }

  /**
   * Add a memory to working memory
   */
  add(entry: MemoryEntry): void {
    if (entry.layer !== LAYER) {
      throw new Error(`L4Session can only store L4 layer entries, got ${entry.layer}`);
    }
    this.working.set(entry.id, {
      ...entry,
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Get a working memory by ID
   */
  get(id: string): MemoryEntry | null {
    const entry = this.working.get(id);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }
    return entry || null;
  }

  /**
   * Get all working memories
   */
  getAll(): MemoryEntry[] {
    return Array.from(this.working.values());
  }

  /**
   * Get working memories (alias for getAll)
   */
  getWorking(): MemoryEntry[] {
    return this.getAll();
  }

  /**
   * Get working memories sorted by last accessed
   */
  getRecent(limit: number): MemoryEntry[] {
    return Array.from(this.working.values())
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, limit);
  }

  /**
   * Remove a working memory
   */
  remove(id: string): boolean {
    return this.working.delete(id);
  }

  /**
   * Clear all working memory (session end)
   */
  clearWorking(): void {
    this.working.clear();
    // Generate new session ID
    this.sessionId = crypto.randomUUID();
    this.sessionStart = Date.now();
  }

  /**
   * Get size of working memory
   */
  size(): number {
    return this.working.size;
  }

  /**
   * Update content of a working memory
   */
  update(id: string, content: string): boolean {
    const entry = this.working.get(id);
    if (!entry) return false;
    entry.content = content;
    entry.lastAccessed = Date.now();
    return true;
  }

  /**
   * Add tags to a working memory
   */
  addTag(id: string, tag: string): boolean {
    const entry = this.working.get(id);
    if (!entry) return false;
    const normalizedTag = tag.toLowerCase();
    if (!entry.tags.includes(normalizedTag)) {
      entry.tags.push(normalizedTag);
    }
    return true;
  }

  /**
   * Check if memory exists
   */
  has(id: string): boolean {
    return this.working.has(id);
  }
}