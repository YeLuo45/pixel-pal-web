/**
 * TopologyMapper Tests
 * nanobot-design Topology Mapper
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TopologyMapper } from '../TopologyMapper';

describe('TopologyMapper', () => {
  let mapper: TopologyMapper;

  beforeEach(() => {
    mapper = new TopologyMapper();
  });

  afterEach(() => {
    mapper.clearAll();
  });

  // ============================================================
  // addNode / addLink
  // ============================================================
  describe('addNode / addLink', () => {
    it('should add node', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      expect(mapper.getNodeCount()).toBe(1);
    });

    it('should add link', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      expect(mapper.getLinkCount()).toBe(1);
    });
  });

  // ============================================================
  // getSubnets / getNodesInSubnet
  // ============================================================
  describe('getSubnets / getNodesInSubnet', () => {
    it('should get subnets', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's2' });
      expect(mapper.getSubnets()).toHaveLength(2);
    });

    it('should get nodes in subnet', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n3', type: 'service', subnet: 's2' });
      expect(mapper.getNodesInSubnet('s1')).toHaveLength(2);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's2' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      const stats = mapper.getStats();
      expect(stats.nodes).toBe(2);
      expect(stats.links).toBe(1);
      expect(stats.subnets).toBe(2);
      expect(stats.avgConnections).toBe(0.5);
    });

    it('should return 0 for empty', () => {
      const stats = mapper.getStats();
      expect(stats.nodes).toBe(0);
      expect(stats.avgConnections).toBe(0);
    });
  });

  // ============================================================
  // node queries
  // ============================================================
  describe('node queries', () => {
    it('should get node', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      expect(mapper.getNode('n1')?.subnet).toBe('s1');
    });

    it('should get all', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      expect(mapper.getAllNodes()).toHaveLength(1);
    });

    it('should remove node', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      expect(mapper.removeNode('n1')).toBe(true);
    });

    it('should remove links when node removed', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      mapper.removeNode('n1');
      expect(mapper.getLinkCount()).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(mapper.removeNode('unknown')).toBe(false);
    });

    it('should check existence', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      expect(mapper.hasNode('n1')).toBe(true);
    });
  });

  // ============================================================
  // getNodesByType / getNodeType / getSubnetOfNode
  // ============================================================
  describe('type queries', () => {
    it('should get by type', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'database', subnet: 's1' });
      expect(mapper.getNodesByType('service')).toHaveLength(1);
    });

    it('should get node type', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      expect(mapper.getNodeType('n1')).toBe('service');
    });

    it('should return undefined for unknown', () => {
      expect(mapper.getNodeType('unknown')).toBeUndefined();
    });

    it('should get subnet of node', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      expect(mapper.getSubnetOfNode('n1')).toBe('s1');
    });
  });

  // ============================================================
  // link queries
  // ============================================================
  describe('link queries', () => {
    beforeEach(() => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n3', type: 'service', subnet: 's1' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      mapper.addLink({ source: 'n2', target: 'n3', weight: 1 });
    });

    it('should get links for node', () => {
      expect(mapper.getLinksForNode('n2')).toHaveLength(2);
    });

    it('should get outgoing', () => {
      expect(mapper.getOutgoingLinks('n1')).toHaveLength(1);
    });

    it('should get incoming', () => {
      expect(mapper.getIncomingLinks('n2')).toHaveLength(1);
    });

    it('should get degree', () => {
      expect(mapper.getDegree('n2')).toBe(2);
    });

    it('should remove link', () => {
      expect(mapper.removeLink('n1', 'n2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mapper.removeLink('unknown', 'n2')).toBe(false);
    });

    it('should check link existence', () => {
      expect(mapper.hasLink('n1', 'n2')).toBe(true);
    });
  });

  // ============================================================
  // subnet analysis
  // ============================================================
  describe('subnet analysis', () => {
    it('should get subnet size', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      expect(mapper.getSubnetSize('s1')).toBe(2);
    });

    it('should get subnet links', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n3', type: 'service', subnet: 's2' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      mapper.addLink({ source: 'n1', target: 'n3', weight: 1 });
      expect(mapper.getSubnetLinks('s1')).toHaveLength(1);
    });

    it('should get cross-subnet links', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's2' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      expect(mapper.getCrossSubnetLinks()).toHaveLength(1);
    });
  });

  // ============================================================
  // isolated / connected
  // ============================================================
  describe('isolated / connected', () => {
    it('should get isolated', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      mapper.addNode({ id: 'n3', type: 'service', subnet: 's1' });
      expect(mapper.getIsolatedNodes()).toHaveLength(1);
    });

    it('should return empty for all connected', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      expect(mapper.getIsolatedNodes()).toHaveLength(0);
    });

    it('should check connectivity', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      expect(mapper.isConnected()).toBe(false);
    });

    it('should return true for empty', () => {
      expect(mapper.isConnected()).toBe(true);
    });
  });

  // ============================================================
  // getMaxDegreeNode
  // ============================================================
  describe('getMaxDegreeNode', () => {
    it('should return null for empty', () => {
      expect(mapper.getMaxDegreeNode()).toBeNull();
    });

    it('should get max degree', () => {
      mapper.addNode({ id: 'n1', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n2', type: 'service', subnet: 's1' });
      mapper.addNode({ id: 'n3', type: 'service', subnet: 's1' });
      mapper.addLink({ source: 'n1', target: 'n2', weight: 1 });
      mapper.addLink({ source: 'n1', target: 'n3', weight: 1 });
      expect(mapper.getMaxDegreeNode()?.id).toBe('n1');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        mapper.addNode({ id: `n${i}`, type: 'service', subnet: 's1' });
      }
      expect(mapper.getNodeCount()).toBe(50);
    });
  });
});