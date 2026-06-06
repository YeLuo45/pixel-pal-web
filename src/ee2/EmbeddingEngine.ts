/**
 * Embedding Engine
 * chatdev-design Embedding Engine - Store + Search + Remove + Stats
 */

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? dot / denom : 0;
}

export interface Embedding {
  id: string;
  text: string;
  vector: number[];
  dimension: number;
  source: string;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface Ee2Stats {
  embeddings: number;
  totalDimension: number;
  sources: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueSources: number;
  uniqueTexts: number;
  avgDimension: number;
  maxDimension: number;
  minDimension: number;
  totalSearches: number;
  avgVectorLength: number;
}

export class EmbeddingEngine {
  private embeddings: Map<string, Embedding> = new Map();
  private counter = 0;
  private totalSearches = 0;

  store(text: string, vector: number[], source: string = 'default'): string {
    const id = `ee2-${++this.counter}`;
    this.embeddings.set(id, {
      id,
      text,
      vector: [...vector],
      dimension: vector.length,
      source,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  search(query: number[], limit: number = 5): string[] {
    const all = Array.from(this.embeddings.values()).filter(e => e.active);
    const scored = all.map(e => ({
      id: e.id,
      score: cosineSimilarity(query, e.vector),
    }));
    scored.sort((a, b) => b.score - a.score);
    this.totalSearches++;
    return scored.slice(0, limit).map(s => s.id);
  }

  remove(id: string): boolean {
    return this.embeddings.delete(id);
  }

  reset(id: string): boolean {
    const e = this.embeddings.get(id);
    if (!e) return false;
    e.hits = 0;
    e.history = [];
    e.updated = Date.now();
    return true;
  }

  getStats(): Ee2Stats {
    const all = Array.from(this.embeddings.values());
    const dimValues = all.map(e => e.dimension);
    const vectorLengths = all.map(e => e.vector.length);
    return {
      embeddings: all.length,
      totalDimension: dimValues.reduce((s, v) => s + v, 0),
      sources: new Set(all.map(e => e.source)).size,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueSources: new Set(all.map(e => e.source)).size,
      uniqueTexts: new Set(all.map(e => e.text)).size,
      avgDimension: all.length > 0 ? Math.round((dimValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxDimension: dimValues.length > 0 ? Math.max(...dimValues) : 0,
      minDimension: dimValues.length > 0 ? Math.min(...dimValues) : 0,
      totalSearches: this.totalSearches,
      avgVectorLength: all.length > 0 ? Math.round((vectorLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getEmbedding(id: string): Embedding | undefined {
    return this.embeddings.get(id);
  }

  getAllEmbeddings(): Embedding[] {
    return Array.from(this.embeddings.values());
  }

  hasEmbedding(id: string): boolean {
    return this.embeddings.has(id);
  }

  getCount(): number {
    return this.embeddings.size;
  }

  getText(id: string): string | undefined {
    return this.embeddings.get(id)?.text;
  }

  getVector(id: string): number[] | undefined {
    return [...(this.embeddings.get(id)?.vector ?? [])];
  }

  getDimension(id: string): number {
    return this.embeddings.get(id)?.dimension ?? 0;
  }

  getSource(id: string): string | undefined {
    return this.embeddings.get(id)?.source;
  }

  getHistory(id: string): number[] {
    return [...(this.embeddings.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.embeddings.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.embeddings.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.embeddings.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  setText(id: string, text: string): boolean {
    const e = this.embeddings.get(id);
    if (!e) return false;
    e.text = text;
    e.updated = Date.now();
    return true;
  }

  setSource(id: string, source: string): boolean {
    const e = this.embeddings.get(id);
    if (!e) return false;
    e.source = source;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.embeddings.values()) {
      e.hits = 0;
      e.history = [];
      e.active = true;
    }
    this.totalSearches = 0;
  }

  getByText(text: string): Embedding[] {
    return Array.from(this.embeddings.values()).filter(e => e.text === text);
  }

  getBySource(source: string): Embedding[] {
    return Array.from(this.embeddings.values()).filter(e => e.source === source);
  }

  getActiveEmbeddings(): Embedding[] {
    return Array.from(this.embeddings.values()).filter(e => e.active);
  }

  getInactiveEmbeddings(): Embedding[] {
    return Array.from(this.embeddings.values()).filter(e => !e.active);
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.embeddings.values()).map(e => e.source))];
  }

  getSourceCount(): number {
    return this.getAllSources().length;
  }

  getAllTexts(): string[] {
    return [...new Set(Array.from(this.embeddings.values()).map(e => e.text))];
  }

  getTextCount(): number {
    return this.getAllTexts().length;
  }

  getByMinDimension(min: number): Embedding[] {
    return Array.from(this.embeddings.values()).filter(e => e.dimension >= min);
  }

  getNewest(): Embedding | null {
    const all = Array.from(this.embeddings.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): Embedding | null {
    const all = Array.from(this.embeddings.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.embeddings.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.embeddings.get(id)?.updated ?? 0;
  }

  getTotalSearches(): number {
    return this.totalSearches;
  }

  clearAll(): void {
    this.embeddings.clear();
    this.counter = 0;
    this.totalSearches = 0;
  }
}

export default EmbeddingEngine;