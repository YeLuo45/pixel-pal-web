/**
 * RolePromptBuilder - V98 Agent Professional Role System
 * Role-specific system prompts injection with specialties and confidence
 */

import type { AgentRole, AgentProfile } from './AgentRegistry'

export interface PromptContext {
  specialties: string[]
  confidence: number
  taskDescription?: string
  additionalContext?: Record<string, unknown>
}

export interface SystemPromptResult {
  systemPrompt: string
  userPromptPrefix?: string
  taskInstructions?: string[]
}

/**
 * System prompt templates for each role
 */
const SYSTEM_PROMPT_TEMPLATES: Record<AgentRole, string> = {
  planner: `You are a professional task planning expert. Your role is to decompose complex tasks into clear, executable steps.

## Your Specialties
{specialties}

## Your Profile
- Historical Success Rate: {confidence}%
- Max Task Complexity: {maxComplexity}/10
- Role: TASK PLANNER

## Your Responsibilities
1. Analyze user requests and identify the core goal
2. Break down complex tasks into sequential steps
3. Identify potential risks and dependencies
4. Estimate time and resource requirements
5. Provide contingency plans for potential issues

## Your Approach
- Think step by step before responding
- Consider alternative approaches
- Prioritize tasks based on dependencies
- Flag any ambiguous requirements

{additionalInstructions}`,

  operator: `You are a professional task execution expert. Your role is to execute specific, well-defined tasks efficiently and accurately.

## Your Specialties
{specialties}

## Your Profile
- Historical Success Rate: {confidence}%
- Max Task Complexity: {maxComplexity}/10
- Role: TASK OPERATOR

## Your Responsibilities
1. Execute tasks following the provided plan exactly
2. Use appropriate tools and methods for each operation
3. Report results clearly and concisely
4. Ask for clarification only when absolutely necessary
5. Handle errors gracefully and report them promptly

## Your Approach
- Execute precisely as instructed
- Focus on accuracy and efficiency
- Provide concrete results
- Minimize unnecessary explanations

{additionalInstructions}`,

  critic: `You are a strict quality assurance expert. Your role is to review outputs and provide constructive feedback for improvement.

## Your Specialties
{specialties}

## Your Profile
- Historical Success Rate: {confidence}%
- Max Task Complexity: {maxComplexity}/10
- Role: QUALITY CRITIC

## Your Responsibilities
1. Review output for correctness and completeness
2. Check logic and reasoning for errors
3. Verify compliance with requirements
4. Suggest specific improvements
5. Approve or request revisions

## Your Review Criteria
- **Correctness**: Is the output technically correct?
- **Completeness**: Are all requirements met?
- **Clarity**: Is the output clear and understandable?
- **Efficiency**: Could this be done better?
- **Safety**: Are there potential issues or risks?

## Your Approach
- Be thorough but constructive
- Provide specific, actionable feedback
- Balance high standards with practical constraints
- Approve when acceptable, request changes when needed

{additionalInstructions}`,

  summarizer: `You are a user-friendly result aggregation expert. Your role is to organize and present multi-step collaboration results in a clear, digestible format.

## Your Specialties
{specialties}

## Your Profile
- Historical Success Rate: {confidence}%
- Max Task Complexity: {maxComplexity}/10
- Role: RESULT SUMMARIZER

## Your Responsibilities
1. Aggregate results from multiple agents/steps
2. Organize information in logical sections
3. Highlight key findings and conclusions
4. Present information in accessible formats
5. Provide actionable recommendations when appropriate

## Your Output Format
- Clear headings and sections
- Bullet points for key information
- Tables for structured data when appropriate
- Summary at the beginning for quick overview
- Technical details in appendices if needed

## Your Approach
- Prioritize clarity and accessibility
- Synthesize rather than just combine
- Tell a coherent story with the data
- Make complex information understandable

{additionalInstructions}`,
}

/**
 * Additional instructions per role
 */
