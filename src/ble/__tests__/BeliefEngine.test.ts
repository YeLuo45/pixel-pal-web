/**
 * BeliefEngine Tests
 * generic-agent-design Belief Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BeliefEngine } from '../BeliefEngine';

describe('BeliefEngine', () => {
  let ble: BeliefEngine;

  beforeEach(() => {
    ble = new BeliefEngine();
  });

  afterEach(() => {
    ble.clearAll();
  });

  describe('add / revise / remove', () => {
    it('should add', () => {
      expect(ble.add('b1', 'sky is blue', 'moderate', 0.7)).toMatch(/^ble-/);
    });

    it('should mark as active', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.isActive(ble.getAllBeliefs()[0].id)).toBe(true);
    });

    it('should clamp confidence to 0-1', () => {
      ble.add('b1', 'sky is blue', 'moderate', 2.0);
      expect(ble.getConfidence(ble.getAllBeliefs()[0].id)).toBe(1);
    });

    it('should revise', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.revise(id, 0.9)).toBe(true);
    });

    it('should not revise inactive', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.setActive(id, false);
      expect(ble.revise(id, 0.9)).toBe(false);
    });

    it('should return false for unknown revise', () => {
      expect(ble.revise('unknown', 0.9)).toBe(false);
    });

    it('should remove', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getStats().beliefs).toBe(1);
    });

    it('should count total added', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getStats().totalAdded).toBe(1);
    });

    it('should count total revised', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.revise(id, 0.9);
      expect(ble.getStats().totalRevised).toBe(1);
    });

    it('should count weak', () => {
      ble.add('b1', 'sky is blue', 'weak', 0.3);
      expect(ble.getStats().weak).toBe(1);
    });

    it('should count moderate', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getStats().moderate).toBe(1);
    });

    it('should count strong', () => {
      ble.add('b1', 'sky is blue', 'strong', 0.9);
      expect(ble.getStats().strong).toBe(1);
    });

    it('should count absolute', () => {
      ble.add('b1', 'sky is blue', 'absolute', 1.0);
      expect(ble.getStats().absolute).toBe(1);
    });

    it('should count active', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.setActive(id, false);
      expect(ble.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.revise(id, 0.9);
      expect(ble.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ble.add('a', 'sky is blue', 'moderate', 0.7);
      ble.add('a', 'sky is blue', 'moderate', 0.7);
      expect(ble.getStats().uniqueNames).toBe(1);
    });

    it('should count total confidence', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getStats().totalConfidence).toBe(0.7);
    });
  });

  describe('queries', () => {
    it('should get belief', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getBelief(id)?.name).toBe('b1');
    });

    it('should get all', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getAllBeliefs()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.hasBelief(id)).toBe(true);
    });

    it('should count', () => {
      expect(ble.getCount()).toBe(0);
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getName(id)).toBe('b1');
    });

    it('should get statement', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getStatement(id)).toBe('sky is blue');
    });

    it('should get strength', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getStrength(id)).toBe('moderate');
    });

    it('should get confidence', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getConfidence(id)).toBe(0.7);
    });

    it('should get hits', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.revise(id, 0.9);
      expect(ble.getHits(id)).toBe(1);
    });

    it('should check weak', () => {
      ble.add('b1', 'sky is blue', 'weak', 0.3);
      expect(ble.isWeak(ble.getAllBeliefs()[0].id)).toBe(true);
    });

    it('should check moderate', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.isModerate(ble.getAllBeliefs()[0].id)).toBe(true);
    });

    it('should check strong', () => {
      ble.add('b1', 'sky is blue', 'strong', 0.9);
      expect(ble.isStrong(ble.getAllBeliefs()[0].id)).toBe(true);
    });

    it('should check absolute', () => {
      ble.add('b1', 'sky is blue', 'absolute', 1.0);
      expect(ble.isAbsolute(ble.getAllBeliefs()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.setName(id, 'b2')).toBe(true);
    });

    it('should set statement', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.setStatement(id, 'grass is green')).toBe(true);
    });

    it('should set strength', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.setStrength(id, 'strong')).toBe(true);
    });

    it('should set confidence', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.setConfidence(id, 0.9)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ble.setActive('unknown', false)).toBe(false);
      expect(ble.setName('unknown', 'b')).toBe(false);
      expect(ble.setStatement('unknown', 's')).toBe(false);
      expect(ble.setStrength('unknown', 'weak')).toBe(false);
      expect(ble.setConfidence('unknown', 0.5)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.setActive(id, false);
      ble.resetAll();
      expect(ble.isActive(id)).toBe(true);
    });
  });

  describe('by strength / state', () => {
    it('should get by strength', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getByStrength('moderate')).toHaveLength(1);
    });

    it('should get active', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getActiveBeliefs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.setActive(id, false);
      expect(ble.getInactiveBeliefs()).toHaveLength(1);
    });

    it('should get all names', () => {
      ble.add('a', 'sky is blue', 'moderate', 0.7);
      ble.add('b', 'grass is green', 'moderate', 0.7);
      expect(ble.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getNewest()?.name).toBe('b1');
    });

    it('should return null for empty newest', () => {
      expect(ble.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getOldest()?.name).toBe('b1');
    });

    it('should return null for empty oldest', () => {
      expect(ble.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.revise(id, 0.9);
      expect(ble.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      ble.add('b1', 'sky is blue', 'moderate', 0.7);
      expect(ble.getTotalAdded()).toBe(1);
    });

    it('should get total revised', () => {
      const id = ble.add('b1', 'sky is blue', 'moderate', 0.7);
      ble.revise(id, 0.9);
      expect(ble.getTotalRevised()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many beliefs', () => {
      for (let i = 0; i < 50; i++) {
        ble.add(`b${i}`, 'sky is blue', 'moderate', 0.7);
      }
      expect(ble.getCount()).toBe(50);
    });
  });
});