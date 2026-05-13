/**
 * RoleSystem - V98 Agent Professional Role System
 * Unified exports for all role system components
 */

// Agent Registry - Role profiles and specialty matching
export {
  roleAgentRegistry,
  AGENT_PROFILES,
  default as AgentRegistry,
} from './AgentRegistry'
export type {
  AgentProfile,
  AgentRole,
} from './AgentRegistry'

// Task Complexity Evaluator - Complexity scoring
export {
  taskComplexityEvaluator,
  COMPLEXITY_TEST_CASES,
  default as TaskComplexityEvaluator,
} from './TaskComplexityEvaluator'
export type {
  TaskComplexity,
  TaskComplexityInput,
  RiskLevel,
  ComplexityFactor,
} from './TaskComplexityEvaluator'

// Task Assigner - Smart assignment based on complexity
export {
  taskAssigner,
  default as TaskAssigner,
} from './TaskAssigner'
export type {
  TaskAssignment,
  UserTask,
} from './TaskAssigner'

// Role Prompt Builder - Role-specific prompt templates
export {
  rolePromptBuilder,
  default as RolePromptBuilder,
} from './RolePromptBuilder'
export type {
  PromptContext,
  SystemPromptResult,
} from './RolePromptBuilder'
