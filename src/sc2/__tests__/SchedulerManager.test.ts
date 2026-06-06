/**
 * SchedulerManager Tests
 * nanobot-design Scheduler Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SchedulerManager } from '../SchedulerManager';

describe('SchedulerManager', () => {
  let sc2: SchedulerManager;

  beforeEach(() => {
    sc2 = new SchedulerManager();
  });

  afterEach(() => {
    sc2.clearAll();
  });

  // ============================================================
  // schedule / run / unschedule / enable / disable / reset
  // ============================================================
  describe('schedule / run / unschedule / enable / disable / reset', () => {
    it('should schedule', () => {
      expect(sc2.schedule('s1', '0 * * * *')).toBe('sc2-1');
    });

    it('should mark as active', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      expect(sc2.isActive(id)).toBe(true);
    });

    it('should mark as enabled', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      expect(sc2.isEnabled(id)).toBe(true);
    });

    it('should run', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      expect(sc2.run(id)).toBe(true);
    });

    it('should increment runs on run', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getRuns(id)).toBe(1);
    });

    it('should set lastRun on run', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getLastRun(id)).toBeGreaterThan(0);
    });

    it('should log history on run', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getHistory(id)).toHaveLength(1);
    });

    it('should not run disabled', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.disable(id);
      expect(sc2.run(id)).toBe(false);
    });

    it('should return false for unknown run', () => {
      expect(sc2.run('unknown')).toBe(false);
    });

    it('should unschedule', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      expect(sc2.unschedule(id)).toBe(true);
    });

    it('should remove on unschedule', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.unschedule(id);
      expect(sc2.hasSchedule(id)).toBe(false);
    });

    it('should enable', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.disable(id);
      expect(sc2.enable(id)).toBe(true);
    });

    it('should mark as enabled on enable', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.disable(id);
      sc2.enable(id);
      expect(sc2.isEnabled(id)).toBe(true);
    });

    it('should not enable already enabled', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      expect(sc2.enable(id)).toBe(false);
    });

    it('should return false for unknown enable', () => {
      expect(sc2.enable('unknown')).toBe(false);
    });

    it('should disable', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      expect(sc2.disable(id)).toBe(true);
    });

    it('should mark as disabled on disable', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.disable(id);
      expect(sc2.isDisabled(id)).toBe(true);
    });

    it('should not disable already disabled', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.disable(id);
      expect(sc2.disable(id)).toBe(false);
    });

    it('should return false for unknown disable', () => {
      expect(sc2.disable('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      sc2.reset(id);
      expect(sc2.getRuns(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(sc2.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sc2.schedule('s1', '0 * * * *');
      const stats = sc2.getStats();
      expect(stats.schedules).toBe(1);
    });

    it('should count active', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.disable(id);
      expect(sc2.getStats().inactive).toBe(1);
    });

    it('should count total runs', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getStats().totalRuns).toBe(1);
    });

    it('should count total hits', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sc2.schedule('s1', '0 * * * *');
      sc2.schedule('s2', '0 * * * *');
      expect(sc2.getStats().uniqueNames).toBe(2);
    });

    it('should count unique crons', () => {
      sc2.schedule('s1', '0 * * * *');
      sc2.schedule('s2', '0 0 * * *');
      expect(sc2.getStats().uniqueCrons).toBe(2);
    });

    it('should compute avg runs', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getStats().avgRuns).toBe(1);
    });

    it('should get max runs', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      sc2.run(id);
      expect(sc2.getStats().maxRuns).toBe(2);
    });

    it('should get min runs', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getStats().minRuns).toBe(0);
    });

    it('should compute avg cron length', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getStats().avgCronLength).toBe(9);
    });

    it('should compute enabled rate', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getStats().enabledRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get schedule', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getSchedule('sc2-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getAllSchedules()).toHaveLength(1);
    });

    it('should remove', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.removeSchedule('sc2-1')).toBe(true);
    });

    it('should check existence', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.hasSchedule('sc2-1')).toBe(true);
    });

    it('should count', () => {
      expect(sc2.getCount()).toBe(0);
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getName('sc2-1')).toBe('s1');
    });

    it('should get cron', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getCron('sc2-1')).toBe('0 * * * *');
    });

    it('should get cron length', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getCronLength('sc2-1')).toBe(9);
    });

    it('should get history', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getHistory('sc2-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set name', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.setName('sc2-1', 's2')).toBe(true);
    });

    it('should set cron', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.setCron('sc2-1', '0 0 * * *')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sc2.setName('unknown', 's')).toBe(false);
      expect(sc2.setCron('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      sc2.resetAll();
      expect(sc2.getRuns(id)).toBe(0);
    });
  });

  // ============================================================
  // by name / cron / state
  // ============================================================
  describe('by name / cron / state', () => {
    it('should get by name', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getByName('s1')).toHaveLength(1);
    });

    it('should get by cron', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getByCron('0 * * * *')).toHaveLength(1);
    });

    it('should get active', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getActiveSchedules()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sc2.schedule('s1', '0 * * * *');
      sc2.disable('sc2-1');
      expect(sc2.getInactiveSchedules()).toHaveLength(1);
    });

    it('should get all names', () => {
      sc2.schedule('s1', '0 * * * *');
      sc2.schedule('s2', '0 0 * * *');
      expect(sc2.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getNameCount()).toBe(1);
    });

    it('should get by min runs', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getByMinRuns(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most runs', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      sc2.run(id);
      expect(sc2.getMostRuns()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sc2.getMostRuns()).toBeNull();
    });

    it('should get newest', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getNewest()?.id).toBe('sc2-1');
    });

    it('should return null for empty newest', () => {
      expect(sc2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getOldest()?.id).toBe('sc2-1');
    });

    it('should return null for empty oldest', () => {
      expect(sc2.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sc2.schedule('s1', '0 * * * *');
      expect(sc2.getCreatedAt('sc2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total runs', () => {
      const id = sc2.schedule('s1', '0 * * * *');
      sc2.run(id);
      expect(sc2.getTotalRuns()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many schedules', () => {
      for (let i = 0; i < 50; i++) {
        sc2.schedule(`s${i}`, '0 * * * *');
      }
      expect(sc2.getCount()).toBe(50);
    });
  });
});