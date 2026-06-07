/**
 * Mesh Engine
 * nanobot-design Mesh Engine - AddNode + Connect + Disconnect + Stats
 */

export type MeshLinkState = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface MeshNode {
  id: string;
  name: string;
  peers: number;
  state: MeshLinkState;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface MheStats {
  nodes: number;
  totalAdded: number;
  totalConnected: number;
  totalDisconnected: number;
  connected: number;
  disconnected: number;
  connecting: number;
  error: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalPeers: number;
  avgPeers: number;
  maxPeers: number;
}

export class MeshEngine {
  private nodes: Map<string, MeshNode> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalConnected = 0;
  private totalDisconnected = 0;
  private totalPeers = 0;

  addNode(name: string): string {
    const id = `mhe-${++this.counter}`;
    this.nodes.set(id, {
      id,
      name,
      peers: 0,
      state: 'disconnected',
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    return id;
  }

  connect(id: string, peerCount: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (!n.active) return false;
    n.peers = Math.max(0, peerCount);
    n.state = 'connecting';
    n.updated = Date.now();
    n.hits++;
    n.state = 'connected';
    this.totalConnected++;
    this.totalPeers += peerCount;
    return true;
  }

  disconnect(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (!n.active) return false;
    n.state = 'disconnected';
    n.peers = 0;
    n.updated = Date.now();
    n.hits++;
    this.totalDisconnected++;
    return true;
  }

  error(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.state = 'error';
    n.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.nodes.delete(id);
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

  setState(id: string, state: MeshLinkState): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.state = state;
    n.updated = Date.now();
    return true;
  }

  setPeers(id: string, peers: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.peers = Math.max(0, peers);
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.peers = 0;
      n.state = 'disconnected';
      n.active = true;
      n.hits = 0;
    }
    this.totalAdded = 0;
    this.totalConnected = 0;
    this.totalDisconnected = 0;
    this.totalPeers = 0;
  }

  getStats(): MheStats {
    const all = Array.from(this.nodes.values());
    const pArr = all.map(n => n.peers);
    return {
      nodes: all.length,
      totalAdded: this.totalAdded,
      totalConnected: this.totalConnected,
      totalDisconnected: this.totalDisconnected,
      connected: all.filter(n => n.state === 'connected').length,
      disconnected: all.filter(n => n.state === 'disconnected').length,
      connecting: all.filter(n => n.state === 'connecting').length,
      error: all.filter(n => n.state === 'error').length,
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      uniqueNames: new Set(all.map(n => n.name)).size,
      totalPeers: this.totalPeers,
      avgPeers: all.length > 0 ? Math.round((pArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPeers: pArr.length > 0 ? Math.max(...pArr) : 0,
    };
  }

  getNode(id: string): MeshNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
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

  getState(id: string): MeshLinkState | undefined {
    return this.nodes.get(id)?.state;
  }

  getPeers(id: string): number {
    return this.nodes.get(id)?.peers ?? 0;
  }

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.nodes.get(id)?.active ?? false;
  }

  isConnected(id: string): boolean {
    return this.nodes.get(id)?.state === 'connected';
  }

  isDisconnected(id: string): boolean {
    return this.nodes.get(id)?.state === 'disconnected';
  }

  isConnecting(id: string): boolean {
    return this.nodes.get(id)?.state === 'connecting';
  }

  isError(id: string): boolean {
    return this.nodes.get(id)?.state === 'error';
  }

  getByState(state: MeshLinkState): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.state === state);
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalConnected(): number {
    return this.totalConnected;
  }

  getTotalDisconnected(): number {
    return this.totalDisconnected;
  }

  clearAll(): void {
    this.nodes.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalConnected = 0;
    this.totalDisconnected = 0;
    this.totalPeers = 0;
  }
}

export default MeshEngine;