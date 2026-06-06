/**
 * ExperimentEngine Tests
 * generic-agent-design Experiment Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExperimentEngine } from '../ExperimentEngine';

describe('ExperimentEngine', () => {
  let ee: ExperimentEngine;

  beforeEach(() => {
    ee = new ExperimentEngine();
  });

  afterEach(() => {
    ee.clearAll();
  });

  // ============================================================
  // design / run / addTrial
  // ============================================================
  describe('design / run / addTrial', () => {
    it('should design', () => {
      expect(ee.design('e1', 'h1')).toBe('ee-1');
    });

    it('should mark as pending', () => {
      const id = ee.design('e1', 'h1');
      expect(ee.isPending(id)).toBe(true);
    });

    it('should mark as active', () => {
      const id = ee.design('e1', 'h1');
      expect(ee.isActive(id)).toBe(true);
    });

    it('should run confirmed', () => {
      const id = ee.design('e1', 'h1');
      expect(ee.run(id, true)).toBe(true);
    });

    it('should mark as confirmed', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, true);
      expect(ee.isConfirmed(id)).toBe(true);
    });

    it('should mark as rejected', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, false);
      expect(ee.isRejected(id)).toBe(true);
    });

    it('should not run twice', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, true);
      expect(ee.run(id, false)).toBe(false);
    });

    it('should not run inactive', () => {
      const id = ee.design('e1', 'h1');
      ee.setActive(id, false);
      expect(ee.run(id, true)).toBe(false);
    });

    it('should return false for unknown run', () => {
      expect(ee.run('unknown', true)).toBe(false);
    });

    it('should add trial', () => {
      const id = ee.design('e1', 'h1');
      expect(ee.addTrial(id)).toBe(true);
    });

    it('should increment trials', () => {
      const id = ee.design('e1', 'h1');
      ee.addTrial(id);
      expect(ee.getTrials(id)).toBe(1);
    });

    it('should not add trial inactive', () => {
      const id = ee.design('e1', 'h1');
      ee.setActive(id, false);
      expect(ee.addTrial(id)).toBe(false);
    });

    it('should return false for unknown addTrial', () => {
      expect(ee.addTrial('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, true);
      expect(ee.reset(id)).toBe(true);
    });

    it('should mark as pending on reset', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, true);
      ee.reset(id);
      expect(ee.isPending(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(ee.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ee.design('e1', 'h1');
      const stats = ee.getStats();
      expect(stats.experiments).toBe(1);
    });

    it('should count confirmed', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, true);
      expect(ee.getStats().confirmed).toBe(1);
    });

    it('should count rejected', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, false);
      expect(ee.getStats().rejected).toBe(1);
    });

    it('should count pending', () => {
      ee.design('e1', 'h1');
      expect(ee.getStats().pending).toBe(1);
    });

    it('should count active', () => {
      ee.design('e1', 'h1');
      expect(ee.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ee.design('e1', 'h1');
      ee.setActive(id, false);
      expect(ee.getStats().inactive).toBe(1);
    });

    it('should count total trials', () => {
      const id = ee.design('e1', 'h1');
      ee.addTrial(id);
      expect(ee.getStats().totalTrials).toBe(1);
    });

    it('should compute avg trials', () => {
      const id = ee.design('e1', 'h1');
      ee.addTrial(id);
      expect(ee.getStats().avgTrials).toBe(1);
    });

    it('should count total hits', () => {
      const id = ee.design('e1', 'h1');
      ee.addTrial(id);
      expect(ee.getStats().totalHits).toBe(1);
    });

    it('should compute confirm rate', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, true);
      expect(ee.getStats().confirmRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get experiment', () => {
      ee.design('e1', 'h1');
      expect(ee.getExperiment('ee-1')?.name).toBe('e1');
    });

    it('should get all', () => {
      ee.design('e1', 'h1');
      expect(ee.getAllExperiments()).toHaveLength(1);
    });

    it('should remove', () => {
      ee.design('e1', 'h1');
      expect(ee.removeExperiment('ee-1')).toBe(true);
    });

    it('should check existence', () => {
      ee.design('e1', 'h1');
      expect(ee.hasExperiment('ee-1')).toBe(true);
    });

    it('should count', () => {
      expect(ee.getCount()).toBe(0);
      ee.design('e1', 'h1');
      expect(ee.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ee.design('e1', 'h1');
      expect(ee.getName('ee-1')).toBe('e1');
    });

    it('should get hypothesis', () => {
      ee.design('e1', 'h1');
      expect(ee.getHypothesis('ee-1')).toBe('h1');
    });

    it('should get result', () => {
      ee.design('e1', 'h1');
      expect(ee.getResult('ee-1')).toBe('pending');
    });

    it('should get trials', () => {
      ee.design('e1', 'h1');
      expect(ee.getTrials('ee-1')).toBe(0);
    });

    it('should get history', () => {
      ee.design('e1', 'h1');
      expect(ee.getHistory('ee-1')).toEqual(['pending']);
    });

    it('should get hits', () => {
      const id = ee.design('e1', 'h1');
      ee.addTrial(id);
      expect(ee.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ee.design('e1', 'h1');
      expect(ee.setActive('ee-1', false)).toBe(true);
    });

    it('should set name', () => {
      ee.design('e1', 'h1');
      expect(ee.setName('ee-1', 'e2')).toBe(true);
    });

    it('should set hypothesis', () => {
      ee.design('e1', 'h1');
      expect(ee.setHypothesis('ee-1', 'h2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ee.setActive('unknown', false)).toBe(false);
      expect(ee.setName('unknown', 'e')).toBe(false);
      expect(ee.setHypothesis('unknown', 'h')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ee.design('e1', 'h1');
      ee.run(id, true);
      ee.setActive(id, false);
      ee.resetAll();
      expect(ee.isPending(id)).toBe(true);
      expect(ee.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      ee.design('e1', 'h1');
      expect(ee.getByName('e1')).toHaveLength(1);
    });

    it('should get by result', () => {
      ee.design('e1', 'h1');
      expect(ee.getByResult('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      ee.design('e1', 'h1');
      expect(ee.getActiveExperiments()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ee.design('e1', 'h1');
      ee.setActive('ee-1', false);
      expect(ee.getInactiveExperiments()).toHaveLength(1);
    });

    it('should get all names', () => {
      ee.design('e1', 'h1');
      ee.design('e2', 'h1');
      expect(ee.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ee.design('e1', 'h1');
      expect(ee.getNameCount()).toBe(1);
    });

    it('should get by min trials', () => {
      const id = ee.design('e1', 'h1');
      ee.addTrial(id);
      expect(ee.getByMinTrials(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most trials', () => {
      const id = ee.design('e1', 'h1');
      ee.addTrial(id);
      ee.addTrial(id);
      expect(ee.getMostTrials()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ee.getMostTrials()).toBeNull();
    });

    it('should get newest', () => {
      ee.design('e1', 'h1');
      expect(ee.getNewest()?.id).toBe('ee-1');
    });

    it('should return null for empty newest', () => {
      expect(ee.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ee.design('e1', 'h1');
      expect(ee.getOldest()?.id).toBe('ee-1');
    });

    it('should return null for empty oldest', () => {
      expect(ee.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ee.design('e1', 'h1');
      expect(ee.getCreatedAt('ee-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ee.design('e1', 'h1');
      ee.addTrial(id);
      expect(ee.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many experiments', () => {
      for (let i = 0; i < 50; i++) {
        ee.design(`e${i}`, `h${i}`);
      }
      expect(ee.getCount()).toBe(50);
    });
  });
});