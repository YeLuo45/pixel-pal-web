import { describe, it, expect, beforeEach } from 'vitest';
import {
  AgentRole,
  AgentRoleRegistry,
} from '../AgentRoleRegistry';
import { RoleSwitcher, RoutingRule } from '../RoleSwitcher';

describe('RoleSwitcher', () => {
  let registry: AgentRoleRegistry;
  let switcher: RoleSwitcher;

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
  });

  describe('constructor', () => {
    it('should create RoleSwitcher with default active role as COORDINATOR', () => {
      expect(switcher.getActiveRole()).toBe(AgentRole.COORDINATOR);
    });

    it('should have no custom rules initially', () => {
      const customRules = (switcher as any).customRules;
      expect(Array.isArray(customRules)).toBe(true);
      expect(customRules).toHaveLength(0);
    });

    it('should have default routing rules from DEFAULT_ROUTING_RULES', () => {
      const defaultRules = (switcher as any).defaultRules;
      expect(Array.isArray(defaultRules)).toBe(true);
      expect(defaultRules.length).toBeGreaterThan(0);
    });

    it('should accept registry in constructor', () => {
      expect((switcher as any).registry).toBe(registry);
    });
  });

  describe('route', () => {
    it('should return COORDINATOR for planning messages by default', () => {
      expect(switcher.route('plan the project')).toBe(AgentRole.COORDINATOR);
    });

    it('should return EXECUTOR for execution messages', () => {
      expect(switcher.route('execute the plan')).toBe(AgentRole.EXECUTOR);
    });

    it('should return EXECUTOR for code-related messages', () => {
      expect(switcher.route('write a function')).toBe(AgentRole.EXECUTOR);
      expect(switcher.route('build the component')).toBe(AgentRole.EXECUTOR);
    });

    it('should return REVIEWER for review messages', () => {
      expect(switcher.route('review the code')).toBe(AgentRole.REVIEWER);
    });

    it('should return REVIEWER for critique messages', () => {
      expect(switcher.route('critique the design')).toBe(AgentRole.REVIEWER);
      expect(switcher.route('check quality')).toBe(AgentRole.REVIEWER);
    });

    it('should return EMOTION for emotion-related messages', () => {
      expect(switcher.route('I feel happy')).toBe(AgentRole.EMOTION);
      expect(switcher.route('emotional response')).toBe(AgentRole.EMOTION);
    });

    it('should return EMOTION for empathy messages', () => {
      expect(switcher.route('I feel sad today')).toBe(AgentRole.EMOTION);
      expect(switcher.route('empathize with me')).toBe(AgentRole.EMOTION);
    });

    it('should return default role for unrecognized messages', () => {
      expect(switcher.route('random unknown message')).toBe(AgentRole.COORDINATOR);
    });

    it('should be case insensitive', () => {
      expect(switcher.route('PLAN the project')).toBe(AgentRole.COORDINATOR);
      expect(switcher.route('Execute the plan')).toBe(AgentRole.EXECUTOR);
    });

    it('should respect custom routing rules', () => {
      switcher.addRule({ keywords: ['urgent', 'asap'], targetRole: AgentRole.EXECUTOR });
      expect(switcher.route('urgent task needed')).toBe(AgentRole.EXECUTOR);
    });

    it('should prioritize custom rules over default keyword matching', () => {
      switcher.addRule({ keywords: ['check'], targetRole: AgentRole.EXECUTOR });
      // 'check' would normally route to REVIEWER, but custom rule overrides
      expect(switcher.route('check this now')).toBe(AgentRole.EXECUTOR);
    });
  });

  describe('switchRole', () => {
    it('should switch to specified role', () => {
      switcher.switchRole(AgentRole.EXECUTOR);
      expect(switcher.getActiveRole()).toBe(AgentRole.EXECUTOR);
    });

    it('should switch to COORDINATOR', () => {
      switcher.switchRole(AgentRole.COORDINATOR);
      expect(switcher.getActiveRole()).toBe(AgentRole.COORDINATOR);
    });

    it('should switch to REVIEWER', () => {
      switcher.switchRole(AgentRole.REVIEWER);
      expect(switcher.getActiveRole()).toBe(AgentRole.REVIEWER);
    });

    it('should switch to EMOTION', () => {
      switcher.switchRole(AgentRole.EMOTION);
      expect(switcher.getActiveRole()).toBe(AgentRole.EMOTION);
    });

    it('should allow multiple role switches', () => {
      switcher.switchRole(AgentRole.EXECUTOR);
      switcher.switchRole(AgentRole.REVIEWER);
      switcher.switchRole(AgentRole.EMOTION);
      expect(switcher.getActiveRole()).toBe(AgentRole.EMOTION);
    });
  });

  describe('addRule', () => {
    it('should add a routing rule', () => {
      const rule: RoutingRule = { keywords: ['deploy'], targetRole: AgentRole.EXECUTOR };
      switcher.addRule(rule);
      expect(switcher.route('deploy now')).toBe(AgentRole.EXECUTOR);
    });

    it('should add multiple rules', () => {
      switcher.addRule({ keywords: ['deploy'], targetRole: AgentRole.EXECUTOR });
      switcher.addRule({ keywords: ['analyze'], targetRole: AgentRole.REVIEWER });
      expect(switcher.route('deploy')).toBe(AgentRole.EXECUTOR);
      expect(switcher.route('analyze')).toBe(AgentRole.REVIEWER);
    });

    it('should allow multiple keywords for same rule', () => {
      switcher.addRule({
        keywords: ['urgent', 'asap', 'immediately'],
        targetRole: AgentRole.EXECUTOR,
      });
      expect(switcher.route('urgent task')).toBe(AgentRole.EXECUTOR);
      expect(switcher.route('asap please')).toBe(AgentRole.EXECUTOR);
      expect(switcher.route('immediately execute')).toBe(AgentRole.EXECUTOR);
    });

    it('should handle empty keyword array', () => {
      switcher.addRule({ keywords: [], targetRole: AgentRole.EXECUTOR });
      expect(switcher.route('any message')).toBe(AgentRole.COORDINATOR);
    });

    it('should handle rule with single keyword', () => {
      switcher.addRule({ keywords: ['hack'], targetRole: AgentRole.EXECUTOR });
      expect(switcher.route('hack the system')).toBe(AgentRole.EXECUTOR);
    });
  });

  describe('getActiveRole', () => {
    it('should return current active role', () => {
      expect(switcher.getActiveRole()).toBe(AgentRole.COORDINATOR);
      switcher.switchRole(AgentRole.EXECUTOR);
      expect(switcher.getActiveRole()).toBe(AgentRole.EXECUTOR);
    });

    it('should return COORDINATOR by default', () => {
      expect(switcher.getActiveRole()).toBe(AgentRole.COORDINATOR);
    });
  });

  describe('setActiveRole', () => {
    it('should set active role directly', () => {
      switcher.setActiveRole(AgentRole.REVIEWER);
      expect(switcher.getActiveRole()).toBe(AgentRole.REVIEWER);
    });

    it('should be equivalent to switchRole', () => {
      switcher.setActiveRole(AgentRole.EMOTION);
      expect(switcher.getActiveRole()).toBe(AgentRole.EMOTION);
      switcher.switchRole(AgentRole.EXECUTOR);
      expect(switcher.getActiveRole()).toBe(AgentRole.EXECUTOR);
    });

    it('should allow switching to all roles', () => {
      switcher.setActiveRole(AgentRole.COORDINATOR);
      expect(switcher.getActiveRole()).toBe(AgentRole.COORDINATOR);
      switcher.setActiveRole(AgentRole.EXECUTOR);
      expect(switcher.getActiveRole()).toBe(AgentRole.EXECUTOR);
      switcher.setActiveRole(AgentRole.REVIEWER);
      expect(switcher.getActiveRole()).toBe(AgentRole.REVIEWER);
      switcher.setActiveRole(AgentRole.EMOTION);
      expect(switcher.getActiveRole()).toBe(AgentRole.EMOTION);
    });
  });

  describe('routing behavior', () => {
    it('should return active role for empty message', () => {
      expect(switcher.route('')).toBe(AgentRole.COORDINATOR);
      switcher.switchRole(AgentRole.EXECUTOR);
      expect(switcher.route('')).toBe(AgentRole.EXECUTOR);
    });

    it('should return active role for whitespace-only message', () => {
      expect(switcher.route('   ')).toBe(AgentRole.COORDINATOR);
    });

    it('should route mixed keyword messages correctly', () => {
      // EXECUTOR keywords come first in mappings, so 'execute' matches first
      expect(switcher.route('plan and execute')).toBe(AgentRole.EXECUTOR);
    });

    it('should handle messages with special characters', () => {
      expect(switcher.route('plan @task #urgent')).toBe(AgentRole.COORDINATOR);
    });

    it('should handle unicode in messages', () => {
      // Unicode routing depends on registry's keyword mappings
      // Since registry doesn't have unicode keywords, it falls back to active role
      expect(switcher.route('计划任务')).toBe(AgentRole.COORDINATOR);
      // Note: '执行代码' contains '执行' which is not a keyword, falls to coordinator
      expect(switcher.route('执行代码')).toBe(AgentRole.COORDINATOR);
    });
  });

  describe('edge cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'plan '.repeat(1000);
      expect(switcher.route(longMessage)).toBe(AgentRole.COORDINATOR);
    });

    it('should handle messages with newlines', () => {
      expect(switcher.route('plan\nthe\nproject')).toBe(AgentRole.COORDINATOR);
    });

    it('should handle messages with tabs', () => {
      expect(switcher.route('plan\tthe\tproject')).toBe(AgentRole.COORDINATOR);
    });

    it('should handle registry with no roles', () => {
      const emptyRegistry = new AgentRoleRegistry();
      const emptySwitcher = new RoleSwitcher(emptyRegistry);
      expect(emptySwitcher.route('plan')).toBe(AgentRole.COORDINATOR);
    });

    it('should not affect registry when routing', () => {
      switcher.route('execute code');
      expect(registry.getRole(AgentRole.EXECUTOR)?.isActive).toBe(true);
    });
  });

  describe('RuleSwitcher integration with registry', () => {
    it('should use registry for role lookups', () => {
      registry.setActive(AgentRole.EXECUTOR, false);
      switcher.switchRole(AgentRole.EXECUTOR);
      expect(switcher.getActiveRole()).toBe(AgentRole.EXECUTOR);
    });

    it('should handle deactivated roles in routing', () => {
      registry.setActive(AgentRole.EXECUTOR, false);
      // Even if deactivated, route should still return the role based on keywords
      expect(switcher.route('execute code')).toBe(AgentRole.EXECUTOR);
    });
  });
});

describe('RoutingRule interface', () => {
  it('should accept valid routing rule structure', () => {
    const rule: RoutingRule = {
      keywords: ['test', 'example'],
      targetRole: AgentRole.COORDINATOR,
    };
    expect(rule.keywords).toContain('test');
    expect(rule.targetRole).toBe(AgentRole.COORDINATOR);
  });
});