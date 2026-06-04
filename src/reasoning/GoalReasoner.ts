/**
 * Goal Reasoner
 * generic-agent-design Goal Reasoner - Analyze + Feasibility + Strategy + Track
 */

export interface GoalAnalysis {
  goal: string;
  complexity: number;
  feasibility: number;
  strategies: string[];
}

export class GoalReasoner {
  private progress: Map<string, number> = new Map();
  private strategies = ['divide_and_conquer', 'iterative', 'parallel', 'sequential', 'adaptive'];

  analyze(goal: string): GoalAnalysis {
    const complexity = this.calculateComplexity(goal);
    const feasibility = this.evaluateFeasibility(goal);
    const strategies = this.recommendStrategies(complexity, feasibility);
    return { goal, complexity, feasibility, strategies };
  }

  evaluateFeasibility(goal: string): number {
    if (!goal || goal.length === 0) return 0;
    const words = goal.split(/\s+/).length;
    // Shorter goals are more feasible
    return Math.max(0, Math.min(1, 1 - words * 0.05));
  }

  recommendStrategy(goal: string): string {
    const complexity = this.calculateComplexity(goal);
    if (complexity < 3) return 'sequential';
    if (complexity < 6) return 'iterative';
    if (complexity < 8) return 'divide_and_conquer';
    return 'adaptive';
  }

  trackProgress(goal: string, progress: number): void {
    this.progress.set(goal, Math.max(0, Math.min(100, progress)));
  }

  getProgress(goal: string): number {
    return this.progress.get(goal) ?? 0;
  }

  isCompleted(goal: string): boolean {
    return this.getProgress(goal) >= 100;
  }

  getAllProgress(): Map<string, number> {
    return new Map(this.progress);
  }

  clearProgress(goal: string): boolean {
    return this.progress.delete(goal);
  }

  clearAll(): void {
    this.progress.clear();
  }

  private calculateComplexity(goal: string): number {
    if (!goal) return 0;
    const words = goal.split(/\s+/).length;
    const chars = goal.length;
    // Complexity is based on word count and char count
    return Math.min(10, Math.round((words + chars / 10) / 2));
  }

  private recommendStrategies(complexity: number, feasibility: number): string[] {
    const recommended: string[] = [];
    if (complexity < 5) {
      recommended.push('sequential');
    } else if (complexity < 8) {
      recommended.push('iterative', 'parallel');
    } else {
      recommended.push('divide_and_conquer', 'adaptive');
    }
    if (feasibility < 0.5) {
      recommended.push('adaptive');
    }
    return recommended;
  }

  getComplexity(goal: string): number {
    return this.calculateComplexity(goal);
  }

  getFeasibility(goal: string): number {
    return this.evaluateFeasibility(goal);
  }

  getStrategies(): string[] {
    return [...this.strategies];
  }

  getRecommendedStrategyCount(goal: string): number {
    return this.analyze(goal).strategies.length;
  }

  isHighComplexity(goal: string): boolean {
    return this.getComplexity(goal) >= 7;
  }

  isLowComplexity(goal: string): boolean {
    return this.getComplexity(goal) < 3;
  }

  isHighlyFeasible(goal: string): boolean {
    return this.getFeasibility(goal) >= 0.8;
  }

  isInfeasible(goal: string): boolean {
    return this.getFeasibility(goal) < 0.3;
  }

  incrementProgress(goal: string, delta: number): number {
    const current = this.getProgress(goal);
    const newProgress = Math.max(0, Math.min(100, current + delta));
    this.trackProgress(goal, newProgress);
    return newProgress;
  }

  setProgress(goal: string, progress: number): void {
    this.trackProgress(goal, progress);
  }

  hasGoal(goal: string): boolean {
    return this.progress.has(goal);
  }

  getTrackedGoalCount(): number {
    return this.progress.size;
  }

  getCompletedGoals(): string[] {
    return Array.from(this.progress.entries())
      .filter(([, p]) => p >= 100)
      .map(([g]) => g);
  }

  getInProgressGoals(): string[] {
    return Array.from(this.progress.entries())
      .filter(([, p]) => p > 0 && p < 100)
      .map(([g]) => g);
  }
}

export default GoalReasoner;