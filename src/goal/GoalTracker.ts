/**
 * Goal Tracker
 * generic-agent-design Goal Tracker - Define + Progress + Evaluate + Adjust
 */

export type GoalStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface Milestone {
  id: string;
  name: string;
  target: number;
  reached: boolean;
}

export interface Goal {
  id: string;
  name: string;
  progress: number;
  status: GoalStatus;
  milestones: Milestone[];
  created: number;
  updated: number;
}

export interface GoalProgressInfo {
  progress: number;
  status: GoalStatus;
  completedMilestones: number;
  totalMilestones: number;
}

export class GoalTracker {
  private goals: Map<string, Goal> = new Map();
  private counter = 0;

  defineGoal(name: string, milestoneNames: string[]): string {
    const id = `goal-${++this.counter}`;
    const now = Date.now();
    const milestones: Milestone[] = milestoneNames.map((m, i) => ({
      id: `m-${id}-${i}`,
      name: m,
      target: Math.round(((i + 1) / milestoneNames.length) * 100),
      reached: false,
    }));
    this.goals.set(id, {
      id,
      name,
      progress: 0,
      status: 'active',
      milestones,
      created: now,
      updated: now,
    });
    return id;
  }

  updateProgress(goalId: string, progress: number): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;
    goal.progress = Math.max(0, Math.min(100, progress));
    goal.updated = Date.now();
    // Auto-complete when progress reaches 100
    if (goal.progress >= 100) {
      goal.status = 'completed';
      for (const m of goal.milestones) m.reached = true;
    }
    return true;
  }

  completeMilestone(goalId: string, milestoneId: string): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;
    const milestone = goal.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;
    milestone.reached = true;
    // Update overall progress
    const reached = goal.milestones.filter(m => m.reached).length;
    goal.progress = Math.round((reached / goal.milestones.length) * 100);
    goal.updated = Date.now();
    if (goal.progress >= 100) goal.status = 'completed';
    return true;
  }

  getProgress(goalId: string): GoalProgressInfo | null {
    const goal = this.goals.get(goalId);
    if (!goal) return null;
    return {
      progress: goal.progress,
      status: goal.status,
      completedMilestones: goal.milestones.filter(m => m.reached).length,
      totalMilestones: goal.milestones.length,
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

  setStatus(id: string, status: GoalStatus): boolean {
    const goal = this.goals.get(id);
    if (!goal) return false;
    goal.status = status;
    goal.updated = Date.now();
    return true;
  }

  pause(id: string): boolean {
    return this.setStatus(id, 'paused');
  }

  resume(id: string): boolean {
    return this.setStatus(id, 'active');
  }

  cancel(id: string): boolean {
    return this.setStatus(id, 'cancelled');
  }

  complete(id: string): boolean {
    return this.setStatus(id, 'completed');
  }

  getStatus(id: string): GoalStatus | null {
    return this.goals.get(id)?.status ?? null;
  }

  isActive(id: string): boolean {
    return this.goals.get(id)?.status === 'active';
  }

  isPaused(id: string): boolean {
    return this.goals.get(id)?.status === 'paused';
  }

  isCompleted(id: string): boolean {
    return this.goals.get(id)?.status === 'completed';
  }

  isCancelled(id: string): boolean {
    return this.goals.get(id)?.status === 'cancelled';
  }

  getByStatus(status: GoalStatus): Goal[] {
    return Array.from(this.goals.values()).filter(g => g.status === status);
  }

  getActiveGoals(): Goal[] {
    return this.getByStatus('active');
  }

  getPausedGoals(): Goal[] {
    return this.getByStatus('paused');
  }

  getCompletedGoals(): Goal[] {
    return this.getByStatus('completed');
  }

  getCancelledGoals(): Goal[] {
    return this.getByStatus('cancelled');
  }

  getMilestones(id: string): Milestone[] {
    return [...(this.goals.get(id)?.milestones ?? [])];
  }

  getMilestoneCount(id: string): number {
    return this.goals.get(id)?.milestones.length ?? 0;
  }

  getReachedMilestones(id: string): Milestone[] {
    return (this.goals.get(id)?.milestones ?? []).filter(m => m.reached);
  }

  getUnreachedMilestones(id: string): Milestone[] {
    return (this.goals.get(id)?.milestones ?? []).filter(m => !m.reached);
  }

  adjustProgress(id: string, delta: number): boolean {
    const goal = this.goals.get(id);
    if (!goal) return false;
    return this.updateProgress(id, goal.progress + delta);
  }

  getProgressPercent(id: string): number {
    return this.goals.get(id)?.progress ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.goals.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.goals.get(id)?.updated ?? 0;
  }

  getCompletionRate(): number {
    const all = Array.from(this.goals.values());
    if (all.length === 0) return 0;
    const completed = all.filter(g => g.status === 'completed').length;
    return Math.round((completed / all.length) * 100) / 100;
  }

  clearAll(): void {
    this.goals.clear();
    this.counter = 0;
  }
}

export default GoalTracker;