/**
 * DrainEngine Tests
 * thunderbolt-design Drain Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DrainEngine } from '../DrainEngine';

describe('DrainEngine', () => {
  let dne: DrainEngine;

  beforeEach(() => {
    dne = new DrainEngine();
  });

  afterEach(() => {
    dne.clearAll();
  });

  describe('addSink / push / flush / close / remove', () => {
    it('should add', () => {
      expect(dne.addSink('s1', 100)).toMatch(/^dne-/);
    });

    it('should default mode to normal', () => {
      dne.addSink('s1', 100);
      expect(dne.getMode(dne.getAllSinks()[0].id)).toBe('normal');
    });

    it('should mark as active', () => {
      dne.addSink('s1', 100);
      expect(dne.isActive(dne.getAllSinks()[0].id)).toBe(true);
    });

    it('should push', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.push(id, 10)).toBe(true);
    });

    it('should set overflow when full', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 100);
      expect(dne.isOverflow(id)).toBe(true);
    });

    it('should not push inactive', () => {
      const id = dne.addSink('s1', 100);
      dne.setActive(id, false);
      expect(dne.push(id, 10)).toBe(false);
    });

    it('should not push closed', () => {
      const id = dne.addSink('s1', 100);
      dne.close(id);
      expect(dne.push(id, 10)).toBe(false);
    });

    it('should return false for unknown push', () => {
      expect(dne.push('unknown', 10)).toBe(false);
    });

    it('should flush', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      expect(dne.flush(id)).toBe(true);
    });

    it('should set drain on flush', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      dne.flush(id);
      expect(dne.isDrain(id)).toBe(true);
    });

    it('should return false for unknown flush', () => {
      expect(dne.flush('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.close(id)).toBe(true);
    });

    it('should set closed', () => {
      const id = dne.addSink('s1', 100);
      dne.close(id);
      expect(dne.isClosed(id)).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(dne.close('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      dne.addSink('s1', 100);
      expect(dne.getStats().sinks).toBe(1);
    });

    it('should count total added', () => {
      dne.addSink('s1', 100);
      expect(dne.getStats().totalAdded).toBe(1);
    });

    it('should count total pushed', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      expect(dne.getStats().totalPushed).toBe(1);
    });

    it('should count total flushed', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      dne.flush(id);
      expect(dne.getStats().totalFlushed).toBe(1);
    });

    it('should count normal', () => {
      dne.addSink('s1', 100);
      expect(dne.getStats().normal).toBe(1);
    });

    it('should count overflow', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 100);
      expect(dne.getStats().overflow).toBe(1);
    });

    it('should count drain', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      dne.flush(id);
      expect(dne.getStats().drain).toBe(1);
    });

    it('should count closed', () => {
      const id = dne.addSink('s1', 100);
      dne.close(id);
      expect(dne.getStats().closed).toBe(1);
    });

    it('should count active', () => {
      dne.addSink('s1', 100);
      expect(dne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = dne.addSink('s1', 100);
      dne.setActive(id, false);
      expect(dne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      expect(dne.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      dne.addSink('a', 100);
      dne.addSink('a', 100);
      expect(dne.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get sink', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.getSink(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      dne.addSink('s1', 100);
      expect(dne.getAllSinks()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.hasSink(id)).toBe(true);
    });

    it('should count', () => {
      expect(dne.getCount()).toBe(0);
      dne.addSink('s1', 100);
      expect(dne.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.getName(id)).toBe('s1');
    });

    it('should get capacity', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.getCapacity(id)).toBe(100);
    });

    it('should get filled', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      expect(dne.getFilled(id)).toBe(10);
    });

    it('should get hits', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      expect(dne.getHits(id)).toBe(1);
    });

    it('should check normal', () => {
      dne.addSink('s1', 100);
      expect(dne.isNormal(dne.getAllSinks()[0].id)).toBe(true);
    });

    it('should check closed', () => {
      const id = dne.addSink('s1', 100);
      dne.close(id);
      expect(dne.isClosed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.setName(id, 's2')).toBe(true);
    });

    it('should set capacity', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.setCapacity(id, 200)).toBe(true);
    });

    it('should set mode', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.setMode(id, 'overflow')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(dne.setActive('unknown', false)).toBe(false);
      expect(dne.setName('unknown', 's')).toBe(false);
      expect(dne.setCapacity('unknown', 100)).toBe(false);
      expect(dne.setMode('unknown', 'normal')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      dne.setActive(id, false);
      dne.resetAll();
      expect(dne.getFilled(id)).toBe(0);
      expect(dne.isActive(id)).toBe(true);
    });
  });

  describe('by mode / state', () => {
    it('should get by mode', () => {
      dne.addSink('s1', 100);
      expect(dne.getByMode('normal')).toHaveLength(1);
    });

    it('should get active', () => {
      dne.addSink('s1', 100);
      expect(dne.getActiveSinks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = dne.addSink('s1', 100);
      dne.setActive(id, false);
      expect(dne.getInactiveSinks()).toHaveLength(1);
    });

    it('should get all names', () => {
      dne.addSink('a', 100);
      dne.addSink('b', 100);
      expect(dne.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      dne.addSink('s1', 100);
      expect(dne.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(dne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      dne.addSink('s1', 100);
      expect(dne.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(dne.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = dne.addSink('s1', 100);
      expect(dne.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      expect(dne.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      dne.addSink('s1', 100);
      expect(dne.getTotalAdded()).toBe(1);
    });

    it('should get total pushed', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      expect(dne.getTotalPushed()).toBe(1);
    });

    it('should get total flushed', () => {
      const id = dne.addSink('s1', 100);
      dne.push(id, 10);
      dne.flush(id);
      expect(dne.getTotalFlushed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many sinks', () => {
      for (let i = 0; i < 50; i++) {
        dne.addSink(`s${i}`, 100);
      }
      expect(dne.getCount()).toBe(50);
    });
  });
});