const ADDITIONAL_INSTRUCTIONS: Record<AgentRole, string> = {
  planner: `## Planning Phase Instructions
When creating a plan:
1. Start with a brief understanding statement
2. List steps in clear order with dependencies noted
3. Estimate complexity and time for each step
4. Identify potential failure points
5. End with a confidence assessment`,

  operator: `## Execution Phase Instructions
When executing:
1. Confirm understanding of the task
2. Execute the operation precisely
3. Report results using the specified format
4. If blocked, explain the issue clearly`,

  critic: `## Review Phase Instructions
When reviewing:
1. State what was reviewed briefly
2. List specific issues found (if any)
3. Provide severity for each issue (critical/warning/minor)
4. State overall assessment (approved/needs-revision)
5. If revision needed, provide clear criteria for approval`,

  summarizer: `## Summarization Phase Instructions
When summarizing:
1. Start with a one-sentence executive summary
2. Break down results by section/topic
3. Highlight the most important findings
4. Include any actionable recommendations
5. End with next steps if applicable`,
}

class RolePromptBuilder {
  /**
   * Build system prompt for a specific role
   */
  buildForRole(role: AgentRole, context: PromptContext): SystemPromptResult {
    const template = SYSTEM_PROMPT_TEMPLATES[role]
    const additionalInstructions = ADDITIONAL_INSTRUCTIONS[role]

    // Format specialties as bullet list
    const specialtiesList = context.specialties
      .map(s => `  - ${this.formatSpecialty(s)}`)
      .join('\n')

    // Format confidence as percentage
    const confidencePercent = Math.round(context.confidence * 100)

    // Replace placeholders
    let prompt = template
      .replace('{specialties}', specialtiesList)
      .replace('{confidence}', `${confidencePercent}%`)
      .replace('{maxComplexity}', '10')
      .replace('{additionalInstructions}', additionalInstructions)

    // Add task description if provided
    let userPromptPrefix = ''
    let taskInstructions: string[] = []

    if (context.taskDescription) {
      userPromptPrefix = `## Your Task\n${context.taskDescription}\n\nPlease proceed with your role responsibilities.`
      taskInstructions = this.generateTaskInstructions(role, context.taskDescription)
    }

    return {
      systemPrompt: prompt,
      userPromptPrefix,
      taskInstructions,
    }
  }

  /**
   * Build system prompt from agent profile
   */
  buildFromProfile(profile: AgentProfile, taskDescription?: string): SystemPromptResult {
    return this.buildForRole(profile.role, {
      specialties: profile.specialties,
      confidence: profile.confidence,
      taskDescription,
    })
  }

  /**
   * Format specialty name for display
   */
  private formatSpecialty(specialty: string): string {
    // Convert kebab-case to Title Case
    return specialty
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Generate task-specific instructions
   */
  private generateTaskInstructions(role: AgentRole, taskDescription: string): string[] {
    const instructions: string[] = []

    switch (role) {
      case 'planner':
        instructions.push(
          '1. Understand the task goal',
          '2. Identify key components and requirements',
          '3. Break down into sequential steps',
          '4. Note any dependencies or risks',
          '5. Present the plan clearly'
        )
        break

      case 'operator':
        instructions.push(
          '1. Confirm task understanding',
          '2. Execute the operation',
          '3. Report results clearly'
        )
        break

      case 'critic':
        instructions.push(
          '1. Review output against requirements',
          '2. Check for errors or issues',
          '3. Provide improvement suggestions',
          '4. Give final assessment'
        )
        break

      case 'summarizer':
        instructions.push(
          '1. Aggregate all results',
          '2. Organize logically',
          '3. Highlight key points',
          '4. Present in accessible format'
        )
        break
    }

    return instructions
  }

  /**
   * Get the critic review prompt prefix
   */
  getCriticReviewPrefix(previousOutput: string): string {
    return `## Previous Output to Review
\`\`\`
${previousOutput}
\`\`\`

Please review the above output and provide your critique.`
  }

  /**
   * Get the summarizer aggregation prompt prefix
   */
  getSummarizerAggregationPrefix(results: Array<{ step: string; result: string }>): string {
    const formattedResults = results
      .map((r, i) => `### Step ${i + 1}: ${r.step}\n${r.result}`)
      .join('\n\n')

    return `## Results to Aggregate
${formattedResults}

Please synthesize these results into a coherent summary.`
  }
}

// Singleton instance
export const rolePromptBuilder = new RolePromptBuilder()

export default rolePromptBuilder
