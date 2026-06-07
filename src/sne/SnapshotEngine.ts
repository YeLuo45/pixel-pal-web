/**
 * Snapshot Engine
 * nanobot-design Snapshot Engine - Take + Restore + Delete + Stats
 */

export type SnapshotStatus = 'creating' | 'ready' | 'deleted';

export interface Snapshot {
  id: string;
  name: string;
  data: string;
  size: number;
  status: SnapshotStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SneStats {
  snapshots: number;
  totalTaken: number;
  totalRestored: number;
  totalDeleted: number;
  creating: number;
  ready: number;
  deleted: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalSize: number;
  avgSize: number;
  maxSize: number;
  minSize: number;
  totalDataLen: number;
  avgDataLen: number;
}

export class SnapshotEngine {
  private snapshots: Map<string, Snapshot> = new Map();
  private counter = 0;
  private totalTaken = 0;
  private totalRestored = 0;
  private totalDeleted = 0;
  private totalSize = 0;
  private totalDataLen = 0;

  take(name: string, data: string): string {
    const id = `sne-${++this.counter}`;
    this.snapshots.set(id, {
      id,
      name,
      data,
      size: data.length,
      status: 'ready',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalTaken++;
    this.totalSize += data.length;
    this.totalDataLen += data.length;
    return id;
  }

  restore(id: string): boolean {
    const s = this.snapshots.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.updated = Date.now();
    s.hits++;
    this.totalRestored++;
    return true;
  }

  delete(id: string): boolean {
    const s = this.snapshots.get(id);
    if (!s) return false;
    s.status = 'deleted';
    s.updated = Date.now();
    s.hits++;
    this.totalDeleted++;
    return true;
  }

  remove(id: string): boolean {
    return this.snapshots.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.snapshots.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.snapshots.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setData(id: string, data: string): boolean {
    const s = this.snapshots.get(id);
    if (!s) return false;
    s.data = data;
    s.size = data.length;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.snapshots.values()) {
      s.status = 'ready';
      s.active = true;
      s.hits = 0;
    }
    this.totalTaken = 0;
    this.totalRestored = 0;
    this.totalDeleted = 0;
    this.totalSize = 0;
    this.totalDataLen = 0;
  }

  getStats(): SneStats {
    const all = Array.from(this.snapshots.values());
    const sArr = all.map(s => s.size);
    const dArr = all.map(s => s.data.length);
    return {
      snapshots: all.length,
      totalTaken: this.totalTaken,
      totalRestored: this.totalRestored,
      totalDeleted: this.totalDeleted,
      creating: all.filter(s => s.status === 'creating').length,
      ready: all.filter(s => s.status === 'ready').length,
      deleted: all.filter(s => s.status === 'deleted').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      totalSize: this.totalSize,
      avgSize: all.length > 0 ? Math.round((sArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxSize: sArr.length > 0 ? Math.max(...sArr) : 0,
      minSize: sArr.length > 0 ? Math.min(...sArr) : 0,
      totalDataLen: this.totalDataLen,
      avgDataLen: all.length > 0 ? Math.round((dArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getSnapshot(id: string): Snapshot | undefined {
    return this.snapshots.get(id);
  }

  getAllSnapshots(): Snapshot[] {
    return Array.from(this.snapshots.values());
  }

  hasSnapshot(id: string): boolean {
    return this.snapshots.has(id);
  }

  getCount(): number {
    return this.snapshots.size;
  }

  getName(id: string): string | undefined {
    return this.snapshots.get(id)?.name;
  }

  getData(id: string): string | undefined {
    return this.snapshots.get(id)?.data;
  }

  getSize(id: string): number {
    return this.snapshots.get(id)?.size ?? 0;
  }

  getStatus(id: string): SnapshotStatus | undefined {
    return this.snapshots.get(id)?.status;
  }

  getHits(id: string): number {
    return this.snapshots.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.snapshots.get(id)?.active ?? false;
  }

  isReady(id: string): boolean {
    return this.snapshots.get(id)?.status === 'ready';
  }

  isDeleted(id: string): boolean {
    return this.snapshots.get(id)?.status === 'deleted';
  }

  isCreating(id: string): boolean {
    return this.snapshots.get(id)?.status === 'creating';
  }

  getByStatus(status: SnapshotStatus): Snapshot[] {
    return Array.from(this.snapshots.values()).filter(s => s.status === status);
  }

  getActiveSnapshots(): Snapshot[] {
    return Array.from(this.snapshots.values()).filter(s => s.active);
  }

  getInactiveSnapshots(): Snapshot[] {
    return Array.from(this.snapshots.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.snapshots.values()).map(s => s.name))];
  }

  getNewest(): Snapshot | null {
    const all = Array.from(this.snapshots.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Snapshot | null {
    const all = Array.from(this.snapshots.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.snapshots.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.snapshots.get(id)?.updated ?? 0;
  }

  getTotalTaken(): number {
    return this.totalTaken;
  }

  getTotalRestored(): number {
    return this.totalRestored;
  }

  getTotalDeleted(): number {
    return this.totalDeleted;
  }

  clearAll(): void {
    this.snapshots.clear();
    this.counter = 0;
    this.totalTaken = 0;
    this.totalRestored = 0;
    this.totalDeleted = 0;
    this.totalSize = 0;
    this.totalDataLen = 0;
  }
}

export default SnapshotEngine;