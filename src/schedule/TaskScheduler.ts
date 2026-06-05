/**
 * Task Scheduler
 * thunderbolt-design Task Scheduler - Schedule + Run + Cancel + Track
 */

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ScheduledTask {
  id: string;
  name: string;
  priority: number;
  scheduledAt: number;
  status: TaskStatus;
  action: () => Promise<boolean>;
  retries: number;
  result?: boolean;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface SchedulerStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  total: number;
}

export class TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private counter = 0;

  schedule(name: string, action: () => Promise<boolean>, priority: number = 0): string {
    const id = `task-${++this.counter}`;
    this.tasks.set(id, {
      id,
      name,
      priority,
      scheduledAt: Date.now(),
      status: 'pending',
      action,
      retries: 0,
    });
    return id;
  }

  async runNext(): Promise<boolean> {
    const next = this.getNextPending();
    if (!next) return false;
    return this.runTask(next.id);
  }

  async runTask(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.status !== 'pending') return false;
    task.status = 'running';
    task.startedAt = Date.now();
    try {
      const result = await task.action();
      task.result = result;
      task.status = result ? 'completed' : 'failed';
    } catch (e) {
      task.error = String(e);
      task.status = 'failed';
    }
    task.completedAt = Date.now();
    return task.status === 'completed';
  }

  cancel(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    if (task.status === 'completed' || task.status === 'cancelled') return false;
    task.status = 'cancelled';
    return true;
  }

  getStats(): SchedulerStats {
    const all = Array.from(this.tasks.values());
    return {
      pending: all.filter(t => t.status === 'pending').length,
      running: all.filter(t => t.status === 'running').length,
      completed: all.filter(t => t.status === 'completed').length,
      failed: all.filter(t => t.status === 'failed').length,
      cancelled: all.filter(t => t.status === 'cancelled').length,
      total: all.length,
    };
  }

  private getNextPending(): ScheduledTask | null {
    const pending = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending')
      .sort((a, b) => b.priority - a.priority);
    return pending[0] ?? null;
  }

  getTask(id: string): ScheduledTask | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  removeTask(id: string): boolean {
    return this.tasks.delete(id);
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

  getStatus(id: string): TaskStatus | undefined {
    return this.tasks.get(id)?.status;
  }

  getPriority(id: string): number {
    return this.tasks.get(id)?.priority ?? 0;
  }

  setPriority(id: string, priority: number): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    task.priority = priority;
    return true;
  }

  isPending(id: string): boolean {
    return this.tasks.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.tasks.get(id)?.status === 'running';
  }

  isCompleted(id: string): boolean {
    return this.tasks.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.tasks.get(id)?.status === 'failed';
  }

  isCancelled(id: string): boolean {
    return this.tasks.get(id)?.status === 'cancelled';
  }

  getByStatus(status: TaskStatus): ScheduledTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  getPending(): ScheduledTask[] { return this.getByStatus('pending'); }
  getRunning(): ScheduledTask[] { return this.getByStatus('running'); }
  getCompleted(): ScheduledTask[] { return this.getByStatus('completed'); }
  getFailed(): ScheduledTask[] { return this.getByStatus('failed'); }
  getCancelled(): ScheduledTask[] { return this.getByStatus('cancelled'); }

  getRetries(id: string): number {
    return this.tasks.get(id)?.retries ?? 0;
  }

  getResult(id: string): boolean | undefined {
    return this.tasks.get(id)?.result;
  }

  getError(id: string): string | undefined {
    return this.tasks.get(id)?.error;
  }

  getDuration(id: string): number {
    const t = this.tasks.get(id);
    if (!t || !t.startedAt || !t.completedAt) return 0;
    return t.completedAt - t.startedAt;
  }

  clearAll(): void {
    this.tasks.clear();
    this.counter = 0;
  }
}

export default TaskScheduler;