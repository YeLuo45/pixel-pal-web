/**
 * Workflow Orchestrator
 * chatdev-design Workflow Orchestrator - Definition + Dependency + Status + Result
 */

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed';
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface WorkflowStep {
  id: string;
  name: string;
  dependsOn: string[];
  result?: unknown;
}

export interface Workflow {
  id: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  stepStatus: Map<string, StepStatus>;
  results: Map<string, unknown>;
}

export class WorkflowOrchestrator {
  private workflows: Map<string, Workflow> = new Map();
  private counter = 0;

  createWorkflow(steps: WorkflowStep[]): string {
    const id = `wf-${++this.counter}`;
    const stepStatus = new Map<string, StepStatus>();
    for (const step of steps) {
      stepStatus.set(step.id, 'pending');
    }
    this.workflows.set(id, {
      id,
      steps: steps.map(s => ({ ...s, dependsOn: [...s.dependsOn] })),
      status: 'pending',
      stepStatus,
      results: new Map(),
    });
    return id;
  }

  run(workflowId: string): boolean {
    const wf = this.workflows.get(workflowId);
    if (!wf) return false;
    wf.status = 'running';
    // Mark independent steps as in_progress
    for (const step of wf.steps) {
      if (step.dependsOn.length === 0) {
        wf.stepStatus.set(step.id, 'in_progress');
      }
    }
    return true;
  }

  completeStep(workflowId: string, stepId: string, result: unknown): boolean {
    const wf = this.workflows.get(workflowId);
    if (!wf) return false;
    const step = wf.steps.find(s => s.id === stepId);
    if (!step) return false;
    wf.stepStatus.set(stepId, 'completed');
    wf.results.set(stepId, result);
    step.result = result;
    // Mark dependents as in_progress if all their deps are completed
    for (const s of wf.steps) {
      if (s.dependsOn.includes(stepId) && wf.stepStatus.get(s.id) === 'pending') {
        const allDepsCompleted = s.dependsOn.every(d => wf.stepStatus.get(d) === 'completed');
        if (allDepsCompleted) wf.stepStatus.set(s.id, 'in_progress');
      }
    }
    // Check if all completed
    if (Array.from(wf.stepStatus.values()).every(s => s === 'completed')) {
      wf.status = 'completed';
    }
    return true;
  }

  failStep(workflowId: string, stepId: string): boolean {
    const wf = this.workflows.get(workflowId);
    if (!wf) return false;
    const step = wf.steps.find(s => s.id === stepId);
    if (!step) return false;
    wf.stepStatus.set(stepId, 'failed');
    wf.status = 'failed';
    return true;
  }

  getResults(workflowId: string): Map<string, unknown> {
    return new Map(this.workflows.get(workflowId)?.results ?? []);
  }

  getStatus(workflowId: string): WorkflowStatus | null {
    return this.workflows.get(workflowId)?.status ?? null;
  }

  getStepStatus(workflowId: string, stepId: string): StepStatus | null {
    return this.workflows.get(workflowId)?.stepStatus.get(stepId) ?? null;
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  getStep(workflowId: string, stepId: string): WorkflowStep | undefined {
    return this.workflows.get(workflowId)?.steps.find(s => s.id === stepId);
  }

  getReadySteps(workflowId: string): WorkflowStep[] {
    const wf = this.workflows.get(workflowId);
    if (!wf) return [];
    return wf.steps.filter(s => {
      if (wf.stepStatus.get(s.id) !== 'pending') return false;
      return s.dependsOn.every(d => wf.stepStatus.get(d) === 'completed');
    });
  }

  getCompletedSteps(workflowId: string): WorkflowStep[] {
    const wf = this.workflows.get(workflowId);
    if (!wf) return [];
    return wf.steps.filter(s => wf.stepStatus.get(s.id) === 'completed');
  }

  getPendingSteps(workflowId: string): WorkflowStep[] {
    const wf = this.workflows.get(workflowId);
    if (!wf) return [];
    return wf.steps.filter(s => wf.stepStatus.get(s.id) === 'pending');
  }

  getInProgressSteps(workflowId: string): WorkflowStep[] {
    const wf = this.workflows.get(workflowId);
    if (!wf) return [];
    return wf.steps.filter(s => wf.stepStatus.get(s.id) === 'in_progress');
  }

  getFailedSteps(workflowId: string): WorkflowStep[] {
    const wf = this.workflows.get(workflowId);
    if (!wf) return [];
    return wf.steps.filter(s => wf.stepStatus.get(s.id) === 'failed');
  }

  getProgress(workflowId: string): number {
    const wf = this.workflows.get(workflowId);
    if (!wf || wf.steps.length === 0) return 0;
    const completed = wf.steps.filter(s => wf.stepStatus.get(s.id) === 'completed').length;
    return Math.round((completed / wf.steps.length) * 100);
  }

  addStep(workflowId: string, step: WorkflowStep): boolean {
    const wf = this.workflows.get(workflowId);
    if (!wf) return false;
    wf.steps.push({ ...step, dependsOn: [...step.dependsOn] });
    wf.stepStatus.set(step.id, 'pending');
    return true;
  }

  removeStep(workflowId: string, stepId: string): boolean {
    const wf = this.workflows.get(workflowId);
    if (!wf) return false;
    const idx = wf.steps.findIndex(s => s.id === stepId);
    if (idx === -1) return false;
    wf.steps.splice(idx, 1);
    wf.stepStatus.delete(stepId);
    wf.results.delete(stepId);
    return true;
  }

  getWorkflowCount(): number {
    return this.workflows.size;
  }

  deleteWorkflow(workflowId: string): boolean {
    return this.workflows.delete(workflowId);
  }

  hasWorkflow(workflowId: string): boolean {
    return this.workflows.has(workflowId);
  }

  resetWorkflow(workflowId: string): boolean {
    const wf = this.workflows.get(workflowId);
    if (!wf) return false;
    wf.status = 'pending';
    wf.results.clear();
    for (const step of wf.steps) {
      wf.stepStatus.set(step.id, 'pending');
      step.result = undefined;
    }
    return true;
  }

  isCompleted(workflowId: string): boolean {
    return this.getStatus(workflowId) === 'completed';
  }

  isFailed(workflowId: string): boolean {
    return this.getStatus(workflowId) === 'failed';
  }

  clearAll(): void {
    this.workflows.clear();
    this.counter = 0;
  }
}

export default WorkflowOrchestrator;