/**
 * Thread Engine
 * chatdev-design Thread Engine - Create + Reply + Close + Stats
 */

export type ThreadStatus = 'open' | 'closed' | 'archived';

export interface Thread {
  id: string;
  title: string;
  author: string;
  replies: number;
  status: ThreadStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface The2Stats {
  threads: number;
  totalCreated: number;
  totalReplied: number;
  totalClosed: number;
  open: number;
  closed: number;
  archived: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTitles: number;
  uniqueAuthors: number;
  totalReplies: number;
  avgReplies: number;
  maxReplies: number;
  minReplies: number;
  totalTitleLen: number;
  avgTitleLen: number;
}

export class ThreadEngine {
  private threads: Map<string, Thread> = new Map();
  private counter = 0;
  private totalCreated = 0;
  private totalReplied = 0;
  private totalClosed = 0;
  private totalReplies = 0;
  private totalTitleLen = 0;

  create(title: string, author: string): string {
    const id = `the2-${++this.counter}`;
    this.threads.set(id, {
      id,
      title,
      author,
      replies: 0,
      status: 'open',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalCreated++;
    this.totalTitleLen += title.length;
    return id;
  }

  reply(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    if (!t.active) return false;
    if (t.status === 'closed') return false;
    t.replies++;
    t.updated = Date.now();
    t.hits++;
    this.totalReplied++;
    this.totalReplies++;
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
    return true;
  }

  reopen(id: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.status = 'open';
    t.updated = Date.now();
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

  setTitle(id: string, title: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.title = title;
    t.updated = Date.now();
    return true;
  }

  setAuthor(id: string, author: string): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.author = author;
    t.updated = Date.now();
    return true;
  }

  setReplies(id: string, replies: number): boolean {
    const t = this.threads.get(id);
    if (!t) return false;
    t.replies = replies;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.threads.values()) {
      t.replies = 0;
      t.status = 'open';
      t.active = true;
      t.hits = 0;
    }
    this.totalCreated = 0;
    this.totalReplied = 0;
    this.totalClosed = 0;
    this.totalReplies = 0;
    this.totalTitleLen = 0;
  }

  getStats(): The2Stats {
    const all = Array.from(this.threads.values());
    const rArr = all.map(t => t.replies);
    const lArr = all.map(t => t.title.length);
    return {
      threads: all.length,
      totalCreated: this.totalCreated,
      totalReplied: this.totalReplied,
      totalClosed: this.totalClosed,
      open: all.filter(t => t.status === 'open').length,
      closed: all.filter(t => t.status === 'closed').length,
      archived: all.filter(t => t.status === 'archived').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueTitles: new Set(all.map(t => t.title)).size,
      uniqueAuthors: new Set(all.map(t => t.author)).size,
      totalReplies: this.totalReplies,
      avgReplies: all.length > 0 ? Math.round((rArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxReplies: rArr.length > 0 ? Math.max(...rArr) : 0,
      minReplies: rArr.length > 0 ? Math.min(...rArr) : 0,
      totalTitleLen: this.totalTitleLen,
      avgTitleLen: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
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

  getReplies(id: string): number {
    return this.threads.get(id)?.replies ?? 0;
  }

  getStatus(id: string): ThreadStatus | undefined {
    return this.threads.get(id)?.status;
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

  isArchived(id: string): boolean {
    return this.threads.get(id)?.status === 'archived';
  }

  getByStatus(status: ThreadStatus): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.status === status);
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

  getTotalCreated(): number {
    return this.totalCreated;
  }

  getTotalReplied(): number {
    return this.totalReplied;
  }

  getTotalClosed(): number {
    return this.totalClosed;
  }

  clearAll(): void {
    this.threads.clear();
    this.counter = 0;
    this.totalCreated = 0;
    this.totalReplied = 0;
    this.totalClosed = 0;
    this.totalReplies = 0;
    this.totalTitleLen = 0;
  }
}

export default ThreadEngine;