/**
 * DependencyAnalyzer Tests
 * claude-code-design Dependency Analyzer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DependencyAnalyzer } from '../DependencyAnalyzer';

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;

  beforeEach(() => {
    analyzer = new DependencyAnalyzer();
  });

  afterEach(() => {
    analyzer.clearAll();
  });

  // ============================================================
  // addDependency
  // ============================================================
  describe('addDependency', () => {
    it('should add dependency', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: [] });
      expect(analyzer.getDependencyCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const deps = ['b'];
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: deps });
      deps.push('c');
      expect(analyzer.getDirectDependencies('a')).toEqual(['b']);
    });
  });

  // ============================================================
  // detectCycles
  // ============================================================
  describe('detectCycles', () => {
    it('should return empty for no cycles', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: ['c'] });
      analyzer.addDependency({ name: 'c', version: '1.0.0', dependencies: [] });
      expect(analyzer.detectCycles()).toHaveLength(0);
    });

    it('should detect simple cycle', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: ['a'] });
      const cycles = analyzer.detectCycles();
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('should detect self-loop', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['a'] });
      const cycles = analyzer.detectCycles();
      expect(cycles.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // checkOutdated
  // ============================================================
  describe('checkOutdated', () => {
    it('should detect outdated', () => {
      analyzer.addDependency({ name: 'a', version: '2.0.0', dependencies: [] });
      const outdated = analyzer.checkOutdated({ a: '1.0.0' });
      expect(outdated).toContain('a');
    });

    it('should not flag current version', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: [] });
      const outdated = analyzer.checkOutdated({ a: '1.0.0' });
      expect(outdated).not.toContain('a');
    });

    it('should flag missing deps', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: [] });
      const outdated = analyzer.checkOutdated({});
      expect(outdated).toContain('a');
    });
  });

  // ============================================================
  // generateReport
  // ============================================================
  describe('generateReport', () => {
    it('should generate report', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: [] });
      const report = analyzer.generateReport();
      expect(report.total).toBe(1);
    });

    it('should include cycles in report', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['a'] });
      const report = analyzer.generateReport();
      expect(report.cycles.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // findDuplicates
  // ============================================================
  describe('findDuplicates', () => {
    it('should find duplicates', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: ['b'] });
      expect(analyzer.findDuplicates()).toContain('b');
    });

    it('should return empty for no duplicates', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      expect(analyzer.findDuplicates()).toEqual([]);
    });
  });

  // ============================================================
  // getDependency / hasDependency / removeDependency
  // ============================================================
  describe('get / has / remove', () => {
    it('should get dependency', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: [] });
      expect(analyzer.getDependency('a')?.version).toBe('1.0.0');
    });

    it('should check existence', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: [] });
      expect(analyzer.hasDependency('a')).toBe(true);
      expect(analyzer.hasDependency('unknown')).toBe(false);
    });

    it('should remove dependency', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: [] });
      expect(analyzer.removeDependency('a')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(analyzer.removeDependency('unknown')).toBe(false);
    });
  });

  // ============================================================
  // transitive dependencies
  // ============================================================
  describe('transitive dependencies', () => {
    it('should get direct dependencies', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b', 'c'] });
      expect(analyzer.getDirectDependencies('a')).toEqual(['b', 'c']);
    });

    it('should get transitive dependencies', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: ['c'] });
      analyzer.addDependency({ name: 'c', version: '1.0.0', dependencies: [] });
      const trans = analyzer.getTransitiveDependencies('a');
      expect(trans).toContain('b');
      expect(trans).toContain('c');
    });
  });

  // ============================================================
  // roots / leaves
  // ============================================================
  describe('roots / leaves', () => {
    it('should get roots', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: [] });
      const roots = analyzer.getRoots();
      expect(roots).toHaveLength(1);
      expect(roots[0].name).toBe('a');
    });

    it('should get leaves', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: [] });
      const leaves = analyzer.getLeaves();
      expect(leaves).toHaveLength(1);
      expect(leaves[0].name).toBe('b');
    });
  });

  // ============================================================
  // hasCycle
  // ============================================================
  describe('hasCycle', () => {
    it('should return false for no cycle', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: [] });
      expect(analyzer.hasCycle()).toBe(false);
    });

    it('should return true for cycle', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['a'] });
      expect(analyzer.hasCycle()).toBe(true);
    });
  });

  // ============================================================
  // getMaxDepth
  // ============================================================
  describe('getMaxDepth', () => {
    it('should return 0 for empty', () => {
      expect(analyzer.getMaxDepth()).toBe(0);
    });

    it('should calculate max depth', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: ['b'] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: ['c'] });
      analyzer.addDependency({ name: 'c', version: '1.0.0', dependencies: [] });
      expect(analyzer.getMaxDepth()).toBe(3);
    });
  });

  // ============================================================
  // getAllDependencies
  // ============================================================
  describe('getAllDependencies', () => {
    it('should return all', () => {
      analyzer.addDependency({ name: 'a', version: '1.0.0', dependencies: [] });
      analyzer.addDependency({ name: 'b', version: '1.0.0', dependencies: [] });
      expect(analyzer.getAllDependencies()).toHaveLength(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many dependencies', () => {
      for (let i = 0; i < 50; i++) {
        analyzer.addDependency({ name: `d${i}`, version: '1.0.0', dependencies: [] });
      }
      expect(analyzer.getDependencyCount()).toBe(50);
    });
  });
});