/**
 * Watchdog Engine
 * thunderbolt-design Watchdog Engine - Register + Feed + Check + Stats
 */

export type WatchdogState = 'healthy' | 'sick' | 'dead';

export interface Watchdog {
  id: string;
  name: string;
  state: WatchdogState;
  lastFeed: number;
  feeds: number;
  threshold: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface WdeStats {
  watchdogs: number;
  totalFed: number;
  totalDead: number;
  healthy: number;
  sick: number;
  dead: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalFeeds: number;
  avgFeeds: number;
  maxFeeds: number;
  minFeeds: number;
}

export class WatchdogEngine {
  private watchdogs: Map<string, Watchdog> = new Map();
  private counter = 0;
  private totalFed = 0;
  private totalDead = 0;

  register(name: string, threshold: number = 30000): string {
    const id = `wde-${++this.counter}`;
    this.watchdogs.set(id, {
      id,
      name,
      state: 'healthy',
      lastFeed: Date.now(),
      feeds: 0,
      threshold,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  feed(id: string): boolean {
    const w = this.watchdogs.get(id);
    if (!w) return false;
    if (!w.active) return false;
    w.lastFeed = Date.now();
    w.feeds++;
    w.state = 'healthy';
    w.updated = Date.now();
    w.hits++;
    this.totalFed++;
    return true;
  }

  check(id: string): WatchdogState {
    const w = this.watchdogs.get(id);
    if (!w) return 'dead';
    const elapsed = Date.now() - w.lastFeed;
    let newState: WatchdogState = w.state;
    if (elapsed > w.threshold * 2) {
      newState = 'dead';
      this.totalDead++;
    } else if (elapsed > w.threshold) {
      newState = 'sick';
    } else {
      newState = 'healthy';
    }
    w.state = newState;
    w.updated = Date.now();
    w.hits++;
    return newState;
  }

  remove(id: string): boolean {
    return this.watchdogs.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const w = this.watchdogs.get(id);
    if (!w) return false;
    w.active = active;
    w.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const w = this.watchdogs.get(id);
    if (!w) return false;
    w.name = name;
    w.updated = Date.now();
    return true;
  }

  setThreshold(id: string, threshold: number): boolean {
    const w = this.watchdogs.get(id);
    if (!w) return false;
    w.threshold = threshold;
    w.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const w of this.watchdogs.values()) {
      w.state = 'healthy';
      w.lastFeed = Date.now();
      w.feeds = 0;
      w.active = true;
      w.hits = 0;
    }
    this.totalFed = 0;
    this.totalDead = 0;
  }

  getStats(): WdeStats {
    const all = Array.from(this.watchdogs.values());
    const feedsArr = all.map(w => w.feeds);
    return {
      watchdogs: all.length,
      totalFed: this.totalFed,
      totalDead: this.totalDead,
      healthy: all.filter(w => w.state === 'healthy').length,
      sick: all.filter(w => w.state === 'sick').length,
      dead: all.filter(w => w.state === 'dead').length,
      active: all.filter(w => w.active).length,
      inactive: all.filter(w => !w.active).length,
      totalHits: all.reduce((s, w) => s + w.hits, 0),
      uniqueNames: new Set(all.map(w => w.name)).size,
      totalFeeds: all.reduce((s, w) => s + w.feeds, 0),
      avgFeeds: all.length > 0 ? Math.round((feedsArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxFeeds: feedsArr.length > 0 ? Math.max(...feedsArr) : 0,
      minFeeds: feedsArr.length > 0 ? Math.min(...feedsArr) : 0,
    };
  }

  getWatchdog(id: string): Watchdog | undefined {
    return this.watchdogs.get(id);
  }

  getAllWatchdogs(): Watchdog[] {
    return Array.from(this.watchdogs.values());
  }

  hasWatchdog(id: string): boolean {
    return this.watchdogs.has(id);
  }

  getCount(): number {
    return this.watchdogs.size;
  }

  getName(id: string): string | undefined {
    return this.watchdogs.get(id)?.name;
  }

  getState(id: string): WatchdogState | undefined {
    return this.watchdogs.get(id)?.state;
  }

  getFeeds(id: string): number {
    return this.watchdogs.get(id)?.feeds ?? 0;
  }

  getLastFeed(id: string): number {
    return this.watchdogs.get(id)?.lastFeed ?? 0;
  }

  getThreshold(id: string): number {
    return this.watchdogs.get(id)?.threshold ?? 0;
  }

  getHits(id: string): number {
    return this.watchdogs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.watchdogs.get(id)?.active ?? false;
  }

  isHealthy(id: string): boolean {
    return this.watchdogs.get(id)?.state === 'healthy';
  }

  isSick(id: string): boolean {
    return this.watchdogs.get(id)?.state === 'sick';
  }

  isDead(id: string): boolean {
    return this.watchdogs.get(id)?.state === 'dead';
  }

  getByState(state: WatchdogState): Watchdog[] {
    return Array.from(this.watchdogs.values()).filter(w => w.state === state);
  }

  getActiveWatchdogs(): Watchdog[] {
    return Array.from(this.watchdogs.values()).filter(w => w.active);
  }

  getInactiveWatchdogs(): Watchdog[] {
    return Array.from(this.watchdogs.values()).filter(w => !w.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.watchdogs.values()).map(w => w.name))];
  }

  getNewest(): Watchdog | null {
    const all = Array.from(this.watchdogs.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.created > max.created ? w : max);
  }

  getOldest(): Watchdog | null {
    const all = Array.from(this.watchdogs.values());
    if (all.length === 0) return null;
    return all.reduce((min, w) => w.created < min.created ? w : min);
  }

  getCreatedAt(id: string): number {
    return this.watchdogs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.watchdogs.get(id)?.updated ?? 0;
  }

  getTotalFed(): number {
    return this.totalFed;
  }

  getTotalDead(): number {
    return this.totalDead;
  }

  clearAll(): void {
    this.watchdogs.clear();
    this.counter = 0;
    this.totalFed = 0;
    this.totalDead = 0;
  }
}

export default WatchdogEngine;