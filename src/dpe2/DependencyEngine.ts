/**
 * Dependency Engine
 * thunderbolt-design Dependency Engine - Add + DependsOn + Resolve + Stats
 */

export type DepStatus = 'pending' | 'satisfied' | 'missing';

export interface Dependency {
  id: string;
  from: string;
  to: string;
  status: DepStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface DpeStats {
  dependencies: number;
  totalAdded: number;
  totalSatisfied: number;
  totalMissing: number;
  pending: number;
  satisfied: number;
  missing: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueFroms: number;
  uniqueTos: number;
}

export class DependencyEngine {
  private dependencies: Map<string, Dependency> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalSatisfied = 0;
  private totalMissing = 0;

  add(from: string, to: string): string {
    const id = `dpe-${++this.counter}`;
    this.dependencies.set(id, {
      id,
      from,
      to,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  satisfies(id: string, satisfiedSet: Set<string>): boolean {
    const d = this.dependencies.get(id);
    if (!d) return false;
    if (d.status === 'satisfied') return false;
    d.status = satisfiedSet.has(d.to) ? 'satisfied' : 'missing';
    d.updated = Date.now();
    d.hits++;
    if (d.status === 'satisfied') this.totalSatisfied++;
    else this.totalMissing++;
    return true;
  }

  dependsOn(from: string, to: string): boolean {
    for (const d of this.dependencies.values()) {
      if (d.from === from && d.to === to && d.status === 'satisfied' && d.active) {
        return true;
      }
    }
    return false;
  }

  remove(id: string): boolean {
    return this.dependencies.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.dependencies.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  setFrom(id: string, from: string): boolean {
    const d = this.dependencies.get(id);
    if (!d) return false;
    d.from = from;
    d.updated = Date.now();
    return true;
  }

  setTo(id: string, to: string): boolean {
    const d = this.dependencies.get(id);
    if (!d) return false;
    d.to = to;
    d.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const d of this.dependencies.values()) {
      d.status = 'pending';
      d.active = true;
      d.hits = 0;
    }
    this.totalAdded = 0;
    this.totalSatisfied = 0;
    this.totalMissing = 0;
  }

  getStats(): DpeStats {
    const all = Array.from(this.dependencies.values());
    return {
      dependencies: all.length,
      totalAdded: this.totalAdded,
      totalSatisfied: this.totalSatisfied,
      totalMissing: this.totalMissing,
      pending: all.filter(d => d.status === 'pending').length,
      satisfied: all.filter(d => d.status === 'satisfied').length,
      missing: all.filter(d => d.status === 'missing').length,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      totalHits: all.reduce((s, d) => s + d.hits, 0),
      uniqueFroms: new Set(all.map(d => d.from)).size,
      uniqueTos: new Set(all.map(d => d.to)).size,
    };
  }

  getDependency(id: string): Dependency | undefined {
    return this.dependencies.get(id);
  }

  getAllDependencies(): Dependency[] {
    return Array.from(this.dependencies.values());
  }

  hasDependency(id: string): boolean {
    return this.dependencies.has(id);
  }

  getCount(): number {
    return this.dependencies.size;
  }

  getFrom(id: string): string | undefined {
    return this.dependencies.get(id)?.from;
  }

  getTo(id: string): string | undefined {
    return this.dependencies.get(id)?.to;
  }

  getStatus(id: string): DepStatus | undefined {
    return this.dependencies.get(id)?.status;
  }

  getHits(id: string): number {
    return this.dependencies.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.dependencies.get(id)?.active ?? false;
  }

  isSatisfied(id: string): boolean {
    return this.dependencies.get(id)?.status === 'satisfied';
  }

  isMissing(id: string): boolean {
    return this.dependencies.get(id)?.status === 'missing';
  }

  isPending(id: string): boolean {
    return this.dependencies.get(id)?.status === 'pending';
  }

  getByStatus(status: DepStatus): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => d.status === status);
  }

  getByFrom(from: string): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => d.from === from);
  }

  getByTo(to: string): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => d.to === to);
  }

  getActiveDependencies(): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => d.active);
  }

  getInactiveDependencies(): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => !d.active);
  }

  getAllFroms(): string[] {
    return [...new Set(Array.from(this.dependencies.values()).map(d => d.from))];
  }

  getAllTos(): string[] {
    return [...new Set(Array.from(this.dependencies.values()).map(d => d.to))];
  }

  getNewest(): Dependency | null {
    const all = Array.from(this.dependencies.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): Dependency | null {
    const all = Array.from(this.dependencies.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.dependencies.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.dependencies.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalSatisfied(): number {
    return this.totalSatisfied;
  }

  getTotalMissing(): number {
    return this.totalMissing;
  }

  clearAll(): void {
    this.dependencies.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalSatisfied = 0;
    this.totalMissing = 0;
  }
}

export default DependencyEngine;