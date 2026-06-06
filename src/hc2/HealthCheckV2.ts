/**
 * Health Check v2
 * nanobot-design Health Check v2 - Check + IsHealthy + Stats
 */

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheck {
  id: string;
  node: string;
  status: HealthStatus;
  threshold: number;
  lastValue: number;
  created: number;
  updated: number;
  checks: number;
  history: HealthStatus[];
  active: boolean;
}

export interface HC2Stats {
  checks: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  totalChecks: number;
  avgValue: number;
  active: number;
  inactive: number;
  healthyRate: number;
}

export class HealthCheckV2 {
  private checks: Map<string, HealthCheck> = new Map();
  private counter = 0;

  check(node: string, value: number, threshold: number): string {
    const id = `hc2-${++this.counter}`;
    let status: HealthStatus;
    if (value >= threshold) {
      status = 'healthy';
    } else if (value >= threshold * 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    this.checks.set(id, {
      id,
      node,
      status,
      threshold,
      lastValue: value,
      created: Date.now(),
      updated: Date.now(),
      checks: 1,
      history: [status],
      active: true,
    });
    return id;
  }

  recheck(id: string, value: number): boolean {
    const h = this.checks.get(id);
    if (!h) return false;
    if (!h.active) return false;
    h.lastValue = value;
    h.checks++;
    if (value >= h.threshold) {
      h.status = 'healthy';
    } else if (value >= h.threshold * 0.5) {
      h.status = 'degraded';
    } else {
      h.status = 'unhealthy';
    }
    h.history.push(h.status);
    h.updated = Date.now();
    return true;
  }

  isHealthy(id: string): boolean {
    return this.checks.get(id)?.status === 'healthy';
  }

  isDegraded(id: string): boolean {
    return this.checks.get(id)?.status === 'degraded';
  }

  isUnhealthy(id: string): boolean {
    return this.checks.get(id)?.status === 'unhealthy';
  }

  getStats(): HC2Stats {
    const all = Array.from(this.checks.values());
    const healthy = all.filter(h => h.status === 'healthy').length;
    return {
      checks: all.length,
      healthy,
      degraded: all.filter(h => h.status === 'degraded').length,
      unhealthy: all.filter(h => h.status === 'unhealthy').length,
      totalChecks: all.reduce((s, h) => s + h.checks, 0),
      avgValue: all.length > 0 ? Math.round((all.reduce((s, h) => s + h.lastValue, 0) / all.length) * 100) / 100 : 0,
      active: all.filter(h => h.active).length,
      inactive: all.filter(h => !h.active).length,
      healthyRate: all.length > 0 ? Math.round((healthy / all.length) * 100) / 100 : 0,
    };
  }

  getCheck(id: string): HealthCheck | undefined {
    return this.checks.get(id);
  }

  getAllChecks(): HealthCheck[] {
    return Array.from(this.checks.values());
  }

  removeCheck(id: string): boolean {
    return this.checks.delete(id);
  }

  hasCheck(id: string): boolean {
    return this.checks.has(id);
  }

  getCount(): number {
    return this.checks.size;
  }

  getNode(id: string): string | undefined {
    return this.checks.get(id)?.node;
  }

  getStatus(id: string): HealthStatus | undefined {
    return this.checks.get(id)?.status;
  }

  getThreshold(id: string): number {
    return this.checks.get(id)?.threshold ?? 0;
  }

  getLastValue(id: string): number {
    return this.checks.get(id)?.lastValue ?? 0;
  }

  getCheckCount(id: string): number {
    return this.checks.get(id)?.checks ?? 0;
  }

  getHistory(id: string): HealthStatus[] {
    return [...(this.checks.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.checks.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const h = this.checks.get(id);
    if (!h) return false;
    h.active = active;
    h.updated = Date.now();
    return true;
  }

  setThreshold(id: string, threshold: number): boolean {
    const h = this.checks.get(id);
    if (!h) return false;
    h.threshold = threshold;
    // Recompute status
    if (h.lastValue >= threshold) h.status = 'healthy';
    else if (h.lastValue >= threshold * 0.5) h.status = 'degraded';
    else h.status = 'unhealthy';
    h.updated = Date.now();
    return true;
  }

  resetChecks(id: string): boolean {
    const h = this.checks.get(id);
    if (!h) return false;
    h.checks = 0;
    h.history = [h.status];
    h.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const h of this.checks.values()) {
      h.checks = 0;
      h.history = [h.status];
      h.active = true;
    }
  }

  getByNode(node: string): HealthCheck[] {
    return Array.from(this.checks.values()).filter(h => h.node === node);
  }

  getByStatus(status: HealthStatus): HealthCheck[] {
    return Array.from(this.checks.values()).filter(h => h.status === status);
  }

  getHealthyChecks(): HealthCheck[] {
    return this.getByStatus('healthy');
  }

  getDegradedChecks(): HealthCheck[] {
    return this.getByStatus('degraded');
  }

  getUnhealthyChecks(): HealthCheck[] {
    return this.getByStatus('unhealthy');
  }

  getActiveChecks(): HealthCheck[] {
    return Array.from(this.checks.values()).filter(h => h.active);
  }

  getInactiveChecks(): HealthCheck[] {
    return Array.from(this.checks.values()).filter(h => !h.active);
  }

  getAllNodes(): string[] {
    return [...new Set(Array.from(this.checks.values()).map(h => h.node))];
  }

  getNodeCount(): number {
    return this.getAllNodes().length;
  }

  getByMinChecks(min: number): HealthCheck[] {
    return Array.from(this.checks.values()).filter(h => h.checks >= min);
  }

  getMostChecks(): HealthCheck | null {
    const all = Array.from(this.checks.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.checks > max.checks ? h : max);
  }

  getNewest(): HealthCheck | null {
    const all = Array.from(this.checks.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.created > max.created ? h : max);
  }

  getOldest(): HealthCheck | null {
    const all = Array.from(this.checks.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.created < min.created ? h : min);
  }

  getCreatedAt(id: string): number {
    return this.checks.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.checks.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.checks.clear();
    this.counter = 0;
  }
}

export default HealthCheckV2;