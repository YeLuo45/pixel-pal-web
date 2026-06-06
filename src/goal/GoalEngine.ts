/**
 * Goal Engine
 * generic-agent-design Goal Engine - Define + Advance + GetProgress + Stats
 */

export interface Goal {
  id: string;
  name: string;
  target: number;
  progress: number;
  completed: boolean;
  created: number;
  updated: number;
  advances: number;
  history: number[];
  active: boolean;
}

export interface GoalStats {
  goals: number;
  completed: number;
  inProgress: number;
  avgProgress: number;
  totalAdvances: number;
  totalProgress: number;
  active: number;
  inactive: number;
}

export class GoalEngine {
  private goals: Map<string, Goal> = new Map();
  private counter = 0;

  define(name: string, target: number): string {
    const id = `goal-${++this.counter}`;
    this.goals.set(id, {
      id,
      name,
      target,
      progress: 0,
      completed: false,
      created: Date.now(),
      updated: Date.now(),
      advances: 0,
      history: [0],
      active: true,
    });
    return id;
  }

  advance(id: string, amount: number): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    if (g.completed) return false;
    if (!g.active) return false;
    g.progress = Math.min(g.target, g.progress + amount);
    g.advances++;
    g.history.push(g.progress);
    if (g.progress >= g.target) g.completed = true;
    g.updated = Date.now();
    return true;
  }

  getProgress(id: string): number {
    const g = this.goals.get(id);
    if (!g) return 0;
    if (g.target === 0) return 1;
    return Math.round((g.progress / g.target) * 100) / 100;
  }

  getStats(): GoalStats {
    const all = Array.from(this.goals.values());
    return {
      goals: all.length,
      completed: all.filter(g => g.completed).length,
      inProgress: all.filter(g => !g.completed).length,
      avgProgress: all.length > 0 ? Math.round((all.reduce((s, g) => s + this.getProgress(g.id), 0) / all.length) * 100) / 100 : 0,
      totalAdvances: all.reduce((s, g) => s + g.advances, 0),
      totalProgress: all.reduce((s, g) => s + g.progress, 0),
      active: all.filter(g => g.active).length,
      inactive: all.filter(g => !g.active).length,
    };
  }

  getGoal(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  getAllGoals(): Goal[] {
    return Array.from(this.goals.values());
  }

  removeGoal(id: string): boolean {
    return this.goals.delete(id);
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

  getTarget(id: string): number {
    return this.goals.get(id)?.target ?? 0;
  }

  getProgressValue(id: string): number {
    return this.goals.get(id)?.progress ?? 0;
  }

  getAdvances(id: string): number {
    return this.goals.get(id)?.advances ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.goals.get(id)?.history ?? [])];
  }

  isCompleted(id: string): boolean {
    return this.goals.get(id)?.completed ?? false;
  }

  isInProgress(id: string): boolean {
    return !this.isCompleted(id);
  }

  isActive(id: string): boolean {
    return this.goals.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.active = active;
    g.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.name = name;
    g.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: number): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.target = target;
    if (g.progress >= target) g.completed = true;
    g.updated = Date.now();
    return true;
  }

  resetProgress(id: string): boolean {
    const g = this.goals.get(id);
    if (!g) return false;
    g.progress = 0;
    g.completed = false;
    g.history = [0];
    g.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const g of this.goals.values()) {
      g.progress = 0;
      g.completed = false;
      g.advances = 0;
      g.history = [0];
      g.active = true;
    }
  }

  getByName(name: string): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.name === name);
  }

  getCompletedGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.completed);
  }

  getInProgressGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => !g.completed);
  }

  getActiveGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.active);
  }

  getInactiveGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => !g.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.goals.values()).map(g => g.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinProgress(min: number): Goal[] {
    return Array.from(this.goals.values()).filter(g => this.getProgress(g.id) >= min);
  }

  getMostProgress(): Goal | null {
    const all = Array.from(this.goals.values());
    if (all.length === 0) return null;
    return all.reduce((max, g) => g.progress > max.progress ? g : max);
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

  clearAll(): void {
    this.goals.clear();
    this.counter = 0;
  }
}

export default GoalEngine;