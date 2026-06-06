/**
 * Worker Manager
 * nanobot-design Worker Manager - Register + Assign + Release + Stats
 */

export interface Worker {
  id: string;
  name: string;
  task: string;
  busy: boolean;
  tasks: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface WkmStats {
  workers: number;
  busy: number;
  idle: number;
  totalTasks: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgTasks: number;
  maxTasks: number;
  minTasks: number;
  avgTaskLength: number;
}

export class WorkerManager {
  private workers: Map<string, Worker> = new Map();
  private counter = 0;
  private totalTasks = 0;

  register(name: string, task: string = ''): string {
    const id = `wkm-${++this.counter}`;
    this.workers.set(id, {
      id,
      name,
      task,
      busy: false,
      tasks: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  assign(id: string, task: string = ''): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    if (!w.active) return false;
    if (w.busy) return false;
    w.busy = true;
    w.task = task;
    w.tasks++;
    w.history.push(Date.now());
    w.updated = Date.now();
    w.hits++;
    this.totalTasks++;
    return true;
  }

  release(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    if (!w.busy) return false;
    w.busy = false;
    w.task = '';
    w.updated = Date.now();
    w.hits++;
    return true;
  }

  reset(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.tasks = 0;
    w.history = [];
    w.updated = Date.now();
    return true;
  }

  getStats(): WkmStats {
    const all = Array.from(this.workers.values());
    const taskValues = all.map(w => w.tasks);
    const taskLengths = all.map(w => w.task.length);
    return {
      workers: all.length,
      busy: all.filter(w => w.busy).length,
      idle: all.filter(w => !w.busy).length,
      totalTasks: this.totalTasks,
      active: all.filter(w => w.active).length,
      inactive: all.filter(w => !w.active).length,
      totalHits: all.reduce((s, w) => s + w.hits, 0),
      uniqueNames: new Set(all.map(w => w.name)).size,
      avgTasks: all.length > 0 ? Math.round((taskValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTasks: taskValues.length > 0 ? Math.max(...taskValues) : 0,
      minTasks: taskValues.length > 0 ? Math.min(...taskValues) : 0,
      avgTaskLength: all.length > 0 ? Math.round((taskLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getWorker(id: string): Worker | undefined {
    return this.workers.get(id);
  }

  getAllWorkers(): Worker[] {
    return Array.from(this.workers.values());
  }

  removeWorker(id: string): boolean {
    return this.workers.delete(id);
  }

  hasWorker(id: string): boolean {
    return this.workers.has(id);
  }

  getCount(): number {
    return this.workers.size;
  }

  getName(id: string): string | undefined {
    return this.workers.get(id)?.name;
  }

  getTask(id: string): string | undefined {
    return this.workers.get(id)?.task;
  }

  getTaskLength(id: string): number {
    return this.workers.get(id)?.task.length ?? 0;
  }

  getTasks(id: string): number {
    return this.workers.get(id)?.tasks ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.workers.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.workers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.workers.get(id)?.active ?? false;
  }

  isBusy(id: string): boolean {
    return this.workers.get(id)?.busy ?? false;
  }

  isIdle(id: string): boolean {
    const w = this.workers.get(id);
    return w ? !w.busy : false;
  }

  setActive(id: string, active: boolean): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.active = active;
    w.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.name = name;
    w.updated = Date.now();
    return true;
  }

  setTask(id: string, task: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.task = task;
    w.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const w of this.workers.values()) {
      w.busy = false;
      w.tasks = 0;
      w.task = '';
      w.hits = 0;
      w.history = [];
      w.active = true;
    }
    this.totalTasks = 0;
  }

  getByName(name: string): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.name === name);
  }

  getBusyWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.busy);
  }

  getIdleWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => !w.busy);
  }

  getActiveWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.active);
  }

  getInactiveWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => !w.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.workers.values()).map(w => w.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinTasks(min: number): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.tasks >= min);
  }

  getMostTasks(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.tasks > max.tasks ? w : max);
  }

  getNewest(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.created > max.created ? w : max);
  }

  getOldest(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((min, w) => w.created < min.created ? w : min);
  }

  getCreatedAt(id: string): number {
    return this.workers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.workers.get(id)?.updated ?? 0;
  }

  getTotalTasks(): number {
    return this.totalTasks;
  }

  clearAll(): void {
    this.workers.clear();
    this.counter = 0;
    this.totalTasks = 0;
  }
}

export default WorkerManager;