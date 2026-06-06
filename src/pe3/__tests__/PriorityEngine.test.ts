/**
 * PriorityEngine Tests
 * generic-agent-design Priority Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PriorityEngine } from '../PriorityEngine';

describe('PriorityEngine', () => {
  let pe: PriorityEngine;

  beforeEach(() => {
    pe = new PriorityEngine();
  });

  afterEach(() => {
    pe.clearAll();
  });

  // ============================================================
  // enqueue / schedule / getNext
  // ============================================================
  describe('enqueue / schedule / getNext', () => {
    it('should enqueue', () => {
      expect(pe.enqueue('t1', 5)).toBe('pe3-1');
    });

    it('should mark as active', () => {
      const id = pe.enqueue('t1', 5);
      expect(pe.isActive(id)).toBe(true);
    });

    it('should mark as pending initially', () => {
      const id = pe.enqueue('t1', 5);
      expect(pe.isPending(id)).toBe(true);
    });

    it('should schedule', () => {
      const id = pe.enqueue('t1', 5);
      expect(pe.schedule(id)).toBe(true);
    });

    it('should mark as scheduled', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.isScheduled(id)).toBe(true);
    });

    it('should not schedule twice', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.schedule(id)).toBe(false);
    });

    it('should not schedule inactive', () => {
      const id = pe.enqueue('t1', 5);
      pe.setActive(id, false);
      expect(pe.schedule(id)).toBe(false);
    });

    it('should return false for unknown schedule', () => {
      expect(pe.schedule('unknown')).toBe(false);
    });

    it('should unschedule', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.unschedule(id)).toBe(true);
    });

    it('should mark as not scheduled on unschedule', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      pe.unschedule(id);
      expect(pe.isScheduled(id)).toBe(false);
    });

    it('should not unschedule not scheduled', () => {
      const id = pe.enqueue('t1', 5);
      expect(pe.unschedule(id)).toBe(false);
    });

    it('should return false for unknown unschedule', () => {
      expect(pe.unschedule('unknown')).toBe(false);
    });

    it('should get next by priority', () => {
      pe.enqueue('low', 1);
      const high = pe.enqueue('high', 10);
      expect(pe.getNext()?.id).toBe(high);
    });

    it('should not get next when empty', () => {
      expect(pe.getNext()).toBeNull();
    });

    it('should not include scheduled in getNext', () => {
      const id = pe.enqueue('t1', 10);
      pe.enqueue('t2', 5);
      pe.schedule(id);
      expect(pe.getNext()?.name).toBe('t2');
    });

    it('should not include inactive in getNext', () => {
      const id = pe.enqueue('t1', 10);
      pe.enqueue('t2', 5);
      pe.setActive(id, false);
      expect(pe.getNext()?.name).toBe('t2');
    });

    it('should get all pending', () => {
      pe.enqueue('t1', 1);
      pe.enqueue('t2', 2);
      expect(pe.getAll()).toHaveLength(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pe.enqueue('t1', 5);
      const stats = pe.getStats();
      expect(stats.tasks).toBe(1);
    });

    it('should count scheduled', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.getStats().scheduled).toBe(1);
    });

    it('should count pending', () => {
      pe.enqueue('t1', 5);
      expect(pe.getStats().pending).toBe(1);
    });

    it('should count active', () => {
      pe.enqueue('t1', 5);
      expect(pe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pe.enqueue('t1', 5);
      pe.setActive(id, false);
      expect(pe.getStats().inactive).toBe(1);
    });

    it('should compute avg priority', () => {
      pe.enqueue('t1', 5);
      pe.enqueue('t2', 10);
      expect(pe.getStats().avgPriority).toBe(7.5);
    });

    it('should get max priority', () => {
      pe.enqueue('t1', 5);
      pe.enqueue('t2', 10);
      expect(pe.getStats().maxPriority).toBe(10);
    });

    it('should get min priority', () => {
      pe.enqueue('t1', 5);
      pe.enqueue('t2', 10);
      expect(pe.getStats().minPriority).toBe(5);
    });

    it('should count total hits', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.getStats().totalHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get task', () => {
      pe.enqueue('t1', 5);
      expect(pe.getTask('pe3-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      pe.enqueue('t1', 5);
      expect(pe.getAllTasks()).toHaveLength(1);
    });

    it('should get scheduled', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.getScheduledTasks()).toHaveLength(1);
    });

    it('should get pending', () => {
      pe.enqueue('t1', 5);
      expect(pe.getPendingTasks()).toHaveLength(1);
    });

    it('should remove', () => {
      pe.enqueue('t1', 5);
      expect(pe.removeTask('pe3-1')).toBe(true);
    });

    it('should check existence', () => {
      pe.enqueue('t1', 5);
      expect(pe.hasTask('pe3-1')).toBe(true);
    });

    it('should count', () => {
      expect(pe.getCount()).toBe(0);
      pe.enqueue('t1', 5);
      expect(pe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pe.enqueue('t1', 5);
      expect(pe.getName('pe3-1')).toBe('t1');
    });

    it('should get priority', () => {
      pe.enqueue('t1', 5);
      expect(pe.getPriority('pe3-1')).toBe(5);
    });

    it('should get hits', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      pe.enqueue('t1', 5);
      expect(pe.getHistory('pe3-1').length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pe.enqueue('t1', 5);
      expect(pe.setActive('pe3-1', false)).toBe(true);
    });

    it('should set name', () => {
      pe.enqueue('t1', 5);
      expect(pe.setName('pe3-1', 't2')).toBe(true);
    });

    it('should set priority', () => {
      pe.enqueue('t1', 5);
      expect(pe.setPriority('pe3-1', 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pe.setActive('unknown', false)).toBe(false);
      expect(pe.setName('unknown', 't')).toBe(false);
      expect(pe.setPriority('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      pe.setActive(id, false);
      pe.resetAll();
      expect(pe.isScheduled(id)).toBe(false);
      expect(pe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      pe.enqueue('t1', 5);
      expect(pe.getByName('t1')).toHaveLength(1);
    });

    it('should get active', () => {
      pe.enqueue('t1', 5);
      expect(pe.getActiveTasks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pe.enqueue('t1', 5);
      pe.setActive('pe3-1', false);
      expect(pe.getInactiveTasks()).toHaveLength(1);
    });

    it('should get all names', () => {
      pe.enqueue('t1', 5);
      pe.enqueue('t2', 5);
      expect(pe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pe.enqueue('t1', 5);
      expect(pe.getNameCount()).toBe(1);
    });

    it('should get by min priority', () => {
      pe.enqueue('t1', 5);
      pe.enqueue('t2', 10);
      expect(pe.getByMinPriority(7)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get highest priority', () => {
      pe.enqueue('t1', 5);
      pe.enqueue('t2', 10);
      expect(pe.getHighestPriority()?.name).toBe('t2');
    });

    it('should return null for empty highest', () => {
      expect(pe.getHighestPriority()).toBeNull();
    });

    it('should get newest', () => {
      pe.enqueue('t1', 5);
      expect(pe.getNewest()?.id).toBe('pe3-1');
    });

    it('should return null for empty newest', () => {
      expect(pe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pe.enqueue('t1', 5);
      expect(pe.getOldest()?.id).toBe('pe3-1');
    });

    it('should return null for empty oldest', () => {
      expect(pe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pe.enqueue('t1', 5);
      expect(pe.getCreatedAt('pe3-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total scheduled', () => {
      const id = pe.enqueue('t1', 5);
      pe.schedule(id);
      expect(pe.getTotalScheduled()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        pe.enqueue(`t${i}`, i);
      }
      expect(pe.getCount()).toBe(50);
    });
  });
});