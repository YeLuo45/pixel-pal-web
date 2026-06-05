/**
 * DecisionTree Tests
 * generic-agent-design Decision Tree
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DecisionTree } from '../DecisionTree';

describe('DecisionTree', () => {
  let tree: DecisionTree;

  beforeEach(() => {
    tree = new DecisionTree();
  });

  afterEach(() => {
    tree.clearAll();
  });

  // ============================================================
  // addNode / setRoot
  // ============================================================
  describe('addNode / setRoot', () => {
    it('should add node', () => {
      tree.addNode({ id: 'n1', condition: 'true', children: [] });
      expect(tree.getNodeCount()).toBe(1);
    });

    it('should set root', () => {
      tree.addNode({ id: 'n1', condition: 'true', children: [] });
      expect(tree.setRoot('n1')).toBe(true);
    });

    it('should return false for unknown root', () => {
      expect(tree.setRoot('unknown')).toBe(false);
    });
  });

  // ============================================================
  // evaluate
  // ============================================================
  describe('evaluate', () => {
    it('should return null for no root', () => {
      expect(tree.evaluate({})).toBeNull();
    });

    it('should evaluate leaf', () => {
      tree.addNode({ id: 'n1', condition: 'result', result: 'hello', children: [] });
      tree.setRoot('n1');
      expect(tree.evaluate({})).toBe('hello');
    });

    it('should evaluate true branch', () => {
      tree.addNode({ id: 'r', condition: 'age >= 18', children: ['yes', 'no'] });
      tree.addNode({ id: 'yes', condition: 'result', result: 'adult', children: [] });
      tree.addNode({ id: 'no', condition: 'result', result: 'minor', children: [] });
      tree.setRoot('r');
      expect(tree.evaluate({ age: 20 })).toBe('adult');
    });

    it('should evaluate false branch', () => {
      tree.addNode({ id: 'r', condition: 'age >= 18', children: ['yes', 'no'] });
      tree.addNode({ id: 'yes', condition: 'result', result: 'adult', children: [] });
      tree.addNode({ id: 'no', condition: 'result', result: 'minor', children: [] });
      tree.setRoot('r');
      expect(tree.evaluate({ age: 10 })).toBe('minor');
    });

    it('should return null for unknown node', () => {
      tree.addNode({ id: 'r', condition: 'true', children: ['unknown'] });
      tree.setRoot('r');
      // No failure - returns null because child is unknown
      expect(tree.evaluate({})).toBeNull();
    });
  });

  // ============================================================
  // prune
  // ============================================================
  describe('prune', () => {
    it('should prune node', () => {
      tree.addNode({ id: 'n1', condition: 'true', children: [] });
      expect(tree.prune('n1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tree.prune('unknown')).toBe(false);
    });

    it('should remove from parent children', () => {
      tree.addNode({ id: 'p', condition: 'true', children: ['c'] });
      tree.addNode({ id: 'c', condition: 'result', result: 'x', children: [] });
      tree.setRoot('p');
      tree.prune('c');
      expect(tree.getChildren('p')).toHaveLength(0);
    });
  });

  // ============================================================
  // traverse
  // ============================================================
  describe('traverse', () => {
    beforeEach(() => {
      tree.addNode({ id: 'r', condition: 'true', children: ['a', 'b'] });
      tree.addNode({ id: 'a', condition: 'result', result: 'a', children: [] });
      tree.addNode({ id: 'b', condition: 'result', result: 'b', children: [] });
      tree.setRoot('r');
    });

    it('should BFS', () => {
      const result = tree.traverse('bfs');
      expect(result[0]).toBe('r');
    });

    it('should DFS', () => {
      const result = tree.traverse('dfs');
      expect(result[0]).toBe('r');
    });

    it('should return empty for no root', () => {
      tree.clearAll();
      expect(tree.traverse('bfs')).toHaveLength(0);
    });
  });

  // ============================================================
  // node queries
  // ============================================================
  describe('node queries', () => {
    it('should get node', () => {
      tree.addNode({ id: 'n1', condition: 'true', children: [] });
      expect(tree.getNode('n1')?.condition).toBe('true');
    });

    it('should get all', () => {
      tree.addNode({ id: 'n1', condition: 'true', children: [] });
      tree.addNode({ id: 'n2', condition: 'true', children: [] });
      expect(tree.getAllNodes()).toHaveLength(2);
    });

    it('should get root', () => {
      tree.addNode({ id: 'n1', condition: 'true', children: [] });
      tree.setRoot('n1');
      expect(tree.getRoot()).toBe('n1');
    });

    it('should return null root', () => {
      expect(tree.getRoot()).toBeNull();
    });

    it('should check existence', () => {
      tree.addNode({ id: 'n1', condition: 'true', children: [] });
      expect(tree.hasNode('n1')).toBe(true);
    });

    it('should count', () => {
      expect(tree.getNodeCount()).toBe(0);
      tree.addNode({ id: 'n1', condition: 'true', children: [] });
      expect(tree.getNodeCount()).toBe(1);
    });
  });

  // ============================================================
  // children
  // ============================================================
  describe('children', () => {
    it('should get children', () => {
      tree.addNode({ id: 'p', condition: 'true', children: ['c1', 'c2'] });
      tree.addNode({ id: 'c1', condition: 'true', children: [] });
      tree.addNode({ id: 'c2', condition: 'true', children: [] });
      expect(tree.getChildren('p')).toHaveLength(2);
    });

    it('should add child', () => {
      tree.addNode({ id: 'p', condition: 'true', children: [] });
      tree.addNode({ id: 'c', condition: 'true', children: [] });
      expect(tree.addChild('p', 'c')).toBe(true);
    });

    it('should not add duplicate', () => {
      tree.addNode({ id: 'p', condition: 'true', children: ['c'] });
      tree.addNode({ id: 'c', condition: 'true', children: [] });
      tree.addChild('p', 'c');
      expect(tree.getChildren('p')).toHaveLength(1);
    });

    it('should remove child', () => {
      tree.addNode({ id: 'p', condition: 'true', children: ['c'] });
      tree.addNode({ id: 'c', condition: 'true', children: [] });
      expect(tree.removeChild('p', 'c')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tree.addChild('unknown', 'c')).toBe(false);
      expect(tree.removeChild('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // depth / leaves
  // ============================================================
  describe('depth / leaves', () => {
    it('should return 0 for no root', () => {
      expect(tree.getDepth()).toBe(0);
    });

    it('should calculate depth', () => {
      tree.addNode({ id: 'r', condition: 'true', children: ['a'] });
      tree.addNode({ id: 'a', condition: 'true', children: ['b'] });
      tree.addNode({ id: 'b', condition: 'result', result: 'x', children: [] });
      tree.setRoot('r');
      expect(tree.getDepth()).toBe(3);
    });

    it('should get leaves', () => {
      tree.addNode({ id: 'r', condition: 'true', children: ['a'] });
      tree.addNode({ id: 'a', condition: 'result', result: 'x', children: [] });
      tree.setRoot('r');
      expect(tree.getLeafCount()).toBe(1);
    });

    it('should check isLeaf', () => {
      tree.addNode({ id: 'a', condition: 'result', result: 'x', children: [] });
      expect(tree.isLeaf('a')).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        tree.addNode({ id: `n${i}`, condition: 'true', children: [] });
      }
      expect(tree.getNodeCount()).toBe(50);
    });
  });
});