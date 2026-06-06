/**
 * Snapshot Manager
 * thunderbolt-design Snapshot Manager - Create + Restore + Delete + Stats
 */

export interface Snapshot {
  id: string;
  name: string;
  data: string;
  size: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface SnmStats {
  snapshots: number;
  totalRestores: number;
  totalDeletes: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgSize: number;
  maxSize: number;
  minSize: number;
  totalSize: number;
  uniqueData: number;
}

export class SnapshotManager {
  private snapshots: Map<string, Snapshot> = new Map();
  private counter = 0;
  private totalRestores = 0;
  private totalDeletes = 0;

  create(name: string, data: string): string {
    const id = `snm-${++this.counter}`;
    this.snapshots.set(id, {
      id,
      name,
      data,
      size: data.length,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  restore(id: string): string | null {
    const s = this.snapshots.get(id);
    if (!s) return null;
    if (!s.active) return null;
    s.hits++;
    s.updated = Date.now();
    this.totalRestores++;
    return s.data;
  }

  delete(id: string): boolean {
    const result = this.snapshots.delete(id);
    if (result) {
      this.totalDeletes++;
    }
    return result;
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
      s.hits = 0;
      s.history = [];
      s.active = true;
    }
    this.totalRestores = 0;
    this.totalDeletes = 0;
  }

  getStats(): SnmStats {
    const all = Array.from(this.snapshots.values());
    const sizeValues = all.map(s => s.size);
    return {
      snapshots: all.length,
      totalRestores: this.totalRestores,
      totalDeletes: this.totalDeletes,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      avgSize: all.length > 0 ? Math.round((sizeValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSize: sizeValues.length > 0 ? Math.max(...sizeValues) : 0,
      minSize: sizeValues.length > 0 ? Math.min(...sizeValues) : 0,
      totalSize: sizeValues.reduce((s, v) => s + v, 0),
      uniqueData: new Set(all.map(s => s.data)).size,
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

  getHistory(id: string): number[] {
    return [...(this.snapshots.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.snapshots.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.snapshots.get(id)?.active ?? false;
  }

  getByName(name: string): Snapshot[] {
    return Array.from(this.snapshots.values()).filter(s => s.name === name);
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

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinSize(min: number): Snapshot[] {
    return Array.from(this.snapshots.values()).filter(s => s.size >= min);
  }

  getLargest(): Snapshot | null {
    const all = Array.from(this.snapshots.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.size > max.size ? s : max);
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

  getTotalRestores(): number {
    return this.totalRestores;
  }

  getTotalDeletes(): number {
    return this.totalDeletes;
  }

  clearAll(): void {
    this.snapshots.clear();
    this.counter = 0;
    this.totalRestores = 0;
    this.totalDeletes = 0;
  }
}

export default SnapshotManager;