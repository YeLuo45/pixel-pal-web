/**
 * Breaker Engine
 * thunderbolt-design Breaker Engine - Open + Trip + Reset + Stats
 */

export type BreakerState = 'closed' | 'open' | 'half-open';

export interface Breaker {
  id: string;
  name: string;
  state: BreakerState;
  failures: number;
  threshold: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Bre2Stats {
  breakers: number;
  totalOpened: number;
  totalTripped: number;
  totalReset: number;
  closed: number;
  open: number;
  halfOpen: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalFailures: number;
  avgFailures: number;
  maxFailures: number;
  minFailures: number;
}

export class BreakerEngine {
  private breakers: Map<string, Breaker> = new Map();
  private counter = 0;
  private totalOpened = 0;
  private totalTripped = 0;
  private totalReset = 0;
  private totalFailures = 0;

  open(name: string, threshold: number = 5): string {
    const id = `bre3-${++this.counter}`;
    this.breakers.set(id, {
      id,
      name,
      state: 'closed',
      failures: 0,
      threshold,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalOpened++;
    return id;
  }

  trip(id: string): boolean {
    const b = this.breakers.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.failures++;
    b.updated = Date.now();
    b.hits++;
    this.totalTripped++;
    this.totalFailures++;
    if (b.failures >= b.threshold) {
      b.state = 'open';
    } else if (b.failures > 0) {
      b.state = 'half-open';
    }
    return true;
  }

  reset(id: string): boolean {
    const b = this.breakers.get(id);
    if (!b) return false;
    b.failures = 0;
    b.state = 'closed';
    b.updated = Date.now();
    b.hits++;
    this.totalReset++;
    return true;
  }

  halfOpen(id: string): boolean {
    const b = this.breakers.get(id);
    if (!b) return false;
    b.state = 'half-open';
    b.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.breakers.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.breakers.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const b = this.breakers.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  setThreshold(id: string, threshold: number): boolean {
    const b = this.breakers.get(id);
    if (!b) return false;
    b.threshold = threshold;
    b.updated = Date.now();
    return true;
  }

  setFailures(id: string, failures: number): boolean {
    const b = this.breakers.get(id);
    if (!b) return false;
    b.failures = failures;
    if (failures >= b.threshold) b.state = 'open';
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.breakers.values()) {
      b.failures = 0;
      b.state = 'closed';
      b.active = true;
      b.hits = 0;
    }
    this.totalOpened = 0;
    this.totalTripped = 0;
    this.totalReset = 0;
    this.totalFailures = 0;
  }

  getStats(): Bre2Stats {
    const all = Array.from(this.breakers.values());
    const fArr = all.map(b => b.failures);
    return {
      breakers: all.length,
      totalOpened: this.totalOpened,
      totalTripped: this.totalTripped,
      totalReset: this.totalReset,
      closed: all.filter(b => b.state === 'closed').length,
      open: all.filter(b => b.state === 'open').length,
      halfOpen: all.filter(b => b.state === 'half-open').length,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueNames: new Set(all.map(b => b.name)).size,
      totalFailures: this.totalFailures,
      avgFailures: all.length > 0 ? Math.round((fArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxFailures: fArr.length > 0 ? Math.max(...fArr) : 0,
      minFailures: fArr.length > 0 ? Math.min(...fArr) : 0,
    };
  }

  getBreaker(id: string): Breaker | undefined {
    return this.breakers.get(id);
  }

  getAllBreakers(): Breaker[] {
    return Array.from(this.breakers.values());
  }

  hasBreaker(id: string): boolean {
    return this.breakers.has(id);
  }

  getCount(): number {
    return this.breakers.size;
  }

  getName(id: string): string | undefined {
    return this.breakers.get(id)?.name;
  }

  getState(id: string): BreakerState | undefined {
    return this.breakers.get(id)?.state;
  }

  getFailures(id: string): number {
    return this.breakers.get(id)?.failures ?? 0;
  }

  getThreshold(id: string): number {
    return this.breakers.get(id)?.threshold ?? 0;
  }

  getHits(id: string): number {
    return this.breakers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.breakers.get(id)?.active ?? false;
  }

  isClosed(id: string): boolean {
    return this.breakers.get(id)?.state === 'closed';
  }

  isOpen(id: string): boolean {
    return this.breakers.get(id)?.state === 'open';
  }

  isHalfOpen(id: string): boolean {
    return this.breakers.get(id)?.state === 'half-open';
  }

  getByState(state: BreakerState): Breaker[] {
    return Array.from(this.breakers.values()).filter(b => b.state === state);
  }

  getActiveBreakers(): Breaker[] {
    return Array.from(this.breakers.values()).filter(b => b.active);
  }

  getInactiveBreakers(): Breaker[] {
    return Array.from(this.breakers.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.breakers.values()).map(b => b.name))];
  }

  getNewest(): Breaker | null {
    const all = Array.from(this.breakers.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Breaker | null {
    const all = Array.from(this.breakers.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.breakers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.breakers.get(id)?.updated ?? 0;
  }

  getTotalOpened(): number {
    return this.totalOpened;
  }

  getTotalTripped(): number {
    return this.totalTripped;
  }

  getTotalReset(): number {
    return this.totalReset;
  }

  clearAll(): void {
    this.breakers.clear();
    this.counter = 0;
    this.totalOpened = 0;
    this.totalTripped = 0;
    this.totalReset = 0;
    this.totalFailures = 0;
  }
}

export default BreakerEngine;