/**
 * Planner Engine
 * generic-agent-design Planner Engine - AddGoal + AddPlan + AddStep + Stats
 */

export type PlanStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface Plan {
  id: string;
  goal: string;
  steps: number;
  current: number;
  status: PlanStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Ple2Stats {
  plans: number;
  totalAdded: number;
  totalCompleted: number;
  totalFailed: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueGoals: number;
  totalSteps: number;
  totalCurrent: number;
  avgSteps: number;
  maxSteps: number;
  minSteps: number;
}

export class PlannerEngine {
  private plans: Map<string, Plan> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalCompleted = 0;
  private totalFailed = 0;
  private totalSteps = 0;
  private totalCurrent = 0;

  addPlan(goal: string, steps: number): string {
    const id = `ple2-${++this.counter}`;
    this.plans.set(id, {
      id,
      goal,
      steps,
      current: 0,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalSteps += steps;
    return id;
  }

  start(id: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.status = 'in-progress';
    p.updated = Date.now();
    p.hits++;
    return true;
  }

  step(id: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.status !== 'in-progress') return false;
    if (p.current >= p.steps) return false;
    p.current++;
    p.updated = Date.now();
    p.hits++;
    this.totalCurrent++;
    if (p.current >= p.steps) {
      p.status = 'completed';
      this.totalCompleted++;
    }
    return true;
  }

  fail(id: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.status = 'failed';
    p.updated = Date.now();
    p.hits++;
    this.totalFailed++;
    return true;
  }

  remove(id: string): boolean {
    return this.plans.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setGoal(id: string, goal: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.goal = goal;
    p.updated = Date.now();
    return true;
  }

  setSteps(id: string, steps: number): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.steps = steps;
    p.updated = Date.now();
    return true;
  }

  setCurrent(id: string, current: number): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.current = current;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.plans.values()) {
      p.current = 0;
      p.status = 'pending';
      p.active = true;
      p.hits = 0;
    }
    this.totalAdded = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
    this.totalSteps = 0;
    this.totalCurrent = 0;
  }

  getStats(): Ple2Stats {
    const all = Array.from(this.plans.values());
    const sArr = all.map(p => p.steps);
    return {
      plans: all.length,
      totalAdded: this.totalAdded,
      totalCompleted: this.totalCompleted,
      totalFailed: this.totalFailed,
      pending: all.filter(p => p.status === 'pending').length,
      inProgress: all.filter(p => p.status === 'in-progress').length,
      completed: all.filter(p => p.status === 'completed').length,
      failed: all.filter(p => p.status === 'failed').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueGoals: new Set(all.map(p => p.goal)).size,
      totalSteps: this.totalSteps,
      totalCurrent: this.totalCurrent,
      avgSteps: all.length > 0 ? Math.round((sArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSteps: sArr.length > 0 ? Math.max(...sArr) : 0,
      minSteps: sArr.length > 0 ? Math.min(...sArr) : 0,
    };
  }

  getPlan(id: string): Plan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  hasPlan(id: string): boolean {
    return this.plans.has(id);
  }

  getCount(): number {
    return this.plans.size;
  }

  getGoal(id: string): string | undefined {
    return this.plans.get(id)?.goal;
  }

  getSteps(id: string): number {
    return this.plans.get(id)?.steps ?? 0;
  }

  getCurrent(id: string): number {
    return this.plans.get(id)?.current ?? 0;
  }

  getStatus(id: string): PlanStatus | undefined {
    return this.plans.get(id)?.status;
  }

  getHits(id: string): number {
    return this.plans.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.plans.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.plans.get(id)?.status === 'pending';
  }

  isInProgress(id: string): boolean {
    return this.plans.get(id)?.status === 'in-progress';
  }

  isCompleted(id: string): boolean {
    return this.plans.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.plans.get(id)?.status === 'failed';
  }

  getByStatus(status: PlanStatus): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.status === status);
  }

  getActivePlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.active);
  }

  getInactivePlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => !p.active);
  }

  getAllGoals(): string[] {
    return [...new Set(Array.from(this.plans.values()).map(p => p.goal))];
  }

  getNewest(): Plan | null {
    const all = Array.from(this.plans.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Plan | null {
    const all = Array.from(this.plans.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.plans.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.plans.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.plans.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
    this.totalSteps = 0;
    this.totalCurrent = 0;
  }
}

export default PlannerEngine;