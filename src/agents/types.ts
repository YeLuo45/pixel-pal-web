/**
 * RoleSpecialist Types
 */

import { type AgentRole } from '../types/agent';

// ChatDev role constants
export const ChatDevRole = {
  ARCHITECT: 'architect',
  CODER: 'coder',
  REVIEWER: 'reviewer',
  TESTER: 'tester',
  DOCUMENTER: 'documenter',
  ORCHESTRATOR: 'orchestrator',
} as const;

export type ChatDevRole = typeof ChatDevRole[keyof typeof ChatDevRole];

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
  priority: number;
  hotSwappable: boolean;
}

/**
 * Role assignment result with reasoning
 */
export interface RoleAssignment {
  roleDefinition: RoleDefinition;
  agentId: string;
  confidence: number;
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
  duration?: number;
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
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
  condition?: RoleChainCondition;
  retryCount?: number;
  timeout?: number;
}

export interface RoleChainCondition {
  field: string;
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
  averageExecutionTime: number;
  averageConfidence: number;
  lastUsedAt: number;
  loadFactor: number;
}

/**
 * Agent availability for role assignment
 */
export interface AgentAvailability {
  agentId: string;
  currentLoad: number;
  maxLoad: number;
  successRate: number;
  recentRoles: string[];
}