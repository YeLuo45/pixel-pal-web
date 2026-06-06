/**
 * ClusterManager Tests
 * nanobot-design Cluster Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClusterManager } from '../ClusterManager';

describe('ClusterManager', () => {
  let clm: ClusterManager;

  beforeEach(() => {
    clm = new ClusterManager();
  });

  afterEach(() => {
    clm.clearAll();
  });

  // ============================================================
  // create / addNode / removeNode / remove
  // ============================================================
  describe('create / addNode / removeNode / remove', () => {
    it('should create', () => {
      expect(clm.create('c1')).toBe('clm-1');
    });

    it('should mark as active', () => {
      const id = clm.create('c1');
      expect(clm.isActive(id)).toBe(true);
    });

    it('should mark as empty', () => {
      const id = clm.create('c1');
      expect(clm.isEmpty(id)).toBe(true);
    });

    it('should add node', () => {
      const id = clm.create('c1');
      expect(clm.addNode(id, 'n1')).toBe(true);
    });

    it('should not add duplicate node', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      clm.addNode(id, 'n1');
      expect(clm.getNodeCount(id)).toBe(1);
    });

    it('should not add inactive', () => {
      const id = clm.create('c1');
      clm.setActive(id, false);
      expect(clm.addNode(id, 'n1')).toBe(false);
    });

    it('should return false for unknown addNode', () => {
      expect(clm.addNode('unknown', 'n1')).toBe(false);
    });

    it('should remove node', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      expect(clm.removeNode(id, 'n1')).toBe(true);
    });

    it('should not remove missing node', () => {
      const id = clm.create('c1');
      expect(clm.removeNode(id, 'n1')).toBe(false);
    });

    it('should return false for unknown removeNode', () => {
      expect(clm.removeNode('unknown', 'n1')).toBe(false);
    });

    it('should remove', () => {
      const id = clm.create('c1');
      expect(clm.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      clm.create('c1');
      const stats = clm.getStats();
      expect(stats.clusters).toBe(1);
    });

    it('should count total nodes', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      clm.addNode(id, 'n2');
      expect(clm.getStats().totalNodes).toBe(2);
    });

    it('should count active', () => {
      clm.create('c1');
      expect(clm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = clm.create('c1');
      clm.setActive(id, false);
      expect(clm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      expect(clm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      clm.create('c1');
      clm.create('c2');
      expect(clm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg nodes', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      clm.addNode(id, 'n2');
      expect(clm.getStats().avgNodes).toBe(2);
    });

    it('should get max nodes', () => {
      const id1 = clm.create('c1');
      const id2 = clm.create('c2');
      clm.addNode(id1, 'n1');
      clm.addNode(id2, 'n1');
      clm.addNode(id2, 'n2');
      expect(clm.getStats().maxNodes).toBe(2);
    });

    it('should get min nodes', () => {
      clm.create('c1');
      expect(clm.getStats().minNodes).toBe(0);
    });

    it('should count unique nodes', () => {
      const id1 = clm.create('c1');
      const id2 = clm.create('c2');
      clm.addNode(id1, 'n1');
      clm.addNode(id2, 'n1');
      expect(clm.getStats().uniqueNodes).toBe(1);
    });

    it('should count empty clusters', () => {
      clm.create('c1');
      expect(clm.getStats().emptyClusters).toBe(1);
    });

    it('should get largest cluster', () => {
      clm.create('c1');
      clm.create('c2');
      expect(clm.getStats().largestCluster).toBe('c1');
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get cluster', () => {
      clm.create('c1');
      expect(clm.getCluster('clm-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      clm.create('c1');
      expect(clm.getAllClusters()).toHaveLength(1);
    });

    it('should check existence', () => {
      clm.create('c1');
      expect(clm.hasCluster('clm-1')).toBe(true);
    });

    it('should count', () => {
      expect(clm.getCount()).toBe(0);
      clm.create('c1');
      expect(clm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      clm.create('c1');
      expect(clm.getName('clm-1')).toBe('c1');
    });

    it('should get nodes', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      expect(clm.getNodes(id)).toEqual(['n1']);
    });

    it('should get node count', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      expect(clm.getNodeCount(id)).toBe(1);
    });

    it('should get history', () => {
      clm.create('c1');
      expect(clm.getHistory('clm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      expect(clm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      clm.create('c1');
      expect(clm.setActive('clm-1', false)).toBe(true);
    });

    it('should set name', () => {
      clm.create('c1');
      expect(clm.setName('clm-1', 'c2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(clm.setActive('unknown', false)).toBe(false);
      expect(clm.setName('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      clm.setActive(id, false);
      clm.resetAll();
      expect(clm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      clm.create('c1');
      expect(clm.getByName('c1')).toHaveLength(1);
    });

    it('should get active', () => {
      clm.create('c1');
      expect(clm.getActiveClusters()).toHaveLength(1);
    });

    it('should get inactive', () => {
      clm.create('c1');
      clm.setActive('clm-1', false);
      expect(clm.getInactiveClusters()).toHaveLength(1);
    });

    it('should get empty clusters', () => {
      clm.create('c1');
      expect(clm.getEmptyClusters()).toHaveLength(1);
    });

    it('should get all names', () => {
      clm.create('c1');
      clm.create('c2');
      expect(clm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      clm.create('c1');
      expect(clm.getNameCount()).toBe(1);
    });

    it('should get by min nodes', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      clm.addNode(id, 'n2');
      expect(clm.getByMinNodes(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get largest', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      clm.addNode(id, 'n2');
      expect(clm.getLargest()?.id).toBe(id);
    });

    it('should return null for empty largest', () => {
      expect(clm.getLargest()).toBeNull();
    });

    it('should get newest', () => {
      clm.create('c1');
      expect(clm.getNewest()?.id).toBe('clm-1');
    });

    it('should return null for empty newest', () => {
      expect(clm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      clm.create('c1');
      expect(clm.getOldest()?.id).toBe('clm-1');
    });

    it('should return null for empty oldest', () => {
      expect(clm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      clm.create('c1');
      expect(clm.getCreatedAt('clm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = clm.create('c1');
      clm.addNode(id, 'n1');
      expect(clm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many clusters', () => {
      for (let i = 0; i < 50; i++) {
        clm.create(`c${i}`);
      }
      expect(clm.getCount()).toBe(50);
    });
  });
});