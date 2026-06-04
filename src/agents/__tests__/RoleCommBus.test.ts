/**
 * RoleCommBus Tests
 * chatdev Multi-Agent Communication
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RoleCommBus } from '../RoleCommBus';
import type { AgentMessage, Subscription } from '../types';

describe('RoleCommBus', () => {
  let bus: RoleCommBus;

  beforeEach(() => {
    bus = new RoleCommBus();
    // Reset singleton for clean state
    (RoleCommBus as unknown as { getInstance(): RoleCommBus }).getInstance = () => {
      return bus;
    };
  });

  afterEach(() => {
    bus.reset();
  });

  describe('publish', () => {
    it('should add message to history', () => {
      bus.publish({
        from: 'agent-a',
        to: '',
        type: 'notification',
        payload: { text: 'hello' },
        priority: 'normal',
      });

      const history = bus.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].payload).toEqual({ text: 'hello' });
    });

    it('should generate unique id and timestamp', () => {
      bus.publish({ from: 'a', to: '', type: 'notification', payload: null });
      const history = bus.getHistory();

      expect(history[0].id).toMatch(/^msg-/);
      expect(typeof history[0].timestamp).toBe('number');
    });

    it('should deliver to matching subscribers', () => {
      const callback = vi.fn();
      bus.subscribe({
        agentId: 'agent-b',
        messageTypes: ['notification'],
        callback,
      });

      bus.publish({
        from: 'agent-a',
        to: '',
        type: 'notification',
        payload: { text: 'test' },
        priority: 'normal',
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0].payload).toEqual({ text: 'test' });
    });

    it('should NOT deliver to subscriber for different type', () => {
      const callback = vi.fn();
      bus.subscribe({
        agentId: 'agent-b',
        messageTypes: ['task'],
        callback,
      });

      bus.publish({
        from: 'agent-a',
        to: '',
        type: 'notification',
        payload: null,
        priority: 'normal',
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('send', () => {
    it('should send direct message to specific agent', () => {
      const callback = vi.fn();
      bus.subscribe({
        agentId: 'agent-b',
        messageTypes: ['task'],
        callback,
      });

      bus.send('agent-a', 'agent-b', 'task', { cmd: 'do something' });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0].from).toBe('agent-a');
      expect(callback.mock.calls[0][0].to).toBe('agent-b');
      expect(callback.mock.calls[0][0].type).toBe('task');
    });

    it('should support high priority', () => {
      bus.send('a', 'b', 'task', null, 'high');
      const history = bus.getHistory();
      expect(history[0].priority).toBe('high');
    });

    it('should default to normal priority', () => {
      bus.send('a', 'b', 'task', null);
      const history = bus.getHistory();
      expect(history[0].priority).toBe('normal');
    });
  });

  describe('subscribe', () => {
    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsub = bus.subscribe({
        agentId: 'agent-b',
        messageTypes: ['task'],
        callback,
      });

      unsub();

      bus.publish({ from: 'a', to: '', type: 'task', payload: null });
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple subscriptions per agent', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      bus.subscribe({ agentId: 'agent-b', messageTypes: ['task'], callback: cb1 });
      bus.subscribe({ agentId: 'agent-b', messageTypes: ['result'], callback: cb2 });

      bus.publish({ from: 'a', to: '', type: 'task', payload: null });
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).not.toHaveBeenCalled();

      bus.publish({ from: 'a', to: '', type: 'result', payload: null });
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHistory', () => {
    it('should return all messages by default', () => {
      bus.publish({ from: 'a', to: '', type: 'task', payload: null });
      bus.publish({ from: 'b', to: '', type: 'result', payload: null });
      expect(bus.getHistory()).toHaveLength(2);
    });

    it('should filter by from', () => {
      bus.publish({ from: 'a', to: '', type: 'task', payload: null });
      bus.publish({ from: 'b', to: '', type: 'task', payload: null });

      const fromA = bus.getHistory('a');
      expect(fromA).toHaveLength(1);
      expect(fromA[0].from).toBe('a');
    });

    it('should filter by to', () => {
      bus.send('a', 'b', 'task', null);
      bus.send('a', 'c', 'task', null);

      const toB = bus.getHistory(undefined, 'b');
      expect(toB).toHaveLength(1);
      expect(toB[0].to).toBe('b');
    });

    it('should respect limit', () => {
      for (let i = 0; i < 10; i++) {
        bus.publish({ from: `a-${i}`, to: '', type: 'task', payload: null });
      }

      const recent = bus.getHistory(undefined, undefined, 5);
      expect(recent).toHaveLength(5);
    });
  });

  describe('clearHistory', () => {
    it('should clear all messages', () => {
      bus.publish({ from: 'a', to: '', type: 'task', payload: null });
      bus.clearHistory();
      expect(bus.getHistory()).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should clear messages and subscriptions', () => {
      bus.subscribe({ agentId: 'b', messageTypes: ['task'], callback: vi.fn() });
      bus.publish({ from: 'a', to: '', type: 'task', payload: null });
      bus.reset();

      expect(bus.getHistory()).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should not throw when subscriber callback throws', () => {
      const badCallback = () => { throw new Error('callback error'); };
      bus.subscribe({ agentId: 'b', messageTypes: ['task'], callback: badCallback });

      expect(() => {
        bus.publish({ from: 'a', to: '', type: 'task', payload: null });
      }).not.toThrow();
    });
  });

  describe('message ordering', () => {
    it('should maintain FIFO order', () => {
      for (let i = 0; i < 5; i++) {
        bus.publish({ from: `a-${i}`, to: '', type: 'task', payload: i });
      }

      const history = bus.getHistory();
      for (let i = 0; i < 5; i++) {
        expect(history[i].from).toBe(`a-${i}`);
      }
    });
  });

  describe('maxHistory limit', () => {
    it('should cap history at maxHistory', () => {
      const smallBus = new RoleCommBus(3);
      for (let i = 0; i < 10; i++) {
        smallBus.publish({ from: `a-${i}`, to: '', type: 'task', payload: null });
      }

      expect(smallBus.getHistory()).toHaveLength(3);
    });
  });
});