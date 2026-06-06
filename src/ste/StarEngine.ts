/**
 * Star Engine
 * chatdev-design Star Engine - Star + Unstar + GetByItem + Stats
 */

export interface Star {
  id: string;
  itemId: string;
  user: string;
  starred: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface SteStats {
  stars: number;
  starred: number;
  unstarred: number;
  totalStars: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueUsers: number;
  uniqueItems: number;
  uniqueItemUsers: number;
  avgStarsPerItem: number;
  maxStarsPerItem: number;
  minStarsPerItem: number;
  starRate: number;
}

export class StarEngine {
  private stars: Map<string, Star> = new Map();
  private counter = 0;
  private totalStars = 0;

  star(itemId: string, user: string): string {
    const id = `ste-${++this.counter}`;
    this.stars.set(id, {
      id,
      itemId,
      user,
      starred: true,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    this.totalStars++;
    return id;
  }

  unstar(id: string): boolean {
    const s = this.stars.get(id);
    if (!s) return false;
    if (!s.starred) return false;
    s.starred = false;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  restar(id: string): boolean {
    const s = this.stars.get(id);
    if (!s) return false;
    if (s.starred) return false;
    s.starred = true;
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.stars.delete(id);
  }

  resetAll(): void {
    for (const s of this.stars.values()) {
      s.starred = true;
      s.hits = 0;
      s.history = [];
      s.active = true;
    }
    this.totalStars = 0;
  }

  getStats(): SteStats {
    const all = Array.from(this.stars.values());
    const itemCounts = new Map<string, number>();
    for (const s of all) {
      if (s.starred) {
        itemCounts.set(s.itemId, (itemCounts.get(s.itemId) ?? 0) + 1);
      }
    }
    const counts = Array.from(itemCounts.values());
    return {
      stars: all.length,
      starred: all.filter(s => s.starred).length,
      unstarred: all.filter(s => !s.starred).length,
      totalStars: this.totalStars,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueUsers: new Set(all.map(s => s.user)).size,
      uniqueItems: new Set(all.map(s => s.itemId)).size,
      uniqueItemUsers: new Set(all.map(s => `${s.itemId}:${s.user}`)).size,
      avgStarsPerItem: counts.length > 0 ? Math.round((counts.reduce((s, v) => s + v, 0) / counts.length) * 100) / 100 : 0,
      maxStarsPerItem: counts.length > 0 ? Math.max(...counts) : 0,
      minStarsPerItem: counts.length > 0 ? Math.min(...counts) : 0,
      starRate: all.length > 0 ? Math.round((all.filter(s => s.starred).length / all.length) * 100) / 100 : 0,
    };
  }

  getStar(id: string): Star | undefined {
    return this.stars.get(id);
  }

  getAllStars(): Star[] {
    return Array.from(this.stars.values());
  }

  hasStar(id: string): boolean {
    return this.stars.has(id);
  }

  getCount(): number {
    return this.stars.size;
  }

  getItemId(id: string): string | undefined {
    return this.stars.get(id)?.itemId;
  }

  getUser(id: string): string | undefined {
    return this.stars.get(id)?.user;
  }

  getHistory(id: string): number[] {
    return [...(this.stars.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.stars.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.stars.get(id)?.active ?? false;
  }

  isStarred(id: string): boolean {
    return this.stars.get(id)?.starred ?? false;
  }

  isUnstarred(id: string): boolean {
    const s = this.stars.get(id);
    return s ? !s.starred : false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.stars.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  getByItem(itemId: string): Star[] {
    return Array.from(this.stars.values()).filter(s => s.itemId === itemId);
  }

  getByUser(user: string): Star[] {
    return Array.from(this.stars.values()).filter(s => s.user === user);
  }

  getStarredStars(): Star[] {
    return Array.from(this.stars.values()).filter(s => s.starred);
  }

  getUnstarredStars(): Star[] {
    return Array.from(this.stars.values()).filter(s => !s.starred);
  }

  getActiveStars(): Star[] {
    return Array.from(this.stars.values()).filter(s => s.active);
  }

  getInactiveStars(): Star[] {
    return Array.from(this.stars.values()).filter(s => !s.active);
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.stars.values()).map(s => s.user))];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
  }

  getAllItems(): string[] {
    return [...new Set(Array.from(this.stars.values()).map(s => s.itemId))];
  }

  getItemCount(): number {
    return this.getAllItems().length;
  }

  getByMinStars(min: number): Star[] {
    return Array.from(this.stars.values()).filter(s => s.starred).filter((s, _, arr) => {
      const itemStars = arr.filter(x => x.itemId === s.itemId).length;
      return itemStars >= min;
    });
  }

  getNewest(): Star | null {
    const all = Array.from(this.stars.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Star | null {
    const all = Array.from(this.stars.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.stars.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.stars.get(id)?.updated ?? 0;
  }

  getTotalStars(): number {
    return this.totalStars;
  }

  clearAll(): void {
    this.stars.clear();
    this.counter = 0;
    this.totalStars = 0;
  }
}

export default StarEngine;