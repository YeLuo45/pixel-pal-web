/**
 * Cache Manager
 * thunderbolt-design Cache Manager - Set + Get + Delete + Clear + Stats
 */

export interface CacheItem {
  id: string;
  key: string;
  value: string;
  hits: number;
  expires: number;
  created: number;
  updated: number;
  active: boolean;
  history: number[];
}

export interface CamStats {
  items: number;
  hits: number;
  misses: number;
  expired: number;
  active: number;
  inactive: number;
  totalGets: number;
  totalSets: number;
  uniqueKeys: number;
  avgHits: number;
  maxHits: number;
  minHits: number;
  avgValueLength: number;
  hitRate: number;
}

export class CacheManager {
  private items: Map<string, CacheItem> = new Map();
  private counter = 0;
  private totalGets = 0;
  private totalSets = 0;
  private misses = 0;
  private expiredCount = 0;

  set(key: string, value: string, ttl: number = 0): string {
    const id = `cam-${++this.counter}`;
    const expires = ttl !== 0 ? Date.now() + ttl : 0;
    this.items.set(id, {
      id,
      key,
      value,
      hits: 0,
      expires,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      history: [],
    });
    this.totalSets++;
    return id;
  }

  get(key: string): string | null {
    this.totalGets++;
    for (const item of this.items.values()) {
      if (item.key !== key) continue;
      if (!item.active) continue;
      if (item.expires > 0 && item.expires < Date.now()) {
        item.active = false;
        this.expiredCount++;
        this.misses++;
        return null;
      }
      item.hits++;
      item.history.push(Date.now());
      item.updated = Date.now();
      return item.value;
    }
    this.misses++;
    return null;
  }

  delete(key: string): boolean {
    for (const id of Array.from(this.items.keys())) {
      const item = this.items.get(id);
      if (item && item.key === key) {
        this.items.delete(id);
        return true;
      }
    }
    return false;
  }

  deleteById(id: string): boolean {
    return this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
  }

  purgeExpired(): number {
    let purged = 0;
    const now = Date.now();
    for (const item of this.items.values()) {
      if (item.expires > 0 && item.expires < now) {
        item.active = false;
        this.expiredCount++;
        purged++;
      }
    }
    return purged;
  }

  getStats(): CamStats {
    const all = Array.from(this.items.values());
    const hitValues = all.map(i => i.hits);
    const valueLengths = all.map(i => i.value.length);
    return {
      items: all.length,
      hits: all.reduce((s, i) => s + i.hits, 0),
      misses: this.misses,
      expired: this.expiredCount,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalGets: this.totalGets,
      totalSets: this.totalSets,
      uniqueKeys: new Set(all.map(i => i.key)).size,
      avgHits: all.length > 0 ? Math.round((hitValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxHits: hitValues.length > 0 ? Math.max(...hitValues) : 0,
      minHits: hitValues.length > 0 ? Math.min(...hitValues) : 0,
      avgValueLength: all.length > 0 ? Math.round((valueLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      hitRate: this.totalGets > 0 ? Math.round(((this.totalGets - this.misses) / this.totalGets) * 100) / 100 : 0,
    };
  }

  getItem(id: string): CacheItem | undefined {
    return this.items.get(id);
  }

  getAllItems(): CacheItem[] {
    return Array.from(this.items.values());
  }

  hasItem(id: string): boolean {
    return this.items.has(id);
  }

  getCount(): number {
    return this.items.size;
  }

  getKey(id: string): string | undefined {
    return this.items.get(id)?.key;
  }

  getValue(id: string): string | undefined {
    return this.items.get(id)?.value;
  }

  getValueLength(id: string): number {
    return this.items.get(id)?.value.length ?? 0;
  }

  getHits(id: string): number {
    return this.items.get(id)?.hits ?? 0;
  }

  getExpires(id: string): number {
    return this.items.get(id)?.expires ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.items.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.items.get(id)?.active ?? false;
  }

  isExpired(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    return item.expires > 0 && item.expires < Date.now();
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setKey(id: string, key: string): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.key = key;
    i.updated = Date.now();
    return true;
  }

  setValue(id: string, value: string): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.value = value;
    i.updated = Date.now();
    return true;
  }

  setExpires(id: string, expires: number): boolean {
    const i = this.items.get(id);
    if (!i) return false;
    i.expires = expires;
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const i of this.items.values()) {
      i.hits = 0;
      i.history = [];
      i.active = true;
    }
    this.totalGets = 0;
    this.totalSets = 0;
    this.misses = 0;
    this.expiredCount = 0;
  }

  getByKey(key: string): CacheItem[] {
    return Array.from(this.items.values()).filter(i => i.key === key);
  }

  getActiveItems(): CacheItem[] {
    return Array.from(this.items.values()).filter(i => i.active);
  }

  getInactiveItems(): CacheItem[] {
    return Array.from(this.items.values()).filter(i => !i.active);
  }

  getAllKeys(): string[] {
    return [...new Set(Array.from(this.items.values()).map(i => i.key))];
  }

  getKeyCount(): number {
    return this.getAllKeys().length;
  }

  getByMinHits(min: number): CacheItem[] {
    return Array.from(this.items.values()).filter(i => i.hits >= min);
  }

  getMostHits(): CacheItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.hits > max.hits ? i : max);
  }

  getNewest(): CacheItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): CacheItem | null {
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

  getTotalGets(): number {
    return this.totalGets;
  }

  getTotalSets(): number {
    return this.totalSets;
  }

  getMisses(): number {
    return this.misses;
  }

  getExpiredCount(): number {
    return this.expiredCount;
  }

  clearAll(): void {
    this.items.clear();
    this.counter = 0;
    this.totalGets = 0;
    this.totalSets = 0;
    this.misses = 0;
    this.expiredCount = 0;
  }
}

export default CacheManager;