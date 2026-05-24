/**
 * RoleHookManager - Role lifecycle hook management
 * V144 Role Execution Engine
 */

import type { HookEvent, ExecutionContext } from '../../types/role-execution';

export type RoleHookType =
  | 'onRoleEnter'
  | 'onRoleExit'
  | 'onRoleError'
  | 'onChainStart'
  | 'onChainEnd'
  | 'onChainAbort';

type HookCallback = (...args: unknown[]) => void;

interface ChainHookPayload {
  chainId: string;
  executionId: string;
  context: ExecutionContext;
}

interface RoleHookPayload {
  roleId: string;
  context: ExecutionContext;
  result?: unknown;
  error?: string;
}

export class RoleHookManager {
  private hooks: Map<RoleHookType, Set<HookCallback>> = new Map();
  private eventLog: HookEvent[] = [];
  private maxLogSize = 1000;

  /**
   * Register a hook callback
   */
  on(hookType: RoleHookType, callback: HookCallback): () => void {
    let callbacks = this.hooks.get(hookType);
    if (!callbacks) {
      callbacks = new Set();
      this.hooks.set(hookType, callbacks);
    }
    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks!.delete(callback);
    };
  }

  /**
   * Unregister a hook callback
   */
  off(hookType: RoleHookType, callback: HookCallback): void {
    const callbacks = this.hooks.get(hookType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Clear all hooks for a specific type
   */
  clearHooks(hookType?: RoleHookType): void {
    if (hookType) {
      this.hooks.delete(hookType);
    } else {
      this.hooks.clear();
    }
  }

  /**
   * Trigger onRoleEnter hook
   */
  triggerRoleEnter(roleId: string, context: ExecutionContext): void {
    this.emitHookEvent('onEnter', context);
    const callbacks = this.hooks.get('onRoleEnter');
    if (callbacks) {
      const payload: RoleHookPayload = { roleId, context };
      callbacks.forEach(cb => cb(payload));
    }
  }

  /**
   * Trigger onRoleExit hook
   */
  triggerRoleExit(roleId: string, context: ExecutionContext, result: unknown): void {
    this.emitHookEvent('onExit', context);
    const callbacks = this.hooks.get('onRoleExit');
    if (callbacks) {
      const payload: RoleHookPayload = { roleId, context, result };
      callbacks.forEach(cb => cb(payload));
    }
  }

  /**
   * Trigger onRoleError hook
   */
  triggerRoleError(roleId: string, error: string, context: ExecutionContext): void {
    this.emitHookEvent('onError', context, error);
    const callbacks = this.hooks.get('onRoleError');
    if (callbacks) {
      const payload: RoleHookPayload = { roleId, context, error };
      callbacks.forEach(cb => cb(payload));
    }
  }

  /**
   * Trigger onChainStart hook
   */
  triggerChainStart(chainId: string, executionId: string, context: ExecutionContext): void {
    const callbacks = this.hooks.get('onChainStart');
    if (callbacks) {
      const payload: ChainHookPayload = { chainId, executionId, context };
      callbacks.forEach(cb => cb(payload));
    }
  }

  /**
   * Trigger onChainEnd hook
   */
  triggerChainEnd(chainId: string, executionId: string, context: ExecutionContext): void {
    const callbacks = this.hooks.get('onChainEnd');
    if (callbacks) {
      const payload: ChainHookPayload = { chainId, executionId, context };
      callbacks.forEach(cb => cb(payload));
    }
  }

  /**
   * Trigger onChainAbort hook
   */
  triggerChainAbort(chainId: string, executionId: string, context: ExecutionContext): void {
    const callbacks = this.hooks.get('onChainAbort');
    if (callbacks) {
      const payload: ChainHookPayload = { chainId, executionId, context };
      callbacks.forEach(cb => cb(payload));
    }
  }

  /**
   * Get hook event log
   */
  getEventLog(roleId?: string): HookEvent[] {
    if (roleId) {
      return this.eventLog.filter(e => (e.context['roleId'] as string) === roleId);
    }
    return [...this.eventLog];
  }

  /**
   * Clear event log
   */
  clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Get recent events for a specific context
   */
  getRecentEvents(executionId: string, limit: number = 50): HookEvent[] {
    return this.eventLog
      .filter(e => (e.context['executionId'] as string) === executionId)
      .slice(-limit);
  }

  private emitHookEvent(
    hook: 'onEnter' | 'onExit' | 'onError',
    context: ExecutionContext,
    error?: string
  ): void {
    const event: HookEvent = {
      hook,
      timestamp: Date.now(),
      context: { ...context },
      error,
    };

    this.eventLog.push(event);

    // Trim log if it exceeds max size
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }
  }
}

// Singleton instance
export const roleHookManager = new RoleHookManager();