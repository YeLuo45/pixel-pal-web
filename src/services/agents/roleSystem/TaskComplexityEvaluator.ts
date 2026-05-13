/**
 * TaskComplexityEvaluator - V98 Agent Professional Role System
 * Scores task complexity from 1-10 based on steps, diversity, uncertainty, and output format
 */

export type RiskLevel = 'low' | 'medium' | 'high'

export interface TaskComplexityInput {
  /** Number of estimated steps to complete the task */
  estimatedSteps: number
  /** Whether task spans multiple domains (e.g., code + research + design) */
  crossDomainDiversity: boolean
  /** Number of different domains involved (0-4: tech, creative, business, research) */
  domainCount: number
  /** Whether task has open-ended or ambiguous requirements */
  openEndedUncertainty: boolean
  /** Whether task requires structured/formatted output */
  structuredOutputRequired: boolean
  /** Task description for additional context */
  description?: string
}

export interface TaskComplexity {
  score: number // 1-10
  estimatedSteps: number
  requiredSpecialties: string[]
  riskLevel: RiskLevel
  factors: ComplexityFactor[]
}

export interface ComplexityFactor {
  name: string
  contribution: number
  description: string
}

/**
 * Evaluates task complexity based on multiple dimensions:
 * - Steps: +0.5 per step above 1
 * - Cross-domain diversity: +1-2 based on domain count
 * - Open-ended uncertainty: +1-2
 * - Structured output: +1
 */
class TaskComplexityEvaluator {
  private readonly MIN_SCORE = 1
  private readonly MAX_SCORE = 10

  /**
   * Evaluate task complexity
   */
  evaluate(input: TaskComplexityInput): TaskComplexity {
    const factors: ComplexityFactor[] = []
    let score = 1 // Base score

    // Factor 1: Step complexity (+0.5 per step above 1)
    if (input.estimatedSteps > 1) {
      const stepContribution = (input.estimatedSteps - 1) * 0.5
      score += stepContribution
      factors.push({
        name: 'step_count',
        contribution: stepContribution,
        description: `${input.estimatedSteps} steps (+${stepContribution.toFixed(1)})`,
      })
    }

    // Factor 2: Cross-domain diversity (+1-2 based on domain count)
    if (input.crossDomainDiversity && input.domainCount > 0) {
      const diversityContribution = Math.min(input.domainCount * 0.75, 2)
      score += diversityContribution
      factors.push({
        name: 'cross_domain',
        contribution: diversityContribution,
        description: `${input.domainCount} domains (+${diversityContribution.toFixed(1)})`,
      })
    }

    // Factor 3: Open-ended uncertainty (+1-2)
    if (input.openEndedUncertainty) {
      const uncertaintyContribution = 1.5
      score += uncertaintyContribution
      factors.push({
        name: 'uncertainty',
        contribution: uncertaintyContribution,
        description: `Open-ended requirements (+${uncertaintyContribution})`,
      })
    }

    // Factor 4: Structured output requirement (+1)
    if (input.structuredOutputRequired) {
      score += 1
      factors.push({
        name: 'structured_output',
        contribution: 1,
        description: 'Structured output required (+1)',
      })
    }

    // Clamp score to valid range
    score = Math.max(this.MIN_SCORE, Math.min(this.MAX_SCORE, score))

    // Determine risk level
    const riskLevel = this.determineRiskLevel(score, input)

    // Extract required specialties from description
    const requiredSpecialties = this.inferSpecialties(input)

    return {
      score: Math.round(score * 10) / 10, // Round to 1 decimal
      estimatedSteps: input.estimatedSteps,
      requiredSpecialties,
      riskLevel,
      factors,
    }
  }

