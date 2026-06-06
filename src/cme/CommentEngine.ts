/**
 * Comment Engine
 * claude-code-design Comment Engine - Add + Resolve + Stats
 */

export interface Comment {
  id: string;
  author: string;
  text: string;
  resolved: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
}

export interface CMeStats {
  comments: number;
  resolved: number;
  unresolved: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueAuthors: number;
  avgTextLength: number;
  maxTextLength: number;
  minTextLength: number;
  totalTextLength: number;
  resolutionRate: number;
}

export class CommentEngine {
  private comments: Map<string, Comment> = new Map();
  private counter = 0;
  private totalResolved = 0;
  private totalUnresolved = 0;

  add(author: string, text: string): string {
    const id = `cme-${++this.counter}`;
    this.comments.set(id, {
      id,
      author,
      text,
      resolved: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  resolve(id: string): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    if (!c.active) return false;
    if (c.resolved) return false;
    c.resolved = true;
    c.history.push(true);
    c.updated = Date.now();
    c.hits++;
    this.totalResolved++;
    this.totalUnresolved++;
    return true;
  }

  unresolve(id: string): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    if (!c.resolved) return false;
    c.resolved = false;
    c.history.push(false);
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  getStats(): CMeStats {
    const all = Array.from(this.comments.values());
    const textLengths = all.map(c => c.text.length);
    return {
      comments: all.length,
      resolved: all.filter(c => c.resolved).length,
      unresolved: all.filter(c => !c.resolved).length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueAuthors: new Set(all.map(c => c.author)).size,
      avgTextLength: all.length > 0 ? Math.round((textLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTextLength: textLengths.length > 0 ? Math.max(...textLengths) : 0,
      minTextLength: textLengths.length > 0 ? Math.min(...textLengths) : 0,
      totalTextLength: textLengths.reduce((s, v) => s + v, 0),
      resolutionRate: all.length > 0 ? Math.round((all.filter(c => c.resolved).length / all.length) * 100) / 100 : 0,
    };
  }

  getComment(id: string): Comment | undefined {
    return this.comments.get(id);
  }

  getAllComments(): Comment[] {
    return Array.from(this.comments.values());
  }

  removeComment(id: string): boolean {
    return this.comments.delete(id);
  }

  hasComment(id: string): boolean {
    return this.comments.has(id);
  }

  getCount(): number {
    return this.comments.size;
  }

  getAuthor(id: string): string | undefined {
    return this.comments.get(id)?.author;
  }

  getText(id: string): string | undefined {
    return this.comments.get(id)?.text;
  }

  isResolved(id: string): boolean {
    return this.comments.get(id)?.resolved ?? false;
  }

  getHistory(id: string): boolean[] {
    return [...(this.comments.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.comments.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.comments.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.active = active;
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

  setText(id: string, text: string): boolean {
    const c = this.comments.get(id);
    if (!c) return false;
    c.text = text;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.comments.values()) {
      c.resolved = false;
      c.hits = 0;
      c.history = [];
      c.active = true;
    }
    this.totalResolved = 0;
    this.totalUnresolved = 0;
  }

  getByAuthor(author: string): Comment[] {
    return Array.from(this.comments.values()).filter(c => c.author === author);
  }

  getResolvedComments(): Comment[] {
    return Array.from(this.comments.values()).filter(c => c.resolved);
  }

  getUnresolvedComments(): Comment[] {
    return Array.from(this.comments.values()).filter(c => !c.resolved);
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

  getAuthorCount(): number {
    return this.getAllAuthors().length;
  }

  getByMinTextLength(min: number): Comment[] {
    return Array.from(this.comments.values()).filter(c => c.text.length >= min);
  }

  getMostTextLength(): Comment | null {
    const all = Array.from(this.comments.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.text.length > max.text.length ? c : max);
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

  getTotalResolved(): number {
    return this.totalResolved;
  }

  getTotalUnresolved(): number {
    return this.totalUnresolved;
  }

  clearAll(): void {
    this.comments.clear();
    this.counter = 0;
    this.totalResolved = 0;
    this.totalUnresolved = 0;
  }
}

export default CommentEngine;