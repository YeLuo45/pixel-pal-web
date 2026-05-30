/**
 * ToolLifecycleHook Tests
 * V166: Tests for the lifecycle hook system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  addHook,
  removeHook,
  getHooks,
  clearHooks,
  getHookCount,
  executeHooks,
  createHookContext,
  hasHook,
  getHook,
  updateHook,
  HookType,
  HookContext,
  ToolLifecycleHook,
} from '../ToolLifecycleHook';

describe('ToolLifecycleHook', () => {
  beforeEach(() => {
    clearHooks();
  });

  afterEach(() => {
    clearHooks();
  });

  describe('addHook', () => {
    it('should add a hook and return an ID', () => {
      const id = addHook({
        type: 'beforeRegister',
        handler: async () => {},
        order: 10,
      });

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.startsWith('hook_')).toBe(true);
    });

    it('should add a hook with tool filter', () => {
      const id = addHook({
        type: 'beforeCall',
        tool: 'specificTool',
        handler: async () => {},
        order: 10,
      });

      const hook = getHook(id);
      expect(hook?.tool).toBe('specificTool');
    });

    it('should use default order of 100', () => {
      const id = addHook({
        type: 'afterRegister',
        handler: async () => {},
      });

      const hook = getHook(id);
      expect(hook?.order).toBe(100);
    });

    it('should store the handler correctly', () => {
      const handler = async (ctx: HookContext) => {
        ctx.result = 'modified';
      };

      const id = addHook({
        type: 'afterCall',
        handler,
        order: 10,
      });

      const hook = getHook(id);
      expect(hook?.handler).toBe(handler);
    });

    it('should increment hook count', () => {
      expect(getHookCount()).toBe(0);

      addHook({ type: 'beforeRegister', handler: async () => {}, order: 1 });
      addHook({ type: 'afterRegister', handler: async () => {}, order: 2 });

      expect(getHookCount()).toBe(2);
    });
  });

  describe('removeHook', () => {
    it('should remove an existing hook', () => {
      const id = addHook({
        type: 'beforeRegister',
        handler: async () => {},
        order: 10,
      });

      expect(removeHook(id)).toBe(true);
      expect(hasHook(id)).toBe(false);
    });

    it('should return false for non-existent hook', () => {
      expect(removeHook('nonExistentId')).toBe(false);
    });

    it('should decrease hook count after removal', () => {
      const id = addHook({ type: 'beforeRegister', handler: async () => {}, order: 1 });
      addHook({ type: 'afterRegister', handler: async () => {}, order: 2 });

      expect(getHookCount()).toBe(2);
      removeHook(id);
      expect(getHookCount()).toBe(1);
    });
  });

  describe('getHooks', () => {
    it('should return all hooks when no filter', () => {
      addHook({ type: 'beforeRegister', handler: async () => {}, order: 1 });
      addHook({ type: 'afterRegister', handler: async () => {}, order: 2 });
      addHook({ type: 'beforeCall', handler: async () => {}, order: 3 });

      const hooks = getHooks();
      expect(hooks.length).toBe(3);
    });

    it('should filter by hook type', () => {
      addHook({ type: 'beforeRegister', handler: async () => {}, order: 1 });
      addHook({ type: 'afterRegister', handler: async () => {}, order: 2 });
      addHook({ type: 'beforeRegister', handler: async () => {}, order: 3 });

      const hooks = getHooks('beforeRegister');
      expect(hooks.length).toBe(2);
      hooks.forEach(h => expect(h.type).toBe('beforeRegister'));
    });

    it('should filter by tool name', () => {
      addHook({ type: 'beforeCall', tool: 'toolA', handler: async () => {}, order: 1 });
      addHook({ type: 'beforeCall', tool: 'toolB', handler: async () => {}, order: 2 });
      addHook({ type: 'beforeCall', handler: async () => {}, order: 3 }); // No tool filter

      const hooks = getHooks('beforeCall', 'toolA');
      expect(hooks.length).toBe(1);
      expect(hooks[0].tool).toBe('toolA');
    });

    it('should include hooks without tool filter when filtering by tool', () => {
      addHook({ type: 'beforeCall', tool: 'toolA', handler: async () => {}, order: 1 });
      addHook({ type: 'beforeCall', handler: async () => {}, order: 2 }); // Global hook

      const hooks = getHooks('beforeCall', 'toolA');
      expect(hooks.length).toBe(2);
    });

    it('should sort hooks by order (lower first)', () => {
      addHook({ type: 'beforeRegister', handler: async () => {}, order: 100 });
      addHook({ type: 'beforeRegister', handler: async () => {}, order: 1 });
      addHook({ type: 'beforeRegister', handler: async () => {}, order: 50 });

      const hooks = getHooks('beforeRegister');
      expect(hooks[0].order).toBe(1);
      expect(hooks[1].order).toBe(50);
      expect(hooks[2].order).toBe(100);
    });
  });

  describe('clearHooks', () => {
    it('should remove all hooks', () => {
      addHook({ type: 'beforeRegister', handler: async () => {}, order: 1 });
      addHook({ type: 'afterRegister', handler: async () => {}, order: 2 });
      addHook({ type: 'beforeCall', handler: async () => {}, order: 3 });

      clearHooks();

      expect(getHookCount()).toBe(0);
      expect(getHooks()).toEqual([]);
    });
  });

  describe('getHookCount', () => {
    it('should return 0 for empty store', () => {
      expect(getHookCount()).toBe(0);
    });
  });

  describe('hasHook', () => {
    it('should return true for existing hook', () => {
      const id = addHook({ type: 'beforeRegister', handler: async () => {}, order: 1 });
      expect(hasHook(id)).toBe(true);
    });

    it('should return false for non-existent hook', () => {
      expect(hasHook('nonExistent')).toBe(false);
    });
  });

  describe('getHook', () => {
    it('should return hook by ID', () => {
      const id = addHook({ type: 'afterCall', handler: async () => {}, order: 5 });
      const hook = getHook(id);

      expect(hook).toBeDefined();
      expect(hook?.id).toBe(id);
      expect(hook?.type).toBe('afterCall');
      expect(hook?.order).toBe(5);
    });

    it('should return undefined for non-existent ID', () => {
      expect(getHook('nonExistent')).toBeUndefined();
    });
  });

  describe('updateHook', () => {
    it('should update handler of existing hook', () => {
      const id = addHook({ type: 'beforeCall', handler: async () => {}, order: 1 });
      const newHandler = async (ctx: HookContext) => {
        ctx.result = 'updated';
      };

      const result = updateHook(id, newHandler);
      expect(result).toBe(true);

      const hook = getHook(id);
      expect(hook?.handler).toBe(newHandler);
    });

    it('should return false for non-existent hook', () => {
      const newHandler = async (ctx: HookContext) => {};
      expect(updateHook('nonExistent', newHandler)).toBe(false);
    });
  });

  describe('executeHooks', () => {
    it('should execute all hooks of a type', async () => {
      let executionOrder: number[] = [];

      addHook({
        type: 'beforeRegister',
        handler: async () => { executionOrder.push(1); },
        order: 2,
      });
      addHook({
        type: 'beforeRegister',
        handler: async () => { executionOrder.push(2); },
        order: 1,
      });

      const context = createHookContext({ toolName: 'testTool' });
      await executeHooks('beforeRegister', context);

      expect(executionOrder).toEqual([2, 1]); // Order 1 before Order 2
    });

    it('should pass context to handlers', async () => {
      let receivedContext: HookContext | null = null;

      addHook({
        type: 'afterCall',
        handler: async (ctx) => { receivedContext = ctx; },
        order: 1,
      });

      const context = createHookContext({
        toolName: 'myTool',
        args: { arg1: 'value1' },
        result: 'success',
      });

      await executeHooks('afterCall', context);

      expect(receivedContext).toBeDefined();
      expect(receivedContext?.toolName).toBe('myTool');
      expect(receivedContext?.args).toEqual({ arg1: 'value1' });
      expect(receivedContext?.result).toBe('success');
    });

    it('should filter hooks by tool name when executing', async () => {
      let executions = 0;

      addHook({
        type: 'beforeCall',
        tool: 'toolA',
        handler: async () => { executions++; },
        order: 1,
      });
      addHook({
        type: 'beforeCall',
        tool: 'toolB',
        handler: async () => { executions++; },
        order: 2,
      });

      const context = createHookContext({ toolName: 'toolA' });
      await executeHooks('beforeCall', context, 'toolA');

      expect(executions).toBe(1);
    });

    it('should continue executing other hooks even if one fails', async () => {
      let executionCount = 0;

      addHook({
        type: 'beforeCall',
        handler: async () => { throw new Error('Hook 1 failed'); },
        order: 1,
      });
      addHook({
        type: 'beforeCall',
        handler: async () => { executionCount++; },
        order: 2,
      });

      const context = createHookContext();
      await executeHooks('beforeCall', context);

      expect(executionCount).toBe(1);
    });

    it('should handle sync and async handlers', async () => {
      let result = '';

      addHook({
        type: 'beforeRegister',
        handler: () => { result += 'sync '; },
        order: 1,
      });
      addHook({
        type: 'beforeRegister',
        handler: async () => { result += 'async '; },
        order: 2,
      });

      const context = createHookContext();
      await executeHooks('beforeRegister', context);

      expect(result).toBe('sync async ');
    });
  });

  describe('createHookContext', () => {
    it('should create context with timestamp', () => {
      const context = createHookContext();
      expect(context.timestamp).toBeDefined();
      expect(new Date(context.timestamp).toISOString()).toBe(context.timestamp);
    });

    it('should create context with partial data', () => {
      const context = createHookContext({
        toolName: 'testTool',
        agentId: 'agent1',
        args: { key: 'value' },
      });

      expect(context.toolName).toBe('testTool');
      expect(context.agentId).toBe('agent1');
      expect(context.args).toEqual({ key: 'value' });
    });

    it('should use provided timestamp', () => {
      const customTime = '2024-01-01T00:00:00.000Z';
      const context = createHookContext({ timestamp: customTime });
      expect(context.timestamp).toBe(customTime);
    });
  });

  describe('HookType enum values', () => {
    it('should support all hook types', () => {
      const hookTypes: HookType[] = [
        'beforeRegister',
        'afterRegister',
        'beforeCall',
        'afterCall',
        'beforeDiscover',
        'afterDiscover',
      ];

      hookTypes.forEach(type => {
        const id = addHook({ type, handler: async () => {}, order: 1 });
        const hook = getHook(id);
        expect(hook?.type).toBe(type);
      });
    });
  });
});