/**
 * Goal Engine
 * generic-agent-design Goal Engine - Define + Decompose + Achieve + Stats
 */

export type GoalStatus = 'pending' | 'active' | 'completed';

export interface Goal {
  id: string;
  name: string;
  subgoals: string[];
  status: GoalStatus;
  priority: number;
  parent: string | null;
  created: number;
  updated: number;
}

export interface GoalStats {
  goals: number;
  completed: number;
  active: number;
  pending: number;
  avgPriority: number;
}

export class GoalEngine {
  private goals: Map<string, Goal> = new Map();
  private counter = 0;

  define(name: string, priority: number = 0): string {
    const id = `goal-${++this.counter}`;
    this.goals.set(id, {
      id,
      name,
      subgoals: [],
      status: 'pending',
      priority,
      parent: null,
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  decompose(parent: string, names: string[]): boolean {
    const parentGoal = this.goals.get(parent);
    if (!parentGoal) return false;
    for (const name of names) {
      const id = `goal-${++this.counter}`;
      this.goals.set(id, {
        id,
        name,
        subgoals: [],
        status: 'pending',
        priority: parentGoal.priority,
        parent,
        created: Date.now(),
        updated: Date.now(),
      });
      parentGoal.subgoals.push(id);
    }
    return true;
  }

  achieve(goalId: string): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;
    // Check all subgoals are completed
    for (const subId of goal.subgoals) {
      const sub = this.goals.get(subId);
      if (!sub || sub.status !== 'completed') return false;
    }
    goal.status = 'completed';
    goal.updated = Date.now();
    return true;
  }

  getActiveGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === 'active');
  }

  getStats(): GoalStats {
    const all = Array.from(this.goals.values());
    return {
      goals: all.length,
      completed: all.filter(g => g.status === 'completed').length,
      active: all.filter(g => g.status === 'active').length,
      pending: all.filter(g => g.status === 'pending').length,
      avgPriority: all.length > 0 ? Math.round((all.reduce((sum, g) => sum + g.priority, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getGoal(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  getAllGoals(): Goal[] {
    return Array.from(this.goals.values());
  }

  removeGoal(id: string): boolean {
    const goal = this.goals.get(id);
    if (!goal) return false;
    if (goal.parent) {
      const parent = this.goals.get(goal.parent);
      if (parent) parent.subgoals = parent.subgoals.filter(s => s !== id);
    }
    for (const subId of goal.subgoals) {
      this.goals.delete(subId);
    }
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

  getStatus(id: string): GoalStatus | undefined {
    return this.goals.get(id)?.status;
  }

  getPriority(id: string): number {
    return this.goals.get(id)?.priority ?? 0;
  }

  setPriority(id: string, priority: number): boolean {
    const goal = this.goals.get(id);
    if (!goal) return false;
    goal.priority = priority;
    goal.updated = Date.now();
    return true;
  }

  activate(id: string): boolean {
    const goal = this.goals.get(id);
    if (!goal) return false;
    goal.status = 'active';
    goal.updated = Date.now();
    return true;
  }

  isActive(id: string): boolean {
    return this.goals.get(id)?.status === 'active';
  }

  isCompleted(id: string): boolean {
    return this.goals.get(id)?.status === 'completed';
  }

  isPending(id: string): boolean {
    return this.goals.get(id)?.status === 'pending';
  }

  getSubgoals(id: string): string[] {
    return [...(this.goals.get(id)?.subgoals ?? [])];
  }

  getSubgoalCount(id: string): number {
    return this.goals.get(id)?.subgoals.length ?? 0;
  }

  getParent(id: string): string | null {
    return this.goals.get(id)?.parent ?? null;
  }

  hasParent(id: string): boolean {
    return this.goals.get(id)?.parent !== null;
  }

  getByStatus(status: GoalStatus): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === status);
  }

  getCompletedGoals(): Goal[] {
    return this.getByStatus('completed');
  }

  getPendingGoals(): Goal[] {
    return this.getByStatus('pending');
  }

  getRoots(): Goal[] {
    return Array.from(this.goals.values()).filter(g => !g.parent);
  }

  getRootsCount(): number {
    return this.getRoots().length;
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