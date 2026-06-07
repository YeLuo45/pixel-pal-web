/**
 * Path Engine
 * generic-agent-design Path Engine - Add + Step + Complete + Stats
 */

export type PathStatus = 'open' | 'in-progress' | 'completed' | 'blocked';

export interface PathStep {
  id: string;
  name: string;
  index: number;
  status: PathStatus;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface PteStats {
  steps: number;
  totalAdded: number;
  totalStepped: number;
  totalCompleted: number;
  open: number;
  inProgress: number;
  completed: number;
  blocked: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgIndex: number;
  maxIndex: number;
  minIndex: number;
}

export class PathEngine {
  private steps: Map<string, PathStep> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalStepped = 0;
  private totalCompleted = 0;
  private totalIndex = 0;

  add(name: string, index: number): string {
    const id = `pte-${++this.counter}`;
    this.steps.set(id, {
      id,
      name,
      index,
      status: 'open',
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalIndex += index;
    return id;
  }

  step(id: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.status = 'in-progress';
    s.updated = Date.now();
    s.hits++;
    this.totalStepped++;
    return true;
  }

  complete(id: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.status = 'completed';
    s.updated = Date.now();
    s.hits++;
    this.totalCompleted++;
    return true;
  }

  block(id: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.status = 'blocked';
    s.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.steps.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setIndex(id: string, index: number): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.index = index;
    s.updated = Date.now();
    return true;
  }

  setStatus(id: string, status: PathStatus): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.status = status;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.steps.values()) {
      s.status = 'open';
      s.active = true;
      s.hits = 0;
    }
    this.totalAdded = 0;
    this.totalStepped = 0;
    this.totalCompleted = 0;
    this.totalIndex = 0;
  }

  getStats(): PteStats {
    const all = Array.from(this.steps.values());
    const iArr = all.map(s => s.index);
    return {
      steps: all.length,
      totalAdded: this.totalAdded,
      totalStepped: this.totalStepped,
      totalCompleted: this.totalCompleted,
      open: all.filter(s => s.status === 'open').length,
      inProgress: all.filter(s => s.status === 'in-progress').length,
      completed: all.filter(s => s.status === 'completed').length,
      blocked: all.filter(s => s.status === 'blocked').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      avgIndex: all.length > 0 ? Math.round((iArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxIndex: iArr.length > 0 ? Math.max(...iArr) : 0,
      minIndex: iArr.length > 0 ? Math.min(...iArr) : 0,
    };
  }

  getStep(id: string): PathStep | undefined {
    return this.steps.get(id);
  }

  getAllSteps(): PathStep[] {
    return Array.from(this.steps.values());
  }

  hasStep(id: string): boolean {
    return this.steps.has(id);
  }

  getCount(): number {
    return this.steps.size;
  }

  getName(id: string): string | undefined {
    return this.steps.get(id)?.name;
  }

  getIndex(id: string): number {
    return this.steps.get(id)?.index ?? 0;
  }

  getStatus(id: string): PathStatus | undefined {
    return this.steps.get(id)?.status;
  }

  getHits(id: string): number {
    return this.steps.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.steps.get(id)?.active ?? false;
  }

  isOpen(id: string): boolean {
    return this.steps.get(id)?.status === 'open';
  }

  isInProgress(id: string): boolean {
    return this.steps.get(id)?.status === 'in-progress';
  }

  isCompleted(id: string): boolean {
    return this.steps.get(id)?.status === 'completed';
  }

  isBlocked(id: string): boolean {
    return this.steps.get(id)?.status === 'blocked';
  }

  getByStatus(status: PathStatus): PathStep[] {
    return Array.from(this.steps.values()).filter(s => s.status === status);
  }

  getActiveSteps(): PathStep[] {
    return Array.from(this.steps.values()).filter(s => s.active);
  }

  getInactiveSteps(): PathStep[] {
    return Array.from(this.steps.values()).filter(s => !s.active);
  }

  getOrderedSteps(): PathStep[] {
    return Array.from(this.steps.values()).sort((a, b) => a.index - b.index);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.steps.values()).map(s => s.name))];
  }

  getNewest(): PathStep | null {
    const all = Array.from(this.steps.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): PathStep | null {
    const all = Array.from(this.steps.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.steps.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.steps.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalStepped(): number {
    return this.totalStepped;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  clearAll(): void {
    this.steps.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalStepped = 0;
    this.totalCompleted = 0;
    this.totalIndex = 0;
  }
}

export default PathEngine;