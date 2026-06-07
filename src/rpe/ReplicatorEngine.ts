/**
 * Replicator Engine
 * nanobot-design Replicator Engine - Replicate + Sync + Remove + Stats
 */

export type ReplicateStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface Replica {
  id: string;
  source: string;
  target: string;
  status: ReplicateStatus;
  version: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface RpeStats {
  replicas: number;
  totalReplicated: number;
  totalSynced: number;
  totalFailed: number;
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueSources: number;
  uniqueTargets: number;
  totalVersion: number;
  avgVersion: number;
  maxVersion: number;
  minVersion: number;
}

export class ReplicatorEngine {
  private replicas: Map<string, Replica> = new Map();
  private counter = 0;
  private totalReplicated = 0;
  private totalSynced = 0;
  private totalFailed = 0;
  private totalVersion = 0;

  replicate(source: string, target: string): string {
    const id = `rpe-${++this.counter}`;
    this.replicas.set(id, {
      id,
      source,
      target,
      status: 'pending',
      version: 1,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalReplicated++;
    this.totalVersion++;
    return id;
  }

  sync(id: string): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.status = 'syncing';
    r.updated = Date.now();
    r.hits++;
    return true;
  }

  complete(id: string): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    if (r.status !== 'syncing') return false;
    r.status = 'synced';
    r.version++;
    r.updated = Date.now();
    r.hits++;
    this.totalSynced++;
    this.totalVersion++;
    return true;
  }

  fail(id: string): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    r.status = 'failed';
    r.updated = Date.now();
    r.hits++;
    this.totalFailed++;
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

  setSource(id: string, source: string): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    r.source = source;
    r.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    r.target = target;
    r.updated = Date.now();
    return true;
  }

  setVersion(id: string, version: number): boolean {
    const r = this.replicas.get(id);
    if (!r) return false;
    r.version = version;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.replicas.values()) {
      r.status = 'pending';
      r.version = 1;
      r.active = true;
      r.hits = 0;
    }
    this.totalReplicated = 0;
    this.totalSynced = 0;
    this.totalFailed = 0;
    this.totalVersion = 0;
  }

  getStats(): RpeStats {
    const all = Array.from(this.replicas.values());
    const verArr = all.map(r => r.version);
    return {
      replicas: all.length,
      totalReplicated: this.totalReplicated,
      totalSynced: this.totalSynced,
      totalFailed: this.totalFailed,
      pending: all.filter(r => r.status === 'pending').length,
      syncing: all.filter(r => r.status === 'syncing').length,
      synced: all.filter(r => r.status === 'synced').length,
      failed: all.filter(r => r.status === 'failed').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueSources: new Set(all.map(r => r.source)).size,
      uniqueTargets: new Set(all.map(r => r.target)).size,
      totalVersion: this.totalVersion,
      avgVersion: all.length > 0 ? Math.round((verArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxVersion: verArr.length > 0 ? Math.max(...verArr) : 0,
      minVersion: verArr.length > 0 ? Math.min(...verArr) : 0,
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

  getSource(id: string): string | undefined {
    return this.replicas.get(id)?.source;
  }

  getTarget(id: string): string | undefined {
    return this.replicas.get(id)?.target;
  }

  getStatus(id: string): ReplicateStatus | undefined {
    return this.replicas.get(id)?.status;
  }

  getVersion(id: string): number {
    return this.replicas.get(id)?.version ?? 0;
  }

  getHits(id: string): number {
    return this.replicas.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.replicas.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.replicas.get(id)?.status === 'pending';
  }

  isSyncing(id: string): boolean {
    return this.replicas.get(id)?.status === 'syncing';
  }

  isSynced(id: string): boolean {
    return this.replicas.get(id)?.status === 'synced';
  }

  isFailed(id: string): boolean {
    return this.replicas.get(id)?.status === 'failed';
  }

  getByStatus(status: ReplicateStatus): Replica[] {
    return Array.from(this.replicas.values()).filter(r => r.status === status);
  }

  getActiveReplicas(): Replica[] {
    return Array.from(this.replicas.values()).filter(r => r.active);
  }

  getInactiveReplicas(): Replica[] {
    return Array.from(this.replicas.values()).filter(r => !r.active);
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.replicas.values()).map(r => r.source))];
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.replicas.values()).map(r => r.target))];
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

  getTotalReplicated(): number {
    return this.totalReplicated;
  }

  getTotalSynced(): number {
    return this.totalSynced;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.replicas.clear();
    this.counter = 0;
    this.totalReplicated = 0;
    this.totalSynced = 0;
    this.totalFailed = 0;
    this.totalVersion = 0;
  }
}

export default ReplicatorEngine;