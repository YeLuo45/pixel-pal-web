/**
 * Queue Manager v2
 * thunderbolt-design Queue Manager v2 - Create + Schedule + Complete + Fail + Stats
 */

export type QueuePriority = 'low' | 'medium' | 'high' | 'critical';
export type QueueStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface QueueItem {
  id: string;
  name: string;
  priority: QueuePriority;
  status: QueueStatus;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: QueueStatus[];
}

export interface QM2Stats {
  queues: number;
  pending: number;
  processing: number;
  done: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  completionRate: number;
}

export class QueueManagerV2 {
  private queues: Map<string, QueueItem> = new Map();
  private counter = 0;
  private totalCompleted = 0;
  private totalFailed = 0;

  create(name: string, priority: QueuePriority = 'medium'): string {
    const id = `qm2-${++this.counter}`;
    this.queues.set(id, {
      id,
      name,
      priority,
      status: 'pending',
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: ['pending'],
    });
    return id;
  }

  schedule(id: string): boolean {
    const q = this.queues.get(id);
    if (!q) return false;
    if (!q.active) return false;
    if (q.status !== 'pending') return false;
    q.status = 'processing';
    q.history.push('processing');
    q.updated = Date.now();
    q.hits++;
    return true;
  }

  complete(id: string): boolean {
    const q = this.queues.get(id);
    if (!q) return false;
    if (!q.active) return false;
    if (q.status !== 'processing') return false;
    q.status = 'done';
    q.history.push('done');
    q.updated = Date.now();
    q.hits++;
    this.totalCompleted++;
    return true;
  }

  fail(id: string): boolean {
    const q = this.queues.get(id);
    if (!q) return false;
    if (!q.active) return false;
    if (q.status !== 'processing') return false;
    q.status = 'failed';
    q.history.push('failed');
    q.updated = Date.now();
    q.hits++;
    this.totalFailed++;
    return true;
  }

  retry(id: string): boolean {
    const q = this.queues.get(id);
    if (!q) return false;
    if (q.status !== 'failed') return false;
    q.status = 'pending';
    q.history.push('pending');
    q.updated = Date.now();
    q.hits++;
    return true;
  }

  getStats(): QM2Stats {
    const all = Array.from(this.queues.values());
    const finished = this.totalCompleted + this.totalFailed;
    return {
      queues: all.length,
      pending: all.filter(q => q.status === 'pending').length,
      processing: all.filter(q => q.status === 'processing').length,
      done: all.filter(q => q.status === 'done').length,
      failed: all.filter(q => q.status === 'failed').length,
      active: all.filter(q => q.active).length,
      inactive: all.filter(q => !q.active).length,
      totalHits: all.reduce((s, q) => s + q.hits, 0),
      uniqueNames: new Set(all.map(q => q.name)).size,
      low: all.filter(q => q.priority === 'low').length,
      medium: all.filter(q => q.priority === 'medium').length,
      high: all.filter(q => q.priority === 'high').length,
      critical: all.filter(q => q.priority === 'critical').length,
      completionRate: finished > 0 ? Math.round((this.totalCompleted / finished) * 100) / 100 : 0,
    };
  }

  getItem(id: string): QueueItem | undefined {
    return this.queues.get(id);
  }

  getAllItems(): QueueItem[] {
    return Array.from(this.queues.values());
  }

  removeItem(id: string): boolean {
    return this.queues.delete(id);
  }

  hasItem(id: string): boolean {
    return this.queues.has(id);
  }

  getCount(): number {
    return this.queues.size;
  }

  getName(id: string): string | undefined {
    return this.queues.get(id)?.name;
  }

  getPriority(id: string): QueuePriority | undefined {
    return this.queues.get(id)?.priority;
  }

  getStatus(id: string): QueueStatus | undefined {
    return this.queues.get(id)?.status;
  }

  getHistory(id: string): QueueStatus[] {
    return [...(this.queues.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.queues.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.queues.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.queues.get(id)?.status === 'pending';
  }

  isProcessing(id: string): boolean {
    return this.queues.get(id)?.status === 'processing';
  }

  isDone(id: string): boolean {
    return this.queues.get(id)?.status === 'done';
  }

  isFailed(id: string): boolean {
    return this.queues.get(id)?.status === 'failed';
  }

  isLow(id: string): boolean {
    return this.queues.get(id)?.priority === 'low';
  }

  isMedium(id: string): boolean {
    return this.queues.get(id)?.priority === 'medium';
  }

  isHigh(id: string): boolean {
    return this.queues.get(id)?.priority === 'high';
  }

  isCritical(id: string): boolean {
    return this.queues.get(id)?.priority === 'critical';
  }

  setActive(id: string, active: boolean): boolean {
    const q = this.queues.get(id);
    if (!q) return false;
    q.active = active;
    q.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const q = this.queues.get(id);
    if (!q) return false;
    q.name = name;
    q.updated = Date.now();
    return true;
  }

  setPriority(id: string, priority: QueuePriority): boolean {
    const q = this.queues.get(id);
    if (!q) return false;
    q.priority = priority;
    q.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const q of this.queues.values()) {
      q.status = 'pending';
      q.hits = 0;
      q.history = ['pending'];
      q.active = true;
    }
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }

  getByName(name: string): QueueItem[] {
    return Array.from(this.queues.values()).filter(q => q.name === name);
  }

  getByStatus(status: QueueStatus): QueueItem[] {
    return Array.from(this.queues.values()).filter(q => q.status === status);
  }

  getByPriority(priority: QueuePriority): QueueItem[] {
    return Array.from(this.queues.values()).filter(q => q.priority === priority);
  }

  getActiveItems(): QueueItem[] {
    return Array.from(this.queues.values()).filter(q => q.active);
  }

  getInactiveItems(): QueueItem[] {
    return Array.from(this.queues.values()).filter(q => !q.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.queues.values()).map(q => q.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getNewest(): QueueItem | null {
    const all = Array.from(this.queues.values());
    if (all.length === 0) return null;
    return all.reduce((max, q) => q.created > max.created ? q : max);
  }

  getOldest(): QueueItem | null {
    const all = Array.from(this.queues.values());
    if (all.length === 0) return null;
    return all.reduce((min, q) => q.created < min.created ? q : min);
  }

  getCreatedAt(id: string): number {
    return this.queues.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.queues.get(id)?.updated ?? 0;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.queues.clear();
    this.counter = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }
}

export default QueueManagerV2;