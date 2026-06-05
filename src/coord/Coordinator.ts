/**
 * Coordinator
 * thunderbolt-design Coordinator - AddTask + Start + Complete + Fail
 */

export type TaskState = 'pending' | 'running' | 'done' | 'failed';

export interface Task {
  id: string;
  name: string;
  state: TaskState;
  reason: string;
  created: number;
  started: number;
  ended: number;
  duration: number;
}

export interface CoordinatorStats {
  tasks: number;
  done: number;
  failed: number;
  running: number;
  pending: number;
  avgDuration: number;
}

export class Coordinator {
  private tasks: Map<string, Task> = new Map();
  private counter = 0;

  addTask(name: string): string {
    const id = `task-${++this.counter}`;
    this.tasks.set(id, {
      id,
      name,
      state: 'pending',
      reason: '',
      created: Date.now(),
      started: 0,
      ended: 0,
      duration: 0,
    });
    return id;
  }

  start(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (t.state !== 'pending') return false;
    t.state = 'running';
    t.started = Date.now();
    return true;
  }

  complete(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    if (t.state !== 'running') return false;
    t.state = 'done';
    t.ended = Date.now();
    t.duration = t.ended - t.started;
    return true;
  }

  fail(id: string, reason: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.state = 'failed';
    t.reason = reason;
    t.ended = Date.now();
    t.duration = t.ended - t.started;
    return true;
  }

  getStats(): CoordinatorStats {
    const all = Array.from(this.tasks.values());
    const done = all.filter(t => t.state === 'done');
    return {
      tasks: all.length,
      done: done.length,
      failed: all.filter(t => t.state === 'failed').length,
      running: all.filter(t => t.state === 'running').length,
      pending: all.filter(t => t.state === 'pending').length,
      avgDuration: done.length > 0 ? Math.round((done.reduce((s, t) => s + t.duration, 0) / done.length) * 100) / 100 : 0,
    };
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
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

  getState(id: string): TaskState | undefined {
    return this.tasks.get(id)?.state;
  }

  getReason(id: string): string {
    return this.tasks.get(id)?.reason ?? '';
  }

  getDuration(id: string): number {
    return this.tasks.get(id)?.duration ?? 0;
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

  isFailed(id: string): boolean {
    return this.tasks.get(id)?.state === 'failed';
  }

  getByState(state: TaskState): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.state === state);
  }

  getDoneTasks(): Task[] {
    return this.getByState('done');
  }

  getFailedTasks(): Task[] {
    return this.getByState('failed');
  }

  getRunningTasks(): Task[] {
    return this.getByState('running');
  }

  getPendingTasks(): Task[] {
    return this.getByState('pending');
  }

  getByName(name: string): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.name === name);
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

  getLongestTask(): Task | null {
    const done = this.getDoneTasks();
    if (done.length === 0) return null;
    return done.reduce((max, t) => t.duration > max.duration ? t : max);
  }

  getShortestTask(): Task | null {
    const done = this.getDoneTasks();
    if (done.length === 0) return null;
    return done.reduce((min, t) => t.duration < min.duration ? t : min);
  }

  resetTask(id: string): boolean {
    const t = this.tasks.get(id);
    if (!t) return false;
    t.state = 'pending';
    t.reason = '';
    t.started = 0;
    t.ended = 0;
    t.duration = 0;
    return true;
  }

  clearAll(): void {
    this.tasks.clear();
    this.counter = 0;
  }
}

export default Coordinator;