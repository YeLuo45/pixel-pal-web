/**
 * V139: OrchestrationEngine — Pipeline parser + topological sort + parallel execution
 */
export interface PipelineStep {
  id: string;
  skillId: string;
  skillVersion?: string;
  input: Record<string, unknown>;
  condition?: string;
  depends_on: string[];
  parallel_group?: number;
  on_error: 'abort' | 'skip' | 'retry';
  retry_count: number;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  steps: PipelineStep[];
  maxParallel: number;
  retryOnFail: boolean;
  timeout_ms: number;
}

export interface StepResult {
  stepId: string;
  status: 'completed' | 'skipped' | 'failed' | 'running';
  output: unknown;
  error?: string;
  duration_ms: number;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt: string | null;
  stepResults: Record<string, StepResult>;
  output: unknown;
}

type ExecutionContext = {
  shared: Record<string, unknown>;
  stepOutputs: Record<string, unknown>;
  pipeline: Pipeline;
};

function resolvePlaceholder(value: unknown, ctx: ExecutionContext): unknown {
  if (typeof value !== 'string') return value;
  const match = value.match(/^\{\{step_([^.]+)\.output\}\}$/);
  if (!match) return value;
  const stepId = match[1];
  return ctx.stepOutputs[stepId] ?? value;
}

function evaluateCondition(cond: string, ctx: ExecutionContext): boolean {
  try {
    const result = new Function('ctx', `with(ctx) { return ${cond}; }`)(ctx);
    return !!result;
  } catch {
    return true;
  }
}

function resolveInput(input: Record<string, unknown>, ctx: ExecutionContext): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    resolved[k] = resolvePlaceholder(v, ctx);
  }
  return resolved;
}

export function topologicalSort(steps: PipelineStep[]): PipelineStep[] {
  const sorted: PipelineStep[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(step: PipelineStep) {
    if (visited.has(step.id)) return;
    if (visiting.has(step.id)) return; // cycle
    visiting.add(step.id);
    for (const dep of step.depends_on) {
      const depStep = steps.find(s => s.id === dep);
      if (depStep) visit(depStep);
    }
    visiting.delete(step.id);
    visited.add(step.id);
    sorted.push(step);
  }

  for (const step of steps) visit(step);
  return sorted;
}

export function groupByParallel(steps: PipelineStep[]): PipelineStep[][] {
  const groups = new Map<number, PipelineStep[]>();
  for (const step of steps) {
    const pg = step.parallel_group ?? 0;
    if (!groups.has(pg)) groups.set(pg, []);
    groups.get(pg)!.push(step);
  }
  return Array.from(groups.values());
}

export function buildExecutionPlan(pipeline: Pipeline): PipelineStep[][] {
  const sorted = topologicalSort(pipeline.steps);
  const grouped = groupByParallel(sorted);
  return grouped;
}

export class OrchestrationEngine {
  private registry: Map<string, (input: Record<string, unknown>) => Promise<unknown>> = new Map();

  registerSkill(skillId: string, fn: (input: Record<string, unknown>) => Promise<unknown>) {
    this.registry.set(skillId, fn);
  }

  async executeStep(step: PipelineStep, ctx: ExecutionContext): Promise<StepResult> {
    const start = Date.now();
    const resolvedInput = resolveInput(step.input, ctx);

    if (step.condition && !evaluateCondition(step.condition, ctx)) {
      return { stepId: step.id, status: 'skipped', output: null, duration_ms: Date.now() - start };
    }

    const executor = this.registry.get(step.skillId);
    if (!executor) {
      return { stepId: step.id, status: 'failed', output: null, error: `Skill ${step.skillId} not found`, duration_ms: Date.now() - start };
    }

    for (let attempt = 0; attempt <= step.retry_count; attempt++) {
      try {
        const output = await executor(resolvedInput);
        ctx.stepOutputs[step.id] = output;
        return { stepId: step.id, status: 'completed', output, duration_ms: Date.now() - start };
      } catch (e) {
        if (attempt === step.retry_count) {
          return { stepId: step.id, status: 'failed', output: null, error: (e as Error).message, duration_ms: Date.now() - start };
        }
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
    return { stepId: step.id, status: 'failed', output: null, error: 'max retries', duration_ms: Date.now() - start };
  }

  async runPipeline(pipeline: Pipeline, initialInput: Record<string, unknown>): Promise<PipelineRun> {
    const run: PipelineRun = {
      id: `run_${Date.now()}`,
      pipelineId: pipeline.id,
      status: 'running',
      startedAt: new Date().toISOString(),
      completedAt: null,
      stepResults: {},
      output: null,
    };

    const ctx: ExecutionContext = {
      shared: { ...initialInput },
      stepOutputs: {},
      pipeline,
    };

    try {
      const plan = buildExecutionPlan(pipeline);
      for (const group of plan) {
        const results = await Promise.all(group.map(step => this.executeStep(step, ctx)));
        for (const result of results) {
          run.stepResults[result.stepId] = result;
          if (result.status === 'failed' && pipeline.retryOnFail) {
            run.status = 'failed';
            run.completedAt = new Date().toISOString();
            return run;
          }
        }
      }
      run.status = 'completed';
      run.output = ctx.shared;
    } catch (e) {
      run.status = 'failed';
    }
    run.completedAt = new Date().toISOString();
    return run;
  }
}