/**
 * Reference Engine
 * claude-code-design Reference Engine - Add + Cite + Remove + Stats
 */

export type ReferenceKind = 'book' | 'paper' | 'article' | 'web' | 'doc' | 'note';

export interface ReferenceEntry {
  id: string;
  title: string;
  author: string;
  kind: ReferenceKind;
  year: number;
  cited: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface RfeStats {
  references: number;
  totalAdded: number;
  totalCited: number;
  book: number;
  paper: number;
  article: number;
  web: number;
  doc: number;
  note: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTitles: number;
  uniqueAuthors: number;
  totalCitedSum: number;
  maxCited: number;
  avgCited: number;
}

export class ReferenceEngine {
  private references: Map<string, ReferenceEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalCited = 0;

  add(title: string, author: string, kind: ReferenceKind, year: number): string {
    const id = `rfe-${++this.counter}`;
    this.references.set(id, {
      id,
      title,
      author,
      kind,
      year,
      cited: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  cite(id: string): boolean {
    const r = this.references.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.cited++;
    r.updated = Date.now();
    r.hits++;
    this.totalCited++;
    return true;
  }

  remove(id: string): boolean {
    return this.references.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.references.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const r = this.references.get(id);
    if (!r) return false;
    r.title = title;
    r.updated = Date.now();
    return true;
  }

  setAuthor(id: string, author: string): boolean {
    const r = this.references.get(id);
    if (!r) return false;
    r.author = author;
    r.updated = Date.now();
    return true;
  }

  setKind(id: string, kind: ReferenceKind): boolean {
    const r = this.references.get(id);
    if (!r) return false;
    r.kind = kind;
    r.updated = Date.now();
    return true;
  }

  setYear(id: string, year: number): boolean {
    const r = this.references.get(id);
    if (!r) return false;
    r.year = year;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.references.values()) {
      r.cited = 0;
      r.active = true;
      r.hits = 0;
    }
    this.totalAdded = 0;
    this.totalCited = 0;
  }

  getStats(): RfeStats {
    const all = Array.from(this.references.values());
    const cArr = all.map(r => r.cited);
    return {
      references: all.length,
      totalAdded: this.totalAdded,
      totalCited: this.totalCited,
      book: all.filter(r => r.kind === 'book').length,
      paper: all.filter(r => r.kind === 'paper').length,
      article: all.filter(r => r.kind === 'article').length,
      web: all.filter(r => r.kind === 'web').length,
      doc: all.filter(r => r.kind === 'doc').length,
      note: all.filter(r => r.kind === 'note').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueTitles: new Set(all.map(r => r.title)).size,
      uniqueAuthors: new Set(all.map(r => r.author)).size,
      totalCitedSum: all.reduce((s, r) => s + r.cited, 0),
      maxCited: cArr.length > 0 ? Math.max(...cArr) : 0,
      avgCited: all.length > 0 ? Math.round((cArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getReference(id: string): ReferenceEntry | undefined {
    return this.references.get(id);
  }

  getAllReferences(): ReferenceEntry[] {
    return Array.from(this.references.values());
  }

  hasReference(id: string): boolean {
    return this.references.has(id);
  }

  getCount(): number {
    return this.references.size;
  }

  getTitle(id: string): string | undefined {
    return this.references.get(id)?.title;
  }

  getAuthor(id: string): string | undefined {
    return this.references.get(id)?.author;
  }

  getKind(id: string): ReferenceKind | undefined {
    return this.references.get(id)?.kind;
  }

  getYear(id: string): number {
    return this.references.get(id)?.year ?? 0;
  }

  getCited(id: string): number {
    return this.references.get(id)?.cited ?? 0;
  }

  getHits(id: string): number {
    return this.references.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.references.get(id)?.active ?? false;
  }

  isBook(id: string): boolean {
    return this.references.get(id)?.kind === 'book';
  }

  isPaper(id: string): boolean {
    return this.references.get(id)?.kind === 'paper';
  }

  isArticle(id: string): boolean {
    return this.references.get(id)?.kind === 'article';
  }

  isWeb(id: string): boolean {
    return this.references.get(id)?.kind === 'web';
  }

  isDoc(id: string): boolean {
    return this.references.get(id)?.kind === 'doc';
  }

  isNote(id: string): boolean {
    return this.references.get(id)?.kind === 'note';
  }

  getByKind(kind: ReferenceKind): ReferenceEntry[] {
    return Array.from(this.references.values()).filter(r => r.kind === kind);
  }

  getActiveReferences(): ReferenceEntry[] {
    return Array.from(this.references.values()).filter(r => r.active);
  }

  getInactiveReferences(): ReferenceEntry[] {
    return Array.from(this.references.values()).filter(r => !r.active);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.references.values()).map(r => r.title))];
  }

  getAllAuthors(): string[] {
    return [...new Set(Array.from(this.references.values()).map(r => r.author))];
  }

  getNewest(): ReferenceEntry | null {
    const all = Array.from(this.references.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): ReferenceEntry | null {
    const all = Array.from(this.references.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.references.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.references.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalCited(): number {
    return this.totalCited;
  }

  clearAll(): void {
    this.references.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalCited = 0;
  }
}

export default ReferenceEngine;