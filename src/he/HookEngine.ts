/**
 * Hook Engine
 * thunderbolt-design Hook Engine - Register + Fire + Stats
 */

export interface Hook {
  id: string;
  event: string;
  handler: string;
  fired: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface HEstats {
  hooks: number;
  totalFired: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgFired: number;
  uniqueEvents: number;
  uniqueHandlers: number;
  maxFired: number;
  minFired: number;
}

export class HookEngine {
  private hooks: Map<string, Hook> = new Map();
  private counter = 0;
  private totalFired = 0;

  register(event: string, handler: string): string {
    const id = `he-${++this.counter}`;
    this.hooks.set(id, {
      id,
      event,
      handler,
      fired: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  fire(id: string): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    if (!h.active) return false;
    h.fired++;
    h.history.push(Date.now());
    h.updated = Date.now();
    h.hits++;
    this.totalFired++;
    return true;
  }

  getStats(): HEstats {
    const all = Array.from(this.hooks.values());
    const firedValues = all.map(h => h.fired);
    return {
      hooks: all.length,
      totalFired: this.totalFired,
      active: all.filter(h => h.active).length,
      inactive: all.filter(h => !h.active).length,
      totalHits: all.reduce((s, h) => s + h.hits, 0),
      avgFired: all.length > 0 ? Math.round((firedValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      uniqueEvents: new Set(all.map(h => h.event)).size,
      uniqueHandlers: new Set(all.map(h => h.handler)).size,
      maxFired: firedValues.length > 0 ? Math.max(...firedValues) : 0,
      minFired: firedValues.length > 0 ? Math.min(...firedValues) : 0,
    };
  }

  getHook(id: string): Hook | undefined {
    return this.hooks.get(id);
  }

  getAllHooks(): Hook[] {
    return Array.from(this.hooks.values());
  }

  removeHook(id: string): boolean {
    return this.hooks.delete(id);
  }

  hasHook(id: string): boolean {
    return this.hooks.has(id);
  }

  getCount(): number {
    return this.hooks.size;
  }

  getEvent(id: string): string | undefined {
    return this.hooks.get(id)?.event;
  }

  getHandler(id: string): string | undefined {
    return this.hooks.get(id)?.handler;
  }

  getFired(id: string): number {
    return this.hooks.get(id)?.fired ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.hooks.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.hooks.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.hooks.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.active = active;
    h.updated = Date.now();
    return true;
  }

  setEvent(id: string, event: string): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.event = event;
    h.updated = Date.now();
    return true;
  }

  setHandler(id: string, handler: string): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.handler = handler;
    h.updated = Date.now();
    return true;
  }

  resetFired(id: string): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.fired = 0;
    h.history = [];
    h.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const h of this.hooks.values()) {
      h.fired = 0;
      h.hits = 0;
      h.history = [];
      h.active = true;
    }
    this.totalFired = 0;
  }

  getByEvent(event: string): Hook[] {
    return Array.from(this.hooks.values()).filter(h => h.event === event);
  }

  getByHandler(handler: string): Hook[] {
    return Array.from(this.hooks.values()).filter(h => h.handler === handler);
  }

  getActiveHooks(): Hook[] {
    return Array.from(this.hooks.values()).filter(h => h.active);
  }

  getInactiveHooks(): Hook[] {
    return Array.from(this.hooks.values()).filter(h => !h.active);
  }

  getAllEvents(): string[] {
    return [...new Set(Array.from(this.hooks.values()).map(h => h.event))];
  }

  getEventCount(): number {
    return this.getAllEvents().length;
  }

  getAllHandlers(): string[] {
    return [...new Set(Array.from(this.hooks.values()).map(h => h.handler))];
  }

  getHandlerCount(): number {
    return this.getAllHandlers().length;
  }

  getByMinFired(min: number): Hook[] {
    return Array.from(this.hooks.values()).filter(h => h.fired >= min);
  }

  getMostFired(): Hook | null {
    const all = Array.from(this.hooks.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.fired > max.fired ? h : max);
  }

  getNewest(): Hook | null {
    const all = Array.from(this.hooks.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.created > max.created ? h : max);
  }

  getOldest(): Hook | null {
    const all = Array.from(this.hooks.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.created < min.created ? h : min);
  }

  getCreatedAt(id: string): number {
    return this.hooks.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.hooks.get(id)?.updated ?? 0;
  }

  getTotalFired(): number {
    return this.totalFired;
  }

  clearAll(): void {
    this.hooks.clear();
    this.counter = 0;
    this.totalFired = 0;
  }
}

export default HookEngine;