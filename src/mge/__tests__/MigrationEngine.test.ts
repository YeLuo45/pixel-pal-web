/**
 * MigrationEngine Tests
 * claude-code-design Migration Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MigrationEngine } from '../MigrationEngine';

describe('MigrationEngine', () => {
  let mge: MigrationEngine;

  beforeEach(() => {
    mge = new MigrationEngine();
  });

  afterEach(() => {
    mge.clearAll();
  });

  // ============================================================
  // plan / apply / rollback / fail / remove
  // ============================================================
  describe('plan / apply / rollback / fail / remove', () => {
    it('should plan', () => {
      expect(mge.plan('m1', '1.0.0')).toBe('mge-1');
    });

    it('should default status to pending', () => {
      const id = mge.plan('m1', '1.0.0');
      expect(mge.getStatus(id)).toBe('pending');
    });

    it('should mark as active', () => {
      const id = mge.plan('m1', '1.0.0');
      expect(mge.isActive(id)).toBe(true);
    });

    it('should apply', () => {
      const id = mge.plan('m1', '1.0.0');
      expect(mge.apply(id)).toBe(true);
    });

    it('should not double apply', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.apply(id)).toBe(false);
    });

    it('should not apply inactive', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.setActive(id, false);
      expect(mge.apply(id)).toBe(false);
    });

    it('should return false for unknown apply', () => {
      expect(mge.apply('unknown')).toBe(false);
    });

    it('should rollback', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.rollback(id)).toBe(true);
    });

    it('should not rollback pending', () => {
      const id = mge.plan('m1', '1.0.0');
      expect(mge.rollback(id)).toBe(false);
    });

    it('should return false for unknown rollback', () => {
      expect(mge.rollback('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = mge.plan('m1', '1.0.0');
      expect(mge.fail(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(mge.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = mge.plan('m1', '1.0.0');
      expect(mge.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      mge.plan('m1', '1.0.0');
      const stats = mge.getStats();
      expect(stats.migrations).toBe(1);
    });

    it('should count total applied', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.getStats().totalApplied).toBe(1);
    });

    it('should count total rolled back', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      mge.rollback(id);
      expect(mge.getStats().totalRolledBack).toBe(1);
    });

    it('should count total failed', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.fail(id);
      expect(mge.getStats().totalFailed).toBe(1);
    });

    it('should count pending', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getStats().pending).toBe(1);
    });

    it('should count applied', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.getStats().applied).toBe(1);
    });

    it('should count rolled back', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      mge.rollback(id);
      expect(mge.getStats().rolledBack).toBe(1);
    });

    it('should count failed', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.fail(id);
      expect(mge.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.setActive(id, false);
      expect(mge.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      mge.plan('a', '1.0');
      mge.plan('b', '1.0');
      expect(mge.getStats().uniqueNames).toBe(2);
    });

    it('should count unique versions', () => {
      mge.plan('a', '1.0');
      mge.plan('b', '2.0');
      expect(mge.getStats().uniqueVersions).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get migration', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getMigration('mge-1')?.name).toBe('m1');
    });

    it('should get all', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getAllMigrations()).toHaveLength(1);
    });

    it('should check existence', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.hasMigration('mge-1')).toBe(true);
    });

    it('should count', () => {
      expect(mge.getCount()).toBe(0);
      mge.plan('m1', '1.0.0');
      expect(mge.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getName('mge-1')).toBe('m1');
    });

    it('should get version', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getVersion('mge-1')).toBe('1.0.0');
    });

    it('should get hits', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.getHits(id)).toBe(1);
    });

    it('should check applied', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.isApplied(id)).toBe(true);
    });

    it('should check rolled back', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      mge.rollback(id);
      expect(mge.isRolledBack(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.fail(id);
      expect(mge.isFailed(id)).toBe(true);
    });

    it('should check pending', () => {
      const id = mge.plan('m1', '1.0.0');
      expect(mge.isPending(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.setActive('mge-1', false)).toBe(true);
    });

    it('should set name', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.setName('mge-1', 'm2')).toBe(true);
    });

    it('should set version', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.setVersion('mge-1', '2.0.0')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mge.setActive('unknown', false)).toBe(false);
      expect(mge.setName('unknown', 'm')).toBe(false);
      expect(mge.setVersion('unknown', '1.0.0')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      mge.setActive(id, false);
      mge.resetAll();
      expect(mge.getStatus(id)).toBe('pending');
      expect(mge.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by status / state
  // ============================================================
  describe('by status / state', () => {
    it('should get by status', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getActiveMigrations()).toHaveLength(1);
    });

    it('should get inactive', () => {
      mge.plan('m1', '1.0.0');
      mge.setActive('mge-1', false);
      expect(mge.getInactiveMigrations()).toHaveLength(1);
    });

    it('should get all names', () => {
      mge.plan('a', '1.0');
      mge.plan('b', '1.0');
      expect(mge.getAllNames()).toHaveLength(2);
    });

    it('should get all versions', () => {
      mge.plan('a', '1.0');
      mge.plan('b', '2.0');
      expect(mge.getAllVersions()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getNewest()?.id).toBe('mge-1');
    });

    it('should return null for empty newest', () => {
      expect(mge.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getOldest()?.id).toBe('mge-1');
    });

    it('should return null for empty oldest', () => {
      expect(mge.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      mge.plan('m1', '1.0.0');
      expect(mge.getCreatedAt('mge-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total applied', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      expect(mge.getTotalApplied()).toBe(1);
    });

    it('should get total rolled back', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.apply(id);
      mge.rollback(id);
      expect(mge.getTotalRolledBack()).toBe(1);
    });

    it('should get total failed', () => {
      const id = mge.plan('m1', '1.0.0');
      mge.fail(id);
      expect(mge.getTotalFailed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many migrations', () => {
      for (let i = 0; i < 50; i++) {
        mge.plan(`m${i}`, '1.0.0');
      }
      expect(mge.getCount()).toBe(50);
    });
  });
});