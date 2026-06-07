/**
 * Proxy Engine
 * thunderbolt-design Proxy Engine - Add + Forward + Reject + Stats
 */

export type ProxyStatus = 'idle' | 'forwarding' | 'rejected' | 'closed';

export interface Proxy {
  id: string;
  name: string;
  source: string;
  target: string;
  status: ProxyStatus;
  forwarded: number;
  rejected: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PxeStats {
  proxies: number;
  totalAdded: number;
  totalForwarded: number;
  totalRejected: number;
  idle: number;
  forwarding: number;
  rejected: number;
  closed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueSources: number;
  uniqueTargets: number;
  totalForwarded: number;
  totalRejected: number;
}

export class ProxyEngine {
  private proxies: Map<string, Proxy> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalForwarded = 0;
  private totalRejected = 0;

  add(name: string, source: string, target: string): string {
    const id = `pxe-${++this.counter}`;
    this.proxies.set(id, {
      id,
      name,
      source,
      target,
      status: 'idle',
      forwarded: 0,
      rejected: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  forward(id: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.status === 'closed') return false;
    p.status = 'forwarding';
    p.forwarded++;
    p.updated = Date.now();
    p.hits++;
    this.totalForwarded++;
    return true;
  }

  reject(id: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.status === 'closed') return false;
    p.status = 'rejected';
    p.rejected++;
    p.updated = Date.now();
    p.hits++;
    this.totalRejected++;
    return true;
  }

  close(id: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.status = 'closed';
    p.updated = Date.now();
    return true;
  }

  reset(id: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.status = 'idle';
    p.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.proxies.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setSource(id: string, source: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.source = source;
    p.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.target = target;
    p.updated = Date.now();
    return true;
  }

  setStatus(id: string, status: ProxyStatus): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.status = status;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.proxies.values()) {
      p.status = 'idle';
      p.forwarded = 0;
      p.rejected = 0;
      p.active = true;
      p.hits = 0;
    }
    this.totalAdded = 0;
    this.totalForwarded = 0;
    this.totalRejected = 0;
  }

  getStats(): PxeStats {
    const all = Array.from(this.proxies.values());
    return {
      proxies: all.length,
      totalAdded: this.totalAdded,
      totalForwarded: this.totalForwarded,
      totalRejected: this.totalRejected,
      idle: all.filter(p => p.status === 'idle').length,
      forwarding: all.filter(p => p.status === 'forwarding').length,
      rejected: all.filter(p => p.status === 'rejected').length,
      closed: all.filter(p => p.status === 'closed').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      uniqueSources: new Set(all.map(p => p.source)).size,
      uniqueTargets: new Set(all.map(p => p.target)).size,
      totalForwarded: all.reduce((s, p) => s + p.forwarded, 0),
      totalRejected: all.reduce((s, p) => s + p.rejected, 0),
    };
  }

  getProxy(id: string): Proxy | undefined {
    return this.proxies.get(id);
  }

  getAllProxies(): Proxy[] {
    return Array.from(this.proxies.values());
  }

  hasProxy(id: string): boolean {
    return this.proxies.has(id);
  }

  getCount(): number {
    return this.proxies.size;
  }

  getName(id: string): string | undefined {
    return this.proxies.get(id)?.name;
  }

  getSource(id: string): string | undefined {
    return this.proxies.get(id)?.source;
  }

  getTarget(id: string): string | undefined {
    return this.proxies.get(id)?.target;
  }

  getStatus(id: string): ProxyStatus | undefined {
    return this.proxies.get(id)?.status;
  }

  getForwarded(id: string): number {
    return this.proxies.get(id)?.forwarded ?? 0;
  }

  getRejected(id: string): number {
    return this.proxies.get(id)?.rejected ?? 0;
  }

  getHits(id: string): number {
    return this.proxies.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.proxies.get(id)?.active ?? false;
  }

  isIdle(id: string): boolean {
    return this.proxies.get(id)?.status === 'idle';
  }

  isForwarding(id: string): boolean {
    return this.proxies.get(id)?.status === 'forwarding';
  }

  isRejected(id: string): boolean {
    return this.proxies.get(id)?.status === 'rejected';
  }

  isClosed(id: string): boolean {
    return this.proxies.get(id)?.status === 'closed';
  }

  getByStatus(status: ProxyStatus): Proxy[] {
    return Array.from(this.proxies.values()).filter(p => p.status === status);
  }

  getActiveProxies(): Proxy[] {
    return Array.from(this.proxies.values()).filter(p => p.active);
  }

  getInactiveProxies(): Proxy[] {
    return Array.from(this.proxies.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.proxies.values()).map(p => p.name))];
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.proxies.values()).map(p => p.source))];
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.proxies.values()).map(p => p.target))];
  }

  getNewest(): Proxy | null {
    const all = Array.from(this.proxies.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Proxy | null {
    const all = Array.from(this.proxies.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.proxies.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.proxies.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalForwarded(): number {
    return this.totalForwarded;
  }

  getTotalRejected(): number {
    return this.totalRejected;
  }

  clearAll(): void {
    this.proxies.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalForwarded = 0;
    this.totalRejected = 0;
  }
}

export default ProxyEngine;