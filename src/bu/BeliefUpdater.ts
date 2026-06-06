/**
 * Belief Updater
 * generic-agent-design Belief Updater - Define + Update + Merge + Stats
 */

export interface BeliefUpdate {
  id: string;
  name: string;
  value: number;
  updates: number;
  created: number;
  updated: number;
  history: number[];
  active: boolean;
  hits: number;
  merged: number;
}

export interface BUStats {
  beliefs: number;
  totalUpdates: number;
  avgValue: number;
  totalMerges: number;
  totalHits: number;
  active: number;
  inactive: number;
  avgUpdates: number;
}

export class BeliefUpdater {
  private beliefs: Map<string, BeliefUpdate> = new Map();
  private counter = 0;

  define(name: string, value: number): string {
    const id = `bu-${++this.counter}`;
    this.beliefs.set(id, {
      id,
      name,
      value,
      updates: 0,
      created: Date.now(),
      updated: Date.now(),
      history: [value],
      active: true,
      hits: 0,
      merged: 0,
    });
    return id;
  }

  update(id: string, value: number): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.value = value;
    b.updates++;
    b.history.push(value);
    b.updated = Date.now();
    return true;
  }

  merge(id1: string, id2: string): number {
    const b1 = this.beliefs.get(id1);
    const b2 = this.beliefs.get(id2);
    if (!b1 || !b2) return 0;
    const merged = (b1.value + b2.value) / 2;
    b1.value = merged;
    b2.value = merged;
    b1.updates++;
    b2.updates++;
    b1.history.push(merged);
    b2.history.push(merged);
    b1.merged++;
    b2.merged++;
    b1.updated = Date.now();
    b2.updated = Date.now();
    return merged;
  }

  getStats(): BUStats {
    const all = Array.from(this.beliefs.values());
    return {
      beliefs: all.length,
      totalUpdates: all.reduce((s, b) => s + b.updates, 0),
      avgValue: all.length > 0 ? Math.round((all.reduce((s, b) => s + b.value, 0) / all.length) * 100) / 100 : 0,
      totalMerges: all.reduce((s, b) => s + b.merged, 0),
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      avgUpdates: all.length > 0 ? Math.round((all.reduce((s, b) => s + b.updates, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getBelief(id: string): BeliefUpdate | undefined {
    return this.beliefs.get(id);
  }

  getAllBeliefs(): BeliefUpdate[] {
    return Array.from(this.beliefs.values());
  }

  removeBelief(id: string): boolean {
    return this.beliefs.delete(id);
  }

  hasBelief(id: string): boolean {
    return this.beliefs.has(id);
  }

  getCount(): number {
    return this.beliefs.size;
  }

  getName(id: string): string | undefined {
    return this.beliefs.get(id)?.name;
  }

  getValue(id: string): number {
    return this.beliefs.get(id)?.value ?? 0;
  }

  getUpdates(id: string): number {
    return this.beliefs.get(id)?.updates ?? 0;
  }

  getMerged(id: string): number {
    return this.beliefs.get(id)?.merged ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.beliefs.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.beliefs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.beliefs.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  setValue(id: string, value: number): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.value = value;
    b.history.push(value);
    b.updates++;
    b.updated = Date.now();
    return true;
  }

  touch(id: string): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.hits++;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.beliefs.values()) {
      b.updates = 0;
      b.merged = 0;
      b.hits = 0;
      b.history = [b.value];
      b.active = true;
    }
  }

  getByName(name: string): BeliefUpdate[] {
    return Array.from(this.beliefs.values()).filter(b => b.name === name);
  }

  getActiveBeliefs(): BeliefUpdate[] {
    return Array.from(this.beliefs.values()).filter(b => b.active);
  }

  getInactiveBeliefs(): BeliefUpdate[] {
    return Array.from(this.beliefs.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.beliefs.values()).map(b => b.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinUpdates(min: number): BeliefUpdate[] {
    return Array.from(this.beliefs.values()).filter(b => b.updates >= min);
  }

  getMostUpdates(): BeliefUpdate | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.updates > max.updates ? b : max);
  }

  getNewest(): BeliefUpdate | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): BeliefUpdate | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.beliefs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.beliefs.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.beliefs.clear();
    this.counter = 0;
  }
}

export default BeliefUpdater;