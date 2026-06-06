/**
 * LinterEngine Tests
 * claude-code-design Linter Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LinterEngine } from '../LinterEngine';

describe('LinterEngine', () => {
  let le: LinterEngine;

  beforeEach(() => {
    le = new LinterEngine();
  });

  afterEach(() => {
    le.clearAll();
  });

  // ============================================================
  // define / check / reset
  // ============================================================
  describe('define / check / reset', () => {
    it('should define', () => {
      expect(le.define('r1', 'error')).toBe('le-1');
    });

    it('should mark as active', () => {
      const id = le.define('r1', 'error');
      expect(le.isActive(id)).toBe(true);
    });

    it('should mark as warning by default', () => {
      const id = le.define('r1');
      expect(le.isWarning(id)).toBe(true);
    });

    it('should mark as error', () => {
      const id = le.define('r1', 'error');
      expect(le.isError(id)).toBe(true);
    });

    it('should mark as info', () => {
      const id = le.define('r1', 'info');
      expect(le.isInfo(id)).toBe(true);
    });

    it('should check', () => {
      const id = le.define('r1', 'error');
      expect(le.check(id, 1)).toBe(true);
    });

    it('should increment violations on check', () => {
      const id = le.define('r1', 'error');
      le.check(id, 1);
      expect(le.getViolations(id)).toBe(1);
    });

    it('should accumulate violations on check', () => {
      const id = le.define('r1', 'error');
      le.check(id, 3);
      le.check(id, 2);
      expect(le.getViolations(id)).toBe(5);
    });

    it('should log history on check', () => {
      const id = le.define('r1', 'error');
      le.check(id, 2);
      expect(le.getHistory(id)).toHaveLength(2);
    });

    it('should not check inactive', () => {
      const id = le.define('r1', 'error');
      le.setActive(id, false);
      expect(le.check(id, 1)).toBe(false);
    });

    it('should return false for unknown check', () => {
      expect(le.check('unknown', 1)).toBe(false);
    });

    it('should reset', () => {
      const id = le.define('r1', 'error');
      le.check(id, 5);
      expect(le.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = le.define('r1', 'error');
      le.check(id, 5);
      le.reset(id);
      expect(le.getViolations(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(le.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      le.define('r1', 'error');
      const stats = le.getStats();
      expect(stats.rules).toBe(1);
    });

    it('should count errors', () => {
      le.define('r1', 'error');
      expect(le.getStats().errors).toBe(1);
    });

    it('should count warnings', () => {
      le.define('r1', 'warning');
      expect(le.getStats().warnings).toBe(1);
    });

    it('should count infos', () => {
      le.define('r1', 'info');
      expect(le.getStats().infos).toBe(1);
    });

    it('should count total violations', () => {
      const id = le.define('r1', 'error');
      le.check(id, 5);
      expect(le.getStats().totalViolations).toBe(5);
    });

    it('should count active', () => {
      le.define('r1', 'error');
      expect(le.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = le.define('r1', 'error');
      le.setActive(id, false);
      expect(le.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = le.define('r1', 'error');
      le.check(id, 1);
      expect(le.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      le.define('r1', 'error');
      le.define('r2', 'error');
      expect(le.getStats().uniqueNames).toBe(2);
    });

    it('should count unique severities', () => {
      le.define('r1', 'error');
      le.define('r2', 'warning');
      expect(le.getStats().uniqueSeverities).toBe(2);
    });

    it('should compute avg violations', () => {
      const id = le.define('r1', 'error');
      le.check(id, 2);
      expect(le.getStats().avgViolations).toBe(2);
    });

    it('should get max violations', () => {
      const id = le.define('r1', 'error');
      le.check(id, 5);
      expect(le.getStats().maxViolations).toBe(5);
    });

    it('should get min violations', () => {
      le.define('r1', 'error');
      expect(le.getStats().minViolations).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get rule', () => {
      le.define('r1', 'error');
      expect(le.getRule('le-1')?.name).toBe('r1');
    });

    it('should get all', () => {
      le.define('r1', 'error');
      expect(le.getAllRules()).toHaveLength(1);
    });

    it('should remove', () => {
      le.define('r1', 'error');
      expect(le.removeRule('le-1')).toBe(true);
    });

    it('should check existence', () => {
      le.define('r1', 'error');
      expect(le.hasRule('le-1')).toBe(true);
    });

    it('should count', () => {
      expect(le.getCount()).toBe(0);
      le.define('r1', 'error');
      expect(le.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      le.define('r1', 'error');
      expect(le.getName('le-1')).toBe('r1');
    });

    it('should get severity', () => {
      le.define('r1', 'error');
      expect(le.getSeverity('le-1')).toBe('error');
    });

    it('should get violations', () => {
      le.define('r1', 'error');
      expect(le.getViolations('le-1')).toBe(0);
    });

    it('should get history', () => {
      le.define('r1', 'error');
      expect(le.getHistory('le-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = le.define('r1', 'error');
      le.check(id, 1);
      expect(le.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      le.define('r1', 'error');
      expect(le.setActive('le-1', false)).toBe(true);
    });

    it('should set name', () => {
      le.define('r1', 'error');
      expect(le.setName('le-1', 'r2')).toBe(true);
    });

    it('should set severity', () => {
      le.define('r1', 'error');
      expect(le.setSeverity('le-1', 'warning')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(le.setActive('unknown', false)).toBe(false);
      expect(le.setName('unknown', 'r')).toBe(false);
      expect(le.setSeverity('unknown', 'error')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = le.define('r1', 'error');
      le.check(id, 5);
      le.setActive(id, false);
      le.resetAll();
      expect(le.getViolations(id)).toBe(0);
      expect(le.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / severity / state
  // ============================================================
  describe('by name / severity / state', () => {
    it('should get by name', () => {
      le.define('r1', 'error');
      expect(le.getByName('r1')).toHaveLength(1);
    });

    it('should get by severity', () => {
      le.define('r1', 'error');
      expect(le.getBySeverity('error')).toHaveLength(1);
    });

    it('should get error rules', () => {
      le.define('r1', 'error');
      expect(le.getErrorRules()).toHaveLength(1);
    });

    it('should get warning rules', () => {
      le.define('r1', 'warning');
      expect(le.getWarningRules()).toHaveLength(1);
    });

    it('should get info rules', () => {
      le.define('r1', 'info');
      expect(le.getInfoRules()).toHaveLength(1);
    });

    it('should get active', () => {
      le.define('r1', 'error');
      expect(le.getActiveRules()).toHaveLength(1);
    });

    it('should get inactive', () => {
      le.define('r1', 'error');
      le.setActive('le-1', false);
      expect(le.getInactiveRules()).toHaveLength(1);
    });

    it('should get all names', () => {
      le.define('r1', 'error');
      le.define('r2', 'error');
      expect(le.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      le.define('r1', 'error');
      expect(le.getNameCount()).toBe(1);
    });

    it('should get by min violations', () => {
      const id = le.define('r1', 'error');
      le.check(id, 5);
      expect(le.getByMinViolations(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most violations', () => {
      const id = le.define('r1', 'error');
      le.check(id, 5);
      expect(le.getMostViolations()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(le.getMostViolations()).toBeNull();
    });

    it('should get newest', () => {
      le.define('r1', 'error');
      expect(le.getNewest()?.id).toBe('le-1');
    });

    it('should return null for empty newest', () => {
      expect(le.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      le.define('r1', 'error');
      expect(le.getOldest()?.id).toBe('le-1');
    });

    it('should return null for empty oldest', () => {
      expect(le.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      le.define('r1', 'error');
      expect(le.getCreatedAt('le-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = le.define('r1', 'error');
      le.check(id, 1);
      expect(le.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total violations', () => {
      const id = le.define('r1', 'error');
      le.check(id, 5);
      expect(le.getTotalViolations()).toBe(5);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many rules', () => {
      for (let i = 0; i < 50; i++) {
        le.define(`r${i}`, 'error');
      }
      expect(le.getCount()).toBe(50);
    });
  });
});