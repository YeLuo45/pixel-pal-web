/**
 * BlockEngine Tests
 * chatdev-design Block Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlockEngine } from '../BlockEngine';

describe('BlockEngine', () => {
  let bke: BlockEngine;

  beforeEach(() => {
    bke = new BlockEngine();
  });

  afterEach(() => {
    bke.clearAll();
  });

  describe('add / block / unblock / remove', () => {
    it('should add', () => {
      expect(bke.add('alice', 'bob', 'spam')).toMatch(/^bke-/);
    });

    it('should default hits to 0', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getHits(bke.getAllBlocks()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.isActive(bke.getAllBlocks()[0].id)).toBe(true);
    });

    it('should block', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.block(id)).toBe(true);
    });

    it('should increment hits', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      expect(bke.getHits(id)).toBe(1);
    });

    it('should not block inactive', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.setActive(id, false);
      expect(bke.block(id)).toBe(false);
    });

    it('should return false for unknown block', () => {
      expect(bke.block('unknown')).toBe(false);
    });

    it('should unblock', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      expect(bke.unblock(id)).toBe(true);
    });

    it('should not unblock inactive', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.setActive(id, false);
      expect(bke.unblock(id)).toBe(false);
    });

    it('should return false for unknown unblock', () => {
      expect(bke.unblock('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getStats().blocks).toBe(1);
    });

    it('should count total added', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getStats().totalAdded).toBe(1);
    });

    it('should count total blocked', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      expect(bke.getStats().totalBlocked).toBe(1);
    });

    it('should count total unblocked', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      bke.unblock(id);
      expect(bke.getStats().totalUnblocked).toBe(1);
    });

    it('should count spam', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getStats().spam).toBe(1);
    });

    it('should count abuse', () => {
      bke.add('alice', 'bob', 'abuse');
      expect(bke.getStats().abuse).toBe(1);
    });

    it('should count inappropriate', () => {
      bke.add('alice', 'bob', 'inappropriate');
      expect(bke.getStats().inappropriate).toBe(1);
    });

    it('should count other', () => {
      bke.add('alice', 'bob', 'other');
      expect(bke.getStats().other).toBe(1);
    });

    it('should count active', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.setActive(id, false);
      expect(bke.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      expect(bke.getStats().totalHits).toBe(1);
    });

    it('should count unique blockers', () => {
      bke.add('alice', 'b1', 'spam');
      bke.add('alice', 'b2', 'spam');
      expect(bke.getStats().uniqueBlockers).toBe(1);
    });

    it('should count unique blocked', () => {
      bke.add('a1', 'bob', 'spam');
      bke.add('a2', 'bob', 'spam');
      expect(bke.getStats().uniqueBlocked).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get block', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.getBlock(id)?.blocker).toBe('alice');
    });

    it('should get all', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getAllBlocks()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.hasBlock(id)).toBe(true);
    });

    it('should count', () => {
      expect(bke.getCount()).toBe(0);
      bke.add('alice', 'bob', 'spam');
      expect(bke.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get blocker', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.getBlocker(id)).toBe('alice');
    });

    it('should get blocked', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.getBlocked(id)).toBe('bob');
    });

    it('should get reason', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.getReason(id)).toBe('spam');
    });

    it('should get hits', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      expect(bke.getHits(id)).toBe(1);
    });

    it('should check spam', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.isSpam(bke.getAllBlocks()[0].id)).toBe(true);
    });

    it('should check abuse', () => {
      bke.add('alice', 'bob', 'abuse');
      expect(bke.isAbuse(bke.getAllBlocks()[0].id)).toBe(true);
    });

    it('should check inappropriate', () => {
      bke.add('alice', 'bob', 'inappropriate');
      expect(bke.isInappropriate(bke.getAllBlocks()[0].id)).toBe(true);
    });

    it('should check other', () => {
      bke.add('alice', 'bob', 'other');
      expect(bke.isOther(bke.getAllBlocks()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.setActive(id, false)).toBe(true);
    });

    it('should set blocker', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.setBlocker(id, 'charlie')).toBe(true);
    });

    it('should set blocked', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.setBlocked(id, 'dave')).toBe(true);
    });

    it('should set reason', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.setReason(id, 'abuse')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bke.setActive('unknown', false)).toBe(false);
      expect(bke.setBlocker('unknown', 'a')).toBe(false);
      expect(bke.setBlocked('unknown', 'b')).toBe(false);
      expect(bke.setReason('unknown', 'spam')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      bke.setActive(id, false);
      bke.resetAll();
      expect(bke.getHits(id)).toBe(0);
      expect(bke.isActive(id)).toBe(true);
    });
  });

  describe('by reason / state', () => {
    it('should get by reason', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getByReason('spam')).toHaveLength(1);
    });

    it('should get active', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getActiveBlocks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.setActive(id, false);
      expect(bke.getInactiveBlocks()).toHaveLength(1);
    });

    it('should get all blockers', () => {
      bke.add('alice', 'b1', 'spam');
      bke.add('bob', 'b2', 'spam');
      expect(bke.getAllBlockers()).toHaveLength(2);
    });

    it('should get all blocked', () => {
      bke.add('a1', 'alice', 'spam');
      bke.add('a2', 'bob', 'spam');
      expect(bke.getAllBlocked()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getNewest()?.blocker).toBe('alice');
    });

    it('should return null for empty newest', () => {
      expect(bke.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getOldest()?.blocker).toBe('alice');
    });

    it('should return null for empty oldest', () => {
      expect(bke.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = bke.add('alice', 'bob', 'spam');
      expect(bke.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      expect(bke.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      bke.add('alice', 'bob', 'spam');
      expect(bke.getTotalAdded()).toBe(1);
    });

    it('should get total blocked', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      expect(bke.getTotalBlocked()).toBe(1);
    });

    it('should get total unblocked', () => {
      const id = bke.add('alice', 'bob', 'spam');
      bke.block(id);
      bke.unblock(id);
      expect(bke.getTotalUnblocked()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many blocks', () => {
      for (let i = 0; i < 50; i++) {
        bke.add(`blocker${i}`, `blocked${i}`, 'spam');
      }
      expect(bke.getCount()).toBe(50);
    });
  });
});