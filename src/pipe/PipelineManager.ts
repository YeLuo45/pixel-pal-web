/**
 * Pipeline Manager
 * thunderbolt-design Pipeline Manager - Create + AddStage + Run + Stats
 */

export type StageStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface PipelineStage {
  id: string;
  name: string;
  action: () => Promise<boolean>;
  status: StageStatus;
  startedAt?: number;
  completedAt?: number;
  result?: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  created: number;
  updated: number;
}

export interface PipelineStats {
  pipelines: number;
  stages: number;
  completed: number;
  failed: number;
}

export class PipelineManager {
  private pipelines: Map<string, Pipeline> = new Map();
  private stageCounter = 0;
  private pipelineCounter = 0;

  createPipeline(name: string): string {
    const id = `pipe-${++this.pipelineCounter}`;
    const now = Date.now();
    this.pipelines.set(id, {
      id,
      name,
      stages: [],
      created: now,
      updated: now,
    });
    return id;
  }

  addStage(pipelineId: string, name: string, action: () => Promise<boolean>): string | null {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return null;
    const id = `stage-${++this.stageCounter}`;
    pipeline.stages.push({ id, name, action, status: 'pending' });
    pipeline.updated = Date.now();
    return id;
  }

  async runPipeline(pipelineId: string): Promise<boolean> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return false;
    for (const stage of pipeline.stages) {
      stage.status = 'running';
      stage.startedAt = Date.now();
      try {
        const result = await stage.action();
        stage.result = result;
        stage.status = result ? 'completed' : 'failed';
      } catch {
        stage.status = 'failed';
      }
      stage.completedAt = Date.now();
      if (stage.status === 'failed') return false;
    }
    return true;
  }

  getStats(): PipelineStats {
    let stages = 0;
    let completed = 0;
    let failed = 0;
    for (const pipeline of this.pipelines.values()) {
      stages += pipeline.stages.length;
      completed += pipeline.stages.filter(s => s.status === 'completed').length;
      failed += pipeline.stages.filter(s => s.status === 'failed').length;
    }
    return {
      pipelines: this.pipelines.size,
      stages,
      completed,
      failed,
    };
  }

  getPipeline(id: string): Pipeline | undefined {
    return this.pipelines.get(id);
  }

  getAllPipelines(): Pipeline[] {
    return Array.from(this.pipelines.values());
  }

  removePipeline(id: string): boolean {
    return this.pipelines.delete(id);
  }

  hasPipeline(id: string): boolean {
    return this.pipelines.has(id);
  }

  getCount(): number {
    return this.pipelines.size;
  }

  getName(id: string): string | undefined {
    return this.pipelines.get(id)?.name;
  }

  getStages(pipelineId: string): PipelineStage[] {
    return [...(this.pipelines.get(pipelineId)?.stages ?? [])];
  }

  getStageCount(pipelineId: string): number {
    return this.pipelines.get(pipelineId)?.stages.length ?? 0;
  }

  getStage(pipelineId: string, stageId: string): PipelineStage | undefined {
    return this.pipelines.get(pipelineId)?.stages.find(s => s.id === stageId);
  }

  removeStage(pipelineId: string, stageId: string): boolean {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return false;
    const idx = pipeline.stages.findIndex(s => s.id === stageId);
    if (idx === -1) return false;
    pipeline.stages.splice(idx, 1);
    return true;
  }

  getStageStatus(pipelineId: string, stageId: string): StageStatus | undefined {
    return this.getStage(pipelineId, stageId)?.status;
  }

  isStagePending(pipelineId: string, stageId: string): boolean {
    return this.getStageStatus(pipelineId, stageId) === 'pending';
  }

  isStageRunning(pipelineId: string, stageId: string): boolean {
    return this.getStageStatus(pipelineId, stageId) === 'running';
  }

  isStageCompleted(pipelineId: string, stageId: string): boolean {
    return this.getStageStatus(pipelineId, stageId) === 'completed';
  }

  isStageFailed(pipelineId: string, stageId: string): boolean {
    return this.getStageStatus(pipelineId, stageId) === 'failed';
  }

  resetStage(pipelineId: string, stageId: string): boolean {
    const stage = this.getStage(pipelineId, stageId);
    if (!stage) return false;
    stage.status = 'pending';
    stage.startedAt = undefined;
    stage.completedAt = undefined;
    stage.result = undefined;
    return true;
  }

  resetPipeline(pipelineId: string): boolean {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return false;
    for (const stage of pipeline.stages) {
      stage.status = 'pending';
      stage.startedAt = undefined;
      stage.completedAt = undefined;
      stage.result = undefined;
    }
    return true;
  }

  getCompletedStages(pipelineId: string): PipelineStage[] {
    return (this.pipelines.get(pipelineId)?.stages ?? []).filter(s => s.status === 'completed');
  }

  getFailedStages(pipelineId: string): PipelineStage[] {
    return (this.pipelines.get(pipelineId)?.stages ?? []).filter(s => s.status === 'failed');
  }

  getCreatedAt(id: string): number {
    return this.pipelines.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.pipelines.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.pipelines.clear();
    this.pipelineCounter = 0;
    this.stageCounter = 0;
  }
}

export default PipelineManager;