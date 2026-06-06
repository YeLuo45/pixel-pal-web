/**
 * RoutineEngine Tests
 * generic-agent-design Routine Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RoutineEngine } from '../RoutineEngine';

describe('RoutineEngine', () => {
  let re: RoutineEngine;

  beforeEach(() => {
    re = new RoutineEngine();
  });

  afterEach(() => {
    re.clearAll();
  });

  // ============================================================
  // define / execute / reset
  // ============================================================
  describe('define / execute / reset', () => {
    it('should define', () => {
      expect(re.define('r1', ['s1', 's2'])).toBe('re2-1');
    });

    it('should mark as active', () => {
      const id = re.define('r1', ['s1']);
      expect(re.isActive(id)).toBe(true);
    });

    it('should mark as not completed', () => {
      const id = re.define('r1', ['s1']);
      expect(re.isCompleted(id)).toBe(false);
    });

    it('should execute', () => {
      const id = re.define('r1', ['s1', 's2']);
      expect(re.execute(id)).toBe(true);
    });

    it('should increment runs on execute', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.getRuns(id)).toBe(1);
    });

    it('should advance current step on execute', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.getCurrentStep(id)).toBe(1);
    });

    it('should mark as completed at last step', () => {
      const id = re.define('r1', ['s1']);
      re.execute(id);
      expect(re.isCompleted(id)).toBe(true);
    });

    it('should not execute completed', () => {
      const id = re.define('r1', ['s1']);
      re.execute(id);
      expect(re.execute(id)).toBe(false);
    });

    it('should not execute inactive', () => {
      const id = re.define('r1', ['s1']);
      re.setActive(id, false);
      expect(re.execute(id)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(re.execute('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      re.reset(id);
      expect(re.getCurrentStep(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(re.reset('unknown')).toBe(false);
    });

    it('should get current step name', () => {
      const id = re.define('r1', ['s1', 's2']);
      expect(re.getCurrentStepName(id)).toBe('s1');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      re.define('r1', ['s1']);
      const stats = re.getStats();
      expect(stats.routines).toBe(1);
    });

    it('should count total runs', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.getStats().totalRuns).toBe(1);
    });

    it('should count total steps', () => {
      re.define('r1', ['s1', 's2']);
      re.define('r2', ['s1']);
      expect(re.getStats().totalSteps).toBe(3);
    });

    it('should count completed', () => {
      const id = re.define('r1', ['s1']);
      re.execute(id);
      expect(re.getStats().completed).toBe(1);
    });

    it('should count in progress', () => {
      re.define('r1', ['s1', 's2']);
      expect(re.getStats().inProgress).toBe(1);
    });

    it('should count active', () => {
      re.define('r1', ['s1']);
      expect(re.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = re.define('r1', ['s1']);
      re.setActive(id, false);
      expect(re.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      re.define('r1', ['s1']);
      re.define('r2', ['s1']);
      expect(re.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg steps', () => {
      re.define('r1', ['s1', 's2', 's3']);
      expect(re.getStats().avgSteps).toBe(3);
    });

    it('should get max steps', () => {
      re.define('r1', ['s1', 's2']);
      re.define('r2', ['s1', 's2', 's3', 's4']);
      expect(re.getStats().maxSteps).toBe(4);
    });

    it('should get min steps', () => {
      re.define('r1', ['s1', 's2']);
      re.define('r2', ['s1']);
      expect(re.getStats().minSteps).toBe(1);
    });

    it('should compute avg runs', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.getStats().avgRuns).toBe(1);
    });

    it('should compute completion rate', () => {
      const id = re.define('r1', ['s1']);
      re.execute(id);
      expect(re.getStats().completionRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get routine', () => {
      re.define('r1', ['s1']);
      expect(re.getRoutine('re2-1')?.name).toBe('r1');
    });

    it('should get all', () => {
      re.define('r1', ['s1']);
      expect(re.getAllRoutines()).toHaveLength(1);
    });

    it('should remove', () => {
      re.define('r1', ['s1']);
      expect(re.removeRoutine('re2-1')).toBe(true);
    });

    it('should check existence', () => {
      re.define('r1', ['s1']);
      expect(re.hasRoutine('re2-1')).toBe(true);
    });

    it('should count', () => {
      expect(re.getCount()).toBe(0);
      re.define('r1', ['s1']);
      expect(re.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      re.define('r1', ['s1']);
      expect(re.getName('re2-1')).toBe('r1');
    });

    it('should get steps', () => {
      re.define('r1', ['s1', 's2']);
      expect(re.getSteps('re2-1')).toEqual(['s1', 's2']);
    });

    it('should get step count', () => {
      re.define('r1', ['s1', 's2']);
      expect(re.getStepCount('re2-1')).toBe(2);
    });

    it('should get history', () => {
      re.define('r1', ['s1']);
      expect(re.getHistory('re2-1')).toEqual([0]);
    });

    it('should get hits', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      re.define('r1', ['s1']);
      expect(re.setActive('re2-1', false)).toBe(true);
    });

    it('should set name', () => {
      re.define('r1', ['s1']);
      expect(re.setName('re2-1', 'r2')).toBe(true);
    });

    it('should set steps', () => {
      re.define('r1', ['s1']);
      expect(re.setSteps('re2-1', ['x', 'y'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(re.setActive('unknown', false)).toBe(false);
      expect(re.setName('unknown', 'r')).toBe(false);
      expect(re.setSteps('unknown', [])).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      re.setActive(id, false);
      re.resetAll();
      expect(re.getCurrentStep(id)).toBe(0);
      expect(re.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      re.define('r1', ['s1']);
      expect(re.getByName('r1')).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = re.define('r1', ['s1']);
      re.execute(id);
      expect(re.getCompletedRoutines()).toHaveLength(1);
    });

    it('should get in progress', () => {
      re.define('r1', ['s1', 's2']);
      expect(re.getInProgressRoutines()).toHaveLength(1);
    });

    it('should get active', () => {
      re.define('r1', ['s1']);
      expect(re.getActiveRoutines()).toHaveLength(1);
    });

    it('should get inactive', () => {
      re.define('r1', ['s1']);
      re.setActive('re2-1', false);
      expect(re.getInactiveRoutines()).toHaveLength(1);
    });

    it('should get all names', () => {
      re.define('r1', ['s1']);
      re.define('r2', ['s1']);
      expect(re.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      re.define('r1', ['s1']);
      expect(re.getNameCount()).toBe(1);
    });

    it('should get by min steps', () => {
      re.define('r1', ['s1', 's2', 's3']);
      expect(re.getByMinSteps(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most steps', () => {
      re.define('r1', ['s1', 's2', 's3']);
      re.define('r2', ['s1']);
      expect(re.getMostSteps()?.id).toBe('re2-1');
    });

    it('should return null for empty most steps', () => {
      expect(re.getMostSteps()).toBeNull();
    });

    it('should get most runs', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      re.execute(id);
      expect(re.getMostRuns()?.id).toBe(id);
    });

    it('should return null for empty most runs', () => {
      expect(re.getMostRuns()).toBeNull();
    });

    it('should get newest', () => {
      re.define('r1', ['s1']);
      expect(re.getNewest()?.id).toBe('re2-1');
    });

    it('should return null for empty newest', () => {
      expect(re.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      re.define('r1', ['s1']);
      expect(re.getOldest()?.id).toBe('re2-1');
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
      re.define('r1', ['s1']);
      expect(re.getCreatedAt('re2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total runs', () => {
      const id = re.define('r1', ['s1', 's2']);
      re.execute(id);
      expect(re.getTotalRuns()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many routines', () => {
      for (let i = 0; i < 50; i++) {
        re.define(`r${i}`, ['s1', 's2']);
      }
      expect(re.getCount()).toBe(50);
    });
  });
});