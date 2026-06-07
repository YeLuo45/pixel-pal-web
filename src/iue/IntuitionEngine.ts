/**
 * Intuition Engine
 * generic-agent-design Intuition Engine - Guess + Refine + Confirm + Stats
 */

export type IntuitionStatus = 'guessed' | 'confirmed' | 'rejected';

export interface Intuition {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  status: IntuitionStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface IueStats {
  intuitions: number;
  totalGuessed: number;
  totalRefined: number;
  totalConfirmed: number;
  totalRejected: number;
  guessed: number;
  confirmed: number;
  rejected: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueQuestions: number;
  totalConfidence: number;
  avgConfidence: number;
  maxConfidence: number;
  minConfidence: number;
}

export class IntuitionEngine {
  private intuitions: Map<string, Intuition> = new Map();
  private counter = 0;
  private totalGuessed = 0;
  private totalRefined = 0;
  private totalConfirmed = 0;
  private totalRejected = 0;
  private totalConfidence = 0;

  guess(question: string, answer: string, confidence: number): string {
    const id = `iue-${++this.counter}`;
    this.intuitions.set(id, {
      id,
      question,
      answer,
      confidence: Math.max(0, Math.min(1, confidence)),
      status: 'guessed',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalGuessed++;
    this.totalConfidence += confidence;
    return id;
  }

  refine(id: string, confidence: number): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    if (!i.active) return false;
    i.confidence = Math.max(0, Math.min(1, confidence));
    i.updated = Date.now();
    i.hits++;
    this.totalRefined++;
    return true;
  }

  confirm(id: string): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    if (!i.active) return false;
    i.status = 'confirmed';
    i.updated = Date.now();
    i.hits++;
    this.totalConfirmed++;
    return true;
  }

  reject(id: string): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    if (!i.active) return false;
    i.status = 'rejected';
    i.updated = Date.now();
    i.hits++;
    this.totalRejected++;
    return true;
  }

  remove(id: string): boolean {
    return this.intuitions.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setQuestion(id: string, question: string): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    i.question = question;
    i.updated = Date.now();
    return true;
  }

  setAnswer(id: string, answer: string): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    i.answer = answer;
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const i of this.intuitions.values()) {
      i.status = 'guessed';
      i.confidence = 0.5;
      i.active = true;
      i.hits = 0;
    }
    this.totalGuessed = 0;
    this.totalRefined = 0;
    this.totalConfirmed = 0;
    this.totalRejected = 0;
    this.totalConfidence = 0;
  }

  getStats(): IueStats {
    const all = Array.from(this.intuitions.values());
    const confArr = all.map(i => i.confidence);
    return {
      intuitions: all.length,
      totalGuessed: this.totalGuessed,
      totalRefined: this.totalRefined,
      totalConfirmed: this.totalConfirmed,
      totalRejected: this.totalRejected,
      guessed: all.filter(i => i.status === 'guessed').length,
      confirmed: all.filter(i => i.status === 'confirmed').length,
      rejected: all.filter(i => i.status === 'rejected').length,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalHits: all.reduce((s, i) => s + i.hits, 0),
      uniqueQuestions: new Set(all.map(i => i.question)).size,
      totalConfidence: this.totalConfidence,
      avgConfidence: all.length > 0 ? Math.round((confArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxConfidence: confArr.length > 0 ? Math.max(...confArr) : 0,
      minConfidence: confArr.length > 0 ? Math.min(...confArr) : 0,
    };
  }

  getIntuition(id: string): Intuition | undefined {
    return this.intuitions.get(id);
  }

  getAllIntuitions(): Intuition[] {
    return Array.from(this.intuitions.values());
  }

  hasIntuition(id: string): boolean {
    return this.intuitions.has(id);
  }

  getCount(): number {
    return this.intuitions.size;
  }

  getQuestion(id: string): string | undefined {
    return this.intuitions.get(id)?.question;
  }

  getAnswer(id: string): string | undefined {
    return this.intuitions.get(id)?.answer;
  }

  getConfidence(id: string): number {
    return this.intuitions.get(id)?.confidence ?? 0;
  }

  getStatus(id: string): IntuitionStatus | undefined {
    return this.intuitions.get(id)?.status;
  }

  getHits(id: string): number {
    return this.intuitions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.intuitions.get(id)?.active ?? false;
  }

  isGuessed(id: string): boolean {
    return this.intuitions.get(id)?.status === 'guessed';
  }

  isConfirmed(id: string): boolean {
    return this.intuitions.get(id)?.status === 'confirmed';
  }

  isRejected(id: string): boolean {
    return this.intuitions.get(id)?.status === 'rejected';
  }

  getByStatus(status: IntuitionStatus): Intuition[] {
    return Array.from(this.intuitions.values()).filter(i => i.status === status);
  }

  getActiveIntuitions(): Intuition[] {
    return Array.from(this.intuitions.values()).filter(i => i.active);
  }

  getInactiveIntuitions(): Intuition[] {
    return Array.from(this.intuitions.values()).filter(i => !i.active);
  }

  getAllQuestions(): string[] {
    return [...new Set(Array.from(this.intuitions.values()).map(i => i.question))];
  }

  getNewest(): Intuition | null {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): Intuition | null {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getCreatedAt(id: string): number {
    return this.intuitions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.intuitions.get(id)?.updated ?? 0;
  }

  getTotalGuessed(): number {
    return this.totalGuessed;
  }

  getTotalRefined(): number {
    return this.totalRefined;
  }

  getTotalConfirmed(): number {
    return this.totalConfirmed;
  }

  getTotalRejected(): number {
    return this.totalRejected;
  }

  clearAll(): void {
    this.intuitions.clear();
    this.counter = 0;
    this.totalGuessed = 0;
    this.totalRefined = 0;
    this.totalConfirmed = 0;
    this.totalRejected = 0;
    this.totalConfidence = 0;
  }
}

export default IntuitionEngine;