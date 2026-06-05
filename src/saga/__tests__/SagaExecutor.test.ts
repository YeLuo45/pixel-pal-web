/**
 * SagaExecutor Tests
 * thunderbolt-design Saga Executor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SagaExecutor } from '../SagaExecutor';

describe('SagaExecutor', () => {
  let executor: SagaExecutor;

  beforeEach(() => {
    executor = new SagaExecutor();
  });

  afterEach(() => {
    executor.clearAll();
  });

  // ============================================================
  // define
  // ============================================================
  describe('define', () => {
    it('should define saga', () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      expect(id).toBe('saga-1');
    });
  });

  // ============================================================
  // execute
  // ============================================================
  describe('execute', () => {
    it('should execute all steps', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
        { name: 's2', execute: async () => true, compensate: async () => {} },
      ]);
      expect(await executor.execute(id)).toBe(true);
      expect(executor.getStatus(id)).toBe('completed');
    });

    it('should return false for unknown', async () => {
      expect(await executor.execute('unknown')).toBe(false);
    });

    it('should compensate on failure', async () => {
      let compensated = false;
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => { compensated = true; } },
        { name: 's2', execute: async () => false, compensate: async () => {} },
      ]);
      expect(await executor.execute(id)).toBe(false);
      expect(compensated).toBe(true);
    });

    it('should handle throws', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => { throw new Error('fail'); }, compensate: async () => {} },
      ]);
      expect(await executor.execute(id)).toBe(false);
    });
  });

  // ============================================================
  // compensate
  // ============================================================
  describe('compensate', () => {
    it('should compensate', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      expect(await executor.compensate(id)).toBe(true);
    });

    it('should return false for unknown', async () => {
      expect(await executor.compensate('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStatus
  // ============================================================
  describe('getStatus', () => {
    it('should return status', () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      expect(executor.getStatus(id)).toBe('pending');
    });

    it('should return null for unknown', () => {
      expect(executor.getStatus('unknown')).toBeNull();
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get saga', () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      expect(executor.getSaga(id)?.name).toBe('test');
    });

    it('should get all', () => {
      executor.define('a', []);
      executor.define('b', []);
      expect(executor.getAllSagas()).toHaveLength(2);
    });

    it('should remove', () => {
      const id = executor.define('test', []);
      expect(executor.removeSaga(id)).toBe(true);
    });

    it('should check existence', () => {
      const id = executor.define('test', []);
      expect(executor.hasSaga(id)).toBe(true);
    });

    it('should count', () => {
      executor.define('a', []);
      expect(executor.getCount()).toBe(1);
    });
  });

  // ============================================================
  // step queries
  // ============================================================
  describe('step queries', () => {
    it('should get current step', () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      expect(executor.getCurrentStep(id)).toBe(0);
    });

    it('should get executed steps', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      await executor.execute(id);
      expect(executor.getExecutedSteps(id)).toEqual(['s1']);
    });

    it('should get step count', () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
        { name: 's2', execute: async () => true, compensate: async () => {} },
      ]);
      expect(executor.getStepCount(id)).toBe(2);
    });

    it('should get step names', () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      expect(executor.getStepNames(id)).toEqual(['s1']);
    });
  });

  // ============================================================
  // status filters
  // ============================================================
  describe('status filters', () => {
    it('should get completed', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      await executor.execute(id);
      expect(executor.getCompletedSagas()).toHaveLength(1);
    });

    it('should get failed/compensated', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => false, compensate: async () => {} },
      ]);
      await executor.execute(id);
      // When a step fails, status becomes 'compensated' (auto-compensated)
      expect(executor.getCompensatedSagas()).toHaveLength(1);
    });

    it('should get compensated', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
        { name: 's2', execute: async () => false, compensate: async () => {} },
      ]);
      await executor.execute(id);
      expect(executor.getCompensatedSagas()).toHaveLength(1);
    });

    it('should get running', () => {
      executor.define('test', []);
      expect(executor.getRunningSagas()).toHaveLength(0);
    });

    it('should get pending', () => {
      executor.define('test', []);
      expect(executor.getPendingSagas()).toHaveLength(1);
    });

    it('should get by status', () => {
      executor.define('test', []);
      expect(executor.getByStatus('pending')).toHaveLength(1);
    });
  });

  // ============================================================
  // success rate
  // ============================================================
  describe('success rate', () => {
    it('should return 0 for empty', () => {
      expect(executor.getSuccessRate()).toBe(0);
    });

    it('should calculate rate', async () => {
      const id1 = executor.define('a', [
        { name: 's', execute: async () => true, compensate: async () => {} },
      ]);
      const id2 = executor.define('b', [
        { name: 's', execute: async () => true, compensate: async () => {} },
      ]);
      await executor.execute(id1);
      await executor.execute(id2);
      expect(executor.getSuccessRate()).toBe(1);
    });
  });

  // ============================================================
  // status checks
  // ============================================================
  describe('status checks', () => {
    it('should check isCompleted', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
      ]);
      await executor.execute(id);
      expect(executor.isCompleted(id)).toBe(true);
    });

    it('should check isFailed', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => false, compensate: async () => {} },
      ]);
      await executor.execute(id);
      expect(executor.isFailed(id)).toBe(false); // After execute fails, status becomes 'compensated'
    });

    it('should check isCompensated', async () => {
      const id = executor.define('test', [
        { name: 's1', execute: async () => true, compensate: async () => {} },
        { name: 's2', execute: async () => false, compensate: async () => {} },
      ]);
      await executor.execute(id);
      expect(executor.isCompensated(id)).toBe(true);
    });

    it('should check isRunning', () => {
      executor.define('test', []);
      expect(executor.isRunning('saga-1')).toBe(false);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      const id = executor.define('test', []);
      expect(executor.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = executor.define('test', []);
      expect(executor.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many sagas', () => {
      for (let i = 0; i < 50; i++) {
        executor.define(`s${i}`, []);
      }
      expect(executor.getCount()).toBe(50);
    });
  });
});