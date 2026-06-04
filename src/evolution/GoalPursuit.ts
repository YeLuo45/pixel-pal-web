/**
 * V192: Autonomous Goal Pursuit - Goal Decomposition & Execution Engine
 * 
 * Implements the autonomous goal pursuit loop:
 * Goal → Decompose → Plan → Execute → Evaluate → Adjust → Goal (循环)
 */

export interface Goal {
  id: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  subGoals: SubGoal[];
  createdAt: number;
  deadline?: number;
}

export interface SubGoal {
  id: string;
  goalId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  dependencies: string[];
}

export interface EvaluateResult {
  progress: number;
  status: Goal['status'];
}

/**
 * GoalPursuit - Autonomous Goal Pursuit Engine
 * 
 * Decomposes high-level goals into executable sub-goals,
 * tracks execution, evaluates progress, and autonomously
 * adjusts plans when needed.
 */
export class GoalPursuit {
  private goals: Map<string, Goal> = new Map();

  /**
   * Decompose a goal description into a structured Goal with SubGoals
   */
  decompose(goalDescription: string): Goal {
    const id = crypto.randomUUID();
    const now = Date.now();
    
    const subGoalDescriptions = this.generateSubGoalDescriptions(goalDescription);
    // Build sub-goals with proper IDs first
    const builtSubGoals: SubGoal[] = subGoalDescriptions.map((desc) => ({
      id: crypto.randomUUID(),
      goalId: id,
      description: desc.description,
      status: 'pending' as const,
      priority: desc.priority,
      dependencies: [] as string[],
    }));

    // Set up sequential dependencies (each sub-goal depends on previous)
    for (let i = 1; i < builtSubGoals.length; i++) {
      builtSubGoals[i].dependencies = [builtSubGoals[i - 1].id];
    }

    const goal: Goal = {
      id,
      description: goalDescription,
      status: 'active',
      subGoals: builtSubGoals,
      createdAt: now,
    };

    this.goals.set(id, goal);
    return goal;
  }

  /**
   * Execute a specific sub-goal by marking it as in_progress then completed
   * Returns void on success, throws on failure
   */
  async executeSubGoal(goalId: string, subGoalId: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const subGoal = goal.subGoals.find((sg) => sg.id === subGoalId);
    if (!subGoal) {
      throw new Error(`SubGoal not found: ${subGoalId}`);
    }

    if (subGoal.status === 'completed') {
      return; // Already executed
    }

    // Check dependencies are satisfied
    for (const depId of subGoal.dependencies) {
      const dep = goal.subGoals.find((sg) => sg.id === depId);
      if (!dep || dep.status !== 'completed') {
        throw new Error(`Dependency not satisfied: ${depId}`);
      }
    }

    subGoal.status = 'in_progress';

    // Simulate execution (in real impl, this would call actual agents/tools)
    await this.performExecution(subGoal);

    subGoal.status = 'completed';
  }

  /**
   * Evaluate the current progress of a goal
   */
  evaluate(goalId: string): EvaluateResult {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const total = goal.subGoals.length;
    if (total === 0) {
      return { progress: 0, status: 'active' };
    }

    const completed = goal.subGoals.filter(
      (sg) => sg.status === 'completed'
    ).length;
    const progress = Math.round((completed / total) * 100);

    let status: Goal['status'] = 'active';

    if (progress === 100) {
      status = 'completed';
    } else if (goal.subGoals.some((sg) => sg.status === 'failed')) {
      status = 'failed';
    } else if (goal.status === 'paused') {
      status = 'paused';
    }

    return { progress, status };
  }

