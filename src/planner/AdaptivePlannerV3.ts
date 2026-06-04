/**
 * Adaptive Planner v3
 * generic-agent-design Adaptive Planner v3 - Plan + Adapt + Track + Rollback
 */

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type PlanStatus = 'pending' | 'executing' | 'completed' | 'rolled_back';

export interface PlanStep {
  id: string;
  description: string;
  status: StepStatus;
  dependencies: string[];
}

export interface Plan {
  id: string;
  steps: PlanStep[];
  status: PlanStatus;
  adaptations: { stepId: string; change: string; timestamp: number }[];
}

export class AdaptivePlannerV3 {
  private plans: Map<string, Plan> = new Map();
  private counter = 0;

  createPlan(steps: PlanStep[]): string {
    const id = `plan-${++this.counter}`;
    this.plans.set(id, {
      id,
      steps: steps.map(s => ({ ...s, dependencies: [...s.dependencies] })),
      status: 'pending',
      adaptations: [],
    });
    return id;
  }

  execute(planId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    plan.status = 'executing';
    // Mark first steps as in_progress (those without dependencies)
    for (const step of plan.steps) {
      if (step.dependencies.length === 0) {
        step.status = 'in_progress';
      }
    }
    return true;
  }

  adapt(planId: string, stepId: string, change: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    const step = plan.steps.find(s => s.id === stepId);
    if (!step) return false;
    step.description = `${step.description} [adapted: ${change}]`;
    plan.adaptations.push({ stepId, change, timestamp: Date.now() });
    return true;
  }

  rollback(planId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    if (plan.status === 'rolled_back') return false;
    plan.status = 'rolled_back';
    for (const step of plan.steps) {
      if (step.status === 'in_progress' || step.status === 'completed') {
        step.status = 'pending';
      }
    }
    return true;
  }

  getProgress(planId: string): number {
    const plan = this.plans.get(planId);
    if (!plan || plan.steps.length === 0) return 0;
    const completed = plan.steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / plan.steps.length) * 100);
  }

  completeStep(planId: string, stepId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    const step = plan.steps.find(s => s.id === stepId);
    if (!step) return false;
    step.status = 'completed';
    // Mark dependents as in_progress
    for (const s of plan.steps) {
      if (s.status === 'pending' && s.dependencies.includes(stepId)) {
        // Check if all dependencies are completed
        const allDepsCompleted = s.dependencies.every(dep => {
          const depStep = plan.steps.find(x => x.id === dep);
          return depStep?.status === 'completed';
        });
        if (allDepsCompleted) s.status = 'in_progress';
      }
    }
    // Check if all completed
    if (plan.steps.every(s => s.status === 'completed')) {
      plan.status = 'completed';
    }
    return true;
  }

  failStep(planId: string, stepId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    const step = plan.steps.find(s => s.id === stepId);
    if (!step) return false;
    step.status = 'failed';
    return true;
  }

  getPlan(planId: string): Plan | undefined {
    return this.plans.get(planId);
  }

  getStep(planId: string, stepId: string): PlanStep | undefined {
    return this.plans.get(planId)?.steps.find(s => s.id === stepId);
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  getAdaptations(planId: string): { stepId: string; change: string; timestamp: number }[] {
    return [...(this.plans.get(planId)?.adaptations ?? [])];
  }

  getFailedSteps(planId: string): PlanStep[] {
    return this.plans.get(planId)?.steps.filter(s => s.status === 'failed') ?? [];
  }

  getCompletedSteps(planId: string): PlanStep[] {
    return this.plans.get(planId)?.steps.filter(s => s.status === 'completed') ?? [];
  }

  getPendingSteps(planId: string): PlanStep[] {
    return this.plans.get(planId)?.steps.filter(s => s.status === 'pending') ?? [];
  }

  getInProgressSteps(planId: string): PlanStep[] {
    return this.plans.get(planId)?.steps.filter(s => s.status === 'in_progress') ?? [];
  }

  hasFailedStep(planId: string): boolean {
    return this.getFailedSteps(planId).length > 0;
  }

  getPlanCount(): number {
    return this.plans.size;
  }

  deletePlan(planId: string): boolean {
    return this.plans.delete(planId);
  }

  addStep(planId: string, step: PlanStep): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    plan.steps.push({ ...step, dependencies: [...step.dependencies] });
    return true;
  }

  removeStep(planId: string, stepId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    const idx = plan.steps.findIndex(s => s.id === stepId);
    if (idx === -1) return false;
    plan.steps.splice(idx, 1);
    return true;
  }

  canExecute(planId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    return plan.status === 'pending';
  }

  isCompleted(planId: string): boolean {
    return this.plans.get(planId)?.status === 'completed';
  }

  isRolledBack(planId: string): boolean {
    return this.plans.get(planId)?.status === 'rolled_back';
  }

  clearAll(): void {
    this.plans.clear();
    this.counter = 0;
  }
}

export default AdaptivePlannerV3;