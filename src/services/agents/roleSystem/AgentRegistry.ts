/**
 * AgentRegistry - V98 Agent Professional Role System
 * Professional agent profile registry with specialties and role definitions
 */

export type AgentRole = 'planner' | 'operator' | 'critic' | 'summarizer'

export interface AgentProfile {
  id: string
  role: AgentRole
  name: string
  specialties: string[]
  maxComplexity: number // 1-10, task complexity threshold
  confidence: number // 0-1, historical success rate
  description: string
}

/**
 * Agent profiles for the professional role system
 */
export const AGENT_PROFILES: AgentProfile[] = [
  {
    id: 'planner',
    role: 'planner',
    name: 'PlannerAgent',
    specialties: ['task-decomposition', 'planning', 'risk-assessment', 'step-estimation'],
    maxComplexity: 10,
    confidence: 0.9,
    description: 'Task planning expert - decomposes complex tasks into executable steps',
  },
  {
    id: 'operator',
    role: 'operator',
    name: 'OperatorAgent',
    specialties: ['web-search', 'calculation', 'api-call', 'code-gen', 'data-processing'],
    maxComplexity: 5,
    confidence: 0.85,
    description: 'Execution expert - handles single clear operational tasks',
  },
  {
    id: 'critic',
    role: 'critic',
    name: 'CriticAgent',
    specialties: ['code-review', 'logic-check', 'quality-assessment', 'validation', 'error-detection'],
    maxComplexity: 8,
    confidence: 0.88,
    description: 'Quality assurance expert - reviews outputs and provides improvement suggestions',
  },
  {
    id: 'summarizer',
    role: 'summarizer',
    name: 'SummarizerAgent',
    specialties: ['summarization', 'formatting', 'presentation', 'report-writing', 'data-aggregation'],
    maxComplexity: 6,
    confidence: 0.92,
    description: 'Result summarization expert - formats and presents multi-agent collaboration results',
  },
]

class RoleAgentRegistry {
  private agents = new Map<string, AgentProfile>()
  private initialized = false

  /**
   * Initialize registry with default profiles
   */
  initialize(): void {
    if (this.initialized) return
    
    for (const profile of AGENT_PROFILES) {
      this.register(profile)
    }
    
    this.initialized = true
    console.log('[RoleAgentRegistry] Initialized with', this.agents.size, 'agent profiles')
  }

  /**
   * Register a new agent profile
   */
  register(profile: AgentProfile): void {
    this.agents.set(profile.id, profile)
  }

  /**
   * Get agent profile by ID
   */
  get(id: string): AgentProfile | undefined {
    return this.agents.get(id)
  }

  /**
   * Get all agents by role
   */
  getByRole(role: AgentRole): AgentProfile[] {
    return Array.from(this.agents.values()).filter(a => a.role === role)
  }

  /**
   * Find best matching agent for required specialties
   */
  findBestMatch(requiredSpecialties: string[], preferredRole?: AgentRole): AgentProfile | undefined {
    const candidates = preferredRole 
      ? this.getByRole(preferredRole)
      : Array.from(this.agents.values())

    if (candidates.length === 0) return undefined

    // Score by specialty match count
    const scored = candidates.map(agent => {
      const matchCount = requiredSpecialties.filter(s => 
        agent.specialties.includes(s)
      ).length
      return { agent, matchCount }
    })

    // Sort by match count descending
    scored.sort((a, b) => b.matchCount - a.matchCount)

    // Return best match if any specialties match
    if (scored[0].matchCount > 0) {
      return scored[0].agent
    }

    // Fallback to first candidate
    return candidates[0]
  }

  /**
   * List all registered agents
   */
  list(): AgentProfile[] {
    return Array.from(this.agents.values())
  }

  /**
   * Get agent count
   */
  size(): number {
    return this.agents.size
  }

  /**
   * Unregister an agent
   */
  unregister(id: string): void {
    this.agents.delete(id)
  }

  /**
   * Reset registry
   */
  reset(): void {
    this.agents.clear()
    this.initialized = false
  }
}

// Singleton instance
export const roleAgentRegistry = new RoleAgentRegistry()

export default roleAgentRegistry
