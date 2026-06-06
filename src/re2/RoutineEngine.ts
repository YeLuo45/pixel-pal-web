/**
 * Routine Engine
 * generic-agent-design Routine Engine - Define + Execute + Reset + Stats
 */

export interface Routine {
  id: string;
  name: string;
  steps: string[];
  currentStep: number;
  runs: number;
  completed: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface RE2Stats {
  routines: number;
  totalRuns: number;
  totalSteps: number;
  completed: number;
  inProgress: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgSteps: number;
  maxSteps: number;
  minSteps: number;
  avgRuns: number;
  completionRate: number;
}

export class RoutineEngine {
  private routines: Map<string, Routine> = new Map();
  private counter = 0;
  private totalRuns = 0;

  define(name: string, steps: string[]): string {
    const id = `re2-${++this.counter}`;
    this.routines.set(id, {
      id,
      name,
      steps: [...steps],
      currentStep: 0,
      runs: 0,
      completed: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [0],
    });
    return id;
  }

  execute(id: string): boolean {
    const r = this.routines.get(id);
    if (!r) return false;
    if (!r.active) return false;
    if (r.completed) return false;
    r.runs++;
    r.history.push(r.currentStep);
    if (r.currentStep >= r.steps.length - 1) {
      r.completed = true;
    } else {
      r.currentStep++;
    }
    r.updated = Date.now();
    r.hits++;
    this.totalRuns++;
    return true;
  }

  reset(id: string): boolean {
    const r = this.routines.get(id);
    if (!r) return false;
    r.currentStep = 0;
    r.runs = 0;
    r.completed = false;
    r.history = [0];
    r.updated = Date.now();
    return true;
  }

  getStats(): RE2Stats {
    const all = Array.from(this.routines.values());
    const stepCounts = all.map(r => r.steps.length);
    const runValues = all.map(r => r.runs);
    return {
      routines: all.length,
      totalRuns: this.totalRuns,
      totalSteps: stepCounts.reduce((s, v) => s + v, 0),
      completed: all.filter(r => r.completed).length,
      inProgress: all.filter(r => !r.completed).length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
      avgSteps: all.length > 0 ? Math.round((stepCounts.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSteps: stepCounts.length > 0 ? Math.max(...stepCounts) : 0,
      minSteps: stepCounts.length > 0 ? Math.min(...stepCounts) : 0,
      avgRuns: all.length > 0 ? Math.round((runValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      completionRate: all.length > 0 ? Math.round((all.filter(r => r.completed).length / all.length) * 100) / 100 : 0,
    };
  }

  getRoutine(id: string): Routine | undefined {
    return this.routines.get(id);
  }

  getAllRoutines(): Routine[] {
    return Array.from(this.routines.values());
  }

  removeRoutine(id: string): boolean {
    return this.routines.delete(id);
  }

  hasRoutine(id: string): boolean {
    return this.routines.has(id);
  }

  getCount(): number {
    return this.routines.size;
  }

  getName(id: string): string | undefined {
    return this.routines.get(id)?.name;
  }

  getSteps(id: string): string[] {
    return [...(this.routines.get(id)?.steps ?? [])];
  }

  getStepCount(id: string): number {
    return this.routines.get(id)?.steps.length ?? 0;
  }

  getCurrentStep(id: string): number {
    return this.routines.get(id)?.currentStep ?? 0;
  }

  getCurrentStepName(id: string): string {
    const r = this.routines.get(id);
    if (!r) return '';
    return r.steps[r.currentStep] ?? 'done';
  }

  getRuns(id: string): number {
    return this.routines.get(id)?.runs ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.routines.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.routines.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.routines.get(id)?.active ?? false;
  }

  isCompleted(id: string): boolean {
    return this.routines.get(id)?.completed ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.routines.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.routines.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setSteps(id: string, steps: string[]): boolean {
    const r = this.routines.get(id);
    if (!r) return false;
    r.steps = [...steps];
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.routines.values()) {
      r.currentStep = 0;
      r.runs = 0;
      r.completed = false;
      r.hits = 0;
      r.history = [0];
      r.active = true;
    }
    this.totalRuns = 0;
  }

  getByName(name: string): Routine[] {
    return Array.from(this.routines.values()).filter(r => r.name === name);
  }

  getCompletedRoutines(): Routine[] {
    return Array.from(this.routines.values()).filter(r => r.completed);
  }

  getInProgressRoutines(): Routine[] {
    return Array.from(this.routines.values()).filter(r => !r.completed);
  }

  getActiveRoutines(): Routine[] {
    return Array.from(this.routines.values()).filter(r => r.active);
  }

  getInactiveRoutines(): Routine[] {
    return Array.from(this.routines.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.routines.values()).map(r => r.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinSteps(min: number): Routine[] {
    return Array.from(this.routines.values()).filter(r => r.steps.length >= min);
  }

  getMostSteps(): Routine | null {
    const all = Array.from(this.routines.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.steps.length > max.steps.length ? r : max);
  }

  getMostRuns(): Routine | null {
    const all = Array.from(this.routines.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.runs > max.runs ? r : max);
  }

  getNewest(): Routine | null {
    const all = Array.from(this.routines.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Routine | null {
    const all = Array.from(this.routines.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.routines.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.routines.get(id)?.updated ?? 0;
  }

  getTotalRuns(): number {
    return this.totalRuns;
  }

  clearAll(): void {
    this.routines.clear();
    this.counter = 0;
    this.totalRuns = 0;
  }
}

export default RoutineEngine;