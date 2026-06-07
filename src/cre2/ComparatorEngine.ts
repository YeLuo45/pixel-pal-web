/**
 * Comparator Engine
 * claude-code-design Comparator Engine - Add + Compare + Stats
 */

export type CompareOp = 'eq' | 'ne' | 'gt' | 'lt' | 'le' | 'ge';

export interface Comparison {
  id: string;
  a: number;
  b: number;
  op: CompareOp;
  result: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Cre2Stats {
  comparisons: number;
  totalAdded: number;
  totalCompared: number;
  totalEqual: number;
  totalGreater: number;
  totalLess: number;
  eq: number;
  ne: number;
  gt: number;
  lt: number;
  le: number;
  ge: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalASum: number;
  totalBSum: number;
  avgA: number;
  avgB: number;
  maxA: number;
  minA: number;
}

function doCompare(a: number, b: number, op: CompareOp): boolean {
  switch (op) {
    case 'eq': return a === b;
    case 'ne': return a !== b;
    case 'gt': return a > b;
    case 'lt': return a < b;
    case 'le': return a <= b;
    case 'ge': return a >= b;
  }
}

export class ComparatorEngine {
  private comparisons: Map<string, Comparison> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalCompared = 0;
  private totalEqual = 0;
  private totalGreater = 0;
  private totalLess = 0;
  private totalASum = 0;
  private totalBSum = 0;

  add(a: number, b: number, op: CompareOp): string {
    const id = `cre2-${++this.counter}`;
    this.comparisons.set(id, {
      id,
      a,
      b,
      op,
      result: doCompare(a, b, op),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalASum += a;
    this.totalBSum += b;
    return id;
  }

  compare(id: string, a: number, b: number): boolean {
    const c = this.comparisons.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.a = a;
    c.b = b;
    c.result = doCompare(a, b, c.op);
    c.updated = Date.now();
    c.hits++;
    this.totalCompared++;
    this.totalASum += a;
    this.totalBSum += b;
    return true;
  }

  remove(id: string): boolean {
    return this.comparisons.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.comparisons.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setA(id: string, a: number): boolean {
    const c = this.comparisons.get(id);
    if (!c) return false;
    c.a = a;
    c.result = doCompare(a, c.b, c.op);
    c.updated = Date.now();
    return true;
  }

  setB(id: string, b: number): boolean {
    const c = this.comparisons.get(id);
    if (!c) return false;
    c.b = b;
    c.result = doCompare(c.a, b, c.op);
    c.updated = Date.now();
    return true;
  }

  setOp(id: string, op: CompareOp): boolean {
    const c = this.comparisons.get(id);
    if (!c) return false;
    c.op = op;
    c.result = doCompare(c.a, c.b, op);
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.comparisons.values()) {
      c.active = true;
      c.hits = 0;
    }
    this.totalAdded = 0;
    this.totalCompared = 0;
    this.totalEqual = 0;
    this.totalGreater = 0;
    this.totalLess = 0;
    this.totalASum = 0;
    this.totalBSum = 0;
  }

  getStats(): Cre2Stats {
    const all = Array.from(this.comparisons.values());
    const aArr = all.map(c => c.a);
    return {
      comparisons: all.length,
      totalAdded: this.totalAdded,
      totalCompared: this.totalCompared,
      totalEqual: this.totalEqual,
      totalGreater: this.totalGreater,
      totalLess: this.totalLess,
      eq: all.filter(c => c.op === 'eq').length,
      ne: all.filter(c => c.op === 'ne').length,
      gt: all.filter(c => c.op === 'gt').length,
      lt: all.filter(c => c.op === 'lt').length,
      le: all.filter(c => c.op === 'le').length,
      ge: all.filter(c => c.op === 'ge').length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      totalASum: this.totalASum,
      totalBSum: this.totalBSum,
      avgA: all.length > 0 ? Math.round((aArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgB: 0,
      maxA: aArr.length > 0 ? Math.max(...aArr) : 0,
      minA: aArr.length > 0 ? Math.min(...aArr) : 0,
    };
  }

  getComparison(id: string): Comparison | undefined {
    return this.comparisons.get(id);
  }

  getAllComparisons(): Comparison[] {
    return Array.from(this.comparisons.values());
  }

  hasComparison(id: string): boolean {
    return this.comparisons.has(id);
  }

  getCount(): number {
    return this.comparisons.size;
  }

  getA(id: string): number {
    return this.comparisons.get(id)?.a ?? 0;
  }

  getB(id: string): number {
    return this.comparisons.get(id)?.b ?? 0;
  }

  getOp(id: string): CompareOp | undefined {
    return this.comparisons.get(id)?.op;
  }

  getResult(id: string): boolean {
    return this.comparisons.get(id)?.result ?? false;
  }

  getHits(id: string): number {
    return this.comparisons.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.comparisons.get(id)?.active ?? false;
  }

  isEq(id: string): boolean {
    return this.comparisons.get(id)?.op === 'eq';
  }

  isNe(id: string): boolean {
    return this.comparisons.get(id)?.op === 'ne';
  }

  isGt(id: string): boolean {
    return this.comparisons.get(id)?.op === 'gt';
  }

  isLt(id: string): boolean {
    return this.comparisons.get(id)?.op === 'lt';
  }

  isLe(id: string): boolean {
    return this.comparisons.get(id)?.op === 'le';
  }

  isGe(id: string): boolean {
    return this.comparisons.get(id)?.op === 'ge';
  }

  getByOp(op: CompareOp): Comparison[] {
    return Array.from(this.comparisons.values()).filter(c => c.op === op);
  }

  getActiveComparisons(): Comparison[] {
    return Array.from(this.comparisons.values()).filter(c => c.active);
  }

  getInactiveComparisons(): Comparison[] {
    return Array.from(this.comparisons.values()).filter(c => !c.active);
  }

  getNewest(): Comparison | null {
    const all = Array.from(this.comparisons.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Comparison | null {
    const all = Array.from(this.comparisons.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.comparisons.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.comparisons.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalCompared(): number {
    return this.totalCompared;
  }

  clearAll(): void {
    this.comparisons.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalCompared = 0;
    this.totalEqual = 0;
    this.totalGreater = 0;
    this.totalLess = 0;
    this.totalASum = 0;
    this.totalBSum = 0;
  }
}

export default ComparatorEngine;