/**
 * Curiosity Engine
 * generic-agent-design Curiosity Engine - Ask + Explore + Learn + Stats
 */

export type CuriosityLevel = 'low' | 'normal' | 'high' | 'extreme';

export interface Question {
  id: string;
  topic: string;
  text: string;
  level: CuriosityLevel;
  explored: number;
  learned: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CueStats {
  questions: number;
  totalAsked: number;
  totalExplored: number;
  totalLearned: number;
  low: number;
  normal: number;
  high: number;
  extreme: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTopics: number;
  totalTextLen: number;
  avgTextLen: number;
}

export class CuriosityEngine {
  private questions: Map<string, Question> = new Map();
  private counter = 0;
  private totalAsked = 0;
  private totalExplored = 0;
  private totalLearned = 0;
  private totalExploredTotal = 0;
  private totalLearnedTotal = 0;
  private totalTextLen = 0;

  ask(topic: string, text: string, level: CuriosityLevel = 'normal'): string {
    const id = `cue-${++this.counter}`;
    this.questions.set(id, {
      id,
      topic,
      text,
      level,
      explored: 0,
      learned: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAsked++;
    this.totalTextLen += text.length;
    return id;
  }

  explore(id: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    if (!q.active) return false;
    q.explored++;
    q.updated = Date.now();
    q.hits++;
    this.totalExplored++;
    this.totalExploredTotal++;
    return true;
  }

  learn(id: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    if (!q.active) return false;
    q.learned++;
    q.updated = Date.now();
    q.hits++;
    this.totalLearned++;
    this.totalLearnedTotal++;
    return true;
  }

  remove(id: string): boolean {
    return this.questions.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.active = active;
    q.updated = Date.now();
    return true;
  }

  setTopic(id: string, topic: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.topic = topic;
    q.updated = Date.now();
    return true;
  }

  setText(id: string, text: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.text = text;
    q.updated = Date.now();
    return true;
  }

  setLevel(id: string, level: CuriosityLevel): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.level = level;
    q.updated = Date.now();
    return true;
  }

  setExplored(id: string, explored: number): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.explored = explored;
    q.updated = Date.now();
    return true;
  }

  setLearned(id: string, learned: number): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.learned = learned;
    q.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const q of this.questions.values()) {
      q.explored = 0;
      q.learned = 0;
      q.active = true;
      q.hits = 0;
    }
    this.totalAsked = 0;
    this.totalExplored = 0;
    this.totalLearned = 0;
    this.totalExploredTotal = 0;
    this.totalLearnedTotal = 0;
    this.totalTextLen = 0;
  }

  getStats(): CueStats {
    const all = Array.from(this.questions.values());
    const lArr = all.map(q => q.text.length);
    return {
      questions: all.length,
      totalAsked: this.totalAsked,
      totalExplored: this.totalExplored,
      totalLearned: this.totalLearned,
      low: all.filter(q => q.level === 'low').length,
      normal: all.filter(q => q.level === 'normal').length,
      high: all.filter(q => q.level === 'high').length,
      extreme: all.filter(q => q.level === 'extreme').length,
      active: all.filter(q => q.active).length,
      inactive: all.filter(q => !q.active).length,
      totalHits: all.reduce((s, q) => s + q.hits, 0),
      uniqueTopics: new Set(all.map(q => q.topic)).size,
      totalExploredCount: this.totalExploredTotal,
      totalLearnedCount: this.totalLearnedTotal,
      totalTextLen: this.totalTextLen,
      avgTextLen: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getQuestion(id: string): Question | undefined {
    return this.questions.get(id);
  }

  getAllQuestions(): Question[] {
    return Array.from(this.questions.values());
  }

  hasQuestion(id: string): boolean {
    return this.questions.has(id);
  }

  getCount(): number {
    return this.questions.size;
  }

  getTopic(id: string): string | undefined {
    return this.questions.get(id)?.topic;
  }

  getText(id: string): string | undefined {
    return this.questions.get(id)?.text;
  }

  getLevel(id: string): CuriosityLevel | undefined {
    return this.questions.get(id)?.level;
  }

  getExplored(id: string): number {
    return this.questions.get(id)?.explored ?? 0;
  }

  getLearned(id: string): number {
    return this.questions.get(id)?.learned ?? 0;
  }

  getHits(id: string): number {
    return this.questions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.questions.get(id)?.active ?? false;
  }

  isLow(id: string): boolean {
    return this.questions.get(id)?.level === 'low';
  }

  isNormal(id: string): boolean {
    return this.questions.get(id)?.level === 'normal';
  }

  isHigh(id: string): boolean {
    return this.questions.get(id)?.level === 'high';
  }

  isExtreme(id: string): boolean {
    return this.questions.get(id)?.level === 'extreme';
  }

  getByLevel(level: CuriosityLevel): Question[] {
    return Array.from(this.questions.values()).filter(q => q.level === level);
  }

  getActiveQuestions(): Question[] {
    return Array.from(this.questions.values()).filter(q => q.active);
  }

  getInactiveQuestions(): Question[] {
    return Array.from(this.questions.values()).filter(q => !q.active);
  }

  getAllTopics(): string[] {
    return [...new Set(Array.from(this.questions.values()).map(q => q.topic))];
  }

  getNewest(): Question | null {
    const all = Array.from(this.questions.values());
    if (all.length === 0) return null;
    return all.reduce((max, q) => q.created > max.created ? q : max);
  }

  getOldest(): Question | null {
    const all = Array.from(this.questions.values());
    if (all.length === 0) return null;
    return all.reduce((min, q) => q.created < min.created ? q : min);
  }

  getCreatedAt(id: string): number {
    return this.questions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.questions.get(id)?.updated ?? 0;
  }

  getTotalAsked(): number {
    return this.totalAsked;
  }

  getTotalExplored(): number {
    return this.totalExplored;
  }

  getTotalLearned(): number {
    return this.totalLearned;
  }

  clearAll(): void {
    this.questions.clear();
    this.counter = 0;
    this.totalAsked = 0;
    this.totalExplored = 0;
    this.totalLearned = 0;
    this.totalExploredTotal = 0;
    this.totalLearnedTotal = 0;
    this.totalTextLen = 0;
  }
}

export default CuriosityEngine;