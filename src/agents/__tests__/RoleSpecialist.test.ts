/**
 * RoleSpecialist Tests
 * 
 * Tests for ChatDev Role Specialization System:
 * 1. RoleRegistry - Role registration and lookup
 * 2. RoleAssigner - Role assignment logic
 * 3. RoleChainExecutor - Multi-step chain execution
 * 4. DynamicRoleConfig - Runtime configuration
 * 5. RoleAnalytics - Usage tracking
 * 6. RoleSpecialist main class
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RoleSpecialist } from '../RoleSpecialist';
import type { Agent, AgentRole } from '../../types/agent';

// ============================================================================
// Test Utilities
// ============================================================================

function createMockAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'test-agent-1',
    role: 'executor' as AgentRole,
    name: 'Test Agent',
    icon: '🤖',
    status: 'idle',
    messages: [],
    capabilities: ['code_generation', 'implementation', 'refactoring'],
    ...overrides,
  };
}

// ============================================================================
// RoleRegistry Tests
// ============================================================================

describe('RoleRegistry', () => {
  let specialist: RoleSpecialist;

  beforeEach(() => {
    specialist = new RoleSpecialist();
  });

  describe('built-in roles', () => {
    it('should have 6 built-in roles', () => {
      const roles = specialist.registry.list();
      expect(roles).toHaveLength(6);
    });

    it('should include architect role', () => {
      const architect = specialist.registry.get('architect');
      expect(architect).toBeDefined();
      expect(architect?.name).toBe('Architect');
      expect(architect?.capabilities).toContain('system_design');
    });

    it('should include coder role', () => {
      const coder = specialist.registry.get('coder');
      expect(coder).toBeDefined();
      expect(coder?.name).toBe('Coder');
      expect(coder?.capabilities).toContain('code_generation');
    });

    it('should include reviewer role', () => {
      const reviewer = specialist.registry.get('reviewer');
      expect(reviewer).toBeDefined();
      expect(reviewer?.name).toBe('Reviewer');
      expect(reviewer?.capabilities).toContain('code_review');
    });

    it('should include tester role', () => {
      const tester = specialist.registry.get('tester');
      expect(tester).toBeDefined();
      expect(tester?.name).toBe('Tester');
      expect(tester?.capabilities).toContain('test_creation');
    });

    it('should include documenter role', () => {
      const documenter = specialist.registry.get('documenter');
      expect(documenter).toBeDefined();
      expect(documenter?.name).toBe('Documenter');
      expect(documenter?.capabilities).toContain('documentation_writing');
    });

    it('should include orchestrator role', () => {
      const orchestrator = specialist.registry.get('orchestrator');
      expect(orchestrator).toBeDefined();
      expect(orchestrator?.name).toBe('Orchestrator');
      expect(orchestrator?.priority).toBe(10);
    });
  });

  describe('register and get', () => {
    it('should register a custom role', () => {
      const customRole = {
        id: 'custom_role',
        role: 'coder' as const,
        name: 'Custom Coder',
        description: 'Custom coder role',
        capabilities: ['custom_code'],
        compatibleTaskTypes: ['custom_task'],
        icon: '🔧',
        priority: 5,
        hotSwappable: true,
      };

      specialist.registry.register(customRole);
      const retrieved = specialist.registry.get('custom_role');
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Custom Coder');
    });

    it('should overwrite existing role with same id', () => {
      const role = {
        id: 'overwrite_test',
        role: 'coder' as const,
        name: 'Original',
        description: 'Original description',
        capabilities: ['cap1'],
        compatibleTaskTypes: ['task1'],
        icon: '📝',
        priority: 5,
        hotSwappable: true,
      };

      specialist.registry.register(role);

      const updatedRole = {
        ...role,
        name: 'Updated',
        priority: 10,
      };

      specialist.registry.register(updatedRole);
      const retrieved = specialist.registry.get('overwrite_test');

      expect(retrieved?.name).toBe('Updated');
      expect(retrieved?.priority).toBe(10);
    });

    it('should return undefined for non-existent role', () => {
      const result = specialist.registry.get('non_existent_role');
      expect(result).toBeUndefined();
    });
  });

  describe('getByTaskType', () => {
    it('should return roles compatible with task type', () => {
      const roles = specialist.registry.getByTaskType('code_generation');
      
      expect(roles.length).toBeGreaterThan(0);
      expect(roles.some(r => r.id === 'coder')).toBe(true);
    });

    it('should return roles sorted by priority', () => {
      const roles = specialist.registry.getByTaskType('code_generation');
      
      for (let i = 1; i < roles.length; i++) {
        expect(roles[i - 1].priority).toBeGreaterThanOrEqual(roles[i].priority);
      }
    });

    it('should return empty array for unknown task type', () => {
      const roles = specialist.registry.getByTaskType('unknown_task_type_xyz');
      expect(roles).toHaveLength(0);
    });
  });

  describe('template management', () => {
    it('should export role as template', () => {
      const template = specialist.registry.exportAsTemplate('coder');
      
      expect(template).toBeDefined();
      expect(template?.name).toBe('Coder');
      expect(template?.capabilities).toContain('code_generation');
      expect(template?.isBuiltIn).toBe(false);
    });

    it('should register template', () => {
      const template = {
        id: 'test_template',
        name: 'Test Template',
        description: 'A test template',
        capabilities: ['test_cap'],
        compatibleTaskTypes: ['test_task'],
        icon: '📋',
        version: '1.0.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isBuiltIn: true,
      };

      specialist.registry.registerTemplate(template);
      const retrieved = specialist.registry.getTemplate('test_template');
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Template');
    });

    it('should create role from template', () => {
      const template = {
        id: 'create_from_template_test',
        name: 'Create Test',
        description: 'Template for creation test',
        capabilities: ['create_cap'],
        compatibleTaskTypes: ['create_task'],
        icon: '✨',
        version: '1.0.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isBuiltIn: true,
      };

      specialist.registry.registerTemplate(template);
      const role = specialist.registry.createFromTemplate('create_from_template_test');
      
      expect(role).toBeDefined();
      expect(role?.name).toBe('Create Test');
    });
  });

  describe('unregister', () => {
    it('should remove role from registry', () => {
      const customRole = {
        id: 'to_unregister',
        role: 'coder' as const,
        name: 'To Unregister',
        description: 'Will be removed',
        capabilities: ['temp_cap'],
        compatibleTaskTypes: ['temp_task'],
        icon: '🗑️',
        priority: 5,
        hotSwappable: true,
      };

      specialist.registry.register(customRole);
      expect(specialist.registry.get('to_unregister')).toBeDefined();

      const result = specialist.registry.unregister('to_unregister');
      expect(result).toBe(true);
      expect(specialist.registry.get('to_unregister')).toBeUndefined();
    });

    it('should return false when unregistering non-existent role', () => {
      const result = specialist.registry.unregister('non_existent');
      expect(result).toBe(false);
    });
  });
});

// ============================================================================
// RoleAssigner Tests
// ============================================================================

describe('RoleAssigner', () => {
  let specialist: RoleSpecialist;

  beforeEach(() => {
    specialist = new RoleSpecialist();
  });

  describe('assignRole', () => {
    it('should assign role for valid task type', () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor', capabilities: ['code_generation', 'implementation'] }),
      ];

      const assignment = specialist.assignRole('code_generation', 'task-1', agents);
      
      expect(assignment).toBeDefined();
      expect(assignment?.agentId).toBe('agent-1');
      expect(assignment?.roleDefinition.id).toBe('coder');
      expect(assignment?.confidence).toBeGreaterThan(0);
    });

    it('should return null for unknown task type', () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor' }),
      ];

      const assignment = specialist.assignRole('unknown_task_type_xyz', 'task-1', agents);
      expect(assignment).toBeNull();
    });

    it('should consider agent capabilities when assigning', () => {
      const agents = [
        createMockAgent({ 
          id: 'coding_agent', 
          role: 'executor', 
          capabilities: ['code_generation', 'implementation'] 
        }),
        createMockAgent({ 
          id: 'planning_agent', 
          role: 'planner', 
          capabilities: ['planning', 'feasibility_assessment'] 
        }),
      ];

      const assignment = specialist.assignRole('code_generation', 'task-1', agents);
      
      expect(assignment).toBeDefined();
      // Should prefer executor for code generation task
      expect(assignment?.agentId).toBe('coding_agent');
    });

    it('should return null when no agents available', () => {
      const assignment = specialist.assignRole('code_generation', 'task-1', []);
      expect(assignment).toBeNull();
    });

    it('should include reasoning in assignment', () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor', capabilities: ['code_generation'] }),
      ];

      const assignment = specialist.assignRole('code_generation', 'task-1', agents);
      
      expect(assignment?.reasoning).toBeDefined();
      expect(assignment?.reasoning.length).toBeGreaterThan(0);
    });

    it('should update analytics on assignment', () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor', capabilities: ['code_generation'] }),
      ];

      specialist.assignRole('code_generation', 'task-1', agents);
      
      const analytics = specialist.getRoleAnalytics('coder');
      expect(analytics).toBeDefined();
      expect(analytics?.totalAssignments).toBeGreaterThan(0);
    });
  });

  describe('getRecommendations', () => {
    it('should return ranked recommendations', () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor', capabilities: ['code_generation'] }),
        createMockAgent({ id: 'agent-2', role: 'critic', capabilities: ['code_review'] }),
      ];

      const recommendations = specialist.getRecommendations('code_generation', agents);
      
      expect(recommendations.length).toBeGreaterThan(0);
      // Should be sorted by confidence
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].confidence).toBeGreaterThanOrEqual(recommendations[i].confidence);
      }
    });

    it('should filter by confidence threshold', () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor', capabilities: ['code_generation'] }),
      ];

      const recommendations = specialist.getRecommendations('code_generation', agents);
      
      // All recommendations should have confidence > 0.5
      recommendations.forEach(rec => {
        expect(rec.confidence).toBeGreaterThan(0.5);
      });
    });
  });
});

// ============================================================================
// RoleChainExecutor Tests
// ============================================================================

describe('RoleChainExecutor', () => {
  let specialist: RoleSpecialist;

  beforeEach(() => {
    specialist = new RoleSpecialist();
  });

  describe('createChain', () => {
    it('should create chain from config', () => {
      const chain = specialist.chainExecutor.createChain({
        id: 'test_chain',
        name: 'Test Chain',
        description: 'A test chain',
        steps: [
          { roleId: 'architect' },
          { roleId: 'coder' },
          { roleId: 'reviewer' },
        ],
      });

      expect(chain.id).toBe('test_chain');
      expect(chain.name).toBe('Test Chain');
      expect(chain.steps).toHaveLength(3);
      expect(chain.status).toBe('idle');
    });

    it('should include input/output mappings in chain steps', () => {
      const chain = specialist.chainExecutor.createChain({
        id: 'mapping_chain',
        name: 'Mapping Chain',
        description: 'Chain with mappings',
        steps: [
          { 
            roleId: 'architect',
            inputMapping: { spec: 'design.output' },
            outputMapping: { design: 'spec.result' },
          },
        ],
      });

      expect(chain.steps[0].inputMapping).toBeDefined();
      expect(chain.steps[0].outputMapping).toBeDefined();
    });
  });

  describe('executeChain', () => {
    it('should execute chain sequentially', async () => {
      const agents = [
        createMockAgent({ id: 'arch_agent', role: 'planner', capabilities: ['system_design'] }),
        createMockAgent({ id: 'code_agent', role: 'executor', capabilities: ['code_generation'] }),
        createMockAgent({ id: 'review_agent', role: 'critic', capabilities: ['code_review'] }),
      ];

      const executeFn = vi.fn().mockImplementation(async (roleId: string, agentId: string, input: unknown) => {
        return { result: `executed by ${agentId}`, input };
      });

      const results = await specialist.executeRoleChain(
        {
          id: 'exec_chain',
          name: 'Execute Chain',
          description: 'Test chain execution',
          steps: [
            { roleId: 'architect' },
            { roleId: 'coder' },
            { roleId: 'reviewer' },
          ],
        },
        { initial: 'data' },
        agents,
        executeFn
      );

      expect(results).toHaveLength(3);
      expect(results[0].status).toBe('completed');
      expect(results[1].status).toBe('completed');
      expect(results[2].status).toBe('completed');
      expect(executeFn).toHaveBeenCalledTimes(3);
    });

    it('should fail chain if role not found', async () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor' }),
      ];

      const executeFn = vi.fn();

      const results = await specialist.executeRoleChain(
        {
          id: 'fail_chain',
          name: 'Fail Chain',
          description: 'Chain with invalid role',
          steps: [
            { roleId: 'non_existent_role' },
          ],
        },
        {},
        agents,
        executeFn
      );

      expect(results[0].status).toBe('failed');
      expect(results[0].error).toContain('not found');
    });

    it('should skip steps based on condition', async () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor', capabilities: ['code_generation'] }),
      ];

      const executeFn = vi.fn();

      const results = await specialist.executeRoleChain(
        {
          id: 'condition_chain',
          name: 'Condition Chain',
          description: 'Chain with condition',
          steps: [
            { 
              roleId: 'coder',
              condition: { field: 'skip', operator: 'eq', value: true },
            },
          ],
        },
        { skip: true },
        agents,
        executeFn
      );

      expect(results[0].status).toBe('skipped');
      expect(executeFn).not.toHaveBeenCalled();
    });

    it('should map input between steps', async () => {
      const agents = [
        createMockAgent({ id: 'arch_agent', role: 'planner', capabilities: ['system_design'] }),
        createMockAgent({ id: 'code_agent', role: 'executor', capabilities: ['code_generation'] }),
      ];

      const executeFn = vi.fn().mockImplementation(async (roleId: string, agentId: string, input: unknown) => {
        return { output: `result from ${agentId}`, data: input };
      });

      const results = await specialist.executeRoleChain(
        {
          id: 'input_map_chain',
          name: 'Input Map Chain',
          description: 'Chain with input mapping',
          steps: [
            { 
              roleId: 'architect',
              outputMapping: { spec: 'result.output' },
            },
            { 
              roleId: 'coder',
              inputMapping: { design: 'spec' },
            },
          ],
        },
        {},
        agents,
        executeFn
      );

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('completed');
      expect(results[1].status).toBe('completed');
    });

    it('should set chain status to failed on error', async () => {
      const agents = [
        createMockAgent({ id: 'agent-1', role: 'executor', capabilities: ['code_generation'] }),
      ];

      const executeFn = vi.fn().mockRejectedValue(new Error('Execution failed'));

      const chain = specialist.chainExecutor.createChain({
        id: 'error_chain',
        name: 'Error Chain',
        description: 'Chain that will fail',
        steps: [
          { roleId: 'coder' },
        ],
      });

      await specialist.chainExecutor.executeChain(
        chain,
        {},
        agents,
        executeFn
      );

      expect(chain.status).toBe('failed');
    });
  });
});

// ============================================================================
// DynamicRoleConfig Tests
// ============================================================================

describe('DynamicRoleConfig', () => {
  let specialist: RoleSpecialist;

  beforeEach(() => {
    specialist = new RoleSpecialist();
  });

  describe('updateRoleConfig', () => {
    it('should update role configuration', () => {
      specialist.updateRoleConfig('coder', {
        enabled: false,
        priority: 10,
        maxConcurrentTasks: 5,
      });

      const config = specialist.dynamicConfig.getConfig('coder');
      expect(config).toBeDefined();
      expect(config?.enabled).toBe(false);
      expect(config?.priority).toBe(10);
      expect(config?.maxConcurrentTasks).toBe(5);
    });

    it('should track update metadata', () => {
      specialist.updateRoleConfig('coder', {
        priority: 15,
      }, 'test_user');

      const config = specialist.dynamicConfig.getConfig('coder');
      expect(config?.updatedBy).toBe('test_user');
      expect(config?.updatedAt).toBeGreaterThan(0);
    });
  });

  describe('getRole with applied config', () => {
    it('should apply dynamic config to role', () => {
      specialist.updateRoleConfig('coder', {
        priority: 20,
        maxConcurrentTasks: 10,
      });

      const role = specialist.getRole('coder');
      expect(role?.priority).toBe(20);
      expect(role?.maxConcurrentTasks).toBe(10);
    });

    it('should return undefined for non-existent role', () => {
      const role = specialist.getRole('non_existent_role');
      expect(role).toBeUndefined();
    });
  });

  describe('resetConfig', () => {
    it('should reset configuration to default', () => {
      specialist.updateRoleConfig('coder', {
        enabled: false,
        priority: 20,
      });

      specialist.dynamicConfig.resetConfig('coder');
      const config = specialist.dynamicConfig.getConfig('coder');
      expect(config).toBeUndefined();
    });
  });
});

// ============================================================================
// RoleAnalytics Tests
// ============================================================================

describe('RoleAnalytics', () => {
  let specialist: RoleSpecialist;

  beforeEach(() => {
    specialist = new RoleSpecialist();
  });

  describe('recordAssignment', () => {
    it('should track assignment metrics', () => {
      specialist.analytics.recordAssignment('coder', true, 1000, 0.9);
      
      const analytics = specialist.getRoleAnalytics('coder');
      expect(analytics?.totalAssignments).toBe(1);
      expect(analytics?.successfulAssignments).toBe(1);
      expect(analytics?.averageExecutionTime).toBe(1000);
      expect(analytics?.averageConfidence).toBe(0.9);
    });

    it('should track failed assignments', () => {
      specialist.analytics.recordAssignment('coder', false, 500, 0.3);
      
      const analytics = specialist.getRoleAnalytics('coder');
      expect(analytics?.totalAssignments).toBe(1);
      expect(analytics?.failedAssignments).toBe(1);
    });

    it('should update running averages', () => {
      specialist.analytics.recordAssignment('coder', true, 1000, 0.9);
      specialist.analytics.recordAssignment('coder', true, 2000, 0.8);
      
      const analytics = specialist.getRoleAnalytics('coder');
      expect(analytics?.totalAssignments).toBe(2);
      expect(analytics?.averageExecutionTime).toBe(1500); // (1000 + 2000) / 2
      expect(analytics?.averageConfidence).toBe(0.85); // (0.9 + 0.8) / 2
    });

    it('should update load factor', () => {
      for (let i = 0; i < 50; i++) {
        specialist.analytics.recordAssignment('coder', true, 100, 0.8);
      }
      
      const analytics = specialist.getRoleAnalytics('coder');
      expect(analytics?.loadFactor).toBeGreaterThan(0);
    });
  });

  describe('getMostUsedRoles', () => {
    it('should return roles sorted by usage', () => {
      specialist.analytics.recordAssignment('architect', true, 100, 0.9);
      specialist.analytics.recordAssignment('coder', true, 100, 0.9);
      specialist.analytics.recordAssignment('reviewer', true, 100, 0.9);
      specialist.analytics.recordAssignment('architect', true, 100, 0.9); // architect twice
      
      const mostUsed = specialist.analytics.getMostUsedRoles(2);
      
      expect(mostUsed[0].roleId).toBe('architect');
      expect(mostUsed[1].roleId).toBe('coder');
    });
  });

  describe('getProblemRoles', () => {
    it('should return roles with low success rate', () => {
      // Create a role with 30% success rate
      for (let i = 0; i < 10; i++) {
        specialist.analytics.recordAssignment('problem_role', i < 3, 100, 0.5);
      }
      
      const problemRoles = specialist.analytics.getProblemRoles(0.5);
      expect(problemRoles.some(r => r.roleId === 'problem_role')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all analytics', () => {
      specialist.analytics.recordAssignment('coder', true, 100, 0.9);
      specialist.analytics.clear();
      
      const analytics = specialist.getRoleAnalytics('coder');
      expect(analytics?.totalAssignments).toBe(0);
    });
  });
});

// ============================================================================
// RoleSpecialist Main Class Tests
// ============================================================================

describe('RoleSpecialist', () => {
  let specialist: RoleSpecialist;

  beforeEach(() => {
    specialist = new RoleSpecialist();
  });

  describe('initialization', () => {
    it('should initialize with default roles', () => {
      const roles = specialist.registry.list();
      expect(roles.length).toBe(6);
    });

    it('should initialize with custom roles', () => {
      const customRoles = [
        {
          id: 'custom_init',
          role: 'coder' as const,
          name: 'Custom Init Role',
          description: 'Custom role during init',
          capabilities: ['custom_cap'],
          compatibleTaskTypes: ['custom_task'],
          icon: '⚡',
          priority: 10,
          hotSwappable: true,
        },
      ];

      const customSpecialist = new RoleSpecialist();
      customSpecialist.initialize(customRoles);

      const role = customSpecialist.registry.get('custom_init');
      expect(role).toBeDefined();
      expect(role?.name).toBe('Custom Init Role');
    });
  });

  describe('full workflow', () => {
    it('should execute complete role assignment workflow', () => {
      // Step 1: Get role recommendations
      const agents = [
        createMockAgent({ id: 'exec-1', role: 'executor', capabilities: ['code_generation'] }),
        createMockAgent({ id: 'critic-1', role: 'critic', capabilities: ['code_review'] }),
      ];

      const recommendations = specialist.getRecommendations('code_generation', agents);
      expect(recommendations.length).toBeGreaterThan(0);

      // Step 2: Assign role
      const assignment = specialist.assignRole('code_generation', 'workflow-task-1', agents);
      expect(assignment).toBeDefined();
      expect(assignment?.confidence).toBeGreaterThan(0);

      // Step 3: Verify analytics updated
      const analytics = specialist.getRoleAnalytics();
      expect(analytics.some(a => a.totalAssignments > 0)).toBe(true);
    });

    it('should handle role chain workflow', async () => {
      const agents = [
        createMockAgent({ id: 'arch', role: 'planner', capabilities: ['system_design'] }),
        createMockAgent({ id: 'code', role: 'executor', capabilities: ['code_generation'] }),
        createMockAgent({ id: 'review', role: 'critic', capabilities: ['code_review'] }),
        createMockAgent({ id: 'test', role: 'executor', capabilities: ['test_creation'] }),
      ];

      const executeFn = vi.fn().mockImplementation(async (roleId: string, agentId: string, input: unknown) => {
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 10));
        return { result: `completed by ${agentId}`, role: roleId };
      });

      const results = await specialist.executeRoleChain(
        {
          id: 'full_workflow_chain',
          name: 'Full Workflow',
          description: 'Complete role chain workflow',
          steps: [
            { roleId: 'architect', outputMapping: { spec: 'result.result' } },
            { roleId: 'coder', inputMapping: { design: 'spec' } },
            { roleId: 'reviewer' },
            { roleId: 'tester' },
          ],
        },
        { requirement: 'build a calculator' },
        agents,
        executeFn
      );

      // All steps should complete
      expect(results.every(r => r.status === 'completed')).toBe(true);
      
      // Verify chain status
      const chain = specialist.chainExecutor.createChain({
        id: 'check_chain',
        name: 'Check',
        description: 'Check',
        steps: [{ roleId: 'coder' }],
      });
      expect(chain.status).toBe('idle');
    });
  });

  describe('export and import', () => {
    it('should export role as template', () => {
      const template = specialist.exportRoleAsTemplate('coder');
      
      expect(template).toBeDefined();
      expect(template?.id).toContain('template_coder');
      expect(template?.capabilities).toContain('code_generation');
      expect(template?.isBuiltIn).toBe(false);
    });

    it('should create custom role from exported template', () => {
      const template = specialist.exportRoleAsTemplate('architect');
      expect(template).toBeDefined();

      const customRole = specialist.createCustomRole(template!.id, {
        name: 'Custom Architect',
        priority: 15,
      });

      expect(customRole).toBeDefined();
      expect(customRole?.name).toBe('Custom Architect');
      expect(customRole?.priority).toBe(15);
    });
  });
});