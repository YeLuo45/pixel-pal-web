/**
 * Insight Engine
 * generic-agent-design Insight Engine - Generate + Query + Stats
 */

export interface Insight {
  id: string;
  source: string;
  text: string;
  confidence: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface IneStats2 {
  insights: number;
  totalGenerated: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueSources: number;
  avgConfidence: number;
  maxConfidence: number;
  minConfidence: number;
  avgTextLength: number;
  maxTextLength: number;
  minTextLength: number;
  avgSourceLength: number;
  maxSourceLength: number;
  minSourceLength: number;
}

export class InsightEngine {
  private insights: Map<string, Insight> = new Map();
  private counter = 0;
  private totalGenerated = 0;

  generate(source: string, text: string, confidence: number = 0.5): string {
    const id = `ine2-${++this.counter}`;
    this.insights.set(id, {
      id,
      source,
      text,
      confidence,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    this.totalGenerated++;
    return id;
  }

  query(id: string): Insight | undefined {
    const i = this.insights.get(id);
    if (!i) return undefined;
    if (!i.active) return undefined;
    i.hits++;
    i.updated = Date.now();
    return i;
  }

  remove(id: string): boolean {
    return this.insights.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.insights.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setConfidence(id: string, confidence: number): boolean {
    const i = this.insights.get(id);
    if (!i) return false;
    i.confidence = confidence;
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const i of this.insights.values()) {
      i.hits = 0;
      i.history = [];
      i.active = true;
    }
    this.totalGenerated = 0;
  }

  getStats(): IneStats2 {
    const all = Array.from(this.insights.values());
    const confValues = all.map(i => i.confidence);
    const textLengths = all.map(i => i.text.length);
    const sourceLengths = all.map(i => i.source.length);
    return {
      insights: all.length,
      totalGenerated: this.totalGenerated,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalHits: all.reduce((s, i) => s + i.hits, 0),
      uniqueSources: new Set(all.map(i => i.source)).size,
      avgConfidence: all.length > 0 ? Math.round((confValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxConfidence: confValues.length > 0 ? Math.max(...confValues) : 0,
      minConfidence: confValues.length > 0 ? Math.min(...confValues) : 0,
      avgTextLength: all.length > 0 ? Math.round((textLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTextLength: textLengths.length > 0 ? Math.max(...textLengths) : 0,
      minTextLength: textLengths.length > 0 ? Math.min(...textLengths) : 0,
      avgSourceLength: all.length > 0 ? Math.round((sourceLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSourceLength: sourceLengths.length > 0 ? Math.max(...sourceLengths) : 0,
      minSourceLength: sourceLengths.length > 0 ? Math.min(...sourceLengths) : 0,
    };
  }

  getInsight(id: string): Insight | undefined {
    return this.insights.get(id);
  }

  getAllInsights(): Insight[] {
    return Array.from(this.insights.values());
  }

  hasInsight(id: string): boolean {
    return this.insights.has(id);
  }

  getCount(): number {
    return this.insights.size;
  }

  getSource(id: string): string | undefined {
    return this.insights.get(id)?.source;
  }

  getText(id: string): string | undefined {
    return this.insights.get(id)?.text;
  }

  getConfidence(id: string): number {
    return this.insights.get(id)?.confidence ?? 0;
  }

  getTextLength(id: string): number {
    return this.insights.get(id)?.text.length ?? 0;
  }

  getSourceLength(id: string): number {
    return this.insights.get(id)?.source.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.insights.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.insights.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.insights.get(id)?.active ?? false;
  }

  getBySource(source: string): Insight[] {
    return Array.from(this.insights.values()).filter(i => i.source === source);
  }

  getActiveInsights(): Insight[] {
    return Array.from(this.insights.values()).filter(i => i.active);
  }

  getInactiveInsights(): Insight[] {
    return Array.from(this.insights.values()).filter(i => !i.active);
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.insights.values()).map(i => i.source))];
  }

  getSourceCount(): number {
    return this.getAllSources().length;
  }

  getByMinConfidence(min: number): Insight[] {
    return Array.from(this.insights.values()).filter(i => i.confidence >= min);
  }

  getMostConfident(): Insight | null {
    const all = Array.from(this.insights.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.confidence > max.confidence ? i : max);
  }

  getNewest(): Insight | null {
    const all = Array.from(this.insights.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): Insight | null {
    const all = Array.from(this.insights.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getCreatedAt(id: string): number {
    return this.insights.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.insights.get(id)?.updated ?? 0;
  }

  getTotalGenerated(): number {
    return this.totalGenerated;
  }

  clearAll(): void {
    this.insights.clear();
    this.counter = 0;
    this.totalGenerated = 0;
  }
}

export default InsightEngine;