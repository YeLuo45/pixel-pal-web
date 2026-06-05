/**
 * MeshNetwork Tests
 * nanobot-design Mesh Network
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MeshNetwork } from '../MeshNetwork';

describe('MeshNetwork', () => {
  let mesh: MeshNetwork;

  beforeEach(() => {
    mesh = new MeshNetwork();
  });

  afterEach(() => {
    mesh.clearAll();
  });

  // ============================================================
  // addNode
  // ============================================================
  describe('addNode', () => {
    it('should add node', () => {
      expect(mesh.addNode('n1')).toBe(true);
    });

    it('should reject duplicate', () => {
      mesh.addNode('n1');
      expect(mesh.addNode('n1')).toBe(false);
    });
  });

  // ============================================================
  // connect
  // ============================================================
  describe('connect', () => {
    it('should connect', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      expect(mesh.connect('n1', 'n2')).toBe(true);
    });

    it('should be bidirectional', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.isPeer('n2', 'n1')).toBe(true);
    });

    it('should return false for unknown from', () => {
      expect(mesh.connect('unknown', 'n2')).toBe(false);
    });

    it('should return false for unknown to', () => {
      mesh.addNode('n1');
      expect(mesh.connect('n1', 'unknown')).toBe(false);
    });
  });

  // ============================================================
  // send
  // ============================================================
  describe('send', () => {
    it('should send direct', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.send('n1', 'n2', 'hello')).toBe('msg-1');
    });

    it('should send indirect', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.addNode('n3');
      mesh.connect('n1', 'n2');
      mesh.connect('n2', 'n3');
      expect(mesh.send('n1', 'n3', 'hello')).toBe('msg-1');
    });

    it('should return null for disconnected', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      expect(mesh.send('n1', 'n2', 'hi')).toBeNull();
    });

    it('should return null for unknown', () => {
      expect(mesh.send('unknown', 'n2', 'hi')).toBeNull();
    });
  });

  // ============================================================
  // getTopology
  // ============================================================
  describe('getTopology', () => {
    it('should get topology', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      const topology = mesh.getTopology();
      expect(topology.get('n1')).toContain('n2');
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get node', () => {
      mesh.addNode('n1');
      expect(mesh.getNode('n1')?.id).toBe('n1');
    });

    it('should get all', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      expect(mesh.getAllNodes()).toHaveLength(2);
    });

    it('should remove', () => {
      mesh.addNode('n1');
      expect(mesh.removeNode('n1')).toBe(true);
    });

    it('should check existence', () => {
      mesh.addNode('n1');
      expect(mesh.hasNode('n1')).toBe(true);
    });

    it('should count', () => {
      expect(mesh.getCount()).toBe(0);
      mesh.addNode('n1');
      expect(mesh.getCount()).toBe(1);
    });
  });

  // ============================================================
  // peers
  // ============================================================
  describe('peers', () => {
    it('should get peers', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.getPeers('n1')).toEqual(['n2']);
    });

    it('should get peer count', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.getPeerCount('n1')).toBe(1);
    });

    it('should check isPeer', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.isPeer('n1', 'n2')).toBe(true);
    });

    it('should disconnect', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.disconnect('n1', 'n2')).toBe(true);
    });

    it('should return false for unknown disconnect', () => {
      expect(mesh.disconnect('unknown', 'n2')).toBe(false);
    });
  });

  // ============================================================
  // messages
  // ============================================================
  describe('messages', () => {
    it('should get messages', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      mesh.send('n1', 'n2', 'hi');
      expect(mesh.getMessages()).toHaveLength(1);
    });

    it('should get message by id', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      const id = mesh.send('n1', 'n2', 'hi');
      expect(mesh.getMessage(id!)?.content).toBe('hi');
    });

    it('should count messages', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      mesh.send('n1', 'n2', 'hi');
      expect(mesh.getMessageCount()).toBe(1);
    });

    it('should get messages for node', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      mesh.send('n1', 'n2', 'hi');
      expect(mesh.getMessagesForNode('n2')).toHaveLength(1);
    });
  });

  // ============================================================
  // reachability
  // ============================================================
  describe('reachability', () => {
    it('should set reachable', () => {
      mesh.addNode('n1');
      expect(mesh.setReachable('n1', false)).toBe(true);
    });

    it('should check isReachable', () => {
      mesh.addNode('n1');
      expect(mesh.isReachable('n1')).toBe(true);
    });

    it('should get reachable', () => {
      mesh.addNode('n1');
      expect(mesh.getReachableNodes()).toHaveLength(1);
    });

    it('should get unreachable', () => {
      mesh.addNode('n1');
      mesh.setReachable('n1', false);
      expect(mesh.getUnreachableNodes()).toHaveLength(1);
    });

    it('should return false for setReachable unknown', () => {
      expect(mesh.setReachable('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // connectivity
  // ============================================================
  describe('connectivity', () => {
    it('should check isConnected', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.isConnected('n1', 'n2')).toBe(true);
    });

    it('should return false for disconnected', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      expect(mesh.isConnected('n1', 'n2')).toBe(false);
    });
  });

  // ============================================================
  // network stats
  // ============================================================
  describe('network stats', () => {
    it('should get network size', () => {
      mesh.addNode('n1');
      expect(mesh.getNetworkSize()).toBe(1);
    });

    it('should get edge count', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.getEdgeCount()).toBe(1);
    });

    it('should get avg degree', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.connect('n1', 'n2');
      expect(mesh.getAvgDegree()).toBe(1);
    });

    it('should get max degree', () => {
      mesh.addNode('n1');
      mesh.addNode('n2');
      mesh.addNode('n3');
      mesh.connect('n1', 'n2');
      mesh.connect('n1', 'n3');
      expect(mesh.getMaxDegree()).toBe(2);
    });

    it('should return 0 for empty avg', () => {
      expect(mesh.getAvgDegree()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        mesh.addNode(`n${i}`);
      }
      expect(mesh.getCount()).toBe(50);
    });
  });
});