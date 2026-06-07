/**
 * CoordinatorEngine Tests
 * thunderbolt-design Coordinator Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CoordinatorEngine } from '../CoordinatorEngine';

describe('CoordinatorEngine', () => {
  let coe2: CoordinatorEngine;

  beforeEach(() => {
    coe2 = new CoordinatorEngine();
  });

  afterEach(() => {
    coe2.clearAll();
  });

  describe('add / assign / sync / complete / remove', () => {
    it('should add', () => {
      expect(coe2.add('t1')).toMatch(/^coe2-/);
    });

    it('should default status to pending', () => {
      coe2.add('t1');
      expect(coe2.getStatus(coe2.getAllTasks()[0].id)).toBe('pending');
    });

    it('should default assignee to empty', () => {
      coe2.add('t1');
      expect(coe2.getAssignee(coe2.getAllTasks()[0].id)).toBe('');
    });

    it('should mark as active', () => {
      coe2.add('t1');
      expect(coe2.isActive(coe2.getAllTasks()[0].id)).toBe(true);
    });

    it('should assign', () => {
      const id = coe2.add('t1');
      expect(coe2.assign(id, 'alice')).toBe(true);
    });

    it('should set assigned', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.isAssigned(id)).toBe(true);
    });

    it('should not assign inactive', () => {
      const id = coe2.add('t1');
      coe2.setActive(id, false);
      expect(coe2.assign(id, 'alice')).toBe(false);
    });

    it('should return false for unknown assign', () => {
      expect(coe2.assign('unknown', 'alice')).toBe(false);
    });

    it('should sync', () => {
      const id = coe2.add('t1');
      expect(coe2.sync(id)).toBe(true);
    });

    it('should set syncing', () => {
      const id = coe2.add('t1');
      coe2.sync(id);
      expect(coe2.isSyncing(id)).toBe(true);
    });

    it('should not sync inactive', () => {
      const id = coe2.add('t1');
      coe2.setActive(id, false);
      expect(coe2.sync(id)).toBe(false);
    });

    it('should return false for unknown sync', () => {
      expect(coe2.sync('unknown')).toBe(false);
    });

    it('should complete', () => {
      const id = coe2.add('t1');
      expect(coe2.complete(id)).toBe(true);
    });

    it('should set completed', () => {
      const id = coe2.add('t1');
      coe2.complete(id);
      expect(coe2.isCompleted(id)).toBe(true);
    });

    it('should return false for unknown complete', () => {
      expect(coe2.complete('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = coe2.add('t1');
      expect(coe2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      coe2.add('t1');
      expect(coe2.getStats().tasks).toBe(1);
    });

    it('should count total added', () => {
      coe2.add('t1');
      expect(coe2.getStats().totalAdded).toBe(1);
    });

    it('should count total assigned', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.getStats().totalAssigned).toBe(1);
    });

    it('should count total synced', () => {
      const id = coe2.add('t1');
      coe2.sync(id);
      expect(coe2.getStats().totalSynced).toBe(1);
    });

    it('should count total completed', () => {
      const id = coe2.add('t1');
      coe2.complete(id);
      expect(coe2.getStats().totalCompleted).toBe(1);
    });

    it('should count pending', () => {
      coe2.add('t1');
      expect(coe2.getStats().pending).toBe(1);
    });

    it('should count assigned', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.getStats().assigned).toBe(1);
    });

    it('should count syncing', () => {
      const id = coe2.add('t1');
      coe2.sync(id);
      expect(coe2.getStats().syncing).toBe(1);
    });

    it('should count completed', () => {
      const id = coe2.add('t1');
      coe2.complete(id);
      expect(coe2.getStats().completed).toBe(1);
    });

    it('should count active', () => {
      coe2.add('t1');
      expect(coe2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = coe2.add('t1');
      coe2.setActive(id, false);
      expect(coe2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      coe2.add('a');
      coe2.add('a');
      expect(coe2.getStats().uniqueNames).toBe(1);
    });

    it('should count unique assignees', () => {
      const id1 = coe2.add('t1');
      const id2 = coe2.add('t2');
      coe2.assign(id1, 'alice');
      coe2.assign(id2, 'alice');
      expect(coe2.getStats().uniqueAssignees).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get task', () => {
      const id = coe2.add('t1');
      expect(coe2.getTask(id)?.name).toBe('t1');
    });

    it('should get all', () => {
      coe2.add('t1');
      expect(coe2.getAllTasks()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = coe2.add('t1');
      expect(coe2.hasTask(id)).toBe(true);
    });

    it('should count', () => {
      expect(coe2.getCount()).toBe(0);
      coe2.add('t1');
      expect(coe2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = coe2.add('t1');
      expect(coe2.getName(id)).toBe('t1');
    });

    it('should get assignee', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.getAssignee(id)).toBe('alice');
    });

    it('should get hits', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.getHits(id)).toBe(1);
    });

    it('should check pending', () => {
      coe2.add('t1');
      expect(coe2.isPending(coe2.getAllTasks()[0].id)).toBe(true);
    });

    it('should check assigned', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.isAssigned(id)).toBe(true);
    });

    it('should check syncing', () => {
      const id = coe2.add('t1');
      coe2.sync(id);
      expect(coe2.isSyncing(id)).toBe(true);
    });

    it('should check completed', () => {
      const id = coe2.add('t1');
      coe2.complete(id);
      expect(coe2.isCompleted(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = coe2.add('t1');
      expect(coe2.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = coe2.add('t1');
      expect(coe2.setName(id, 't2')).toBe(true);
    });

    it('should set assignee', () => {
      const id = coe2.add('t1');
      expect(coe2.setAssignee(id, 'alice')).toBe(true);
    });

    it('should set status', () => {
      const id = coe2.add('t1');
      expect(coe2.setStatus(id, 'syncing')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(coe2.setActive('unknown', false)).toBe(false);
      expect(coe2.setName('unknown', 't')).toBe(false);
      expect(coe2.setAssignee('unknown', 'a')).toBe(false);
      expect(coe2.setStatus('unknown', 'pending')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = coe2.add('t1');
      coe2.complete(id);
      coe2.setActive(id, false);
      coe2.resetAll();
      expect(coe2.isPending(id)).toBe(true);
      expect(coe2.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      coe2.add('t1');
      expect(coe2.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      coe2.add('t1');
      expect(coe2.getActiveTasks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = coe2.add('t1');
      coe2.setActive(id, false);
      expect(coe2.getInactiveTasks()).toHaveLength(1);
    });

    it('should get all names', () => {
      coe2.add('a');
      coe2.add('b');
      expect(coe2.getAllNames()).toHaveLength(2);
    });

    it('should get all assignees', () => {
      const id1 = coe2.add('t1');
      const id2 = coe2.add('t2');
      coe2.assign(id1, 'alice');
      coe2.assign(id2, 'bob');
      expect(coe2.getAllAssignees()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      coe2.add('t1');
      expect(coe2.getNewest()?.name).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(coe2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      coe2.add('t1');
      expect(coe2.getOldest()?.name).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(coe2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = coe2.add('t1');
      expect(coe2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      coe2.add('t1');
      expect(coe2.getTotalAdded()).toBe(1);
    });

    it('should get total assigned', () => {
      const id = coe2.add('t1');
      coe2.assign(id, 'alice');
      expect(coe2.getTotalAssigned()).toBe(1);
    });

    it('should get total synced', () => {
      const id = coe2.add('t1');
      coe2.sync(id);
      expect(coe2.getTotalSynced()).toBe(1);
    });

    it('should get total completed', () => {
      const id = coe2.add('t1');
      coe2.complete(id);
      expect(coe2.getTotalCompleted()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        coe2.add(`t${i}`);
      }
      expect(coe2.getCount()).toBe(50);
    });
  });
});