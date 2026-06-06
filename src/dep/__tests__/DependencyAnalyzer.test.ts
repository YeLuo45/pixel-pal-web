/**
 * DependencyAnalyzer Tests
 * claude-code-design Dependency Analyzer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DependencyAnalyzer } from '../DependencyAnalyzer';

describe('DependencyAnalyzer', () => {
  let da: DependencyAnalyzer;

  beforeEach(() => {
    da = new DependencyAnalyzer();
  });

  afterEach(() => {
    da.clearAll();
  });

  // ============================================================
  // add / remove / detect
  // ============================================================
  describe('add / remove / detect', () => {
    it('should add', () => {
      expect(da.add('a', 'b', '1.0')).toBe('dep-1');
    });

    it('should remove', () => {
      const id = da.add('a', 'b', '1.0');
      expect(da.remove(id)).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(da.remove('unknown')).toBe(false);
    });

    it('should detect targets', () => {
      da.add('a', 'b', '1.0');
      da.add('a', 'c', '1.0');
      expect(da.detect()).toHaveLength(2);
    });

    it('should not detect inactive', () => {
      const id = da.add('a', 'b', '1.0');
      da.remove(id);
      expect(da.detect()).toHaveLength(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      da.add('a', 'b', '1.0');
      const stats = da.getStats();
      expect(stats.deps).toBe(1);
    });

    it('should count sources', () => {
      da.add('a', 'b', '1.0');
      da.add('a', 'c', '1.0');
      expect(da.getStats().sources).toBe(1);
    });

    it('should count targets', () => {
      da.add('a', 'b', '1.0');
      da.add('c', 'b', '1.0');
      expect(da.getStats().targets).toBe(1);
    });

    it('should count active', () => {
      da.add('a', 'b', '1.0');
      expect(da.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = da.add('a', 'b', '1.0');
      da.remove(id);
      expect(da.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = da.add('a', 'b', '1.0');
      da.incrementHits(id);
      expect(da.getStats().totalHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get dependency', () => {
      da.add('a', 'b', '1.0');
      expect(da.getDependency('dep-1')?.source).toBe('a');
    });

    it('should get all', () => {
      da.add('a', 'b', '1.0');
      expect(da.getAllDependencies()).toHaveLength(1);
    });

    it('should remove dependency', () => {
      da.add('a', 'b', '1.0');
      expect(da.removeDependency('dep-1')).toBe(true);
    });

    it('should check existence', () => {
      da.add('a', 'b', '1.0');
      expect(da.hasDependency('dep-1')).toBe(true);
    });

    it('should count', () => {
      expect(da.getCount()).toBe(0);
      da.add('a', 'b', '1.0');
      expect(da.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get source', () => {
      da.add('a', 'b', '1.0');
      expect(da.getSource('dep-1')).toBe('a');
    });

    it('should get target', () => {
      da.add('a', 'b', '1.0');
      expect(da.getTarget('dep-1')).toBe('b');
    });

    it('should get version', () => {
      da.add('a', 'b', '1.0');
      expect(da.getVersion('dep-1')).toBe('1.0');
    });

    it('should get hits', () => {
      const id = da.add('a', 'b', '1.0');
      da.incrementHits(id);
      expect(da.getHits(id)).toBe(1);
    });

    it('should check isActive', () => {
      da.add('a', 'b', '1.0');
      expect(da.isActive('dep-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = da.add('a', 'b', '1.0');
      expect(da.setActive(id, false)).toBe(true);
    });

    it('should set version', () => {
      const id = da.add('a', 'b', '1.0');
      expect(da.setVersion(id, '2.0')).toBe(true);
    });

    it('should set source', () => {
      const id = da.add('a', 'b', '1.0');
      expect(da.setSource(id, 'c')).toBe(true);
    });

    it('should set target', () => {
      const id = da.add('a', 'b', '1.0');
      expect(da.setTarget(id, 'd')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(da.setActive('unknown', false)).toBe(false);
      expect(da.setVersion('unknown', '1.0')).toBe(false);
      expect(da.setSource('unknown', 'a')).toBe(false);
      expect(da.setTarget('unknown', 'b')).toBe(false);
    });
  });

  // ============================================================
  // hits
  // ============================================================
  describe('hits', () => {
    it('should increment hits', () => {
      const id = da.add('a', 'b', '1.0');
      expect(da.incrementHits(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(da.incrementHits('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = da.add('a', 'b', '1.0');
      da.incrementHits(id);
      da.resetHits();
      expect(da.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = da.add('a', 'b', '1.0');
      da.incrementHits(id);
      da.setActive(id, false);
      da.resetAll();
      expect(da.getHits(id)).toBe(0);
      expect(da.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by source / target
  // ============================================================
  describe('by source / target', () => {
    it('should get by source', () => {
      da.add('a', 'b', '1.0');
      expect(da.getBySource('a')).toHaveLength(1);
    });

    it('should get by target', () => {
      da.add('a', 'b', '1.0');
      expect(da.getByTarget('b')).toHaveLength(1);
    });

    it('should get active', () => {
      da.add('a', 'b', '1.0');
      expect(da.getActiveDependencies()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = da.add('a', 'b', '1.0');
      da.remove(id);
      expect(da.getInactiveDependencies()).toHaveLength(1);
    });
  });

  // ============================================================
  // all
  // ============================================================
  describe('all', () => {
    it('should get all sources', () => {
      da.add('a', 'b', '1.0');
      da.add('c', 'd', '1.0');
      expect(da.getAllSources()).toHaveLength(2);
    });

    it('should get all targets', () => {
      da.add('a', 'b', '1.0');
      da.add('a', 'c', '1.0');
      expect(da.getAllTargets()).toHaveLength(2);
    });

    it('should get all versions', () => {
      da.add('a', 'b', '1.0');
      da.add('a', 'c', '2.0');
      expect(da.getAllVersions()).toHaveLength(2);
    });

    it('should get source count', () => {
      da.add('a', 'b', '1.0');
      expect(da.getSourceCount()).toBe(1);
    });

    it('should get target count', () => {
      da.add('a', 'b', '1.0');
      expect(da.getTargetCount()).toBe(1);
    });

    it('should get version count', () => {
      da.add('a', 'b', '1.0');
      expect(da.getVersionCount()).toBe(1);
    });

    it('should get by version', () => {
      da.add('a', 'b', '1.0');
      expect(da.getByVersion('1.0')).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = da.add('a', 'b', '1.0');
      da.incrementHits(id);
      expect(da.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(da.getMostHit()).toBeNull();
    });

    it('should get newest', () => {
      da.add('a', 'b', '1.0');
      expect(da.getNewest()?.id).toBe('dep-1');
    });

    it('should return null for empty newest', () => {
      expect(da.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      da.add('a', 'b', '1.0');
      expect(da.getOldest()?.id).toBe('dep-1');
    });

    it('should return null for empty oldest', () => {
      expect(da.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      da.add('a', 'b', '1.0');
      expect(da.getCreatedAt('dep-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = da.add('a', 'b', '1.0');
      da.setVersion(id, '2.0');
      expect(da.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // circular
  // ============================================================
  describe('circular', () => {
    it('should detect no circular for acyclic', () => {
      da.add('a', 'b', '1.0');
      da.add('b', 'c', '1.0');
      expect(da.getCircular()).toHaveLength(0);
    });

    it('should handle no deps', () => {
      expect(da.getCircular()).toHaveLength(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many dependencies', () => {
      for (let i = 0; i < 50; i++) {
        da.add(`s${i}`, `t${i}`, '1.0');
      }
      expect(da.getCount()).toBe(50);
    });
  });
});