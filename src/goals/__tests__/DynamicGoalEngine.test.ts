/**
 * DynamicGoalEngine Tests
 * generic-agent-design Dynamic Goal Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DynamicGoalEngine } from '../DynamicGoalEngine';

describe('DynamicGoalEngine', () => {
  let engine: DynamicGoalEngine;

  beforeEach(() => {
    engine = new DynamicGoalEngine();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // addGoal
  // ============================================================
  describe('addGoal', () => {
    it('should add a goal', () => {
      engine.addGoal({ id: 'g1', title: 'goal1', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      expect(engine.getGoalCount()).toBe(1);
    });

    it('should add a goal with subgoals', () => {
      engine.addGoal({
        id: 'g1',
        title: 'parent',
        priority: 1,
        status: 'pending',
        progress: 0,
        subgoals: [
          { id: 'sg1', title: 'sub1', priority: 2, status: 'pending', subgoals: [], progress: 0 },
        ],
      });
      expect(engine.getGoalCount()).toBe(2);
    });

    it('should not mutate input', () => {
      const subgoals = [{ id: 'sg1', title: 'sub1', priority: 2, status: 'pending' as const, subgoals: [], progress: 0 }];
      engine.addGoal({ id: 'g1', title: 'parent', priority: 1, status: 'pending' as const, subgoals, progress: 0 });
      subgoals.push({ id: 'fake', title: 'f', priority: 0, status: 'pending' as const, subgoals: [], progress: 0 });
      expect(engine.getGoal('g1')?.subgoals).toHaveLength(1);
    });
  });

  // ============================================================
  // decomposeGoal
  // ============================================================
  describe('decomposeGoal', () => {
    it('should return subgoals', () => {
      engine.addGoal({
        id: 'g1',
        title: 'parent',
        priority: 1,
        status: 'pending',
        progress: 0,
        subgoals: [
          { id: 'sg1', title: 'sub1', priority: 2, status: 'pending', subgoals: [], progress: 0 },
          { id: 'sg2', title: 'sub2', priority: 3, status: 'pending', subgoals: [], progress: 0 },
        ],
      });
      expect(engine.decomposeGoal('g1')).toHaveLength(2);
    });

    it('should return empty for unknown goal', () => {
      expect(engine.decomposeGoal('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // prioritize
  // ============================================================
  describe('prioritize', () => {
    it('should sort by priority desc', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      engine.addGoal({ id: 'g2', title: 'b', priority: 5, status: 'pending', subgoals: [], progress: 0 });
      engine.addGoal({ id: 'g3', title: 'c', priority: 3, status: 'pending', subgoals: [], progress: 0 });
      const sorted = engine.prioritize();
      expect(sorted[0].id).toBe('g2');
    });
  });

  // ============================================================
  // adjustPriority
  // ============================================================
  describe('adjustPriority', () => {
    it('should update priority', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      engine.adjustPriority('g1', 10);
      expect(engine.getGoal('g1')?.priority).toBe(10);
    });

    it('should return false for unknown', () => {
      expect(engine.adjustPriority('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // getProgress
  // ============================================================
  describe('getProgress', () => {
    it('should return 0 for unknown goal', () => {
      expect(engine.getProgress('unknown')).toBe(0);
    });

    it('should return 100 for completed goal', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'completed', subgoals: [], progress: 0 });
      expect(engine.getProgress('g1')).toBe(100);
    });

    it('should return direct progress', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'in_progress', subgoals: [], progress: 50 });
      expect(engine.getProgress('g1')).toBe(50);
    });

    it('should aggregate subgoals progress', () => {
      engine.addGoal({
        id: 'g1',
        title: 'parent',
        priority: 1,
        status: 'in_progress',
        progress: 0,
        subgoals: [
          { id: 'sg1', title: 's1', priority: 2, status: 'completed', subgoals: [], progress: 100 },
          { id: 'sg2', title: 's2', priority: 3, status: 'in_progress', subgoals: [], progress: 50 },
        ],
      });
      expect(engine.getProgress('g1')).toBe(75);
    });
  });

  // ============================================================
  // setStatus / setProgress
  // ============================================================
  describe('setStatus', () => {
    it('should update status', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      engine.setStatus('g1', 'in_progress');
      expect(engine.getGoal('g1')?.status).toBe('in_progress');
    });

    it('should set progress to 100 when completed', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      engine.setStatus('g1', 'completed');
      expect(engine.getGoal('g1')?.progress).toBe(100);
    });

    it('should return false for unknown', () => {
      expect(engine.setStatus('unknown', 'completed')).toBe(false);
    });
  });

  describe('setProgress', () => {
    it('should clamp progress to 0-100', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      engine.setProgress('g1', 150);
      expect(engine.getGoal('g1')?.progress).toBe(100);
      engine.setProgress('g1', -10);
      expect(engine.getGoal('g1')?.progress).toBe(0);
    });

    it('should auto-update status', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      engine.setProgress('g1', 50);
      expect(engine.getGoal('g1')?.status).toBe('in_progress');
    });
  });

  // ============================================================
  // filter by status
  // ============================================================
  describe('filter by status', () => {
    it('should get pending goals', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      engine.addGoal({ id: 'g2', title: 'b', priority: 1, status: 'completed', subgoals: [], progress: 100 });
      expect(engine.getPendingGoals()).toHaveLength(1);
    });

    it('should get in_progress goals', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'in_progress', subgoals: [], progress: 50 });
      expect(engine.getInProgressGoals()).toHaveLength(1);
    });

    it('should get completed goals', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'completed', subgoals: [], progress: 100 });
      expect(engine.getCompletedGoals()).toHaveLength(1);
    });
  });

  // ============================================================
  // remove / has
  // ============================================================
  describe('remove / has', () => {
    it('should remove goal', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      expect(engine.removeGoal('g1')).toBe(true);
      expect(engine.hasGoal('g1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(engine.removeGoal('unknown')).toBe(false);
    });

    it('should check if goal exists', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      expect(engine.hasGoal('g1')).toBe(true);
      expect(engine.hasGoal('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getAveragePriority
  // ============================================================
  describe('getAveragePriority', () => {
    it('should calculate average', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 10, status: 'pending', subgoals: [], progress: 0 });
      engine.addGoal({ id: 'g2', title: 'b', priority: 20, status: 'pending', subgoals: [], progress: 0 });
      expect(engine.getAveragePriority()).toBe(15);
    });

    it('should return 0 for empty', () => {
      expect(engine.getAveragePriority()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many goals', () => {
      for (let i = 0; i < 100; i++) {
        engine.addGoal({ id: `g${i}`, title: `g${i}`, priority: i, status: 'pending', subgoals: [], progress: 0 });
      }
      expect(engine.getGoalCount()).toBe(100);
    });

    it('should handle deep subgoals', () => {
      engine.addGoal({
        id: 'g1',
        title: 'l1',
        priority: 1,
        status: 'pending',
        progress: 0,
        subgoals: [
          {
            id: 'g2',
            title: 'l2',
            priority: 2,
            status: 'pending',
            progress: 0,
            subgoals: [
              { id: 'g3', title: 'l3', priority: 3, status: 'pending', subgoals: [], progress: 0 },
            ],
          },
        ],
      });
      expect(engine.getGoalCount()).toBe(3);
    });

    it('should handle empty subgoals', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 1, status: 'pending', subgoals: [], progress: 0 });
      expect(engine.decomposeGoal('g1')).toHaveLength(0);
    });

    it('should handle zero priority', () => {
      engine.addGoal({ id: 'g1', title: 'a', priority: 0, status: 'pending', subgoals: [], progress: 0 });
      expect(engine.getGoal('g1')?.priority).toBe(0);
    });
  });
});