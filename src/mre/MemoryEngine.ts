/**
 * Memory Engine
 * generic-agent-design Memory Engine - Store + Recall + Forget + Stats
 */

export interface Memory {
  id: string;
  content: string;
  importance: number;
  accessCount: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface MreStats {
  memories: number;
  totalAccess: number;
  avgImportance: number;
  maxImportance: number;
  minImportance: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueContents: number;
  avgContentLength: number;
  maxContentLength: number;
  minContentLength: number;
  avgAccessCount: number;
  maxAccessCount: number;
  minAccessCount: number;
  totalStores: number;
  avgImportanceOverall: number;
}

export class MemoryEngine {
  private memories: Map<string, Memory> = new Map();
  private counter = 0;
  private totalAccess = 0;
  private totalStores = 0;

  store(content: string, importance: number = 1): string {
    const id = `mre-${++this.counter}`;
    this.memories.set(id, {
      id,
      content,
      importance,
      accessCount: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    this.totalStores++;
    return id;
  }

  recall(id: string): Memory | null {
    const m = this.memories.get(id);
    if (!m) return null;
    if (!m.active) return null;
    m.accessCount++;
    m.history.push(Date.now());
    m.updated = Date.now();
    m.hits++;
    this.totalAccess++;
    return m;
  }

  forget(id: string): boolean {
    return this.memories.delete(id);
  }

  reset(id: string): boolean {
    const m = this.memories.get(id);
    if (!m) return false;
    m.accessCount = 0;
    m.history = [];
    m.updated = Date.now();
    return true;
  }

  getStats(): MreStats {
    const all = Array.from(this.memories.values());
    const importanceValues = all.map(m => m.importance);
    const contentLengths = all.map(m => m.content.length);
    const accessValues = all.map(m => m.accessCount);
    return {
      memories: all.length,
      totalAccess: this.totalAccess,
      avgImportance: all.length > 0 ? Math.round((importanceValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxImportance: importanceValues.length > 0 ? Math.max(...importanceValues) : 0,
      minImportance: importanceValues.length > 0 ? Math.min(...importanceValues) : 0,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueContents: new Set(all.map(m => m.content)).size,
      avgContentLength: all.length > 0 ? Math.round((contentLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxContentLength: contentLengths.length > 0 ? Math.max(...contentLengths) : 0,
      minContentLength: contentLengths.length > 0 ? Math.min(...contentLengths) : 0,
      avgAccessCount: all.length > 0 ? Math.round((accessValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxAccessCount: accessValues.length > 0 ? Math.max(...accessValues) : 0,
      minAccessCount: accessValues.length > 0 ? Math.min(...accessValues) : 0,
      totalStores: this.totalStores,
      avgImportanceOverall: all.length > 0 ? Math.round((importanceValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
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

  getImportance(id: string): number {
    return this.memories.get(id)?.importance ?? 0;
  }

  getAccessCount(id: string): number {
    return this.memories.get(id)?.accessCount ?? 0;
  }

  getContentLength(id: string): number {
    return this.memories.get(id)?.content.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.memories.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.memories.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.memories.get(id)?.active ?? false;
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
    m.importance = importance;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.memories.values()) {
      m.accessCount = 0;
      m.hits = 0;
      m.history = [];
      m.active = true;
    }
    this.totalAccess = 0;
    this.totalStores = 0;
  }

  getByImportance(min: number): Memory[] {
    return Array.from(this.memories.values()).filter(m => m.importance >= min);
  }

  getActiveMemories(): Memory[] {
    return Array.from(this.memories.values()).filter(m => m.active);
  }

  getInactiveMemories(): Memory[] {
    return Array.from(this.memories.values()).filter(m => !m.active);
  }

  getAllContents(): string[] {
    return [...new Set(Array.from(this.memories.values()).map(m => m.content))];
  }

  getContentCount(): number {
    return this.getAllContents().length;
  }

  getMostAccessed(): Memory | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.accessCount > max.accessCount ? m : max);
  }

  getMostImportant(): Memory | null {
    const all = Array.from(this.memories.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.importance > max.importance ? m : max);
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

  getCreatedAt(id: string): number {
    return this.memories.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.memories.get(id)?.updated ?? 0;
  }

  getTotalAccess(): number {
    return this.totalAccess;
  }

  getTotalStores(): number {
    return this.totalStores;
  }

  clearAll(): void {
    this.memories.clear();
    this.counter = 0;
    this.totalAccess = 0;
    this.totalStores = 0;
  }
}

export default MemoryEngine;