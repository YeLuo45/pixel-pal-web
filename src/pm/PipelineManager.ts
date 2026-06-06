/**
 * Pipeline Manager
 * thunderbolt-design Pipeline Manager - Create + RunStep + Stats
 */

export type PipelineStatus = 'pending' | 'running' | 'success' | 'failed';

export interface Pipeline {
  id: string;
  name: string;
  steps: string[];
  currentStep: number;
  status: PipelineStatus;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: PipelineStatus[];
}

export interface PMStats {
  pipelines: number;
  success: number;
  failed: number;
  pending: number;
  running: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgSteps: number;
  totalSteps: number;
  successRate: number;
}

export class PipelineManager {
  private pipelines: Map<string, Pipeline> = new Map();
  private counter = 0;

  create(name: string, steps: string[]): string {
    const id = `pm-${++this.counter}`;
    this.pipelines.set(id, {
      id,
      name,
      steps: [...steps],
      currentStep: 0,
      status: 'pending',
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: ['pending'],
    });
    return id;
  }

  runStep(id: string, success: boolean = true): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.status = 'running';
    if (success) {
      if (p.currentStep >= p.steps.length - 1) {
        p.status = 'success';
      } else {
        p.currentStep++;
      }
    } else {
      p.status = 'failed';
    }
    p.history.push(p.status);
    p.updated = Date.now();
    p.hits++;
    return true;
  }

  reset(id: string): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    p.status = 'pending';
    p.currentStep = 0;
    p.history = ['pending'];
    p.updated = Date.now();
    return true;
  }

  getCurrentStep(id: string): string {
    const p = this.pipelines.get(id);
    if (!p) return '';
    if (p.status === 'success') return 'done';
    if (p.status === 'failed') return 'failed';
    return p.steps[p.currentStep] ?? '';
  }

  getStats(): PMStats {
    const all = Array.from(this.pipelines.values());
    const finished = all.filter(p => p.status === 'success' || p.status === 'failed');
    return {
      pipelines: all.length,
      success: all.filter(p => p.status === 'success').length,
      failed: all.filter(p => p.status === 'failed').length,
      pending: all.filter(p => p.status === 'pending').length,
      running: all.filter(p => p.status === 'running').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      avgSteps: all.length > 0 ? Math.round((all.reduce((s, p) => s + p.steps.length, 0) / all.length) * 100) / 100 : 0,
      totalSteps: all.reduce((s, p) => s + p.steps.length, 0),
      successRate: finished.length > 0 ? Math.round((all.filter(p => p.status === 'success').length / finished.length) * 100) / 100 : 0,
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

  getSteps(id: string): string[] {
    return [...(this.pipelines.get(id)?.steps ?? [])];
  }

  getStepCount(id: string): number {
    return this.pipelines.get(id)?.steps.length ?? 0;
  }

  getCurrentStepIndex(id: string): number {
    return this.pipelines.get(id)?.currentStep ?? 0;
  }

  getStatus(id: string): PipelineStatus | undefined {
    return this.pipelines.get(id)?.status;
  }

  getHistory(id: string): PipelineStatus[] {
    return [...(this.pipelines.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.pipelines.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.pipelines.get(id)?.active ?? false;
  }

  isSuccess(id: string): boolean {
    return this.pipelines.get(id)?.status === 'success';
  }

  isFailed(id: string): boolean {
    return this.pipelines.get(id)?.status === 'failed';
  }

  isPending(id: string): boolean {
    return this.pipelines.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.pipelines.get(id)?.status === 'running';
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setSteps(id: string, steps: string[]): boolean {
    const p = this.pipelines.get(id);
    if (!p) return false;
    p.steps = [...steps];
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.pipelines.values()) {
      p.status = 'pending';
      p.currentStep = 0;
      p.hits = 0;
      p.history = ['pending'];
      p.active = true;
    }
  }

  getByName(name: string): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(p => p.name === name);
  }

  getByStatus(status: PipelineStatus): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(p => p.status === status);
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

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinSteps(min: number): Pipeline[] {
    return Array.from(this.pipelines.values()).filter(p => p.steps.length >= min);
  }

  getMostSteps(): Pipeline | null {
    const all = Array.from(this.pipelines.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.steps.length > max.steps.length ? p : max);
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

export default PipelineManager;