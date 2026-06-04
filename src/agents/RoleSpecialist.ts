/**
 * RoleSpecialist - ChatDev Role Specialization System
 * 
 * Implements role-based agent specialization inspired by ChatDev 2.0.
 * Enables dynamic role assignment, role chains, and custom role templates.
 * 
 * Features:
 * - RoleDefinition with capabilities, preferences, and constraints
 * - RoleAssignment based on task type, agent availability, and success history
 * - RoleChain for multi-step task pipelines
 * - DynamicRoleConfig for runtime role adjustments
 * - RoleAnalytics for usage tracking and load balancing
 * 
 * @version v191-chatdev-role-specialization
 */

import type { Agent, AgentRole } from '../types/agent';
import { ChatDevRole } from './types';

/**
 * Role definition with capabilities and constraints
 */
export interface RoleDefinition {
  id: string;
  role: ChatDevRole;
  name: string;
  description: string;
  capabilities: string[];
  preferredAgentTypes?: AgentRole[];
  compatibleTaskTypes: string[];
  icon: string;
  maxConcurrentTasks?: number;
  priority: number; // Higher = more likely to be assigned
  hotSwappable: boolean; // Can be switched at runtime
}

/**
 * Role assignment result with reasoning
 */
export interface RoleAssignment {
  roleDefinition: RoleDefinition;
  agentId: string;
  confidence: number; // 0-1
  reasoning: string;
  taskId: string;
}

/**
 * Role chain step execution result
 */
export interface RoleChainStepResult {
  stepIndex: number;
  roleId: string;
  agentId: string;
  input: unknown;
  output: unknown;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
  duration?: number; // ms
}

/**
 * Role chain for multi-step task execution
 */
export interface RoleChain {
  id: string;
  name: string;
  description: string;
  steps: RoleChainStep[];
  condition?: RoleChainCondition;
  resultAggregator?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

export interface RoleChainStep {
  roleId: string;
  inputMapping?: Record<string, string>;  // Maps previous step output to this step's input
  outputMapping?: Record<string, string>; // Maps this step's output for next step
  condition?: RoleChainCondition;
  retryCount?: number;
  timeout?: number; // ms
}

export interface RoleChainCondition {
  field: string;      // Path to field in previous output
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists' | 'not_exists';
  value?: unknown;
}

/**
 * Role template for custom role creation
 */
export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  compatibleTaskTypes: string[];
  icon: string;
  color?: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  isBuiltIn: boolean;
}

/**
 * Dynamic role configuration for runtime adjustments
 */
export interface DynamicRoleConfig {
  roleId: string;
  enabled: boolean;
  maxConcurrentTasks?: number;
  priority?: number;
  capabilities?: string[];
  updatedAt: number;
  updatedBy?: string;
}

/**
 * Role usage analytics
 */
export interface RoleAnalytics {
  roleId: string;
  totalAssignments: number;
  successfulAssignments: number;
  failedAssignments: number;
  averageExecutionTime: number; // ms
  averageConfidence: number;
  lastUsedAt: number;
  loadFactor: number; // 0-1, higher = more used
}

// ============================================================================
// RoleRegistry - Manages role definitions
// ============================================================================

