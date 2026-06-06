/**
 * Refactor Engine
 * claude-code-design Refactor Engine - Define + Apply + Stats
 */

export interface Refactor {
  id: string;
  name: string;
  from: string;
  to: string;
  applications: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface RfeStats {
  refactors: number;
  totalApplications: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueFrom: number;
  uniqueTo: number;
  avgApplications: number;
  maxApplications: number;
  minApplications: number;
  avgFromLength: number;
  avgToLength: number;
}

export class RefactorEngine {
  private refactors: Map<string, Refactor> = new Map();
  private counter = 0;
  private totalApplications = 0;

  define(name: string, from: string, to: string = ''): string {
    const id = `rfe-${++this.counter}`;
    this.refactors.set(id, {
      id,
      name,
      from,
      to,
      applications: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  apply(id: string, code: string): string {
    const r = this.refactors.get(id);
    if (!r) return code;
    if (!r.active) return code;
    const newCode = code.split(r.from).join(r.to);
    r.applications++;
    r.history.push(Date.now());
    r.updated = Date.now();
    r.hits++;
    this.totalApplications++;
    return newCode;
  }

  reset(id: string): boolean {
    const r = this.refactors.get(id);
    if (!r) return false;
    r.applications = 0;
    r.history = [];
    r.updated = Date.now();
    return true;
  }

  getStats(): RfeStats {
    const all = Array.from(this.refactors.values());
    const appValues = all.map(r => r.applications);
    const fromLengths = all.map(r => r.from.length);
    const toLengths = all.map(r => r.to.length);
    return {
      refactors: all.length,
      totalApplications: this.totalApplications,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
      uniqueFrom: new Set(all.map(r => r.from)).size,
      uniqueTo: new Set(all.map(r => r.to)).size,
      avgApplications: all.length > 0 ? Math.round((appValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxApplications: appValues.length > 0 ? Math.max(...appValues) : 0,
      minApplications: appValues.length > 0 ? Math.min(...appValues) : 0,
      avgFromLength: all.length > 0 ? Math.round((fromLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgToLength: all.length > 0 ? Math.round((toLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getRefactor(id: string): Refactor | undefined {
    return this.refactors.get(id);
  }

  getAllRefactors(): Refactor[] {
    return Array.from(this.refactors.values());
  }

  removeRefactor(id: string): boolean {
    return this.refactors.delete(id);
  }

  hasRefactor(id: string): boolean {
    return this.refactors.has(id);
  }

  getCount(): number {
    return this.refactors.size;
  }

  getName(id: string): string | undefined {
    return this.refactors.get(id)?.name;
  }

  getFrom(id: string): string | undefined {
    return this.refactors.get(id)?.from;
  }

  getTo(id: string): string | undefined {
    return this.refactors.get(id)?.to;
  }

  getFromLength(id: string): number {
    return this.refactors.get(id)?.from.length ?? 0;
  }

  getToLength(id: string): number {
    return this.refactors.get(id)?.to.length ?? 0;
  }

  getApplications(id: string): number {
    return this.refactors.get(id)?.applications ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.refactors.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.refactors.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.refactors.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.refactors.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.refactors.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setFrom(id: string, from: string): boolean {
    const r = this.refactors.get(id);
    if (!r) return false;
    r.from = from;
    r.updated = Date.now();
    return true;
  }

  setTo(id: string, to: string): boolean {
    const r = this.refactors.get(id);
    if (!r) return false;
    r.to = to;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.refactors.values()) {
      r.applications = 0;
      r.hits = 0;
      r.history = [];
      r.active = true;
    }
    this.totalApplications = 0;
  }

  getByName(name: string): Refactor[] {
    return Array.from(this.refactors.values()).filter(r => r.name === name);
  }

  getActiveRefactors(): Refactor[] {
    return Array.from(this.refactors.values()).filter(r => r.active);
  }

  getInactiveRefactors(): Refactor[] {
    return Array.from(this.refactors.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.refactors.values()).map(r => r.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinApplications(min: number): Refactor[] {
    return Array.from(this.refactors.values()).filter(r => r.applications >= min);
  }

  getMostApplications(): Refactor | null {
    const all = Array.from(this.refactors.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.applications > max.applications ? r : max);
  }

  getNewest(): Refactor | null {
    const all = Array.from(this.refactors.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Refactor | null {
    const all = Array.from(this.refactors.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.refactors.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.refactors.get(id)?.updated ?? 0;
  }

  getTotalApplications(): number {
    return this.totalApplications;
  }

  clearAll(): void {
    this.refactors.clear();
    this.counter = 0;
    this.totalApplications = 0;
  }
}

export default RefactorEngine;