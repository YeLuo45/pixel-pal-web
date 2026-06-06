/**
 * PlanEngine Tests
 * generic-agent-design Plan Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlanEngine } from '../PlanEngine';

describe('PlanEngine', () => {
  let pe: PlanEngine;

  beforeEach(() => {
    pe = new PlanEngine();
  });

  afterEach(() => {
    pe.clearAll();
  });

  // ============================================================
  // create / addStep / executeNext
  // ============================================================
  describe('create / addStep / executeNext', () => {
    it('should create', () => {
      expect(pe.create('plan1')).toBe('pe-1');
    });

    it('should mark as active', () => {
      const id = pe.create('plan1');
      expect(pe.isActive(id)).toBe(true);
    });

    it('should add step', () => {
      const id = pe.create('plan1');
      expect(pe.addStep(id, 'step1')).toBe(true);
    });

    it('should increment step count', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      expect(pe.getStepCount(id)).toBe(1);
    });

    it('should not add step to inactive', () => {
      const id = pe.create('plan1');
      pe.setActive(id, false);
      expect(pe.addStep(id, 'step1')).toBe(false);
    });

    it('should not add step to completed', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.executeAll(id);
      expect(pe.addStep(id, 'step2')).toBe(false);
    });

    it('should return false for unknown addStep', () => {
      expect(pe.addStep('unknown', 'step1')).toBe(false);
    });

    it('should execute next', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      expect(pe.executeNext(id)).toBe('step1');
    });

    it('should increment executed', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.executeNext(id);
      expect(pe.getExecuted(id)).toBe(1);
    });

    it('should return null when no more steps', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.executeNext(id);
      expect(pe.executeNext(id)).toBeNull();
    });

    it('should mark as completed when all done', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.executeNext(id);
      expect(pe.isCompleted(id)).toBe(true);
    });

    it('should not execute on inactive', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.setActive(id, false);
      expect(pe.executeNext(id)).toBeNull();
    });

    it('should not execute on completed', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.executeAll(id);
      expect(pe.executeNext(id)).toBeNull();
    });

    it('should return null for unknown execute', () => {
      expect(pe.executeNext('unknown')).toBeNull();
    });

    it('should execute all', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.addStep(id, 'step2');
      expect(pe.executeAll(id)).toBe(2);
    });

    it('should reset', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.executeNext(id);
      expect(pe.reset(id)).toBe(true);
    });

    it('should reset executed count', () => {
      const id = pe.create('plan1');
      pe.addStep(id, 'step1');
      pe.executeNext(id);
      pe.reset(id);
      expect(pe.getExecuted(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(pe.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pe.create('p1');
      const stats = pe.getStats();
      expect(stats.plans).toBe(1);
    });

    it('should count total steps', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.addStep(id, 's2');
      expect(pe.getStats().totalSteps).toBe(2);
    });

    it('should count total executed', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.executeNext(id);
      expect(pe.getStats().totalExecuted).toBe(1);
    });

    it('should count completed', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.executeAll(id);
      expect(pe.getStats().completed).toBe(1);
    });

    it('should count pending', () => {
      pe.create('p1');
      expect(pe.getStats().pending).toBe(1);
    });

    it('should count active', () => {
      pe.create('p1');
      expect(pe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pe.create('p1');
      pe.setActive(id, false);
      expect(pe.getStats().inactive).toBe(1);
    });

    it('should compute avg steps', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.addStep(id, 's2');
      expect(pe.getStats().avgSteps).toBe(2);
    });

    it('should compute avg executed', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.executeNext(id);
      expect(pe.getStats().avgExecuted).toBe(1);
    });

    it('should compute completion rate', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.executeAll(id);
      expect(pe.getStats().completionRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get plan', () => {
      pe.create('p1');
      expect(pe.getPlan('pe-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      pe.create('p1');
      expect(pe.getAllPlans()).toHaveLength(1);
    });

    it('should remove', () => {
      pe.create('p1');
      expect(pe.removePlan('pe-1')).toBe(true);
    });

    it('should check existence', () => {
      pe.create('p1');
      expect(pe.hasPlan('pe-1')).toBe(true);
    });

    it('should count', () => {
      expect(pe.getCount()).toBe(0);
      pe.create('p1');
      expect(pe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pe.create('p1');
      expect(pe.getName('pe-1')).toBe('p1');
    });

    it('should get steps', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      expect(pe.getSteps(id)).toEqual(['s1']);
    });

    it('should get step count', () => {
      pe.create('p1');
      expect(pe.getStepCount('pe-1')).toBe(0);
    });

    it('should get current step', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.executeNext(id);
      expect(pe.getCurrentStep(id)).toBe(1);
    });

    it('should get executed', () => {
      pe.create('p1');
      expect(pe.getExecuted('pe-1')).toBe(0);
    });

    it('should get history', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      expect(pe.getHistory(id)).toEqual(['s1']);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = pe.create('p1');
      expect(pe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = pe.create('p1');
      expect(pe.setName(id, 'p2')).toBe(true);
    });

    it('should remove step', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.addStep(id, 's2');
      expect(pe.removeStep(id, 0)).toBe(true);
    });

    it('should not remove step at invalid index', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      expect(pe.removeStep(id, 5)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(pe.setActive('unknown', false)).toBe(false);
      expect(pe.setName('unknown', 'p')).toBe(false);
      expect(pe.removeStep('unknown', 0)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.executeNext(id);
      pe.setActive(id, false);
      pe.resetAll();
      expect(pe.getExecuted(id)).toBe(0);
      expect(pe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      pe.create('p1');
      expect(pe.getByName('p1')).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.executeAll(id);
      expect(pe.getCompletedPlans()).toHaveLength(1);
    });

    it('should get pending', () => {
      pe.create('p1');
      expect(pe.getPendingPlans()).toHaveLength(1);
    });

    it('should get active', () => {
      pe.create('p1');
      expect(pe.getActivePlans()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = pe.create('p1');
      pe.setActive(id, false);
      expect(pe.getInactivePlans()).toHaveLength(1);
    });

    it('should get all names', () => {
      pe.create('p1');
      pe.create('p2');
      expect(pe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pe.create('p1');
      expect(pe.getNameCount()).toBe(1);
    });

    it('should get by min steps', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.addStep(id, 's2');
      expect(pe.getByMinSteps(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most steps', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.addStep(id, 's2');
      expect(pe.getMostSteps()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(pe.getMostSteps()).toBeNull();
    });

    it('should get newest', () => {
      pe.create('p1');
      expect(pe.getNewest()?.id).toBe('pe-1');
    });

    it('should return null for empty newest', () => {
      expect(pe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pe.create('p1');
      expect(pe.getOldest()?.id).toBe('pe-1');
    });

    it('should return null for empty oldest', () => {
      expect(pe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pe.create('p1');
      expect(pe.getCreatedAt('pe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      expect(pe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total executed', () => {
      const id = pe.create('p1');
      pe.addStep(id, 's1');
      pe.executeNext(id);
      expect(pe.getTotalExecuted()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many plans', () => {
      for (let i = 0; i < 50; i++) {
        pe.create(`p${i}`);
      }
      expect(pe.getCount()).toBe(50);
    });
  });
});