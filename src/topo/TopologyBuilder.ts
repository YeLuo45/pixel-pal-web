/**
 * Topology Builder
 * nanobot-design Topology Builder - AddNode + AddEdge + Layout + Validate
 */

export interface TopologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  created: number;
}

export interface TopologyEdge {
  from: string;
  to: string;
  created: number;
}

export type LayoutType = 'grid' | 'tree' | 'circle';

export interface TopologyStats {
  nodes: number;
  edges: number;
  valid: boolean;
  components: number;
}

export class TopologyBuilder {
  private nodes: Map<string, TopologyNode> = new Map();
  private edges: TopologyEdge[] = [];
  private valid = false;

  addNode(id: string, label: string): boolean {
    if (this.nodes.has(id)) return false;
    this.nodes.set(id, { id, label, x: 0, y: 0, created: Date.now() });
    return true;
  }

  addEdge(from: string, to: string): boolean {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return false;
    if (this.edges.some(e => e.from === from && e.to === to)) return false;
    this.edges.push({ from, to, created: Date.now() });
    return true;
  }

  layout(type: LayoutType): boolean {
    const nodes = Array.from(this.nodes.values());
    if (nodes.length === 0) return false;
    if (type === 'grid') {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      nodes.forEach((node, i) => {
        node.x = (i % cols) * 100;
        node.y = Math.floor(i / cols) * 100;
      });
    } else if (type === 'circle') {
      const radius = 100;
      const angle = (2 * Math.PI) / nodes.length;
      nodes.forEach((node, i) => {
        node.x = radius * Math.cos(i * angle);
        node.y = radius * Math.sin(i * angle);
      });
    } else if (type === 'tree') {
      // Simple BFS layout
      const visited = new Set<string>();
      const queue: { id: string; depth: number; x: number }[] = [];
      const start = nodes[0];
      visited.add(start.id);
      queue.push({ id: start.id, depth: 0, x: 0 });
      while (queue.length > 0) {
        const { id, depth, x } = queue.shift()!;
        const node = this.nodes.get(id);
        if (!node) continue;
        node.x = x;
        node.y = depth * 100;
        const children = this.edges.filter(e => e.from === id).map(e => e.to);
        for (let i = 0; i < children.length; i++) {
          if (!visited.has(children[i])) {
            visited.add(children[i]);
            queue.push({ id: children[i], depth: depth + 1, x: x + (i - children.length / 2) * 100 });
          }
        }
      }
    }
    return true;
  }

  validate(): boolean {
    this.valid = true;
    for (const edge of this.edges) {
      if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
        this.valid = false;
        return false;
      }
    }
    return this.valid;
  }

  getStats(): TopologyStats {
    return {
      nodes: this.nodes.size,
      edges: this.edges.length,
      valid: this.valid,
      components: this.countComponents(),
    };
  }

  getNode(id: string): TopologyNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): TopologyNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): TopologyEdge[] {
    return [...this.edges];
  }

  removeNode(id: string): boolean {
    const removed = this.nodes.delete(id);
    if (removed) {
      this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    }
    return removed;
  }

  removeEdge(from: string, to: string): boolean {
    const idx = this.edges.findIndex(e => e.from === from && e.to === to);
    if (idx === -1) return false;
    this.edges.splice(idx, 1);
    return true;
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  hasEdge(from: string, to: string): boolean {
    return this.edges.some(e => e.from === from && e.to === to);
  }

  getCount(): number {
    return this.nodes.size;
  }

  getEdgeCount(): number {
    return this.edges.length;
  }

  getLabel(id: string): string | undefined {
    return this.nodes.get(id)?.label;
  }

  getX(id: string): number {
    return this.nodes.get(id)?.x ?? 0;
  }

  getY(id: string): number {
    return this.nodes.get(id)?.y ?? 0;
  }

  setPosition(id: string, x: number, y: number): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    node.x = x;
    node.y = y;
    return true;
  }

  setLabel(id: string, label: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    node.label = label;
    return true;
  }

  getNodesWithEdges(): TopologyNode[] {
    const ids = new Set<string>();
    for (const edge of this.edges) {
      ids.add(edge.from);
      ids.add(edge.to);
    }
    return Array.from(ids).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  getNodesWithoutEdges(): TopologyNode[] {
    const ids = new Set<string>();
    for (const edge of this.edges) {
      ids.add(edge.from);
      ids.add(edge.to);
    }
    return Array.from(this.nodes.values()).filter(n => !ids.has(n.id));
  }

  getEdgesForNode(id: string): TopologyEdge[] {
    return this.edges.filter(e => e.from === id || e.to === id);
  }

  getEdgeCountForNode(id: string): number {
    return this.getEdgesForNode(id).length;
  }

  isValid(): boolean {
    return this.valid;
  }

  getNeighbors(id: string): string[] {
    const neighbors = new Set<string>();
    for (const edge of this.edges) {
      if (edge.from === id) neighbors.add(edge.to);
      if (edge.to === id) neighbors.add(edge.from);
    }
    return Array.from(neighbors);
  }

  countComponents(): number {
    const visited = new Set<string>();
    let count = 0;
    for (const node of this.nodes.values()) {
      if (!visited.has(node.id)) {
        count++;
        const stack = [node.id];
        while (stack.length > 0) {
          const id = stack.pop()!;
          if (visited.has(id)) continue;
          visited.add(id);
          for (const edge of this.edges) {
            if (edge.from === id && !visited.has(edge.to)) stack.push(edge.to);
            if (edge.to === id && !visited.has(edge.from)) stack.push(edge.from);
          }
        }
      }
    }
    return count;
  }

  getCreatedAt(id: string): number {
    return this.nodes.get(id)?.created ?? 0;
  }

  clearAll(): void {
    this.nodes.clear();
    this.edges = [];
    this.valid = false;
  }
}

export default TopologyBuilder;