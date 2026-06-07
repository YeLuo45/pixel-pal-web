/**
 * Backoff Engine
 * thunderbolt-design Backoff Engine - Schedule + Retry + Reset + Stats
 */

export type BackoffStrategy = 'fixed' | 'linear' | 'exponential';

export interface Backoff {
  id: string;
  strategy: BackoffStrategy;
  baseMs: number;
  maxMs: number;
  attempts: number;
  nextDelay: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface BoeStats {
  backoffs: number;
  totalRetries: number;
  totalResets: number;
  active: number;
  inactive: number;
  totalHits: number;
  fixed: number;
  linear: number;
  exponential: number;
  totalAttempts: number;
  avgNextDelay: number;
  maxNextDelay: number;
  minNextDelay: number;
}

function calcDelay(strategy: BackoffStrategy, baseMs: number, maxMs: number, attempts: number): number {
  let delay = 0;
  if (strategy === 'fixed') delay = baseMs;
  else if (strategy === 'linear') delay = baseMs * (attempts + 1);
  else if (strategy === 'exponential') delay = baseMs * Math.pow(2, attempts);
  return Math.min(delay, maxMs);
}

export class BackoffEngine {
  private backoffs: Map<string, Backoff> = new Map();
  private counter = 0;
  private totalRetries = 0;
  private totalResets = 0;

  schedule(strategy: BackoffStrategy, baseMs: number = 100, maxMs: number = 30000): string {
    const id = `boe-${++this.counter}`;
    this.backoffs.set(id, {
      id,
      strategy,
      baseMs,
      maxMs,
      attempts: 0,
      nextDelay: baseMs,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  retry(id: string): number {
    const b = this.backoffs.get(id);
    if (!b) return -1;
    if (!b.active) return -1;
    b.nextDelay = calcDelay(b.strategy, b.baseMs, b.maxMs, b.attempts);
    b.attempts++;
    b.updated = Date.now();
    b.hits++;
    this.totalRetries++;
    return b.nextDelay;
  }

  reset(id: string): boolean {
    const b = this.backoffs.get(id);
    if (!b) return false;
    b.attempts = 0;
    b.nextDelay = b.baseMs;
    b.updated = Date.now();
    b.hits++;
    this.totalResets++;
    return true;
  }

  remove(id: string): boolean {
    return this.backoffs.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.backoffs.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.backoffs.values()) {
      b.attempts = 0;
      b.nextDelay = b.baseMs;
      b.active = true;
      b.hits = 0;
    }
    this.totalRetries = 0;
    this.totalResets = 0;
  }

  getStats(): BoeStats {
    const all = Array.from(this.backoffs.values());
    const delays = all.map(b => b.nextDelay);
    return {
      backoffs: all.length,
      totalRetries: this.totalRetries,
      totalResets: this.totalResets,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      fixed: all.filter(b => b.strategy === 'fixed').length,
      linear: all.filter(b => b.strategy === 'linear').length,
      exponential: all.filter(b => b.strategy === 'exponential').length,
      totalAttempts: all.reduce((s, b) => s + b.attempts, 0),
      avgNextDelay: all.length > 0 ? Math.round((delays.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxNextDelay: delays.length > 0 ? Math.max(...delays) : 0,
      minNextDelay: delays.length > 0 ? Math.min(...delays) : 0,
    };
  }

  getBackoff(id: string): Backoff | undefined {
    return this.backoffs.get(id);
  }

  getAllBackoffs(): Backoff[] {
    return Array.from(this.backoffs.values());
  }

  hasBackoff(id: string): boolean {
    return this.backoffs.has(id);
  }

  getCount(): number {
    return this.backoffs.size;
  }

  getStrategy(id: string): BackoffStrategy | undefined {
    return this.backoffs.get(id)?.strategy;
  }

  getBaseMs(id: string): number {
    return this.backoffs.get(id)?.baseMs ?? 0;
  }

  getMaxMs(id: string): number {
    return this.backoffs.get(id)?.maxMs ?? 0;
  }

  getAttempts(id: string): number {
    return this.backoffs.get(id)?.attempts ?? 0;
  }

  getNextDelay(id: string): number {
    return this.backoffs.get(id)?.nextDelay ?? 0;
  }

  getHits(id: string): number {
    return this.backoffs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.backoffs.get(id)?.active ?? false;
  }

  getByStrategy(strategy: BackoffStrategy): Backoff[] {
    return Array.from(this.backoffs.values()).filter(b => b.strategy === strategy);
  }

  getActiveBackoffs(): Backoff[] {
    return Array.from(this.backoffs.values()).filter(b => b.active);
  }

  getInactiveBackoffs(): Backoff[] {
    return Array.from(this.backoffs.values()).filter(b => !b.active);
  }

  getNewest(): Backoff | null {
    const all = Array.from(this.backoffs.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Backoff | null {
    const all = Array.from(this.backoffs.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.backoffs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.backoffs.get(id)?.updated ?? 0;
  }

  getTotalRetries(): number {
    return this.totalRetries;
  }

  getTotalResets(): number {
    return this.totalResets;
  }

  clearAll(): void {
    this.backoffs.clear();
    this.counter = 0;
    this.totalRetries = 0;
    this.totalResets = 0;
  }
}

export default BackoffEngine;