/**
 * Task Distributor
 * chatdev-design Task Distributor - Enqueue + Assign + Complete + Fail
 */

export type DistTaskState = 'queued' | 'assigned' | 'done' | 'failed';

export interface DistTask {
  id: string;
  name: string;
  assignee: string | null;
  state: DistTaskState;
  reason: string;
  created: number;
  assigned: number;
  completed: number;
  duration: number;
}

export interface DistributorStats {
  tasks: number;
  done: number;
  failed: number;
  assigned: number;
  queued: number;
  assignees: number;
}

export class TaskDistributor {
  private tasks: Map<string, DistTask> = new Map();
  private assignees: Set<string> = new Set();
  private counter = 0;

  enqueue(name: string): string {
    const id = `dist-${++this.counter}`;
    this.tasks.set(id, {
      id,
      name,
      assignee: null,
      state: 'queued',
      reason: '',
      created: Date.now(),
      assigned: 0,
      completed: 0,
      duration: 0,
    });
    return id;
  }

  assign(taskId: string, assignee: string): boolean {
    const t = this.tasks.get(taskId);
    if (!t) return false;
    if (t.state !== 'queued') return false;
    t.state = 'assigned';
    t.assignee = assignee;
    t.assigned = Date.now();
    this.assignees.add(assignee);
    return true;
  }

  complete(taskId: string): boolean {
    const t = this.tasks.get(taskId);
    if (!t) return false;
    if (t.state !== 'assigned') return false;
    t.state = 'done';
    t.completed = Date.now();
    t.duration = t.completed - t.assigned;
    return true;
  }

  fail(taskId: string, reason: string): boolean {
    const t = this.tasks.get(taskId);
    if (!t) return false;
    t.state = 'failed';
    t.reason = reason;
    t.completed = Date.now();
    t.duration = t.completed - t.assigned;
    return true;
  }

  reclaim(taskId: string): boolean {
    const t = this.tasks.get(taskId);
    if (!t) return false;
    if (t.state !== 'assigned') return false;
    t.state = 'queued';
    t.assignee = null;
    t.assigned = 0;
    return true;
  }

  getStats(): DistributorStats {
    const all = Array.from(this.tasks.values());
    return {
      tasks: all.length,
      done: all.filter(t => t.state === 'done').length,
      failed: all.filter(t => t.state === 'failed').length,
      assigned: all.filter(t => t.state === 'assigned').length,
      queued: all.filter(t => t.state === 'queued').length,
      assignees: this.assignees.size,
    };
  }

  getTask(id: string): DistTask | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): DistTask[] {
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

  getAssignee(id: string): string | null {
    return this.tasks.get(id)?.assignee ?? null;
  }

  getState(id: string): DistTaskState | undefined {
    return this.tasks.get(id)?.state;
  }

  getReason(id: string): string {
    return this.tasks.get(id)?.reason ?? '';
  }

  getDuration(id: string): number {
    return this.tasks.get(id)?.duration ?? 0;
  }

  isQueued(id: string): boolean {
    return this.tasks.get(id)?.state === 'queued';
  }

  isAssigned(id: string): boolean {
    return this.tasks.get(id)?.state === 'assigned';
  }

  isDone(id: string): boolean {
    return this.tasks.get(id)?.state === 'done';
  }

  isFailed(id: string): boolean {
    return this.tasks.get(id)?.state === 'failed';
  }

  getByState(state: DistTaskState): DistTask[] {
    return Array.from(this.tasks.values()).filter(t => t.state === state);
  }

  getQueued(): DistTask[] {
    return this.getByState('queued');
  }

  getAssigned(): DistTask[] {
    return this.getByState('assigned');
  }

  getDone(): DistTask[] {
    return this.getByState('done');
  }

  getFailed(): DistTask[] {
    return this.getByState('failed');
  }

  getByAssignee(assignee: string): DistTask[] {
    return Array.from(this.tasks.values()).filter(t => t.assignee === assignee);
  }

  getAssigneeCount(assignee: string): number {
    return this.getByAssignee(assignee).length;
  }

  getAllAssignees(): string[] {
    return Array.from(this.assignees);
  }

  getCreatedAt(id: string): number {
    return this.tasks.get(id)?.created ?? 0;
  }

  getAssignedAt(id: string): number {
    return this.tasks.get(id)?.assigned ?? 0;
  }

  getCompletedAt(id: string): number {
    return this.tasks.get(id)?.completed ?? 0;
  }

  getAvgDuration(): number {
    const done = this.getDone();
    if (done.length === 0) return 0;
    return Math.round((done.reduce((s, t) => s + t.duration, 0) / done.length) * 100) / 100;
  }

  getMostActiveAssignee(): string | null {
    let max = 0;
    let result: string | null = null;
    for (const assignee of this.assignees) {
      const count = this.getAssigneeCount(assignee);
      if (count > max) {
        max = count;
        result = assignee;
      }
    }
    return result;
  }

  clearAll(): void {
    this.tasks.clear();
    this.assignees.clear();
    this.counter = 0;
  }
}

export default TaskDistributor;