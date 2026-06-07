/**
 * SagaEngine Tests
 * thunderbolt-design Saga Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SagaEngine } from '../SagaEngine';

describe('SagaEngine', () => {
  let sge: SagaEngine;

  beforeEach(() => {
    sge = new SagaEngine();
  });

  afterEach(() => {
    sge.clearAll();
  });

  describe('define / run / complete / fail / compensate / remove', () => {
    it('should define', () => {
      expect(sge.define('s1', 'doX', 'undoX')).toMatch(/^sge-/);
    });

    it('should default status to pending', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getStatus(sge.getAllSteps()[0].id)).toBe('pending');
    });

    it('should mark as active', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.isActive(sge.getAllSteps()[0].id)).toBe(true);
    });

    it('should run', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.run(id)).toBe(true);
    });

    it('should complete', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      expect(sge.complete(id)).toBe(true);
    });

    it('should fail', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      expect(sge.fail(id)).toBe(true);
    });

    it('should compensate', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.fail(id);
      expect(sge.compensate(id)).toBe(true);
    });

    it('should not compensate non-failed', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.complete(id);
      expect(sge.compensate(id)).toBe(false);
    });

    it('should not run inactive', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.setActive(id, false);
      expect(sge.run(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(sge.run('unknown')).toBe(false);
      expect(sge.complete('unknown')).toBe(false);
      expect(sge.fail('unknown')).toBe(false);
      expect(sge.compensate('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getStats().steps).toBe(1);
    });

    it('should count total defined', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getStats().totalDefined).toBe(1);
    });

    it('should count total run', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.complete(id);
      expect(sge.getStats().totalRun).toBe(1);
    });

    it('should count total compensated', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.fail(id);
      sge.compensate(id);
      expect(sge.getStats().totalCompensated).toBe(1);
    });

    it('should count pending', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      expect(sge.getStats().running).toBe(1);
    });

    it('should count completed', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.complete(id);
      expect(sge.getStats().completed).toBe(1);
    });

    it('should count failed', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.fail(id);
      expect(sge.getStats().failed).toBe(1);
    });

    it('should count compensated', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.fail(id);
      sge.compensate(id);
      expect(sge.getStats().compensated).toBe(1);
    });

    it('should count active', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.setActive(id, false);
      expect(sge.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      expect(sge.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sge.define('a', 'doX', 'undoX');
      sge.define('a', 'doY', 'undoY');
      expect(sge.getStats().uniqueNames).toBe(1);
    });

    it('should count unique actions', () => {
      sge.define('s1', 'doX', 'undoX');
      sge.define('s2', 'doX', 'undoY');
      expect(sge.getStats().uniqueActions).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get step', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.getStep(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getAllSteps()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.hasStep(id)).toBe(true);
    });

    it('should count', () => {
      expect(sge.getCount()).toBe(0);
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.getName(id)).toBe('s1');
    });

    it('should get action', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.getAction(id)).toBe('doX');
    });

    it('should get compensation', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.getCompensation(id)).toBe('undoX');
    });

    it('should get hits', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      expect(sge.getHits(id)).toBe(1);
    });

    it('should check pending', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.isPending(sge.getAllSteps()[0].id)).toBe(true);
    });

    it('should check running', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      expect(sge.isRunning(id)).toBe(true);
    });

    it('should check completed', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.complete(id);
      expect(sge.isCompleted(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.fail(id);
      expect(sge.isFailed(id)).toBe(true);
    });

    it('should check compensated', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.fail(id);
      sge.compensate(id);
      expect(sge.isCompensated(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.setName(id, 's2')).toBe(true);
    });

    it('should set action', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.setAction(id, 'doY')).toBe(true);
    });

    it('should set compensation', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.setCompensation(id, 'undoY')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sge.setActive('unknown', false)).toBe(false);
      expect(sge.setName('unknown', 's')).toBe(false);
      expect(sge.setAction('unknown', 'a')).toBe(false);
      expect(sge.setCompensation('unknown', 'c')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.setActive(id, false);
      sge.resetAll();
      expect(sge.isActive(id)).toBe(true);
      expect(sge.isPending(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getActiveSteps()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.setActive(id, false);
      expect(sge.getInactiveSteps()).toHaveLength(1);
    });

    it('should get all names', () => {
      sge.define('a', 'doX', 'undoX');
      sge.define('b', 'doX', 'undoX');
      expect(sge.getAllNames()).toHaveLength(2);
    });

    it('should get all actions', () => {
      sge.define('s1', 'doX', 'undoX');
      sge.define('s2', 'doY', 'undoY');
      expect(sge.getAllActions()).toHaveLength(2);
    });

    it('should get all compensations', () => {
      sge.define('s1', 'doX', 'undoX');
      sge.define('s2', 'doY', 'undoY');
      expect(sge.getAllCompensations()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(sge.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(sge.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      expect(sge.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      expect(sge.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total defined', () => {
      sge.define('s1', 'doX', 'undoX');
      expect(sge.getTotalDefined()).toBe(1);
    });

    it('should get total run', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.complete(id);
      expect(sge.getTotalRun()).toBe(1);
    });

    it('should get total compensated', () => {
      const id = sge.define('s1', 'doX', 'undoX');
      sge.run(id);
      sge.fail(id);
      sge.compensate(id);
      expect(sge.getTotalCompensated()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many steps', () => {
      for (let i = 0; i < 50; i++) {
        sge.define(`s${i}`, 'doX', 'undoX');
      }
      expect(sge.getCount()).toBe(50);
    });
  });
});