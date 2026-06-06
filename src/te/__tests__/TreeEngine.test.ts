/**
 * TreeEngine Tests
 * claude-code-design Tree Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TreeEngine } from '../TreeEngine';

describe('TreeEngine', () => {
  let te: TreeEngine;

  beforeEach(() => {
    te = new TreeEngine();
  });

  afterEach(() => {
    te.clearAll();
  });

  // ============================================================
  // add / find / traverse
  // ============================================================
  describe('add / find / traverse', () => {
    it('should add root', () => {
      expect(te.add('root')).toBe('te-1');
    });

    it('should add child', () => {
      const root = te.add('root');
      expect(te.add('child', root)).toBe('te-2');
    });

    it('should compute depth for root', () => {
      const root = te.add('root');
      expect(te.getDepth(root)).toBe(0);
    });

    it('should compute depth for child', () => {
      const root = te.add('root');
      const child = te.add('child', root);
      expect(te.getDepth(child)).toBe(1);
    });

    it('should add to parent children', () => {
      const root = te.add('root');
      te.add('child', root);
      expect(te.getChildCount(root)).toBe(1);
    });

    it('should find', () => {
      const id = te.add('root');
      expect(te.find(id)?.name).toBe('root');
    });

    it('should return null for missing find', () => {
      expect(te.find('unknown')).toBeNull();
    });

    it('should traverse pre', () => {
      const root = te.add('root');
      te.add('a', root);
      te.add('b', root);
      const result = te.traverse(root, 'pre');
      expect(result).toEqual([root, 'te-2', 'te-3']);
    });

    it('should traverse post', () => {
      const root = te.add('root');
      te.add('a', root);
      te.add('b', root);
      const result = te.traverse(root, 'post');
      expect(result).toEqual(['te-2', 'te-3', root]);
    });

    it('should traverse bfs', () => {
      const root = te.add('root');
      te.add('a', root);
      te.add('b', root);
      const result = te.traverse(root, 'bfs');
      expect(result).toEqual([root, 'te-2', 'te-3']);
    });

    it('should return empty for missing traverse', () => {
      expect(te.traverse('unknown', 'pre')).toEqual([]);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      te.add('root');
      const stats = te.getStats();
      expect(stats.nodes).toBe(1);
    });

    it('should count roots', () => {
      te.add('r1');
      te.add('r2');
      expect(te.getStats().roots).toBe(2);
    });

    it('should compute max depth', () => {
      const root = te.add('root');
      const child = te.add('child', root);
      const grandchild = te.add('grand', child);
      expect(te.getStats().maxDepth).toBe(2);
    });

    it('should count total hits', () => {
      const id = te.add('root');
      te.touch(id);
      expect(te.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      te.add('root');
      expect(te.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = te.add('root');
      te.setActive(id, false);
      expect(te.getStats().inactive).toBe(1);
    });

    it('should compute avg children', () => {
      const root = te.add('root');
      te.add('a', root);
      expect(te.getStats().avgChildren).toBe(0.5);
    });

    it('should count leaves', () => {
      const root = te.add('root');
      te.add('a', root);
      expect(te.getStats().leaves).toBe(1);
    });

    it('should count internal', () => {
      const root = te.add('root');
      te.add('a', root);
      expect(te.getStats().internal).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get node', () => {
      te.add('root');
      expect(te.getNode('te-1')?.name).toBe('root');
    });

    it('should get all', () => {
      te.add('root');
      expect(te.getAllNodes()).toHaveLength(1);
    });

    it('should get roots', () => {
      te.add('r1');
      expect(te.getRoots()).toHaveLength(1);
    });

    it('should remove', () => {
      te.add('root');
      expect(te.removeNode('te-1')).toBe(true);
    });

    it('should remove descendants', () => {
      const root = te.add('root');
      te.add('child', root);
      te.removeNode(root);
      expect(te.getCount()).toBe(0);
    });

    it('should remove from parent children', () => {
      const root = te.add('root');
      const child = te.add('child', root);
      te.removeNode(child);
      expect(te.getChildCount(root)).toBe(0);
    });

    it('should check existence', () => {
      te.add('root');
      expect(te.hasNode('te-1')).toBe(true);
    });

    it('should count', () => {
      expect(te.getCount()).toBe(0);
      te.add('root');
      expect(te.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      te.add('root');
      expect(te.getName('te-1')).toBe('root');
    });

    it('should get parent', () => {
      te.add('root');
      expect(te.getParent('te-1')).toBeNull();
    });

    it('should get children', () => {
      te.add('root');
      expect(te.getChildren('te-1')).toEqual([]);
    });

    it('should get child count', () => {
      te.add('root');
      expect(te.getChildCount('te-1')).toBe(0);
    });

    it('should get depth', () => {
      te.add('root');
      expect(te.getDepth('te-1')).toBe(0);
    });

    it('should get hits', () => {
      te.add('root');
      expect(te.getHits('te-1')).toBe(0);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isActive', () => {
      te.add('root');
      expect(te.isActive('te-1')).toBe(true);
    });

    it('should check isRoot', () => {
      te.add('root');
      expect(te.isRoot('te-1')).toBe(true);
    });

    it('should check isLeaf', () => {
      te.add('root');
      expect(te.isLeaf('te-1')).toBe(true);
    });

    it('should not be leaf when has children', () => {
      const root = te.add('root');
      te.add('child', root);
      expect(te.isLeaf(root)).toBe(false);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      te.add('root');
      expect(te.setActive('te-1', false)).toBe(true);
    });

    it('should set name', () => {
      te.add('root');
      expect(te.setName('te-1', 'r')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(te.setActive('unknown', false)).toBe(false);
      expect(te.setName('unknown', 'r')).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      te.add('root');
      expect(te.touch('te-1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(te.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      te.add('root');
      te.touch('te-1');
      te.setActive('te-1', false);
      te.resetAll();
      expect(te.getHits('te-1')).toBe(0);
      expect(te.isActive('te-1')).toBe(true);
    });
  });

  // ============================================================
  // by name / parent
  // ============================================================
  describe('by name / parent', () => {
    it('should get by name', () => {
      te.add('root');
      expect(te.getByName('root')).toHaveLength(1);
    });

    it('should get by parent', () => {
      te.add('r1');
      te.add('r2');
      expect(te.getByParent(null)).toHaveLength(2);
    });

    it('should get active', () => {
      te.add('root');
      expect(te.getActiveNodes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      te.add('root');
      te.setActive('te-1', false);
      expect(te.getInactiveNodes()).toHaveLength(1);
    });

    it('should get all names', () => {
      te.add('a');
      te.add('b');
      expect(te.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      te.add('a');
      expect(te.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // structure
  // ============================================================
  describe('structure', () => {
    it('should get leaves', () => {
      te.add('root');
      expect(te.getLeaves()).toHaveLength(1);
    });

    it('should get internal', () => {
      const root = te.add('root');
      te.add('child', root);
      expect(te.getInternalNodes()).toHaveLength(1);
    });

    it('should get by depth', () => {
      const root = te.add('root');
      te.add('child', root);
      expect(te.getByDepth(1)).toHaveLength(1);
    });

    it('should get max depth', () => {
      te.add('root');
      expect(te.getMaxDepth()).toBe(0);
    });

    it('should get by min children', () => {
      const root = te.add('root');
      te.add('child', root);
      expect(te.getByMinChildren(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      te.add('root');
      expect(te.getNewest()?.id).toBe('te-1');
    });

    it('should return null for empty newest', () => {
      expect(te.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      te.add('root');
      expect(te.getOldest()?.id).toBe('te-1');
    });

    it('should return null for empty oldest', () => {
      expect(te.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      te.add('root');
      expect(te.getCreatedAt('te-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      te.add('root');
      te.touch('te-1');
      expect(te.getUpdatedAt('te-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      const root = te.add('root');
      for (let i = 0; i < 50; i++) {
        te.add(`n${i}`, root);
      }
      expect(te.getCount()).toBe(51);
    });
  });
});