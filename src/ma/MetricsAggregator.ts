/**
 * Metrics Aggregator
 * thunderbolt-design Metrics Aggregator - Record + Aggregate + Stats
 */

export type MetricType = 'counter' | 'gauge' | 'histogram';

export interface Metric {
  id: string;
  name: string;
  value: number;
  type: MetricType;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface MetricAggregate {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  latest: number;
}

export interface MAStats {
  metrics: number;
  total: number;
  active: number;
  inactive: number;
  counters: number;
  gauges: number;
  histograms: number;
  names: number;
  totalHits: number;
  avgValue: number;
  maxValue: number;
  minValue: number;
}

export class MetricsAggregator {
  private metrics: Map<string, Metric> = new Map();
  private counter = 0;

  record(name: string, value: number, type: MetricType = 'gauge'): string {
    const id = `ma-${++this.counter}`;
    this.metrics.set(id, {
      id,
      name,
      value,
      type,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [value],
    });
    return id;
  }

  aggregate(name: string): MetricAggregate {
    const filtered = Array.from(this.metrics.values()).filter(m => m.name === name);
    if (filtered.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0, latest: 0 };
    }
    const values = filtered.map(m => m.value);
    return {
      count: filtered.length,
      sum: values.reduce((s, v) => s + v, 0),
      avg: Math.round((values.reduce((s, v) => s + v, 0) / filtered.length) * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: filtered[filtered.length - 1].value,
    };
  }

  getStats(): MAStats {
    const all = Array.from(this.metrics.values());
    const values = all.map(m => m.value);
    return {
      metrics: all.length,
      total: all.length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      counters: all.filter(m => m.type === 'counter').length,
      gauges: all.filter(m => m.type === 'gauge').length,
      histograms: all.filter(m => m.type === 'histogram').length,
      names: new Set(all.map(m => m.name)).size,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      avgValue: all.length > 0 ? Math.round((values.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxValue: all.length > 0 ? Math.max(...values) : 0,
      minValue: all.length > 0 ? Math.min(...values) : 0,
    };
  }

  getMetric(id: string): Metric | undefined {
    return this.metrics.get(id);
  }

  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  removeMetric(id: string): boolean {
    return this.metrics.delete(id);
  }

  hasMetric(id: string): boolean {
    return this.metrics.has(id);
  }

  getCount(): number {
    return this.metrics.size;
  }

  getName(id: string): string | undefined {
    return this.metrics.get(id)?.name;
  }

  getValue(id: string): number {
    return this.metrics.get(id)?.value ?? 0;
  }

  getType(id: string): MetricType | undefined {
    return this.metrics.get(id)?.type;
  }

  getHistory(id: string): number[] {
    return [...(this.metrics.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.metrics.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.metrics.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.metrics.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const m = this.metrics.get(id);
    if (!m) return false;
    m.name = name;
    m.updated = Date.now();
    return true;
  }

  setValue(id: string, value: number): boolean {
    const m = this.metrics.get(id);
    if (!m) return false;
    m.value = value;
    m.history.push(value);
    m.hits++;
    m.updated = Date.now();
    return true;
  }

  touch(id: string): boolean {
    const m = this.metrics.get(id);
    if (!m) return false;
    m.hits++;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.metrics.values()) {
      m.history = [m.value];
      m.hits = 0;
      m.active = true;
    }
  }

  getByName(name: string): Metric[] {
    return Array.from(this.metrics.values()).filter(m => m.name === name);
  }

  getByType(type: MetricType): Metric[] {
    return Array.from(this.metrics.values()).filter(m => m.type === type);
  }

  getActiveMetrics(): Metric[] {
    return Array.from(this.metrics.values()).filter(m => m.active);
  }

  getInactiveMetrics(): Metric[] {
    return Array.from(this.metrics.values()).filter(m => !m.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.metrics.values()).map(m => m.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinValue(min: number): Metric[] {
    return Array.from(this.metrics.values()).filter(m => m.value >= min);
  }

  getMostHits(): Metric | null {
    const all = Array.from(this.metrics.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.hits > max.hits ? m : max);
  }

  getNewest(): Metric | null {
    const all = Array.from(this.metrics.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): Metric | null {
    const all = Array.from(this.metrics.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.metrics.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.metrics.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.metrics.clear();
    this.counter = 0;
  }
}

export default MetricsAggregator;