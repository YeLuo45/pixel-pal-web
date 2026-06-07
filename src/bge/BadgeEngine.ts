/**
 * Badge Engine
 * chatdev-design Badge Engine - Define + Award + Revoke + Stats
 */

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Badge {
  id: string;
  name: string;
  tier: BadgeTier;
  awarded: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface BgeStats {
  badges: number;
  totalAdded: number;
  totalAwarded: number;
  totalRevoked: number;
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
  diamond: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalAwarded: number;
  maxAwarded: number;
  avgAwarded: number;
}

export class BadgeEngine {
  private badges: Map<string, Badge> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalAwarded = 0;
  private totalRevoked = 0;

  define(name: string, tier: BadgeTier): string {
    const id = `bge-${++this.counter}`;
    this.badges.set(id, {
      id,
      name,
      tier,
      awarded: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  award(id: string): boolean {
    const b = this.badges.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.awarded++;
    b.updated = Date.now();
    b.hits++;
    this.totalAwarded++;
    return true;
  }

  revoke(id: string): boolean {
    const b = this.badges.get(id);
    if (!b) return false;
    if (b.awarded <= 0) return false;
    b.awarded--;
    b.updated = Date.now();
    b.hits++;
    this.totalRevoked++;
    return true;
  }

  remove(id: string): boolean {
    return this.badges.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.badges.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const b = this.badges.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  setTier(id: string, tier: BadgeTier): boolean {
    const b = this.badges.get(id);
    if (!b) return false;
    b.tier = tier;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.badges.values()) {
      b.awarded = 0;
      b.active = true;
      b.hits = 0;
    }
    this.totalAdded = 0;
    this.totalAwarded = 0;
    this.totalRevoked = 0;
  }

  getStats(): BgeStats {
    const all = Array.from(this.badges.values());
    const aArr = all.map(b => b.awarded);
    return {
      badges: all.length,
      totalAdded: this.totalAdded,
      totalAwarded: this.totalAwarded,
      totalRevoked: this.totalRevoked,
      bronze: all.filter(b => b.tier === 'bronze').length,
      silver: all.filter(b => b.tier === 'silver').length,
      gold: all.filter(b => b.tier === 'gold').length,
      platinum: all.filter(b => b.tier === 'platinum').length,
      diamond: all.filter(b => b.tier === 'diamond').length,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueNames: new Set(all.map(b => b.name)).size,
      totalAwarded: all.reduce((s, b) => s + b.awarded, 0),
      maxAwarded: aArr.length > 0 ? Math.max(...aArr) : 0,
      avgAwarded: all.length > 0 ? Math.round((aArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getBadge(id: string): Badge | undefined {
    return this.badges.get(id);
  }

  getAllBadges(): Badge[] {
    return Array.from(this.badges.values());
  }

  hasBadge(id: string): boolean {
    return this.badges.has(id);
  }

  getCount(): number {
    return this.badges.size;
  }

  getName(id: string): string | undefined {
    return this.badges.get(id)?.name;
  }

  getTier(id: string): BadgeTier | undefined {
    return this.badges.get(id)?.tier;
  }

  getAwarded(id: string): number {
    return this.badges.get(id)?.awarded ?? 0;
  }

  getHits(id: string): number {
    return this.badges.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.badges.get(id)?.active ?? false;
  }

  isBronze(id: string): boolean {
    return this.badges.get(id)?.tier === 'bronze';
  }

  isSilver(id: string): boolean {
    return this.badges.get(id)?.tier === 'silver';
  }

  isGold(id: string): boolean {
    return this.badges.get(id)?.tier === 'gold';
  }

  isPlatinum(id: string): boolean {
    return this.badges.get(id)?.tier === 'platinum';
  }

  isDiamond(id: string): boolean {
    return this.badges.get(id)?.tier === 'diamond';
  }

  getByTier(tier: BadgeTier): Badge[] {
    return Array.from(this.badges.values()).filter(b => b.tier === tier);
  }

  getActiveBadges(): Badge[] {
    return Array.from(this.badges.values()).filter(b => b.active);
  }

  getInactiveBadges(): Badge[] {
    return Array.from(this.badges.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.badges.values()).map(b => b.name))];
  }

  getNewest(): Badge | null {
    const all = Array.from(this.badges.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Badge | null {
    const all = Array.from(this.badges.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.badges.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.badges.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalAwarded(): number {
    return this.totalAwarded;
  }

  getTotalRevoked(): number {
    return this.totalRevoked;
  }

  clearAll(): void {
    this.badges.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalAwarded = 0;
    this.totalRevoked = 0;
  }
}

export default BadgeEngine;