/**
 * Lease Engine
 * nanobot-design Lease Engine - Lease + Renew + Release + Stats
 */

export type LeaseState = 'available' | 'leased' | 'expired' | 'revoked';

export interface LeaseEntry {
  id: string;
  resource: string;
  holder: string;
  duration: number;
  expiresAt: number;
  state: LeaseState;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface LeeStats {
  leases: number;
  totalAdded: number;
  totalRenewed: number;
  totalReleased: number;
  available: number;
  leased: number;
  expired: number;
  revoked: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueHolders: number;
  uniqueResources: number;
  totalDuration: number;
  avgDuration: number;
  expiredLeases: number;
}

export class LeaseEngine {
  private leases: Map<string, LeaseEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalRenewed = 0;
  private totalReleased = 0;
  private totalDuration = 0;
  private totalExpired = 0;

  add(resource: string, holder: string, duration: number): string {
    const id = `lee-${++this.counter}`;
    this.leases.set(id, {
      id,
      resource,
      holder,
      duration,
      expiresAt: Date.now() + duration,
      state: 'leased',
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalDuration += duration;
    return id;
  }

  renew(id: string, extraDuration: number): boolean {
    const l = this.leases.get(id);
    if (!l) return false;
    if (!l.active) return false;
    if (l.state !== 'leased') return false;
    if (Date.now() > l.expiresAt) {
      l.state = 'expired';
      this.totalExpired++;
      return false;
    }
    l.duration += extraDuration;
    l.expiresAt += extraDuration;
    l.updated = Date.now();
    l.hits++;
    this.totalRenewed++;
    return true;
  }

  release(id: string): boolean {
    const l = this.leases.get(id);
    if (!l) return false;
    l.state = 'revoked';
    l.updated = Date.now();
    l.hits++;
    this.totalReleased++;
    return true;
  }

  remove(id: string): boolean {
    return this.leases.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const l = this.leases.get(id);
    if (!l) return false;
    l.active = active;
    l.updated = Date.now();
    return true;
  }

  setResource(id: string, resource: string): boolean {
    const l = this.leases.get(id);
    if (!l) return false;
    l.resource = resource;
    l.updated = Date.now();
    return true;
  }

  setHolder(id: string, holder: string): boolean {
    const l = this.leases.get(id);
    if (!l) return false;
    l.holder = holder;
    l.updated = Date.now();
    return true;
  }

  setDuration(id: string, duration: number): boolean {
    const l = this.leases.get(id);
    if (!l) return false;
    l.duration = duration;
    l.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const l of this.leases.values()) {
      l.state = 'leased';
      l.active = true;
      l.hits = 0;
      l.expiresAt = Date.now() + l.duration;
    }
    this.totalAdded = 0;
    this.totalRenewed = 0;
    this.totalReleased = 0;
    this.totalDuration = 0;
    this.totalExpired = 0;
  }

  getStats(): LeeStats {
    const all = Array.from(this.leases.values());
    const now = Date.now();
    let currentExpired = this.totalExpired;
    for (const l of all) {
      if (l.state === 'leased' && now > l.expiresAt) {
        l.state = 'expired';
        currentExpired++;
      }
    }
    return {
      leases: all.length,
      totalAdded: this.totalAdded,
      totalRenewed: this.totalRenewed,
      totalReleased: this.totalReleased,
      available: all.filter(l => l.state === 'available').length,
      leased: all.filter(l => l.state === 'leased').length,
      expired: all.filter(l => l.state === 'expired').length,
      revoked: all.filter(l => l.state === 'revoked').length,
      active: all.filter(l => l.active).length,
      inactive: all.filter(l => !l.active).length,
      totalHits: all.reduce((s, l) => s + l.hits, 0),
      uniqueHolders: new Set(all.map(l => l.holder)).size,
      uniqueResources: new Set(all.map(l => l.resource)).size,
      totalDuration: this.totalDuration,
      avgDuration: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.duration, 0) / all.length) * 100) / 100 : 0,
      expiredLeases: currentExpired,
    };
  }

  getLease(id: string): LeaseEntry | undefined {
    return this.leases.get(id);
  }

  getAllLeases(): LeaseEntry[] {
    return Array.from(this.leases.values());
  }

  hasLease(id: string): boolean {
    return this.leases.has(id);
  }

  getCount(): number {
    return this.leases.size;
  }

  getResource(id: string): string | undefined {
    return this.leases.get(id)?.resource;
  }

  getHolder(id: string): string | undefined {
    return this.leases.get(id)?.holder;
  }

  getDuration(id: string): number {
    return this.leases.get(id)?.duration ?? 0;
  }

  getExpiresAt(id: string): number {
    return this.leases.get(id)?.expiresAt ?? 0;
  }

  getState(id: string): LeaseState | undefined {
    return this.leases.get(id)?.state;
  }

  getHits(id: string): number {
    return this.leases.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.leases.get(id)?.active ?? false;
  }

  isAvailable(id: string): boolean {
    return this.leases.get(id)?.state === 'available';
  }

  isLeased(id: string): boolean {
    return this.leases.get(id)?.state === 'leased';
  }

  isExpired(id: string): boolean {
    const l = this.leases.get(id);
    if (!l) return false;
    if (l.state === 'leased' && Date.now() > l.expiresAt) {
      l.state = 'expired';
      return true;
    }
    return l.state === 'expired';
  }

  isRevoked(id: string): boolean {
    return this.leases.get(id)?.state === 'revoked';
  }

  getByState(state: LeaseState): LeaseEntry[] {
    return Array.from(this.leases.values()).filter(l => l.state === state);
  }

  getActiveLeases(): LeaseEntry[] {
    return Array.from(this.leases.values()).filter(l => l.active);
  }

  getInactiveLeases(): LeaseEntry[] {
    return Array.from(this.leases.values()).filter(l => !l.active);
  }

  getAllHolders(): string[] {
    return [...new Set(Array.from(this.leases.values()).map(l => l.holder))];
  }

  getAllResources(): string[] {
    return [...new Set(Array.from(this.leases.values()).map(l => l.resource))];
  }

  getNewest(): LeaseEntry | null {
    const all = Array.from(this.leases.values());
    if (all.length === 0) return null;
    return all.reduce((max, l) => l.created > max.created ? l : max);
  }

  getOldest(): LeaseEntry | null {
    const all = Array.from(this.leases.values());
    if (all.length === 0) return null;
    return all.reduce((min, l) => l.created < min.created ? l : min);
  }

  getCreatedAt(id: string): number {
    return this.leases.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.leases.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalRenewed(): number {
    return this.totalRenewed;
  }

  getTotalReleased(): number {
    return this.totalReleased;
  }

  clearAll(): void {
    this.leases.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalRenewed = 0;
    this.totalReleased = 0;
    this.totalDuration = 0;
    this.totalExpired = 0;
  }
}

export default LeaseEngine;