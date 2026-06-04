/**
 * AgentRole.ts
 * 
 * Multi-Agent Studio role definitions for pixel-pal-web.
 * Implements chatdev-style role specialization:
 * - Designer: Task decomposition and workflow design
 * - Executor: Execute specific tasks
 * - Reviewer: Quality and acceptance evaluation
 * - Coordinator: Task scheduling and result aggregation
 */

/**
 * Agent role types matching PRD specification
 */
export enum AgentRole {
  DESIGNER = 'designer',
  EXECUTOR = 'executor',
  REVIEWER = 'reviewer',
  COORDINATOR = 'coordinator',
}

/**
 * Task types that agents can handle
 */
export type TaskType = 'design' | 'execute' | 'review';

/**
 * Task status states
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Core task structure for hook-driven task queue
 */
export interface Task {
  id: string;
  type: TaskType;
  payload: unknown;
  status: TaskStatus;
  createdAt: number;
  agentId?: string;
}

/**
 * Result structure returned after task execution
 */
export interface Result {
  taskId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  completedAt: number;
}

/**
 * Agent hook interface for ruflo-style hook system
 * before: Transform/preprocess task before execution
 * after: Transform/postprocess result after execution
 * onError: Handle errors during execution
 */
export interface AgentHook {
  name: string;
  before?: (task: Task) => Task | Promise<Task>;
  after?: (result: Result, task: Task) => Result | Promise<Result>;
  onError?: (error: Error, task: Task) => void;
}

/**
 * Agent message structure for inter-agent communication
 * Matches PRD specification
 */
export interface AgentMessage {
  from: string;
  to: string;
  type: 'task' | 'result' | 'review' | 'error';
  payload: unknown;
  timestamp: number;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  description?: string;
  capabilities?: string[];
  hooks?: AgentHook[];
}

/**
 * Role constants for convenience
 */
export const ROLE_DESIGNER = AgentRole.DESIGNER;
export const ROLE_EXECUTOR = AgentRole.EXECUTOR;
export const ROLE_REVIEWER = AgentRole.REVIEWER;
export const ROLE_COORDINATOR = AgentRole.COORDINATOR;

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<AgentRole, string> = {
  [AgentRole.DESIGNER]: 'Task decomposition and workflow design',
  [AgentRole.EXECUTOR]: 'Execute specific tasks',
  [AgentRole.REVIEWER]: 'Quality and acceptance evaluation',
  [AgentRole.COORDINATOR]: 'Task scheduling and result aggregation',
};

/**
 * Role colors for UI visualization
 */
export const ROLE_COLORS: Record<AgentRole, string> = {
  [AgentRole.DESIGNER]: '#6366f1',   // Indigo
  [AgentRole.EXECUTOR]: '#22c55e',   // Green
  [AgentRole.REVIEWER]: '#f59e0b',   // Amber
  [AgentRole.COORDINATOR]: '#8b5cf6', // Violet
};

/**
 * Role icons (Lucide icon names)
 */
export const ROLE_ICONS: Record<AgentRole, string> = {
  [AgentRole.DESIGNER]: 'Pencil',
  [AgentRole.EXECUTOR]: 'Play',
  [AgentRole.REVIEWER]: 'CheckCircle',
  [AgentRole.COORDINATOR]: 'Layers',
};

/**
 * Create a new task with defaults
 */
export function createTask(
  id: string,
  type: TaskType,
  payload: unknown
): Task {
  return {
    id,
    type,
    payload,
    status: 'pending',
    createdAt: Date.now(),
  };
}

/**
 * Create a new result
 */
export function createResult(
  taskId: string,
  success: boolean,
  data?: unknown,
  error?: string
): Result {
  return {
    taskId,
    success,
    data,
    error,
    completedAt: Date.now(),
  };
}

/**
 * Create a new agent message
 */
export function createAgentMessage(
  from: string,
  to: string,
  type: AgentMessage['type'],
  payload: unknown
): AgentMessage {
  return {
    from,
    to,
    type,
    payload,
    timestamp: Date.now(),
  };
}
