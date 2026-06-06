/**
 * Event Engine
 * thunderbolt-design Event Engine - Publish + Subscribe + Unsubscribe + Stats
 */

export interface Subscriber {
  id: string;
  event: string;
  callback: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface EteStats {
  subscribers: number;
  totalPublished: number;
  totalReceived: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueEvents: number;
  uniqueCallbacks: number;
  avgHits: number;
  maxHits: number;
  minHits: number;
}

export class EventEngine {
  private subscribers: Map<string, Subscriber> = new Map();
  private eventCounters: Map<string, number> = new Map();
  private counter = 0;
  private totalPublished = 0;
  private totalReceived = 0;

  subscribe(event: string, callback: string): string {
    const id = `ete-${++this.counter}`;
    this.subscribers.set(id, {
      id,
      event,
      callback,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  publish(event: string): number {
    let count = 0;
    for (const s of this.subscribers.values()) {
      if (s.event === event && s.active) {
        s.hits++;
        s.updated = Date.now();
        count++;
        this.totalReceived++;
      }
    }
    this.eventCounters.set(event, (this.eventCounters.get(event) ?? 0) + 1);
    this.totalPublished++;
    return count;
  }

  unsubscribe(id: string): boolean {
    const s = this.subscribers.get(id);
    if (!s) return false;
    s.active = false;
    s.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.subscribers.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.subscribers.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.subscribers.values()) {
      s.active = true;
      s.hits = 0;
    }
    this.eventCounters.clear();
    this.totalPublished = 0;
    this.totalReceived = 0;
  }

  getStats(): EteStats {
    const all = Array.from(this.subscribers.values());
    const hitsValues = all.map(s => s.hits);
    return {
      subscribers: all.length,
      totalPublished: this.totalPublished,
      totalReceived: this.totalReceived,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueEvents: new Set(all.map(s => s.event)).size,
      uniqueCallbacks: new Set(all.map(s => s.callback)).size,
      avgHits: all.length > 0 ? Math.round((hitsValues.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxHits: hitsValues.length > 0 ? Math.max(...hitsValues) : 0,
      minHits: hitsValues.length > 0 ? Math.min(...hitsValues) : 0,
    };
  }

  getSubscriber(id: string): Subscriber | undefined {
    return this.subscribers.get(id);
  }

  getAllSubscribers(): Subscriber[] {
    return Array.from(this.subscribers.values());
  }

  hasSubscriber(id: string): boolean {
    return this.subscribers.has(id);
  }

  getCount(): number {
    return this.subscribers.size;
  }

  getEvent(id: string): string | undefined {
    return this.subscribers.get(id)?.event;
  }

  getCallback(id: string): string | undefined {
    return this.subscribers.get(id)?.callback;
  }

  getHits(id: string): number {
    return this.subscribers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.subscribers.get(id)?.active ?? false;
  }

  getByEvent(event: string): Subscriber[] {
    return Array.from(this.subscribers.values()).filter(s => s.event === event);
  }

  getByCallback(callback: string): Subscriber[] {
    return Array.from(this.subscribers.values()).filter(s => s.callback === callback);
  }

  getActiveSubscribers(): Subscriber[] {
    return Array.from(this.subscribers.values()).filter(s => s.active);
  }

  getInactiveSubscribers(): Subscriber[] {
    return Array.from(this.subscribers.values()).filter(s => !s.active);
  }

  getAllEvents(): string[] {
    return [...new Set(Array.from(this.subscribers.values()).map(s => s.event))];
  }

  getAllCallbacks(): string[] {
    return [...new Set(Array.from(this.subscribers.values()).map(s => s.callback))];
  }

  getEventCount(event: string): number {
    return this.eventCounters.get(event) ?? 0;
  }

  getNewest(): Subscriber | null {
    const all = Array.from(this.subscribers.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Subscriber | null {
    const all = Array.from(this.subscribers.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.subscribers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.subscribers.get(id)?.updated ?? 0;
  }

  getTotalPublished(): number {
    return this.totalPublished;
  }

  getTotalReceived(): number {
    return this.totalReceived;
  }

  clearAll(): void {
    this.subscribers.clear();
    this.eventCounters.clear();
    this.counter = 0;
    this.totalPublished = 0;
    this.totalReceived = 0;
  }
}

export default EventEngine;