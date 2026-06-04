/**
 * Goal Decomposition Engine
 * generic-agent Goal Decomposition Engine
 */

export type GoalPriority = 'critical' | 'high' | 'medium' | 'low';
export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type SubGoalStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Goal {
  id: string;
  description: string;
  priority: GoalPriority;
  status: GoalStatus;
  dependencies: string[];
  subGoals: SubGoal[];
}

export interface SubGoal {
  id: string;
  goalId: string;
  description: string;
  status: SubGoalStatus;
  estimatedEffort: number;
  dependencies: string[];
}

export interface Step {
  subGoalId: string;
  order: number;
  parallelWith?: string[];
}

export interface ExecutionPlan {
  goalId: string;
  steps: Step[];
  totalEffort: number;
}

let goalCounter = 0;
let subGoalCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++goalCounter}`;
}

function decomposeDescription(description: string, depth: number): string[] {
  const keywords = ['design', 'build', 'test', 'deploy', 'monitor', 'optimize', 'review', 'setup', 'configure', 'migrate'];
  const parts: string[] = [];

  // Simple keyword-based decomposition
  const lower = description.toLowerCase();
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      parts.push(kw);
    }
  }

  if (parts.length === 0) {
    parts.push('analyze', 'implement', 'validate');
  }

  return parts.slice(0, Math.max(3, depth + 2));
}

export class GoalDecomposer {
  /**
   * Decompose a goal description into sub-goals
   */
  decompose(description: string, depth = 2): Goal {
    const goalId = generateId('goal');
    const subDescriptions = decomposeDescription(description, depth);

    const subGoals: SubGoal[] = subDescriptions.map((desc, i) => ({
      id: `${goalId}-sg-${Date.now()}-${++subGoalCounter}`,
      goalId,
      description: desc,
      status: 'pending' as SubGoalStatus,
      estimatedEffort: Math.floor(Math.random() * 5) + 1,
      dependencies: [],
    }));

    return {
      id: goalId,
      description,
      priority: 'medium',
      status: 'pending',
      dependencies: [],
      subGoals,
    };
  }

  /**
   * Generate execution plan from goal
   */
  generatePlan(goal: Goal): ExecutionPlan {
    const steps: Step[] = [];
    let totalEffort = 0;

    // Topological sort based on dependencies
    const completed = new Set<string>();
    let remaining = [...goal.subGoals];

    while (remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        const sg = remaining[i];
        const depsDone = sg.dependencies.every((d) => completed.has(d));

        if (depsDone || sg.dependencies.length === 0) {
          steps.push({
            subGoalId: sg.id,
            order: steps.length + 1,
          });
          totalEffort += sg.estimatedEffort;
          completed.add(sg.id);
          remaining.splice(i, 1);
          break;
        }
      }
      // Safety: if no progress, break to avoid infinite loop
      if (remaining.length > 0 && remaining.every((sg) => !sg.dependencies.every((d) => completed.has(d) || d.startsWith(sg.goalId)))) {
        // Add remaining without dependencies
        for (const sg of remaining) {
          if (sg.dependencies.every((d) => d.startsWith(sg.goalId) || completed.has(d))) {
            steps.push({ subGoalId: sg.id, order: steps.length + 1 });
            totalEffort += sg.estimatedEffort;
            completed.add(sg.id);
          }
        }
        break;
      }
    }

    return { goalId: goal.id, steps, totalEffort };
  }

  /**
   * Get executable steps (ready to run)
   */
  getExecutableSteps(plan: ExecutionPlan): Step[] {
    return plan.steps.filter((s) => s.order > 0);
  }

  /**
   * Update progress of a sub-goal
   */
  updateProgress(goal: Goal, subGoalId: string, status: SubGoalStatus): Goal {
    const updatedSubGoals = goal.subGoals.map((sg) =>
      sg.id === subGoalId ? { ...sg, status } : sg
    );

    const allDone = updatedSubGoals.every((sg) => sg.status === 'completed' || sg.status === 'failed');
    const anyInProgress = updatedSubGoals.some((sg) => sg.status === 'in_progress');

    return {
      ...goal,
      status: allDone ? 'completed' : anyInProgress ? 'in_progress' : goal.status,
      subGoals: updatedSubGoals,
    };
  }

  /**
   * Set priority for goal
   */
  setPriority(goal: Goal, priority: GoalPriority): Goal {
    return { ...goal, priority };
  }

  /**
   * Add dependency between sub-goals
   */
  addDependency(goal: Goal, fromSubGoalId: string, toSubGoalId: string): Goal {
    const fromSg = goal.subGoals.find((sg) => sg.id === fromSubGoalId);
    if (!fromSg) return goal;

    return {
      ...goal,
      subGoals: goal.subGoals.map((sg) =>
        sg.id === fromSubGoalId
          ? { ...sg, dependencies: [...sg.dependencies, toSubGoalId] }
          : sg
      ),
    };
  }

  /**
   * Get goal progress percentage
   */
  getProgress(goal: Goal): number {
    if (goal.subGoals.length === 0) return 0;
    const done = goal.subGoals.filter((sg) => sg.status === 'completed').length;
    return Math.round((done / goal.subGoals.length) * 100);
  }
}

export default GoalDecomposer;