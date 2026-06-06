/**
 * Goal Engine
 * generic-agent-design Goal Engine - Set + Update + Complete + Fail + Stats
 */

export type GoalStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused';

export interface Goal {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: GoalStatus;
  priority: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface GolStats {
  goals: number;
  totalCompleted: number;
  totalFailed: number;
  totalPaused: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueStatuses: number;
  avgProgress: number;
  maxProgress: number;
  minProgress: number;
  avgPriority: number;
  maxPriority: number;
  minPriority: number;
}

export class GoalEngine {
  private goals: Map<string, Goal> = new Map();
  private counter = 0;
  private totalCompleted = 0;
  private totalFailed = 0;
  private totalPaused = 0;

  set(name: string, description: string = '', priority: number = 1): string {
    const id = `gol-${++this.counter}`;
    this.goals.set(id, {
      id,
      name,
      description,
      progress: 0,
      status: 'pending',
      priority,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  update(id: string, progress: number): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    if (!g.active) return false;
    if (g.status === 'completed' || g.status === 'failed') return false;
    g.progress = Math.max(0, Math.min(100, progress));
    g.status = g.progress >= 100 ? 'completed' : 'in-progress';
    g.updated = Date.now();
    g.hits++;
    if (g.progress >= 100) this.totalCompleted++;
    return true;
  }

  complete(id: string): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.progress = 100;
    g.status = 'completed';
    g.updated = Date.now();
    g.hits++;
    this.totalCompleted++;
    return true;
  }

  fail(id: string): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.status = 'failed';
    g.updated = Date.now();
    g.hits++;
    this.totalFailed++;
    return true;
  }

  pause(id: string): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.status = 'paused';
    g.updated = Date.now();
    g.hits++;
    this.totalPaused++;
    return true;
  }

  resume(id: string): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    if (g.status !== 'paused') return false;
    g.status = 'in-progress';
    g.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.goals.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.active = active;
    g.updated = Date.now();
    return true;
  }

  setPriority(id: string, priority: number): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.priority = priority;
    g.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const g of this.goals.values()) {
      g.progress = 0;
      g.status = 'pending';
      g.active = true;
      g.hits = 0;
      g.history = [];
    }
    this.totalCompleted = 0;
    this.totalFailed = 0;
    this.totalPaused = 0;
  }

  getStats(): GolStats {
    const all = Array.from(this.goals.values());
    const progressValues = all.map(g => g.progress);
    const priorityValues = all.map(g => g.priority);
    return {
      goals: all.length,
      totalCompleted: this.totalCompleted,
      totalFailed: this.totalFailed,
      totalPaused: this.totalPaused,
      active: all.filter(g => g.active).length,
      inactive: all.filter(g => !g.active).length,
      totalHits: all.reduce((s, g) => s + g.hits, 0),
      uniqueNames: new Set(all.map(g => g.name)).size,
      uniqueStatuses: new Set(all.map(g => g.status)).size,
      avgProgress: all.length > 0 ? Math.round((progressValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxProgress: progressValues.length > 0 ? Math.max(...progressValues) : 0,
      minProgress: progressValues.length > 0 ? Math.min(...progressValues) : 0,
      avgPriority: all.length > 0 ? Math.round((priorityValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPriority: priorityValues.length > 0 ? Math.max(...priorityValues) : 0,
      minPriority: priorityValues.length > 0 ? Math.min(...priorityValues) : 0,
    };
  }

  getGoal(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  getAllGoals(): Goal[] {
    return Array.from(this.goals.values());
  }

  hasGoal(id: string): boolean {
    return this.goals.has(id);
  }

  getCount(): number {
    return this.goals.size;
  }

  getName(id: string): string | undefined {
    return this.goals.get(id)?.name;
  }

  getDescription(id: string): string | undefined {
    return this.goals.get(id)?.description;
  }

  getProgress(id: string): number {
    return this.goals.get(id)?.progress ?? 0;
  }

  getStatus(id: string): GoalStatus | undefined {
    return this.goals.get(id)?.status;
  }

  getPriority(id: string): number {
    return this.goals.get(id)?.priority ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.goals.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.goals.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.goals.get(id)?.active ?? false;
  }

  isCompleted(id: string): boolean {
    return this.goals.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.goals.get(id)?.status === 'failed';
  }

  setName(id: string, name: string): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.name = name;
    g.updated = Date.now();
    return true;
  }

  setDescription(id: string, description: string): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.description = description;
    g.updated = Date.now();
    return true;
  }

  getByName(name: string): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.name === name);
  }

  getByStatus(status: GoalStatus): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === status);
  }

  getActiveGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.active);
  }

  getInactiveGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => !g.active);
  }

  getCompletedGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === 'completed');
  }

  getFailedGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === 'failed');
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.goals.values()).map(g => g.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinPriority(min: number): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.priority >= min);
  }

  getByMinProgress(min: number): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.progress >= min);
  }

  getNewest(): Goal | null {
    const all = Array.from(this.goals.values());
    if (all.length === 0) return null;
    return all.reduce((max, g) => g.created > max.created ? g : max);
  }

  getOldest(): Goal | null {
    const all = Array.from(this.goals.values());
    if (all.length === 0) return null;
    return all.reduce((min, g) => g.created < min.created ? g : min);
  }

  getCreatedAt(id: string): number {
    return this.goals.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.goals.get(id)?.updated ?? 0;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  getTotalPaused(): number {
    return this.totalPaused;
  }

  clearAll(): void {
    this.goals.clear();
    this.counter = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
    this.totalPaused = 0;
  }
}

export default GoalEngine;