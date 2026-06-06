/**
 * TriggerEngine Tests
 * generic-agent-design Trigger Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TriggerEngine } from '../TriggerEngine';

describe('TriggerEngine', () => {
  let tre: TriggerEngine;

  beforeEach(() => {
    tre = new TriggerEngine();
  });

  afterEach(() => {
    tre.clearAll();
  });

  // ============================================================
  // define / fire / enable / disable / reset
  // ============================================================
  describe('define / fire / enable / disable / reset', () => {
    it('should define', () => {
      expect(tre.define('t1', 'event')).toBe('tre-1');
    });

    it('should mark as active', () => {
      const id = tre.define('t1', 'event');
      expect(tre.isActive(id)).toBe(true);
    });

    it('should mark as enabled', () => {
      const id = tre.define('t1', 'event');
      expect(tre.isEnabled(id)).toBe(true);
    });

    it('should mark as event by default', () => {
      const id = tre.define('t1');
      expect(tre.isEvent(id)).toBe(true);
    });

    it('should mark as time', () => {
      const id = tre.define('t1', 'time');
      expect(tre.isTime(id)).toBe(true);
    });

    it('should mark as condition', () => {
      const id = tre.define('t1', 'condition');
      expect(tre.isCondition(id)).toBe(true);
    });

    it('should mark as manual', () => {
      const id = tre.define('t1', 'manual');
      expect(tre.isManual(id)).toBe(true);
    });

    it('should fire', () => {
      const id = tre.define('t1', 'event');
      expect(tre.fire(id)).toBe(true);
    });

    it('should increment fires on fire', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getFires(id)).toBe(1);
    });

    it('should set lastFire on fire', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getLastFire(id)).toBeGreaterThan(0);
    });

    it('should log history on fire', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getHistory(id)).toHaveLength(1);
    });

    it('should not fire disabled', () => {
      const id = tre.define('t1', 'event');
      tre.disable(id);
      expect(tre.fire(id)).toBe(false);
    });

    it('should not fire inactive', () => {
      const id = tre.define('t1', 'event');
      tre.setActive(id, false);
      expect(tre.fire(id)).toBe(false);
    });

    it('should return false for unknown fire', () => {
      expect(tre.fire('unknown')).toBe(false);
    });

    it('should enable', () => {
      const id = tre.define('t1', 'event');
      tre.disable(id);
      expect(tre.enable(id)).toBe(true);
    });

    it('should mark as enabled on enable', () => {
      const id = tre.define('t1', 'event');
      tre.disable(id);
      tre.enable(id);
      expect(tre.isEnabled(id)).toBe(true);
    });

    it('should not enable already enabled', () => {
      const id = tre.define('t1', 'event');
      expect(tre.enable(id)).toBe(false);
    });

    it('should return false for unknown enable', () => {
      expect(tre.enable('unknown')).toBe(false);
    });

    it('should disable', () => {
      const id = tre.define('t1', 'event');
      expect(tre.disable(id)).toBe(true);
    });

    it('should mark as disabled on disable', () => {
      const id = tre.define('t1', 'event');
      tre.disable(id);
      expect(tre.isDisabled(id)).toBe(true);
    });

    it('should not disable already disabled', () => {
      const id = tre.define('t1', 'event');
      tre.disable(id);
      expect(tre.disable(id)).toBe(false);
    });

    it('should return false for unknown disable', () => {
      expect(tre.disable('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      tre.reset(id);
      expect(tre.getFires(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(tre.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tre.define('t1', 'event');
      const stats = tre.getStats();
      expect(stats.triggers).toBe(1);
    });

    it('should count enabled', () => {
      tre.define('t1', 'event');
      expect(tre.getStats().enabled).toBe(1);
    });

    it('should count disabled', () => {
      const id = tre.define('t1', 'event');
      tre.disable(id);
      expect(tre.getStats().disabled).toBe(1);
    });

    it('should count total fires', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getStats().totalFires).toBe(1);
    });

    it('should count active', () => {
      tre.define('t1', 'event');
      expect(tre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tre.define('t1', 'event');
      tre.setActive(id, false);
      expect(tre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      tre.define('t1', 'event');
      tre.define('t2', 'event');
      expect(tre.getStats().uniqueNames).toBe(2);
    });

    it('should count unique types', () => {
      tre.define('t1', 'event');
      tre.define('t2', 'time');
      expect(tre.getStats().uniqueTypes).toBe(2);
    });

    it('should count event', () => {
      tre.define('t1', 'event');
      expect(tre.getStats().event).toBe(1);
    });

    it('should count time', () => {
      tre.define('t1', 'time');
      expect(tre.getStats().time).toBe(1);
    });

    it('should count condition', () => {
      tre.define('t1', 'condition');
      expect(tre.getStats().condition).toBe(1);
    });

    it('should count manual', () => {
      tre.define('t1', 'manual');
      expect(tre.getStats().manual).toBe(1);
    });

    it('should compute avg fires', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getStats().avgFires).toBe(1);
    });

    it('should get max fires', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      tre.fire(id);
      expect(tre.getStats().maxFires).toBe(2);
    });

    it('should get min fires', () => {
      tre.define('t1', 'event');
      expect(tre.getStats().minFires).toBe(0);
    });

    it('should compute enabled rate', () => {
      tre.define('t1', 'event');
      expect(tre.getStats().enabledRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get trigger', () => {
      tre.define('t1', 'event');
      expect(tre.getTrigger('tre-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      tre.define('t1', 'event');
      expect(tre.getAllTriggers()).toHaveLength(1);
    });

    it('should remove', () => {
      tre.define('t1', 'event');
      expect(tre.removeTrigger('tre-1')).toBe(true);
    });

    it('should check existence', () => {
      tre.define('t1', 'event');
      expect(tre.hasTrigger('tre-1')).toBe(true);
    });

    it('should count', () => {
      expect(tre.getCount()).toBe(0);
      tre.define('t1', 'event');
      expect(tre.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      tre.define('t1', 'event');
      expect(tre.getName('tre-1')).toBe('t1');
    });

    it('should get type', () => {
      tre.define('t1', 'event');
      expect(tre.getType('tre-1')).toBe('event');
    });

    it('should get history', () => {
      tre.define('t1', 'event');
      expect(tre.getHistory('tre-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      tre.define('t1', 'event');
      expect(tre.setActive('tre-1', false)).toBe(true);
    });

    it('should set name', () => {
      tre.define('t1', 'event');
      expect(tre.setName('tre-1', 't2')).toBe(true);
    });

    it('should set type', () => {
      tre.define('t1', 'event');
      expect(tre.setType('tre-1', 'time')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tre.setActive('unknown', false)).toBe(false);
      expect(tre.setName('unknown', 't')).toBe(false);
      expect(tre.setType('unknown', 'event')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      tre.setActive(id, false);
      tre.resetAll();
      expect(tre.getFires(id)).toBe(0);
      expect(tre.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / type / state
  // ============================================================
  describe('by name / type / state', () => {
    it('should get by name', () => {
      tre.define('t1', 'event');
      expect(tre.getByName('t1')).toHaveLength(1);
    });

    it('should get by type', () => {
      tre.define('t1', 'event');
      expect(tre.getByType('event')).toHaveLength(1);
    });

    it('should get event', () => {
      tre.define('t1', 'event');
      expect(tre.getEventTriggers()).toHaveLength(1);
    });

    it('should get time', () => {
      tre.define('t1', 'time');
      expect(tre.getTimeTriggers()).toHaveLength(1);
    });

    it('should get condition', () => {
      tre.define('t1', 'condition');
      expect(tre.getConditionTriggers()).toHaveLength(1);
    });

    it('should get manual', () => {
      tre.define('t1', 'manual');
      expect(tre.getManualTriggers()).toHaveLength(1);
    });

    it('should get enabled', () => {
      tre.define('t1', 'event');
      expect(tre.getEnabledTriggers()).toHaveLength(1);
    });

    it('should get disabled', () => {
      tre.define('t1', 'event');
      tre.disable('tre-1');
      expect(tre.getDisabledTriggers()).toHaveLength(1);
    });

    it('should get active', () => {
      tre.define('t1', 'event');
      expect(tre.getActiveTriggers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      tre.define('t1', 'event');
      tre.setActive('tre-1', false);
      expect(tre.getInactiveTriggers()).toHaveLength(1);
    });

    it('should get all names', () => {
      tre.define('t1', 'event');
      tre.define('t2', 'event');
      expect(tre.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      tre.define('t1', 'event');
      expect(tre.getNameCount()).toBe(1);
    });

    it('should get by min fires', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getByMinFires(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most fires', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      tre.fire(id);
      expect(tre.getMostFires()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(tre.getMostFires()).toBeNull();
    });

    it('should get newest', () => {
      tre.define('t1', 'event');
      expect(tre.getNewest()?.id).toBe('tre-1');
    });

    it('should return null for empty newest', () => {
      expect(tre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tre.define('t1', 'event');
      expect(tre.getOldest()?.id).toBe('tre-1');
    });

    it('should return null for empty oldest', () => {
      expect(tre.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tre.define('t1', 'event');
      expect(tre.getCreatedAt('tre-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total fires', () => {
      const id = tre.define('t1', 'event');
      tre.fire(id);
      expect(tre.getTotalFires()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many triggers', () => {
      for (let i = 0; i < 50; i++) {
        tre.define(`t${i}`, 'event');
      }
      expect(tre.getCount()).toBe(50);
    });
  });
});