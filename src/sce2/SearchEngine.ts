/**
 * Search Engine
 * chatdev-design Search Engine - Index + Query + Stats
 */

export type SearchField = 'title' | 'body' | 'tags' | 'all';

export interface SearchDoc {
  id: string;
  title: string;
  body: string;
  tags: string[];
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface SearchResult {
  id: string;
  score: number;
  title: string;
}

export interface SceStats {
  docs: number;
  totalIndexed: number;
  totalQueried: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTitles: number;
  totalBodyLen: number;
  totalTitleLen: number;
  avgBodyLen: number;
  avgTitleLen: number;
  totalTags: number;
  avgTags: number;
  maxTags: number;
}

export class SearchEngine {
  private docs: Map<string, SearchDoc> = new Map();
  private counter = 0;
  private totalIndexed = 0;
  private totalQueried = 0;
  private totalBodyLen = 0;
  private totalTitleLen = 0;
  private totalTags = 0;

  index(title: string, body: string, tags: string[]): string {
    const id = `sce-${++this.counter}`;
    this.docs.set(id, {
      id,
      title,
      body,
      tags: [...tags],
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalIndexed++;
    this.totalBodyLen += body.length;
    this.totalTitleLen += title.length;
    this.totalTags += tags.length;
    return id;
  }

  query(text: string, field: SearchField = 'all'): SearchResult[] {
    this.totalQueried++;
    const results: SearchResult[] = [];
    for (const d of this.docs.values()) {
      if (!d.active) continue;
      let score = 0;
      if (field === 'title' || field === 'all') {
        if (d.title.toLowerCase().includes(text.toLowerCase())) score += 2;
      }
      if (field === 'body' || field === 'all') {
        if (d.body.toLowerCase().includes(text.toLowerCase())) score += 1;
      }
      if (field === 'tags' || field === 'all') {
        for (const t of d.tags) {
          if (t.toLowerCase().includes(text.toLowerCase())) { score += 3; break; }
        }
      }
      if (score > 0) {
        d.hits++;
        d.updated = Date.now();
        results.push({ id: d.id, score, title: d.title });
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }

  remove(id: string): boolean {
    return this.docs.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.docs.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const d = this.docs.get(id);
    if (!d) return false;
    d.title = title;
    d.updated = Date.now();
    return true;
  }

  setBody(id: string, body: string): boolean {
    const d = this.docs.get(id);
    if (!d) return false;
    d.body = body;
    d.updated = Date.now();
    return true;
  }

  setTags(id: string, tags: string[]): boolean {
    const d = this.docs.get(id);
    if (!d) return false;
    d.tags = [...tags];
    d.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const d of this.docs.values()) {
      d.hits = 0;
      d.active = true;
    }
    this.totalIndexed = 0;
    this.totalQueried = 0;
    this.totalBodyLen = 0;
    this.totalTitleLen = 0;
    this.totalTags = 0;
  }

  getStats(): SceStats {
    const all = Array.from(this.docs.values());
    const bArr = all.map(d => d.body.length);
    const tArr = all.map(d => d.title.length);
    const tgArr = all.map(d => d.tags.length);
    return {
      docs: all.length,
      totalIndexed: this.totalIndexed,
      totalQueried: this.totalQueried,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      totalHits: all.reduce((s, d) => s + d.hits, 0),
      uniqueTitles: new Set(all.map(d => d.title)).size,
      totalBodyLen: this.totalBodyLen,
      totalTitleLen: this.totalTitleLen,
      avgBodyLen: all.length > 0 ? Math.round((bArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgTitleLen: all.length > 0 ? Math.round((tArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      totalTags: this.totalTags,
      avgTags: all.length > 0 ? Math.round((tgArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTags: tgArr.length > 0 ? Math.max(...tgArr) : 0,
    };
  }

  getDoc(id: string): SearchDoc | undefined {
    return this.docs.get(id);
  }

  getAllDocs(): SearchDoc[] {
    return Array.from(this.docs.values());
  }

  hasDoc(id: string): boolean {
    return this.docs.has(id);
  }

  getCount(): number {
    return this.docs.size;
  }

  getTitle(id: string): string | undefined {
    return this.docs.get(id)?.title;
  }

  getBody(id: string): string | undefined {
    return this.docs.get(id)?.body;
  }

  getTags(id: string): string[] {
    return this.docs.get(id)?.tags ?? [];
  }

  getHits(id: string): number {
    return this.docs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.docs.get(id)?.active ?? false;
  }

  getActiveDocs(): SearchDoc[] {
    return Array.from(this.docs.values()).filter(d => d.active);
  }

  getInactiveDocs(): SearchDoc[] {
    return Array.from(this.docs.values()).filter(d => !d.active);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.docs.values()).map(d => d.title))];
  }

  getNewest(): SearchDoc | null {
    const all = Array.from(this.docs.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): SearchDoc | null {
    const all = Array.from(this.docs.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.docs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.docs.get(id)?.updated ?? 0;
  }

  getTotalIndexed(): number {
    return this.totalIndexed;
  }

  getTotalQueried(): number {
    return this.totalQueried;
  }

  clearAll(): void {
    this.docs.clear();
    this.counter = 0;
    this.totalIndexed = 0;
    this.totalQueried = 0;
    this.totalBodyLen = 0;
    this.totalTitleLen = 0;
    this.totalTags = 0;
  }
}

export default SearchEngine;