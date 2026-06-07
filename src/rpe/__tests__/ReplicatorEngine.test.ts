/**
 * ReplicatorEngine Tests
 * nanobot-design Replicator Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReplicatorEngine } from '../ReplicatorEngine';

describe('ReplicatorEngine', () => {
  let rpe: ReplicatorEngine;

  beforeEach(() => {
    rpe = new ReplicatorEngine();
  });

  afterEach(() => {
    rpe.clearAll();
  });

  describe('replicate / sync / complete / fail / remove', () => {
    it('should replicate', () => {
      expect(rpe.replicate('s1', 't1')).toMatch(/^rpe-/);
    });

    it('should default status to pending', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getStatus(rpe.getAllReplicas()[0].id)).toBe('pending');
    });

    it('should default version to 1', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getVersion(rpe.getAllReplicas()[0].id)).toBe(1);
    });

    it('should mark as active', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.isActive(rpe.getAllReplicas()[0].id)).toBe(true);
    });

    it('should sync', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.sync(id)).toBe(true);
    });

    it('should not sync inactive', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.setActive(id, false);
      expect(rpe.sync(id)).toBe(false);
    });

    it('should return false for unknown sync', () => {
      expect(rpe.sync('unknown')).toBe(false);
    });

    it('should complete', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      expect(rpe.complete(id)).toBe(true);
    });

    it('should increment version on complete', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      rpe.complete(id);
      expect(rpe.getVersion(id)).toBe(2);
    });

    it('should not complete on pending', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.complete(id)).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(rpe.complete('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.fail(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(rpe.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getStats().replicas).toBe(1);
    });

    it('should count total replicated', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getStats().totalReplicated).toBe(1);
    });

    it('should count total synced', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      rpe.complete(id);
      expect(rpe.getStats().totalSynced).toBe(1);
    });

    it('should count total failed', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.fail(id);
      expect(rpe.getStats().totalFailed).toBe(1);
    });

    it('should count pending', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getStats().pending).toBe(1);
    });

    it('should count syncing', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      expect(rpe.getStats().syncing).toBe(1);
    });

    it('should count synced', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      rpe.complete(id);
      expect(rpe.getStats().synced).toBe(1);
    });

    it('should count failed', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.fail(id);
      expect(rpe.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.setActive(id, false);
      expect(rpe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      expect(rpe.getStats().totalHits).toBe(1);
    });

    it('should count unique sources', () => {
      rpe.replicate('a', 't1');
      rpe.replicate('a', 't1');
      expect(rpe.getStats().uniqueSources).toBe(1);
    });

    it('should count unique targets', () => {
      rpe.replicate('s1', 'a');
      rpe.replicate('s2', 'a');
      expect(rpe.getStats().uniqueTargets).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get replica', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.getReplica(id)?.source).toBe('s1');
    });

    it('should get all', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getAllReplicas()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.hasReplica(id)).toBe(true);
    });

    it('should count', () => {
      expect(rpe.getCount()).toBe(0);
      rpe.replicate('s1', 't1');
      expect(rpe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get source', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.getSource(id)).toBe('s1');
    });

    it('should get target', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.getTarget(id)).toBe('t1');
    });

    it('should get hits', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      expect(rpe.getHits(id)).toBe(1);
    });

    it('should check pending', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.isPending(rpe.getAllReplicas()[0].id)).toBe(true);
    });

    it('should check syncing', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      expect(rpe.isSyncing(id)).toBe(true);
    });

    it('should check synced', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      rpe.complete(id);
      expect(rpe.isSynced(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.fail(id);
      expect(rpe.isFailed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.setActive(id, false)).toBe(true);
    });

    it('should set source', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.setSource(id, 's2')).toBe(true);
    });

    it('should set target', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.setTarget(id, 't2')).toBe(true);
    });

    it('should set version', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.setVersion(id, 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rpe.setActive('unknown', false)).toBe(false);
      expect(rpe.setSource('unknown', 's')).toBe(false);
      expect(rpe.setTarget('unknown', 't')).toBe(false);
      expect(rpe.setVersion('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      rpe.setActive(id, false);
      rpe.resetAll();
      expect(rpe.isActive(id)).toBe(true);
      expect(rpe.isPending(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getActiveReplicas()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.setActive(id, false);
      expect(rpe.getInactiveReplicas()).toHaveLength(1);
    });

    it('should get all sources', () => {
      rpe.replicate('a', 't1');
      rpe.replicate('b', 't1');
      expect(rpe.getAllSources()).toHaveLength(2);
    });

    it('should get all targets', () => {
      rpe.replicate('s1', 'a');
      rpe.replicate('s1', 'b');
      expect(rpe.getAllTargets()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getNewest()?.source).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(rpe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getOldest()?.source).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(rpe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = rpe.replicate('s1', 't1');
      expect(rpe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      expect(rpe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total replicated', () => {
      rpe.replicate('s1', 't1');
      expect(rpe.getTotalReplicated()).toBe(1);
    });

    it('should get total synced', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.sync(id);
      rpe.complete(id);
      expect(rpe.getTotalSynced()).toBe(1);
    });

    it('should get total failed', () => {
      const id = rpe.replicate('s1', 't1');
      rpe.fail(id);
      expect(rpe.getTotalFailed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many replicas', () => {
      for (let i = 0; i < 50; i++) {
        rpe.replicate(`s${i}`, `t${i}`);
      }
      expect(rpe.getCount()).toBe(50);
    });
  });
});