  /**
   * Infer required specialties from task input
   */
  private inferSpecialties(input: TaskComplexityInput): string[] {
    const specialties: string[] = []
    const desc = (input.description || '').toLowerCase()

    // Code-related
    if (desc.match(/code|编程|开发|function|class |def |algorithm/i)) {
      specialties.push('code-gen', 'implementation')
    }

    // Web search
    if (desc.match(/search|搜索|查找|查询|find|lookup/i)) {
      specialties.push('web-search')
    }

    // Calculation
    if (desc.match(/calc|计算|math|数学|compute|统计/i)) {
      specialties.push('calculation')
    }

    // API calls
    if (desc.match(/api|call|调用|请求|http|fetch/i)) {
      specialties.push('api-call')
    }

    // Review
    if (desc.match(/review|审查|检查|test|测试|验证|validate/i)) {
      specialties.push('code-review', 'quality-assessment')
    }

    // Summarization
    if (desc.match(/summary|总结|汇总|概括|report|报告/i)) {
      specialties.push('summarization', 'formatting')
    }

    // Planning
    if (desc.match(/plan|规划|计划|分解|decompose|步骤/i)) {
      specialties.push('planning', 'task-decomposition')
    }

    return specialties
  }

  /**
   * Determine risk level based on complexity score
   */
  private determineRiskLevel(score: number, input: TaskComplexityInput): RiskLevel {
    if (score >= 7) return 'high'
    if (score >= 4) return 'medium'
    
    // Check for specific high-risk indicators
    if (input.openEndedUncertainty && input.estimatedSteps > 3) {
      return 'medium'
    }
    
    return 'low'
  }

  /**
   * Quick evaluation from simple parameters
   */
  quickEvaluate(estimatedSteps: number, hasAmbiguity = false, isCrossDomain = false): TaskComplexity {
    return this.evaluate({
      estimatedSteps,
      crossDomainDiversity: isCrossDomain,
      domainCount: isCrossDomain ? 2 : 1,
      openEndedUncertainty: hasAmbiguity,
      structuredOutputRequired: false,
    })
  }
}

// Singleton instance
export const taskComplexityEvaluator = new TaskComplexityEvaluator()

// ============================================================================
// TEST CASES - Documented evaluation scenarios
// ============================================================================

export const COMPLEXITY_TEST_CASES: Array<{
  name: string
  input: TaskComplexityInput
  expectedMinScore: number
  expectedMaxScore: number
}> = [
  {
    name: 'Simple web search (1 step)',
    input: {
      estimatedSteps: 1,
      crossDomainDiversity: false,
      domainCount: 1,
      openEndedUncertainty: false,
      structuredOutputRequired: false,
      description: 'Search for weather in Tokyo',
    },
    expectedMinScore: 1,
    expectedMaxScore: 1.5,
  },
  {
    name: 'Code generation (2 steps)',
    input: {
      estimatedSteps: 2,
      crossDomainDiversity: false,
      domainCount: 1,
      openEndedUncertainty: false,
      structuredOutputRequired: false,
      description: 'Write a function to calculate fibonacci',
    },
    expectedMinScore: 1.5,
    expectedMaxScore: 2.5,
  },
  {
    name: 'Multi-step research report (5 steps + cross-domain)',
    input: {
      estimatedSteps: 5,
      crossDomainDiversity: true,
      domainCount: 3,
      openEndedUncertainty: true,
      structuredOutputRequired: true,
      description: 'Research AI in healthcare and write a comprehensive report',
    },
    expectedMinScore: 7,
    expectedMaxScore: 10,
  },
  {
    name: 'API integration task (3 steps)',
    input: {
      estimatedSteps: 3,
      crossDomainDiversity: false,
      domainCount: 1,
      openEndedUncertainty: false,
      structuredOutputRequired: true,
      description: 'Call API and return structured JSON data',
    },
    expectedMinScore: 2.5,
    expectedMaxScore: 4,
  },
  {
    name: 'Ambiguous creative task (4 steps)',
    input: {
      estimatedSteps: 4,
      crossDomainDiversity: true,
      domainCount: 2,
      openEndedUncertainty: true,
      structuredOutputRequired: false,
      description: 'Brainstorm creative ways to improve user engagement',
    },
    expectedMinScore: 5,
    expectedMaxScore: 8,
  },
  {
    name: 'Simple calculation (1 step)',
    input: {
      estimatedSteps: 1,
      crossDomainDiversity: false,
      domainCount: 1,
      openEndedUncertainty: false,
      structuredOutputRequired: false,
      description: 'Calculate 15% tip for $67.50',
    },
    expectedMinScore: 1,
    expectedMaxScore: 1.5,
  },
]

export default taskComplexityEvaluator
