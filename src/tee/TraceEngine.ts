/**
 * Trace Engine
 * generic-agent-design Trace Engine - Add + Trace + Stats
 */

export type TraceStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TraceEntry {
  id: string;
  name: string;
  status: TraceStatus;
  duration: number;
  level: number;
  parent: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface TeeStats {
  entries: number;
  totalAdded: number;
  totalTraced: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalDuration: number;
  avgDuration: number;
  totalLevel: number;
  avgLevel: number;
  uniqueParents: number;
}

export class TraceEngine {
  private entries: Map<string, TraceEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalTraced = 0;
  private totalDuration = 0;
  private totalLevel = 0;

  add(name: string, parent: string): string {
    const id = `tee-${++this.counter}`;
    this.entries.set(id, {
      id,
      name,
      status: 'pending',
      duration: 0,
      level: 0,
      parent,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  trace(id: string, duration: number): boolean {
    const t = this.entries.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.status = 'running';
    t.duration = duration;
    t.updated = Date.now();
    t.hits++;
    this.totalTraced++;
    this.totalDuration += duration;
    return true;
  }

  complete(id: string): boolean {
    const t = this.entries.get(id);
    if (!t) return false;
    t.status = 'completed';
    t.updated = Date.now();
    return true;
  }

  fail(id: string): boolean {
    const t = this.entries.get(id);
    if (!t) return false;
    t.status = 'failed';
    t.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.entries.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const t = this.entries.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  setParent(id: string, parent: string): boolean {
    const t = this.entries.get(id);
    if (!t) return false;
    t.parent = parent;
    t.updated = Date.now();
    return true;
  }

  setLevel(id: string, level: number): boolean {
    const t = this.entries.get(id);
    if (!t) return false;
    t.level = level;
    this.totalLevel += level;
    t.updated = Date.now();
    return true;
  }

  setStatus(id: string, status: TraceStatus): boolean {
    const t = this.entries.get(id);
    if (!t) return false;
    t.status = status;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.entries.values()) {
      t.status = 'pending';
      t.duration = 0;
      t.level = 0;
      t.active = true;
      t.hits = 0;
    }
    this.totalAdded = 0;
    this.totalTraced = 0;
    this.totalDuration = 0;
    this.totalLevel = 0;
  }

  getStats(): TeeStats {
    const all = Array.from(this.entries.values());
    const dArr = all.map(t => t.duration);
    const lArr = all.map(t => t.level);
    return {
      entries: all.length,
      totalAdded: this.totalAdded,
      totalTraced: this.totalTraced,
      pending: all.filter(t => t.status === 'pending').length,
      running: all.filter(t => t.status === 'running').length,
      completed: all.filter(t => t.status === 'completed').length,
      failed: all.filter(t => t.status === 'failed').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      totalDuration: this.totalDuration,
      avgDuration: all.length > 0 ? Math.round((dArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      totalLevel: this.totalLevel,
      avgLevel: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      uniqueParents: new Set(all.map(t => t.parent).filter(p => p !== '')).size,
    };
  }

  getEntry(id: string): TraceEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): TraceEntry[] {
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

  getParent(id: string): string {
    return this.entries.get(id)?.parent ?? '';
  }

  getLevel(id: string): number {
    return this.entries.get(id)?.level ?? 0;
  }

  getStatus(id: string): TraceStatus | undefined {
    return this.entries.get(id)?.status;
  }

  getDuration(id: string): number {
    return this.entries.get(id)?.duration ?? 0;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entries.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.entries.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.entries.get(id)?.status === 'running';
  }

  isCompleted(id: string): boolean {
    return this.entries.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.entries.get(id)?.status === 'failed';
  }

  getByStatus(status: TraceStatus): TraceEntry[] {
    return Array.from(this.entries.values()).filter(t => t.status === status);
  }

  getActiveEntries(): TraceEntry[] {
    return Array.from(this.entries.values()).filter(t => t.active);
  }

  getInactiveEntries(): TraceEntry[] {
    return Array.from(this.entries.values()).filter(t => !t.active);
  }

  getByParent(parent: string): TraceEntry[] {
    return Array.from(this.entries.values()).filter(t => t.parent === parent);
  }

  getRoots(): TraceEntry[] {
    return Array.from(this.entries.values()).filter(t => t.parent === '');
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(t => t.name))];
  }

  getNewest(): TraceEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): TraceEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
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

  getTotalTraced(): number {
    return this.totalTraced;
  }

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalTraced = 0;
    this.totalDuration = 0;
    this.totalLevel = 0;
  }
}

export default TraceEngine;