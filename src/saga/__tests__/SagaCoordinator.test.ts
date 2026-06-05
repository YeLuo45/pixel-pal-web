/**
 * SagaCoordinator Tests
 * thunderbolt-design Saga Coordinator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SagaCoordinator } from '../SagaCoordinator';

describe('SagaCoordinator', () => {
  let coord: SagaCoordinator;

  beforeEach(() => {
    coord = new SagaCoordinator();
  });

  afterEach(() => {
    coord.clearAll();
  });

  // ============================================================
  // define
  // ============================================================
  describe('define', () => {
    it('should define saga', () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(id).toBe('saga-1');
    });

    it('should set status to pending', () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.isPending(id)).toBe(true);
    });
  });

  // ============================================================
  // execute
  // ============================================================
  describe('execute', () => {
    it('should execute', async () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(await coord.execute(id)).toBe(true);
    });

    it('should mark completed on success', async () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      await coord.execute(id);
      expect(coord.isCompleted(id)).toBe(true);
    });

    it('should mark failed and compensate on false result', async () => {
      let compensated = false;
      const id = coord.define([{ name: 's1', action: async () => false, compensate: async () => { compensated = true; } }]);
      expect(await coord.execute(id)).toBe(false);
      expect(compensated).toBe(true);
    });

    it('should mark failed and compensate on throw', async () => {
      let compensated = false;
      const id = coord.define([{ name: 's1', action: async () => { throw 'err'; }, compensate: async () => { compensated = true; } }]);
      expect(await coord.execute(id)).toBe(false);
      expect(compensated).toBe(true);
    });

    it('should return false for unknown', async () => {
      expect(await coord.execute('unknown')).toBe(false);
    });
  });

  // ============================================================
  // compensate
  // ============================================================
  describe('compensate', () => {
    it('should compensate', async () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(await coord.compensate(id)).toBe(true);
    });

    it('should return false for unknown', async () => {
      expect(await coord.compensate('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      const stats = coord.getStats();
      expect(stats.sagas).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get saga', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getSaga('saga-1')?.status).toBe('pending');
    });

    it('should get all', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getAllSagas()).toHaveLength(1);
    });

    it('should remove', () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.removeSaga(id)).toBe(true);
    });

    it('should check existence', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.hasSaga('saga-1')).toBe(true);
    });

    it('should count', () => {
      expect(coord.getCount()).toBe(0);
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getCount()).toBe(1);
    });
  });

  // ============================================================
  // status
  // ============================================================
  describe('status', () => {
    it('should get status', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getStatus('saga-1')).toBe('pending');
    });

    it('should get current step', () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getCurrentStep(id)).toBe(0);
    });

    it('should get step count', () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getStepCount(id)).toBe(1);
    });
  });

  // ============================================================
  // status checks
  // ============================================================
  describe('status checks', () => {
    it('should check isRunning', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.isRunning('saga-1')).toBe(false);
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get completed', async () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      await coord.execute(id);
      expect(coord.getCompletedSagas()).toHaveLength(1);
    });

    it('should get failed/compensated', async () => {
      const id = coord.define([{ name: 's1', action: async () => false, compensate: async () => {} }]);
      await coord.execute(id);
      // After execute fails, status is 'compensated' (not 'failed') because compensation runs automatically
      expect(coord.getFailedSagas().length + coord.getCompensatedSagas().length).toBe(1);
    });

    it('should get compensated', async () => {
      const id = coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      await coord.compensate(id);
      expect(coord.getCompensatedSagas()).toHaveLength(1);
    });

    it('should get running', () => {
      expect(coord.getRunningSagas()).toHaveLength(0);
    });

    it('should get pending', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getPendingSagas()).toHaveLength(1);
    });

    it('should get by status', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getByStatus('pending')).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getCreatedAt('saga-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      expect(coord.getUpdatedAt('saga-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many sagas', () => {
      for (let i = 0; i < 50; i++) {
        coord.define([{ name: 's1', action: async () => true, compensate: async () => {} }]);
      }
      expect(coord.getCount()).toBe(50);
    });
  });
});