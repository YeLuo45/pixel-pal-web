/**
 * Health Engine
 * nanobot-design Health Engine - AddCheck + Report + Stats
 */

export type HealthLevel = 'healthy' | 'degraded' | 'unhealthy' | 'critical';

export interface HealthCheck {
  id: string;
  name: string;
  level: HealthLevel;
  latency: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface HeeStats {
  checks: number;
  totalAdded: number;
  totalReported: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  critical: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalLatency: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
}

export class HealthEngine {
  private checks: Map<string, HealthCheck> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalReported = 0;
  private totalLatency = 0;

  addCheck(name: string, level: HealthLevel = 'healthy', latency: number = 0): string {
    const id = `hee-${++this.counter}`;
    this.checks.set(id, {
      id,
      name,
      level,
      latency,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalLatency += latency;
    return id;
  }

  report(id: string, level: HealthLevel, latency: number): boolean {
    const c = this.checks.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.level = level;
    c.latency = latency;
    c.updated = Date.now();
    c.hits++;
    this.totalReported++;
    this.totalLatency += latency;
    return true;
  }

  remove(id: string): boolean {
    return this.checks.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.checks.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.checks.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  setLevel(id: string, level: HealthLevel): boolean {
    const c = this.checks.get(id);
    if (!c) return false;
    c.level = level;
    c.updated = Date.now();
    return true;
  }

  setLatency(id: string, latency: number): boolean {
    const c = this.checks.get(id);
    if (!c) return false;
    c.latency = latency;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.checks.values()) {
      c.active = true;
      c.hits = 0;
    }
    this.totalAdded = 0;
    this.totalReported = 0;
    this.totalLatency = 0;
  }

  getStats(): HeeStats {
    const all = Array.from(this.checks.values());
    const lArr = all.map(c => c.latency);
    return {
      checks: all.length,
      totalAdded: this.totalAdded,
      totalReported: this.totalReported,
      healthy: all.filter(c => c.level === 'healthy').length,
      degraded: all.filter(c => c.level === 'degraded').length,
      unhealthy: all.filter(c => c.level === 'unhealthy').length,
      critical: all.filter(c => c.level === 'critical').length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueNames: new Set(all.map(c => c.name)).size,
      totalLatency: this.totalLatency,
      avgLatency: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLatency: lArr.length > 0 ? Math.max(...lArr) : 0,
      minLatency: lArr.length > 0 ? Math.min(...lArr) : 0,
    };
  }

  getCheck(id: string): HealthCheck | undefined {
    return this.checks.get(id);
  }

  getAllChecks(): HealthCheck[] {
    return Array.from(this.checks.values());
  }

  hasCheck(id: string): boolean {
    return this.checks.has(id);
  }

  getCount(): number {
    return this.checks.size;
  }

  getName(id: string): string | undefined {
    return this.checks.get(id)?.name;
  }

  getLevel(id: string): HealthLevel | undefined {
    return this.checks.get(id)?.level;
  }

  getLatency(id: string): number {
    return this.checks.get(id)?.latency ?? 0;
  }

  getHits(id: string): number {
    return this.checks.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.checks.get(id)?.active ?? false;
  }

  isHealthy(id: string): boolean {
    return this.checks.get(id)?.level === 'healthy';
  }

  isDegraded(id: string): boolean {
    return this.checks.get(id)?.level === 'degraded';
  }

  isUnhealthy(id: string): boolean {
    return this.checks.get(id)?.level === 'unhealthy';
  }

  isCritical(id: string): boolean {
    return this.checks.get(id)?.level === 'critical';
  }

  getByLevel(level: HealthLevel): HealthCheck[] {
    return Array.from(this.checks.values()).filter(c => c.level === level);
  }

  getActiveChecks(): HealthCheck[] {
    return Array.from(this.checks.values()).filter(c => c.active);
  }

  getInactiveChecks(): HealthCheck[] {
    return Array.from(this.checks.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.checks.values()).map(c => c.name))];
  }

  getNewest(): HealthCheck | null {
    const all = Array.from(this.checks.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): HealthCheck | null {
    const all = Array.from(this.checks.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.checks.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.checks.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalReported(): number {
    return this.totalReported;
  }

  clearAll(): void {
    this.checks.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalReported = 0;
    this.totalLatency = 0;
  }
}

export default HealthEngine;