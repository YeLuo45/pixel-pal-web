/**
 * RoleMetrics tests
 * V144 Role Execution Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RoleMetricsCollector } from '../RoleMetrics';
import type { ExecutionResult } from '../../types/role-execution';

describe('RoleMetricsCollector', () => {
  let metrics: RoleMetricsCollector;

  beforeEach(() => {
    metrics = new RoleMetricsCollector();
  });

  const makeResult = (
    roleId: string,
    status: 'completed' | 'failed',
    duration: number,
    error?: string
  ): ExecutionResult => ({
    roleId,
    status,
    startTime: Date.now() - duration,
    endTime: Date.now(),
    duration,
    input: {},
    output: { result: 'ok' },
    error,
    hookEvents: [],
  });

  it('records execution and computes avgDuration', () => {
    metrics.recordExecution(makeResult('role1', 'completed', 100));
    metrics.recordExecution(makeResult('role1', 'completed', 200));
    const m = metrics.getMetrics('role1');
    expect(m).not.toBeNull();
    expect(m!.avgDuration).toBe(150);
  });

  it('tracks successCount and failureCount', () => {
    metrics.recordExecution(makeResult('roleA', 'completed', 50));
    metrics.recordExecution(makeResult('roleA', 'failed', 30));
    metrics.recordExecution(makeResult('roleA', 'completed', 70));
    const m = metrics.getMetrics('roleA')!;
    expect(m.totalExecutions).toBe(3);
    expect(m.successCount).toBe(2);
    expect(m.failureCount).toBe(1);
  });

  it('counts error types on failures', () => {
    metrics.recordExecution(makeResult('roleB', 'failed', 10, 'timeout error'));
    metrics.recordExecution(makeResult('roleB', 'failed', 10, 'timeout error'));
    metrics.recordExecution(makeResult('roleB', 'failed', 10, 'network error'));
    const m = metrics.getMetrics('roleB')!;
    expect(m.errorTypes['timeout']).toBe(2);
    expect(m.errorTypes['network']).toBe(1);
  });

  it('tracks peakConcurrency', () => {
    metrics.onRoleStart('roleX');
    metrics.onRoleStart('roleX');
    metrics.onRoleStart('roleY');
    const mx = metrics.getMetrics('roleX');
    const my = metrics.getMetrics('roleY');
    expect(mx!.peakConcurrency).toBe(2);
    expect(my!.peakConcurrency).toBe(1);
  });

  it('resets metrics for a role or all', () => {
    metrics.recordExecution(makeResult('roleC', 'completed', 50));
    metrics.recordExecution(makeResult('roleD', 'completed', 60));
    metrics.resetMetrics('roleC');
    expect(metrics.getMetrics('roleC')).toBeNull();
    expect(metrics.getMetrics('roleD')).not.toBeNull();
    metrics.resetMetrics();
    expect(metrics.getAllMetrics()).toHaveLength(0);
  });
});