/**
 * Proxy Manager
 * nanobot-design Proxy Manager - Register + Forward + Stats
 */

export interface Proxy {
  id: string;
  name: string;
  url: string;
  forwards: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface PxyStats {
  proxies: number;
  totalForwards: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueUrls: number;
  avgForwards: number;
  maxForwards: number;
  minForwards: number;
  avgUrlLength: number;
}

export class ProxyManager {
  private proxies: Map<string, Proxy> = new Map();
  private counter = 0;
  private totalForwards = 0;

  register(name: string, url: string): string {
    const id = `pxy-${++this.counter}`;
    this.proxies.set(id, {
      id,
      name,
      url,
      forwards: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  forward(id: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.forwards++;
    p.history.push(Date.now());
    p.updated = Date.now();
    p.hits++;
    this.totalForwards++;
    return true;
  }

  reset(id: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.forwards = 0;
    p.history = [];
    p.updated = Date.now();
    return true;
  }

  getStats(): PxyStats {
    const all = Array.from(this.proxies.values());
    const forwardValues = all.map(p => p.forwards);
    const urlLengths = all.map(p => p.url.length);
    return {
      proxies: all.length,
      totalForwards: this.totalForwards,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      uniqueUrls: new Set(all.map(p => p.url)).size,
      avgForwards: all.length > 0 ? Math.round((forwardValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxForwards: forwardValues.length > 0 ? Math.max(...forwardValues) : 0,
      minForwards: forwardValues.length > 0 ? Math.min(...forwardValues) : 0,
      avgUrlLength: all.length > 0 ? Math.round((urlLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getProxy(id: string): Proxy | undefined {
    return this.proxies.get(id);
  }

  getAllProxies(): Proxy[] {
    return Array.from(this.proxies.values());
  }

  removeProxy(id: string): boolean {
    return this.proxies.delete(id);
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

  getUrl(id: string): string | undefined {
    return this.proxies.get(id)?.url;
  }

  getUrlLength(id: string): number {
    return this.proxies.get(id)?.url.length ?? 0;
  }

  getForwards(id: string): number {
    return this.proxies.get(id)?.forwards ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.proxies.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.proxies.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.proxies.get(id)?.active ?? false;
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

  setUrl(id: string, url: string): boolean {
    const p = this.proxies.get(id);
    if (!p) return false;
    p.url = url;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.proxies.values()) {
      p.forwards = 0;
      p.hits = 0;
      p.history = [];
      p.active = true;
    }
    this.totalForwards = 0;
  }

  getByName(name: string): Proxy[] {
    return Array.from(this.proxies.values()).filter(p => p.name === name);
  }

  getByUrl(url: string): Proxy[] {
    return Array.from(this.proxies.values()).filter(p => p.url === url);
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

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllUrls(): string[] {
    return [...new Set(Array.from(this.proxies.values()).map(p => p.url))];
  }

  getUrlCount(): number {
    return this.getAllUrls().length;
  }

  getByMinForwards(min: number): Proxy[] {
    return Array.from(this.proxies.values()).filter(p => p.forwards >= min);
  }

  getMostForwards(): Proxy | null {
    const all = Array.from(this.proxies.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.forwards > max.forwards ? p : max);
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

  getTotalForwards(): number {
    return this.totalForwards;
  }

  clearAll(): void {
    this.proxies.clear();
    this.counter = 0;
    this.totalForwards = 0;
  }
}

export default ProxyManager;