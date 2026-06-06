/**
 * Circuit Engine
 * thunderbolt-design Circuit Engine - Create + Open + Close + HalfOpen + Stats
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface Circuit {
  id: string;
  name: string;
  state: CircuitState;
  failures: number;
  threshold: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CieStats {
  circuits: number;
  closed: number;
  open: number;
  halfOpen: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalFailures: number;
  totalOpens: number;
  totalCloses: number;
  uniqueNames: number;
  avgFailures: number;
  maxFailures: number;
  minFailures: number;
  avgThreshold: number;
}

export class CircuitEngine {
  private circuits: Map<string, Circuit> = new Map();
  private counter = 0;
  private totalFailures = 0;
  private totalOpens = 0;
  private totalCloses = 0;

  create(name: string, threshold: number = 5): string {
    const id = `cie-${++this.counter}`;
    this.circuits.set(id, {
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
    return id;
  }

  recordFailure(id: string): boolean {
    const c = this.circuits.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.failures++;
    c.updated = Date.now();
    c.hits++;
    this.totalFailures++;
    if (c.failures >= c.threshold && c.state !== 'open') {
      c.state = 'open';
      this.totalOpens++;
    }
    return true;
  }

  open(id: string): boolean {
    const c = this.circuits.get(id);
    if (!c) return false;
    c.state = 'open';
    c.updated = Date.now();
    c.hits++;
    this.totalOpens++;
    return true;
  }

  close(id: string): boolean {
    const c = this.circuits.get(id);
    if (!c) return false;
    c.state = 'closed';
    c.failures = 0;
    c.updated = Date.now();
    c.hits++;
    this.totalCloses++;
    return true;
  }

  halfOpen(id: string): boolean {
    const c = this.circuits.get(id);
    if (!c) return false;
    c.state = 'half-open';
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  reset(id: string): boolean {
    const c = this.circuits.get(id);
    if (!c) return false;
    c.state = 'closed';
    c.failures = 0;
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  isOpen(id: string): boolean {
    return this.circuits.get(id)?.state === 'open';
  }

  isClosed(id: string): boolean {
    return this.circuits.get(id)?.state === 'closed';
  }

  isHalfOpen(id: string): boolean {
    return this.circuits.get(id)?.state === 'half-open';
  }

  canPass(id: string): boolean {
    const c = this.circuits.get(id);
    if (!c) return false;
    if (!c.active) return false;
    return c.state !== 'open';
  }

  remove(id: string): boolean {
    return this.circuits.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.circuits.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setThreshold(id: string, threshold: number): boolean {
    const c = this.circuits.get(id);
    if (!c) return false;
    c.threshold = threshold;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.circuits.values()) {
      c.state = 'closed';
      c.failures = 0;
      c.active = true;
      c.hits = 0;
    }
    this.totalFailures = 0;
    this.totalOpens = 0;
    this.totalCloses = 0;
  }

  getStats(): CieStats {
    const all = Array.from(this.circuits.values());
    const failureValues = all.map(c => c.failures);
    const thresholdValues = all.map(c => c.threshold);
    return {
      circuits: all.length,
      closed: all.filter(c => c.state === 'closed').length,
      open: all.filter(c => c.state === 'open').length,
      halfOpen: all.filter(c => c.state === 'half-open').length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      totalFailures: this.totalFailures,
      totalOpens: this.totalOpens,
      totalCloses: this.totalCloses,
      uniqueNames: new Set(all.map(c => c.name)).size,
      avgFailures: all.length > 0 ? Math.round((failureValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxFailures: failureValues.length > 0 ? Math.max(...failureValues) : 0,
      minFailures: failureValues.length > 0 ? Math.min(...failureValues) : 0,
      avgThreshold: all.length > 0 ? Math.round((thresholdValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getCircuit(id: string): Circuit | undefined {
    return this.circuits.get(id);
  }

  getAllCircuits(): Circuit[] {
    return Array.from(this.circuits.values());
  }

  hasCircuit(id: string): boolean {
    return this.circuits.has(id);
  }

  getCount(): number {
    return this.circuits.size;
  }

  getName(id: string): string | undefined {
    return this.circuits.get(id)?.name;
  }

  getState(id: string): CircuitState | undefined {
    return this.circuits.get(id)?.state;
  }

  getFailures(id: string): number {
    return this.circuits.get(id)?.failures ?? 0;
  }

  getThreshold(id: string): number {
    return this.circuits.get(id)?.threshold ?? 0;
  }

  getHits(id: string): number {
    return this.circuits.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.circuits.get(id)?.active ?? false;
  }

  getByState(state: CircuitState): Circuit[] {
    return Array.from(this.circuits.values()).filter(c => c.state === state);
  }

  getActiveCircuits(): Circuit[] {
    return Array.from(this.circuits.values()).filter(c => c.active);
  }

  getInactiveCircuits(): Circuit[] {
    return Array.from(this.circuits.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.circuits.values()).map(c => c.name))];
  }

  getNewest(): Circuit | null {
    const all = Array.from(this.circuits.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Circuit | null {
    const all = Array.from(this.circuits.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.circuits.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.circuits.get(id)?.updated ?? 0;
  }

  getTotalFailures(): number {
    return this.totalFailures;
  }

  getTotalOpens(): number {
    return this.totalOpens;
  }

  getTotalCloses(): number {
    return this.totalCloses;
  }

  clearAll(): void {
    this.circuits.clear();
    this.counter = 0;
    this.totalFailures = 0;
    this.totalOpens = 0;
    this.totalCloses = 0;
  }
}

export default CircuitEngine;