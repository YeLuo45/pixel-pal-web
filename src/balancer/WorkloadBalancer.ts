/**
 * Workload Balancer
 * nanobot-design Workload Balancer - Register + Assign + Rebalance + Stats
 */

export interface Worker {
  id: string;
  capacity: number;
  load: number;
  healthy: boolean;
}

export interface Task {
  id: string;
  size: number;
  workerId?: string;
}

export interface BalancerStats {
  workers: number;
  totalLoad: number;
  utilization: number;
  healthyWorkers: number;
}

export class WorkloadBalancer {
  private workers: Map<string, Worker> = new Map();
  private tasks: Map<string, Task> = new Map();
  private migrationCount = 0;

  registerWorker(worker: Omit<Worker, 'load' | 'healthy'>): boolean {
    if (this.workers.has(worker.id)) return false;
    this.workers.set(worker.id, { ...worker, load: 0, healthy: true });
    return true;
  }

  assign(task: Omit<Task, 'workerId'>): string | null {
    const candidates = Array.from(this.workers.values())
      .filter(w => w.healthy && w.load + task.size <= w.capacity)
      .sort((a, b) => (a.load / a.capacity) - (b.load / b.capacity));

    if (candidates.length === 0) return null;

    const selected = candidates[0];
    selected.load += task.size;
    this.tasks.set(task.id, { ...task, workerId: selected.id });
    return selected.id;
  }

  rebalance(): string[] {
    const moved: string[] = [];
    const sorted = Array.from(this.workers.values())
      .filter(w => w.healthy)
      .sort((a, b) => b.load - a.load);

    if (sorted.length < 2) return moved;

    const heaviest = sorted[0];
    const lightest = sorted[sorted.length - 1];

    // Move half of the excess load
    const diff = heaviest.load - lightest.load;
    if (diff > 0 && heaviest.capacity > heaviest.load - diff / 2) {
      const transfer = Math.floor(diff / 2);
      heaviest.load -= transfer;
      lightest.load += transfer;
      this.migrationCount++;
      moved.push(`${heaviest.id}->${lightest.id}:${transfer}`);
    }
    return moved;
  }

  getStats(): BalancerStats {
    const all = Array.from(this.workers.values());
    const healthy = all.filter(w => w.healthy);
    const totalLoad = all.reduce((sum, w) => sum + w.load, 0);
    const totalCapacity = all.reduce((sum, w) => sum + w.capacity, 0);
    return {
      workers: all.length,
      totalLoad,
      utilization: totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) / 100 : 0,
      healthyWorkers: healthy.length,
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

  setHealthy(id: string, healthy: boolean): boolean {
    const worker = this.workers.get(id);
    if (!worker) return false;
    worker.healthy = healthy;
    return true;
  }

  isHealthy(id: string): boolean {
    return this.workers.get(id)?.healthy ?? false;
  }

  getLoad(id: string): number {
    return this.workers.get(id)?.load ?? 0;
  }

  getCapacity(id: string): number {
    return this.workers.get(id)?.capacity ?? 0;
  }

  getUtilization(id: string): number {
    const w = this.workers.get(id);
    if (!w || w.capacity === 0) return 0;
    return Math.round((w.load / w.capacity) * 100) / 100;
  }

  getHealthyWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.healthy);
  }

  getUnhealthyWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => !w.healthy);
  }

  getAvailableWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.healthy && w.load < w.capacity);
  }

  getFullWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.load >= w.capacity);
  }

  getHeaviestWorker(): Worker | null {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.load > max.load ? w : max);
  }

  getLightestWorker(): Worker | null {
    const all = Array.from(this.workers.values()).filter(w => w.healthy);
    if (all.length === 0) return null;
    return all.reduce((min, w) => w.load < min.load ? w : min);
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  removeTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    if (task.workerId) {
      const worker = this.workers.get(task.workerId);
      if (worker) worker.load = Math.max(0, worker.load - task.size);
    }
    return this.tasks.delete(id);
  }

  getTaskCount(): number {
    return this.tasks.size;
  }

  getTasksForWorker(workerId: string): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.workerId === workerId);
  }

  getMigrationCount(): number {
    return this.migrationCount;
  }

  resetMigrationCount(): void {
    this.migrationCount = 0;
  }

  getLoadDistribution(): { id: string; load: number; percent: number }[] {
    return Array.from(this.workers.values()).map(w => ({
      id: w.id,
      load: w.load,
      percent: w.capacity > 0 ? Math.round((w.load / w.capacity) * 100) / 100 : 0,
    }));
  }

  getAverageUtilization(): number {
    const all = Array.from(this.workers.values());
    if (all.length === 0) return 0;
    const total = all.reduce((sum, w) => sum + (w.capacity > 0 ? w.load / w.capacity : 0), 0);
    return Math.round((total / all.length) * 100) / 100;
  }

  clearAll(): void {
    this.workers.clear();
    this.tasks.clear();
    this.migrationCount = 0;
  }
}

export default WorkloadBalancer;