/**
 * Heartbeat Engine
 * nanobot-design Heartbeat Engine - AddNode + Heartbeat + Stats
 */

export type HeartbeatState = 'alive' | 'suspect' | 'dead';

export interface HeartbeatNode {
  id: string;
  name: string;
  state: HeartbeatState;
  interval: number;
  lastBeat: number;
  missedBeats: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface HbeStats {
  nodes: number;
  totalAdded: number;
  totalHeartbeats: number;
  totalMissed: number;
  alive: number;
  suspect: number;
  dead: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalMissed: number;
  avgMissed: number;
  maxMissed: number;
}

export class HeartbeatEngine {
  private nodes: Map<string, HeartbeatNode> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalHeartbeats = 0;

  addNode(name: string, interval: number): string {
    const id = `hbe-${++this.counter}`;
    this.nodes.set(id, {
      id,
      name,
      state: 'alive',
      interval,
      lastBeat: Date.now(),
      missedBeats: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  heartbeat(id: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (!n.active) return false;
    n.lastBeat = Date.now();
    n.missedBeats = 0;
    n.state = 'alive';
    n.updated = Date.now();
    n.hits++;
    this.totalHeartbeats++;
    return true;
  }

  checkMissed(id: string, maxMissed: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    const elapsed = Date.now() - n.lastBeat;
    const expectedMissed = Math.floor(elapsed / n.interval);
    if (expectedMissed > n.missedBeats) {
      n.missedBeats = expectedMissed;
      n.updated = Date.now();
      if (expectedMissed >= maxMissed) {
        n.state = 'dead';
        return true;
      } else {
        n.state = 'suspect';
      }
    }
    return false;
  }

  remove(id: string): boolean {
    return this.nodes.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.name = name;
    n.updated = Date.now();
    return true;
  }

  setInterval(id: string, interval: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.interval = interval;
    n.updated = Date.now();
    return true;
  }

  setState(id: string, state: HeartbeatState): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.state = state;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.state = 'alive';
      n.missedBeats = 0;
      n.active = true;
      n.hits = 0;
    }
    this.totalAdded = 0;
    this.totalHeartbeats = 0;
  }

  getStats(): HbeStats {
    const all = Array.from(this.nodes.values());
    const mArr = all.map(n => n.missedBeats);
    return {
      nodes: all.length,
      totalAdded: this.totalAdded,
      totalHeartbeats: this.totalHeartbeats,
      totalMissed: all.reduce((s, n) => s + n.missedBeats, 0),
      alive: all.filter(n => n.state === 'alive').length,
      suspect: all.filter(n => n.state === 'suspect').length,
      dead: all.filter(n => n.state === 'dead').length,
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      uniqueNames: new Set(all.map(n => n.name)).size,
      avgMissed: all.length > 0 ? Math.round((mArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxMissed: mArr.length > 0 ? Math.max(...mArr) : 0,
    };
  }

  getNode(id: string): HeartbeatNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): HeartbeatNode[] {
    return Array.from(this.nodes.values());
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getCount(): number {
    return this.nodes.size;
  }

  getName(id: string): string | undefined {
    return this.nodes.get(id)?.name;
  }

  getInterval(id: string): number {
    return this.nodes.get(id)?.interval ?? 0;
  }

  getState(id: string): HeartbeatState | undefined {
    return this.nodes.get(id)?.state;
  }

  getLastBeat(id: string): number {
    return this.nodes.get(id)?.lastBeat ?? 0;
  }

  getMissedBeats(id: string): number {
    return this.nodes.get(id)?.missedBeats ?? 0;
  }

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.nodes.get(id)?.active ?? false;
  }

  isAlive(id: string): boolean {
    return this.nodes.get(id)?.state === 'alive';
  }

  isSuspect(id: string): boolean {
    return this.nodes.get(id)?.state === 'suspect';
  }

  isDead(id: string): boolean {
    return this.nodes.get(id)?.state === 'dead';
  }

  getByState(state: HeartbeatState): HeartbeatNode[] {
    return Array.from(this.nodes.values()).filter(n => n.state === state);
  }

  getAliveNodes(): HeartbeatNode[] {
    return Array.from(this.nodes.values()).filter(n => n.state === 'alive');
  }

  getSuspectNodes(): HeartbeatNode[] {
    return Array.from(this.nodes.values()).filter(n => n.state === 'suspect');
  }

  getDeadNodes(): HeartbeatNode[] {
    return Array.from(this.nodes.values()).filter(n => n.state === 'dead');
  }

  getActiveNodes(): HeartbeatNode[] {
    return Array.from(this.nodes.values()).filter(n => n.active);
  }

  getInactiveNodes(): HeartbeatNode[] {
    return Array.from(this.nodes.values()).filter(n => !n.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.name))];
  }

  getNewest(): HeartbeatNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): HeartbeatNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((min, n) => n.created < min.created ? n : min);
  }

  getCreatedAt(id: string): number {
    return this.nodes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.nodes.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalHeartbeats(): number {
    return this.totalHeartbeats;
  }

  clearAll(): void {
    this.nodes.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalHeartbeats = 0;
  }
}

export default HeartbeatEngine;