/**
 * QueueManagerV2 Tests
 * thunderbolt-design Queue Manager v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueueManagerV2 } from '../QueueManagerV2';

describe('QueueManagerV2', () => {
  let qm: QueueManagerV2;

  beforeEach(() => {
    qm = new QueueManagerV2();
  });

  afterEach(() => {
    qm.clearAll();
  });

  // ============================================================
  // create / schedule / complete / fail / retry
  // ============================================================
  describe('create / schedule / complete / fail / retry', () => {
    it('should create', () => {
      expect(qm.create('q1', 'high')).toBe('qm2-1');
    });

    it('should mark as active', () => {
      const id = qm.create('q1', 'high');
      expect(qm.isActive(id)).toBe(true);
    });

    it('should mark as pending', () => {
      const id = qm.create('q1', 'high');
      expect(qm.isPending(id)).toBe(true);
    });

    it('should mark as medium by default', () => {
      const id = qm.create('q1');
      expect(qm.isMedium(id)).toBe(true);
    });

    it('should mark as low', () => {
      const id = qm.create('q1', 'low');
      expect(qm.isLow(id)).toBe(true);
    });

    it('should mark as critical', () => {
      const id = qm.create('q1', 'critical');
      expect(qm.isCritical(id)).toBe(true);
    });

    it('should schedule', () => {
      const id = qm.create('q1', 'high');
      expect(qm.schedule(id)).toBe(true);
    });

    it('should mark as processing on schedule', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      expect(qm.isProcessing(id)).toBe(true);
    });

    it('should not schedule not pending', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      expect(qm.schedule(id)).toBe(false);
    });

    it('should not schedule inactive', () => {
      const id = qm.create('q1', 'high');
      qm.setActive(id, false);
      expect(qm.schedule(id)).toBe(false);
    });

    it('should return false for unknown schedule', () => {
      expect(qm.schedule('unknown')).toBe(false);
    });

    it('should complete', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      expect(qm.complete(id)).toBe(true);
    });

    it('should mark as done on complete', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.complete(id);
      expect(qm.isDone(id)).toBe(true);
    });

    it('should not complete not processing', () => {
      const id = qm.create('q1', 'high');
      expect(qm.complete(id)).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(qm.complete('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      expect(qm.fail(id)).toBe(true);
    });

    it('should mark as failed on fail', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.fail(id);
      expect(qm.isFailed(id)).toBe(true);
    });

    it('should not fail not processing', () => {
      const id = qm.create('q1', 'high');
      expect(qm.fail(id)).toBe(false);
    });

    it('should return false for unknown fail', () => {
      expect(qm.fail('unknown')).toBe(false);
    });

    it('should retry', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.fail(id);
      expect(qm.retry(id)).toBe(true);
    });

    it('should mark as pending on retry', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.fail(id);
      qm.retry(id);
      expect(qm.isPending(id)).toBe(true);
    });

    it('should not retry not failed', () => {
      const id = qm.create('q1', 'high');
      expect(qm.retry(id)).toBe(false);
    });

    it('should return false for unknown retry', () => {
      expect(qm.retry('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      qm.create('q1', 'high');
      const stats = qm.getStats();
      expect(stats.queues).toBe(1);
    });

    it('should count pending', () => {
      qm.create('q1', 'high');
      expect(qm.getStats().pending).toBe(1);
    });

    it('should count processing', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      expect(qm.getStats().processing).toBe(1);
    });

    it('should count done', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.complete(id);
      expect(qm.getStats().done).toBe(1);
    });

    it('should count failed', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.fail(id);
      expect(qm.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      qm.create('q1', 'high');
      expect(qm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = qm.create('q1', 'high');
      qm.setActive(id, false);
      expect(qm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      expect(qm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      qm.create('q1', 'high');
      qm.create('q2', 'low');
      expect(qm.getStats().uniqueNames).toBe(2);
    });

    it('should count low priority', () => {
      qm.create('q1', 'low');
      expect(qm.getStats().low).toBe(1);
    });

    it('should count medium priority', () => {
      qm.create('q1', 'medium');
      expect(qm.getStats().medium).toBe(1);
    });

    it('should count high priority', () => {
      qm.create('q1', 'high');
      expect(qm.getStats().high).toBe(1);
    });

    it('should count critical priority', () => {
      qm.create('q1', 'critical');
      expect(qm.getStats().critical).toBe(1);
    });

    it('should compute completion rate', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.complete(id);
      expect(qm.getStats().completionRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get item', () => {
      qm.create('q1', 'high');
      expect(qm.getItem('qm2-1')?.name).toBe('q1');
    });

    it('should get all', () => {
      qm.create('q1', 'high');
      expect(qm.getAllItems()).toHaveLength(1);
    });

    it('should remove', () => {
      qm.create('q1', 'high');
      expect(qm.removeItem('qm2-1')).toBe(true);
    });

    it('should check existence', () => {
      qm.create('q1', 'high');
      expect(qm.hasItem('qm2-1')).toBe(true);
    });

    it('should count', () => {
      expect(qm.getCount()).toBe(0);
      qm.create('q1', 'high');
      expect(qm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      qm.create('q1', 'high');
      expect(qm.getName('qm2-1')).toBe('q1');
    });

    it('should get priority', () => {
      qm.create('q1', 'high');
      expect(qm.getPriority('qm2-1')).toBe('high');
    });

    it('should get history', () => {
      qm.create('q1', 'high');
      expect(qm.getHistory('qm2-1')).toEqual(['pending']);
    });

    it('should get hits', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      expect(qm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      qm.create('q1', 'high');
      expect(qm.setActive('qm2-1', false)).toBe(true);
    });

    it('should set name', () => {
      qm.create('q1', 'high');
      expect(qm.setName('qm2-1', 'q2')).toBe(true);
    });

    it('should set priority', () => {
      qm.create('q1', 'high');
      expect(qm.setPriority('qm2-1', 'low')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(qm.setActive('unknown', false)).toBe(false);
      expect(qm.setName('unknown', 'q')).toBe(false);
      expect(qm.setPriority('unknown', 'low')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.complete(id);
      qm.setActive(id, false);
      qm.resetAll();
      expect(qm.isPending(id)).toBe(true);
      expect(qm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / status / priority / state
  // ============================================================
  describe('by name / status / priority / state', () => {
    it('should get by name', () => {
      qm.create('q1', 'high');
      expect(qm.getByName('q1')).toHaveLength(1);
    });

    it('should get by status', () => {
      qm.create('q1', 'high');
      expect(qm.getByStatus('pending')).toHaveLength(1);
    });

    it('should get by priority', () => {
      qm.create('q1', 'high');
      expect(qm.getByPriority('high')).toHaveLength(1);
    });

    it('should get active', () => {
      qm.create('q1', 'high');
      expect(qm.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      qm.create('q1', 'high');
      qm.setActive('qm2-1', false);
      expect(qm.getInactiveItems()).toHaveLength(1);
    });

    it('should get all names', () => {
      qm.create('q1', 'high');
      qm.create('q2', 'low');
      expect(qm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      qm.create('q1', 'high');
      expect(qm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      qm.create('q1', 'high');
      expect(qm.getNewest()?.id).toBe('qm2-1');
    });

    it('should return null for empty newest', () => {
      expect(qm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      qm.create('q1', 'high');
      expect(qm.getOldest()?.id).toBe('qm2-1');
    });

    it('should return null for empty oldest', () => {
      expect(qm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      qm.create('q1', 'high');
      expect(qm.getCreatedAt('qm2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      expect(qm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total completed', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.complete(id);
      expect(qm.getTotalCompleted()).toBe(1);
    });

    it('should get total failed', () => {
      const id = qm.create('q1', 'high');
      qm.schedule(id);
      qm.fail(id);
      expect(qm.getTotalFailed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many queues', () => {
      for (let i = 0; i < 50; i++) {
        qm.create(`q${i}`, 'high');
      }
      expect(qm.getCount()).toBe(50);
    });
  });
});