/**
 * Heartbeat Engine
 * nanobot-design Heartbeat Engine - Start + Beat + Stop + Stats
 */

export type HeartbeatState = 'stopped' | 'running' | 'expired';

export interface Heartbeat {
  id: string;
  name: string;
  interval: number;
  lastBeat: number;
  state: HeartbeatState;
  beats: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface HbeStats {
  heartbeats: number;
  totalBeats: number;
  totalStarts: number;
  totalStops: number;
  stopped: number;
  running: number;
  expired: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgInterval: number;
  maxInterval: number;
  minInterval: number;
}

export class HeartbeatEngine {
  private heartbeats: Map<string, Heartbeat> = new Map();
  private counter = 0;
  private totalBeats = 0;
  private totalStarts = 0;
  private totalStops = 0;

  start(name: string, interval: number = 1000): string {
    const id = `hbe-${++this.counter}`;
    this.heartbeats.set(id, {
      id,
      name,
      interval,
      lastBeat: Date.now(),
      state: 'running',
      beats: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalStarts++;
    return id;
  }

  beat(id: string): boolean {
    const h = this.heartbeats.get(id);
    if (!h) return false;
    if (!h.active) return false;
    h.lastBeat = Date.now();
    h.beats++;
    h.updated = Date.now();
    h.hits++;
    this.totalBeats++;
    return true;
  }

  stop(id: string): boolean {
    const h = this.heartbeats.get(id);
    if (!h) return false;
    h.state = 'stopped';
    h.updated = Date.now();
    h.hits++;
    this.totalStops++;
    return true;
  }

  expire(id: string): boolean {
    const h = this.heartbeats.get(id);
    if (!h) return false;
    h.state = 'expired';
    h.updated = Date.now();
    return true;
  }

  isExpired(id: string): boolean {
    const h = this.heartbeats.get(id);
    if (!h) return false;
    return Date.now() - h.lastBeat > h.interval * 3;
  }

  remove(id: string): boolean {
    return this.heartbeats.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const h = this.heartbeats.get(id);
    if (!h) return false;
    h.active = active;
    h.updated = Date.now();
    return true;
  }

  setInterval(id: string, interval: number): boolean {
    const h = this.heartbeats.get(id);
    if (!h) return false;
    h.interval = interval;
    h.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const h of this.heartbeats.values()) {
      h.beats = 0;
      h.state = 'running';
      h.lastBeat = Date.now();
      h.active = true;
      h.hits = 0;
    }
    this.totalBeats = 0;
    this.totalStarts = 0;
    this.totalStops = 0;
  }

  getStats(): HbeStats {
    const all = Array.from(this.heartbeats.values());
    const intervalValues = all.map(h => h.interval);
    return {
      heartbeats: all.length,
      totalBeats: this.totalBeats,
      totalStarts: this.totalStarts,
      totalStops: this.totalStops,
      stopped: all.filter(h => h.state === 'stopped').length,
      running: all.filter(h => h.state === 'running').length,
      expired: all.filter(h => h.state === 'expired').length,
      active: all.filter(h => h.active).length,
      inactive: all.filter(h => !h.active).length,
      totalHits: all.reduce((s, h) => s + h.hits, 0),
      uniqueNames: new Set(all.map(h => h.name)).size,
      avgInterval: all.length > 0 ? Math.round((intervalValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxInterval: intervalValues.length > 0 ? Math.max(...intervalValues) : 0,
      minInterval: intervalValues.length > 0 ? Math.min(...intervalValues) : 0,
    };
  }

  getHeartbeat(id: string): Heartbeat | undefined {
    return this.heartbeats.get(id);
  }

  getAllHeartbeats(): Heartbeat[] {
    return Array.from(this.heartbeats.values());
  }

  hasHeartbeat(id: string): boolean {
    return this.heartbeats.has(id);
  }

  getCount(): number {
    return this.heartbeats.size;
  }

  getName(id: string): string | undefined {
    return this.heartbeats.get(id)?.name;
  }

  getInterval(id: string): number {
    return this.heartbeats.get(id)?.interval ?? 0;
  }

  getLastBeat(id: string): number {
    return this.heartbeats.get(id)?.lastBeat ?? 0;
  }

  getBeats(id: string): number {
    return this.heartbeats.get(id)?.beats ?? 0;
  }

  getState(id: string): HeartbeatState | undefined {
    return this.heartbeats.get(id)?.state;
  }

  getHits(id: string): number {
    return this.heartbeats.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.heartbeats.get(id)?.active ?? false;
  }

  isRunning(id: string): boolean {
    return this.heartbeats.get(id)?.state === 'running';
  }

  isStopped(id: string): boolean {
    return this.heartbeats.get(id)?.state === 'stopped';
  }

  getByState(state: HeartbeatState): Heartbeat[] {
    return Array.from(this.heartbeats.values()).filter(h => h.state === state);
  }

  getActiveHeartbeats(): Heartbeat[] {
    return Array.from(this.heartbeats.values()).filter(h => h.active);
  }

  getInactiveHeartbeats(): Heartbeat[] {
    return Array.from(this.heartbeats.values()).filter(h => !h.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.heartbeats.values()).map(h => h.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getNewest(): Heartbeat | null {
    const all = Array.from(this.heartbeats.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.created > max.created ? h : max);
  }

  getOldest(): Heartbeat | null {
    const all = Array.from(this.heartbeats.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.created < min.created ? h : min);
  }

  getCreatedAt(id: string): number {
    return this.heartbeats.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.heartbeats.get(id)?.updated ?? 0;
  }

  getTotalBeats(): number {
    return this.totalBeats;
  }

  getTotalStarts(): number {
    return this.totalStarts;
  }

  getTotalStops(): number {
    return this.totalStops;
  }

  clearAll(): void {
    this.heartbeats.clear();
    this.counter = 0;
    this.totalBeats = 0;
    this.totalStarts = 0;
    this.totalStops = 0;
  }
}

export default HeartbeatEngine;