/**
 * Queue Manager
 * thunderbolt-design Queue Manager - Enqueue + Dequeue + Stats
 */

export interface QueueItem {
  id: string;
  name: string;
  priority: number;
  processed: boolean;
  created: number;
  processedAt: number;
  attempts: number;
}

export interface QMStats {
  items: number;
  processed: number;
  pending: number;
  avgPriority: number;
  maxPriority: number;
  minPriority: number;
  totalAttempts: number;
}

export class QueueManager {
  private items: QueueItem[] = [];
  private processed: QueueItem[] = [];
  private counter = 0;

  enqueue(name: string, priority: number = 0): string {
    const id = `qm-${++this.counter}`;
    this.items.push({
      id,
      name,
      priority,
      processed: false,
      created: Date.now(),
      processedAt: 0,
      attempts: 0,
    });
    return id;
  }

  dequeue(): string | null {
    if (this.items.length === 0) return null;
    // Sort by priority descending, then by creation time ascending
    this.items.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.created - b.created;
    });
    const item = this.items.shift()!;
    item.processed = true;
    item.processedAt = Date.now();
    item.attempts++;
    this.processed.push(item);
    return item.id;
  }

  getStats(): QMStats {
    const all = [...this.items, ...this.processed];
    if (all.length === 0) {
      return { items: 0, processed: 0, pending: 0, avgPriority: 0, maxPriority: 0, minPriority: 0, totalAttempts: 0 };
    }
    const priorities = all.map(i => i.priority);
    return {
      items: this.items.length + this.processed.length,
      processed: this.processed.length,
      pending: this.items.length,
      avgPriority: Math.round((priorities.reduce((s, p) => s + p, 0) / all.length) * 100) / 100,
      maxPriority: Math.max(...priorities),
      minPriority: Math.min(...priorities),
      totalAttempts: all.reduce((s, i) => s + i.attempts, 0),
    };
  }

  getItem(id: string): QueueItem | undefined {
    return [...this.items, ...this.processed].find(i => i.id === id);
  }

  getAllItems(): QueueItem[] {
    return [...this.items, ...this.processed];
  }

  getPendingItems(): QueueItem[] {
    return [...this.items];
  }

  getProcessedItems(): QueueItem[] {
    return [...this.processed];
  }

  removeItem(id: string): boolean {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx >= 0) {
      this.items.splice(idx, 1);
      return true;
    }
    const pidx = this.processed.findIndex(i => i.id === id);
    if (pidx >= 0) {
      this.processed.splice(pidx, 1);
      return true;
    }
    return false;
  }

  hasItem(id: string): boolean {
    return this.getItem(id) !== undefined;
  }

  getCount(): number {
    return this.items.length + this.processed.length;
  }

  getPendingCount(): number {
    return this.items.length;
  }

  getProcessedCount(): number {
    return this.processed.length;
  }

  getName(id: string): string | undefined {
    return this.getItem(id)?.name;
  }

  getPriority(id: string): number {
    return this.getItem(id)?.priority ?? 0;
  }

  isProcessed(id: string): boolean {
    return this.getItem(id)?.processed ?? false;
  }

  isPending(id: string): boolean {
    const item = this.getItem(id);
    return item ? !item.processed : false;
  }

  peek(): QueueItem | null {
    if (this.items.length === 0) return null;
    const sorted = [...this.items].sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.created - b.created;
    });
    return sorted[0];
  }

  setPriority(id: string, priority: number): boolean {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;
    item.priority = priority;
    return true;
  }

  setName(id: string, name: string): boolean {
    const item = this.getItem(id);
    if (!item) return false;
    item.name = name;
    return true;
  }

  retry(id: string): boolean {
    const item = this.processed.find(i => i.id === id);
    if (!item) return false;
    item.processed = false;
    item.processedAt = 0;
    item.attempts++;
    this.processed = this.processed.filter(i => i.id !== id);
    this.items.push(item);
    return true;
  }

  clearProcessed(): void {
    this.processed = [];
  }

  clearPending(): void {
    this.items = [];
  }

  clearAll(): void {
    this.items = [];
    this.processed = [];
    this.counter = 0;
  }

  getByPriority(priority: number): QueueItem[] {
    return this.getAllItems().filter(i => i.priority === priority);
  }

  getByMinPriority(min: number): QueueItem[] {
    return this.getAllItems().filter(i => i.priority >= min);
  }

  getByName(name: string): QueueItem[] {
    return this.getAllItems().filter(i => i.name === name);
  }

  getPendingByPriority(priority: number): QueueItem[] {
    return this.items.filter(i => i.priority === priority);
  }

  getProcessedByName(name: string): QueueItem[] {
    return this.processed.filter(i => i.name === name);
  }

  getAllNames(): string[] {
    return [...new Set(this.getAllItems().map(i => i.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getMostPriority(): QueueItem | null {
    const all = this.getAllItems();
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.priority > max.priority ? i : max);
  }

  getNewest(): QueueItem | null {
    const all = this.getAllItems();
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): QueueItem | null {
    const all = this.getAllItems();
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getMostAttempts(): QueueItem | null {
    const all = this.getAllItems();
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.attempts > max.attempts ? i : max);
  }

  getCreatedAt(id: string): number {
    return this.getItem(id)?.created ?? 0;
  }

  getProcessedAt(id: string): number {
    return this.getItem(id)?.processedAt ?? 0;
  }

  getAttempts(id: string): number {
    return this.getItem(id)?.attempts ?? 0;
  }
}

export default QueueManager;