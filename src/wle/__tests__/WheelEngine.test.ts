/**
 * WheelEngine Tests
 * claude-code-design Wheel Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WheelEngine } from '../WheelEngine';

describe('WheelEngine', () => {
  let wle: WheelEngine;

  beforeEach(() => {
    wle = new WheelEngine();
  });

  afterEach(() => {
    wle.clearAll();
  });

  describe('addOption / spin / remove', () => {
    it('should add option', () => {
      expect(wle.addOption('o1', 'number', 1)).toMatch(/^wle-/);
    });

    it('should default spun to 0', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getSpun(wle.getAllOptions()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.isActive(wle.getAllOptions()[0].id)).toBe(true);
    });

    it('should spin', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.spin(id)).toBe(true);
    });

    it('should increment spun', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.spin(id);
      expect(wle.getSpun(id)).toBe(1);
    });

    it('should not spin inactive', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.setActive(id, false);
      expect(wle.spin(id)).toBe(false);
    });

    it('should return false for unknown spin', () => {
      expect(wle.spin('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getStats().options).toBe(1);
    });

    it('should count total added', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getStats().totalAdded).toBe(1);
    });

    it('should count total spun', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.spin(id);
      expect(wle.getStats().totalSpun).toBe(1);
    });

    it('should count number', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getStats().number).toBe(1);
    });

    it('should count string', () => {
      wle.addOption('o1', 'string', 1);
      expect(wle.getStats().string).toBe(1);
    });

    it('should count boolean', () => {
      wle.addOption('o1', 'boolean', 1);
      expect(wle.getStats().boolean).toBe(1);
    });

    it('should count object', () => {
      wle.addOption('o1', 'object', 1);
      expect(wle.getStats().object).toBe(1);
    });

    it('should count active', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.setActive(id, false);
      expect(wle.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.spin(id);
      expect(wle.getStats().totalHits).toBe(1);
    });

    it('should count unique labels', () => {
      wle.addOption('a', 'number', 1);
      wle.addOption('a', 'number', 1);
      expect(wle.getStats().uniqueLabels).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get option', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.getOption(id)?.label).toBe('o1');
    });

    it('should get all', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getAllOptions()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.hasOption(id)).toBe(true);
    });

    it('should count', () => {
      expect(wle.getCount()).toBe(0);
      wle.addOption('o1', 'number', 1);
      expect(wle.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get label', () => {
      const id = wle.addOption('hello', 'number', 1);
      expect(wle.getLabel(id)).toBe('hello');
    });

    it('should get type', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.getType(id)).toBe('number');
    });

    it('should get weight', () => {
      const id = wle.addOption('o1', 'number', 5);
      expect(wle.getWeight(id)).toBe(5);
    });

    it('should get hits', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.spin(id);
      expect(wle.getHits(id)).toBe(1);
    });

    it('should check number', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.isNumber(wle.getAllOptions()[0].id)).toBe(true);
    });

    it('should check string', () => {
      wle.addOption('o1', 'string', 1);
      expect(wle.isString(wle.getAllOptions()[0].id)).toBe(true);
    });

    it('should check boolean', () => {
      wle.addOption('o1', 'boolean', 1);
      expect(wle.isBoolean(wle.getAllOptions()[0].id)).toBe(true);
    });

    it('should check object', () => {
      wle.addOption('o1', 'object', 1);
      expect(wle.isObject(wle.getAllOptions()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.setActive(id, false)).toBe(true);
    });

    it('should set label', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.setLabel(id, 'o2')).toBe(true);
    });

    it('should set type', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.setType(id, 'string')).toBe(true);
    });

    it('should set weight', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.setWeight(id, 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wle.setActive('unknown', false)).toBe(false);
      expect(wle.setLabel('unknown', 'o')).toBe(false);
      expect(wle.setType('unknown', 'number')).toBe(false);
      expect(wle.setWeight('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.spin(id);
      wle.setActive(id, false);
      wle.resetAll();
      expect(wle.getSpun(id)).toBe(0);
      expect(wle.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getByType('number')).toHaveLength(1);
    });

    it('should get active', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getActiveOptions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.setActive(id, false);
      expect(wle.getInactiveOptions()).toHaveLength(1);
    });

    it('should get all labels', () => {
      wle.addOption('a', 'number', 1);
      wle.addOption('b', 'number', 1);
      expect(wle.getAllLabels()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getNewest()?.label).toBe('o1');
    });

    it('should return null for empty newest', () => {
      expect(wle.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getOldest()?.label).toBe('o1');
    });

    it('should return null for empty oldest', () => {
      expect(wle.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = wle.addOption('o1', 'number', 1);
      expect(wle.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.spin(id);
      expect(wle.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      wle.addOption('o1', 'number', 1);
      expect(wle.getTotalAdded()).toBe(1);
    });

    it('should get total spun', () => {
      const id = wle.addOption('o1', 'number', 1);
      wle.spin(id);
      expect(wle.getTotalSpun()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many options', () => {
      for (let i = 0; i < 50; i++) {
        wle.addOption(`o${i}`, 'number', 1);
      }
      expect(wle.getCount()).toBe(50);
    });
  });
});