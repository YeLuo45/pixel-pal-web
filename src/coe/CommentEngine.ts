/**
 * Comment Engine
 * chatdev-design Comment Engine - Add + Reply + Pin + Stats
 */

export type CommentStatus = 'visible' | 'hidden' | 'deleted';

export interface Comment {
  id: string;
  text: string;
  author: string;
  parent: string | null;
  replies: number;
  pinned: boolean;
  status: CommentStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CoeStats {
  comments: number;
  totalAdded: number;
  totalReplied: number;
  totalPinned: number;
  totalHidden: number;
  visible: number;
  hidden: number;
  deleted: number;
  pinned: number;
  unpinned: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueAuthors: number;
  totalReplies: number;
  totalTextLen: number;
  avgTextLen: number;
}

export class CommentEngine {
  private comments: Map<string, Comment> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalReplied = 0;
  private totalPinned = 0;
  private totalHidden = 0;
  private totalReplies = 0;
  private totalTextLen = 0;

  add(text: string, author: string, parent: string | null = null): string {
    const id = `coe-${++this.counter}`;
    this.comments.set(id, {
      id,
      text,
      author,
      parent,
      replies: 0,
      pinned: false,
      status: 'visible',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalTextLen += text.length;
    return id;
  }

  reply(id: string, text: string, author: string): string | null {
    if (!this.comments.has(id)) return null;
    const childId = this.add(text, author, id);
    const parent = this.comments.get(id)!;
    parent.replies++;
    parent.updated = Date.now();
    parent.hits++;
    this.totalReplied++;
    this.totalReplies++;
    return childId;
  }

  pin(id: string): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.pinned = true;
    c.updated = Date.now();
    c.hits++;
    this.totalPinned++;
    return true;
  }

  unpin(id: string): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.pinned = false;
    c.updated = Date.now();
    return true;
  }

  hide(id: string): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.status = 'hidden';
    c.updated = Date.now();
    c.hits++;
    this.totalHidden++;
    return true;
  }

  remove(id: string): boolean {
    return this.comments.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setText(id: string, text: string): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.text = text;
    c.updated = Date.now();
    return true;
  }

  setAuthor(id: string, author: string): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.author = author;
    c.updated = Date.now();
    return true;
  }

  setReplies(id: string, replies: number): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.replies = replies;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.comments.values()) {
      c.replies = 0;
      c.pinned = false;
      c.status = 'visible';
      c.active = true;
      c.hits = 0;
    }
    this.totalAdded = 0;
    this.totalReplied = 0;
    this.totalPinned = 0;
    this.totalHidden = 0;
    this.totalReplies = 0;
    this.totalTextLen = 0;
  }

  getStats(): CoeStats {
    const all = Array.from(this.comments.values());
    const lArr = all.map(c => c.text.length);
    return {
      comments: all.length,
      totalAdded: this.totalAdded,
      totalReplied: this.totalReplied,
      totalPinned: this.totalPinned,
      totalHidden: this.totalHidden,
      visible: all.filter(c => c.status === 'visible').length,
      hidden: all.filter(c => c.status === 'hidden').length,
      deleted: all.filter(c => c.status === 'deleted').length,
      pinned: all.filter(c => c.pinned).length,
      unpinned: all.filter(c => !c.pinned).length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueAuthors: new Set(all.map(c => c.author)).size,
      totalReplies: this.totalReplies,
      totalTextLen: this.totalTextLen,
      avgTextLen: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getComment(id: string): Comment | undefined {
    return this.comments.get(id);
  }

  getAllComments(): Comment[] {
    return Array.from(this.comments.values());
  }

  hasComment(id: string): boolean {
    return this.comments.has(id);
  }

  getCount(): number {
    return this.comments.size;
  }

  getText(id: string): string | undefined {
    return this.comments.get(id)?.text;
  }

  getAuthor(id: string): string | undefined {
    return this.comments.get(id)?.author;
  }

  getReplies(id: string): number {
    return this.comments.get(id)?.replies ?? 0;
  }

  getParent(id: string): string | null | undefined {
    return this.comments.get(id)?.parent;
  }

  getStatus(id: string): CommentStatus | undefined {
    return this.comments.get(id)?.status;
  }

  getHits(id: string): number {
    return this.comments.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.comments.get(id)?.active ?? false;
  }

  isVisible(id: string): boolean {
    return this.comments.get(id)?.status === 'visible';
  }

  isHidden(id: string): boolean {
    return this.comments.get(id)?.status === 'hidden';
  }

  isPinned(id: string): boolean {
    return this.comments.get(id)?.pinned ?? false;
  }

  isTopLevel(id: string): boolean {
    return (this.comments.get(id)?.parent ?? null) === null;
  }

  getByStatus(status: CommentStatus): Comment[] {
    return Array.from(this.comments.values()).filter(c => c.status === status);
  }

  getPinned(): Comment[] {
    return Array.from(this.comments.values()).filter(c => c.pinned);
  }

  getActiveComments(): Comment[] {
    return Array.from(this.comments.values()).filter(c => c.active);
  }

  getInactiveComments(): Comment[] {
    return Array.from(this.comments.values()).filter(c => !c.active);
  }

  getAllAuthors(): string[] {
    return [...new Set(Array.from(this.comments.values()).map(c => c.author))];
  }

  getChildren(id: string): Comment[] {
    return Array.from(this.comments.values()).filter(c => c.parent === id);
  }

  getNewest(): Comment | null {
    const all = Array.from(this.comments.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Comment | null {
    const all = Array.from(this.comments.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.comments.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.comments.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalReplied(): number {
    return this.totalReplied;
  }

  getTotalPinned(): number {
    return this.totalPinned;
  }

  clearAll(): void {
    this.comments.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalReplied = 0;
    this.totalPinned = 0;
    this.totalHidden = 0;
    this.totalReplies = 0;
    this.totalTextLen = 0;
  }
}

export default CommentEngine;