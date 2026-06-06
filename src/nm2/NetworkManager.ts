/**
 * Network Manager
 * nanobot-design Network Manager - Connect + Send + Disconnect + Stats
 */

export interface NetworkNode {
  id: string;
  host: string;
  port: number;
  bandwidth: number;
  bytesSent: number;
  bytesReceived: number;
  connected: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface NM2Stats {
  nodes: number;
  connected: number;
  disconnected: number;
  totalSent: number;
  totalReceived: number;
  totalBandwidth: number;
  totalHits: number;
  active: number;
  inactive: number;
  avgBandwidth: number;
  hosts: number;
  ports: number;
}

export class NetworkManager {
  private nodes: Map<string, NetworkNode> = new Map();
  private counter = 0;
  private totalSent = 0;
  private totalReceived = 0;

  connect(host: string, port: number, bandwidth: number = 1000): string {
    const id = `nm2-${++this.counter}`;
    this.nodes.set(id, {
      id,
      host,
      port,
      bandwidth,
      bytesSent: 0,
      bytesReceived: 0,
      connected: true,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  send(id: string, bytes: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (!n.connected) return false;
    if (!n.active) return false;
    n.bytesSent += bytes;
    n.updated = Date.now();
    n.hits++;
    this.totalSent += bytes;
    return true;
  }

  receive(id: string, bytes: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (!n.connected) return false;
    if (!n.active) return false;
    n.bytesReceived += bytes;
    n.updated = Date.now();
    n.hits++;
    this.totalReceived += bytes;
    return true;
  }

  disconnect(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.connected = false;
    n.updated = Date.now();
    return true;
  }

  reconnect(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.connected = true;
    n.updated = Date.now();
    return true;
  }

  getStats(): NM2Stats {
    const all = Array.from(this.nodes.values());
    return {
      nodes: all.length,
      connected: all.filter(n => n.connected).length,
      disconnected: all.filter(n => !n.connected).length,
      totalSent: this.totalSent,
      totalReceived: this.totalReceived,
      totalBandwidth: all.reduce((s, n) => s + n.bandwidth, 0),
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      avgBandwidth: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.bandwidth, 0) / all.length) * 100) / 100 : 0,
      hosts: new Set(all.map(n => n.host)).size,
      ports: new Set(all.map(n => n.port)).size,
    };
  }

  getNode(id: string): NetworkNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): NetworkNode[] {
    return Array.from(this.nodes.values());
  }

  removeNode(id: string): boolean {
    return this.nodes.delete(id);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getCount(): number {
    return this.nodes.size;
  }

  getHost(id: string): string | undefined {
    return this.nodes.get(id)?.host;
  }

  getPort(id: string): number {
    return this.nodes.get(id)?.port ?? 0;
  }

  getBandwidth(id: string): number {
    return this.nodes.get(id)?.bandwidth ?? 0;
  }

  getBytesSent(id: string): number {
    return this.nodes.get(id)?.bytesSent ?? 0;
  }

  getBytesReceived(id: string): number {
    return this.nodes.get(id)?.bytesReceived ?? 0;
  }

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? 0;
  }

  isConnected(id: string): boolean {
    return this.nodes.get(id)?.connected ?? false;
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

  setHost(id: string, host: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.host = host;
    n.updated = Date.now();
    return true;
  }

  setPort(id: string, port: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.port = port;
    n.updated = Date.now();
    return true;
  }

  setBandwidth(id: string, bandwidth: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.bandwidth = bandwidth;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.bytesSent = 0;
      n.bytesReceived = 0;
      n.hits = 0;
      n.connected = true;
      n.active = true;
    }
    this.totalSent = 0;
    this.totalReceived = 0;
  }

  getByHost(host: string): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(n => n.host === host);
  }

  getByPort(port: number): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(n => n.port === port);
  }

  getConnectedNodes(): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(n => n.connected);
  }

  getDisconnectedNodes(): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(n => !n.connected);
  }

  getActiveNodes(): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(n => n.active);
  }

  getInactiveNodes(): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(n => !n.active);
  }

  getAllHosts(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.host))];
  }

  getHostCount(): number {
    return this.getAllHosts().length;
  }

  getAllPorts(): number[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.port))];
  }

  getPortCount(): number {
    return this.getAllPorts().length;
  }

  getByMinBandwidth(min: number): NetworkNode[] {
    return Array.from(this.nodes.values()).filter(n => n.bandwidth >= min);
  }

  getMostBandwidth(): NetworkNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.bandwidth > max.bandwidth ? n : max);
  }

  getMostSent(): NetworkNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.bytesSent > max.bytesSent ? n : max);
  }

  getNewest(): NetworkNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): NetworkNode | null {
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

  getTotalSent(): number {
    return this.totalSent;
  }

  getTotalReceived(): number {
    return this.totalReceived;
  }

  clearAll(): void {
    this.nodes.clear();
    this.counter = 0;
    this.totalSent = 0;
    this.totalReceived = 0;
  }
}

export default NetworkManager;