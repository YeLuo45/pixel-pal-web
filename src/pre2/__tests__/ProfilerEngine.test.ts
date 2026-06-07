/**
 * ProfilerEngine Tests
 * claude-code-design Profiler Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfilerEngine } from '../ProfilerEngine';

describe('ProfilerEngine', () => {
  let pre2: ProfilerEngine;

  beforeEach(() => {
    pre2 = new ProfilerEngine();
  });

  afterEach(() => {
    pre2.clearAll();
  });

  describe('start / stop / profile / remove', () => {
    it('should start', () => {
      expect(pre2.start('p1')).toMatch(/^pre2-/);
    });

    it('should default type to cpu', () => {
      pre2.start('p1');
      expect(pre2.getType(pre2.getAllProfiles()[0].id)).toBe('cpu');
    });

    it('should mark as active', () => {
      pre2.start('p1');
      expect(pre2.isActive(pre2.getAllProfiles()[0].id)).toBe(true);
    });

    it('should stop', () => {
      const id = pre2.start('p1');
      expect(pre2.stop(id, 100)).toBe(true);
    });

    it('should set duration on stop', () => {
      const id = pre2.start('p1');
      pre2.stop(id, 100);
      expect(pre2.getDuration(id)).toBe(100);
    });

    it('should not stop inactive', () => {
      const id = pre2.start('p1');
      pre2.setActive(id, false);
      expect(pre2.stop(id, 100)).toBe(false);
    });

    it('should return false for unknown stop', () => {
      expect(pre2.stop('unknown', 100)).toBe(false);
    });

    it('should profile', () => {
      const id = pre2.start('p1');
      expect(pre2.profile(id)).toBe(true);
    });

    it('should not profile inactive', () => {
      const id = pre2.start('p1');
      pre2.setActive(id, false);
      expect(pre2.profile(id)).toBe(false);
    });

    it('should return false for unknown profile', () => {
      expect(pre2.profile('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = pre2.start('p1');
      expect(pre2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      pre2.start('p1');
      expect(pre2.getStats().profiles).toBe(1);
    });

    it('should count total started', () => {
      pre2.start('p1');
      expect(pre2.getStats().totalStarted).toBe(1);
    });

    it('should count total stopped', () => {
      const id = pre2.start('p1');
      pre2.stop(id, 100);
      expect(pre2.getStats().totalStopped).toBe(1);
    });

    it('should count total profiled', () => {
      const id = pre2.start('p1');
      pre2.profile(id);
      expect(pre2.getStats().totalProfiled).toBe(1);
    });

    it('should count cpu', () => {
      pre2.start('p1', 'cpu');
      expect(pre2.getStats().cpu).toBe(1);
    });

    it('should count memory', () => {
      pre2.start('p1', 'memory');
      expect(pre2.getStats().memory).toBe(1);
    });

    it('should count network', () => {
      pre2.start('p1', 'network');
      expect(pre2.getStats().network).toBe(1);
    });

    it('should count disk', () => {
      pre2.start('p1', 'disk');
      expect(pre2.getStats().disk).toBe(1);
    });

    it('should count active', () => {
      pre2.start('p1');
      expect(pre2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pre2.start('p1');
      pre2.setActive(id, false);
      expect(pre2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pre2.start('p1');
      pre2.stop(id, 100);
      expect(pre2.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pre2.start('a');
      pre2.start('a');
      expect(pre2.getStats().uniqueNames).toBe(1);
    });

    it('should count total duration', () => {
      const id = pre2.start('p1');
      pre2.stop(id, 100);
      expect(pre2.getStats().totalDuration).toBe(100);
    });
  });

  describe('queries', () => {
    it('should get profile', () => {
      const id = pre2.start('p1');
      expect(pre2.getProfile(id)?.name).toBe('p1');
    });

    it('should get all', () => {
      pre2.start('p1');
      expect(pre2.getAllProfiles()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = pre2.start('p1');
      expect(pre2.hasProfile(id)).toBe(true);
    });

    it('should count', () => {
      expect(pre2.getCount()).toBe(0);
      pre2.start('p1');
      expect(pre2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = pre2.start('p1');
      expect(pre2.getName(id)).toBe('p1');
    });

    it('should get hits', () => {
      const id = pre2.start('p1');
      pre2.stop(id, 100);
      expect(pre2.getHits(id)).toBe(1);
    });

    it('should check CPU', () => {
      pre2.start('p1', 'cpu');
      expect(pre2.isCPU(pre2.getAllProfiles()[0].id)).toBe(true);
    });

    it('should check Memory', () => {
      pre2.start('p1', 'memory');
      expect(pre2.isMemory(pre2.getAllProfiles()[0].id)).toBe(true);
    });

    it('should check Network', () => {
      pre2.start('p1', 'network');
      expect(pre2.isNetwork(pre2.getAllProfiles()[0].id)).toBe(true);
    });

    it('should check Disk', () => {
      pre2.start('p1', 'disk');
      expect(pre2.isDisk(pre2.getAllProfiles()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = pre2.start('p1');
      expect(pre2.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = pre2.start('p1');
      expect(pre2.setName(id, 'p2')).toBe(true);
    });

    it('should set type', () => {
      const id = pre2.start('p1');
      expect(pre2.setType(id, 'memory')).toBe(true);
    });

    it('should set duration', () => {
      const id = pre2.start('p1');
      expect(pre2.setDuration(id, 50)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pre2.setActive('unknown', false)).toBe(false);
      expect(pre2.setName('unknown', 'p')).toBe(false);
      expect(pre2.setType('unknown', 'cpu')).toBe(false);
      expect(pre2.setDuration('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = pre2.start('p1');
      pre2.stop(id, 100);
      pre2.setActive(id, false);
      pre2.resetAll();
      expect(pre2.getDuration(id)).toBe(0);
      expect(pre2.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      pre2.start('p1', 'memory');
      expect(pre2.getByType('memory')).toHaveLength(1);
    });

    it('should get active', () => {
      pre2.start('p1');
      expect(pre2.getActiveProfiles()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = pre2.start('p1');
      pre2.setActive(id, false);
      expect(pre2.getInactiveProfiles()).toHaveLength(1);
    });

    it('should get all names', () => {
      pre2.start('a');
      pre2.start('b');
      expect(pre2.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      pre2.start('p1');
      expect(pre2.getNewest()?.name).toBe('p1');
    });

    it('should return null for empty newest', () => {
      expect(pre2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pre2.start('p1');
      expect(pre2.getOldest()?.name).toBe('p1');
    });

    it('should return null for empty oldest', () => {
      expect(pre2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = pre2.start('p1');
      expect(pre2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pre2.start('p1');
      pre2.stop(id, 100);
      expect(pre2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total started', () => {
      pre2.start('p1');
      expect(pre2.getTotalStarted()).toBe(1);
    });

    it('should get total stopped', () => {
      const id = pre2.start('p1');
      pre2.stop(id, 100);
      expect(pre2.getTotalStopped()).toBe(1);
    });

    it('should get total profiled', () => {
      const id = pre2.start('p1');
      pre2.profile(id);
      expect(pre2.getTotalProfiled()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many profiles', () => {
      for (let i = 0; i < 50; i++) {
        pre2.start(`p${i}`);
      }
      expect(pre2.getCount()).toBe(50);
    });
  });
});