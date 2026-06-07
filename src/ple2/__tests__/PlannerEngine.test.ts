/**
 * PlannerEngine Tests
 * generic-agent-design Planner Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlannerEngine } from '../PlannerEngine';

describe('PlannerEngine', () => {
  let ple2: PlannerEngine;

  beforeEach(() => {
    ple2 = new PlannerEngine();
  });

  afterEach(() => {
    ple2.clearAll();
  });

  describe('addPlan / start / step / fail / remove', () => {
    it('should add plan', () => {
      expect(ple2.addPlan('goal1', 3)).toMatch(/^ple2-/);
    });

    it('should default status to pending', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getStatus(ple2.getAllPlans()[0].id)).toBe('pending');
    });

    it('should mark as active', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.isActive(ple2.getAllPlans()[0].id)).toBe(true);
    });

    it('should start', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.start(id)).toBe(true);
    });

    it('should set in-progress', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      expect(ple2.isInProgress(id)).toBe(true);
    });

    it('should not start inactive', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.setActive(id, false);
      expect(ple2.start(id)).toBe(false);
    });

    it('should return false for unknown start', () => {
      expect(ple2.start('unknown')).toBe(false);
    });

    it('should step', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      expect(ple2.step(id)).toBe(true);
    });

    it('should increment current', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      ple2.step(id);
      expect(ple2.getCurrent(id)).toBe(1);
    });

    it('should set completed when current equals steps', () => {
      const id = ple2.addPlan('goal1', 1);
      ple2.start(id);
      ple2.step(id);
      expect(ple2.isCompleted(id)).toBe(true);
    });

    it('should not step on pending', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.step(id)).toBe(false);
    });

    it('should not step on completed', () => {
      const id = ple2.addPlan('goal1', 1);
      ple2.start(id);
      ple2.step(id);
      expect(ple2.step(id)).toBe(false);
    });

    it('should not step inactive', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      ple2.setActive(id, false);
      expect(ple2.step(id)).toBe(false);
    });

    it('should return false for unknown step', () => {
      expect(ple2.step('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.fail(id)).toBe(true);
    });

    it('should set failed', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.fail(id);
      expect(ple2.isFailed(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(ple2.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getStats().plans).toBe(1);
    });

    it('should count total added', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getStats().totalAdded).toBe(1);
    });

    it('should count total completed', () => {
      const id = ple2.addPlan('goal1', 1);
      ple2.start(id);
      ple2.step(id);
      expect(ple2.getStats().totalCompleted).toBe(1);
    });

    it('should count total failed', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.fail(id);
      expect(ple2.getStats().totalFailed).toBe(1);
    });

    it('should count pending', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getStats().pending).toBe(1);
    });

    it('should count in-progress', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      expect(ple2.getStats().inProgress).toBe(1);
    });

    it('should count completed', () => {
      const id = ple2.addPlan('goal1', 1);
      ple2.start(id);
      ple2.step(id);
      expect(ple2.getStats().completed).toBe(1);
    });

    it('should count failed', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.fail(id);
      expect(ple2.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.setActive(id, false);
      expect(ple2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      expect(ple2.getStats().totalHits).toBe(1);
    });

    it('should count unique goals', () => {
      ple2.addPlan('a', 3);
      ple2.addPlan('a', 3);
      expect(ple2.getStats().uniqueGoals).toBe(1);
    });

    it('should count total steps', () => {
      ple2.addPlan('a', 3);
      expect(ple2.getStats().totalSteps).toBe(3);
    });
  });

  describe('queries', () => {
    it('should get plan', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.getPlan(id)?.goal).toBe('goal1');
    });

    it('should get all', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getAllPlans()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.hasPlan(id)).toBe(true);
    });

    it('should count', () => {
      expect(ple2.getCount()).toBe(0);
      ple2.addPlan('goal1', 3);
      expect(ple2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get goal', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.getGoal(id)).toBe('goal1');
    });

    it('should get steps', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.getSteps(id)).toBe(3);
    });

    it('should get current', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.getCurrent(id)).toBe(0);
    });

    it('should get hits', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      expect(ple2.getHits(id)).toBe(1);
    });

    it('should check pending', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.isPending(ple2.getAllPlans()[0].id)).toBe(true);
    });

    it('should check in-progress', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      expect(ple2.isInProgress(id)).toBe(true);
    });

    it('should check completed', () => {
      const id = ple2.addPlan('goal1', 1);
      ple2.start(id);
      ple2.step(id);
      expect(ple2.isCompleted(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.fail(id);
      expect(ple2.isFailed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.setActive(id, false)).toBe(true);
    });

    it('should set goal', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.setGoal(id, 'goal2')).toBe(true);
    });

    it('should set steps', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.setSteps(id, 5)).toBe(true);
    });

    it('should set current', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.setCurrent(id, 1)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ple2.setActive('unknown', false)).toBe(false);
      expect(ple2.setGoal('unknown', 'g')).toBe(false);
      expect(ple2.setSteps('unknown', 1)).toBe(false);
      expect(ple2.setCurrent('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      ple2.setActive(id, false);
      ple2.resetAll();
      expect(ple2.getCurrent(id)).toBe(0);
      expect(ple2.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getActivePlans()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.setActive(id, false);
      expect(ple2.getInactivePlans()).toHaveLength(1);
    });

    it('should get all goals', () => {
      ple2.addPlan('a', 3);
      ple2.addPlan('b', 3);
      expect(ple2.getAllGoals()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getNewest()?.goal).toBe('goal1');
    });

    it('should return null for empty newest', () => {
      expect(ple2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getOldest()?.goal).toBe('goal1');
    });

    it('should return null for empty oldest', () => {
      expect(ple2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ple2.addPlan('goal1', 3);
      expect(ple2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.start(id);
      expect(ple2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      ple2.addPlan('goal1', 3);
      expect(ple2.getTotalAdded()).toBe(1);
    });

    it('should get total completed', () => {
      const id = ple2.addPlan('goal1', 1);
      ple2.start(id);
      ple2.step(id);
      expect(ple2.getTotalCompleted()).toBe(1);
    });

    it('should get total failed', () => {
      const id = ple2.addPlan('goal1', 3);
      ple2.fail(id);
      expect(ple2.getTotalFailed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many plans', () => {
      for (let i = 0; i < 50; i++) {
        ple2.addPlan(`goal${i}`, 3);
      }
      expect(ple2.getCount()).toBe(50);
    });
  });
});