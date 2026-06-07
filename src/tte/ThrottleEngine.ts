/**
 * Throttle Engine
 * thunderbolt-design Throttle Engine - Add + Throttle + Check + Stats
 */

export type ThrottleStrategy = 'fixed' | 'sliding' | 'token';

export interface Throttle {
  id: string;
  name: string;
  strategy: ThrottleStrategy;
  rate: number;
  allowed: number;
  blocked: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface TteStats {
  throttles: number;
  totalAdded: number;
  totalAllowed: number;
  totalBlocked: number;
  fixed: number;
  sliding: number;
  token: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalAllowed2: number;
  totalBlocked2: number;
  avgRate: number;
  maxRate: number;
  minRate: number;
}

export class ThrottleEngine {
  private throttles: Map<string, Throttle> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalAllowed = 0;
  private totalBlocked = 0;

  add(name: string, strategy: ThrottleStrategy, rate: number): string {
    const id = `tte-${++this.counter}`;
    this.throttles.set(id, {
      id,
      name,
      strategy,
      rate,
      allowed: 0,
      blocked: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  throttle(id: string): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.updated = Date.now();
    t.hits++;
    const allow = t.rate > 0;
    if (allow) {
      t.allowed++;
      this.totalAllowed++;
      t.rate--;
    } else {
      t.blocked++;
      this.totalBlocked++;
    }
    return allow;
  }

  check(id: string): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    return t.rate > 0;
  }

  remove(id: string): boolean {
    return this.throttles.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setRate(id: string, rate: number): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    t.rate = rate;
    t.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  setStrategy(id: string, strategy: ThrottleStrategy): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    t.strategy = strategy;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.throttles.values()) {
      t.allowed = 0;
      t.blocked = 0;
      t.active = true;
      t.hits = 0;
    }
    this.totalAdded = 0;
    this.totalAllowed = 0;
    this.totalBlocked = 0;
  }

  getStats(): TteStats {
    const all = Array.from(this.throttles.values());
    const rateArr = all.map(t => t.rate);
    return {
      throttles: all.length,
      totalAdded: this.totalAdded,
      totalAllowed: this.totalAllowed,
      totalBlocked: this.totalBlocked,
      fixed: all.filter(t => t.strategy === 'fixed').length,
      sliding: all.filter(t => t.strategy === 'sliding').length,
      token: all.filter(t => t.strategy === 'token').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      totalAllowed2: all.reduce((s, t) => s + t.allowed, 0),
      totalBlocked2: all.reduce((s, t) => s + t.blocked, 0),
      avgRate: all.length > 0 ? Math.round((rateArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxRate: rateArr.length > 0 ? Math.max(...rateArr) : 0,
      minRate: rateArr.length > 0 ? Math.min(...rateArr) : 0,
    };
  }

  getThrottle(id: string): Throttle | undefined {
    return this.throttles.get(id);
  }

  getAllThrottles(): Throttle[] {
    return Array.from(this.throttles.values());
  }

  hasThrottle(id: string): boolean {
    return this.throttles.has(id);
  }

  getCount(): number {
    return this.throttles.size;
  }

  getName(id: string): string | undefined {
    return this.throttles.get(id)?.name;
  }

  getStrategy(id: string): ThrottleStrategy | undefined {
    return this.throttles.get(id)?.strategy;
  }

  getRate(id: string): number {
    return this.throttles.get(id)?.rate ?? 0;
  }

  getAllowed(id: string): number {
    return this.throttles.get(id)?.allowed ?? 0;
  }

  getBlocked(id: string): number {
    return this.throttles.get(id)?.blocked ?? 0;
  }

  getHits(id: string): number {
    return this.throttles.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.throttles.get(id)?.active ?? false;
  }

  isFixed(id: string): boolean {
    return this.throttles.get(id)?.strategy === 'fixed';
  }

  isSliding(id: string): boolean {
    return this.throttles.get(id)?.strategy === 'sliding';
  }

  isToken(id: string): boolean {
    return this.throttles.get(id)?.strategy === 'token';
  }

  getByStrategy(strategy: ThrottleStrategy): Throttle[] {
    return Array.from(this.throttles.values()).filter(t => t.strategy === strategy);
  }

  getActiveThrottles(): Throttle[] {
    return Array.from(this.throttles.values()).filter(t => t.active);
  }

  getInactiveThrottles(): Throttle[] {
    return Array.from(this.throttles.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.throttles.values()).map(t => t.name))];
  }

  getNewest(): Throttle | null {
    const all = Array.from(this.throttles.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Throttle | null {
    const all = Array.from(this.throttles.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.throttles.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.throttles.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalAllowed(): number {
    return this.totalAllowed;
  }

  getTotalBlocked(): number {
    return this.totalBlocked;
  }

  clearAll(): void {
    this.throttles.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalAllowed = 0;
    this.totalBlocked = 0;
  }
}

export default ThrottleEngine;