/**
 * Scheduler Manager
 * nanobot-design Scheduler Manager - Schedule + Run + Enable + Disable + Stats
 */

export interface Schedule {
  id: string;
  name: string;
  cron: string;
  active: boolean;
  lastRun: number;
  runs: number;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface Sc2Stats {
  schedules: number;
  active: number;
  inactive: number;
  totalRuns: number;
  totalHits: number;
  uniqueNames: number;
  uniqueCrons: number;
  avgRuns: number;
  maxRuns: number;
  minRuns: number;
  avgCronLength: number;
  enabledRate: number;
}

export class SchedulerManager {
  private schedules: Map<string, Schedule> = new Map();
  private counter = 0;
  private totalRuns = 0;

  schedule(name: string, cron: string = '* * * * *'): string {
    const id = `sc2-${++this.counter}`;
    this.schedules.set(id, {
      id,
      name,
      cron,
      active: true,
      lastRun: 0,
      runs: 0,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  run(id: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.runs++;
    s.lastRun = Date.now();
    s.history.push(s.lastRun);
    s.updated = Date.now();
    s.hits++;
    this.totalRuns++;
    return true;
  }

  unschedule(id: string): boolean {
    return this.schedules.delete(id);
  }

  enable(id: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    if (s.active) return false;
    s.active = true;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  disable(id: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.active = false;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  reset(id: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    s.runs = 0;
    s.lastRun = 0;
    s.history = [];
    s.updated = Date.now();
    return true;
  }

  getStats(): Sc2Stats {
    const all = Array.from(this.schedules.values());
    const runValues = all.map(s => s.runs);
    const cronLengths = all.map(s => s.cron.length);
    return {
      schedules: all.length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalRuns: this.totalRuns,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      uniqueCrons: new Set(all.map(s => s.cron)).size,
      avgRuns: all.length > 0 ? Math.round((runValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxRuns: runValues.length > 0 ? Math.max(...runValues) : 0,
      minRuns: runValues.length > 0 ? Math.min(...runValues) : 0,
      avgCronLength: all.length > 0 ? Math.round((cronLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      enabledRate: all.length > 0 ? Math.round((all.filter(s => s.active).length / all.length) * 100) / 100 : 0,
    };
  }

  getSchedule(id: string): Schedule | undefined {
    return this.schedules.get(id);
  }

  getAllSchedules(): Schedule[] {
    return Array.from(this.schedules.values());
  }

  removeSchedule(id: string): boolean {
    return this.schedules.delete(id);
  }

  hasSchedule(id: string): boolean {
    return this.schedules.has(id);
  }

  getCount(): number {
    return this.schedules.size;
  }

  getName(id: string): string | undefined {
    return this.schedules.get(id)?.name;
  }

  getCron(id: string): string | undefined {
    return this.schedules.get(id)?.cron;
  }

  getCronLength(id: string): number {
    return this.schedules.get(id)?.cron.length ?? 0;
  }

  getRuns(id: string): number {
    return this.schedules.get(id)?.runs ?? 0;
  }

  getLastRun(id: string): number {
    return this.schedules.get(id)?.lastRun ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.schedules.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.schedules.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.schedules.get(id)?.active ?? false;
  }

  isEnabled(id: string): boolean {
    return this.schedules.get(id)?.active ?? false;
  }

  isDisabled(id: string): boolean {
    const s = this.schedules.get(id);
    return s ? !s.active : false;
  }

  setName(id: string, name: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setCron(id: string, cron: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    s.cron = cron;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.schedules.values()) {
      s.runs = 0;
      s.lastRun = 0;
      s.hits = 0;
      s.history = [];
      s.active = true;
    }
    this.totalRuns = 0;
  }

  getByName(name: string): Schedule[] {
    return Array.from(this.schedules.values()).filter(s => s.name === name);
  }

  getByCron(cron: string): Schedule[] {
    return Array.from(this.schedules.values()).filter(s => s.cron === cron);
  }

  getActiveSchedules(): Schedule[] {
    return Array.from(this.schedules.values()).filter(s => s.active);
  }

  getInactiveSchedules(): Schedule[] {
    return Array.from(this.schedules.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.schedules.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinRuns(min: number): Schedule[] {
    return Array.from(this.schedules.values()).filter(s => s.runs >= min);
  }

  getMostRuns(): Schedule | null {
    const all = Array.from(this.schedules.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.runs > max.runs ? s : max);
  }

  getNewest(): Schedule | null {
    const all = Array.from(this.schedules.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Schedule | null {
    const all = Array.from(this.schedules.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.schedules.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.schedules.get(id)?.updated ?? 0;
  }

  getTotalRuns(): number {
    return this.totalRuns;
  }

  clearAll(): void {
    this.schedules.clear();
    this.counter = 0;
    this.totalRuns = 0;
  }
}

export default SchedulerManager;