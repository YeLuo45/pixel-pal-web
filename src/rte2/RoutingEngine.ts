/**
 * Routing Engine
 * thunderbolt-design Routing Engine - AddRoute + Match + Stats
 */

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RouteEntry {
  id: string;
  pattern: string;
  method: RouteMethod;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
  matched: number;
}

export interface RteStats {
  routes: number;
  totalAdded: number;
  totalMatched: number;
  GET: number;
  POST: number;
  PUT: number;
  DELETE: number;
  PATCH: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniquePatterns: number;
  totalMatched: number;
  maxMatched: number;
  avgMatched: number;
}

export class RoutingEngine {
  private routes: Map<string, RouteEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalMatched = 0;

  addRoute(pattern: string, method: RouteMethod): string {
    const id = `rte-${++this.counter}`;
    this.routes.set(id, {
      id,
      pattern,
      method,
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      matched: 0,
    });
    this.totalAdded++;
    return id;
  }

  match(id: string, path: string): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    if (!r.active) return false;
    if (!this.matchPattern(r.pattern, path)) return false;
    r.matched++;
    r.updated = Date.now();
    r.hits++;
    this.totalMatched++;
    return true;
  }

  private matchPattern(pattern: string, path: string): boolean {
    const pArr = pattern.split('/').filter(Boolean);
    const aArr = path.split('/').filter(Boolean);
    if (pArr.length !== aArr.length) return false;
    for (let i = 0; i < pArr.length; i++) {
      if (pArr[i] === '*') continue;
      if (pArr[i] !== aArr[i]) return false;
    }
    return true;
  }

  remove(id: string): boolean {
    return this.routes.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setPattern(id: string, pattern: string): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.pattern = pattern;
    r.updated = Date.now();
    return true;
  }

  setMethod(id: string, method: RouteMethod): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.method = method;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.routes.values()) {
      r.matched = 0;
      r.active = true;
      r.hits = 0;
    }
    this.totalAdded = 0;
    this.totalMatched = 0;
  }

  getStats(): RteStats {
    const all = Array.from(this.routes.values());
    const mArr = all.map(r => r.matched);
    return {
      routes: all.length,
      totalAdded: this.totalAdded,
      totalMatched: this.totalMatched,
      GET: all.filter(r => r.method === 'GET').length,
      POST: all.filter(r => r.method === 'POST').length,
      PUT: all.filter(r => r.method === 'PUT').length,
      DELETE: all.filter(r => r.method === 'DELETE').length,
      PATCH: all.filter(r => r.method === 'PATCH').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniquePatterns: new Set(all.map(r => r.pattern)).size,
      totalMatched: all.reduce((s, r) => s + r.matched, 0),
      maxMatched: mArr.length > 0 ? Math.max(...mArr) : 0,
      avgMatched: all.length > 0 ? Math.round((mArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getRoute(id: string): RouteEntry | undefined {
    return this.routes.get(id);
  }

  getAllRoutes(): RouteEntry[] {
    return Array.from(this.routes.values());
  }

  hasRoute(id: string): boolean {
    return this.routes.has(id);
  }

  getCount(): number {
    return this.routes.size;
  }

  getPattern(id: string): string | undefined {
    return this.routes.get(id)?.pattern;
  }

  getMethod(id: string): RouteMethod | undefined {
    return this.routes.get(id)?.method;
  }

  getMatched(id: string): number {
    return this.routes.get(id)?.matched ?? 0;
  }

  getHits(id: string): number {
    return this.routes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.routes.get(id)?.active ?? false;
  }

  isGET(id: string): boolean {
    return this.routes.get(id)?.method === 'GET';
  }

  isPOST(id: string): boolean {
    return this.routes.get(id)?.method === 'POST';
  }

  isPUT(id: string): boolean {
    return this.routes.get(id)?.method === 'PUT';
  }

  isDELETE(id: string): boolean {
    return this.routes.get(id)?.method === 'DELETE';
  }

  isPATCH(id: string): boolean {
    return this.routes.get(id)?.method === 'PATCH';
  }

  getByMethod(method: RouteMethod): RouteEntry[] {
    return Array.from(this.routes.values()).filter(r => r.method === method);
  }

  getActiveRoutes(): RouteEntry[] {
    return Array.from(this.routes.values()).filter(r => r.active);
  }

  getInactiveRoutes(): RouteEntry[] {
    return Array.from(this.routes.values()).filter(r => !r.active);
  }

  getAllPatterns(): string[] {
    return [...new Set(Array.from(this.routes.values()).map(r => r.pattern))];
  }

  getNewest(): RouteEntry | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): RouteEntry | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.routes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.routes.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalMatched(): number {
    return this.totalMatched;
  }

  clearAll(): void {
    this.routes.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalMatched = 0;
  }
}

export default RoutingEngine;