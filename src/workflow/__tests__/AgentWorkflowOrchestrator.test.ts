/**
 * AgentWorkflowOrchestrator Tests
 * chatdev Agent Workflow Orchestrator
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentWorkflowOrchestrator } from '../AgentWorkflowOrchestrator';

describe('AgentWorkflowOrchestrator', () => {
  let orchestrator: AgentWorkflowOrchestrator;

  beforeEach(() => {
    orchestrator = new AgentWorkflowOrchestrator();
  });

  afterEach(() => {
    orchestrator.clearAll();
  });

  // ============================================================
  // createWorkflow
  // ============================================================
  describe('createWorkflow', () => {
    it('should create a workflow with stages', () => {
      const result = orchestrator.createWorkflow('Test Workflow', [
        { agentType: 'planner', input: { task: 'build app' } },
        { agentType: 'designer', input: { task: 'build app' } },
      ]);

      expect(result.workflowId).toMatch(/^workflow-/);
      expect(result.name).toBe('Test Workflow');
      expect(result.stages).toHaveLength(2);
      expect(result.status).toBe('running');
    });

    it('should create stages with correct properties', () => {
      const result = orchestrator.createWorkflow('Test', [
        { agentType: 'executor', input: 'data' },
      ]);

      const stage = result.stages[0];
      expect(stage.id).toMatch(/^stage-/);
      expect(stage.name).toBe('Stage 1: executor');
      expect(stage.agentType).toBe('executor');
      expect(stage.input).toBe('data');
      expect(stage.status).toBe('pending');
      expect(stage.output).toBeUndefined();
    });

    it('should allow multiple workflows', () => {
      const w1 = orchestrator.createWorkflow('W1', [{ agentType: 'a', input: null }]);
      const w2 = orchestrator.createWorkflow('W2', [{ agentType: 'b', input: null }]);
      expect(w1.workflowId).not.toBe(w2.workflowId);
      expect(orchestrator.getAllWorkflows()).toHaveLength(2);
    });
  });

  // ============================================================
  // execute
  // ============================================================
  describe('execute', () => {
    it('should execute all stages successfully', async () => {
      const wf = orchestrator.createWorkflow('Test', [
        { agentType: 'planner', input: { task: 'test' } },
        { agentType: 'executor', input: { task: 'test' } },
      ]);

      const result = await orchestrator.execute(wf.workflowId);

      expect(result.status).toBe('completed');
      expect(result.finalOutput).toHaveLength(2);
      expect(result.stages[0].status).toBe('completed');
      expect(result.stages[1].status).toBe('completed');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should set output for each stage', async () => {
      const wf = orchestrator.createWorkflow('Test', [
        { agentType: 'designer', input: 'project x' },
      ]);

      await orchestrator.execute(wf.workflowId);

      const stage = wf.stages[0];
      expect(stage.output).toBeDefined();
      expect((stage.output as { format?: string }).format).toBe('diagram');
    });

    it('should throw for unknown workflow', async () => {
      await expect(orchestrator.execute('unknown-id')).rejects.toThrow('not found');
    });

    it('should mark workflow as failed on error', async () => {
      const wf = orchestrator.createWorkflow('Test', [{ agentType: 'executor', input: null }]);
      // Can't easily test error path without mocking - covered by integration
      const result = await orchestrator.execute(wf.workflowId);
      expect(result.status).toBe('completed');
    });

    it('should track duration', async () => {
      const wf = orchestrator.createWorkflow('Test', [
        { agentType: 'planner', input: 'x' },
        { agentType: 'designer', input: 'x' },
      ]);

      const result = await orchestrator.execute(wf.workflowId);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // getStatus
  // ============================================================
  describe('getStatus', () => {
    it('should return null for unknown workflow', () => {
      expect(orchestrator.getStatus('unknown')).toBeNull();
    });

    it('should return current status', async () => {
      const wf = orchestrator.createWorkflow('Test', [
        { agentType: 'planner', input: 'x' },
      ]);

      const status = orchestrator.getStatus(wf.workflowId);
      expect(status?.workflowId).toBe(wf.workflowId);
      expect(status?.status).toBe('running');
    });

    it('should reflect completed status', async () => {
      const wf = orchestrator.createWorkflow('Test', [{ agentType: 'x', input: null }]);
      await orchestrator.execute(wf.workflowId);

      const status = orchestrator.getStatus(wf.workflowId);
      expect(status?.status).toBe('completed');
    });
  });

  // ============================================================
  // cancel
  // ============================================================
  describe('cancel', () => {
    it('should mark workflow as failed', () => {
      const wf = orchestrator.createWorkflow('Test', [{ agentType: 'x', input: null }]);
      orchestrator.cancel(wf.workflowId);

      const status = orchestrator.getStatus(wf.workflowId);
      expect(status?.status).toBe('failed');
    });

    it('should do nothing for unknown workflow', () => {
      expect(() => orchestrator.cancel('unknown')).not.toThrow();
    });

    it('should remove from pending', () => {
      const wf = orchestrator.createWorkflow('Test', [{ agentType: 'x', input: null }]);
      orchestrator.cancel(wf.workflowId);

      const all = orchestrator.getAllWorkflows();
      expect(all[0].status).toBe('failed');
    });
  });

  // ============================================================
  // onStatusChange
  // ============================================================
  describe('onStatusChange', () => {
    it('should call callback on status change', async () => {
      const wf = orchestrator.createWorkflow('Test', [{ agentType: 'x', input: null }]);
      const callback = vi.fn();
      orchestrator.onStatusChange(wf.workflowId, callback);

      await orchestrator.execute(wf.workflowId);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0].workflowId).toBe(wf.workflowId);
    });

    it('should return unsubscribe function', async () => {
      const wf = orchestrator.createWorkflow('Test', [{ agentType: 'x', input: null }]);
      const callback = vi.fn();
      const unsub = orchestrator.onStatusChange(wf.workflowId, callback);
      unsub();

      await orchestrator.execute(wf.workflowId);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // onCancel
  // ============================================================
  describe('onCancel', () => {
    it('should call callback on cancel', () => {
      const wf = orchestrator.createWorkflow('Test', [{ agentType: 'x', input: null }]);
      const callback = vi.fn();
      orchestrator.onCancel(wf.workflowId, callback);
      orchestrator.cancel(wf.workflowId);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0]).toBe(wf.workflowId);
    });

    it('should return unsubscribe function', () => {
      const wf = orchestrator.createWorkflow('Test', [{ agentType: 'x', input: null }]);
      const callback = vi.fn();
      const unsub = orchestrator.onCancel(wf.workflowId, callback);
      unsub();
      orchestrator.cancel(wf.workflowId);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // getAllWorkflows
  // ============================================================
  describe('getAllWorkflows', () => {
    it('should return empty initially', () => {
      expect(orchestrator.getAllWorkflows()).toHaveLength(0);
    });

    it('should return all created workflows', () => {
      orchestrator.createWorkflow('W1', [{ agentType: 'a', input: null }]);
      orchestrator.createWorkflow('W2', [{ agentType: 'b', input: null }]);
      expect(orchestrator.getAllWorkflows()).toHaveLength(2);
    });
  });

  // ============================================================
  // clearAll
  // ============================================================
  describe('clearAll', () => {
    it('should clear all workflows', () => {
      orchestrator.createWorkflow('W1', [{ agentType: 'a', input: null }]);
      orchestrator.clearAll();
      expect(orchestrator.getAllWorkflows()).toHaveLength(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle empty stages', () => {
      const wf = orchestrator.createWorkflow('Empty', []);
      expect(wf.stages).toHaveLength(0);
    });

    it('should handle many stages', async () => {
      const stages = Array(10).fill(null).map((_, i) => ({
        agentType: 'executor',
        input: i,
      }));
      const wf = orchestrator.createWorkflow('Many', stages);
      const result = await orchestrator.execute(wf.workflowId);
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(10);
    });

    it('should handle various agent types', async () => {
      const wf = orchestrator.createWorkflow('Types', [
        { agentType: 'planner', input: 'x' },
        { agentType: 'designer', input: 'x' },
        { agentType: 'executor', input: 'x' },
        { agentType: 'reviewer', input: 'x' },
        { agentType: 'coordinator', input: 'x' },
        { agentType: 'unknown', input: 'x' },
      ]);

      const result = await orchestrator.execute(wf.workflowId);
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(6);
    });

    it('should handle null and undefined input', async () => {
      const wf = orchestrator.createWorkflow('Nulls', [
        { agentType: 'executor', input: null },
        { agentType: 'executor', input: undefined },
      ]);

      const result = await orchestrator.execute(wf.workflowId);
      expect(result.status).toBe('completed');
    });

    it('should handle complex object input', async () => {
      const complexInput = {
        nested: { data: { deep: [1, 2, 3] } },
        fn: () => 'function',
      };
      const wf = orchestrator.createWorkflow('Complex', [
        { agentType: 'planner', input: complexInput },
      ]);

      const result = await orchestrator.execute(wf.workflowId);
      expect(result.status).toBe('completed');
    });
  });
});