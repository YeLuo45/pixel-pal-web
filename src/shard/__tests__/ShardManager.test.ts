/**
 * ShardManager Tests
 * nanobot-design Shard Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ShardManager } from '../ShardManager';

describe('ShardManager', () => {
  let mgr: ShardManager;

  beforeEach(() => {
    mgr = new ShardManager();
  });

  afterEach(() => {
    mgr.clearAll();
  });

  // ============================================================
  // createShard
  // ============================================================
  describe('createShard', () => {
    it('should create shard', () => {
      const id = mgr.createShard('test');
      expect(id).toBe('shard-1');
    });

    it('should set initial size to 0', () => {
      const id = mgr.createShard('test');
      expect(mgr.getSize(id)).toBe(0);
    });
  });

  // ============================================================
  // assign
  // ============================================================
  describe('assign', () => {
    it('should assign', () => {
      const id = mgr.createShard('test');
      expect(mgr.assign(id, 'k1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mgr.assign('unknown', 'k1')).toBe(false);
    });

    it('should not add duplicate', () => {
      const id = mgr.createShard('test');
      mgr.assign(id, 'k1');
      mgr.assign(id, 'k1');
      expect(mgr.getKeyCount(id)).toBe(1);
    });
  });

  // ============================================================
  // query
  // ============================================================
  describe('query', () => {
    it('should query by key', () => {
      const id = mgr.createShard('test');
      mgr.assign(id, 'k1');
      expect(mgr.query('k1')?.id).toBe(id);
    });

    it('should return null for unknown', () => {
      expect(mgr.query('unknown')).toBeNull();
    });
  });

  // ============================================================
  // migrate
  // ============================================================
  describe('migrate', () => {
    it('should migrate', () => {
      const id1 = mgr.createShard('a');
      const id2 = mgr.createShard('b');
      mgr.assign(id1, 'k1');
      expect(mgr.migrate(id1, id2, 'k1')).toBe(true);
    });

    it('should return false for unknown from', () => {
      const id = mgr.createShard('a');
      expect(mgr.migrate('unknown', id, 'k1')).toBe(false);
    });

    it('should return false for unknown to', () => {
      const id = mgr.createShard('a');
      mgr.assign(id, 'k1');
      expect(mgr.migrate(id, 'unknown', 'k1')).toBe(false);
    });

    it('should return false for unknown key', () => {
      const id1 = mgr.createShard('a');
      const id2 = mgr.createShard('b');
      expect(mgr.migrate(id1, id2, 'unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      mgr.createShard('a');
      const stats = mgr.getStats();
      expect(stats.shards).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get shard', () => {
      mgr.createShard('test');
      expect(mgr.getShard('shard-1')?.name).toBe('test');
    });

    it('should get all', () => {
      mgr.createShard('a');
      mgr.createShard('b');
      expect(mgr.getAllShards()).toHaveLength(2);
    });

    it('should remove', () => {
      const id = mgr.createShard('test');
      expect(mgr.removeShard(id)).toBe(true);
    });

    it('should check existence', () => {
      mgr.createShard('test');
      expect(mgr.hasShard('shard-1')).toBe(true);
    });

    it('should count', () => {
      expect(mgr.getCount()).toBe(0);
      mgr.createShard('test');
      expect(mgr.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      mgr.createShard('test');
      expect(mgr.getName('shard-1')).toBe('test');
    });

    it('should get keys', () => {
      const id = mgr.createShard('test');
      mgr.assign(id, 'k1');
      expect(mgr.getKeys(id)).toEqual(['k1']);
    });

    it('should get key count', () => {
      const id = mgr.createShard('test');
      mgr.assign(id, 'k1');
      expect(mgr.getKeyCount(id)).toBe(1);
    });
  });

  // ============================================================
  // active
  // ============================================================
  describe('active', () => {
    it('should check isActive', () => {
      mgr.createShard('test');
      expect(mgr.isActive('shard-1')).toBe(true);
    });

    it('should set active', () => {
      mgr.createShard('test');
      expect(mgr.setActive('shard-1', false)).toBe(true);
    });

    it('should get active', () => {
      mgr.createShard('test');
      expect(mgr.getActive()).toHaveLength(1);
    });

    it('should get inactive', () => {
      mgr.createShard('test');
      mgr.setActive('shard-1', false);
      expect(mgr.getInactive()).toHaveLength(1);
    });

    it('should return false for setActive unknown', () => {
      expect(mgr.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // keys
  // ============================================================
  describe('keys', () => {
    it('should remove key', () => {
      const id = mgr.createShard('test');
      mgr.assign(id, 'k1');
      expect(mgr.removeKey(id, 'k1')).toBe(true);
    });

    it('should check hasKey', () => {
      const id = mgr.createShard('test');
      mgr.assign(id, 'k1');
      expect(mgr.hasKey('k1')).toBe(true);
    });

    it('should get shard for key', () => {
      const id = mgr.createShard('test');
      mgr.assign(id, 'k1');
      expect(mgr.getShardForKey('k1')).toBe(id);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      mgr.createShard('test');
      expect(mgr.getCreatedAt('shard-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // largest / smallest
  // ============================================================
  describe('largest / smallest', () => {
    it('should get largest', () => {
      const id = mgr.createShard('test');
      mgr.assign(id, 'k1');
      expect(mgr.getLargestShard()?.id).toBe(id);
    });

    it('should get smallest', () => {
      const id = mgr.createShard('test');
      expect(mgr.getSmallestShard()?.id).toBe(id);
    });

    it('should return null for empty', () => {
      expect(mgr.getLargestShard()).toBeNull();
      expect(mgr.getSmallestShard()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many shards', () => {
      for (let i = 0; i < 50; i++) {
        mgr.createShard(`s${i}`);
      }
      expect(mgr.getCount()).toBe(50);
    });
  });
});