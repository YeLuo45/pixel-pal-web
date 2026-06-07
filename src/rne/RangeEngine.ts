/**
 * Range Engine
 * nanobot-design Range Engine - Add + Check + Stats
 */

export type RangeKind = 'numeric' | 'date' | 'time' | 'string';

export interface Range {
  id: string;
  name: string;
  min: number | string;
  max: number | string;
  kind: RangeKind;
  hits: number;
  matches: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface RneStats {
  ranges: number;
  totalAdded: number;
  totalChecked: number;
  numeric: number;
  date: number;
  time: number;
  string: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalMatches: number;
  uniqueNames: number;
}

function checkInRange(value: number | string, min: number | string, max: number | string): boolean {
  if (typeof value === 'number' && typeof min === 'number' && typeof max === 'number') {
    return value >= min && value <= max;
  }
  if (typeof value === 'string' && typeof min === 'string' && typeof max === 'string') {
    return value >= min && value <= max;
  }
  return false;
}

export class RangeEngine {
  private ranges: Map<string, Range> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalChecked = 0;

  add(name: string, min: number | string, max: number | string, kind: RangeKind): string {
    const id = `rne-${++this.counter}`;
    this.ranges.set(id, {
      id,
      name,
      min,
      max,
      kind,
      hits: 0,
      matches: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    return id;
  }

  check(id: string, value: number | string): boolean {
    const r = this.ranges.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.hits++;
    r.updated = Date.now();
    this.totalChecked++;
    const result = checkInRange(value, r.min, r.max);
    if (result) r.matches++;
    return result;
  }

  remove(id: string): boolean {
    return this.ranges.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.ranges.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.ranges.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setMin(id: string, min: number | string): boolean {
    const r = this.ranges.get(id);
    if (!r) return false;
    r.min = min;
    r.updated = Date.now();
    return true;
  }

  setMax(id: string, max: number | string): boolean {
    const r = this.ranges.get(id);
    if (!r) return false;
    r.max = max;
    r.updated = Date.now();
    return true;
  }

  setKind(id: string, kind: RangeKind): boolean {
    const r = this.ranges.get(id);
    if (!r) return false;
    r.kind = kind;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.ranges.values()) {
      r.hits = 0;
      r.matches = 0;
      r.active = true;
    }
    this.totalAdded = 0;
    this.totalChecked = 0;
  }

  getStats(): RneStats {
    const all = Array.from(this.ranges.values());
    return {
      ranges: all.length,
      totalAdded: this.totalAdded,
      totalChecked: this.totalChecked,
      numeric: all.filter(r => r.kind === 'numeric').length,
      date: all.filter(r => r.kind === 'date').length,
      time: all.filter(r => r.kind === 'time').length,
      string: all.filter(r => r.kind === 'string').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      totalMatches: all.reduce((s, r) => s + r.matches, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
    };
  }

  getRange(id: string): Range | undefined {
    return this.ranges.get(id);
  }

  getAllRanges(): Range[] {
    return Array.from(this.ranges.values());
  }

  hasRange(id: string): boolean {
    return this.ranges.has(id);
  }

  getCount(): number {
    return this.ranges.size;
  }

  getName(id: string): string | undefined {
    return this.ranges.get(id)?.name;
  }

  getMin(id: string): number | string | undefined {
    return this.ranges.get(id)?.min;
  }

  getMax(id: string): number | string | undefined {
    return this.ranges.get(id)?.max;
  }

  getKind(id: string): RangeKind | undefined {
    return this.ranges.get(id)?.kind;
  }

  getHits(id: string): number {
    return this.ranges.get(id)?.hits ?? 0;
  }

  getMatches(id: string): number {
    return this.ranges.get(id)?.matches ?? 0;
  }

  isActive(id: string): boolean {
    return this.ranges.get(id)?.active ?? false;
  }

  isNumeric(id: string): boolean {
    return this.ranges.get(id)?.kind === 'numeric';
  }

  isDate(id: string): boolean {
    return this.ranges.get(id)?.kind === 'date';
  }

  isTime(id: string): boolean {
    return this.ranges.get(id)?.kind === 'time';
  }

  isString(id: string): boolean {
    return this.ranges.get(id)?.kind === 'string';
  }

  getByKind(kind: RangeKind): Range[] {
    return Array.from(this.ranges.values()).filter(r => r.kind === kind);
  }

  getActiveRanges(): Range[] {
    return Array.from(this.ranges.values()).filter(r => r.active);
  }

  getInactiveRanges(): Range[] {
    return Array.from(this.ranges.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.ranges.values()).map(r => r.name))];
  }

  getNewest(): Range | null {
    const all = Array.from(this.ranges.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Range | null {
    const all = Array.from(this.ranges.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.ranges.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.ranges.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalChecked(): number {
    return this.totalChecked;
  }

  clearAll(): void {
    this.ranges.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalChecked = 0;
  }
}

export default RangeEngine;