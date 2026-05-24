/**
 * RoleHookManager tests
 * V144 Role Execution Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RoleHookManager } from '../RoleHookManager';
import type { ExecutionContext } from '../../types/role-execution';

describe('RoleHookManager', () => {
  let manager: RoleHookManager;

  const mockContext: ExecutionContext = {
    chainId: 'chain-1',
    executionId: 'exec-1',
    variables: { input: 'test' },
  };

  beforeEach(() => {
    manager = new RoleHookManager();
  });

  it('registers and calls onRoleEnter hook', () => {
    let called = false;
    let payload: unknown = null;
    manager.on('onRoleEnter', (p) => {
      called = true;
      payload = p;
    });
    manager.triggerRoleEnter('role1', mockContext);
    expect(called).toBe(true);
    expect((payload as any).roleId).toBe('role1');
  });

  it('registers and calls onRoleExit hook with result', () => {
    let called = false;
    manager.on('onRoleExit', (p) => { called = true; });
    manager.triggerRoleExit('role2', mockContext, { output: 'done' });
    expect(called).toBe(true);
  });

  it('registers and calls onRoleError hook with error', () => {
    let called = false;
    let errorMsg: string | undefined;
    manager.on('onRoleError', (p) => {
      called = true;
      errorMsg = (p as any).error;
    });
    manager.triggerRoleError('role3', 'something went wrong', mockContext);
    expect(called).toBe(true);
    expect(errorMsg).toBe('something went wrong');
  });

  it('returns unsubscribe function that removes the hook', () => {
    let count = 0;
    const unsub = manager.on('onRoleEnter', () => { count++; });
    manager.triggerRoleEnter('role1', mockContext);
    expect(count).toBe(1);
    unsub();
    manager.triggerRoleEnter('role2', mockContext);
    expect(count).toBe(1); // should not increment after unsubscribe
  });

  it('logs hook events and returns them via getEventLog', () => {
    manager.on('onRoleEnter', () => {});
    manager.triggerRoleEnter('role1', mockContext);
    manager.triggerRoleExit('role1', mockContext, {});
    const log = manager.getEventLog();
    expect(log.length).toBeGreaterThanOrEqual(2);
    expect(log.some(e => e.hook === 'onEnter')).toBe(true);
    expect(log.some(e => e.hook === 'onExit')).toBe(true);
  });
});