/**
 * Pipeline Orchestrator v3
 * thunderbolt Pipeline Orchestrator v3 - Dynamic Pipeline + Feedback + Parallel + Retry
 */

export type PipelineStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';
export type StageStatus = 'pending' | 'running' | 'done' | 'failed';

export interface Stage {
  name: string;
  tasks: (() => Promise<unknown>)[];
  parallel: boolean;
  retryCount: number;
}

export interface PipelineResult {
  pipelineId: string;
  status: PipelineStatus;
  results: unknown[];
  errors: Error[];
  duration: number;
}

let pipelineCounter = 0;

function generatePipelineId(): string {
  return `pipeline-${Date.now()}-${++pipelineCounter}`;
}

interface RunningPipeline {
  id: string;
  stages: Stage[];
  status: PipelineStatus;
  currentStageIndex: number;
  results: unknown[];
  errors: Error[];
  startTime: number;
  paused: boolean;
}

export class PipelineOrchestrator {
  private pipelines: Map<string, RunningPipeline> = new Map();

  /**
   * Create a new pipeline
   */
  create(stages: Stage[]): string {
    const id = generatePipelineId();
    this.pipelines.set(id, {
      id,
      stages,
      status: 'idle',
      currentStageIndex: 0,
      results: [],
      errors: [],
      startTime: 0,
      paused: false,
    });
    return id;
  }

  /**
   * Run a pipeline
   */
  async run(pipelineId: string): Promise<PipelineResult> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    pipeline.status = 'running';
    pipeline.startTime = Date.now();

    const results: unknown[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < pipeline.stages.length; i++) {
      if (pipeline.paused) {
        pipeline.status = 'paused';
        break;
      }

      pipeline.currentStageIndex = i;
      const stage = pipeline.stages[i];

      try {
        const stageResults = await this.runStage(stage, pipeline);
        results.push(...stageResults);
        pipeline.results = results;
      } catch (err) {
        errors.push(err as Error);
        pipeline.errors = errors;
        pipeline.status = 'failed';
        break;
      }
    }

    if (pipeline.status === 'running') {
      pipeline.status = 'completed';
    }

    return {
      pipelineId,
      status: pipeline.status,
      results,
      errors,
      duration: Date.now() - pipeline.startTime,
    };
  }

  /**
   * Run a single stage
   */
  private async runStage(stage: Stage, pipeline: RunningPipeline): Promise<unknown[]> {
    const results: unknown[] = [];
    let attempt = 0;

    while (attempt <= stage.retryCount) {
      try {
        if (stage.parallel) {
          const parallelResults = await Promise.allSettled(stage.tasks.map(t => t()));
          for (const result of parallelResults) {
            if (result.status === 'fulfilled') {
              results.push(result.value);
            } else {
              throw result.reason;
            }
          }
        } else {
          for (const task of stage.tasks) {
            const result = await task();
            results.push(result);
          }
        }
        break; // Success, exit retry loop
      } catch (err) {
        attempt++;
        if (attempt > stage.retryCount) {
          throw err;
        }
      }
    }

    return results;
  }

  /**
   * Pause a pipeline
   */
  pause(pipelineId: string): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (pipeline && pipeline.status === 'running') {
      pipeline.paused = true;
      pipeline.status = 'paused';
    }
  }

  /**
   * Resume a paused pipeline
   */
  resume(pipelineId: string): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (pipeline && pipeline.status === 'paused') {
      pipeline.paused = false;
      pipeline.status = 'running';
    }
  }

  /**
   * Cancel a pipeline
   */
  cancel(pipelineId: string): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (pipeline) {
      pipeline.status = 'failed';
      pipeline.paused = false;
    }
  }

  /**
   * Get pipeline status
   */
  getStatus(pipelineId: string): PipelineStatus {
    const pipeline = this.pipelines.get(pipelineId);
    return pipeline?.status ?? 'idle';
  }

  /**
   * Get pipeline info
   */
  getPipeline(pipelineId: string): RunningPipeline | null {
    return this.pipelines.get(pipelineId) ?? null;
  }

  /**
   * Get all pipelines
   */
  getAllPipelines(): RunningPipeline[] {
    return Array.from(this.pipelines.values());
  }

  /**
   * Clear all pipelines (for testing)
   */
  clearAll(): void {
    this.pipelines.clear();
  }
}

export default PipelineOrchestrator;