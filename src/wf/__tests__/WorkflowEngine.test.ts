/**
 * WorkflowEngine Tests
 * chatdev-design Workflow Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkflowEngine } from '../WorkflowEngine';

describe('WorkflowEngine', () => {
  let wf: WorkflowEngine;

  beforeEach(() => {
    wf = new WorkflowEngine();
  });

  afterEach(() => {
    wf.clearAll();
  });

  // ============================================================
  // define / advance / reset
  // ============================================================
  describe('define / advance / reset', () => {
    it('should define', () => {
      expect(wf.define('w1', ['s1', 's2'])).toBe('wf-1');
    });

    it('should mark as active', () => {
      const id = wf.define('w1', ['s1', 's2']);
      expect(wf.isActive(id)).toBe(true);
    });

    it('should mark as in progress', () => {
      const id = wf.define('w1', ['s1', 's2']);
      expect(wf.isInProgress(id)).toBe(true);
    });

    it('should advance', () => {
      const id = wf.define('w1', ['s1', 's2']);
      expect(wf.advance(id)).toBe(true);
    });

    it('should mark as completed at last stage', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.advance(id);
      wf.advance(id);
      expect(wf.isCompleted(id)).toBe(true);
    });

    it('should not advance completed', () => {
      const id = wf.define('w1', ['s1']);
      wf.advance(id);
      expect(wf.advance(id)).toBe(false);
    });

    it('should not advance inactive', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.setActive(id, false);
      expect(wf.advance(id)).toBe(false);
    });

    it('should return false for unknown advance', () => {
      expect(wf.advance('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.advance(id);
      expect(wf.reset(id)).toBe(true);
    });

    it('should mark as not completed on reset', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.advance(id);
      wf.advance(id);
      wf.reset(id);
      expect(wf.isCompleted(id)).toBe(false);
    });

    it('should return false for unknown reset', () => {
      expect(wf.reset('unknown')).toBe(false);
    });

    it('should get current stage', () => {
      const id = wf.define('w1', ['s1', 's2']);
      expect(wf.getCurrentStage(id)).toBe('s1');
    });

    it('should advance current stage', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.advance(id);
      expect(wf.getCurrentStage(id)).toBe('s2');
    });

    it('should return done for completed', () => {
      const id = wf.define('w1', ['s1']);
      wf.advance(id);
      expect(wf.getCurrentStage(id)).toBe('done');
    });

    it('should return empty for unknown current stage', () => {
      expect(wf.getCurrentStage('unknown')).toBe('');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      wf.define('w1', ['s1', 's2']);
      const stats = wf.getStats();
      expect(stats.workflows).toBe(1);
    });

    it('should count completed', () => {
      const id = wf.define('w1', ['s1']);
      wf.advance(id);
      expect(wf.getStats().completed).toBe(1);
    });

    it('should count in progress', () => {
      wf.define('w1', ['s1', 's2']);
      expect(wf.getStats().inProgress).toBe(1);
    });

    it('should count active', () => {
      wf.define('w1', ['s1', 's2']);
      expect(wf.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.setActive(id, false);
      expect(wf.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.advance(id);
      expect(wf.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      wf.define('w1', ['s1']);
      wf.define('w2', ['s1']);
      expect(wf.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg stages', () => {
      wf.define('w1', ['s1', 's2', 's3']);
      expect(wf.getStats().avgStages).toBe(3);
    });

    it('should get max stages', () => {
      wf.define('w1', ['s1', 's2']);
      wf.define('w2', ['s1', 's2', 's3', 's4']);
      expect(wf.getStats().maxStages).toBe(4);
    });

    it('should get min stages', () => {
      wf.define('w1', ['s1', 's2']);
      wf.define('w2', ['s1']);
      expect(wf.getStats().minStages).toBe(1);
    });

    it('should count total stages', () => {
      wf.define('w1', ['s1', 's2']);
      wf.define('w2', ['s1', 's2', 's3']);
      expect(wf.getStats().totalStages).toBe(5);
    });

    it('should compute completion rate', () => {
      const id = wf.define('w1', ['s1']);
      wf.advance(id);
      expect(wf.getStats().completionRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get workflow', () => {
      wf.define('w1', ['s1']);
      expect(wf.getWorkflow('wf-1')?.name).toBe('w1');
    });

    it('should get all', () => {
      wf.define('w1', ['s1']);
      expect(wf.getAllWorkflows()).toHaveLength(1);
    });

    it('should remove', () => {
      wf.define('w1', ['s1']);
      expect(wf.removeWorkflow('wf-1')).toBe(true);
    });

    it('should check existence', () => {
      wf.define('w1', ['s1']);
      expect(wf.hasWorkflow('wf-1')).toBe(true);
    });

    it('should count', () => {
      expect(wf.getCount()).toBe(0);
      wf.define('w1', ['s1']);
      expect(wf.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      wf.define('w1', ['s1']);
      expect(wf.getName('wf-1')).toBe('w1');
    });

    it('should get stages', () => {
      wf.define('w1', ['s1', 's2']);
      expect(wf.getStages('wf-1')).toEqual(['s1', 's2']);
    });

    it('should get stage count', () => {
      wf.define('w1', ['s1', 's2']);
      expect(wf.getStageCount('wf-1')).toBe(2);
    });

    it('should get current stage index', () => {
      wf.define('w1', ['s1', 's2']);
      expect(wf.getCurrentStageIndex('wf-1')).toBe(0);
    });

    it('should get history', () => {
      wf.define('w1', ['s1', 's2']);
      expect(wf.getHistory('wf-1')).toEqual([0]);
    });

    it('should get hits', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.advance(id);
      expect(wf.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      wf.define('w1', ['s1']);
      expect(wf.setActive('wf-1', false)).toBe(true);
    });

    it('should set name', () => {
      wf.define('w1', ['s1']);
      expect(wf.setName('wf-1', 'w2')).toBe(true);
    });

    it('should set stages', () => {
      wf.define('w1', ['s1']);
      expect(wf.setStages('wf-1', ['x', 'y'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wf.setActive('unknown', false)).toBe(false);
      expect(wf.setName('unknown', 'w')).toBe(false);
      expect(wf.setStages('unknown', [])).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.advance(id);
      wf.setActive(id, false);
      wf.resetAll();
      expect(wf.getCurrentStageIndex(id)).toBe(0);
      expect(wf.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      wf.define('w1', ['s1']);
      expect(wf.getByName('w1')).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = wf.define('w1', ['s1']);
      wf.advance(id);
      expect(wf.getCompletedWorkflows()).toHaveLength(1);
    });

    it('should get in progress', () => {
      wf.define('w1', ['s1', 's2']);
      expect(wf.getInProgressWorkflows()).toHaveLength(1);
    });

    it('should get active', () => {
      wf.define('w1', ['s1']);
      expect(wf.getActiveWorkflows()).toHaveLength(1);
    });

    it('should get inactive', () => {
      wf.define('w1', ['s1']);
      wf.setActive('wf-1', false);
      expect(wf.getInactiveWorkflows()).toHaveLength(1);
    });

    it('should get all names', () => {
      wf.define('w1', ['s1']);
      wf.define('w2', ['s1']);
      expect(wf.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      wf.define('w1', ['s1']);
      expect(wf.getNameCount()).toBe(1);
    });

    it('should get by min stages', () => {
      wf.define('w1', ['s1', 's2', 's3']);
      wf.define('w2', ['s1']);
      expect(wf.getByMinStages(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most stages', () => {
      const id = wf.define('w1', ['s1', 's2', 's3']);
      wf.define('w2', ['s1']);
      expect(wf.getMostStages()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(wf.getMostStages()).toBeNull();
    });

    it('should get newest', () => {
      wf.define('w1', ['s1']);
      expect(wf.getNewest()?.id).toBe('wf-1');
    });

    it('should return null for empty newest', () => {
      expect(wf.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      wf.define('w1', ['s1']);
      expect(wf.getOldest()?.id).toBe('wf-1');
    });

    it('should return null for empty oldest', () => {
      expect(wf.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      wf.define('w1', ['s1']);
      expect(wf.getCreatedAt('wf-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = wf.define('w1', ['s1', 's2']);
      wf.advance(id);
      expect(wf.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many workflows', () => {
      for (let i = 0; i < 50; i++) {
        wf.define(`w${i}`, ['s1', 's2']);
      }
      expect(wf.getCount()).toBe(50);
    });
  });
});