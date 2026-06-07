/**
 * Timer Engine
 * chatdev-design Timer Engine - Create + Tick + Stop + Stats
 */

export type TimerStatus = 'running' | 'paused' | 'finished';

export interface Timer {
  id: string;
  name: string;
  duration: number;
  elapsed: number;
  status: TimerStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface TmeStats {
  timers: number;
  totalCreated: number;
  totalTicked: number;
  totalStopped: number;
  running: number;
  paused: number;
  finished: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalDuration: number;
  totalElapsed: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}

export class TimerEngine {
  private timers: Map<string, Timer> = new Map();
  private counter = 0;
  private totalCreated = 0;
  private totalTicked = 0;
  private totalStopped = 0;
  private totalDuration = 0;
  private totalElapsed = 0;

  create(name: string, duration: number): string {
    const id = `tme-${++this.counter}`;
    this.timers.set(id, {
      id,
      name,
      duration,
      elapsed: 0,
      status: 'running',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalCreated++;
    this.totalDuration += duration;
    return id;
  }

  tick(id: string, amount: number = 1): boolean {
    const t = this.timers.get(id);
    if (!t) return false;
    if (t.status !== 'running') return false;
    if (!t.active) return false;
    t.elapsed += amount;
    t.updated = Date.now();
    t.hits++;
    this.totalTicked++;
    this.totalElapsed += amount;
    if (t.elapsed >= t.duration) {
      t.status = 'finished';
    }
    return true;
  }

  pause(id: string): boolean {
    const t = this.timers.get(id);
    if (!t) return false;
    if (t.status !== 'running') return false;
    t.status = 'paused';
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  resume(id: string): boolean {
    const t = this.timers.get(id);
    if (!t) return false;
    if (t.status !== 'paused') return false;
    t.status = 'running';
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  stop(id: string): boolean {
    const t = this.timers.get(id);
    if (!t) return false;
    t.status = 'finished';
    t.updated = Date.now();
    t.hits++;
    this.totalStopped++;
    return true;
  }

  remove(id: string): boolean {
    return this.timers.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.timers.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setDuration(id: string, duration: number): boolean {
    const t = this.timers.get(id);
    if (!t) return false;
    t.duration = duration;
    t.updated = Date.now();
    return true;
  }

  setElapsed(id: string, elapsed: number): boolean {
    const t = this.timers.get(id);
    if (!t) return false;
    t.elapsed = elapsed;
    if (elapsed >= t.duration) t.status = 'finished';
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.timers.values()) {
      t.elapsed = 0;
      t.status = 'running';
      t.active = true;
      t.hits = 0;
    }
    this.totalCreated = 0;
    this.totalTicked = 0;
    this.totalStopped = 0;
    this.totalDuration = 0;
    this.totalElapsed = 0;
  }

  getStats(): TmeStats {
    const all = Array.from(this.timers.values());
    const durArr = all.map(t => t.duration);
    return {
      timers: all.length,
      totalCreated: this.totalCreated,
      totalTicked: this.totalTicked,
      totalStopped: this.totalStopped,
      running: all.filter(t => t.status === 'running').length,
      paused: all.filter(t => t.status === 'paused').length,
      finished: all.filter(t => t.status === 'finished').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      totalDuration: this.totalDuration,
      totalElapsed: this.totalElapsed,
      avgDuration: all.length > 0 ? Math.round((durArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxDuration: durArr.length > 0 ? Math.max(...durArr) : 0,
      minDuration: durArr.length > 0 ? Math.min(...durArr) : 0,
    };
  }

  getTimer(id: string): Timer | undefined {
    return this.timers.get(id);
  }

  getAllTimers(): Timer[] {
    return Array.from(this.timers.values());
  }

  hasTimer(id: string): boolean {
    return this.timers.has(id);
  }

  getCount(): number {
    return this.timers.size;
  }

  getName(id: string): string | undefined {
    return this.timers.get(id)?.name;
  }

  getDuration(id: string): number {
    return this.timers.get(id)?.duration ?? 0;
  }

  getElapsed(id: string): number {
    return this.timers.get(id)?.elapsed ?? 0;
  }

  getRemaining(id: string): number {
    const t = this.timers.get(id);
    if (!t) return 0;
    return Math.max(0, t.duration - t.elapsed);
  }

  getProgress(id: string): number {
    const t = this.timers.get(id);
    if (!t || t.duration === 0) return 0;
    return Math.min(1, t.elapsed / t.duration);
  }

  getStatus(id: string): TimerStatus | undefined {
    return this.timers.get(id)?.status;
  }

  getHits(id: string): number {
    return this.timers.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.timers.get(id)?.active ?? false;
  }

  isRunning(id: string): boolean {
    return this.timers.get(id)?.status === 'running';
  }

  isPaused(id: string): boolean {
    return this.timers.get(id)?.status === 'paused';
  }

  isFinished(id: string): boolean {
    return this.timers.get(id)?.status === 'finished';
  }

  getByStatus(status: TimerStatus): Timer[] {
    return Array.from(this.timers.values()).filter(t => t.status === status);
  }

  getActiveTimers(): Timer[] {
    return Array.from(this.timers.values()).filter(t => t.active);
  }

  getInactiveTimers(): Timer[] {
    return Array.from(this.timers.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.timers.values()).map(t => t.name))];
  }

  getNewest(): Timer | null {
    const all = Array.from(this.timers.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Timer | null {
    const all = Array.from(this.timers.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.timers.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.timers.get(id)?.updated ?? 0;
  }

  getTotalCreated(): number {
    return this.totalCreated;
  }

  getTotalTicked(): number {
    return this.totalTicked;
  }

  getTotalStopped(): number {
    return this.totalStopped;
  }

  clearAll(): void {
    this.timers.clear();
    this.counter = 0;
    this.totalCreated = 0;
    this.totalTicked = 0;
    this.totalStopped = 0;
    this.totalDuration = 0;
    this.totalElapsed = 0;
  }
}

export default TimerEngine;