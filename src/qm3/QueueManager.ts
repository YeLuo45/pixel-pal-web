/**
 * Queue Manager
 * nanobot-design Queue Manager - Enqueue + Dequeue + Peek + Stats
 */

export type QStatus = 'queued' | 'processing' | 'done';

export interface QItem {
  id: string;
  task: string;
  priority: number;
  status: QStatus;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: QStatus[];
}

export interface Qm3Stats {
  queued: number;
  processing: number;
  done: number;
  totalTasks: number;
  totalEnqueued: number;
  totalDequeued: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTasks: number;
  avgPriority: number;
  maxPriority: number;
  minPriority: number;
  currentSize: number;
}

export class QueueManager {
  private items: Map<string, QItem> = new Map();
  private counter = 0;
  private totalEnqueued = 0;
  private totalDequeued = 0;

  enqueue(task: string, priority: number = 0): string {
    const id = `qm3-${++this.counter}`;
    this.items.set(id, {
      id,
      task,
      priority,
      status: 'queued',
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: ['queued'],
    });
    this.totalEnqueued++;
    return id;
  }

  dequeue(): string | null {
    let target: QItem | null = null;
    for (const item of this.items.values()) {
      if (item.status !== 'queued') continue;
      if (!item.active) continue;
      if (target === null || item.priority > target.priority) {
        target = item;
      }
    }
    if (!target) return null;
    target.status = 'processing';
    target.history.push('processing');
    target.updated = Date.now();
    target.hits++;
    this.totalDequeued++;
    return target.id;
  }

  complete(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    if (item.status !== 'processing') return false;
    item.status = 'done';
    item.history.push('done');
    item.updated = Date.now();
    item.hits++;
    return true;
  }

  peek(): string | null {
    let target: QItem | null = null;
    for (const item of this.items.values()) {
      if (item.status !== 'queued') continue;
      if (!item.active) continue;
      if (target === null || item.priority > target.priority) {
        target = item;
      }
    }
    return target?.id ?? null;
  }

  size(): number {
    let count = 0;
    for (const item of this.items.values()) {
      if (item.status === 'queued' && item.active) count++;
    }
    return count;
  }

  clear(): void {
    for (const item of this.items.values()) {
      if (item.status === 'done') {
        item.status = 'queued';
        item.history.push('queued');
      }
    }
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }

  getStats(): Qm3Stats {
    const all = Array.from(this.items.values());
    const priorityValues = all.map(i => i.priority);
    return {
      queued: all.filter(i => i.status === 'queued').length,
      processing: all.filter(i => i.status === 'processing').length,
      done: all.filter(i => i.status === 'done').length,
      totalTasks: all.length,
      totalEnqueued: this.totalEnqueued,
      totalDequeued: this.totalDequeued,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalHits: all.reduce((s, i) => s + i.hits, 0),
      uniqueTasks: new Set(all.map(i => i.task)).size,
      avgPriority: all.length > 0 ? Math.round((priorityValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPriority: priorityValues.length > 0 ? Math.max(...priorityValues) : 0,
      minPriority: priorityValues.length > 0 ? Math.min(...priorityValues) : 0,
      currentSize: this.size(),
    };
  }

  getItem(id: string): QItem | undefined {
    return this.items.get(id);
  }

  getAllItems(): QItem[] {
    return Array.from(this.items.values());
  }

  hasItem(id: string): boolean {
    return this.items.has(id);
  }

  getCount(): number {
    return this.items.size;
  }

  getTask(id: string): string | undefined {
    return this.items.get(id)?.task;
  }

  getPriority(id: string): number {
    return this.items.get(id)?.priority ?? 0;
  }

  getStatus(id: string): QStatus | undefined {
    return this.items.get(id)?.status;
  }

  getHistory(id: string): QStatus[] {
    return [...(this.items.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.items.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.items.get(id)?.active ?? false;
  }

  isQueued(id: string): boolean {
    return this.items.get(id)?.status === 'queued';
  }

  isProcessing(id: string): boolean {
    return this.items.get(id)?.status === 'processing';
  }

  isDone(id: string): boolean {
    return this.items.get(id)?.status === 'done';
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setTask(id: string, task: string): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.task = task;
    i.updated = Date.now();
    return true;
  }

  setPriority(id: string, priority: number): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.priority = priority;
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const i of this.items.values()) {
      i.status = 'queued';
      i.hits = 0;
      i.history = ['queued'];
      i.active = true;
    }
    this.totalEnqueued = 0;
    this.totalDequeued = 0;
  }

  getByTask(task: string): QItem[] {
    return Array.from(this.items.values()).filter(i => i.task === task);
  }

  getByStatus(status: QStatus): QItem[] {
    return Array.from(this.items.values()).filter(i => i.status === status);
  }

  getQueuedItems(): QItem[] {
    return Array.from(this.items.values()).filter(i => i.status === 'queued');
  }

  getProcessingItems(): QItem[] {
    return Array.from(this.items.values()).filter(i => i.status === 'processing');
  }

  getDoneItems(): QItem[] {
    return Array.from(this.items.values()).filter(i => i.status === 'done');
  }

  getActiveItems(): QItem[] {
    return Array.from(this.items.values()).filter(i => i.active);
  }

  getInactiveItems(): QItem[] {
    return Array.from(this.items.values()).filter(i => !i.active);
  }

  getAllTasks(): string[] {
    return [...new Set(Array.from(this.items.values()).map(i => i.task))];
  }

  getTaskCount(): number {
    return this.getAllTasks().length;
  }

  getNewest(): QItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): QItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getCreatedAt(id: string): number {
    return this.items.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.items.get(id)?.updated ?? 0;
  }

  getTotalEnqueued(): number {
    return this.totalEnqueued;
  }

  getTotalDequeued(): number {
    return this.totalDequeued;
  }

  clearAll(): void {
    this.items.clear();
    this.counter = 0;
    this.totalEnqueued = 0;
    this.totalDequeued = 0;
  }
}

export default QueueManager;