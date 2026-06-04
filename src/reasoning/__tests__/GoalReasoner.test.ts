/**
 * GoalReasoner Tests
 * generic-agent-design Goal Reasoner
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoalReasoner } from '../GoalReasoner';

describe('GoalReasoner', () => {
  let reasoner: GoalReasoner;

  beforeEach(() => {
    reasoner = new GoalReasoner();
  });

  afterEach(() => {
    reasoner.clearAll();
  });

  // ============================================================
  // analyze
  // ============================================================
  describe('analyze', () => {
    it('should analyze goal', () => {
      const analysis = reasoner.analyze('build a simple website');
      expect(analysis.goal).toBe('build a simple website');
      expect(analysis.complexity).toBeGreaterThan(0);
      expect(analysis.feasibility).toBeGreaterThan(0);
    });

    it('should return strategies', () => {
      const analysis = reasoner.analyze('build a website');
      expect(analysis.strategies.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // evaluateFeasibility
  // ============================================================
  describe('evaluateFeasibility', () => {
    it('should return 0 for empty', () => {
      expect(reasoner.evaluateFeasibility('')).toBe(0);
    });

    it('should return high for short goals', () => {
      const f = reasoner.evaluateFeasibility('task');
      expect(f).toBeGreaterThan(0.5);
    });

    it('should return lower for longer goals', () => {
      const f = reasoner.evaluateFeasibility('this is a very long goal with many words that should be less feasible');
      expect(f).toBeLessThan(0.5);
    });
  });

  // ============================================================
  // recommendStrategy
  // ============================================================
  describe('recommendStrategy', () => {
    it('should recommend sequential for simple', () => {
      expect(reasoner.recommendStrategy('a')).toBe('sequential');
    });

    it('should recommend iterative for medium', () => {
      expect(reasoner.recommendStrategy('a moderately complex goal here')).toMatch(/iterative|sequential/);
    });
  });

  // ============================================================
  // trackProgress
  // ============================================================
  describe('trackProgress', () => {
    it('should track progress', () => {
      reasoner.trackProgress('goal1', 50);
      expect(reasoner.getProgress('goal1')).toBe(50);
    });

    it('should clamp progress to 0-100', () => {
      reasoner.trackProgress('goal1', 150);
      expect(reasoner.getProgress('goal1')).toBe(100);
      reasoner.trackProgress('goal1', -10);
      expect(reasoner.getProgress('goal1')).toBe(0);
    });

    it('should return 0 for untracked', () => {
      expect(reasoner.getProgress('unknown')).toBe(0);
    });
  });

  // ============================================================
  // isCompleted
  // ============================================================
  describe('isCompleted', () => {
    it('should return true at 100', () => {
      reasoner.trackProgress('goal1', 100);
      expect(reasoner.isCompleted('goal1')).toBe(true);
    });

    it('should return false below 100', () => {
      reasoner.trackProgress('goal1', 50);
      expect(reasoner.isCompleted('goal1')).toBe(false);
    });
  });

  // ============================================================
  // getAllProgress / clearProgress
  // ============================================================
  describe('progress management', () => {
    it('should get all progress', () => {
      reasoner.trackProgress('g1', 50);
      reasoner.trackProgress('g2', 80);
      expect(reasoner.getAllProgress().size).toBe(2);
    });

    it('should clear progress', () => {
      reasoner.trackProgress('g1', 50);
      expect(reasoner.clearProgress('g1')).toBe(true);
      expect(reasoner.getProgress('g1')).toBe(0);
    });

    it('should return false for unknown clear', () => {
      expect(reasoner.clearProgress('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getComplexity
  // ============================================================
  describe('getComplexity', () => {
    it('should return 0 for empty', () => {
      expect(reasoner.getComplexity('')).toBe(0);
    });

    it('should return positive for goal', () => {
      expect(reasoner.getComplexity('task')).toBeGreaterThan(0);
    });

    it('should cap complexity at 10', () => {
      const c = reasoner.getComplexity('a very long goal with many many many many many many many many many many words');
      expect(c).toBeLessThanOrEqual(10);
    });
  });

  // ============================================================
  // getStrategies
  // ============================================================
  describe('getStrategies', () => {
    it('should return all strategies', () => {
      expect(reasoner.getStrategies().length).toBeGreaterThan(0);
    });

    it('should not expose internal array', () => {
      const s = reasoner.getStrategies();
      s.push('fake');
      expect(reasoner.getStrategies().length).toBe(5);
    });
  });

  // ============================================================
  // complexity / feasibility queries
  // ============================================================
  describe('queries', () => {
    it('should detect high complexity', () => {
      expect(reasoner.isHighComplexity('a very very long goal with many many many many many many many many words')).toBe(true);
    });

    it('should detect low complexity', () => {
      expect(reasoner.isLowComplexity('a')).toBe(true);
    });

    it('should detect highly feasible', () => {
      expect(reasoner.isHighlyFeasible('a')).toBe(true);
    });

    it('should detect infeasible', () => {
      expect(reasoner.isInfeasible('a very very long goal with many many many many many many many many many many words that is too complex')).toBe(true);
    });
  });

  // ============================================================
  // incrementProgress / setProgress
  // ============================================================
  describe('incrementProgress', () => {
    it('should increment progress', () => {
      expect(reasoner.incrementProgress('g1', 30)).toBe(30);
      expect(reasoner.incrementProgress('g1', 30)).toBe(60);
    });

    it('should clamp to 100', () => {
      reasoner.incrementProgress('g1', 200);
      expect(reasoner.getProgress('g1')).toBe(100);
    });
  });

  // ============================================================
  // hasGoal / count / filters
  // ============================================================
  describe('goal management', () => {
    it('should check if goal is tracked', () => {
      reasoner.trackProgress('g1', 50);
      expect(reasoner.hasGoal('g1')).toBe(true);
    });

    it('should count tracked goals', () => {
      reasoner.trackProgress('g1', 50);
      reasoner.trackProgress('g2', 80);
      expect(reasoner.getTrackedGoalCount()).toBe(2);
    });

    it('should get completed goals', () => {
      reasoner.trackProgress('g1', 100);
      reasoner.trackProgress('g2', 50);
      expect(reasoner.getCompletedGoals()).toEqual(['g1']);
    });

    it('should get in-progress goals', () => {
      reasoner.trackProgress('g1', 100);
      reasoner.trackProgress('g2', 50);
      expect(reasoner.getInProgressGoals()).toEqual(['g2']);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many goals', () => {
      for (let i = 0; i < 50; i++) {
        reasoner.trackProgress(`g${i}`, i * 2);
      }
      expect(reasoner.getTrackedGoalCount()).toBe(50);
    });
  });
});