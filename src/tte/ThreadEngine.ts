/**
 * Thread Engine
 * chatdev-design Thread Engine - Create + Reply + Pin + Close + Stats
 */

export type ThreadStatus = 'open' | 'closed' | 'archived';

export interface ThreadPost {
  id: string;
  threadId: string;
  author: string;
  content: string;
  created: number;
}

export interface Thread {
  id: string;
  title: string;
  author: string;
  status: ThreadStatus;
  pinned: boolean;
  posts: ThreadPost[];
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface TteStats {
  threads: number;
  totalReplies: number;
  totalClosed: number;
  totalArchived: number;
  open: number;
  closed: number;
  archived: number;
  pinned: number;
  unpinned: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueAuthors: number;
  uniqueTitles: number;
  totalPosts: number;
  avgPosts: number;
  maxPosts: number;
  minPosts: number;
}

export class ThreadEngine {
  private threads: Map<string, Thread> = new Map();
  private counter = 0;
  private totalReplies = 0;
  private totalClosed = 0;
  private totalArchived = 0;

  create(title: string, author: string): string {
    const id = `tte-${++this.counter}`;
    this.threads.set(id, {
      id,
      title,
      author,
      status: 'open',
      pinned: false,
      posts: [],
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  reply(id: string, author: string, content: string): string | null {
    const t = this.threads.get(id);
    if (!t) return null;
    if (!t.active) return null;
    if (t.status !== 'open') return null;
    const postId = `${id}-p-${t.posts.length + 1}`;
    t.posts.push({
      id: postId,
      threadId: id,
      author,
      content,
      created: Date.now(),
    });
    t.updated = Date.now();
    t.hits++;
    this.totalReplies++;
    return postId;
  }

  pin(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.pinned = true;
    t.updated = Date.now();
    return true;
  }

  unpin(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.pinned = false;
    t.updated = Date.now();
    return true;
  }

  close(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.status = 'closed';
    t.updated = Date.now();
    t.hits++;
    this.totalClosed++;
    return true;
  }

  archive(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.status = 'archived';
    t.updated = Date.now();
    t.hits++;
    this.totalArchived++;
    return true;
  }

  remove(id: string): boolean {
    return this.threads.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.threads.values()) {
      t.posts = [];
      t.pinned = false;
      t.status = 'open';
      t.hits = 0;
      t.active = true;
    }
    this.totalReplies = 0;
    this.totalClosed = 0;
    this.totalArchived = 0;
  }

  getStats(): TteStats {
    const all = Array.from(this.threads.values());
    const postValues = all.map(t => t.posts.length);
    return {
      threads: all.length,
      totalReplies: this.totalReplies,
      totalClosed: this.totalClosed,
      totalArchived: this.totalArchived,
      open: all.filter(t => t.status === 'open').length,
      closed: all.filter(t => t.status === 'closed').length,
      archived: all.filter(t => t.status === 'archived').length,
      pinned: all.filter(t => t.pinned).length,
      unpinned: all.filter(t => !t.pinned).length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueAuthors: new Set(all.map(t => t.author)).size,
      uniqueTitles: new Set(all.map(t => t.title)).size,
      totalPosts: all.reduce((s, t) => s + t.posts.length, 0),
      avgPosts: all.length > 0 ? Math.round((postValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPosts: postValues.length > 0 ? Math.max(...postValues) : 0,
      minPosts: postValues.length > 0 ? Math.min(...postValues) : 0,
    };
  }

  getThread(id: string): Thread | undefined {
    return this.threads.get(id);
  }

  getAllThreads(): Thread[] {
    return Array.from(this.threads.values());
  }

  hasThread(id: string): boolean {
    return this.threads.has(id);
  }

  getCount(): number {
    return this.threads.size;
  }

  getTitle(id: string): string | undefined {
    return this.threads.get(id)?.title;
  }

  getAuthor(id: string): string | undefined {
    return this.threads.get(id)?.author;
  }

  getStatus(id: string): ThreadStatus | undefined {
    return this.threads.get(id)?.status;
  }

  isPinned(id: string): boolean {
    return this.threads.get(id)?.pinned ?? false;
  }

  getPosts(id: string): ThreadPost[] {
    return [...(this.threads.get(id)?.posts ?? [])];
  }

  getPostCount(id: string): number {
    return this.threads.get(id)?.posts.length ?? 0;
  }

  getHits(id: string): number {
    return this.threads.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.threads.get(id)?.active ?? false;
  }

  isOpen(id: string): boolean {
    return this.threads.get(id)?.status === 'open';
  }

  isClosed(id: string): boolean {
    return this.threads.get(id)?.status === 'closed';
  }

  setTitle(id: string, title: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.title = title;
    t.updated = Date.now();
    return true;
  }

  getByStatus(status: ThreadStatus): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.status === status);
  }

  getPinnedThreads(): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.pinned);
  }

  getUnpinnedThreads(): Thread[] {
    return Array.from(this.threads.values()).filter(t => !t.pinned);
  }

  getActiveThreads(): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.active);
  }

  getInactiveThreads(): Thread[] {
    return Array.from(this.threads.values()).filter(t => !t.active);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.threads.values()).map(t => t.title))];
  }

  getTitleCount(): number {
    return this.getAllTitles().length;
  }

  getAllAuthors(): string[] {
    return [...new Set(Array.from(this.threads.values()).map(t => t.author))];
  }

  getNewest(): Thread | null {
    const all = Array.from(this.threads.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Thread | null {
    const all = Array.from(this.threads.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.threads.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.threads.get(id)?.updated ?? 0;
  }

  getTotalReplies(): number {
    return this.totalReplies;
  }

  getTotalClosed(): number {
    return this.totalClosed;
  }

  getTotalArchived(): number {
    return this.totalArchived;
  }

  clearAll(): void {
    this.threads.clear();
    this.counter = 0;
    this.totalReplies = 0;
    this.totalClosed = 0;
    this.totalArchived = 0;
  }
}

export default ThreadEngine;