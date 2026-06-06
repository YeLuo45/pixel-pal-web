/**
 * Presence Engine
 * chatdev-design Presence Engine - Join + Leave + Heartbeat + Stats
 */

export type PresenceStatus = 'online' | 'away' | 'offline';

export interface Presence {
  id: string;
  user: string;
  status: PresenceStatus;
  lastSeen: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PreStats {
  presences: number;
  totalJoins: number;
  totalLeaves: number;
  totalHeartbeats: number;
  online: number;
  away: number;
  offline: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueUsers: number;
}

export class PresenceEngine {
  private presences: Map<string, Presence> = new Map();
  private counter = 0;
  private totalJoins = 0;
  private totalLeaves = 0;
  private totalHeartbeats = 0;

  join(user: string): string {
    const id = `pre-${++this.counter}`;
    this.presences.set(id, {
      id,
      user,
      status: 'online',
      lastSeen: Date.now(),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalJoins++;
    return id;
  }

  heartbeat(id: string): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.lastSeen = Date.now();
    p.updated = Date.now();
    p.hits++;
    this.totalHeartbeats++;
    return true;
  }

  setAway(id: string): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    p.status = 'away';
    p.updated = Date.now();
    p.hits++;
    return true;
  }

  setOnline(id: string): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    p.status = 'online';
    p.lastSeen = Date.now();
    p.updated = Date.now();
    p.hits++;
    return true;
  }

  leave(id: string): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    p.status = 'offline';
    p.updated = Date.now();
    p.hits++;
    this.totalLeaves++;
    return true;
  }

  remove(id: string): boolean {
    return this.presences.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  isStale(id: string, threshold: number = 60000): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    return Date.now() - p.lastSeen > threshold;
  }

  resetAll(): void {
    for (const p of this.presences.values()) {
      p.status = 'online';
      p.lastSeen = Date.now();
      p.active = true;
      p.hits = 0;
    }
    this.totalJoins = 0;
    this.totalLeaves = 0;
    this.totalHeartbeats = 0;
  }

  getStats(): PreStats {
    const all = Array.from(this.presences.values());
    return {
      presences: all.length,
      totalJoins: this.totalJoins,
      totalLeaves: this.totalLeaves,
      totalHeartbeats: this.totalHeartbeats,
      online: all.filter(p => p.status === 'online').length,
      away: all.filter(p => p.status === 'away').length,
      offline: all.filter(p => p.status === 'offline').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueUsers: new Set(all.map(p => p.user)).size,
    };
  }

  getPresence(id: string): Presence | undefined {
    return this.presences.get(id);
  }

  getAllPresences(): Presence[] {
    return Array.from(this.presences.values());
  }

  hasPresence(id: string): boolean {
    return this.presences.has(id);
  }

  getCount(): number {
    return this.presences.size;
  }

  getUser(id: string): string | undefined {
    return this.presences.get(id)?.user;
  }

  getStatus(id: string): PresenceStatus | undefined {
    return this.presences.get(id)?.status;
  }

  getLastSeen(id: string): number {
    return this.presences.get(id)?.lastSeen ?? 0;
  }

  getHits(id: string): number {
    return this.presences.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.presences.get(id)?.active ?? false;
  }

  isOnline(id: string): boolean {
    return this.presences.get(id)?.status === 'online';
  }

  isAway(id: string): boolean {
    return this.presences.get(id)?.status === 'away';
  }

  isOffline(id: string): boolean {
    return this.presences.get(id)?.status === 'offline';
  }

  getByStatus(status: PresenceStatus): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.status === status);
  }

  getByUser(user: string): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.user === user);
  }

  getActivePresences(): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.active);
  }

  getInactivePresences(): Presence[] {
    return Array.from(this.presences.values()).filter(p => !p.active);
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.presences.values()).map(p => p.user))];
  }

  getNewest(): Presence | null {
    const all = Array.from(this.presences.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Presence | null {
    const all = Array.from(this.presences.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.presences.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.presences.get(id)?.updated ?? 0;
  }

  getTotalJoins(): number {
    return this.totalJoins;
  }

  getTotalLeaves(): number {
    return this.totalLeaves;
  }

  getTotalHeartbeats(): number {
    return this.totalHeartbeats;
  }

  clearAll(): void {
    this.presences.clear();
    this.counter = 0;
    this.totalJoins = 0;
    this.totalLeaves = 0;
    this.totalHeartbeats = 0;
  }
}

export default PresenceEngine;