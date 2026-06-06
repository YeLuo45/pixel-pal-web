/**
 * DependencyEngine Tests
 * thunderbolt-design Dependency Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DependencyEngine } from '../DependencyEngine';

describe('DependencyEngine', () => {
  let dpe: DependencyEngine;

  beforeEach(() => {
    dpe = new DependencyEngine();
  });

  afterEach(() => {
    dpe.clearAll();
  });

  // ============================================================
  // add / satisfies / dependsOn / remove
  // ============================================================
  describe('add / satisfies / dependsOn / remove', () => {
    it('should add', () => {
      expect(dpe.add('a', 'b')).toBe('dpe-1');
    });

    it('should default status to pending', () => {
      const id = dpe.add('a', 'b');
      expect(dpe.getStatus(id)).toBe('pending');
    });

    it('should mark as active', () => {
      const id = dpe.add('a', 'b');
      expect(dpe.isActive(id)).toBe(true);
    });

    it('should satisfy when in set', () => {
      const id = dpe.add('a', 'b');
      expect(dpe.satisfies(id, new Set(['b']))).toBe(true);
    });

    it('should mark missing when not in set', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['c']));
      expect(dpe.getStatus(id)).toBe('missing');
    });

    it('should not double satisfy', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.satisfies(id, new Set(['b']))).toBe(false);
    });

    it('should return false for unknown satisfies', () => {
      expect(dpe.satisfies('unknown', new Set())).toBe(false);
    });

    it('should dependsOn true', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.dependsOn('a', 'b')).toBe(true);
    });

    it('should dependsOn false', () => {
      expect(dpe.dependsOn('a', 'b')).toBe(false);
    });

    it('should remove', () => {
      const id = dpe.add('a', 'b');
      expect(dpe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      dpe.add('a', 'b');
      const stats = dpe.getStats();
      expect(stats.dependencies).toBe(1);
    });

    it('should count total added', () => {
      dpe.add('a', 'b');
      expect(dpe.getStats().totalAdded).toBe(1);
    });

    it('should count total satisfied', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.getStats().totalSatisfied).toBe(1);
    });

    it('should count total missing', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['c']));
      expect(dpe.getStats().totalMissing).toBe(1);
    });

    it('should count pending', () => {
      dpe.add('a', 'b');
      expect(dpe.getStats().pending).toBe(1);
    });

    it('should count satisfied', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.getStats().satisfied).toBe(1);
    });

    it('should count missing', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['c']));
      expect(dpe.getStats().missing).toBe(1);
    });

    it('should count active', () => {
      dpe.add('a', 'b');
      expect(dpe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = dpe.add('a', 'b');
      dpe.setActive(id, false);
      expect(dpe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.getStats().totalHits).toBe(1);
    });

    it('should count unique froms', () => {
      dpe.add('a', 'b');
      dpe.add('a', 'c');
      expect(dpe.getStats().uniqueFroms).toBe(1);
    });

    it('should count unique tos', () => {
      dpe.add('a', 'b');
      dpe.add('c', 'b');
      expect(dpe.getStats().uniqueTos).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get dependency', () => {
      dpe.add('a', 'b');
      expect(dpe.getDependency('dpe-1')?.from).toBe('a');
    });

    it('should get all', () => {
      dpe.add('a', 'b');
      expect(dpe.getAllDependencies()).toHaveLength(1);
    });

    it('should check existence', () => {
      dpe.add('a', 'b');
      expect(dpe.hasDependency('dpe-1')).toBe(true);
    });

    it('should count', () => {
      expect(dpe.getCount()).toBe(0);
      dpe.add('a', 'b');
      expect(dpe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get from', () => {
      dpe.add('a', 'b');
      expect(dpe.getFrom('dpe-1')).toBe('a');
    });

    it('should get to', () => {
      dpe.add('a', 'b');
      expect(dpe.getTo('dpe-1')).toBe('b');
    });

    it('should get hits', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.getHits(id)).toBe(1);
    });

    it('should check satisfied', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.isSatisfied(id)).toBe(true);
    });

    it('should check missing', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['c']));
      expect(dpe.isMissing(id)).toBe(true);
    });

    it('should check pending', () => {
      dpe.add('a', 'b');
      expect(dpe.isPending('dpe-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      dpe.add('a', 'b');
      expect(dpe.setActive('dpe-1', false)).toBe(true);
    });

    it('should set from', () => {
      dpe.add('a', 'b');
      expect(dpe.setFrom('dpe-1', 'c')).toBe(true);
    });

    it('should set to', () => {
      dpe.add('a', 'b');
      expect(dpe.setTo('dpe-1', 'c')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(dpe.setActive('unknown', false)).toBe(false);
      expect(dpe.setFrom('unknown', 'c')).toBe(false);
      expect(dpe.setTo('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      dpe.setActive(id, false);
      dpe.resetAll();
      expect(dpe.getStatus(id)).toBe('pending');
      expect(dpe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by status / state
  // ============================================================
  describe('by status / state', () => {
    it('should get by status', () => {
      dpe.add('a', 'b');
      expect(dpe.getByStatus('pending')).toHaveLength(1);
    });

    it('should get by from', () => {
      dpe.add('a', 'b');
      expect(dpe.getByFrom('a')).toHaveLength(1);
    });

    it('should get by to', () => {
      dpe.add('a', 'b');
      expect(dpe.getByTo('b')).toHaveLength(1);
    });

    it('should get active', () => {
      dpe.add('a', 'b');
      expect(dpe.getActiveDependencies()).toHaveLength(1);
    });

    it('should get inactive', () => {
      dpe.add('a', 'b');
      dpe.setActive('dpe-1', false);
      expect(dpe.getInactiveDependencies()).toHaveLength(1);
    });

    it('should get all froms', () => {
      dpe.add('a', 'b');
      dpe.add('b', 'c');
      expect(dpe.getAllFroms()).toHaveLength(2);
    });

    it('should get all tos', () => {
      dpe.add('a', 'b');
      dpe.add('c', 'd');
      expect(dpe.getAllTos()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      dpe.add('a', 'b');
      expect(dpe.getNewest()?.id).toBe('dpe-1');
    });

    it('should return null for empty newest', () => {
      expect(dpe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      dpe.add('a', 'b');
      expect(dpe.getOldest()?.id).toBe('dpe-1');
    });

    it('should return null for empty oldest', () => {
      expect(dpe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      dpe.add('a', 'b');
      expect(dpe.getCreatedAt('dpe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total added', () => {
      dpe.add('a', 'b');
      expect(dpe.getTotalAdded()).toBe(1);
    });

    it('should get total satisfied', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['b']));
      expect(dpe.getTotalSatisfied()).toBe(1);
    });

    it('should get total missing', () => {
      const id = dpe.add('a', 'b');
      dpe.satisfies(id, new Set(['c']));
      expect(dpe.getTotalMissing()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many dependencies', () => {
      for (let i = 0; i < 50; i++) {
        dpe.add(`a${i}`, `b${i}`);
      }
      expect(dpe.getCount()).toBe(50);
    });
  });
});