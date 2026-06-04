/**
 * V194: Distributed Mesh
 * 
 * Mesh topology management for nanobot distributed system.
 * Provides node registration, neighbor discovery, message routing, and fault tolerance.
 */

import { NodeRegistry, type NodeStatus } from './NodeRegistry';

// ============================================================================
// Types
// ============================================================================

export interface MeshNode {
  nodeId: string;
  neighbors: string[];
  status: 'online' | 'offline' | 'degraded';
  lastHeartbeat: number;
}

export interface PathResult {
  path: string[];
  hops: number;
}

// ============================================================================
// DistributedMesh
// ============================================================================

/**
 * DistributedMesh manages the mesh topology for nanobot nodes.
 * 
 * Features:
 * - Node registration/unregistration
 * - Neighbor management (bidirectional links)
 * - Path finding (BFS-based shortest path)
 * - Fault detection via heartbeat tracking
 */
export class DistributedMesh {
  private registry: NodeRegistry;

  constructor() {
    this.registry = new NodeRegistry();
  }

  /**
   * Register a new node in the mesh
   */
  registerNode(nodeId: string): void {
    this.registry.register(nodeId);
  }

  /**
   * Unregister a node from the mesh
   */
  unregisterNode(nodeId: string): void {
    this.registry.unregister(nodeId);
  }

  /**
   * Add a bidirectional neighbor relationship
   */
  addNeighbor(nodeId: string, neighborId: string): boolean {
    return this.registry.addNeighbor(nodeId, neighborId);
  }

  /**
   * Remove a neighbor relationship
   */
  removeNeighbor(nodeId: string, neighborId: string): boolean {
    return this.registry.removeNeighbor(nodeId, neighborId);
  }

  /**
   * Find shortest path between two nodes using BFS
   * Returns null if no path exists
   */
  findPath(from: string, to: string): string[] | null {
    if (!this.registry.hasNode(from) || !this.registry.hasNode(to)) {
      return null;
    }

    if (from === to) {
      return [from];
    }

    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [];

    visited.add(from);
    queue.push({ nodeId: from, path: [from] });

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      const neighbors = this.registry.getNeighbors(nodeId);

      for (const neighbor of neighbors) {
        if (neighbor === to) {
          return [...path, neighbor];
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ nodeId: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Get the complete mesh topology as array of MeshNodes
   */
  getMeshTopology(): MeshNode[] {
    return this.registry.toMeshNodes();
  }

  /**
   * Get all online nodes (status !== 'offline')
   */
  getOnlineNodes(): string[] {
    return this.registry.getOnlineNodes();
  }

  /**
   * Get a specific node's information
   */
  getNode(nodeId: string): MeshNode | undefined {
    const meta = this.registry.getNode(nodeId);
    if (!meta) return undefined;
    return {
      nodeId: meta.nodeId,
      neighbors: Array.from(meta.neighbors),
      status: meta.status,
      lastHeartbeat: meta.lastHeartbeat,
    };
  }

  /**
   * Update node status
   */
  setNodeStatus(nodeId: string, status: NodeStatus): boolean {
    return this.registry.setStatus(nodeId, status);
  }

  /**
   * Update node heartbeat
   */
  updateHeartbeat(nodeId: string): boolean {
    return this.registry.updateHeartbeat(nodeId);
  }

  /**
   * Get neighbors of a node
   */
  getNeighbors(nodeId: string): string[] {
    return this.registry.getNeighbors(nodeId);
  }

  /**
   * Get total node count
   */
  getNodeCount(): number {
    return this.registry.size();
  }

  /**
   * Check if a path exists between two nodes
   */
  hasPath(from: string, to: string): boolean {
    return this.findPath(from, to) !== null;
  }

  /**
   * Get all nodes with their status
   */
  getAllNodes(): Map<string, NodeStatus> {
    const result = new Map<string, NodeStatus>();
    for (const nodeId of this.registry.getNodeIds()) {
      const status = this.registry.getStatus(nodeId);
      if (status) {
        result.set(nodeId, status);
      }
    }
    return result;
  }
}

// ============================================================================
// Singleton instance
// ============================================================================

let distributedMeshInstance: DistributedMesh | null = null;

export function getDistributedMesh(): DistributedMesh {
  if (!distributedMeshInstance) {
    distributedMeshInstance = new DistributedMesh();
  }
  return distributedMeshInstance;
}

export default DistributedMesh;