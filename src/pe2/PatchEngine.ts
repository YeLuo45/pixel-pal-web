/**
 * Patch Engine
 * claude-code-design Patch Engine - Create + Apply + Rollback + Stats
 */

export interface Patch {
  id: string;
  name: string;
  hunks: string[];
  applied: boolean;
  reversible: boolean;
  appliedAt: number | null;
  created: number;
  updated: number;
  active: boolean;
  history: number[];
  hits: number;
}

export interface PE2Stats {
  patches: number;
  applied: number;
  rolled: number;
  pending: number;
  active: number;
  inactive: number;
  reversible: number;
  nonReversible: number;
  totalHunks: number;
  totalHits: number;
  avgHunks: number;
  applyRate: number;
}

export class PatchEngine {
  private patches: Map<string, Patch> = new Map();
  private counter = 0;
  private totalApplied = 0;
  private totalRolled = 0;

  create(name: string, hunks: string[], reversible: boolean = true): string {
    const id = `pe2-${++this.counter}`;
    this.patches.set(id, {
      id,
      name,
      hunks,
      applied: false,
      reversible,
      appliedAt: null,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      history: [Date.now()],
      hits: 0,
    });
    return id;
  }

  apply(id: string): boolean {
    const p = this.patches.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.applied) return false;
    p.applied = true;
    p.appliedAt = Date.now();
    p.updated = Date.now();
    p.history.push(Date.now());
    p.hits++;
    this.totalApplied++;
    return true;
  }

  rollback(id: string): boolean {
    const p = this.patches.get(id);
    if (!p) return false;
    if (!p.reversible) return false;
    if (!p.applied) return false;
    p.applied = false;
    p.appliedAt = null;
    p.updated = Date.now();
    p.history.push(Date.now());
    p.hits++;
    this.totalRolled++;
    return true;
  }

  getStats(): PE2Stats {
    const all = Array.from(this.patches.values());
    return {
      patches: all.length,
      applied: all.filter(p => p.applied).length,
      rolled: this.totalRolled,
      pending: all.filter(p => !p.applied).length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      reversible: all.filter(p => p.reversible).length,
      nonReversible: all.filter(p => !p.reversible).length,
      totalHunks: all.reduce((s, p) => s + p.hunks.length, 0),
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      avgHunks: all.length > 0 ? Math.round((all.reduce((s, p) => s + p.hunks.length, 0) / all.length) * 100) / 100 : 0,
      applyRate: all.length > 0 ? Math.round((all.filter(p => p.applied).length / all.length) * 100) / 100 : 0,
    };
  }

  getPatch(id: string): Patch | undefined {
    return this.patches.get(id);
  }

  getAllPatches(): Patch[] {
    return Array.from(this.patches.values());
  }

  removePatch(id: string): boolean {
    return this.patches.delete(id);
  }

  hasPatch(id: string): boolean {
    return this.patches.has(id);
  }

  getCount(): number {
    return this.patches.size;
  }

  getName(id: string): string | undefined {
    return this.patches.get(id)?.name;
  }

  getHunks(id: string): string[] {
    return [...(this.patches.get(id)?.hunks ?? [])];
  }

  getHunkCount(id: string): number {
    return this.patches.get(id)?.hunks.length ?? 0;
  }

  getHits(id: string): number {
    return this.patches.get(id)?.hits ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.patches.get(id)?.history ?? [])];
  }

  getAppliedAt(id: string): number | null {
    return this.patches.get(id)?.appliedAt ?? null;
  }

  isApplied(id: string): boolean {
    return this.patches.get(id)?.applied ?? false;
  }

  isReversible(id: string): boolean {
    return this.patches.get(id)?.reversible ?? false;
  }

  isActive(id: string): boolean {
    return this.patches.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return !this.isApplied(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.patches.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.patches.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setHunks(id: string, hunks: string[]): boolean {
    const p = this.patches.get(id);
    if (!p) return false;
    p.hunks = hunks;
    p.updated = Date.now();
    return true;
  }

  setReversible(id: string, reversible: boolean): boolean {
    const p = this.patches.get(id);
    if (!p) return false;
    p.reversible = reversible;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.patches.values()) {
      p.applied = false;
      p.appliedAt = null;
      p.hits = 0;
      p.history = [p.created];
      p.active = true;
    }
    this.totalApplied = 0;
    this.totalRolled = 0;
  }

  getByName(name: string): Patch[] {
    return Array.from(this.patches.values()).filter(p => p.name === name);
  }

  getAppliedPatches(): Patch[] {
    return Array.from(this.patches.values()).filter(p => p.applied);
  }

  getPendingPatches(): Patch[] {
    return Array.from(this.patches.values()).filter(p => !p.applied);
  }

  getActivePatches(): Patch[] {
    return Array.from(this.patches.values()).filter(p => p.active);
  }

  getInactivePatches(): Patch[] {
    return Array.from(this.patches.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.patches.values()).map(p => p.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinHunks(min: number): Patch[] {
    return Array.from(this.patches.values()).filter(p => p.hunks.length >= min);
  }

  getMostHunks(): Patch | null {
    const all = Array.from(this.patches.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.hunks.length > max.hunks.length ? p : max);
  }

  getNewest(): Patch | null {
    const all = Array.from(this.patches.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Patch | null {
    const all = Array.from(this.patches.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.patches.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.patches.get(id)?.updated ?? 0;
  }

  getTotalApplied(): number {
    return this.totalApplied;
  }

  getTotalRolled(): number {
    return this.totalRolled;
  }

  clearAll(): void {
    this.patches.clear();
    this.counter = 0;
    this.totalApplied = 0;
    this.totalRolled = 0;
  }
}

export default PatchEngine;