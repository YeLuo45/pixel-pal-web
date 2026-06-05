/**
 * TaskDistributor Tests
 * chatdev-design Task Distributor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskDistributor } from '../TaskDistributor';

describe('TaskDistributor', () => {
  let td: TaskDistributor;

  beforeEach(() => {
    td = new TaskDistributor();
  });

  afterEach(() => {
    td.clearAll();
  });

  // ============================================================
  // enqueue / assign / complete / fail / reclaim
  // ============================================================
  describe('enqueue / assign / complete / fail / reclaim', () => {
    it('should enqueue', () => {
      const id = td.enqueue('t1');
      expect(id).toBe('dist-1');
    });

    it('should assign', () => {
      const id = td.enqueue('t1');
      expect(td.assign(id, 'alice')).toBe(true);
    });

    it('should complete', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.complete(id)).toBe(true);
    });

    it('should fail', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.fail(id, 'oops')).toBe(true);
    });

    it('should reclaim', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.reclaim(id)).toBe(true);
    });

    it('should not assign non-queued', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.assign(id, 'bob')).toBe(false);
    });

    it('should not complete non-assigned', () => {
      const id = td.enqueue('t1');
      expect(td.complete(id)).toBe(false);
    });

    it('should not reclaim non-assigned', () => {
      const id = td.enqueue('t1');
      expect(td.reclaim(id)).toBe(false);
    });

    it('should return false for unknown assign', () => {
      expect(td.assign('unknown', 'alice')).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(td.complete('unknown')).toBe(false);
    });

    it('should return false for unknown fail', () => {
      expect(td.fail('unknown', 'r')).toBe(false);
    });

    it('should return false for unknown reclaim', () => {
      expect(td.reclaim('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      td.enqueue('t1');
      const stats = td.getStats();
      expect(stats.tasks).toBe(1);
    });

    it('should count assignees', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.getStats().assignees).toBe(1);
    });

    it('should count queued', () => {
      td.enqueue('t1');
      expect(td.getStats().queued).toBe(1);
    });

    it('should count done', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.complete(id);
      expect(td.getStats().done).toBe(1);
    });

    it('should count failed', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.fail(id, 'r');
      expect(td.getStats().failed).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get task', () => {
      td.enqueue('t1');
      expect(td.getTask('dist-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      td.enqueue('t1');
      expect(td.getAllTasks()).toHaveLength(1);
    });

    it('should remove', () => {
      td.enqueue('t1');
      expect(td.removeTask('dist-1')).toBe(true);
    });

    it('should check existence', () => {
      td.enqueue('t1');
      expect(td.hasTask('dist-1')).toBe(true);
    });

    it('should count', () => {
      expect(td.getCount()).toBe(0);
      td.enqueue('t1');
      expect(td.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      td.enqueue('t1');
      expect(td.getName('dist-1')).toBe('t1');
    });

    it('should get assignee', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.getAssignee('dist-1')).toBe('alice');
    });

    it('should get state', () => {
      td.enqueue('t1');
      expect(td.getState('dist-1')).toBe('queued');
    });

    it('should get reason', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.fail(id, 'oops');
      expect(td.getReason('dist-1')).toBe('oops');
    });

    it('should get duration', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.complete(id);
      expect(td.getDuration('dist-1')).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isQueued', () => {
      td.enqueue('t1');
      expect(td.isQueued('dist-1')).toBe(true);
    });

    it('should check isAssigned', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.isAssigned('dist-1')).toBe(true);
    });

    it('should check isDone', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.complete(id);
      expect(td.isDone('dist-1')).toBe(true);
    });

    it('should check isFailed', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.fail(id, 'r');
      expect(td.isFailed('dist-1')).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get by state', () => {
      td.enqueue('t1');
      expect(td.getByState('queued')).toHaveLength(1);
    });

    it('should get queued', () => {
      td.enqueue('t1');
      expect(td.getQueued()).toHaveLength(1);
    });

    it('should get assigned', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.getAssigned()).toHaveLength(1);
    });

    it('should get done', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.complete(id);
      expect(td.getDone()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.fail(id, 'r');
      expect(td.getFailed()).toHaveLength(1);
    });
  });

  // ============================================================
  // by assignee
  // ============================================================
  describe('by assignee', () => {
    it('should get by assignee', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.getByAssignee('alice')).toHaveLength(1);
    });

    it('should count by assignee', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.getAssigneeCount('alice')).toBe(1);
    });

    it('should get all assignees', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.getAllAssignees()).toEqual(['alice']);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      td.enqueue('t1');
      expect(td.getCreatedAt('dist-1')).toBeGreaterThan(0);
    });

    it('should get assigned at', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.getAssignedAt('dist-1')).toBeGreaterThan(0);
    });

    it('should get completed at', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.complete(id);
      expect(td.getCompletedAt('dist-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most active assignee', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      expect(td.getMostActiveAssignee()).toBe('alice');
    });

    it('should return null for empty', () => {
      expect(td.getMostActiveAssignee()).toBeNull();
    });
  });

  // ============================================================
  // avg
  // ============================================================
  describe('avg', () => {
    it('should get avg duration', () => {
      const id = td.enqueue('t1');
      td.assign(id, 'alice');
      td.complete(id);
      expect(td.getAvgDuration()).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for empty', () => {
      expect(td.getAvgDuration()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        td.enqueue(`t${i}`);
      }
      expect(td.getCount()).toBe(50);
    });
  });
});