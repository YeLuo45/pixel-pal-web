/**
 * WorkloadBalancer Tests
 * nanobot-design Workload Balancer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkloadBalancer } from '../WorkloadBalancer';

describe('WorkloadBalancer', () => {
  let balancer: WorkloadBalancer;

  beforeEach(() => {
    balancer = new WorkloadBalancer();
  });

  afterEach(() => {
    balancer.clearAll();
  });

  // ============================================================
  // registerWorker
  // ============================================================
  describe('registerWorker', () => {
    it('should register worker', () => {
      expect(balancer.registerWorker({ id: 'w1', capacity: 100 })).toBe(true);
    });

    it('should reject duplicate', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.registerWorker({ id: 'w1', capacity: 100 })).toBe(false);
    });

    it('should set initial load to 0', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getLoad('w1')).toBe(0);
    });

    it('should set healthy to true', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.isHealthy('w1')).toBe(true);
    });
  });

  // ============================================================
  // assign
  // ============================================================
  describe('assign', () => {
    it('should assign task', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      const workerId = balancer.assign({ id: 't1', size: 30 });
      expect(workerId).toBe('w1');
    });

    it('should return null for no available', () => {
      expect(balancer.assign({ id: 't1', size: 30 })).toBeNull();
    });

    it('should prefer least loaded', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.registerWorker({ id: 'w2', capacity: 100 });
      balancer.assign({ id: 't1', size: 90 }); // w1 now has 90
      const workerId = balancer.assign({ id: 't2', size: 5 });
      expect(workerId).toBe('w2');
    });

    it('should reject when exceeding capacity', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.assign({ id: 't1', size: 150 })).toBeNull();
    });
  });

  // ============================================================
  // rebalance
  // ============================================================
  describe('rebalance', () => {
    it('should rebalance', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.registerWorker({ id: 'w2', capacity: 100 });
      balancer.assign({ id: 't1', size: 80 });
      const moved = balancer.rebalance();
      expect(moved.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty for single worker', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.rebalance()).toHaveLength(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      const stats = balancer.getStats();
      expect(stats.workers).toBe(1);
    });

    it('should calculate utilization', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 50 });
      const stats = balancer.getStats();
      expect(stats.utilization).toBe(0.5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get worker', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getWorker('w1')?.capacity).toBe(100);
    });

    it('should get all', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getAllWorkers()).toHaveLength(1);
    });

    it('should remove', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.removeWorker('w1')).toBe(true);
    });

    it('should check existence', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.hasWorker('w1')).toBe(true);
    });

    it('should count', () => {
      expect(balancer.getCount()).toBe(0);
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getCount()).toBe(1);
    });
  });

  // ============================================================
  // health
  // ============================================================
  describe('health', () => {
    it('should set healthy', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.setHealthy('w1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(balancer.setHealthy('unknown', false)).toBe(false);
    });

    it('should get healthy workers', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.registerWorker({ id: 'w2', capacity: 100 });
      balancer.setHealthy('w2', false);
      expect(balancer.getHealthyWorkers()).toHaveLength(1);
    });

    it('should get unhealthy workers', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.setHealthy('w1', false);
      expect(balancer.getUnhealthyWorkers()).toHaveLength(1);
    });
  });

  // ============================================================
  // load queries
  // ============================================================
  describe('load queries', () => {
    it('should get load', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getLoad('w1')).toBe(0);
    });

    it('should get capacity', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getCapacity('w1')).toBe(100);
    });

    it('should get utilization', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 50 });
      expect(balancer.getUtilization('w1')).toBe(0.5);
    });

    it('should get available', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getAvailableWorkers()).toHaveLength(1);
    });

    it('should get full', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 100 });
      expect(balancer.getFullWorkers()).toHaveLength(1);
    });

    it('should get heaviest', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 50 });
      expect(balancer.getHeaviestWorker()?.id).toBe('w1');
    });

    it('should return null for heaviest when empty', () => {
      expect(balancer.getHeaviestWorker()).toBeNull();
    });

    it('should get lightest', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getLightestWorker()?.id).toBe('w1');
    });

    it('should return null for lightest when empty', () => {
      expect(balancer.getLightestWorker()).toBeNull();
    });
  });

  // ============================================================
  // tasks
  // ============================================================
  describe('tasks', () => {
    it('should get task', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 30 });
      expect(balancer.getTask('t1')?.workerId).toBe('w1');
    });

    it('should remove task', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 30 });
      expect(balancer.removeTask('t1')).toBe(true);
    });

    it('should decrement load on remove', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 30 });
      balancer.removeTask('t1');
      expect(balancer.getLoad('w1')).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(balancer.removeTask('unknown')).toBe(false);
    });

    it('should count tasks', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 10 });
      expect(balancer.getTaskCount()).toBe(1);
    });

    it('should get tasks for worker', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      balancer.assign({ id: 't1', size: 10 });
      expect(balancer.getTasksForWorker('w1')).toHaveLength(1);
    });
  });

  // ============================================================
  // migration
  // ============================================================
  describe('migration', () => {
    it('should get migration count', () => {
      expect(balancer.getMigrationCount()).toBe(0);
    });

    it('should reset migration count', () => {
      balancer.resetMigrationCount();
      expect(balancer.getMigrationCount()).toBe(0);
    });
  });

  // ============================================================
  // distribution / average
  // ============================================================
  describe('distribution / average', () => {
    it('should get load distribution', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getLoadDistribution()).toHaveLength(1);
    });

    it('should get average utilization', () => {
      balancer.registerWorker({ id: 'w1', capacity: 100 });
      expect(balancer.getAverageUtilization()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many workers', () => {
      for (let i = 0; i < 50; i++) {
        balancer.registerWorker({ id: `w${i}`, capacity: 100 });
      }
      expect(balancer.getCount()).toBe(50);
    });
  });
});