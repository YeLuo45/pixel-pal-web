/**
 * TaskAssigner - V98 Agent Professional Role System
 * Smart task assignment based on complexity score
 */

import type { TaskComplexity } from './TaskComplexityEvaluator'
import type { AgentProfile, AgentRole } from './AgentRegistry'
import { roleAgentRegistry } from './AgentRegistry'
import { taskComplexityEvaluator } from './TaskComplexityEvaluator'

export interface TaskAssignment {
  assignedAgent: AgentProfile
  reasoning: string
  shouldDecompose: boolean
  assignedRole: AgentRole
}

export interface UserTask {
  description: string
  estimatedSteps?: number
  hasAmbiguity?: boolean
  isCrossDomain?: boolean
  requiresStructuredOutput?: boolean
  domainCount?: number
}

/**
 * Smart task assignment based on complexity score:
 * - complexity >= 7 → PlannerAgent (plan first)
 * - estimatedSteps == 1 → OperatorAgent (direct execution)
 * - default → PlannerAgent (decompose then assign)
 */
class TaskAssigner {
  /**
   * Assign a task to the most appropriate agent based on complexity
   */
  assign(task: UserTask, context?: { preferredRole?: AgentRole }): TaskAssignment {
    // Evaluate task complexity
    const complexity = this.evaluateTaskComplexity(task)

    // Determine assignment based on complexity rules
    return this.determineAssignment(complexity, task, context)
  }

  /**
   * Evaluate task complexity from user task
   */
  private evaluateTaskComplexity(task: UserTask): TaskComplexity {
    return taskComplexityEvaluator.evaluate({
      estimatedSteps: task.estimatedSteps || this.estimateStepsFromDescription(task.description),
      crossDomainDiversity: task.isCrossDomain || false,
      domainCount: task.domainCount || 1,
      openEndedUncertainty: task.hasAmbiguity || false,
      structuredOutputRequired: task.requiresStructuredOutput || false,
      description: task.description,
    })
  }

  /**
   * Estimate steps from task description
   */
  private estimateStepsFromDescription(description: string): number {
    const desc = description.toLowerCase()
    
    // Multi-step indicators
    const multiStepPatterns = [
      /首先.*然后|首先|接着|之后|最后|first.*then|then|next|after/i,
      /步骤|step [0-9]|第[一二三四五六七八九十]步/i,
      /和.*和.*和|以及.*以及/i, // multiple "and"s
      /、.*、.*、/ // Chinese list separator
    ]
    
    // Single step indicators
    const singleStepPatterns = [
      /只|只需要|只要|only|just/i,
      /一个.*即可|一句话|one sentence/i
    ]

    for (const pattern of singleStepPatterns) {
      if (pattern.test(desc)) return 1
    }

    let stepCount = 1
    for (const pattern of multiStepPatterns) {
      const matches = desc.match(pattern)
      if (matches) {
        // Count additional steps based on separators
        stepCount = Math.max(stepCount, matches.length + 1)
      }
    }

    // Check for complex task keywords
    const complexKeywords = ['研究', '分析', '开发', '创建', '生成', '报告', 'research', 'develop', 'create', 'report']
    for (const keyword of complexKeywords) {
      if (desc.includes(keyword) && stepCount === 1) {
        stepCount = 3 // Default to 3 steps for complex tasks
        break
      }
    }

    return Math.min(stepCount, 10) // Cap at 10
  }

  /**
   * Determine assignment based on complexity
   */
  private determineAssignment(
    complexity: TaskComplexity,
    task: UserTask,
    context?: { preferredRole?: AgentRole }
  ): TaskAssignment {
    const { score, estimatedSteps } = complexity

    // Rule 1: complexity >= 7 → PlannerAgent (plan first)
    if (score >= 7) {
      const agent = roleAgentRegistry.findBestMatch(complexity.requiredSpecialties, 'planner')
        || this.getDefaultAgent('planner')
      
      return {
        assignedAgent: agent,
        reasoning: `High complexity (${score}/10) requires planning phase first`,
        shouldDecompose: true,
        assignedRole: 'planner',
      }
    }

    // Rule 2: estimatedSteps == 1 → OperatorAgent (direct execution)
    if (estimatedSteps === 1) {
      const agent = roleAgentRegistry.findBestMatch(complexity.requiredSpecialties, 'operator')
        || this.getDefaultAgent('operator')
      
      return {
        assignedAgent: agent,
        reasoning: `Single-step task (${estimatedSteps} step) - direct execution`,
        shouldDecompose: false,
        assignedRole: 'operator',
      }
    }

    // Rule 3: Default → PlannerAgent (decompose then assign)
    const agent = roleAgentRegistry.findBestMatch(complexity.requiredSpecialties, 'planner')
      || this.getDefaultAgent('planner')
    
    return {
      assignedAgent: agent,
      reasoning: `Medium complexity (${score}/10) - decompose task then assign to appropriate agent`,
      shouldDecompose: true,
      assignedRole: 'planner',
    }
  }

  /**
   * Get default agent for a role
   */
  private getDefaultAgent(role: AgentRole): AgentProfile {
    const profile = roleAgentRegistry.get(role)
    if (profile) return profile

    // Fallback defaults
    const defaults: Record<AgentRole, AgentProfile> = {
      planner: {
        id: 'planner',
        role: 'planner',
        name: 'PlannerAgent',
        specialties: ['task-decomposition', 'planning'],
        maxComplexity: 10,
        confidence: 0.9,
        description: 'Default planner agent',
      },
      operator: {
        id: 'operator',
        role: 'operator',
        name: 'OperatorAgent',
        specialties: ['execution', 'calculation'],
        maxComplexity: 5,
        confidence: 0.85,
        description: 'Default operator agent',
      },
      critic: {
        id: 'critic',
        role: 'critic',
        name: 'CriticAgent',
        specialties: ['review', 'quality-assessment'],
        maxComplexity: 8,
        confidence: 0.88,
        description: 'Default critic agent',
      },
      summarizer: {
        id: 'summarizer',
        role: 'summarizer',
        name: 'SummarizerAgent',
        specialties: ['summarization', 'formatting'],
        maxComplexity: 6,
        confidence: 0.92,
        description: 'Default summarizer agent',
      },
    }

    return defaults[role]
  }

  /**
   * Get agent for post-output critic review (always runs after any agent output)
   */
  getCriticAgent(): AgentProfile {
    const agent = roleAgentRegistry.getByRole('critic')[0]
    return agent || this.getDefaultAgent('critic')
  }

  /**
   * Get agent for task completion summarization
   */
  getSummarizerAgent(): AgentProfile {
    const agent = roleAgentRegistry.getByRole('summarizer')[0]
    return agent || this.getDefaultAgent('summarizer')
  }
}

// Singleton instance
export const taskAssigner = new TaskAssigner()

export default taskAssigner
