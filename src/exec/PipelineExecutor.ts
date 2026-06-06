/**
 * Pipeline Executor
 * thunderbolt-design Pipeline Executor - Define + Execute + Rollback + Stats
 */

export interface Pipeline {
  id: string;
  name: string;
  stages: string[];
  executed: number;
  rolledBack: number;
  status: 'idle' | 'running' | 'completed' | 'rolledback';
  created: number;
  updated: number;
  hits: number;
  currentStage: number;
  history: string[];
}

export interface PipelineStats {
  pipelines: number;
  executed: number;
  rolledBack: number;
  completed: number;
  idle: number;
  running: number;
  avgStages: number;
}

export class PipelineExecutor {
  private pipelines: Map<string, Pipeline> = new Map();
  private counter = 0;

  define(name: string, stages: string[]): string {
    const id = `pe-${++this.counter}`;
    this.pipelines.set(id, {
      id,
      name,
      stages: [...stages],
      executed: 0,
      rolledBack: 0,
      status: 'idle',
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      currentStage: 0,
      history: [],
    });
    return id;
  }

  execute(id: string): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    if (p.status === 'running' || p.status === 'completed') return false;
    p.status = 'running';
    p.currentStage = 0;
    p.history = [];
    for (const s of p.stages) {
      p.history.push(s);
      p.currentStage++;
    }
    p.status = 'completed';
    p.executed++;
    p.hits++;
    p.updated = Date.now();
    return true;
  }

  rollback(id: string): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    if (p.status === 'idle') return false;
    p.status = 'rolledback';
    p.rolledBack++;
    p.currentStage = 0;
    p.updated = Date.now();
    return true;
  }

  getStats(): PipelineStats {
    const all = Array.from(this.pipelines.values());
    return {
      pipelines: all.length,
      executed: all.reduce((s, p) => s + p.executed, 0),
      rolledBack: all.reduce((s, p) => s + p.rolledBack, 0),
      completed: all.filter(p => p.status === 'completed').length,
      idle: all.filter(p => p.status === 'idle').length,
      running: all.filter(p => p.status === 'running').length,
      avgStages: all.length > 0 ? Math.round((all.reduce((s, p) => s + p.stages.length, 0) / all.length) * 100) / 100 : 0,
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

  getStages(id: string): string[] {
    return [...(this.pipelines.get(id)?.stages ?? [])];
  }

  getStageCount(id: string): number {
    return this.getStages(id).length;
  }

  getStatus(id: string): string | undefined {
    return this.pipelines.get(id)?.status;
  }

  getExecuted(id: string): number {
    return this.pipelines.get(id)?.executed ?? 0;
  }

  getRolledBack(id: string): number {
    return this.pipelines.get(id)?.rolledBack ?? 0;
  }

  getCurrentStage(id: string): number {
    return this.pipelines.get(id)?.currentStage ?? 0;
  }

  getHistory(id: string): string[] {
    return [...(this.pipelines.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.pipelines.get(id)?.hits ?? 0;
  }

  isIdle(id: string): boolean {
    return this.pipelines.get(id)?.status === 'idle';
  }

  isRunning(id: string): boolean {
    return this.pipelines.get(id)?.status === 'running';
  }

  isCompleted(id: string): boolean {
    return this.pipelines.get(id)?.status === 'completed';
  }

  isRolledback(id: string): boolean {
    return this.pipelines.get(id)?.status === 'rolledback';
  }

  setName(id: string, name: string): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setStages(id: string, stages: string[]): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    p.stages = [...stages];
    p.updated = Date.now();
    return true;
  }

  reset(id: string): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    p.status = 'idle';
    p.currentStage = 0;
    p.history = [];
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.pipelines.values()) {
      p.executed = 0;
      p.rolledBack = 0;
      p.hits = 0;
      p.status = 'idle';
      p.currentStage = 0;
      p.history = [];
    }
  }

  getByName(name: string): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(p => p.name === name);
  }

  getByStatus(status: Pipeline['status']): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(p => p.status === status);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.pipelines.values()).map(p => p.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinStages(min: number): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(p => p.stages.length >= min);
  }

  getMostExecuted(): Pipeline | null {
    const all = Array.from(this.pipelines.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.executed > max.executed ? p : max);
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

  clearAll(): void {
    this.pipelines.clear();
    this.counter = 0;
  }
}

export default PipelineExecutor;