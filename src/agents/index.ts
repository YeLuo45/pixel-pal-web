/**
 * agents module
 * 
 * Multi-Agent Studio Panel for pixel-pal-web.
 * Implements hook-driven task queue with ruflo-style hooks.
 */

// AgentRole exports
export {
  AgentRole,
  ROLE_DESIGNER,
  ROLE_EXECUTOR,
  ROLE_REVIEWER,
  ROLE_COORDINATOR,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  ROLE_ICONS,
  createTask,
  createResult,
  createAgentMessage,
} from './AgentRole';

export type {
  TaskType,
  TaskStatus,
  Task,
  Result,
  AgentHook,
  AgentMessage,
  AgentConfig,
} from './AgentRole';

// HookDrivenTaskQueue exports
export {
  HookDrivenTaskQueue,
  createTaskQueue,
} from './HookDrivenTaskQueue';

export type {
  QueueConfig,
} from './HookDrivenTaskQueue';

// MultiAgentStudio exports
export {
  MultiAgentStudio,
} from './MultiAgentStudio';

export type {
  MultiAgentStudioProps,
} from './MultiAgentStudio';
