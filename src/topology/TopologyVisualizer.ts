/**
 * Topology Visualizer
 * nanobot-design Network Topology Visualizer - Node Graph + Status + Heatmap
 */

export type NodeStatus = 'active' | 'inactive' | 'warning';

export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  status: NodeStatus;
  metadata?: Record<string, unknown>;
}

export interface Edge {
  source: string;
  target: string;
  weight: number;
  status: 'connected' | 'disconnected';
}

export interface TopologyGraph {
  nodes: Node[];
  edges: Edge[];
}

export class TopologyVisualizer {
  private graph: TopologyGraph = { nodes: [], edges: [] };
  private nodeMap: Map<string, Node> = new Map();
  private edgeList: Edge[] = [];

  /**
   * Set the graph data
   */
  setGraph(graph: TopologyGraph): void {
    this.graph = graph;
    this.nodeMap.clear();
    this.edgeList = [];

    for (const node of graph.nodes) {
      this.nodeMap.set(node.id, { ...node });
    }
    this.edgeList = graph.edges.map(e => ({ ...e }));
  }

  /**
   * Get node by id
   */
  getNode(id: string): Node | null {
    return this.nodeMap.get(id) ?? null;
  }

  /**
   * Get all nodes
   */
  getNodes(): Node[] {
    return Array.from(this.nodeMap.values());
  }

  /**
   * Get all edges
   */
  getEdges(): Edge[] {
    return [...this.edgeList];
  }

  /**
   * Get active nodes
   */
  getActiveNodes(): Node[] {
    return Array.from(this.nodeMap.values()).filter(n => n.status === 'active');
  }

  /**
   * Calculate load for each node (based on edge weights)
   */
  calculateLoad(): Map<string, number> {
    const loadMap = new Map<string, number>();

    for (const node of this.nodeMap.values()) {
      loadMap.set(node.id, 0);
    }

    for (const edge of this.edgeList) {
      if (edge.status === 'connected') {
        const sourceLoad = loadMap.get(edge.source) ?? 0;
        const targetLoad = loadMap.get(edge.target) ?? 0;
        loadMap.set(edge.source, sourceLoad + edge.weight);
        loadMap.set(edge.target, targetLoad + edge.weight);
      }
    }

    return loadMap;
  }

  /**
   * Get hot nodes (load above threshold)
   */
  getHotNodes(threshold: number): Node[] {
    const loadMap = this.calculateLoad();
    const hotNodes: Node[] = [];

    for (const [nodeId, load] of loadMap) {
      if (load >= threshold) {
        const node = this.nodeMap.get(nodeId);
        if (node) hotNodes.push(node);
      }
    }

    return hotNodes;
  }

  /**
   * Export as simple SVG string
   */
  exportSVG(): string {
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">';
    svg += '<style>circle { stroke-width: 2px; } text { font-family: sans-serif; font-size: 12px; }</style>';

    // Draw edges
    for (const edge of this.edgeList) {
      const source = this.nodeMap.get(edge.source);
      const target = this.nodeMap.get(edge.target);
      if (source && target) {
        const stroke = edge.status === 'connected' ? '#4CAF50' : '#F44336';
        svg += `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="${stroke}" stroke-width="${Math.min(edge.weight, 5)}"/>`;
      }
    }

    // Draw nodes
    for (const node of this.nodeMap.values()) {
      let fill = '#4CAF50';
      if (node.status === 'inactive') fill = '#9E9E9E';
      if (node.status === 'warning') fill = '#FF9800';
      svg += `<circle cx="${node.x}" cy="${node.y}" r="15" fill="${fill}"/>`;
      svg += `<text x="${node.x}" y="${node.y + 30}" text-anchor="middle">${node.label}</text>`;
    }

    svg += '</svg>';
    return svg;
  }

  /**
   * Get node count
   */
  getNodeCount(): number {
    return this.nodeMap.size;
  }

  /**
   * Get edge count
   */
  getEdgeCount(): number {
    return this.edgeList.length;
  }

  /**
   * Get inactive nodes
   */
  getInactiveNodes(): Node[] {
    return Array.from(this.nodeMap.values()).filter(n => n.status === 'inactive');
  }

  /**
   * Get warning nodes
   */
  getWarningNodes(): Node[] {
    return Array.from(this.nodeMap.values()).filter(n => n.status === 'warning');
  }

  /**
   * Update node position
   */
  updateNodePosition(nodeId: string, x: number, y: number): boolean {
    const node = this.nodeMap.get(nodeId);
    if (!node) return false;
    node.x = x;
    node.y = y;
    return true;
  }

  /**
   * Update node status
   */
  updateNodeStatus(nodeId: string, status: NodeStatus): boolean {
    const node = this.nodeMap.get(nodeId);
    if (!node) return false;
    node.status = status;
    return true;
  }

  /**
   * Update edge status
   */
  updateEdgeStatus(sourceId: string, targetId: string, status: 'connected' | 'disconnected'): boolean {
    const edge = this.edgeList.find(e => e.source === sourceId && e.target === targetId);
    if (!edge) return false;
    edge.status = status;
    return true;
  }

  /**
   * Get connected nodes to a node
   */
  getConnectedNodes(nodeId: string): Node[] {
    const connected: Set<string> = new Set();

    for (const edge of this.edgeList) {
      if (edge.status !== 'connected') continue;
      if (edge.source === nodeId) {
        connected.add(edge.target);
      } else if (edge.target === nodeId) {
        connected.add(edge.source);
      }
    }

    return Array.from(connected).map(id => this.nodeMap.get(id)).filter((n): n is Node => n !== undefined);
  }

  /**
   * Get node degree (number of connections)
   */
  getNodeDegree(nodeId: string): number {
    return this.edgeList.filter(e => e.source === nodeId || e.target === nodeId).length;
  }

  /**
   * Find path between two nodes
   */
  findPath(fromId: string, toId: string): string[] | null {
    if (!this.nodeMap.has(fromId) || !this.nodeMap.has(toId)) return null;
    if (fromId === toId) return [fromId];

    const visited = new Set<string>();
    const queue: string[][] = [[fromId]];

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current === toId) return path;

      if (visited.has(current)) continue;
      visited.add(current);

      for (const edge of this.edgeList) {
        if (edge.status !== 'connected') continue;
        let neighbor: string | null = null;
        if (edge.source === current) neighbor = edge.target;
        else if (edge.target === current) neighbor = edge.source;

        if (neighbor && !visited.has(neighbor)) {
          queue.push([...path, neighbor]);
        }
      }
    }

    return null;
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.graph = { nodes: [], edges: [] };
    this.nodeMap.clear();
    this.edgeList = [];
  }
}

export default TopologyVisualizer;