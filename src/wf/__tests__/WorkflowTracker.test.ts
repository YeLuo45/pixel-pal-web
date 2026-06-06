/**
 * WorkflowTracker Tests
 * chatdev-design Workflow Tracker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkflowTracker } from '../WorkflowTracker';

describe('WorkflowTracker', () => {
  let wt: WorkflowTracker;

  beforeEach(() => {
    wt = new WorkflowTracker();
  });

  afterEach(() => {
    wt.clearAll();
  });

  // ============================================================
  // define / advance / getProgress
  // ============================================================
  describe('define / advance / getProgress', () => {
    it('should define', () => {
      expect(wt.define('w1', 5)).toBe('wf-1');
    });

    it('should advance', () => {
      const id = wt.define('w1', 5);
      expect(wt.advance(id)).toBe(true);
    });

    it('should increment current step on advance', () => {
      const id = wt.define('w1', 5);
      wt.advance(id);
      expect(wt.getCurrentStep(id)).toBe(1);
    });

    it('should mark completed when reaching total', () => {
      const id = wt.define('w1', 2);
      wt.advance(id);
      wt.advance(id);
      expect(wt.isCompleted(id)).toBe(true);
    });

    it('should not advance completed', () => {
      const id = wt.define('w1', 1);
      wt.advance(id);
      expect(wt.advance(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(wt.advance('unknown')).toBe(false);
    });

    it('should get progress', () => {
      const id = wt.define('w1', 4);
      wt.advance(id);
      wt.advance(id);
      expect(wt.getProgress(id)).toBe(0.5);
    });

    it('should return 0 progress for unknown', () => {
      expect(wt.getProgress('unknown')).toBe(0);
    });

    it('should return 1 progress for empty steps', () => {
      const id = wt.define('w1', 0);
      expect(wt.getProgress(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      wt.define('w1', 5);
      const stats = wt.getStats();
      expect(stats.workflows).toBe(1);
    });

    it('should count completed', () => {
      const id = wt.define('w1', 1);
      wt.advance(id);
      expect(wt.getStats().completed).toBe(1);
    });

    it('should count in progress', () => {
      wt.define('w1', 5);
      expect(wt.getStats().inProgress).toBe(1);
    });

    it('should compute avg progress', () => {
      wt.define('w1', 4);
      wt.define('w2', 4);
      expect(wt.getStats().avgProgress).toBe(0);
    });

    it('should count total advances', () => {
      const id = wt.define('w1', 5);
      wt.advance(id);
      expect(wt.getStats().totalAdvances).toBe(1);
    });

    it('should count total steps', () => {
      wt.define('w1', 5);
      wt.define('w2', 3);
      expect(wt.getStats().totalSteps).toBe(8);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get workflow', () => {
      wt.define('w1', 5);
      expect(wt.getWorkflow('wf-1')?.name).toBe('w1');
    });

    it('should get all', () => {
      wt.define('w1', 5);
      expect(wt.getAllWorkflows()).toHaveLength(1);
    });

    it('should remove', () => {
      wt.define('w1', 5);
      expect(wt.removeWorkflow('wf-1')).toBe(true);
    });

    it('should check existence', () => {
      wt.define('w1', 5);
      expect(wt.hasWorkflow('wf-1')).toBe(true);
    });

    it('should count', () => {
      expect(wt.getCount()).toBe(0);
      wt.define('w1', 5);
      expect(wt.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      wt.define('w1', 5);
      expect(wt.getName('wf-1')).toBe('w1');
    });

    it('should get total steps', () => {
      wt.define('w1', 5);
      expect(wt.getTotalSteps('wf-1')).toBe(5);
    });

    it('should get current step', () => {
      wt.define('w1', 5);
      expect(wt.getCurrentStep('wf-1')).toBe(0);
    });

    it('should get advances', () => {
      const id = wt.define('w1', 5);
      wt.advance(id);
      expect(wt.getAdvances(id)).toBe(1);
    });

    it('should get history', () => {
      const id = wt.define('w1', 5);
      wt.advance(id);
      expect(wt.getHistory(id)).toEqual([1]);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isCompleted', () => {
      wt.define('w1', 5);
      expect(wt.isCompleted('wf-1')).toBe(false);
    });

    it('should check isInProgress', () => {
      wt.define('w1', 5);
      expect(wt.isInProgress('wf-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set name', () => {
      const id = wt.define('w1', 5);
      expect(wt.setName(id, 'w2')).toBe(true);
    });

    it('should set total steps', () => {
      const id = wt.define('w1', 5);
      expect(wt.setTotalSteps(id, 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wt.setName('unknown', 'w')).toBe(false);
      expect(wt.setTotalSteps('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset', () => {
      const id = wt.define('w1', 5);
      wt.advance(id);
      expect(wt.reset(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wt.reset('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = wt.define('w1', 5);
      wt.advance(id);
      wt.resetAll();
      expect(wt.getCurrentStep(id)).toBe(0);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      wt.define('w1', 5);
      expect(wt.getByName('w1')).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = wt.define('w1', 1);
      wt.advance(id);
      expect(wt.getCompletedWorkflows()).toHaveLength(1);
    });

    it('should get in progress', () => {
      wt.define('w1', 5);
      expect(wt.getInProgressWorkflows()).toHaveLength(1);
    });

    it('should get all names', () => {
      wt.define('w1', 5);
      wt.define('w2', 5);
      expect(wt.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      wt.define('w1', 5);
      expect(wt.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // by min
  // ============================================================
  describe('by min', () => {
    it('should get by min steps', () => {
      wt.define('w1', 5);
      wt.define('w2', 10);
      expect(wt.getByMinSteps(7)).toHaveLength(1);
    });

    it('should get by min progress', () => {
      const id = wt.define('w1', 4);
      wt.advance(id);
      wt.advance(id);
      expect(wt.getByMinProgress(0.3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most advanced', () => {
      const id = wt.define('w1', 5);
      wt.advance(id);
      wt.advance(id);
      expect(wt.getMostAdvanced()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(wt.getMostAdvanced()).toBeNull();
    });

    it('should get newest', () => {
      wt.define('w1', 5);
      expect(wt.getNewest()?.id).toBe('wf-1');
    });

    it('should return null for empty newest', () => {
      expect(wt.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      wt.define('w1', 5);
      expect(wt.getOldest()?.id).toBe('wf-1');
    });

    it('should return null for empty oldest', () => {
      expect(wt.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      wt.define('w1', 5);
      expect(wt.getCreatedAt('wf-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = wt.define('w1', 5);
      wt.advance(id);
      expect(wt.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many workflows', () => {
      for (let i = 0; i < 50; i++) {
        wt.define(`w${i}`, 5);
      }
      expect(wt.getCount()).toBe(50);
    });
  });
});