/**
 * Knowledge Base
 * chatdev-design Knowledge Base - Add + Query + Update + Stats
 */

export interface Knowledge {
  id: string;
  topic: string;
  content: string;
  confidence: number;
  hits: number;
  created: number;
  updated: number;
  active: boolean;
}

export interface KBStats {
  entries: number;
  totalHits: number;
  topics: number;
  active: number;
  avgConfidence: number;
  avgHits: number;
}

export class KnowledgeBase {
  private entries: Map<string, Knowledge> = new Map();
  private counter = 0;

  add(topic: string, content: string, confidence: number): string {
    const id = `kb-${++this.counter}`;
    this.entries.set(id, {
      id,
      topic,
      content,
      confidence,
      hits: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
    });
    return id;
  }

  query(topic: string): Knowledge[] {
    const results: Knowledge[] = [];
    for (const e of this.entries.values()) {
      if (e.topic === topic && e.active) {
        e.hits++;
        results.push(e);
      }
    }
    return results;
  }

  update(id: string, content: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.content = content;
    e.updated = Date.now();
    return true;
  }

  getStats(): KBStats {
    const all = Array.from(this.entries.values());
    return {
      entries: all.length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      topics: new Set(all.map(e => e.topic)).size,
      active: all.filter(e => e.active).length,
      avgConfidence: all.length > 0 ? Math.round((all.reduce((s, e) => s + e.confidence, 0) / all.length) * 100) / 100 : 0,
      avgHits: all.length > 0 ? Math.round((all.reduce((s, e) => s + e.hits, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getEntry(id: string): Knowledge | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): Knowledge[] {
    return Array.from(this.entries.values());
  }

  removeEntry(id: string): boolean {
    return this.entries.delete(id);
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getTopic(id: string): string | undefined {
    return this.entries.get(id)?.topic;
  }

  getContent(id: string): string | undefined {
    return this.entries.get(id)?.content;
  }

  getConfidence(id: string): number {
    return this.entries.get(id)?.confidence ?? 0;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entries.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.active = active;
    return true;
  }

  setConfidence(id: string, confidence: number): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.confidence = confidence;
    e.updated = Date.now();
    return true;
  }

  setTopic(id: string, topic: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.topic = topic;
    e.updated = Date.now();
    return true;
  }

  resetHits(): void {
    for (const e of this.entries.values()) e.hits = 0;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.hits = 0;
      e.active = true;
    }
  }

  getByTopic(topic: string): Knowledge[] {
    return Array.from(this.entries.values()).filter(e => e.topic === topic);
  }

  getActiveEntries(): Knowledge[] {
    return Array.from(this.entries.values()).filter(e => e.active);
  }

  getInactiveEntries(): Knowledge[] {
    return Array.from(this.entries.values()).filter(e => !e.active);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.topic))];
  }

  getTopicCount(): number {
    return this.getAllTopics().length;
  }

  getByMinConfidence(min: number): Knowledge[] {
    return Array.from(this.entries.values()).filter(e => e.confidence >= min);
  }

  getByMaxConfidence(max: number): Knowledge[] {
    return Array.from(this.entries.values()).filter(e => e.confidence <= max);
  }

  getSortedByConfidence(): Knowledge[] {
    return [...Array.from(this.entries.values())].sort((a, b) => b.confidence - a.confidence);
  }

  getMostHit(): Knowledge | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.hits > max.hits ? e : max);
  }

  getHighestConfidence(): Knowledge | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.confidence > max.confidence ? e : max);
  }

  getNewest(): Knowledge | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): Knowledge | null {
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

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
  }
}

export default KnowledgeBase;