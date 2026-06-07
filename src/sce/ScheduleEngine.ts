/**
 * Schedule Engine
 * chatdev-design Schedule Engine - Schedule + Run + Reschedule + Stats
 */

export type ScheduleStatus = 'pending' | 'due' | 'overdue' | 'completed';

export interface Schedule {
  id: string;
  name: string;
  cron: string;
  runs: number;
  status: ScheduleStatus;
  lastRun: number;
  nextRun: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SceStats {
  schedules: number;
  totalScheduled: number;
  totalRun: number;
  totalRescheduled: number;
  pending: number;
  due: number;
  overdue: number;
  completed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueCrons: number;
  totalRuns: number;
  avgRuns: number;
  maxRuns: number;
  minRuns: number;
}

function isValidCron(cron: string): boolean {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  for (const p of parts) {
    if (!/^[\d*\/,\-]+$/.test(p) && p !== '*') return false;
  }
  return true;
}

export class ScheduleEngine {
  private schedules: Map<string, Schedule> = new Map();
  private counter = 0;
  private totalScheduled = 0;
  private totalRun = 0;
  private totalRescheduled = 0;
  private totalRuns = 0;

  schedule(name: string, cron: string, nextRun: number = Date.now() + 1000): string {
    const id = `sce-${++this.counter}`;
    this.schedules.set(id, {
      id,
      name,
      cron,
      runs: 0,
      status: isValidCron(cron) ? 'pending' : 'pending',
      lastRun: 0,
      nextRun,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalScheduled++;
    return id;
  }

  run(id: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.lastRun = Date.now();
    s.runs++;
    s.nextRun = Date.now() + 60000;
    s.status = 'completed';
    s.updated = Date.now();
    s.hits++;
    this.totalRun++;
    this.totalRuns++;
    return true;
  }

  reschedule(id: string, nextRun: number): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    s.nextRun = nextRun;
    s.status = 'pending';
    s.updated = Date.now();
    s.hits++;
    this.totalRescheduled++;
    return true;
  }

  markDue(id: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    s.status = 'due';
    s.updated = Date.now();
    return true;
  }

  markOverdue(id: string): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    s.status = 'overdue';
    s.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.schedules.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
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

  setNextRun(id: string, nextRun: number): boolean {
    const s = this.schedules.get(id);
    if (!s) return false;
    s.nextRun = nextRun;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.schedules.values()) {
      s.runs = 0;
      s.lastRun = 0;
      s.status = 'pending';
      s.active = true;
      s.hits = 0;
    }
    this.totalScheduled = 0;
    this.totalRun = 0;
    this.totalRescheduled = 0;
    this.totalRuns = 0;
  }

  isValid(cron: string): boolean {
    return isValidCron(cron);
  }

  getStats(): SceStats {
    const all = Array.from(this.schedules.values());
    const runsArr = all.map(s => s.runs);
    return {
      schedules: all.length,
      totalScheduled: this.totalScheduled,
      totalRun: this.totalRun,
      totalRescheduled: this.totalRescheduled,
      pending: all.filter(s => s.status === 'pending').length,
      due: all.filter(s => s.status === 'due').length,
      overdue: all.filter(s => s.status === 'overdue').length,
      completed: all.filter(s => s.status === 'completed').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      uniqueCrons: new Set(all.map(s => s.cron)).size,
      totalRuns: this.totalRuns,
      avgRuns: all.length > 0 ? Math.round((runsArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxRuns: runsArr.length > 0 ? Math.max(...runsArr) : 0,
      minRuns: runsArr.length > 0 ? Math.min(...runsArr) : 0,
    };
  }

  getSchedule(id: string): Schedule | undefined {
    return this.schedules.get(id);
  }

  getAllSchedules(): Schedule[] {
    return Array.from(this.schedules.values());
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

  getStatus(id: string): ScheduleStatus | undefined {
    return this.schedules.get(id)?.status;
  }

  getRuns(id: string): number {
    return this.schedules.get(id)?.runs ?? 0;
  }

  getLastRun(id: string): number {
    return this.schedules.get(id)?.lastRun ?? 0;
  }

  getNextRun(id: string): number {
    return this.schedules.get(id)?.nextRun ?? 0;
  }

  getHits(id: string): number {
    return this.schedules.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.schedules.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.schedules.get(id)?.status === 'pending';
  }

  isDue(id: string): boolean {
    return this.schedules.get(id)?.status === 'due';
  }

  isOverdue(id: string): boolean {
    return this.schedules.get(id)?.status === 'overdue';
  }

  isCompleted(id: string): boolean {
    return this.schedules.get(id)?.status === 'completed';
  }

  getByStatus(status: ScheduleStatus): Schedule[] {
    return Array.from(this.schedules.values()).filter(s => s.status === status);
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

  getAllCrons(): string[] {
    return [...new Set(Array.from(this.schedules.values()).map(s => s.cron))];
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

  getTotalScheduled(): number {
    return this.totalScheduled;
  }

  getTotalRun(): number {
    return this.totalRun;
  }

  getTotalRescheduled(): number {
    return this.totalRescheduled;
  }

  clearAll(): void {
    this.schedules.clear();
    this.counter = 0;
    this.totalScheduled = 0;
    this.totalRun = 0;
    this.totalRescheduled = 0;
    this.totalRuns = 0;
  }
}

export default ScheduleEngine;