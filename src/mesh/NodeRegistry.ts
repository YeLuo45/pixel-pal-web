/**
 * V194: Node Registry
 * 
 * Maintains the registry of mesh nodes with their status and metadata.
 */

import type { MeshNode } from './DistributedMesh';

export type NodeStatus = 'online' | 'offline' | 'degraded';

export interface NodeMetadata {
  nodeId: string;
  neighbors: Set<string>;
  status: NodeStatus;
  lastHeartbeat: number;
}

/**
 * NodeRegistry manages the lifecycle of mesh nodes.
 * It provides registration, unregistration, and status tracking.
 */
export class NodeRegistry {
  private nodes: Map<string, NodeMetadata>;

  constructor() {
    this.nodes = new Map();
  }

  /**
   * Register a new node in the mesh
   */
  register(nodeId: string): void {
    if (this.nodes.has(nodeId)) {
      return; // Already registered
    }
    this.nodes.set(nodeId, {
      nodeId,
      neighbors: new Set(),
      status: 'online',
      lastHeartbeat: Date.now(),
    });
  }

  /**
   * Unregister a node from the mesh
   */
  unregister(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }

    // Remove this node from all neighbors' neighbor lists
    for (const [otherId, otherNode] of this.nodes) {
      if (otherId !== nodeId && otherNode.neighbors.has(nodeId)) {
        otherNode.neighbors.delete(nodeId);
      }
    }

    this.nodes.delete(nodeId);
    return true;
  }

  /**
   * Get a node's metadata
   */
  getNode(nodeId: string): NodeMetadata | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Check if a node exists
   */
  hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * Get all registered node IDs
   */
  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Add a neighbor relationship between two nodes
   */
  addNeighbor(nodeId: string, neighborId: string): boolean {
    const node = this.nodes.get(nodeId);
    const neighbor = this.nodes.get(neighborId);

    if (!node || !neighbor) {
      return false;
    }

    if (nodeId === neighborId) {
      return false; // Cannot be neighbor with self
    }

    node.neighbors.add(neighborId);
    neighbor.neighbors.add(nodeId); // Bidirectional
    return true;
  }

  /**
   * Remove a neighbor relationship between two nodes
   */
  removeNeighbor(nodeId: string, neighborId: string): boolean {
    const node = this.nodes.get(nodeId);
    const neighbor = this.nodes.get(neighborId);

    if (!node || !neighbor) {
      return false;
    }

    const removedNode = node.neighbors.delete(neighborId);
    const removedNeighbor = neighbor.neighbors.delete(nodeId);
    return removedNode || removedNeighbor;
  }

  /**
   * Get neighbors of a specific node
   */
  getNeighbors(nodeId: string): string[] {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return [];
    }
    return Array.from(node.neighbors);
  }

  /**
   * Update node status
   */
  setStatus(nodeId: string, status: NodeStatus): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }
    node.status = status;
    return true;
  }

  /**
   * Update heartbeat timestamp
   */
  updateHeartbeat(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }
    node.lastHeartbeat = Date.now();
    return true;
  }

  /**
   * Get node status
   */
  getStatus(nodeId: string): NodeStatus | undefined {
    const node = this.nodes.get(nodeId);
    return node?.status;
  }

  /**
   * Get online nodes (excluding offline)
   */
  getOnlineNodes(): string[] {
    return Array.from(this.nodes.entries())
      .filter(([_, node]) => node.status !== 'offline')
      .map(([nodeId]) => nodeId);
  }

  /**
   * Get degraded nodes
   */
  getDegradedNodes(): string[] {
    return Array.from(this.nodes.entries())
      .filter(([_, node]) => node.status === 'degraded')
      .map(([nodeId]) => nodeId);
  }

  /**
   * Get offline nodes
   */
  getOfflineNodes(): string[] {
    return Array.from(this.nodes.entries())
      .filter(([_, node]) => node.status === 'offline')
      .map(([nodeId]) => nodeId);
  }

  /**
   * Convert to MeshNode array for external representation
   */
  toMeshNodes(): MeshNode[] {
    return Array.from(this.nodes.values()).map(node => ({
      nodeId: node.nodeId,
      neighbors: Array.from(node.neighbors),
      status: node.status,
      lastHeartbeat: node.lastHeartbeat,
    }));
  }

  /**
   * Get total node count
   */
  size(): number {
    return this.nodes.size;
  }

  /**
   * Clear all nodes
   */
  clear(): void {
    this.nodes.clear();
  }
}