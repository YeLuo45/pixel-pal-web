/**
 * Quota Engine
 * nanobot-design Quota Engine - Add + Use + Reset + Stats
 */

export type QuotaPeriod = 'minute' | 'hour' | 'day' | 'week' | 'month';

export interface QuotaEntry {
  id: string;
  name: string;
  period: QuotaPeriod;
  limit: number;
  used: number;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
  resetAt: number;
}

export interface QteStats {
  quotas: number;
  totalAdded: number;
  totalUsed: number;
  totalReset: number;
  minute: number;
  hour: number;
  day: number;
  week: number;
  month: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalUsed: number;
  totalLimit: number;
  totalRemaining: number;
  avgUsedRate: number;
}

export class QuotaEngine {
  private quotas: Map<string, QuotaEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalUsed = 0;
  private totalReset = 0;
  private totalLimit = 0;

  add(name: string, period: QuotaPeriod, limit: number): string {
    const id = `qte-${++this.counter}`;
    this.quotas.set(id, {
      id,
      name,
      period,
      limit,
      used: 0,
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      resetAt: this.computeResetAt(period),
    });
    this.totalAdded++;
    this.totalLimit += limit;
    return id;
  }

  use(id: string, amount: number = 1): boolean {
    const q = this.quotas.get(id);
    if (!q) return false;
    if (!q.active) return false;
    if (q.used >= q.limit) return false;
    q.used = Math.min(q.limit, q.used + Math.max(0, amount));
    q.updated = Date.now();
    q.hits++;
    this.totalUsed += Math.max(0, amount);
    return true;
  }

  reset(id: string): boolean {
    const q = this.quotas.get(id);
    if (!q) return false;
    q.used = 0;
    q.resetAt = this.computeResetAt(q.period);
    q.updated = Date.now();
    q.hits++;
    this.totalReset++;
    return true;
  }

  remove(id: string): boolean {
    return this.quotas.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const q = this.quotas.get(id);
    if (!q) return false;
    q.active = active;
    q.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const q = this.quotas.get(id);
    if (!q) return false;
    q.name = name;
    q.updated = Date.now();
    return true;
  }

  setPeriod(id: string, period: QuotaPeriod): boolean {
    const q = this.quotas.get(id);
    if (!q) return false;
    q.period = period;
    q.resetAt = this.computeResetAt(period);
    q.updated = Date.now();
    return true;
  }

  setLimit(id: string, limit: number): boolean {
    const q = this.quotas.get(id);
    if (!q) return false;
    q.limit = limit;
    q.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const q of this.quotas.values()) {
      q.used = 0;
      q.active = true;
      q.hits = 0;
    }
    this.totalAdded = 0;
    this.totalUsed = 0;
    this.totalReset = 0;
    this.totalLimit = 0;
  }

  private computeResetAt(period: QuotaPeriod): number {
    const now = Date.now();
    switch (period) {
      case 'minute': return now + 60_000;
      case 'hour': return now + 3_600_000;
      case 'day': return now + 86_400_000;
      case 'week': return now + 604_800_000;
      case 'month': return now + 2_592_000_000;
    }
  }

  getStats(): QteStats {
    const all = Array.from(this.quotas.values());
    return {
      quotas: all.length,
      totalAdded: this.totalAdded,
      totalUsed: this.totalUsed,
      totalReset: this.totalReset,
      minute: all.filter(q => q.period === 'minute').length,
      hour: all.filter(q => q.period === 'hour').length,
      day: all.filter(q => q.period === 'day').length,
      week: all.filter(q => q.period === 'week').length,
      month: all.filter(q => q.period === 'month').length,
      active: all.filter(q => q.active).length,
      inactive: all.filter(q => !q.active).length,
      totalHits: all.reduce((s, q) => s + q.hits, 0),
      uniqueNames: new Set(all.map(q => q.name)).size,
      totalUsed: all.reduce((s, q) => s + q.used, 0),
      totalLimit: this.totalLimit,
      totalRemaining: all.reduce((s, q) => s + (q.limit - q.used), 0),
      avgUsedRate: this.totalLimit > 0 ? Math.round((all.reduce((s, q) => s + q.used, 0) / this.totalLimit) * 100) / 100 : 0,
    };
  }

  getQuota(id: string): QuotaEntry | undefined {
    return this.quotas.get(id);
  }

  getAllQuotas(): QuotaEntry[] {
    return Array.from(this.quotas.values());
  }

  hasQuota(id: string): boolean {
    return this.quotas.has(id);
  }

  getCount(): number {
    return this.quotas.size;
  }

  getName(id: string): string | undefined {
    return this.quotas.get(id)?.name;
  }

  getPeriod(id: string): QuotaPeriod | undefined {
    return this.quotas.get(id)?.period;
  }

  getLimit(id: string): number {
    return this.quotas.get(id)?.limit ?? 0;
  }

  getUsed(id: string): number {
    return this.quotas.get(id)?.used ?? 0;
  }

  getRemaining(id: string): number {
    const q = this.quotas.get(id);
    if (!q) return 0;
    return Math.max(0, q.limit - q.used);
  }

  getHits(id: string): number {
    return this.quotas.get(id)?.hits ?? 0;
  }

  getResetAt(id: string): number {
    return this.quotas.get(id)?.resetAt ?? 0;
  }

  isActive(id: string): boolean {
    return this.quotas.get(id)?.active ?? false;
  }

  isExhausted(id: string): boolean {
    const q = this.quotas.get(id);
    return q !== undefined && q.used >= q.limit;
  }

  isMinute(id: string): boolean {
    return this.quotas.get(id)?.period === 'minute';
  }

  isHour(id: string): boolean {
    return this.quotas.get(id)?.period === 'hour';
  }

  isDay(id: string): boolean {
    return this.quotas.get(id)?.period === 'day';
  }

  isWeek(id: string): boolean {
    return this.quotas.get(id)?.period === 'week';
  }

  isMonth(id: string): boolean {
    return this.quotas.get(id)?.period === 'month';
  }

  getByPeriod(period: QuotaPeriod): QuotaEntry[] {
    return Array.from(this.quotas.values()).filter(q => q.period === period);
  }

  getActiveQuotas(): QuotaEntry[] {
    return Array.from(this.quotas.values()).filter(q => q.active);
  }

  getInactiveQuotas(): QuotaEntry[] {
    return Array.from(this.quotas.values()).filter(q => !q.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.quotas.values()).map(q => q.name))];
  }

  getNewest(): QuotaEntry | null {
    const all = Array.from(this.quotas.values());
    if (all.length === 0) return null;
    return all.reduce((max, q) => q.created > max.created ? q : max);
  }

  getOldest(): QuotaEntry | null {
    const all = Array.from(this.quotas.values());
    if (all.length === 0) return null;
    return all.reduce((min, q) => q.created < min.created ? q : min);
  }

  getCreatedAt(id: string): number {
    return this.quotas.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.quotas.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalUsed(): number {
    return this.totalUsed;
  }

  getTotalReset(): number {
    return this.totalReset;
  }

  clearAll(): void {
    this.quotas.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalUsed = 0;
    this.totalReset = 0;
    this.totalLimit = 0;
  }
}

export default QuotaEngine;