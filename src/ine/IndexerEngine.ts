/**
 * Indexer Engine
 * claude-code-design Indexer Engine - Index + Search + Stats
 */

export interface IndexEntry {
  id: string;
  term: string;
  documentId: string;
  position: number;
  frequency: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface IneStats {
  entries: number;
  totalSearches: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTerms: number;
  uniqueDocuments: number;
  avgFrequency: number;
  maxFrequency: number;
  minFrequency: number;
  avgPosition: number;
  maxPosition: number;
  minPosition: number;
}

export class IndexerEngine {
  private entries: Map<string, IndexEntry> = new Map();
  private counter = 0;
  private totalSearches = 0;

  index(term: string, documentId: string, position: number = 0): string {
    const id = `ine-${++this.counter}`;
    this.entries.set(id, {
      id,
      term,
      documentId,
      position,
      frequency: 1,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  search(term: string): IndexEntry[] {
    this.totalSearches++;
    return Array.from(this.entries.values()).filter(e => e.term === term && e.active);
  }

  searchByDocument(documentId: string): IndexEntry[] {
    return Array.from(this.entries.values()).filter(e => e.documentId === documentId && e.active);
  }

  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  increment(id: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.frequency++;
    e.updated = Date.now();
    e.hits++;
    return true;
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.frequency = 1;
      e.hits = 0;
      e.active = true;
    }
    this.totalSearches = 0;
  }

  getStats(): IneStats {
    const all = Array.from(this.entries.values());
    const freqValues = all.map(e => e.frequency);
    const posValues = all.map(e => e.position);
    return {
      entries: all.length,
      totalSearches: this.totalSearches,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueTerms: new Set(all.map(e => e.term)).size,
      uniqueDocuments: new Set(all.map(e => e.documentId)).size,
      avgFrequency: all.length > 0 ? Math.round((freqValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxFrequency: freqValues.length > 0 ? Math.max(...freqValues) : 0,
      minFrequency: freqValues.length > 0 ? Math.min(...freqValues) : 0,
      avgPosition: all.length > 0 ? Math.round((posValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPosition: posValues.length > 0 ? Math.max(...posValues) : 0,
      minPosition: posValues.length > 0 ? Math.min(...posValues) : 0,
    };
  }

  getEntry(id: string): IndexEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): IndexEntry[] {
    return Array.from(this.entries.values());
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getTerm(id: string): string | undefined {
    return this.entries.get(id)?.term;
  }

  getDocumentId(id: string): string | undefined {
    return this.entries.get(id)?.documentId;
  }

  getPosition(id: string): number {
    return this.entries.get(id)?.position ?? 0;
  }

  getFrequency(id: string): number {
    return this.entries.get(id)?.frequency ?? 0;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entries.get(id)?.active ?? false;
  }

  getByTerm(term: string): IndexEntry[] {
    return Array.from(this.entries.values()).filter(e => e.term === term);
  }

  getByDocumentAll(documentId: string): IndexEntry[] {
    return Array.from(this.entries.values()).filter(e => e.documentId === documentId);
  }

  getActiveEntries(): IndexEntry[] {
    return Array.from(this.entries.values()).filter(e => e.active);
  }

  getInactiveEntries(): IndexEntry[] {
    return Array.from(this.entries.values()).filter(e => !e.active);
  }

  getAllTerms(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.term))];
  }

  getTermCount(): number {
    return this.getAllTerms().length;
  }

  getAllDocuments(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.documentId))];
  }

  getDocumentCount(): number {
    return this.getAllDocuments().length;
  }

  getByMinFrequency(min: number): IndexEntry[] {
    return Array.from(this.entries.values()).filter(e => e.frequency >= min);
  }

  getMostFrequent(): IndexEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.frequency > max.frequency ? e : max);
  }

  getNewest(): IndexEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): IndexEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.entries.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.entries.get(id)?.updated ?? 0;
  }

  getTotalSearches(): number {
    return this.totalSearches;
  }

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
    this.totalSearches = 0;
  }
}

export default IndexerEngine;