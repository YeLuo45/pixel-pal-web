/**
 * GoalTracker Tests
 * generic-agent-design Goal Tracker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoalTracker } from '../GoalTracker';

describe('GoalTracker', () => {
  let tracker: GoalTracker;

  beforeEach(() => {
    tracker = new GoalTracker();
  });

  afterEach(() => {
    tracker.clearAll();
  });

  // ============================================================
  // defineGoal
  // ============================================================
  describe('defineGoal', () => {
    it('should define goal', () => {
      const id = tracker.defineGoal('test', ['m1', 'm2']);
      expect(id).toBe('goal-1');
    });

    it('should set initial status to active', () => {
      const id = tracker.defineGoal('test', ['m1']);
      expect(tracker.getGoal(id)?.status).toBe('active');
    });
  });

  // ============================================================
  // updateProgress
  // ============================================================
  describe('updateProgress', () => {
    it('should update progress', () => {
      const id = tracker.defineGoal('test', ['m1']);
      expect(tracker.updateProgress(id, 50)).toBe(true);
    });

    it('should clamp to 0-100', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.updateProgress(id, 150);
      expect(tracker.getProgress(id)?.progress).toBe(100);
    });

    it('should clamp to >= 0', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.updateProgress(id, -50);
      expect(tracker.getProgress(id)?.progress).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(tracker.updateProgress('unknown', 50)).toBe(false);
    });

    it('should auto-complete at 100', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.updateProgress(id, 100);
      expect(tracker.isCompleted(id)).toBe(true);
    });
  });

  // ============================================================
  // completeMilestone
  // ============================================================
  describe('completeMilestone', () => {
    it('should complete milestone', () => {
      const id = tracker.defineGoal('test', ['m1', 'm2']);
      const milestones = tracker.getMilestones(id);
      expect(tracker.completeMilestone(id, milestones[0].id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tracker.completeMilestone('unknown', 'm1')).toBe(false);
    });

    it('should return false for unknown milestone', () => {
      const id = tracker.defineGoal('test', ['m1']);
      expect(tracker.completeMilestone(id, 'unknown')).toBe(false);
    });

    it('should update progress', () => {
      const id = tracker.defineGoal('test', ['m1', 'm2']);
      const milestones = tracker.getMilestones(id);
      tracker.completeMilestone(id, milestones[0].id);
      expect(tracker.getProgressPercent(id)).toBe(50);
    });
  });

  // ============================================================
  // getProgress
  // ============================================================
  describe('getProgress', () => {
    it('should get progress', () => {
      const id = tracker.defineGoal('test', ['m1', 'm2']);
      expect(tracker.getProgress(id)?.totalMilestones).toBe(2);
    });

    it('should return null for unknown', () => {
      expect(tracker.getProgress('unknown')).toBeNull();
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get goal', () => {
      tracker.defineGoal('test', ['m1']);
      expect(tracker.getGoal('goal-1')?.name).toBe('test');
    });

    it('should get all', () => {
      tracker.defineGoal('a', ['m1']);
      expect(tracker.getAllGoals()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = tracker.defineGoal('test', ['m1']);
      expect(tracker.removeGoal(id)).toBe(true);
    });

    it('should check existence', () => {
      tracker.defineGoal('test', ['m1']);
      expect(tracker.hasGoal('goal-1')).toBe(true);
    });

    it('should count', () => {
      expect(tracker.getCount()).toBe(0);
      tracker.defineGoal('a', ['m1']);
      expect(tracker.getCount()).toBe(1);
    });
  });

  // ============================================================
  // status
  // ============================================================
  describe('status', () => {
    it('should set status', () => {
      const id = tracker.defineGoal('test', ['m1']);
      expect(tracker.setStatus(id, 'paused')).toBe(true);
    });

    it('should pause', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.pause(id);
      expect(tracker.isPaused(id)).toBe(true);
    });

    it('should resume', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.pause(id);
      tracker.resume(id);
      expect(tracker.isActive(id)).toBe(true);
    });

    it('should cancel', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.cancel(id);
      expect(tracker.isCancelled(id)).toBe(true);
    });

    it('should complete', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.complete(id);
      expect(tracker.isCompleted(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tracker.setStatus('unknown', 'paused')).toBe(false);
    });

    it('should get status', () => {
      tracker.defineGoal('test', ['m1']);
      expect(tracker.getStatus('goal-1')).toBe('active');
    });
  });

  // ============================================================
  // status checks
  // ============================================================
  describe('status checks', () => {
    it('should check isActive', () => {
      tracker.defineGoal('test', ['m1']);
      expect(tracker.isActive('goal-1')).toBe(true);
    });

    it('should check isPaused', () => {
      expect(tracker.isPaused('unknown')).toBe(false);
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get by status', () => {
      tracker.defineGoal('test', ['m1']);
      expect(tracker.getByStatus('active')).toHaveLength(1);
    });

    it('should get active', () => {
      tracker.defineGoal('test', ['m1']);
      expect(tracker.getActiveGoals()).toHaveLength(1);
    });

    it('should get paused', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.pause(id);
      expect(tracker.getPausedGoals()).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.complete(id);
      expect(tracker.getCompletedGoals()).toHaveLength(1);
    });

    it('should get cancelled', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.cancel(id);
      expect(tracker.getCancelledGoals()).toHaveLength(1);
    });
  });

  // ============================================================
  // milestones
  // ============================================================
  describe('milestones', () => {
    it('should get milestones', () => {
      const id = tracker.defineGoal('test', ['m1', 'm2']);
      expect(tracker.getMilestones(id)).toHaveLength(2);
    });

    it('should get milestone count', () => {
      const id = tracker.defineGoal('test', ['m1', 'm2']);
      expect(tracker.getMilestoneCount(id)).toBe(2);
    });

    it('should get reached milestones', () => {
      const id = tracker.defineGoal('test', ['m1', 'm2']);
      const ms = tracker.getMilestones(id);
      tracker.completeMilestone(id, ms[0].id);
      expect(tracker.getReachedMilestones(id)).toHaveLength(1);
    });

    it('should get unreached milestones', () => {
      const id = tracker.defineGoal('test', ['m1', 'm2']);
      expect(tracker.getUnreachedMilestones(id)).toHaveLength(2);
    });
  });

  // ============================================================
  // adjust / percent
  // ============================================================
  describe('adjust / percent', () => {
    it('should adjust progress', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.updateProgress(id, 50);
      expect(tracker.adjustProgress(id, 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tracker.adjustProgress('unknown', 10)).toBe(false);
    });

    it('should get progress percent', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.updateProgress(id, 75);
      expect(tracker.getProgressPercent(id)).toBe(75);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tracker.defineGoal('test', ['m1']);
      expect(tracker.getCreatedAt('goal-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      tracker.defineGoal('test', ['m1']);
      expect(tracker.getUpdatedAt('goal-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // completion rate
  // ============================================================
  describe('completion rate', () => {
    it('should return 0 for empty', () => {
      expect(tracker.getCompletionRate()).toBe(0);
    });

    it('should calculate', () => {
      const id = tracker.defineGoal('test', ['m1']);
      tracker.complete(id);
      expect(tracker.getCompletionRate()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many goals', () => {
      for (let i = 0; i < 50; i++) {
        tracker.defineGoal(`g${i}`, ['m1']);
      }
      expect(tracker.getCount()).toBe(50);
    });
  });
});