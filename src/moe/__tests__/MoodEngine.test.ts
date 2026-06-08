/**
 * MoodEngine Tests
 * generic-agent-design Mood Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MoodEngine } from '../MoodEngine';

describe('MoodEngine', () => {
  let moe: MoodEngine;

  beforeEach(() => {
    moe = new MoodEngine();
  });

  afterEach(() => {
    moe.clearAll();
  });

  describe('add / shift / remove', () => {
    it('should add', () => {
      expect(moe.add('m1')).toMatch(/^moe-/);
    });

    it('should default state to neutral', () => {
      moe.add('m1');
      expect(moe.getState(moe.getAllEntries()[0].id)).toBe('neutral');
    });

    it('should mark as active', () => {
      moe.add('m1');
      expect(moe.isActive(moe.getAllEntries()[0].id)).toBe(true);
    });

    it('should shift', () => {
      const id = moe.add('m1');
      expect(moe.shift(id, 'happy', 8)).toBe(true);
    });

    it('should set state on shift', () => {
      const id = moe.add('m1');
      moe.shift(id, 'happy', 8);
      expect(moe.isHappy(id)).toBe(true);
    });

    it('should not shift inactive', () => {
      const id = moe.add('m1');
      moe.setActive(id, false);
      expect(moe.shift(id, 'happy', 8)).toBe(false);
    });

    it('should return false for unknown shift', () => {
      expect(moe.shift('unknown', 'happy', 8)).toBe(false);
    });

    it('should remove', () => {
      const id = moe.add('m1');
      expect(moe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      moe.add('m1');
      expect(moe.getStats().entries).toBe(1);
    });

    it('should count total added', () => {
      moe.add('m1');
      expect(moe.getStats().totalAdded).toBe(1);
    });

    it('should count total shifted', () => {
      const id = moe.add('m1');
      moe.shift(id, 'happy', 8);
      expect(moe.getStats().totalShifted).toBe(1);
    });

    it('should count happy', () => {
      const id = moe.add('m1');
      moe.shift(id, 'happy', 8);
      expect(moe.getStats().happy).toBe(1);
    });

    it('should count sad', () => {
      const id = moe.add('m1');
      moe.shift(id, 'sad', 8);
      expect(moe.getStats().sad).toBe(1);
    });

    it('should count angry', () => {
      const id = moe.add('m1');
      moe.shift(id, 'angry', 8);
      expect(moe.getStats().angry).toBe(1);
    });

    it('should count calm', () => {
      const id = moe.add('m1');
      moe.shift(id, 'calm', 8);
      expect(moe.getStats().calm).toBe(1);
    });

    it('should count excited', () => {
      const id = moe.add('m1');
      moe.shift(id, 'excited', 8);
      expect(moe.getStats().excited).toBe(1);
    });

    it('should count neutral', () => {
      moe.add('m1');
      expect(moe.getStats().neutral).toBe(1);
    });

    it('should count tired', () => {
      const id = moe.add('m1');
      moe.shift(id, 'tired', 8);
      expect(moe.getStats().tired).toBe(1);
    });

    it('should count curious', () => {
      const id = moe.add('m1');
      moe.shift(id, 'curious', 8);
      expect(moe.getStats().curious).toBe(1);
    });

    it('should count active', () => {
      moe.add('m1');
      expect(moe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = moe.add('m1');
      moe.setActive(id, false);
      expect(moe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = moe.add('m1');
      moe.shift(id, 'happy', 8);
      expect(moe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      moe.add('a');
      moe.add('a');
      expect(moe.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get entry', () => {
      const id = moe.add('m1');
      expect(moe.getEntry(id)?.name).toBe('m1');
    });

    it('should get all', () => {
      moe.add('m1');
      expect(moe.getAllEntries()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = moe.add('m1');
      expect(moe.hasEntry(id)).toBe(true);
    });

    it('should count', () => {
      expect(moe.getCount()).toBe(0);
      moe.add('m1');
      expect(moe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = moe.add('hello');
      expect(moe.getName(id)).toBe('hello');
    });

    it('should get intensity', () => {
      const id = moe.add('m1', 'happy', 8);
      expect(moe.getIntensity(id)).toBe(8);
    });

    it('should get hits', () => {
      const id = moe.add('m1');
      moe.shift(id, 'happy', 8);
      expect(moe.getHits(id)).toBe(1);
    });

    it('should check happy', () => {
      const id = moe.add('m1', 'happy', 8);
      expect(moe.isHappy(id)).toBe(true);
    });

    it('should check sad', () => {
      const id = moe.add('m1', 'sad', 8);
      expect(moe.isSad(id)).toBe(true);
    });

    it('should check angry', () => {
      const id = moe.add('m1', 'angry', 8);
      expect(moe.isAngry(id)).toBe(true);
    });

    it('should check calm', () => {
      const id = moe.add('m1', 'calm', 8);
      expect(moe.isCalm(id)).toBe(true);
    });

    it('should check excited', () => {
      const id = moe.add('m1', 'excited', 8);
      expect(moe.isExcited(id)).toBe(true);
    });

    it('should check tired', () => {
      const id = moe.add('m1', 'tired', 8);
      expect(moe.isTired(id)).toBe(true);
    });

    it('should check curious', () => {
      const id = moe.add('m1', 'curious', 8);
      expect(moe.isCurious(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = moe.add('m1');
      expect(moe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = moe.add('m1');
      expect(moe.setName(id, 'm2')).toBe(true);
    });

    it('should set state', () => {
      const id = moe.add('m1');
      expect(moe.setState(id, 'happy')).toBe(true);
    });

    it('should set intensity', () => {
      const id = moe.add('m1');
      expect(moe.setIntensity(id, 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(moe.setActive('unknown', false)).toBe(false);
      expect(moe.setName('unknown', 'm')).toBe(false);
      expect(moe.setState('unknown', 'happy')).toBe(false);
      expect(moe.setIntensity('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = moe.add('m1');
      moe.shift(id, 'happy', 8);
      moe.setActive(id, false);
      moe.resetAll();
      expect(moe.isNeutral(id)).toBe(true);
      expect(moe.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      moe.add('m1');
      expect(moe.getByState('neutral')).toHaveLength(1);
    });

    it('should get active', () => {
      moe.add('m1');
      expect(moe.getActiveEntries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = moe.add('m1');
      moe.setActive(id, false);
      expect(moe.getInactiveEntries()).toHaveLength(1);
    });

    it('should get all names', () => {
      moe.add('a');
      moe.add('b');
      expect(moe.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      moe.add('m1');
      expect(moe.getNewest()?.name).toBe('m1');
    });

    it('should return null for empty newest', () => {
      expect(moe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      moe.add('m1');
      expect(moe.getOldest()?.name).toBe('m1');
    });

    it('should return null for empty oldest', () => {
      expect(moe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = moe.add('m1');
      expect(moe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = moe.add('m1');
      moe.shift(id, 'happy', 8);
      expect(moe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      moe.add('m1');
      expect(moe.getTotalAdded()).toBe(1);
    });

    it('should get total shifted', () => {
      const id = moe.add('m1');
      moe.shift(id, 'happy', 8);
      expect(moe.getTotalShifted()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        moe.add(`m${i}`);
      }
      expect(moe.getCount()).toBe(50);
    });
  });
});