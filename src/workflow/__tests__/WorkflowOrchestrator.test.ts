/**
 * WorkflowOrchestrator Tests
 * chatdev-design Workflow Orchestrator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkflowOrchestrator } from '../WorkflowOrchestrator';

describe('WorkflowOrchestrator', () => {
  let orch: WorkflowOrchestrator;

  beforeEach(() => {
    orch = new WorkflowOrchestrator();
  });

  afterEach(() => {
    orch.clearAll();
  });

  // ============================================================
  // createWorkflow
  // ============================================================
  describe('createWorkflow', () => {
    it('should create workflow', () => {
      const id = orch.createWorkflow([
        { id: 's1', name: 'step 1', dependsOn: [] },
      ]);
      expect(orch.getWorkflowCount()).toBe(1);
    });

    it('should auto-increment id', () => {
      const id1 = orch.createWorkflow([]);
      const id2 = orch.createWorkflow([]);
      expect(id1).toBe('wf-1');
      expect(id2).toBe('wf-2');
    });

    it('should not mutate input', () => {
      const deps = ['a'];
      orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: deps }]);
      deps.push('b');
      expect(orch.getStep(orch.getAllWorkflowIds()[0], 's1')?.dependsOn).toEqual(['a']);
    });
  });

  // ============================================================
  // run
  // ============================================================
  describe('run', () => {
    it('should run workflow', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      expect(orch.run(id)).toBe(true);
      expect(orch.getStatus(id)).toBe('running');
    });

    it('should mark independent steps as in_progress', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      expect(orch.getStepStatus(id, 's1')).toBe('in_progress');
    });

    it('should return false for unknown', () => {
      expect(orch.run('unknown')).toBe(false);
    });
  });

  // ============================================================
  // completeStep
  // ============================================================
  describe('completeStep', () => {
    it('should complete step', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      expect(orch.completeStep(id, 's1', 'result')).toBe(true);
      expect(orch.getStepStatus(id, 's1')).toBe('completed');
    });

    it('should store result', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      orch.completeStep(id, 's1', 'data');
      const results = orch.getResults(id);
      expect(results.get('s1')).toBe('data');
    });

    it('should mark dependent as in_progress', () => {
      const id = orch.createWorkflow([
        { id: 's1', name: 'd', dependsOn: [] },
        { id: 's2', name: 'd', dependsOn: ['s1'] },
      ]);
      orch.run(id);
      orch.completeStep(id, 's1', 'ok');
      expect(orch.getStepStatus(id, 's2')).toBe('in_progress');
    });

    it('should mark workflow as completed when all done', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      orch.completeStep(id, 's1', 'ok');
      expect(orch.isCompleted(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(orch.completeStep('unknown', 's1', 'x')).toBe(false);
    });
  });

  // ============================================================
  // failStep
  // ============================================================
  describe('failStep', () => {
    it('should fail step', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      expect(orch.failStep(id, 's1')).toBe(true);
      expect(orch.isFailed(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(orch.failStep('unknown', 's1')).toBe(false);
    });
  });

  // ============================================================
  // getResults / getStatus
  // ============================================================
  describe('getResults / getStatus', () => {
    it('should return empty for unknown', () => {
      expect(orch.getResults('unknown').size).toBe(0);
      expect(orch.getStatus('unknown')).toBeNull();
    });
  });

  // ============================================================
  // getReadySteps / getCompletedSteps etc.
  // ============================================================
  describe('filter steps', () => {
    it('should get ready steps', () => {
      const id = orch.createWorkflow([
        { id: 's1', name: 'd', dependsOn: [] },
        { id: 's2', name: 'd', dependsOn: ['s1'] },
      ]);
      const ready = orch.getReadySteps(id);
      expect(ready).toHaveLength(1);
      expect(ready[0].id).toBe('s1');
    });

    it('should get completed steps', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      orch.completeStep(id, 's1', 'ok');
      expect(orch.getCompletedSteps(id)).toHaveLength(1);
    });

    it('should get pending steps', () => {
      const id = orch.createWorkflow([
        { id: 's1', name: 'd', dependsOn: [] },
        { id: 's2', name: 'd', dependsOn: ['s1'] },
      ]);
      expect(orch.getPendingSteps(id)).toHaveLength(2);
    });

    it('should get in_progress steps', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      expect(orch.getInProgressSteps(id)).toHaveLength(1);
    });

    it('should get failed steps', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      orch.failStep(id, 's1');
      expect(orch.getFailedSteps(id)).toHaveLength(1);
    });
  });

  // ============================================================
  // getProgress
  // ============================================================
  describe('getProgress', () => {
    it('should return 0 for empty', () => {
      const id = orch.createWorkflow([]);
      expect(orch.getProgress(id)).toBe(0);
    });

    it('should calculate progress', () => {
      const id = orch.createWorkflow([
        { id: 's1', name: 'd', dependsOn: [] },
        { id: 's2', name: 'd', dependsOn: [] },
      ]);
      orch.run(id);
      orch.completeStep(id, 's1', 'ok');
      expect(orch.getProgress(id)).toBe(50);
    });
  });

  // ============================================================
  // addStep / removeStep
  // ============================================================
  describe('addStep / removeStep', () => {
    it('should add step', () => {
      const id = orch.createWorkflow([]);
      expect(orch.addStep(id, { id: 's1', name: 'd', dependsOn: [] })).toBe(true);
    });

    it('should remove step', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      expect(orch.removeStep(id, 's1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(orch.addStep('unknown', { id: 's1', name: 'd', dependsOn: [] })).toBe(false);
      expect(orch.removeStep('unknown', 's1')).toBe(false);
    });
  });

  // ============================================================
  // resetWorkflow / deleteWorkflow
  // ============================================================
  describe('reset / delete', () => {
    it('should reset workflow', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      orch.run(id);
      orch.completeStep(id, 's1', 'ok');
      expect(orch.resetWorkflow(id)).toBe(true);
      expect(orch.getStepStatus(id, 's1')).toBe('pending');
    });

    it('should delete workflow', () => {
      const id = orch.createWorkflow([]);
      expect(orch.deleteWorkflow(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(orch.resetWorkflow('unknown')).toBe(false);
      expect(orch.deleteWorkflow('unknown')).toBe(false);
    });
  });

  // ============================================================
  // hasWorkflow / count
  // ============================================================
  describe('has / count', () => {
    it('should check existence', () => {
      const id = orch.createWorkflow([]);
      expect(orch.hasWorkflow(id)).toBe(true);
      expect(orch.hasWorkflow('unknown')).toBe(false);
    });

    it('should count workflows', () => {
      orch.createWorkflow([]);
      orch.createWorkflow([]);
      expect(orch.getWorkflowCount()).toBe(2);
    });
  });

  // ============================================================
  // isCompleted / isFailed
  // ============================================================
  describe('isCompleted / isFailed', () => {
    it('should check completed', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      expect(orch.isCompleted(id)).toBe(false);
    });

    it('should check failed', () => {
      const id = orch.createWorkflow([{ id: 's1', name: 'd', dependsOn: [] }]);
      expect(orch.isFailed(id)).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many workflows', () => {
      for (let i = 0; i < 50; i++) {
        orch.createWorkflow([]);
      }
      expect(orch.getWorkflowCount()).toBe(50);
    });

    it('should handle complex dependencies', () => {
      const id = orch.createWorkflow([
        { id: 's1', name: 'd', dependsOn: [] },
        { id: 's2', name: 'd', dependsOn: ['s1'] },
        { id: 's3', name: 'd', dependsOn: ['s2'] },
        { id: 's4', name: 'd', dependsOn: ['s1', 's2'] },
      ]);
      orch.run(id);
      orch.completeStep(id, 's1', 'ok');
      orch.completeStep(id, 's2', 'ok');
      expect(orch.getStepStatus(id, 's3')).toBe('in_progress');
      expect(orch.getStepStatus(id, 's4')).toBe('in_progress');
    });
  });
});

// Helper function
declare module '../WorkflowOrchestrator' {
  interface WorkflowOrchestrator {
    getAllWorkflowIds(): string[];
  }
}

(WorkflowOrchestrator.prototype as any).getAllWorkflowIds = function () {
  return Array.from((this as any).workflows.keys());
};