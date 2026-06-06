/**
 * ToolManager Tests
 * generic-agent-design Tool Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ToolManager } from '../ToolManager';

describe('ToolManager', () => {
  let tm: ToolManager;

  beforeEach(() => {
    tm = new ToolManager();
  });

  afterEach(() => {
    tm.clearAll();
  });

  // ============================================================
  // register / invoke
  // ============================================================
  describe('register / invoke', () => {
    it('should register', () => {
      expect(tm.register('t1', 'desc1')).toBe('tm-1');
    });

    it('should mark as active', () => {
      const id = tm.register('t1', 'desc1');
      expect(tm.isActive(id)).toBe(true);
    });

    it('should invoke', () => {
      const id = tm.register('t1', 'desc1');
      expect(tm.invoke(id, true)).toBe(true);
    });

    it('should increment invocations on invoke', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getInvocations(id)).toBe(1);
    });

    it('should increment successes on success', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getSuccesses(id)).toBe(1);
    });

    it('should increment failures on failure', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, false);
      expect(tm.getFailures(id)).toBe(1);
    });

    it('should log history on invoke', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      tm.invoke(id, false);
      expect(tm.getHistory(id)).toEqual([true, false]);
    });

    it('should not invoke inactive', () => {
      const id = tm.register('t1', 'desc1');
      tm.setActive(id, false);
      expect(tm.invoke(id, true)).toBe(false);
    });

    it('should return false for unknown invoke', () => {
      expect(tm.invoke('unknown', true)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tm.register('t1', 'desc1');
      const stats = tm.getStats();
      expect(stats.tools).toBe(1);
    });

    it('should count total invocations', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getStats().totalInvocations).toBe(1);
    });

    it('should count total success', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getStats().totalSuccess).toBe(1);
    });

    it('should count total failures', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, false);
      expect(tm.getStats().totalFailures).toBe(1);
    });

    it('should count active', () => {
      tm.register('t1', 'desc1');
      expect(tm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tm.register('t1', 'desc1');
      tm.setActive(id, false);
      expect(tm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      tm.register('t1', 'desc1');
      tm.register('t2', 'desc2');
      expect(tm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg invocations', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getStats().avgInvocations).toBe(1);
    });

    it('should compute success rate', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getStats().successRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get tool', () => {
      tm.register('t1', 'desc1');
      expect(tm.getTool('tm-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      tm.register('t1', 'desc1');
      expect(tm.getAllTools()).toHaveLength(1);
    });

    it('should remove', () => {
      tm.register('t1', 'desc1');
      expect(tm.removeTool('tm-1')).toBe(true);
    });

    it('should check existence', () => {
      tm.register('t1', 'desc1');
      expect(tm.hasTool('tm-1')).toBe(true);
    });

    it('should count', () => {
      expect(tm.getCount()).toBe(0);
      tm.register('t1', 'desc1');
      expect(tm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      tm.register('t1', 'desc1');
      expect(tm.getName('tm-1')).toBe('t1');
    });

    it('should get description', () => {
      tm.register('t1', 'desc1');
      expect(tm.getDescription('tm-1')).toBe('desc1');
    });

    it('should get invocations', () => {
      tm.register('t1', 'desc1');
      expect(tm.getInvocations('tm-1')).toBe(0);
    });

    it('should get successes', () => {
      tm.register('t1', 'desc1');
      expect(tm.getSuccesses('tm-1')).toBe(0);
    });

    it('should get failures', () => {
      tm.register('t1', 'desc1');
      expect(tm.getFailures('tm-1')).toBe(0);
    });

    it('should get history', () => {
      tm.register('t1', 'desc1');
      expect(tm.getHistory('tm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      tm.register('t1', 'desc1');
      expect(tm.setActive('tm-1', false)).toBe(true);
    });

    it('should set name', () => {
      tm.register('t1', 'desc1');
      expect(tm.setName('tm-1', 't2')).toBe(true);
    });

    it('should set description', () => {
      tm.register('t1', 'desc1');
      expect(tm.setDescription('tm-1', 'desc2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tm.setActive('unknown', false)).toBe(false);
      expect(tm.setName('unknown', 't')).toBe(false);
      expect(tm.setDescription('unknown', 'd')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      tm.setActive(id, false);
      tm.resetAll();
      expect(tm.getInvocations(id)).toBe(0);
      expect(tm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      tm.register('t1', 'desc1');
      expect(tm.getByName('t1')).toHaveLength(1);
    });

    it('should get active', () => {
      tm.register('t1', 'desc1');
      expect(tm.getActiveTools()).toHaveLength(1);
    });

    it('should get inactive', () => {
      tm.register('t1', 'desc1');
      tm.setActive('tm-1', false);
      expect(tm.getInactiveTools()).toHaveLength(1);
    });

    it('should get all names', () => {
      tm.register('t1', 'desc1');
      tm.register('t2', 'desc2');
      expect(tm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      tm.register('t1', 'desc1');
      expect(tm.getNameCount()).toBe(1);
    });

    it('should get by min invocations', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getByMinInvocations(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most invocations', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      tm.invoke(id, true);
      expect(tm.getMostInvocations()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(tm.getMostInvocations()).toBeNull();
    });

    it('should get newest', () => {
      tm.register('t1', 'desc1');
      expect(tm.getNewest()?.id).toBe('tm-1');
    });

    it('should return null for empty newest', () => {
      expect(tm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tm.register('t1', 'desc1');
      expect(tm.getOldest()?.id).toBe('tm-1');
    });

    it('should return null for empty oldest', () => {
      expect(tm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tm.register('t1', 'desc1');
      expect(tm.getCreatedAt('tm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total invocations', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getTotalInvocations()).toBe(1);
    });

    it('should get total success', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, true);
      expect(tm.getTotalSuccess()).toBe(1);
    });

    it('should get total failures', () => {
      const id = tm.register('t1', 'desc1');
      tm.invoke(id, false);
      expect(tm.getTotalFailures()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tools', () => {
      for (let i = 0; i < 50; i++) {
        tm.register(`t${i}`, `desc${i}`);
      }
      expect(tm.getCount()).toBe(50);
    });
  });
});