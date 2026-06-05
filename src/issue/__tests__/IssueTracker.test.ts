/**
 * IssueTracker Tests
 * claude-code-design Issue Tracker
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IssueTracker } from '../IssueTracker';

describe('IssueTracker', () => {
  let tracker: IssueTracker;

  beforeEach(() => {
    tracker = new IssueTracker();
  });

  afterEach(() => {
    tracker.clearAll();
  });

  // ============================================================
  // create
  // ============================================================
  describe('create', () => {
    it('should create issue', () => {
      const id = tracker.create({ title: 'test', description: 'desc', category: 'bug', priority: 'high' });
      expect(id).toBe('issue-1');
    });

    it('should set status to open', () => {
      const id = tracker.create({ title: 'test', description: 'desc', category: 'bug', priority: 'high' });
      expect(tracker.getIssue(id)?.status).toBe('open');
    });
  });

  // ============================================================
  // classify
  // ============================================================
  describe('classify', () => {
    it('should classify', () => {
      const id = tracker.create({ title: 'test', description: 'desc', category: 'bug', priority: 'high' });
      expect(tracker.classify(id, 'feature')).toBe(true);
      expect(tracker.getIssue(id)?.category).toBe('feature');
    });

    it('should return false for unknown', () => {
      expect(tracker.classify('unknown', 'bug')).toBe(false);
    });
  });

  // ============================================================
  // resolve
  // ============================================================
  describe('resolve', () => {
    it('should resolve', () => {
      const id = tracker.create({ title: 'test', description: 'desc', category: 'bug', priority: 'high' });
      expect(tracker.resolve(id)).toBe(true);
      expect(tracker.getIssue(id)?.status).toBe('resolved');
    });

    it('should return false for unknown', () => {
      expect(tracker.resolve('unknown')).toBe(false);
    });
  });

  // ============================================================
  // report
  // ============================================================
  describe('report', () => {
    it('should generate report', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.create({ title: 'b', description: '', category: 'feature', priority: 'low' });
      const report = tracker.report();
      expect(report.total).toBe(2);
      expect(report.open).toBe(2);
    });

    it('should track categories', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      const report = tracker.report();
      expect(report.byCategory.bug).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get issue', () => {
      tracker.create({ title: 'test', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getIssue('issue-1')?.title).toBe('test');
    });

    it('should get all', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getAllIssues()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.removeIssue(id)).toBe(true);
    });

    it('should check existence', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.hasIssue('issue-1')).toBe(true);
    });

    it('should count', () => {
      expect(tracker.getCount()).toBe(0);
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getCount()).toBe(1);
    });
  });

  // ============================================================
  // setStatus / setPriority
  // ============================================================
  describe('setStatus / setPriority', () => {
    it('should set status', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.setStatus(id, 'in_progress')).toBe(true);
    });

    it('should set priority', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.setPriority(id, 'low')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tracker.setStatus('unknown', 'open')).toBe(false);
      expect(tracker.setPriority('unknown', 'high')).toBe(false);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get by status', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.resolve(id);
      expect(tracker.getByStatus('resolved')).toHaveLength(1);
    });

    it('should get by category', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getByCategory('bug')).toHaveLength(1);
    });

    it('should get by priority', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getByPriority('high')).toHaveLength(1);
    });
  });

  // ============================================================
  // status filters
  // ============================================================
  describe('status filters', () => {
    it('should get open', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getOpen()).toHaveLength(1);
    });

    it('should get in progress', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.setStatus(id, 'in_progress');
      expect(tracker.getInProgress()).toHaveLength(1);
    });

    it('should get resolved', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.resolve(id);
      expect(tracker.getResolved()).toHaveLength(1);
    });

    it('should get closed', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.close(id);
      expect(tracker.getClosed()).toHaveLength(1);
    });
  });

  // ============================================================
  // state transitions
  // ============================================================
  describe('state transitions', () => {
    it('should close', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.close(id);
      expect(tracker.isClosed(id)).toBe(true);
    });

    it('should start', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.start(id);
      expect(tracker.isInProgress(id)).toBe(true);
    });

    it('should reopen', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.close(id);
      tracker.reopen(id);
      expect(tracker.isOpen(id)).toBe(true);
    });
  });

  // ============================================================
  // status checks
  // ============================================================
  describe('status checks', () => {
    it('should check isOpen', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.isOpen('issue-1')).toBe(true);
    });

    it('should check isResolved', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.resolve(id);
      expect(tracker.isResolved(id)).toBe(true);
    });

    it('should check isClosed', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.close(id);
      expect(tracker.isClosed(id)).toBe(true);
    });

    it('should check isInProgress', () => {
      const id = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.start(id);
      expect(tracker.isInProgress(id)).toBe(true);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getCreatedAt('issue-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getUpdatedAt('issue-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // resolution rate
  // ============================================================
  describe('resolution rate', () => {
    it('should return 0 for empty', () => {
      expect(tracker.getResolutionRate()).toBe(0);
    });

    it('should calculate', () => {
      const id1 = tracker.create({ title: 'a', description: '', category: 'bug', priority: 'high' });
      tracker.resolve(id1);
      const id2 = tracker.create({ title: 'b', description: '', category: 'bug', priority: 'high' });
      expect(tracker.getResolutionRate()).toBe(0.5);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many issues', () => {
      for (let i = 0; i < 50; i++) {
        tracker.create({ title: `i${i}`, description: '', category: 'bug', priority: 'high' });
      }
      expect(tracker.getCount()).toBe(50);
    });
  });
});