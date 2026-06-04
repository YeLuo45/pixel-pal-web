/**
 * GoalDecomposer Tests
 * generic-agent Goal Decomposition Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GoalDecomposer } from '../GoalDecomposer';

describe('GoalDecomposer', () => {
  let decomposer: GoalDecomposer;

  beforeEach(() => {
    decomposer = new GoalDecomposer();
  });

  // ============================================================
  // decompose
  // ============================================================
  describe('decompose', () => {
    it('should create a goal with sub-goals', () => {
      const goal = decomposer.decompose('build a web application');
      expect(goal.id).toMatch(/^goal-/);
      expect(goal.description).toBe('build a web application');
      expect(goal.subGoals.length).toBeGreaterThan(0);
    });

    it('should extract keywords from description', () => {
      const goal = decomposer.decompose('design and build and test the app');
      const descs = goal.subGoals.map((sg) => sg.description);
      expect(descs).toContain('design');
      expect(descs).toContain('build');
      expect(descs).toContain('test');
    });

    it('should set default priority to medium', () => {
      const goal = decomposer.decompose('do something');
      expect(goal.priority).toBe('medium');
    });

    it('should initialize status as pending', () => {
      const goal = decomposer.decompose('do something');
      expect(goal.status).toBe('pending');
    });

    it('should assign unique IDs to sub-goals', () => {
      const goal = decomposer.decompose('do something');
      const ids = goal.subGoals.map((sg) => sg.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should respect depth parameter', () => {
      const shallow = decomposer.decompose('do something', 1);
      const deep = decomposer.decompose('do something', 3);
      expect(deep.subGoals.length).toBeGreaterThanOrEqual(shallow.subGoals.length);
    });

    it('should set sub-goal status to pending', () => {
      const goal = decomposer.decompose('do something');
      for (const sg of goal.subGoals) {
        expect(sg.status).toBe('pending');
      }
    });

    it('should set sub-goal goalId to parent goal id', () => {
      const goal = decomposer.decompose('do something');
      for (const sg of goal.subGoals) {
        expect(sg.goalId).toBe(goal.id);
      }
    });
  });

  // ============================================================
  // generatePlan
  // ============================================================
  describe('generatePlan', () => {
    it('should create plan from goal', () => {
      const goal = decomposer.decompose('build app');
      const plan = decomposer.generatePlan(goal);
      expect(plan.goalId).toBe(goal.id);
      expect(plan.steps.length).toBeGreaterThan(0);
    });

    it('should calculate total effort', () => {
      const goal = decomposer.decompose('build app');
      const plan = decomposer.generatePlan(goal);
      const sum = goal.subGoals.reduce((s, sg) => s + sg.estimatedEffort, 0);
      expect(plan.totalEffort).toBe(sum);
    });

    it('should assign sequential order to steps', () => {
      const goal = decomposer.decompose('build app');
      const plan = decomposer.generatePlan(goal);
      for (let i = 0; i < plan.steps.length; i++) {
        expect(plan.steps[i].order).toBe(i + 1);
      }
    });

    it('should include all sub-goals in steps', () => {
      const goal = decomposer.decompose('build app');
      const plan = decomposer.generatePlan(goal);
      const stepIds = plan.steps.map((s) => s.subGoalId);
      for (const sg of goal.subGoals) {
        expect(stepIds).toContain(sg.id);
      }
    });

    it('should handle goal with no sub-goals', () => {
      const emptyGoal = { ...decomposer.decompose('x'), subGoals: [] };
      const plan = decomposer.generatePlan(emptyGoal);
      expect(plan.steps).toHaveLength(0);
      expect(plan.totalEffort).toBe(0);
    });
  });

  // ============================================================
  // getExecutableSteps
  // ============================================================
  describe('getExecutableSteps', () => {
    it('should return all steps with order > 0', () => {
      const goal = decomposer.decompose('build app');
      const plan = decomposer.generatePlan(goal);
      const exec = decomposer.getExecutableSteps(plan);
      expect(exec.length).toBe(plan.steps.length);
    });

    it('should return empty for empty plan', () => {
      const emptyGoal = { ...decomposer.decompose('x'), subGoals: [] };
      const plan = decomposer.generatePlan(emptyGoal);
      expect(decomposer.getExecutableSteps(plan)).toHaveLength(0);
    });
  });

  // ============================================================
  // updateProgress
  // ============================================================
  describe('updateProgress', () => {
    it('should update sub-goal status', () => {
      const goal = decomposer.decompose('build app');
      const sg = goal.subGoals[0];
      const updated = decomposer.updateProgress(goal, sg.id, 'in_progress');
      expect(updated.subGoals.find((s) => s.id === sg.id)?.status).toBe('in_progress');
    });

    it('should update goal status when sub-goal completes', () => {
      const goal = decomposer.decompose('build app');
      const sg = goal.subGoals[0];
      let updated = decomposer.updateProgress(goal, sg.id, 'in_progress');
      updated = decomposer.updateProgress(updated, sg.id, 'completed');
      expect(updated.status).toBe('completed');
    });

    it('should not change goal status for in_progress sub-goals', () => {
      const goal = decomposer.decompose('build app');
      const sg = goal.subGoals[0];
      const updated = decomposer.updateProgress(goal, sg.id, 'in_progress');
      expect(updated.status).toBe('in_progress');
    });

    it('should handle unknown sub-goal id', () => {
      const goal = decomposer.decompose('build app');
      const updated = decomposer.updateProgress(goal, 'unknown-id', 'completed');
      expect(updated.subGoals).toEqual(goal.subGoals);
    });
  });

  // ============================================================
  // setPriority
  // ============================================================
  describe('setPriority', () => {
    it('should set priority', () => {
      const goal = decomposer.decompose('build app');
      const updated = decomposer.setPriority(goal, 'critical');
      expect(updated.priority).toBe('critical');
    });

    it('should preserve other fields', () => {
      const goal = decomposer.decompose('build app');
      const updated = decomposer.setPriority(goal, 'high');
      expect(updated.id).toBe(goal.id);
      expect(updated.description).toBe(goal.description);
      expect(updated.subGoals.length).toBe(goal.subGoals.length);
    });
  });

  // ============================================================
  // addDependency
  // ============================================================
  describe('addDependency', () => {
    it('should add dependency from one sub-goal to another', () => {
      const goal = decomposer.decompose('build app');
      if (goal.subGoals.length < 2) return;
      const [sg1, sg2] = goal.subGoals;
      const updated = decomposer.addDependency(goal, sg1.id, sg2.id);
      const updatedSg = updated.subGoals.find((sg) => sg.id === sg1.id);
      expect(updatedSg?.dependencies).toContain(sg2.id);
    });

    it('should not modify goal for unknown sub-goal id', () => {
      const goal = decomposer.decompose('build app');
      const updated = decomposer.addDependency(goal, 'unknown', 'some-id');
      expect(updated).toEqual(goal);
    });
  });

  // ============================================================
  // getProgress
  // ============================================================
  describe('getProgress', () => {
    it('should return 0 for new goal', () => {
      const goal = decomposer.decompose('build app');
      expect(decomposer.getProgress(goal)).toBe(0);
    });

    it('should return 100 when all sub-goals complete', () => {
      const goal = decomposer.decompose('build app');
      let updated = goal;
      for (const sg of updated.subGoals) {
        updated = decomposer.updateProgress(updated, sg.id, 'completed');
      }
      expect(decomposer.getProgress(updated)).toBe(100);
    });

    it('should return correct percentage for partial completion', () => {
      const goal = decomposer.decompose('build test deploy app');
      let updated = goal;
      // Complete first two sub-goals
      updated = decomposer.updateProgress(updated, updated.subGoals[0].id, 'completed');
      updated = decomposer.updateProgress(updated, updated.subGoals[1].id, 'completed');
      const progress = decomposer.getProgress(updated);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('should return 0 for goal with no sub-goals', () => {
      const emptyGoal = { ...decomposer.decompose('x'), subGoals: [] };
      expect(decomposer.getProgress(emptyGoal)).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle empty description', () => {
      const goal = decomposer.decompose('');
      expect(goal.subGoals.length).toBeGreaterThan(0);
    });

    it('should handle very long description', () => {
      const long = 'a'.repeat(1000);
      const goal = decomposer.decompose(long);
      expect(goal.description).toBe(long);
    });

    it('should handle special characters', () => {
      const goal = decomposer.decompose('build @#$% app');
      expect(goal.subGoals.length).toBeGreaterThan(0);
    });

    it('should handle unicode characters', () => {
      const goal = decomposer.decompose('构建 应用程序 🚀');
      expect(goal.subGoals.length).toBeGreaterThan(0);
    });

    it('should handle repeated keyword matching', () => {
      const goal = decomposer.decompose('build build build build');
      expect(goal.subGoals.length).toBeGreaterThan(0);
    });

    it('should handle single word description', () => {
      const goal = decomposer.decompose('build');
      expect(goal.subGoals.length).toBeGreaterThan(0);
    });

    it('should handle negative estimated effort gracefully', () => {
      const goal = decomposer.decompose('build app');
      const plan = decomposer.generatePlan(goal);
      expect(plan.totalEffort).toBeGreaterThanOrEqual(0);
    });
  });
});