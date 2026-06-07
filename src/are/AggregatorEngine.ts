/**
 * Aggregator Engine
 * nanobot-design Aggregator Engine - Add + Aggregate + Stats
 */

export type AggOp = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median';

export interface AggResult {
  id: string;
  op: AggOp;
  values: number[];
  result: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface AreStats {
  results: number;
  totalAdded: number;
  totalAggregated: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  count: number;
  median: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalValues: number;
  avgValues: number;
  maxValues: number;
  minValues: number;
}

function aggregate(op: AggOp, values: number[]): number {
  if (values.length === 0) return 0;
  switch (op) {
    case 'sum': return values.reduce((s, v) => s + v, 0);
    case 'avg': return values.reduce((s, v) => s + v, 0) / values.length;
    case 'min': return Math.min(...values);
    case 'max': return Math.max(...values);
    case 'count': return values.length;
    case 'median': {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
  }
}

export class AggregatorEngine {
  private results: Map<string, AggResult> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalAggregated = 0;
  private totalValues = 0;

  add(op: AggOp, values: number[]): string {
    const id = `are-${++this.counter}`;
    this.results.set(id, {
      id,
      op,
      values: [...values],
      result: aggregate(op, values),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalValues += values.length;
    return id;
  }

  aggregate(id: string, values: number[]): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.values = [...values];
    r.result = aggregate(r.op, values);
    r.updated = Date.now();
    r.hits++;
    this.totalAggregated++;
    this.totalValues += values.length;
    return true;
  }

  remove(id: string): boolean {
    return this.results.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setOp(id: string, op: AggOp): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.op = op;
    r.result = aggregate(op, r.values);
    r.updated = Date.now();
    return true;
  }

  setValues(id: string, values: number[]): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.values = [...values];
    r.result = aggregate(r.op, values);
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.results.values()) {
      r.active = true;
      r.hits = 0;
    }
    this.totalAdded = 0;
    this.totalAggregated = 0;
    this.totalValues = 0;
  }

  getStats(): AreStats {
    const all = Array.from(this.results.values());
    const vArr = all.map(r => r.values.length);
    return {
      results: all.length,
      totalAdded: this.totalAdded,
      totalAggregated: this.totalAggregated,
      sum: all.filter(r => r.op === 'sum').length,
      avg: all.filter(r => r.op === 'avg').length,
      min: all.filter(r => r.op === 'min').length,
      max: all.filter(r => r.op === 'max').length,
      count: all.filter(r => r.op === 'count').length,
      median: all.filter(r => r.op === 'median').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      totalValues: this.totalValues,
      avgValues: all.length > 0 ? Math.round((vArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxValues: vArr.length > 0 ? Math.max(...vArr) : 0,
      minValues: vArr.length > 0 ? Math.min(...vArr) : 0,
    };
  }

  getResult(id: string): AggResult | undefined {
    return this.results.get(id);
  }

  getAllResults(): AggResult[] {
    return Array.from(this.results.values());
  }

  hasResult(id: string): boolean {
    return this.results.has(id);
  }

  getCount(): number {
    return this.results.size;
  }

  getOp(id: string): AggOp | undefined {
    return this.results.get(id)?.op;
  }

  getValues(id: string): number[] {
    return this.results.get(id)?.values ?? [];
  }

  getAggregate(id: string): number {
    return this.results.get(id)?.result ?? 0;
  }

  getHits(id: string): number {
    return this.results.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.results.get(id)?.active ?? false;
  }

  isSum(id: string): boolean {
    return this.results.get(id)?.op === 'sum';
  }

  isAvg(id: string): boolean {
    return this.results.get(id)?.op === 'avg';
  }

  isMin(id: string): boolean {
    return this.results.get(id)?.op === 'min';
  }

  isMax(id: string): boolean {
    return this.results.get(id)?.op === 'max';
  }

  isCount(id: string): boolean {
    return this.results.get(id)?.op === 'count';
  }

  isMedian(id: string): boolean {
    return this.results.get(id)?.op === 'median';
  }

  getByOp(op: AggOp): AggResult[] {
    return Array.from(this.results.values()).filter(r => r.op === op);
  }

  getActiveResults(): AggResult[] {
    return Array.from(this.results.values()).filter(r => r.active);
  }

  getInactiveResults(): AggResult[] {
    return Array.from(this.results.values()).filter(r => !r.active);
  }

  getNewest(): AggResult | null {
    const all = Array.from(this.results.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): AggResult | null {
    const all = Array.from(this.results.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.results.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.results.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalAggregated(): number {
    return this.totalAggregated;
  }

  clearAll(): void {
    this.results.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalAggregated = 0;
    this.totalValues = 0;
  }
}

export default AggregatorEngine;