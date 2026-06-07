/**
 * ScaleEngine Tests
 * thunderbolt-design Scale Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScaleEngine } from '../ScaleEngine';

describe('ScaleEngine', () => {
  let see: ScaleEngine;

  beforeEach(() => {
    see = new ScaleEngine();
  });

  afterEach(() => {
    see.clearAll();
  });

  describe('add / scale / setAuto / remove', () => {
    it('should add', () => {
      expect(see.add('s1', 100)).toMatch(/^see-/);
    });

    it('should default direction to none', () => {
      see.add('s1', 100);
      expect(see.getDirection(see.getAllUnits()[0].id)).toBe('none');
    });

    it('should mark as active', () => {
      see.add('s1', 100);
      expect(see.isActive(see.getAllUnits()[0].id)).toBe(true);
    });

    it('should scale up', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      expect(see.scale(id, 80)).toBe(true);
    });

    it('should set up direction', () => {
      const id = see.add('s1', 100);
      see.scale(id, 80);
      expect(see.isUp(id)).toBe(true);
    });

    it('should scale down', () => {
      const id = see.add('s1', 100);
      see.scale(id, 80);
      expect(see.scale(id, 50)).toBe(true);
    });

    it('should set down direction', () => {
      const id = see.add('s1', 100);
      see.scale(id, 80);
      see.scale(id, 50);
      expect(see.isDown(id)).toBe(true);
    });

    it('should set auto direction', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      see.scale(id, 50);
      expect(see.isAuto(id)).toBe(true);
    });

    it('should not scale inactive', () => {
      const id = see.add('s1', 100);
      see.setActive(id, false);
      expect(see.scale(id, 50)).toBe(false);
    });

    it('should return false for unknown scale', () => {
      expect(see.scale('unknown', 50)).toBe(false);
    });

    it('should set auto', () => {
      const id = see.add('s1', 100);
      expect(see.setAuto(id)).toBe(true);
    });

    it('should return false for unknown setAuto', () => {
      expect(see.setAuto('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = see.add('s1', 100);
      expect(see.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      see.add('s1', 100);
      expect(see.getStats().units).toBe(1);
    });

    it('should count total added', () => {
      see.add('s1', 100);
      expect(see.getStats().totalAdded).toBe(1);
    });

    it('should count total scaled', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      expect(see.getStats().totalScaled).toBe(1);
    });

    it('should count up', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      see.scale(id, 80);
      expect(see.getStats().up).toBe(1);
    });

    it('should count down', () => {
      const id = see.add('s1', 100);
      see.scale(id, 80);
      see.scale(id, 50);
      expect(see.getStats().down).toBe(1);
    });

    it('should count none', () => {
      see.add('s1', 100);
      expect(see.getStats().none).toBe(1);
    });

    it('should count active', () => {
      see.add('s1', 100);
      expect(see.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = see.add('s1', 100);
      see.setActive(id, false);
      expect(see.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      expect(see.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      see.add('a', 100);
      see.add('a', 100);
      expect(see.getStats().uniqueNames).toBe(1);
    });

    it('should count total capacity', () => {
      see.add('s1', 100);
      expect(see.getStats().totalCapacity).toBe(100);
    });
  });

  describe('queries', () => {
    it('should get unit', () => {
      const id = see.add('s1', 100);
      expect(see.getUnit(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      see.add('s1', 100);
      expect(see.getAllUnits()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = see.add('s1', 100);
      expect(see.hasUnit(id)).toBe(true);
    });

    it('should count', () => {
      expect(see.getCount()).toBe(0);
      see.add('s1', 100);
      expect(see.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = see.add('s1', 100);
      expect(see.getName(id)).toBe('s1');
    });

    it('should get capacity', () => {
      const id = see.add('s1', 100);
      expect(see.getCapacity(id)).toBe(100);
    });

    it('should get current', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      expect(see.getCurrent(id)).toBe(50);
    });

    it('should get hits', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      expect(see.getHits(id)).toBe(1);
    });

    it('should check up', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      see.scale(id, 80);
      expect(see.isUp(id)).toBe(true);
    });

    it('should check down', () => {
      const id = see.add('s1', 100);
      see.scale(id, 80);
      see.scale(id, 50);
      expect(see.isDown(id)).toBe(true);
    });

    it('should check auto', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      see.scale(id, 50);
      expect(see.isAuto(id)).toBe(true);
    });

    it('should check none', () => {
      see.add('s1', 100);
      expect(see.isNone(see.getAllUnits()[0].id)).toBe(true);
    });

    it('should check at capacity', () => {
      const id = see.add('s1', 100);
      see.scale(id, 100);
      expect(see.isAtCapacity(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = see.add('s1', 100);
      expect(see.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = see.add('s1', 100);
      expect(see.setName(id, 's2')).toBe(true);
    });

    it('should set capacity', () => {
      const id = see.add('s1', 100);
      expect(see.setCapacity(id, 200)).toBe(true);
    });

    it('should set current', () => {
      const id = see.add('s1', 100);
      expect(see.setCurrent(id, 50)).toBe(true);
    });

    it('should set direction', () => {
      const id = see.add('s1', 100);
      expect(see.setDirection(id, 'up')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(see.setActive('unknown', false)).toBe(false);
      expect(see.setName('unknown', 's')).toBe(false);
      expect(see.setCapacity('unknown', 1)).toBe(false);
      expect(see.setCurrent('unknown', 1)).toBe(false);
      expect(see.setDirection('unknown', 'up')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      see.setActive(id, false);
      see.resetAll();
      expect(see.getCurrent(id)).toBe(0);
      expect(see.isActive(id)).toBe(true);
    });
  });

  describe('by direction / state', () => {
    it('should get by direction', () => {
      see.add('s1', 100);
      expect(see.getByDirection('none')).toHaveLength(1);
    });

    it('should get active', () => {
      see.add('s1', 100);
      expect(see.getActiveUnits()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = see.add('s1', 100);
      see.setActive(id, false);
      expect(see.getInactiveUnits()).toHaveLength(1);
    });

    it('should get all names', () => {
      see.add('a', 100);
      see.add('b', 100);
      expect(see.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      see.add('s1', 100);
      expect(see.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(see.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      see.add('s1', 100);
      expect(see.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(see.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = see.add('s1', 100);
      expect(see.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      expect(see.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      see.add('s1', 100);
      expect(see.getTotalAdded()).toBe(1);
    });

    it('should get total scaled', () => {
      const id = see.add('s1', 100);
      see.scale(id, 50);
      expect(see.getTotalScaled()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many units', () => {
      for (let i = 0; i < 50; i++) {
        see.add(`s${i}`, 100);
      }
      expect(see.getCount()).toBe(50);
    });
  });
});