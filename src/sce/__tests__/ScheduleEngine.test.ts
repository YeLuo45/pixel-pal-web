/**
 * ScheduleEngine Tests
 * chatdev-design Schedule Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScheduleEngine } from '../ScheduleEngine';

describe('ScheduleEngine', () => {
  let sce: ScheduleEngine;

  beforeEach(() => {
    sce = new ScheduleEngine();
  });

  afterEach(() => {
    sce.clearAll();
  });

  describe('schedule / run / reschedule / remove', () => {
    it('should schedule', () => {
      expect(sce.schedule('s1', '0 * * * *')).toMatch(/^sce-/);
    });

    it('should default status to pending', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getStatus(sce.getAllSchedules()[0].id)).toBe('pending');
    });

    it('should mark as active', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.isActive(sce.getAllSchedules()[0].id)).toBe(true);
    });

    it('should run', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.run(id)).toBe(true);
    });

    it('should increment runs', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.getRuns(id)).toBe(1);
    });

    it('should not run inactive', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.setActive(id, false);
      expect(sce.run(id)).toBe(false);
    });

    it('should return false for unknown run', () => {
      expect(sce.run('unknown')).toBe(false);
    });

    it('should reschedule', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.reschedule(id, Date.now() + 60000)).toBe(true);
    });

    it('should return false for unknown reschedule', () => {
      expect(sce.reschedule('unknown', 1)).toBe(false);
    });

    it('should mark due', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.markDue(id)).toBe(true);
    });

    it('should mark overdue', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.markOverdue(id)).toBe(true);
    });

    it('should return false for unknown markDue', () => {
      expect(sce.markDue('unknown')).toBe(false);
    });

    it('should return false for unknown markOverdue', () => {
      expect(sce.markOverdue('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getStats().schedules).toBe(1);
    });

    it('should count total scheduled', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getStats().totalScheduled).toBe(1);
    });

    it('should count total run', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.getStats().totalRun).toBe(1);
    });

    it('should count total rescheduled', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.reschedule(id, 1);
      expect(sce.getStats().totalRescheduled).toBe(1);
    });

    it('should count pending', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getStats().pending).toBe(1);
    });

    it('should count due', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.markDue(id);
      expect(sce.getStats().due).toBe(1);
    });

    it('should count overdue', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.markOverdue(id);
      expect(sce.getStats().overdue).toBe(1);
    });

    it('should count completed', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.getStats().completed).toBe(1);
    });

    it('should count active', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.setActive(id, false);
      expect(sce.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sce.schedule('a', '0 * * * *');
      sce.schedule('a', '0 * * * *');
      expect(sce.getStats().uniqueNames).toBe(1);
    });

    it('should count unique crons', () => {
      sce.schedule('a', '0 * * * *');
      sce.schedule('a', '0 * * * *');
      expect(sce.getStats().uniqueCrons).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get schedule', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.getSchedule(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getAllSchedules()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.hasSchedule(id)).toBe(true);
    });

    it('should count', () => {
      expect(sce.getCount()).toBe(0);
      sce.schedule('s1', '0 * * * *');
      expect(sce.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.getName(id)).toBe('s1');
    });

    it('should get cron', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.getCron(id)).toBe('0 * * * *');
    });

    it('should get last run', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.getLastRun(id)).toBeGreaterThan(0);
    });

    it('should get next run', () => {
      const id = sce.schedule('s1', '0 * * * *', 12345);
      expect(sce.getNextRun(id)).toBe(12345);
    });

    it('should get hits', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.getHits(id)).toBe(1);
    });

    it('should check pending', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.isPending(sce.getAllSchedules()[0].id)).toBe(true);
    });

    it('should check due', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.markDue(id);
      expect(sce.isDue(id)).toBe(true);
    });

    it('should check overdue', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.markOverdue(id);
      expect(sce.isOverdue(id)).toBe(true);
    });

    it('should check completed', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.isCompleted(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.setName(id, 's2')).toBe(true);
    });

    it('should set cron', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.setCron(id, '0 0 * * *')).toBe(true);
    });

    it('should set next run', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.setNextRun(id, 12345)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sce.setActive('unknown', false)).toBe(false);
      expect(sce.setName('unknown', 's')).toBe(false);
      expect(sce.setCron('unknown', 'c')).toBe(false);
      expect(sce.setNextRun('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      sce.setActive(id, false);
      sce.resetAll();
      expect(sce.getRuns(id)).toBe(0);
      expect(sce.isActive(id)).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should validate correct cron', () => {
      expect(sce.isValid('0 * * * *')).toBe(true);
    });

    it('should invalidate wrong number of parts', () => {
      expect(sce.isValid('0 * * *')).toBe(false);
    });

    it('should invalidate garbage', () => {
      expect(sce.isValid('garbage')).toBe(false);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getActiveSchedules()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.setActive(id, false);
      expect(sce.getInactiveSchedules()).toHaveLength(1);
    });

    it('should get all names', () => {
      sce.schedule('a', '0 * * * *');
      sce.schedule('b', '0 * * * *');
      expect(sce.getAllNames()).toHaveLength(2);
    });

    it('should get all crons', () => {
      sce.schedule('s1', '0 * * * *');
      sce.schedule('s2', '0 0 * * *');
      expect(sce.getAllCrons()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(sce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(sce.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = sce.schedule('s1', '0 * * * *');
      expect(sce.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total scheduled', () => {
      sce.schedule('s1', '0 * * * *');
      expect(sce.getTotalScheduled()).toBe(1);
    });

    it('should get total run', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.run(id);
      expect(sce.getTotalRun()).toBe(1);
    });

    it('should get total rescheduled', () => {
      const id = sce.schedule('s1', '0 * * * *');
      sce.reschedule(id, 1);
      expect(sce.getTotalRescheduled()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many schedules', () => {
      for (let i = 0; i < 50; i++) {
        sce.schedule(`s${i}`, '0 * * * *');
      }
      expect(sce.getCount()).toBe(50);
    });
  });
});