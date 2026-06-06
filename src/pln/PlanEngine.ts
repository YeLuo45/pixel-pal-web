/**
 * Plan Engine
 * generic-agent-design Plan Engine - Create + AddStep + Complete + Stats
 */

export type PlanStatus = 'pending' | 'active' | 'completed' | 'aborted';

export interface PlanStep {
  id: string;
  name: string;
  done: boolean;
  order: number;
}

export interface Plan {
  id: string;
  name: string;
  steps: PlanStep[];
  status: PlanStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PlnStats {
  plans: number;
  totalCompleted: number;
  totalAborted: number;
  totalSteps: number;
  completedSteps: number;
  pendingSteps: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgSteps: number;
  maxSteps: number;
  minSteps: number;
}

export class PlanEngine {
  private plans: Map<string, Plan> = new Map();
  private counter = 0;
  private totalCompleted = 0;
  private totalAborted = 0;

  create(name: string): string {
    const id = `pln-${++this.counter}`;
    this.plans.set(id, {
      id,
      name,
      steps: [],
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  addStep(id: string, name: string): string | null {
    const p = this.plans.get(id);
    if (!p) return null;
    if (!p.active) return null;
    const stepId = `${id}-step-${p.steps.length + 1}`;
    p.steps.push({
      id: stepId,
      name,
      done: false,
      order: p.steps.length + 1,
    });
    p.updated = Date.now();
    return stepId;
  }

  completeStep(planId: string, stepId: string): boolean {
    const p = this.plans.get(planId);
    if (!p) return false;
    if (!p.active) return false;
    const step = p.steps.find(s => s.id === stepId);
    if (!step) return false;
    if (step.done) return false;
    step.done = true;
    p.updated = Date.now();
    p.hits++;
    if (p.steps.every(s => s.done)) {
      p.status = 'completed';
      this.totalCompleted++;
    } else {
      p.status = 'active';
    }
    return true;
  }

  abort(id: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.status = 'aborted';
    p.updated = Date.now();
    p.hits++;
    this.totalAborted++;
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

  resetAll(): void {
    for (const p of this.plans.values()) {
      p.status = 'pending';
      p.active = true;
      p.hits = 0;
      for (const step of p.steps) {
        step.done = false;
      }
    }
    this.totalCompleted = 0;
    this.totalAborted = 0;
  }

  getStats(): PlnStats {
    const all = Array.from(this.plans.values());
    const stepsValues = all.map(p => p.steps.length);
    return {
      plans: all.length,
      totalCompleted: this.totalCompleted,
      totalAborted: this.totalAborted,
      totalSteps: all.reduce((s, p) => s + p.steps.length, 0),
      completedSteps: all.reduce((s, p) => s + p.steps.filter(x => x.done).length, 0),
      pendingSteps: all.reduce((s, p) => s + p.steps.filter(x => !x.done).length, 0),
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      avgSteps: all.length > 0 ? Math.round((stepsValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSteps: stepsValues.length > 0 ? Math.max(...stepsValues) : 0,
      minSteps: stepsValues.length > 0 ? Math.min(...stepsValues) : 0,
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

  getName(id: string): string | undefined {
    return this.plans.get(id)?.name;
  }

  getStatus(id: string): PlanStatus | undefined {
    return this.plans.get(id)?.status;
  }

  getSteps(id: string): PlanStep[] {
    return [...(this.plans.get(id)?.steps ?? [])];
  }

  getStepCount(id: string): number {
    return this.plans.get(id)?.steps.length ?? 0;
  }

  getCompletedStepCount(id: string): number {
    return this.plans.get(id)?.steps.filter(s => s.done).length ?? 0;
  }

  getHits(id: string): number {
    return this.plans.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.plans.get(id)?.active ?? false;
  }

  isCompleted(id: string): boolean {
    return this.plans.get(id)?.status === 'completed';
  }

  isAborted(id: string): boolean {
    return this.plans.get(id)?.status === 'aborted';
  }

  setName(id: string, name: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
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

  getCompletedPlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.status === 'completed');
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.plans.values()).map(p => p.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
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

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalAborted(): number {
    return this.totalAborted;
  }

  clearAll(): void {
    this.plans.clear();
    this.counter = 0;
    this.totalCompleted = 0;
    this.totalAborted = 0;
  }
}

export default PlanEngine;