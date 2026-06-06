/**
 * StateSync Tests
 * nanobot-design State Sync
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StateSync } from '../StateSync';

describe('StateSync', () => {
  let ss: StateSync;

  beforeEach(() => {
    ss = new StateSync();
  });

  afterEach(() => {
    ss.clearAll();
  });

  // ============================================================
  // registerNode / publish / sync
  // ============================================================
  describe('registerNode / publish / sync', () => {
    it('should registerNode', () => {
      expect(ss.registerNode('node-1')).toBe('st-1');
    });

    it('should publish', () => {
      ss.registerNode('node-1');
      expect(ss.publish('node-1', { x: 1 })).toBe(true);
    });

    it('should return false for unknown publish', () => {
      expect(ss.publish('unknown', {})).toBe(false);
    });

    it('should increment version on publish', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', { x: 1 });
      expect(ss.getVersion(id)).toBe(1);
    });

    it('should mark unsynced on publish', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', {});
      expect(ss.isSynced(id)).toBe(false);
    });

    it('should sync', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', {});
      expect(ss.sync()).toBe(1);
    });

    it('should sync 0 for no unsynced', () => {
      expect(ss.sync()).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ss.registerNode('node-1');
      const stats = ss.getStats();
      expect(stats.nodes).toBe(1);
    });

    it('should count synced', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', {});
      ss.sync();
      expect(ss.getStats().synced).toBe(1);
    });

    it('should count unsynced', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', {});
      expect(ss.getStats().unsynced).toBe(1);
    });

    it('should count sync calls', () => {
      ss.sync();
      expect(ss.getStats().syncCount).toBe(1);
    });

    it('should compute avg version', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', {});
      expect(ss.getStats().avgVersion).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get state', () => {
      ss.registerNode('node-1');
      expect(ss.getState('st-1')?.nodeId).toBe('node-1');
    });

    it('should get all', () => {
      ss.registerNode('node-1');
      expect(ss.getAllStates()).toHaveLength(1);
    });

    it('should remove', () => {
      ss.registerNode('node-1');
      expect(ss.removeState('st-1')).toBe(true);
    });

    it('should check existence', () => {
      ss.registerNode('node-1');
      expect(ss.hasState('st-1')).toBe(true);
    });

    it('should count', () => {
      expect(ss.getCount()).toBe(0);
      ss.registerNode('node-1');
      expect(ss.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get node id', () => {
      ss.registerNode('node-1');
      expect(ss.getNodeId('st-1')).toBe('node-1');
    });

    it('should get state value', () => {
      ss.registerNode('node-1');
      ss.publish('node-1', { x: 1 });
      expect(ss.getStateValue('st-1')).toEqual({ x: 1 });
    });

    it('should get version', () => {
      ss.registerNode('node-1');
      expect(ss.getVersion('st-1')).toBe(0);
    });

    it('should check isSynced', () => {
      ss.registerNode('node-1');
      expect(ss.isSynced('st-1')).toBe(false);
    });
  });

  // ============================================================
  // by node
  // ============================================================
  describe('by node', () => {
    it('should get by node id', () => {
      ss.registerNode('node-1');
      expect(ss.getByNodeId('node-1')).toHaveLength(1);
    });

    it('should get synced', () => {
      ss.registerNode('node-1');
      expect(ss.getSyncedStates()).toHaveLength(0);
    });

    it('should get unsynced', () => {
      ss.registerNode('node-1');
      expect(ss.getUnsyncedStates()).toHaveLength(1);
    });

    it('should get all node ids', () => {
      ss.registerNode('node-1');
      ss.registerNode('node-2');
      expect(ss.getAllNodeIds()).toHaveLength(2);
    });

    it('should get node id count', () => {
      ss.registerNode('node-1');
      expect(ss.getNodeIdCount()).toBe(1);
    });

    it('should get sync count', () => {
      ss.sync();
      expect(ss.getSyncCount()).toBe(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ss.registerNode('node-1');
      expect(ss.getCreatedAt('st-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      ss.registerNode('node-1');
      ss.publish('node-1', {});
      expect(ss.getUpdatedAt('st-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most recent', () => {
      ss.registerNode('node-1');
      expect(ss.getMostRecent()?.id).toBe('st-1');
    });

    it('should return null for empty most recent', () => {
      expect(ss.getMostRecent()).toBeNull();
    });

    it('should get oldest', () => {
      ss.registerNode('node-1');
      expect(ss.getOldest()?.id).toBe('st-1');
    });

    it('should return null for empty oldest', () => {
      expect(ss.getOldest()).toBeNull();
    });

    it('should get highest version', () => {
      ss.registerNode('node-1');
      ss.publish('node-1', {});
      ss.publish('node-1', {});
      expect(ss.getHighestVersion()?.version).toBe(2);
    });

    it('should return null for empty highest', () => {
      expect(ss.getHighestVersion()).toBeNull();
    });
  });

  // ============================================================
  // mark
  // ============================================================
  describe('mark', () => {
    it('should mark unsynced', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', {});
      ss.sync();
      expect(ss.markUnsynced(id)).toBe(true);
    });

    it('should return false for unknown markUnsynced', () => {
      expect(ss.markUnsynced('unknown')).toBe(false);
    });

    it('should mark synced', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', {});
      expect(ss.markSynced(id)).toBe(true);
    });

    it('should return false for unknown markSynced', () => {
      expect(ss.markSynced('unknown')).toBe(false);
    });

    it('should force sync all', () => {
      ss.registerNode('node-1');
      ss.publish('node-1', {});
      expect(ss.forceSyncAll()).toBe(1);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset versions', () => {
      const id = ss.registerNode('node-1');
      ss.publish('node-1', {});
      ss.resetVersions();
      expect(ss.getVersion(id)).toBe(0);
    });

    it('should reset sync count', () => {
      ss.sync();
      ss.resetSyncCount();
      expect(ss.getSyncCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        ss.registerNode(`node-${i}`);
      }
      expect(ss.getCount()).toBe(50);
    });
  });
});