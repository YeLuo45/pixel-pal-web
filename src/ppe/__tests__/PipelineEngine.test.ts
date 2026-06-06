/**
 * PipelineEngine Tests
 * thunderbolt-design Pipeline Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PipelineEngine } from '../PipelineEngine';

describe('PipelineEngine', () => {
  let ppe: PipelineEngine;

  beforeEach(() => {
    ppe = new PipelineEngine();
  });

  afterEach(() => {
    ppe.clearAll();
  });

  // ============================================================
  // create / addStep / start / completeStep / failStep / remove
  // ============================================================
  describe('create / addStep / start / completeStep / failStep / remove', () => {
    it('should create', () => {
      expect(ppe.create('p1')).toBe('ppe-1');
    });

    it('should mark as active', () => {
      const id = ppe.create('p1');
      expect(ppe.isActive(id)).toBe(true);
    });

    it('should add step', () => {
      const id = ppe.create('p1');
      expect(ppe.addStep(id, 's1', 100)).toBe('ppe-1-s-1');
    });

    it('should return null for unknown addStep', () => {
      expect(ppe.addStep('unknown', 's1', 100)).toBeNull();
    });

    it('should not add step on inactive', () => {
      const id = ppe.create('p1');
      ppe.setActive(id, false);
      expect(ppe.addStep(id, 's1', 100)).toBeNull();
    });

    it('should start step', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      expect(ppe.start(pid, sid)).toBe(true);
    });

    it('should return false for unknown start', () => {
      expect(ppe.start('unknown', 'unknown')).toBe(false);
    });

    it('should complete step', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.start(pid, sid);
      expect(ppe.completeStep(pid, sid)).toBe(true);
    });

    it('should fail step', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      expect(ppe.failStep(pid, sid)).toBe(true);
    });

    it('should complete pipeline', () => {
      const id = ppe.create('p1');
      expect(ppe.complete(id)).toBe(true);
    });

    it('should return false for unknown complete', () => {
      expect(ppe.complete('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ppe.create('p1');
      expect(ppe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ppe.create('p1');
      const stats = ppe.getStats();
      expect(stats.pipelines).toBe(1);
    });

    it('should count total started', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.start(pid, sid);
      expect(ppe.getStats().totalStarted).toBe(1);
    });

    it('should count total completed', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.start(pid, sid);
      ppe.completeStep(pid, sid);
      expect(ppe.getStats().totalCompleted).toBe(1);
    });

    it('should count total failed', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.failStep(pid, sid);
      expect(ppe.getStats().totalFailed).toBe(1);
    });

    it('should count active', () => {
      ppe.create('p1');
      expect(ppe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ppe.create('p1');
      ppe.setActive(id, false);
      expect(ppe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ppe.create('p1');
      ppe.complete(id);
      expect(ppe.getStats().totalHits).toBe(1);
    });

    it('should count total steps', () => {
      const id = ppe.create('p1');
      ppe.addStep(id, 's1', 100);
      ppe.addStep(id, 's2', 200);
      expect(ppe.getStats().totalSteps).toBe(2);
    });

    it('should compute avg steps', () => {
      const id = ppe.create('p1');
      ppe.addStep(id, 's1', 100);
      ppe.addStep(id, 's2', 200);
      expect(ppe.getStats().avgSteps).toBe(2);
    });

    it('should get max steps', () => {
      const id1 = ppe.create('p1');
      const id2 = ppe.create('p2');
      ppe.addStep(id1, 's1', 100);
      ppe.addStep(id2, 's1', 100);
      ppe.addStep(id2, 's2', 200);
      expect(ppe.getStats().maxSteps).toBe(2);
    });

    it('should get min steps', () => {
      ppe.create('p1');
      expect(ppe.getStats().minSteps).toBe(0);
    });

    it('should count pending steps', () => {
      const id = ppe.create('p1');
      ppe.addStep(id, 's1', 100);
      expect(ppe.getStats().pendingSteps).toBe(1);
    });

    it('should count running steps', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.start(pid, sid);
      expect(ppe.getStats().runningSteps).toBe(1);
    });

    it('should count completed steps', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.start(pid, sid);
      ppe.completeStep(pid, sid);
      expect(ppe.getStats().completedSteps).toBe(1);
    });

    it('should count failed steps', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.failStep(pid, sid);
      expect(ppe.getStats().failedSteps).toBe(1);
    });

    it('should count total duration', () => {
      const id = ppe.create('p1');
      ppe.addStep(id, 's1', 100);
      ppe.addStep(id, 's2', 200);
      expect(ppe.getStats().totalDuration).toBe(300);
    });

    it('should count unique names', () => {
      ppe.create('a');
      ppe.create('b');
      expect(ppe.getStats().uniqueNames).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pipeline', () => {
      ppe.create('p1');
      expect(ppe.getPipeline('ppe-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      ppe.create('p1');
      expect(ppe.getAllPipelines()).toHaveLength(1);
    });

    it('should check existence', () => {
      ppe.create('p1');
      expect(ppe.hasPipeline('ppe-1')).toBe(true);
    });

    it('should count', () => {
      expect(ppe.getCount()).toBe(0);
      ppe.create('p1');
      expect(ppe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ppe.create('p1');
      expect(ppe.getName('ppe-1')).toBe('p1');
    });

    it('should get steps', () => {
      const id = ppe.create('p1');
      ppe.addStep(id, 's1', 100);
      expect(ppe.getSteps(id)).toHaveLength(1);
    });

    it('should get step count', () => {
      const id = ppe.create('p1');
      ppe.addStep(id, 's1', 100);
      expect(ppe.getStepCount(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = ppe.create('p1');
      ppe.complete(id);
      expect(ppe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ppe.create('p1');
      expect(ppe.setActive('ppe-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ppe.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.start(pid, sid);
      ppe.setActive(pid, false);
      ppe.resetAll();
      expect(ppe.isActive(pid)).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get active', () => {
      ppe.create('p1');
      expect(ppe.getActivePipelines()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ppe.create('p1');
      ppe.setActive('ppe-1', false);
      expect(ppe.getInactivePipelines()).toHaveLength(1);
    });

    it('should get all names', () => {
      ppe.create('a');
      ppe.create('b');
      expect(ppe.getAllNames()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      ppe.create('p1');
      expect(ppe.getNewest()?.id).toBe('ppe-1');
    });

    it('should return null for empty newest', () => {
      expect(ppe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ppe.create('p1');
      expect(ppe.getOldest()?.id).toBe('ppe-1');
    });

    it('should return null for empty oldest', () => {
      expect(ppe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ppe.create('p1');
      expect(ppe.getCreatedAt('ppe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ppe.create('p1');
      ppe.complete(id);
      expect(ppe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total started', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.start(pid, sid);
      expect(ppe.getTotalStarted()).toBe(1);
    });

    it('should get total completed', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.start(pid, sid);
      ppe.completeStep(pid, sid);
      expect(ppe.getTotalCompleted()).toBe(1);
    });

    it('should get total failed', () => {
      const pid = ppe.create('p1');
      const sid = ppe.addStep(pid, 's1', 100)!;
      ppe.failStep(pid, sid);
      expect(ppe.getTotalFailed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many pipelines', () => {
      for (let i = 0; i < 50; i++) {
        ppe.create(`p${i}`);
      }
      expect(ppe.getCount()).toBe(50);
    });
  });
});