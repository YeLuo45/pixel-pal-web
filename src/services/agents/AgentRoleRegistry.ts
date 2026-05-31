/**
 * AgentRoleRegistry - Manages agent roles and their configurations
 * Based on ruflo Multi-Agent Studio architecture
 */

export enum AgentRole {
  COORDINATOR = 'coordinator',
  EXECUTOR = 'executor',
  REVIEWER = 'reviewer',
  EMOTION = 'emotion',
}

export interface AgentRoleConfig {
  role: AgentRole;
  name: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
  isActive: boolean;
}

interface RoleKeywordMapping {
  role: AgentRole;
  keywords: string[];
}

/**
 * Default keyword mappings for automatic role detection
 * Keywords are ordered by specificity - more specific terms first
 */
const DEFAULT_KEYWORD_MAPPINGS: RoleKeywordMapping[] = [
  {
    role: AgentRole.EXECUTOR,
    keywords: [
      // Simple single keywords (avoiding 'code' and 'plan' which are too generic)
      'execute', 'build', 'implement', 'create', 'develop', 'deploy', 'debug',
      'refactor', 'compile', 'run', 'test', 'perform', 'action',
      'write', 'coding', 'builder',
      // Multi-word phrases
      'execute the plan', 'write code', 'build component', 'write function',
      'implement solution', 'run task', 'develop application', 'implement feature',
      'executing', 'implementation', 'run code'
    ],
  },
  {
    role: AgentRole.REVIEWER,
    keywords: [
      // Simple single keywords first
      'review', 'check', 'audit', 'critique', 'feedback', 'improve', 'refine',
      'validate', 'verify', 'analyze', 'assess', 'evaluate', 'quality',
      // Multi-word phrases
      'review the', 'code review', 'check quality', 'audit code',
      'inspect code', 'quality check', 'reviewing', 'critiqueing'
    ],
  },
  {
    role: AgentRole.EMOTION,
    keywords: [
      // Simple single keywords first
      'feel', 'emotion', 'empathy', 'empathetic', 'sentiment', 'mood', 'empathize',
      'excited', 'sad', 'happy', 'angry', 'frustrated', 'anxious', 'calm', 'enthusiastic',
      // Multi-word phrases
      'i feel', 'feel sad', 'feel happy', 'im feeling', 'i am sad', 'i am happy',
      'i am excited', 'my mood', 'emotional', '感情', '情绪', '感受', '共情'
    ],
  },
  {
    role: AgentRole.COORDINATOR,
    keywords: [
      // Simple single keywords first
      'plan', 'coordinate', 'delegate', 'organize', 'schedule', 'lead',
      'manage', 'strategy', 'assign', 'arrange',
      // Multi-word phrases
      'plan the', 'coordinate the', 'delegate the', 'organize the',
      'task planning', 'progress tracking', 'delegation'
    ],
  },
];

/**
 * AgentRoleRegistry manages the registration and retrieval of agent roles
 */
export class AgentRoleRegistry {
  private roles: Map<AgentRole, AgentRoleConfig> = new Map();
  private keywordMappings: RoleKeywordMapping[] = [...DEFAULT_KEYWORD_MAPPINGS];

  /**
   * Register a new role or update existing role configuration
   */
  register(config: AgentRoleConfig): void {
    if (!config.role) {
      throw new Error('AgentRoleConfig must have a role property');
    }
    
    const existingConfig = this.roles.get(config.role);
    const isActive = existingConfig?.isActive ?? config.isActive ?? true;
    
    this.roles.set(config.role, {
      ...config,
      isActive,
    });
  }

  /**
   * Get a specific role configuration
   */
  getRole(role: AgentRole): AgentRoleConfig | null {
    return this.roles.get(role) || null;
  }

  /**
   * Get all registered roles
   */
  getAllRoles(): AgentRoleConfig[] {
    return Array.from(this.roles.values());
  }

  /**
   * Set the active status of a role
   */
  setActive(role: AgentRole, active: boolean): void {
    const config = this.roles.get(role);
    if (config) {
      this.roles.set(role, { ...config, isActive: active });
    }
  }

  /**
   * Get all active roles
   */
  getActiveRoles(): AgentRoleConfig[] {
    return this.getAllRoles().filter(role => role.isActive);
  }

  /**
   * Determine the appropriate role based on message keywords
   */
  getRoleByKeyword(message: string): AgentRole | null {
    if (!message || message.trim().length === 0) {
      return null;
    }

    // If no roles are registered, return null
    if (this.roles.size === 0) {
      return null;
    }

    const lowerMessage = message.toLowerCase();

    for (const mapping of this.keywordMappings) {
      for (const keyword of mapping.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return mapping.role;
        }
      }
    }

    return null;
  }
}