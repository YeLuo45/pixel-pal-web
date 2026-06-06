/**
 * Cluster Registry
 * nanobot-design Cluster Registry - Register + Heartbeat + Deregister + Stats
 */

export interface Cluster {
  id: string;
  name: string;
  address: string;
  lastHeartbeat: number;
  registered: boolean;
  created: number;
  updated: number;
  active: boolean;
  heartbeats: number;
  history: number[];
}

export interface CRStats {
  clusters: number;
  alive: number;
  dead: number;
  registered: number;
  deregistered: number;
  active: number;
  inactive: number;
  totalHeartbeats: number;
  avgHeartbeats: number;
  aliveRate: number;
}

export class ClusterRegistry {
  private clusters: Map<string, Cluster> = new Map();
  private counter = 0;
  private totalHeartbeats = 0;
  private timeoutMs: number;

  constructor(timeoutMs: number = 30000) {
    this.timeoutMs = timeoutMs;
  }

  register(name: string, address: string): string {
    const id = `cr-${++this.counter}`;
    this.clusters.set(id, {
      id,
      name,
      address,
      lastHeartbeat: Date.now(),
      registered: true,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      heartbeats: 0,
      history: [Date.now()],
    });
    return id;
  }

  heartbeat(id: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    if (!c.registered) return false;
    if (!c.active) return false;
    c.lastHeartbeat = Date.now();
    c.heartbeats++;
    c.history.push(c.lastHeartbeat);
    c.updated = Date.now();
    this.totalHeartbeats++;
    return true;
  }

  deregister(id: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    c.registered = false;
    c.updated = Date.now();
    return true;
  }

  reregister(id: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    c.registered = true;
    c.lastHeartbeat = Date.now();
    c.updated = Date.now();
    return true;
  }

  isAlive(id: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    return c.registered && (Date.now() - c.lastHeartbeat) < this.timeoutMs;
  }

  getStats(): CRStats {
    const all = Array.from(this.clusters.values());
    const alive = all.filter(c => this.isAlive(c.id)).length;
    return {
      clusters: all.length,
      alive,
      dead: all.length - alive,
      registered: all.filter(c => c.registered).length,
      deregistered: all.filter(c => !c.registered).length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHeartbeats: this.totalHeartbeats,
      avgHeartbeats: all.length > 0 ? Math.round((all.reduce((s, c) => s + c.heartbeats, 0) / all.length) * 100) / 100 : 0,
      aliveRate: all.length > 0 ? Math.round((alive / all.length) * 100) / 100 : 0,
    };
  }

  getCluster(id: string): Cluster | undefined {
    return this.clusters.get(id);
  }

  getAllClusters(): Cluster[] {
    return Array.from(this.clusters.values());
  }

  getAliveClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => this.isAlive(c.id));
  }

  getDeadClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => !this.isAlive(c.id));
  }

  removeCluster(id: string): boolean {
    return this.clusters.delete(id);
  }

  hasCluster(id: string): boolean {
    return this.clusters.has(id);
  }

  getCount(): number {
    return this.clusters.size;
  }

  getName(id: string): string | undefined {
    return this.clusters.get(id)?.name;
  }

  getAddress(id: string): string | undefined {
    return this.clusters.get(id)?.address;
  }

  getLastHeartbeat(id: string): number {
    return this.clusters.get(id)?.lastHeartbeat ?? 0;
  }

  getHeartbeats(id: string): number {
    return this.clusters.get(id)?.heartbeats ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.clusters.get(id)?.history ?? [])];
  }

  isRegistered(id: string): boolean {
    return this.clusters.get(id)?.registered ?? false;
  }

  isActive(id: string): boolean {
    return this.clusters.get(id)?.active ?? false;
  }

  getHeartbeatAge(id: string): number {
    const c = this.clusters.get(id);
    if (!c) return 0;
    return Date.now() - c.lastHeartbeat;
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  setAddress(id: string, address: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    c.address = address;
    c.updated = Date.now();
    return true;
  }

  setTimeout(timeoutMs: number): void {
    this.timeoutMs = timeoutMs;
  }

  getTimeout(): number {
    return this.timeoutMs;
  }

  resetAll(): void {
    for (const c of this.clusters.values()) {
      c.lastHeartbeat = Date.now();
      c.heartbeats = 0;
      c.history = [c.lastHeartbeat];
      c.registered = true;
      c.active = true;
    }
    this.totalHeartbeats = 0;
  }

  getByName(name: string): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.name === name);
  }

  getRegisteredClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.registered);
  }

  getDeregisteredClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => !c.registered);
  }

  getActiveClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.active);
  }

  getInactiveClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.clusters.values()).map(c => c.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinHeartbeats(min: number): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.heartbeats >= min);
  }

  getMostHeartbeats(): Cluster | null {
    const all = Array.from(this.clusters.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.heartbeats > max.heartbeats ? c : max);
  }

  getNewest(): Cluster | null {
    const all = Array.from(this.clusters.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Cluster | null {
    const all = Array.from(this.clusters.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.clusters.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.clusters.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.clusters.clear();
    this.counter = 0;
    this.totalHeartbeats = 0;
  }
}

export default ClusterRegistry;