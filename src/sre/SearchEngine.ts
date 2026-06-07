/**
 * Search Engine
 * chatdev-design Search Engine - Index + Search + Suggest + Stats
 */

export interface SearchResult {
  id: string;
  query: string;
  result: string;
  score: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SreStats {
  results: number;
  totalIndexed: number;
  totalSearched: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueQueries: number;
  uniqueResults: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
}

export class SearchEngine {
  private results: Map<string, SearchResult> = new Map();
  private counter = 0;
  private totalIndexed = 0;
  private totalSearched = 0;

  index(result: string, score: number = 0.5): string {
    const id = `sre-${++this.counter}`;
    this.results.set(id, {
      id,
      query: '',
      result,
      score: Math.max(0, Math.min(1, score)),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalIndexed++;
    return id;
  }

  search(query: string): string[] {
    const ids: string[] = [];
    const q = query.toLowerCase();
    for (const r of this.results.values()) {
      if (r.active && r.result.toLowerCase().includes(q)) {
        r.hits++;
        r.updated = Date.now();
        r.query = query;
        ids.push(r.id);
        this.totalSearched++;
      }
    }
    return ids;
  }

  suggest(prefix: string, limit: number = 5): string[] {
    const matches: SearchResult[] = [];
    const p = prefix.toLowerCase();
    for (const r of this.results.values()) {
      if (r.active && r.result.toLowerCase().startsWith(p)) {
        matches.push(r);
      }
    }
    return matches.sort((a, b) => b.score - a.score).slice(0, limit).map(m => m.result);
  }

  remove(id: string): boolean {
    return this.results.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setResult(id: string, result: string): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.result = result;
    r.updated = Date.now();
    return true;
  }

  setScore(id: string, score: number): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.score = Math.max(0, Math.min(1, score));
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.results.values()) {
      r.active = true;
      r.hits = 0;
    }
    this.totalIndexed = 0;
    this.totalSearched = 0;
  }

  getStats(): SreStats {
    const all = Array.from(this.results.values());
    const scores = all.map(r => r.score);
    return {
      results: all.length,
      totalIndexed: this.totalIndexed,
      totalSearched: this.totalSearched,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueQueries: new Set(all.map(r => r.query).filter(q => q !== '')).size,
      uniqueResults: new Set(all.map(r => r.result)).size,
      avgScore: all.length > 0 ? Math.round((scores.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxScore: scores.length > 0 ? Math.max(...scores) : 0,
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
    };
  }

  getResult(id: string): SearchResult | undefined {
    return this.results.get(id);
  }

  getAllResults(): SearchResult[] {
    return Array.from(this.results.values());
  }

  hasResult(id: string): boolean {
    return this.results.has(id);
  }

  getCount(): number {
    return this.results.size;
  }

  getResult2(id: string): string | undefined {
    return this.results.get(id)?.result;
  }

  getQuery(id: string): string | undefined {
    return this.results.get(id)?.query;
  }

  getScore(id: string): number {
    return this.results.get(id)?.score ?? 0;
  }

  getHits(id: string): number {
    return this.results.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.results.get(id)?.active ?? false;
  }

  getActiveResults(): SearchResult[] {
    return Array.from(this.results.values()).filter(r => r.active);
  }

  getInactiveResults(): SearchResult[] {
    return Array.from(this.results.values()).filter(r => !r.active);
  }

  getAllResultsList(): string[] {
    return [...new Set(Array.from(this.results.values()).map(r => r.result))];
  }

  getNewest(): SearchResult | null {
    const all = Array.from(this.results.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): SearchResult | null {
    const all = Array.from(this.results.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.results.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.results.get(id)?.updated ?? 0;
  }

  getTotalIndexed(): number {
    return this.totalIndexed;
  }

  getTotalSearched(): number {
    return this.totalSearched;
  }

  clearAll(): void {
    this.results.clear();
    this.counter = 0;
    this.totalIndexed = 0;
    this.totalSearched = 0;
  }
}

export default SearchEngine;