const BUILT_IN_ROLES: RoleDefinition[] = [
  {
    id: 'architect',
    role: ChatDevRole.ARCHITECT,
    name: 'Architect',
    description: 'Designs system architecture and creates technical specifications',
    capabilities: ['system_design', 'architecture_planning', 'tech_spec_creation', 'feasibility_analysis'],
    preferredAgentTypes: ['planner'],
    compatibleTaskTypes: ['architecture_design', 'system_planning', 'tech_stack_selection'],
    icon: '🏗️',
    priority: 10,
    hotSwappable: true,
  },
  {
    id: 'coder',
    role: ChatDevRole.CODER,
    name: 'Coder',
    description: 'Implements code based on specifications',
    capabilities: ['code_generation', 'implementation', 'refactoring', 'debugging'],
    preferredAgentTypes: ['executor'],
    compatibleTaskTypes: ['code_generation', 'bug_fix', 'feature_implementation', 'refactoring'],
    icon: '💻',
    priority: 8,
    hotSwappable: true,
  },
  {
    id: 'reviewer',
    role: ChatDevRole.REVIEWER,
    name: 'Reviewer',
    description: 'Reviews code for quality, security, and best practices',
    capabilities: ['code_review', 'quality_assessment', 'security_analysis', 'best_practice_validation'],
    preferredAgentTypes: ['critic'],
    compatibleTaskTypes: ['code_review', 'security_audit', 'quality_check'],
    icon: '🔍',
    priority: 7,
    hotSwappable: true,
  },
  {
    id: 'tester',
    role: ChatDevRole.TESTER,
    name: 'Tester',
    description: 'Creates and executes tests to validate functionality',
    capabilities: ['test_creation', 'test_execution', 'test_reporting', 'coverage_analysis'],
    preferredAgentTypes: ['executor'],
    compatibleTaskTypes: ['testing', 'test_generation', 'validation', 'qa'],
    icon: '🧪',
    priority: 6,
    hotSwappable: true,
  },
  {
    id: 'documenter',
    role: ChatDevRole.DOCUMENTER,
    name: 'Documenter',
    description: 'Creates and maintains documentation',
    capabilities: ['documentation_writing', 'api_documentation', 'readme_creation', 'changelog_management'],
    preferredAgentTypes: ['creative'],
    compatibleTaskTypes: ['documentation', 'api_docs', 'readme', 'changelog'],
    icon: '📝',
    priority: 5,
    hotSwappable: true,
  },
  {
    id: 'orchestrator',
    role: ChatDevRole.ORCHESTRATOR,
    name: 'Orchestrator',
    description: 'Coordinates multi-agent tasks and manages execution flow',
    capabilities: ['task_decomposition', 'coordination', 'intent_understanding', 'flow_control'],
    preferredAgentTypes: ['orchestrator'],
    compatibleTaskTypes: ['task_coordination', 'multi_step_task', 'workflow_management'],
    icon: '🎯',
    priority: 10,
    hotSwappable: false, // Core role, not swappable during execution
  },
];

class RoleRegistry {
  private roles: Map<string, RoleDefinition> = new Map();
  private templates: Map<string, RoleTemplate> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    BUILT_IN_ROLES.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  /**
   * Register a new role
   */
  register(role: RoleDefinition): void {
    this.roles.set(role.id, role);
  }

  /**
   * Get role by ID
   */
  get(id: string): RoleDefinition | undefined {
    return this.roles.get(id);
  }

