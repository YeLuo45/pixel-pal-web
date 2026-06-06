/**
 * Context Engine
 * claude-code-design Context Engine - Create + Set + Get + Activate
 */

export interface Context {
  id: string;
  name: string;
  data: Record<string, unknown>;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface ContextStats {
  contexts: number;
  totalKeys: number;
  active: number;
  inactive: number;
  totalHits: number;
}

export class ContextEngine {
  private contexts: Map<string, Context> = new Map();
  private counter = 0;
  private activeId: string | null = null;

  create(name: string): string {
    const id = `ctx-${++this.counter}`;
    this.contexts.set(id, {
      id,
      name,
      data: {},
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  set(id: string, key: string, value: unknown): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    c.data[key] = value;
    c.updated = Date.now();
    return true;
  }

  get(id: string, key: string): unknown {
    const c = this.contexts.get(id);
    if (!c) return undefined;
    if (!(key in c.data)) return undefined;
    c.hits++;
    return c.data[key];
  }

  activate(id: string): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    if (!c.active) return false;
    this.activeId = id;
    return true;
  }

  getStats(): ContextStats {
    const all = Array.from(this.contexts.values());
    return {
      contexts: all.length,
      totalKeys: all.reduce((s, c) => s + Object.keys(c.data).length, 0),
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
    };
  }

  getContext(id: string): Context | undefined {
    return this.contexts.get(id);
  }

  getAllContexts(): Context[] {
    return Array.from(this.contexts.values());
  }

  removeContext(id: string): boolean {
    if (this.activeId === id) this.activeId = null;
    return this.contexts.delete(id);
  }

  hasContext(id: string): boolean {
    return this.contexts.has(id);
  }

  getCount(): number {
    return this.contexts.size;
  }

  getName(id: string): string | undefined {
    return this.contexts.get(id)?.name;
  }

  getData(id: string): Record<string, unknown> | undefined {
    return this.contexts.get(id)?.data;
  }

  getKeys(id: string): string[] {
    return Object.keys(this.contexts.get(id)?.data ?? {});
  }

  getKeyCount(id: string): number {
    return this.getKeys(id).length;
  }

  hasKey(id: string, key: string): boolean {
    return key in (this.contexts.get(id)?.data ?? {});
  }

  deleteKey(id: string, key: string): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    if (!(key in c.data)) return false;
    delete c.data[key];
    c.updated = Date.now();
    return true;
  }

  clearData(id: string): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    c.data = {};
    c.updated = Date.now();
    return true;
  }

  isActive(id: string): boolean {
    return this.contexts.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    c.active = active;
    if (!active && this.activeId === id) this.activeId = null;
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.contexts.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  getActiveId(): string | null {
    return this.activeId;
  }

  getActiveContext(): Context | null {
    return this.activeId ? (this.contexts.get(this.activeId) ?? null) : null;
  }

  getByName(name: string): Context[] {
    return Array.from(this.contexts.values()).filter(c => c.name === name);
  }

  getActiveContexts(): Context[] {
    return Array.from(this.contexts.values()).filter(c => c.active);
  }

  getInactiveContexts(): Context[] {
    return Array.from(this.contexts.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.contexts.values()).map(c => c.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getMostHit(): Context | null {
    const all = Array.from(this.contexts.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.hits > max.hits ? c : max);
  }

  getMostKeys(): Context | null {
    const all = Array.from(this.contexts.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => Object.keys(c.data).length > Object.keys(max.data).length ? c : max);
  }

  getCreatedAt(id: string): number {
    return this.contexts.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.contexts.get(id)?.updated ?? 0;
  }

  getHits(id: string): number {
    return this.contexts.get(id)?.hits ?? 0;
  }

  clearAll(): void {
    this.contexts.clear();
    this.counter = 0;
    this.activeId = null;
  }
}

export default ContextEngine;