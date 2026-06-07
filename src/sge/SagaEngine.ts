/**
 * Saga Engine
 * thunderbolt-design Saga Engine - Define + Run + Compensate + Stats
 */

export type SagaStatus = 'pending' | 'running' | 'completed' | 'failed' | 'compensated';

export interface SagaStep {
  id: string;
  name: string;
  action: string;
  compensation: string;
  status: SagaStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SgeStats {
  steps: number;
  totalDefined: number;
  totalRun: number;
  totalCompensated: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  compensated: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueActions: number;
  uniqueCompensations: number;
}

export class SagaEngine {
  private steps: Map<string, SagaStep> = new Map();
  private counter = 0;
  private totalDefined = 0;
  private totalRun = 0;
  private totalCompensated = 0;

  define(name: string, action: string, compensation: string): string {
    const id = `sge-${++this.counter}`;
    this.steps.set(id, {
      id,
      name,
      action,
      compensation,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalDefined++;
    return id;
  }

  run(id: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.status !== 'pending') return false;
    s.status = 'running';
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  complete(id: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    if (s.status !== 'running') return false;
    s.status = 'completed';
    s.updated = Date.now();
    s.hits++;
    this.totalRun++;
    return true;
  }

  fail(id: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    if (s.status !== 'running') return false;
    s.status = 'failed';
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  compensate(id: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    if (s.status !== 'failed') return false;
    s.status = 'compensated';
    s.updated = Date.now();
    s.hits++;
    this.totalCompensated++;
    return true;
  }

  remove(id: string): boolean {
    return this.steps.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setAction(id: string, action: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.action = action;
    s.updated = Date.now();
    return true;
  }

  setCompensation(id: string, compensation: string): boolean {
    const s = this.steps.get(id);
    if (!s) return false;
    s.compensation = compensation;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.steps.values()) {
      s.status = 'pending';
      s.active = true;
      s.hits = 0;
    }
    this.totalDefined = 0;
    this.totalRun = 0;
    this.totalCompensated = 0;
  }

  getStats(): SgeStats {
    const all = Array.from(this.steps.values());
    return {
      steps: all.length,
      totalDefined: this.totalDefined,
      totalRun: this.totalRun,
      totalCompensated: this.totalCompensated,
      pending: all.filter(s => s.status === 'pending').length,
      running: all.filter(s => s.status === 'running').length,
      completed: all.filter(s => s.status === 'completed').length,
      failed: all.filter(s => s.status === 'failed').length,
      compensated: all.filter(s => s.status === 'compensated').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      uniqueActions: new Set(all.map(s => s.action)).size,
      uniqueCompensations: new Set(all.map(s => s.compensation)).size,
    };
  }

  getStep(id: string): SagaStep | undefined {
    return this.steps.get(id);
  }

  getAllSteps(): SagaStep[] {
    return Array.from(this.steps.values());
  }

  hasStep(id: string): boolean {
    return this.steps.has(id);
  }

  getCount(): number {
    return this.steps.size;
  }

  getName(id: string): string | undefined {
    return this.steps.get(id)?.name;
  }

  getAction(id: string): string | undefined {
    return this.steps.get(id)?.action;
  }

  getCompensation(id: string): string | undefined {
    return this.steps.get(id)?.compensation;
  }

  getStatus(id: string): SagaStatus | undefined {
    return this.steps.get(id)?.status;
  }

  getHits(id: string): number {
    return this.steps.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.steps.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.steps.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.steps.get(id)?.status === 'running';
  }

  isCompleted(id: string): boolean {
    return this.steps.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.steps.get(id)?.status === 'failed';
  }

  isCompensated(id: string): boolean {
    return this.steps.get(id)?.status === 'compensated';
  }

  getByStatus(status: SagaStatus): SagaStep[] {
    return Array.from(this.steps.values()).filter(s => s.status === status);
  }

  getActiveSteps(): SagaStep[] {
    return Array.from(this.steps.values()).filter(s => s.active);
  }

  getInactiveSteps(): SagaStep[] {
    return Array.from(this.steps.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.steps.values()).map(s => s.name))];
  }

  getAllActions(): string[] {
    return [...new Set(Array.from(this.steps.values()).map(s => s.action))];
  }

  getAllCompensations(): string[] {
    return [...new Set(Array.from(this.steps.values()).map(s => s.compensation))];
  }

  getNewest(): SagaStep | null {
    const all = Array.from(this.steps.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): SagaStep | null {
    const all = Array.from(this.steps.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.steps.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.steps.get(id)?.updated ?? 0;
  }

  getTotalDefined(): number {
    return this.totalDefined;
  }

  getTotalRun(): number {
    return this.totalRun;
  }

  getTotalCompensated(): number {
    return this.totalCompensated;
  }

  clearAll(): void {
    this.steps.clear();
    this.counter = 0;
    this.totalDefined = 0;
    this.totalRun = 0;
    this.totalCompensated = 0;
  }
}

export default SagaEngine;