/**
 * Discovery Engine
 * nanobot-design Discovery Engine - Discover + Query + Stats
 */

export interface DiscoveredNode {
  id: string;
  host: string;
  port: number;
  healthy: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface DE3Stats {
  discovered: number;
  healthy: number;
  unhealthy: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueHosts: number;
  uniquePorts: number;
  avgHits: number;
}

export class DiscoveryEngine {
  private nodes: Map<string, DiscoveredNode> = new Map();
  private counter = 0;

  discover(host: string, port: number, healthy: boolean = true): string {
    const id = `de2-${++this.counter}`;
    this.nodes.set(id, {
      id,
      host,
      port,
      healthy,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  setHealth(id: string, healthy: boolean): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (!n.active) return false;
    n.healthy = healthy;
    n.updated = Date.now();
    n.hits++;
    return true;
  }

  queryByHealth(healthy: boolean): DiscoveredNode[] {
    return Array.from(this.nodes.values()).filter(n => n.healthy === healthy);
  }

  queryByHost(host: string): DiscoveredNode[] {
    return Array.from(this.nodes.values()).filter(n => n.host === host);
  }

  queryByPort(port: number): DiscoveredNode[] {
    return Array.from(this.nodes.values()).filter(n => n.port === port);
  }

  getStats(): DE3Stats {
    const all = Array.from(this.nodes.values());
    return {
      discovered: all.length,
      healthy: all.filter(n => n.healthy).length,
      unhealthy: all.filter(n => !n.healthy).length,
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      uniqueHosts: new Set(all.map(n => n.host)).size,
      uniquePorts: new Set(all.map(n => n.port)).size,
      avgHits: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.hits, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getNode(id: string): DiscoveredNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): DiscoveredNode[] {
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

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.nodes.get(id)?.active ?? false;
  }

  isHealthy(id: string): boolean {
    return this.nodes.get(id)?.healthy ?? false;
  }

  isUnhealthy(id: string): boolean {
    const n = this.nodes.get(id);
    return n ? !n.healthy : false;
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

  touch(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.hits++;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.hits = 0;
      n.active = true;
    }
  }

  getHealthyNodes(): DiscoveredNode[] {
    return this.queryByHealth(true);
  }

  getUnhealthyNodes(): DiscoveredNode[] {
    return this.queryByHealth(false);
  }

  getActiveNodes(): DiscoveredNode[] {
    return Array.from(this.nodes.values()).filter(n => n.active);
  }

  getInactiveNodes(): DiscoveredNode[] {
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

  getNewest(): DiscoveredNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): DiscoveredNode | null {
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

  clearAll(): void {
    this.nodes.clear();
    this.counter = 0;
  }
}

export default DiscoveryEngine;