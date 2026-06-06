/**
 * HabitEngine Tests
 * generic-agent-design Habit Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HabitEngine } from '../HabitEngine';

describe('HabitEngine', () => {
  let he: HabitEngine;

  beforeEach(() => {
    he = new HabitEngine();
  });

  afterEach(() => {
    he.clearAll();
  });

  // ============================================================
  // define / complete / breakHabit / reset
  // ============================================================
  describe('define / complete / breakHabit / reset', () => {
    it('should define', () => {
      expect(he.define('h1', 'daily')).toBe('he2-1');
    });

    it('should mark as active', () => {
      const id = he.define('h1', 'daily');
      expect(he.isActive(id)).toBe(true);
    });

    it('should mark as not completed', () => {
      const id = he.define('h1', 'daily');
      expect(he.isCompleted(id)).toBe(false);
    });

    it('should mark as daily by default', () => {
      const id = he.define('h1');
      expect(he.isDaily(id)).toBe(true);
    });

    it('should mark as weekly', () => {
      const id = he.define('h1', 'weekly');
      expect(he.isWeekly(id)).toBe(true);
    });

    it('should mark as monthly', () => {
      const id = he.define('h1', 'monthly');
      expect(he.isMonthly(id)).toBe(true);
    });

    it('should complete', () => {
      const id = he.define('h1', 'daily');
      expect(he.complete(id)).toBe(true);
    });

    it('should increment streak on complete', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getStreak(id)).toBe(1);
    });

    it('should mark as completed on complete', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.isCompleted(id)).toBe(true);
    });

    it('should log history on complete', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getHistory(id)).toHaveLength(1);
    });

    it('should not complete inactive', () => {
      const id = he.define('h1', 'daily');
      he.setActive(id, false);
      expect(he.complete(id)).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(he.complete('unknown')).toBe(false);
    });

    it('should break habit', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.breakHabit(id)).toBe(true);
    });

    it('should mark as not completed on break', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      he.breakHabit(id);
      expect(he.isCompleted(id)).toBe(false);
    });

    it('should return false for unknown breakHabit', () => {
      expect(he.breakHabit('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      he.reset(id);
      expect(he.getStreak(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(he.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      he.define('h1', 'daily');
      const stats = he.getStats();
      expect(stats.habits).toBe(1);
    });

    it('should count total completions', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getStats().totalCompletions).toBe(1);
    });

    it('should count total streak', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getStats().totalStreak).toBe(1);
    });

    it('should count daily', () => {
      he.define('h1', 'daily');
      expect(he.getStats().daily).toBe(1);
    });

    it('should count weekly', () => {
      he.define('h1', 'weekly');
      expect(he.getStats().weekly).toBe(1);
    });

    it('should count monthly', () => {
      he.define('h1', 'monthly');
      expect(he.getStats().monthly).toBe(1);
    });

    it('should count active', () => {
      he.define('h1', 'daily');
      expect(he.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = he.define('h1', 'daily');
      he.setActive(id, false);
      expect(he.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      he.define('h1', 'daily');
      he.define('h2', 'weekly');
      expect(he.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg streak', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getStats().avgStreak).toBe(1);
    });

    it('should get max streak', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      he.complete(id);
      expect(he.getStats().maxStreak).toBe(2);
    });

    it('should get min streak', () => {
      he.define('h1', 'daily');
      expect(he.getStats().minStreak).toBe(0);
    });

    it('should compute completion rate', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getStats().completionRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get habit', () => {
      he.define('h1', 'daily');
      expect(he.getHabit('he2-1')?.name).toBe('h1');
    });

    it('should get all', () => {
      he.define('h1', 'daily');
      expect(he.getAllHabits()).toHaveLength(1);
    });

    it('should remove', () => {
      he.define('h1', 'daily');
      expect(he.removeHabit('he2-1')).toBe(true);
    });

    it('should check existence', () => {
      he.define('h1', 'daily');
      expect(he.hasHabit('he2-1')).toBe(true);
    });

    it('should count', () => {
      expect(he.getCount()).toBe(0);
      he.define('h1', 'daily');
      expect(he.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      he.define('h1', 'daily');
      expect(he.getName('he2-1')).toBe('h1');
    });

    it('should get frequency', () => {
      he.define('h1', 'daily');
      expect(he.getFrequency('he2-1')).toBe('daily');
    });

    it('should get completions', () => {
      he.define('h1', 'daily');
      expect(he.getCompletions('he2-1')).toBe(0);
    });

    it('should get history', () => {
      he.define('h1', 'daily');
      expect(he.getHistory('he2-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      he.define('h1', 'daily');
      expect(he.setActive('he2-1', false)).toBe(true);
    });

    it('should set name', () => {
      he.define('h1', 'daily');
      expect(he.setName('he2-1', 'h2')).toBe(true);
    });

    it('should set frequency', () => {
      he.define('h1', 'daily');
      expect(he.setFrequency('he2-1', 'weekly')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(he.setActive('unknown', false)).toBe(false);
      expect(he.setName('unknown', 'h')).toBe(false);
      expect(he.setFrequency('unknown', 'daily')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      he.setActive(id, false);
      he.resetAll();
      expect(he.getStreak(id)).toBe(0);
      expect(he.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / frequency / state
  // ============================================================
  describe('by name / frequency / state', () => {
    it('should get by name', () => {
      he.define('h1', 'daily');
      expect(he.getByName('h1')).toHaveLength(1);
    });

    it('should get by frequency', () => {
      he.define('h1', 'daily');
      expect(he.getByFrequency('daily')).toHaveLength(1);
    });

    it('should get daily', () => {
      he.define('h1', 'daily');
      expect(he.getDailyHabits()).toHaveLength(1);
    });

    it('should get weekly', () => {
      he.define('h1', 'weekly');
      expect(he.getWeeklyHabits()).toHaveLength(1);
    });

    it('should get monthly', () => {
      he.define('h1', 'monthly');
      expect(he.getMonthlyHabits()).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getCompletedHabits()).toHaveLength(1);
    });

    it('should get active', () => {
      he.define('h1', 'daily');
      expect(he.getActiveHabits()).toHaveLength(1);
    });

    it('should get inactive', () => {
      he.define('h1', 'daily');
      he.setActive('he2-1', false);
      expect(he.getInactiveHabits()).toHaveLength(1);
    });

    it('should get all names', () => {
      he.define('h1', 'daily');
      he.define('h2', 'weekly');
      expect(he.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      he.define('h1', 'daily');
      expect(he.getNameCount()).toBe(1);
    });

    it('should get by min streak', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getByMinStreak(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most streak', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      he.complete(id);
      expect(he.getMostStreak()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(he.getMostStreak()).toBeNull();
    });

    it('should get newest', () => {
      he.define('h1', 'daily');
      expect(he.getNewest()?.id).toBe('he2-1');
    });

    it('should return null for empty newest', () => {
      expect(he.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      he.define('h1', 'daily');
      expect(he.getOldest()?.id).toBe('he2-1');
    });

    it('should return null for empty oldest', () => {
      expect(he.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      he.define('h1', 'daily');
      expect(he.getCreatedAt('he2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total completions', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getTotalCompletions()).toBe(1);
    });

    it('should get total streak', () => {
      const id = he.define('h1', 'daily');
      he.complete(id);
      expect(he.getTotalStreak()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many habits', () => {
      for (let i = 0; i < 50; i++) {
        he.define(`h${i}`, 'daily');
      }
      expect(he.getCount()).toBe(50);
    });
  });
});