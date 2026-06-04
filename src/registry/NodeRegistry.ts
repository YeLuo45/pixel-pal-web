/**
 * Node Registry v2
 * nanobot Node Registry v2 - Service Discovery + Load Balancing
 */

export interface NodeMetadata {
  tags: Record<string, string>;
  region?: string;
  version?: string;
}

export type NodeStatus = 'active' | 'inactive' | 'draining';

export interface RegisteredNode {
  nodeId: string;
  address: string;
  status: NodeStatus;
  metadata: NodeMetadata;
  registeredAt: number;
  lastHeartbeat: number;
  loadFactor: number;
  serviceName: string;
}

export interface ServiceEndpoint {
  serviceName: string;
  nodes: RegisteredNode[];
}

let nodeCounter = 0;

function generateNodeId(): string {
  return `node-${Date.now()}-${++nodeCounter}`;
}

export class NodeRegistry {
  private nodes: Map<string, RegisteredNode> = new Map();
  private services: Map<string, Set<string>> = new Map();

  /**
   * Register a new node
   */
  register(node: Omit<RegisteredNode, 'registeredAt' | 'lastHeartbeat' | 'loadFactor'>): void {
    const now = Date.now();
    const fullNode: RegisteredNode = {
      ...node,
      registeredAt: now,
      lastHeartbeat: now,
      loadFactor: 1.0,
    };

    this.nodes.set(fullNode.nodeId, fullNode);

    if (!this.services.has(fullNode.serviceName)) {
      this.services.set(fullNode.serviceName, new Set());
    }
    this.services.get(fullNode.serviceName)!.add(fullNode.nodeId);
  }

  /**
   * Deregister a node
   */
  deregister(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    this.nodes.delete(nodeId);
    const serviceNodes = this.services.get(node.serviceName);
    if (serviceNodes) {
      serviceNodes.delete(nodeId);
      if (serviceNodes.size === 0) {
        this.services.delete(node.serviceName);
      }
    }
  }

  /**
   * Discover a service
   */
  discover(serviceName: string): ServiceEndpoint | null {
    const serviceNodes = this.services.get(serviceName);
    if (!serviceNodes || serviceNodes.size === 0) return null;

    const nodes: RegisteredNode[] = [];
    for (const nodeId of serviceNodes) {
      const node = this.nodes.get(nodeId);
      if (node) nodes.push(node);
    }

    return { serviceName, nodes };
  }

  /**
   * Update heartbeat for a node
   */
  heartbeat(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.lastHeartbeat = Date.now();
    }
  }

  /**
   * Update load factor for a node
   */
  updateLoadFactor(nodeId: string, load: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.loadFactor = Math.max(0, load);
    }
  }

  /**
   * Get healthy nodes for a service (active + recent heartbeat)
   */
  getHealthyNodes(serviceName: string): RegisteredNode[] {
    const serviceNodes = this.services.get(serviceName);
    if (!serviceNodes) return [];

    const now = Date.now();
    const healthy: RegisteredNode[] = [];

    for (const nodeId of serviceNodes) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;

      const isActive = node.status === 'active';
      const hasHeartbeat = now - node.lastHeartbeat < 30000; // 30s timeout

      if (isActive && hasHeartbeat) {
        healthy.push(node);
      }
    }

    return healthy;
  }

  /**
   * Select node by load (round-robin with load balancing)
   */
  selectNode(serviceName: string): RegisteredNode | null {
    const healthy = this.getHealthyNodes(serviceName);
    if (healthy.length === 0) return null;

    // Sort by load factor
    healthy.sort((a, b) => a.loadFactor - b.loadFactor);
    return healthy[0];
  }

  /**
   * Update node status
   */
  updateStatus(nodeId: string, status: NodeStatus): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = status;
    }
  }

  /**
   * Update node metadata
   */
  updateMetadata(nodeId: string, metadata: Partial<NodeMetadata>): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.metadata = { ...node.metadata, ...metadata };
    }
  }

  /**
   * Get all registered nodes
   */
  getAllNodes(): RegisteredNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): RegisteredNode | null {
    return this.nodes.get(nodeId) ?? null;
  }

  /**
   * Clear all registrations (for testing)
   */
  clearAll(): void {
    this.nodes.clear();
    this.services.clear();
  }
}

export default NodeRegistry;