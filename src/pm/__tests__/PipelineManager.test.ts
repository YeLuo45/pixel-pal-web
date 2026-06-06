/**
 * PipelineManager Tests
 * thunderbolt-design Pipeline Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PipelineManager } from '../PipelineManager';

describe('PipelineManager', () => {
  let pm: PipelineManager;

  beforeEach(() => {
    pm = new PipelineManager();
  });

  afterEach(() => {
    pm.clearAll();
  });

  // ============================================================
  // create / runStep / reset
  // ============================================================
  describe('create / runStep / reset', () => {
    it('should create', () => {
      expect(pm.create('p1', ['s1', 's2'])).toBe('pm-1');
    });

    it('should mark as pending', () => {
      const id = pm.create('p1', ['s1', 's2']);
      expect(pm.isPending(id)).toBe(true);
    });

    it('should mark as active', () => {
      const id = pm.create('p1', ['s1', 's2']);
      expect(pm.isActive(id)).toBe(true);
    });

    it('should run step', () => {
      const id = pm.create('p1', ['s1', 's2']);
      expect(pm.runStep(id, true)).toBe(true);
    });

    it('should mark as running on run step', () => {
      const id = pm.create('p1', ['s1', 's2']);
      pm.runStep(id, true);
      expect(pm.isRunning(id)).toBe(true);
    });

    it('should mark as success at last step', () => {
      const id = pm.create('p1', ['s1']);
      pm.runStep(id, true);
      expect(pm.isSuccess(id)).toBe(true);
    });

    it('should mark as failed on run step false', () => {
      const id = pm.create('p1', ['s1', 's2']);
      pm.runStep(id, false);
      expect(pm.isFailed(id)).toBe(true);
    });

    it('should not run step inactive', () => {
      const id = pm.create('p1', ['s1', 's2']);
      pm.setActive(id, false);
      expect(pm.runStep(id, true)).toBe(false);
    });

    it('should return false for unknown runStep', () => {
      expect(pm.runStep('unknown', true)).toBe(false);
    });

    it('should reset', () => {
      const id = pm.create('p1', ['s1', 's2']);
      pm.runStep(id, true);
      expect(pm.reset(id)).toBe(true);
    });

    it('should mark as pending on reset', () => {
      const id = pm.create('p1', ['s1', 's2']);
      pm.runStep(id, true);
      pm.reset(id);
      expect(pm.isPending(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(pm.reset('unknown')).toBe(false);
    });

    it('should get current step', () => {
      const id = pm.create('p1', ['s1', 's2']);
      expect(pm.getCurrentStep(id)).toBe('s1');
    });

    it('should return done for success', () => {
      const id = pm.create('p1', ['s1']);
      pm.runStep(id, true);
      expect(pm.getCurrentStep(id)).toBe('done');
    });

    it('should return failed for failed', () => {
      const id = pm.create('p1', ['s1']);
      pm.runStep(id, false);
      expect(pm.getCurrentStep(id)).toBe('failed');
    });

    it('should return empty for unknown current step', () => {
      expect(pm.getCurrentStep('unknown')).toBe('');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pm.create('p1', ['s1']);
      const stats = pm.getStats();
      expect(stats.pipelines).toBe(1);
    });

    it('should count success', () => {
      const id = pm.create('p1', ['s1']);
      pm.runStep(id, true);
      expect(pm.getStats().success).toBe(1);
    });

    it('should count failed', () => {
      const id = pm.create('p1', ['s1']);
      pm.runStep(id, false);
      expect(pm.getStats().failed).toBe(1);
    });

    it('should count pending', () => {
      pm.create('p1', ['s1']);
      expect(pm.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      const id = pm.create('p1', ['s1', 's2']);
      pm.runStep(id, true);
      expect(pm.getStats().running).toBe(1);
    });

    it('should count active', () => {
      pm.create('p1', ['s1']);
      expect(pm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pm.create('p1', ['s1']);
      pm.setActive(id, false);
      expect(pm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pm.create('p1', ['s1']);
      pm.runStep(id, true);
      expect(pm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pm.create('p1', ['s1']);
      pm.create('p2', ['s1']);
      expect(pm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg steps', () => {
      pm.create('p1', ['s1', 's2', 's3']);
      expect(pm.getStats().avgSteps).toBe(3);
    });

    it('should count total steps', () => {
      pm.create('p1', ['s1', 's2']);
      pm.create('p2', ['s1', 's2', 's3']);
      expect(pm.getStats().totalSteps).toBe(5);
    });

    it('should compute success rate', () => {
      const id = pm.create('p1', ['s1']);
      pm.runStep(id, true);
      expect(pm.getStats().successRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pipeline', () => {
      pm.create('p1', ['s1']);
      expect(pm.getPipeline('pm-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      pm.create('p1', ['s1']);
      expect(pm.getAllPipelines()).toHaveLength(1);
    });

    it('should remove', () => {
      pm.create('p1', ['s1']);
      expect(pm.removePipeline('pm-1')).toBe(true);
    });

    it('should check existence', () => {
      pm.create('p1', ['s1']);
      expect(pm.hasPipeline('pm-1')).toBe(true);
    });

    it('should count', () => {
      expect(pm.getCount()).toBe(0);
      pm.create('p1', ['s1']);
      expect(pm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pm.create('p1', ['s1']);
      expect(pm.getName('pm-1')).toBe('p1');
    });

    it('should get steps', () => {
      pm.create('p1', ['s1', 's2']);
      expect(pm.getSteps('pm-1')).toEqual(['s1', 's2']);
    });

    it('should get step count', () => {
      pm.create('p1', ['s1', 's2']);
      expect(pm.getStepCount('pm-1')).toBe(2);
    });

    it('should get current step index', () => {
      pm.create('p1', ['s1', 's2']);
      expect(pm.getCurrentStepIndex('pm-1')).toBe(0);
    });

    it('should get status', () => {
      pm.create('p1', ['s1']);
      expect(pm.getStatus('pm-1')).toBe('pending');
    });

    it('should get history', () => {
      pm.create('p1', ['s1']);
      expect(pm.getHistory('pm-1')).toEqual(['pending']);
    });

    it('should get hits', () => {
      const id = pm.create('p1', ['s1']);
      pm.runStep(id, true);
      expect(pm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pm.create('p1', ['s1']);
      expect(pm.setActive('pm-1', false)).toBe(true);
    });

    it('should set name', () => {
      pm.create('p1', ['s1']);
      expect(pm.setName('pm-1', 'p2')).toBe(true);
    });

    it('should set steps', () => {
      pm.create('p1', ['s1']);
      expect(pm.setSteps('pm-1', ['x', 'y'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pm.setActive('unknown', false)).toBe(false);
      expect(pm.setName('unknown', 'p')).toBe(false);
      expect(pm.setSteps('unknown', [])).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pm.create('p1', ['s1', 's2']);
      pm.runStep(id, true);
      pm.setActive(id, false);
      pm.resetAll();
      expect(pm.isPending(id)).toBe(true);
      expect(pm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      pm.create('p1', ['s1']);
      expect(pm.getByName('p1')).toHaveLength(1);
    });

    it('should get by status', () => {
      pm.create('p1', ['s1']);
      expect(pm.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      pm.create('p1', ['s1']);
      expect(pm.getActivePipelines()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pm.create('p1', ['s1']);
      pm.setActive('pm-1', false);
      expect(pm.getInactivePipelines()).toHaveLength(1);
    });

    it('should get all names', () => {
      pm.create('p1', ['s1']);
      pm.create('p2', ['s1']);
      expect(pm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pm.create('p1', ['s1']);
      expect(pm.getNameCount()).toBe(1);
    });

    it('should get by min steps', () => {
      pm.create('p1', ['s1', 's2', 's3']);
      pm.create('p2', ['s1']);
      expect(pm.getByMinSteps(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most steps', () => {
      const id = pm.create('p1', ['s1', 's2', 's3']);
      pm.create('p2', ['s1']);
      expect(pm.getMostSteps()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(pm.getMostSteps()).toBeNull();
    });

    it('should get newest', () => {
      pm.create('p1', ['s1']);
      expect(pm.getNewest()?.id).toBe('pm-1');
    });

    it('should return null for empty newest', () => {
      expect(pm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pm.create('p1', ['s1']);
      expect(pm.getOldest()?.id).toBe('pm-1');
    });

    it('should return null for empty oldest', () => {
      expect(pm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pm.create('p1', ['s1']);
      expect(pm.getCreatedAt('pm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pm.create('p1', ['s1', 's2']);
      pm.runStep(id, true);
      expect(pm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many pipelines', () => {
      for (let i = 0; i < 50; i++) {
        pm.create(`p${i}`, ['s1', 's2']);
      }
      expect(pm.getCount()).toBe(50);
    });
  });
});