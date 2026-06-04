/**
 * AdaptivePlannerV3 Tests
 * generic-agent-design Adaptive Planner v3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdaptivePlannerV3 } from '../AdaptivePlannerV3';

describe('AdaptivePlannerV3', () => {
  let planner: AdaptivePlannerV3;

  beforeEach(() => {
    planner = new AdaptivePlannerV3();
  });

  afterEach(() => {
    planner.clearAll();
  });

  // ============================================================
  // createPlan
  // ============================================================
  describe('createPlan', () => {
    it('should create plan with steps', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'step 1', status: 'pending', dependencies: [] },
      ]);
      expect(planner.getPlanCount()).toBe(1);
    });

    it('should auto-increment id', () => {
      const id1 = planner.createPlan([]);
      const id2 = planner.createPlan([]);
      expect(id1).toBe('plan-1');
      expect(id2).toBe('plan-2');
    });

    it('should not mutate input steps', () => {
      const steps = [{ id: 's1', description: 'd', status: 'pending' as const, dependencies: ['x'] }];
      planner.createPlan(steps);
      steps[0].dependencies.push('y');
      expect(planner.getStep(planner.getAllPlans()[0].id, 's1')?.dependencies).toHaveLength(1);
    });
  });

  // ============================================================
  // execute
  // ============================================================
  describe('execute', () => {
    it('should execute plan', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      expect(planner.execute(id)).toBe(true);
      expect(planner.getPlan(id)?.status).toBe('executing');
    });

    it('should mark first steps as in_progress', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      planner.execute(id);
      expect(planner.getStep(id, 's1')?.status).toBe('in_progress');
    });

    it('should return false for unknown', () => {
      expect(planner.execute('unknown')).toBe(false);
    });
  });

  // ============================================================
  // adapt
  // ============================================================
  describe('adapt', () => {
    it('should adapt step', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'original', status: 'pending', dependencies: [] },
      ]);
      planner.adapt(id, 's1', 'new approach');
      expect(planner.getStep(id, 's1')?.description).toContain('new approach');
    });

    it('should record adaptation', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      planner.adapt(id, 's1', 'change');
      expect(planner.getAdaptations(id)).toHaveLength(1);
    });

    it('should return false for unknown', () => {
      expect(planner.adapt('unknown', 's1', 'x')).toBe(false);
    });
  });

  // ============================================================
  // rollback
  // ============================================================
  describe('rollback', () => {
    it('should rollback executing plan', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      planner.execute(id);
      expect(planner.rollback(id)).toBe(true);
      expect(planner.isRolledBack(id)).toBe(true);
    });

    it('should reset in_progress to pending', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      planner.execute(id);
      planner.rollback(id);
      expect(planner.getStep(id, 's1')?.status).toBe('pending');
    });

    it('should return false for unknown', () => {
      expect(planner.rollback('unknown')).toBe(false);
    });

    it('should not double rollback', () => {
      const id = planner.createPlan([]);
      planner.rollback(id);
      expect(planner.rollback(id)).toBe(false);
    });
  });

  // ============================================================
  // getProgress
  // ============================================================
  describe('getProgress', () => {
    it('should return 0 for unknown', () => {
      expect(planner.getProgress('unknown')).toBe(0);
    });

    it('should return 0 for empty plan', () => {
      const id = planner.createPlan([]);
      expect(planner.getProgress(id)).toBe(0);
    });

    it('should calculate progress', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'completed', dependencies: [] },
        { id: 's2', description: 'd', status: 'pending', dependencies: [] },
        { id: 's3', description: 'd', status: 'pending', dependencies: [] },
      ]);
      expect(planner.getProgress(id)).toBe(33);
    });

    it('should return 100 when all completed', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'completed', dependencies: [] },
        { id: 's2', description: 'd', status: 'completed', dependencies: [] },
      ]);
      expect(planner.getProgress(id)).toBe(100);
    });
  });

  // ============================================================
  // completeStep / failStep
  // ============================================================
  describe('completeStep', () => {
    it('should complete step', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      expect(planner.completeStep(id, 's1')).toBe(true);
      expect(planner.getStep(id, 's1')?.status).toBe('completed');
    });

    it('should mark dependents as in_progress', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'completed', dependencies: [] },
        { id: 's2', description: 'd', status: 'pending', dependencies: ['s1'] },
      ]);
      // s2 is pending and depends on s1 (completed)
      // Manually trigger by completing s1 again (no-op)
      planner.completeStep(id, 's1');
      expect(planner.getStep(id, 's2')?.status).toBe('in_progress');
    });

    it('should mark plan as completed when all done', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      planner.completeStep(id, 's1');
      expect(planner.isCompleted(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(planner.completeStep('unknown', 's1')).toBe(false);
    });
  });

  describe('failStep', () => {
    it('should fail step', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      expect(planner.failStep(id, 's1')).toBe(true);
      expect(planner.getStep(id, 's1')?.status).toBe('failed');
    });

    it('should return false for unknown', () => {
      expect(planner.failStep('unknown', 's1')).toBe(false);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filter steps', () => {
    it('should get failed steps', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'failed', dependencies: [] },
        { id: 's2', description: 'd', status: 'pending', dependencies: [] },
      ]);
      expect(planner.getFailedSteps(id)).toHaveLength(1);
    });

    it('should get completed steps', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'completed', dependencies: [] },
      ]);
      expect(planner.getCompletedSteps(id)).toHaveLength(1);
    });

    it('should get pending steps', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      expect(planner.getPendingSteps(id)).toHaveLength(1);
    });

    it('should get in_progress steps', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'in_progress', dependencies: [] },
      ]);
      expect(planner.getInProgressSteps(id)).toHaveLength(1);
    });

    it('should check if has failed step', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'failed', dependencies: [] },
      ]);
      expect(planner.hasFailedStep(id)).toBe(true);
    });
  });

  // ============================================================
  // addStep / removeStep
  // ============================================================
  describe('addStep / removeStep', () => {
    it('should add step', () => {
      const id = planner.createPlan([]);
      expect(planner.addStep(id, { id: 's1', description: 'd', status: 'pending', dependencies: [] })).toBe(true);
    });

    it('should remove step', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'pending', dependencies: [] },
      ]);
      expect(planner.removeStep(id, 's1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(planner.addStep('unknown', { id: 's1', description: 'd', status: 'pending', dependencies: [] })).toBe(false);
    });
  });

  // ============================================================
  // canExecute / isCompleted / isRolledBack
  // ============================================================
  describe('status checks', () => {
    it('canExecute for pending plan', () => {
      const id = planner.createPlan([]);
      expect(planner.canExecute(id)).toBe(true);
    });

    it('cannot execute twice', () => {
      const id = planner.createPlan([]);
      planner.execute(id);
      expect(planner.canExecute(id)).toBe(false);
    });

    it('isCompleted should return false for empty', () => {
      const id = planner.createPlan([]);
      expect(planner.isCompleted(id)).toBe(false);
    });
  });

  // ============================================================
  // deletePlan
  // ============================================================
  describe('deletePlan', () => {
    it('should delete plan', () => {
      const id = planner.createPlan([]);
      expect(planner.deletePlan(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(planner.deletePlan('unknown')).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many plans', () => {
      for (let i = 0; i < 50; i++) {
        planner.createPlan([]);
      }
      expect(planner.getPlanCount()).toBe(50);
    });

    it('should handle complex dependencies', () => {
      const id = planner.createPlan([
        { id: 's1', description: 'd', status: 'completed', dependencies: [] },
        { id: 's2', description: 'd', status: 'pending', dependencies: ['s1'] },
        { id: 's3', description: 'd', status: 'pending', dependencies: ['s2'] },
      ]);
      planner.execute(id);
      planner.completeStep(id, 's1');
      expect(planner.getStep(id, 's2')?.status).toBe('in_progress');
    });
  });
});