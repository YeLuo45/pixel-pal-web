/**
 * Rate Limiter
 * thunderbolt-design Rate Limiter - Configure + Check + Consume + Reset
 */

export interface RateLimit {
  key: string;
  limit: number;
  window: number;
  count: number;
  resetAt: number;
  created: number;
}

export interface RateStats {
  key: string;
  count: number;
  remaining: number;
  utilization: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimit> = new Map();

  configure(key: string, limit: number, window: number): void {
    const now = Date.now();
    this.limits.set(key, {
      key,
      limit,
      window,
      count: 0,
      resetAt: now + window,
      created: now,
    });
  }

  check(key: string): boolean {
    const limit = this.limits.get(key);
    if (!limit) return false;
    this.maybeReset(limit);
    return limit.count < limit.limit;
  }

  consume(key: string, amount: number = 1): boolean {
    const limit = this.limits.get(key);
    if (!limit) return false;
    this.maybeReset(limit);
    if (limit.count + amount > limit.limit) return false;
    limit.count += amount;
    return true;
  }

  reset(key: string): void {
    const limit = this.limits.get(key);
    if (!limit) return;
    limit.count = 0;
    limit.resetAt = Date.now() + limit.window;
  }

  getStats(): RateStats[] {
    return Array.from(this.limits.values()).map(l => {
      this.maybeReset(l);
      return {
        key: l.key,
        count: l.count,
        remaining: Math.max(0, l.limit - l.count),
        utilization: l.limit > 0 ? Math.round((l.count / l.limit) * 100) / 100 : 0,
      };
    });
  }

  private maybeReset(limit: RateLimit): void {
    if (Date.now() >= limit.resetAt) {
      limit.count = 0;
      limit.resetAt = Date.now() + limit.window;
    }
  }

  getLimit(key: string): RateLimit | undefined {
    return this.limits.get(key);
  }

  getAllLimits(): RateLimit[] {
    return Array.from(this.limits.values());
  }

  removeLimit(key: string): boolean {
    return this.limits.delete(key);
  }

  hasLimit(key: string): boolean {
    return this.limits.has(key);
  }

  getCount(): number {
    return this.limits.size;
  }

  getRemaining(key: string): number {
    const limit = this.limits.get(key);
    if (!limit) return 0;
    this.maybeReset(limit);
    return Math.max(0, limit.limit - limit.count);
  }

  getCurrent(key: string): number {
    const limit = this.limits.get(key);
    if (!limit) return 0;
    this.maybeReset(limit);
    return limit.count;
  }

  getUtilization(key: string): number {
    const limit = this.limits.get(key);
    if (!limit || limit.limit === 0) return 0;
    this.maybeReset(limit);
    return Math.round((limit.count / limit.limit) * 100) / 100;
  }

  isExhausted(key: string): boolean {
    const limit = this.limits.get(key);
    if (!limit) return false;
    this.maybeReset(limit);
    return limit.count >= limit.limit;
  }

  getResetAt(key: string): number {
    return this.limits.get(key)?.resetAt ?? 0;
  }

  getTimeUntilReset(key: string): number {
    const limit = this.limits.get(key);
    if (!limit) return 0;
    return Math.max(0, limit.resetAt - Date.now());
  }

  setLimit(key: string, limit: number): boolean {
    const l = this.limits.get(key);
    if (!l) return false;
    l.limit = limit;
    return true;
  }

  setWindow(key: string, window: number): boolean {
    const l = this.limits.get(key);
    if (!l) return false;
    l.window = window;
    return true;
  }

  getAllKeys(): string[] {
    return [...this.limits.keys()];
  }

  resetAll(): void {
    for (const limit of this.limits.values()) {
      limit.count = 0;
      limit.resetAt = Date.now() + limit.window;
    }
  }

  getStatsForKey(key: string): RateStats | null {
    const l = this.limits.get(key);
    if (!l) return null;
    this.maybeReset(l);
    return {
      key: l.key,
      count: l.count,
      remaining: Math.max(0, l.limit - l.count),
      utilization: l.limit > 0 ? Math.round((l.count / l.limit) * 100) / 100 : 0,
    };
  }

  hasExhausted(): boolean {
    return Array.from(this.limits.values()).some(l => l.count >= l.limit);
  }

  getExhaustedKeys(): string[] {
    return Array.from(this.limits.values())
      .filter(l => l.count >= l.limit)
      .map(l => l.key);
  }

  getActiveCount(): number {
    return Array.from(this.limits.values()).filter(l => l.count > 0).length;
  }

  getCreatedAt(key: string): number {
    return this.limits.get(key)?.created ?? 0;
  }

  clearAll(): void {
    this.limits.clear();
  }
}

export default RateLimiter;