/**
 * Sync Engine
 * nanobot-design Sync Engine - Register + Sync + Resolve + Stats
 */

export type SyncDirection = 'pull' | 'push' | 'bi-directional';

export interface SyncTask {
  id: string;
  source: string;
  target: string;
  direction: SyncDirection;
  records: number;
  conflicts: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SteStats {
  tasks: number;
  totalSynced: number;
  totalConflicts: number;
  pull: number;
  push: number;
  bidirectional: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueSources: number;
  uniqueTargets: number;
  totalRecords: number;
  avgRecords: number;
  maxRecords: number;
  minRecords: number;
}

export class SyncEngine {
  private tasks: Map<string, SyncTask> = new Map();
  private counter = 0;
  private totalSynced = 0;
  private totalConflicts = 0;

  register(source: string, target: string, direction: SyncDirection): string {
    const id = `ste-${++this.counter}`;
    this.tasks.set(id, {
      id,
      source,
      target,
      direction,
      records: 0,
      conflicts: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  sync(id: string, recordCount: number = 1, conflictCount: number = 0): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.records += recordCount;
    t.conflicts += conflictCount;
    t.updated = Date.now();
    t.hits++;
    this.totalSynced++;
    this.totalConflicts += conflictCount;
    return true;
  }

  resolve(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.conflicts = 0;
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setSource(id: string, source: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.source = source;
    t.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.target = target;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.tasks.values()) {
      t.records = 0;
      t.conflicts = 0;
      t.active = true;
      t.hits = 0;
    }
    this.totalSynced = 0;
    this.totalConflicts = 0;
  }

  getStats(): SteStats {
    const all = Array.from(this.tasks.values());
    const recordsArr = all.map(t => t.records);
    return {
      tasks: all.length,
      totalSynced: this.totalSynced,
      totalConflicts: this.totalConflicts,
      pull: all.filter(t => t.direction === 'pull').length,
      push: all.filter(t => t.direction === 'push').length,
      bidirectional: all.filter(t => t.direction === 'bi-directional').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueSources: new Set(all.map(t => t.source)).size,
      uniqueTargets: new Set(all.map(t => t.target)).size,
      totalRecords: all.reduce((s, t) => s + t.records, 0),
      avgRecords: all.length > 0 ? Math.round((recordsArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxRecords: recordsArr.length > 0 ? Math.max(...recordsArr) : 0,
      minRecords: recordsArr.length > 0 ? Math.min(...recordsArr) : 0,
    };
  }

  getTask(id: string): SyncTask | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): SyncTask[] {
    return Array.from(this.tasks.values());
  }

  hasTask(id: string): boolean {
    return this.tasks.has(id);
  }

  getCount(): number {
    return this.tasks.size;
  }

  getSource(id: string): string | undefined {
    return this.tasks.get(id)?.source;
  }

  getTarget(id: string): string | undefined {
    return this.tasks.get(id)?.target;
  }

  getDirection(id: string): SyncDirection | undefined {
    return this.tasks.get(id)?.direction;
  }

  getRecords(id: string): number {
    return this.tasks.get(id)?.records ?? 0;
  }

  getConflicts(id: string): number {
    return this.tasks.get(id)?.conflicts ?? 0;
  }

  getHits(id: string): number {
    return this.tasks.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.tasks.get(id)?.active ?? false;
  }

  isPull(id: string): boolean {
    return this.tasks.get(id)?.direction === 'pull';
  }

  isPush(id: string): boolean {
    return this.tasks.get(id)?.direction === 'push';
  }

  isBidirectional(id: string): boolean {
    return this.tasks.get(id)?.direction === 'bi-directional';
  }

  getByDirection(direction: SyncDirection): SyncTask[] {
    return Array.from(this.tasks.values()).filter(t => t.direction === direction);
  }

  getActiveTasks(): SyncTask[] {
    return Array.from(this.tasks.values()).filter(t => t.active);
  }

  getInactiveTasks(): SyncTask[] {
    return Array.from(this.tasks.values()).filter(t => !t.active);
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.tasks.values()).map(t => t.source))];
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.tasks.values()).map(t => t.target))];
  }

  getNewest(): SyncTask | null {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): SyncTask | null {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.tasks.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.tasks.get(id)?.updated ?? 0;
  }

  getTotalSynced(): number {
    return this.totalSynced;
  }

  getTotalConflicts(): number {
    return this.totalConflicts;
  }

  clearAll(): void {
    this.tasks.clear();
    this.counter = 0;
    this.totalSynced = 0;
    this.totalConflicts = 0;
  }
}

export default SyncEngine;