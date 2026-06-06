/**
 * Tag Engine
 * chatdev-design Tag Engine - Tag + Untag + GetByItem + Stats
 */

export interface Tag {
  id: string;
  itemId: string;
  name: string;
  count: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface TgeStats {
  tags: number;
  totalTags: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueItems: number;
  avgCount: number;
  maxCount: number;
  minCount: number;
  avgNameLength: number;
  maxNameLength: number;
  minNameLength: number;
}

export class TagEngine {
  private tags: Map<string, Tag> = new Map();
  private counter = 0;
  private totalTags = 0;

  tag(itemId: string, name: string): string {
    const id = `tge-${++this.counter}`;
    this.tags.set(id, {
      id,
      itemId,
      name,
      count: 1,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    this.totalTags++;
    return id;
  }

  untag(id: string): boolean {
    return this.tags.delete(id);
  }

  increment(id: string): boolean {
    const t = this.tags.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.count++;
    t.updated = Date.now();
    t.hits++;
    return true;
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.tags.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const t = this.tags.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.tags.values()) {
      t.count = 1;
      t.hits = 0;
      t.active = true;
    }
    this.totalTags = 0;
  }

  getStats(): TgeStats {
    const all = Array.from(this.tags.values());
    const countValues = all.map(t => t.count);
    const nameLengths = all.map(t => t.name.length);
    return {
      tags: all.length,
      totalTags: this.totalTags,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      uniqueItems: new Set(all.map(t => t.itemId)).size,
      avgCount: all.length > 0 ? Math.round((countValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxCount: countValues.length > 0 ? Math.max(...countValues) : 0,
      minCount: countValues.length > 0 ? Math.min(...countValues) : 0,
      avgNameLength: all.length > 0 ? Math.round((nameLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxNameLength: nameLengths.length > 0 ? Math.max(...nameLengths) : 0,
      minNameLength: nameLengths.length > 0 ? Math.min(...nameLengths) : 0,
    };
  }

  getTag(id: string): Tag | undefined {
    return this.tags.get(id);
  }

  getAllTags(): Tag[] {
    return Array.from(this.tags.values());
  }

  hasTag(id: string): boolean {
    return this.tags.has(id);
  }

  getCount(): number {
    return this.tags.size;
  }

  getItemId(id: string): string | undefined {
    return this.tags.get(id)?.itemId;
  }

  getName(id: string): string | undefined {
    return this.tags.get(id)?.name;
  }

  getNameLength(id: string): number {
    return this.tags.get(id)?.name.length ?? 0;
  }

  getCount_(id: string): number {
    return this.tags.get(id)?.count ?? 0;
  }

  getHits(id: string): number {
    return this.tags.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.tags.get(id)?.active ?? false;
  }

  getByItem(itemId: string): Tag[] {
    return Array.from(this.tags.values()).filter(t => t.itemId === itemId);
  }

  getByName(name: string): Tag[] {
    return Array.from(this.tags.values()).filter(t => t.name === name);
  }

  getActiveTags(): Tag[] {
    return Array.from(this.tags.values()).filter(t => t.active);
  }

  getInactiveTags(): Tag[] {
    return Array.from(this.tags.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.tags.values()).map(t => t.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllItems(): string[] {
    return [...new Set(Array.from(this.tags.values()).map(t => t.itemId))];
  }

  getItemCount(): number {
    return this.getAllItems().length;
  }

  getByMinCount(min: number): Tag[] {
    return Array.from(this.tags.values()).filter(t => t.count >= min);
  }

  getMostCounted(): Tag | null {
    const all = Array.from(this.tags.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.count > max.count ? t : max);
  }

  getNewest(): Tag | null {
    const all = Array.from(this.tags.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Tag | null {
    const all = Array.from(this.tags.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.tags.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.tags.get(id)?.updated ?? 0;
  }

  getTotalTags(): number {
    return this.totalTags;
  }

  clearAll(): void {
    this.tags.clear();
    this.counter = 0;
    this.totalTags = 0;
  }
}

export default TagEngine;