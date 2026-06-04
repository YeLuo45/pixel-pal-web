/**
 * AutonomousPlanner v2 - Multi-goal planning, priority scheduling, backtracking repair, execution monitoring
 * PRD: P-20260604-054 / v206-autonomous-planner-v2
 */

export type PlanStatus = 'planned' | 'executing' | 'completed' | 'failed' | 'paused';
export type StepStatus = 'pending' | 'running' | 'done' | 'failed';

export interface PlanStep {
  id: string;
  description: string;
  status: StepStatus;
  estimatedCost: number;
  actualCost?: number;
  dependencies: string[];
}

export interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  status: PlanStatus;
  createdAt: number;
  completedAt?: number;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class AutonomousPlanner {
  private plans: Map<string, Plan> = new Map();
  private executionQueue: string[] = [];
  private executingPlanId: string | null = null;
  private stepRetryCount: Map<string, number> = new Map();
  private maxRetries = 3;
  private stepExecutor: (step: PlanStep) => Promise<void>;

  constructor(executor?: (step: PlanStep) => Promise<void>) {
    // Allow injection of step executor for testability
    this.stepExecutor = executor ?? this.defaultStepExecutor;
  }

  private async defaultStepExecutor(step: PlanStep): Promise<void> {
    const delay = Math.min(step.estimatedCost, 50);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  createPlan(goal: string, steps: Omit<PlanStep, 'id' | 'status'>[]): Plan {
    const planSteps: PlanStep[] = steps.map((s) => ({
      ...s,
      id: generateId(),
      status: 'pending',
    }));

    const plan: Plan = {
      id: generateId(),
      goal,
      steps: planSteps,
      status: 'planned',
      createdAt: Date.now(),
    };

    this.plans.set(plan.id, plan);
    this.executionQueue.push(plan.id);
    return plan;
  }

  async execute(planId: string): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    if (plan.status === 'executing') return;

    plan.status = 'executing';
    this.executingPlanId = planId;

    try {
      await this.executeSteps(planId);
    } catch {
      plan.status = 'failed';
    } finally {
      this.executingPlanId = null;
    }
  }

  private async executeSteps(planId: string): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) return;

    // Collect steps that can run now (pending/failed and deps satisfied)
    const runnable = (steps: PlanStep[]) =>
      steps.filter((s) => {
        if (s.status !== 'pending' && s.status !== 'failed') return false;
        return s.dependencies.every((depId) => {
          const dep = plan.steps.find((d) => d.id === depId);
          return dep?.status === 'done';
        });
      });

    let batch = runnable(plan.steps);

    while (batch.length > 0) {
      const step = batch[0];
      step.status = 'running';

      const start = Date.now();
      try {
        await this.stepExecutor(step);
        step.status = 'done';
        step.actualCost = Date.now() - start;
      } catch {
        step.status = 'failed';
      }

      // Re-evaluate after this step changed state
      const allDone = plan.steps.every((s) => s.status === 'done');
      if (allDone) {
        plan.status = 'completed';
        plan.completedAt = Date.now();
        return;
      }

      const anyFailed = plan.steps.some((s) => s.status === 'failed');
      if (anyFailed) {
        plan.status = 'failed';
        return;
      }

      batch = runnable(plan.steps);
    }

    // No runnable steps but not all done → deadlock/failed
    const anyIncomplete = plan.steps.some((s) => s.status !== 'done');
    if (anyIncomplete) {
      plan.status = 'failed';
    }
  }

  pause(planId: string): void {
    const plan = this.plans.get(planId);
    if (!plan || plan.status !== 'executing') return;
    plan.status = 'paused';
  }

  resume(planId: string): void {
    const plan = this.plans.get(planId);
    if (!plan || plan.status !== 'paused') return;
    plan.status = 'executing';
    this.execute(planId);
  }

  cancel(planId: string): void {
    const plan = this.plans.get(planId);
    if (!plan) return;
    plan.status = 'failed';
    this.executionQueue = this.executionQueue.filter((id) => id !== planId);
    if (this.executingPlanId === planId) this.executingPlanId = null;
  }

  getPlan(planId: string): Plan | null {
    return this.plans.get(planId) ?? null;
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  retryStep(planId: string, stepId: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;

    const step = plan.steps.find((s) => s.id === stepId);
    if (!step || step.status === 'done') return false;

    const key = `${planId}:${stepId}`;
    const retries = this.stepRetryCount.get(key) ?? 0;
    if (retries >= this.maxRetries) return false;

    this.stepRetryCount.set(key, retries + 1);
    step.status = 'pending';
    return true;
  }
}