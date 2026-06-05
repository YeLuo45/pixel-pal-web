/**
 * Mesh Network
 * nanobot-design Mesh Network - AddNode + Connect + Send + Topology
 */

export interface MeshNode {
  id: string;
  peers: string[];
  reachable: boolean;
}

export interface MeshMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  path: string[];
  timestamp: number;
}

export class MeshNetwork {
  private nodes: Map<string, MeshNode> = new Map();
  private messages: MeshMessage[] = [];
  private counter = 0;

  addNode(id: string): boolean {
    if (this.nodes.has(id)) return false;
    this.nodes.set(id, { id, peers: [], reachable: true });
    return true;
  }

  connect(from: string, to: string): boolean {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);
    if (!fromNode || !toNode) return false;
    if (!fromNode.peers.includes(to)) fromNode.peers.push(to);
    if (!toNode.peers.includes(from)) toNode.peers.push(from);
    return true;
  }

  send(from: string, to: string, content: string): string | null {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return null;
    const path = this.findPath(from, to);
    if (!path) return null;
    const id = `msg-${++this.counter}`;
    this.messages.push({ id, from, to, content, path, timestamp: Date.now() });
    return id;
  }

  getTopology(): Map<string, string[]> {
    const topology = new Map<string, string[]>();
    for (const [id, node] of this.nodes.entries()) {
      topology.set(id, [...node.peers]);
    }
    return topology;
  }

  private findPath(from: string, to: string): string[] | null {
    if (from === to) return [from];
    const visited = new Set<string>();
    const queue: string[][] = [[from]];
    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];
      if (visited.has(node)) continue;
      visited.add(node);
      const neighbors = this.nodes.get(node)?.peers ?? [];
      for (const neighbor of neighbors) {
        if (neighbor === to) return [...path, neighbor];
        if (!visited.has(neighbor)) queue.push([...path, neighbor]);
      }
    }
    return null;
  }

  getNode(id: string): MeshNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
  }

  removeNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    for (const peer of node.peers) {
      const peerNode = this.nodes.get(peer);
      if (peerNode) {
        peerNode.peers = peerNode.peers.filter(p => p !== id);
      }
    }
    return this.nodes.delete(id);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getCount(): number {
    return this.nodes.size;
  }

  getPeers(id: string): string[] {
    return [...(this.nodes.get(id)?.peers ?? [])];
  }

  getPeerCount(id: string): number {
    return this.nodes.get(id)?.peers.length ?? 0;
  }

  isPeer(a: string, b: string): boolean {
    return this.nodes.get(a)?.peers.includes(b) ?? false;
  }

  disconnect(from: string, to: string): boolean {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);
    if (!fromNode || !toNode) return false;
    fromNode.peers = fromNode.peers.filter(p => p !== to);
    toNode.peers = toNode.peers.filter(p => p !== from);
    return true;
  }

  getMessages(): MeshMessage[] {
    return [...this.messages];
  }

  getMessage(id: string): MeshMessage | undefined {
    return this.messages.find(m => m.id === id);
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  getMessagesForNode(id: string): MeshMessage[] {
    return this.messages.filter(m => m.to === id || m.from === id);
  }

  setReachable(id: string, reachable: boolean): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    node.reachable = reachable;
    return true;
  }

  isReachable(id: string): boolean {
    return this.nodes.get(id)?.reachable ?? false;
  }

  getReachableNodes(): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.reachable);
  }

  getUnreachableNodes(): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => !n.reachable);
  }

  isConnected(a: string, b: string): boolean {
    return this.findPath(a, b) !== null;
  }

  getNetworkSize(): number {
    return this.nodes.size;
  }

  getEdgeCount(): number {
    let count = 0;
    for (const node of this.nodes.values()) count += node.peers.length;
    return count / 2; // each edge counted twice
  }

  getAvgDegree(): number {
    if (this.nodes.size === 0) return 0;
    return Math.round((this.getEdgeCount() * 2 / this.nodes.size) * 100) / 100;
  }

  getMaxDegree(): number {
    return Math.max(0, ...Array.from(this.nodes.values()).map(n => n.peers.length));
  }

  clearAll(): void {
    this.nodes.clear();
    this.messages = [];
    this.counter = 0;
  }
}

export default MeshNetwork;