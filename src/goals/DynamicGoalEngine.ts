/**
 * Dynamic Goal Engine
 * generic-agent-design Dynamic Goal Engine - Decomposition + Priority + Adjustment + Tracking
 */

export interface Goal {
  id: string;
  title: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed';
  subgoals: Goal[];
  progress: number;
}

export class DynamicGoalEngine {
  private goals: Map<string, Goal> = new Map();

  addGoal(goal: Goal): void {
    const newGoal = { ...goal, subgoals: [...(goal.subgoals ?? [])] };
    this.goals.set(newGoal.id, newGoal);

    // Register subgoals
    for (const sg of newGoal.subgoals) {
      this.addGoal(sg);
    }
  }

  decomposeGoal(goalId: string): Goal[] {
    const goal = this.goals.get(goalId);
    return goal ? [...goal.subgoals] : [];
  }

  prioritize(): Goal[] {
    return Array.from(this.goals.values()).sort((a, b) => b.priority - a.priority);
  }

  adjustPriority(goalId: string, newPriority: number): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;
    goal.priority = newPriority;
    return true;
  }

  getProgress(goalId: string): number {
    const goal = this.goals.get(goalId);
    if (!goal) return 0;
    if (goal.subgoals.length === 0) {
      return goal.status === 'completed' ? 100 : goal.progress;
    }
    const total = goal.subgoals.reduce((sum, sg) => sum + this.getProgress(sg.id), 0);
    return Math.round(total / goal.subgoals.length);
  }

  getGoal(goalId: string): Goal | undefined {
    return this.goals.get(goalId);
  }

  getAllGoals(): Goal[] {
    return Array.from(this.goals.values());
  }

  removeGoal(goalId: string): boolean {
    return this.goals.delete(goalId);
  }

  setStatus(goalId: string, status: Goal['status']): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;
    goal.status = status;
    if (status === 'completed') goal.progress = 100;
    return true;
  }

  setProgress(goalId: string, progress: number): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;
    goal.progress = Math.max(0, Math.min(100, progress));
    if (goal.progress === 100) goal.status = 'completed';
    else if (goal.progress === 0) goal.status = 'pending';
    else goal.status = 'in_progress';
    return true;
  }

  getPendingGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === 'pending');
  }

  getInProgressGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === 'in_progress');
  }

  getCompletedGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === 'completed');
  }

  getGoalCount(): number {
    return this.goals.size;
  }

  clearAll(): void {
    this.goals.clear();
  }

  hasGoal(goalId: string): boolean {
    return this.goals.has(goalId);
  }

  getAveragePriority(): number {
    if (this.goals.size === 0) return 0;
    const sum = Array.from(this.goals.values()).reduce((acc, g) => acc + g.priority, 0);
    return Math.round(sum / this.goals.size * 100) / 100;
  }
}

export default DynamicGoalEngine;