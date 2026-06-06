/**
 * BeliefUpdater Tests
 * generic-agent-design Belief Updater
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BeliefUpdater } from '../BeliefUpdater';

describe('BeliefUpdater', () => {
  let bu: BeliefUpdater;

  beforeEach(() => {
    bu = new BeliefUpdater();
  });

  afterEach(() => {
    bu.clearAll();
  });

  // ============================================================
  // define / update / merge
  // ============================================================
  describe('define / update / merge', () => {
    it('should define', () => {
      expect(bu.define('b1', 0.5)).toBe('bu-1');
    });

    it('should mark as active', () => {
      const id = bu.define('b1', 0.5);
      expect(bu.isActive(id)).toBe(true);
    });

    it('should update', () => {
      const id = bu.define('b1', 0.5);
      expect(bu.update(id, 0.8)).toBe(true);
    });

    it('should update value', () => {
      const id = bu.define('b1', 0.5);
      bu.update(id, 0.8);
      expect(bu.getValue(id)).toBe(0.8);
    });

    it('should increment updates', () => {
      const id = bu.define('b1', 0.5);
      bu.update(id, 0.8);
      expect(bu.getUpdates(id)).toBe(1);
    });

    it('should not update inactive', () => {
      const id = bu.define('b1', 0.5);
      bu.setActive(id, false);
      expect(bu.update(id, 0.8)).toBe(false);
    });

    it('should return false for unknown update', () => {
      expect(bu.update('unknown', 0.8)).toBe(false);
    });

    it('should merge', () => {
      const id1 = bu.define('b1', 0.4);
      const id2 = bu.define('b2', 0.6);
      expect(bu.merge(id1, id2)).toBe(0.5);
    });

    it('should update both beliefs on merge', () => {
      const id1 = bu.define('b1', 0.4);
      const id2 = bu.define('b2', 0.6);
      bu.merge(id1, id2);
      expect(bu.getValue(id1)).toBe(0.5);
      expect(bu.getValue(id2)).toBe(0.5);
    });

    it('should return 0 for unknown merge', () => {
      expect(bu.merge('unknown', 'other')).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      bu.define('b1', 0.5);
      const stats = bu.getStats();
      expect(stats.beliefs).toBe(1);
    });

    it('should count total updates', () => {
      const id = bu.define('b1', 0.5);
      bu.update(id, 0.8);
      expect(bu.getStats().totalUpdates).toBe(1);
    });

    it('should compute avg value', () => {
      bu.define('b1', 0.4);
      bu.define('b2', 0.6);
      expect(bu.getStats().avgValue).toBe(0.5);
    });

    it('should count total merges', () => {
      const id1 = bu.define('b1', 0.4);
      const id2 = bu.define('b2', 0.6);
      bu.merge(id1, id2);
      expect(bu.getStats().totalMerges).toBe(2);
    });

    it('should count total hits', () => {
      const id = bu.define('b1', 0.5);
      bu.touch(id);
      expect(bu.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      bu.define('b1', 0.5);
      expect(bu.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bu.define('b1', 0.5);
      bu.setActive(id, false);
      expect(bu.getStats().inactive).toBe(1);
    });

    it('should compute avg updates', () => {
      const id = bu.define('b1', 0.5);
      bu.update(id, 0.8);
      expect(bu.getStats().avgUpdates).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get belief', () => {
      bu.define('b1', 0.5);
      expect(bu.getBelief('bu-1')?.name).toBe('b1');
    });

    it('should get all', () => {
      bu.define('b1', 0.5);
      expect(bu.getAllBeliefs()).toHaveLength(1);
    });

    it('should remove', () => {
      bu.define('b1', 0.5);
      expect(bu.removeBelief('bu-1')).toBe(true);
    });

    it('should check existence', () => {
      bu.define('b1', 0.5);
      expect(bu.hasBelief('bu-1')).toBe(true);
    });

    it('should count', () => {
      expect(bu.getCount()).toBe(0);
      bu.define('b1', 0.5);
      expect(bu.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      bu.define('b1', 0.5);
      expect(bu.getName('bu-1')).toBe('b1');
    });

    it('should get value', () => {
      bu.define('b1', 0.5);
      expect(bu.getValue('bu-1')).toBe(0.5);
    });

    it('should get updates', () => {
      bu.define('b1', 0.5);
      expect(bu.getUpdates('bu-1')).toBe(0);
    });

    it('should get merged', () => {
      bu.define('b1', 0.5);
      expect(bu.getMerged('bu-1')).toBe(0);
    });

    it('should get history', () => {
      bu.define('b1', 0.5);
      expect(bu.getHistory('bu-1')).toEqual([0.5]);
    });

    it('should get hits', () => {
      const id = bu.define('b1', 0.5);
      bu.touch(id);
      expect(bu.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = bu.define('b1', 0.5);
      expect(bu.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = bu.define('b1', 0.5);
      expect(bu.setName(id, 'b2')).toBe(true);
    });

    it('should set value', () => {
      const id = bu.define('b1', 0.5);
      expect(bu.setValue(id, 0.8)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bu.setActive('unknown', false)).toBe(false);
      expect(bu.setName('unknown', 'b')).toBe(false);
      expect(bu.setValue('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      const id = bu.define('b1', 0.5);
      expect(bu.touch(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bu.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = bu.define('b1', 0.5);
      bu.update(id, 0.8);
      bu.touch(id);
      bu.setActive(id, false);
      bu.resetAll();
      expect(bu.getUpdates(id)).toBe(0);
      expect(bu.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      bu.define('b1', 0.5);
      expect(bu.getByName('b1')).toHaveLength(1);
    });

    it('should get active', () => {
      bu.define('b1', 0.5);
      expect(bu.getActiveBeliefs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bu.define('b1', 0.5);
      bu.setActive(id, false);
      expect(bu.getInactiveBeliefs()).toHaveLength(1);
    });

    it('should get all names', () => {
      bu.define('b1', 0.5);
      bu.define('b2', 0.5);
      expect(bu.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      bu.define('b1', 0.5);
      expect(bu.getNameCount()).toBe(1);
    });

    it('should get by min updates', () => {
      const id = bu.define('b1', 0.5);
      bu.update(id, 0.8);
      expect(bu.getByMinUpdates(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most updates', () => {
      const id = bu.define('b1', 0.5);
      bu.update(id, 0.8);
      expect(bu.getMostUpdates()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(bu.getMostUpdates()).toBeNull();
    });

    it('should get newest', () => {
      bu.define('b1', 0.5);
      expect(bu.getNewest()?.id).toBe('bu-1');
    });

    it('should return null for empty newest', () => {
      expect(bu.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bu.define('b1', 0.5);
      expect(bu.getOldest()?.id).toBe('bu-1');
    });

    it('should return null for empty oldest', () => {
      expect(bu.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      bu.define('b1', 0.5);
      expect(bu.getCreatedAt('bu-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bu.define('b1', 0.5);
      bu.update(id, 0.8);
      expect(bu.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many beliefs', () => {
      for (let i = 0; i < 50; i++) {
        bu.define(`b${i}`, 0.5);
      }
      expect(bu.getCount()).toBe(50);
    });
  });
});