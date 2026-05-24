/**
 * RoleChainExecutor - Role chain execution engine with parallel/serial support
 * V144 Role Execution Engine
 */

import type {
  ExecutionResult,
  ExecutionContext,
  ChainExecutionState,
  RoleExecutionStatus,
  HookEvent,
} from '../../types/role-execution';
import { roleHookManager } from './RoleHookManager';
import { roleMetrics, RoleMetricsCollector } from './RoleMetrics';
import { RoleDependencyGraph } from '../agent/v122/graph/RoleDependencyGraph';
import { RoleRegistry } from '../agent/v120/roles/RoleRegistry';
import { RoleAssigner } from '../agent/v120/roles/RoleAssigner';
import type { RoleChain } from '../agent/v122/chain/RoleChain';

export class RoleChainExecutor {
  private runningExecutions: Map<string, ChainExecutionState> = new Map();
  private abortedExecutions: Set<string> = new Set();
  private registry: RoleRegistry;
  private assigner: RoleAssigner;
  private metrics: RoleMetricsCollector;

  constructor(
    registry?: RoleRegistry,
    assigner?: RoleAssigner,
    metrics?: RoleMetricsCollector
  ) {
    this.registry = registry || new RoleRegistry();
    this.assigner = assigner || new RoleAssigner(this.registry);
    this.metrics = metrics || roleMetrics;
  }

  /**
   * Execute a role chain (serial by default)
   */
  async executeChain(
    chainId: string,
    context: ExecutionContext,
    options?: { parallel?: boolean }
  ): Promise<ExecutionResult[]> {
    if (this.abortedExecutions.has(chainId)) {
      this.abortedExecutions.delete(chainId);
    }

    const state: ChainExecutionState = {
      chainId,
      status: 'running',
      roleStates: {},
      currentRoleId: null,
      startTime: Date.now(),
      results: [],
    };
    this.runningExecutions.set(chainId, state);

    roleHookManager.triggerChainStart(chainId, context.executionId, context);

    try {
      const graph = new RoleDependencyGraph();
      const executionOrder = graph.getTopologicalOrder(chainId);

      if (options?.parallel) {
        return await this.executeParallel(executionOrder, context, state);
      } else {
        return await this.executeSerial(executionOrder, context, state);
      }
    } catch (error) {
      state.status = 'failed';
      const errorMessage = error instanceof Error ? error.message : String(error);
      roleHookManager.triggerChainAbort(chainId, context.executionId, context);
      return [];
    }
  }

  /**
   * Execute multiple roles in parallel
   */
  async executeParallel(
    roleIds: string[],
    context: ExecutionContext,
    state: ChainExecutionState
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    // Increment concurrency for all roles
    roleIds.forEach(id => this.metrics.onRoleStart(id));

    const executions = roleIds.map(async (roleId) => {
      if (this.abortedExecutions.has(state.chainId)) {
        return this.createAbortedResult(roleId, context);
      }
      return this.executeSingleRole(roleId, context, state);
    });

    const settled = await Promise.allSettled(executions);
    settled.forEach((result, index) => {
      const roleId = roleIds[index];
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push(this.createErrorResult(roleId, context, result.reason));
      }
    });

    return results;
  }

  /**
   * Abort a running chain execution
   */
  abortChain(chainId: string): void {
    const state = this.runningExecutions.get(chainId);
    if (state && state.status === 'running') {
      state.status = 'aborted';
      this.abortedExecutions.add(chainId);
      roleHookManager.triggerChainAbort(chainId, '', {
        chainId,
        executionId: '',
        variables: {},
      });
    }
  }

  /**
   * Get execution state for a chain
   */
  getExecutionState(chainId: string): ChainExecutionState | undefined {
    return this.runningExecutions.get(chainId);
  }

  /**
   * Get all running executions
   */
  getRunningExecutions(): ChainExecutionState[] {
    return Array.from(this.runningExecutions.values()).filter(
      s => s.status === 'running'
    );
  }

  private async executeSerial(
    roleIds: string[],
    context: ExecutionContext,
    state: ChainExecutionState
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const roleId of roleIds) {
      if (this.abortedExecutions.has(state.chainId)) {
        results.push(this.createAbortedResult(roleId, context));
        continue;
      }

      const result = await this.executeSingleRole(roleId, context, state);
      results.push(result);

      if (result.status === 'failed') {
        break;
      }
    }

    return results;
  }

  private async executeSingleRole(
    roleId: string,
    context: ExecutionContext,
    state: ChainExecutionState
  ): Promise<ExecutionResult> {
    state.currentRoleId = roleId;
    state.roleStates[roleId] = 'running';
    this.metrics.onRoleStart(roleId);

    roleHookManager.triggerRoleEnter(roleId, context);

    const hookEvents: HookEvent[] = [];
    const startTime = Date.now();

    try {
      // Simulate role execution - in real implementation this would call the role executor
      const role = this.registry.get(roleId);
      const output = role
        ? { roleName: role.name, description: role.description }
        : { roleId };

      const result = await this.simulateExecution(context, output);

      state.roleStates[roleId] = 'completed';
      this.metrics.onRoleEnd(roleId);

      const endTime = Date.now();
      const executionResult: ExecutionResult = {
        roleId,
        status: 'completed',
        startTime,
        endTime,
        duration: endTime - startTime,
        input: { ...context.variables },
        output: result,
        hookEvents,
      };

      this.metrics.recordExecution(executionResult);
      roleHookManager.triggerRoleExit(roleId, context, result);

      return executionResult;
    } catch (error) {
      const endTime = Date.now();
      const errorMessage = error instanceof Error ? error.message : String(error);

      state.roleStates[roleId] = 'failed';
      this.metrics.onRoleEnd(roleId);

      const executionResult: ExecutionResult = {
        roleId,
        status: 'failed',
        startTime,
        endTime,
        duration: endTime - startTime,
        input: { ...context.variables },
        output: {},
        error: errorMessage,
        hookEvents,
      };

      this.metrics.recordExecution(executionResult);
      roleHookManager.triggerRoleError(roleId, errorMessage, context);

      return executionResult;
    }
  }

  private async simulateExecution(
    context: ExecutionContext,
    output: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Simulate async execution
    await new Promise(resolve => setTimeout(resolve, 10));
    return { ...context.variables, ...output };
  }

  private createAbortedResult(
    roleId: string,
    context: ExecutionContext
  ): ExecutionResult {
    const now = Date.now();
    return {
      roleId,
      status: 'aborted',
      startTime: now,
      endTime: now,
      duration: 0,
      input: { ...context.variables },
      output: {},
      hookEvents: [],
    };
  }

  private createErrorResult(
    roleId: string,
    context: ExecutionContext,
    error: unknown
  ): ExecutionResult {
    const now = Date.now();
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      roleId,
      status: 'failed',
      startTime: now,
      endTime: now,
      duration: 0,
      input: { ...context.variables },
      output: {},
      error: errorMessage,
      hookEvents: [],
    };
  }
}