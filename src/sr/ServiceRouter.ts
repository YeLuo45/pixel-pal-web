/**
 * Service Router
 * nanobot-design Service Router - Register + Route + Stats
 */

export interface ServiceRoute {
  id: string;
  path: string;
  target: string;
  hits: number;
  created: number;
  updated: number;
  active: boolean;
}

export interface SRStats {
  routes: number;
  totalHits: number;
  avgHits: number;
  targets: number;
  active: number;
  inactive: number;
  totalCalls: number;
}

export class ServiceRouter {
  private routes: Map<string, ServiceRoute> = new Map();
  private counter = 0;
  private totalCalls = 0;

  register(path: string, target: string): string {
    const id = `sr-${++this.counter}`;
    this.routes.set(id, {
      id,
      path,
      target,
      hits: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
    });
    return id;
  }

  route(path: string): string | null {
    this.totalCalls++;
    for (const r of this.routes.values()) {
      if (r.path === path && r.active) {
        r.hits++;
        r.updated = Date.now();
        return r.target;
      }
    }
    return null;
  }

  getStats(): SRStats {
    const all = Array.from(this.routes.values());
    return {
      routes: all.length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      avgHits: all.length > 0 ? Math.round((all.reduce((s, r) => s + r.hits, 0) / all.length) * 100) / 100 : 0,
      targets: new Set(all.map(r => r.target)).size,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalCalls: this.totalCalls,
    };
  }

  getRoute(id: string): ServiceRoute | undefined {
    return this.routes.get(id);
  }

  getAllRoutes(): ServiceRoute[] {
    return Array.from(this.routes.values());
  }

  removeRoute(id: string): boolean {
    return this.routes.delete(id);
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

  getTarget(id: string): string | undefined {
    return this.routes.get(id)?.target;
  }

  getHits(id: string): number {
    return this.routes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.routes.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setPath(id: string, path: string): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.path = path;
    r.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.target = target;
    r.updated = Date.now();
    return true;
  }

  resetHits(): void {
    for (const r of this.routes.values()) r.hits = 0;
  }

  resetAll(): void {
    for (const r of this.routes.values()) {
      r.hits = 0;
      r.active = true;
    }
    this.totalCalls = 0;
  }

  getByPath(path: string): ServiceRoute[] {
    return Array.from(this.routes.values()).filter(r => r.path === path);
  }

  getByTarget(target: string): ServiceRoute[] {
    return Array.from(this.routes.values()).filter(r => r.target === target);
  }

  getActiveRoutes(): ServiceRoute[] {
    return Array.from(this.routes.values()).filter(r => r.active);
  }

  getInactiveRoutes(): ServiceRoute[] {
    return Array.from(this.routes.values()).filter(r => !r.active);
  }

  getAllPaths(): string[] {
    return [...new Set(Array.from(this.routes.values()).map(r => r.path))];
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.routes.values()).map(r => r.target))];
  }

  getPathCount(): number {
    return this.getAllPaths().length;
  }

  getTargetCount(): number {
    return this.getAllTargets().length;
  }

  getByPathCount(path: string): number {
    return this.getByPath(path).length;
  }

  getByTargetCount(target: string): number {
    return this.getByTarget(target).length;
  }

  getMostHit(): ServiceRoute | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.hits > max.hits ? r : max);
  }

  getNewest(): ServiceRoute | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): ServiceRoute | null {
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

  getTotalCalls(): number {
    return this.totalCalls;
  }

  resetTotalCalls(): void {
    this.totalCalls = 0;
  }

  clearAll(): void {
    this.routes.clear();
    this.counter = 0;
    this.totalCalls = 0;
  }
}

export default ServiceRouter;