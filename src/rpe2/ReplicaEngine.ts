/**
 * Replica Engine
 * thunderbolt-design Replica Engine - Add + Sync + Failover + Stats
 */

export type ReplicaState = 'active' | 'passive' | 'syncing' | 'failed';

export interface Replica {
  id: string;
  name: string;
  state: ReplicaState;
  isPrimary: boolean;
  lag: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Rpe2Stats {
  replicas: number;
  totalAdded: number;
  totalSynced: number;
  totalFailovers: number;
  active: number;
  passive: number;
  syncing: number;
  failed: number;
  primary: number;
  nonPrimary: number;
  active2: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalLag: number;
  avgLag: number;
  maxLag: number;
}

export class ReplicaEngine {
  private replicas: Map<string, Replica> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalSynced = 0;
  private totalFailovers = 0;
  private totalLag = 0;

  add(name: string, isPrimary: boolean = false): string {
    const id = `rpe2-${++this.counter}`;
    this.replicas.set(id, {
      id,
      name,
      state: isPrimary ? 'active' : 'passive',
      isPrimary,
      lag: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  sync(id: string, lag: number): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.lag = Math.max(0, lag);
    r.state = 'syncing';
    r.updated = Date.now();
    r.hits++;
    this.totalSynced++;
    this.totalLag += r.lag;
    return true;
  }

  failover(id: string): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.isPrimary = !r.isPrimary;
    r.state = r.isPrimary ? 'active' : 'passive';
    r.updated = Date.now();
    r.hits++;
    this.totalFailovers++;
    return true;
  }

  fail(id: string): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    r.state = 'failed';
    r.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.replicas.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setState(id: string, state: ReplicaState): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    r.state = state;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.replicas.values()) {
      r.state = r.isPrimary ? 'active' : 'passive';
      r.lag = 0;
      r.active = true;
      r.hits = 0;
    }
    this.totalAdded = 0;
    this.totalSynced = 0;
    this.totalFailovers = 0;
    this.totalLag = 0;
  }

  getStats(): Rpe2Stats {
    const all = Array.from(this.replicas.values());
    const lArr = all.map(r => r.lag);
    return {
      replicas: all.length,
      totalAdded: this.totalAdded,
      totalSynced: this.totalSynced,
      totalFailovers: this.totalFailovers,
      active: all.filter(r => r.state === 'active').length,
      passive: all.filter(r => r.state === 'passive').length,
      syncing: all.filter(r => r.state === 'syncing').length,
      failed: all.filter(r => r.state === 'failed').length,
      primary: all.filter(r => r.isPrimary).length,
      nonPrimary: all.filter(r => !r.isPrimary).length,
      active2: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
      totalLag: this.totalLag,
      avgLag: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLag: lArr.length > 0 ? Math.max(...lArr) : 0,
    };
  }

  getReplica(id: string): Replica | undefined {
    return this.replicas.get(id);
  }

  getAllReplicas(): Replica[] {
    return Array.from(this.replicas.values());
  }

  hasReplica(id: string): boolean {
    return this.replicas.has(id);
  }

  getCount(): number {
    return this.replicas.size;
  }

  getName(id: string): string | undefined {
    return this.replicas.get(id)?.name;
  }

  getState(id: string): ReplicaState | undefined {
    return this.replicas.get(id)?.state;
  }

  getLag(id: string): number {
    return this.replicas.get(id)?.lag ?? 0;
  }

  isPrimary(id: string): boolean {
    return this.replicas.get(id)?.isPrimary ?? false;
  }

  getHits(id: string): number {
    return this.replicas.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.replicas.get(id)?.active ?? false;
  }

  isActiveState(id: string): boolean {
    return this.replicas.get(id)?.state === 'active';
  }

  isPassive(id: string): boolean {
    return this.replicas.get(id)?.state === 'passive';
  }

  isSyncing(id: string): boolean {
    return this.replicas.get(id)?.state === 'syncing';
  }

  isFailed(id: string): boolean {
    return this.replicas.get(id)?.state === 'failed';
  }

  getByState(state: ReplicaState): Replica[] {
    return Array.from(this.replicas.values()).filter(r => r.state === state);
  }

  getActiveReplicas(): Replica[] {
    return Array.from(this.replicas.values()).filter(r => r.active);
  }

  getInactiveReplicas(): Replica[] {
    return Array.from(this.replicas.values()).filter(r => !r.active);
  }

  getPrimaryReplicas(): Replica[] {
    return Array.from(this.replicas.values()).filter(r => r.isPrimary);
  }

  getNonPrimaryReplicas(): Replica[] {
    return Array.from(this.replicas.values()).filter(r => !r.isPrimary);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.replicas.values()).map(r => r.name))];
  }

  getNewest(): Replica | null {
    const all = Array.from(this.replicas.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Replica | null {
    const all = Array.from(this.replicas.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.replicas.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.replicas.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalSynced(): number {
    return this.totalSynced;
  }

  getTotalFailovers(): number {
    return this.totalFailovers;
  }

  clearAll(): void {
    this.replicas.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalSynced = 0;
    this.totalFailovers = 0;
    this.totalLag = 0;
  }
}

export default ReplicaEngine;