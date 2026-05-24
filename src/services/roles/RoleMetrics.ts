/**
 * RoleMetrics - Role performance metrics collection
 * V144 Role Execution Engine
 */

import type { RoleMetrics, ExecutionResult, RoleExecutionStatus } from '../../types/role-execution';

interface MetricSnapshot {
  roleId: string;
  timestamps: number[];
  durations: number[];
  successes: number;
  failures: number;
  errorTypes: Record<string, number>;
  peakConcurrency: number;
  lastExecutedAt: number;
}

export class RoleMetricsCollector {
  private snapshots: Map<string, MetricSnapshot> = new Map();
  private currentConcurrency: Map<string, number> = new Map();
  private peakConcurrency: Map<string, number> = new Map();

  /**
   * Record a role execution result
   */
  recordExecution(result: ExecutionResult): void {
    let snapshot = this.snapshots.get(result.roleId);
    if (!snapshot) {
      snapshot = this.createSnapshot(result.roleId);
      this.snapshots.set(result.roleId, snapshot);
    }

    snapshot.timestamps.push(result.startTime);
    snapshot.durations.push(result.duration);

    if (result.status === 'completed') {
      snapshot.successes++;
    } else if (result.status === 'failed') {
      snapshot.failures++;
      if (result.error) {
        const errorKey = this.categorizeError(result.error);
        snapshot.errorTypes[errorKey] = (snapshot.errorTypes[errorKey] || 0) + 1;
      }
    }

    snapshot.lastExecutedAt = result.endTime;

    // Update peak concurrency
    const current = this.currentConcurrency.get(result.roleId) || 0;
    const newPeak = Math.max(snapshot.peakConcurrency, current);
    snapshot.peakConcurrency = newPeak;
    this.peakConcurrency.set(result.roleId, newPeak);
  }

  /**
   * Increment concurrency counter when a role starts
   */
  onRoleStart(roleId: string): void {
    const current = (this.currentConcurrency.get(roleId) || 0) + 1;
    this.currentConcurrency.set(roleId, current);

    const snapshot = this.snapshots.get(roleId);
    if (snapshot) {
      snapshot.peakConcurrency = Math.max(snapshot.peakConcurrency, current);
      this.peakConcurrency.set(roleId, snapshot.peakConcurrency);
    }
  }

  /**
   * Decrement concurrency counter when a role ends
   */
  onRoleEnd(roleId: string): void {
    const current = this.currentConcurrency.get(roleId) || 0;
    this.currentConcurrency.set(roleId, Math.max(0, current - 1));
  }

  /**
   * Get metrics for a specific role
   */
  getMetrics(roleId: string): RoleMetrics | null {
    const snapshot = this.snapshots.get(roleId);
    if (!snapshot) return null;
    return this.buildMetrics(snapshot);
  }

  /**
   * Get metrics for all roles
   */
  getAllMetrics(): RoleMetrics[] {
    return Array.from(this.snapshots.values()).map(s => this.buildMetrics(s));
  }

  /**
   * Reset metrics for a role
   */
  resetMetrics(roleId?: string): void {
    if (roleId) {
      this.snapshots.delete(roleId);
      this.currentConcurrency.delete(roleId);
      this.peakConcurrency.delete(roleId);
    } else {
      this.snapshots.clear();
      this.currentConcurrency.clear();
      this.peakConcurrency.clear();
    }
  }

  private createSnapshot(roleId: string): MetricSnapshot {
    return {
      roleId,
      timestamps: [],
      durations: [],
      successes: 0,
      failures: 0,
      errorTypes: {},
      peakConcurrency: 0,
      lastExecutedAt: 0,
    };
  }

  private buildMetrics(snapshot: MetricSnapshot): RoleMetrics {
    const durations = snapshot.durations;
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    return {
      roleId: snapshot.roleId,
      totalExecutions: snapshot.timestamps.length,
      successCount: snapshot.successes,
      failureCount: snapshot.failures,
      avgDuration,
      minDuration,
      maxDuration,
      peakConcurrency: snapshot.peakConcurrency,
      errorTypes: { ...snapshot.errorTypes },
      lastExecutedAt: snapshot.lastExecutedAt,
    };
  }

  private categorizeError(error: string): string {
    // Simple error categorization based on error message patterns
    if (error.includes('timeout')) return 'timeout';
    if (error.includes('network') || error.includes('fetch')) return 'network';
    if (error.includes('validation')) return 'validation';
    if (error.includes('permission') || error.includes('unauthorized')) return 'permission';
    if (error.includes('not found') || error.includes('404')) return 'not_found';
    if (error.includes('internal')) return 'internal';
    return 'unknown';
  }
}

// Singleton instance
export const roleMetrics = new RoleMetricsCollector();