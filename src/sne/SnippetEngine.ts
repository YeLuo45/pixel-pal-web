/**
 * Snippet Engine
 * claude-code-design Snippet Engine - Create + Get + Search + Stats
 */

export interface Snippet {
  id: string;
  title: string;
  language: string;
  content: string;
  tags: string[];
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface SneStats {
  snippets: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTitles: number;
  uniqueLanguages: number;
  avgContentLength: number;
  maxContentLength: number;
  minContentLength: number;
  avgTags: number;
  maxTags: number;
  minTags: number;
  totalTags: number;
  uniqueTags: number;
}

export class SnippetEngine {
  private snippets: Map<string, Snippet> = new Map();
  private counter = 0;

  create(title: string, language: string, content: string, tags: string[] = []): string {
    const id = `sne-${++this.counter}`;
    this.snippets.set(id, {
      id,
      title,
      language,
      content,
      tags: [...tags],
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  get(id: string): Snippet | undefined {
    const s = this.snippets.get(id);
    if (!s) return undefined;
    if (!s.active) return undefined;
    s.hits++;
    s.updated = Date.now();
    return s;
  }

  search(query: string): Snippet[] {
    const lower = query.toLowerCase();
    return Array.from(this.snippets.values()).filter(s =>
      s.active && (s.title.toLowerCase().includes(lower) || s.content.toLowerCase().includes(lower) || s.tags.some(t => t.toLowerCase().includes(lower)))
    );
  }

  remove(id: string): boolean {
    return this.snippets.delete(id);
  }

  addTag(id: string, tag: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    if (!s.tags.includes(tag)) {
      s.tags.push(tag);
      s.updated = Date.now();
    }
    return true;
  }

  removeTag(id: string, tag: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    const idx = s.tags.indexOf(tag);
    if (idx < 0) return false;
    s.tags.splice(idx, 1);
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.snippets.values()) {
      s.hits = 0;
      s.history = [];
      s.active = true;
    }
  }

  getStats(): SneStats {
    const all = Array.from(this.snippets.values());
    const contentLengths = all.map(s => s.content.length);
    const tagCounts = all.map(s => s.tags.length);
    const allTags = all.flatMap(s => s.tags);
    return {
      snippets: all.length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueTitles: new Set(all.map(s => s.title)).size,
      uniqueLanguages: new Set(all.map(s => s.language)).size,
      avgContentLength: all.length > 0 ? Math.round((contentLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxContentLength: contentLengths.length > 0 ? Math.max(...contentLengths) : 0,
      minContentLength: contentLengths.length > 0 ? Math.min(...contentLengths) : 0,
      avgTags: all.length > 0 ? Math.round((tagCounts.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTags: tagCounts.length > 0 ? Math.max(...tagCounts) : 0,
      minTags: tagCounts.length > 0 ? Math.min(...tagCounts) : 0,
      totalTags: allTags.length,
      uniqueTags: new Set(allTags).size,
    };
  }

  getSnippet(id: string): Snippet | undefined {
    return this.snippets.get(id);
  }

  getAllSnippets(): Snippet[] {
    return Array.from(this.snippets.values());
  }

  hasSnippet(id: string): boolean {
    return this.snippets.has(id);
  }

  getCount(): number {
    return this.snippets.size;
  }

  getTitle(id: string): string | undefined {
    return this.snippets.get(id)?.title;
  }

  getLanguage(id: string): string | undefined {
    return this.snippets.get(id)?.language;
  }

  getContent(id: string): string | undefined {
    return this.snippets.get(id)?.content;
  }

  getContentLength(id: string): number {
    return this.snippets.get(id)?.content.length ?? 0;
  }

  getTags(id: string): string[] {
    return [...(this.snippets.get(id)?.tags ?? [])];
  }

  getHistory(id: string): number[] {
    return [...(this.snippets.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.snippets.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.snippets.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setContent(id: string, content: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    s.content = content;
    s.updated = Date.now();
    return true;
  }

  setTitle(id: string, title: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    s.title = title;
    s.updated = Date.now();
    return true;
  }

  getByLanguage(language: string): Snippet[] {
    return Array.from(this.snippets.values()).filter(s => s.language === language);
  }

  getByTag(tag: string): Snippet[] {
    return Array.from(this.snippets.values()).filter(s => s.tags.includes(tag));
  }

  getActiveSnippets(): Snippet[] {
    return Array.from(this.snippets.values()).filter(s => s.active);
  }

  getInactiveSnippets(): Snippet[] {
    return Array.from(this.snippets.values()).filter(s => !s.active);
  }

  getAllTitles(): string[] {
    return [...new Set(Array.from(this.snippets.values()).map(s => s.title))];
  }

  getTitleCount(): number {
    return this.getAllTitles().length;
  }

  getAllLanguages(): string[] {
    return [...new Set(Array.from(this.snippets.values()).map(s => s.language))];
  }

  getLanguageCount(): number {
    return this.getAllLanguages().length;
  }

  getAllTags(): string[] {
    return [...new Set(Array.from(this.snippets.values()).flatMap(s => s.tags))];
  }

  getNewest(): Snippet | null {
    const all = Array.from(this.snippets.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Snippet | null {
    const all = Array.from(this.snippets.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.snippets.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.snippets.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.snippets.clear();
    this.counter = 0;
  }
}

export default SnippetEngine;