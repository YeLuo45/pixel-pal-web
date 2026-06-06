/**
 * Mesh Manager
 * nanobot-design Mesh Manager - Register + Connect + Discover + Stats
 */

export interface MeshNode {
  id: string;
  name: string;
  address: string;
  connections: string[];
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface MMStats {
  nodes: number;
  connections: number;
  totalHits: number;
  active: number;
  inactive: number;
  avgConnections: number;
  addresses: number;
}

export class MeshManager {
  private nodes: Map<string, MeshNode> = new Map();
  private counter = 0;
  private totalConnections = 0;

  register(name: string, address: string): string {
    const id = `mm-${++this.counter}`;
    this.nodes.set(id, {
      id,
      name,
      address,
      connections: [],
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  connect(id1: string, id2: string): boolean {
    const n1 = this.nodes.get(id1);
    const n2 = this.nodes.get(id2);
    if (!n1 || !n2) return false;
    if (!n1.active || !n2.active) return false;
    if (id1 === id2) return false;
    if (!n1.connections.includes(id2)) {
      n1.connections.push(id2);
      this.totalConnections++;
      n1.updated = Date.now();
    }
    if (!n2.connections.includes(id1)) {
      n2.connections.push(id1);
      this.totalConnections++;
      n2.updated = Date.now();
    }
    return true;
  }

  disconnect(id1: string, id2: string): boolean {
    const n1 = this.nodes.get(id1);
    const n2 = this.nodes.get(id2);
    if (!n1 || !n2) return false;
    const before1 = n1.connections.length;
    const before2 = n2.connections.length;
    n1.connections = n1.connections.filter(c => c !== id2);
    n2.connections = n2.connections.filter(c => c !== id1);
    if (n1.connections.length < before1) this.totalConnections--;
    if (n2.connections.length < before2) this.totalConnections--;
    n1.updated = Date.now();
    n2.updated = Date.now();
    return true;
  }

  discover(id: string): string[] {
    const n = this.nodes.get(id);
    if (!n) return [];
    if (!n.active) return [];
    n.hits++;
    n.updated = Date.now();
    return [...n.connections];
  }

  areConnected(id1: string, id2: string): boolean {
    const n1 = this.nodes.get(id1);
    return n1?.connections.includes(id2) ?? false;
  }

  getStats(): MMStats {
    const all = Array.from(this.nodes.values());
    return {
      nodes: all.length,
      connections: this.totalConnections,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      avgConnections: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.connections.length, 0) / all.length) * 100) / 100 : 0,
      addresses: new Set(all.map(n => n.address)).size,
    };
  }

  getNode(id: string): MeshNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
  }

  removeNode(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    // Remove connections to this node from others
    for (const other of this.nodes.values()) {
      other.connections = other.connections.filter(c => c !== id);
    }
    this.totalConnections -= n.connections.length;
    return this.nodes.delete(id);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getCount(): number {
    return this.nodes.size;
  }

  getName(id: string): string | undefined {
    return this.nodes.get(id)?.name;
  }

  getAddress(id: string): string | undefined {
    return this.nodes.get(id)?.address;
  }

  getConnections(id: string): string[] {
    return [...(this.nodes.get(id)?.connections ?? [])];
  }

  getConnectionCount(id: string): number {
    return this.nodes.get(id)?.connections.length ?? 0;
  }

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.nodes.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.name = name;
    n.updated = Date.now();
    return true;
  }

  setAddress(id: string, address: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.address = address;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.connections = [];
      n.hits = 0;
      n.active = true;
    }
    this.totalConnections = 0;
  }

  getByName(name: string): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.name === name);
  }

  getByAddress(address: string): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.address === address);
  }

  getActiveNodes(): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.active);
  }

  getInactiveNodes(): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => !n.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllAddresses(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.address))];
  }

  getAddressCount(): number {
    return this.getAllAddresses().length;
  }

  getByMinConnections(min: number): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.connections.length >= min);
  }

  getMostConnected(): MeshNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.connections.length > max.connections.length ? n : max);
  }

  getNewest(): MeshNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): MeshNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((min, n) => n.created < min.created ? n : min);
  }

  getCreatedAt(id: string): number {
    return this.nodes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.nodes.get(id)?.updated ?? 0;
  }

  getTotalConnections(): number {
    return this.totalConnections;
  }

  clearAll(): void {
    this.nodes.clear();
    this.counter = 0;
    this.totalConnections = 0;
  }
}

export default MeshManager;