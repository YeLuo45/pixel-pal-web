/**
 * Cache Engine
 * thunderbolt-design Cache Engine - Set + Get + Delete + Stats
 */

export interface CacheEntry {
  key: string;
  value: unknown;
  expires: number;
  hits: number;
  created: number;
  updated: number;
  active: boolean;
}

export interface CE2Stats {
  keys: number;
  totalHits: number;
  totalSets: number;
  totalDeletes: number;
  totalExpired: number;
  active: number;
  inactive: number;
  hitRate: number;
  avgHits: number;
}

export class CacheEngine {
  private entries: Map<string, CacheEntry> = new Map();
  private totalSets = 0;
  private totalDeletes = 0;
  private totalExpired = 0;

  set(key: string, value: unknown, ttl: number = 0): boolean {
    const now = Date.now();
    const existing = this.entries.get(key);
    if (existing) {
      existing.value = value;
      existing.expires = ttl > 0 ? now + ttl : 0;
      existing.updated = now;
      this.totalSets++;
      return true;
    }
    this.entries.set(key, {
      key,
      value,
      expires: ttl > 0 ? now + ttl : 0,
      hits: 0,
      created: now,
      updated: now,
      active: true,
    });
    this.totalSets++;
    return true;
  }

  get(key: string): unknown {
    const e = this.entries.get(key);
    if (!e) return undefined;
    if (e.expires > 0 && Date.now() > e.expires) {
      this.entries.delete(key);
      this.totalExpired++;
      return undefined;
    }
    e.hits++;
    e.updated = Date.now();
    return e.value;
  }

  has(key: string): boolean {
    const e = this.entries.get(key);
    if (!e) return false;
    if (e.expires > 0 && Date.now() > e.expires) {
      this.entries.delete(key);
      this.totalExpired++;
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const result = this.entries.delete(key);
    if (result) this.totalDeletes++;
    return result;
  }

  clear(): void {
    this.entries.clear();
  }

  purgeExpired(): number {
    const now = Date.now();
    let count = 0;
    for (const [key, e] of this.entries) {
      if (e.expires > 0 && now > e.expires) {
        this.entries.delete(key);
        count++;
        this.totalExpired++;
      }
    }
    return count;
  }

  getStats(): CE2Stats {
    const all = Array.from(this.entries.values());
    return {
      keys: all.length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      totalSets: this.totalSets,
      totalDeletes: this.totalDeletes,
      totalExpired: this.totalExpired,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      hitRate: this.totalSets > 0 ? Math.round((all.reduce((s, e) => s + e.hits, 0) / this.totalSets) * 100) / 100 : 0,
      avgHits: all.length > 0 ? Math.round((all.reduce((s, e) => s + e.hits, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getEntry(key: string): CacheEntry | undefined {
    return this.entries.get(key);
  }

  getAllEntries(): CacheEntry[] {
    return Array.from(this.entries.values());
  }

  getValue(key: string): unknown {
    return this.entries.get(key)?.value;
  }

  getHits(key: string): number {
    return this.entries.get(key)?.hits ?? 0;
  }

  getExpires(key: string): number {
    return this.entries.get(key)?.expires ?? 0;
  }

  getCount(): number {
    return this.entries.size;
  }

  isActive(key: string): boolean {
    return this.entries.get(key)?.active ?? false;
  }

  isExpired(key: string): boolean {
    const e = this.entries.get(key);
    if (!e) return false;
    return e.expires > 0 && Date.now() > e.expires;
  }

  setActive(key: string, active: boolean): boolean {
    const e = this.entries.get(key);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  touch(key: string): boolean {
    const e = this.entries.get(key);
    if (!e) return false;
    e.hits++;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.hits = 0;
      e.active = true;
    }
    this.totalSets = 0;
    this.totalDeletes = 0;
    this.totalExpired = 0;
  }

  getByMinHits(min: number): CacheEntry[] {
    return Array.from(this.entries.values()).filter(e => e.hits >= min);
  }

  getMostHits(): CacheEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.hits > max.hits ? e : max);
  }

  getNewest(): CacheEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): CacheEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(key: string): number {
    return this.entries.get(key)?.created ?? 0;
  }

  getUpdatedAt(key: string): number {
    return this.entries.get(key)?.updated ?? 0;
  }

  getAllKeys(): string[] {
    return [...this.entries.keys()];
  }

  getKeyCount(): number {
    return this.entries.size;
  }

  getTotalSets(): number {
    return this.totalSets;
  }

  getTotalDeletes(): number {
    return this.totalDeletes;
  }

  getTotalExpired(): number {
    return this.totalExpired;
  }

  getTotalHits(): number {
    return Array.from(this.entries.values()).reduce((s, e) => s + e.hits, 0);
  }

  hasMany(keys: string[]): boolean {
    return keys.every(k => this.has(k));
  }

  getMany(keys: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const k of keys) {
      result[k] = this.get(k);
    }
    return result;
  }

  setMany(entries: Array<[string, unknown]>, ttl: number = 0): number {
    let count = 0;
    for (const [k, v] of entries) {
      if (this.set(k, v, ttl)) count++;
    }
    return count;
  }

  deleteMany(keys: string[]): number {
    let count = 0;
    for (const k of keys) {
      if (this.delete(k)) count++;
    }
    return count;
  }

  clearAll(): void {
    this.entries.clear();
    this.totalSets = 0;
    this.totalDeletes = 0;
    this.totalExpired = 0;
  }
}

export default CacheEngine;