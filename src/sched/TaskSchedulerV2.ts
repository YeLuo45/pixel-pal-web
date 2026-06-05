/**
 * Task Scheduler v2
 * nanobot-design Task Scheduler v2 - Enqueue + Next + Complete + Cancel
 */

export type SchedState = 'pending' | 'running' | 'done' | 'cancelled';

export interface SchedTask {
  id: string;
  name: string;
  priority: number;
  state: SchedState;
  created: number;
  started: number;
  ended: number;
}

export interface SchedStats {
  tasks: number;
  pending: number;
  running: number;
  done: number;
  cancelled: number;
  avgPriority: number;
}

export class TaskSchedulerV2 {
  private tasks: Map<string, SchedTask> = new Map();
  private counter = 0;

  enqueue(name: string, priority: number = 0): string {
    const id = `tsk-${++this.counter}`;
    this.tasks.set(id, {
      id,
      name,
      priority,
      state: 'pending',
      created: Date.now(),
      started: 0,
      ended: 0,
    });
    return id;
  }

  next(): string | null {
    const pending = Array.from(this.tasks.values()).filter(t => t.state === 'pending');
    if (pending.length === 0) return null;
    pending.sort((a, b) => b.priority - a.priority);
    const top = pending[0];
    top.state = 'running';
    top.started = Date.now();
    return top.id;
  }

  complete(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (t.state !== 'running') return false;
    t.state = 'done';
    t.ended = Date.now();
    return true;
  }

  cancel(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (t.state === 'done' || t.state === 'cancelled') return false;
    t.state = 'cancelled';
    t.ended = Date.now();
    return true;
  }

  getStats(): SchedStats {
    const all = Array.from(this.tasks.values());
    return {
      tasks: all.length,
      pending: all.filter(t => t.state === 'pending').length,
      running: all.filter(t => t.state === 'running').length,
      done: all.filter(t => t.state === 'done').length,
      cancelled: all.filter(t => t.state === 'cancelled').length,
      avgPriority: all.length > 0 ? Math.round((all.reduce((s, t) => s + t.priority, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getTask(id: string): SchedTask | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): SchedTask[] {
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

  getPriority(id: string): number {
    return this.tasks.get(id)?.priority ?? 0;
  }

  getState(id: string): SchedState | undefined {
    return this.tasks.get(id)?.state;
  }

  isPending(id: string): boolean {
    return this.tasks.get(id)?.state === 'pending';
  }

  isRunning(id: string): boolean {
    return this.tasks.get(id)?.state === 'running';
  }

  isDone(id: string): boolean {
    return this.tasks.get(id)?.state === 'done';
  }

  isCancelled(id: string): boolean {
    return this.tasks.get(id)?.state === 'cancelled';
  }

  setPriority(id: string, priority: number): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.priority = priority;
    return true;
  }

  getByState(state: SchedState): SchedTask[] {
    return Array.from(this.tasks.values()).filter(t => t.state === state);
  }

  getPendingTasks(): SchedTask[] {
    return this.getByState('pending');
  }

  getRunningTasks(): SchedTask[] {
    return this.getByState('running');
  }

  getDoneTasks(): SchedTask[] {
    return this.getByState('done');
  }

  getCancelledTasks(): SchedTask[] {
    return this.getByState('cancelled');
  }

  getByName(name: string): SchedTask[] {
    return Array.from(this.tasks.values()).filter(t => t.name === name);
  }

  getByMinPriority(min: number): SchedTask[] {
    return Array.from(this.tasks.values()).filter(t => t.priority >= min);
  }

  getSortedByPriority(): SchedTask[] {
    return [...Array.from(this.tasks.values())].sort((a, b) => b.priority - a.priority);
  }

  getCreatedAt(id: string): number {
    return this.tasks.get(id)?.created ?? 0;
  }

  getStartedAt(id: string): number {
    return this.tasks.get(id)?.started ?? 0;
  }

  getEndedAt(id: string): number {
    return this.tasks.get(id)?.ended ?? 0;
  }

  getHighestPriority(): SchedTask | null {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.priority > max.priority ? t : max);
  }

  getLowestPriority(): SchedTask | null {
    const all = Array.from(this.tasks.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.priority < min.priority ? t : min);
  }

  clearAll(): void {
    this.tasks.clear();
    this.counter = 0;
  }
}

export default TaskSchedulerV2;