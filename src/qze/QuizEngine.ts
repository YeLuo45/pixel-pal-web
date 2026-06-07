/**
 * Quiz Engine
 * chatdev-design Quiz Engine - Add + Answer + Score + Stats
 */

export interface QuizQuestion {
  id: string;
  text: string;
  answer: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface QuizStats {
  questions: number;
  totalAdded: number;
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTexts: number;
  uniqueAnswers: number;
}

export class QuizEngine {
  private questions: Map<string, QuizQuestion> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalAnswered = 0;
  private totalCorrect = 0;
  private totalIncorrect = 0;

  add(text: string, answer: string): string {
    const id = `qze-${++this.counter}`;
    this.questions.set(id, {
      id,
      text,
      answer,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  answer(id: string, given: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    if (!q.active) return false;
    q.updated = Date.now();
    q.hits++;
    this.totalAnswered++;
    if (q.answer.toLowerCase() === given.toLowerCase()) this.totalCorrect++;
    else this.totalIncorrect++;
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

  setText(id: string, text: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.text = text;
    q.updated = Date.now();
    return true;
  }

  setAnswer(id: string, answer: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    q.answer = answer;
    q.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const q of this.questions.values()) {
      q.active = true;
      q.hits = 0;
    }
    this.totalAdded = 0;
    this.totalAnswered = 0;
    this.totalCorrect = 0;
    this.totalIncorrect = 0;
  }

  getStats(): QuizStats {
    const all = Array.from(this.questions.values());
    return {
      questions: all.length,
      totalAdded: this.totalAdded,
      totalAnswered: this.totalAnswered,
      totalCorrect: this.totalCorrect,
      totalIncorrect: this.totalIncorrect,
      active: all.filter(q => q.active).length,
      inactive: all.filter(q => !q.active).length,
      totalHits: all.reduce((s, q) => s + q.hits, 0),
      uniqueTexts: new Set(all.map(q => q.text)).size,
      uniqueAnswers: new Set(all.map(q => q.answer)).size,
    };
  }

  getQuestion(id: string): QuizQuestion | undefined {
    return this.questions.get(id);
  }

  getAllQuestions(): QuizQuestion[] {
    return Array.from(this.questions.values());
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

  getAnswer(id: string): string | undefined {
    return this.questions.get(id)?.answer;
  }

  getHits(id: string): number {
    return this.questions.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.questions.get(id)?.active ?? false;
  }

  getActiveQuestions(): QuizQuestion[] {
    return Array.from(this.questions.values()).filter(q => q.active);
  }

  getInactiveQuestions(): QuizQuestion[] {
    return Array.from(this.questions.values()).filter(q => !q.active);
  }

  getAllTexts(): string[] {
    return [...new Set(Array.from(this.questions.values()).map(q => q.text))];
  }

  getAllAnswers(): string[] {
    return [...new Set(Array.from(this.questions.values()).map(q => q.answer))];
  }

  check(id: string, given: string): boolean {
    const q = this.questions.get(id);
    if (!q) return false;
    return q.answer.toLowerCase() === given.toLowerCase();
  }

  getNewest(): QuizQuestion | null {
    const all = Array.from(this.questions.values());
    if (all.length === 0) return null;
    return all.reduce((max, q) => q.created > max.created ? q : max);
  }

  getOldest(): QuizQuestion | null {
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalAnswered(): number {
    return this.totalAnswered;
  }

  getTotalCorrect(): number {
    return this.totalCorrect;
  }

  getTotalIncorrect(): number {
    return this.totalIncorrect;
  }

  clearAll(): void {
    this.questions.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalAnswered = 0;
    this.totalCorrect = 0;
    this.totalIncorrect = 0;
  }
}

export default QuizEngine;