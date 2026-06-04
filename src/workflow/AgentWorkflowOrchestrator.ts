/**
 * Agent Workflow Orchestrator
 * chatdev Agent Workflow Orchestrator
 */

export type WorkflowStatus = 'running' | 'completed' | 'failed';
export type StageStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowStage {
  id: string;
  name: string;
  agentType: string;
  input: unknown;
  output: unknown;
  status: StageStatus;
}

export interface WorkflowResult {
  workflowId: string;
  name: string;
  stages: WorkflowStage[];
  status: WorkflowStatus;
  finalOutput: unknown;
  duration: number;
}

interface PendingWorkflow {
  name: string;
  stages: { agentType: string; input: unknown }[];
}

type StatusCallback = (result: WorkflowResult) => void;
type CancelCallback = (workflowId: string) => void;

let workflowCounter = 0;
let stageCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++workflowCounter}`;
}

function createStage(name: string, agentType: string, input: unknown): WorkflowStage {
  return {
    id: `stage-${Date.now()}-${++stageCounter}`,
    name,
    agentType,
    input,
    output: undefined,
    status: 'pending',
  };
}

/**
 * Simulate agent execution based on agentType
 */
function simulateAgentExecution(agentType: string, input: unknown): unknown {
  switch (agentType) {
    case 'planner':
      return { plan: `Generated plan for ${JSON.stringify(input)}`, steps: 3 };
    case 'designer':
      return { design: `Design for ${JSON.stringify(input)}`, format: 'diagram' };
    case 'executor':
      return { result: `Executed ${JSON.stringify(input)}`, success: true };
    case 'reviewer':
      return { review: `Reviewed ${JSON.stringify(input)}`, approved: true };
    case 'coordinator':
      return { coordination: `Coordinated ${JSON.stringify(input)}`, synced: true };
    default:
      return { result: `Processed ${JSON.stringify(input)}`, agentType };
  }
}

export class AgentWorkflowOrchestrator {
  private workflows: Map<string, WorkflowResult> = new Map();
  private pendingWorkflows: Map<string, PendingWorkflow> = new Map();
  private runningWorkflows: Set<string> = new Set();
  private statusCallbacks: Map<string, StatusCallback[]> = new Map();
  private cancelCallbacks: Map<string, CancelCallback[]> = new Map();

  /**
   * Create a new workflow
   */
  createWorkflow(name: string, stages: { agentType: string; input: unknown }[]): WorkflowResult {
    const workflowId = generateId('workflow');
    const workflowStages = stages.map((s, i) =>
      createStage(`Stage ${i + 1}: ${s.agentType}`, s.agentType, s.input)
    );

    const result: WorkflowResult = {
      workflowId,
      name,
      stages: workflowStages,
      status: 'running',
      finalOutput: undefined,
      duration: 0,
    };

    this.workflows.set(workflowId, result);
    this.pendingWorkflows.set(workflowId, { name, stages });
    return result;
  }

  /**
   * Execute a workflow
   */
  async execute(workflowId: string): Promise<WorkflowResult> {
    const result = this.workflows.get(workflowId);
    const pending = this.pendingWorkflows.get(workflowId);

    if (!result || !pending) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (this.runningWorkflows.has(workflowId)) {
      throw new Error(`Workflow ${workflowId} is already running`);
    }

    this.runningWorkflows.add(workflowId);
    const startTime = Date.now();

    try {
      for (let i = 0; i < result.stages.length; i++) {
        const stage = result.stages[i];

        // Check if cancelled
        if (!this.runningWorkflows.has(workflowId)) {
          result.status = 'failed';
          break;
        }

        stage.status = 'running';
        result.stages = [...result.stages]; // trigger reactivity if needed

        // Simulate agent execution
        try {
          stage.output = simulateAgentExecution(stage.agentType, stage.input);
          stage.status = 'completed';
        } catch (err) {
          stage.status = 'failed';
          result.status = 'failed';
          this.runningWorkflows.delete(workflowId);
          this.notifyStatusChange(workflowId);
          return result;
        }
      }

      if (result.status !== 'failed') {
        result.status = 'completed';
        result.finalOutput = result.stages.map((s) => s.output);
      }
    } finally {
      result.duration = Date.now() - startTime;
      this.runningWorkflows.delete(workflowId);
    }

    this.notifyStatusChange(workflowId);
    return result;
  }

  /**
   * Get workflow status
   */
  getStatus(workflowId: string): WorkflowResult | null {
    return this.workflows.get(workflowId) ?? null;
  }

  /**
   * Cancel a running workflow
   */
  cancel(workflowId: string): void {
    if (this.runningWorkflows.has(workflowId)) {
      this.runningWorkflows.delete(workflowId);
    }
    const result = this.workflows.get(workflowId);
    if (result) {
      result.status = 'failed';
      this.notifyCancel(workflowId);
    }
    this.pendingWorkflows.delete(workflowId);
  }

  /**
   * Register callback for status changes
   */
  onStatusChange(workflowId: string, callback: StatusCallback): () => void {
    const cbs = this.statusCallbacks.get(workflowId) ?? [];
    cbs.push(callback);
    this.statusCallbacks.set(workflowId, cbs);

    return () => {
      const arr = this.statusCallbacks.get(workflowId);
      if (arr) {
        const idx = arr.indexOf(callback);
        if (idx >= 0) arr.splice(idx, 1);
      }
    };
  }

  /**
   * Register callback for cancellation
   */
  onCancel(workflowId: string, callback: CancelCallback): () => void {
    const cbs = this.cancelCallbacks.get(workflowId) ?? [];
    cbs.push(callback);
    this.cancelCallbacks.set(workflowId, cbs);

    return () => {
      const arr = this.cancelCallbacks.get(workflowId);
      if (arr) {
        const idx = arr.indexOf(callback);
        if (idx >= 0) arr.splice(idx, 1);
      }
    };
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): WorkflowResult[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Clear all workflows (for testing)
   */
  clearAll(): void {
    this.workflows.clear();
    this.pendingWorkflows.clear();
    this.runningWorkflows.clear();
    this.statusCallbacks.clear();
    this.cancelCallbacks.clear();
  }

  private notifyStatusChange(workflowId: string): void {
    const result = this.workflows.get(workflowId);
    if (!result) return;

    const cbs = this.statusCallbacks.get(workflowId);
    if (cbs) {
      for (const cb of cbs) {
        try {
          cb(result);
        } catch {
          // callback error - ignore
        }
      }
    }
  }

  private notifyCancel(workflowId: string): void {
    const cbs = this.cancelCallbacks.get(workflowId);
    if (cbs) {
      for (const cb of cbs) {
        try {
          cb(workflowId);
        } catch {
          // callback error - ignore
        }
      }
    }
  }
}

export default AgentWorkflowOrchestrator;