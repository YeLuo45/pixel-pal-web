/**
 * Timeout Engine
 * thunderbolt-design Timeout Engine - Set + Check + Clear + Stats
 */

export type TimeoutStatus = 'pending' | 'expired' | 'cancelled';

export interface Timeout {
  id: string;
  name: string;
  duration: number;
  elapsed: number;
  status: TimeoutStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Toe2Stats {
  timeouts: number;
  totalSet: number;
  totalExpired: number;
  totalCancelled: number;
  pending: number;
  expired: number;
  cancelled: number;
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

export class TimeoutEngine {
  private timeouts: Map<string, Timeout> = new Map();
  private counter = 0;
  private totalSet = 0;
  private totalExpired = 0;
  private totalCancelled = 0;
  private totalDuration = 0;
  private totalElapsed = 0;

  set(name: string, duration: number): string {
    const id = `toe2-${++this.counter}`;
    this.timeouts.set(id, {
      id,
      name,
      duration,
      elapsed: 0,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalSet++;
    this.totalDuration += duration;
    return id;
  }

  check(id: string, amount: number = 1): TimeoutStatus {
    const t = this.timeouts.get(id);
    if (!t) return 'cancelled';
    t.elapsed += amount;
    t.updated = Date.now();
    t.hits++;
    this.totalElapsed += amount;
    if (t.elapsed >= t.duration) {
      t.status = 'expired';
      this.totalExpired++;
    }
    return t.status;
  }

  cancel(id: string): boolean {
    const t = this.timeouts.get(id);
    if (!t) return false;
    t.status = 'cancelled';
    t.updated = Date.now();
    t.hits++;
    this.totalCancelled++;
    return true;
  }

  clear(id: string): boolean {
    return this.timeouts.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.timeouts.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setDuration(id: string, duration: number): boolean {
    const t = this.timeouts.get(id);
    if (!t) return false;
    t.duration = duration;
    t.updated = Date.now();
    return true;
  }

  setElapsed(id: string, elapsed: number): boolean {
    const t = this.timeouts.get(id);
    if (!t) return false;
    t.elapsed = elapsed;
    if (elapsed >= t.duration) t.status = 'expired';
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.timeouts.values()) {
      t.elapsed = 0;
      t.status = 'pending';
      t.active = true;
      t.hits = 0;
    }
    this.totalSet = 0;
    this.totalExpired = 0;
    this.totalCancelled = 0;
    this.totalDuration = 0;
    this.totalElapsed = 0;
  }

  getStats(): Toe2Stats {
    const all = Array.from(this.timeouts.values());
    const durArr = all.map(t => t.duration);
    return {
      timeouts: all.length,
      totalSet: this.totalSet,
      totalExpired: this.totalExpired,
      totalCancelled: this.totalCancelled,
      pending: all.filter(t => t.status === 'pending').length,
      expired: all.filter(t => t.status === 'expired').length,
      cancelled: all.filter(t => t.status === 'cancelled').length,
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

  getTimeout(id: string): Timeout | undefined {
    return this.timeouts.get(id);
  }

  getAllTimeouts(): Timeout[] {
    return Array.from(this.timeouts.values());
  }

  hasTimeout(id: string): boolean {
    return this.timeouts.has(id);
  }

  getCount(): number {
    return this.timeouts.size;
  }

  getName(id: string): string | undefined {
    return this.timeouts.get(id)?.name;
  }

  getDuration(id: string): number {
    return this.timeouts.get(id)?.duration ?? 0;
  }

  getElapsed(id: string): number {
    return this.timeouts.get(id)?.elapsed ?? 0;
  }

  getRemaining(id: string): number {
    const t = this.timeouts.get(id);
    if (!t) return 0;
    return Math.max(0, t.duration - t.elapsed);
  }

  getStatus(id: string): TimeoutStatus | undefined {
    return this.timeouts.get(id)?.status;
  }

  getHits(id: string): number {
    return this.timeouts.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.timeouts.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.timeouts.get(id)?.status === 'pending';
  }

  isExpired(id: string): boolean {
    return this.timeouts.get(id)?.status === 'expired';
  }

  isCancelled(id: string): boolean {
    return this.timeouts.get(id)?.status === 'cancelled';
  }

  getByStatus(status: TimeoutStatus): Timeout[] {
    return Array.from(this.timeouts.values()).filter(t => t.status === status);
  }

  getActiveTimeouts(): Timeout[] {
    return Array.from(this.timeouts.values()).filter(t => t.active);
  }

  getInactiveTimeouts(): Timeout[] {
    return Array.from(this.timeouts.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.timeouts.values()).map(t => t.name))];
  }

  getNewest(): Timeout | null {
    const all = Array.from(this.timeouts.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Timeout | null {
    const all = Array.from(this.timeouts.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.timeouts.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.timeouts.get(id)?.updated ?? 0;
  }

  getTotalSet(): number {
    return this.totalSet;
  }

  getTotalExpired(): number {
    return this.totalExpired;
  }

  getTotalCancelled(): number {
    return this.totalCancelled;
  }

  clearAll(): void {
    this.timeouts.clear();
    this.counter = 0;
    this.totalSet = 0;
    this.totalExpired = 0;
    this.totalCancelled = 0;
    this.totalDuration = 0;
    this.totalElapsed = 0;
  }
}

export default TimeoutEngine;