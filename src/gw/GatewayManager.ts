/**
 * Gateway Manager
 * nanobot-design Gateway Manager - Register + Forward + Stats
 */

export interface Gateway {
  id: string;
  name: string;
  endpoint: string;
  rateLimit: number;
  requests: number;
  rejected: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface GWStats {
  gateways: number;
  totalRequests: number;
  totalRejected: number;
  avgRequests: number;
  active: number;
  inactive: number;
  totalForwards: number;
}

export class GatewayManager {
  private gateways: Map<string, Gateway> = new Map();
  private counter = 0;
  private totalForwards = 0;

  register(name: string, endpoint: string, rateLimit: number = 100): string {
    const id = `gw-${++this.counter}`;
    this.gateways.set(id, {
      id,
      name,
      endpoint,
      rateLimit,
      requests: 0,
      rejected: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  forward(id: string): boolean {
    const g = this.gateways.get(id);
    if (!g) return false;
    if (!g.active) return false;
    this.totalForwards++;
    g.hits++;
    if (g.requests >= g.rateLimit) {
      g.rejected++;
      g.updated = Date.now();
      return false;
    }
    g.requests++;
    g.updated = Date.now();
    return true;
  }

  getStats(): GWStats {
    const all = Array.from(this.gateways.values());
    return {
      gateways: all.length,
      totalRequests: all.reduce((s, g) => s + g.requests, 0),
      totalRejected: all.reduce((s, g) => s + g.rejected, 0),
      avgRequests: all.length > 0 ? Math.round((all.reduce((s, g) => s + g.requests, 0) / all.length) * 100) / 100 : 0,
      active: all.filter(g => g.active).length,
      inactive: all.filter(g => !g.active).length,
      totalForwards: this.totalForwards,
    };
  }

  getGateway(id: string): Gateway | undefined {
    return this.gateways.get(id);
  }

  getAllGateways(): Gateway[] {
    return Array.from(this.gateways.values());
  }

  removeGateway(id: string): boolean {
    return this.gateways.delete(id);
  }

  hasGateway(id: string): boolean {
    return this.gateways.has(id);
  }

  getCount(): number {
    return this.gateways.size;
  }

  getName(id: string): string | undefined {
    return this.gateways.get(id)?.name;
  }

  getEndpoint(id: string): string | undefined {
    return this.gateways.get(id)?.endpoint;
  }

  getRateLimit(id: string): number {
    return this.gateways.get(id)?.rateLimit ?? 0;
  }

  getRequests(id: string): number {
    return this.gateways.get(id)?.requests ?? 0;
  }

  getRejected(id: string): number {
    return this.gateways.get(id)?.rejected ?? 0;
  }

  getHits(id: string): number {
    return this.gateways.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.gateways.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const g = this.gateways.get(id);
    if (!g) return false;
    g.active = active;
    g.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const g = this.gateways.get(id);
    if (!g) return false;
    g.name = name;
    g.updated = Date.now();
    return true;
  }

  setEndpoint(id: string, endpoint: string): boolean {
    const g = this.gateways.get(id);
    if (!g) return false;
    g.endpoint = endpoint;
    g.updated = Date.now();
    return true;
  }

  setRateLimit(id: string, rateLimit: number): boolean {
    const g = this.gateways.get(id);
    if (!g) return false;
    g.rateLimit = rateLimit;
    g.updated = Date.now();
    return true;
  }

  resetRequests(id: string): boolean {
    const g = this.gateways.get(id);
    if (!g) return false;
    g.requests = 0;
    g.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const g of this.gateways.values()) {
      g.requests = 0;
      g.rejected = 0;
      g.hits = 0;
      g.active = true;
    }
    this.totalForwards = 0;
  }

  getByName(name: string): Gateway[] {
    return Array.from(this.gateways.values()).filter(g => g.name === name);
  }

  getActiveGateways(): Gateway[] {
    return Array.from(this.gateways.values()).filter(g => g.active);
  }

  getInactiveGateways(): Gateway[] {
    return Array.from(this.gateways.values()).filter(g => !g.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.gateways.values()).map(g => g.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinRequests(min: number): Gateway[] {
    return Array.from(this.gateways.values()).filter(g => g.requests >= min);
  }

  getMostRequests(): Gateway | null {
    const all = Array.from(this.gateways.values());
    if (all.length === 0) return null;
    return all.reduce((max, g) => g.requests > max.requests ? g : max);
  }

  getMostRejected(): Gateway | null {
    const all = Array.from(this.gateways.values());
    if (all.length === 0) return null;
    return all.reduce((max, g) => g.rejected > max.rejected ? g : max);
  }

  getNewest(): Gateway | null {
    const all = Array.from(this.gateways.values());
    if (all.length === 0) return null;
    return all.reduce((max, g) => g.created > max.created ? g : max);
  }

  getOldest(): Gateway | null {
    const all = Array.from(this.gateways.values());
    if (all.length === 0) return null;
    return all.reduce((min, g) => g.created < min.created ? g : min);
  }

  getCreatedAt(id: string): number {
    return this.gateways.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.gateways.get(id)?.updated ?? 0;
  }

  getTotalForwards(): number {
    return this.totalForwards;
  }

  resetTotalForwards(): void {
    this.totalForwards = 0;
  }

  clearAll(): void {
    this.gateways.clear();
    this.counter = 0;
    this.totalForwards = 0;
  }
}

export default GatewayManager;