  /**
   * Get all roles
   */
  list(): RoleDefinition[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get roles compatible with a task type
   */
  getByTaskType(taskType: string): RoleDefinition[] {
    return this.list().filter(role => 
      role.compatibleTaskTypes.includes(taskType)
    ).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Register a role template
   */
  registerTemplate(template: RoleTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): RoleTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  listTemplates(): RoleTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Create role from template
   */
  createFromTemplate(templateId: string, customConfig?: Partial<RoleDefinition>): RoleDefinition | undefined {
    const template = this.getTemplate(templateId);
    if (!template) return undefined;

    const newRole: RoleDefinition = {
      id: customConfig?.id || `custom_${Date.now()}`,
      role: customConfig?.role || ChatDevRole.CODER,
      name: customConfig?.name || template.name,
      description: template.description,
      capabilities: template.capabilities,
      compatibleTaskTypes: template.compatibleTaskTypes,
      icon: template.icon,
      priority: customConfig?.priority ?? 5,
      hotSwappable: customConfig?.hotSwappable ?? true,
    };

    this.register(newRole);
    return newRole;
  }

  /**
   * Export role as template
   */
  exportAsTemplate(roleId: string): RoleTemplate | undefined {
    const role = this.get(roleId);
    if (!role) return undefined;

    return {
      id: `template_${role.id}_${Date.now()}`,
      name: role.name,
      description: role.description,
      capabilities: [...role.capabilities],
      compatibleTaskTypes: [...role.compatibleTaskTypes],
      icon: role.icon,
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isBuiltIn: false,
    };
  }

  /**
   * Remove role
   */
  unregister(id: string): boolean {
    return this.roles.delete(id);
  }
}

// ============================================================================
// RoleAssigner - Assigns roles to agents based on task analysis
// ============================================================================

interface AgentAvailability {
  agentId: string;
  currentLoad: number;
  maxLoad: number;
  successRate: number; // 0-1
  recentRoles: string[];
}

class RoleAssigner {
  private registry: RoleRegistry;
  private agentAvailability: Map<string, AgentAvailability> = new Map();

  constructor(registry: RoleRegistry) {
    this.registry = registry;
  }

  /**
   * Update agent availability for role assignment
   */
  updateAgentAvailability(agentId: string, availability: AgentAvailability): void {
    this.agentAvailability.set(agentId, availability);
  }

  /**
   * Analyze task and assign optimal role
   */
  assignRole(taskType: string, taskId: string, availableAgents: Agent[]): RoleAssignment | null {
    const compatibleRoles = this.registry.getByTaskType(taskType);
    if (compatibleRoles.length === 0) {
      return null;
    }

    // Find best role-agent combination
    let bestAssignment: RoleAssignment | null = null;

    for (const role of compatibleRoles) {
      for (const agent of availableAgents) {
        if (!this.canAgentHandleRole(agent, role)) continue;

        const confidence = this.calculateConfidence(agent, role, taskType);
        const reasoning = this.buildReasoning(agent, role, confidence);

        if (!bestAssignment || confidence > bestAssignment.confidence) {
          bestAssignment = {
            roleDefinition: role,
            agentId: agent.id,
            confidence,
            reasoning,
            taskId,
          };
        }
      }
    }

    return bestAssignment;
  }

  /**
   * Check if agent can handle a role
   */
  private canAgentHandleRole(agent: Agent, role: RoleDefinition): boolean {
    // Check if agent role matches preferred agent types
    if (role.preferredAgentTypes && role.preferredAgentTypes.length > 0) {
      if (!role.preferredAgentTypes.includes(agent.role)) {
        return false;
      }
    }

    // Check capability overlap
    const agentCapabilities = new Set(agent.capabilities);
    const requiredCapabilities = role.capabilities;
    
    const hasCapabilities = requiredCapabilities.every(cap => agentCapabilities.has(cap));
    if (!hasCapabilities) {
      // Check partial capability match
      const matchRatio = requiredCapabilities.filter(cap => agentCapabilities.has(cap)).length / requiredCapabilities.length;
      if (matchRatio < 0.5) return false;
    }

    // Check availability
    const availability = this.agentAvailability.get(agent.id);
    if (availability) {
      if (availability.currentLoad >= availability.maxLoad) return false;
    }

    return true;
  }

  /**
   * Calculate confidence score for role-agent-task combination
   */
  private calculateConfidence(agent: Agent, role: RoleDefinition, taskType: string): number {
    let confidence = 0.5; // Base confidence

    // Role compatibility (higher if role supports task type directly)
    if (role.compatibleTaskTypes.includes(taskType)) {
      confidence += 0.3;
    }

    // Agent role match
    if (role.preferredAgentTypes?.includes(agent.role)) {
      confidence += 0.2;
    }

    // Capability overlap
    const agentCaps = new Set(agent.capabilities);
    const matchCount = role.capabilities.filter(c => agentCaps.has(c)).length;
    confidence += (matchCount / role.capabilities.length) * 0.2;

    // Availability bonus
    const availability = this.agentAvailability.get(agent.id);
    if (availability) {
      const loadFactor = 1 - (availability.currentLoad / availability.maxLoad);
      confidence += loadFactor * 0.1;
      confidence += availability.successRate * 0.1;
    }

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Build reasoning string for assignment
   */
  private buildReasoning(agent: Agent, role: RoleDefinition, confidence: number): string {
    const parts: string[] = [];

    if (role.preferredAgentTypes?.includes(agent.role)) {
      parts.push(`${agent.name} matches preferred agent type for ${role.name}`);
    }

    const matchedCaps = role.capabilities.filter(c => agent.capabilities.includes(c));
    if (matchedCaps.length > 0) {
      parts.push(`has ${matchedCaps.length}/${role.capabilities.length} required capabilities`);
    }

    const availability = this.agentAvailability.get(agent.id);
    if (availability) {
      parts.push(`${Math.round((1 - availability.currentLoad / availability.maxLoad) * 100)}% capacity available`);
    }

    parts.push(`${Math.round(confidence * 100)}% confidence`);

    return parts.join('. ');
  }

  /**
   * Batch assign roles for multi-step task
   */
  assignRolesForChain(taskTypes: string[], taskId: string, availableAgents: Agent[]): RoleAssignment[] {
    const assignments: RoleAssignment[] = [];
    const assignedAgents = new Set<string>();

    for (const taskType of taskTypes) {
      // Prefer agents not yet assigned in this chain
      const preferredAgents = availableAgents.filter(a => !assignedAgents.has(a.id));
      const agentsToConsider = preferredAgents.length > 0 ? preferredAgents : availableAgents;

      const assignment = this.assignRole(taskType, taskId, agentsToConsider);
      if (assignment) {
        assignments.push(assignment);
        assignedAgents.add(assignment.agentId);
      }
    }

    return assignments;
  }
}

// ============================================================================
// RoleChainExecutor - Executes multi-step role chains
// ============================================================================

class RoleChainExecutor {
  private registry: RoleRegistry;
  private assigner: RoleAssigner;

  constructor(registry: RoleRegistry, assigner: RoleAssigner) {
    this.registry = registry;
    this.assigner = assigner;
  }

  /**
   * Create a role chain from template
   */
  createChain(config: {
    id: string;
    name: string;
    description: string;
    steps: Array<{
      roleId: string;
      inputMapping?: Record<string, string>;
      outputMapping?: Record<string, string>;
      condition?: RoleChainCondition;
    }>;
    resultAggregator?: string;
  }): RoleChain {
    return {
      id: config.id,
      name: config.name,
      description: config.description,
      steps: config.steps.map(s => ({
        roleId: s.roleId,
        inputMapping: s.inputMapping,
        outputMapping: s.outputMapping,
        condition: s.condition,
      })),
      resultAggregator: config.resultAggregator,
      status: 'idle',
    };
  }

  /**
   * Execute a role chain
   */
  async executeChain(
    chain: RoleChain,
    initialInput: unknown,
    availableAgents: Agent[],
    executeFn: (roleId: string, agentId: string, input: unknown) => Promise<unknown>
  ): Promise<RoleChainStepResult[]> {
    const results: RoleChainStepResult[] = [];
    let currentInput = initialInput;

    chain.status = 'running';

    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];
      const role = this.registry.get(step.roleId);

      if (!role) {
        results.push({
          stepIndex: i,
          roleId: step.roleId,
          agentId: '',
          input: currentInput,
          output: undefined,
          status: 'failed',
          error: `Role ${step.roleId} not found`,
        });
        chain.status = 'failed';
        break;
      }

      // Check condition if exists
      if (step.condition && !this.evaluateCondition(step.condition, currentInput)) {
        results.push({
          stepIndex: i,
          roleId: step.roleId,
          agentId: '',
          input: currentInput,
          output: undefined,
          status: 'skipped',
        });
        continue;
      }

      // Assign role to agent
      const assignment = this.assigner.assignRole(
        role.compatibleTaskTypes[0],
        `chain_${chain.id}_step_${i}`,
        availableAgents
      );

      if (!assignment) {
        results.push({
          stepIndex: i,
          roleId: step.roleId,
          agentId: '',
          input: currentInput,
          output: undefined,
          status: 'failed',
          error: 'No available agent for role',
        });
        chain.status = 'failed';
        break;
      }

      // Map input from previous step output
      let mappedInput = currentInput;
      if (step.inputMapping && results.length > 0) {
        const prevResult = results[results.length - 1];
        if (prevResult.status === 'completed') {
          mappedInput = this.mapInput(step.inputMapping, prevResult.output);
        }
      }

      // Execute step
      const startTime = Date.now();
      try {
        const output = await executeFn(assignment.roleDefinition.role, assignment.agentId, mappedInput);
        
        results.push({
          stepIndex: i,
          roleId: step.roleId,
          agentId: assignment.agentId,
          input: mappedInput,
          output,
          status: 'completed',
          duration: Date.now() - startTime,
        });

        currentInput = step.outputMapping 
          ? this.mapOutput(step.outputMapping, output) 
          : output;
      } catch (error) {
        results.push({
          stepIndex: i,
          roleId: step.roleId,
          agentId: assignment.agentId,
          input: mappedInput,
          output: undefined,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime,
        });
        chain.status = 'failed';
        break;
      }
    }

    if (chain.status === 'running') {
      chain.status = 'completed';
    }

    return results;
  }

  /**
   * Evaluate a chain condition
   */
  private evaluateCondition(condition: RoleChainCondition, data: unknown): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);
    
