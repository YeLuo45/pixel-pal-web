/**
 * Rate Engine
 * thunderbolt-design Rate Engine - Add + Tick + Limit + Stats
 */

export type RateState = 'ok' | 'limited' | 'blocked';

export interface Rate {
  id: string;
  name: string;
  limit: number;
  count: number;
  state: RateState;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface RaeStats {
  rates: number;
  totalAdded: number;
  totalLimited: number;
  totalBlocked: number;
  ok: number;
  limited: number;
  blocked: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalLimit: number;
  totalCount: number;
  avgLimit: number;
  avgCount: number;
}

export class RateEngine {
  private rates: Map<string, Rate> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalLimited = 0;
  private totalBlocked = 0;
  private totalLimit = 0;
  private totalCount = 0;

  add(name: string, limit: number): string {
    const id = `rae-${++this.counter}`;
    this.rates.set(id, {
      id,
      name,
      limit,
      count: 0,
      state: 'ok',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalLimit += limit;
    return id;
  }

  tick(id: string): boolean {
    const r = this.rates.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.count++;
    r.updated = Date.now();
    r.hits++;
    this.totalCount++;
    if (r.count >= r.limit) {
      r.state = 'limited';
      this.totalLimited++;
    }
    return true;
  }

  block(id: string): boolean {
    const r = this.rates.get(id);
    if (!r) return false;
    r.state = 'blocked';
    r.updated = Date.now();
    r.hits++;
    this.totalBlocked++;
    return true;
  }

  reset(id: string): boolean {
    const r = this.rates.get(id);
    if (!r) return false;
    r.count = 0;
    r.state = 'ok';
    r.updated = Date.now();
    r.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.rates.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.rates.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.rates.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setLimit(id: string, limit: number): boolean {
    const r = this.rates.get(id);
    if (!r) return false;
    r.limit = limit;
    r.updated = Date.now();
    return true;
  }

  setCount(id: string, count: number): boolean {
    const r = this.rates.get(id);
    if (!r) return false;
    r.count = count;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.rates.values()) {
      r.count = 0;
      r.state = 'ok';
      r.active = true;
      r.hits = 0;
    }
    this.totalAdded = 0;
    this.totalLimited = 0;
    this.totalBlocked = 0;
    this.totalLimit = 0;
    this.totalCount = 0;
  }

  getStats(): RaeStats {
    const all = Array.from(this.rates.values());
    const lArr = all.map(r => r.limit);
    const cArr = all.map(r => r.count);
    return {
      rates: all.length,
      totalAdded: this.totalAdded,
      totalLimited: this.totalLimited,
      totalBlocked: this.totalBlocked,
      ok: all.filter(r => r.state === 'ok').length,
      limited: all.filter(r => r.state === 'limited').length,
      blocked: all.filter(r => r.state === 'blocked').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
      totalLimit: this.totalLimit,
      totalCount: this.totalCount,
      avgLimit: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgCount: all.length > 0 ? Math.round((cArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getRate(id: string): Rate | undefined {
    return this.rates.get(id);
  }

  getAllRates(): Rate[] {
    return Array.from(this.rates.values());
  }

  hasRate(id: string): boolean {
    return this.rates.has(id);
  }

  getCount(): number {
    return this.rates.size;
  }

  getName(id: string): string | undefined {
    return this.rates.get(id)?.name;
  }

  getLimit(id: string): number {
    return this.rates.get(id)?.limit ?? 0;
  }

  getCurrent(id: string): number {
    return this.rates.get(id)?.count ?? 0;
  }

  getState(id: string): RateState | undefined {
    return this.rates.get(id)?.state;
  }

  getHits(id: string): number {
    return this.rates.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.rates.get(id)?.active ?? false;
  }

  isOK(id: string): boolean {
    return this.rates.get(id)?.state === 'ok';
  }

  isLimited(id: string): boolean {
    return this.rates.get(id)?.state === 'limited';
  }

  isBlocked(id: string): boolean {
    return this.rates.get(id)?.state === 'blocked';
  }

  isOverLimit(id: string): boolean {
    const r = this.rates.get(id);
    return r ? r.count >= r.limit : false;
  }

  getByState(state: RateState): Rate[] {
    return Array.from(this.rates.values()).filter(r => r.state === state);
  }

  getActiveRates(): Rate[] {
    return Array.from(this.rates.values()).filter(r => r.active);
  }

  getInactiveRates(): Rate[] {
    return Array.from(this.rates.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.rates.values()).map(r => r.name))];
  }

  getNewest(): Rate | null {
    const all = Array.from(this.rates.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Rate | null {
    const all = Array.from(this.rates.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.rates.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.rates.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalLimited(): number {
    return this.totalLimited;
  }

  getTotalBlocked(): number {
    return this.totalBlocked;
  }

  clearAll(): void {
    this.rates.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalLimited = 0;
    this.totalBlocked = 0;
    this.totalLimit = 0;
    this.totalCount = 0;
  }
}

export default RateEngine;