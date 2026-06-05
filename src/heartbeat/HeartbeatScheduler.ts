/**
 * Heartbeat Scheduler
 * nanobot-design Heartbeat Scheduler - Register + Detect + Cleanup + Stats
 */

export type HeartbeatStatus = 'alive' | 'slow' | 'dead';

export interface Heartbeat {
  nodeId: string;
  timestamp: number;
  status: HeartbeatStatus;
  count: number;
}

export interface HeartbeatStats {
  total: number;
  alive: number;
  slow: number;
  dead: number;
}

export class HeartbeatScheduler {
  private heartbeats: Map<string, Heartbeat> = new Map();

  register(nodeId: string): void {
    if (!this.heartbeats.has(nodeId)) {
      this.heartbeats.set(nodeId, {
        nodeId,
        timestamp: Date.now(),
        status: 'alive',
        count: 0,
      });
    }
  }

  heartbeat(nodeId: string): boolean {
    const hb = this.heartbeats.get(nodeId);
    if (!hb) return false;
    hb.timestamp = Date.now();
    hb.count++;
    hb.status = 'alive';
    return true;
  }

  detect(nodeId: string, threshold: number): Heartbeat | null {
    const hb = this.heartbeats.get(nodeId);
    if (!hb) return null;
    const elapsed = Date.now() - hb.timestamp;
    if (elapsed < threshold) hb.status = 'alive';
    else if (elapsed < threshold * 2) hb.status = 'slow';
    else hb.status = 'dead';
    return { ...hb };
  }

  cleanup(threshold: number): string[] {
    const removed: string[] = [];
    for (const [nodeId, hb] of this.heartbeats.entries()) {
      if (Date.now() - hb.timestamp > threshold * 2) {
        this.heartbeats.delete(nodeId);
        removed.push(nodeId);
      }
    }
    return removed;
  }

  getStats(): HeartbeatStats {
    const all = Array.from(this.heartbeats.values());
    return {
      total: all.length,
      alive: all.filter(h => h.status === 'alive').length,
      slow: all.filter(h => h.status === 'slow').length,
      dead: all.filter(h => h.status === 'dead').length,
    };
  }

  getHeartbeat(nodeId: string): Heartbeat | undefined {
    return this.heartbeats.get(nodeId);
  }

  getAllHeartbeats(): Heartbeat[] {
    return Array.from(this.heartbeats.values());
  }

  removeHeartbeat(nodeId: string): boolean {
    return this.heartbeats.delete(nodeId);
  }

  hasHeartbeat(nodeId: string): boolean {
    return this.heartbeats.has(nodeId);
  }

  getCount(): number {
    return this.heartbeats.size;
  }

  getTimestamp(nodeId: string): number {
    return this.heartbeats.get(nodeId)?.timestamp ?? 0;
  }

  getStatus(nodeId: string): HeartbeatStatus | null {
    return this.heartbeats.get(nodeId)?.status ?? null;
  }

  getCount2(nodeId: string): number {
    return this.heartbeats.get(nodeId)?.count ?? 0;
  }

  getByStatus(status: HeartbeatStatus): Heartbeat[] {
    return Array.from(this.heartbeats.values()).filter(h => h.status === status);
  }

  getAlive(): Heartbeat[] {
    return this.getByStatus('alive');
  }

  getSlow(): Heartbeat[] {
    return this.getByStatus('slow');
  }

  getDead(): Heartbeat[] {
    return this.getByStatus('dead');
  }

  isAlive(nodeId: string): boolean {
    return this.heartbeats.get(nodeId)?.status === 'alive';
  }

  isSlow(nodeId: string): boolean {
    return this.heartbeats.get(nodeId)?.status === 'slow';
  }

  isDead(nodeId: string): boolean {
    return this.heartbeats.get(nodeId)?.status === 'dead';
  }

  getElapsed(nodeId: string): number {
    const hb = this.heartbeats.get(nodeId);
    if (!hb) return -1;
    return Date.now() - hb.timestamp;
  }

  isStale(nodeId: string, threshold: number): boolean {
    const elapsed = this.getElapsed(nodeId);
    return elapsed > threshold;
  }

  getStaleNodes(threshold: number): string[] {
    return Array.from(this.heartbeats.keys()).filter(id => this.isStale(id, threshold));
  }

  getActiveCount(): number {
    return this.getAlive().length;
  }

  getInactiveCount(): number {
    return this.getSlow().length + this.getDead().length;
  }

  clearAll(): void {
    this.heartbeats.clear();
  }
}

export default HeartbeatScheduler;