    switch (condition.operator) {
      case 'eq': return fieldValue === condition.value;
      case 'neq': return fieldValue !== condition.value;
      case 'gt': return typeof fieldValue === 'number' && fieldValue > (condition.value as number);
      case 'lt': return typeof fieldValue === 'number' && fieldValue < (condition.value as number);
      case 'gte': return typeof fieldValue === 'number' && fieldValue >= (condition.value as number);
      case 'lte': return typeof fieldValue === 'number' && fieldValue <= (condition.value as number);
      case 'exists': return fieldValue !== undefined && fieldValue !== null;
      case 'not_exists': return fieldValue === undefined || fieldValue === null;
      default: return true;
    }
  }

  /**
   * Get nested value from object using dot notation path
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Map input from previous step output using mapping config
   */
  private mapInput(mapping: Record<string, string>, prevOutput: unknown): unknown {
    const result: Record<string, unknown> = {};
    
    for (const [key, path] of Object.entries(mapping)) {
      result[key] = this.getNestedValue(prevOutput, path);
    }
    
    return result;
  }

  /**
   * Map output for next step using mapping config
   */
  private mapOutput(mapping: Record<string, string>, output: unknown): unknown {
    const result: Record<string, unknown> = {};
    
    for (const [key, path] of Object.entries(mapping)) {
      result[key] = this.getNestedValue(output, path);
    }
    
    return Object.keys(result).length > 0 ? result : output;
  }
}

