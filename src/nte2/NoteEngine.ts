/**
 * Note Engine
 * chatdev-design Note Engine - Add + Update + Pin + Delete + Stats
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  pinned: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface NteStats {
  notes: number;
  totalAdded: number;
  totalUpdated: number;
  totalDeleted: number;
  pinned: number;
  unpinned: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTitles: number;
  uniqueAuthors: number;
  avgContentLength: number;
  maxContentLength: number;
  minContentLength: number;
}

export class NoteEngine {
  private notes: Map<string, Note> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalUpdated = 0;
  private totalDeleted = 0;

  add(title: string, content: string, author: string): string {
    const id = `nte-${++this.counter}`;
    this.notes.set(id, {
      id,
      title,
      content,
      author,
      pinned: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  update(id: string, content: string): boolean {
    const n = this.notes.get(id);
    if (!n) return false;
    if (!n.active) return false;
    n.content = content;
    n.updated = Date.now();
    n.hits++;
    this.totalUpdated++;
    return true;
  }

  pin(id: string): boolean {
    const n = this.notes.get(id);
    if (!n) return false;
    n.pinned = true;
    n.updated = Date.now();
    n.hits++;
    return true;
  }

  unpin(id: string): boolean {
    const n = this.notes.get(id);
    if (!n) return false;
    n.pinned = false;
    n.updated = Date.now();
    n.hits++;
    return true;
  }

  remove(id: string): boolean {
    const n = this.notes.get(id);
    if (!n) return false;
    this.notes.delete(id);
    this.totalDeleted++;
    return true;
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.notes.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const n = this.notes.get(id);
    if (!n) return false;
    n.title = title;
    n.updated = Date.now();
    return true;
  }

  setAuthor(id: string, author: string): boolean {
    const n = this.notes.get(id);
    if (!n) return false;
    n.author = author;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.notes.values()) {
      n.pinned = false;
      n.active = true;
      n.hits = 0;
    }
    this.totalAdded = 0;
    this.totalUpdated = 0;
    this.totalDeleted = 0;
  }

  getStats(): NteStats {
    const all = Array.from(this.notes.values());
    const lengths = all.map(n => n.content.length);
    return {
      notes: all.length,
      totalAdded: this.totalAdded,
      totalUpdated: this.totalUpdated,
      totalDeleted: this.totalDeleted,
      pinned: all.filter(n => n.pinned).length,
      unpinned: all.filter(n => !n.pinned).length,
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      uniqueTitles: new Set(all.map(n => n.title)).size,
      uniqueAuthors: new Set(all.map(n => n.author)).size,
      avgContentLength: all.length > 0 ? Math.round((lengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxContentLength: lengths.length > 0 ? Math.max(...lengths) : 0,
      minContentLength: lengths.length > 0 ? Math.min(...lengths) : 0,
    };
  }

  getNote(id: string): Note | undefined {
    return this.notes.get(id);
  }

  getAllNotes(): Note[] {
    return Array.from(this.notes.values());
  }

  hasNote(id: string): boolean {
    return this.notes.has(id);
  }

  getCount(): number {
    return this.notes.size;
  }

  getTitle(id: string): string | undefined {
    return this.notes.get(id)?.title;
  }

  getContent(id: string): string | undefined {
    return this.notes.get(id)?.content;
  }

  getAuthor(id: string): string | undefined {
    return this.notes.get(id)?.author;
  }

  getContentLength(id: string): number {
    return this.notes.get(id)?.content.length ?? 0;
  }

  getHits(id: string): number {
    return this.notes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.notes.get(id)?.active ?? false;
  }

  isPinned(id: string): boolean {
    return this.notes.get(id)?.pinned ?? false;
  }

  getByAuthor(author: string): Note[] {
    return Array.from(this.notes.values()).filter(n => n.author === author);
  }

  getPinnedNotes(): Note[] {
    return Array.from(this.notes.values()).filter(n => n.pinned);
  }

  getUnpinnedNotes(): Note[] {
    return Array.from(this.notes.values()).filter(n => !n.pinned);
  }

  getActiveNotes(): Note[] {
    return Array.from(this.notes.values()).filter(n => n.active);
  }

  getInactiveNotes(): Note[] {
    return Array.from(this.notes.values()).filter(n => !n.active);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.notes.values()).map(n => n.title))];
  }

  getAllAuthors(): string[] {
    return [...new Set(Array.from(this.notes.values()).map(n => n.author))];
  }

  getNewest(): Note | null {
    const all = Array.from(this.notes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): Note | null {
    const all = Array.from(this.notes.values());
    if (all.length === 0) return null;
    return all.reduce((min, n) => n.created < min.created ? n : min);
  }

  getCreatedAt(id: string): number {
    return this.notes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.notes.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalUpdated(): number {
    return this.totalUpdated;
  }

  getTotalDeleted(): number {
    return this.totalDeleted;
  }

  clearAll(): void {
    this.notes.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalUpdated = 0;
    this.totalDeleted = 0;
  }
}

export default NoteEngine;