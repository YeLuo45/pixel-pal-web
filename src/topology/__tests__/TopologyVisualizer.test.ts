/**
 * TopologyVisualizer Tests
 * nanobot-design Network Topology Visualizer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TopologyVisualizer } from '../TopologyVisualizer';

describe('TopologyVisualizer', () => {
  let viz: TopologyVisualizer;

  beforeEach(() => {
    viz = new TopologyVisualizer();
  });

  afterEach(() => {
    viz.clearAll();
  });

  // ============================================================
  // setGraph / getNodes / getEdges
  // ============================================================
  describe('setGraph / getNodes / getEdges', () => {
    it('should store nodes and edges', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'Node 1', x: 100, y: 100, status: 'active' },
          { id: 'n2', label: 'Node 2', x: 200, y: 200, status: 'active' },
        ],
        edges: [{ source: 'n1', target: 'n2', weight: 1, status: 'connected' }],
      });
      expect(viz.getNodes()).toHaveLength(2);
      expect(viz.getEdges()).toHaveLength(1);
    });

    it('should replace existing graph', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'N1', x: 0, y: 0, status: 'active' }],
        edges: [],
      });
      viz.setGraph({
        nodes: [{ id: 'n2', label: 'N2', x: 10, y: 10, status: 'inactive' }],
        edges: [],
      });
      expect(viz.getNodes()[0].id).toBe('n2');
    });

    it('should handle empty graph', () => {
      viz.setGraph({ nodes: [], edges: [] });
      expect(viz.getNodes()).toHaveLength(0);
      expect(viz.getEdges()).toHaveLength(0);
    });

    it('should handle many nodes', () => {
      const nodes = Array(50).fill(null).map((_, i) => ({
        id: `n${i}`, label: `Node ${i}`, x: i * 10, y: i * 10, status: 'active' as const,
      }));
      viz.setGraph({ nodes, edges: [] });
      expect(viz.getNodeCount()).toBe(50);
    });
  });

  // ============================================================
  // getNode
  // ============================================================
  describe('getNode', () => {
    it('should retrieve node by id', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'Test', x: 50, y: 50, status: 'active' }],
        edges: [],
      });
      const node = viz.getNode('n1');
      expect(node?.label).toBe('Test');
    });

    it('should return null for unknown id', () => {
      expect(viz.getNode('unknown')).toBeNull();
    });
  });

  // ============================================================
  // getActiveNodes / getInactiveNodes / getWarningNodes
  // ============================================================
  describe('getActiveNodes', () => {
    it('should return only active nodes', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'I', x: 0, y: 0, status: 'inactive' },
          { id: 'n3', label: 'W', x: 0, y: 0, status: 'warning' },
        ],
        edges: [],
      });
      expect(viz.getActiveNodes()).toHaveLength(1);
      expect(viz.getActiveNodes()[0].id).toBe('n1');
    });

    it('should return inactive nodes', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'I', x: 0, y: 0, status: 'inactive' },
        ],
        edges: [],
      });
      expect(viz.getInactiveNodes()).toHaveLength(1);
    });

    it('should return warning nodes', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'W', x: 0, y: 0, status: 'warning' }],
        edges: [],
      });
      expect(viz.getWarningNodes()).toHaveLength(1);
    });

    it('should return empty when no active nodes', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'I', x: 0, y: 0, status: 'inactive' }],
        edges: [],
      });
      expect(viz.getActiveNodes()).toHaveLength(0);
    });
  });

  // ============================================================
  // calculateLoad
  // ============================================================
  describe('calculateLoad', () => {
    it('should calculate load based on edge weights', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
        ],
        edges: [{ source: 'n1', target: 'n2', weight: 5, status: 'connected' }],
      });
      const load = viz.calculateLoad();
      expect(load.get('n1')).toBe(5);
      expect(load.get('n2')).toBe(5);
    });

    it('should accumulate multiple edges', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
          { id: 'n3', label: 'C', x: 0, y: 0, status: 'active' },
        ],
        edges: [
          { source: 'n1', target: 'n2', weight: 3, status: 'connected' },
          { source: 'n1', target: 'n3', weight: 7, status: 'connected' },
        ],
      });
      const load = viz.calculateLoad();
      expect(load.get('n1')).toBe(10);
    });

    it('should ignore disconnected edges', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
        ],
        edges: [{ source: 'n1', target: 'n2', weight: 5, status: 'disconnected' }],
      });
      const load = viz.calculateLoad();
      expect(load.get('n1')).toBe(0);
    });

    it('should return 0 for isolated nodes', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'Solo', x: 0, y: 0, status: 'active' }],
        edges: [],
      });
      const load = viz.calculateLoad();
      expect(load.get('n1')).toBe(0);
    });
  });

  // ============================================================
  // getHotNodes
  // ============================================================
  describe('getHotNodes', () => {
    it('should return nodes with load >= threshold', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
        ],
        edges: [
          { source: 'n1', target: 'n2', weight: 10, status: 'connected' },
        ],
      });
      const hot = viz.getHotNodes(10);
      expect(hot).toHaveLength(2);
    });

    it('should return empty for threshold above all loads', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
        ],
        edges: [{ source: 'n1', target: 'n1', weight: 2, status: 'connected' }],
      });
      expect(viz.getHotNodes(100)).toHaveLength(0);
    });
  });

  // ============================================================
  // exportSVG
  // ============================================================
  describe('exportSVG', () => {
    it('should generate valid SVG', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'Test', x: 50, y: 50, status: 'active' }],
        edges: [],
      });
      const svg = viz.exportSVG();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('circle');
    });

    it('should include all nodes in SVG', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 10, y: 10, status: 'active' },
          { id: 'n2', label: 'B', x: 50, y: 50, status: 'warning' },
        ],
        edges: [],
      });
      const svg = viz.exportSVG();
      expect(svg).toContain('A');
      expect(svg).toContain('B');
    });

    it('should draw edges between connected nodes', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 100, y: 100, status: 'active' },
        ],
        edges: [{ source: 'n1', target: 'n2', weight: 1, status: 'connected' }],
      });
      const svg = viz.exportSVG();
      expect(svg).toContain('line');
    });

    it('should handle empty graph', () => {
      viz.setGraph({ nodes: [], edges: [] });
      const svg = viz.exportSVG();
      expect(svg).toContain('<svg');
      // Empty graph has no node circles - check for absence of cx attribute circles
      expect(svg).not.toMatch(/<circle cx=/);
    });
  });

  // ============================================================
  // getNodeCount / getEdgeCount
  // ============================================================
  describe('getNodeCount / getEdgeCount', () => {
    it('should return correct counts', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' }],
        edges: [{ source: 'n1', target: 'n1', weight: 1, status: 'connected' }],
      });
      expect(viz.getNodeCount()).toBe(1);
      expect(viz.getEdgeCount()).toBe(1);
    });

    it('should return 0 for empty graph', () => {
      viz.setGraph({ nodes: [], edges: [] });
      expect(viz.getNodeCount()).toBe(0);
      expect(viz.getEdgeCount()).toBe(0);
    });
  });

  // ============================================================
  // updateNodePosition / updateNodeStatus
  // ============================================================
  describe('updateNodePosition', () => {
    it('should update node position', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' }],
        edges: [],
      });
      const result = viz.updateNodePosition('n1', 100, 200);
      expect(result).toBe(true);
      const node = viz.getNode('n1');
      expect(node?.x).toBe(100);
      expect(node?.y).toBe(200);
    });

    it('should fail for unknown node', () => {
      expect(viz.updateNodePosition('unknown', 0, 0)).toBe(false);
    });
  });

  describe('updateNodeStatus', () => {
    it('should update node status', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' }],
        edges: [],
      });
      viz.updateNodeStatus('n1', 'warning');
      expect(viz.getNode('n1')?.status).toBe('warning');
    });

    it('should fail for unknown node', () => {
      expect(viz.updateNodeStatus('unknown', 'active')).toBe(false);
    });
  });

  // ============================================================
  // updateEdgeStatus
  // ============================================================
  describe('updateEdgeStatus', () => {
    it('should update edge status', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
        ],
        edges: [{ source: 'n1', target: 'n2', weight: 1, status: 'connected' }],
      });
      viz.updateEdgeStatus('n1', 'n2', 'disconnected');
      expect(viz.getEdges()[0].status).toBe('disconnected');
    });

    it('should fail for unknown edge', () => {
      expect(viz.updateEdgeStatus('n1', 'n2', 'connected')).toBe(false);
    });
  });

  // ============================================================
  // getConnectedNodes
  // ============================================================
  describe('getConnectedNodes', () => {
    it('should return connected nodes', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
          { id: 'n3', label: 'C', x: 0, y: 0, status: 'active' },
        ],
        edges: [
          { source: 'n1', target: 'n2', weight: 1, status: 'connected' },
          { source: 'n1', target: 'n3', weight: 1, status: 'connected' },
        ],
      });
      const connected = viz.getConnectedNodes('n1');
      expect(connected).toHaveLength(2);
    });

    it('should return empty for isolated node', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
        ],
        edges: [],
      });
      expect(viz.getConnectedNodes('n1')).toHaveLength(0);
    });

    it('should exclude disconnected edges', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
        ],
        edges: [{ source: 'n1', target: 'n2', weight: 1, status: 'disconnected' }],
      });
      // Disconnected edge - n2 is NOT reachable from n1
      expect(viz.getConnectedNodes('n1')).toHaveLength(0);
    });
  });

  // ============================================================
  // getNodeDegree
  // ============================================================
  describe('getNodeDegree', () => {
    it('should return correct degree', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
          { id: 'n3', label: 'C', x: 0, y: 0, status: 'active' },
        ],
        edges: [
          { source: 'n1', target: 'n2', weight: 1, status: 'connected' },
          { source: 'n1', target: 'n3', weight: 1, status: 'connected' },
        ],
      });
      expect(viz.getNodeDegree('n1')).toBe(2);
      expect(viz.getNodeDegree('n2')).toBe(1);
    });

    it('should return 0 for isolated node', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' }],
        edges: [],
      });
      expect(viz.getNodeDegree('n1')).toBe(0);
    });
  });

  // ============================================================
  // findPath
  // ============================================================
  describe('findPath', () => {
    it('should find direct path', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
        ],
        edges: [{ source: 'n1', target: 'n2', weight: 1, status: 'connected' }],
      });
      const path = viz.findPath('n1', 'n2');
      expect(path).toEqual(['n1', 'n2']);
    });

    it('should find multi-hop path', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
          { id: 'n3', label: 'C', x: 0, y: 0, status: 'active' },
        ],
        edges: [
          { source: 'n1', target: 'n2', weight: 1, status: 'connected' },
          { source: 'n2', target: 'n3', weight: 1, status: 'connected' },
        ],
      });
      const path = viz.findPath('n1', 'n3');
      expect(path).toEqual(['n1', 'n2', 'n3']);
    });

    it('should return null for unreachable', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
        ],
        edges: [],
      });
      expect(viz.findPath('n1', 'n2')).toBeNull();
    });

    it('should return null for unknown nodes', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' }],
        edges: [],
      });
      expect(viz.findPath('n1', 'unknown')).toBeNull();
    });

    it('should return [node] for same node', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' }],
        edges: [],
      });
      expect(viz.findPath('n1', 'n1')).toEqual(['n1']);
    });

    it('should avoid disconnected edges', () => {
      viz.setGraph({
        nodes: [
          { id: 'n1', label: 'A', x: 0, y: 0, status: 'active' },
          { id: 'n2', label: 'B', x: 0, y: 0, status: 'active' },
          { id: 'n3', label: 'C', x: 0, y: 0, status: 'active' },
        ],
        edges: [
          { source: 'n1', target: 'n2', weight: 1, status: 'connected' },
          { source: 'n2', target: 'n3', weight: 1, status: 'disconnected' },
        ],
      });
      expect(viz.findPath('n1', 'n3')).toBeNull();
    });
  });

  // ============================================================
  // clearAll
  // ============================================================
  describe('clearAll', () => {
    it('should clear all data', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' }],
        edges: [{ source: 'n1', target: 'n1', weight: 1, status: 'connected' }],
      });
      viz.clearAll();
      expect(viz.getNodeCount()).toBe(0);
      expect(viz.getEdgeCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle self-loop edge', () => {
      viz.setGraph({
        nodes: [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' as const }],
        edges: [{ source: 'n1', target: 'n1', weight: 5, status: 'connected' as const }],
      });
      expect(viz.getNodeDegree('n1')).toBe(1);
      const load = viz.calculateLoad();
      // Self-loop: weight counted only once (source=target in same edge)
      expect(load.get('n1')).toBe(5);
    });

    it('should handle many edges', () => {
      const nodes = [{ id: 'n1', label: 'A', x: 0, y: 0, status: 'active' }];
      const edges = Array(100).fill(null).map((_, i) => ({
        source: 'n1', target: 'n1', weight: i + 1, status: 'connected' as const,
      }));
      viz.setGraph({ nodes, edges });
      expect(viz.getEdgeCount()).toBe(100);
    });
  });
});