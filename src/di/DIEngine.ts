/**
 * DI Engine
 * claude-code-design DI Engine - Register + Resolve + Stats
 */

export interface Dependency {
  id: string;
  name: string;
  value: string;
  resolved: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface DIStats {
  dependencies: number;
  totalResolved: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgResolved: number;
  maxResolved: number;
  minResolved: number;
  totalValueLength: number;
}

export class DIEngine {
  private dependencies: Map<string, Dependency> = new Map();
  private counter = 0;
  private totalResolved = 0;

  register(name: string, value: string): string {
    const id = `di-${++this.counter}`;
    this.dependencies.set(id, {
      id,
      name,
      value,
      resolved: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  resolve(id: string): boolean {
    const d = this.dependencies.get(id);
    if (!d) return false;
    if (!d.active) return false;
    d.resolved++;
    d.history.push(Date.now());
    d.updated = Date.now();
    d.hits++;
    this.totalResolved++;
    return true;
  }

  getValue(id: string): string | undefined {
    const d = this.dependencies.get(id);
    if (!d) return undefined;
    if (!d.active) return undefined;
    return d.value;
  }

  resolveByName(name: string): boolean {
    const d = Array.from(this.dependencies.values()).find(x => x.name === name);
    if (!d) return false;
    return this.resolve(d.id);
  }

  getStats(): DIStats {
    const all = Array.from(this.dependencies.values());
    const resolvedValues = all.map(d => d.resolved);
    return {
      dependencies: all.length,
      totalResolved: this.totalResolved,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      totalHits: all.reduce((s, d) => s + d.hits, 0),
      uniqueNames: new Set(all.map(d => d.name)).size,
      avgResolved: all.length > 0 ? Math.round((resolvedValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxResolved: resolvedValues.length > 0 ? Math.max(...resolvedValues) : 0,
      minResolved: resolvedValues.length > 0 ? Math.min(...resolvedValues) : 0,
      totalValueLength: all.reduce((s, d) => s + d.value.length, 0),
    };
  }

  getDependency(id: string): Dependency | undefined {
    return this.dependencies.get(id);
  }

  getAllDependencies(): Dependency[] {
    return Array.from(this.dependencies.values());
  }

  removeDependency(id: string): boolean {
    return this.dependencies.delete(id);
  }

  hasDependency(id: string): boolean {
    return this.dependencies.has(id);
  }

  getCount(): number {
    return this.dependencies.size;
  }

  getName(id: string): string | undefined {
    return this.dependencies.get(id)?.name;
  }

  getResolved(id: string): number {
    return this.dependencies.get(id)?.resolved ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.dependencies.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.dependencies.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.dependencies.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.dependencies.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const d = this.dependencies.get(id);
    if (!d) return false;
    d.name = name;
    d.updated = Date.now();
    return true;
  }

  setValue(id: string, value: string): boolean {
    const d = this.dependencies.get(id);
    if (!d) return false;
    d.value = value;
    d.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const d of this.dependencies.values()) {
      d.resolved = 0;
      d.hits = 0;
      d.history = [];
      d.active = true;
    }
    this.totalResolved = 0;
  }

  getByName(name: string): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => d.name === name);
  }

  getActiveDependencies(): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => d.active);
  }

  getInactiveDependencies(): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => !d.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.dependencies.values()).map(d => d.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinResolved(min: number): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => d.resolved >= min);
  }

  getMostResolved(): Dependency | null {
    const all = Array.from(this.dependencies.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.resolved > max.resolved ? d : max);
  }

  getNewest(): Dependency | null {
    const all = Array.from(this.dependencies.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): Dependency | null {
    const all = Array.from(this.dependencies.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.dependencies.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.dependencies.get(id)?.updated ?? 0;
  }

  getTotalResolved(): number {
    return this.totalResolved;
  }

  clearAll(): void {
    this.dependencies.clear();
    this.counter = 0;
    this.totalResolved = 0;
  }
}

export default DIEngine;