/**
 * Pipeline Orchestrator for pixel-pal-web
 * V193 - Thunderbolt Pipeline Orchestrator (Direction E Iteration 2/9)
 * 
 * Multi-stage task pipeline with parallel/serial execution and dependency management.
 */

export interface PipelineStage {
  id: string;
  name: string;
  execute: (input: unknown) => Promise<unknown>;
  parallel?: boolean;
  dependsOn?: string[];
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
}

export class PipelineOrchestrator {
  private stages: Map<string, PipelineStage> = new Map();
  private pipelines: Map<string, Pipeline> = new Map();
  private executionResults: Map<string, unknown> = new Map();
  private pausedPipelines: Set<string> = new Set();
  private pauseResults: Map<string, unknown> = new Map();

  /**
   * Register a stage in the orchestrator
   */
  registerStage(stage: PipelineStage): void {
    if (!stage.id) {
      throw new Error('Stage must have an id');
    }
    if (!stage.name) {
      throw new Error('Stage must have a name');
    }
    if (typeof stage.execute !== 'function') {
      throw new Error('Stage must have an execute function');
    }
    this.stages.set(stage.id, stage);
  }

  /**
   * Create a new pipeline with ordered stage IDs
   */
  createPipeline(name: string, stageIds: string[]): Pipeline {
    if (!name) {
      throw new Error('Pipeline must have a name');
    }
    if (!stageIds || stageIds.length === 0) {
      throw new Error('Pipeline must have at least one stage');
    }

    const stages: PipelineStage[] = [];
    for (const stageId of stageIds) {
      const stage = this.stages.get(stageId);
      if (!stage) {
        throw new Error(`Stage with id "${stageId}" not found`);
      }
      stages.push(stage);
    }

    const pipeline: Pipeline = {
      id: `pipeline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      stages,
      status: 'idle',
    };

    this.pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  /**
   * Execute a pipeline with input data
   */
  async execute(pipelineId: string, input: unknown): Promise<unknown> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline with id "${pipelineId}" not found`);
    }

    pipeline.status = 'running';
    this.executionResults.set(pipelineId, input);
    this.pausedPipelines.delete(pipelineId);
    this.pauseResults.delete(pipelineId);

    try {
      const result = await this.executeStages(pipeline.stages, input, pipelineId);
      pipeline.status = 'completed';
      this.executionResults.set(pipelineId, result);
      return result;
    } catch (error) {
      pipeline.status = 'failed';
      throw error;
    }
  }

  /**
   * Execute stages respecting dependencies and parallel flags
   */
  private async executeStages(
    stages: PipelineStage[],
    input: unknown,
    pipelineId: string
  ): Promise<unknown> {
    let currentInput = input;
    const stageResults: Map<string, unknown> = new Map();

    // Process stages in topological order based on dependencies
    const executed = new Set<string>();
    const pendingStages = [...stages];

    while (pendingStages.length > 0) {
      // Find stages that can be executed (all dependencies satisfied)
      const readyStages = pendingStages.filter((stage) => {
        const deps = stage.dependsOn || [];
        return deps.every((dep) => executed.has(dep));
      });

      if (readyStages.length === 0) {
        throw new Error('Circular dependency or unresolved dependencies detected');
      }

      // Separate parallel and serial stages
      const parallelStages = readyStages.filter((s) => s.parallel);
      const serialStages = readyStages.filter((s) => !s.parallel);

      // Execute serial stages first, one at a time
      for (const stage of serialStages) {
        const deps = stage.dependsOn || [];
        let stageInput = currentInput;
        
        // If stage has dependencies, combine their results
        if (deps.length > 0) {
          const depResults = deps.map((dep) => stageResults.get(dep));
          stageInput = depResults.length === 1 ? depResults[0] : depResults;
        }

        const result = await this.executeStage(stage, stageInput, pipelineId);
        stageResults.set(stage.id, result);
        currentInput = result;
        executed.add(stage.id);
        pendingStages.splice(pendingStages.indexOf(stage), 1);
      }

      // Execute parallel stages concurrently
      if (parallelStages.length > 0) {
        const parallelPromises = parallelStages.map(async (stage) => {
          const deps = stage.dependsOn || [];
          let stageInput = currentInput;

          if (deps.length > 0) {
            const depResults = deps.map((dep) => stageResults.get(dep));
            stageInput = depResults.length === 1 ? depResults[0] : depResults;
          }

          return this.executeStage(stage, stageInput, pipelineId);
        });

        const parallelResults = await Promise.all(parallelPromises);
        parallelStages.forEach((stage, index) => {
          stageResults.set(stage.id, parallelResults[index]);
          executed.add(stage.id);
          pendingStages.splice(pendingStages.indexOf(stage), 1);
        });

        // Update currentInput with last parallel result
        if (parallelResults.length > 0) {
          currentInput = parallelResults[parallelResults.length - 1];
        }
      }
    }

    return currentInput;
  }

  /**
   * Execute a single stage
   */
  private async executeStage(
    stage: PipelineStage,
    input: unknown,
    pipelineId: string
  ): Promise<unknown> {
    // Check if pipeline is paused
    if (this.pausedPipelines.has(pipelineId)) {
      throw new Error(`Pipeline "${pipelineId}" is paused`);
    }

    return stage.execute(input);
  }

  /**
   * Pause a running pipeline
   */
  pause(pipelineId: string): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline with id "${pipelineId}" not found`);
    }
    if (pipeline.status !== 'running') {
      throw new Error(`Cannot pause pipeline in "${pipeline.status}" status`);
    }

    pipeline.status = 'paused';
    this.pausedPipelines.add(pipelineId);
    this.pauseResults.set(pipelineId, this.executionResults.get(pipelineId));
  }

  /**
   * Resume a paused pipeline
   */
  resume(pipelineId: string): void {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline with id "${pipelineId}" not found`);
    }
    if (pipeline.status !== 'paused') {
      throw new Error(`Cannot resume pipeline in "${pipeline.status}" status`);
    }

    pipeline.status = 'running';
    this.pausedPipelines.delete(pipelineId);
  }

  /**
   * Get the current status of a pipeline
   */
  getStatus(pipelineId: string): Pipeline {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline with id "${pipelineId}" not found`);
    }
    return { ...pipeline };
  }
}