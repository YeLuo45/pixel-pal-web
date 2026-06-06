/**
 * Sentinel Engine
 * generic-agent-design Sentinel Engine - Register + Watch + Alert + Stats
 */

export interface Sentinel {
  id: string;
  name: string;
  watching: boolean;
  alerts: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface SE5bStats {
  sentinels: number;
  watching: number;
  idle: number;
  totalAlerts: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgAlerts: number;
  maxAlerts: number;
  minAlerts: number;
  alertRate: number;
}

export class SentinelEngine {
  private sentinels: Map<string, Sentinel> = new Map();
  private counter = 0;
  private totalAlerts = 0;

  register(name: string): string {
    const id = `se5-${++this.counter}`;
    this.sentinels.set(id, {
      id,
      name,
      watching: false,
      alerts: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  watch(id: string): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.watching) return false;
    s.watching = true;
    s.history.push(Date.now());
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  unwatch(id: string): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    if (!s.watching) return false;
    s.watching = false;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  alert(id: string): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.alerts++;
    s.history.push(Date.now());
    s.updated = Date.now();
    s.hits++;
    this.totalAlerts++;
    return true;
  }

  reset(id: string): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    s.alerts = 0;
    s.history = [];
    s.updated = Date.now();
    return true;
  }

  getStats(): SE5bStats {
    const all = Array.from(this.sentinels.values());
    const alertValues = all.map(s => s.alerts);
    return {
      sentinels: all.length,
      watching: all.filter(s => s.watching).length,
      idle: all.filter(s => !s.watching).length,
      totalAlerts: this.totalAlerts,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      avgAlerts: all.length > 0 ? Math.round((alertValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxAlerts: alertValues.length > 0 ? Math.max(...alertValues) : 0,
      minAlerts: alertValues.length > 0 ? Math.min(...alertValues) : 0,
      alertRate: this.totalAlerts > 0 ? 1 : 0,
    };
  }

  getSentinel(id: string): Sentinel | undefined {
    return this.sentinels.get(id);
  }

  getAllSentinels(): Sentinel[] {
    return Array.from(this.sentinels.values());
  }

  removeSentinel(id: string): boolean {
    return this.sentinels.delete(id);
  }

  hasSentinel(id: string): boolean {
    return this.sentinels.has(id);
  }

  getCount(): number {
    return this.sentinels.size;
  }

  getName(id: string): string | undefined {
    return this.sentinels.get(id)?.name;
  }

  getAlerts(id: string): number {
    return this.sentinels.get(id)?.alerts ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.sentinels.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.sentinels.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.sentinels.get(id)?.active ?? false;
  }

  isWatching(id: string): boolean {
    return this.sentinels.get(id)?.watching ?? false;
  }

  isIdle(id: string): boolean {
    const s = this.sentinels.get(id);
    return s ? !s.watching : false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.sentinels.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.sentinels.values()) {
      s.alerts = 0;
      s.hits = 0;
      s.history = [];
      s.active = true;
      s.watching = false;
    }
    this.totalAlerts = 0;
  }

  getByName(name: string): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => s.name === name);
  }

  getWatchingSentinels(): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => s.watching);
  }

  getIdleSentinels(): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => !s.watching);
  }

  getActiveSentinels(): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => s.active);
  }

  getInactiveSentinels(): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.sentinels.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinAlerts(min: number): Sentinel[] {
    return Array.from(this.sentinels.values()).filter(s => s.alerts >= min);
  }

  getMostAlerts(): Sentinel | null {
    const all = Array.from(this.sentinels.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.alerts > max.alerts ? s : max);
  }

  getNewest(): Sentinel | null {
    const all = Array.from(this.sentinels.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Sentinel | null {
    const all = Array.from(this.sentinels.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.sentinels.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.sentinels.get(id)?.updated ?? 0;
  }

  getTotalAlerts(): number {
    return this.totalAlerts;
  }

  clearAll(): void {
    this.sentinels.clear();
    this.counter = 0;
    this.totalAlerts = 0;
  }
}

export default SentinelEngine;