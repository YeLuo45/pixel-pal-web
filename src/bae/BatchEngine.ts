/**
 * Batch Engine
 * thunderbolt-design Batch Engine - Add + Execute + Stats
 */

export type BatchStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Batch {
  id: string;
  name: string;
  items: number;
  processed: number;
  status: BatchStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface BaeStats {
  batches: number;
  totalAdded: number;
  totalExecuted: number;
  totalCompleted: number;
  totalFailed: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalItems: number;
  totalProcessed: number;
  avgItems: number;
  maxItems: number;
  minItems: number;
}

export class BatchEngine {
  private batches: Map<string, Batch> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalExecuted = 0;
  private totalCompleted = 0;
  private totalFailed = 0;
  private totalItems = 0;
  private totalProcessed = 0;

  add(name: string, items: number): string {
    const id = `bae-${++this.counter}`;
    this.batches.set(id, {
      id,
      name,
      items,
      processed: 0,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalItems += items;
    return id;
  }

  execute(id: string, count: number = 1): boolean {
    const b = this.batches.get(id);
    if (!b) return false;
    if (!b.active) return false;
    if (b.status === 'completed' || b.status === 'failed') return false;
    if (b.processed === 0) b.status = 'running';
    b.processed = Math.min(b.items, b.processed + count);
    b.updated = Date.now();
    b.hits++;
    this.totalExecuted++;
    this.totalProcessed += count;
    if (b.processed >= b.items) {
      b.status = 'completed';
      this.totalCompleted++;
    }
    return true;
  }

  fail(id: string): boolean {
    const b = this.batches.get(id);
    if (!b) return false;
    b.status = 'failed';
    b.updated = Date.now();
    b.hits++;
    this.totalFailed++;
    return true;
  }

  remove(id: string): boolean {
    return this.batches.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.batches.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const b = this.batches.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  setItems(id: string, items: number): boolean {
    const b = this.batches.get(id);
    if (!b) return false;
    b.items = items;
    b.updated = Date.now();
    return true;
  }

  setProcessed(id: string, processed: number): boolean {
    const b = this.batches.get(id);
    if (!b) return false;
    b.processed = processed;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.batches.values()) {
      b.processed = 0;
      b.status = 'pending';
      b.active = true;
      b.hits = 0;
    }
    this.totalAdded = 0;
    this.totalExecuted = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
    this.totalItems = 0;
    this.totalProcessed = 0;
  }

  getStats(): BaeStats {
    const all = Array.from(this.batches.values());
    const iArr = all.map(b => b.items);
    return {
      batches: all.length,
      totalAdded: this.totalAdded,
      totalExecuted: this.totalExecuted,
      totalCompleted: this.totalCompleted,
      totalFailed: this.totalFailed,
      pending: all.filter(b => b.status === 'pending').length,
      running: all.filter(b => b.status === 'running').length,
      completed: all.filter(b => b.status === 'completed').length,
      failed: all.filter(b => b.status === 'failed').length,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueNames: new Set(all.map(b => b.name)).size,
      totalItems: this.totalItems,
      totalProcessed: this.totalProcessed,
      avgItems: all.length > 0 ? Math.round((iArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxItems: iArr.length > 0 ? Math.max(...iArr) : 0,
      minItems: iArr.length > 0 ? Math.min(...iArr) : 0,
    };
  }

  getBatch(id: string): Batch | undefined {
    return this.batches.get(id);
  }

  getAllBatches(): Batch[] {
    return Array.from(this.batches.values());
  }

  hasBatch(id: string): boolean {
    return this.batches.has(id);
  }

  getCount(): number {
    return this.batches.size;
  }

  getName(id: string): string | undefined {
    return this.batches.get(id)?.name;
  }

  getItems(id: string): number {
    return this.batches.get(id)?.items ?? 0;
  }

  getProcessed(id: string): number {
    return this.batches.get(id)?.processed ?? 0;
  }

  getStatus(id: string): BatchStatus | undefined {
    return this.batches.get(id)?.status;
  }

  getHits(id: string): number {
    return this.batches.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.batches.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.batches.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.batches.get(id)?.status === 'running';
  }

  isCompleted(id: string): boolean {
    return this.batches.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.batches.get(id)?.status === 'failed';
  }

  getByStatus(status: BatchStatus): Batch[] {
    return Array.from(this.batches.values()).filter(b => b.status === status);
  }

  getActiveBatches(): Batch[] {
    return Array.from(this.batches.values()).filter(b => b.active);
  }

  getInactiveBatches(): Batch[] {
    return Array.from(this.batches.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.batches.values()).map(b => b.name))];
  }

  getNewest(): Batch | null {
    const all = Array.from(this.batches.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Batch | null {
    const all = Array.from(this.batches.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.batches.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.batches.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalExecuted(): number {
    return this.totalExecuted;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.batches.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalExecuted = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
    this.totalItems = 0;
    this.totalProcessed = 0;
  }
}

export default BatchEngine;