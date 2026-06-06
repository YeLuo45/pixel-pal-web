/**
 * Presence Engine
 * chatdev-design Presence Engine - Register + SetStatus + Heartbeat + Stats
 */

export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export interface Presence {
  id: string;
  user: string;
  status: PresenceStatus;
  lastSeen: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: PresenceStatus[];
}

export interface PRESStats {
  presences: number;
  online: number;
  offline: number;
  away: number;
  busy: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueUsers: number;
  uniqueStatuses: number;
  avgHeartbeats: number;
  maxHeartbeats: number;
  minHeartbeats: number;
}

export class PresenceEngine {
  private presences: Map<string, Presence> = new Map();
  private counter = 0;
  private totalHeartbeats = 0;

  register(user: string, status: PresenceStatus = 'offline'): string {
    const id = `pr-${++this.counter}`;
    this.presences.set(id, {
      id,
      user,
      status,
      lastSeen: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [status],
    });
    return id;
  }

  setStatus(id: string, status: PresenceStatus): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.status = status;
    p.history.push(status);
    p.updated = Date.now();
    p.hits++;
    return true;
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

  getStats(): PRESStats {
    const all = Array.from(this.presences.values());
    return {
      presences: all.length,
      online: all.filter(p => p.status === 'online').length,
      offline: all.filter(p => p.status === 'offline').length,
      away: all.filter(p => p.status === 'away').length,
      busy: all.filter(p => p.status === 'busy').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueUsers: new Set(all.map(p => p.user)).size,
      uniqueStatuses: new Set(all.map(p => p.status)).size,
      avgHeartbeats: all.length > 0 ? Math.round((all.reduce((s, p) => s + p.lastSeen, 0) / all.length) * 100) / 100 : 0,
      maxHeartbeats: all.length > 0 ? Math.max(...all.map(p => p.lastSeen)) : 0,
      minHeartbeats: all.length > 0 ? Math.min(...all.map(p => p.lastSeen)) : 0,
    };
  }

  getPresence(id: string): Presence | undefined {
    return this.presences.get(id);
  }

  getAllPresences(): Presence[] {
    return Array.from(this.presences.values());
  }

  removePresence(id: string): boolean {
    return this.presences.delete(id);
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

  getHistory(id: string): PresenceStatus[] {
    return [...(this.presences.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.presences.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.presences.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setUser(id: string, user: string): boolean {
    const p = this.presences.get(id);
    if (!p) return false;
    p.user = user;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.presences.values()) {
      p.status = 'offline';
      p.lastSeen = 0;
      p.hits = 0;
      p.history = ['offline'];
      p.active = true;
    }
    this.totalHeartbeats = 0;
  }

  getByUser(user: string): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.user === user);
  }

  getByStatus(status: PresenceStatus): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.status === status);
  }

  getActivePresences(): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.active);
  }

  getInactivePresences(): Presence[] {
    return Array.from(this.presences.values()).filter(p => !p.active);
  }

  getOnlinePresences(): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.status === 'online');
  }

  getOfflinePresences(): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.status === 'offline');
  }

  getAwayPresences(): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.status === 'away');
  }

  getBusyPresences(): Presence[] {
    return Array.from(this.presences.values()).filter(p => p.status === 'busy');
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.presences.values()).map(p => p.user))];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
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

  getTotalHeartbeats(): number {
    return this.totalHeartbeats;
  }

  clearAll(): void {
    this.presences.clear();
    this.counter = 0;
    this.totalHeartbeats = 0;
  }
}

export default PresenceEngine;