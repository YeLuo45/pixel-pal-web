/**
 * Workflow Tracker
 * chatdev-design Workflow Tracker - Define + Advance + GetProgress + Stats
 */

export interface Workflow {
  id: string;
  name: string;
  totalSteps: number;
  currentStep: number;
  completed: boolean;
  created: number;
  updated: number;
  advances: number;
  history: number[];
}

export interface WFStats {
  workflows: number;
  completed: number;
  inProgress: number;
  avgProgress: number;
  totalAdvances: number;
  totalSteps: number;
}

export class WorkflowTracker {
  private workflows: Map<string, Workflow> = new Map();
  private counter = 0;

  define(name: string, steps: number): string {
    const id = `wf-${++this.counter}`;
    this.workflows.set(id, {
      id,
      name,
      totalSteps: steps,
      currentStep: 0,
      completed: false,
      created: Date.now(),
      updated: Date.now(),
      advances: 0,
      history: [],
    });
    return id;
  }

  advance(id: string): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    if (w.completed) return false;
    if (w.currentStep >= w.totalSteps) return false;
    w.currentStep++;
    w.advances++;
    w.history.push(w.currentStep);
    if (w.currentStep >= w.totalSteps) {
      w.completed = true;
    }
    w.updated = Date.now();
    return true;
  }

  getProgress(id: string): number {
    const w = this.workflows.get(id);
    if (!w) return 0;
    if (w.totalSteps === 0) return 1;
    return Math.round((w.currentStep / w.totalSteps) * 100) / 100;
  }

  getStats(): WFStats {
    const all = Array.from(this.workflows.values());
    return {
      workflows: all.length,
      completed: all.filter(w => w.completed).length,
      inProgress: all.filter(w => !w.completed).length,
      avgProgress: all.length > 0 ? Math.round((all.reduce((s, w) => s + this.getProgress(w.id), 0) / all.length) * 100) / 100 : 0,
      totalAdvances: all.reduce((s, w) => s + w.advances, 0),
      totalSteps: all.reduce((s, w) => s + w.totalSteps, 0),
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

  getTotalSteps(id: string): number {
    return this.workflows.get(id)?.totalSteps ?? 0;
  }

  getCurrentStep(id: string): number {
    return this.workflows.get(id)?.currentStep ?? 0;
  }

  getAdvances(id: string): number {
    return this.workflows.get(id)?.advances ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.workflows.get(id)?.history ?? [])];
  }

  isCompleted(id: string): boolean {
    return this.workflows.get(id)?.completed ?? false;
  }

  isInProgress(id: string): boolean {
    return !this.isCompleted(id);
  }

  setName(id: string, name: string): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    w.name = name;
    w.updated = Date.now();
    return true;
  }

  setTotalSteps(id: string, steps: number): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    w.totalSteps = steps;
    w.updated = Date.now();
    return true;
  }

  reset(id: string): boolean {
    const w = this.workflows.get(id);
    if (!w) return false;
    w.currentStep = 0;
    w.completed = false;
    w.advances = 0;
    w.history = [];
    w.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const w of this.workflows.values()) {
      w.currentStep = 0;
      w.completed = false;
      w.advances = 0;
      w.history = [];
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

  getAllNames(): string[] {
    return [...new Set(Array.from(this.workflows.values()).map(w => w.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinSteps(min: number): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.totalSteps >= min);
  }

  getByMinProgress(min: number): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => this.getProgress(w.id) >= min);
  }

  getMostAdvanced(): Workflow | null {
    const all = Array.from(this.workflows.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.currentStep > max.currentStep ? w : max);
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

export default WorkflowTracker;