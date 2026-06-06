/**
 * Pool Manager
 * thunderbolt-design Pool Manager - Create + Allocate + Release + Stats
 */

export interface Pool {
  id: string;
  name: string;
  size: number;
  allocated: number;
  available: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface PlmStats {
  pools: number;
  totalAllocated: number;
  totalAvailable: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalSize: number;
  avgSize: number;
  maxSize: number;
  minSize: number;
  utilizationRate: number;
  fullPools: number;
  emptyPools: number;
}

export class PoolManager {
  private pools: Map<string, Pool> = new Map();
  private counter = 0;
  private totalAllocated = 0;
  private totalReleases = 0;

  create(name: string, size: number = 10): string {
    const id = `plm-${++this.counter}`;
    this.pools.set(id, {
      id,
      name,
      size,
      allocated: 0,
      available: size,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  allocate(id: string): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.available <= 0) return false;
    p.allocated++;
    p.available--;
    p.history.push(Date.now());
    p.updated = Date.now();
    p.hits++;
    this.totalAllocated++;
    return true;
  }

  release(id: string): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.allocated <= 0) return false;
    p.allocated--;
    p.available++;
    p.updated = Date.now();
    p.hits++;
    this.totalReleases++;
    return true;
  }

  reset(id: string): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    p.allocated = 0;
    p.available = p.size;
    p.history = [];
    p.updated = Date.now();
    return true;
  }

  resize(id: string, size: number): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    p.size = size;
    p.available = Math.max(0, size - p.allocated);
    p.updated = Date.now();
    return true;
  }

  getStats(): PlmStats {
    const all = Array.from(this.pools.values());
    const sizeValues = all.map(p => p.size);
    const totalSize = sizeValues.reduce((s, v) => s + v, 0);
    const totalAllocated = all.reduce((s, p) => s + p.allocated, 0);
    return {
      pools: all.length,
      totalAllocated: this.totalAllocated,
      totalAvailable: all.reduce((s, p) => s + p.available, 0),
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      totalSize,
      avgSize: all.length > 0 ? Math.round((totalSize / all.length) * 100) / 100 : 0,
      maxSize: sizeValues.length > 0 ? Math.max(...sizeValues) : 0,
      minSize: sizeValues.length > 0 ? Math.min(...sizeValues) : 0,
      utilizationRate: totalSize > 0 ? Math.round((totalAllocated / totalSize) * 100) / 100 : 0,
      fullPools: all.filter(p => p.available === 0).length,
      emptyPools: all.filter(p => p.allocated === 0).length,
    };
  }

  getPool(id: string): Pool | undefined {
    return this.pools.get(id);
  }

  getAllPools(): Pool[] {
    return Array.from(this.pools.values());
  }

  removePool(id: string): boolean {
    return this.pools.delete(id);
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

  getAllocated(id: string): number {
    return this.pools.get(id)?.allocated ?? 0;
  }

  getAvailable(id: string): number {
    return this.pools.get(id)?.available ?? 0;
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

  isFull(id: string): boolean {
    return (this.pools.get(id)?.available ?? 0) === 0;
  }

  isEmpty(id: string): boolean {
    return (this.pools.get(id)?.allocated ?? 0) === 0;
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.pools.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.pools.values()) {
      p.allocated = 0;
      p.available = p.size;
      p.hits = 0;
      p.history = [];
      p.active = true;
    }
    this.totalAllocated = 0;
    this.totalReleases = 0;
  }

  getByName(name: string): Pool[] {
    return Array.from(this.pools.values()).filter(p => p.name === name);
  }

  getActivePools(): Pool[] {
    return Array.from(this.pools.values()).filter(p => p.active);
  }

  getInactivePools(): Pool[] {
    return Array.from(this.pools.values()).filter(p => !p.active);
  }

  getFullPools(): Pool[] {
    return Array.from(this.pools.values()).filter(p => p.available === 0);
  }

  getEmptyPools(): Pool[] {
    return Array.from(this.pools.values()).filter(p => p.allocated === 0);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.pools.values()).map(p => p.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getNewest(): Pool | null {
    const all = Array.from(this.pools.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Pool | null {
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

  getTotalAllocated(): number {
    return this.totalAllocated;
  }

  getTotalReleases(): number {
    return this.totalReleases;
  }

  clearAll(): void {
    this.pools.clear();
    this.counter = 0;
    this.totalAllocated = 0;
    this.totalReleases = 0;
  }
}

export default PoolManager;