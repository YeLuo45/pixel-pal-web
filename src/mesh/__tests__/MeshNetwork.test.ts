/**
 * MeshNetwork Tests
 * nanobot-design Mesh Network v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MeshNetwork } from '../MeshNetwork';

describe('MeshNetwork', () => {
  let network: MeshNetwork;

  beforeEach(() => {
    network = new MeshNetwork();
  });

  afterEach(() => {
    network.clearAll();
  });

  // ============================================================
  // addNode
  // ============================================================
  describe('addNode', () => {
    it('should add a node', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      expect(network.getNodeCount()).toBe(1);
    });

    it('should add many nodes', () => {
      for (let i = 0; i < 100; i++) {
        network.addNode({ id: `n${i}`, load: 0.5, healthy: true, latency: 10 });
      }
      expect(network.getNodeCount()).toBe(100);
    });

    it('should not affect existing node on re-add', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n1', load: 0.8, healthy: false, latency: 20 });
      expect(network.getNode('n1')?.load).toBe(0.8);
    });
  });

  // ============================================================
  // connect
  // ============================================================
  describe('connect', () => {
    it('should connect two nodes', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      expect(network.getOptimalPath('n1', 'n2')).toEqual(['n1', 'n2']);
    });

    it('should allow multiple connections', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n3', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      network.connect('n2', 'n3');
      expect(network.getOptimalPath('n1', 'n3')).toEqual(['n1', 'n2', 'n3']);
    });
  });

  // ============================================================
  // routeMessage
  // ============================================================
  describe('routeMessage', () => {
    it('should route message along path', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      const result = network.routeMessage('n1', 'n2', 'hello');
      expect(result).toContain('hello');
      expect(result).toContain('n2');
    });

    it('should return error for unknown node', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      const result = network.routeMessage('n1', 'unknown', 'hello');
      expect(result).toContain('error:unknown-node');
    });

    it('should return error for no path', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      const result = network.routeMessage('n1', 'n2', 'hello');
      expect(result).toContain('error:no-path');
    });
  });

  // ============================================================
  // getOptimalPath
  // ============================================================
  describe('getOptimalPath', () => {
    it('should return single node for same node', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      expect(network.getOptimalPath('n1', 'n1')).toEqual(['n1']);
    });

    it('should find shortest path', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n3', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      network.connect('n2', 'n3');
      expect(network.getOptimalPath('n1', 'n3')).toEqual(['n1', 'n2', 'n3']);
    });

    it('should return empty for disconnected', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      expect(network.getOptimalPath('n1', 'n2')).toEqual([]);
    });

    it('should prefer fewer hops', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n3', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n4', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      network.connect('n2', 'n3');
      network.connect('n3', 'n4');
      network.connect('n1', 'n4'); // direct path
      expect(network.getOptimalPath('n1', 'n4')).toEqual(['n1', 'n4']);
    });
  });

  // ============================================================
  // getNodeLoad
  // ============================================================
  describe('getNodeLoad', () => {
    it('should return node load', () => {
      network.addNode({ id: 'n1', load: 0.7, healthy: true, latency: 10 });
      expect(network.getNodeLoad('n1')).toBe(0.7);
    });

    it('should return -1 for unknown node', () => {
      expect(network.getNodeLoad('unknown')).toBe(-1);
    });
  });

  // ============================================================
  // getLeastLoadedNode
  // ============================================================
  describe('getLeastLoadedNode', () => {
    it('should return least loaded healthy node', () => {
      network.addNode({ id: 'n1', load: 0.8, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.3, healthy: true, latency: 10 });
      network.addNode({ id: 'n3', load: 0.6, healthy: true, latency: 10 });
      expect(network.getLeastLoadedNode()).toBe('n2');
    });

    it('should ignore unhealthy nodes', () => {
      network.addNode({ id: 'n1', load: 0.3, healthy: false, latency: 10 });
      network.addNode({ id: 'n2', load: 0.8, healthy: true, latency: 10 });
      expect(network.getLeastLoadedNode()).toBe('n2');
    });

    it('should return null for empty network', () => {
      expect(network.getLeastLoadedNode()).toBeNull();
    });
  });

  // ============================================================
  // balance
  // ============================================================
  describe('balance', () => {
    it('should redistribute load', () => {
      network.addNode({ id: 'n1', load: 0.9, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.1, healthy: true, latency: 10 });
      network.balance();
      // Loads should be closer together
      expect(network.getNode('n1')!.load).toBeLessThan(0.9);
      expect(network.getNode('n2')!.load).toBeGreaterThan(0.1);
    });

    it('should not affect unhealthy nodes', () => {
      network.addNode({ id: 'n1', load: 0.9, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.1, healthy: false, latency: 10 });
      network.balance();
      expect(network.getNode('n2')!.load).toBe(0.1);
    });

    it('should handle single node', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.balance(); // Should not crash
      expect(network.getNodeCount()).toBe(1);
    });
  });

  // ============================================================
  // recover
  // ============================================================
  describe('recover', () => {
    it('should recover unhealthy nodes', () => {
      network.addNode({ id: 'n1', load: 0.9, healthy: false, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      const count = network.recover();
      expect(count).toBe(1);
      expect(network.getNode('n1')!.healthy).toBe(true);
    });

    it('should return count of recovered nodes', () => {
      network.addNode({ id: 'n1', load: 0.9, healthy: false, latency: 10 });
      network.addNode({ id: 'n2', load: 0.9, healthy: false, latency: 10 });
      expect(network.recover()).toBe(2);
    });
  });

  // ============================================================
  // getHealthyNodes
  // ============================================================
  describe('getHealthyNodes', () => {
    it('should return only healthy nodes', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: false, latency: 10 });
      network.addNode({ id: 'n3', load: 0.5, healthy: true, latency: 10 });
      expect(network.getHealthyNodes()).toHaveLength(2);
    });

    it('should return empty for all unhealthy', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: false, latency: 10 });
      expect(network.getHealthyNodes()).toHaveLength(0);
    });
  });

  // ============================================================
  // getAverageLatency
  // ============================================================
  describe('getAverageLatency', () => {
    it('should calculate average latency', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 20 });
      expect(network.getAverageLatency()).toBe(15);
    });

    it('should return 0 for empty', () => {
      expect(network.getAverageLatency()).toBe(0);
    });
  });

  // ============================================================
  // updateLoad
  // ============================================================
  describe('updateLoad', () => {
    it('should update node load', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.updateLoad('n1', 0.8);
      expect(network.getNodeLoad('n1')).toBe(0.8);
    });

    it('should clamp load to 0-1', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.updateLoad('n1', 1.5);
      expect(network.getNodeLoad('n1')).toBe(1);
      network.updateLoad('n1', -0.5);
      expect(network.getNodeLoad('n1')).toBe(0);
    });

    it('should return false for unknown node', () => {
      expect(network.updateLoad('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // markUnhealthy
  // ============================================================
  describe('markUnhealthy', () => {
    it('should mark node unhealthy', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.markUnhealthy('n1');
      expect(network.getNode('n1')!.healthy).toBe(false);
    });

    it('should return false for unknown node', () => {
      expect(network.markUnhealthy('unknown')).toBe(false);
    });
  });

  // ============================================================
  // removeNode
  // ============================================================
  describe('removeNode', () => {
    it('should remove node', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.removeNode('n1');
      expect(network.getNodeCount()).toBe(0);
    });

    it('should remove connections', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      network.removeNode('n1');
      expect(network.getConnectionCount()).toBe(0);
    });

    it('should return false for unknown node', () => {
      expect(network.removeNode('unknown')).toBe(false);
    });
  });

  // ============================================================
  // isFullyConnected
  // ============================================================
  describe('isFullyConnected', () => {
    it('should return true for single node', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      expect(network.isFullyConnected()).toBe(true);
    });

    it('should return true for connected network', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      expect(network.isFullyConnected()).toBe(true);
    });

    it('should return false for disconnected network', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      expect(network.isFullyConnected()).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle circular paths', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      network.connect('n2', 'n1');
      expect(network.getOptimalPath('n1', 'n2')).toEqual(['n1', 'n2']);
    });

    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        network.addNode({ id: `n${i}`, load: 0.5, healthy: true, latency: 10 });
      }
      expect(network.getNodeCount()).toBe(50);
    });

    it('should handle dense connections', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n2', load: 0.5, healthy: true, latency: 10 });
      network.addNode({ id: 'n3', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n2');
      network.connect('n1', 'n3');
      network.connect('n2', 'n3');
      expect(network.getConnectionCount()).toBe(3);
    });

    it('should handle self-loop', () => {
      network.addNode({ id: 'n1', load: 0.5, healthy: true, latency: 10 });
      network.connect('n1', 'n1');
      expect(network.getOptimalPath('n1', 'n1')).toEqual(['n1']);
    });
  });
});