/**
 * SnapshotEngine Tests
 * nanobot-design Snapshot Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SnapshotEngine } from '../SnapshotEngine';

describe('SnapshotEngine', () => {
  let sne: SnapshotEngine;

  beforeEach(() => {
    sne = new SnapshotEngine();
  });

  afterEach(() => {
    sne.clearAll();
  });

  describe('take / restore / delete / remove', () => {
    it('should take', () => {
      expect(sne.take('s1', 'data')).toMatch(/^sne-/);
    });

    it('should default status to ready', () => {
      sne.take('s1', 'data');
      expect(sne.getStatus(sne.getAllSnapshots()[0].id)).toBe('ready');
    });

    it('should mark as active', () => {
      sne.take('s1', 'data');
      expect(sne.isActive(sne.getAllSnapshots()[0].id)).toBe(true);
    });

    it('should restore', () => {
      const id = sne.take('s1', 'data');
      expect(sne.restore(id)).toBe(true);
    });

    it('should not restore inactive', () => {
      const id = sne.take('s1', 'data');
      sne.setActive(id, false);
      expect(sne.restore(id)).toBe(false);
    });

    it('should return false for unknown restore', () => {
      expect(sne.restore('unknown')).toBe(false);
    });

    it('should delete', () => {
      const id = sne.take('s1', 'data');
      expect(sne.delete(id)).toBe(true);
    });

    it('should set deleted', () => {
      const id = sne.take('s1', 'data');
      sne.delete(id);
      expect(sne.isDeleted(id)).toBe(true);
    });

    it('should return false for unknown delete', () => {
      expect(sne.delete('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = sne.take('s1', 'data');
      expect(sne.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sne.take('s1', 'data');
      expect(sne.getStats().snapshots).toBe(1);
    });

    it('should count total taken', () => {
      sne.take('s1', 'data');
      expect(sne.getStats().totalTaken).toBe(1);
    });

    it('should count total restored', () => {
      const id = sne.take('s1', 'data');
      sne.restore(id);
      expect(sne.getStats().totalRestored).toBe(1);
    });

    it('should count total deleted', () => {
      const id = sne.take('s1', 'data');
      sne.delete(id);
      expect(sne.getStats().totalDeleted).toBe(1);
    });

    it('should count ready', () => {
      sne.take('s1', 'data');
      expect(sne.getStats().ready).toBe(1);
    });

    it('should count deleted', () => {
      const id = sne.take('s1', 'data');
      sne.delete(id);
      expect(sne.getStats().deleted).toBe(1);
    });

    it('should count active', () => {
      sne.take('s1', 'data');
      expect(sne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sne.take('s1', 'data');
      sne.setActive(id, false);
      expect(sne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sne.take('s1', 'data');
      sne.restore(id);
      expect(sne.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sne.take('a', 'data');
      sne.take('a', 'data');
      expect(sne.getStats().uniqueNames).toBe(1);
    });

    it('should count total size', () => {
      sne.take('a', 'data');
      expect(sne.getStats().totalSize).toBe(4);
    });
  });

  describe('queries', () => {
    it('should get snapshot', () => {
      const id = sne.take('s1', 'data');
      expect(sne.getSnapshot(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      sne.take('s1', 'data');
      expect(sne.getAllSnapshots()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = sne.take('s1', 'data');
      expect(sne.hasSnapshot(id)).toBe(true);
    });

    it('should count', () => {
      expect(sne.getCount()).toBe(0);
      sne.take('s1', 'data');
      expect(sne.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = sne.take('s1', 'data');
      expect(sne.getName(id)).toBe('s1');
    });

    it('should get data', () => {
      const id = sne.take('s1', 'data');
      expect(sne.getData(id)).toBe('data');
    });

    it('should get size', () => {
      const id = sne.take('s1', 'data');
      expect(sne.getSize(id)).toBe(4);
    });

    it('should get hits', () => {
      const id = sne.take('s1', 'data');
      sne.restore(id);
      expect(sne.getHits(id)).toBe(1);
    });

    it('should check ready', () => {
      sne.take('s1', 'data');
      expect(sne.isReady(sne.getAllSnapshots()[0].id)).toBe(true);
    });

    it('should check deleted', () => {
      const id = sne.take('s1', 'data');
      sne.delete(id);
      expect(sne.isDeleted(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = sne.take('s1', 'data');
      expect(sne.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = sne.take('s1', 'data');
      expect(sne.setName(id, 's2')).toBe(true);
    });

    it('should set data', () => {
      const id = sne.take('s1', 'data');
      expect(sne.setData(id, 'new')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sne.setActive('unknown', false)).toBe(false);
      expect(sne.setName('unknown', 's')).toBe(false);
      expect(sne.setData('unknown', 'd')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = sne.take('s1', 'data');
      sne.setActive(id, false);
      sne.resetAll();
      expect(sne.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      sne.take('s1', 'data');
      expect(sne.getByStatus('ready')).toHaveLength(1);
    });

    it('should get active', () => {
      sne.take('s1', 'data');
      expect(sne.getActiveSnapshots()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sne.take('s1', 'data');
      sne.setActive(id, false);
      expect(sne.getInactiveSnapshots()).toHaveLength(1);
    });

    it('should get all names', () => {
      sne.take('a', 'data');
      sne.take('b', 'data');
      expect(sne.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sne.take('s1', 'data');
      expect(sne.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(sne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sne.take('s1', 'data');
      expect(sne.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(sne.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = sne.take('s1', 'data');
      expect(sne.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sne.take('s1', 'data');
      sne.restore(id);
      expect(sne.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total taken', () => {
      sne.take('s1', 'data');
      expect(sne.getTotalTaken()).toBe(1);
    });

    it('should get total restored', () => {
      const id = sne.take('s1', 'data');
      sne.restore(id);
      expect(sne.getTotalRestored()).toBe(1);
    });

    it('should get total deleted', () => {
      const id = sne.take('s1', 'data');
      sne.delete(id);
      expect(sne.getTotalDeleted()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many snapshots', () => {
      for (let i = 0; i < 50; i++) {
        sne.take(`s${i}`, 'data');
      }
      expect(sne.getCount()).toBe(50);
    });
  });
});