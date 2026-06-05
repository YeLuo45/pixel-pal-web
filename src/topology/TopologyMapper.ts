/**
 * Topology Mapper
 * nanobot-design Topology Mapper - Node + Link + Subnet + Analyze
 */

export type NodeType = 'gateway' | 'service' | 'database' | 'cache';

export interface TopologyNode {
  id: string;
  type: NodeType;
  subnet: string;
}

export interface TopologyLink {
  source: string;
  target: string;
  weight: number;
}

export interface TopologyStats {
  nodes: number;
  links: number;
  subnets: number;
  avgConnections: number;
}

export class TopologyMapper {
  private nodes: Map<string, TopologyNode> = new Map();
  private links: TopologyLink[] = [];

  addNode(node: TopologyNode): void {
    this.nodes.set(node.id, { ...node });
  }

  addLink(link: TopologyLink): void {
    this.links.push({ ...link });
  }

  getSubnets(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.subnet))];
  }

  getNodesInSubnet(subnet: string): TopologyNode[] {
    return Array.from(this.nodes.values()).filter(n => n.subnet === subnet);
  }

  getStats(): TopologyStats {
    const subnets = this.getSubnets().length;
    const nodes = this.nodes.size;
    const links = this.links.length;
    const avgConnections = nodes > 0 ? Math.round((links / nodes) * 100) / 100 : 0;
    return { nodes, links, subnets, avgConnections };
  }

  getNode(id: string): TopologyNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): TopologyNode[] {
    return Array.from(this.nodes.values());
  }

  getAllLinks(): TopologyLink[] {
    return [...this.links];
  }

  removeNode(id: string): boolean {
    // Also remove links involving this node
    this.links = this.links.filter(l => l.source !== id && l.target !== id);
    return this.nodes.delete(id);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getLinkCount(): number {
    return this.links.length;
  }

  getNodesByType(type: NodeType): TopologyNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  getNodeType(id: string): NodeType | undefined {
    return this.nodes.get(id)?.type;
  }

  getSubnetOfNode(id: string): string | undefined {
    return this.nodes.get(id)?.subnet;
  }

  getLinksForNode(id: string): TopologyLink[] {
    return this.links.filter(l => l.source === id || l.target === id);
  }

  getOutgoingLinks(id: string): TopologyLink[] {
    return this.links.filter(l => l.source === id);
  }

  getIncomingLinks(id: string): TopologyLink[] {
    return this.links.filter(l => l.target === id);
  }

  getDegree(id: string): number {
    return this.getLinksForNode(id).length;
  }

  removeLink(source: string, target: string): boolean {
    const idx = this.links.findIndex(l => l.source === source && l.target === target);
    if (idx === -1) return false;
    this.links.splice(idx, 1);
    return true;
  }

  hasLink(source: string, target: string): boolean {
    return this.links.some(l => l.source === source && l.target === target);
  }

  getSubnetSize(subnet: string): number {
    return this.getNodesInSubnet(subnet).length;
  }

  getSubnetLinks(subnet: string): TopologyLink[] {
    const nodeIds = new Set(this.getNodesInSubnet(subnet).map(n => n.id));
    return this.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
  }

  getCrossSubnetLinks(): TopologyLink[] {
    return this.links.filter(l => {
      const source = this.nodes.get(l.source);
      const target = this.nodes.get(l.target);
      return source && target && source.subnet !== target.subnet;
    });
  }

  getIsolatedNodes(): TopologyNode[] {
    const connected = new Set<string>();
    for (const link of this.links) {
      connected.add(link.source);
      connected.add(link.target);
    }
    return Array.from(this.nodes.values()).filter(n => !connected.has(n.id));
  }

  isConnected(): boolean {
    if (this.nodes.size === 0) return true;
    if (this.links.length === 0) return false;
    const visited = new Set<string>();
    const start = Array.from(this.nodes.keys())[0];
    const stack = [start];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const link of this.links) {
        if (link.source === current && !visited.has(link.target)) stack.push(link.target);
        if (link.target === current && !visited.has(link.source)) stack.push(link.source);
      }
    }
    return visited.size === this.nodes.size;
  }

  getMaxDegreeNode(): TopologyNode | null {
    let max = -1;
    let result: TopologyNode | null = null;
    for (const node of this.nodes.values()) {
      const degree = this.getDegree(node.id);
      if (degree > max) {
        max = degree;
        result = node;
      }
    }
    return result;
  }

  clearAll(): void {
    this.nodes.clear();
    this.links = [];
  }
}

export default TopologyMapper;