// ============================================================================
// DynamicRoleConfig - Runtime role configuration
// ============================================================================

class DynamicRoleConfigManager {
  private configs: Map<string, DynamicRoleConfig> = new Map();

  /**
   * Update role configuration
   */
  updateConfig(roleId: string, updates: Partial<DynamicRoleConfig>, updatedBy?: string): void {
    const existing = this.configs.get(roleId);
    
    this.configs.set(roleId, {
      roleId,
      enabled: updates.enabled ?? existing?.enabled ?? true,
      maxConcurrentTasks: updates.maxConcurrentTasks ?? existing?.maxConcurrentTasks,
      priority: updates.priority ?? existing?.priority,
      capabilities: updates.capabilities ?? existing?.capabilities,
      updatedAt: Date.now(),
      updatedBy,
    });
  }

  /**
   * Get configuration for role
   */
  getConfig(roleId: string): DynamicRoleConfig | undefined {
    return this.configs.get(roleId);
  }

  /**
   * Get all configurations
   */
  listConfigs(): DynamicRoleConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Apply dynamic config to role definition
   */
  applyConfig(role: RoleDefinition): RoleDefinition {
    const config = this.configs.get(role.id);
    if (!config) return role;

    return {
      ...role,
      maxConcurrentTasks: config.maxConcurrentTasks ?? role.maxConcurrentTasks,
      priority: config.priority ?? role.priority,
      capabilities: config.capabilities ?? role.capabilities,
    };
  }

  /**
   * Reset configuration to default
   */
  resetConfig(roleId: string): void {
    this.configs.delete(roleId);
  }
}

// ============================================================================
// RoleAnalytics - Track role usage and performance
// ============================================================================

class RoleAnalyticsCollector {
  private analytics: Map<string, RoleAnalytics> = new Map();

  /**
   * Record role assignment
   */
  recordAssignment(
    roleId: string,
    success: boolean,
    executionTime: number,
    confidence: number
  ): void {
    const existing = this.analytics.get(roleId) || {
      roleId,
      totalAssignments: 0,
      successfulAssignments: 0,
      failedAssignments: 0,
      averageExecutionTime: 0,
      averageConfidence: 0,
      lastUsedAt: 0,
      loadFactor: 0,
    };

    existing.totalAssignments++;
    
    if (success) {
      existing.successfulAssignments++;
    } else {
      existing.failedAssignments++;
    }

    // Update running averages
    const n = existing.totalAssignments;
    existing.averageExecutionTime = 
      (existing.averageExecutionTime * (n - 1) + executionTime) / n;
    existing.averageConfidence = 
      (existing.averageConfidence * (n - 1) + confidence) / n;
    existing.lastUsedAt = Date.now();

    // Update load factor (higher = more used recently)
    existing.loadFactor = Math.min(1, existing.totalAssignments / 100);

    this.analytics.set(roleId, existing);
  }

  /**
   * Get analytics for role
   */
  getAnalytics(roleId: string): RoleAnalytics | undefined {
    return this.analytics.get(roleId);
  }

  /**
   * Get all analytics
   */
  listAnalytics(): RoleAnalytics[] {
    return Array.from(this.analytics.values());
  }

  /**
   * Get most used roles
   */
  getMostUsedRoles(limit: number = 5): RoleAnalytics[] {
    return this.listAnalytics()
      .sort((a, b) => b.totalAssignments - a.totalAssignments)
      .slice(0, limit);
  }

  /**
   * Get roles needing attention (low success rate)
   */
  getProblemRoles(threshold: number = 0.5): RoleAnalytics[] {
    return this.listAnalytics().filter(a => {
      const successRate = a.successfulAssignments / Math.max(1, a.totalAssignments);
      return successRate < threshold;
    });
  }

