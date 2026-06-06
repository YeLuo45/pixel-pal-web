/**
 * Throttle Manager
 * thunderbolt-design Throttle Manager - Create + Acquire + Release + Stats
 */

export interface Throttle {
  id: string;
  name: string;
  limit: number;
  acquired: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface ThmStats {
  throttles: number;
  totalAcquired: number;
  totalReleased: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgLimit: number;
  maxLimit: number;
  minLimit: number;
  avgAcquired: number;
  maxAcquired: number;
  minAcquired: number;
  totalAvailable: number;
  utilizationRate: number;
}

export class ThrottleManager {
  private throttles: Map<string, Throttle> = new Map();
  private counter = 0;
  private totalAcquired = 0;
  private totalReleased = 0;

  create(name: string, limit: number = 10): string {
    const id = `thm-${++this.counter}`;
    this.throttles.set(id, {
      id,
      name,
      limit,
      acquired: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  acquire(id: string): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    if (!t.active) return false;
    if (t.acquired >= t.limit) return false;
    t.acquired++;
    t.history.push(Date.now());
    t.updated = Date.now();
    t.hits++;
    this.totalAcquired++;
    return true;
  }

  release(id: string): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    if (t.acquired <= 0) return false;
    t.acquired--;
    t.updated = Date.now();
    t.hits++;
    this.totalReleased++;
    return true;
  }

  reset(id: string): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    t.acquired = 0;
    t.history = [];
    t.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.throttles.delete(id);
  }

  resetAll(): void {
    for (const t of this.throttles.values()) {
      t.acquired = 0;
      t.hits = 0;
      t.history = [];
      t.active = true;
    }
    this.totalAcquired = 0;
    this.totalReleased = 0;
  }

  getAvailable(id: string): number {
    const t = this.throttles.get(id);
    if (!t) return 0;
    return Math.max(0, t.limit - t.acquired);
  }

  getStats(): ThmStats {
    const all = Array.from(this.throttles.values());
    const limitValues = all.map(t => t.limit);
    const acquiredValues = all.map(t => t.acquired);
    const totalAvailable = all.reduce((s, t) => s + (t.limit - t.acquired), 0);
    return {
      throttles: all.length,
      totalAcquired: this.totalAcquired,
      totalReleased: this.totalReleased,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      avgLimit: all.length > 0 ? Math.round((limitValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLimit: limitValues.length > 0 ? Math.max(...limitValues) : 0,
      minLimit: limitValues.length > 0 ? Math.min(...limitValues) : 0,
      avgAcquired: all.length > 0 ? Math.round((acquiredValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxAcquired: acquiredValues.length > 0 ? Math.max(...acquiredValues) : 0,
      minAcquired: acquiredValues.length > 0 ? Math.min(...acquiredValues) : 0,
      totalAvailable,
      utilizationRate: all.length > 0 ? Math.round((acquiredValues.reduce((s, v) => s + v, 0) / limitValues.reduce((s, v) => s + v, 0)) * 100) / 100 : 0,
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

  getLimit(id: string): number {
    return this.throttles.get(id)?.limit ?? 0;
  }

  getAcquired(id: string): number {
    return this.throttles.get(id)?.acquired ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.throttles.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.throttles.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.throttles.get(id)?.active ?? false;
  }

  isAtLimit(id: string): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    return t.acquired >= t.limit;
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setLimit(id: string, limit: number): boolean {
    const t = this.throttles.get(id);
    if (!t) return false;
    t.limit = limit;
    t.updated = Date.now();
    return true;
  }

  getByName(name: string): Throttle[] {
    return Array.from(this.throttles.values()).filter(t => t.name === name);
  }

  getActiveThrottles(): Throttle[] {
    return Array.from(this.throttles.values()).filter(t => t.active);
  }

  getInactiveThrottles(): Throttle[] {
    return Array.from(this.throttles.values()).filter(t => !t.active);
  }

  getAtLimitThrottles(): Throttle[] {
    return Array.from(this.throttles.values()).filter(t => t.acquired >= t.limit);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.throttles.values()).map(t => t.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
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

  getTotalAcquired(): number {
    return this.totalAcquired;
  }

  getTotalReleased(): number {
    return this.totalReleased;
  }

  clearAll(): void {
    this.throttles.clear();
    this.counter = 0;
    this.totalAcquired = 0;
    this.totalReleased = 0;
  }
}

export default ThrottleManager;