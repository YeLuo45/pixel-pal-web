/**
 * Task Scheduler v2
 * thunderbolt-design Task Scheduler v2 - Queue + Priority + Concurrency + Stats
 */

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Task {
  id: string;
  priority: number;
  status: TaskStatus;
  result?: unknown;
  duration?: number;
  payload?: () => Promise<unknown> | unknown;
}

export interface SchedulerStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  running: number;
  avgDuration: number;
}

export class TaskSchedulerV2 {
  private tasks: Map<string, Task> = new Map();
  private runningCount = 0;
  private maxConcurrency = 1;

  addTask(task: Task): void {
    this.tasks.set(task.id, { ...task });
  }

  schedule(): Task | null {
    if (this.runningCount >= this.maxConcurrency) return null;

    // Find highest priority pending task
    const pending = Array.from(this.tasks.values()).filter(t => t.status === 'pending');
    if (pending.length === 0) return null;

    pending.sort((a, b) => b.priority - a.priority);
    const next = pending[0];
    next.status = 'running';
    this.runningCount++;
    return next;
  }

  async execute(task: Task): Promise<void> {
    const start = Date.now();
    try {
      if (task.payload) {
        const result = await task.payload();
        task.result = result;
        task.status = 'completed';
      } else {
        task.status = 'completed';
      }
    } catch {
      task.status = 'failed';
    } finally {
      task.duration = Date.now() - start;
      this.runningCount--;
    }
  }

  setMaxConcurrency(n: number): void {
    this.maxConcurrency = Math.max(1, n);
  }

  getMaxConcurrency(): number {
    return this.maxConcurrency;
  }

  getStats(): SchedulerStats {
    const all = Array.from(this.tasks.values());
    const completed = all.filter(t => t.status === 'completed');
    const failed = all.filter(t => t.status === 'failed');
    const pending = all.filter(t => t.status === 'pending');
    const running = all.filter(t => t.status === 'running');
    const totalDuration = completed.reduce((sum, t) => sum + (t.duration ?? 0), 0);
    const avgDuration = completed.length > 0 ? Math.round(totalDuration / completed.length) : 0;

    return {
      total: all.length,
      completed: completed.length,
      failed: failed.length,
      pending: pending.length,
      running: running.length,
      avgDuration,
    };
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending');
  }

  getRunningTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'running');
  }

  getCompletedTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'completed');
  }

  getFailedTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'failed');
  }

  removeTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  getTaskCount(): number {
    return this.tasks.size;
  }

  hasTask(id: string): boolean {
    return this.tasks.has(id);
  }

  clearAll(): void {
    this.tasks.clear();
    this.runningCount = 0;
  }

  resetAll(): void {
    for (const t of this.tasks.values()) {
      if (t.status !== 'completed') t.status = 'pending';
    }
    this.runningCount = 0;
  }

  getRunningCount(): number {
    return this.runningCount;
  }

  setTaskStatus(id: string, status: TaskStatus): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.status = status;
    return true;
  }

  setTaskPriority(id: string, priority: number): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.priority = priority;
    return true;
  }

  getNextTaskId(): string | null {
    const next = this.schedule();
    if (!next) return null;
    // Reset its status since schedule() marked it running
    const task = this.tasks.get(next.id);
    if (task) task.status = 'pending';
    this.runningCount--;
    return next.id;
  }

  getAveragePriority(): number {
    if (this.tasks.size === 0) return 0;
    const sum = Array.from(this.tasks.values()).reduce((acc, t) => acc + t.priority, 0);
    return Math.round(sum / this.tasks.size * 100) / 100;
  }
}

export default TaskSchedulerV2;