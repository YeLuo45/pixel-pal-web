/**
 * Inspector Engine
 * claude-code-design Inspector Engine - Add + Inspect + Stats
 */

export type InspectKind = 'object' | 'array' | 'function' | 'string' | 'number' | 'boolean';

export interface InspectEntry {
  id: string;
  name: string;
  kind: InspectKind;
  detail: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface IseStats {
  entries: number;
  totalAdded: number;
  totalInspected: number;
  object: number;
  array: number;
  function: number;
  string: number;
  number: number;
  boolean: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalDetailLen: number;
  avgDetailLen: number;
  maxDetailLen: number;
  minDetailLen: number;
}

function kindOf(value: unknown): InspectKind {
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'function') return 'function';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'object';
}

export class InspectorEngine {
  private entries: Map<string, InspectEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalInspected = 0;
  private totalDetailLen = 0;

  add(name: string, value: unknown): string {
    const id = `ise-${++this.counter}`;
    const kind = kindOf(value);
    const detail = kind === 'function' ? '[function]' : JSON.stringify(value);
    this.entries.set(id, {
      id,
      name,
      kind,
      detail,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalDetailLen += detail.length;
    return id;
  }

  inspect(id: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    if (!e.active) return false;
    e.updated = Date.now();
    e.hits++;
    this.totalInspected++;
    return true;
  }

  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.name = name;
    e.updated = Date.now();
    return true;
  }

  setKind(id: string, kind: InspectKind): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.kind = kind;
    e.updated = Date.now();
    return true;
  }

  setDetail(id: string, detail: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.detail = detail;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.active = true;
      e.hits = 0;
    }
    this.totalAdded = 0;
    this.totalInspected = 0;
    this.totalDetailLen = 0;
  }

  getStats(): IseStats {
    const all = Array.from(this.entries.values());
    const dArr = all.map(e => e.detail.length);
    return {
      entries: all.length,
      totalAdded: this.totalAdded,
      totalInspected: this.totalInspected,
      object: all.filter(e => e.kind === 'object').length,
      array: all.filter(e => e.kind === 'array').length,
      function: all.filter(e => e.kind === 'function').length,
      string: all.filter(e => e.kind === 'string').length,
      number: all.filter(e => e.kind === 'number').length,
      boolean: all.filter(e => e.kind === 'boolean').length,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueNames: new Set(all.map(e => e.name)).size,
      totalDetailLen: this.totalDetailLen,
      avgDetailLen: all.length > 0 ? Math.round((dArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxDetailLen: dArr.length > 0 ? Math.max(...dArr) : 0,
      minDetailLen: dArr.length > 0 ? Math.min(...dArr) : 0,
    };
  }

  getEntry(id: string): InspectEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): InspectEntry[] {
    return Array.from(this.entries.values());
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getName(id: string): string | undefined {
    return this.entries.get(id)?.name;
  }

  getKind(id: string): InspectKind | undefined {
    return this.entries.get(id)?.kind;
  }

  getDetail(id: string): string | undefined {
    return this.entries.get(id)?.detail;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entries.get(id)?.active ?? false;
  }

  isObject(id: string): boolean {
    return this.entries.get(id)?.kind === 'object';
  }

  isArray(id: string): boolean {
    return this.entries.get(id)?.kind === 'array';
  }

  isFunction(id: string): boolean {
    return this.entries.get(id)?.kind === 'function';
  }

  isString(id: string): boolean {
    return this.entries.get(id)?.kind === 'string';
  }

  isNumber(id: string): boolean {
    return this.entries.get(id)?.kind === 'number';
  }

  isBoolean(id: string): boolean {
    return this.entries.get(id)?.kind === 'boolean';
  }

  getByKind(kind: InspectKind): InspectEntry[] {
    return Array.from(this.entries.values()).filter(e => e.kind === kind);
  }

  getActiveEntries(): InspectEntry[] {
    return Array.from(this.entries.values()).filter(e => e.active);
  }

  getInactiveEntries(): InspectEntry[] {
    return Array.from(this.entries.values()).filter(e => !e.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.name))];
  }

  getNewest(): InspectEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): InspectEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.entries.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.entries.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalInspected(): number {
    return this.totalInspected;
  }

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalInspected = 0;
    this.totalDetailLen = 0;
  }
}

export default InspectorEngine;