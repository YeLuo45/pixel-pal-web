/**
 * WorkerEngine Tests
 * thunderbolt-design Worker Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkerEngine } from '../WorkerEngine';

describe('WorkerEngine', () => {
  let wke: WorkerEngine;

  beforeEach(() => {
    wke = new WorkerEngine();
  });

  afterEach(() => {
    wke.clearAll();
  });

  describe('spawn / process / done / fail / stop / remove', () => {
    it('should spawn', () => {
      expect(wke.spawn('w1')).toMatch(/^wke-/);
    });

    it('should default status to idle', () => {
      wke.spawn('w1');
      expect(wke.getStatus(wke.getAllWorkers()[0].id)).toBe('idle');
    });

    it('should mark as active', () => {
      wke.spawn('w1');
      expect(wke.isActive(wke.getAllWorkers()[0].id)).toBe(true);
    });

    it('should process', () => {
      const id = wke.spawn('w1');
      expect(wke.process(id)).toBe(true);
    });

    it('should increment processed', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.getProcessed(id)).toBe(1);
    });

    it('should set busy status', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.isBusy(id)).toBe(true);
    });

    it('should not process inactive', () => {
      const id = wke.spawn('w1');
      wke.setActive(id, false);
      expect(wke.process(id)).toBe(false);
    });

    it('should not process stopped', () => {
      const id = wke.spawn('w1');
      wke.stop(id);
      expect(wke.process(id)).toBe(false);
    });

    it('should return false for unknown process', () => {
      expect(wke.process('unknown')).toBe(false);
    });

    it('should done', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.done(id)).toBe(true);
    });

    it('should set idle after done', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      wke.done(id);
      expect(wke.isIdle(id)).toBe(true);
    });

    it('should return false for unknown done', () => {
      expect(wke.done('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = wke.spawn('w1');
      expect(wke.fail(id)).toBe(true);
    });

    it('should increment errors', () => {
      const id = wke.spawn('w1');
      wke.fail(id);
      expect(wke.getErrors(id)).toBe(1);
    });

    it('should set errored', () => {
      const id = wke.spawn('w1');
      wke.fail(id);
      expect(wke.isErrored(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(wke.fail('unknown')).toBe(false);
    });

    it('should stop', () => {
      const id = wke.spawn('w1');
      expect(wke.stop(id)).toBe(true);
    });

    it('should set stopped', () => {
      const id = wke.spawn('w1');
      wke.stop(id);
      expect(wke.isStopped(id)).toBe(true);
    });

    it('should return false for unknown stop', () => {
      expect(wke.stop('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = wke.spawn('w1');
      expect(wke.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      wke.spawn('w1');
      expect(wke.getStats().workers).toBe(1);
    });

    it('should count total spawned', () => {
      wke.spawn('w1');
      expect(wke.getStats().totalSpawned).toBe(1);
    });

    it('should count total processed', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.getStats().totalProcessed).toBe(1);
    });

    it('should count total errors', () => {
      const id = wke.spawn('w1');
      wke.fail(id);
      expect(wke.getStats().totalErrors).toBe(1);
    });

    it('should count total stopped', () => {
      const id = wke.spawn('w1');
      wke.stop(id);
      expect(wke.getStats().totalStopped).toBe(1);
    });

    it('should count idle', () => {
      wke.spawn('w1');
      expect(wke.getStats().idle).toBe(1);
    });

    it('should count busy', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.getStats().busy).toBe(1);
    });

    it('should count stopped', () => {
      const id = wke.spawn('w1');
      wke.stop(id);
      expect(wke.getStats().stopped).toBe(1);
    });

    it('should count errored', () => {
      const id = wke.spawn('w1');
      wke.fail(id);
      expect(wke.getStats().errored).toBe(1);
    });

    it('should count active', () => {
      wke.spawn('w1');
      expect(wke.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = wke.spawn('w1');
      wke.setActive(id, false);
      expect(wke.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      wke.spawn('a');
      wke.spawn('a');
      expect(wke.getStats().uniqueNames).toBe(1);
    });

    it('should count total processed2', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.getStats().totalProcessed2).toBe(1);
    });

    it('should count total errors2', () => {
      const id = wke.spawn('w1');
      wke.fail(id);
      expect(wke.getStats().totalErrors2).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get worker', () => {
      const id = wke.spawn('w1');
      expect(wke.getWorker(id)?.name).toBe('w1');
    });

    it('should get all', () => {
      wke.spawn('w1');
      expect(wke.getAllWorkers()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = wke.spawn('w1');
      expect(wke.hasWorker(id)).toBe(true);
    });

    it('should count', () => {
      expect(wke.getCount()).toBe(0);
      wke.spawn('w1');
      expect(wke.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = wke.spawn('w1');
      expect(wke.getName(id)).toBe('w1');
    });

    it('should get hits', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.getHits(id)).toBe(1);
    });

    it('should check busy', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.isBusy(id)).toBe(true);
    });

    it('should check stopped', () => {
      const id = wke.spawn('w1');
      wke.stop(id);
      expect(wke.isStopped(id)).toBe(true);
    });

    it('should check errored', () => {
      const id = wke.spawn('w1');
      wke.fail(id);
      expect(wke.isErrored(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = wke.spawn('w1');
      expect(wke.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = wke.spawn('w1');
      expect(wke.setName(id, 'w2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wke.setActive('unknown', false)).toBe(false);
      expect(wke.setName('unknown', 'w')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      wke.setActive(id, false);
      wke.resetAll();
      expect(wke.getProcessed(id)).toBe(0);
      expect(wke.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      wke.spawn('w1');
      expect(wke.getByStatus('idle')).toHaveLength(1);
    });

    it('should get active', () => {
      wke.spawn('w1');
      expect(wke.getActiveWorkers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = wke.spawn('w1');
      wke.setActive(id, false);
      expect(wke.getInactiveWorkers()).toHaveLength(1);
    });

    it('should get all names', () => {
      wke.spawn('a');
      wke.spawn('b');
      expect(wke.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      wke.spawn('w1');
      expect(wke.getNewest()?.name).toBe('w1');
    });

    it('should return null for empty newest', () => {
      expect(wke.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      wke.spawn('w1');
      expect(wke.getOldest()?.name).toBe('w1');
    });

    it('should return null for empty oldest', () => {
      expect(wke.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = wke.spawn('w1');
      expect(wke.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total spawned', () => {
      wke.spawn('w1');
      expect(wke.getTotalSpawned()).toBe(1);
    });

    it('should get total processed', () => {
      const id = wke.spawn('w1');
      wke.process(id);
      expect(wke.getTotalProcessed()).toBe(1);
    });

    it('should get total errors', () => {
      const id = wke.spawn('w1');
      wke.fail(id);
      expect(wke.getTotalErrors()).toBe(1);
    });

    it('should get total stopped', () => {
      const id = wke.spawn('w1');
      wke.stop(id);
      expect(wke.getTotalStopped()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many workers', () => {
      for (let i = 0; i < 50; i++) {
        wke.spawn(`w${i}`);
      }
      expect(wke.getCount()).toBe(50);
    });
  });
});