/**
 * Pipeline Engine
 * thunderbolt-design Pipeline Engine - Add + Start + Complete + Stats
 */

export type PipelineStage = 'pending' | 'running' | 'completed' | 'failed';

export interface PipelineStep {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  stage: PipelineStage;
  duration: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Pipeline {
  id: string;
  name: string;
  steps: PipelineStep[];
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PpeStats {
  pipelines: number;
  totalStarted: number;
  totalCompleted: number;
  totalFailed: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalSteps: number;
  avgSteps: number;
  maxSteps: number;
  minSteps: number;
  pendingSteps: number;
  runningSteps: number;
  completedSteps: number;
  failedSteps: number;
  totalDuration: number;
  uniqueNames: number;
}

export class PipelineEngine {
  private pipelines: Map<string, Pipeline> = new Map();
  private counter = 0;
  private totalStarted = 0;
  private totalCompleted = 0;
  private totalFailed = 0;

  create(name: string): string {
    const id = `ppe-${++this.counter}`;
    this.pipelines.set(id, {
      id,
      name,
      steps: [],
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  addStep(id: string, name: string, duration: number = 0): string | null {
    const p = this.pipelines.get(id);
    if (!p) return null;
    if (!p.active) return null;
    const stepId = `${id}-s-${p.steps.length + 1}`;
    p.steps.push({
      id: stepId,
      pipelineId: id,
      name,
      order: p.steps.length,
      stage: 'pending',
      duration,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    p.updated = Date.now();
    return stepId;
  }

  start(pipelineId: string, stepId: string): boolean {
    const p = this.pipelines.get(pipelineId);
    if (!p) return false;
    const s = p.steps.find(x => x.id === stepId);
    if (!s) return false;
    s.stage = 'running';
    s.updated = Date.now();
    s.hits++;
    p.hits++;
    this.totalStarted++;
    return true;
  }

  completeStep(pipelineId: string, stepId: string): boolean {
    const p = this.pipelines.get(pipelineId);
    if (!p) return false;
    const s = p.steps.find(x => x.id === stepId);
    if (!s) return false;
    s.stage = 'completed';
    s.updated = Date.now();
    s.hits++;
    p.hits++;
    this.totalCompleted++;
    return true;
  }

  failStep(pipelineId: string, stepId: string): boolean {
    const p = this.pipelines.get(pipelineId);
    if (!p) return false;
    const s = p.steps.find(x => x.id === stepId);
    if (!s) return false;
    s.stage = 'failed';
    s.updated = Date.now();
    s.hits++;
    p.hits++;
    this.totalFailed++;
    return true;
  }

  complete(pipelineId: string): boolean {
    const p = this.pipelines.get(pipelineId);
    if (!p) return false;
    p.updated = Date.now();
    p.hits++;
    return true;
  }

  remove(pipelineId: string): boolean {
    return this.pipelines.delete(pipelineId);
  }

  setActive(pipelineId: string, active: boolean): boolean {
    const p = this.pipelines.get(pipelineId);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.pipelines.values()) {
      for (const s of p.steps) {
        s.stage = 'pending';
        s.hits = 0;
      }
      p.hits = 0;
      p.active = true;
    }
    this.totalStarted = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }

  getStats(): PpeStats {
    const all = Array.from(this.pipelines.values());
    const stepCounts = all.map(p => p.steps.length);
    const allSteps = all.flatMap(p => p.steps);
    return {
      pipelines: all.length,
      totalStarted: this.totalStarted,
      totalCompleted: this.totalCompleted,
      totalFailed: this.totalFailed,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      totalSteps: allSteps.length,
      avgSteps: all.length > 0 ? Math.round((stepCounts.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSteps: stepCounts.length > 0 ? Math.max(...stepCounts) : 0,
      minSteps: stepCounts.length > 0 ? Math.min(...stepCounts) : 0,
      pendingSteps: allSteps.filter(s => s.stage === 'pending').length,
      runningSteps: allSteps.filter(s => s.stage === 'running').length,
      completedSteps: allSteps.filter(s => s.stage === 'completed').length,
      failedSteps: allSteps.filter(s => s.stage === 'failed').length,
      totalDuration: allSteps.reduce((s, x) => s + x.duration, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
    };
  }

  getPipeline(id: string): Pipeline | undefined {
    return this.pipelines.get(id);
  }

  getAllPipelines(): Pipeline[] {
    return Array.from(this.pipelines.values());
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

  getSteps(id: string): PipelineStep[] {
    return [...(this.pipelines.get(id)?.steps ?? [])];
  }

  getStepCount(id: string): number {
    return this.pipelines.get(id)?.steps.length ?? 0;
  }

  getHits(id: string): number {
    return this.pipelines.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.pipelines.get(id)?.active ?? false;
  }

  getActivePipelines(): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(p => p.active);
  }

  getInactivePipelines(): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.pipelines.values()).map(p => p.name))];
  }

  getNewest(): Pipeline | null {
    const all = Array.from(this.pipelines.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Pipeline | null {
    const all = Array.from(this.pipelines.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.pipelines.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.pipelines.get(id)?.updated ?? 0;
  }

  getTotalStarted(): number {
    return this.totalStarted;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.pipelines.clear();
    this.counter = 0;
    this.totalStarted = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }
}

export default PipelineEngine;