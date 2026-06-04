/**
 * Mesh Network v2
 * nanobot-design Mesh Network v2 - Dynamic Discovery + Routing + Load Balancing
 */

export interface MeshNode {
  id: string;
  load: number;
  healthy: boolean;
  latency: number;
}

export class MeshNetwork {
  private nodes: Map<string, MeshNode> = new Map();
  private connections: Map<string, Set<string>> = new Map();

  /**
   * Add a node to the network
   */
  addNode(node: MeshNode): void {
    this.nodes.set(node.id, { ...node });
    if (!this.connections.has(node.id)) {
      this.connections.set(node.id, new Set());
    }
  }

  /**
   * Connect two nodes
   */
  connect(from: string, to: string): void {
    this.connections.get(from)?.add(to);
    this.connections.get(to)?.add(from);
  }

  /**
   * Route message through the network
   */
  routeMessage(from: string, to: string, payload: string): string {
    if (!this.nodes.has(from) || !this.nodes.has(to)) {
      return `error:unknown-node`;
    }

    const path = this.getOptimalPath(from, to);
    if (path.length === 0) {
      return `error:no-path`;
    }

    // Simulate routing
    let route = `route:${from}`;
    for (const nodeId of path) {
      route += `->${nodeId}`;
    }
    route += `:${payload}`;
    return route;
  }

  /**
   * Get optimal path between two nodes (shortest path by hops)
   */
  getOptimalPath(from: string, to: string): string[] {
    if (from === to) return [from];

    const visited = new Set<string>();
    const queue: string[][] = [[from]];

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current === to) {
        return path;
      }

      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = this.connections.get(current) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push([...path, neighbor]);
        }
      }
    }

    return [];
  }

  /**
   * Get load for a specific node
   */
  getNodeLoad(nodeId: string): number {
    return this.nodes.get(nodeId)?.load ?? -1;
  }

  /**
   * Get the node with lowest load
   */
  getLeastLoadedNode(): string | null {
    let minLoad = Infinity;
    let bestNode: string | null = null;

    for (const [id, node] of this.nodes) {
      if (node.healthy && node.load < minLoad) {
        minLoad = node.load;
        bestNode = id;
      }
    }

    return bestNode;
  }

  /**
   * Balance load across healthy nodes
   */
  balance(): void {
    const healthyNodes: MeshNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.healthy) {
        healthyNodes.push(node);
      }
    }

    if (healthyNodes.length < 2) return;

    const totalLoad = healthyNodes.reduce((sum, n) => sum + n.load, 0);
    const avgLoad = totalLoad / healthyNodes.length;

    for (const node of healthyNodes) {
      const diff = node.load - avgLoad;
      // Redistribute some load
      node.load = Math.round((node.load - diff * 0.5) * 100) / 100;
    }
  }

  /**
   * Recover unhealthy nodes
   */
  recover(): number {
    let recovered = 0;
    for (const node of this.nodes.values()) {
      if (!node.healthy) {
        node.healthy = true;
        node.load = Math.min(node.load, 0.3); // Reset to low load
        recovered++;
      }
    }
    return recovered;
  }

  /**
   * Get all healthy nodes
   */
  getHealthyNodes(): string[] {
    const healthy: string[] = [];
    for (const [id, node] of this.nodes) {
      if (node.healthy) healthy.push(id);
    }
    return healthy;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node by id
   */
  getNode(nodeId: string): MeshNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Update node load
   */
  updateLoad(nodeId: string, load: number): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    node.load = Math.max(0, Math.min(1, load));
    return true;
  }

  /**
   * Mark node as unhealthy
   */
  markUnhealthy(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    node.healthy = false;
    return true;
  }

  /**
   * Get average network latency
   */
  getAverageLatency(): number {
    if (this.nodes.size === 0) return 0;
    const sum = Array.from(this.nodes.values()).reduce((acc, n) => acc + n.latency, 0);
    return Math.round(sum / this.nodes.size * 100) / 100;
  }

  /**
   * Get node count
   */
  getNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    let count = 0;
    for (const neighbors of this.connections.values()) {
      count += neighbors.size;
    }
    return Math.round(count / 2); // Each connection counted twice
  }

  /**
   * Remove node
   */
  removeNode(nodeId: string): boolean {
    if (!this.nodes.has(nodeId)) return false;
    this.nodes.delete(nodeId);
    this.connections.delete(nodeId);
    for (const neighbors of this.connections.values()) {
      neighbors.delete(nodeId);
    }
    return true;
  }

  /**
   * Clear all
   */
  clearAll(): void {
    this.nodes.clear();
    this.connections.clear();
  }

  /**
   * Get network diameter (longest shortest path)
   */
  getDiameter(): number {
    let maxDist = 0;
    const nodeIds = Array.from(this.nodes.keys());
    for (const from of nodeIds) {
      for (const to of nodeIds) {
        if (from !== to) {
          const path = this.getOptimalPath(from, to);
          maxDist = Math.max(maxDist, path.length - 1);
        }
      }
    }
    return maxDist;
  }

  /**
   * Check if network is fully connected
   */
  isFullyConnected(): boolean {
    if (this.nodes.size <= 1) return true;
    const nodeIds = Array.from(this.nodes.keys());
    for (const from of nodeIds) {
      for (const to of nodeIds) {
        if (from !== to && this.getOptimalPath(from, to).length === 0) {
          return false;
        }
      }
    }
    return true;
  }
}

export default MeshNetwork;