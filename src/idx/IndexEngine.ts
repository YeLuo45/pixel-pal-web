/**
 * Index Engine
 * claude-code-design Index Engine - Build + Query + Rebuild + Stats
 */

export interface IndexEntry {
  id: string;
  key: string;
  value: unknown;
  hits: number;
  created: number;
  updated: number;
}

export interface IndexStats {
  entries: number;
  keys: number;
  totalHits: number;
  avgHits: number;
  rebuildCount: number;
}

export class IndexEngine {
  private entries: Map<string, IndexEntry> = new Map();
  private counter = 0;
  private rebuildCount = 0;

  build(key: string, value: unknown): string {
    const id = `idx-${++this.counter}`;
    this.entries.set(id, {
      id,
      key,
      value,
      hits: 0,
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  query(key: string): IndexEntry[] {
    const results: IndexEntry[] = [];
    for (const e of this.entries.values()) {
      if (e.key === key) {
        e.hits++;
        results.push(e);
      }
    }
    return results;
  }

  rebuild(): boolean {
    this.rebuildCount++;
    return true;
  }

  getStats(): IndexStats {
    const all = Array.from(this.entries.values());
    return {
      entries: all.length,
      keys: new Set(all.map(e => e.key)).size,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      avgHits: all.length > 0 ? Math.round((all.reduce((s, e) => s + e.hits, 0) / all.length) * 100) / 100 : 0,
      rebuildCount: this.rebuildCount,
    };
  }

  getEntry(id: string): IndexEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): IndexEntry[] {
    return Array.from(this.entries.values());
  }

  removeEntry(id: string): boolean {
    return this.entries.delete(id);
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getKey(id: string): string | undefined {
    return this.entries.get(id)?.key;
  }

  getValue(id: string): unknown {
    return this.entries.get(id)?.value;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  setValue(id: string, value: unknown): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.value = value;
    e.updated = Date.now();
    return true;
  }

  setKey(id: string, key: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.key = key;
    e.updated = Date.now();
    return true;
  }

  resetHits(): void {
    for (const e of this.entries.values()) e.hits = 0;
  }

  getByKey(key: string): IndexEntry[] {
    return this.query(key);
  }

  getKeys(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.key))];
  }

  getKeyCount(): number {
    return this.getKeys().length;
  }

  getEntriesForKey(key: string): number {
    return this.getByKey(key).length;
  }

  getCreatedAt(id: string): number {
    return this.entries.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.entries.get(id)?.updated ?? 0;
  }

  getMostHit(): IndexEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.hits > max.hits ? e : max);
  }

  getLeastHit(): IndexEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.hits < min.hits ? e : min);
  }

  getNewest(): IndexEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): IndexEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getRebuildCount(): number {
    return this.rebuildCount;
  }

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
    this.rebuildCount = 0;
  }
}

export default IndexEngine;