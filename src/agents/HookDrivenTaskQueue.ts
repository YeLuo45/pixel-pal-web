/**
 * HookDrivenTaskQueue.ts
 * 
 * Hook-driven task queue implementation with ruflo-style hooks.
 * Supports before/after/onError hooks for task lifecycle management.
 */

import type {
  Task,
  Result,
  AgentHook,
  TaskType,
  TaskStatus,
} from './AgentRole';
import { createResult } from './AgentRole';

export interface QueueConfig {
  /** Maximum concurrent tasks */
  maxConcurrent?: number;
  /** Default timeout for tasks (ms) */
  defaultTimeout?: number;
  /** Enable hook execution tracing */
  enableTracing?: boolean;
}

interface QueuedTask extends Task {
  hooks: AgentHook[];
  startTime?: number;
  endTime?: number;
  result?: Result;
}

/**
 * HookDrivenTaskQueue - Task queue with ruflo-style hook system
 * 
 * Features:
 * - before/after/onError hooks for task lifecycle
 * - Configurable concurrency
 * - Task status tracking
 * - Error handling with hooks
 */
export class HookDrivenTaskQueue {
  private queue: QueuedTask[] = [];
  private runningTasks: Map<string, QueuedTask> = new Map();
  private completedTasks: Map<string, QueuedTask> = new Map();
  private hooks: AgentHook[] = [];
  private config: Required<QueueConfig>;
  private isProcessing = false;
  private taskCounter = 0;

