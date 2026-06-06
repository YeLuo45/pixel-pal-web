/**
 * Workflow Engine
 * chatdev-design Workflow Engine - Define + Advance + Stats
 */

export interface Workflow {
  id: string;
  name: string;
  stages: string[];
  currentStage: number;
  completed: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface WFStats {
  workflows: number;
  completed: number;
  inProgress: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgStages: number;
  maxStages: number;
  minStages: number;
  totalStages: number;
  completionRate: number;
}

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private counter = 0;

  define(name: string, stages: string[]): string {
    const id = `wf-${++this.counter}`;
    this.workflows.set(id, {
      id,
      name,
      stages: [...stages],
      currentStage: 0,
      completed: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [0],
    });
    return id;
  }

  advance(id: string): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    if (!w.active) return false;
    if (w.completed) return false;
    if (w.currentStage >= w.stages.length - 1) {
      w.completed = true;
    } else {
      w.currentStage++;
    }
    w.history.push(w.currentStage);
    w.updated = Date.now();
    w.hits++;
    return true;
  }

  reset(id: string): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    w.currentStage = 0;
    w.completed = false;
    w.history = [0];
    w.updated = Date.now();
    return true;
  }

  getCurrentStage(id: string): string {
    const w = this.workflows.get(id);
    if (!w) return '';
    if (w.completed) return 'done';
    return w.stages[w.currentStage] ?? '';
  }

  getStats(): WFStats {
    const all = Array.from(this.workflows.values());
    const stageCounts = all.map(w => w.stages.length);
    return {
      workflows: all.length,
      completed: all.filter(w => w.completed).length,
      inProgress: all.filter(w => !w.completed).length,
      active: all.filter(w => w.active).length,
      inactive: all.filter(w => !w.active).length,
      totalHits: all.reduce((s, w) => s + w.hits, 0),
      uniqueNames: new Set(all.map(w => w.name)).size,
      avgStages: all.length > 0 ? Math.round((stageCounts.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxStages: stageCounts.length > 0 ? Math.max(...stageCounts) : 0,
      minStages: stageCounts.length > 0 ? Math.min(...stageCounts) : 0,
      totalStages: stageCounts.reduce((s, v) => s + v, 0),
      completionRate: all.length > 0 ? Math.round((all.filter(w => w.completed).length / all.length) * 100) / 100 : 0,
    };
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  removeWorkflow(id: string): boolean {
    return this.workflows.delete(id);
  }

  hasWorkflow(id: string): boolean {
    return this.workflows.has(id);
  }

  getCount(): number {
    return this.workflows.size;
  }

  getName(id: string): string | undefined {
    return this.workflows.get(id)?.name;
  }

  getStages(id: string): string[] {
    return [...(this.workflows.get(id)?.stages ?? [])];
  }

  getStageCount(id: string): number {
    return this.workflows.get(id)?.stages.length ?? 0;
  }

  getCurrentStageIndex(id: string): number {
    return this.workflows.get(id)?.currentStage ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.workflows.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.workflows.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.workflows.get(id)?.active ?? false;
  }

  isCompleted(id: string): boolean {
    return this.workflows.get(id)?.completed ?? false;
  }

  isInProgress(id: string): boolean {
    const w = this.workflows.get(id);
    return w ? !w.completed : false;
  }

  setActive(id: string, active: boolean): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    w.active = active;
    w.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    w.name = name;
    w.updated = Date.now();
    return true;
  }

  setStages(id: string, stages: string[]): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    w.stages = [...stages];
    w.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const w of this.workflows.values()) {
      w.currentStage = 0;
      w.completed = false;
      w.hits = 0;
      w.history = [0];
      w.active = true;
    }
  }

  getByName(name: string): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.name === name);
  }

  getCompletedWorkflows(): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.completed);
  }

  getInProgressWorkflows(): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => !w.completed);
  }

  getActiveWorkflows(): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.active);
  }

  getInactiveWorkflows(): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => !w.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.workflows.values()).map(w => w.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinStages(min: number): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.stages.length >= min);
  }

  getMostStages(): Workflow | null {
    const all = Array.from(this.workflows.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.stages.length > max.stages.length ? w : max);
  }

  getNewest(): Workflow | null {
    const all = Array.from(this.workflows.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.created > max.created ? w : max);
  }

  getOldest(): Workflow | null {
    const all = Array.from(this.workflows.values());
    if (all.length === 0) return null;
    return all.reduce((min, w) => w.created < min.created ? w : min);
  }

  getCreatedAt(id: string): number {
    return this.workflows.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.workflows.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.workflows.clear();
    this.counter = 0;
  }
}

export default WorkflowEngine;