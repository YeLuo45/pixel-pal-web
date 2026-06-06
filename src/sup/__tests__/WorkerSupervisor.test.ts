/**
 * WorkerSupervisor Tests
 * nanobot-design Worker Supervisor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkerSupervisor } from '../WorkerSupervisor';

describe('WorkerSupervisor', () => {
  let ws: WorkerSupervisor;

  beforeEach(() => {
    ws = new WorkerSupervisor();
  });

  afterEach(() => {
    ws.clearAll();
  });

  // ============================================================
  // supervise / restart / alert
  // ============================================================
  describe('supervise / restart / alert', () => {
    it('should supervise', () => {
      expect(ws.supervise('w1')).toBe('sup-1');
    });

    it('should mark as running by default', () => {
      const id = ws.supervise('w1');
      expect(ws.getStatus(id)).toBe('running');
    });

    it('should restart', () => {
      const id = ws.supervise('w1');
      expect(ws.restart(id)).toBe(true);
    });

    it('should increment restarts on restart', () => {
      const id = ws.supervise('w1');
      ws.restart(id);
      expect(ws.getRestarts(id)).toBe(1);
    });

    it('should alert', () => {
      const id = ws.supervise('w1');
      expect(ws.alert(id)).toBe(true);
    });

    it('should increment alerts on alert', () => {
      const id = ws.supervise('w1');
      ws.alert(id);
      expect(ws.getAlerts(id)).toBe(1);
    });

    it('should return false for unknown', () => {
      expect(ws.restart('unknown')).toBe(false);
      expect(ws.alert('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ws.supervise('w1');
      const stats = ws.getStats();
      expect(stats.workers).toBe(1);
    });

    it('should count running', () => {
      ws.supervise('w1');
      expect(ws.getStats().running).toBe(1);
    });

    it('should count stopped', () => {
      const id = ws.supervise('w1');
      ws.stop(id);
      expect(ws.getStats().stopped).toBe(1);
    });

    it('should count failed', () => {
      const id = ws.supervise('w1');
      ws.fail(id);
      expect(ws.getStats().failed).toBe(1);
    });

    it('should count total restarts', () => {
      const id = ws.supervise('w1');
      ws.restart(id);
      expect(ws.getStats().totalRestarts).toBe(1);
    });

    it('should count total alerts', () => {
      const id = ws.supervise('w1');
      ws.alert(id);
      expect(ws.getStats().totalAlerts).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get worker', () => {
      ws.supervise('w1');
      expect(ws.getWorker('sup-1')?.workerId).toBe('w1');
    });

    it('should get all', () => {
      ws.supervise('w1');
      expect(ws.getAllWorkers()).toHaveLength(1);
    });

    it('should remove', () => {
      ws.supervise('w1');
      expect(ws.removeWorker('sup-1')).toBe(true);
    });

    it('should check existence', () => {
      ws.supervise('w1');
      expect(ws.hasWorker('sup-1')).toBe(true);
    });

    it('should count', () => {
      expect(ws.getCount()).toBe(0);
      ws.supervise('w1');
      expect(ws.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get worker id', () => {
      ws.supervise('w1');
      expect(ws.getWorkerId('sup-1')).toBe('w1');
    });

    it('should get status', () => {
      ws.supervise('w1');
      expect(ws.getStatus('sup-1')).toBe('running');
    });

    it('should get restarts', () => {
      ws.supervise('w1');
      expect(ws.getRestarts('sup-1')).toBe(0);
    });

    it('should get alerts', () => {
      ws.supervise('w1');
      expect(ws.getAlerts('sup-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = ws.supervise('w1');
      ws.check(id);
      expect(ws.getHits(id)).toBe(1);
    });

    it('should get last check', () => {
      const id = ws.supervise('w1');
      expect(ws.getLastCheck(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isRunning', () => {
      ws.supervise('w1');
      expect(ws.isRunning('sup-1')).toBe(true);
    });

    it('should check isStopped', () => {
      const id = ws.supervise('w1');
      ws.stop(id);
      expect(ws.isStopped('sup-1')).toBe(true);
    });

    it('should check isFailed', () => {
      const id = ws.supervise('w1');
      ws.fail(id);
      expect(ws.isFailed('sup-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set status', () => {
      const id = ws.supervise('w1');
      expect(ws.setStatus(id, 'failed')).toBe(true);
    });

    it('should set worker id', () => {
      const id = ws.supervise('w1');
      expect(ws.setWorkerId(id, 'w2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ws.setStatus('unknown', 'failed')).toBe(false);
      expect(ws.setWorkerId('unknown', 'w')).toBe(false);
    });
  });

  // ============================================================
  // check / fail / stop
  // ============================================================
  describe('check / fail / stop', () => {
    it('should check', () => {
      const id = ws.supervise('w1');
      expect(ws.check(id)).toBe(true);
    });

    it('should fail', () => {
      const id = ws.supervise('w1');
      expect(ws.fail(id)).toBe(true);
    });

    it('should stop', () => {
      const id = ws.supervise('w1');
      expect(ws.stop(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ws.check('unknown')).toBe(false);
      expect(ws.fail('unknown')).toBe(false);
      expect(ws.stop('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset restarts', () => {
      const id = ws.supervise('w1');
      ws.restart(id);
      ws.resetRestarts();
      expect(ws.getRestarts(id)).toBe(0);
    });

    it('should reset alerts', () => {
      const id = ws.supervise('w1');
      ws.alert(id);
      ws.resetAlerts();
      expect(ws.getAlerts(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = ws.supervise('w1');
      ws.restart(id);
      ws.alert(id);
      ws.fail(id);
      ws.resetAll();
      expect(ws.getRestarts(id)).toBe(0);
      expect(ws.isRunning(id)).toBe(true);
    });
  });

  // ============================================================
  // by worker / status
  // ============================================================
  describe('by worker / status', () => {
    it('should get by worker id', () => {
      ws.supervise('w1');
      expect(ws.getByWorkerId('w1')).toHaveLength(1);
    });

    it('should get by status', () => {
      ws.supervise('w1');
      expect(ws.getByStatus('running')).toHaveLength(1);
    });

    it('should get running', () => {
      ws.supervise('w1');
      expect(ws.getRunningWorkers()).toHaveLength(1);
    });

    it('should get stopped', () => {
      const id = ws.supervise('w1');
      ws.stop(id);
      expect(ws.getStoppedWorkers()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = ws.supervise('w1');
      ws.fail(id);
      expect(ws.getFailedWorkers()).toHaveLength(1);
    });

    it('should get all worker ids', () => {
      ws.supervise('w1');
      ws.supervise('w2');
      expect(ws.getAllWorkerIds()).toHaveLength(2);
    });

    it('should get worker id count', () => {
      ws.supervise('w1');
      expect(ws.getWorkerIdCount()).toBe(1);
    });
  });

  // ============================================================
  // by min
  // ============================================================
  describe('by min', () => {
    it('should get by min restarts', () => {
      const id = ws.supervise('w1');
      ws.restart(id);
      expect(ws.getByMinRestarts(1)).toHaveLength(1);
    });

    it('should get by min alerts', () => {
      const id = ws.supervise('w1');
      ws.alert(id);
      expect(ws.getByMinAlerts(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most restarts', () => {
      const id = ws.supervise('w1');
      ws.restart(id);
      expect(ws.getMostRestarts()?.id).toBe(id);
    });

    it('should return null for empty most restarts', () => {
      expect(ws.getMostRestarts()).toBeNull();
    });

    it('should get most alerts', () => {
      const id = ws.supervise('w1');
      ws.alert(id);
      expect(ws.getMostAlerts()?.id).toBe(id);
    });

    it('should return null for empty most alerts', () => {
      expect(ws.getMostAlerts()).toBeNull();
    });

    it('should get newest', () => {
      ws.supervise('w1');
      expect(ws.getNewest()?.id).toBe('sup-1');
    });

    it('should return null for empty newest', () => {
      expect(ws.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ws.supervise('w1');
      expect(ws.getOldest()?.id).toBe('sup-1');
    });

    it('should return null for empty oldest', () => {
      expect(ws.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ws.supervise('w1');
      expect(ws.getCreatedAt('sup-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ws.supervise('w1');
      ws.restart(id);
      expect(ws.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many workers', () => {
      for (let i = 0; i < 50; i++) {
        ws.supervise(`w${i}`);
      }
      expect(ws.getCount()).toBe(50);
    });
  });
});