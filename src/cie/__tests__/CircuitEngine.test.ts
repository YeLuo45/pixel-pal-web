/**
 * CircuitEngine Tests
 * thunderbolt-design Circuit Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CircuitEngine } from '../CircuitEngine';

describe('CircuitEngine', () => {
  let cie: CircuitEngine;

  beforeEach(() => {
    cie = new CircuitEngine();
  });

  afterEach(() => {
    cie.clearAll();
  });

  // ============================================================
  // create / recordFailure / open / close / halfOpen / reset / remove
  // ============================================================
  describe('create / recordFailure / open / close / halfOpen / reset / remove', () => {
    it('should create', () => {
      expect(cie.create('c1', 5)).toBe('cie-1');
    });

    it('should default threshold to 5', () => {
      const id = cie.create('c1');
      expect(cie.getThreshold(id)).toBe(5);
    });

    it('should default state to closed', () => {
      const id = cie.create('c1');
      expect(cie.getState(id)).toBe('closed');
    });

    it('should mark as active', () => {
      const id = cie.create('c1');
      expect(cie.isActive(id)).toBe(true);
    });

    it('should record failure', () => {
      const id = cie.create('c1');
      expect(cie.recordFailure(id)).toBe(true);
    });

    it('should increment failures', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      expect(cie.getFailures(id)).toBe(1);
    });

    it('should open when threshold reached', () => {
      const id = cie.create('c1', 2);
      cie.recordFailure(id);
      cie.recordFailure(id);
      expect(cie.getState(id)).toBe('open');
    });

    it('should not record failure on inactive', () => {
      const id = cie.create('c1');
      cie.setActive(id, false);
      expect(cie.recordFailure(id)).toBe(false);
    });

    it('should return false for unknown recordFailure', () => {
      expect(cie.recordFailure('unknown')).toBe(false);
    });

    it('should open', () => {
      const id = cie.create('c1');
      expect(cie.open(id)).toBe(true);
    });

    it('should return false for unknown open', () => {
      expect(cie.open('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = cie.create('c1');
      cie.open(id);
      expect(cie.close(id)).toBe(true);
    });

    it('should reset failures on close', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      cie.open(id);
      cie.close(id);
      expect(cie.getFailures(id)).toBe(0);
    });

    it('should return false for unknown close', () => {
      expect(cie.close('unknown')).toBe(false);
    });

    it('should halfOpen', () => {
      const id = cie.create('c1');
      cie.open(id);
      expect(cie.halfOpen(id)).toBe(true);
    });

    it('should return false for unknown halfOpen', () => {
      expect(cie.halfOpen('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      cie.open(id);
      expect(cie.reset(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(cie.reset('unknown')).toBe(false);
    });

    it('should check isOpen', () => {
      const id = cie.create('c1');
      cie.open(id);
      expect(cie.isOpen(id)).toBe(true);
    });

    it('should check isClosed', () => {
      const id = cie.create('c1');
      expect(cie.isClosed(id)).toBe(true);
    });

    it('should check isHalfOpen', () => {
      const id = cie.create('c1');
      cie.open(id);
      cie.halfOpen(id);
      expect(cie.isHalfOpen(id)).toBe(true);
    });

    it('should check canPass', () => {
      const id = cie.create('c1');
      expect(cie.canPass(id)).toBe(true);
    });

    it('should not pass when open', () => {
      const id = cie.create('c1');
      cie.open(id);
      expect(cie.canPass(id)).toBe(false);
    });

    it('should remove', () => {
      const id = cie.create('c1');
      expect(cie.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cie.create('c1');
      const stats = cie.getStats();
      expect(stats.circuits).toBe(1);
    });

    it('should count closed', () => {
      cie.create('c1');
      expect(cie.getStats().closed).toBe(1);
    });

    it('should count open', () => {
      const id = cie.create('c1');
      cie.open(id);
      expect(cie.getStats().open).toBe(1);
    });

    it('should count halfOpen', () => {
      const id = cie.create('c1');
      cie.halfOpen(id);
      expect(cie.getStats().halfOpen).toBe(1);
    });

    it('should count active', () => {
      cie.create('c1');
      expect(cie.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cie.create('c1');
      cie.setActive(id, false);
      expect(cie.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      expect(cie.getStats().totalHits).toBe(1);
    });

    it('should count total failures', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      expect(cie.getStats().totalFailures).toBe(1);
    });

    it('should count total opens', () => {
      const id = cie.create('c1', 1);
      cie.recordFailure(id);
      expect(cie.getStats().totalOpens).toBe(1);
    });

    it('should count total closes', () => {
      const id = cie.create('c1');
      cie.open(id);
      cie.close(id);
      expect(cie.getStats().totalCloses).toBe(1);
    });

    it('should count unique names', () => {
      cie.create('a');
      cie.create('b');
      expect(cie.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg failures', () => {
      const id1 = cie.create('a');
      cie.recordFailure(id1);
      const id2 = cie.create('b');
      cie.recordFailure(id2);
      cie.recordFailure(id2);
      expect(cie.getStats().avgFailures).toBe(1.5);
    });

    it('should get max failures', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      cie.recordFailure(id);
      expect(cie.getStats().maxFailures).toBe(2);
    });

    it('should get min failures', () => {
      cie.create('c1');
      expect(cie.getStats().minFailures).toBe(0);
    });

    it('should compute avg threshold', () => {
      cie.create('a', 1);
      cie.create('b', 5);
      expect(cie.getStats().avgThreshold).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get circuit', () => {
      cie.create('c1');
      expect(cie.getCircuit('cie-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      cie.create('c1');
      expect(cie.getAllCircuits()).toHaveLength(1);
    });

    it('should check existence', () => {
      cie.create('c1');
      expect(cie.hasCircuit('cie-1')).toBe(true);
    });

    it('should count', () => {
      expect(cie.getCount()).toBe(0);
      cie.create('c1');
      expect(cie.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      cie.create('c1');
      expect(cie.getName('cie-1')).toBe('c1');
    });

    it('should get hits', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      expect(cie.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cie.create('c1');
      expect(cie.setActive('cie-1', false)).toBe(true);
    });

    it('should set threshold', () => {
      cie.create('c1');
      expect(cie.setThreshold('cie-1', 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cie.setActive('unknown', false)).toBe(false);
      expect(cie.setThreshold('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      cie.open(id);
      cie.setActive(id, false);
      cie.resetAll();
      expect(cie.getFailures(id)).toBe(0);
      expect(cie.getState(id)).toBe('closed');
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get by state', () => {
      cie.create('c1');
      expect(cie.getByState('closed')).toHaveLength(1);
    });

    it('should get active', () => {
      cie.create('c1');
      expect(cie.getActiveCircuits()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cie.create('c1');
      cie.setActive('cie-1', false);
      expect(cie.getInactiveCircuits()).toHaveLength(1);
    });

    it('should get all names', () => {
      cie.create('a');
      cie.create('b');
      expect(cie.getAllNames()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      cie.create('c1');
      expect(cie.getNewest()?.id).toBe('cie-1');
    });

    it('should return null for empty newest', () => {
      expect(cie.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cie.create('c1');
      expect(cie.getOldest()?.id).toBe('cie-1');
    });

    it('should return null for empty oldest', () => {
      expect(cie.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cie.create('c1');
      expect(cie.getCreatedAt('cie-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      expect(cie.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total failures', () => {
      const id = cie.create('c1');
      cie.recordFailure(id);
      expect(cie.getTotalFailures()).toBe(1);
    });

    it('should get total opens', () => {
      const id = cie.create('c1', 1);
      cie.recordFailure(id);
      expect(cie.getTotalOpens()).toBe(1);
    });

    it('should get total closes', () => {
      const id = cie.create('c1');
      cie.open(id);
      cie.close(id);
      expect(cie.getTotalCloses()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many circuits', () => {
      for (let i = 0; i < 50; i++) {
        cie.create(`c${i}`);
      }
      expect(cie.getCount()).toBe(50);
    });
  });
});