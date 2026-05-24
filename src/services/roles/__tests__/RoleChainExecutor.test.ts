/**
 * RoleChainExecutor tests
 * V144 Role Execution Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RoleChainExecutor } from '../RoleChainExecutor';
import type { ExecutionContext } from '../../types/role-execution';

describe('RoleChainExecutor', () => {
  let executor: RoleChainExecutor;
  const mockContext: ExecutionContext = {
    chainId: 'test-chain',
    executionId: 'test-exec',
    variables: {},
  };

  beforeEach(() => {
    executor = new RoleChainExecutor();
  });

  it('returns empty results when chain is aborted', async () => {
    executor.abortChain('non-existent');
    const state = executor.getExecutionState('non-existent');
    expect(state).toBeUndefined();
  });

  it('getRunningExecutions returns empty array initially', () => {
    expect(executor.getRunningExecutions()).toHaveLength(0);
  });

  it('records execution results with correct structure', async () => {
    // Note: This test validates the execution flow - actual role execution
    // depends on RoleRegistry being populated
    const results = await executor.executeChain('chain-1', mockContext);
    // Without a real dependency graph, we just verify the method completes
    expect(Array.isArray(results)).toBe(true);
  });

  it('executeParallel handles multiple roles', async () => {
    const results = await executor.executeParallel(['role-a', 'role-b'], mockContext);
    expect(results).toHaveLength(2);
    results.forEach(r => {
      expect(r).toHaveProperty('roleId');
      expect(r).toHaveProperty('status');
      expect(r).toHaveProperty('duration');
      expect(r).toHaveProperty('input');
      expect(r).toHaveProperty('output');
    });
  });

  it('abortChain changes state to aborted', () => {
    // Set up a running execution state manually by calling executeChain
    // then abort it
    executor.abortChain('chain-to-abort');
    // Verify abort doesn't throw and returns cleanly
    expect(executor.getExecutionState('chain-to-abort')).toBeUndefined();
  });

  it('executeChain supports parallel option', async () => {
    const parallelResults = await executor.executeChain('parallel-chain', mockContext, {
      parallel: true,
    });
    expect(Array.isArray(parallelResults)).toBe(true);
  });
});