  /**
     * Replan - autonomously adjust goal sub-goals when evaluation suggests failure risk
     * 
     * Recovery logic: even if some sub-goals failed, we attempt to recover
     * by resetting blocked sub-goals and optionally adding recovery sub-goals.
     */
    replan(goalId: string): Goal {
      const goal = this.goals.get(goalId);
      if (!goal) {
        throw new Error(`Goal not found: ${goalId}`);
      }

      const { progress } = this.evaluate(goalId);

      // If goal is completed, no replanning needed
      if (progress === 100) {
        return goal;
      }

      // Check for blocked sub-goals (failed due to failed dependencies) and reset them
      const blockedSubGoals = goal.subGoals.filter((sg) => {
        if (sg.status !== 'failed') return false;
        return sg.dependencies.some((depId) => {
          const dep = goal.subGoals.find((s) => s.id === depId);
          return dep?.status === 'failed';
        });
      });

      for (const blocked of blockedSubGoals) {
        // Reset blocked sub-goal to pending and clear failed dependencies
        blocked.status = 'pending';
        blocked.dependencies = blocked.dependencies.filter((depId) => {
          const dep = goal.subGoals.find((s) => s.id === depId);
          return dep?.status !== 'failed';
        });
      }

      // If too many sub-goals failed, add recovery sub-goals
      const failedCount = goal.subGoals.filter(
        (sg) => sg.status === 'failed'
      ).length;
      const failureRatio = goal.subGoals.length > 0 
        ? failedCount / goal.subGoals.length 
        : 0;

      if (failureRatio > 0.3) {
        // Add recovery sub-goal depending on all completed sub-goals
        const completedIds = goal.subGoals
          .filter((sg) => sg.status === 'completed')
          .map((sg) => sg.id);
    
        const recoverySubGoal: SubGoal = {
          id: crypto.randomUUID(),
          goalId: goal.id,
          description: `Recovery step after ${failedCount} failures`,
          status: 'pending',
          priority: -1, // Low priority
          dependencies: completedIds,
        };
        goal.subGoals.push(recoverySubGoal);
      }

      return goal;
    }

  /**
   * Get a goal by ID
   */
  getGoal(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  /**
   * Get all active goals
   */
  getActiveGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(
      (g) => g.status === 'active'
    );
  }

  /**
   * Pause a goal
   */
  pauseGoal(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.status = 'paused';
    }
  }

  /**
   * Resume a paused goal
   */
  resumeGoal(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (goal && goal.status === 'paused') {
      goal.status = 'active';
    }
  }

  /**
   * Mark a sub-goal as failed
   */
  failSubGoal(goalId: string, subGoalId: string, reason?: string): void {
    const goal = this.goals.get(goalId);
    if (!goal) return;

    const subGoal = goal.subGoals.find((sg) => sg.id === subGoalId);
    if (subGoal) {
      subGoal.status = 'failed';
    }
  }

  /**
   * Generate sub-goal descriptions from a goal description
   * Uses simple keyword-based decomposition
   */
  private generateSubGoalDescriptions(goalDescription: string): Omit<SubGoal, 'id' | 'goalId' | 'status'>[] {
    const desc = goalDescription.toLowerCase();

    // Simple keyword-based decomposition
    if (
      desc.includes('build') ||
      desc.includes('create') ||
      desc.includes('implement')
    ) {
      return [
        { description: 'Research and gather requirements', priority: 3, dependencies: [] },
        { description: 'Design solution architecture', priority: 2, dependencies: [] },
        { description: 'Implement core functionality', priority: 1, dependencies: [] },
        { description: 'Test and verify implementation', priority: 0, dependencies: [] },
      ];
    }

    if (desc.includes('fix') || desc.includes('debug') || desc.includes('resolve')) {
      return [
        { description: 'Identify root cause', priority: 2, dependencies: [] },
        { description: 'Implement fix', priority: 1, dependencies: [] },
        { description: 'Verify fix works', priority: 0, dependencies: [] },
      ];
    }

    if (desc.includes('learn') || desc.includes('study') || desc.includes('understand')) {
      return [
        { description: 'Gather learning materials', priority: 2, dependencies: [] },
        { description: 'Study and absorb content', priority: 1, dependencies: [] },
        { description: 'Practice and apply knowledge', priority: 0, dependencies: [] },
      ];
    }

    // Default: single sub-goal
    return [
      { description: goalDescription, priority: 0, dependencies: [] },
    ];
  }

  /** For testing: reset all goals */
  reset(): void {
    this.goals.clear();
  }

  /**
   * Simulate execution of a sub-goal
   * In production, this would invoke agents/tools
   */
  private async performExecution(subGoal: SubGoal): Promise<void> {
    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

// Singleton instance
let goalPursuitInstance: GoalPursuit | null = null;

export function getGoalPursuit(): GoalPursuit {
  if (!goalPursuitInstance) {
    goalPursuitInstance = new GoalPursuit();
  }
  return goalPursuitInstance;
}

export default GoalPursuit;