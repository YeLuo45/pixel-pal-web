/**
 * Memory Engine
 * generic-agent-design Memory Engine - Store + Recall + Forget + Stats
 */

export type MemoryType = 'episodic' | 'semantic' | 'procedural';

export interface Memory {
  id: string;
  content: string;
  type: MemoryType;
  importance: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  accesses: number;
}

export interface MmeStats {
  memories: number;
  totalStored: number;
  totalRecalled: number;
  totalForgotten: number;
  episodic: number;
  semantic: number;
  procedural: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalAccesses: number;
  uniqueContents: number;
  avgImportance: number;
  maxImportance: number;
  minImportance: number;
}

export class MemoryEngine {
  private memories: Map<string, Memory> = new Map();
  private counter = 0;
  private totalStored = 0;
  private totalRecalled = 0;
  private totalForgotten = 0;

  store(content: string, type: MemoryType = 'episodic', importance: number = 1): string {
    const id = `mme-${++this.counter}`;
    this.memories.set(id, {
      id,
      content,
      type,
      importance: Math.max(0, Math.min(10, importance)),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      accesses: 0,
    });
    this.totalStored++;
    return id;
  }

  recall(id: string): Memory | undefined {
    const m = this.memories.get(id);
    if (!m) return undefined;
    if (!m.active) return undefined;
    m.hits++;
    m.accesses++;
    m.updated = Date.now();
    this.totalRecalled++;
    return m;
  }

  forget(id: string): boolean {
    const m = this.memories.get(id);
    if (!m) return false;
    m.active = false;
    m.updated = Date.now();
    this.totalForgotten++;
    return true;
  }

  search(query: string): Memory[] {
    const results: Memory[] = [];
    const q = query.toLowerCase();
    for (const m of this.memories.values()) {
      if (m.active && m.content.toLowerCase().includes(q)) {
        results.push(m);
      }
    }
    return results;
  }

  remove(id: string): boolean {
    return this.memories.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.memories.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setContent(id: string, content: string): boolean {
    const m = this.memories.get(id);
    if (!m) return false;
    m.content = content;
    m.updated = Date.now();
    return true;
  }

  setImportance(id: string, importance: number): boolean {
    const m = this.memories.get(id);
    if (!m) return false;
    m.importance = Math.max(0, Math.min(10, importance));
    m.updated = Date.now();
    return true;
  }

  setType(id: string, type: MemoryType): boolean {
    const m = this.memories.get(id);
    if (!m) return false;
    m.type = type;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.memories.values()) {
      m.active = true;
      m.hits = 0;
      m.accesses = 0;
    }
    this.totalStored = 0;
    this.totalRecalled = 0;
    this.totalForgotten = 0;
  }

  getStats(): MmeStats {
    const all = Array.from(this.memories.values());
    const impArr = all.map(m => m.importance);
    return {
      memories: all.length,
      totalStored: this.totalStored,
      totalRecalled: this.totalRecalled,
      totalForgotten: this.totalForgotten,
      episodic: all.filter(m => m.type === 'episodic').length,
      semantic: all.filter(m => m.type === 'semantic').length,
      procedural: all.filter(m => m.type === 'procedural').length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      totalAccesses: all.reduce((s, m) => s + m.accesses, 0),
      uniqueContents: new Set(all.map(m => m.content)).size,
      avgImportance: all.length > 0 ? Math.round((impArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxImportance: impArr.length > 0 ? Math.max(...impArr) : 0,
      minImportance: impArr.length > 0 ? Math.min(...impArr) : 0,
    };
  }

  getMemory(id: string): Memory | undefined {
    return this.memories.get(id);
  }

  getAllMemories(): Memory[] {
    return Array.from(this.memories.values());
  }

  hasMemory(id: string): boolean {
    return this.memories.has(id);
  }

  getCount(): number {
    return this.memories.size;
  }

  getContent(id: string): string | undefined {
    return this.memories.get(id)?.content;
  }

  getType(id: string): MemoryType | undefined {
    return this.memories.get(id)?.type;
  }

  getImportance(id: string): number {
    return this.memories.get(id)?.importance ?? 0;
  }

  getHits(id: string): number {
    return this.memories.get(id)?.hits ?? 0;
  }

  getAccesses(id: string): number {
    return this.memories.get(id)?.accesses ?? 0;
  }

  isActive(id: string): boolean {
    return this.memories.get(id)?.active ?? false;
  }

  isEpisodic(id: string): boolean {
    return this.memories.get(id)?.type === 'episodic';
  }

  isSemantic(id: string): boolean {
    return this.memories.get(id)?.type === 'semantic';
  }

  isProcedural(id: string): boolean {
    return this.memories.get(id)?.type === 'procedural';
  }

  getByType(type: MemoryType): Memory[] {
    return Array.from(this.memories.values()).filter(m => m.type === type);
  }

  getActiveMemories(): Memory[] {
    return Array.from(this.memories.values()).filter(m => m.active);
  }

  getInactiveMemories(): Memory[] {
    return Array.from(this.memories.values()).filter(m => !m.active);
  }

  getByImportance(min: number, max: number): Memory[] {
    return Array.from(this.memories.values()).filter(m => m.importance >= min && m.importance <= max);
  }

  getAllContents(): string[] {
    return [...new Set(Array.from(this.memories.values()).map(m => m.content))];
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

  getMostImportant(): Memory | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.importance > max.importance ? m : max);
  }

  getMostAccessed(): Memory | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.accesses > max.accesses ? m : max);
  }

  getCreatedAt(id: string): number {
    return this.memories.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.memories.get(id)?.updated ?? 0;
  }

  getTotalStored(): number {
    return this.totalStored;
  }

  getTotalRecalled(): number {
    return this.totalRecalled;
  }

  getTotalForgotten(): number {
    return this.totalForgotten;
  }

  clearAll(): void {
    this.memories.clear();
    this.counter = 0;
    this.totalStored = 0;
    this.totalRecalled = 0;
    this.totalForgotten = 0;
  }
}

export default MemoryEngine;