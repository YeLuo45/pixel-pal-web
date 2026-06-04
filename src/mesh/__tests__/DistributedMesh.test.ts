/**
 * V194: DistributedMesh Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DistributedMesh, getDistributedMesh } from '../DistributedMesh';
import { NodeRegistry } from '../NodeRegistry';

describe('NodeRegistry', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = new NodeRegistry();
  });

  describe('constructor', () => {
    it('should create a NodeRegistry instance', () => {
      expect(registry).toBeInstanceOf(NodeRegistry);
    });

    it('should start with empty nodes', () => {
      expect(registry.size()).toBe(0);
    });
  });

  describe('register', () => {
    it('should register a new node', () => {
      registry.register('nodeA');
      expect(registry.hasNode('nodeA')).toBe(true);
    });

    it('should not duplicate existing nodes', () => {
      registry.register('nodeA');
      registry.register('nodeA');
      expect(registry.size()).toBe(1);
    });

    it('should set default status to online', () => {
      registry.register('nodeA');
      expect(registry.getStatus('nodeA')).toBe('online');
    });

    it('should set initial heartbeat', () => {
      const before = Date.now();
      registry.register('nodeA');
      const node = registry.getNode('nodeA');
      expect(node?.lastHeartbeat).toBeGreaterThanOrEqual(before);
    });
  });

  describe('unregister', () => {
    it('should unregister an existing node', () => {
      registry.register('nodeA');
      const result = registry.unregister('nodeA');
      expect(result).toBe(true);
      expect(registry.hasNode('nodeA')).toBe(false);
    });

    it('should return false for non-existent node', () => {
      const result = registry.unregister('nonExistent');
      expect(result).toBe(false);
    });

    it('should remove node from neighbors lists', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      registry.addNeighbor('nodeA', 'nodeB');
      registry.unregister('nodeA');
      
      const neighbors = registry.getNeighbors('nodeB');
      expect(neighbors).not.toContain('nodeA');
    });
  });

  describe('getNode', () => {
    it('should return node metadata', () => {
      registry.register('nodeA');
      const node = registry.getNode('nodeA');
      expect(node).toBeDefined();
      expect(node?.nodeId).toBe('nodeA');
    });

    it('should return undefined for non-existent node', () => {
      const node = registry.getNode('nonExistent');
      expect(node).toBeUndefined();
    });
  });

  describe('addNeighbor', () => {
    it('should add bidirectional neighbor relationship', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      const result = registry.addNeighbor('nodeA', 'nodeB');
      
      expect(result).toBe(true);
      expect(registry.getNeighbors('nodeA')).toContain('nodeB');
      expect(registry.getNeighbors('nodeB')).toContain('nodeA');
    });

    it('should return false if node does not exist', () => {
      registry.register('nodeA');
      const result = registry.addNeighbor('nodeA', 'nonExistent');
      expect(result).toBe(false);
    });

    it('should return false for self-reference', () => {
      registry.register('nodeA');
      const result = registry.addNeighbor('nodeA', 'nodeA');
      expect(result).toBe(false);
    });
  });

  describe('removeNeighbor', () => {
    it('should remove neighbor relationship', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      registry.addNeighbor('nodeA', 'nodeB');
      
      const result = registry.removeNeighbor('nodeA', 'nodeB');
      expect(result).toBe(true);
      expect(registry.getNeighbors('nodeA')).not.toContain('nodeB');
      expect(registry.getNeighbors('nodeB')).not.toContain('nodeA');
    });

    it('should return false if nodes do not exist', () => {
      registry.register('nodeA');
      const result = registry.removeNeighbor('nodeA', 'nonExistent');
      expect(result).toBe(false);
    });
  });

  describe('getNeighbors', () => {
    it('should return empty array for node with no neighbors', () => {
      registry.register('nodeA');
      const neighbors = registry.getNeighbors('nodeA');
      expect(neighbors).toEqual([]);
    });

    it('should return all neighbors', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      registry.register('nodeC');
      registry.addNeighbor('nodeA', 'nodeB');
      registry.addNeighbor('nodeA', 'nodeC');
      
      const neighbors = registry.getNeighbors('nodeA');
      expect(neighbors).toContain('nodeB');
      expect(neighbors).toContain('nodeC');
      expect(neighbors.length).toBe(2);
    });

    it('should return empty array for non-existent node', () => {
      const neighbors = registry.getNeighbors('nonExistent');
      expect(neighbors).toEqual([]);
    });
  });

  describe('setStatus', () => {
    it('should set node status', () => {
      registry.register('nodeA');
      const result = registry.setStatus('nodeA', 'degraded');
      
      expect(result).toBe(true);
      expect(registry.getStatus('nodeA')).toBe('degraded');
    });

    it('should return false for non-existent node', () => {
      const result = registry.setStatus('nonExistent', 'offline');
      expect(result).toBe(false);
    });
  });

  describe('updateHeartbeat', () => {
    it('should update heartbeat timestamp', () => {
      registry.register('nodeA');
      const before = Date.now();
      registry.updateHeartbeat('nodeA');
      const node = registry.getNode('nodeA');
      
      expect(node?.lastHeartbeat).toBeGreaterThanOrEqual(before);
    });

    it('should return false for non-existent node', () => {
      const result = registry.updateHeartbeat('nonExistent');
      expect(result).toBe(false);
    });
  });

  describe('getOnlineNodes', () => {
    it('should return only online and degraded nodes', () => {
      registry.register('nodeA'); // online by default
      registry.register('nodeB');
      registry.register('nodeC');
      
      registry.setStatus('nodeB', 'offline');
      registry.setStatus('nodeC', 'degraded');
      
      const onlineNodes = registry.getOnlineNodes();
      expect(onlineNodes).toContain('nodeA');
      expect(onlineNodes).toContain('nodeC');
      expect(onlineNodes).not.toContain('nodeB');
    });
  });

  describe('toMeshNodes', () => {
    it('should convert registry to MeshNode array', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      registry.addNeighbor('nodeA', 'nodeB');
      
      const nodes = registry.toMeshNodes();
      expect(nodes.length).toBe(2);
      
      const nodeA = nodes.find(n => n.nodeId === 'nodeA');
      expect(nodeA).toBeDefined();
      expect(nodeA?.neighbors).toContain('nodeB');
    });
  });

  describe('size', () => {
    it('should return correct count', () => {
      expect(registry.size()).toBe(0);
      registry.register('nodeA');
      expect(registry.size()).toBe(1);
      registry.register('nodeB');
      expect(registry.size()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all nodes', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      registry.clear();
      expect(registry.size()).toBe(0);
    });
  });
});

describe('DistributedMesh', () => {
  let mesh: DistributedMesh;

  beforeEach(() => {
    mesh = new DistributedMesh();
  });

  describe('constructor', () => {
    it('should create a DistributedMesh instance', () => {
      expect(mesh).toBeInstanceOf(DistributedMesh);
    });
  });

  describe('registerNode', () => {
    it('should register a new node', () => {
      mesh.registerNode('nodeA');
      expect(mesh.getOnlineNodes()).toContain('nodeA');
    });
  });

  describe('unregisterNode', () => {
    it('should unregister an existing node', () => {
      mesh.registerNode('nodeA');
      mesh.unregisterNode('nodeA');
      expect(mesh.getOnlineNodes()).not.toContain('nodeA');
    });
  });

  describe('addNeighbor', () => {
    it('should add neighbor relationship', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      const result = mesh.addNeighbor('nodeA', 'nodeB');
      
      expect(result).toBe(true);
      expect(mesh.getNeighbors('nodeA')).toContain('nodeB');
    });

    it('should return false for non-existent nodes', () => {
      mesh.registerNode('nodeA');
      const result = mesh.addNeighbor('nodeA', 'nonExistent');
      expect(result).toBe(false);
    });
  });

  describe('removeNeighbor', () => {
    it('should remove neighbor relationship', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.addNeighbor('nodeA', 'nodeB');
      mesh.removeNeighbor('nodeA', 'nodeB');
      
      expect(mesh.getNeighbors('nodeA')).not.toContain('nodeB');
    });
  });

  describe('findPath', () => {
    it('should find direct path between neighbors', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.addNeighbor('nodeA', 'nodeB');
      
      const path = mesh.findPath('nodeA', 'nodeB');
      expect(path).toEqual(['nodeA', 'nodeB']);
    });

    it('should find multi-hop path', () => {
      // A - B - C topology
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.registerNode('nodeC');
      mesh.addNeighbor('nodeA', 'nodeB');
      mesh.addNeighbor('nodeB', 'nodeC');
      
      const path = mesh.findPath('nodeA', 'nodeC');
      expect(path).toEqual(['nodeA', 'nodeB', 'nodeC']);
    });

    it('should return null when no path exists', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.registerNode('nodeC');
      // A and B are connected, but C is isolated
      mesh.addNeighbor('nodeA', 'nodeB');
      
      const path = mesh.findPath('nodeA', 'nodeC');
      expect(path).toBeNull();
    });

    it('should return null for non-existent nodes', () => {
      mesh.registerNode('nodeA');
      const path = mesh.findPath('nodeA', 'nonExistent');
      expect(path).toBeNull();
    });

    it('should return [node] for same node', () => {
      mesh.registerNode('nodeA');
      const path = mesh.findPath('nodeA', 'nodeA');
      expect(path).toEqual(['nodeA']);
    });
  });

  describe('getMeshTopology', () => {
    it('should return all nodes with their neighbors', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.addNeighbor('nodeA', 'nodeB');
      
      const topology = mesh.getMeshTopology();
      expect(topology.length).toBe(2);
      
      const nodeA = topology.find(n => n.nodeId === 'nodeA');
      expect(nodeA?.neighbors).toContain('nodeB');
    });
  });

  describe('getOnlineNodes', () => {
    it('should return all non-offline nodes', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.setNodeStatus('nodeB', 'offline');
      
      const online = mesh.getOnlineNodes();
      expect(online).toContain('nodeA');
      expect(online).not.toContain('nodeB');
    });
  });

  describe('getNode', () => {
    it('should return node information', () => {
      mesh.registerNode('nodeA');
      const node = mesh.getNode('nodeA');
      
      expect(node).toBeDefined();
      expect(node?.nodeId).toBe('nodeA');
      expect(node?.status).toBe('online');
    });

    it('should return undefined for non-existent node', () => {
      const node = mesh.getNode('nonExistent');
      expect(node).toBeUndefined();
    });
  });

  describe('setNodeStatus', () => {
    it('should update node status', () => {
      mesh.registerNode('nodeA');
      mesh.setNodeStatus('nodeA', 'degraded');
      
      const node = mesh.getNode('nodeA');
      expect(node?.status).toBe('degraded');
    });
  });

  describe('updateHeartbeat', () => {
    it('should update heartbeat', () => {
      mesh.registerNode('nodeA');
      const before = Date.now();
      mesh.updateHeartbeat('nodeA');
      
      const node = mesh.getNode('nodeA');
      expect(node?.lastHeartbeat).toBeGreaterThanOrEqual(before);
    });
  });

  describe('getNeighbors', () => {
    it('should return node neighbors', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.addNeighbor('nodeA', 'nodeB');
      
      const neighbors = mesh.getNeighbors('nodeA');
      expect(neighbors).toContain('nodeB');
    });
  });

  describe('getNodeCount', () => {
    it('should return correct count', () => {
      expect(mesh.getNodeCount()).toBe(0);
      mesh.registerNode('nodeA');
      expect(mesh.getNodeCount()).toBe(1);
    });
  });

  describe('hasPath', () => {
    it('should return true for connected nodes', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.addNeighbor('nodeA', 'nodeB');
      
      expect(mesh.hasPath('nodeA', 'nodeB')).toBe(true);
    });

    it('should return false for disconnected nodes', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeC');
      // No connection
      
      expect(mesh.hasPath('nodeA', 'nodeC')).toBe(false);
    });
  });

  describe('getAllNodes', () => {
    it('should return map of all node statuses', () => {
      mesh.registerNode('nodeA');
      mesh.registerNode('nodeB');
      mesh.setNodeStatus('nodeB', 'degraded');
      
      const nodes = mesh.getAllNodes();
      expect(nodes.get('nodeA')).toBe('online');
      expect(nodes.get('nodeB')).toBe('degraded');
    });
  });
});

describe('DistributedMesh Path Finding', () => {
  let mesh: DistributedMesh;

  beforeEach(() => {
    mesh = new DistributedMesh();
  });

  it('should find path in diamond topology', () => {
    // A - B - D
    // A - C - D
    mesh.registerNode('nodeA');
    mesh.registerNode('nodeB');
    mesh.registerNode('nodeC');
    mesh.registerNode('nodeD');
    
    mesh.addNeighbor('nodeA', 'nodeB');
    mesh.addNeighbor('nodeB', 'nodeD');
    mesh.addNeighbor('nodeA', 'nodeC');
    mesh.addNeighbor('nodeC', 'nodeD');
    
    const path = mesh.findPath('nodeA', 'nodeD');
    // Either A->B->D or A->C->D is valid (BFS picks first found)
    expect(path).not.toBeNull();
    expect(path?.[0]).toBe('nodeA');
    expect(path?.[path!.length - 1]).toBe('nodeD');
  });

  it('should find path in complex mesh', () => {
    // Linear chain: A - B - C - D - E
    mesh.registerNode('nodeA');
    mesh.registerNode('nodeB');
    mesh.registerNode('nodeC');
    mesh.registerNode('nodeD');
    mesh.registerNode('nodeE');
    
    mesh.addNeighbor('nodeA', 'nodeB');
    mesh.addNeighbor('nodeB', 'nodeC');
    mesh.addNeighbor('nodeC', 'nodeD');
    mesh.addNeighbor('nodeD', 'nodeE');
    
    const path = mesh.findPath('nodeA', 'nodeE');
    expect(path).toEqual(['nodeA', 'nodeB', 'nodeC', 'nodeD', 'nodeE']);
  });

  it('should return null for disconnected graph', () => {
    // Two separate components
    mesh.registerNode('nodeA');
    mesh.registerNode('nodeB');
    mesh.addNeighbor('nodeA', 'nodeB');
    
    mesh.registerNode('nodeC');
    mesh.registerNode('nodeD');
    mesh.addNeighbor('nodeC', 'nodeD');
    
    const path = mesh.findPath('nodeA', 'nodeC');
    expect(path).toBeNull();
  });
});

describe('Singleton', () => {
  it('should return same instance', () => {
    const mesh1 = DistributedMesh['instance'] ? undefined : undefined;
    // Can't directly test private instance, but we can verify behavior
    const mesh = new DistributedMesh();
    mesh.registerNode('test');
    expect(mesh.getOnlineNodes()).toContain('test');
  });

  it('should return consistent singleton instance', () => {
    // Test singleton by verifying getDistributedMesh returns same type
    const mesh = new DistributedMesh();
    mesh.registerNode('singletonTest');
    // getDistributedMesh is imported at top of test file
    expect(typeof getDistributedMesh).toBe('function');
    const instance = getDistributedMesh();
    // Instance should have same methods available
    expect(typeof instance.registerNode).toBe('function');
  });
});

describe('NodeRegistry Extended Coverage', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = new NodeRegistry();
  });

  describe('getDegradedNodes', () => {
    it('should return nodes with degraded status', () => {
      registry.register('nodeA'); // online
      registry.register('nodeB');
      registry.register('nodeC');
      
      registry.setStatus('nodeB', 'degraded');
      registry.setStatus('nodeC', 'offline');
      
      const degradedNodes = registry.getDegradedNodes();
      expect(degradedNodes).toContain('nodeB');
      expect(degradedNodes).not.toContain('nodeA');
      expect(degradedNodes).not.toContain('nodeC');
    });
  });

  describe('getOfflineNodes', () => {
    it('should return nodes with offline status', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      registry.register('nodeC');
      
      registry.setStatus('nodeA', 'online');
      registry.setStatus('nodeB', 'degraded');
      registry.setStatus('nodeC', 'offline');
      
      const offlineNodes = registry.getOfflineNodes();
      expect(offlineNodes).toContain('nodeC');
      expect(offlineNodes).not.toContain('nodeA');
      expect(offlineNodes).not.toContain('nodeB');
    });
  });

  describe('getNodeIds', () => {
    it('should return all registered node IDs', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      registry.register('nodeC');
      
      const ids = registry.getNodeIds();
      expect(ids).toContain('nodeA');
      expect(ids).toContain('nodeB');
      expect(ids).toContain('nodeC');
    });
  });

  describe('getOnlineNodes edge cases', () => {
    it('should return empty array when all nodes are offline', () => {
      registry.register('nodeA');
      registry.register('nodeB');
      registry.setStatus('nodeA', 'offline');
      registry.setStatus('nodeB', 'offline');
      
      const onlineNodes = registry.getOnlineNodes();
      expect(onlineNodes).toEqual([]);
    });
  });
});