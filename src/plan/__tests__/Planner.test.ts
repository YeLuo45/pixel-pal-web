/**
 * Planner Tests
 * generic-agent-design Planner
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Planner } from '../Planner';

describe('Planner', () => {
  let planner: Planner;

  beforeEach(() => {
    planner = new Planner();
  });

  afterEach(() => {
    planner.clearAll();
  });

  // ============================================================
  // plan
  // ============================================================
  describe('plan', () => {
    it('should plan', () => {
      const id = planner.plan('goal1', ['a', 'b', 'c']);
      expect(id).toBe('plan-1');
    });

    it('should create steps', () => {
      const id = planner.plan('goal1', ['a', 'b']);
      expect(planner.getStepCount(id)).toBe(2);
    });

    it('should set initial evaluated to false', () => {
      const id = planner.plan('goal1', ['a']);
      expect(planner.isEvaluated(id)).toBe(false);
    });
  });

  // ============================================================
  // evaluate
  // ============================================================
  describe('evaluate', () => {
    it('should evaluate', () => {
      const id = planner.plan('goal1', ['a', 'b']);
      expect(planner.evaluate(id)).toBe(true);
    });

    it('should mark feasible', () => {
      const id = planner.plan('goal1', ['a']);
      planner.evaluate(id);
      expect(planner.isFeasible(id)).toBe(true);
    });

    it('should mark infeasible for empty', () => {
      const id = planner.plan('goal1', []);
      planner.evaluate(id);
      expect(planner.isFeasible(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(planner.evaluate('unknown')).toBe(false);
    });
  });

  // ============================================================
  // listPlans
  // ============================================================
  describe('listPlans', () => {
    it('should list', () => {
      planner.plan('a', ['x']);
      expect(planner.listPlans()).toHaveLength(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      const id = planner.plan('a', ['x']);
      planner.evaluate(id);
      const stats = planner.getStats();
      expect(stats.plans).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get plan', () => {
      planner.plan('a', ['x']);
      expect(planner.getPlan('plan-1')?.goal).toBe('a');
    });

    it('should remove', () => {
      const id = planner.plan('a', ['x']);
      expect(planner.removePlan(id)).toBe(true);
    });

    it('should check existence', () => {
      planner.plan('a', ['x']);
      expect(planner.hasPlan('plan-1')).toBe(true);
    });

    it('should count', () => {
      expect(planner.getCount()).toBe(0);
      planner.plan('a', ['x']);
      expect(planner.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get goal', () => {
      planner.plan('a', ['x']);
      expect(planner.getGoal('plan-1')).toBe('a');
    });

    it('should get steps', () => {
      const id = planner.plan('a', ['x', 'y']);
      expect(planner.getSteps(id)).toHaveLength(2);
    });

    it('should get step count', () => {
      const id = planner.plan('a', ['x', 'y']);
      expect(planner.getStepCount(id)).toBe(2);
    });

    it('should get step', () => {
      const id = planner.plan('a', ['x', 'y']);
      const steps = planner.getSteps(id);
      expect(planner.getStep(id, steps[0].id)?.action).toBe('x');
    });

    it('should get total duration', () => {
      const id = planner.plan('a', ['x', 'y']);
      expect(planner.getTotalDuration(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // status
  // ============================================================
  describe('status', () => {
    it('should check isEvaluated', () => {
      const id = planner.plan('a', ['x']);
      planner.evaluate(id);
      expect(planner.isEvaluated(id)).toBe(true);
    });

    it('should check isFeasible', () => {
      const id = planner.plan('a', ['x']);
      planner.evaluate(id);
      expect(planner.isFeasible(id)).toBe(true);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      planner.plan('a', ['x']);
      expect(planner.getCreatedAt('plan-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      planner.plan('a', ['x']);
      expect(planner.getUpdatedAt('plan-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get feasible', () => {
      const id = planner.plan('a', ['x']);
      planner.evaluate(id);
      expect(planner.getFeasiblePlans()).toHaveLength(1);
    });

    it('should get infeasible', () => {
      const id = planner.plan('a', []);
      planner.evaluate(id);
      expect(planner.getInfeasiblePlans()).toHaveLength(1);
    });

    it('should get unevaluated', () => {
      planner.plan('a', ['x']);
      expect(planner.getUnevaluatedPlans()).toHaveLength(1);
    });
  });

  // ============================================================
  // by goal
  // ============================================================
  describe('by goal', () => {
    it('should get by goal', () => {
      planner.plan('a', ['x']);
      expect(planner.getByGoal('a')).toHaveLength(1);
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should get avg steps', () => {
      planner.plan('a', ['x', 'y']);
      expect(planner.getAvgSteps()).toBe(2);
    });

    it('should get avg duration', () => {
      planner.plan('a', ['x']);
      expect(planner.getAvgDuration()).toBeGreaterThan(0);
    });

    it('should get largest plan', () => {
      planner.plan('a', ['x', 'y']);
      expect(planner.getLargestPlan()?.id).toBe('plan-1');
    });

    it('should get smallest plan', () => {
      planner.plan('a', ['x']);
      expect(planner.getSmallestPlan()?.id).toBe('plan-1');
    });

    it('should return null for empty', () => {
      expect(planner.getLargestPlan()).toBeNull();
      expect(planner.getSmallestPlan()).toBeNull();
    });

    it('should return 0 for empty avg', () => {
      expect(planner.getAvgSteps()).toBe(0);
      expect(planner.getAvgDuration()).toBe(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set goal', () => {
      const id = planner.plan('a', ['x']);
      expect(planner.setGoal(id, 'b')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(planner.setGoal('unknown', 'b')).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many plans', () => {
      for (let i = 0; i < 50; i++) {
        planner.plan(`g${i}`, ['a']);
      }
      expect(planner.getCount()).toBe(50);
    });
  });
});