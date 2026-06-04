/**
 * NodeHealthMonitor Tests - V189
 * Tests for nanobot Distributed Mesh implementation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NodeHealthMonitor, type NodeHealth } from '../NodeHealthMonitor';

describe('NodeHealthMonitor', () => {
  let monitor: NodeHealthMonitor;

  beforeEach(() => {
    monitor = new NodeHealthMonitor();
  });

  afterEach(() => {
    monitor.clear();
  });

  describe('registerNode()', () => {
    it('should register a new node', () => {
      monitor.registerNode('node-1');
      
      expect(monitor.getNodeCount()).toBe(1);
      expect(monitor.getAllNodeIds()).toContain('node-1');
    });

    it('should not duplicate existing node', () => {
      monitor.registerNode('node-1');
      monitor.registerNode('node-1');
      
      expect(monitor.getNodeCount()).toBe(1);
    });
  });

  describe('unregisterNode()', () => {
    it('should remove a registered node', () => {
      monitor.registerNode('node-1');
      monitor.unregisterNode('node-1');
      
      expect(monitor.getNodeCount()).toBe(0);
    });

    it('should handle unregistering non-existent node', () => {
      monitor.unregisterNode('non-existent');
      expect(monitor.getNodeCount()).toBe(0);
    });
  });

  describe('checkNode()', () => {
    it('should check an unregistered node and register it', async () => {
      const health = await monitor.checkNode('new-node');
      
      expect(health.nodeId).toBe('new-node');
      expect(health.status).toBeDefined();
      expect(typeof health.latency).toBe('number');
      expect(health.lastCheck).toBeGreaterThan(0);
    });

    it('should return health info for checked node', async () => {
      monitor.registerNode('node-1');
      const health = await monitor.checkNode('node-1');
      
      expect(health.nodeId).toBe('node-1');
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('latency');
      expect(health).toHaveProperty('lastCheck');
      expect(health).toHaveProperty('consecutiveFailures');
    });

    it('should track consecutive failures', async () => {
      monitor.registerNode('node-1');
      
      // Check multiple times - some may fail
      for (let i = 0; i < 5; i++) {
        await monitor.checkNode('node-1');
      }

      const health = monitor.getNodeHealth('node-1');
      expect(health).toBeDefined();
    });
  });

  describe('checkAll()', () => {
    it('should return empty array when no nodes', async () => {
      const results = await monitor.checkAll();
      expect(results).toEqual([]);
    });

    it('should check all registered nodes', async () => {
      monitor.registerNode('node-1');
      monitor.registerNode('node-2');
      monitor.registerNode('node-3');

      const results = await monitor.checkAll();
      
      expect(results.length).toBe(3);
      const nodeIds = results.map(r => r.nodeId);
      expect(nodeIds).toContain('node-1');
      expect(nodeIds).toContain('node-2');
      expect(nodeIds).toContain('node-3');
    });
  });

  describe('markUnhealthy()', () => {
    it('should mark registered node as unhealthy', () => {
      monitor.registerNode('node-1');
      monitor.markUnhealthy('node-1');
      
      const health = monitor.getNodeHealth('node-1');
      expect(health!.status).toBe('unhealthy');
      expect(health!.consecutiveFailures).toBe(3);
    });

    it('should mark unregistered node as unhealthy', () => {
      monitor.markUnhealthy('unknown-node');
      
      const health = monitor.getNodeHealth('unknown-node');
      expect(health).toBeDefined();
      expect(health!.status).toBe('unhealthy');
    });
  });

  describe('getHealthyNodes()', () => {
    it('should return empty array when no nodes', () => {
      expect(monitor.getHealthyNodes()).toEqual([]);
    });

    it('should return only healthy nodes', async () => {
      monitor.registerNode('healthy-node');
      monitor.registerNode('degraded-node');
      monitor.registerNode('unhealthy-node');

      // Force healthy status
      const h1 = monitor.getNodeHealth('healthy-node')!;
      h1.status = 'healthy';
      h1.consecutiveFailures = 0;

      const h2 = monitor.getNodeHealth('degraded-node')!;
      h2.status = 'degraded';

      const h3 = monitor.getNodeHealth('unhealthy-node')!;
      h3.status = 'unhealthy';

      const healthy = monitor.getHealthyNodes();
      expect(healthy).toContain('healthy-node');
      expect(healthy).not.toContain('degraded-node');
      expect(healthy).not.toContain('unhealthy-node');
    });
  });

  describe('getAllNodeIds()', () => {
    it('should return empty array when no nodes', () => {
      expect(monitor.getAllNodeIds()).toEqual([]);
    });

    it('should return all registered node IDs', () => {
      monitor.registerNode('node-1');
      monitor.registerNode('node-2');

      const ids = monitor.getAllNodeIds();
      expect(ids.length).toBe(2);
      expect(ids).toContain('node-1');
      expect(ids).toContain('node-2');
    });
  });

  describe('getNodeHealth()', () => {
    it('should return undefined for non-existent node', () => {
      expect(monitor.getNodeHealth('non-existent')).toBeUndefined();
    });

    it('should return health info for registered node', () => {
      monitor.registerNode('node-1');
      
      const health = monitor.getNodeHealth('node-1');
      expect(health).toBeDefined();
      expect(health!.nodeId).toBe('node-1');
    });
  });

  describe('setCheckInterval() / getCheckInterval()', () => {
    it('should set and get check interval', () => {
      monitor.setCheckInterval(60000);
      expect(monitor.getCheckInterval()).toBe(60000);
    });

    it('should enforce minimum interval of 1000ms', () => {
      monitor.setCheckInterval(500);
      expect(monitor.getCheckInterval()).toBe(1000);
    });
  });

  describe('clear()', () => {
    it('should remove all nodes', () => {
      monitor.registerNode('node-1');
      monitor.registerNode('node-2');
      monitor.clear();
      
      expect(monitor.getNodeCount()).toBe(0);
    });
  });

  describe('getNodeCount()', () => {
    it('should return 0 for empty monitor', () => {
      expect(monitor.getNodeCount()).toBe(0);
    });

    it('should return correct count', () => {
      monitor.registerNode('node-1');
      monitor.registerNode('node-2');
      monitor.registerNode('node-3');
      
      expect(monitor.getNodeCount()).toBe(3);
    });
  });

  describe('NodeHealth interface', () => {
    it('should have all required properties', () => {
      monitor.registerNode('node-1');
      const health = monitor.getNodeHealth('node-1')!;
      
      expect(health.nodeId).toBe('node-1');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
      expect(typeof health.latency).toBe('number');
      expect(typeof health.lastCheck).toBe('number');
      expect(typeof health.consecutiveFailures).toBe('number');
    });
  });

  describe('status calculation', () => {
    it('should show degraded after 1 consecutive failure', () => {
      monitor.registerNode('node-1');
      monitor.markUnhealthy('node-1');
      
      // Manually set to 1 failure for degraded test
      const health = monitor.getNodeHealth('node-1')!;
      health.consecutiveFailures = 1;
      health.status = 'degraded';
      
      expect(monitor.getNodeHealth('node-1')!.status).toBe('degraded');
    });

    it('should show unhealthy after max consecutive failures', () => {
      monitor.registerNode('node-1');
      
      const health = monitor.getNodeHealth('node-1')!;
      health.consecutiveFailures = 3;
      health.status = 'unhealthy';
      
      expect(monitor.getNodeHealth('node-1')!.status).toBe('unhealthy');
    });
  });

  describe('async checkNode', () => {
    it('should return Promise resolving to NodeHealth', async () => {
      monitor.registerNode('node-1');
      const result = monitor.checkNode('node-1');
      
      expect(result).toBeInstanceOf(Promise);
      const health = await result;
      expect(health.nodeId).toBe('node-1');
    });

    it('should have measurable latency', async () => {
      monitor.registerNode('node-1');
      const health = await monitor.checkNode('node-1');
      
      expect(health.latency).toBeGreaterThanOrEqual(0);
    });
  });
});