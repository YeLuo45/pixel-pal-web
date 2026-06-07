/**
 * TopologyEngine Tests
 * nanobot-design Topology Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TopologyEngine } from '../TopologyEngine';

describe('TopologyEngine', () => {
  let toe: TopologyEngine;

  beforeEach(() => {
    toe = new TopologyEngine();
  });

  afterEach(() => {
    toe.clearAll();
  });

  describe('addNode / addLink / query / neighbors / remove', () => {
    it('should add node', () => {
      expect(toe.addNode('n1')).toMatch(/^toe-n-/);
    });

    it('should default status to online', () => {
      toe.addNode('n1');
      expect(toe.getNodeStatus(toe.getAllNodes()[0].id)).toBe('online');
    });

    it('should mark as active', () => {
      const id = toe.addNode('n1');
      expect(toe.isActive(id)).toBe(true);
    });

    it('should add link', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      expect(toe.addLink(a, b)).toMatch(/^toe-l-/);
    });

    it('should query', () => {
      const id = toe.addNode('n1');
      expect(toe.query(id)?.name).toBe('n1');
    });

    it('should return undefined for unknown query', () => {
      expect(toe.query('unknown')).toBeUndefined();
    });

    it('should get neighbors', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b);
      expect(toe.neighbors(a)).toHaveLength(1);
    });

    it('should get empty neighbors for unlinked node', () => {
      const a = toe.addNode('a');
      expect(toe.neighbors(a)).toHaveLength(0);
    });

    it('should remove node', () => {
      const id = toe.addNode('n1');
      expect(toe.removeNode(id)).toBe(true);
    });

    it('should remove link', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      const lid = toe.addLink(a, b);
      expect(toe.removeLink(lid)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      toe.addNode('n1');
      expect(toe.getStats().nodes).toBe(1);
    });

    it('should count links', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b);
      expect(toe.getStats().links).toBe(1);
    });

    it('should count total nodes', () => {
      toe.addNode('n1');
      expect(toe.getStats().totalNodes).toBe(1);
    });

    it('should count total links', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b);
      expect(toe.getStats().totalLinks).toBe(1);
    });

    it('should count online', () => {
      toe.addNode('n1', 'online');
      expect(toe.getStats().online).toBe(1);
    });

    it('should count offline', () => {
      toe.addNode('n1', 'offline');
      expect(toe.getStats().offline).toBe(1);
    });

    it('should count degraded', () => {
      toe.addNode('n1', 'degraded');
      expect(toe.getStats().degraded).toBe(1);
    });

    it('should count active nodes', () => {
      toe.addNode('n1');
      expect(toe.getStats().activeNodes).toBe(1);
    });

    it('should count inactive nodes', () => {
      const id = toe.addNode('n1');
      toe.setActiveNode(id, false);
      expect(toe.getStats().inactiveNodes).toBe(1);
    });

    it('should count active links', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b);
      expect(toe.getStats().activeLinks).toBe(1);
    });

    it('should count inactive links', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      const lid = toe.addLink(a, b);
      toe.setActiveLink(lid, false);
      expect(toe.getStats().inactiveLinks).toBe(1);
    });

    it('should count unique node names', () => {
      toe.addNode('a');
      toe.addNode('a');
      expect(toe.getStats().uniqueNodeNames).toBe(1);
    });

    it('should count total weight', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b, 5);
      expect(toe.getStats().totalWeight).toBe(5);
    });
  });

  describe('queries', () => {
    it('should get node', () => {
      const id = toe.addNode('n1');
      expect(toe.getNode(id)?.name).toBe('n1');
    });

    it('should get link', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      const lid = toe.addLink(a, b);
      expect(toe.getLink(lid)?.from).toBe(a);
    });

    it('should get all nodes', () => {
      toe.addNode('n1');
      expect(toe.getAllNodes()).toHaveLength(1);
    });

    it('should get all links', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b);
      expect(toe.getAllLinks()).toHaveLength(1);
    });

    it('should check node existence', () => {
      const id = toe.addNode('n1');
      expect(toe.hasNode(id)).toBe(true);
    });

    it('should check link existence', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      const lid = toe.addLink(a, b);
      expect(toe.hasLink(lid)).toBe(true);
    });

    it('should count nodes', () => {
      expect(toe.getNodeCount()).toBe(0);
      toe.addNode('n1');
      expect(toe.getNodeCount()).toBe(1);
    });

    it('should count links', () => {
      expect(toe.getLinkCount()).toBe(0);
    });
  });

  describe('accessors', () => {
    it('should get node name', () => {
      const id = toe.addNode('n1');
      expect(toe.getNodeName(id)).toBe('n1');
    });

    it('should get node status', () => {
      const id = toe.addNode('n1', 'offline');
      expect(toe.getNodeStatus(id)).toBe('offline');
    });

    it('should get link weight', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      const lid = toe.addLink(a, b, 5);
      expect(toe.getLinkWeight(lid)).toBe(5);
    });

    it('should check online', () => {
      const id = toe.addNode('n1', 'online');
      expect(toe.isOnline(id)).toBe(true);
    });

    it('should check offline', () => {
      const id = toe.addNode('n1', 'offline');
      expect(toe.isOffline(id)).toBe(true);
    });

    it('should check degraded', () => {
      const id = toe.addNode('n1', 'degraded');
      expect(toe.isDegraded(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set node status', () => {
      const id = toe.addNode('n1');
      expect(toe.setNodeStatus(id, 'offline')).toBe(true);
    });

    it('should set link weight', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      const lid = toe.addLink(a, b);
      expect(toe.setLinkWeight(lid, 5)).toBe(true);
    });

    it('should set active node', () => {
      const id = toe.addNode('n1');
      expect(toe.setActiveNode(id, false)).toBe(true);
    });

    it('should set active link', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      const lid = toe.addLink(a, b);
      expect(toe.setActiveLink(lid, false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(toe.setNodeStatus('unknown', 'offline')).toBe(false);
      expect(toe.setLinkWeight('unknown', 1)).toBe(false);
      expect(toe.setActiveNode('unknown', false)).toBe(false);
      expect(toe.setActiveLink('unknown', false)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = toe.addNode('n1');
      toe.setActiveNode(id, false);
      toe.resetAll();
      expect(toe.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      toe.addNode('n1', 'offline');
      expect(toe.getByStatus('offline')).toHaveLength(1);
    });

    it('should get active nodes', () => {
      toe.addNode('n1');
      expect(toe.getActiveNodes()).toHaveLength(1);
    });

    it('should get inactive nodes', () => {
      const id = toe.addNode('n1');
      toe.setActiveNode(id, false);
      expect(toe.getInactiveNodes()).toHaveLength(1);
    });

    it('should get active links', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b);
      expect(toe.getActiveLinks()).toHaveLength(1);
    });

    it('should get inactive links', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      const lid = toe.addLink(a, b);
      toe.setActiveLink(lid, false);
      expect(toe.getInactiveLinks()).toHaveLength(1);
    });

    it('should get all node names', () => {
      toe.addNode('a');
      toe.addNode('b');
      expect(toe.getAllNodeNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest node', () => {
      toe.addNode('n1');
      expect(toe.getNewestNode()?.name).toBe('n1');
    });

    it('should return null for empty newest node', () => {
      expect(toe.getNewestNode()).toBeNull();
    });

    it('should get newest link', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b);
      expect(toe.getNewestLink()?.from).toBe(a);
    });

    it('should return null for empty newest link', () => {
      expect(toe.getNewestLink()).toBeNull();
    });
  });

  describe('totals', () => {
    it('should get total nodes', () => {
      toe.addNode('n1');
      expect(toe.getTotalNodes()).toBe(1);
    });

    it('should get total links', () => {
      const a = toe.addNode('a');
      const b = toe.addNode('b');
      toe.addLink(a, b);
      expect(toe.getTotalLinks()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        toe.addNode(`n${i}`);
      }
      expect(toe.getNodeCount()).toBe(50);
    });
  });
});