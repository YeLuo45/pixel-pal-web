/**
 * Token Bucket Engine
 * claude-code-design Token Bucket Engine - Create + Consume + Refill + Stats
 */

export interface Bucket {
  id: string;
  name: string;
  capacity: number;
  tokens: number;
  refillRate: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface TbeStats {
  buckets: number;
  totalConsumed: number;
  totalRefilled: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgCapacity: number;
  maxCapacity: number;
  minCapacity: number;
  avgTokens: number;
  maxTokens: number;
  minTokens: number;
}

export class TokenBucketEngine {
  private buckets: Map<string, Bucket> = new Map();
  private counter = 0;
  private totalConsumed = 0;
  private totalRefilled = 0;

  create(name: string, capacity: number = 100, refillRate: number = 10): string {
    const id = `tbe-${++this.counter}`;
    this.buckets.set(id, {
      id,
      name,
      capacity,
      tokens: capacity,
      refillRate,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  consume(id: string, amount: number = 1): boolean {
    const b = this.buckets.get(id);
    if (!b) return false;
    if (!b.active) return false;
    if (b.tokens < amount) return false;
    b.tokens -= amount;
    b.updated = Date.now();
    b.hits++;
    this.totalConsumed++;
    return true;
  }

  refill(id: string, amount: number = 1): boolean {
    const b = this.buckets.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.tokens = Math.min(b.capacity, b.tokens + amount);
    b.updated = Date.now();
    b.hits++;
    this.totalRefilled++;
    return true;
  }

  remove(id: string): boolean {
    return this.buckets.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.buckets.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setCapacity(id: string, capacity: number): boolean {
    const b = this.buckets.get(id);
    if (!b) return false;
    b.capacity = capacity;
    if (b.tokens > capacity) b.tokens = capacity;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.buckets.values()) {
      b.tokens = b.capacity;
      b.hits = 0;
      b.history = [];
      b.active = true;
    }
    this.totalConsumed = 0;
    this.totalRefilled = 0;
  }

  getStats(): TbeStats {
    const all = Array.from(this.buckets.values());
    const capacityValues = all.map(b => b.capacity);
    const tokenValues = all.map(b => b.tokens);
    return {
      buckets: all.length,
      totalConsumed: this.totalConsumed,
      totalRefilled: this.totalRefilled,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueNames: new Set(all.map(b => b.name)).size,
      avgCapacity: all.length > 0 ? Math.round((capacityValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxCapacity: capacityValues.length > 0 ? Math.max(...capacityValues) : 0,
      minCapacity: capacityValues.length > 0 ? Math.min(...capacityValues) : 0,
      avgTokens: all.length > 0 ? Math.round((tokenValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTokens: tokenValues.length > 0 ? Math.max(...tokenValues) : 0,
      minTokens: tokenValues.length > 0 ? Math.min(...tokenValues) : 0,
    };
  }

  getBucket(id: string): Bucket | undefined {
    return this.buckets.get(id);
  }

  getAllBuckets(): Bucket[] {
    return Array.from(this.buckets.values());
  }

  hasBucket(id: string): boolean {
    return this.buckets.has(id);
  }

  getCount(): number {
    return this.buckets.size;
  }

  getName(id: string): string | undefined {
    return this.buckets.get(id)?.name;
  }

  getCapacity(id: string): number {
    return this.buckets.get(id)?.capacity ?? 0;
  }

  getTokens(id: string): number {
    return this.buckets.get(id)?.tokens ?? 0;
  }

  getRefillRate(id: string): number {
    return this.buckets.get(id)?.refillRate ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.buckets.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.buckets.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.buckets.get(id)?.active ?? false;
  }

  getActiveBuckets(): Bucket[] {
    return Array.from(this.buckets.values()).filter(b => b.active);
  }

  getInactiveBuckets(): Bucket[] {
    return Array.from(this.buckets.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.buckets.values()).map(b => b.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinCapacity(min: number): Bucket[] {
    return Array.from(this.buckets.values()).filter(b => b.capacity >= min);
  }

  getNewest(): Bucket | null {
    const all = Array.from(this.buckets.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Bucket | null {
    const all = Array.from(this.buckets.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.buckets.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.buckets.get(id)?.updated ?? 0;
  }

  getTotalConsumed(): number {
    return this.totalConsumed;
  }

  getTotalRefilled(): number {
    return this.totalRefilled;
  }

  clearAll(): void {
    this.buckets.clear();
    this.counter = 0;
    this.totalConsumed = 0;
    this.totalRefilled = 0;
  }
}

export default TokenBucketEngine;