/**
 * Stage Manager
 * thunderbolt-design Stage Manager - Create + Enter + Exit + Complete + Stats
 */

export type StageStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface Stage {
  id: string;
  name: string;
  order: number;
  status: StageStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface SmStats {
  stages: number;
  totalEntered: number;
  totalCompleted: number;
  totalFailed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgOrder: number;
  maxOrder: number;
  minOrder: number;
  uniqueStatuses: number;
}

export class StageManager {
  private stages: Map<string, Stage> = new Map();
  private counter = 0;
  private totalEntered = 0;
  private totalCompleted = 0;
  private totalFailed = 0;

  create(name: string, order: number = 0): string {
    const id = `sm-${++this.counter}`;
    this.stages.set(id, {
      id,
      name,
      order,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  enter(id: string): boolean {
    const s = this.stages.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.status = 'active';
    s.updated = Date.now();
    s.hits++;
    this.totalEntered++;
    return true;
  }

  exit(id: string): boolean {
    const s = this.stages.get(id);
    if (!s) return false;
    s.active = false;
    s.updated = Date.now();
    return true;
  }

  complete(id: string): boolean {
    const s = this.stages.get(id);
    if (!s) return false;
    s.status = 'completed';
    s.updated = Date.now();
    s.hits++;
    this.totalCompleted++;
    return true;
  }

  fail(id: string): boolean {
    const s = this.stages.get(id);
    if (!s) return false;
    s.status = 'failed';
    s.updated = Date.now();
    s.hits++;
    this.totalFailed++;
    return true;
  }

  remove(id: string): boolean {
    return this.stages.delete(id);
  }

  resetAll(): void {
    for (const s of this.stages.values()) {
      s.status = 'pending';
      s.active = true;
      s.hits = 0;
      s.history = [];
    }
    this.totalEntered = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }

  getStats(): SmStats {
    const all = Array.from(this.stages.values());
    const orderValues = all.map(s => s.order);
    return {
      stages: all.length,
      totalEntered: this.totalEntered,
      totalCompleted: this.totalCompleted,
      totalFailed: this.totalFailed,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      avgOrder: all.length > 0 ? Math.round((orderValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxOrder: orderValues.length > 0 ? Math.max(...orderValues) : 0,
      minOrder: orderValues.length > 0 ? Math.min(...orderValues) : 0,
      uniqueStatuses: new Set(all.map(s => s.status)).size,
    };
  }

  getStage(id: string): Stage | undefined {
    return this.stages.get(id);
  }

  getAllStages(): Stage[] {
    return Array.from(this.stages.values());
  }

  hasStage(id: string): boolean {
    return this.stages.has(id);
  }

  getCount(): number {
    return this.stages.size;
  }

  getName(id: string): string | undefined {
    return this.stages.get(id)?.name;
  }

  getOrder(id: string): number {
    return this.stages.get(id)?.order ?? 0;
  }

  getStatus(id: string): StageStatus | undefined {
    return this.stages.get(id)?.status;
  }

  getHistory(id: string): number[] {
    return [...(this.stages.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.stages.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.stages.get(id)?.active ?? false;
  }

  setName(id: string, name: string): boolean {
    const s = this.stages.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setOrder(id: string, order: number): boolean {
    const s = this.stages.get(id);
    if (!s) return false;
    s.order = order;
    s.updated = Date.now();
    return true;
  }

  getByName(name: string): Stage[] {
    return Array.from(this.stages.values()).filter(s => s.name === name);
  }

  getByStatus(status: StageStatus): Stage[] {
    return Array.from(this.stages.values()).filter(s => s.status === status);
  }

  getActiveStages(): Stage[] {
    return Array.from(this.stages.values()).filter(s => s.active);
  }

  getInactiveStages(): Stage[] {
    return Array.from(this.stages.values()).filter(s => !s.active);
  }

  getPendingStages(): Stage[] {
    return Array.from(this.stages.values()).filter(s => s.status === 'pending');
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.stages.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinOrder(min: number): Stage[] {
    return Array.from(this.stages.values()).filter(s => s.order >= min);
  }

  getByMaxOrder(max: number): Stage[] {
    return Array.from(this.stages.values()).filter(s => s.order <= max);
  }

  getNewest(): Stage | null {
    const all = Array.from(this.stages.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Stage | null {
    const all = Array.from(this.stages.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.stages.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.stages.get(id)?.updated ?? 0;
  }

  getTotalEntered(): number {
    return this.totalEntered;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.stages.clear();
    this.counter = 0;
    this.totalEntered = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }
}

export default StageManager;