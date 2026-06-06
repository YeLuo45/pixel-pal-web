/**
 * Streaming Engine
 * thunderbolt-design Streaming Engine - Create + Push + Subscribe + Stats
 */

export interface Stream {
  id: string;
  name: string;
  chunks: unknown[];
  subscribers: string[];
  created: number;
  updated: number;
  active: boolean;
  totalPushed: number;
  totalReceived: number;
  history: number[];
}

export interface SE2Stats {
  streams: number;
  totalChunks: number;
  totalPushed: number;
  totalReceived: number;
  totalSubscribers: number;
  active: number;
  inactive: number;
  avgChunks: number;
  avgSubscribers: number;
  avgPushed: number;
}

export class StreamingEngine {
  private streams: Map<string, Stream> = new Map();
  private counter = 0;

  create(name: string): string {
    const id = `se-${++this.counter}`;
    this.streams.set(id, {
      id,
      name,
      chunks: [],
      subscribers: [],
      created: Date.now(),
      updated: Date.now(),
      active: true,
      totalPushed: 0,
      totalReceived: 0,
      history: [Date.now()],
    });
    return id;
  }

  push(id: string, data: unknown): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.chunks.push(data);
    s.totalPushed++;
    s.updated = Date.now();
    s.history.push(Date.now());
    // Notify subscribers
    s.totalReceived += s.subscribers.length;
    return true;
  }

  subscribe(id: string, handler: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (!s.subscribers.includes(handler)) {
      s.subscribers.push(handler);
    }
    s.updated = Date.now();
    return true;
  }

  unsubscribe(id: string, handler: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.subscribers = s.subscribers.filter(h => h !== handler);
    s.updated = Date.now();
    return true;
  }

  getChunks(id: string): unknown[] {
    return [...(this.streams.get(id)?.chunks ?? [])];
  }

  getChunkCount(id: string): number {
    return this.streams.get(id)?.chunks.length ?? 0;
  }

  getStats(): SE2Stats {
    const all = Array.from(this.streams.values());
    return {
      streams: all.length,
      totalChunks: all.reduce((s, x) => s + x.chunks.length, 0),
      totalPushed: all.reduce((s, x) => s + x.totalPushed, 0),
      totalReceived: all.reduce((s, x) => s + x.totalReceived, 0),
      totalSubscribers: all.reduce((s, x) => s + x.subscribers.length, 0),
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      avgChunks: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.chunks.length, 0) / all.length) * 100) / 100 : 0,
      avgSubscribers: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.subscribers.length, 0) / all.length) * 100) / 100 : 0,
      avgPushed: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.totalPushed, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getStream(id: string): Stream | undefined {
    return this.streams.get(id);
  }

  getAllStreams(): Stream[] {
    return Array.from(this.streams.values());
  }

  removeStream(id: string): boolean {
    return this.streams.delete(id);
  }

  hasStream(id: string): boolean {
    return this.streams.has(id);
  }

  getCount(): number {
    return this.streams.size;
  }

  getName(id: string): string | undefined {
    return this.streams.get(id)?.name;
  }

  getSubscribers(id: string): string[] {
    return [...(this.streams.get(id)?.subscribers ?? [])];
  }

  getSubscriberCount(id: string): number {
    return this.streams.get(id)?.subscribers.length ?? 0;
  }

  getTotalPushed(id: string): number {
    return this.streams.get(id)?.totalPushed ?? 0;
  }

  getTotalReceived(id: string): number {
    return this.streams.get(id)?.totalReceived ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.streams.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.streams.get(id)?.active ?? false;
  }

  isSubscribed(id: string, handler: string): boolean {
    return this.streams.get(id)?.subscribers.includes(handler) ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  clearChunks(id: string): boolean {
    const s = this.streams.get(id);
    if (!s) return false;
    s.chunks = [];
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.streams.values()) {
      s.chunks = [];
      s.totalPushed = 0;
      s.totalReceived = 0;
      s.active = true;
      s.history = [s.created];
    }
  }

  getByName(name: string): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.name === name);
  }

  getActiveStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.active);
  }

  getInactiveStreams(): Stream[] {
    return Array.from(this.streams.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.streams.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllHandlers(): string[] {
    return [...new Set(Array.from(this.streams.values()).flatMap(s => s.subscribers))];
  }

  getHandlerCount(): number {
    return this.getAllHandlers().length;
  }

  getByMinChunks(min: number): Stream[] {
    return Array.from(this.streams.values()).filter(s => s.chunks.length >= min);
  }

  getMostChunks(): Stream | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.chunks.length > max.chunks.length ? s : max);
  }

  getMostSubscribers(): Stream | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.subscribers.length > max.subscribers.length ? s : max);
  }

  getMostPushed(): Stream | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.totalPushed > max.totalPushed ? s : max);
  }

  getNewest(): Stream | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Stream | null {
    const all = Array.from(this.streams.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.streams.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.streams.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.streams.clear();
    this.counter = 0;
  }
}

export default StreamingEngine;