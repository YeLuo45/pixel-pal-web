/**
 * Context Engine
 * generic-agent-design Context Engine - Set + Get + Switch + Stats
 */

export interface ContextItem {
  id: string;
  key: string;
  value: string;
  priority: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface CxeStats {
  contexts: number;
  totalGets: number;
  totalSets: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueKeys: number;
  avgPriority: number;
  maxPriority: number;
  minPriority: number;
  avgValueLength: number;
  maxValueLength: number;
  minValueLength: number;
  uniqueValues: number;
}

export class ContextEngine {
  private contexts: Map<string, ContextItem> = new Map();
  private counter = 0;
  private totalGets = 0;
  private totalSets = 0;

  set(key: string, value: string, priority: number = 0): string {
    const id = `cxe-${++this.counter}`;
    this.contexts.set(id, {
      id,
      key,
      value,
      priority,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    this.totalSets++;
    return id;
  }

  get(id: string): string | undefined {
    this.totalGets++;
    const c = this.contexts.get(id);
    if (!c) return undefined;
    if (!c.active) return undefined;
    c.hits++;
    c.updated = Date.now();
    return c.value;
  }

  getByKey(key: string): ContextItem | undefined {
    let result: ContextItem | undefined;
    let bestPriority = -Infinity;
    for (const c of this.contexts.values()) {
      if (c.key === key && c.active && c.priority > bestPriority) {
        result = c;
        bestPriority = c.priority;
      }
    }
    return result;
  }

  switch(id: string, newValue: string): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    c.value = newValue;
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.contexts.delete(id);
  }

  resetAll(): void {
    for (const c of this.contexts.values()) {
      c.hits = 0;
      c.history = [];
      c.active = true;
    }
    this.totalGets = 0;
    this.totalSets = 0;
  }

  getStats(): CxeStats {
    const all = Array.from(this.contexts.values());
    const priorityValues = all.map(c => c.priority);
    const valueLengths = all.map(c => c.value.length);
    return {
      contexts: all.length,
      totalGets: this.totalGets,
      totalSets: this.totalSets,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueKeys: new Set(all.map(c => c.key)).size,
      avgPriority: all.length > 0 ? Math.round((priorityValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPriority: priorityValues.length > 0 ? Math.max(...priorityValues) : 0,
      minPriority: priorityValues.length > 0 ? Math.min(...priorityValues) : 0,
      avgValueLength: all.length > 0 ? Math.round((valueLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxValueLength: valueLengths.length > 0 ? Math.max(...valueLengths) : 0,
      minValueLength: valueLengths.length > 0 ? Math.min(...valueLengths) : 0,
      uniqueValues: new Set(all.map(c => c.value)).size,
    };
  }

  getContext(id: string): ContextItem | undefined {
    return this.contexts.get(id);
  }

  getAllContexts(): ContextItem[] {
    return Array.from(this.contexts.values());
  }

  hasContext(id: string): boolean {
    return this.contexts.has(id);
  }

  getCount(): number {
    return this.contexts.size;
  }

  getKey(id: string): string | undefined {
    return this.contexts.get(id)?.key;
  }

  getValue(id: string): string | undefined {
    return this.contexts.get(id)?.value;
  }

  getPriority(id: string): number {
    return this.contexts.get(id)?.priority ?? 0;
  }

  getValueLength(id: string): number {
    return this.contexts.get(id)?.value.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.contexts.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.contexts.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.contexts.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setKey(id: string, key: string): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    c.key = key;
    c.updated = Date.now();
    return true;
  }

  setPriority(id: string, priority: number): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    c.priority = priority;
    c.updated = Date.now();
    return true;
  }

  getByKeyAll(key: string): ContextItem[] {
    return Array.from(this.contexts.values()).filter(c => c.key === key);
  }

  getActiveContexts(): ContextItem[] {
    return Array.from(this.contexts.values()).filter(c => c.active);
  }

  getInactiveContexts(): ContextItem[] {
    return Array.from(this.contexts.values()).filter(c => !c.active);
  }

  getAllKeys(): string[] {
    return [...new Set(Array.from(this.contexts.values()).map(c => c.key))];
  }

  getKeyCount(): number {
    return this.getAllKeys().length;
  }

  getByMinPriority(min: number): ContextItem[] {
    return Array.from(this.contexts.values()).filter(c => c.priority >= min);
  }

  getNewest(): ContextItem | null {
    const all = Array.from(this.contexts.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): ContextItem | null {
    const all = Array.from(this.contexts.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.contexts.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.contexts.get(id)?.updated ?? 0;
  }

  getTotalGets(): number {
    return this.totalGets;
  }

  getTotalSets(): number {
    return this.totalSets;
  }

  clearAll(): void {
    this.contexts.clear();
    this.counter = 0;
    this.totalGets = 0;
    this.totalSets = 0;
  }
}

export default ContextEngine;