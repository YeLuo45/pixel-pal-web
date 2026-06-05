/**
 * Memory Store v2
 * chatdev-design Memory Store v2 - Write + Read + Relate + Stats
 */

export interface Memory {
  id: string;
  key: string;
  value: unknown;
  related: string[];
  hits: number;
  created: number;
  updated: number;
}

export interface MemoryStats {
  memories: number;
  totalHits: number;
  totalRelations: number;
  avgHits: number;
  keys: number;
}

export class MemoryStoreV2 {
  private memories: Map<string, Memory> = new Map();
  private counter = 0;

  write(key: string, value: unknown): string {
    const id = `mem-${++this.counter}`;
    this.memories.set(id, {
      id,
      key,
      value,
      related: [],
      hits: 0,
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  read(id: string): Memory | null {
    const m = this.memories.get(id);
    if (!m) return null;
    m.hits++;
    m.updated = Date.now();
    return m;
  }

  relate(id1: string, id2: string): boolean {
    const m1 = this.memories.get(id1);
    const m2 = this.memories.get(id2);
    if (!m1 || !m2) return false;
    if (!m1.related.includes(id2)) m1.related.push(id2);
    if (!m2.related.includes(id1)) m2.related.push(id1);
    return true;
  }

  getStats(): MemoryStats {
    const all = Array.from(this.memories.values());
    return {
      memories: all.length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      totalRelations: all.reduce((s, m) => s + m.related.length, 0),
      avgHits: all.length > 0 ? Math.round((all.reduce((s, m) => s + m.hits, 0) / all.length) * 100) / 100 : 0,
      keys: new Set(all.map(m => m.key)).size,
    };
  }

  getMemory(id: string): Memory | undefined {
    return this.memories.get(id);
  }

  getAllMemories(): Memory[] {
    return Array.from(this.memories.values());
  }

  removeMemory(id: string): boolean {
    const removed = this.memories.delete(id);
    if (removed) {
      for (const m of this.memories.values()) {
        m.related = m.related.filter(r => r !== id);
      }
    }
    return removed;
  }

  hasMemory(id: string): boolean {
    return this.memories.has(id);
  }

  getCount(): number {
    return this.memories.size;
  }

  getKey(id: string): string | undefined {
    return this.memories.get(id)?.key;
  }

  getValue(id: string): unknown {
    return this.memories.get(id)?.value;
  }

  getHits(id: string): number {
    return this.memories.get(id)?.hits ?? 0;
  }

  getRelated(id: string): string[] {
    return [...(this.memories.get(id)?.related ?? [])];
  }

  getRelatedCount(id: string): number {
    return this.getRelated(id).length;
  }

  isRelated(id1: string, id2: string): boolean {
    return this.memories.get(id1)?.related.includes(id2) ?? false;
  }

  unrelate(id1: string, id2: string): boolean {
    const m1 = this.memories.get(id1);
    const m2 = this.memories.get(id2);
    if (!m1 || !m2) return false;
    m1.related = m1.related.filter(r => r !== id2);
    m2.related = m2.related.filter(r => r !== id1);
    return true;
  }

  setValue(id: string, value: unknown): boolean {
    const m = this.memories.get(id);
    if (!m) return false;
    m.value = value;
    m.updated = Date.now();
    return true;
  }

  setKey(id: string, key: string): boolean {
    const m = this.memories.get(id);
    if (!m) return false;
    m.key = key;
    m.updated = Date.now();
    return true;
  }

  resetHits(): void {
    for (const m of this.memories.values()) m.hits = 0;
  }

  getByKey(key: string): Memory[] {
    return Array.from(this.memories.values()).filter(m => m.key === key);
  }

  getAllKeys(): string[] {
    return [...new Set(Array.from(this.memories.values()).map(m => m.key))];
  }

  getKeyCount(): number {
    return this.getAllKeys().length;
  }

  getCreatedAt(id: string): number {
    return this.memories.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.memories.get(id)?.updated ?? 0;
  }

  getMostHit(): Memory | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.hits > max.hits ? m : max);
  }

  getMostRelated(): Memory | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.related.length > max.related.length ? m : max);
  }

  getNewest(): Memory | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): Memory | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  clearAll(): void {
    this.memories.clear();
    this.counter = 0;
  }
}

export default MemoryStoreV2;