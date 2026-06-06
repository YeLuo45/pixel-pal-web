/**
 * Server Manager
 * nanobot-design Server Manager - Register + Handle + SetHealth + Stats
 */

export interface Server {
  id: string;
  host: string;
  port: number;
  requests: number;
  errors: number;
  healthy: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
}

export interface SM3Stats {
  servers: number;
  healthy: number;
  unhealthy: number;
  totalRequests: number;
  totalErrors: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueHosts: number;
  avgRequests: number;
  maxRequests: number;
  minRequests: number;
  avgPort: number;
  errorRate: number;
}

export class ServerManager {
  private servers: Map<string, Server> = new Map();
  private counter = 0;
  private totalRequests = 0;
  private totalErrors = 0;

  register(host: string, port: number): string {
    const id = `sm3-${++this.counter}`;
    this.servers.set(id, {
      id,
      host,
      port,
      requests: 0,
      errors: 0,
      healthy: true,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  handle(id: string, success: boolean = true): boolean {
    const s = this.servers.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.requests++;
    s.history.push(success);
    s.updated = Date.now();
    s.hits++;
    this.totalRequests++;
    if (!success) {
      s.errors++;
      this.totalErrors++;
    }
    return true;
  }

  setHealth(id: string, healthy: boolean): boolean {
    const s = this.servers.get(id);
    if (!s) return false;
    s.healthy = healthy;
    s.updated = Date.now();
    return true;
  }

  reset(id: string): boolean {
    const s = this.servers.get(id);
    if (!s) return false;
    s.requests = 0;
    s.errors = 0;
    s.hits = 0;
    s.history = [];
    s.updated = Date.now();
    return true;
  }

  getStats(): SM3Stats {
    const all = Array.from(this.servers.values());
    const requestValues = all.map(s => s.requests);
    const portValues = all.map(s => s.port);
    return {
      servers: all.length,
      healthy: all.filter(s => s.healthy).length,
      unhealthy: all.filter(s => !s.healthy).length,
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueHosts: new Set(all.map(s => s.host)).size,
      avgRequests: all.length > 0 ? Math.round((requestValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxRequests: requestValues.length > 0 ? Math.max(...requestValues) : 0,
      minRequests: requestValues.length > 0 ? Math.min(...requestValues) : 0,
      avgPort: all.length > 0 ? Math.round((portValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      errorRate: this.totalRequests > 0 ? Math.round((this.totalErrors / this.totalRequests) * 100) / 100 : 0,
    };
  }

  getServer(id: string): Server | undefined {
    return this.servers.get(id);
  }

  getAllServers(): Server[] {
    return Array.from(this.servers.values());
  }

  removeServer(id: string): boolean {
    return this.servers.delete(id);
  }

  hasServer(id: string): boolean {
    return this.servers.has(id);
  }

  getCount(): number {
    return this.servers.size;
  }

  getHost(id: string): string | undefined {
    return this.servers.get(id)?.host;
  }

  getPort(id: string): number {
    return this.servers.get(id)?.port ?? 0;
  }

  getRequests(id: string): number {
    return this.servers.get(id)?.requests ?? 0;
  }

  getErrors(id: string): number {
    return this.servers.get(id)?.errors ?? 0;
  }

  getHistory(id: string): boolean[] {
    return [...(this.servers.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.servers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.servers.get(id)?.active ?? false;
  }

  isHealthy(id: string): boolean {
    return this.servers.get(id)?.healthy ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.servers.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setHost(id: string, host: string): boolean {
    const s = this.servers.get(id);
    if (!s) return false;
    s.host = host;
    s.updated = Date.now();
    return true;
  }

  setPort(id: string, port: number): boolean {
    const s = this.servers.get(id);
    if (!s) return false;
    s.port = port;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.servers.values()) {
      s.requests = 0;
      s.errors = 0;
      s.hits = 0;
      s.history = [];
      s.active = true;
      s.healthy = true;
    }
    this.totalRequests = 0;
    this.totalErrors = 0;
  }

  getByHost(host: string): Server[] {
    return Array.from(this.servers.values()).filter(s => s.host === host);
  }

  getHealthyServers(): Server[] {
    return Array.from(this.servers.values()).filter(s => s.healthy);
  }

  getUnhealthyServers(): Server[] {
    return Array.from(this.servers.values()).filter(s => !s.healthy);
  }

  getActiveServers(): Server[] {
    return Array.from(this.servers.values()).filter(s => s.active);
  }

  getInactiveServers(): Server[] {
    return Array.from(this.servers.values()).filter(s => !s.active);
  }

  getAllHosts(): string[] {
    return [...new Set(Array.from(this.servers.values()).map(s => s.host))];
  }

  getHostCount(): number {
    return this.getAllHosts().length;
  }

  getByMinRequests(min: number): Server[] {
    return Array.from(this.servers.values()).filter(s => s.requests >= min);
  }

  getMostRequests(): Server | null {
    const all = Array.from(this.servers.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.requests > max.requests ? s : max);
  }

  getNewest(): Server | null {
    const all = Array.from(this.servers.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Server | null {
    const all = Array.from(this.servers.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.servers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.servers.get(id)?.updated ?? 0;
  }

  getTotalRequests(): number {
    return this.totalRequests;
  }

  getTotalErrors(): number {
    return this.totalErrors;
  }

  clearAll(): void {
    this.servers.clear();
    this.counter = 0;
    this.totalRequests = 0;
    this.totalErrors = 0;
  }
}

export default ServerManager;