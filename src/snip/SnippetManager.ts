/**
 * Snippet Manager
 * claude-code-design Snippet Manager - Add + Update + Search + Stats
 */

export interface Snippet {
  id: string;
  name: string;
  code: string;
  language: string;
  version: number;
  hits: number;
  created: number;
  updated: number;
  tags: string[];
}

export interface SnipStats {
  snippets: number;
  languages: number;
  totalHits: number;
  avgVersion: number;
  avgHits: number;
  totalUpdates: number;
}

export class SnippetManager {
  private snippets: Map<string, Snippet> = new Map();
  private counter = 0;
  private totalUpdates = 0;

  add(name: string, code: string, language: string = 'text', tags: string[] = []): string {
    const id = `snip-${++this.counter}`;
    this.snippets.set(id, {
      id,
      name,
      code,
      language,
      version: 1,
      hits: 0,
      created: Date.now(),
      updated: Date.now(),
      tags: [...tags],
    });
    return id;
  }

  update(id: string, code: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    s.code = code;
    s.version++;
    s.updated = Date.now();
    this.totalUpdates++;
    return true;
  }

  search(query: string): Snippet[] {
    const results: Snippet[] = [];
    const lowerQuery = query.toLowerCase();
    for (const s of this.snippets.values()) {
      if (
        s.name.toLowerCase().includes(lowerQuery) ||
        s.code.toLowerCase().includes(lowerQuery) ||
        s.tags.some(t => t.toLowerCase().includes(lowerQuery))
      ) {
        s.hits++;
        results.push(s);
      }
    }
    return results;
  }

  getStats(): SnipStats {
    const all = Array.from(this.snippets.values());
    return {
      snippets: all.length,
      languages: new Set(all.map(s => s.language)).size,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      avgVersion: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.version, 0) / all.length) * 100) / 100 : 0,
      avgHits: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.hits, 0) / all.length) * 100) / 100 : 0,
      totalUpdates: this.totalUpdates,
    };
  }

  getSnippet(id: string): Snippet | undefined {
    return this.snippets.get(id);
  }

  getAllSnippets(): Snippet[] {
    return Array.from(this.snippets.values());
  }

  removeSnippet(id: string): boolean {
    return this.snippets.delete(id);
  }

  hasSnippet(id: string): boolean {
    return this.snippets.has(id);
  }

  getCount(): number {
    return this.snippets.size;
  }

  getName(id: string): string | undefined {
    return this.snippets.get(id)?.name;
  }

  getCode(id: string): string | undefined {
    return this.snippets.get(id)?.code;
  }

  getLanguage(id: string): string | undefined {
    return this.snippets.get(id)?.language;
  }

  getVersion(id: string): number {
    return this.snippets.get(id)?.version ?? 0;
  }

  getHits(id: string): number {
    return this.snippets.get(id)?.hits ?? 0;
  }

  getTags(id: string): string[] {
    return [...(this.snippets.get(id)?.tags ?? [])];
  }

  setName(id: string, name: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setLanguage(id: string, language: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    s.language = language;
    s.updated = Date.now();
    return true;
  }

  setTags(id: string, tags: string[]): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    s.tags = [...tags];
    s.updated = Date.now();
    return true;
  }

  addTag(id: string, tag: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    if (!s.tags.includes(tag)) s.tags.push(tag);
    s.updated = Date.now();
    return true;
  }

  removeTag(id: string, tag: string): boolean {
    const s = this.snippets.get(id);
    if (!s) return false;
    s.tags = s.tags.filter(t => t !== tag);
    s.updated = Date.now();
    return true;
  }

  resetHits(): void {
    for (const s of this.snippets.values()) s.hits = 0;
  }

  resetAll(): void {
    for (const s of this.snippets.values()) {
      s.hits = 0;
      s.version = 1;
    }
    this.totalUpdates = 0;
  }

  getByLanguage(language: string): Snippet[] {
    return Array.from(this.snippets.values()).filter(s => s.language === language);
  }

  getByName(name: string): Snippet[] {
    return Array.from(this.snippets.values()).filter(s => s.name === name);
  }

  getByTag(tag: string): Snippet[] {
    return Array.from(this.snippets.values()).filter(s => s.tags.includes(tag));
  }

  getByMinVersion(min: number): Snippet[] {
    return Array.from(this.snippets.values()).filter(s => s.version >= min);
  }

  getAllLanguages(): string[] {
    return [...new Set(Array.from(this.snippets.values()).map(s => s.language))];
  }

  getLanguageCount(): number {
    return this.getAllLanguages().length;
  }

  getByLanguageCount(language: string): number {
    return this.getByLanguage(language).length;
  }

  getMostHit(): Snippet | null {
    const all = Array.from(this.snippets.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.hits > max.hits ? s : max);
  }

  getHighestVersion(): Snippet | null {
    const all = Array.from(this.snippets.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.version > max.version ? s : max);
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

  getTotalUpdates(): number {
    return this.totalUpdates;
  }

  resetTotalUpdates(): void {
    this.totalUpdates = 0;
  }

  clearAll(): void {
    this.snippets.clear();
    this.counter = 0;
    this.totalUpdates = 0;
  }
}

export default SnippetManager;