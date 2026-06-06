/**
 * Dispatch Engine
 * nanobot-design Dispatch Engine - Register + Dispatch + Stats
 */

export type DispatchStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Dispatch {
  id: string;
  task: string;
  target: string;
  status: DispatchStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface DpeStats {
  dispatches: number;
  totalCompleted: number;
  totalFailed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTasks: number;
  uniqueTargets: number;
  avgTaskLength: number;
  maxTaskLength: number;
  minTaskLength: number;
}

export class DispatchEngine {
  private dispatches: Map<string, Dispatch> = new Map();
  private counter = 0;
  private totalCompleted = 0;
  private totalFailed = 0;

  register(task: string, target: string): string {
    const id = `dpe-${++this.counter}`;
    this.dispatches.set(id, {
      id,
      task,
      target,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  dispatch(id: string): boolean {
    const d = this.dispatches.get(id);
    if (!d) return false;
    if (!d.active) return false;
    d.status = 'running';
    d.updated = Date.now();
    d.hits++;
    return true;
  }

  complete(id: string): boolean {
    const d = this.dispatches.get(id);
    if (!d) return false;
    d.status = 'completed';
    d.updated = Date.now();
    d.hits++;
    this.totalCompleted++;
    return true;
  }

  fail(id: string): boolean {
    const d = this.dispatches.get(id);
    if (!d) return false;
    d.status = 'failed';
    d.updated = Date.now();
    d.hits++;
    this.totalFailed++;
    return true;
  }

  remove(id: string): boolean {
    return this.dispatches.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.dispatches.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const d of this.dispatches.values()) {
      d.status = 'pending';
      d.active = true;
      d.hits = 0;
      d.history = [];
    }
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }

  getStats(): DpeStats {
    const all = Array.from(this.dispatches.values());
    const taskLengths = all.map(d => d.task.length);
    return {
      dispatches: all.length,
      totalCompleted: this.totalCompleted,
      totalFailed: this.totalFailed,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      totalHits: all.reduce((s, d) => s + d.hits, 0),
      uniqueTasks: new Set(all.map(d => d.task)).size,
      uniqueTargets: new Set(all.map(d => d.target)).size,
      avgTaskLength: all.length > 0 ? Math.round((taskLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTaskLength: taskLengths.length > 0 ? Math.max(...taskLengths) : 0,
      minTaskLength: taskLengths.length > 0 ? Math.min(...taskLengths) : 0,
    };
  }

  getDispatch(id: string): Dispatch | undefined {
    return this.dispatches.get(id);
  }

  getAllDispatches(): Dispatch[] {
    return Array.from(this.dispatches.values());
  }

  hasDispatch(id: string): boolean {
    return this.dispatches.has(id);
  }

  getCount(): number {
    return this.dispatches.size;
  }

  getTask(id: string): string | undefined {
    return this.dispatches.get(id)?.task;
  }

  getTarget(id: string): string | undefined {
    return this.dispatches.get(id)?.target;
  }

  getStatus(id: string): DispatchStatus | undefined {
    return this.dispatches.get(id)?.status;
  }

  getTaskLength(id: string): number {
    return this.dispatches.get(id)?.task.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.dispatches.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.dispatches.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.dispatches.get(id)?.active ?? false;
  }

  isCompleted(id: string): boolean {
    return this.dispatches.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.dispatches.get(id)?.status === 'failed';
  }

  getByStatus(status: DispatchStatus): Dispatch[] {
    return Array.from(this.dispatches.values()).filter(d => d.status === status);
  }

  getByTask(task: string): Dispatch[] {
    return Array.from(this.dispatches.values()).filter(d => d.task === task);
  }

  getByTarget(target: string): Dispatch[] {
    return Array.from(this.dispatches.values()).filter(d => d.target === target);
  }

  getActiveDispatches(): Dispatch[] {
    return Array.from(this.dispatches.values()).filter(d => d.active);
  }

  getInactiveDispatches(): Dispatch[] {
    return Array.from(this.dispatches.values()).filter(d => !d.active);
  }

  getAllTasks(): string[] {
    return [...new Set(Array.from(this.dispatches.values()).map(d => d.task))];
  }

  getTaskCount(): number {
    return this.getAllTasks().length;
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.dispatches.values()).map(d => d.target))];
  }

  getTargetCount(): number {
    return this.getAllTargets().length;
  }

  getNewest(): Dispatch | null {
    const all = Array.from(this.dispatches.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): Dispatch | null {
    const all = Array.from(this.dispatches.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.dispatches.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.dispatches.get(id)?.updated ?? 0;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.dispatches.clear();
    this.counter = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }
}

export default DispatchEngine;