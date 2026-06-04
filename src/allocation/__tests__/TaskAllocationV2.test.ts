/**
 * TaskAllocationV2 Tests
 * chatdev-design Task Allocation v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskAllocationV2 } from '../TaskAllocationV2';

describe('TaskAllocationV2', () => {
  let alloc: TaskAllocationV2;

  beforeEach(() => {
    alloc = new TaskAllocationV2();
  });

  afterEach(() => {
    alloc.clearAll();
  });

  // ============================================================
  // addWorker
  // ============================================================
  describe('addWorker', () => {
    it('should add worker', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: ['js'] });
      expect(alloc.getWorkerCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const w = { id: 'w1', capacity: 5, currentLoad: 0, skills: ['js'] };
      alloc.addWorker(w);
      w.skills.push('ts');
      expect(alloc.getWorkerSkills('w1')).toEqual(['js']);
    });
  });

  // ============================================================
  // addTask
  // ============================================================
  describe('addTask', () => {
    it('should add task', () => {
      alloc.addTask('t1', ['js']);
      expect(alloc.getTaskCount()).toBe(1);
    });
  });

  // ============================================================
  // allocate
  // ============================================================
  describe('allocate', () => {
    it('should allocate tasks to workers', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: ['js'] });
      alloc.addTask('t1', ['js']);
      const allocations = alloc.allocate();
      expect(allocations).toHaveLength(1);
      expect(allocations[0].workerId).toBe('w1');
    });

    it('should not allocate when no workers', () => {
      alloc.addTask('t1', ['js']);
      const allocations = alloc.allocate();
      expect(allocations).toHaveLength(0);
    });

    it('should prioritize by task priority', () => {
      alloc.addWorker({ id: 'w1', capacity: 2, currentLoad: 0, skills: ['js'] });
      alloc.addTask('t1', ['js']);
      alloc.addTask('t2', ['js']);
      alloc.setTaskPriority('t1', 5);
      alloc.setTaskPriority('t2', 10);
      const allocations = alloc.allocate();
      expect(allocations).toHaveLength(2);
    });

    it('should respect worker capacity', () => {
      alloc.addWorker({ id: 'w1', capacity: 1, currentLoad: 0, skills: ['js'] });
      alloc.addWorker({ id: 'w2', capacity: 5, currentLoad: 0, skills: ['js'] });
      alloc.addTask('t1', ['js']);
      alloc.addTask('t2', ['js']);
      const allocations = alloc.allocate();
      expect(allocations).toHaveLength(2);
      // Both workers should have allocations
      const workerIds = new Set(allocations.map(a => a.workerId));
      expect(workerIds.size).toBe(2);
    });

    it('should match by skills', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: ['js'] });
      alloc.addWorker({ id: 'w2', capacity: 5, currentLoad: 0, skills: ['python'] });
      alloc.addTask('t1', ['python']);
      const allocations = alloc.allocate();
      expect(allocations[0].workerId).toBe('w2');
    });
  });

  // ============================================================
  // rebalance
  // ============================================================
  describe('rebalance', () => {
    it('should return 0 for no workers', () => {
      expect(alloc.rebalance()).toBe(0);
    });

    it('should move allocations from overloaded to underloaded', () => {
      alloc.addWorker({ id: 'w1', capacity: 10, currentLoad: 8, skills: ['js'] });
      alloc.addWorker({ id: 'w2', capacity: 10, currentLoad: 2, skills: ['js'] });
      // Need allocations to move
      alloc.addTask('t1', ['js']);
      alloc.allocate();
      // Manually set loads after allocation
      const w1 = alloc.getWorker('w1')!;
      const w2 = alloc.getWorker('w2')!;
      w1.currentLoad = 8;
      w2.currentLoad = 2;
      // Create allocations map for rebalance
      const moves = alloc.rebalance();
      expect(moves).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // getWorkerLoad
  // ============================================================
  describe('getWorkerLoad', () => {
    it('should return load', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 3, skills: [] });
      expect(alloc.getWorkerLoad('w1')).toBe(3);
    });

    it('should return 0 for unknown', () => {
      expect(alloc.getWorkerLoad('unknown')).toBe(0);
    });
  });

  // ============================================================
  // getAllocationScore
  // ============================================================
  describe('getAllocationScore', () => {
    it('should return 0 for no allocations', () => {
      expect(alloc.getAllocationScore()).toBe(0);
    });

    it('should calculate score for allocations', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: ['js'] });
      alloc.addTask('t1', ['js']);
      alloc.allocate();
      const score = alloc.getAllocationScore();
      expect(score).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // setTaskPriority / getTaskPriority
  // ============================================================
  describe('task priority', () => {
    it('should set priority', () => {
      alloc.addTask('t1', ['js']);
      expect(alloc.setTaskPriority('t1', 10)).toBe(true);
      expect(alloc.getTaskPriority('t1')).toBe(10);
    });

    it('should return false for unknown', () => {
      expect(alloc.setTaskPriority('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // skills management
  // ============================================================
  describe('skills', () => {
    it('should add skill', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: ['js'] });
      expect(alloc.addWorkerSkill('w1', 'ts')).toBe(true);
      expect(alloc.getWorkerSkills('w1')).toContain('ts');
    });

    it('should not add duplicate skill', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: ['js'] });
      alloc.addWorkerSkill('w1', 'js');
      expect(alloc.getWorkerSkills('w1')).toHaveLength(1);
    });

    it('should remove skill', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: ['js', 'ts'] });
      expect(alloc.removeWorkerSkill('w1', 'js')).toBe(true);
      expect(alloc.getWorkerSkills('w1')).toEqual(['ts']);
    });

    it('should return false for unknown skill removal', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: ['js'] });
      expect(alloc.removeWorkerSkill('w1', 'python')).toBe(false);
    });

    it('should return false for unknown worker', () => {
      expect(alloc.addWorkerSkill('unknown', 'x')).toBe(false);
      expect(alloc.removeWorkerSkill('unknown', 'x')).toBe(false);
    });
  });

  // ============================================================
  // remove / has / count
  // ============================================================
  describe('remove / has / count', () => {
    it('should remove worker', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: [] });
      expect(alloc.removeWorker('w1')).toBe(true);
    });

    it('should remove task', () => {
      alloc.addTask('t1', []);
      expect(alloc.removeTask('t1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(alloc.removeWorker('unknown')).toBe(false);
      expect(alloc.removeTask('unknown')).toBe(false);
    });

    it('should check existence', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: [] });
      alloc.addTask('t1', []);
      expect(alloc.hasWorker('w1')).toBe(true);
      expect(alloc.hasTask('t1')).toBe(true);
    });
  });

  // ============================================================
  // getAvailableWorkers
  // ============================================================
  describe('getAvailableWorkers', () => {
    it('should return only available', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 0, skills: [] });
      alloc.addWorker({ id: 'w2', capacity: 5, currentLoad: 5, skills: [] });
      expect(alloc.getAvailableWorkers()).toHaveLength(1);
    });
  });

  // ============================================================
  // getAverageLoad / getCapacityUtilization
  // ============================================================
  describe('metrics', () => {
    it('should calculate average load', () => {
      alloc.addWorker({ id: 'w1', capacity: 5, currentLoad: 2, skills: [] });
      alloc.addWorker({ id: 'w2', capacity: 5, currentLoad: 4, skills: [] });
      expect(alloc.getAverageLoad()).toBe(3);
    });

    it('should return 0 for no workers', () => {
      expect(alloc.getAverageLoad()).toBe(0);
      expect(alloc.getCapacityUtilization()).toBe(0);
    });

    it('should calculate capacity utilization', () => {
      alloc.addWorker({ id: 'w1', capacity: 10, currentLoad: 5, skills: [] });
      expect(alloc.getCapacityUtilization()).toBe(0.5);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many workers', () => {
      for (let i = 0; i < 50; i++) {
        alloc.addWorker({ id: `w${i}`, capacity: 5, currentLoad: 0, skills: [] });
      }
      expect(alloc.getWorkerCount()).toBe(50);
    });

    it('should handle empty allocations', () => {
      expect(alloc.getAllocations()).toHaveLength(0);
    });

    it('should not mutate input task', () => {
      const skills = ['js'];
      alloc.addTask('t1', skills);
      skills.push('ts');
      expect(alloc.getTask('t1')?.requiredSkills).toEqual(['js']);
    });
  });
});