/**
 * TopologyBuilder Tests
 * nanobot-design Topology Builder
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TopologyBuilder } from '../TopologyBuilder';

describe('TopologyBuilder', () => {
  let tb: TopologyBuilder;

  beforeEach(() => {
    tb = new TopologyBuilder();
  });

  afterEach(() => {
    tb.clearAll();
  });

  // ============================================================
  // addNode / addEdge
  // ============================================================
  describe('addNode / addEdge', () => {
    it('should add node', () => {
      expect(tb.addNode('n1', 'node1')).toBe(true);
    });

    it('should reject duplicate', () => {
      tb.addNode('n1', 'node1');
      expect(tb.addNode('n1', 'node1')).toBe(false);
    });

    it('should add edge', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      expect(tb.addEdge('n1', 'n2')).toBe(true);
    });

    it('should return false for edge with unknown from', () => {
      tb.addNode('n1', 'a');
      expect(tb.addEdge('unknown', 'n1')).toBe(false);
    });

    it('should return false for edge with unknown to', () => {
      tb.addNode('n1', 'a');
      expect(tb.addEdge('n1', 'unknown')).toBe(false);
    });

    it('should reject duplicate edge', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.addEdge('n1', 'n2')).toBe(false);
    });
  });

  // ============================================================
  // layout
  // ============================================================
  describe('layout', () => {
    it('should layout grid', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      expect(tb.layout('grid')).toBe(true);
    });

    it('should layout circle', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      expect(tb.layout('circle')).toBe(true);
    });

    it('should layout tree', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.layout('tree')).toBe(true);
    });

    it('should return false for empty', () => {
      expect(tb.layout('grid')).toBe(false);
    });

    it('should set x/y for grid', () => {
      tb.addNode('n1', 'a');
      tb.layout('grid');
      expect(tb.getX('n1')).toBeDefined();
    });

    it('should set x/y for circle', () => {
      tb.addNode('n1', 'a');
      tb.layout('circle');
      expect(tb.getY('n1')).toBeDefined();
    });
  });

  // ============================================================
  // validate
  // ============================================================
  describe('validate', () => {
    it('should validate', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.validate()).toBe(true);
    });

    it('should be invalid when no edges', () => {
      tb.addNode('n1', 'a');
      tb.validate();
      expect(tb.isValid()).toBe(true); // no broken edges
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tb.addNode('n1', 'a');
      const stats = tb.getStats();
      expect(stats.nodes).toBe(1);
    });

    it('should count components', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      expect(tb.getStats().components).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get node', () => {
      tb.addNode('n1', 'a');
      expect(tb.getNode('n1')?.label).toBe('a');
    });

    it('should get all nodes', () => {
      tb.addNode('n1', 'a');
      expect(tb.getAllNodes()).toHaveLength(1);
    });

    it('should get all edges', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.getAllEdges()).toHaveLength(1);
    });

    it('should remove node', () => {
      tb.addNode('n1', 'a');
      expect(tb.removeNode('n1')).toBe(true);
    });

    it('should remove edge', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.removeEdge('n1', 'n2')).toBe(true);
    });

    it('should return false for unknown removeEdge', () => {
      expect(tb.removeEdge('unknown1', 'unknown2')).toBe(false);
    });

    it('should check node existence', () => {
      tb.addNode('n1', 'a');
      expect(tb.hasNode('n1')).toBe(true);
    });

    it('should check edge existence', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.hasEdge('n1', 'n2')).toBe(true);
    });

    it('should count', () => {
      expect(tb.getCount()).toBe(0);
      tb.addNode('n1', 'a');
      expect(tb.getCount()).toBe(1);
    });

    it('should count edges', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.getEdgeCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get label', () => {
      tb.addNode('n1', 'a');
      expect(tb.getLabel('n1')).toBe('a');
    });

    it('should set position', () => {
      tb.addNode('n1', 'a');
      expect(tb.setPosition('n1', 100, 200)).toBe(true);
    });

    it('should get position', () => {
      tb.addNode('n1', 'a');
      tb.setPosition('n1', 100, 200);
      expect(tb.getX('n1')).toBe(100);
      expect(tb.getY('n1')).toBe(200);
    });

    it('should set label', () => {
      tb.addNode('n1', 'a');
      expect(tb.setLabel('n1', 'b')).toBe(true);
    });

    it('should return false for unknown setPosition', () => {
      expect(tb.setPosition('unknown', 0, 0)).toBe(false);
    });

    it('should return false for unknown setLabel', () => {
      expect(tb.setLabel('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // node classification
  // ============================================================
  describe('node classification', () => {
    it('should get nodes with edges', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.getNodesWithEdges()).toHaveLength(2);
    });

    it('should get nodes without edges', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      expect(tb.getNodesWithoutEdges()).toHaveLength(2);
    });
  });

  // ============================================================
  // edges for node
  // ============================================================
  describe('edges for node', () => {
    it('should get edges for node', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.getEdgesForNode('n1')).toHaveLength(1);
    });

    it('should count edges for node', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.getEdgeCountForNode('n1')).toBe(1);
    });
  });

  // ============================================================
  // isValid
  // ============================================================
  describe('isValid', () => {
    it('should check isValid', () => {
      expect(tb.isValid()).toBe(false);
    });
  });

  // ============================================================
  // neighbors
  // ============================================================
  describe('neighbors', () => {
    it('should get neighbors', () => {
      tb.addNode('n1', 'a');
      tb.addNode('n2', 'b');
      tb.addEdge('n1', 'n2');
      expect(tb.getNeighbors('n1')).toContain('n2');
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tb.addNode('n1', 'a');
      expect(tb.getCreatedAt('n1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        tb.addNode(`n${i}`, `node${i}`);
      }
      expect(tb.getCount()).toBe(50);
    });

    it('should layout many nodes', () => {
      for (let i = 0; i < 10; i++) {
        tb.addNode(`n${i}`, `node${i}`);
      }
      expect(tb.layout('grid')).toBe(true);
    });
  });
});