/**
 * Task Router
 * chatdev-design Task Router - Add + Route + Stats
 */

export interface TaskRoute {
  id: string;
  pattern: string;
  handler: string;
  priority: number;
  hits: number;
  created: number;
  updated: number;
  active: boolean;
}

export interface TR2Stats {
  routes: number;
  totalHits: number;
  avgHits: number;
  avgPriority: number;
  active: number;
  inactive: number;
  totalRoutes: number;
  handlers: number;
}

export class TaskRouter {
  private routes: Map<string, TaskRoute> = new Map();
  private counter = 0;
  private totalRoutes = 0;

  add(pattern: string, handler: string, priority: number = 0): string {
    const id = `tr2-${++this.counter}`;
    this.routes.set(id, {
      id,
      pattern,
      handler,
      priority,
      hits: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
    });
    return id;
  }

  route(task: string): string | null {
    this.totalRoutes++;
    // Sort by priority descending
    const sorted = Array.from(this.routes.values())
      .filter(r => r.active)
      .sort((a, b) => b.priority - a.priority);
    for (const r of sorted) {
      if (task.includes(r.pattern)) {
        r.hits++;
        r.updated = Date.now();
        return r.handler;
      }
    }
    return null;
  }

  getStats(): TR2Stats {
    const all = Array.from(this.routes.values());
    return {
      routes: all.length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      avgHits: all.length > 0 ? Math.round((all.reduce((s, r) => s + r.hits, 0) / all.length) * 100) / 100 : 0,
      avgPriority: all.length > 0 ? Math.round((all.reduce((s, r) => s + r.priority, 0) / all.length) * 100) / 100 : 0,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalRoutes: this.totalRoutes,
      handlers: new Set(all.map(r => r.handler)).size,
    };
  }

  getRoute(id: string): TaskRoute | undefined {
    return this.routes.get(id);
  }

  getAllRoutes(): TaskRoute[] {
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

  getPattern(id: string): string | undefined {
    return this.routes.get(id)?.pattern;
  }

  getHandler(id: string): string | undefined {
    return this.routes.get(id)?.handler;
  }

  getPriority(id: string): number {
    return this.routes.get(id)?.priority ?? 0;
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

  setPattern(id: string, pattern: string): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.pattern = pattern;
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

  setPriority(id: string, priority: number): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.priority = priority;
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
    this.totalRoutes = 0;
  }

  getByHandler(handler: string): TaskRoute[] {
    return Array.from(this.routes.values()).filter(r => r.handler === handler);
  }

  getActiveRoutes(): TaskRoute[] {
    return Array.from(this.routes.values()).filter(r => r.active);
  }

  getInactiveRoutes(): TaskRoute[] {
    return Array.from(this.routes.values()).filter(r => !r.active);
  }

  getAllHandlers(): string[] {
    return [...new Set(Array.from(this.routes.values()).map(r => r.handler))];
  }

  getHandlerCount(): number {
    return this.getAllHandlers().length;
  }

  getByMinPriority(min: number): TaskRoute[] {
    return Array.from(this.routes.values()).filter(r => r.priority >= min);
  }

  getByMinHits(min: number): TaskRoute[] {
    return Array.from(this.routes.values()).filter(r => r.hits >= min);
  }

  getMostHits(): TaskRoute | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.hits > max.hits ? r : max);
  }

  getHighestPriority(): TaskRoute | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.priority > max.priority ? r : max);
  }

  getNewest(): TaskRoute | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): TaskRoute | null {
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

  getTotalRoutes(): number {
    return this.totalRoutes;
  }

  resetTotalRoutes(): void {
    this.totalRoutes = 0;
  }

  clearAll(): void {
    this.routes.clear();
    this.counter = 0;
    this.totalRoutes = 0;
  }
}

export default TaskRouter;