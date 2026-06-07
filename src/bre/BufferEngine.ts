/**
 * Buffer Engine
 * nanobot-design Buffer Engine - Push + Pop + Flush + Stats
 */

export interface BufferItem {
  id: string;
  value: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface BreStats {
  items: number;
  totalPushed: number;
  totalPopped: number;
  totalFlushed: number;
  active: number;
  inactive: number;
  totalHits: number;
  capacityUsed: number;
  avgHits: number;
  maxHits: number;
  minHits: number;
}

export class BufferEngine {
  private buffer: BufferItem[] = [];
  private counter = 0;
  private totalPushed = 0;
  private totalPopped = 0;
  private totalFlushed = 0;
  private capacity: number;

  constructor(capacity: number = 1000) {
    this.capacity = capacity;
  }

  push(value: string): string | null {
    if (this.buffer.length >= this.capacity) return null;
    const id = `bre-${++this.counter}`;
    this.buffer.push({
      id,
      value,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalPushed++;
    return id;
  }

  pop(): string | null {
    if (this.buffer.length === 0) return null;
    const item = this.buffer.shift();
    if (item) {
      this.totalPopped++;
      return item.value;
    }
    return null;
  }

  flush(): number {
    const count = this.buffer.length;
    this.buffer = [];
    this.totalFlushed += count;
    return count;
  }

  remove(id: string): boolean {
    const idx = this.buffer.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.buffer.splice(idx, 1);
    return true;
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.buffer.find(b => b.id === id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.buffer) {
      b.active = true;
      b.hits = 0;
    }
    this.totalPushed = 0;
    this.totalPopped = 0;
    this.totalFlushed = 0;
  }

  getStats(): BreStats {
    const hitsArr = this.buffer.map(b => b.hits);
    return {
      items: this.buffer.length,
      totalPushed: this.totalPushed,
      totalPopped: this.totalPopped,
      totalFlushed: this.totalFlushed,
      active: this.buffer.filter(b => b.active).length,
      inactive: this.buffer.filter(b => !b.active).length,
      totalHits: this.buffer.reduce((s, b) => s + b.hits, 0),
      capacityUsed: this.buffer.length,
      avgHits: this.buffer.length > 0 ? Math.round((hitsArr.reduce((s, v) => s + v, 0) / this.buffer.length) * 100) / 100 : 0,
      maxHits: hitsArr.length > 0 ? Math.max(...hitsArr) : 0,
      minHits: hitsArr.length > 0 ? Math.min(...hitsArr) : 0,
    };
  }

  getItem(id: string): BufferItem | undefined {
    return this.buffer.find(b => b.id === id);
  }

  hasItem(id: string): boolean {
    return this.buffer.some(b => b.id === id);
  }

  getCount(): number {
    return this.buffer.length;
  }

  getValue(id: string): string | undefined {
    return this.buffer.find(b => b.id === id)?.value;
  }

  getHits(id: string): number {
    return this.buffer.find(b => b.id === id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.buffer.find(b => b.id === id)?.active ?? false;
  }

  getActiveItems(): BufferItem[] {
    return this.buffer.filter(b => b.active);
  }

  getInactiveItems(): BufferItem[] {
    return this.buffer.filter(b => !b.active);
  }

  peek(): string | null {
    if (this.buffer.length === 0) return null;
    return this.buffer[0].value;
  }

  getCapacity(): number {
    return this.capacity;
  }

  isFull(): boolean {
    return this.buffer.length >= this.capacity;
  }

  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  getCreatedAt(id: string): number {
    return this.buffer.find(b => b.id === id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.buffer.find(b => b.id === id)?.updated ?? 0;
  }

  getTotalPushed(): number {
    return this.totalPushed;
  }

  getTotalPopped(): number {
    return this.totalPopped;
  }

  getTotalFlushed(): number {
    return this.totalFlushed;
  }

  clearAll(): void {
    this.buffer = [];
    this.counter = 0;
    this.totalPushed = 0;
    this.totalPopped = 0;
    this.totalFlushed = 0;
  }
}

export default BufferEngine;