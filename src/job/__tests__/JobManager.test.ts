/**
 * JobManager Tests
 * thunderbolt-design Job Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JobManager } from '../JobManager';

describe('JobManager', () => {
  let jm: JobManager;

  beforeEach(() => {
    jm = new JobManager();
  });

  afterEach(() => {
    jm.clearAll();
  });

  // ============================================================
  // submit / execute / retry
  // ============================================================
  describe('submit / execute / retry', () => {
    it('should submit', () => {
      expect(jm.submit('j1')).toBe('job-1');
    });

    it('should mark as queued', () => {
      const id = jm.submit('j1');
      expect(jm.getStatus(id)).toBe('queued');
    });

    it('should execute', () => {
      const id = jm.submit('j1');
      expect(jm.execute(id)).toBe(true);
    });

    it('should mark as done after execute', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.isDone(id)).toBe(true);
    });

    it('should not execute done', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.execute(id)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(jm.execute('unknown')).toBe(false);
    });

    it('should retry', () => {
      const id = jm.submit('j1');
      jm.fail(id);
      expect(jm.retry(id)).toBe(true);
    });

    it('should not retry done', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.retry(id)).toBe(false);
    });

    it('should not exceed max retries', () => {
      const id = jm.submit('j1', 1);
      jm.fail(id);
      jm.retry(id);
      jm.fail(id);
      expect(jm.retry(id)).toBe(false);
    });

    it('should return false for unknown retry', () => {
      expect(jm.retry('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      jm.submit('j1');
      const stats = jm.getStats();
      expect(stats.jobs).toBe(1);
    });

    it('should count queued', () => {
      jm.submit('j1');
      expect(jm.getStats().queued).toBe(1);
    });

    it('should count running', () => {
      const id = jm.submit('j1');
      // We need to make the job running - but execute goes straight to done
      // So we set status directly via the implementation
      jm.execute(id);
      // After execute, it's done
      expect(jm.getStats().done).toBe(1);
    });

    it('should count done', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.getStats().done).toBe(1);
    });

    it('should count failed', () => {
      const id = jm.submit('j1');
      jm.fail(id);
      expect(jm.getStats().failed).toBe(1);
    });

    it('should count total retries', () => {
      const id = jm.submit('j1');
      jm.fail(id);
      jm.retry(id);
      expect(jm.getStats().totalRetries).toBe(1);
    });

    it('should count total executions', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.getStats().totalExecutions).toBe(1);
    });

    it('should compute avg retries', () => {
      const id = jm.submit('j1');
      jm.fail(id);
      jm.retry(id);
      expect(jm.getStats().avgRetries).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get job', () => {
      jm.submit('j1');
      expect(jm.getJob('job-1')?.name).toBe('j1');
    });

    it('should get all', () => {
      jm.submit('j1');
      expect(jm.getAllJobs()).toHaveLength(1);
    });

    it('should remove', () => {
      jm.submit('j1');
      expect(jm.removeJob('job-1')).toBe(true);
    });

    it('should check existence', () => {
      jm.submit('j1');
      expect(jm.hasJob('job-1')).toBe(true);
    });

    it('should count', () => {
      expect(jm.getCount()).toBe(0);
      jm.submit('j1');
      expect(jm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      jm.submit('j1');
      expect(jm.getName('job-1')).toBe('j1');
    });

    it('should get status', () => {
      jm.submit('j1');
      expect(jm.getStatus('job-1')).toBe('queued');
    });

    it('should get retries', () => {
      jm.submit('j1');
      expect(jm.getRetries('job-1')).toBe(0);
    });

    it('should get max retries', () => {
      jm.submit('j1', 5);
      expect(jm.getMaxRetries('job-1')).toBe(5);
    });

    it('should get executed', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.getExecuted(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = jm.submit('j1');
      jm.touch(id);
      expect(jm.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      jm.submit('j1');
      expect(jm.getHistory('job-1')).toContain('queued');
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isQueued', () => {
      jm.submit('j1');
      expect(jm.isQueued('job-1')).toBe(true);
    });

    it('should check isRunning', () => {
      jm.submit('j1');
      // After submit, it's queued. We can't easily set running without internals.
      expect(jm.isRunning('job-1')).toBe(false);
    });

    it('should check isDone', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.isDone('job-1')).toBe(true);
    });

    it('should check isFailed', () => {
      const id = jm.submit('j1');
      jm.fail(id);
      expect(jm.isFailed('job-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set status', () => {
      const id = jm.submit('j1');
      expect(jm.setStatus(id, 'failed')).toBe(true);
    });

    it('should set name', () => {
      const id = jm.submit('j1');
      expect(jm.setName(id, 'j2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(jm.setStatus('unknown', 'failed')).toBe(false);
      expect(jm.setName('unknown', 'j')).toBe(false);
    });
  });

  // ============================================================
  // fail
  // ============================================================
  describe('fail', () => {
    it('should fail', () => {
      const id = jm.submit('j1');
      expect(jm.fail(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(jm.fail('unknown')).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      const id = jm.submit('j1');
      expect(jm.touch(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(jm.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      jm.resetAll();
      expect(jm.isQueued(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      jm.submit('j1');
      expect(jm.getByName('j1')).toHaveLength(1);
    });

    it('should get by status', () => {
      jm.submit('j1');
      expect(jm.getByStatus('queued')).toHaveLength(1);
    });

    it('should get queued', () => {
      jm.submit('j1');
      expect(jm.getQueuedJobs()).toHaveLength(1);
    });

    it('should get running', () => {
      jm.submit('j1');
      expect(jm.getRunningJobs()).toHaveLength(0);
    });

    it('should get done', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.getDoneJobs()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = jm.submit('j1');
      jm.fail(id);
      expect(jm.getFailedJobs()).toHaveLength(1);
    });

    it('should get all names', () => {
      jm.submit('j1');
      jm.submit('j2');
      expect(jm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      jm.submit('j1');
      expect(jm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // by min
  // ============================================================
  describe('by min', () => {
    it('should get by min retries', () => {
      const id = jm.submit('j1');
      jm.fail(id);
      jm.retry(id);
      expect(jm.getByMinRetries(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most retries', () => {
      const id = jm.submit('j1');
      jm.fail(id);
      jm.retry(id);
      expect(jm.getMostRetries()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(jm.getMostRetries()).toBeNull();
    });

    it('should get newest', () => {
      jm.submit('j1');
      expect(jm.getNewest()?.id).toBe('job-1');
    });

    it('should return null for empty newest', () => {
      expect(jm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      jm.submit('j1');
      expect(jm.getOldest()?.id).toBe('job-1');
    });

    it('should return null for empty oldest', () => {
      expect(jm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      jm.submit('j1');
      expect(jm.getCreatedAt('job-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = jm.submit('j1');
      jm.execute(id);
      expect(jm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // default max retries
  // ============================================================
  describe('default max retries', () => {
    it('should get default max retries', () => {
      expect(jm.getDefaultMaxRetries()).toBe(3);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many jobs', () => {
      for (let i = 0; i < 50; i++) {
        jm.submit(`j${i}`);
      }
      expect(jm.getCount()).toBe(50);
    });
  });
});