  /**
   * Clear analytics
   */
  clear(): void {
    this.analytics.clear();
  }
}

// ============================================================================
// RoleSpecialist - Main Export
// ============================================================================

export class RoleSpecialist {
  readonly registry: RoleRegistry;
  readonly assigner: RoleAssigner;
  readonly chainExecutor: RoleChainExecutor;
  readonly dynamicConfig: DynamicRoleConfigManager;
  readonly analytics: RoleAnalyticsCollector;

  constructor() {
    this.registry = new RoleRegistry();
    this.assigner = new RoleAssigner(this.registry);
    this.chainExecutor = new RoleChainExecutor(this.registry, this.assigner);
    this.dynamicConfig = new DynamicRoleConfigManager();
    this.analytics = new RoleAnalyticsCollector();
  }

  /**
   * Initialize with custom roles
   */
  initialize(customRoles?: RoleDefinition[]): void {
    if (customRoles) {
      customRoles.forEach(role => this.registry.register(role));
    }
  }

  /**
   * Assign role for a task
   */
  assignRole(taskType: string, taskId: string, availableAgents: Agent[]): RoleAssignment | null {
    const assignment = this.assigner.assignRole(taskType, taskId, availableAgents);
    
    if (assignment) {
      // Track assignment for analytics
      this.analytics.recordAssignment(
        assignment.roleDefinition.id,
        true, // Optimistic
        0,    // Will be updated on completion
        assignment.confidence
      );
    }

    return assignment;
  }

  /**
   * Create and execute a role chain
   */
  async executeRoleChain(
    chainConfig: {
      id: string;
      name: string;
      description: string;
      steps: Array<{
        roleId: string;
        inputMapping?: Record<string, string>;
        outputMapping?: Record<string, string>;
        condition?: RoleChainCondition;
      }>;
      resultAggregator?: string;
    },
    initialInput: unknown,
    availableAgents: Agent[],
    executeFn: (roleId: string, agentId: string, input: unknown) => Promise<unknown>
  ): Promise<RoleChainStepResult[]> {
    const chain = this.chainExecutor.createChain(chainConfig);
    return this.chainExecutor.executeChain(chain, initialInput, availableAgents, executeFn);
  }

  /**
   * Create custom role from template
   */
  createCustomRole(templateId: string, overrides?: Partial<RoleDefinition>): RoleDefinition | undefined {
    return this.registry.createFromTemplate(templateId, overrides);
  }

  /**
   * Export role as template
   */
  exportRoleAsTemplate(roleId: string): RoleTemplate | undefined {
    return this.registry.exportAsTemplate(roleId);
  }

  /**
   * Update role configuration at runtime
   */
  updateRoleConfig(roleId: string, updates: Partial<DynamicRoleConfig>, updatedBy?: string): void {
    this.dynamicConfig.updateConfig(roleId, updates, updatedBy);
  }

  /**
   * Get role with dynamic config applied
   */
  getRole(roleId: string): RoleDefinition | undefined {
    const role = this.registry.get(roleId);
    return role ? this.dynamicConfig.applyConfig(role) : undefined;
  }

  /**
   * Get role usage analytics
   */
  getRoleAnalytics(roleId?: string): RoleAnalytics | RoleAnalytics[] | undefined {
    if (roleId) {
      return this.analytics.getAnalytics(roleId);
    }
    return this.analytics.listAnalytics();
  }

  /**
   * Get role assignment recommendations
   */
  getRecommendations(taskType: string, availableAgents: Agent[]): RoleAssignment[] {
    const roles = this.registry.getByTaskType(taskType);
    const recommendations: RoleAssignment[] = [];

    for (const role of roles) {
      for (const agent of availableAgents) {
        const assignment = this.assigner.assignRole(taskType, `rec_${Date.now()}`, [agent]);
        if (assignment && assignment.confidence > 0.5) {
          recommendations.push(assignment);
        }
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }
}

// ============================================================================
// Exports
// ============================================================================

export const roleSpecialist = new RoleSpecialist();

export default roleSpecialist;

// Re-export types
export type {
  RoleDefinition,
  RoleAssignment,
  RoleChain,
  RoleChainStep,
  RoleChainStepResult,
  RoleTemplate,
  DynamicRoleConfig,
  RoleAnalytics,
  AgentAvailability,
  RoleChainCondition,
} from './types';