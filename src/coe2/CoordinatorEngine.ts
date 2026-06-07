/**
 * Coordinator Engine
 * thunderbolt-design Coordinator Engine - Add + Assign + Sync + Stats
 */

export type CoordStatus = 'pending' | 'assigned' | 'syncing' | 'completed';

export interface CoordTask {
  id: string;
  name: string;
  assignee: string;
  status: CoordStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Coe2Stats {
  tasks: number;
  totalAdded: number;
  totalAssigned: number;
  totalSynced: number;
  totalCompleted: number;
  pending: number;
  assigned: number;
  syncing: number;
  completed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueAssignees: number;
  uniqueStatuses: number;
}

export class CoordinatorEngine {
  private tasks: Map<string, CoordTask> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalAssigned = 0;
  private totalSynced = 0;
  private totalCompleted = 0;

  add(name: string): string {
    const id = `coe2-${++this.counter}`;
    this.tasks.set(id, {
      id,
      name,
      assignee: '',
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  assign(id: string, assignee: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.assignee = assignee;
    t.status = 'assigned';
    t.updated = Date.now();
    t.hits++;
    this.totalAssigned++;
    return true;
  }

  sync(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.status = 'syncing';
    t.updated = Date.now();
    t.hits++;
    this.totalSynced++;
    return true;
  }

  complete(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.status = 'completed';
    t.updated = Date.now();
    t.hits++;
    this.totalCompleted++;
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

  setName(id: string, name: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  setAssignee(id: string, assignee: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.assignee = assignee;
    t.updated = Date.now();
    return true;
  }

  setStatus(id: string, status: CoordStatus): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.status = status;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.tasks.values()) {
      t.status = 'pending';
      t.active = true;
      t.hits = 0;
    }
    this.totalAdded = 0;
    this.totalAssigned = 0;
    this.totalSynced = 0;
    this.totalCompleted = 0;
  }

  getStats(): Coe2Stats {
    const all = Array.from(this.tasks.values());
    return {
      tasks: all.length,
      totalAdded: this.totalAdded,
      totalAssigned: this.totalAssigned,
      totalSynced: this.totalSynced,
      totalCompleted: this.totalCompleted,
      pending: all.filter(t => t.status === 'pending').length,
      assigned: all.filter(t => t.status === 'assigned').length,
      syncing: all.filter(t => t.status === 'syncing').length,
      completed: all.filter(t => t.status === 'completed').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      uniqueAssignees: new Set(all.map(t => t.assignee).filter(a => a !== '')).size,
      uniqueStatuses: new Set(all.map(t => t.status)).size,
    };
  }

  getTask(id: string): CoordTask | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): CoordTask[] {
    return Array.from(this.tasks.values());
  }

  hasTask(id: string): boolean {
    return this.tasks.has(id);
  }

  getCount(): number {
    return this.tasks.size;
  }

  getName(id: string): string | undefined {
    return this.tasks.get(id)?.name;
  }

  getAssignee(id: string): string {
    return this.tasks.get(id)?.assignee ?? '';
  }

  getStatus(id: string): CoordStatus | undefined {
    return this.tasks.get(id)?.status;
  }

  getHits(id: string): number {
    return this.tasks.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.tasks.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.tasks.get(id)?.status === 'pending';
  }

  isAssigned(id: string): boolean {
    return this.tasks.get(id)?.status === 'assigned';
  }

  isSyncing(id: string): boolean {
    return this.tasks.get(id)?.status === 'syncing';
  }

  isCompleted(id: string): boolean {
    return this.tasks.get(id)?.status === 'completed';
  }

  getByStatus(status: CoordStatus): CoordTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  getActiveTasks(): CoordTask[] {
    return Array.from(this.tasks.values()).filter(t => t.active);
  }

  getInactiveTasks(): CoordTask[] {
    return Array.from(this.tasks.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.tasks.values()).map(t => t.name))];
  }

  getAllAssignees(): string[] {
    return [...new Set(Array.from(this.tasks.values()).map(t => t.assignee).filter(a => a !== ''))];
  }

  getNewest(): CoordTask | null {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): CoordTask | null {
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalAssigned(): number {
    return this.totalAssigned;
  }

  getTotalSynced(): number {
    return this.totalSynced;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  clearAll(): void {
    this.tasks.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalAssigned = 0;
    this.totalSynced = 0;
    this.totalCompleted = 0;
  }
}

export default CoordinatorEngine;