  constructor(config: QueueConfig = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 3,
      defaultTimeout: config.defaultTimeout ?? 30000,
      enableTracing: config.enableTracing ?? false,
    };
  }

  /**
   * Register a global hook
   */
  registerHook(hook: AgentHook): void {
    this.hooks.push(hook);
  }

  /**
   * Unregister a hook by name
   */
  unregisterHook(name: string): void {
    this.hooks = this.hooks.filter(h => h.name !== name);
  }

  /**
   * Get all registered hooks
   */
  getHooks(): AgentHook[] {
    return [...this.hooks];
  }

  /**
   * Get current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get number of currently running tasks
   */
  getRunningCount(): number {
    return this.runningTasks.size;
  }

  /**
   * Get number of completed tasks
   */
  getCompletedCount(): number {
    return this.completedTasks.size;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0 && this.runningTasks.size === 0;
  }

  /**
   * Enqueue a task with optional per-task hooks
   */
  enqueue(task: Task, taskHooks: AgentHook[] = []): string {
    const queuedTask: QueuedTask = {
      ...task,
      hooks: [...this.hooks, ...taskHooks],
    };
    this.queue.push(queuedTask);
    this.processQueue();
    return task.id;
  }

  /**
   * Enqueue multiple tasks at once
   */
  enqueueAll(tasks: Task[], taskHooks: AgentHook[] = []): string[] {
    const queuedTasks: QueuedTask[] = tasks.map(task => ({
      ...task,
      hooks: [...this.hooks, ...taskHooks],
    }));
    this.queue.push(...queuedTasks);
    this.processQueue();
    return tasks.map(t => t.id);
  }

  /**
   * Cancel a pending task
   */
  cancel(taskId: string): boolean {
    const index = this.queue.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get task by ID (from any state)
   */
  getTask(taskId: string): Task | undefined {
    return (
      this.queue.find(t => t.id === taskId) ||
      this.runningTasks.get(taskId) ||
      this.completedTasks.get(taskId)
    );
  }

  /**
   * Get all tasks (from all states)
   */
  getAllTasks(): Task[] {
    return [
      ...this.queue,
      ...Array.from(this.runningTasks.values()),
      ...Array.from(this.completedTasks.values()),
    ];
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter(t => t.status === status);
  }

  /**
   * Get tasks by type
   */
  getTasksByType(type: TaskType): Task[] {
    return this.getAllTasks().filter(t => t.type === type);
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): Task[] {
    return this.getTasksByStatus('pending');
  }

  /**
   * Get running tasks
   */
  getRunningTasks(): Task[] {
    return this.getTasksByStatus('running');
  }

  /**
   * Get completed tasks
   */
  getCompletedTasks(): Task[] {
    return this.getTasksByStatus('completed');
  }

  /**
   * Get failed tasks
   */
  getFailedTasks(): Task[] {
    return this.getTasksByStatus('failed');
  }

  /**
   * Clear completed tasks
   */
  clearCompleted(): void {
    this.completedTasks.clear();
  }

  /**
   * Clear all tasks (queue, running, and completed)
   */
  clearAll(): void {
    this.queue = [];
    this.runningTasks.clear();
    this.completedTasks.clear();
  }

  /**
   * Generate unique task ID
   */
  generateTaskId(): string {
    return `task_${++this.taskCounter}_${Date.now()}`;
  }

  /**
   * Process queue - start tasks up to maxConcurrent
   */
  private processQueue(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (
        this.queue.length > 0 &&
        this.runningTasks.size < this.config.maxConcurrent
      ) {
        const task = this.queue.shift();
        if (task) {
          this.startTask(task);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start executing a task with hooks
   */
  private async startTask(task: QueuedTask): Promise<void> {
    task.status = 'running';
    task.startTime = Date.now();
    this.runningTasks.set(task.id, task);

    try {
      // Execute before hooks - continue even if one fails
      let modifiedTask = task;
      for (const hook of task.hooks) {
        if (hook.before) {
          try {
            modifiedTask = await Promise.resolve(hook.before(modifiedTask));
          } catch (hookError) {
            console.error(`Error in before hook ${hook.name}:`, hookError);
          }
        }
      }

      // Execute the task (user-defined executor)
      const result = await this.executeTask(modifiedTask);

      // Execute after hooks - continue even if one fails
      for (const hook of task.hooks) {
        if (hook.after) {
          try {
            const modifiedResult = await Promise.resolve(hook.after(result, modifiedTask));
            if (modifiedResult) {
              task.result = modifiedResult;
            }
          } catch (hookError) {
            console.error(`Error in after hook ${hook.name}:`, hookError);
          }
        }
      }

      task.status = 'completed';
      task.result = result;
    } catch (error) {
      task.status = 'failed';
      const errorResult = createResult(
        task.id,
        false,
        undefined,
        error instanceof Error ? error.message : String(error)
      );
      task.result = errorResult;

      // Execute error hooks
      for (const hook of task.hooks) {
        if (hook.onError) {
          try {
            hook.onError(error instanceof Error ? error : new Error(String(error)), task);
          } catch (hookError) {
            console.error(`Error in onError hook ${hook.name}:`, hookError);
          }
        }
      }
    } finally {
      task.endTime = Date.now();
      this.runningTasks.delete(task.id);
      this.completedTasks.set(task.id, task);
      this.processQueue();
    }
  }

  /**
   * Execute the actual task - override this in subclass or provide executor
   */
  protected async executeTask(task: QueuedTask): Promise<Result> {
    // Default implementation - simulate task execution
    // Subclasses can override this to provide actual execution logic
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return createResult(
      task.id,
      true,
      { processed: true, payload: task.payload },
      undefined
    );
  }

  /**
   * Wait for all tasks to complete
   */
  async waitForCompletion(timeout?: number): Promise<void> {
    const startTime = Date.now();
    
    while (!this.isEmpty()) {
      if (timeout && Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for task completion');
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueLength: number;
    runningCount: number;
    completedCount: number;
    totalTasks: number;
  } {
    return {
      queueLength: this.queue.length,
      runningCount: this.runningTasks.size,
      completedCount: this.completedTasks.size,
      totalTasks: this.getAllTasks().length,
    };
  }
}

/**
 * Create a new HookDrivenTaskQueue with default configuration
 */
export function createTaskQueue(config?: QueueConfig): HookDrivenTaskQueue {
  return new HookDrivenTaskQueue(config);
}
