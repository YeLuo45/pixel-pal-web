/**
 * Resolver Engine
 * claude-code-design Resolver Engine - Resolve + Stats
 */

export type ResolveMode = 'strict' | 'lenient' | 'default';

export interface Resolve {
  id: string;
  key: string;
  value: string;
  mode: ResolveMode;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface RseStats {
  resolves: number;
  totalAdded: number;
  totalResolved: number;
  strict: number;
  lenient: number;
  default: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueKeys: number;
  uniqueValues: number;
  totalKeyLen: number;
  totalValueLen: number;
  avgKeyLen: number;
  avgValueLen: number;
}

function resolve(key: string, mode: ResolveMode): string | null {
  if (mode === 'strict') {
    return key.length > 0 ? key : null;
  } else if (mode === 'lenient') {
    return key.trim() || null;
  } else {
    return key ? key : '';
  }
}

export class ResolverEngine {
  private resolves: Map<string, Resolve> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalResolved = 0;
  private totalKeyLen = 0;
  private totalValueLen = 0;

  add(key: string, value: string, mode: ResolveMode): string {
    const id = `rse-${++this.counter}`;
    this.resolves.set(id, {
      id,
      key,
      value,
      mode,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalKeyLen += key.length;
    this.totalValueLen += value.length;
    return id;
  }

  resolve(id: string): string | null {
    const r = this.resolves.get(id);
    if (!r) return null;
    if (!r.active) return null;
    r.hits++;
    r.updated = Date.now();
    this.totalResolved++;
    return resolve(r.key, r.mode);
  }

  remove(id: string): boolean {
    return this.resolves.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.resolves.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setKey(id: string, key: string): boolean {
    const r = this.resolves.get(id);
    if (!r) return false;
    r.key = key;
    r.updated = Date.now();
    return true;
  }

  setValue(id: string, value: string): boolean {
    const r = this.resolves.get(id);
    if (!r) return false;
    r.value = value;
    r.updated = Date.now();
    return true;
  }

  setMode(id: string, mode: ResolveMode): boolean {
    const r = this.resolves.get(id);
    if (!r) return false;
    r.mode = mode;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.resolves.values()) {
      r.active = true;
      r.hits = 0;
    }
    this.totalAdded = 0;
    this.totalResolved = 0;
    this.totalKeyLen = 0;
    this.totalValueLen = 0;
  }

  getStats(): RseStats {
    const all = Array.from(this.resolves.values());
    const kArr = all.map(r => r.key.length);
    const vArr = all.map(r => r.value.length);
    return {
      resolves: all.length,
      totalAdded: this.totalAdded,
      totalResolved: this.totalResolved,
      strict: all.filter(r => r.mode === 'strict').length,
      lenient: all.filter(r => r.mode === 'lenient').length,
      default: all.filter(r => r.mode === 'default').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueKeys: new Set(all.map(r => r.key)).size,
      uniqueValues: new Set(all.map(r => r.value)).size,
      totalKeyLen: this.totalKeyLen,
      totalValueLen: this.totalValueLen,
      avgKeyLen: all.length > 0 ? Math.round((kArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgValueLen: all.length > 0 ? Math.round((vArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getResolve(id: string): Resolve | undefined {
    return this.resolves.get(id);
  }

  getAllResolves(): Resolve[] {
    return Array.from(this.resolves.values());
  }

  hasResolve(id: string): boolean {
    return this.resolves.has(id);
  }

  getCount(): number {
    return this.resolves.size;
  }

  getKey(id: string): string | undefined {
    return this.resolves.get(id)?.key;
  }

  getValue(id: string): string | undefined {
    return this.resolves.get(id)?.value;
  }

  getMode(id: string): ResolveMode | undefined {
    return this.resolves.get(id)?.mode;
  }

  getHits(id: string): number {
    return this.resolves.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.resolves.get(id)?.active ?? false;
  }

  isStrict(id: string): boolean {
    return this.resolves.get(id)?.mode === 'strict';
  }

  isLenient(id: string): boolean {
    return this.resolves.get(id)?.mode === 'lenient';
  }

  isDefault(id: string): boolean {
    return this.resolves.get(id)?.mode === 'default';
  }

  getByMode(mode: ResolveMode): Resolve[] {
    return Array.from(this.resolves.values()).filter(r => r.mode === mode);
  }

  getActiveResolves(): Resolve[] {
    return Array.from(this.resolves.values()).filter(r => r.active);
  }

  getInactiveResolves(): Resolve[] {
    return Array.from(this.resolves.values()).filter(r => !r.active);
  }

  getAllKeys(): string[] {
    return [...new Set(Array.from(this.resolves.values()).map(r => r.key))];
  }

  getAllValues(): string[] {
    return [...new Set(Array.from(this.resolves.values()).map(r => r.value))];
  }

  getNewest(): Resolve | null {
    const all = Array.from(this.resolves.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Resolve | null {
    const all = Array.from(this.resolves.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.resolves.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.resolves.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalResolved(): number {
    return this.totalResolved;
  }

  clearAll(): void {
    this.resolves.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalResolved = 0;
    this.totalKeyLen = 0;
    this.totalValueLen = 0;
  }
}

export default ResolverEngine;