/**
 * Load Balancer
 * nanobot-design Load Balancer - Add + Distribute + Complete + Stats
 */

export type Strategy = 'round-robin' | 'random' | 'weight';

export interface Backend {
  id: string;
  name: string;
  weight: number;
  requests: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface LBStats {
  backends: number;
  totalRequests: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgRequests: number;
  avgWeight: number;
  maxWeight: number;
  minWeight: number;
  uniqueNames: number;
}

export class LoadBalancer {
  private backends: Map<string, Backend> = new Map();
  private counter = 0;
  private roundRobinIndex = 0;
  private totalRequests = 0;
  private strategy: Strategy = 'round-robin';

  constructor(strategy: Strategy = 'round-robin') {
    this.strategy = strategy;
  }

  add(name: string, weight: number = 1): string {
    const id = `lb-${++this.counter}`;
    this.backends.set(id, {
      id,
      name,
      weight,
      requests: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  distribute(): string {
    const active = Array.from(this.backends.values()).filter(b => b.active);
    if (active.length === 0) return '';

    let selected: Backend;
    if (this.strategy === 'round-robin') {
      selected = active[this.roundRobinIndex % active.length];
      this.roundRobinIndex++;
    } else if (this.strategy === 'random') {
      selected = active[Math.floor(Math.random() * active.length)];
    } else {
      // weight-based: weighted random selection
      const totalWeight = active.reduce((s, b) => s + b.weight, 0);
      let r = Math.random() * totalWeight;
      selected = active[0];
      for (const b of active) {
        if (r < b.weight) {
          selected = b;
          break;
        }
        r -= b.weight;
      }
    }

    selected.requests++;
    selected.hits++;
    selected.history.push(Date.now());
    selected.updated = Date.now();
    this.totalRequests++;
    return selected.id;
  }

  complete(id: string): boolean {
    const b = this.backends.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.updated = Date.now();
    return true;
  }

  getStats(): LBStats {
    const all = Array.from(this.backends.values());
    const weights = all.map(b => b.weight);
    return {
      backends: all.length,
      totalRequests: this.totalRequests,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      avgRequests: all.length > 0 ? Math.round((all.reduce((s, b) => s + b.requests, 0) / all.length) * 100) / 100 : 0,
      avgWeight: all.length > 0 ? Math.round((weights.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxWeight: weights.length > 0 ? Math.max(...weights) : 0,
      minWeight: weights.length > 0 ? Math.min(...weights) : 0,
      uniqueNames: new Set(all.map(b => b.name)).size,
    };
  }

  getBackend(id: string): Backend | undefined {
    return this.backends.get(id);
  }

  getAllBackends(): Backend[] {
    return Array.from(this.backends.values());
  }

  removeBackend(id: string): boolean {
    return this.backends.delete(id);
  }

  hasBackend(id: string): boolean {
    return this.backends.has(id);
  }

  getCount(): number {
    return this.backends.size;
  }

  getName(id: string): string | undefined {
    return this.backends.get(id)?.name;
  }

  getWeight(id: string): number {
    return this.backends.get(id)?.weight ?? 0;
  }

  getRequests(id: string): number {
    return this.backends.get(id)?.requests ?? 0;
  }

  getHits(id: string): number {
    return this.backends.get(id)?.hits ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.backends.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.backends.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.backends.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const b = this.backends.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  setWeight(id: string, weight: number): boolean {
    const b = this.backends.get(id);
    if (!b) return false;
    b.weight = weight;
    b.updated = Date.now();
    return true;
  }

  setStrategy(strategy: Strategy): void {
    this.strategy = strategy;
  }

  getStrategy(): Strategy {
    return this.strategy;
  }

  resetAll(): void {
    for (const b of this.backends.values()) {
      b.requests = 0;
      b.hits = 0;
      b.history = [];
      b.active = true;
    }
    this.totalRequests = 0;
    this.roundRobinIndex = 0;
  }

  getByName(name: string): Backend[] {
    return Array.from(this.backends.values()).filter(b => b.name === name);
  }

  getActiveBackends(): Backend[] {
    return Array.from(this.backends.values()).filter(b => b.active);
  }

  getInactiveBackends(): Backend[] {
    return Array.from(this.backends.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.backends.values()).map(b => b.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinWeight(min: number): Backend[] {
    return Array.from(this.backends.values()).filter(b => b.weight >= min);
  }

  getMostRequests(): Backend | null {
    const all = Array.from(this.backends.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.requests > max.requests ? b : max);
  }

  getNewest(): Backend | null {
    const all = Array.from(this.backends.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Backend | null {
    const all = Array.from(this.backends.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.backends.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.backends.get(id)?.updated ?? 0;
  }

  getTotalRequests(): number {
    return this.totalRequests;
  }

  clearAll(): void {
    this.backends.clear();
    this.counter = 0;
    this.roundRobinIndex = 0;
    this.totalRequests = 0;
  }
}

export default LoadBalancer;