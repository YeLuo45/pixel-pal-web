/**
 * FailureManager Tests
 * thunderbolt-design Failure Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FailureManager } from '../FailureManager';

describe('FailureManager', () => {
  let fm: FailureManager;

  beforeEach(() => {
    fm = new FailureManager();
  });

  afterEach(() => {
    fm.clearAll();
  });

  // ============================================================
  // record / resolve
  // ============================================================
  describe('record / resolve', () => {
    it('should record', () => {
      expect(fm.record('error', 'low')).toBe('fm-1');
    });

    it('should resolve', () => {
      const id = fm.record('error', 'low');
      expect(fm.resolve(id)).toBe(true);
    });

    it('should not resolve already resolved', () => {
      const id = fm.record('error', 'low');
      fm.resolve(id);
      expect(fm.resolve(id)).toBe(false);
    });

    it('should return false for unknown resolve', () => {
      expect(fm.resolve('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      fm.record('error', 'low');
      const stats = fm.getStats();
      expect(stats.failures).toBe(1);
    });

    it('should count resolved', () => {
      const id = fm.record('error', 'low');
      fm.resolve(id);
      expect(fm.getStats().resolved).toBe(1);
    });

    it('should count unresolved', () => {
      fm.record('error', 'low');
      expect(fm.getStats().unresolved).toBe(1);
    });

    it('should count by severity', () => {
      fm.record('e1', 'low');
      fm.record('e2', 'high');
      expect(fm.getStats().bySeverity.low).toBe(1);
      expect(fm.getStats().bySeverity.high).toBe(1);
    });

    it('should count total hits', () => {
      const id = fm.record('e', 'low');
      fm.incrementHits(id);
      fm.incrementHits(id);
      expect(fm.getStats().totalHits).toBe(2);
    });

    it('should compute avg hits', () => {
      const id = fm.record('e', 'low');
      fm.incrementHits(id);
      expect(fm.getStats().avgHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get failure', () => {
      fm.record('e', 'low');
      expect(fm.getFailure('fm-1')?.message).toBe('e');
    });

    it('should get all', () => {
      fm.record('e', 'low');
      expect(fm.getAllFailures()).toHaveLength(1);
    });

    it('should remove', () => {
      fm.record('e', 'low');
      expect(fm.removeFailure('fm-1')).toBe(true);
    });

    it('should check existence', () => {
      fm.record('e', 'low');
      expect(fm.hasFailure('fm-1')).toBe(true);
    });

    it('should count', () => {
      expect(fm.getCount()).toBe(0);
      fm.record('e', 'low');
      expect(fm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get message', () => {
      fm.record('err', 'low');
      expect(fm.getMessage('fm-1')).toBe('err');
    });

    it('should get severity', () => {
      fm.record('e', 'low');
      expect(fm.getSeverity('fm-1')).toBe('low');
    });

    it('should get source', () => {
      fm.record('e', 'low', 'src');
      expect(fm.getSource('fm-1')).toBe('src');
    });

    it('should get category', () => {
      fm.record('e', 'low', '', 'cat');
      expect(fm.getCategory('fm-1')).toBe('cat');
    });

    it('should get hits', () => {
      const id = fm.record('e', 'low');
      fm.incrementHits(id);
      expect(fm.getHits(id)).toBe(1);
    });

    it('should check isResolved', () => {
      fm.record('e', 'low');
      expect(fm.isResolved('fm-1')).toBe(false);
    });
  });

  // ============================================================
  // hits
  // ============================================================
  describe('hits', () => {
    it('should increment hits', () => {
      const id = fm.record('e', 'low');
      expect(fm.incrementHits(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(fm.incrementHits('unknown')).toBe(false);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set message', () => {
      const id = fm.record('e', 'low');
      expect(fm.setMessage(id, 'new')).toBe(true);
    });

    it('should set severity', () => {
      const id = fm.record('e', 'low');
      expect(fm.setSeverity(id, 'high')).toBe(true);
    });

    it('should set category', () => {
      const id = fm.record('e', 'low');
      expect(fm.setCategory(id, 'cat')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(fm.setMessage('unknown', 'm')).toBe(false);
      expect(fm.setSeverity('unknown', 'low')).toBe(false);
      expect(fm.setCategory('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reopen
  // ============================================================
  describe('reopen', () => {
    it('should reopen resolved', () => {
      const id = fm.record('e', 'low');
      fm.resolve(id);
      expect(fm.reopen(id)).toBe(true);
    });

    it('should not reopen unresolved', () => {
      const id = fm.record('e', 'low');
      expect(fm.reopen(id)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(fm.reopen('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = fm.record('e', 'low');
      fm.incrementHits(id);
      fm.resetHits();
      expect(fm.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = fm.record('e', 'low');
      fm.resolve(id);
      fm.resetAll();
      expect(fm.isResolved(id)).toBe(false);
    });
  });

  // ============================================================
  // by state / severity
  // ============================================================
  describe('by state / severity', () => {
    it('should get resolved', () => {
      const id = fm.record('e', 'low');
      fm.resolve(id);
      expect(fm.getResolvedFailures()).toHaveLength(1);
    });

    it('should get unresolved', () => {
      fm.record('e', 'low');
      expect(fm.getUnresolvedFailures()).toHaveLength(1);
    });

    it('should get by severity', () => {
      fm.record('e', 'low');
      expect(fm.getBySeverity('low')).toHaveLength(1);
    });

    it('should get by source', () => {
      fm.record('e', 'low', 'src');
      expect(fm.getBySource('src')).toHaveLength(1);
    });

    it('should get by category', () => {
      fm.record('e', 'low', '', 'cat');
      expect(fm.getByCategory('cat')).toHaveLength(1);
    });
  });

  // ============================================================
  // all
  // ============================================================
  describe('all', () => {
    it('should get all severities', () => {
      fm.record('e1', 'low');
      fm.record('e2', 'high');
      expect(fm.getAllSeverities()).toHaveLength(2);
    });

    it('should get all sources', () => {
      fm.record('e1', 'low', 's1');
      fm.record('e2', 'low', 's2');
      expect(fm.getAllSources()).toHaveLength(2);
    });

    it('should get all categories', () => {
      fm.record('e1', 'low', '', 'c1');
      fm.record('e2', 'low', '', 'c2');
      expect(fm.getAllCategories()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = fm.record('e', 'low');
      fm.incrementHits(id);
      expect(fm.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(fm.getMostHit()).toBeNull();
    });

    it('should get newest', () => {
      fm.record('e', 'low');
      expect(fm.getNewest()?.id).toBe('fm-1');
    });

    it('should return null for empty newest', () => {
      expect(fm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      fm.record('e', 'low');
      expect(fm.getOldest()?.id).toBe('fm-1');
    });

    it('should return null for empty oldest', () => {
      expect(fm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      fm.record('e', 'low');
      expect(fm.getCreatedAt('fm-1')).toBeGreaterThan(0);
    });

    it('should get resolved at', () => {
      const id = fm.record('e', 'low');
      fm.resolve(id);
      expect(fm.getResolvedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many failures', () => {
      for (let i = 0; i < 50; i++) {
        fm.record(`e${i}`, 'low');
      }
      expect(fm.getCount()).toBe(50);
    });
  });
});