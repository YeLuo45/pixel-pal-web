/**
 * Topology Engine
 * nanobot-design Topology Engine - AddNode + AddLink + Query + Stats
 */

export type NodeStatus = 'online' | 'offline' | 'degraded';

export interface TopoNode {
  id: string;
  name: string;
  status: NodeStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface TopoLink {
  id: string;
  from: string;
  to: string;
  weight: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface ToeStats {
  nodes: number;
  links: number;
  totalNodes: number;
  totalLinks: number;
  online: number;
  offline: number;
  degraded: number;
  activeNodes: number;
  inactiveNodes: number;
  activeLinks: number;
  inactiveLinks: number;
  totalHits: number;
  uniqueNodeNames: number;
  totalWeight: number;
  avgWeight: number;
  maxWeight: number;
  minWeight: number;
}

export class TopologyEngine {
  private nodes: Map<string, TopoNode> = new Map();
  private links: Map<string, TopoLink> = new Map();
  private nodeCounter = 0;
  private linkCounter = 0;
  private totalNodes = 0;
  private totalLinks = 0;

  addNode(name: string, status: NodeStatus = 'online'): string {
    const id = `toe-n-${++this.nodeCounter}`;
    this.nodes.set(id, {
      id,
      name,
      status,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalNodes++;
    return id;
  }

  addLink(from: string, to: string, weight: number = 1): string {
    const id = `toe-l-${++this.linkCounter}`;
    this.links.set(id, {
      id,
      from,
      to,
      weight,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalLinks++;
    return id;
  }

  query(id: string): TopoNode | undefined {
    return this.nodes.get(id);
  }

  neighbors(id: string): TopoLink[] {
    return Array.from(this.links.values()).filter(l => l.from === id || l.to === id);
  }

  removeNode(id: string): boolean {
    return this.nodes.delete(id);
  }

  removeLink(id: string): boolean {
    return this.links.delete(id);
  }

  setNodeStatus(id: string, status: NodeStatus): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.status = status;
    n.updated = Date.now();
    return true;
  }

  setLinkWeight(id: string, weight: number): boolean {
    const l = this.links.get(id);
    if (!l) return false;
    l.weight = weight;
    l.updated = Date.now();
    return true;
  }

  setActiveNode(id: string, active: boolean): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setActiveLink(id: string, active: boolean): boolean {
    const l = this.links.get(id);
    if (!l) return false;
    l.active = active;
    l.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.active = true;
      n.hits = 0;
    }
    for (const l of this.links.values()) {
      l.active = true;
      l.hits = 0;
    }
    this.totalNodes = 0;
    this.totalLinks = 0;
  }

  getStats(): ToeStats {
    const allNodes = Array.from(this.nodes.values());
    const allLinks = Array.from(this.links.values());
    const weightsArr = allLinks.map(l => l.weight);
    return {
      nodes: allNodes.length,
      links: allLinks.length,
      totalNodes: this.totalNodes,
      totalLinks: this.totalLinks,
      online: allNodes.filter(n => n.status === 'online').length,
      offline: allNodes.filter(n => n.status === 'offline').length,
      degraded: allNodes.filter(n => n.status === 'degraded').length,
      activeNodes: allNodes.filter(n => n.active).length,
      inactiveNodes: allNodes.filter(n => !n.active).length,
      activeLinks: allLinks.filter(l => l.active).length,
      inactiveLinks: allLinks.filter(l => !l.active).length,
      totalHits: allNodes.reduce((s, n) => s + n.hits, 0) + allLinks.reduce((s, l) => s + l.hits, 0),
      uniqueNodeNames: new Set(allNodes.map(n => n.name)).size,
      totalWeight: allLinks.reduce((s, l) => s + l.weight, 0),
      avgWeight: allLinks.length > 0 ? Math.round((weightsArr.reduce((s, v) => s + v, 0) / allLinks.length) * 100) / 100 : 0,
      maxWeight: weightsArr.length > 0 ? Math.max(...weightsArr) : 0,
      minWeight: weightsArr.length > 0 ? Math.min(...weightsArr) : 0,
    };
  }

  getNode(id: string): TopoNode | undefined {
    return this.nodes.get(id);
  }

  getLink(id: string): TopoLink | undefined {
    return this.links.get(id);
  }

  getAllNodes(): TopoNode[] {
    return Array.from(this.nodes.values());
  }

  getAllLinks(): TopoLink[] {
    return Array.from(this.links.values());
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  hasLink(id: string): boolean {
    return this.links.has(id);
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getLinkCount(): number {
    return this.links.size;
  }

  getNodeName(id: string): string | undefined {
    return this.nodes.get(id)?.name;
  }

  getNodeStatus(id: string): NodeStatus | undefined {
    return this.nodes.get(id)?.status;
  }

  getLinkWeight(id: string): number {
    return this.links.get(id)?.weight ?? 0;
  }

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? this.links.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.nodes.get(id)?.active ?? this.links.get(id)?.active ?? false;
  }

  isOnline(id: string): boolean {
    return this.nodes.get(id)?.status === 'online';
  }

  isOffline(id: string): boolean {
    return this.nodes.get(id)?.status === 'offline';
  }

  isDegraded(id: string): boolean {
    return this.nodes.get(id)?.status === 'degraded';
  }

  getByStatus(status: NodeStatus): TopoNode[] {
    return Array.from(this.nodes.values()).filter(n => n.status === status);
  }

  getActiveNodes(): TopoNode[] {
    return Array.from(this.nodes.values()).filter(n => n.active);
  }

  getInactiveNodes(): TopoNode[] {
    return Array.from(this.nodes.values()).filter(n => !n.active);
  }

  getActiveLinks(): TopoLink[] {
    return Array.from(this.links.values()).filter(l => l.active);
  }

  getInactiveLinks(): TopoLink[] {
    return Array.from(this.links.values()).filter(l => !l.active);
  }

  getAllNodeNames(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.name))];
  }

  getNewestNode(): TopoNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getNewestLink(): TopoLink | null {
    const all = Array.from(this.links.values());
    if (all.length === 0) return null;
    return all.reduce((max, l) => l.created > max.created ? l : max);
  }

  getTotalNodes(): number {
    return this.totalNodes;
  }

  getTotalLinks(): number {
    return this.totalLinks;
  }

  clearAll(): void {
    this.nodes.clear();
    this.links.clear();
    this.nodeCounter = 0;
    this.linkCounter = 0;
    this.totalNodes = 0;
    this.totalLinks = 0;
  }
}

export default TopologyEngine;