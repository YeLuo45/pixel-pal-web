/**
 * ReasonEngine Tests
 * generic-agent-design Reason Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReasonEngine } from '../ReasonEngine';

describe('ReasonEngine', () => {
  let re: ReasonEngine;

  beforeEach(() => {
    re = new ReasonEngine();
  });

  afterEach(() => {
    re.clearAll();
  });

  // ============================================================
  // register / validate
  // ============================================================
  describe('register / validate', () => {
    it('should register', () => {
      expect(re.register('r1', ['p1'], 'c1')).toBe('re-1');
    });

    it('should mark as active', () => {
      const id = re.register('r1', ['p1'], 'c1');
      expect(re.isActive(id)).toBe(true);
    });

    it('should mark as invalid initially', () => {
      const id = re.register('r1', ['p1'], 'c1');
      expect(re.isValid(id)).toBe(false);
    });

    it('should validate', () => {
      const id = re.register('r1', ['p1'], 'c1');
      expect(re.validate(id, true)).toBe(true);
    });

    it('should mark as valid', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.isValid(id)).toBe(true);
    });

    it('should mark as invalid on false', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, false);
      expect(re.isValid(id)).toBe(false);
    });

    it('should log history on validate', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getHistory(id)).toEqual([true]);
    });

    it('should not validate inactive', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.setActive(id, false);
      expect(re.validate(id, true)).toBe(false);
    });

    it('should return false for unknown validate', () => {
      expect(re.validate('unknown', true)).toBe(false);
    });

    it('should reset', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.reset(id)).toBe(true);
    });

    it('should mark as invalid on reset', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      re.reset(id);
      expect(re.isValid(id)).toBe(false);
    });

    it('should return false for unknown reset', () => {
      expect(re.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      re.register('r1', ['p1'], 'c1');
      const stats = re.getStats();
      expect(stats.reasons).toBe(1);
    });

    it('should count total valid', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getStats().totalValid).toBe(1);
    });

    it('should count total invalid', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, false);
      expect(re.getStats().totalInvalid).toBe(1);
    });

    it('should count active', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.setActive(id, false);
      expect(re.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      re.register('r1', ['p1'], 'c1');
      re.register('r2', ['p1'], 'c1');
      expect(re.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg premises', () => {
      re.register('r1', ['p1', 'p2', 'p3'], 'c1');
      expect(re.getStats().avgPremises).toBe(3);
    });

    it('should get max premises', () => {
      re.register('r1', ['p1', 'p2', 'p3', 'p4'], 'c1');
      expect(re.getStats().maxPremises).toBe(4);
    });

    it('should get min premises', () => {
      re.register('r1', ['p1', 'p2'], 'c1');
      re.register('r2', ['p1'], 'c1');
      expect(re.getStats().minPremises).toBe(1);
    });

    it('should compute validity rate', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getStats().validityRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get reason', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getReason('re-1')?.name).toBe('r1');
    });

    it('should get all', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getAllReasons()).toHaveLength(1);
    });

    it('should remove', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.removeReason('re-1')).toBe(true);
    });

    it('should check existence', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.hasReason('re-1')).toBe(true);
    });

    it('should count', () => {
      expect(re.getCount()).toBe(0);
      re.register('r1', ['p1'], 'c1');
      expect(re.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getName('re-1')).toBe('r1');
    });

    it('should get premises', () => {
      re.register('r1', ['p1', 'p2'], 'c1');
      expect(re.getPremises('re-1')).toEqual(['p1', 'p2']);
    });

    it('should get premise count', () => {
      re.register('r1', ['p1', 'p2'], 'c1');
      expect(re.getPremiseCount('re-1')).toBe(2);
    });

    it('should get conclusion', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getConclusion('re-1')).toBe('c1');
    });

    it('should get validations', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getValidations(id)).toBe(1);
    });

    it('should get invalidations', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, false);
      expect(re.getInvalidations(id)).toBe(1);
    });

    it('should get history', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getHistory('re-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.setActive('re-1', false)).toBe(true);
    });

    it('should set name', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.setName('re-1', 'r2')).toBe(true);
    });

    it('should set premises', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.setPremises('re-1', ['x', 'y'])).toBe(true);
    });

    it('should set conclusion', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.setConclusion('re-1', 'c2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(re.setActive('unknown', false)).toBe(false);
      expect(re.setName('unknown', 'r')).toBe(false);
      expect(re.setPremises('unknown', [])).toBe(false);
      expect(re.setConclusion('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      re.setActive(id, false);
      re.resetAll();
      expect(re.isValid(id)).toBe(false);
      expect(re.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getByName('r1')).toHaveLength(1);
    });

    it('should get valid', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getValidReasons()).toHaveLength(1);
    });

    it('should get invalid', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, false);
      expect(re.getInvalidReasons()).toHaveLength(1);
    });

    it('should get active', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getActiveReasons()).toHaveLength(1);
    });

    it('should get inactive', () => {
      re.register('r1', ['p1'], 'c1');
      re.setActive('re-1', false);
      expect(re.getInactiveReasons()).toHaveLength(1);
    });

    it('should get all names', () => {
      re.register('r1', ['p1'], 'c1');
      re.register('r2', ['p1'], 'c1');
      expect(re.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getNameCount()).toBe(1);
    });

    it('should get by min premises', () => {
      re.register('r1', ['p1', 'p2', 'p3'], 'c1');
      expect(re.getByMinPremises(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most premises', () => {
      re.register('r1', ['p1', 'p2', 'p3'], 'c1');
      re.register('r2', ['p1'], 'c1');
      expect(re.getMostPremises()?.id).toBe('re-1');
    });

    it('should return null for empty most', () => {
      expect(re.getMostPremises()).toBeNull();
    });

    it('should get newest', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getNewest()?.id).toBe('re-1');
    });

    it('should return null for empty newest', () => {
      expect(re.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getOldest()?.id).toBe('re-1');
    });

    it('should return null for empty oldest', () => {
      expect(re.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      re.register('r1', ['p1'], 'c1');
      expect(re.getCreatedAt('re-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total valid', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, true);
      expect(re.getTotalValid()).toBe(1);
    });

    it('should get total invalid', () => {
      const id = re.register('r1', ['p1'], 'c1');
      re.validate(id, false);
      expect(re.getTotalInvalid()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many reasons', () => {
      for (let i = 0; i < 50; i++) {
        re.register(`r${i}`, [`p${i}`], `c${i}`);
      }
      expect(re.getCount()).toBe(50);
    });
  });
});