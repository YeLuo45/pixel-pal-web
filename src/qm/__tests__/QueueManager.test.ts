/**
 * QueueManager Tests
 * thunderbolt-design Queue Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueueManager } from '../QueueManager';

describe('QueueManager', () => {
  let qm: QueueManager;

  beforeEach(() => {
    qm = new QueueManager();
  });

  afterEach(() => {
    qm.clearAll();
  });

  // ============================================================
  // enqueue / dequeue
  // ============================================================
  describe('enqueue / dequeue', () => {
    it('should enqueue', () => {
      expect(qm.enqueue('i1', 5)).toBe('qm-1');
    });

    it('should dequeue in priority order', () => {
      qm.enqueue('low', 1);
      qm.enqueue('high', 10);
      qm.enqueue('mid', 5);
      expect(qm.dequeue()).toBe('qm-2'); // high priority
    });

    it('should return null for empty dequeue', () => {
      expect(qm.dequeue()).toBeNull();
    });

    it('should mark as processed on dequeue', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.isProcessed(id)).toBe(true);
    });

    it('should increment attempts on dequeue', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.getAttempts(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      qm.enqueue('i1', 5);
      const stats = qm.getStats();
      expect(stats.items).toBe(1);
    });

    it('should count processed', () => {
      qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.getStats().processed).toBe(1);
    });

    it('should count pending', () => {
      qm.enqueue('i1', 5);
      expect(qm.getStats().pending).toBe(1);
    });

    it('should compute avg priority', () => {
      qm.enqueue('i1', 2);
      qm.enqueue('i2', 4);
      expect(qm.getStats().avgPriority).toBe(3);
    });

    it('should get max priority', () => {
      qm.enqueue('i1', 2);
      qm.enqueue('i2', 10);
      expect(qm.getStats().maxPriority).toBe(10);
    });

    it('should get min priority', () => {
      qm.enqueue('i1', 2);
      qm.enqueue('i2', 10);
      expect(qm.getStats().minPriority).toBe(2);
    });

    it('should count total attempts', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.getStats().totalAttempts).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get item', () => {
      qm.enqueue('i1', 5);
      expect(qm.getItem('qm-1')?.name).toBe('i1');
    });

    it('should get all', () => {
      qm.enqueue('i1', 5);
      expect(qm.getAllItems()).toHaveLength(1);
    });

    it('should get pending', () => {
      qm.enqueue('i1', 5);
      expect(qm.getPendingItems()).toHaveLength(1);
    });

    it('should get processed', () => {
      qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.getProcessedItems()).toHaveLength(1);
    });

    it('should remove', () => {
      qm.enqueue('i1', 5);
      expect(qm.removeItem('qm-1')).toBe(true);
    });

    it('should remove processed', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.removeItem(id)).toBe(true);
    });

    it('should return false for remove unknown', () => {
      expect(qm.removeItem('unknown')).toBe(false);
    });

    it('should check existence', () => {
      qm.enqueue('i1', 5);
      expect(qm.hasItem('qm-1')).toBe(true);
    });

    it('should count', () => {
      expect(qm.getCount()).toBe(0);
      qm.enqueue('i1', 5);
      expect(qm.getCount()).toBe(1);
    });

    it('should get pending count', () => {
      qm.enqueue('i1', 5);
      expect(qm.getPendingCount()).toBe(1);
    });

    it('should get processed count', () => {
      qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.getProcessedCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      qm.enqueue('i1', 5);
      expect(qm.getName('qm-1')).toBe('i1');
    });

    it('should get priority', () => {
      qm.enqueue('i1', 5);
      expect(qm.getPriority('qm-1')).toBe(5);
    });

    it('should check isProcessed', () => {
      qm.enqueue('i1', 5);
      expect(qm.isProcessed('qm-1')).toBe(false);
    });

    it('should check isPending', () => {
      qm.enqueue('i1', 5);
      expect(qm.isPending('qm-1')).toBe(true);
    });
  });

  // ============================================================
  // peek
  // ============================================================
  describe('peek', () => {
    it('should peek', () => {
      qm.enqueue('i1', 5);
      expect(qm.peek()?.name).toBe('i1');
    });

    it('should return null for empty peek', () => {
      expect(qm.peek()).toBeNull();
    });

    it('should peek highest priority', () => {
      qm.enqueue('low', 1);
      qm.enqueue('high', 10);
      expect(qm.peek()?.name).toBe('high');
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set priority', () => {
      const id = qm.enqueue('i1', 5);
      expect(qm.setPriority(id, 10)).toBe(true);
    });

    it('should set name', () => {
      const id = qm.enqueue('i1', 5);
      expect(qm.setName(id, 'i2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(qm.setPriority('unknown', 10)).toBe(false);
      expect(qm.setName('unknown', 'i')).toBe(false);
    });
  });

  // ============================================================
  // retry
  // ============================================================
  describe('retry', () => {
    it('should retry', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.retry(id)).toBe(true);
    });

    it('should increment attempts on retry', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      qm.retry(id);
      expect(qm.getAttempts(id)).toBe(2);
    });

    it('should return false for unknown retry', () => {
      expect(qm.retry('unknown')).toBe(false);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear processed', () => {
      qm.enqueue('i1', 5);
      qm.dequeue();
      qm.clearProcessed();
      expect(qm.getProcessedCount()).toBe(0);
    });

    it('should clear pending', () => {
      qm.enqueue('i1', 5);
      qm.clearPending();
      expect(qm.getPendingCount()).toBe(0);
    });
  });

  // ============================================================
  // by priority / name
  // ============================================================
  describe('by priority / name', () => {
    it('should get by priority', () => {
      qm.enqueue('i1', 5);
      expect(qm.getByPriority(5)).toHaveLength(1);
    });

    it('should get by min priority', () => {
      qm.enqueue('i1', 5);
      qm.enqueue('i2', 10);
      expect(qm.getByMinPriority(7)).toHaveLength(1);
    });

    it('should get by name', () => {
      qm.enqueue('i1', 5);
      expect(qm.getByName('i1')).toHaveLength(1);
    });

    it('should get pending by priority', () => {
      qm.enqueue('i1', 5);
      expect(qm.getPendingByPriority(5)).toHaveLength(1);
    });

    it('should get processed by name', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.getProcessedByName('i1')).toHaveLength(1);
    });

    it('should get all names', () => {
      qm.enqueue('i1', 5);
      qm.enqueue('i2', 5);
      expect(qm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      qm.enqueue('i1', 5);
      expect(qm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most priority', () => {
      const id = qm.enqueue('i1', 10);
      expect(qm.getMostPriority()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(qm.getMostPriority()).toBeNull();
    });

    it('should get newest', () => {
      qm.enqueue('i1', 5);
      expect(qm.getNewest()?.id).toBe('qm-1');
    });

    it('should return null for empty newest', () => {
      expect(qm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      qm.enqueue('i1', 5);
      expect(qm.getOldest()?.id).toBe('qm-1');
    });

    it('should return null for empty oldest', () => {
      expect(qm.getOldest()).toBeNull();
    });

    it('should get most attempts', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      qm.retry(id);
      qm.dequeue();
      expect(qm.getMostAttempts()?.id).toBe(id);
    });

    it('should return null for empty most attempts', () => {
      expect(qm.getMostAttempts()).toBeNull();
    });
  });

  // ============================================================
  // timestamps / attempts
  // ============================================================
  describe('timestamps / attempts', () => {
    it('should get created at', () => {
      qm.enqueue('i1', 5);
      expect(qm.getCreatedAt('qm-1')).toBeGreaterThan(0);
    });

    it('should get processed at', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.getProcessedAt(id)).toBeGreaterThan(0);
    });

    it('should get attempts', () => {
      const id = qm.enqueue('i1', 5);
      qm.dequeue();
      expect(qm.getAttempts(id)).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many items', () => {
      for (let i = 0; i < 50; i++) {
        qm.enqueue(`i${i}`, i);
      }
      expect(qm.getCount()).toBe(50);
    });
  });
});