/**
 * Hook Engine
 * claude-code-design Hook Engine - Register + Trigger + Stats
 */

export type HookEvent = 'before' | 'after' | 'success' | 'error' | 'always';

export interface Hook {
  id: string;
  name: string;
  event: HookEvent;
  target: string;
  callback: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface HoeStats {
  hooks: number;
  totalAdded: number;
  totalTriggered: number;
  before: number;
  after: number;
  success: number;
  error: number;
  always: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueTargets: number;
}

export class HookEngine {
  private hooks: Map<string, Hook> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalTriggered = 0;

  register(name: string, event: HookEvent, target: string, callback: string): string {
    const id = `hoe-${++this.counter}`;
    this.hooks.set(id, {
      id,
      name,
      event,
      target,
      callback,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  trigger(id: string): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    if (!h.active) return false;
    h.hits++;
    h.updated = Date.now();
    this.totalTriggered++;
    return true;
  }

  remove(id: string): boolean {
    return this.hooks.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.active = active;
    h.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.name = name;
    h.updated = Date.now();
    return true;
  }

  setEvent(id: string, event: HookEvent): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.event = event;
    h.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.target = target;
    h.updated = Date.now();
    return true;
  }

  setCallback(id: string, callback: string): boolean {
    const h = this.hooks.get(id);
    if (!h) return false;
    h.callback = callback;
    h.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const h of this.hooks.values()) {
      h.active = true;
      h.hits = 0;
    }
    this.totalAdded = 0;
    this.totalTriggered = 0;
  }

  getStats(): HoeStats {
    const all = Array.from(this.hooks.values());
    return {
      hooks: all.length,
      totalAdded: this.totalAdded,
      totalTriggered: this.totalTriggered,
      before: all.filter(h => h.event === 'before').length,
      after: all.filter(h => h.event === 'after').length,
      success: all.filter(h => h.event === 'success').length,
      error: all.filter(h => h.event === 'error').length,
      always: all.filter(h => h.event === 'always').length,
      active: all.filter(h => h.active).length,
      inactive: all.filter(h => !h.active).length,
      totalHits: all.reduce((s, h) => s + h.hits, 0),
      uniqueNames: new Set(all.map(h => h.name)).size,
      uniqueTargets: new Set(all.map(h => h.target).filter(t => t !== '')).size,
    };
  }

  getHook(id: string): Hook | undefined {
    return this.hooks.get(id);
  }

  getAllHooks(): Hook[] {
    return Array.from(this.hooks.values());
  }

  hasHook(id: string): boolean {
    return this.hooks.has(id);
  }

  getCount(): number {
    return this.hooks.size;
  }

  getName(id: string): string | undefined {
    return this.hooks.get(id)?.name;
  }

  getEvent(id: string): HookEvent | undefined {
    return this.hooks.get(id)?.event;
  }

  getTarget(id: string): string | undefined {
    return this.hooks.get(id)?.target;
  }

  getCallback(id: string): string | undefined {
    return this.hooks.get(id)?.callback;
  }

  getHits(id: string): number {
    return this.hooks.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.hooks.get(id)?.active ?? false;
  }

  isBefore(id: string): boolean {
    return this.hooks.get(id)?.event === 'before';
  }

  isAfter(id: string): boolean {
    return this.hooks.get(id)?.event === 'after';
  }

  isSuccess(id: string): boolean {
    return this.hooks.get(id)?.event === 'success';
  }

  isError(id: string): boolean {
    return this.hooks.get(id)?.event === 'error';
  }

  isAlways(id: string): boolean {
    return this.hooks.get(id)?.event === 'always';
  }

  getByEvent(event: HookEvent): Hook[] {
    return Array.from(this.hooks.values()).filter(h => h.event === event);
  }

  getByTarget(target: string): Hook[] {
    return Array.from(this.hooks.values()).filter(h => h.target === target);
  }

  getActiveHooks(): Hook[] {
    return Array.from(this.hooks.values()).filter(h => h.active);
  }

  getInactiveHooks(): Hook[] {
    return Array.from(this.hooks.values()).filter(h => !h.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.hooks.values()).map(h => h.name))];
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.hooks.values()).map(h => h.target).filter(t => t !== ''))];
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalTriggered(): number {
    return this.totalTriggered;
  }

  clearAll(): void {
    this.hooks.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalTriggered = 0;
  }
}

export default HookEngine;