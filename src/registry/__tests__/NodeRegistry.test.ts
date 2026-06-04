/**
 * NodeRegistry Tests
 * nanobot Node Registry v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NodeRegistry } from '../NodeRegistry';

describe('NodeRegistry', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = new NodeRegistry();
  });

  afterEach(() => {
    registry.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register a node', () => {
      registry.register({
        nodeId: 'node-1',
        address: 'http://localhost:8080',
        status: 'active',
        metadata: { tags: { env: 'prod' } },
        serviceName: 'user-service',
      });

      const node = registry.getNode('node-1');
      expect(node).not.toBeNull();
      expect(node?.address).toBe('http://localhost:8080');
    });

    it('should set registeredAt and lastHeartbeat', () => {
      registry.register({
        nodeId: 'node-1',
        address: 'addr',
        status: 'active',
        metadata: { tags: {} },
        serviceName: 'svc',
      });

      const node = registry.getNode('node-1');
      expect(node?.registeredAt).toBeGreaterThan(0);
      expect(node?.lastHeartbeat).toBeGreaterThan(0);
    });

    it('should initialize loadFactor to 1.0', () => {
      registry.register({
        nodeId: 'node-1',
        address: 'addr',
        status: 'active',
        metadata: { tags: {} },
        serviceName: 'svc',
      });

      expect(registry.getNode('node-1')?.loadFactor).toBe(1.0);
    });

    it('should allow multiple nodes for same service', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.register({ nodeId: 'n2', address: 'b', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      const ep = registry.discover('svc');
      expect(ep?.nodes).toHaveLength(2);
    });

    it('should allow nodes for different services', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc1' });
      registry.register({ nodeId: 'n2', address: 'b', status: 'active', metadata: { tags: {} }, serviceName: 'svc2' });
      expect(registry.discover('svc1')?.nodes).toHaveLength(1);
      expect(registry.discover('svc2')?.nodes).toHaveLength(1);
    });
  });

  // ============================================================
  // deregister
  // ============================================================
  describe('deregister', () => {
    it('should remove a node', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.deregister('n1');
      expect(registry.getNode('n1')).toBeNull();
    });

    it('should do nothing for unknown node', () => {
      expect(() => registry.deregister('unknown')).not.toThrow();
    });

    it('should clean up service if no nodes left', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.deregister('n1');
      expect(registry.discover('svc')).toBeNull();
    });
  });

  // ============================================================
  // discover
  // ============================================================
  describe('discover', () => {
    it('should discover existing service', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      const ep = registry.discover('svc');
      expect(ep?.serviceName).toBe('svc');
      expect(ep?.nodes).toHaveLength(1);
    });

    it('should return null for unknown service', () => {
      expect(registry.discover('unknown')).toBeNull();
    });
  });

  // ============================================================
  // heartbeat
  // ============================================================
  describe('heartbeat', () => {
    it('should update lastHeartbeat', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      const before = registry.getNode('n1')?.lastHeartbeat;
      registry.heartbeat('n1');
      const after = registry.getNode('n1')?.lastHeartbeat;
      expect(after!).toBeGreaterThanOrEqual(before!);
    });

    it('should do nothing for unknown node', () => {
      expect(() => registry.heartbeat('unknown')).not.toThrow();
    });
  });

  // ============================================================
  // updateLoadFactor
  // ============================================================
  describe('updateLoadFactor', () => {
    it('should update load factor', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.updateLoadFactor('n1', 0.5);
      expect(registry.getNode('n1')?.loadFactor).toBe(0.5);
    });

    it('should clamp negative values to 0', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.updateLoadFactor('n1', -1);
      expect(registry.getNode('n1')?.loadFactor).toBe(0);
    });

    it('should do nothing for unknown node', () => {
      expect(() => registry.updateLoadFactor('unknown', 1)).not.toThrow();
    });
  });

  // ============================================================
  // getHealthyNodes
  // ============================================================
  describe('getHealthyNodes', () => {
    it('should return active nodes with recent heartbeat', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      const healthy = registry.getHealthyNodes('svc');
      expect(healthy).toHaveLength(1);
    });

    it('should exclude inactive nodes', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'inactive', metadata: { tags: {} }, serviceName: 'svc' });
      expect(registry.getHealthyNodes('svc')).toHaveLength(0);
    });

    it('should exclude nodes with stale heartbeat', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      // Manually set stale heartbeat
      const node = registry.getNode('n1')!;
      node.lastHeartbeat = Date.now() - 60000; // 60s ago
      expect(registry.getHealthyNodes('svc')).toHaveLength(0);
    });

    it('should return empty for unknown service', () => {
      expect(registry.getHealthyNodes('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // selectNode
  // ============================================================
  describe('selectNode', () => {
    it('should select node with lowest load', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.register({ nodeId: 'n2', address: 'b', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.updateLoadFactor('n1', 0.8);
      registry.updateLoadFactor('n2', 0.3);
      const selected = registry.selectNode('svc');
      expect(selected?.nodeId).toBe('n2');
    });

    it('should return null for unknown service', () => {
      expect(registry.selectNode('unknown')).toBeNull();
    });

    it('should return null when no healthy nodes', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'inactive', metadata: { tags: {} }, serviceName: 'svc' });
      expect(registry.selectNode('svc')).toBeNull();
    });
  });

  // ============================================================
  // updateStatus
  // ============================================================
  describe('updateStatus', () => {
    it('should update node status', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.updateStatus('n1', 'draining');
      expect(registry.getNode('n1')?.status).toBe('draining');
    });

    it('should do nothing for unknown node', () => {
      expect(() => registry.updateStatus('unknown', 'active')).not.toThrow();
    });
  });

  // ============================================================
  // updateMetadata
  // ============================================================
  describe('updateMetadata', () => {
    it('should update metadata', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.updateMetadata('n1', { region: 'us-west' });
      expect(registry.getNode('n1')?.metadata.region).toBe('us-west');
    });

    it('should merge with existing tags', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: { env: 'prod' } }, serviceName: 'svc' });
      registry.updateMetadata('n1', { tags: { env: 'prod', version: '1.0' } });
      const tags = registry.getNode('n1')?.metadata.tags;
      expect(tags?.env).toBe('prod');
      expect(tags?.version).toBe('1.0');
    });
  });

  // ============================================================
  // getAllNodes
  // ============================================================
  describe('getAllNodes', () => {
    it('should return all nodes', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc1' });
      registry.register({ nodeId: 'n2', address: 'b', status: 'active', metadata: { tags: {} }, serviceName: 'svc2' });
      expect(registry.getAllNodes()).toHaveLength(2);
    });

    it('should return empty array initially', () => {
      expect(registry.getAllNodes()).toHaveLength(0);
    });
  });

  // ============================================================
  // getNode
  // ============================================================
  describe('getNode', () => {
    it('should return node by id', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      expect(registry.getNode('n1')?.nodeId).toBe('n1');
    });

    it('should return null for unknown id', () => {
      expect(registry.getNode('unknown')).toBeNull();
    });
  });

  // ============================================================
  // clearAll
  // ============================================================
  describe('clearAll', () => {
    it('should clear all nodes', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.clearAll();
      expect(registry.getAllNodes()).toHaveLength(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes for same service', () => {
      for (let i = 0; i < 20; i++) {
        registry.register({ nodeId: `n${i}`, address: `addr${i}`, status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      }
      expect(registry.getHealthyNodes('svc')).toHaveLength(20);
    });

    it('should handle deregistering while iterating', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.register({ nodeId: 'n2', address: 'b', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.deregister('n1');
      expect(registry.discover('svc')?.nodes).toHaveLength(1);
    });

    it('should handle status transitions', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.updateStatus('n1', 'draining');
      expect(registry.getHealthyNodes('svc')).toHaveLength(0);
      registry.updateStatus('n1', 'inactive');
      expect(registry.getHealthyNodes('svc')).toHaveLength(0);
    });

    it('should handle load factor changes', () => {
      registry.register({ nodeId: 'n1', address: 'a', status: 'active', metadata: { tags: {} }, serviceName: 'svc' });
      registry.updateLoadFactor('n1', 0.1);
      registry.updateLoadFactor('n1', 0.9);
      expect(registry.selectNode('svc')?.loadFactor).toBe(0.9);
    });
  });
});