/**
 * V192: GoalPursuit Tests
 * 
 * Tests for autonomous goal pursuit:
 * - Goal decomposition
 * - Sub-goal execution
 * - Progress evaluation
 * - Autonomous replanning
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoalPursuit } from '../GoalPursuit';

describe('GoalPursuit', () => {
  let gp: GoalPursuit;

  beforeEach(() => {
    gp = new GoalPursuit();
    gp.reset(); // Ensure clean state
  });

  describe('decompose', () => {
    it('decomposes "build" keyword goal into 4 sub-goals', () => {
      const goal = gp.decompose('build a new feature');
      
      expect(goal.id).toBeDefined();
      expect(goal.description).toBe('build a new feature');
      expect(goal.status).toBe('active');
      expect(goal.subGoals).toHaveLength(4);
      expect(goal.subGoals[0].description).toBe('Research and gather requirements');
      expect(goal.subGoals[1].description).toBe('Design solution architecture');
      expect(goal.subGoals[2].description).toBe('Implement core functionality');
      expect(goal.subGoals[3].description).toBe('Test and verify implementation');
    });

    it('decomposes "fix" keyword goal into 3 sub-goals', () => {
      const goal = gp.decompose('fix the bug');
      
      expect(goal.subGoals).toHaveLength(3);
      expect(goal.subGoals[0].description).toBe('Identify root cause');
      expect(goal.subGoals[1].description).toBe('Implement fix');
      expect(goal.subGoals[2].description).toBe('Verify fix works');
    });

    it('decomposes "learn" keyword goal into 3 sub-goals', () => {
      const goal = gp.decompose('learn TypeScript');
      
      expect(goal.subGoals).toHaveLength(3);
      expect(goal.subGoals[0].description).toBe('Gather learning materials');
      expect(goal.subGoals[1].description).toBe('Study and absorb content');
      expect(goal.subGoals[2].description).toBe('Practice and apply knowledge');
    });

    it('sets sequential dependencies between sub-goals', () => {
      const goal = gp.decompose('build a feature');
      
      expect(goal.subGoals[0].dependencies).toHaveLength(0);
      expect(goal.subGoals[1].dependencies).toEqual([goal.subGoals[0].id]);
      expect(goal.subGoals[2].dependencies).toEqual([goal.subGoals[1].id]);
      expect(goal.subGoals[3].dependencies).toEqual([goal.subGoals[2].id]);
    });

    it('returns a default single sub-goal for unrecognized descriptions', () => {
      const goal = gp.decompose('do something');
      
      expect(goal.subGoals).toHaveLength(1);
      expect(goal.subGoals[0].description).toBe('do something');
    });

    it('creates goal with active status', () => {
      const goal = gp.decompose('build something');
      expect(goal.status).toBe('active');
    });

    it('sets createdAt timestamp', () => {
      const before = Date.now();
      const goal = gp.decompose('build something');
      const after = Date.now();
      
      expect(goal.createdAt).toBeGreaterThanOrEqual(before);
      expect(goal.createdAt).toBeLessThanOrEqual(after);
    });
  });

  describe('executeSubGoal', () => {
    it('executes a sub-goal successfully', async () => {
      const goal = gp.decompose('build a feature');
      const subGoal = goal.subGoals[0];
      
      await gp.executeSubGoal(goal.id, subGoal.id);
      
      expect(subGoal.status).toBe('completed');
    });

    it('throws when goal not found', async () => {
      await expect(
        gp.executeSubGoal('nonexistent', 'subgoal')
      ).rejects.toThrow('Goal not found');
    });

    it('throws when sub-goal not found', async () => {
      const goal = gp.decompose('build a feature');
      await expect(
        gp.executeSubGoal(goal.id, 'nonexistent')
      ).rejects.toThrow('SubGoal not found');
    });

    it('throws when dependency not satisfied', async () => {
      const goal = gp.decompose('build a feature');
      const subGoal2 = goal.subGoals[1];
      
      await expect(
        gp.executeSubGoal(goal.id, subGoal2.id)
      ).rejects.toThrow('Dependency not satisfied');
    });

    it('allows execution when dependency is satisfied', async () => {
      const goal = gp.decompose('build a feature');
      const [subGoal1, subGoal2] = goal.subGoals;
      
      await gp.executeSubGoal(goal.id, subGoal1.id);
      await gp.executeSubGoal(goal.id, subGoal2.id);
      
      expect(subGoal1.status).toBe('completed');
      expect(subGoal2.status).toBe('completed');
    });

    it('is idempotent - executing already completed sub-goal returns void', async () => {
      const goal = gp.decompose('build a feature');
      const subGoal = goal.subGoals[0];
      
      await gp.executeSubGoal(goal.id, subGoal.id);
      await gp.executeSubGoal(goal.id, subGoal.id); // Should not throw
      
      expect(subGoal.status).toBe('completed');
    });

    it('marks sub-goal as in_progress during execution', async () => {
      const goal = gp.decompose('build a feature');
      const subGoal = goal.subGoals[0];
      
      const executionPromise = gp.executeSubGoal(goal.id, subGoal.id);
      expect(subGoal.status).toBe('in_progress');
      
      await executionPromise;
      expect(subGoal.status).toBe('completed');
    });
  });

  describe('evaluate', () => {
    it('returns 0% progress for goal with no completed sub-goals', () => {
      const goal = gp.decompose('build a feature');
      const result = gp.evaluate(goal.id);
      
      expect(result.progress).toBe(0);
      expect(result.status).toBe('active');
    });

    it('returns 25% progress after 1 of 4 sub-goals completed', async () => {
      const goal = gp.decompose('build a feature');
      await gp.executeSubGoal(goal.id, goal.subGoals[0].id);
      
      const result = gp.evaluate(goal.id);
      expect(result.progress).toBe(25);
      expect(result.status).toBe('active');
    });

    it('returns 100% progress when all sub-goals completed', async () => {
      const goal = gp.decompose('build a feature');
      for (const sg of goal.subGoals) {
        await gp.executeSubGoal(goal.id, sg.id);
      }
      
      const result = gp.evaluate(goal.id);
      expect(result.progress).toBe(100);
      expect(result.status).toBe('completed');
    });

    it('returns failed status when any sub-goal is failed', async () => {
      const goal = gp.decompose('build a feature');
      goal.subGoals[0].status = 'failed';
      
      const result = gp.evaluate(goal.id);
      expect(result.status).toBe('failed');
    });

    it('returns paused status when goal is paused', () => {
      const goal = gp.decompose('build a feature');
      gp.pauseGoal(goal.id);
      
      const result = gp.evaluate(goal.id);
      expect(result.status).toBe('paused');
    });

    it('throws when goal not found', () => {
      expect(() => gp.evaluate('nonexistent')).toThrow('Goal not found');
    });

    it('returns 0 progress for goal with no sub-goals', () => {
      const goal = gp.decompose('do something');
      const result = gp.evaluate(goal.id);
      expect(result.progress).toBe(0);
    });
  });

  describe('replan', () => {
    it('returns goal unchanged when completed', async () => {
      const goal = gp.decompose('build a feature');
      for (const sg of goal.subGoals) {
        await gp.executeSubGoal(goal.id, sg.id);
      }
      
      const replanned = gp.replan(goal.id);
      expect(replanned.subGoals).toHaveLength(4);
    });

    it('returns goal unchanged when failed with low failure ratio', () => {
      const goal = gp.decompose('build a feature');
      goal.subGoals[0].status = 'failed'; // 1 of 4 = 25% < 30%
      
      const replanned = gp.replan(goal.id);
      expect(replanned.subGoals).toHaveLength(4);
    });

    it('adds recovery sub-goal when failure ratio > 30%', () => {
      const goal = gp.decompose('build a feature');
      // Mark all 4 sub-goals first, then mark 2 as failed to get 50% failure ratio
      goal.subGoals[0].status = 'completed';
      goal.subGoals[1].status = 'completed';
      goal.subGoals[2].status = 'failed';
      goal.subGoals[3].status = 'failed'; // 2 of 4 = 50% > 30%
      
      const replanned = gp.replan(goal.id);
      expect(replanned.subGoals).toHaveLength(5);
      expect(replanned.subGoals[4].description).toContain('Recovery step');
    });

    it('resets blocked sub-goals to pending', () => {
      const goal = gp.decompose('build a feature');
      const [sg1, sg2] = goal.subGoals;
      
      sg1.status = 'failed';
      sg2.status = 'failed'; // sg2 depends on sg1
      
      const replanned = gp.replan(goal.id);
      
      // sg1 should still be failed (no dependencies to clear)
      // sg2 should be reset to pending and its failed dependency cleared
      expect(replanned.subGoals[0].status).toBe('failed');
      expect(replanned.subGoals[1].status).toBe('pending');
    });

    it('throws when goal not found', () => {
      expect(() => gp.replan('nonexistent')).toThrow('Goal not found');
    });
  });

  describe('pauseGoal / resumeGoal', () => {
    it('pauses an active goal', () => {
      const goal = gp.decompose('build a feature');
      gp.pauseGoal(goal.id);
      
      expect(goal.status).toBe('paused');
    });

    it('resumes a paused goal', () => {
      const goal = gp.decompose('build a feature');
      gp.pauseGoal(goal.id);
      gp.resumeGoal(goal.id);
      
      expect(goal.status).toBe('active');
    });

    it('resume only works on paused goals', () => {
      const goal = gp.decompose('build a feature');
      // goal is active, resume should not change it
      gp.resumeGoal(goal.id);
      expect(goal.status).toBe('active');
    });
  });

  describe('failSubGoal', () => {
    it('marks a sub-goal as failed', () => {
      const goal = gp.decompose('build a feature');
      const subGoal = goal.subGoals[0];
      
      gp.failSubGoal(goal.id, subGoal.id, 'Test failure');
      
      expect(subGoal.status).toBe('failed');
    });

    it('does nothing when goal not found', () => {
      gp.failSubGoal('nonexistent', 'some-id');
      // Should not throw
    });
  });

  describe('getGoal / getActiveGoals', () => {
    it('getGoal returns the goal', () => {
      const goal = gp.decompose('build a feature');
      const found = gp.getGoal(goal.id);
      
      expect(found).toEqual(goal);
    });

    it('getGoal returns undefined for nonexistent goal', () => {
      const found = gp.getGoal('nonexistent');
      expect(found).toBeUndefined();
    });

    it('getActiveGoals returns only active goals', () => {
      const goal1 = gp.decompose('build feature 1');
      const goal2 = gp.decompose('build feature 2');
      
      gp.pauseGoal(goal2.id);
      
      const active = gp.getActiveGoals();
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(goal1.id);
    });
  });