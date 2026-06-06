/**
 * Worker Pool Manager
 * nanobot-design Worker Pool Manager - Create + AddWorker + RemoveWorker + Stats
 */

export interface WorkerPool {
  id: string;
  name: string;
  workers: string[];
  size: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface WpmStats {
  pools: number;
  totalWorkers: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgSize: number;
  maxSize: number;
  minSize: number;
  avgWorkers: number;
  maxWorkers: number;
  minWorkers: number;
  emptyPools: number;
  fullPools: number;
}

export class WorkerPoolManager {
  private pools: Map<string, WorkerPool> = new Map();
  private counter = 0;

  create(name: string, size: number = 5): string {
    const id = `wpm-${++this.counter}`;
    this.pools.set(id, {
      id,
      name,
      workers: [],
      size,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  addWorker(id: string, worker: string): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.workers.length >= p.size) return false;
    if (!p.workers.includes(worker)) {
      p.workers.push(worker);
      p.updated = Date.now();
    }
    p.hits++;
    return true;
  }

  removeWorker(id: string, worker: string): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    const idx = p.workers.indexOf(worker);
    if (idx < 0) return false;
    p.workers.splice(idx, 1);
    p.updated = Date.now();
    p.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.pools.delete(id);
  }

  resetAll(): void {
    for (const p of this.pools.values()) {
      p.workers = [];
      p.hits = 0;
      p.history = [];
      p.active = true;
    }
  }

  isFull(id: string): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    return p.workers.length >= p.size;
  }

  isEmpty(id: string): boolean {
    return (this.pools.get(id)?.workers.length ?? 0) === 0;
  }

  getAvailable(id: string): number {
    const p = this.pools.get(id);
    if (!p) return 0;
    return Math.max(0, p.size - p.workers.length);
  }

  getStats(): WpmStats {
    const all = Array.from(this.pools.values());
    const sizeValues = all.map(p => p.size);
    const workerValues = all.map(p => p.workers.length);
    return {
      pools: all.length,
      totalWorkers: workerValues.reduce((s, v) => s + v, 0),
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      avgSize: all.length > 0 ? Math.round((sizeValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSize: sizeValues.length > 0 ? Math.max(...sizeValues) : 0,
      minSize: sizeValues.length > 0 ? Math.min(...sizeValues) : 0,
      avgWorkers: all.length > 0 ? Math.round((workerValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxWorkers: workerValues.length > 0 ? Math.max(...workerValues) : 0,
      minWorkers: workerValues.length > 0 ? Math.min(...workerValues) : 0,
      emptyPools: all.filter(p => p.workers.length === 0).length,
      fullPools: all.filter(p => p.workers.length >= p.size).length,
    };
  }

  getPool(id: string): WorkerPool | undefined {
    return this.pools.get(id);
  }

  getAllPools(): WorkerPool[] {
    return Array.from(this.pools.values());
  }

  hasPool(id: string): boolean {
    return this.pools.has(id);
  }

  getCount(): number {
    return this.pools.size;
  }

  getName(id: string): string | undefined {
    return this.pools.get(id)?.name;
  }

  getSize(id: string): number {
    return this.pools.get(id)?.size ?? 0;
  }

  getWorkers(id: string): string[] {
    return [...(this.pools.get(id)?.workers ?? [])];
  }

  getWorkerCount(id: string): number {
    return this.pools.get(id)?.workers.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.pools.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.pools.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.pools.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setSize(id: string, size: number): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    p.size = size;
    p.updated = Date.now();
    return true;
  }

  getByName(name: string): WorkerPool[] {
    return Array.from(this.pools.values()).filter(p => p.name === name);
  }

  getActivePools(): WorkerPool[] {
    return Array.from(this.pools.values()).filter(p => p.active);
  }

  getInactivePools(): WorkerPool[] {
    return Array.from(this.pools.values()).filter(p => !p.active);
  }

  getEmptyPools(): WorkerPool[] {
    return Array.from(this.pools.values()).filter(p => p.workers.length === 0);
  }

  getFullPools(): WorkerPool[] {
    return Array.from(this.pools.values()).filter(p => p.workers.length >= p.size);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.pools.values()).map(p => p.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinWorkers(min: number): WorkerPool[] {
    return Array.from(this.pools.values()).filter(p => p.workers.length >= min);
  }

  getLargest(): WorkerPool | null {
    const all = Array.from(this.pools.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.workers.length > max.workers.length ? p : max);
  }

  getNewest(): WorkerPool | null {
    const all = Array.from(this.pools.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): WorkerPool | null {
    const all = Array.from(this.pools.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.pools.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.pools.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.pools.clear();
    this.counter = 0;
  }
}

export default WorkerPoolManager;