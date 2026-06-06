/**
 * Router Engine
 * thunderbolt-design Router Engine - Add + Route + Resolve + Stats
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface Route {
  id: string;
  path: string;
  method: HttpMethod;
  handler: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface RteStats {
  routes: number;
  totalMatches: number;
  totalResolves: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniquePaths: number;
  uniqueHandlers: number;
  avgPathLength: number;
  maxPathLength: number;
  minPathLength: number;
  uniqueMethods: number;
}

export class RouterEngine {
  private routes: Map<string, Route> = new Map();
  private counter = 0;
  private totalMatches = 0;
  private totalResolves = 0;

  add(path: string, method: HttpMethod, handler: string): string {
    const id = `rte-${++this.counter}`;
    this.routes.set(id, {
      id,
      path,
      method,
      handler,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  route(path: string, method: HttpMethod): Route[] {
    this.totalResolves++;
    return Array.from(this.routes.values()).filter(r => r.path === path && r.method === method && r.active);
  }

  match(id: string): boolean {
    this.totalMatches++;
    const r = this.routes.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.hits++;
    r.updated = Date.now();
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

  setHandler(id: string, handler: string): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.handler = handler;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.routes.values()) {
      r.hits = 0;
      r.history = [];
      r.active = true;
    }
    this.totalMatches = 0;
    this.totalResolves = 0;
  }

  getStats(): RteStats {
    const all = Array.from(this.routes.values());
    const pathLengths = all.map(r => r.path.length);
    return {
      routes: all.length,
      totalMatches: this.totalMatches,
      totalResolves: this.totalResolves,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniquePaths: new Set(all.map(r => r.path)).size,
      uniqueHandlers: new Set(all.map(r => r.handler)).size,
      avgPathLength: all.length > 0 ? Math.round((pathLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPathLength: pathLengths.length > 0 ? Math.max(...pathLengths) : 0,
      minPathLength: pathLengths.length > 0 ? Math.min(...pathLengths) : 0,
      uniqueMethods: new Set(all.map(r => r.method)).size,
    };
  }

  getRoute(id: string): Route | undefined {
    return this.routes.get(id);
  }

  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  hasRoute(id: string): boolean {
    return this.routes.has(id);
  }

  getCount(): number {
    return this.routes.size;
  }

  getPath(id: string): string | undefined {
    return this.routes.get(id)?.path;
  }

  getMethod(id: string): HttpMethod | undefined {
    return this.routes.get(id)?.method;
  }

  getHandler(id: string): string | undefined {
    return this.routes.get(id)?.handler;
  }

  getPathLength(id: string): number {
    return this.routes.get(id)?.path.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.routes.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.routes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.routes.get(id)?.active ?? false;
  }

  getByPath(path: string): Route[] {
    return Array.from(this.routes.values()).filter(r => r.path === path);
  }

  getByMethod(method: HttpMethod): Route[] {
    return Array.from(this.routes.values()).filter(r => r.method === method);
  }

  getByHandler(handler: string): Route[] {
    return Array.from(this.routes.values()).filter(r => r.handler === handler);
  }

  getActiveRoutes(): Route[] {
    return Array.from(this.routes.values()).filter(r => r.active);
  }

  getInactiveRoutes(): Route[] {
    return Array.from(this.routes.values()).filter(r => !r.active);
  }

  getAllPaths(): string[] {
    return [...new Set(Array.from(this.routes.values()).map(r => r.path))];
  }

  getPathCount(): number {
    return this.getAllPaths().length;
  }

  getAllHandlers(): string[] {
    return [...new Set(Array.from(this.routes.values()).map(r => r.handler))];
  }

  getAllMethods(): HttpMethod[] {
    return [...new Set(Array.from(this.routes.values()).map(r => r.method))];
  }

  getByMinPathLength(min: number): Route[] {
    return Array.from(this.routes.values()).filter(r => r.path.length >= min);
  }

  getNewest(): Route | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Route | null {
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

  getTotalMatches(): number {
    return this.totalMatches;
  }

  getTotalResolves(): number {
    return this.totalResolves;
  }

  clearAll(): void {
    this.routes.clear();
    this.counter = 0;
    this.totalMatches = 0;
    this.totalResolves = 0;
  }
}

export default RouterEngine;