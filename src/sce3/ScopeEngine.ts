/**
 * Scope Engine
 * claude-code-design Scope Engine - Add + Enter + Exit + Stats
 */

export type ScopeType = 'function' | 'block' | 'module' | 'global';

export interface Scope {
  id: string;
  name: string;
  type: ScopeType;
  entered: number;
  exited: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SceScopeStats {
  scopes: number;
  totalAdded: number;
  totalEntered: number;
  totalExited: number;
  function: number;
  block: number;
  module: number;
  global: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalEntered: number;
  totalExited: number;
  netDepth: number;
}

export class ScopeEngine {
  private scopes: Map<string, Scope> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalEntered = 0;
  private totalExited = 0;

  add(name: string, type: ScopeType): string {
    const id = `sce-scope-${++this.counter}`;
    this.scopes.set(id, {
      id,
      name,
      type,
      entered: 0,
      exited: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  enter(id: string): boolean {
    const s = this.scopes.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.entered++;
    s.updated = Date.now();
    s.hits++;
    this.totalEntered++;
    return true;
  }

  exit(id: string): boolean {
    const s = this.scopes.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.entered <= s.exited) return false;
    s.exited++;
    s.updated = Date.now();
    s.hits++;
    this.totalExited++;
    return true;
  }

  depth(id: string): number {
    const s = this.scopes.get(id);
    if (!s) return 0;
    return s.entered - s.exited;
  }

  remove(id: string): boolean {
    return this.scopes.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.scopes.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.scopes.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setType(id: string, type: ScopeType): boolean {
    const s = this.scopes.get(id);
    if (!s) return false;
    s.type = type;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.scopes.values()) {
      s.entered = 0;
      s.exited = 0;
      s.active = true;
      s.hits = 0;
    }
    this.totalAdded = 0;
    this.totalEntered = 0;
    this.totalExited = 0;
  }

  getStats(): SceScopeStats {
    const all = Array.from(this.scopes.values());
    return {
      scopes: all.length,
      totalAdded: this.totalAdded,
      totalEntered: this.totalEntered,
      totalExited: this.totalExited,
      function: all.filter(s => s.type === 'function').length,
      block: all.filter(s => s.type === 'block').length,
      module: all.filter(s => s.type === 'module').length,
      global: all.filter(s => s.type === 'global').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      totalEntered: all.reduce((s, x) => s + x.entered, 0),
      totalExited: all.reduce((s, x) => s + x.exited, 0),
      netDepth: all.reduce((s, x) => s + (x.entered - x.exited), 0),
    };
  }

  getScope(id: string): Scope | undefined {
    return this.scopes.get(id);
  }

  getAllScopes(): Scope[] {
    return Array.from(this.scopes.values());
  }

  hasScope(id: string): boolean {
    return this.scopes.has(id);
  }

  getCount(): number {
    return this.scopes.size;
  }

  getName(id: string): string | undefined {
    return this.scopes.get(id)?.name;
  }

  getType(id: string): ScopeType | undefined {
    return this.scopes.get(id)?.type;
  }

  getEntered(id: string): number {
    return this.scopes.get(id)?.entered ?? 0;
  }

  getExited(id: string): number {
    return this.scopes.get(id)?.exited ?? 0;
  }

  getHits(id: string): number {
    return this.scopes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.scopes.get(id)?.active ?? false;
  }

  isFunction(id: string): boolean {
    return this.scopes.get(id)?.type === 'function';
  }

  isBlock(id: string): boolean {
    return this.scopes.get(id)?.type === 'block';
  }

  isModule(id: string): boolean {
    return this.scopes.get(id)?.type === 'module';
  }

  isGlobal(id: string): boolean {
    return this.scopes.get(id)?.type === 'global';
  }

  getByType(type: ScopeType): Scope[] {
    return Array.from(this.scopes.values()).filter(s => s.type === type);
  }

  getActiveScopes(): Scope[] {
    return Array.from(this.scopes.values()).filter(s => s.active);
  }

  getInactiveScopes(): Scope[] {
    return Array.from(this.scopes.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.scopes.values()).map(s => s.name))];
  }

  getNewest(): Scope | null {
    const all = Array.from(this.scopes.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Scope | null {
    const all = Array.from(this.scopes.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.scopes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.scopes.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalEntered(): number {
    return this.totalEntered;
  }

  getTotalExited(): number {
    return this.totalExited;
  }

  clearAll(): void {
    this.scopes.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalEntered = 0;
    this.totalExited = 0;
  }
}

export default ScopeEngine;