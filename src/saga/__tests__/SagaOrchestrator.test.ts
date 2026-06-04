/**
 * SagaOrchestrator Tests
 * thunderbolt-design Saga Orchestrator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SagaOrchestrator } from '../SagaOrchestrator';

describe('SagaOrchestrator', () => {
  let orchestrator: SagaOrchestrator;

  beforeEach(() => {
    orchestrator = new SagaOrchestrator();
  });

  afterEach(() => {
    orchestrator.clearAll();
  });

  // ============================================================
  // defineSaga
  // ============================================================
  describe('defineSaga', () => {
    it('should define saga', () => {
      const id = orchestrator.defineSaga('test', []);
      expect(id).toBe('saga-1');
    });
  });

  // ============================================================
  // execute
  // ============================================================
  describe('execute', () => {
    it('should execute saga successfully', async () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
        { name: 's2', action: async () => true, compensation: async () => {} },
      ]);
      const result = await orchestrator.execute(id);
      expect(result).toBe(true);
      expect(orchestrator.isCompleted(id)).toBe(true);
    });

    it('should return false for unknown saga', async () => {
      const result = await orchestrator.execute('unknown');
      expect(result).toBe(false);
    });

    it('should fail and compensate on action returning false', async () => {
      let compensated = false;
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => { compensated = true; } },
        { name: 's2', action: async () => false, compensation: async () => {} },
      ]);
      const result = await orchestrator.execute(id);
      expect(result).toBe(false);
      expect(compensated).toBe(true);
    });

    it('should fail and compensate on action throwing', async () => {
      let compensated = false;
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => { throw new Error('fail'); }, compensation: async () => { compensated = true; } },
      ]);
      const result = await orchestrator.execute(id);
      expect(result).toBe(false);
      expect(compensated).toBe(true);
    });
  });

  // ============================================================
  // compensate
  // ============================================================
  describe('compensate', () => {
    it('should compensate executed steps', async () => {
      const order: string[] = [];
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => { order.push('c1'); } },
        { name: 's2', action: async () => false, compensation: async () => { order.push('c2'); } },
      ]);
      await orchestrator.execute(id);
      // Both s1 and s2 are in executedSteps, compensations run in reverse: c2, c1
      expect(order).toEqual(['c2', 'c1']);
    });

    it('should handle unknown saga', async () => {
      await orchestrator.compensate('unknown');
    });
  });

  // ============================================================
  // getStatus / getSaga
  // ============================================================
  describe('getStatus / getSaga', () => {
    it('should get status', () => {
      const id = orchestrator.defineSaga('test', []);
      expect(orchestrator.getStatus(id)).toBe('pending');
    });

    it('should return null for unknown', () => {
      expect(orchestrator.getStatus('unknown')).toBeNull();
    });

    it('should get saga', () => {
      const id = orchestrator.defineSaga('test', []);
      expect(orchestrator.getSaga(id)?.name).toBe('test');
    });
  });

  // ============================================================
  // getAllSagas / removeSaga
  // ============================================================
  describe('saga queries', () => {
    it('should get all', () => {
      orchestrator.defineSaga('s1', []);
      orchestrator.defineSaga('s2', []);
      expect(orchestrator.getAllSagas()).toHaveLength(2);
    });

    it('should remove saga', () => {
      const id = orchestrator.defineSaga('test', []);
      expect(orchestrator.removeSaga(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(orchestrator.removeSaga('unknown')).toBe(false);
    });
  });

  // ============================================================
  // has / count
  // ============================================================
  describe('has / count', () => {
    it('should check existence', () => {
      const id = orchestrator.defineSaga('test', []);
      expect(orchestrator.hasSaga(id)).toBe(true);
    });

    it('should count', () => {
      expect(orchestrator.getSagaCount()).toBe(0);
      orchestrator.defineSaga('test', []);
      expect(orchestrator.getSagaCount()).toBe(1);
    });
  });

  // ============================================================
  // executed steps / step count / current step
  // ============================================================
  describe('step queries', () => {
    it('should get executed steps', async () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
        { name: 's2', action: async () => true, compensation: async () => {} },
      ]);
      await orchestrator.execute(id);
      expect(orchestrator.getExecutedSteps(id)).toHaveLength(2);
    });

    it('should get step count', () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
      ]);
      expect(orchestrator.getStepCount(id)).toBe(1);
    });

    it('should get current step', () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
      ]);
      expect(orchestrator.getCurrentStep(id)).toBe(0);
    });

    it('should return -1 for unknown', () => {
      expect(orchestrator.getCurrentStep('unknown')).toBe(-1);
    });
  });

  // ============================================================
  // progress
  // ============================================================
  describe('progress', () => {
    it('should get progress', async () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
        { name: 's2', action: async () => true, compensation: async () => {} },
      ]);
      await orchestrator.execute(id);
      expect(orchestrator.getProgress(id)).toBe(1);
    });

    it('should return 0 for empty saga', () => {
      const id = orchestrator.defineSaga('test', []);
      expect(orchestrator.getProgress(id)).toBe(0);
    });
  });

  // ============================================================
  // status filters
  // ============================================================
  describe('status filters', () => {
    it('should get completed sagas', async () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
      ]);
      await orchestrator.execute(id);
      expect(orchestrator.getCompletedSagas()).toHaveLength(1);
    });

    it('should get failed sagas', async () => {
      // First, manually set status to 'failed' by creating a saga that throws but is caught before compensate
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
      ]);
      const saga = orchestrator.getSaga(id);
      if (saga) saga.status = 'failed';
      expect(orchestrator.getFailedSagas()).toHaveLength(1);
    });

    it('should get compensated sagas', async () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => false, compensation: async () => {} },
      ]);
      await orchestrator.execute(id);
      expect(orchestrator.getCompensatedSagas()).toHaveLength(1);
    });

    it('should get pending sagas', () => {
      orchestrator.defineSaga('test', []);
      expect(orchestrator.getPendingSagas()).toHaveLength(1);
    });

    it('should get running sagas', () => {
      orchestrator.defineSaga('test', []);
      expect(orchestrator.getRunningSagas()).toHaveLength(0);
    });
  });

  // ============================================================
  // status checks
  // ============================================================
  describe('status checks', () => {
    it('should check isCompleted', async () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
      ]);
      await orchestrator.execute(id);
      expect(orchestrator.isCompleted(id)).toBe(true);
    });

    it('should check isFailed', () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => true, compensation: async () => {} },
      ]);
      const saga = orchestrator.getSaga(id);
      if (saga) saga.status = 'failed';
      expect(orchestrator.isFailed(id)).toBe(true);
    });

    it('should check isCompensated', async () => {
      const id = orchestrator.defineSaga('test', [
        { name: 's1', action: async () => false, compensation: async () => {} },
      ]);
      await orchestrator.execute(id);
      expect(orchestrator.isCompensated(id)).toBe(true);
    });
  });

  // ============================================================
  // success rate
  // ============================================================
  describe('success rate', () => {
    it('should return 0 for empty', () => {
      expect(orchestrator.getSuccessRate()).toBe(0);
    });

    it('should calculate rate', async () => {
      const id1 = orchestrator.defineSaga('s1', [
        { name: 's', action: async () => true, compensation: async () => {} },
      ]);
      const id2 = orchestrator.defineSaga('s2', [
        { name: 's', action: async () => false, compensation: async () => {} },
      ]);
      await orchestrator.execute(id1);
      // For id2, manually set status to 'failed' (since after execute it would be 'compensated')
      const saga2 = orchestrator.getSaga(id2);
      if (saga2) saga2.status = 'failed';
      expect(orchestrator.getSuccessRate()).toBe(0.5);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many sagas', () => {
      for (let i = 0; i < 50; i++) {
        orchestrator.defineSaga(`s${i}`, []);
      }
      expect(orchestrator.getSagaCount()).toBe(50);
    });
  });
});