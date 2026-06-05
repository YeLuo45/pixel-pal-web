/**
 * Node Registry
 * nanobot-design Node Registry - Register + Query + Health + Discover
 */

export type NodeStatus = 'online' | 'offline' | 'busy';

export interface Node {
  id: string;
  host: string;
  port: number;
  status: NodeStatus;
  tags: string[];
  lastSeen: number;
}

export class NodeRegistry {
  private nodes: Map<string, Node> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();

  register(node: Node): void {
    this.nodes.set(node.id, { ...node, tags: [...node.tags] });
    for (const tag of node.tags) {
      if (!this.tagIndex.has(tag)) this.tagIndex.set(tag, new Set());
      this.tagIndex.get(tag)!.add(node.id);
    }
  }

  find(id: string): Node | null {
    return this.nodes.get(id) ?? null;
  }

  findByTag(tag: string): Node[] {
    const ids = this.tagIndex.get(tag) ?? new Set();
    return Array.from(ids).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  getHealthy(): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.status === 'online');
  }

  getBusy(): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.status === 'busy');
  }

  getOffline(): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.status === 'offline');
  }

  deregister(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    for (const tag of node.tags) {
      this.tagIndex.get(tag)?.delete(id);
    }
    return this.nodes.delete(id);
  }

  getAll(): Node[] {
    return Array.from(this.nodes.values());
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getCount(): number {
    return this.nodes.size;
  }

  setStatus(id: string, status: NodeStatus): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    node.status = status;
    node.lastSeen = Date.now();
    return true;
  }

  heartbeat(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    node.lastSeen = Date.now();
    return true;
  }

  getByHost(host: string): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.host === host);
  }

  getByPort(port: number): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.port === port);
  }

  getAllTags(): string[] {
    return [...this.tagIndex.keys()];
  }

  getTagCount(): number {
    return this.tagIndex.size;
  }

  getAllHosts(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.host))];
  }

  getNodesByStatus(status: NodeStatus): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.status === status);
  }

  isStale(id: string, threshold: number = 60000): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    return Date.now() - node.lastSeen > threshold;
  }

  getStaleNodes(threshold: number = 60000): Node[] {
    return Array.from(this.nodes.values()).filter(n => Date.now() - n.lastSeen > threshold);
  }

  getLastSeen(id: string): number {
    return this.nodes.get(id)?.lastSeen ?? 0;
  }

  clearAll(): void {
    this.nodes.clear();
    this.tagIndex.clear();
  }
}

export default NodeRegistry;