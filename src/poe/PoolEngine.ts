/**
 * Pool Engine
 * thunderbolt-design Pool Engine - Acquire + Release + Stats
 */

export type PoolState = 'idle' | 'in-use' | 'closed';

export interface PoolResource {
  id: string;
  name: string;
  state: PoolState;
  acquiredBy: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PoeStats {
  resources: number;
  totalAdded: number;
  totalAcquired: number;
  totalReleased: number;
  idle: number;
  inUse: number;
  closed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueAcquirers: number;
  utilization: number;
}

export class PoolEngine {
  private resources: Map<string, PoolResource> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalAcquired = 0;
  private totalReleased = 0;

  add(name: string): string {
    const id = `poe-${++this.counter}`;
    this.resources.set(id, {
      id,
      name,
      state: 'idle',
      acquiredBy: '',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  acquire(id: string, user: string): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    if (!r.active) return false;
    if (r.state !== 'idle') return false;
    r.state = 'in-use';
    r.acquiredBy = user;
    r.updated = Date.now();
    r.hits++;
    this.totalAcquired++;
    return true;
  }

  release(id: string): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    if (r.state !== 'in-use') return false;
    r.state = 'idle';
    r.acquiredBy = '';
    r.updated = Date.now();
    r.hits++;
    this.totalReleased++;
    return true;
  }

  close(id: string): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.state = 'closed';
    r.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.resources.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setState(id: string, state: PoolState): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.state = state;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.resources.values()) {
      r.state = 'idle';
      r.acquiredBy = '';
      r.active = true;
      r.hits = 0;
    }
    this.totalAdded = 0;
    this.totalAcquired = 0;
    this.totalReleased = 0;
  }

  getStats(): PoeStats {
    const all = Array.from(this.resources.values());
    return {
      resources: all.length,
      totalAdded: this.totalAdded,
      totalAcquired: this.totalAcquired,
      totalReleased: this.totalReleased,
      idle: all.filter(r => r.state === 'idle').length,
      inUse: all.filter(r => r.state === 'in-use').length,
      closed: all.filter(r => r.state === 'closed').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
      uniqueAcquirers: new Set(all.map(r => r.acquiredBy).filter(a => a !== '')).size,
      utilization: all.length > 0 ? Math.round((all.filter(r => r.state === 'in-use').length / all.length) * 100) / 100 : 0,
    };
  }

  getResource(id: string): PoolResource | undefined {
    return this.resources.get(id);
  }

  getAllResources(): PoolResource[] {
    return Array.from(this.resources.values());
  }

  hasResource(id: string): boolean {
    return this.resources.has(id);
  }

  getCount(): number {
    return this.resources.size;
  }

  getName(id: string): string | undefined {
    return this.resources.get(id)?.name;
  }

  getState(id: string): PoolState | undefined {
    return this.resources.get(id)?.state;
  }

  getAcquirer(id: string): string {
    return this.resources.get(id)?.acquiredBy ?? '';
  }

  getHits(id: string): number {
    return this.resources.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.resources.get(id)?.active ?? false;
  }

  isIdle(id: string): boolean {
    return this.resources.get(id)?.state === 'idle';
  }

  isInUse(id: string): boolean {
    return this.resources.get(id)?.state === 'in-use';
  }

  isClosed(id: string): boolean {
    return this.resources.get(id)?.state === 'closed';
  }

  getByState(state: PoolState): PoolResource[] {
    return Array.from(this.resources.values()).filter(r => r.state === state);
  }

  getIdleResources(): PoolResource[] {
    return Array.from(this.resources.values()).filter(r => r.state === 'idle');
  }

  getInUseResources(): PoolResource[] {
    return Array.from(this.resources.values()).filter(r => r.state === 'in-use');
  }

  getClosedResources(): PoolResource[] {
    return Array.from(this.resources.values()).filter(r => r.state === 'closed');
  }

  getActiveResources(): PoolResource[] {
    return Array.from(this.resources.values()).filter(r => r.active);
  }

  getInactiveResources(): PoolResource[] {
    return Array.from(this.resources.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.resources.values()).map(r => r.name))];
  }

  getNewest(): PoolResource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): PoolResource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.resources.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.resources.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalAcquired(): number {
    return this.totalAcquired;
  }

  getTotalReleased(): number {
    return this.totalReleased;
  }

  clearAll(): void {
    this.resources.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalAcquired = 0;
    this.totalReleased = 0;
  }
}

export default PoolEngine;