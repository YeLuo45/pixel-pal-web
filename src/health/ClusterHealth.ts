/**
 * Cluster Health
 * nanobot-design Cluster Health - Check + Alert + Stats
 */

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface NodeHealth {
  id: string;
  nodeId: string;
  status: HealthStatus;
  score: number;
  alerts: number;
  created: number;
  updated: number;
  hits: number;
}

export interface HealthStats {
  nodes: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  avgScore: number;
  totalAlerts: number;
  totalChecks: number;
}

export class ClusterHealth {
  private healths: Map<string, NodeHealth> = new Map();
  private counter = 0;
  private totalChecks = 0;

  static inferStatus(score: number): HealthStatus {
    if (score >= 80) return 'healthy';
    if (score >= 50) return 'degraded';
    return 'unhealthy';
  }

  check(nodeId: string, score: number): string {
    const id = `ch-${++this.counter}`;
    this.healths.set(id, {
      id,
      nodeId,
      status: ClusterHealth.inferStatus(score),
      score,
      alerts: 0,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalChecks++;
    return id;
  }

  alert(id: string): boolean {
    const h = this.healths.get(id);
    if (!h) return false;
    h.alerts++;
    h.updated = Date.now();
    return true;
  }

  getStats(): HealthStats {
    const all = Array.from(this.healths.values());
    return {
      nodes: all.length,
      healthy: all.filter(h => h.status === 'healthy').length,
      degraded: all.filter(h => h.status === 'degraded').length,
      unhealthy: all.filter(h => h.status === 'unhealthy').length,
      avgScore: all.length > 0 ? Math.round((all.reduce((s, h) => s + h.score, 0) / all.length) * 100) / 100 : 0,
      totalAlerts: all.reduce((s, h) => s + h.alerts, 0),
      totalChecks: this.totalChecks,
    };
  }

  getHealth(id: string): NodeHealth | undefined {
    return this.healths.get(id);
  }

  getAllHealths(): NodeHealth[] {
    return Array.from(this.healths.values());
  }

  removeHealth(id: string): boolean {
    return this.healths.delete(id);
  }

  hasHealth(id: string): boolean {
    return this.healths.has(id);
  }

  getCount(): number {
    return this.healths.size;
  }

  getNodeId(id: string): string | undefined {
    return this.healths.get(id)?.nodeId;
  }

  getStatus(id: string): HealthStatus | undefined {
    return this.healths.get(id)?.status;
  }

  getScore(id: string): number {
    return this.healths.get(id)?.score ?? 0;
  }

  getAlerts(id: string): number {
    return this.healths.get(id)?.alerts ?? 0;
  }

  getHits(id: string): number {
    return this.healths.get(id)?.hits ?? 0;
  }

  isHealthy(id: string): boolean {
    return this.healths.get(id)?.status === 'healthy';
  }

  isDegraded(id: string): boolean {
    return this.healths.get(id)?.status === 'degraded';
  }

  isUnhealthy(id: string): boolean {
    return this.healths.get(id)?.status === 'unhealthy';
  }

  setStatus(id: string, status: HealthStatus): boolean {
    const h = this.healths.get(id);
    if (!h) return false;
    h.status = status;
    h.updated = Date.now();
    return true;
  }

  setScore(id: string, score: number): boolean {
    const h = this.healths.get(id);
    if (!h) return false;
    h.score = score;
    h.status = ClusterHealth.inferStatus(score);
    h.updated = Date.now();
    return true;
  }

  recheck(id: string): boolean {
    const h = this.healths.get(id);
    if (!h) return false;
    h.status = ClusterHealth.inferStatus(h.score);
    h.updated = Date.now();
    return true;
  }

  recheckAll(): number {
    let count = 0;
    for (const h of this.healths.values()) {
      h.status = ClusterHealth.inferStatus(h.score);
      count++;
    }
    return count;
  }

  incrementHits(id: string): boolean {
    const h = this.healths.get(id);
    if (!h) return false;
    h.hits++;
    return true;
  }

  resetHits(): void {
    for (const h of this.healths.values()) h.hits = 0;
  }

  resetAlerts(): void {
    for (const h of this.healths.values()) h.alerts = 0;
  }

  resetAll(): void {
    for (const h of this.healths.values()) {
      h.hits = 0;
      h.alerts = 0;
    }
  }

  getByNodeId(nodeId: string): NodeHealth[] {
    return Array.from(this.healths.values()).filter(h => h.nodeId === nodeId);
  }

  getByStatus(status: HealthStatus): NodeHealth[] {
    return Array.from(this.healths.values()).filter(h => h.status === status);
  }

  getHealthyNodes(): NodeHealth[] {
    return this.getByStatus('healthy');
  }

  getDegradedNodes(): NodeHealth[] {
    return this.getByStatus('degraded');
  }

  getUnhealthyNodes(): NodeHealth[] {
    return this.getByStatus('unhealthy');
  }

  getAllNodeIds(): string[] {
    return [...new Set(Array.from(this.healths.values()).map(h => h.nodeId))];
  }

  getNodeIdCount(): number {
    return this.getAllNodeIds().length;
  }

  getTotalChecks(): number {
    return this.totalChecks;
  }

  resetTotalChecks(): void {
    this.totalChecks = 0;
  }

  getMostAlerts(): NodeHealth | null {
    const all = Array.from(this.healths.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.alerts > max.alerts ? h : max);
  }

  getHighestScore(): NodeHealth | null {
    const all = Array.from(this.healths.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.score > max.score ? h : max);
  }

  getLowestScore(): NodeHealth | null {
    const all = Array.from(this.healths.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.score < min.score ? h : min);
  }

  getNewest(): NodeHealth | null {
    const all = Array.from(this.healths.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.created > max.created ? h : max);
  }

  getOldest(): NodeHealth | null {
    const all = Array.from(this.healths.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.created < min.created ? h : min);
  }

  getCreatedAt(id: string): number {
    return this.healths.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.healths.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.healths.clear();
    this.counter = 0;
    this.totalChecks = 0;
  }
}

export default ClusterHealth;