/**
 * Feed Engine
 * chatdev-design Feed Engine - Add + Publish + Read + Stats
 */

export type FeedStatus = 'active' | 'paused' | 'archived';

export interface FeedItem {
  id: string;
  title: string;
  body: string;
  status: FeedStatus;
  published: boolean;
  read: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface FdeStats {
  items: number;
  totalAdded: number;
  totalPublished: number;
  totalRead: number;
  active: number;
  paused: number;
  archived: number;
  published: number;
  unpublished: number;
  uniqueActive: number;
  uniqueInactive: number;
  totalHits: number;
  uniqueTitles: number;
  totalBodyLen: number;
  totalTitleLen: number;
  avgBodyLen: number;
  avgTitleLen: number;
}

export class FeedEngine {
  private items: Map<string, FeedItem> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalPublished = 0;
  private totalRead = 0;
  private totalBodyLen = 0;
  private totalTitleLen = 0;

  add(title: string, body: string): string {
    const id = `fde-${++this.counter}`;
    this.items.set(id, {
      id,
      title,
      body,
      status: 'active',
      published: false,
      read: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalBodyLen += body.length;
    this.totalTitleLen += title.length;
    return id;
  }

  publish(id: string): boolean {
    const f = this.items.get(id);
    if (!f) return false;
    if (!f.active) return false;
    f.published = true;
    f.updated = Date.now();
    f.hits++;
    this.totalPublished++;
    return true;
  }

  read(id: string): boolean {
    const f = this.items.get(id);
    if (!f) return false;
    if (!f.active) return false;
    f.read++;
    f.updated = Date.now();
    f.hits++;
    this.totalRead++;
    return true;
  }

  pause(id: string): boolean {
    const f = this.items.get(id);
    if (!f) return false;
    f.status = 'paused';
    f.updated = Date.now();
    return true;
  }

  archive(id: string): boolean {
    const f = this.items.get(id);
    if (!f) return false;
    f.status = 'archived';
    f.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const f = this.items.get(id);
    if (!f) return false;
    f.active = active;
    f.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const f = this.items.get(id);
    if (!f) return false;
    f.title = title;
    f.updated = Date.now();
    return true;
  }

  setBody(id: string, body: string): boolean {
    const f = this.items.get(id);
    if (!f) return false;
    f.body = body;
    f.updated = Date.now();
    return true;
  }

  setStatus(id: string, status: FeedStatus): boolean {
    const f = this.items.get(id);
    if (!f) return false;
    f.status = status;
    f.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const f of this.items.values()) {
      f.status = 'active';
      f.published = false;
      f.read = 0;
      f.active = true;
      f.hits = 0;
    }
    this.totalAdded = 0;
    this.totalPublished = 0;
    this.totalRead = 0;
    this.totalBodyLen = 0;
    this.totalTitleLen = 0;
  }

  getStats(): FdeStats {
    const all = Array.from(this.items.values());
    const bArr = all.map(f => f.body.length);
    const tArr = all.map(f => f.title.length);
    return {
      items: all.length,
      totalAdded: this.totalAdded,
      totalPublished: this.totalPublished,
      totalRead: this.totalRead,
      active: all.filter(f => f.status === 'active').length,
      paused: all.filter(f => f.status === 'paused').length,
      archived: all.filter(f => f.status === 'archived').length,
      published: all.filter(f => f.published).length,
      unpublished: all.filter(f => !f.published).length,
      uniqueActive: all.filter(f => f.active).length,
      uniqueInactive: all.filter(f => !f.active).length,
      totalHits: all.reduce((s, f) => s + f.hits, 0),
      uniqueTitles: new Set(all.map(f => f.title)).size,
      totalBodyLen: this.totalBodyLen,
      totalTitleLen: this.totalTitleLen,
      avgBodyLen: all.length > 0 ? Math.round((bArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgTitleLen: all.length > 0 ? Math.round((tArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getItem(id: string): FeedItem | undefined {
    return this.items.get(id);
  }

  getAllItems(): FeedItem[] {
    return Array.from(this.items.values());
  }

  hasItem(id: string): boolean {
    return this.items.has(id);
  }

  getCount(): number {
    return this.items.size;
  }

  getTitle(id: string): string | undefined {
    return this.items.get(id)?.title;
  }

  getBody(id: string): string | undefined {
    return this.items.get(id)?.body;
  }

  getStatus(id: string): FeedStatus | undefined {
    return this.items.get(id)?.status;
  }

  isPublished(id: string): boolean {
    return this.items.get(id)?.published ?? false;
  }

  getReads(id: string): number {
    return this.items.get(id)?.read ?? 0;
  }

  getHits(id: string): number {
    return this.items.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.items.get(id)?.active ?? false;
  }

  isActive_(id: string): boolean {
    return this.items.get(id)?.status === 'active';
  }

  isPaused(id: string): boolean {
    return this.items.get(id)?.status === 'paused';
  }

  isArchived(id: string): boolean {
    return this.items.get(id)?.status === 'archived';
  }

  getByStatus(status: FeedStatus): FeedItem[] {
    return Array.from(this.items.values()).filter(f => f.status === status);
  }

  getActiveItems(): FeedItem[] {
    return Array.from(this.items.values()).filter(f => f.active);
  }

  getInactiveItems(): FeedItem[] {
    return Array.from(this.items.values()).filter(f => !f.active);
  }

  getPublishedItems(): FeedItem[] {
    return Array.from(this.items.values()).filter(f => f.published);
  }

  getUnpublishedItems(): FeedItem[] {
    return Array.from(this.items.values()).filter(f => !f.published);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.items.values()).map(f => f.title))];
  }

  getNewest(): FeedItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.created > max.created ? f : max);
  }

  getOldest(): FeedItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((min, f) => f.created < min.created ? f : min);
  }

  getCreatedAt(id: string): number {
    return this.items.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.items.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalPublished(): number {
    return this.totalPublished;
  }

  getTotalRead(): number {
    return this.totalRead;
  }

  clearAll(): void {
    this.items.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalPublished = 0;
    this.totalRead = 0;
    this.totalBodyLen = 0;
    this.totalTitleLen = 0;
  }
}

export default FeedEngine;