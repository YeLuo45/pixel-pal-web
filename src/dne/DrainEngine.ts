/**
 * Drain Engine
 * thunderbolt-design Drain Engine - AddSink + Push + Flush + Stats
 */

export type DrainMode = 'normal' | 'overflow' | 'drain' | 'closed';

export interface DrainSink {
  id: string;
  name: string;
  capacity: number;
  filled: number;
  mode: DrainMode;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface DneStats {
  sinks: number;
  totalAdded: number;
  totalPushed: number;
  totalFlushed: number;
  normal: number;
  overflow: number;
  drain: number;
  closed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalFilled: number;
  totalCapacity: number;
  avgFillRate: number;
}

export class DrainEngine {
  private sinks: Map<string, DrainSink> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalPushed = 0;
  private totalFlushed = 0;
  private totalFilled = 0;
  private totalCapacity = 0;

  addSink(name: string, capacity: number): string {
    const id = `dne-${++this.counter}`;
    this.sinks.set(id, {
      id,
      name,
      capacity,
      filled: 0,
      mode: 'normal',
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalCapacity += capacity;
    return id;
  }

  push(id: string, amount: number): boolean {
    const s = this.sinks.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.mode === 'closed') return false;
    const newFilled = Math.max(0, s.filled + amount);
    s.filled = newFilled;
    this.totalFilled += amount;
    if (newFilled >= s.capacity) {
      s.mode = 'overflow';
    }
    s.updated = Date.now();
    s.hits++;
    this.totalPushed++;
    return true;
  }

  flush(id: string): boolean {
    const s = this.sinks.get(id);
    if (!s) return false;
    s.filled = 0;
    s.mode = 'drain';
    s.updated = Date.now();
    s.hits++;
    this.totalFlushed++;
    return true;
  }

  close(id: string): boolean {
    const s = this.sinks.get(id);
    if (!s) return false;
    s.mode = 'closed';
    s.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.sinks.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.sinks.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.sinks.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setCapacity(id: string, capacity: number): boolean {
    const s = this.sinks.get(id);
    if (!s) return false;
    s.capacity = capacity;
    s.updated = Date.now();
    return true;
  }

  setMode(id: string, mode: DrainMode): boolean {
    const s = this.sinks.get(id);
    if (!s) return false;
    s.mode = mode;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.sinks.values()) {
      s.filled = 0;
      s.mode = 'normal';
      s.active = true;
      s.hits = 0;
    }
    this.totalAdded = 0;
    this.totalPushed = 0;
    this.totalFlushed = 0;
    this.totalFilled = 0;
    this.totalCapacity = 0;
  }

  getStats(): DneStats {
    const all = Array.from(this.sinks.values());
    return {
      sinks: all.length,
      totalAdded: this.totalAdded,
      totalPushed: this.totalPushed,
      totalFlushed: this.totalFlushed,
      normal: all.filter(s => s.mode === 'normal').length,
      overflow: all.filter(s => s.mode === 'overflow').length,
      drain: all.filter(s => s.mode === 'drain').length,
      closed: all.filter(s => s.mode === 'closed').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      totalFilled: all.reduce((s, x) => s + x.filled, 0),
      totalCapacity: this.totalCapacity,
      avgFillRate: this.totalCapacity > 0 ? Math.round((this.totalFilled / this.totalCapacity) * 100) / 100 : 0,
    };
  }

  getSink(id: string): DrainSink | undefined {
    return this.sinks.get(id);
  }

  getAllSinks(): DrainSink[] {
    return Array.from(this.sinks.values());
  }

  hasSink(id: string): boolean {
    return this.sinks.has(id);
  }

  getCount(): number {
    return this.sinks.size;
  }

  getName(id: string): string | undefined {
    return this.sinks.get(id)?.name;
  }

  getCapacity(id: string): number {
    return this.sinks.get(id)?.capacity ?? 0;
  }

  getFilled(id: string): number {
    return this.sinks.get(id)?.filled ?? 0;
  }

  getMode(id: string): DrainMode | undefined {
    return this.sinks.get(id)?.mode;
  }

  getHits(id: string): number {
    return this.sinks.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.sinks.get(id)?.active ?? false;
  }

  isNormal(id: string): boolean {
    return this.sinks.get(id)?.mode === 'normal';
  }

  isOverflow(id: string): boolean {
    return this.sinks.get(id)?.mode === 'overflow';
  }

  isDrain(id: string): boolean {
    return this.sinks.get(id)?.mode === 'drain';
  }

  isClosed(id: string): boolean {
    return this.sinks.get(id)?.mode === 'closed';
  }

  getByMode(mode: DrainMode): DrainSink[] {
    return Array.from(this.sinks.values()).filter(s => s.mode === mode);
  }

  getActiveSinks(): DrainSink[] {
    return Array.from(this.sinks.values()).filter(s => s.active);
  }

  getInactiveSinks(): DrainSink[] {
    return Array.from(this.sinks.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.sinks.values()).map(s => s.name))];
  }

  getNewest(): DrainSink | null {
    const all = Array.from(this.sinks.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): DrainSink | null {
    const all = Array.from(this.sinks.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.sinks.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.sinks.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalPushed(): number {
    return this.totalPushed;
  }

  getTotalFlushed(): number {
    return this.totalFlushed;
  }

  clearAll(): void {
    this.sinks.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalPushed = 0;
    this.totalFlushed = 0;
    this.totalFilled = 0;
    this.totalCapacity = 0;
  }
}

export default DrainEngine;