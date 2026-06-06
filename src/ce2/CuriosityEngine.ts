/**
 * Curiosity Engine
 * generic-agent-design Curiosity Engine - Ask + Answer + Explore + Stats
 */

export interface Question {
  id: string;
  text: string;
  answered: boolean;
  explorations: string[];
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface CE3Stats {
  questions: number;
  answered: number;
  pending: number;
  active: number;
  inactive: number;
  totalExplorations: number;
  totalHits: number;
  avgExplorations: number;
  answerRate: number;
}

export class CuriosityEngine {
  private questions: Map<string, Question> = new Map();
  private counter = 0;

  ask(text: string): string {
    const id = `ce2-${++this.counter}`;
    this.questions.set(id, {
      id,
      text,
      answered: false,
      explorations: [],
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  answer(id: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    if (!q.active) return false;
    if (q.answered) return false;
    q.answered = true;
    q.updated = Date.now();
    q.hits++;
    return true;
  }

  explore(id: string, info: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    if (!q.active) return false;
    q.explorations.push(info);
    q.updated = Date.now();
    q.hits++;
    return true;
  }

  unanswer(id: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    if (!q.answered) return false;
    q.answered = false;
    q.updated = Date.now();
    return true;
  }

  getStats(): CE3Stats {
    const all = Array.from(this.questions.values());
    return {
      questions: all.length,
      answered: all.filter(q => q.answered).length,
      pending: all.filter(q => !q.answered).length,
      active: all.filter(q => q.active).length,
      inactive: all.filter(q => !q.active).length,
      totalExplorations: all.reduce((s, q) => s + q.explorations.length, 0),
      totalHits: all.reduce((s, q) => s + q.hits, 0),
      avgExplorations: all.length > 0 ? Math.round((all.reduce((s, q) => s + q.explorations.length, 0) / all.length) * 100) / 100 : 0,
      answerRate: all.length > 0 ? Math.round((all.filter(q => q.answered).length / all.length) * 100) / 100 : 0,
    };
  }

  getQuestion(id: string): Question | undefined {
    return this.questions.get(id);
  }

  getAllQuestions(): Question[] {
    return Array.from(this.questions.values());
  }

  removeQuestion(id: string): boolean {
    return this.questions.delete(id);
  }

  hasQuestion(id: string): boolean {
    return this.questions.has(id);
  }

  getCount(): number {
    return this.questions.size;
  }

  getText(id: string): string | undefined {
    return this.questions.get(id)?.text;
  }

  getExplorations(id: string): string[] {
    return [...(this.questions.get(id)?.explorations ?? [])];
  }

  getExplorationCount(id: string): number {
    return this.questions.get(id)?.explorations.length ?? 0;
  }

  getHits(id: string): number {
    return this.questions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.questions.get(id)?.active ?? false;
  }

  isAnswered(id: string): boolean {
    return this.questions.get(id)?.answered ?? false;
  }

  isPending(id: string): boolean {
    return !this.isAnswered(id);
  }

  setActive(id: string, active: boolean): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.active = active;
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

  resetAll(): void {
    for (const q of this.questions.values()) {
      q.answered = false;
      q.explorations = [];
      q.hits = 0;
      q.active = true;
    }
  }

  getAnsweredQuestions(): Question[] {
    return Array.from(this.questions.values()).filter(q => q.answered);
  }

  getPendingQuestions(): Question[] {
    return Array.from(this.questions.values()).filter(q => !q.answered);
  }

  getActiveQuestions(): Question[] {
    return Array.from(this.questions.values()).filter(q => q.active);
  }

  getInactiveQuestions(): Question[] {
    return Array.from(this.questions.values()).filter(q => !q.active);
  }

  getByMinExplorations(min: number): Question[] {
    return Array.from(this.questions.values()).filter(q => q.explorations.length >= min);
  }

  getMostExplorations(): Question | null {
    const all = Array.from(this.questions.values());
    if (all.length === 0) return null;
    return all.reduce((max, q) => q.explorations.length > max.explorations.length ? q : max);
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

  clearAll(): void {
    this.questions.clear();
    this.counter = 0;
  }
}

export default CuriosityEngine;