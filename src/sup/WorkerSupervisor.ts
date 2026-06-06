/**
 * Worker Supervisor
 * nanobot-design Worker Supervisor - Supervise + Restart + Alert + Stats
 */

export type WorkerStatus = 'running' | 'stopped' | 'failed';

export interface SupervisedWorker {
  id: string;
  workerId: string;
  status: WorkerStatus;
  restarts: number;
  alerts: number;
  created: number;
  updated: number;
  lastCheck: number;
  hits: number;
}

export interface SupStats {
  workers: number;
  running: number;
  stopped: number;
  failed: number;
  totalRestarts: number;
  totalAlerts: number;
}

export class WorkerSupervisor {
  private workers: Map<string, SupervisedWorker> = new Map();
  private counter = 0;

  supervise(workerId: string): string {
    const id = `sup-${++this.counter}`;
    this.workers.set(id, {
      id,
      workerId,
      status: 'running',
      restarts: 0,
      alerts: 0,
      created: Date.now(),
      updated: Date.now(),
      lastCheck: Date.now(),
      hits: 0,
    });
    return id;
  }

  restart(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.status = 'running';
    w.restarts++;
    w.updated = Date.now();
    w.lastCheck = Date.now();
    return true;
  }

  alert(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.alerts++;
    w.updated = Date.now();
    return true;
  }

  getStats(): SupStats {
    const all = Array.from(this.workers.values());
    return {
      workers: all.length,
      running: all.filter(w => w.status === 'running').length,
      stopped: all.filter(w => w.status === 'stopped').length,
      failed: all.filter(w => w.status === 'failed').length,
      totalRestarts: all.reduce((s, w) => s + w.restarts, 0),
      totalAlerts: all.reduce((s, w) => s + w.alerts, 0),
    };
  }

  getWorker(id: string): SupervisedWorker | undefined {
    return this.workers.get(id);
  }

  getAllWorkers(): SupervisedWorker[] {
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

  getWorkerId(id: string): string | undefined {
    return this.workers.get(id)?.workerId;
  }

  getStatus(id: string): WorkerStatus | undefined {
    return this.workers.get(id)?.status;
  }

  getRestarts(id: string): number {
    return this.workers.get(id)?.restarts ?? 0;
  }

  getAlerts(id: string): number {
    return this.workers.get(id)?.alerts ?? 0;
  }

  getHits(id: string): number {
    return this.workers.get(id)?.hits ?? 0;
  }

  getLastCheck(id: string): number {
    return this.workers.get(id)?.lastCheck ?? 0;
  }

  isRunning(id: string): boolean {
    return this.workers.get(id)?.status === 'running';
  }

  isStopped(id: string): boolean {
    return this.workers.get(id)?.status === 'stopped';
  }

  isFailed(id: string): boolean {
    return this.workers.get(id)?.status === 'failed';
  }

  setStatus(id: string, status: WorkerStatus): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.status = status;
    w.updated = Date.now();
    return true;
  }

  setWorkerId(id: string, workerId: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.workerId = workerId;
    w.updated = Date.now();
    return true;
  }

  check(id: string): boolean {
    const w = this.workers.get(id);
    if (!w) return false;
    w.lastCheck = Date.now();
    w.hits++;
    return true;
  }

  fail(id: string): boolean {
    return this.setStatus(id, 'failed');
  }

  stop(id: string): boolean {
    return this.setStatus(id, 'stopped');
  }

  resetRestarts(): void {
    for (const w of this.workers.values()) w.restarts = 0;
  }

  resetAlerts(): void {
    for (const w of this.workers.values()) w.alerts = 0;
  }

  resetAll(): void {
    for (const w of this.workers.values()) {
      w.restarts = 0;
      w.alerts = 0;
      w.hits = 0;
      w.status = 'running';
    }
  }

  getByWorkerId(workerId: string): SupervisedWorker[] {
    return Array.from(this.workers.values()).filter(w => w.workerId === workerId);
  }

  getByStatus(status: WorkerStatus): SupervisedWorker[] {
    return Array.from(this.workers.values()).filter(w => w.status === status);
  }

  getRunningWorkers(): SupervisedWorker[] {
    return this.getByStatus('running');
  }

  getStoppedWorkers(): SupervisedWorker[] {
    return this.getByStatus('stopped');
  }

  getFailedWorkers(): SupervisedWorker[] {
    return this.getByStatus('failed');
  }

  getAllWorkerIds(): string[] {
    return [...new Set(Array.from(this.workers.values()).map(w => w.workerId))];
  }

  getWorkerIdCount(): number {
    return this.getAllWorkerIds().length;
  }

  getByMinRestarts(min: number): SupervisedWorker[] {
    return Array.from(this.workers.values()).filter(w => w.restarts >= min);
  }

  getByMinAlerts(min: number): SupervisedWorker[] {
    return Array.from(this.workers.values()).filter(w => w.alerts >= min);
  }

  getMostRestarts(): SupervisedWorker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.restarts > max.restarts ? w : max);
  }

  getMostAlerts(): SupervisedWorker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.alerts > max.alerts ? w : max);
  }

  getNewest(): SupervisedWorker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.created > max.created ? w : max);
  }

  getOldest(): SupervisedWorker | null {
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

  clearAll(): void {
    this.workers.clear();
    this.counter = 0;
  }
}

export default WorkerSupervisor;