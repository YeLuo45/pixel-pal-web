/**
 * Cache Manager
 * claude-code-design Cache Manager - Set + Get + TTL + Stats
 */

export interface CacheEntry<V = unknown> {
  value: V;
  expires: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  size: number;
}

export type EvictionPolicy = 'lru' | 'fifo' | 'none';

export class CacheManager<V = unknown> {
  private store: Map<string, CacheEntry<V>> = new Map();
  private accessOrder: string[] = [];
  private hits = 0;
  private misses = 0;
  private sets = 0;
  private deletes = 0;
  private capacity: number;
  private defaultTtl: number;
  private policy: EvictionPolicy;

  constructor(capacity: number = 1000, defaultTtl: number = 0, policy: EvictionPolicy = 'lru') {
    this.capacity = capacity;
    this.defaultTtl = defaultTtl;
    this.policy = policy;
  }

  set(key: string, value: V, ttl?: number): void {
    const expires = (ttl ?? this.defaultTtl) > 0 ? Date.now() + (ttl ?? this.defaultTtl) : 0;
    this.store.set(key, { value, expires });
    this.sets++;
    this.updateAccessOrder(key);
    if (this.store.size > this.capacity) {
      this.evict();
    }
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (entry.expires > 0 && entry.expires < Date.now()) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    this.updateAccessOrder(key);
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expires > 0 && entry.expires < Date.now()) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const result = this.store.delete(key);
    if (result) this.deletes++;
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    return result;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      deletes: this.deletes,
      hitRate: total > 0 ? Math.round((this.hits / total) * 10000) / 10000 : 0,
      size: this.store.size,
    };
  }

  getSize(): number {
    return this.store.size;
  }

  getCapacity(): number {
    return this.capacity;
  }

  setCapacity(capacity: number): void {
    this.capacity = capacity;
    if (this.store.size > this.capacity) {
      this.evict();
    }
  }

  clear(): void {
    this.store.clear();
    this.accessOrder = [];
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  values(): V[] {
    return Array.from(this.store.values()).map(e => e.value);
  }

  getAllEntries(): Array<{ key: string; entry: CacheEntry<V> }> {
    return Array.from(this.store.entries()).map(([key, entry]) => ({ key, entry }));
  }

  getExpiresAt(key: string): number {
    return this.store.get(key)?.expires ?? 0;
  }

  isExpired(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    return entry.expires > 0 && entry.expires < Date.now();
  }

  getTtl(key: string): number {
    const entry = this.store.get(key);
    if (!entry || entry.expires === 0) return -1;
    return Math.max(0, entry.expires - Date.now());
  }

  setEvictionPolicy(policy: EvictionPolicy): void {
    this.policy = policy;
  }

  getEvictionPolicy(): EvictionPolicy {
    return this.policy;
  }

  getDefaultTtl(): number {
    return this.defaultTtl;
  }

  setDefaultTtl(ttl: number): void {
    this.defaultTtl = ttl;
  }

  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  private evict(): void {
    if (this.policy === 'none') return;
    const toRemove = this.store.size - this.capacity;
    if (toRemove <= 0) return;
    const keys = this.policy === 'lru' ? this.accessOrder.slice(0, toRemove) : Array.from(this.store.keys()).slice(0, toRemove);
    for (const key of keys) {
      this.store.delete(key);
    }
    this.accessOrder = this.accessOrder.filter(k => !keys.includes(k));
  }
}

export default CacheManager;