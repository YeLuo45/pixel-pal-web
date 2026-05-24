/**
 * Role Execution Types - V144 Role Execution Engine
 */

export type RoleExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'aborted';

export interface ExecutionResult {
  roleId: string;
  status: RoleExecutionStatus;
  startTime: number;
  endTime: number;
  duration: number; // ms
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
  hookEvents: HookEvent[];
}

export interface RoleMetrics {
  roleId: string;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  avgDuration: number; // ms
  minDuration: number;
  maxDuration: number;
  peakConcurrency: number;
  errorTypes: Record<string, number>;
  lastExecutedAt: number;
}

export interface HookEvent {
  hook: 'onEnter' | 'onExit' | 'onError';
  timestamp: number;
  context: Record<string, unknown>;
  error?: string;
}

export interface ChainExecutionState {
  chainId: string;
  status: 'running' | 'completed' | 'failed' | 'aborted';
  roleStates: Record<string, RoleExecutionStatus>;
  currentRoleId: string | null;
  startTime: number;
  results: ExecutionResult[];
}

export interface ExecutionContext {
  chainId: string;
  executionId: string;
  variables: Record<string, unknown>;
}