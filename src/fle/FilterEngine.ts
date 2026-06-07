/**
 * Filter Engine
 * claude-code-design Filter Engine - Add + Apply + Remove + Stats
 */

export type FilterOp = 'eq' | 'ne' | 'gt' | 'lt' | 'contains';

export interface Filter {
  id: string;
  name: string;
  field: string;
  op: FilterOp;
  value: string;
  matched: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface FleStats {
  filters: number;
  totalAdded: number;
  totalApplied: number;
  totalMatched: number;
  totalRemoved: number;
  eq: number;
  ne: number;
  gt: number;
  lt: number;
  contains: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalMatched2: number;
  avgMatched: number;
  maxMatched: number;
  minMatched: number;
}

function matchFilter(op: FilterOp, value: string, target: string): boolean {
  if (op === 'eq') return target === value;
  if (op === 'ne') return target !== value;
  if (op === 'contains') return target.includes(value);
  const n1 = Number(target);
  const n2 = Number(value);
  if (isNaN(n1) || isNaN(n2)) return false;
  if (op === 'gt') return n1 > n2;
  if (op === 'lt') return n1 < n2;
  return false;
}

export class FilterEngine {
  private filters: Map<string, Filter> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalApplied = 0;
  private totalMatched = 0;
  private totalRemoved = 0;

  add(name: string, field: string, op: FilterOp, value: string): string {
    const id = `fle-${++this.counter}`;
    this.filters.set(id, {
      id,
      name,
      field,
      op,
      value,
      matched: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  apply(id: string, data: Record<string, string>): boolean {
    const f = this.filters.get(id);
    if (!f) return false;
    if (!f.active) return false;
    f.updated = Date.now();
    f.hits++;
    this.totalApplied++;
    if (matchFilter(f.op, f.value, data[f.field] ?? '')) {
      f.matched++;
      this.totalMatched++;
      return true;
    }
    return false;
  }

  remove(id: string): boolean {
    const exists = this.filters.has(id);
    if (exists) {
      this.totalRemoved++;
      return this.filters.delete(id);
    }
    return false;
  }

  setActive(id: string, active: boolean): boolean {
    const f = this.filters.get(id);
    if (!f) return false;
    f.active = active;
    f.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const f = this.filters.get(id);
    if (!f) return false;
    f.name = name;
    f.updated = Date.now();
    return true;
  }

  setField(id: string, field: string): boolean {
    const f = this.filters.get(id);
    if (!f) return false;
    f.field = field;
    f.updated = Date.now();
    return true;
  }

  setOp(id: string, op: FilterOp): boolean {
    const f = this.filters.get(id);
    if (!f) return false;
    f.op = op;
    f.updated = Date.now();
    return true;
  }

  setValue(id: string, value: string): boolean {
    const f = this.filters.get(id);
    if (!f) return false;
    f.value = value;
    f.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const f of this.filters.values()) {
      f.matched = 0;
      f.active = true;
      f.hits = 0;
    }
    this.totalAdded = 0;
    this.totalApplied = 0;
    this.totalMatched = 0;
    this.totalRemoved = 0;
  }

  getStats(): FleStats {
    const all = Array.from(this.filters.values());
    const mArr = all.map(f => f.matched);
    return {
      filters: all.length,
      totalAdded: this.totalAdded,
      totalApplied: this.totalApplied,
      totalMatched: this.totalMatched,
      totalRemoved: this.totalRemoved,
      eq: all.filter(f => f.op === 'eq').length,
      ne: all.filter(f => f.op === 'ne').length,
      gt: all.filter(f => f.op === 'gt').length,
      lt: all.filter(f => f.op === 'lt').length,
      contains: all.filter(f => f.op === 'contains').length,
      active: all.filter(f => f.active).length,
      inactive: all.filter(f => !f.active).length,
      totalHits: all.reduce((s, f) => s + f.hits, 0),
      uniqueNames: new Set(all.map(f => f.name)).size,
      totalMatched2: all.reduce((s, f) => s + f.matched, 0),
      avgMatched: all.length > 0 ? Math.round((mArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxMatched: mArr.length > 0 ? Math.max(...mArr) : 0,
      minMatched: mArr.length > 0 ? Math.min(...mArr) : 0,
    };
  }

  getFilter(id: string): Filter | undefined {
    return this.filters.get(id);
  }

  getAllFilters(): Filter[] {
    return Array.from(this.filters.values());
  }

  hasFilter(id: string): boolean {
    return this.filters.has(id);
  }

  getCount(): number {
    return this.filters.size;
  }

  getName(id: string): string | undefined {
    return this.filters.get(id)?.name;
  }

  getField(id: string): string | undefined {
    return this.filters.get(id)?.field;
  }

  getOp(id: string): FilterOp | undefined {
    return this.filters.get(id)?.op;
  }

  getValue(id: string): string | undefined {
    return this.filters.get(id)?.value;
  }

  getMatched(id: string): number {
    return this.filters.get(id)?.matched ?? 0;
  }

  getHits(id: string): number {
    return this.filters.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.filters.get(id)?.active ?? false;
  }

  isEq(id: string): boolean {
    return this.filters.get(id)?.op === 'eq';
  }

  isNe(id: string): boolean {
    return this.filters.get(id)?.op === 'ne';
  }

  isGt(id: string): boolean {
    return this.filters.get(id)?.op === 'gt';
  }

  isLt(id: string): boolean {
    return this.filters.get(id)?.op === 'lt';
  }

  isContains(id: string): boolean {
    return this.filters.get(id)?.op === 'contains';
  }

  getByOp(op: FilterOp): Filter[] {
    return Array.from(this.filters.values()).filter(f => f.op === op);
  }

  getActiveFilters(): Filter[] {
    return Array.from(this.filters.values()).filter(f => f.active);
  }

  getInactiveFilters(): Filter[] {
    return Array.from(this.filters.values()).filter(f => !f.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.filters.values()).map(f => f.name))];
  }

  getNewest(): Filter | null {
    const all = Array.from(this.filters.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.created > max.created ? f : max);
  }

  getOldest(): Filter | null {
    const all = Array.from(this.filters.values());
    if (all.length === 0) return null;
    return all.reduce((min, f) => f.created < min.created ? f : min);
  }

  getCreatedAt(id: string): number {
    return this.filters.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.filters.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalApplied(): number {
    return this.totalApplied;
  }

  getTotalMatched(): number {
    return this.totalMatched;
  }

  getTotalRemoved(): number {
    return this.totalRemoved;
  }

  clearAll(): void {
    this.filters.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalApplied = 0;
    this.totalMatched = 0;
    this.totalRemoved = 0;
  }
}

export default FilterEngine;