/**
 * Planner
 * generic-agent-design Planner - Plan + Evaluate + List + Stats
 */

export interface PlanStep {
  id: string;
  action: string;
  order: number;
  duration: number;
}

export interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  created: number;
  updated: number;
  evaluated: boolean;
  feasible: boolean;
  totalDuration: number;
}

export interface PlannerStats {
  plans: number;
  feasible: number;
  infeasible: number;
}

export class Planner {
  private plans: Map<string, Plan> = new Map();
  private counter = 0;

  plan(goal: string, actions: string[]): string {
    const id = `plan-${++this.counter}`;
    const steps: PlanStep[] = actions.map((action, i) => ({
      id: `step-${i}`,
      action,
      order: i,
      duration: 10 + i * 5,
    }));
    this.plans.set(id, {
      id,
      goal,
      steps,
      created: Date.now(),
      updated: Date.now(),
      evaluated: false,
      feasible: false,
      totalDuration: steps.reduce((sum, s) => sum + s.duration, 0),
    });
    return id;
  }

  evaluate(planId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    // A plan is feasible if it has at least 1 step
    plan.feasible = plan.steps.length > 0;
    plan.evaluated = true;
    plan.updated = Date.now();
    return plan.feasible;
  }

  listPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  getStats(): PlannerStats {
    const all = Array.from(this.plans.values());
    return {
      plans: all.length,
      feasible: all.filter(p => p.feasible).length,
      infeasible: all.filter(p => p.evaluated && !p.feasible).length,
    };
  }

  getPlan(id: string): Plan | undefined {
    return this.plans.get(id);
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

  getGoal(id: string): string | undefined {
    return this.plans.get(id)?.goal;
  }

  getSteps(id: string): PlanStep[] {
    return [...(this.plans.get(id)?.steps ?? [])];
  }

  getStepCount(id: string): number {
    return this.plans.get(id)?.steps.length ?? 0;
  }

  getStep(id: string, stepId: string): PlanStep | undefined {
    return this.plans.get(id)?.steps.find(s => s.id === stepId);
  }

  isEvaluated(id: string): boolean {
    return this.plans.get(id)?.evaluated ?? false;
  }

  isFeasible(id: string): boolean {
    return this.plans.get(id)?.feasible ?? false;
  }

  getTotalDuration(id: string): number {
    return this.plans.get(id)?.totalDuration ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.plans.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.plans.get(id)?.updated ?? 0;
  }

  getFeasiblePlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.feasible);
  }

  getInfeasiblePlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.evaluated && !p.feasible);
  }

  getUnevaluatedPlans(): Plan[] {
    return Array.from(this.plans.values()).filter(p => !p.evaluated);
  }

  getByGoal(goal: string): Plan[] {
    return Array.from(this.plans.values()).filter(p => p.goal === goal);
  }

  getAvgSteps(): number {
    const all = Array.from(this.plans.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, p) => sum + p.steps.length, 0) / all.length) * 100) / 100;
  }

  getAvgDuration(): number {
    const all = Array.from(this.plans.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, p) => sum + p.totalDuration, 0) / all.length) * 100) / 100;
  }

  getLargestPlan(): Plan | null {
    const all = Array.from(this.plans.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.steps.length > max.steps.length ? p : max);
  }

  getSmallestPlan(): Plan | null {
    const all = Array.from(this.plans.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.steps.length < min.steps.length ? p : min);
  }

  setGoal(id: string, goal: string): boolean {
    const plan = this.plans.get(id);
    if (!plan) return false;
    plan.goal = goal;
    plan.updated = Date.now();
    return true;
  }

  clearAll(): void {
    this.plans.clear();
    this.counter = 0;
  }
}

export default Planner;