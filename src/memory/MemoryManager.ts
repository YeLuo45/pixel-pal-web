/**
 * Memory Manager
 * generic-agent-design Memory Manager - Store + Retrieve + Decay + Associate
 */

export interface Memory {
  id: string;
  content: string;
  importance: number;
  timestamp: number;
  associations: string[];
}

export interface MemoryStats {
  total: number;
  avgImportance: number;
  oldest: number;
  newest: number;
}

export class MemoryManager {
  private memories: Map<string, Memory> = new Map();
  private counter = 0;
  private decayThreshold = 0.1;

  store(memory: Omit<Memory, 'id'>): string {
    const id = `mem-${++this.counter}`;
    this.memories.set(id, {
      ...memory,
      id,
      associations: [...(memory.associations ?? [])],
    });
    return id;
  }

  retrieve(id: string): Memory | null {
    const memory = this.memories.get(id);
    return memory ? { ...memory, associations: [...memory.associations] } : null;
  }

  search(query: string): Memory[] {
    const lower = query.toLowerCase();
    return Array.from(this.memories.values())
      .filter(m => m.content.toLowerCase().includes(lower))
      .map(m => ({ ...m, associations: [...m.associations] }));
  }

  decay(): number {
    let removed = 0;
    const toRemove: string[] = [];
    for (const [id, memory] of this.memories.entries()) {
      if (memory.importance < this.decayThreshold) {
        toRemove.push(id);
      }
    }
    for (const id of toRemove) {
      this.memories.delete(id);
      removed++;
    }
    return removed;
  }

  getStats(): MemoryStats {
    const all = Array.from(this.memories.values());
    if (all.length === 0) {
      return { total: 0, avgImportance: 0, oldest: 0, newest: 0 };
    }
    const sum = all.reduce((acc, m) => acc + m.importance, 0);
    const timestamps = all.map(m => m.timestamp);
    return {
      total: all.length,
      avgImportance: Math.round((sum / all.length) * 100) / 100,
      oldest: Math.min(...timestamps),
      newest: Math.max(...timestamps),
    };
  }

  getMemory(id: string): Memory | undefined {
    return this.memories.get(id);
  }

  getAllMemories(): Memory[] {
    return Array.from(this.memories.values());
  }

  removeMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  updateImportance(id: string, importance: number): boolean {
    const memory = this.memories.get(id);
    if (!memory) return false;
    memory.importance = Math.max(0, Math.min(1, importance));
    return true;
  }

  addAssociation(id1: string, id2: string): boolean {
    const m1 = this.memories.get(id1);
    const m2 = this.memories.get(id2);
    if (!m1 || !m2) return false;
    if (!m1.associations.includes(id2)) m1.associations.push(id2);
    if (!m2.associations.includes(id1)) m2.associations.push(id1);
    return true;
  }

  removeAssociation(id1: string, id2: string): boolean {
    const m1 = this.memories.get(id1);
    const m2 = this.memories.get(id2);
    if (!m1 || !m2) return false;
    const idx1 = m1.associations.indexOf(id2);
    const idx2 = m2.associations.indexOf(id1);
    if (idx1 === -1 || idx2 === -1) return false;
    m1.associations.splice(idx1, 1);
    m2.associations.splice(idx2, 1);
    return true;
  }

  getAssociations(id: string): string[] {
    return [...(this.memories.get(id)?.associations ?? [])];
  }

  getByImportance(min: number, max: number): Memory[] {
    return Array.from(this.memories.values())
      .filter(m => m.importance >= min && m.importance <= max);
  }

  getRecent(count: number): Memory[] {
    return Array.from(this.memories.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  hasMemory(id: string): boolean {
    return this.memories.has(id);
  }

  getMemoryCount(): number {
    return this.memories.size;
  }

  setDecayThreshold(threshold: number): void {
    this.decayThreshold = Math.max(0, Math.min(1, threshold));
  }

  getDecayThreshold(): number {
    return this.decayThreshold;
  }

  clearAll(): void {
    this.memories.clear();
    this.counter = 0;
  }
}

export default MemoryManager;