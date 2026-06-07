/**
 * Sentiment Engine
 * generic-agent-design Sentiment Engine - Score + Classify + Stats
 */

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface SentimentItem {
  id: string;
  text: string;
  score: number;
  sentiment: Sentiment;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SntStats {
  items: number;
  totalScored: number;
  totalClassified: number;
  positive: number;
  neutral: number;
  negative: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTexts: number;
  totalScore: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
  totalTextLen: number;
  avgTextLen: number;
}

function classify(score: number): Sentiment {
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

export class SentimentEngine {
  private items: Map<string, SentimentItem> = new Map();
  private counter = 0;
  private totalScored = 0;
  private totalClassified = 0;
  private totalScore = 0;
  private totalTextLen = 0;

  score(text: string, score: number): string {
    const id = `snt-${++this.counter}`;
    this.items.set(id, {
      id,
      text,
      score,
      sentiment: classify(score),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalScored++;
    this.totalScore += score;
    this.totalTextLen += text.length;
    return id;
  }

  classify(id: string, score: number): boolean {
    const s = this.items.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.score = score;
    s.sentiment = classify(score);
    s.updated = Date.now();
    s.hits++;
    this.totalClassified++;
    return true;
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.items.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setText(id: string, text: string): boolean {
    const s = this.items.get(id);
    if (!s) return false;
    s.text = text;
    s.updated = Date.now();
    return true;
  }

  setScore(id: string, score: number): boolean {
    const s = this.items.get(id);
    if (!s) return false;
    s.score = score;
    s.sentiment = classify(score);
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.items.values()) {
      s.score = 0;
      s.sentiment = 'neutral';
      s.active = true;
      s.hits = 0;
    }
    this.totalScored = 0;
    this.totalClassified = 0;
    this.totalScore = 0;
    this.totalTextLen = 0;
  }

  getStats(): SntStats {
    const all = Array.from(this.items.values());
    const sArr = all.map(s => s.score);
    const lArr = all.map(s => s.text.length);
    return {
      items: all.length,
      totalScored: this.totalScored,
      totalClassified: this.totalClassified,
      positive: all.filter(s => s.sentiment === 'positive').length,
      neutral: all.filter(s => s.sentiment === 'neutral').length,
      negative: all.filter(s => s.sentiment === 'negative').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueTexts: new Set(all.map(s => s.text)).size,
      totalScore: this.totalScore,
      avgScore: all.length > 0 ? Math.round((sArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxScore: sArr.length > 0 ? Math.max(...sArr) : 0,
      minScore: sArr.length > 0 ? Math.min(...sArr) : 0,
      totalTextLen: this.totalTextLen,
      avgTextLen: all.length > 0 ? Math.round((lArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getItem(id: string): SentimentItem | undefined {
    return this.items.get(id);
  }

  getAllItems(): SentimentItem[] {
    return Array.from(this.items.values());
  }

  hasItem(id: string): boolean {
    return this.items.has(id);
  }

  getCount(): number {
    return this.items.size;
  }

  getText(id: string): string | undefined {
    return this.items.get(id)?.text;
  }

  getScore(id: string): number {
    return this.items.get(id)?.score ?? 0;
  }

  getSentiment(id: string): Sentiment | undefined {
    return this.items.get(id)?.sentiment;
  }

  getHits(id: string): number {
    return this.items.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.items.get(id)?.active ?? false;
  }

  isPositive(id: string): boolean {
    return this.items.get(id)?.sentiment === 'positive';
  }

  isNeutral(id: string): boolean {
    return this.items.get(id)?.sentiment === 'neutral';
  }

  isNegative(id: string): boolean {
    return this.items.get(id)?.sentiment === 'negative';
  }

  getBySentiment(sentiment: Sentiment): SentimentItem[] {
    return Array.from(this.items.values()).filter(s => s.sentiment === sentiment);
  }

  getActiveItems(): SentimentItem[] {
    return Array.from(this.items.values()).filter(s => s.active);
  }

  getInactiveItems(): SentimentItem[] {
    return Array.from(this.items.values()).filter(s => !s.active);
  }

  getAllTexts(): string[] {
    return [...new Set(Array.from(this.items.values()).map(s => s.text))];
  }

  getNewest(): SentimentItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): SentimentItem | null {
    const all = Array.from(this.items.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.items.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.items.get(id)?.updated ?? 0;
  }

  getTotalScored(): number {
    return this.totalScored;
  }

  getTotalClassified(): number {
    return this.totalClassified;
  }

  clearAll(): void {
    this.items.clear();
    this.counter = 0;
    this.totalScored = 0;
    this.totalClassified = 0;
    this.totalScore = 0;
    this.totalTextLen = 0;
  }
}

export default SentimentEngine;