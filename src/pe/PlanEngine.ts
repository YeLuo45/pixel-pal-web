/**
 * Plan Engine
 * generic-agent-design Plan Engine - Create + AddStep + ExecuteNext + Stats
 */

export interface Plan {
  id: string;
  name: string;
  steps: string[];
  currentStep: number;
  executed: number;
  completed: boolean;
  created: number;
  updated: number;
  active: boolean;
  history: string[];
}

export interface PEStats {
  plans: number;
  totalSteps: number;
  totalExecuted: number;
  completed: number;
  pending: number;
  active: number;
  inactive: number;
  avgSteps: number;
  avgExecuted: number;
  completionRate: number;
}

export class PlanEngine {
  private plans: Map<string, Plan> = new Map();
  private counter = 0;
  private totalExecuted = 0;

  create(name: string): string {
    const id = `pe-${++this.counter}`;
    this.plans.set(id, {
      id,
      name,
      steps: [],
      currentStep: 0,
      executed: 0,
      completed: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      history: [],
    });
    return id;
  }

  addStep(id: string, step: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.completed) return false;
    p.steps.push(step);
    p.history.push(step);
    p.updated = Date.now();
    return true;
  }

  executeNext(id: string): string | null {
    const p = this.plans.get(id);
    if (!p) return null;
    if (!p.active) return null;
    if (p.completed) return null;
    if (p.currentStep >= p.steps.length) {
      p.completed = true;
      p.updated = Date.now();
      return null;
    }
    const step = p.steps[p.currentStep];
    p.currentStep++;
    p.executed++;
    p.updated = Date.now();
    this.totalExecuted++;
    if (p.currentStep >= p.steps.length) {
      p.completed = true;
    }
    return step;
  }

  executeAll(id: string): number {
    const p = this.plans.get(id);
    if (!p) return 0;
    let count = 0;
    while (this.executeNext(id) !== null) {
      count++;
    }
    return count;
  }

  reset(id: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.currentStep = 0;
    p.executed = 0;
    p.completed = false;
    p.history = [];
    p.updated = Date.now();
    return true;
  }

  getStats(): PEStats {
    const all = Array.from(this.plans.values());
    return {
      plans: all.length,
      totalSteps: all.reduce((s, p) => s + p.steps.length, 0),
      totalExecuted: this.totalExecuted,
      completed: all.filter(p => p.completed).length,
      pending: all.filter(p => !p.completed).length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      avgSteps: all.length > 0 ? Math.round((all.reduce((s, p) => s + p.steps.length, 0) / all.length) * 100) / 100 : 0,
      avgExecuted: all.length > 0 ? Math.round((all.reduce((s, p) => s + p.executed, 0) / all.length) * 100) / 100 : 0,
      completionRate: all.length > 0 ? Math.round((all.filter(p => p.completed).length / all.length) * 100) / 100 : 0,
    };
  }

  getPlan(id: string): Plan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  removePlan(id: string): boolean {
    return this.plans.delete(id);
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

  getSteps(id: string): string[] {
    return [...(this.plans.get(id)?.steps ?? [])];
  }

  getStepCount(id: string): number {
    return this.plans.get(id)?.steps.length ?? 0;
  }

  getCurrentStep(id: string): number {
    return this.plans.get(id)?.currentStep ?? 0;
  }

  getExecuted(id: string): number {
    return this.plans.get(id)?.executed ?? 0;
  }

  getHistory(id: string): string[] {
    return [...(this.plans.get(id)?.history ?? [])];
  }

  isCompleted(id: string): boolean {
    return this.plans.get(id)?.completed ?? false;
  }

  isActive(id: string): boolean {
    return this.plans.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  removeStep(id: string, index: number): boolean {
    const p = this.plans.get(id);
    if (!p) return false;
    if (index < 0 || index >= p.steps.length) return false;
    p.steps.splice(index, 1);
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.plans.values()) {
      p.currentStep = 0;
      p.executed = 0;
      p.completed = false;
      p.history = [];
      p.active = true;
    }
    this.totalExecuted = 0;
  }

  getByName(name: string): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.name === name);
  }

  getCompletedPlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.completed);
  }

  getPendingPlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => !p.completed);
  }

  getActivePlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.active);
  }

  getInactivePlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.plans.values()).map(p => p.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinSteps(min: number): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.steps.length >= min);
  }

  getMostSteps(): Plan | null {
    const all = Array.from(this.plans.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.steps.length > max.steps.length ? p : max);
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

  getTotalExecuted(): number {
    return this.totalExecuted;
  }

  clearAll(): void {
    this.plans.clear();
    this.counter = 0;
    this.totalExecuted = 0;
  }
}

export default PlanEngine;