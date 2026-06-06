/**
 * StageManager Tests
 * thunderbolt-design Stage Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StageManager } from '../StageManager';

describe('StageManager', () => {
  let sm: StageManager;

  beforeEach(() => {
    sm = new StageManager();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // create / enter / exit / complete / fail / remove
  // ============================================================
  describe('create / enter / exit / complete / fail / remove', () => {
    it('should create', () => {
      expect(sm.create('s1', 0)).toBe('sm-1');
    });

    it('should default order to 0', () => {
      const id = sm.create('s1');
      expect(sm.getOrder(id)).toBe(0);
    });

    it('should default status to pending', () => {
      const id = sm.create('s1', 0);
      expect(sm.getStatus(id)).toBe('pending');
    });

    it('should mark as active', () => {
      const id = sm.create('s1', 0);
      expect(sm.isActive(id)).toBe(true);
    });

    it('should enter', () => {
      const id = sm.create('s1', 0);
      expect(sm.enter(id)).toBe(true);
    });

    it('should set status to active on enter', () => {
      const id = sm.create('s1', 0);
      sm.enter(id);
      expect(sm.getStatus(id)).toBe('active');
    });

    it('should not enter inactive', () => {
      const id = sm.create('s1', 0);
      sm.exit(id);
      expect(sm.enter(id)).toBe(false);
    });

    it('should return false for unknown enter', () => {
      expect(sm.enter('unknown')).toBe(false);
    });

    it('should exit', () => {
      const id = sm.create('s1', 0);
      expect(sm.exit(id)).toBe(true);
    });

    it('should mark as inactive on exit', () => {
      const id = sm.create('s1', 0);
      sm.exit(id);
      expect(sm.isActive(id)).toBe(false);
    });

    it('should return false for unknown exit', () => {
      expect(sm.exit('unknown')).toBe(false);
    });

    it('should complete', () => {
      const id = sm.create('s1', 0);
      expect(sm.complete(id)).toBe(true);
    });

    it('should set status to completed', () => {
      const id = sm.create('s1', 0);
      sm.complete(id);
      expect(sm.getStatus(id)).toBe('completed');
    });

    it('should return false for unknown complete', () => {
      expect(sm.complete('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = sm.create('s1', 0);
      expect(sm.fail(id)).toBe(true);
    });

    it('should set status to failed', () => {
      const id = sm.create('s1', 0);
      sm.fail(id);
      expect(sm.getStatus(id)).toBe('failed');
    });

    it('should return false for unknown fail', () => {
      expect(sm.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = sm.create('s1', 0);
      expect(sm.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sm.create('s1', 0);
      const stats = sm.getStats();
      expect(stats.stages).toBe(1);
    });

    it('should count total entered', () => {
      const id = sm.create('s1', 0);
      sm.enter(id);
      expect(sm.getStats().totalEntered).toBe(1);
    });

    it('should count total completed', () => {
      const id = sm.create('s1', 0);
      sm.complete(id);
      expect(sm.getStats().totalCompleted).toBe(1);
    });

    it('should count total failed', () => {
      const id = sm.create('s1', 0);
      sm.fail(id);
      expect(sm.getStats().totalFailed).toBe(1);
    });

    it('should count active', () => {
      sm.create('s1', 0);
      expect(sm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sm.create('s1', 0);
      sm.exit(id);
      expect(sm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sm.create('s1', 0);
      sm.enter(id);
      expect(sm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sm.create('a', 0);
      sm.create('b', 1);
      expect(sm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg order', () => {
      sm.create('a', 1);
      sm.create('b', 2);
      expect(sm.getStats().avgOrder).toBe(1.5);
    });

    it('should get max order', () => {
      sm.create('a', 1);
      sm.create('b', 5);
      expect(sm.getStats().maxOrder).toBe(5);
    });

    it('should get min order', () => {
      sm.create('a', 1);
      sm.create('b', 5);
      expect(sm.getStats().minOrder).toBe(1);
    });

    it('should count unique statuses', () => {
      const id1 = sm.create('a', 0);
      sm.enter(id1);
      const id2 = sm.create('b', 1);
      sm.complete(id2);
      expect(sm.getStats().uniqueStatuses).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get stage', () => {
      sm.create('s1', 0);
      expect(sm.getStage('sm-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sm.create('s1', 0);
      expect(sm.getAllStages()).toHaveLength(1);
    });

    it('should check existence', () => {
      sm.create('s1', 0);
      expect(sm.hasStage('sm-1')).toBe(true);
    });

    it('should count', () => {
      expect(sm.getCount()).toBe(0);
      sm.create('s1', 0);
      expect(sm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      sm.create('s1', 0);
      expect(sm.getName('sm-1')).toBe('s1');
    });

    it('should get order', () => {
      sm.create('s1', 5);
      expect(sm.getOrder('sm-1')).toBe(5);
    });

    it('should get history', () => {
      sm.create('s1', 0);
      expect(sm.getHistory('sm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = sm.create('s1', 0);
      sm.enter(id);
      expect(sm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set name', () => {
      sm.create('s1', 0);
      expect(sm.setName('sm-1', 's2')).toBe(true);
    });

    it('should set order', () => {
      sm.create('s1', 0);
      expect(sm.setOrder('sm-1', 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sm.setName('unknown', 's')).toBe(false);
      expect(sm.setOrder('unknown', 0)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = sm.create('s1', 0);
      sm.enter(id);
      sm.complete(id);
      sm.resetAll();
      expect(sm.getStatus(id)).toBe('pending');
      expect(sm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / status / state
  // ============================================================
  describe('by name / status / state', () => {
    it('should get by name', () => {
      sm.create('s1', 0);
      expect(sm.getByName('s1')).toHaveLength(1);
    });

    it('should get by status', () => {
      const id = sm.create('s1', 0);
      sm.enter(id);
      expect(sm.getByStatus('active')).toHaveLength(1);
    });

    it('should get active', () => {
      sm.create('s1', 0);
      expect(sm.getActiveStages()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sm.create('s1', 0);
      sm.exit('sm-1');
      expect(sm.getInactiveStages()).toHaveLength(1);
    });

    it('should get pending', () => {
      sm.create('s1', 0);
      expect(sm.getPendingStages()).toHaveLength(1);
    });

    it('should get all names', () => {
      sm.create('a', 0);
      sm.create('b', 1);
      expect(sm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      sm.create('a', 0);
      expect(sm.getNameCount()).toBe(1);
    });

    it('should get by min order', () => {
      sm.create('a', 1);
      sm.create('b', 5);
      expect(sm.getByMinOrder(3)).toHaveLength(1);
    });

    it('should get by max order', () => {
      sm.create('a', 1);
      sm.create('b', 5);
      expect(sm.getByMaxOrder(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      sm.create('s1', 0);
      expect(sm.getNewest()?.id).toBe('sm-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.create('s1', 0);
      expect(sm.getOldest()?.id).toBe('sm-1');
    });

    it('should return null for empty oldest', () => {
      expect(sm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sm.create('s1', 0);
      expect(sm.getCreatedAt('sm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.create('s1', 0);
      sm.enter(id);
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total entered', () => {
      const id = sm.create('s1', 0);
      sm.enter(id);
      expect(sm.getTotalEntered()).toBe(1);
    });

    it('should get total completed', () => {
      const id = sm.create('s1', 0);
      sm.complete(id);
      expect(sm.getTotalCompleted()).toBe(1);
    });

    it('should get total failed', () => {
      const id = sm.create('s1', 0);
      sm.fail(id);
      expect(sm.getTotalFailed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many stages', () => {
      for (let i = 0; i < 50; i++) {
        sm.create(`s${i}`, i);
      }
      expect(sm.getCount()).toBe(50);
    });
  });
});