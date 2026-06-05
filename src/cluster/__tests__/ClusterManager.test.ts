/**
 * ClusterManager Tests
 * nanobot-design Cluster Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClusterManager } from '../ClusterManager';

describe('ClusterManager', () => {
  let manager: ClusterManager;

  beforeEach(() => {
    manager = new ClusterManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  // ============================================================
  // createCluster
  // ============================================================
  describe('createCluster', () => {
    it('should create cluster', () => {
      const id = manager.createCluster('test');
      expect(id).toBe('cluster-1');
    });

    it('should set status to active', () => {
      const id = manager.createCluster('test');
      expect(manager.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // addNode
  // ============================================================
  describe('addNode', () => {
    it('should add node', () => {
      const id = manager.createCluster('test');
      expect(manager.addNode(id, 'node1')).toBe(true);
    });

    it('should return false for unknown cluster', () => {
      expect(manager.addNode('unknown', 'node1')).toBe(false);
    });

    it('should not add duplicate', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'node1');
      manager.addNode(id, 'node1');
      expect(manager.getNodeCount(id)).toBe(1);
    });
  });

  // ============================================================
  // removeNode
  // ============================================================
  describe('removeNode', () => {
    it('should remove node', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'node1');
      expect(manager.removeNode(id, 'node1')).toBe(true);
    });

    it('should return false for unknown cluster', () => {
      expect(manager.removeNode('unknown', 'node1')).toBe(false);
    });

    it('should return false for unknown node', () => {
      const id = manager.createCluster('test');
      expect(manager.removeNode(id, 'unknown')).toBe(false);
    });

    it('should clear leader if leader removed', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'node1');
      manager.setLeader(id, 'node1');
      manager.removeNode(id, 'node1');
      expect(manager.getLeader(id)).toBeNull();
    });
  });

  // ============================================================
  // setLeader
  // ============================================================
  describe('setLeader', () => {
    it('should set leader', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'node1');
      expect(manager.setLeader(id, 'node1')).toBe(true);
    });

    it('should return false for unknown cluster', () => {
      expect(manager.setLeader('unknown', 'node1')).toBe(false);
    });

    it('should return false for non-member node', () => {
      const id = manager.createCluster('test');
      expect(manager.setLeader(id, 'unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      manager.createCluster('test');
      const stats = manager.getStats();
      expect(stats.clusters).toBe(1);
    });

    it('should count nodes', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'n1');
      manager.addNode(id, 'n2');
      expect(manager.getStats().nodes).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get cluster', () => {
      manager.createCluster('test');
      expect(manager.getCluster('cluster-1')?.name).toBe('test');
    });

    it('should get all', () => {
      manager.createCluster('a');
      manager.createCluster('b');
      expect(manager.getAllClusters()).toHaveLength(2);
    });

    it('should remove', () => {
      const id = manager.createCluster('test');
      expect(manager.removeCluster(id)).toBe(true);
    });

    it('should check existence', () => {
      manager.createCluster('test');
      expect(manager.hasCluster('cluster-1')).toBe(true);
    });

    it('should count', () => {
      expect(manager.getCount()).toBe(0);
      manager.createCluster('test');
      expect(manager.getCount()).toBe(1);
    });
  });

  // ============================================================
  // name / nodes
  // ============================================================
  describe('name / nodes', () => {
    it('should get name', () => {
      manager.createCluster('test');
      expect(manager.getName('cluster-1')).toBe('test');
    });

    it('should get nodes', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'n1');
      expect(manager.getNodes(id)).toEqual(['n1']);
    });

    it('should get node count', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'n1');
      expect(manager.getNodeCount(id)).toBe(1);
    });

    it('should check hasNode', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'n1');
      expect(manager.hasNode(id, 'n1')).toBe(true);
    });
  });

  // ============================================================
  // leader
  // ============================================================
  describe('leader', () => {
    it('should get leader', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'n1');
      manager.setLeader(id, 'n1');
      expect(manager.getLeader(id)).toBe('n1');
    });

    it('should check hasLeader', () => {
      const id = manager.createCluster('test');
      expect(manager.hasLeader(id)).toBe(false);
    });

    it('should get leaderless', () => {
      manager.createCluster('test');
      expect(manager.getLeaderless()).toHaveLength(1);
    });
  });

  // ============================================================
  // status
  // ============================================================
  describe('status', () => {
    it('should get status', () => {
      manager.createCluster('test');
      expect(manager.getStatus('cluster-1')).toBe('active');
    });

    it('should set status', () => {
      const id = manager.createCluster('test');
      expect(manager.setStatus(id, 'inactive')).toBe(true);
    });

    it('should activate', () => {
      const id = manager.createCluster('test');
      manager.deactivate(id);
      manager.activate(id);
      expect(manager.isActive(id)).toBe(true);
    });

    it('should deactivate', () => {
      const id = manager.createCluster('test');
      manager.deactivate(id);
      expect(manager.isInactive(id)).toBe(true);
    });

    it('should drain', () => {
      const id = manager.createCluster('test');
      manager.drain(id);
      expect(manager.isDraining(id)).toBe(true);
    });

    it('should return false for unknown setStatus', () => {
      expect(manager.setStatus('unknown', 'active')).toBe(false);
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get by status', () => {
      manager.createCluster('test');
      expect(manager.getByStatus('active')).toHaveLength(1);
    });

    it('should get active', () => {
      manager.createCluster('test');
      expect(manager.getActive()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = manager.createCluster('test');
      manager.deactivate(id);
      expect(manager.getInactive()).toHaveLength(1);
    });

    it('should get draining', () => {
      const id = manager.createCluster('test');
      manager.drain(id);
      expect(manager.getDraining()).toHaveLength(1);
    });
  });

  // ============================================================
  // by name
  // ============================================================
  describe('by name', () => {
    it('should get by name', () => {
      manager.createCluster('test');
      expect(manager.getByName('test')?.id).toBe('cluster-1');
    });

    it('should get clusters for node', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'n1');
      expect(manager.getClustersForNode('n1')).toHaveLength(1);
    });
  });

  // ============================================================
  // rename
  // ============================================================
  describe('rename', () => {
    it('should rename', () => {
      const id = manager.createCluster('test');
      expect(manager.rename(id, 'new')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(manager.rename('unknown', 'new')).toBe(false);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      manager.createCluster('test');
      expect(manager.getCreatedAt('cluster-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      manager.createCluster('test');
      expect(manager.getUpdatedAt('cluster-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // node stats
  // ============================================================
  describe('node stats', () => {
    it('should get total node count', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'n1');
      expect(manager.getTotalNodeCount()).toBe(1);
    });

    it('should get avg node count', () => {
      manager.createCluster('test');
      expect(manager.getAvgNodeCount()).toBe(0);
    });

    it('should get largest cluster', () => {
      const id = manager.createCluster('test');
      manager.addNode(id, 'n1');
      expect(manager.getLargestCluster()?.id).toBe('cluster-1');
    });

    it('should return null for empty largest', () => {
      expect(manager.getLargestCluster()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many clusters', () => {
      for (let i = 0; i < 50; i++) {
        manager.createCluster(`c${i}`);
      }
      expect(manager.getCount()).toBe(50);
    });
  });
});