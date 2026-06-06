/**
 * AgentEngine Tests
 * nanobot-design Agent Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentEngine } from '../AgentEngine';

describe('AgentEngine', () => {
  let age: AgentEngine;

  beforeEach(() => {
    age = new AgentEngine();
  });

  afterEach(() => {
    age.clearAll();
  });

  // ============================================================
  // spawn / assign / release / goOffline / goOnline / remove
  // ============================================================
  describe('spawn / assign / release / goOffline / goOnline / remove', () => {
    it('should spawn', () => {
      expect(age.spawn('a1')).toBe('age-1');
    });

    it('should default state to idle', () => {
      const id = age.spawn('a1');
      expect(age.getState(id)).toBe('idle');
    });

    it('should default task to empty', () => {
      const id = age.spawn('a1');
      expect(age.getTask(id)).toBe('');
    });

    it('should mark as active', () => {
      const id = age.spawn('a1');
      expect(age.isActive(id)).toBe(true);
    });

    it('should assign', () => {
      const id = age.spawn('a1');
      expect(age.assign(id, 'task1')).toBe(true);
    });

    it('should set task on assign', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.getTask(id)).toBe('task1');
    });

    it('should set state to busy on assign', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.getState(id)).toBe('busy');
    });

    it('should not assign on inactive', () => {
      const id = age.spawn('a1');
      age.setActive(id, false);
      expect(age.assign(id, 'task1')).toBe(false);
    });

    it('should not assign on offline', () => {
      const id = age.spawn('a1');
      age.goOffline(id);
      expect(age.assign(id, 'task1')).toBe(false);
    });

    it('should return false for unknown assign', () => {
      expect(age.assign('unknown', 'task1')).toBe(false);
    });

    it('should release', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.release(id)).toBe(true);
    });

    it('should reset task on release', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      age.release(id);
      expect(age.getTask(id)).toBe('');
    });

    it('should return false for unknown release', () => {
      expect(age.release('unknown')).toBe(false);
    });

    it('should go offline', () => {
      const id = age.spawn('a1');
      expect(age.goOffline(id)).toBe(true);
    });

    it('should return false for unknown goOffline', () => {
      expect(age.goOffline('unknown')).toBe(false);
    });

    it('should go online', () => {
      const id = age.spawn('a1');
      age.goOffline(id);
      expect(age.goOnline(id)).toBe(true);
    });

    it('should return false for unknown goOnline', () => {
      expect(age.goOnline('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = age.spawn('a1');
      expect(age.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      age.spawn('a1');
      const stats = age.getStats();
      expect(stats.agents).toBe(1);
    });

    it('should count total spawned', () => {
      age.spawn('a1');
      expect(age.getStats().totalSpawned).toBe(1);
    });

    it('should count total released', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      age.release(id);
      expect(age.getStats().totalReleased).toBe(1);
    });

    it('should count idle', () => {
      age.spawn('a1');
      expect(age.getStats().idle).toBe(1);
    });

    it('should count busy', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.getStats().busy).toBe(1);
    });

    it('should count offline', () => {
      const id = age.spawn('a1');
      age.goOffline(id);
      expect(age.getStats().offline).toBe(1);
    });

    it('should count active', () => {
      age.spawn('a1');
      expect(age.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = age.spawn('a1');
      age.setActive(id, false);
      expect(age.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      age.spawn('a');
      age.spawn('b');
      expect(age.getStats().uniqueNames).toBe(2);
    });

    it('should count unique tasks', () => {
      const id1 = age.spawn('a');
      const id2 = age.spawn('b');
      age.assign(id1, 'task1');
      age.assign(id2, 'task2');
      expect(age.getStats().uniqueTasks).toBe(2);
    });

    it('should count empty task', () => {
      age.spawn('a1');
      expect(age.getStats().emptyTask).toBe(1);
    });

    it('should compute busy percent', () => {
      const id1 = age.spawn('a');
      const id2 = age.spawn('b');
      age.assign(id1, 'task1');
      expect(age.getStats().busyPercent).toBe(50);
    });

    it('should compute idle percent', () => {
      age.spawn('a1');
      expect(age.getStats().idlePercent).toBe(100);
    });

    it('should compute offline percent', () => {
      const id = age.spawn('a1');
      age.goOffline(id);
      expect(age.getStats().offlinePercent).toBe(100);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get agent', () => {
      age.spawn('a1');
      expect(age.getAgent('age-1')?.name).toBe('a1');
    });

    it('should get all', () => {
      age.spawn('a1');
      expect(age.getAllAgents()).toHaveLength(1);
    });

    it('should check existence', () => {
      age.spawn('a1');
      expect(age.hasAgent('age-1')).toBe(true);
    });

    it('should count', () => {
      expect(age.getCount()).toBe(0);
      age.spawn('a1');
      expect(age.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      age.spawn('a1');
      expect(age.getName('age-1')).toBe('a1');
    });

    it('should get hits', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.getHits(id)).toBe(1);
    });

    it('should check idle', () => {
      age.spawn('a1');
      expect(age.isIdle('age-1')).toBe(true);
    });

    it('should check busy', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.isBusy(id)).toBe(true);
    });

    it('should check offline', () => {
      const id = age.spawn('a1');
      age.goOffline(id);
      expect(age.isOffline(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      age.spawn('a1');
      expect(age.setActive('age-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(age.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      age.setActive(id, false);
      age.resetAll();
      expect(age.getTask(id)).toBe('');
      expect(age.getState(id)).toBe('idle');
    });
  });

  // ============================================================
  // by state / task / state
  // ============================================================
  describe('by state / task / state', () => {
    it('should get by state', () => {
      age.spawn('a1');
      expect(age.getByState('idle')).toHaveLength(1);
    });

    it('should get by task', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.getByTask('task1')).toHaveLength(1);
    });

    it('should get active', () => {
      age.spawn('a1');
      expect(age.getActiveAgents()).toHaveLength(1);
    });

    it('should get inactive', () => {
      age.spawn('a1');
      age.setActive('age-1', false);
      expect(age.getInactiveAgents()).toHaveLength(1);
    });

    it('should get all names', () => {
      age.spawn('a');
      age.spawn('b');
      expect(age.getAllNames()).toHaveLength(2);
    });

    it('should get all tasks', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.getAllTasks()).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      age.spawn('a1');
      expect(age.getNewest()?.id).toBe('age-1');
    });

    it('should return null for empty newest', () => {
      expect(age.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      age.spawn('a1');
      expect(age.getOldest()?.id).toBe('age-1');
    });

    it('should return null for empty oldest', () => {
      expect(age.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      age.spawn('a1');
      expect(age.getCreatedAt('age-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      expect(age.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total spawned', () => {
      age.spawn('a1');
      expect(age.getTotalSpawned()).toBe(1);
    });

    it('should get total released', () => {
      const id = age.spawn('a1');
      age.assign(id, 'task1');
      age.release(id);
      expect(age.getTotalReleased()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many agents', () => {
      for (let i = 0; i < 50; i++) {
        age.spawn(`a${i}`);
      }
      expect(age.getCount()).toBe(50);
    });
  });
});