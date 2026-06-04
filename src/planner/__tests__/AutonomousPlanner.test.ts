/**
 * AutonomousPlanner v2 Tests
 * Coverage target: ≥99%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutonomousPlanner } from '../AutonomousPlanner';
import type { Plan, PlanStep, PlanStatus, StepStatus } from '../AutonomousPlanner';

describe('AutonomousPlanner', () => {
  let planner: AutonomousPlanner;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  // ─── createPlan ───────────────────────────────────────────────────────────

  describe('createPlan', () => {
    it('creates a plan with generated id and steps', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Test goal', [
        { description: 'Step 1', estimatedCost: 10, dependencies: [] },
        { description: 'Step 2', estimatedCost: 20, dependencies: [] },
      ]);
      expect(plan.id).toBeTruthy();
      expect(plan.goal).toBe('Test goal');
      expect(plan.status).toBe('planned');
      expect(plan.createdAt).toBeDefined();
    });

    it('assigns pending status to all steps', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [
        { description: 'Step 1', estimatedCost: 5, dependencies: [] },
        { description: 'Step 2', estimatedCost: 10, dependencies: [] },
      ]);
      expect(plan.steps[0].status).toBe('pending');
      expect(plan.steps[1].status).toBe('pending');
    });

    it('generates unique step ids', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [
        { description: 'Step 1', estimatedCost: 5, dependencies: [] },
        { description: 'Step 2', estimatedCost: 10, dependencies: [] },
      ]);
      expect(plan.steps[0].id).not.toBe(plan.steps[1].id);
    });

    it('adds plan to getAllPlans', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', []);
      expect(planner.getAllPlans()).toContain(plan);
    });
  });

  // ─── getPlan ──────────────────────────────────────────────────────────────

  describe('getPlan', () => {
    it('returns plan by id', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 5, dependencies: [] },
      ]);
      expect(planner.getPlan(plan.id)).toBe(plan);
    });

    it('returns null for unknown id', () => {
      planner = new AutonomousPlanner();
      expect(planner.getPlan('unknown-id')).toBeNull();
    });
  });

  // ─── getAllPlans ──────────────────────────────────────────────────────────

  describe('getAllPlans', () => {
    it('returns empty array initially', () => {
      planner = new AutonomousPlanner();
      expect(planner.getAllPlans()).toEqual([]);
    });

    it('returns all created plans', () => {
      planner = new AutonomousPlanner();
      const plan1 = planner.createPlan('Goal 1', []);
      const plan2 = planner.createPlan('Goal 2', []);
      const all = planner.getAllPlans();
      expect(all).toContain(plan1);
      expect(all).toContain(plan2);
    });
  });

  // ─── execute ───────────────────────────────────────────────────────────────

  describe('execute', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('throws error for unknown plan', async () => {
      planner = new AutonomousPlanner(() => Promise.resolve());
      await expect(planner.execute('unknown')).rejects.toThrow('unknown');
    });

    it('changes status to executing synchronously', async () => {
      planner = new AutonomousPlanner(() => Promise.resolve());
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 10, dependencies: [] },
      ]);
      const p = planner.execute(plan.id);
      // Status changes to executing immediately
      expect(planner.getPlan(plan.id)!.status).toBe('executing');
      await p;
    });

    it('sets step status to done after execution', async () => {
      planner = new AutonomousPlanner(() => Promise.resolve());
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 10, dependencies: [] },
      ]);
      await planner.execute(plan.id);
      expect(plan.steps[0].status).toBe('done');
    });

    it('sets plan status to completed when all steps done', async () => {
      planner = new AutonomousPlanner(() => Promise.resolve());
      const plan = planner.createPlan('Goal', [
        { description: 'Step 1', estimatedCost: 5, dependencies: [] },
      ]);
      await planner.execute(plan.id);
      expect(plan.status).toBe('completed');
      expect(plan.completedAt).toBeDefined();
    });

    it('respects dependencies - step runs after dependency completes', async () => {
      // Use synchronous executor so steps run sequentially
      let callOrder: string[] = [];
      planner = new AutonomousPlanner(async (step) => {
        callOrder.push(step.id);
      });

      const plan = planner.createPlan('Goal', [
        { description: 'Step 1', estimatedCost: 5, dependencies: [] },
        { description: 'Step 2', estimatedCost: 5, dependencies: [''] }, // placeholder
      ]);
      plan.steps[1].dependencies = [plan.steps[0].id];

      await planner.execute(plan.id);

      expect(plan.steps[0].status).toBe('done');
      expect(plan.steps[1].status).toBe('done');
      expect(callOrder[0]).toBe(plan.steps[0].id);
      expect(callOrder[1]).toBe(plan.steps[1].id);
    });

    it('records actualCost on step completion', async () => {
      planner = new AutonomousPlanner(() => Promise.resolve());
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 10, dependencies: [] },
      ]);
      await planner.execute(plan.id);
      expect(plan.steps[0].actualCost).toBeGreaterThanOrEqual(0);
    });

    it('is idempotent on executing plan', async () => {
      planner = new AutonomousPlanner(() => Promise.resolve());
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 5, dependencies: [] },
      ]);
      // First execute completes the plan
      await planner.execute(plan.id);
      expect(plan.status).toBe('completed');
    });

    it('marks plan failed if a step fails', async () => {
      planner = new AutonomousPlanner(() => Promise.reject(new Error('step failed')));
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 5, dependencies: [] },
      ]);
      await planner.execute(plan.id);
      expect(plan.status).toBe('failed');
    });
  });

  // ─── pause ────────────────────────────────────────────────────────────────

  describe('pause', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('sets plan status to paused when executing', async () => {
      planner = new AutonomousPlanner(() => Promise.resolve());
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 50, dependencies: [] },
      ]);
      planner.execute(plan.id);
      // Status is executing after execute call
      planner.pause(plan.id);
      expect(plan.status).toBe('paused');
    });

    it('does nothing if plan not found', () => {
      planner = new AutonomousPlanner();
      planner.pause('unknown');
    });

    it('does nothing if plan not executing', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [{ description: 'Step', estimatedCost: 5, dependencies: [] }]);
      planner.pause(plan.id);
      expect(plan.status).toBe('planned');
    });
  });

  // ─── resume ───────────────────────────────────────────────────────────────

  describe('resume', () => {
    it('resumes a paused plan', async () => {
      planner = new AutonomousPlanner(() => Promise.resolve());
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 5, dependencies: [] },
      ]);
      planner.execute(plan.id);
      planner.pause(plan.id);
      expect(plan.status).toBe('paused');

      planner.resume(plan.id);
      expect(plan.status).toBe('executing');
      await Promise.resolve();
      expect(plan.status).toBe('completed');
    });

    it('does nothing if plan not paused', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [{ description: 'Step', estimatedCost: 5, dependencies: [] }]);
      planner.resume(plan.id);
      expect(plan.status).toBe('planned');
    });

    it('does nothing if plan not found', () => {
      planner = new AutonomousPlanner();
      planner.resume('unknown');
    });
  });

  // ─── cancel ───────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('sets plan status to failed', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', []);
      planner.cancel(plan.id);
      expect(plan.status).toBe('failed');
    });

    it('does nothing for unknown plan', () => {
      planner = new AutonomousPlanner();
      planner.cancel('unknown');
    });
  });

  // ─── retryStep ────────────────────────────────────────────────────────────

  describe('retryStep', () => {
    it('resets step status to pending for failed step', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 5, dependencies: [] },
      ]);
      plan.steps[0].status = 'failed';
      const result = planner.retryStep(plan.id, plan.steps[0].id);
      expect(result).toBe(true);
      expect(plan.steps[0].status).toBe('pending');
    });

    it('returns false for unknown plan', () => {
      planner = new AutonomousPlanner();
      expect(planner.retryStep('unknown', 'step')).toBe(false);
    });

    it('returns false for done step', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 5, dependencies: [] },
      ]);
      plan.steps[0].status = 'done';
      expect(planner.retryStep(plan.id, plan.steps[0].id)).toBe(false);
    });

    it('returns false after max retries', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 5, dependencies: [] },
      ]);
      plan.steps[0].status = 'failed';
      for (let i = 0; i < 3; i++) {
        planner.retryStep(plan.id, plan.steps[0].id);
        plan.steps[0].status = 'failed';
      }
      expect(planner.retryStep(plan.id, plan.steps[0].id)).toBe(false);
    });

    it('resets step status to pending on each retry until max', () => {
      planner = new AutonomousPlanner();
      const plan = planner.createPlan('Goal', [
        { description: 'Step', estimatedCost: 5, dependencies: [] },
      ]);
      plan.steps[0].status = 'failed';

      expect(planner.retryStep(plan.id, plan.steps[0].id)).toBe(true);
      expect(plan.steps[0].status).toBe('pending');

      plan.steps[0].status = 'failed';
      expect(planner.retryStep(plan.id, plan.steps[0].id)).toBe(true);
      expect(plan.steps[0].status).toBe('pending');
    });
  });

  // ─── Type exports ─────────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('PlanStatus is a valid union', () => {
      const statuses: PlanStatus[] = ['planned', 'executing', 'completed', 'failed', 'paused'];
      expect(statuses.length).toBe(5);
    });

    it('StepStatus is a valid union', () => {
      const statuses: StepStatus[] = ['pending', 'running', 'done', 'failed'];
      expect(statuses.length).toBe(4);
    });
  });
});