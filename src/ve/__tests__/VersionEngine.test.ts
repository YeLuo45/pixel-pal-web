/**
 * VersionEngine Tests
 * claude-code-design Version Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VersionEngine } from '../VersionEngine';

describe('VersionEngine', () => {
  let ve: VersionEngine;

  beforeEach(() => {
    ve = new VersionEngine();
  });

  afterEach(() => {
    ve.clearAll();
  });

  // ============================================================
  // create / setCurrent / compare / rollback
  // ============================================================
  describe('create / setCurrent / compare / rollback', () => {
    it('should create', () => {
      expect(ve.create('v1', '1.0.0')).toBe('ve-1');
    });

    it('should mark first as current', () => {
      const id = ve.create('v1', '1.0.0');
      expect(ve.isCurrent(id)).toBe(true);
    });

    it('should not mark second as current', () => {
      ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '2.0.0');
      expect(ve.isCurrent(id2)).toBe(false);
    });

    it('should set current', () => {
      ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '2.0.0');
      expect(ve.setCurrent(id2)).toBe(true);
    });

    it('should mark new current', () => {
      ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '2.0.0');
      ve.setCurrent(id2);
      expect(ve.isCurrent(id2)).toBe(true);
    });

    it('should unmark old current', () => {
      const id1 = ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '2.0.0');
      ve.setCurrent(id2);
      expect(ve.isCurrent(id1)).toBe(false);
    });

    it('should not set current inactive', () => {
      const id1 = ve.create('v1', '1.0.0');
      ve.setActive(id1, false);
      expect(ve.setCurrent(id1)).toBe(false);
    });

    it('should return false for unknown setCurrent', () => {
      expect(ve.setCurrent('unknown')).toBe(false);
    });

    it('should compare', () => {
      const id1 = ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '2.0.0');
      expect(ve.compare(id1, id2)).toBeLessThan(0);
    });

    it('should compare equal', () => {
      const id1 = ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '1.0.0');
      expect(ve.compare(id1, id2)).toBe(0);
    });

    it('should compare greater', () => {
      const id1 = ve.create('v1', '2.0.0');
      const id2 = ve.create('v2', '1.0.0');
      expect(ve.compare(id1, id2)).toBeGreaterThan(0);
    });

    it('should compare by minor', () => {
      const id1 = ve.create('v1', '1.1.0');
      const id2 = ve.create('v2', '1.2.0');
      expect(ve.compare(id1, id2)).toBeLessThan(0);
    });

    it('should compare by patch', () => {
      const id1 = ve.create('v1', '1.0.1');
      const id2 = ve.create('v2', '1.0.2');
      expect(ve.compare(id1, id2)).toBeLessThan(0);
    });

    it('should return 0 for unknown compare', () => {
      expect(ve.compare('unknown', 'other')).toBe(0);
    });

    it('should rollback', () => {
      const id1 = ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '2.0.0');
      ve.setCurrent(id2);
      expect(ve.rollback()).toBe(id1);
    });

    it('should mark previous as current on rollback', () => {
      const id1 = ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '2.0.0');
      ve.setCurrent(id2);
      ve.rollback();
      expect(ve.isCurrent(id1)).toBe(true);
    });

    it('should return null rollback when empty', () => {
      expect(ve.rollback()).toBeNull();
    });

    it('should parse semver', () => {
      expect(ve.parseSemver('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ve.create('v1', '1.0.0');
      const stats = ve.getStats();
      expect(stats.versions).toBe(1);
    });

    it('should get current', () => {
      const id = ve.create('v1', '1.0.0');
      expect(ve.getStats().current).toBe(id);
    });

    it('should count total hits', () => {
      const id = ve.create('v1', '1.0.0');
      ve.touch(id);
      expect(ve.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ve.create('v1', '1.0.0');
      ve.setActive(id, false);
      expect(ve.getStats().inactive).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get version', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getVersion('ve-1')?.name).toBe('v1');
    });

    it('should get all', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getAllVersions()).toHaveLength(1);
    });

    it('should remove', () => {
      ve.create('v1', '1.0.0');
      expect(ve.removeVersion('ve-1')).toBe(true);
    });

    it('should check existence', () => {
      ve.create('v1', '1.0.0');
      expect(ve.hasVersion('ve-1')).toBe(true);
    });

    it('should count', () => {
      expect(ve.getCount()).toBe(0);
      ve.create('v1', '1.0.0');
      expect(ve.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getName('ve-1')).toBe('v1');
    });

    it('should get semver', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getSemver('ve-1')).toBe('1.0.0');
    });

    it('should get hits', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getHits('ve-1')).toBe(0);
    });

    it('should get history', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getHistory('ve-1')).toEqual(['1.0.0']);
    });

    it('should get current id', () => {
      const id = ve.create('v1', '1.0.0');
      expect(ve.getCurrentId()).toBe(id);
    });

    it('should get current', () => {
      const id = ve.create('v1', '1.0.0');
      expect(ve.getCurrent()?.id).toBe(id);
    });

    it('should get previous ids', () => {
      const id1 = ve.create('v1', '1.0.0');
      const id2 = ve.create('v2', '2.0.0');
      ve.setCurrent(id2);
      expect(ve.getPreviousIds()).toContain(id1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = ve.create('v1', '1.0.0');
      expect(ve.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ve.create('v1', '1.0.0');
      expect(ve.setName(id, 'v2')).toBe(true);
    });

    it('should set semver', () => {
      const id = ve.create('v1', '1.0.0');
      expect(ve.setSemver(id, '2.0.0')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ve.setActive('unknown', false)).toBe(false);
      expect(ve.setName('unknown', 'v')).toBe(false);
      expect(ve.setSemver('unknown', '1.0.0')).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      const id = ve.create('v1', '1.0.0');
      expect(ve.touch(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ve.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ve.create('v1', '1.0.0');
      ve.touch(id);
      ve.setActive(id, false);
      ve.resetAll();
      expect(ve.getHits(id)).toBe(0);
      expect(ve.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getByName('v1')).toHaveLength(1);
    });

    it('should get active', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getActiveVersions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ve.create('v1', '1.0.0');
      ve.setActive(id, false);
      expect(ve.getInactiveVersions()).toHaveLength(1);
    });

    it('should get all names', () => {
      ve.create('v1', '1.0.0');
      ve.create('v2', '2.0.0');
      expect(ve.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getNameCount()).toBe(1);
    });

    it('should get by major', () => {
      ve.create('v1', '1.0.0');
      ve.create('v2', '2.0.0');
      expect(ve.getByMajor(1)).toHaveLength(1);
    });

    it('should get by minor', () => {
      ve.create('v1', '1.1.0');
      ve.create('v2', '1.2.0');
      expect(ve.getByMinor(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getNewest()?.id).toBe('ve-1');
    });

    it('should return null for empty newest', () => {
      expect(ve.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getOldest()?.id).toBe('ve-1');
    });

    it('should return null for empty oldest', () => {
      expect(ve.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ve.create('v1', '1.0.0');
      expect(ve.getCreatedAt('ve-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ve.create('v1', '1.0.0');
      ve.touch(id);
      expect(ve.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many versions', () => {
      for (let i = 0; i < 50; i++) {
        ve.create(`v${i}`, `${i}.0.0`);
      }
      expect(ve.getCount()).toBe(50);
    });
  });
});