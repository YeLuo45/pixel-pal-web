/**
 * Memory Store
 * generic-agent-design Memory Store - Write + Read + Search + Archive
 */

export interface Memory {
  id: string;
  key: string;
  value: unknown;
  tags: string[];
  created: number;
  accessed: number;
  accessCount: number;
  archived: boolean;
}

export interface MemoryStats {
  memories: number;
  archived: number;
  active: number;
  tags: number;
  avgAccess: number;
}

export class MemoryStore {
  private memories: Map<string, Memory> = new Map();
  private counter = 0;

  write(key: string, value: unknown, tags: string[] = []): string {
    const id = `mem-${++this.counter}`;
    this.memories.set(id, {
      id,
      key,
      value,
      tags: [...tags],
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 0,
      archived: false,
    });
    return id;
  }

  read(id: string): Memory | null {
    const memory = this.memories.get(id);
    if (!memory || memory.archived) return null;
    memory.accessed = Date.now();
    memory.accessCount++;
    return memory;
  }

  search(query: string): Memory[] {
    const q = query.toLowerCase();
    return Array.from(this.memories.values()).filter(m => {
      if (m.archived) return false;
      return m.key.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q));
    });
  }

  archive(id: string): boolean {
    const memory = this.memories.get(id);
    if (!memory) return false;
    memory.archived = true;
    return true;
  }

  unarchive(id: string): boolean {
    const memory = this.memories.get(id);
    if (!memory) return false;
    memory.archived = false;
    return true;
  }

  getStats(): MemoryStats {
    const all = Array.from(this.memories.values());
    const active = all.filter(m => !m.archived);
    const tags = new Set<string>();
    for (const m of all) m.tags.forEach(t => tags.add(t));
    return {
      memories: all.length,
      archived: all.filter(m => m.archived).length,
      active: active.length,
      tags: tags.size,
      avgAccess: active.length > 0 ? Math.round((active.reduce((s, m) => s + m.accessCount, 0) / active.length) * 100) / 100 : 0,
    };
  }

  getMemory(id: string): Memory | undefined {
    return this.memories.get(id);
  }

  getAll(): Memory[] {
    return Array.from(this.memories.values());
  }

  getActive(): Memory[] {
    return Array.from(this.memories.values()).filter(m => !m.archived);
  }

  getArchived(): Memory[] {
    return Array.from(this.memories.values()).filter(m => m.archived);
  }

  removeMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  hasMemory(id: string): boolean {
    return this.memories.has(id);
  }

  getCount(): number {
    return this.memories.size;
  }

  getValue(id: string): unknown {
    const mem = this.read(id);
    return mem?.value;
  }

  getKey(id: string): string | undefined {
    return this.memories.get(id)?.key;
  }

  getTags(id: string): string[] {
    return [...(this.memories.get(id)?.tags ?? [])];
  }

  hasTag(id: string, tag: string): boolean {
    return this.memories.get(id)?.tags.includes(tag) ?? false;
  }

  addTag(id: string, tag: string): boolean {
    const mem = this.memories.get(id);
    if (!mem) return false;
    if (!mem.tags.includes(tag)) mem.tags.push(tag);
    return true;
  }

  removeTag(id: string, tag: string): boolean {
    const mem = this.memories.get(id);
    if (!mem) return false;
    const idx = mem.tags.indexOf(tag);
    if (idx === -1) return false;
    mem.tags.splice(idx, 1);
    return true;
  }

  updateValue(id: string, value: unknown): boolean {
    const mem = this.memories.get(id);
    if (!mem) return false;
    mem.value = value;
    return true;
  }

  updateKey(id: string, key: string): boolean {
    const mem = this.memories.get(id);
    if (!mem) return false;
    mem.key = key;
    return true;
  }

  getByTag(tag: string): Memory[] {
    return Array.from(this.memories.values()).filter(m => !m.archived && m.tags.includes(tag));
  }

  getByKey(key: string): Memory[] {
    return Array.from(this.memories.values()).filter(m => !m.archived && m.key === key);
  }

  getTagCount(): number {
    const tags = new Set<string>();
    for (const m of this.memories.values()) m.tags.forEach(t => tags.add(t));
    return tags.size;
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    for (const m of this.memories.values()) m.tags.forEach(t => tags.add(t));
    return Array.from(tags);
  }

  getCreatedAt(id: string): number {
    return this.memories.get(id)?.created ?? 0;
  }

  getLastAccessedAt(id: string): number {
    return this.memories.get(id)?.accessed ?? 0;
  }

  getAccessCount(id: string): number {
    return this.memories.get(id)?.accessCount ?? 0;
  }

  isArchived(id: string): boolean {
    return this.memories.get(id)?.archived ?? false;
  }

  isActive(id: string): boolean {
    const mem = this.memories.get(id);
    return mem !== undefined && !mem.archived;
  }

  getMostAccessed(): Memory | null {
    const active = this.getActive();
    if (active.length === 0) return null;
    return active.reduce((max, m) => m.accessCount > max.accessCount ? m : max);
  }

  getLeastAccessed(): Memory | null {
    const active = this.getActive();
    if (active.length === 0) return null;
    return active.reduce((min, m) => m.accessCount < min.accessCount ? m : min);
  }

  getNewest(): Memory | null {
    const active = this.getActive();
    if (active.length === 0) return null;
    return active.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): Memory | null {
    const active = this.getActive();
    if (active.length === 0) return null;
    return active.reduce((min, m) => m.created < min.created ? m : min);
  }

  clearAll(): void {
    this.memories.clear();
    this.counter = 0;
  }
}

export default MemoryStore;