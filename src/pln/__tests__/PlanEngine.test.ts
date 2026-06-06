/**
 * PlanEngine Tests
 * generic-agent-design Plan Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlanEngine } from '../PlanEngine';

describe('PlanEngine', () => {
  let pln: PlanEngine;

  beforeEach(() => {
    pln = new PlanEngine();
  });

  afterEach(() => {
    pln.clearAll();
  });

  // ============================================================
  // create / addStep / completeStep / abort / remove
  // ============================================================
  describe('create / addStep / completeStep / abort / remove', () => {
    it('should create', () => {
      expect(pln.create('plan1')).toBe('pln-1');
    });

    it('should default status to pending', () => {
      const id = pln.create('plan1');
      expect(pln.getStatus(id)).toBe('pending');
    });

    it('should mark as active', () => {
      const id = pln.create('plan1');
      expect(pln.isActive(id)).toBe(true);
    });

    it('should add step', () => {
      const id = pln.create('plan1');
      expect(pln.addStep(id, 'step1')).toBe('pln-1-step-1');
    });

    it('should not add step to inactive', () => {
      const id = pln.create('plan1');
      pln.setActive(id, false);
      expect(pln.addStep(id, 'step1')).toBeNull();
    });

    it('should return null for unknown addStep', () => {
      expect(pln.addStep('unknown', 'step1')).toBeNull();
    });

    it('should complete step', () => {
      const id = pln.create('plan1');
      const stepId = pln.addStep(id, 'step1')!;
      expect(pln.completeStep(id, stepId)).toBe(true);
    });

    it('should not complete already done', () => {
      const id = pln.create('plan1');
      const stepId = pln.addStep(id, 'step1')!;
      pln.completeStep(id, stepId);
      expect(pln.completeStep(id, stepId)).toBe(false);
    });

    it('should not complete on inactive', () => {
      const id = pln.create('plan1');
      const stepId = pln.addStep(id, 'step1')!;
      pln.setActive(id, false);
      expect(pln.completeStep(id, stepId)).toBe(false);
    });

    it('should return false for unknown completeStep', () => {
      expect(pln.completeStep('unknown', 'step1')).toBe(false);
    });

    it('should auto-complete when all steps done', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 'step1')!;
      pln.completeStep(id, s1);
      expect(pln.isCompleted(id)).toBe(true);
    });

    it('should abort', () => {
      const id = pln.create('plan1');
      expect(pln.abort(id)).toBe(true);
    });

    it('should return false for unknown abort', () => {
      expect(pln.abort('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = pln.create('plan1');
      expect(pln.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pln.create('plan1');
      const stats = pln.getStats();
      expect(stats.plans).toBe(1);
    });

    it('should count total completed', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 's1')!;
      pln.completeStep(id, s1);
      expect(pln.getStats().totalCompleted).toBe(1);
    });

    it('should count total aborted', () => {
      const id = pln.create('plan1');
      pln.abort(id);
      expect(pln.getStats().totalAborted).toBe(1);
    });

    it('should count total steps', () => {
      const id = pln.create('plan1');
      pln.addStep(id, 's1');
      pln.addStep(id, 's2');
      expect(pln.getStats().totalSteps).toBe(2);
    });

    it('should count completed steps', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 's1')!;
      pln.completeStep(id, s1);
      expect(pln.getStats().completedSteps).toBe(1);
    });

    it('should count pending steps', () => {
      const id = pln.create('plan1');
      pln.addStep(id, 's1');
      expect(pln.getStats().pendingSteps).toBe(1);
    });

    it('should count active', () => {
      pln.create('plan1');
      expect(pln.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pln.create('plan1');
      pln.setActive(id, false);
      expect(pln.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 's1')!;
      pln.completeStep(id, s1);
      expect(pln.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pln.create('a');
      pln.create('b');
      expect(pln.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg steps', () => {
      const id = pln.create('plan1');
      pln.addStep(id, 's1');
      pln.addStep(id, 's2');
      expect(pln.getStats().avgSteps).toBe(2);
    });

    it('should get max steps', () => {
      const id1 = pln.create('p1');
      const id2 = pln.create('p2');
      pln.addStep(id1, 's1');
      pln.addStep(id2, 's1');
      pln.addStep(id2, 's2');
      expect(pln.getStats().maxSteps).toBe(2);
    });

    it('should get min steps', () => {
      pln.create('plan1');
      expect(pln.getStats().minSteps).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get plan', () => {
      pln.create('plan1');
      expect(pln.getPlan('pln-1')?.name).toBe('plan1');
    });

    it('should get all', () => {
      pln.create('plan1');
      expect(pln.getAllPlans()).toHaveLength(1);
    });

    it('should check existence', () => {
      pln.create('plan1');
      expect(pln.hasPlan('pln-1')).toBe(true);
    });

    it('should count', () => {
      expect(pln.getCount()).toBe(0);
      pln.create('plan1');
      expect(pln.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pln.create('plan1');
      expect(pln.getName('pln-1')).toBe('plan1');
    });

    it('should get steps', () => {
      const id = pln.create('plan1');
      pln.addStep(id, 's1');
      expect(pln.getSteps(id)).toHaveLength(1);
    });

    it('should get step count', () => {
      const id = pln.create('plan1');
      pln.addStep(id, 's1');
      expect(pln.getStepCount(id)).toBe(1);
    });

    it('should get completed step count', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 's1')!;
      pln.completeStep(id, s1);
      expect(pln.getCompletedStepCount(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 's1')!;
      pln.completeStep(id, s1);
      expect(pln.getHits(id)).toBe(1);
    });

    it('should check aborted', () => {
      const id = pln.create('plan1');
      pln.abort(id);
      expect(pln.isAborted(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pln.create('plan1');
      expect(pln.setActive('pln-1', false)).toBe(true);
    });

    it('should set name', () => {
      pln.create('plan1');
      expect(pln.setName('pln-1', 'plan2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pln.setActive('unknown', false)).toBe(false);
      expect(pln.setName('unknown', 'p')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 's1')!;
      pln.completeStep(id, s1);
      pln.setActive(id, false);
      pln.resetAll();
      expect(pln.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by status / state
  // ============================================================
  describe('by status / state', () => {
    it('should get by status', () => {
      pln.create('plan1');
      expect(pln.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      pln.create('plan1');
      expect(pln.getActivePlans()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pln.create('plan1');
      pln.setActive('pln-1', false);
      expect(pln.getInactivePlans()).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 's1')!;
      pln.completeStep(id, s1);
      expect(pln.getCompletedPlans()).toHaveLength(1);
    });

    it('should get all names', () => {
      pln.create('a');
      pln.create('b');
      expect(pln.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pln.create('a');
      expect(pln.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      pln.create('plan1');
      expect(pln.getNewest()?.id).toBe('pln-1');
    });

    it('should return null for empty newest', () => {
      expect(pln.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pln.create('plan1');
      expect(pln.getOldest()?.id).toBe('pln-1');
    });

    it('should return null for empty oldest', () => {
      expect(pln.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pln.create('plan1');
      expect(pln.getCreatedAt('pln-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pln.create('plan1');
      pln.addStep(id, 's1');
      expect(pln.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total completed', () => {
      const id = pln.create('plan1');
      const s1 = pln.addStep(id, 's1')!;
      pln.completeStep(id, s1);
      expect(pln.getTotalCompleted()).toBe(1);
    });

    it('should get total aborted', () => {
      const id = pln.create('plan1');
      pln.abort(id);
      expect(pln.getTotalAborted()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many plans', () => {
      for (let i = 0; i < 50; i++) {
        pln.create(`p${i}`);
      }
      expect(pln.getCount()).toBe(50);
    });
  });
});