/**
 * ValidatorEngine Tests
 * claude-code-design Validator Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ValidatorEngine } from '../ValidatorEngine';

describe('ValidatorEngine', () => {
  let vle: ValidatorEngine;

  beforeEach(() => {
    vle = new ValidatorEngine();
  });

  afterEach(() => {
    vle.clearAll();
  });

  // ============================================================
  // define / validate / reset
  // ============================================================
  describe('define / validate / reset', () => {
    it('should define', () => {
      expect(vle.define('v1', 'non-empty')).toBe('vle-1');
    });

    it('should mark as active', () => {
      const id = vle.define('v1', 'non-empty');
      expect(vle.isActive(id)).toBe(true);
    });

    it('should default rule to non-empty', () => {
      const id = vle.define('v1');
      expect(vle.isNonEmpty(id)).toBe(true);
    });

    it('should mark as numeric', () => {
      const id = vle.define('v1', 'numeric');
      expect(vle.isNumeric(id)).toBe(true);
    });

    it('should mark as alpha', () => {
      const id = vle.define('v1', 'alpha');
      expect(vle.isAlpha(id)).toBe(true);
    });

    it('should mark as email', () => {
      const id = vle.define('v1', 'email');
      expect(vle.isEmail(id)).toBe(true);
    });

    it('should validate non-empty pass', () => {
      const id = vle.define('v1', 'non-empty');
      expect(vle.validate(id, 'hello')).toBe(true);
    });

    it('should validate non-empty fail', () => {
      const id = vle.define('v1', 'non-empty');
      expect(vle.validate(id, '')).toBe(false);
    });

    it('should validate numeric pass', () => {
      const id = vle.define('v1', 'numeric');
      expect(vle.validate(id, '123')).toBe(true);
    });

    it('should validate numeric fail', () => {
      const id = vle.define('v1', 'numeric');
      expect(vle.validate(id, 'abc')).toBe(false);
    });

    it('should validate alpha pass', () => {
      const id = vle.define('v1', 'alpha');
      expect(vle.validate(id, 'abc')).toBe(true);
    });

    it('should validate alpha fail', () => {
      const id = vle.define('v1', 'alpha');
      expect(vle.validate(id, '123')).toBe(false);
    });

    it('should validate email pass', () => {
      const id = vle.define('v1', 'email');
      expect(vle.validate(id, 'a@b.c')).toBe(true);
    });

    it('should validate email fail', () => {
      const id = vle.define('v1', 'email');
      expect(vle.validate(id, 'notanemail')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(vle.validate('unknown', 'value')).toBe(false);
    });

    it('should return false for inactive', () => {
      const id = vle.define('v1', 'non-empty');
      vle.setActive(id, false);
      expect(vle.validate(id, 'hello')).toBe(false);
    });

    it('should increment passed on pass', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getPassed(id)).toBe(1);
    });

    it('should increment failed on fail', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, '');
      expect(vle.getFailed(id)).toBe(1);
    });

    it('should log history on validate', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getHistory(id)).toHaveLength(1);
    });

    it('should reset', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      vle.reset(id);
      expect(vle.getPassed(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(vle.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      vle.define('v1', 'non-empty');
      const stats = vle.getStats();
      expect(stats.validators).toBe(1);
    });

    it('should count total passed', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getStats().totalPassed).toBe(1);
    });

    it('should count total failed', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, '');
      expect(vle.getStats().totalFailed).toBe(1);
    });

    it('should count active', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = vle.define('v1', 'non-empty');
      vle.setActive(id, false);
      expect(vle.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      vle.define('v1', 'non-empty');
      vle.define('v2', 'non-empty');
      expect(vle.getStats().uniqueNames).toBe(2);
    });

    it('should count unique rules', () => {
      vle.define('v1', 'non-empty');
      vle.define('v2', 'numeric');
      expect(vle.getStats().uniqueRules).toBe(2);
    });

    it('should count non-empty', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getStats().nonEmpty).toBe(1);
    });

    it('should count numeric', () => {
      vle.define('v1', 'numeric');
      expect(vle.getStats().numeric).toBe(1);
    });

    it('should count alpha', () => {
      vle.define('v1', 'alpha');
      expect(vle.getStats().alpha).toBe(1);
    });

    it('should count email', () => {
      vle.define('v1', 'email');
      expect(vle.getStats().email).toBe(1);
    });

    it('should compute pass rate', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getStats().passRate).toBe(1);
    });

    it('should compute avg passed', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getStats().avgPassed).toBe(1);
    });

    it('should get max passed', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'a');
      vle.validate(id, 'b');
      expect(vle.getStats().maxPassed).toBe(2);
    });

    it('should get min passed', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getStats().minPassed).toBe(0);
    });

    it('should compute avg rule length', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getStats().avgRuleLength).toBe(9);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get validator', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getValidator('vle-1')?.name).toBe('v1');
    });

    it('should get all', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getAllValidators()).toHaveLength(1);
    });

    it('should remove', () => {
      vle.define('v1', 'non-empty');
      expect(vle.removeValidator('vle-1')).toBe(true);
    });

    it('should check existence', () => {
      vle.define('v1', 'non-empty');
      expect(vle.hasValidator('vle-1')).toBe(true);
    });

    it('should count', () => {
      expect(vle.getCount()).toBe(0);
      vle.define('v1', 'non-empty');
      expect(vle.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getName('vle-1')).toBe('v1');
    });

    it('should get rule', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getRule('vle-1')).toBe('non-empty');
    });

    it('should get rule length', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getRuleLength('vle-1')).toBe(9);
    });

    it('should get history', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getHistory('vle-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      vle.define('v1', 'non-empty');
      expect(vle.setActive('vle-1', false)).toBe(true);
    });

    it('should set name', () => {
      vle.define('v1', 'non-empty');
      expect(vle.setName('vle-1', 'v2')).toBe(true);
    });

    it('should set rule', () => {
      vle.define('v1', 'non-empty');
      expect(vle.setRule('vle-1', 'numeric')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(vle.setActive('unknown', false)).toBe(false);
      expect(vle.setName('unknown', 'v')).toBe(false);
      expect(vle.setRule('unknown', 'non-empty')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      vle.setActive(id, false);
      vle.resetAll();
      expect(vle.getPassed(id)).toBe(0);
      expect(vle.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / rule / state
  // ============================================================
  describe('by name / rule / state', () => {
    it('should get by name', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getByName('v1')).toHaveLength(1);
    });

    it('should get by rule', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getByRule('non-empty')).toHaveLength(1);
    });

    it('should get non-empty', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getNonEmptyValidators()).toHaveLength(1);
    });

    it('should get numeric', () => {
      vle.define('v1', 'numeric');
      expect(vle.getNumericValidators()).toHaveLength(1);
    });

    it('should get alpha', () => {
      vle.define('v1', 'alpha');
      expect(vle.getAlphaValidators()).toHaveLength(1);
    });

    it('should get email', () => {
      vle.define('v1', 'email');
      expect(vle.getEmailValidators()).toHaveLength(1);
    });

    it('should get active', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getActiveValidators()).toHaveLength(1);
    });

    it('should get inactive', () => {
      vle.define('v1', 'non-empty');
      vle.setActive('vle-1', false);
      expect(vle.getInactiveValidators()).toHaveLength(1);
    });

    it('should get all names', () => {
      vle.define('v1', 'non-empty');
      vle.define('v2', 'non-empty');
      expect(vle.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getNameCount()).toBe(1);
    });

    it('should get by min passed', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getByMinPassed(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most passed', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'a');
      vle.validate(id, 'b');
      expect(vle.getMostPassed()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(vle.getMostPassed()).toBeNull();
    });

    it('should get newest', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getNewest()?.id).toBe('vle-1');
    });

    it('should return null for empty newest', () => {
      expect(vle.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getOldest()?.id).toBe('vle-1');
    });

    it('should return null for empty oldest', () => {
      expect(vle.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      vle.define('v1', 'non-empty');
      expect(vle.getCreatedAt('vle-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total passed', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, 'hello');
      expect(vle.getTotalPassed()).toBe(1);
    });

    it('should get total failed', () => {
      const id = vle.define('v1', 'non-empty');
      vle.validate(id, '');
      expect(vle.getTotalFailed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many validators', () => {
      for (let i = 0; i < 50; i++) {
        vle.define(`v${i}`, 'non-empty');
      }
      expect(vle.getCount()).toBe(50);
    });
  });
});