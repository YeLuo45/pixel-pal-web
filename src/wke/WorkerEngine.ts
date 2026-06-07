/**
 * Worker Engine
 * thunderbolt-design Worker Engine - Spawn + Process + Stop + Stats
 */

export type WorkerStatus = 'idle' | 'busy' | 'stopped' | 'errored';

export interface Worker {
  id: string;
  name: string;
  status: WorkerStatus;
  processed: number;
  errors: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface WkeStats {
  workers: number;
  totalSpawned: number;
  totalProcessed: number;
  totalErrors: number;
  totalStopped: number;
  idle: number;
  busy: number;
  stopped: number;
  errored: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalProcessed2: number;
  totalErrors2: number;
  avgProcessed: number;
  maxProcessed: number;
  minProcessed: number;
}

export class WorkerEngine {
  private workers: Map<string, Worker> = new Map();
  private counter = 0;
  private totalSpawned = 0;
  private totalProcessed = 0;
  private totalErrors = 0;
  private totalStopped = 0;

  spawn(name: string): string {
    const id = `wke-${++this.counter}`;
    this.workers.set(id, {
      id,
      name,
      status: 'idle',
      processed: 0,
      errors: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalSpawned++;
    return id;
  }

  process(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    if (!w.active) return false;
    if (w.status === 'stopped') return false;
    w.status = 'busy';
    w.processed++;
    w.updated = Date.now();
    w.hits++;
    this.totalProcessed++;
    return true;
  }

  done(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.status = 'idle';
    w.updated = Date.now();
    return true;
  }

  fail(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.status = 'errored';
    w.errors++;
    w.updated = Date.now();
    w.hits++;
    this.totalErrors++;
    return true;
  }

  stop(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.status = 'stopped';
    w.updated = Date.now();
    w.hits++;
    this.totalStopped++;
    return true;
  }

  remove(id: string): boolean {
    return this.workers.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.active = active;
    w.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.name = name;
    w.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const w of this.workers.values()) {
      w.status = 'idle';
      w.processed = 0;
      w.errors = 0;
      w.active = true;
      w.hits = 0;
    }
    this.totalSpawned = 0;
    this.totalProcessed = 0;
    this.totalErrors = 0;
    this.totalStopped = 0;
  }

  getStats(): WkeStats {
    const all = Array.from(this.workers.values());
    const procArr = all.map(w => w.processed);
    return {
      workers: all.length,
      totalSpawned: this.totalSpawned,
      totalProcessed: this.totalProcessed,
      totalErrors: this.totalErrors,
      totalStopped: this.totalStopped,
      idle: all.filter(w => w.status === 'idle').length,
      busy: all.filter(w => w.status === 'busy').length,
      stopped: all.filter(w => w.status === 'stopped').length,
      errored: all.filter(w => w.status === 'errored').length,
      active: all.filter(w => w.active).length,
      inactive: all.filter(w => !w.active).length,
      totalHits: all.reduce((s, w) => s + w.hits, 0),
      uniqueNames: new Set(all.map(w => w.name)).size,
      totalProcessed2: all.reduce((s, w) => s + w.processed, 0),
      totalErrors2: all.reduce((s, w) => s + w.errors, 0),
      avgProcessed: all.length > 0 ? Math.round((procArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxProcessed: procArr.length > 0 ? Math.max(...procArr) : 0,
      minProcessed: procArr.length > 0 ? Math.min(...procArr) : 0,
    };
  }

  getWorker(id: string): Worker | undefined {
    return this.workers.get(id);
  }

  getAllWorkers(): Worker[] {
    return Array.from(this.workers.values());
  }

  hasWorker(id: string): boolean {
    return this.workers.has(id);
  }

  getCount(): number {
    return this.workers.size;
  }

  getName(id: string): string | undefined {
    return this.workers.get(id)?.name;
  }

  getStatus(id: string): WorkerStatus | undefined {
    return this.workers.get(id)?.status;
  }

  getProcessed(id: string): number {
    return this.workers.get(id)?.processed ?? 0;
  }

  getErrors(id: string): number {
    return this.workers.get(id)?.errors ?? 0;
  }

  getHits(id: string): number {
    return this.workers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.workers.get(id)?.active ?? false;
  }

  isIdle(id: string): boolean {
    return this.workers.get(id)?.status === 'idle';
  }

  isBusy(id: string): boolean {
    return this.workers.get(id)?.status === 'busy';
  }

  isStopped(id: string): boolean {
    return this.workers.get(id)?.status === 'stopped';
  }

  isErrored(id: string): boolean {
    return this.workers.get(id)?.status === 'errored';
  }

  getByStatus(status: WorkerStatus): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.status === status);
  }

  getActiveWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.active);
  }

  getInactiveWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => !w.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.workers.values()).map(w => w.name))];
  }

  getNewest(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.created > max.created ? w : max);
  }

  getOldest(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((min, w) => w.created < min.created ? w : min);
  }

  getCreatedAt(id: string): number {
    return this.workers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.workers.get(id)?.updated ?? 0;
  }

  getTotalSpawned(): number {
    return this.totalSpawned;
  }

  getTotalProcessed(): number {
    return this.totalProcessed;
  }

  getTotalErrors(): number {
    return this.totalErrors;
  }

  getTotalStopped(): number {
    return this.totalStopped;
  }

  clearAll(): void {
    this.workers.clear();
    this.counter = 0;
    this.totalSpawned = 0;
    this.totalProcessed = 0;
    this.totalErrors = 0;
    this.totalStopped = 0;
  }
}

export default WorkerEngine;