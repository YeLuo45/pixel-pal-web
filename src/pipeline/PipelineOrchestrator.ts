/**
 * Pipeline Orchestrator v2
 * Thunderbolt Pipeline Orchestrator v2 - Parallel task scheduling, dependency management, fault recovery, retry mechanism
 */

export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed' | 'paused';
export type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface PipelineConfig {
  maxParallel: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  execute: () => Promise<unknown>;
  dependencies: string[];
  parallelGroup?: string;
  status: StageStatus;
  retries: number;
}

export interface RunResult {
  status: PipelineStatus;
  results: unknown[];
}

export interface PipelineState {
  pipeline: PipelineStatus;
  stages: PipelineStage[];
}

/**
 * PipelineOrchestrator - Handles parallel task scheduling, dependency management,
 * fault recovery, and retry mechanisms for pipeline execution.
 */
export class PipelineOrchestrator {
  private config: PipelineConfig;
  private stages: Map<string, PipelineStage> = new Map();
  private stageOrder: string[] = [];
  private results: unknown[] = [];
  private status: PipelineStatus = 'idle';
  private paused: boolean = false;
  private executionAbortController: AbortController | null = null;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  /**
   * Add a stage to the pipeline
   * @returns stage ID
   */
  addStage(stage: Omit<PipelineStage, 'status' | 'retries'>): string {
    if (this.status !== 'idle') {
      throw new Error('Cannot add stages while pipeline is running');
    }
    if (this.stages.has(stage.id)) {
      throw new Error(`Stage with id "${stage.id}" already exists`);
    }
    const newStage: PipelineStage = {
      ...stage,
      status: 'pending',
      retries: 0,
    };
    this.stages.set(stage.id, newStage);
    this.stageOrder.push(stage.id);
    return stage.id;
  }

  /**
   * Run the pipeline
   */
  async run(): Promise<RunResult> {
    if (this.status === 'running') {
      throw new Error('Pipeline is already running');
    }
    if (this.paused && this.status !== 'idle') {
      throw new Error('Pipeline is paused. Resume first');
    }

    this.status = 'running';
    this.results = [];
    this.executionAbortController = new AbortController();

    try {
      await this.executeStages();
      this.status = 'completed';
    } catch (error) {
      this.status = 'failed';
      throw error;
    } finally {
      this.executionAbortController = null;
    }

    return {
      status: this.status,
      results: this.results,
    };
  }

  /**
   * Pause the pipeline
   */
  pause(): void {
    if (this.status !== 'running') {
      throw new Error('Can only pause a running pipeline');
    }
    this.paused = true;
    this.status = 'paused';
  }

  /**
   * Resume the pipeline
   */
  resume(): void {
    if (!this.paused) {
      throw new Error('Pipeline is not paused');
    }
    this.paused = false;
    this.status = 'running';
  }

  /**
   * Reset the pipeline to idle state
   */
  reset(): void {
    this.paused = false;
    this.status = 'idle';
    this.results = [];
    this.executionAbortController = null;
    this.stages.forEach((stage) => {
      stage.status = 'pending';
      stage.retries = 0;
    });
  }

  /**
   * Get current pipeline and stages status
   */
  getStatus(): PipelineState {
    return {
      pipeline: this.status,
      stages: Array.from(this.stages.values()),
    };
  }

  /**
   * Get execution order based on dependencies (topological sort)
   */
  private getExecutionOrder(): string[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    // Initialize
    this.stageOrder.forEach((id) => {
      inDegree.set(id, 0);
      adjacency.set(id, []);
    });

    // Build graph
    this.stages.forEach((stage) => {
      stage.dependencies.forEach((depId) => {
        if (!this.stages.has(depId)) {
          throw new Error(`Stage "${stage.id}" depends on non-existent stage "${depId}"`);
        }
        adjacency.get(depId)!.push(stage.id);
        inDegree.set(stage.id, (inDegree.get(stage.id) || 0) + 1);
      });
    });

    // Kahn's algorithm for topological sort with parallel group awareness
    const queue: string[] = [];
    const result: string[] = [];

    // Find all nodes with in-degree 0
    inDegree.forEach((degree, id) => {
      if (degree === 0) {
        queue.push(id);
      }
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = adjacency.get(current) || [];
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Check for cycles
    if (result.length !== this.stages.size) {
      throw new Error('Pipeline contains circular dependencies');
    }

    return result;
  }

  /**
   * Execute all stages respecting dependencies and parallel constraints
   */
  private async executeStages(): Promise<void> {
    const executionOrder = this.getExecutionOrder();
    const completed = new Set<string>();
    const running = new Set<string>();
    const pending = new Set<string>(executionOrder);

    // Group stages by parallel group for parallel execution
    const parallelGroups = this.getParallelGroups(executionOrder);

    for (const group of parallelGroups) {
      if (this.paused) {
        // Wait while paused
        await this.waitWhilePaused();
      }

      // Execute group in parallel
      const promises = group.map((stageId) => this.executeStage(stageId, completed, running, pending));

      const groupResults = await Promise.allSettled(promises);

      // Check if any stage failed critically
      for (const result of groupResults) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }
    }
  }

  /**
   * Get parallel groups based on parallelGroup property
   */
  private getParallelGroups(executionOrder: string[]): string[][] {
    const groups: string[][] = [];
    let currentGroup: string[] = [];

    executionOrder.forEach((stageId) => {
      const stage = this.stages.get(stageId)!;
      
      if (stage.parallelGroup) {
        // Add to current parallel group if not already added
        if (currentGroup.length > 0 && currentGroup.every((id) => this.stages.get(id)!.parallelGroup === stage.parallelGroup)) {
          currentGroup.push(stageId);
        } else {
          // Start new parallel group
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }
          currentGroup = [stageId];
        }
      } else {
        // Non-parallel stage - finish current group and add as separate
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
        groups.push([stageId]);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Execute a single stage with retry support
   */
  private async executeStage(
    stageId: string,
    completed: Set<string>,
    running: Set<string>,
    pending: Set<string>
  ): Promise<unknown> {
    const stage = this.stages.get(stageId)!;

    // Wait for dependencies to complete
    await this.waitForDependencies(stage.dependencies, completed);

    if (this.paused) {
      await this.waitWhilePaused();
    }

    running.add(stageId);
    stage.status = 'running';

    try {
      const result = await this.executeWithRetry(stage);
      completed.add(stageId);
      running.delete(stageId);
      stage.status = 'completed';
      this.results.push(result);
      return result;
    } catch (error) {
      running.delete(stageId);
      stage.status = 'failed';
      throw error;
    }
  }

  /**
   * Wait for all dependencies to complete
   */
  private async waitForDependencies(dependencies: string[], completed: Set<string>): Promise<void> {
    for (const depId of dependencies) {
      while (!completed.has(depId)) {
        if (this.paused) {
          await this.waitWhilePaused();
        }
        // Small delay to avoid busy-waiting
        await this.delay(10);
      }
    }
  }

  /**
   * Wait while pipeline is paused
   */
  private async waitWhilePaused(): Promise<void> {
    while (this.paused) {
      await this.delay(50);
    }
  }

  /**
   * Execute stage with retry logic
   */
  private async executeWithRetry(stage: PipelineStage): Promise<unknown> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await stage.execute();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.retryAttempts) {
          stage.retries++;
          await this.delay(this.config.retryDelay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default PipelineOrchestrator;