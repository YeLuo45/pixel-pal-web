/**
 * ReflectionEngine Tests
 * generic-agent-design Reflection Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReflectionEngine } from '../ReflectionEngine';

describe('ReflectionEngine', () => {
  let rfe: ReflectionEngine;

  beforeEach(() => {
    rfe = new ReflectionEngine();
  });

  afterEach(() => {
    rfe.clearAll();
  });

  describe('reflect / learn / adapt / remove', () => {
    it('should reflect', () => {
      expect(rfe.reflect('s', 'l')).toBe('rfe-1');
    });

    it('should default status to pending', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getStatus('rfe-1')).toBe('pending');
    });

    it('should mark as active', () => {
      rfe.reflect('s', 'l');
      expect(rfe.isActive('rfe-1')).toBe(true);
    });

    it('should learn', () => {
      rfe.reflect('s', 'l');
      expect(rfe.learn('rfe-1')).toBe(true);
    });

    it('should return false for unknown learn', () => {
      expect(rfe.learn('unknown')).toBe(false);
    });

    it('should adapt after learn', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      expect(rfe.adapt('rfe-1')).toBe(true);
    });

    it('should not adapt without learn', () => {
      rfe.reflect('s', 'l');
      expect(rfe.adapt('rfe-1')).toBe(false);
    });

    it('should return false for unknown adapt', () => {
      expect(rfe.adapt('unknown')).toBe(false);
    });

    it('should remove', () => {
      rfe.reflect('s', 'l');
      expect(rfe.remove('rfe-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getStats().reflections).toBe(1);
    });

    it('should count total reflected', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      expect(rfe.getStats().totalReflected).toBe(1);
    });

    it('should count total adapted', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      rfe.adapt('rfe-1');
      expect(rfe.getStats().totalAdapted).toBe(1);
    });

    it('should count active', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      rfe.reflect('s', 'l');
      rfe.setActive('rfe-1', false);
      expect(rfe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      expect(rfe.getStats().totalHits).toBe(1);
    });

    it('should count unique situations', () => {
      rfe.reflect('a', 'l');
      rfe.reflect('a', 'l2');
      expect(rfe.getStats().uniqueSituations).toBe(1);
    });

    it('should count unique lessons', () => {
      rfe.reflect('s', 'a');
      rfe.reflect('s2', 'a');
      expect(rfe.getStats().uniqueLessons).toBe(1);
    });

    it('should count pending', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getStats().pending).toBe(1);
    });

    it('should count reflected', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      expect(rfe.getStats().reflected).toBe(1);
    });

    it('should count adapted', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      rfe.adapt('rfe-1');
      expect(rfe.getStats().adapted).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get reflection', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getReflection('rfe-1')?.situation).toBe('s');
    });

    it('should get all', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getAllReflections()).toHaveLength(1);
    });

    it('should check existence', () => {
      rfe.reflect('s', 'l');
      expect(rfe.hasReflection('rfe-1')).toBe(true);
    });

    it('should count', () => {
      expect(rfe.getCount()).toBe(0);
      rfe.reflect('s', 'l');
      expect(rfe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get situation', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getSituation('rfe-1')).toBe('s');
    });

    it('should get lesson', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getLesson('rfe-1')).toBe('l');
    });

    it('should get hits', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      expect(rfe.getHits('rfe-1')).toBe(1);
    });

    it('should check reflected', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      expect(rfe.isReflected('rfe-1')).toBe(true);
    });

    it('should check adapted', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      rfe.adapt('rfe-1');
      expect(rfe.isAdapted('rfe-1')).toBe(true);
    });

    it('should check pending', () => {
      rfe.reflect('s', 'l');
      expect(rfe.isPending('rfe-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      rfe.reflect('s', 'l');
      expect(rfe.setActive('rfe-1', false)).toBe(true);
    });

    it('should set situation', () => {
      rfe.reflect('s', 'l');
      expect(rfe.setSituation('rfe-1', 's2')).toBe(true);
    });

    it('should set lesson', () => {
      rfe.reflect('s', 'l');
      expect(rfe.setLesson('rfe-1', 'l2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rfe.setActive('unknown', false)).toBe(false);
      expect(rfe.setSituation('unknown', 's')).toBe(false);
      expect(rfe.setLesson('unknown', 'l')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      rfe.setActive('rfe-1', false);
      rfe.resetAll();
      expect(rfe.getStatus('rfe-1')).toBe('pending');
      expect(rfe.isActive('rfe-1')).toBe(true);
    });
  });

  describe('by status / situation / state', () => {
    it('should get by status', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getByStatus('pending')).toHaveLength(1);
    });

    it('should get by situation', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getBySituation('s')).toHaveLength(1);
    });

    it('should get active', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getActiveReflections()).toHaveLength(1);
    });

    it('should get inactive', () => {
      rfe.reflect('s', 'l');
      rfe.setActive('rfe-1', false);
      expect(rfe.getInactiveReflections()).toHaveLength(1);
    });

    it('should get all situations', () => {
      rfe.reflect('a', 'l');
      rfe.reflect('b', 'l');
      expect(rfe.getAllSituations()).toHaveLength(2);
    });

    it('should get all lessons', () => {
      rfe.reflect('s', 'a');
      rfe.reflect('s', 'b');
      expect(rfe.getAllLessons()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getNewest()?.id).toBe('rfe-1');
    });

    it('should return null for empty newest', () => {
      expect(rfe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getOldest()?.id).toBe('rfe-1');
    });

    it('should return null for empty oldest', () => {
      expect(rfe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      rfe.reflect('s', 'l');
      expect(rfe.getCreatedAt('rfe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      expect(rfe.getUpdatedAt('rfe-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total reflected', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      expect(rfe.getTotalReflected()).toBe(1);
    });

    it('should get total adapted', () => {
      rfe.reflect('s', 'l');
      rfe.learn('rfe-1');
      rfe.adapt('rfe-1');
      expect(rfe.getTotalAdapted()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many reflections', () => {
      for (let i = 0; i < 50; i++) {
        rfe.reflect(`s${i}`, `l${i}`);
      }
      expect(rfe.getCount()).toBe(50);
    });
  });
});