/**
 * BatchEngine Tests
 * thunderbolt-design Batch Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BatchEngine } from '../BatchEngine';

describe('BatchEngine', () => {
  let bae: BatchEngine;

  beforeEach(() => {
    bae = new BatchEngine();
  });

  afterEach(() => {
    bae.clearAll();
  });

  describe('add / execute / fail / remove', () => {
    it('should add', () => {
      expect(bae.add('b1', 10)).toMatch(/^bae-/);
    });

    it('should default status to pending', () => {
      bae.add('b1', 10);
      expect(bae.getStatus(bae.getAllBatches()[0].id)).toBe('pending');
    });

    it('should mark as active', () => {
      bae.add('b1', 10);
      expect(bae.isActive(bae.getAllBatches()[0].id)).toBe(true);
    });

    it('should execute', () => {
      const id = bae.add('b1', 10);
      expect(bae.execute(id, 1)).toBe(true);
    });

    it('should set running on first execute', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 1);
      expect(bae.isRunning(id)).toBe(true);
    });

    it('should increment processed', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 3);
      expect(bae.getProcessed(id)).toBe(3);
    });

    it('should set completed when processed equals items', () => {
      const id = bae.add('b1', 2);
      bae.execute(id, 2);
      expect(bae.isCompleted(id)).toBe(true);
    });

    it('should not execute completed', () => {
      const id = bae.add('b1', 1);
      bae.execute(id, 1);
      expect(bae.execute(id, 1)).toBe(false);
    });

    it('should not execute failed', () => {
      const id = bae.add('b1', 1);
      bae.fail(id);
      expect(bae.execute(id, 1)).toBe(false);
    });

    it('should not execute inactive', () => {
      const id = bae.add('b1', 10);
      bae.setActive(id, false);
      expect(bae.execute(id, 1)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(bae.execute('unknown', 1)).toBe(false);
    });

    it('should fail', () => {
      const id = bae.add('b1', 10);
      expect(bae.fail(id)).toBe(true);
    });

    it('should set failed', () => {
      const id = bae.add('b1', 10);
      bae.fail(id);
      expect(bae.isFailed(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(bae.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = bae.add('b1', 10);
      expect(bae.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      bae.add('b1', 10);
      expect(bae.getStats().batches).toBe(1);
    });

    it('should count total added', () => {
      bae.add('b1', 10);
      expect(bae.getStats().totalAdded).toBe(1);
    });

    it('should count total executed', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 1);
      expect(bae.getStats().totalExecuted).toBe(1);
    });

    it('should count total completed', () => {
      const id = bae.add('b1', 1);
      bae.execute(id, 1);
      expect(bae.getStats().totalCompleted).toBe(1);
    });

    it('should count total failed', () => {
      const id = bae.add('b1', 10);
      bae.fail(id);
      expect(bae.getStats().totalFailed).toBe(1);
    });

    it('should count pending', () => {
      bae.add('b1', 10);
      expect(bae.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 1);
      expect(bae.getStats().running).toBe(1);
    });

    it('should count completed', () => {
      const id = bae.add('b1', 1);
      bae.execute(id, 1);
      expect(bae.getStats().completed).toBe(1);
    });

    it('should count failed', () => {
      const id = bae.add('b1', 10);
      bae.fail(id);
      expect(bae.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      bae.add('b1', 10);
      expect(bae.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bae.add('b1', 10);
      bae.setActive(id, false);
      expect(bae.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 1);
      expect(bae.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      bae.add('a', 10);
      bae.add('a', 10);
      expect(bae.getStats().uniqueNames).toBe(1);
    });

    it('should count total items', () => {
      bae.add('a', 10);
      expect(bae.getStats().totalItems).toBe(10);
    });
  });

  describe('queries', () => {
    it('should get batch', () => {
      const id = bae.add('b1', 10);
      expect(bae.getBatch(id)?.name).toBe('b1');
    });

    it('should get all', () => {
      bae.add('b1', 10);
      expect(bae.getAllBatches()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = bae.add('b1', 10);
      expect(bae.hasBatch(id)).toBe(true);
    });

    it('should count', () => {
      expect(bae.getCount()).toBe(0);
      bae.add('b1', 10);
      expect(bae.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = bae.add('b1', 10);
      expect(bae.getName(id)).toBe('b1');
    });

    it('should get items', () => {
      const id = bae.add('b1', 10);
      expect(bae.getItems(id)).toBe(10);
    });

    it('should get hits', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 1);
      expect(bae.getHits(id)).toBe(1);
    });

    it('should check running', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 1);
      expect(bae.isRunning(id)).toBe(true);
    });

    it('should check completed', () => {
      const id = bae.add('b1', 1);
      bae.execute(id, 1);
      expect(bae.isCompleted(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = bae.add('b1', 10);
      bae.fail(id);
      expect(bae.isFailed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = bae.add('b1', 10);
      expect(bae.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = bae.add('b1', 10);
      expect(bae.setName(id, 'b2')).toBe(true);
    });

    it('should set items', () => {
      const id = bae.add('b1', 10);
      expect(bae.setItems(id, 20)).toBe(true);
    });

    it('should set processed', () => {
      const id = bae.add('b1', 10);
      expect(bae.setProcessed(id, 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bae.setActive('unknown', false)).toBe(false);
      expect(bae.setName('unknown', 'b')).toBe(false);
      expect(bae.setItems('unknown', 1)).toBe(false);
      expect(bae.setProcessed('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 5);
      bae.setActive(id, false);
      bae.resetAll();
      expect(bae.getProcessed(id)).toBe(0);
      expect(bae.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      bae.add('b1', 10);
      expect(bae.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      bae.add('b1', 10);
      expect(bae.getActiveBatches()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bae.add('b1', 10);
      bae.setActive(id, false);
      expect(bae.getInactiveBatches()).toHaveLength(1);
    });

    it('should get all names', () => {
      bae.add('a', 10);
      bae.add('b', 10);
      expect(bae.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      bae.add('b1', 10);
      expect(bae.getNewest()?.name).toBe('b1');
    });

    it('should return null for empty newest', () => {
      expect(bae.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bae.add('b1', 10);
      expect(bae.getOldest()?.name).toBe('b1');
    });

    it('should return null for empty oldest', () => {
      expect(bae.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = bae.add('b1', 10);
      expect(bae.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 1);
      expect(bae.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      bae.add('b1', 10);
      expect(bae.getTotalAdded()).toBe(1);
    });

    it('should get total executed', () => {
      const id = bae.add('b1', 10);
      bae.execute(id, 1);
      expect(bae.getTotalExecuted()).toBe(1);
    });

    it('should get total completed', () => {
      const id = bae.add('b1', 1);
      bae.execute(id, 1);
      expect(bae.getTotalCompleted()).toBe(1);
    });

    it('should get total failed', () => {
      const id = bae.add('b1', 10);
      bae.fail(id);
      expect(bae.getTotalFailed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many batches', () => {
      for (let i = 0; i < 50; i++) {
        bae.add(`b${i}`, 10);
      }
      expect(bae.getCount()).toBe(50);
    });
  });
});