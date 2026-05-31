/**
 * RoleSwitcher - Manages role switching and message routing
 * Based on chatdev Multi-Agent Orchestration
 */

import { AgentRole, AgentRoleRegistry } from './AgentRoleRegistry';

export interface RoutingRule {
  keywords: string[];
  targetRole: AgentRole;
}

/**
 * Default routing rules based on message content
 * Ordered by specificity - more specific terms first
 */
const DEFAULT_ROUTING_RULES: RoutingRule[] = [
  {
    keywords: [
      'execute the plan', 'write code', 'build component', 'write function',
      'implement solution', 'run task', 'develop application', 'implement feature',
      'deploy', 'debug', 'refactor', 'compile', 'test and run',
      'execute', 'build', 'implement', 'create', 'develop',
      'perform', 'action', 'write', 'coding', 'builder'
    ],
    targetRole: AgentRole.EXECUTOR,
  },
  {
    keywords: [
      'review the', 'code review', 'check quality', 'audit code', 'critique',
      'validate', 'verify', 'inspect code', 'test thoroughly', 'quality check',
      'review', 'check', 'audit', 'critique', 'feedback', 'improve', 'refine',
      'analyze', 'assess', 'evaluate', 'quality'
    ],
    targetRole: AgentRole.REVIEWER,
  },
  {
    keywords: [
      'i feel', 'feel sad', 'feel happy', 'emotional', 'empathy', 'sentiment',
      'im feeling', 'i am sad', 'i am happy', 'my mood', 'how do i feel',
      'feel', 'emotion', 'empathy', 'empathetic', 'mood'
    ],
    targetRole: AgentRole.EMOTION,
  },
  {
    keywords: ['plan', 'coordinate', 'delegate', 'organize', 'schedule', 'lead'],
    targetRole: AgentRole.COORDINATOR,
  },
];

/**
 * RoleSwitcher handles role switching and message routing logic
 */
export class RoleSwitcher {
  private registry: AgentRoleRegistry;
  private defaultRules: RoutingRule[];
  private customRules: RoutingRule[] = [];
  private activeRole: AgentRole = AgentRole.COORDINATOR;

  constructor(registry: AgentRoleRegistry) {
    this.registry = registry;
    this.defaultRules = [...DEFAULT_ROUTING_RULES];
  }

  /**
   * Route a message to the appropriate role based on keywords
   */
  route(message: string): AgentRole {
    if (!message || message.trim().length === 0) {
      return this.activeRole;
    }

    const lowerMessage = message.toLowerCase();

    // Check custom rules first (user-defined rules have higher priority)
    for (const rule of this.customRules) {
      for (const keyword of rule.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return rule.targetRole;
        }
      }
    }

    // Then check default rules
    for (const rule of this.defaultRules) {
      for (const keyword of rule.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return rule.targetRole;
        }
      }
    }

    // Fall back to registry's keyword detection
    const detectedRole = this.registry.getRoleByKeyword(message);
    return detectedRole || this.activeRole;
  }

  /**
   * Switch to a specific role
   */
  switchRole(role: AgentRole): void {
    this.activeRole = role;
  }

  /**
   * Add a custom routing rule
   */
  addRule(rule: RoutingRule): void {
    if (rule && rule.keywords && rule.keywords.length > 0 && rule.targetRole) {
      this.customRules.push(rule);
    }
  }

  /**
   * Get the currently active role
   */
  getActiveRole(): AgentRole {
    return this.activeRole;
  }

  /**
   * Set the active role directly
   */
  setActiveRole(role: AgentRole): void {
    this.activeRole = role;
  }
}