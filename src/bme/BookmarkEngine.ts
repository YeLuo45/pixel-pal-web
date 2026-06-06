/**
 * Bookmark Engine
 * chatdev-design Bookmark Engine - Add + Remove + GetByUser + Stats
 */

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  user: string;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface BmeStats {
  bookmarks: number;
  totalBookmarks: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueUsers: number;
  uniqueUrls: number;
  avgTitleLength: number;
  maxTitleLength: number;
  minTitleLength: number;
  avgUrlLength: number;
  maxUrlLength: number;
  minUrlLength: number;
  uniqueTitles: number;
}

export class BookmarkEngine {
  private bookmarks: Map<string, Bookmark> = new Map();
  private counter = 0;
  private totalBookmarks = 0;

  add(url: string, title: string, user: string): string {
    const id = `bme-${++this.counter}`;
    this.bookmarks.set(id, {
      id,
      url,
      title,
      user,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    this.totalBookmarks++;
    return id;
  }

  remove(id: string): boolean {
    return this.bookmarks.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.bookmarks.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const b = this.bookmarks.get(id);
    if (!b) return false;
    b.title = title;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.bookmarks.values()) {
      b.hits = 0;
      b.history = [];
      b.active = true;
    }
    this.totalBookmarks = 0;
  }

  getStats(): BmeStats {
    const all = Array.from(this.bookmarks.values());
    const titleLengths = all.map(b => b.title.length);
    const urlLengths = all.map(b => b.url.length);
    return {
      bookmarks: all.length,
      totalBookmarks: this.totalBookmarks,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueUsers: new Set(all.map(b => b.user)).size,
      uniqueUrls: new Set(all.map(b => b.url)).size,
      avgTitleLength: all.length > 0 ? Math.round((titleLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTitleLength: titleLengths.length > 0 ? Math.max(...titleLengths) : 0,
      minTitleLength: titleLengths.length > 0 ? Math.min(...titleLengths) : 0,
      avgUrlLength: all.length > 0 ? Math.round((urlLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxUrlLength: urlLengths.length > 0 ? Math.max(...urlLengths) : 0,
      minUrlLength: urlLengths.length > 0 ? Math.min(...urlLengths) : 0,
      uniqueTitles: new Set(all.map(b => b.title)).size,
    };
  }

  getBookmark(id: string): Bookmark | undefined {
    return this.bookmarks.get(id);
  }

  getAllBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  hasBookmark(id: string): boolean {
    return this.bookmarks.has(id);
  }

  getCount(): number {
    return this.bookmarks.size;
  }

  getUrl(id: string): string | undefined {
    return this.bookmarks.get(id)?.url;
  }

  getTitle(id: string): string | undefined {
    return this.bookmarks.get(id)?.title;
  }

  getUser(id: string): string | undefined {
    return this.bookmarks.get(id)?.user;
  }

  getTitleLength(id: string): number {
    return this.bookmarks.get(id)?.title.length ?? 0;
  }

  getUrlLength(id: string): number {
    return this.bookmarks.get(id)?.url.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.bookmarks.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.bookmarks.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.bookmarks.get(id)?.active ?? false;
  }

  getByUser(user: string): Bookmark[] {
    return Array.from(this.bookmarks.values()).filter(b => b.user === user);
  }

  getByUrl(url: string): Bookmark[] {
    return Array.from(this.bookmarks.values()).filter(b => b.url === url);
  }

  getActiveBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values()).filter(b => b.active);
  }

  getInactiveBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values()).filter(b => !b.active);
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.bookmarks.values()).map(b => b.user))];
  }

  getUserCount(): number {
    return this.getAllUsers().length;
  }

  getAllUrls(): string[] {
    return [...new Set(Array.from(this.bookmarks.values()).map(b => b.url))];
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.bookmarks.values()).map(b => b.title))];
  }

  getNewest(): Bookmark | null {
    const all = Array.from(this.bookmarks.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Bookmark | null {
    const all = Array.from(this.bookmarks.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.bookmarks.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.bookmarks.get(id)?.updated ?? 0;
  }

  getTotalBookmarks(): number {
    return this.totalBookmarks;
  }

  clearAll(): void {
    this.bookmarks.clear();
    this.counter = 0;
    this.totalBookmarks = 0;
  }
}

export default BookmarkEngine;