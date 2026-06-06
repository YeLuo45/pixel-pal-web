/**
 * ReflectionEngine Tests
 * generic-agent-design Reflection Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReflectionEngine } from '../ReflectionEngine';

describe('ReflectionEngine', () => {
  let re: ReflectionEngine;

  beforeEach(() => {
    re = new ReflectionEngine();
  });

  afterEach(() => {
    re.clearAll();
  });

  // ============================================================
  // record / apply / analyze
  // ============================================================
  describe('record / apply / analyze', () => {
    it('should record', () => {
      expect(re.record('trigger', 'insight')).toBe('ref-1');
    });

    it('should set initial score to 0', () => {
      const id = re.record('trigger', 'insight');
      expect(re.getScore(id)).toBe(0);
    });

    it('should apply', () => {
      const id = re.record('trigger', 'insight');
      expect(re.apply(id, 0.8)).toBe(true);
    });

    it('should not apply inactive', () => {
      const id = re.record('trigger', 'insight');
      re.setActive(id, false);
      expect(re.apply(id, 0.8)).toBe(false);
    });

    it('should clamp apply score', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 1.5);
      expect(re.getScore(id)).toBe(1);
    });

    it('should return false for unknown apply', () => {
      expect(re.apply('unknown', 0.5)).toBe(false);
    });

    it('should analyze', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.8);
      const analysis = re.analyze();
      expect(analysis.topInsight).toBe('insight');
    });

    it('should return empty analysis', () => {
      const analysis = re.analyze();
      expect(analysis.topInsight).toBe('');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      re.record('trigger', 'insight');
      const stats = re.getStats();
      expect(stats.reflections).toBe(1);
    });

    it('should count total applied', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.5);
      expect(re.getStats().totalApplied).toBe(1);
    });

    it('should compute avg score', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.5);
      expect(re.getStats().avgScore).toBe(0.5);
    });

    it('should count total hits', () => {
      const id = re.record('trigger', 'insight');
      re.touch(id);
      expect(re.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      re.record('trigger', 'insight');
      expect(re.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = re.record('trigger', 'insight');
      re.setActive(id, false);
      expect(re.getStats().inactive).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get reflection', () => {
      re.record('trigger', 'insight');
      expect(re.getReflection('ref-1')?.trigger).toBe('trigger');
    });

    it('should get all', () => {
      re.record('trigger', 'insight');
      expect(re.getAllReflections()).toHaveLength(1);
    });

    it('should remove', () => {
      re.record('trigger', 'insight');
      expect(re.removeReflection('ref-1')).toBe(true);
    });

    it('should check existence', () => {
      re.record('trigger', 'insight');
      expect(re.hasReflection('ref-1')).toBe(true);
    });

    it('should count', () => {
      expect(re.getCount()).toBe(0);
      re.record('trigger', 'insight');
      expect(re.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get trigger', () => {
      re.record('trigger', 'insight');
      expect(re.getTrigger('ref-1')).toBe('trigger');
    });

    it('should get insight', () => {
      re.record('trigger', 'insight');
      expect(re.getInsight('ref-1')).toBe('insight');
    });

    it('should get score', () => {
      re.record('trigger', 'insight');
      expect(re.getScore('ref-1')).toBe(0);
    });

    it('should get applied', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.5);
      expect(re.getApplied(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = re.record('trigger', 'insight');
      re.touch(id);
      expect(re.getHits(id)).toBe(1);
    });

    it('should check isActive', () => {
      re.record('trigger', 'insight');
      expect(re.isActive('ref-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = re.record('trigger', 'insight');
      expect(re.setActive(id, false)).toBe(true);
    });

    it('should set trigger', () => {
      const id = re.record('trigger', 'insight');
      expect(re.setTrigger(id, 'new')).toBe(true);
    });

    it('should set insight', () => {
      const id = re.record('trigger', 'insight');
      expect(re.setInsight(id, 'new')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(re.setActive('unknown', false)).toBe(false);
      expect(re.setTrigger('unknown', 't')).toBe(false);
      expect(re.setInsight('unknown', 'i')).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      const id = re.record('trigger', 'insight');
      expect(re.touch(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(re.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.5);
      re.touch(id);
      re.setActive(id, false);
      re.resetAll();
      expect(re.getScore(id)).toBe(0);
      expect(re.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by trigger / state
  // ============================================================
  describe('by trigger / state', () => {
    it('should get by trigger', () => {
      re.record('trigger', 'insight');
      expect(re.getByTrigger('trigger')).toHaveLength(1);
    });

    it('should get active', () => {
      re.record('trigger', 'insight');
      expect(re.getActiveReflections()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = re.record('trigger', 'insight');
      re.setActive(id, false);
      expect(re.getInactiveReflections()).toHaveLength(1);
    });

    it('should get all triggers', () => {
      re.record('trigger1', 'insight');
      re.record('trigger2', 'insight');
      expect(re.getAllTriggers()).toHaveLength(2);
    });

    it('should get trigger count', () => {
      re.record('trigger', 'insight');
      expect(re.getTriggerCount()).toBe(1);
    });

    it('should get by min score', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.8);
      expect(re.getByMinScore(0.5)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most applied', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.5);
      expect(re.getMostApplied()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(re.getMostApplied()).toBeNull();
    });

    it('should get highest score', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.8);
      expect(re.getHighestScore()?.id).toBe(id);
    });

    it('should return null for empty highest', () => {
      expect(re.getHighestScore()).toBeNull();
    });

    it('should get newest', () => {
      re.record('trigger', 'insight');
      expect(re.getNewest()?.id).toBe('ref-1');
    });

    it('should return null for empty newest', () => {
      expect(re.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      re.record('trigger', 'insight');
      expect(re.getOldest()?.id).toBe('ref-1');
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
      re.record('trigger', 'insight');
      expect(re.getCreatedAt('ref-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = re.record('trigger', 'insight');
      re.apply(id, 0.5);
      expect(re.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many reflections', () => {
      for (let i = 0; i < 50; i++) {
        re.record(`trigger${i}`, `insight${i}`);
      }
      expect(re.getCount()).toBe(50);
    });
  });
});