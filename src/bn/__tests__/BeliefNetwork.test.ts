/**
 * BeliefNetwork Tests
 * generic-agent-design Belief Network
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BeliefNetwork } from '../BeliefNetwork';

describe('BeliefNetwork', () => {
  let bn: BeliefNetwork;

  beforeEach(() => {
    bn = new BeliefNetwork();
  });

  afterEach(() => {
    bn.clearAll();
  });

  // ============================================================
  // addNode / addEdge / query
  // ============================================================
  describe('addNode / addEdge / query', () => {
    it('should addNode', () => {
      expect(bn.addNode('n1', 0.5)).toBe('bn-1');
    });

    it('should addEdge', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      expect(bn.addEdge(n1, n2)).toBe(true);
    });

    it('should not addEdge to unknown', () => {
      expect(bn.addEdge('unknown', 'other')).toBe(false);
    });

    it('should not addEdge duplicate', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      expect(bn.addEdge(n1, n2)).toBe(false);
    });

    it('should query', () => {
      const id = bn.addNode('n1', 0.5);
      expect(bn.query(id)).toBe(0.5);
    });

    it('should return 0 for unknown query', () => {
      expect(bn.query('unknown')).toBe(0);
    });

    it('should increment hits on query', () => {
      const id = bn.addNode('n1', 0.5);
      bn.query(id);
      expect(bn.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      bn.addNode('n1', 0.5);
      const stats = bn.getStats();
      expect(stats.nodes).toBe(1);
    });

    it('should count edges', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      expect(bn.getStats().edges).toBe(1);
    });

    it('should compute total belief', () => {
      bn.addNode('n1', 0.3);
      bn.addNode('n2', 0.7);
      expect(bn.getStats().totalBelief).toBe(1);
    });

    it('should compute avg belief', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getStats().avgBelief).toBe(0.5);
    });

    it('should count total hits', () => {
      const id = bn.addNode('n1', 0.5);
      bn.query(id);
      expect(bn.getStats().totalHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get node', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getNode('bn-1')?.name).toBe('n1');
    });

    it('should get all', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getAllNodes()).toHaveLength(1);
    });

    it('should remove', () => {
      bn.addNode('n1', 0.5);
      expect(bn.removeNode('bn-1')).toBe(true);
    });

    it('should check existence', () => {
      bn.addNode('n1', 0.5);
      expect(bn.hasNode('bn-1')).toBe(true);
    });

    it('should count', () => {
      expect(bn.getCount()).toBe(0);
      bn.addNode('n1', 0.5);
      expect(bn.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getName('bn-1')).toBe('n1');
    });

    it('should get belief', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getBelief('bn-1')).toBe(0.5);
    });

    it('should get hits', () => {
      const id = bn.addNode('n1', 0.5);
      bn.query(id);
      expect(bn.getHits(id)).toBe(1);
    });

    it('should get edges', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      expect(bn.getEdges(n1)).toContain(n2);
    });

    it('should get edge count', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      expect(bn.getEdgeCount(n1)).toBe(1);
    });

    it('should check hasEdge', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      expect(bn.hasEdge(n1, n2)).toBe(true);
    });
  });

  // ============================================================
  // remove edge
  // ============================================================
  describe('remove edge', () => {
    it('should remove edge', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      expect(bn.removeEdge(n1, n2)).toBe(true);
    });

    it('should not remove non-existing edge', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      expect(bn.removeEdge(n1, n2)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(bn.removeEdge('unknown', 'other')).toBe(false);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set belief', () => {
      const id = bn.addNode('n1', 0.5);
      expect(bn.setBelief(id, 0.8)).toBe(true);
    });

    it('should set name', () => {
      const id = bn.addNode('n1', 0.5);
      expect(bn.setName(id, 'n2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bn.setBelief('unknown', 0.5)).toBe(false);
      expect(bn.setName('unknown', 'n')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = bn.addNode('n1', 0.5);
      bn.query(id);
      bn.resetHits();
      expect(bn.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      bn.query(n1);
      bn.resetAll();
      expect(bn.getEdgeCount(n1)).toBe(0);
      expect(bn.getHits(n1)).toBe(0);
    });
  });

  // ============================================================
  // by name / belief
  // ============================================================
  describe('by name / belief', () => {
    it('should get by name', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getByName('n1')).toHaveLength(1);
    });

    it('should get all names', () => {
      bn.addNode('n1', 0.5);
      bn.addNode('n2', 0.6);
      expect(bn.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getNameCount()).toBe(1);
    });

    it('should get by min belief', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getByMinBelief(0.3)).toHaveLength(1);
    });

    it('should get by max belief', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getByMaxBelief(0.7)).toHaveLength(1);
    });

    it('should get sorted by belief', () => {
      bn.addNode('low', 0.3);
      bn.addNode('high', 0.9);
      expect(bn.getSortedByBelief()[0].name).toBe('high');
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = bn.addNode('n1', 0.5);
      bn.query(id);
      expect(bn.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(bn.getMostHit()).toBeNull();
    });

    it('should get highest belief', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getHighestBelief()?.id).toBe('bn-1');
    });

    it('should return null for empty highest', () => {
      expect(bn.getHighestBelief()).toBeNull();
    });

    it('should get most connected', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      expect(bn.getMostConnected()?.id).toBe(n1);
    });

    it('should return null for empty most connected', () => {
      expect(bn.getMostConnected()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      bn.addNode('n1', 0.5);
      expect(bn.getCreatedAt('bn-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bn.addNode('n1', 0.5);
      bn.query(id);
      expect(bn.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge count
  // ============================================================
  describe('edge count', () => {
    it('should get edge count total', () => {
      const n1 = bn.addNode('n1', 0.5);
      const n2 = bn.addNode('n2', 0.8);
      bn.addEdge(n1, n2);
      expect(bn.getEdgeCountTotal()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        bn.addNode(`n${i}`, 0.5);
      }
      expect(bn.getCount()).toBe(50);
    });
  });
});