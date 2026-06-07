/**
 * Watcher Engine
 * claude-code-design Watcher Engine - Watch + Trigger + Stop + Stats
 */

export interface Watcher {
  id: string;
  name: string;
  condition: string;
  triggered: boolean;
  fires: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface WteStats {
  watchers: number;
  totalTriggered: number;
  totalStopped: number;
  active: number;
  inactive: number;
  triggered: number;
  untriggered: number;
  totalHits: number;
  uniqueNames: number;
  uniqueConditions: number;
  totalFires: number;
  avgFires: number;
  maxFires: number;
  minFires: number;
}

export class WatcherEngine {
  private watchers: Map<string, Watcher> = new Map();
  private counter = 0;
  private totalTriggered = 0;
  private totalStopped = 0;

  watch(name: string, condition: string): string {
    const id = `wte-${++this.counter}`;
    this.watchers.set(id, {
      id,
      name,
      condition,
      triggered: false,
      fires: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  trigger(id: string): boolean {
    const w = this.watchers.get(id);
    if (!w) return false;
    if (!w.active) return false;
    w.triggered = true;
    w.fires++;
    w.updated = Date.now();
    w.hits++;
    this.totalTriggered++;
    return true;
  }

  stop(id: string): boolean {
    const w = this.watchers.get(id);
    if (!w) return false;
    w.active = false;
    w.updated = Date.now();
    w.hits++;
    this.totalStopped++;
    return true;
  }

  reset(id: string): boolean {
    const w = this.watchers.get(id);
    if (!w) return false;
    w.triggered = false;
    w.fires = 0;
    w.updated = Date.now();
    w.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.watchers.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const w = this.watchers.get(id);
    if (!w) return false;
    w.active = active;
    w.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const w = this.watchers.get(id);
    if (!w) return false;
    w.name = name;
    w.updated = Date.now();
    return true;
  }

  setCondition(id: string, condition: string): boolean {
    const w = this.watchers.get(id);
    if (!w) return false;
    w.condition = condition;
    w.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const w of this.watchers.values()) {
      w.triggered = false;
      w.fires = 0;
      w.active = true;
      w.hits = 0;
    }
    this.totalTriggered = 0;
    this.totalStopped = 0;
  }

  getStats(): WteStats {
    const all = Array.from(this.watchers.values());
    const firesArr = all.map(w => w.fires);
    return {
      watchers: all.length,
      totalTriggered: this.totalTriggered,
      totalStopped: this.totalStopped,
      active: all.filter(w => w.active).length,
      inactive: all.filter(w => !w.active).length,
      triggered: all.filter(w => w.triggered).length,
      untriggered: all.filter(w => !w.triggered).length,
      totalHits: all.reduce((s, w) => s + w.hits, 0),
      uniqueNames: new Set(all.map(w => w.name)).size,
      uniqueConditions: new Set(all.map(w => w.condition)).size,
      totalFires: all.reduce((s, w) => s + w.fires, 0),
      avgFires: all.length > 0 ? Math.round((firesArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxFires: firesArr.length > 0 ? Math.max(...firesArr) : 0,
      minFires: firesArr.length > 0 ? Math.min(...firesArr) : 0,
    };
  }

  getWatcher(id: string): Watcher | undefined {
    return this.watchers.get(id);
  }

  getAllWatchers(): Watcher[] {
    return Array.from(this.watchers.values());
  }

  hasWatcher(id: string): boolean {
    return this.watchers.has(id);
  }

  getCount(): number {
    return this.watchers.size;
  }

  getName(id: string): string | undefined {
    return this.watchers.get(id)?.name;
  }

  getCondition(id: string): string | undefined {
    return this.watchers.get(id)?.condition;
  }

  getFires(id: string): number {
    return this.watchers.get(id)?.fires ?? 0;
  }

  getHits(id: string): number {
    return this.watchers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.watchers.get(id)?.active ?? false;
  }

  isTriggered(id: string): boolean {
    return this.watchers.get(id)?.triggered ?? false;
  }

  getByName(name: string): Watcher[] {
    return Array.from(this.watchers.values()).filter(w => w.name === name);
  }

  getActiveWatchers(): Watcher[] {
    return Array.from(this.watchers.values()).filter(w => w.active);
  }

  getInactiveWatchers(): Watcher[] {
    return Array.from(this.watchers.values()).filter(w => !w.active);
  }

  getTriggeredWatchers(): Watcher[] {
    return Array.from(this.watchers.values()).filter(w => w.triggered);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.watchers.values()).map(w => w.name))];
  }

  getAllConditions(): string[] {
    return [...new Set(Array.from(this.watchers.values()).map(w => w.condition))];
  }

  getNewest(): Watcher | null {
    const all = Array.from(this.watchers.values());
    if (all.length === 0) return null;
    return all.reduce((max, w) => w.created > max.created ? w : max);
  }

  getOldest(): Watcher | null {
    const all = Array.from(this.watchers.values());
    if (all.length === 0) return null;
    return all.reduce((min, w) => w.created < min.created ? w : min);
  }

  getCreatedAt(id: string): number {
    return this.watchers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.watchers.get(id)?.updated ?? 0;
  }

  getTotalTriggered(): number {
    return this.totalTriggered;
  }

  getTotalStopped(): number {
    return this.totalStopped;
  }

  clearAll(): void {
    this.watchers.clear();
    this.counter = 0;
    this.totalTriggered = 0;
    this.totalStopped = 0;
  }
}

export default WatcherEngine;