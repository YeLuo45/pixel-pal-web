/**
 * Pipeline Orchestrator v3
 * thunderbolt-design Pipeline Orchestrator v3 - Multi-stage + Parallel + State + Monitoring
 */

export type PipelineStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface PipelineStage {
  name: string;
  tasks: (() => Promise<unknown>)[];
  parallel: boolean;
  retryCount: number;
}

export interface PipelineState {
  status: PipelineStatus;
  currentStage: number;
  results: Map<string, unknown>;
}

interface PipelineInstance {
  id: string;
  stages: PipelineStage[];
  state: PipelineState;
  paused: boolean;
  stageIndex: number;
}

export class PipelineOrchestratorV3 {
  private pipelines: Map<string, PipelineInstance> = new Map();
  private counter = 0;

  create(stages: PipelineStage[]): string {
    const id = `pipeline-${++this.counter}`;
    this.pipelines.set(id, {
      id,
      stages,
      state: {
        status: 'idle',
        currentStage: 0,
        results: new Map(),
      },
      paused: false,
      stageIndex: 0,
    });
    return id;
  }

  async run(pipelineId: string): Promise<PipelineState> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error('Pipeline not found');

    pipeline.state.status = 'running';
    pipeline.stageIndex = 0;

    for (let i = 0; i < pipeline.stages.length; i++) {
      if (pipeline.paused) {
        pipeline.state.status = 'paused';
        return pipeline.state;
      }

      pipeline.state.currentStage = i;
      const stage = pipeline.stages[i];

      try {
        if (stage.parallel) {
          const results = await Promise.allSettled(stage.tasks.map(t => t()));
          pipeline.state.results.set(stage.name, results.map(r => r.status === 'fulfilled' ? r.value : r.reason));
        } else {
          for (const task of stage.tasks) {
            let attempts = 0;
            while (attempts <= stage.retryCount) {
              try {
                const result = await task();
                pipeline.state.results.set(`${stage.name}-${attempts}`, result);
                break;
              } catch (err) {
                attempts++;
                if (attempts > stage.retryCount) throw err;
              }
            }
          }
        }
      } catch {
        pipeline.state.status = 'failed';
        return pipeline.state;
      }
    }

    pipeline.state.status = 'completed';
    return pipeline.state;
  }

  pause(pipelineId: string): boolean {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline || pipeline.state.status !== 'running') return false;
    pipeline.paused = true;
    pipeline.state.status = 'paused';
    return true;
  }

  resume(pipelineId: string): boolean {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline || pipeline.state.status !== 'paused') return false;
    pipeline.paused = false;
    pipeline.state.status = 'running';
    return true;
  }

  getState(pipelineId: string): PipelineState | null {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return null;
    return {
      status: pipeline.state.status,
      currentStage: pipeline.state.currentStage,
      results: new Map(pipeline.state.results),
    };
  }

  getMetrics(pipelineId: string): { stages: number; completed: number; failed: number } | null {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return null;
    return {
      stages: pipeline.stages.length,
      completed: pipeline.state.currentStage,
      failed: pipeline.state.status === 'failed' ? 1 : 0,
    };
  }

  getPipelineCount(): number {
    return this.pipelines.size;
  }

  deletePipeline(pipelineId: string): boolean {
    return this.pipelines.delete(pipelineId);
  }

  getAllPipelines(): string[] {
    return Array.from(this.pipelines.keys());
  }

  getActivePipelines(): string[] {
    return Array.from(this.pipelines.entries())
      .filter(([, p]) => p.state.status === 'running')
      .map(([id]) => id);
  }

  clearAll(): void {
    this.pipelines.clear();
  }
}

export default PipelineOrchestratorV3;