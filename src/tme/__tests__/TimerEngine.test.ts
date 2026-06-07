/**
 * TimerEngine Tests
 * chatdev-design Timer Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TimerEngine } from '../TimerEngine';

describe('TimerEngine', () => {
  let tme: TimerEngine;

  beforeEach(() => {
    tme = new TimerEngine();
  });

  afterEach(() => {
    tme.clearAll();
  });

  describe('create / tick / pause / resume / stop / remove', () => {
    it('should create', () => {
      expect(tme.create('t1', 100)).toMatch(/^tme-/);
    });

    it('should default status to running', () => {
      tme.create('t1', 100);
      expect(tme.getStatus(tme.getAllTimers()[0].id)).toBe('running');
    });

    it('should mark as active', () => {
      tme.create('t1', 100);
      expect(tme.isActive(tme.getAllTimers()[0].id)).toBe(true);
    });

    it('should tick', () => {
      const id = tme.create('t1', 100);
      expect(tme.tick(id, 10)).toBe(true);
    });

    it('should increment elapsed', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getElapsed(id)).toBe(10);
    });

    it('should finish when elapsed equals duration', () => {
      const id = tme.create('t1', 10);
      tme.tick(id, 10);
      expect(tme.isFinished(id)).toBe(true);
    });

    it('should not tick on paused', () => {
      const id = tme.create('t1', 100);
      tme.pause(id);
      expect(tme.tick(id, 10)).toBe(false);
    });

    it('should not tick on finished', () => {
      const id = tme.create('t1', 1);
      tme.tick(id, 1);
      expect(tme.tick(id, 1)).toBe(false);
    });

    it('should not tick inactive', () => {
      const id = tme.create('t1', 100);
      tme.setActive(id, false);
      expect(tme.tick(id, 10)).toBe(false);
    });

    it('should return false for unknown tick', () => {
      expect(tme.tick('unknown', 10)).toBe(false);
    });

    it('should pause', () => {
      const id = tme.create('t1', 100);
      expect(tme.pause(id)).toBe(true);
    });

    it('should not pause finished', () => {
      const id = tme.create('t1', 1);
      tme.tick(id, 1);
      expect(tme.pause(id)).toBe(false);
    });

    it('should resume', () => {
      const id = tme.create('t1', 100);
      tme.pause(id);
      expect(tme.resume(id)).toBe(true);
    });

    it('should not resume running', () => {
      const id = tme.create('t1', 100);
      expect(tme.resume(id)).toBe(false);
    });

    it('should stop', () => {
      const id = tme.create('t1', 100);
      expect(tme.stop(id)).toBe(true);
    });

    it('should remove', () => {
      const id = tme.create('t1', 100);
      expect(tme.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      tme.create('t1', 100);
      expect(tme.getStats().timers).toBe(1);
    });

    it('should count total created', () => {
      tme.create('t1', 100);
      expect(tme.getStats().totalCreated).toBe(1);
    });

    it('should count total ticked', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getStats().totalTicked).toBe(1);
    });

    it('should count total stopped', () => {
      const id = tme.create('t1', 100);
      tme.stop(id);
      expect(tme.getStats().totalStopped).toBe(1);
    });

    it('should count running', () => {
      tme.create('t1', 100);
      expect(tme.getStats().running).toBe(1);
    });

    it('should count paused', () => {
      const id = tme.create('t1', 100);
      tme.pause(id);
      expect(tme.getStats().paused).toBe(1);
    });

    it('should count finished', () => {
      const id = tme.create('t1', 1);
      tme.tick(id, 1);
      expect(tme.getStats().finished).toBe(1);
    });

    it('should count active', () => {
      tme.create('t1', 100);
      expect(tme.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tme.create('t1', 100);
      tme.setActive(id, false);
      expect(tme.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      tme.create('a', 100);
      tme.create('a', 100);
      expect(tme.getStats().uniqueNames).toBe(1);
    });

    it('should count total duration', () => {
      tme.create('t1', 100);
      expect(tme.getStats().totalDuration).toBe(100);
    });

    it('should count total elapsed', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getStats().totalElapsed).toBe(10);
    });
  });

  describe('queries', () => {
    it('should get timer', () => {
      const id = tme.create('t1', 100);
      expect(tme.getTimer(id)?.name).toBe('t1');
    });

    it('should get all', () => {
      tme.create('t1', 100);
      expect(tme.getAllTimers()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = tme.create('t1', 100);
      expect(tme.hasTimer(id)).toBe(true);
    });

    it('should count', () => {
      expect(tme.getCount()).toBe(0);
      tme.create('t1', 100);
      expect(tme.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = tme.create('t1', 100);
      expect(tme.getName(id)).toBe('t1');
    });

    it('should get duration', () => {
      const id = tme.create('t1', 100);
      expect(tme.getDuration(id)).toBe(100);
    });

    it('should get remaining', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getRemaining(id)).toBe(90);
    });

    it('should get progress', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getProgress(id)).toBe(0.1);
    });

    it('should get hits', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getHits(id)).toBe(1);
    });

    it('should check running', () => {
      tme.create('t1', 100);
      expect(tme.isRunning(tme.getAllTimers()[0].id)).toBe(true);
    });

    it('should check paused', () => {
      const id = tme.create('t1', 100);
      tme.pause(id);
      expect(tme.isPaused(id)).toBe(true);
    });

    it('should check finished', () => {
      const id = tme.create('t1', 1);
      tme.tick(id, 1);
      expect(tme.isFinished(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = tme.create('t1', 100);
      expect(tme.setActive(id, false)).toBe(true);
    });

    it('should set duration', () => {
      const id = tme.create('t1', 100);
      expect(tme.setDuration(id, 200)).toBe(true);
    });

    it('should set elapsed', () => {
      const id = tme.create('t1', 100);
      expect(tme.setElapsed(id, 50)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tme.setActive('unknown', false)).toBe(false);
      expect(tme.setDuration('unknown', 1)).toBe(false);
      expect(tme.setElapsed('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 50);
      tme.setActive(id, false);
      tme.resetAll();
      expect(tme.getElapsed(id)).toBe(0);
      expect(tme.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      tme.create('t1', 100);
      expect(tme.getByStatus('running')).toHaveLength(1);
    });

    it('should get active', () => {
      tme.create('t1', 100);
      expect(tme.getActiveTimers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = tme.create('t1', 100);
      tme.setActive(id, false);
      expect(tme.getInactiveTimers()).toHaveLength(1);
    });

    it('should get all names', () => {
      tme.create('a', 100);
      tme.create('b', 100);
      expect(tme.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      tme.create('t1', 100);
      expect(tme.getNewest()?.name).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(tme.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tme.create('t1', 100);
      expect(tme.getOldest()?.name).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(tme.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = tme.create('t1', 100);
      expect(tme.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total created', () => {
      tme.create('t1', 100);
      expect(tme.getTotalCreated()).toBe(1);
    });

    it('should get total ticked', () => {
      const id = tme.create('t1', 100);
      tme.tick(id, 10);
      expect(tme.getTotalTicked()).toBe(1);
    });

    it('should get total stopped', () => {
      const id = tme.create('t1', 100);
      tme.stop(id);
      expect(tme.getTotalStopped()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many timers', () => {
      for (let i = 0; i < 50; i++) {
        tme.create(`t${i}`, 100);
      }
      expect(tme.getCount()).toBe(50);
    });
  });
});