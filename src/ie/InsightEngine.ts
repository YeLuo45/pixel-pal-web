/**
 * Insight Engine
 * generic-agent-design Insight Engine - Generate + Verify + Stats
 */

export interface Insight {
  id: string;
  topic: string;
  content: string;
  confidence: number;
  verified: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
}

export interface IEstats {
  insights: number;
  verified: number;
  unverified: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgConfidence: number;
  maxConfidence: number;
  minConfidence: number;
  verifyRate: number;
}

export class InsightEngine {
  private insights: Map<string, Insight> = new Map();
  private counter = 0;

  generate(topic: string, content: string, confidence: number = 0.5): string {
    const id = `ie-${++this.counter}`;
    this.insights.set(id, {
      id,
      topic,
      content,
      confidence,
      verified: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  verify(id: string, verified: boolean): boolean {
    const i = this.insights.get(id);
    if (!i) return false;
    if (!i.active) return false;
    i.verified = verified;
    i.history.push(verified);
    i.updated = Date.now();
    i.hits++;
    return true;
  }

  setConfidence(id: string, confidence: number): boolean {
    const i = this.insights.get(id);
    if (!i) return false;
    if (!i.active) return false;
    i.confidence = confidence;
    i.updated = Date.now();
    return true;
  }

  getStats(): IEstats {
    const all = Array.from(this.insights.values());
    const confValues = all.map(i => i.confidence);
    return {
      insights: all.length,
      verified: all.filter(i => i.verified).length,
      unverified: all.filter(i => !i.verified).length,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalHits: all.reduce((s, i) => s + i.hits, 0),
      avgConfidence: all.length > 0 ? Math.round((confValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxConfidence: confValues.length > 0 ? Math.max(...confValues) : 0,
      minConfidence: confValues.length > 0 ? Math.min(...confValues) : 0,
      verifyRate: all.length > 0 ? Math.round((all.filter(i => i.verified).length / all.length) * 100) / 100 : 0,
    };
  }

  getInsight(id: string): Insight | undefined {
    return this.insights.get(id);
  }

  getAllInsights(): Insight[] {
    return Array.from(this.insights.values());
  }

  removeInsight(id: string): boolean {
    return this.insights.delete(id);
  }

  hasInsight(id: string): boolean {
    return this.insights.has(id);
  }

  getCount(): number {
    return this.insights.size;
  }

  getTopic(id: string): string | undefined {
    return this.insights.get(id)?.topic;
  }

  getContent(id: string): string | undefined {
    return this.insights.get(id)?.content;
  }

  getConfidence(id: string): number {
    return this.insights.get(id)?.confidence ?? 0;
  }

  getHistory(id: string): boolean[] {
    return [...(this.insights.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.insights.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.insights.get(id)?.active ?? false;
  }

  isVerified(id: string): boolean {
    return this.insights.get(id)?.verified ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.insights.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setTopic(id: string, topic: string): boolean {
    const i = this.insights.get(id);
    if (!i) return false;
    i.topic = topic;
    i.updated = Date.now();
    return true;
  }

  setContent(id: string, content: string): boolean {
    const i = this.insights.get(id);
    if (!i) return false;
    i.content = content;
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const i of this.insights.values()) {
      i.verified = false;
      i.hits = 0;
      i.history = [];
      i.active = true;
    }
  }

  getByTopic(topic: string): Insight[] {
    return Array.from(this.insights.values()).filter(i => i.topic === topic);
  }

  getVerifiedInsights(): Insight[] {
    return Array.from(this.insights.values()).filter(i => i.verified);
  }

  getUnverifiedInsights(): Insight[] {
    return Array.from(this.insights.values()).filter(i => !i.verified);
  }

  getActiveInsights(): Insight[] {
    return Array.from(this.insights.values()).filter(i => i.active);
  }

  getInactiveInsights(): Insight[] {
    return Array.from(this.insights.values()).filter(i => !i.active);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.insights.values()).map(i => i.topic))];
  }

  getTopicCount(): number {
    return this.getAllTopics().length;
  }

  getByMinConfidence(min: number): Insight[] {
    return Array.from(this.insights.values()).filter(i => i.confidence >= min);
  }

  getMostConfidence(): Insight | null {
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

  clearAll(): void {
    this.insights.clear();
    this.counter = 0;
  }
}

export default InsightEngine;