/**
 * Worker Pool
 * nanobot-design Worker Pool - Register + Assign + Release + Stats
 */

export interface Worker {
  id: string;
  name: string;
  busy: boolean;
  tasks: number;
  totalAssigned: number;
  totalReleased: number;
  created: number;
  assignedAt: number;
  releasedAt: number;
}

export interface WorkerStats {
  workers: number;
  busy: number;
  idle: number;
  totalTasks: number;
  totalAssigned: number;
  totalReleased: number;
  avgTasks: number;
}

export class WorkerPool {
  private workers: Map<string, Worker> = new Map();
  private counter = 0;

  register(name: string): string {
    const id = `wrk-${++this.counter}`;
    this.workers.set(id, {
      id,
      name,
      busy: false,
      tasks: 0,
      totalAssigned: 0,
      totalReleased: 0,
      created: Date.now(),
      assignedAt: 0,
      releasedAt: 0,
    });
    return id;
  }

  assign(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    if (w.busy) return false;
    w.busy = true;
    w.tasks++;
    w.totalAssigned++;
    w.assignedAt = Date.now();
    return true;
  }

  release(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    if (!w.busy) return false;
    w.busy = false;
    w.totalReleased++;
    w.releasedAt = Date.now();
    return true;
  }

  getStats(): WorkerStats {
    const all = Array.from(this.workers.values());
    return {
      workers: all.length,
      busy: all.filter(w => w.busy).length,
      idle: all.filter(w => !w.busy).length,
      totalTasks: all.reduce((s, w) => s + w.tasks, 0),
      totalAssigned: all.reduce((s, w) => s + w.totalAssigned, 0),
      totalReleased: all.reduce((s, w) => s + w.totalReleased, 0),
      avgTasks: all.length > 0 ? Math.round((all.reduce((s, w) => s + w.tasks, 0) / all.length) * 100) / 100 : 0,
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

  getTasks(id: string): number {
    return this.workers.get(id)?.tasks ?? 0;
  }

  getTotalAssigned(id: string): number {
    return this.workers.get(id)?.totalAssigned ?? 0;
  }

  getTotalReleased(id: string): number {
    return this.workers.get(id)?.totalReleased ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.workers.get(id)?.created ?? 0;
  }

  getAssignedAt(id: string): number {
    return this.workers.get(id)?.assignedAt ?? 0;
  }

  getReleasedAt(id: string): number {
    return this.workers.get(id)?.releasedAt ?? 0;
  }

  isBusy(id: string): boolean {
    return this.workers.get(id)?.busy ?? false;
  }

  isIdle(id: string): boolean {
    return !this.isBusy(id);
  }

  setName(id: string, name: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.name = name;
    return true;
  }

  forceRelease(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.busy = false;
    w.totalReleased++;
    return true;
  }

  forceReleaseAll(): number {
    let count = 0;
    for (const w of this.workers.values()) {
      if (w.busy) {
        w.busy = false;
        w.totalReleased++;
        count++;
      }
    }
    return count;
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

  getByMinTasks(min: number): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.tasks >= min);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.workers.values()).map(w => w.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getMostTasks(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.tasks > max.tasks ? w : max);
  }

  getLeastTasks(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((min, w) => w.tasks < min.tasks ? w : min);
  }

  getOldest(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((min, w) => w.created < min.created ? w : min);
  }

  getNewest(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.created > max.created ? w : max);
  }

  getUtilization(): number {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return 0;
    const busy = all.filter(w => w.busy).length;
    return Math.round((busy / all.length) * 100) / 100;
  }

  pickAvailable(): Worker | null {
    const idle = this.getIdleWorkers();
    if (idle.length === 0) return null;
    return idle[0];
  }

  clearAll(): void {
    this.workers.clear();
    this.counter = 0;
  }
}

export default WorkerPool;