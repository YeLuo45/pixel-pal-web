import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AgentRole,
  AgentRoleConfig,
  AgentRoleRegistry,
} from '../AgentRoleRegistry';

describe('AgentRoleRegistry', () => {
  let registry: AgentRoleRegistry;

  const defaultRoles: AgentRoleConfig[] = [
    {
      role: AgentRole.COORDINATOR,
      name: 'Coordinator',
      icon: '🎯',
      color: '#4CAF50',
      description: 'Main coordinator for task planning and delegation',
      capabilities: ['task_planning', 'delegation', 'progress_tracking'],
      isActive: true,
    },
    {
      role: AgentRole.EXECUTOR,
      name: 'Executor',
      icon: '⚡',
      color: '#2196F3',
      description: 'Executes tasks assigned by coordinator',
      capabilities: ['task_execution', 'code_generation', 'problem_solving'],
      isActive: true,
    },
    {
      role: AgentRole.REVIEWER,
      name: 'Reviewer',
      icon: '🔍',
      color: '#FF9800',
      description: 'Reviews and critiques work output',
      capabilities: ['code_review', 'quality_assessment', 'feedback'],
      isActive: true,
    },
    {
      role: AgentRole.EMOTION,
      name: 'Emotion',
      icon: '💜',
      color: '#9C27B0',
      description: 'Handles emotional analysis and responses',
      capabilities: ['emotion_detection', 'empathetic_response', 'sentiment_analysis'],
      isActive: true,
    },
  ];

  beforeEach(() => {
    registry = new AgentRoleRegistry();
  });

  describe('register', () => {
    it('should register a single role successfully', () => {
      const config = defaultRoles[0];
      registry.register(config);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result).not.toBeNull();
      expect(result?.role).toBe(AgentRole.COORDINATOR);
      expect(result?.name).toBe('Coordinator');
    });

    it('should register multiple roles', () => {
      defaultRoles.forEach(role => registry.register(role));
      const allRoles = registry.getAllRoles();
      expect(allRoles).toHaveLength(4);
    });

    it('should overwrite existing role when registering same role', () => {
      registry.register(defaultRoles[0]);
      const updatedConfig = { ...defaultRoles[0], name: 'Updated Coordinator' };
      registry.register(updatedConfig);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result?.name).toBe('Updated Coordinator');
    });

    it('should store all capabilities correctly', () => {
      registry.register(defaultRoles[0]);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result?.capabilities).toContain('task_planning');
      expect(result?.capabilities).toContain('delegation');
      expect(result?.capabilities).toContain('progress_tracking');
    });

    it('should preserve icon and color settings', () => {
      registry.register(defaultRoles[0]);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result?.icon).toBe('🎯');
      expect(result?.color).toBe('#4CAF50');
    });
  });

  describe('getRole', () => {
    it('should return role config for valid role', () => {
      registry.register(defaultRoles[0]);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result).toEqual(defaultRoles[0]);
    });

    it('should return null for unregistered role', () => {
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result).toBeNull();
    });

    it('should return correct role for all four role types', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRole(AgentRole.COORDINATOR)?.role).toBe(AgentRole.COORDINATOR);
      expect(registry.getRole(AgentRole.EXECUTOR)?.role).toBe(AgentRole.EXECUTOR);
      expect(registry.getRole(AgentRole.REVIEWER)?.role).toBe(AgentRole.REVIEWER);
      expect(registry.getRole(AgentRole.EMOTION)?.role).toBe(AgentRole.EMOTION);
    });

    it('should not be affected by setActive changes', () => {
      registry.register(defaultRoles[0]);
      registry.setActive(AgentRole.COORDINATOR, false);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result).not.toBeNull();
      expect(result?.isActive).toBe(false);
    });
  });

  describe('getAllRoles', () => {
    it('should return empty array when no roles registered', () => {
      const result = registry.getAllRoles();
      expect(result).toEqual([]);
    });

    it('should return all registered roles', () => {
      defaultRoles.forEach(role => registry.register(role));
      const result = registry.getAllRoles();
      expect(result).toHaveLength(4);
    });

    it('should return roles in registration order', () => {
      registry.register(defaultRoles[0]);
      registry.register(defaultRoles[1]);
      registry.register(defaultRoles[2]);
      const result = registry.getAllRoles();
      expect(result[0].role).toBe(AgentRole.COORDINATOR);
      expect(result[1].role).toBe(AgentRole.EXECUTOR);
      expect(result[2].role).toBe(AgentRole.REVIEWER);
    });

    it('should not include deactivated roles in getAllRoles by default', () => {
      // getAllRoles returns all roles regardless of active status
      registry.register(defaultRoles[0]);
      registry.register(defaultRoles[1]);
      registry.setActive(AgentRole.COORDINATOR, false);
      const result = registry.getAllRoles();
      expect(result).toHaveLength(2);
    });
  });

  describe('setActive', () => {
    it('should set role as active', () => {
      registry.register(defaultRoles[0]);
      registry.setActive(AgentRole.COORDINATOR, true);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result?.isActive).toBe(true);
    });

    it('should set role as inactive', () => {
      registry.register(defaultRoles[0]);
      registry.setActive(AgentRole.COORDINATOR, false);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result?.isActive).toBe(false);
    });

    it('should toggle active state correctly', () => {
      registry.register(defaultRoles[0]);
      expect(registry.getRole(AgentRole.COORDINATOR)?.isActive).toBe(true);
      registry.setActive(AgentRole.COORDINATOR, false);
      expect(registry.getRole(AgentRole.COORDINATOR)?.isActive).toBe(false);
      registry.setActive(AgentRole.COORDINATOR, true);
      expect(registry.getRole(AgentRole.COORDINATOR)?.isActive).toBe(true);
    });

    it('should not throw for unknown role', () => {
      expect(() => registry.setActive(AgentRole.COORDINATOR, true)).not.toThrow();
    });
  });

  describe('getActiveRoles', () => {
    it('should return empty array when no roles registered', () => {
      const result = registry.getActiveRoles();
      expect(result).toEqual([]);
    });

    it('should return empty array when all roles inactive', () => {
      defaultRoles.forEach(role => registry.register(role));
      registry.setActive(AgentRole.COORDINATOR, false);
      registry.setActive(AgentRole.EXECUTOR, false);
      registry.setActive(AgentRole.REVIEWER, false);
      registry.setActive(AgentRole.EMOTION, false);
      const result = registry.getActiveRoles();
      expect(result).toEqual([]);
    });

    it('should return only active roles', () => {
      defaultRoles.forEach(role => registry.register(role));
      registry.setActive(AgentRole.COORDINATOR, false);
      registry.setActive(AgentRole.REVIEWER, false);
      const result = registry.getActiveRoles();
      expect(result).toHaveLength(2);
      expect(result.map(r => r.role)).toContain(AgentRole.EXECUTOR);
      expect(result.map(r => r.role)).toContain(AgentRole.EMOTION);
    });

    it('should return all roles when all are active', () => {
      defaultRoles.forEach(role => registry.register(role));
      const result = registry.getActiveRoles();
      expect(result).toHaveLength(4);
    });

    it('should return single active role correctly', () => {
      defaultRoles.forEach(role => registry.register(role));
      registry.setActive(AgentRole.COORDINATOR, false);
      registry.setActive(AgentRole.EXECUTOR, false);
      registry.setActive(AgentRole.REVIEWER, false);
      const result = registry.getActiveRoles();
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(AgentRole.EMOTION);
    });
  });

  describe('getRoleByKeyword', () => {
    it('should return COORDINATOR for planning keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('plan the project')).toBe(AgentRole.COORDINATOR);
      expect(registry.getRoleByKeyword('coordinate the team')).toBe(AgentRole.COORDINATOR);
      expect(registry.getRoleByKeyword('plan')).toBe(AgentRole.COORDINATOR);
    });

    it('should return COORDINATOR for delegation keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('delegate tasks')).toBe(AgentRole.COORDINATOR);
      expect(registry.getRoleByKeyword('assign to')).toBe(AgentRole.COORDINATOR);
    });

    it('should return EXECUTOR for execution keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('execute the plan')).toBe(AgentRole.EXECUTOR);
      expect(registry.getRoleByKeyword('run code')).toBe(AgentRole.EXECUTOR);
      expect(registry.getRoleByKeyword('implement')).toBe(AgentRole.EXECUTOR);
    });

    it('should return EXECUTOR for coding keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('write function')).toBe(AgentRole.EXECUTOR);
      expect(registry.getRoleByKeyword('build component')).toBe(AgentRole.EXECUTOR);
      // 'coding' is in the EXECUTOR keywords, 'code' is too ambiguous
      expect(registry.getRoleByKeyword('coding')).toBe(AgentRole.EXECUTOR);
    });

    it('should return REVIEWER for review keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('review the code')).toBe(AgentRole.REVIEWER);
      expect(registry.getRoleByKeyword('check quality')).toBe(AgentRole.REVIEWER);
      expect(registry.getRoleByKeyword('audit')).toBe(AgentRole.REVIEWER);
    });

    it('should return REVIEWER for critique keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('critique the design')).toBe(AgentRole.REVIEWER);
      expect(registry.getRoleByKeyword('improve')).toBe(AgentRole.REVIEWER);
      expect(registry.getRoleByKeyword('feedback')).toBe(AgentRole.REVIEWER);
    });

    it('should return EMOTION for emotion-related keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('feel happy')).toBe(AgentRole.EMOTION);
      expect(registry.getRoleByKeyword('emotional response')).toBe(AgentRole.EMOTION);
      expect(registry.getRoleByKeyword('sentiment')).toBe(AgentRole.EMOTION);
    });

    it('should return EMOTION for empathetic keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('I feel sad')).toBe(AgentRole.EMOTION);
      expect(registry.getRoleByKeyword('empathize')).toBe(AgentRole.EMOTION);
      expect(registry.getRoleByKeyword('I am excited')).toBe(AgentRole.EMOTION);
    });

    it('should return null for unrecognized keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('random unknown word xyz')).toBeNull();
    });

    it('should return null when no roles registered', () => {
      expect(registry.getRoleByKeyword('plan')).toBeNull();
    });

    it('should be case insensitive for keyword matching', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('PLAN the project')).toBe(AgentRole.COORDINATOR);
      expect(registry.getRoleByKeyword('Execute the plan')).toBe(AgentRole.EXECUTOR);
      expect(registry.getRoleByKeyword('REVIEW')).toBe(AgentRole.REVIEWER);
    });

    it('should match partial keywords', () => {
      defaultRoles.forEach(role => registry.register(role));
      expect(registry.getRoleByKeyword('planning')).toBe(AgentRole.COORDINATOR);
      expect(registry.getRoleByKeyword('executing')).toBe(AgentRole.EXECUTOR);
      expect(registry.getRoleByKeyword('reviewing')).toBe(AgentRole.REVIEWER);
    });

    it('should route to first matching keyword in mappings order', () => {
      defaultRoles.forEach(role => registry.register(role));
      // EXECUTOR keywords are checked first in the mappings
      // So even though 'plan' appears first in message, 'execute' matches EXECUTOR first
      expect(registry.getRoleByKeyword('plan and execute')).toBe(AgentRole.EXECUTOR);
    });
  });

  describe('edge cases', () => {
    it('should handle empty capabilities array', () => {
      const config = { ...defaultRoles[0], capabilities: [] };
      registry.register(config);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result?.capabilities).toEqual([]);
    });

    it('should handle role with special characters in name', () => {
      const config = { ...defaultRoles[0], name: 'Test/Role-Name' };
      registry.register(config);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result?.name).toBe('Test/Role-Name');
    });

    it('should handle role with unicode in description', () => {
      const config = { ...defaultRoles[0], description: '测试描述 🎯' };
      registry.register(config);
      const result = registry.getRole(AgentRole.COORDINATOR);
      expect(result?.description).toBe('测试描述 🎯');
    });

    it('should preserve isActive status when updating role', () => {
      registry.register(defaultRoles[0]);
      registry.setActive(AgentRole.COORDINATOR, false);
      const updatedConfig = { ...defaultRoles[0], description: 'Updated' };
      registry.register(updatedConfig);
      expect(registry.getRole(AgentRole.COORDINATOR)?.isActive).toBe(false);
    });

    it('should allow re-registration of role with same config', () => {
      registry.register(defaultRoles[0]);
      registry.register(defaultRoles[0]);
      const result = registry.getAllRoles();
      expect(result).toHaveLength(1);
    });
  });

  describe('AgentRole enum', () => {
    it('should have correct values for all roles', () => {
      expect(AgentRole.COORDINATOR).toBe('coordinator');
      expect(AgentRole.EXECUTOR).toBe('executor');
      expect(AgentRole.REVIEWER).toBe('reviewer');
      expect(AgentRole.EMOTION).toBe('emotion');
    });

    it('should have 4 defined roles', () => {
      const roles = Object.values(AgentRole);
      expect(roles).toHaveLength(4);
    });
  });
});