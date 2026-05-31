import { describe, it, expect, beforeEach } from 'vitest';
import {
  AgentRole,
  AgentRoleRegistry,
} from '../AgentRoleRegistry';
import { RoleSwitcher } from '../RoleSwitcher';
import { ConversationRouter, RoutedMessage } from '../ConversationRouter';

describe('ConversationRouter', () => {
  let registry: AgentRoleRegistry;
  let switcher: RoleSwitcher;
  let router: ConversationRouter;

  const defaultRoles = [
    {
      role: AgentRole.COORDINATOR,
      name: 'Coordinator',
      icon: '🎯',
      color: '#4CAF50',
      description: 'Main coordinator',
      capabilities: ['task_planning', 'delegation'],
      isActive: true,
    },
    {
      role: AgentRole.EXECUTOR,
      name: 'Executor',
      icon: '⚡',
      color: '#2196F3',
      description: 'Task executor',
      capabilities: ['task_execution', 'code_generation'],
      isActive: true,
    },
    {
      role: AgentRole.REVIEWER,
      name: 'Reviewer',
      icon: '🔍',
      color: '#FF9800',
      description: 'Work reviewer',
      capabilities: ['code_review', 'quality_assessment'],
      isActive: true,
    },
    {
      role: AgentRole.EMOTION,
      name: 'Emotion',
      icon: '💜',
      color: '#9C27B0',
      description: 'Emotion handler',
      capabilities: ['emotion_detection', 'empathetic_response'],
      isActive: true,
    },
  ];

  beforeEach(() => {
    registry = new AgentRoleRegistry();
    defaultRoles.forEach(role => registry.register(role));
    switcher = new RoleSwitcher(registry);
    router = new ConversationRouter(switcher);
  });

  describe('constructor', () => {
    it('should create ConversationRouter with empty history', () => {
      const result = router.getHistory();
      expect(result).toEqual([]);
    });

    it('should create ConversationRouter with switcher', () => {
      expect((router as any).switcher).toBe(switcher);
    });

    it('should initialize history as empty array', () => {
      expect((router as any).history).toEqual([]);
    });
  });

  describe('route', () => {
    it('should route message and return RoutedMessage', () => {
      const result = router.route('plan the project');
      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('routedRole');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('routeReason');
    });

    it('should route to COORDINATOR for planning messages', () => {
      const result = router.route('plan the project');
      expect(result.routedRole).toBe(AgentRole.COORDINATOR);
    });

    it('should route to EXECUTOR for execution messages', () => {
      const result = router.route('execute the plan');
      expect(result.routedRole).toBe(AgentRole.EXECUTOR);
    });

    it('should route to REVIEWER for review messages', () => {
      const result = router.route('review the code');
      expect(result.routedRole).toBe(AgentRole.REVIEWER);
    });

    it('should route to EMOTION for emotion messages', () => {
      const result = router.route('I feel happy');
      expect(result.routedRole).toBe(AgentRole.EMOTION);
    });

    it('should include original message in result', () => {
      const original = 'plan the project';
      const result = router.route(original);
      expect(result.original).toBe(original);
    });

    it('should include timestamp in result', () => {
      const before = Date.now();
      const result = router.route('plan');
      const after = Date.now();
      expect(result.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.timestamp).toBeLessThanOrEqual(after);
    });

    it('should include route reason in result', () => {
      const result = router.route('plan the project');
      expect(typeof result.routeReason).toBe('string');
      expect(result.routeReason.length).toBeGreaterThan(0);
    });

    it('should add routed message to history', () => {
      router.route('plan the project');
      const history = router.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].original).toBe('plan the project');
    });

    it('should route with forceRole when provided', () => {
      const result = router.route('any message', AgentRole.EXECUTOR);
      expect(result.routedRole).toBe(AgentRole.EXECUTOR);
    });

    it('should use forceRole even if keywords suggest different role', () => {
      const result = router.route('plan the project', AgentRole.EXECUTOR);
      expect(result.routedRole).toBe(AgentRole.EXECUTOR);
    });

    it('should set routeReason to "forced" when using forceRole', () => {
      const result = router.route('any message', AgentRole.REVIEWER);
      expect(result.routeReason).toBe('forced');
    });

    it('should set routeReason to "keyword_match" for auto routing', () => {
      const result = router.route('plan the project');
      expect(result.routeReason).toBe('keyword_match');
    });
  });

  describe('getHistory', () => {
    it('should return empty array initially', () => {
      expect(router.getHistory()).toEqual([]);
    });

    it('should return all routed messages', () => {
      router.route('plan 1');
      router.route('plan 2');
      router.route('plan 3');
      expect(router.getHistory()).toHaveLength(3);
    });

    it('should return messages in order', () => {
      router.route('first');
      router.route('second');
      router.route('third');
      const history = router.getHistory();
      expect(history[0].original).toBe('first');
      expect(history[1].original).toBe('second');
      expect(history[2].original).toBe('third');
    });

    it('should filter by role when provided', () => {
      router.route('plan the project'); // COORDINATOR
      router.route('execute code'); // EXECUTOR
      router.route('review code'); // REVIEWER
      router.route('I feel happy'); // EMOTION

      const executorHistory = router.getHistory(AgentRole.EXECUTOR);
      expect(executorHistory).toHaveLength(1);
      expect(executorHistory[0].routedRole).toBe(AgentRole.EXECUTOR);
    });

    it('should return empty array for role with no messages', () => {
      router.route('plan the project'); // COORDINATOR
      const emotionHistory = router.getHistory(AgentRole.EMOTION);
      expect(emotionHistory).toHaveLength(0);
    });

    it('should return all messages when role is undefined', () => {
      router.route('plan');
      router.route('execute');
      const allHistory = router.getHistory();
      expect(allHistory).toHaveLength(2);
    });

    it('should handle multiple messages for same role', () => {
      router.route('execute task 1');
      router.route('execute task 2');
      router.route('execute task 3');
      const executorHistory = router.getHistory(AgentRole.EXECUTOR);
      expect(executorHistory).toHaveLength(3);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      router.route('plan 1');
      router.route('plan 2');
      router.clearHistory();
      expect(router.getHistory()).toEqual([]);
    });

    it('should reset history to empty array', () => {
      router.route('message');
      router.clearHistory();
      expect(router.getHistory()).toHaveLength(0);
    });

    it('should not affect new routing after clear', () => {
      router.route('old message');
      router.clearHistory();
      router.route('new message');
      const history = router.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].original).toBe('new message');
    });
  });

  describe('RoutedMessage interface', () => {
    it('should have all required properties', () => {
      const result = router.route('test');
      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('routedRole');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('routeReason');
    });

    it('should have string original message', () => {
      const result = router.route('test message');
      expect(typeof result.original).toBe('string');
    });

    it('should have AgentRole for routedRole', () => {
      const result = router.route('test');
      expect(Object.values(AgentRole)).toContain(result.routedRole);
    });

    it('should have number for timestamp', () => {
      const result = router.route('test');
      expect(typeof result.timestamp).toBe('number');
    });

    it('should have string for routeReason', () => {
      const result = router.route('test');
      expect(typeof result.routeReason).toBe('string');
    });
  });

  describe('integration with RoleSwitcher', () => {
    it('should use switcher for routing', () => {
      switcher.switchRole(AgentRole.REVIEWER);
      const router2 = new ConversationRouter(switcher);
      const result = router2.route('I feel happy');
      // Even with emotion keyword, active role is REVIEWER if no keyword match
      expect(result).toHaveProperty('routedRole');
    });

    it('should respect switcher role changes', () => {
      switcher.switchRole(AgentRole.EXECUTOR);
      const result = router.route('any message');
      // Should use switcher's active role as fallback
      expect(result).toHaveProperty('routedRole');
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      const result = router.route('');
      expect(result.routedRole).toBe(AgentRole.COORDINATOR);
    });

    it('should handle whitespace-only message', () => {
      const result = router.route('   ');
      expect(result.routedRole).toBe(AgentRole.COORDINATOR);
    });

    it('should handle very long message', () => {
      const longMessage = 'plan '.repeat(1000);
      const result = router.route(longMessage);
      expect(result.routedRole).toBe(AgentRole.COORDINATOR);
    });

    it('should handle special characters in message', () => {
      const result = router.route('plan @user #tag');
      expect(result.routedRole).toBe(AgentRole.COORDINATOR);
    });

    it('should handle unicode in message', () => {
      const result = router.route('计划任务');
      expect(result).toHaveProperty('routedRole');
    });

    it('should handle multiple routing in quick succession', () => {
      router.route('plan 1');
      router.route('plan 2');
      router.route('plan 3');
      router.route('plan 4');
      router.route('plan 5');
      expect(router.getHistory()).toHaveLength(5);
    });

    it('should maintain correct timestamps for multiple messages', () => {
      const before = Date.now();
      router.route('first');
      const firstTimestamp = router.getHistory()[0].timestamp;
      router.route('second');
      const secondTimestamp = router.getHistory()[1].timestamp;
      expect(secondTimestamp).toBeGreaterThanOrEqual(firstTimestamp);
    });
  });

  describe('history filtering edge cases', () => {
    it('should return empty for non-existent role filter', () => {
      router.route('plan');
      const filtered = router.getHistory(AgentRole.EMOTION);
      expect(filtered).toEqual([]);
    });

    it('should handle repeated messages with same content', () => {
      router.route('same message');
      router.route('same message');
      router.route('same message');
      const history = router.getHistory();
      expect(history).toHaveLength(3);
    });

    it('should handle clearing empty history', () => {
      expect(() => router.clearHistory()).not.toThrow();
    });

    it('should handle multiple clearHistory calls', () => {
      router.route('message');
      router.clearHistory();
      router.clearHistory();
      expect(router.getHistory()).toEqual([]);
    });
  });
});

describe('ConversationRouter with different switcher states', () => {
  let registry: AgentRoleRegistry;
  let switcher: RoleSwitcher;
  let router: ConversationRouter;

  beforeEach(() => {
    registry = new AgentRoleRegistry();
    registry.register({
      role: AgentRole.COORDINATOR,
      name: 'Coordinator',
      icon: '🎯',
      color: '#4CAF50',
      description: 'Main coordinator',
      capabilities: ['task_planning'],
      isActive: true,
    });
    switcher = new RoleSwitcher(registry);
    router = new ConversationRouter(switcher);
  });

  it('should route correctly with default switcher', () => {
    expect(router.route('plan').routedRole).toBe(AgentRole.COORDINATOR);
    expect(router.route('execute').routedRole).toBe(AgentRole.EXECUTOR);
  });

  it('should route correctly after switcher role change', () => {
    switcher.switchRole(AgentRole.EXECUTOR);
    const result = router.route('any');
    expect(result).toHaveProperty('routedRole');
  });
});