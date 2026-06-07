/**
 * Survey Engine
 * chatdev-design Survey Engine - AddQuestion + Answer + Stats
 */

export type SurveyStatus = 'draft' | 'open' | 'closed';

export interface Survey {
  id: string;
  question: string;
  answer: string;
  status: SurveyStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Sue2Stats {
  surveys: number;
  totalAdded: number;
  totalAnswered: number;
  draft: number;
  open: number;
  closed: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalQuestionLen: number;
  totalAnswerLen: number;
  avgQuestionLen: number;
  avgAnswerLen: number;
  uniqueQuestions: number;
  uniqueAnswers: number;
}

export class SurveyEngine {
  private surveys: Map<string, Survey> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalAnswered = 0;
  private totalQuestionLen = 0;
  private totalAnswerLen = 0;

  addQuestion(question: string): string {
    const id = `sue2-${++this.counter}`;
    this.surveys.set(id, {
      id,
      question,
      answer: '',
      status: 'draft',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalQuestionLen += question.length;
    return id;
  }

  answer(id: string, answer: string): boolean {
    const s = this.surveys.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.answer = answer;
    s.updated = Date.now();
    s.hits++;
    this.totalAnswered++;
    this.totalAnswerLen += answer.length;
    return true;
  }

  open(id: string): boolean {
    const s = this.surveys.get(id);
    if (!s) return false;
    s.status = 'open';
    s.updated = Date.now();
    return true;
  }

  close(id: string): boolean {
    const s = this.surveys.get(id);
    if (!s) return false;
    s.status = 'closed';
    s.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.surveys.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.surveys.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setQuestion(id: string, question: string): boolean {
    const s = this.surveys.get(id);
    if (!s) return false;
    s.question = question;
    s.updated = Date.now();
    return true;
  }

  setAnswer(id: string, answer: string): boolean {
    const s = this.surveys.get(id);
    if (!s) return false;
    s.answer = answer;
    s.updated = Date.now();
    return true;
  }

  setStatus(id: string, status: SurveyStatus): boolean {
    const s = this.surveys.get(id);
    if (!s) return false;
    s.status = status;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.surveys.values()) {
      s.status = 'draft';
      s.active = true;
      s.hits = 0;
    }
    this.totalAdded = 0;
    this.totalAnswered = 0;
    this.totalQuestionLen = 0;
    this.totalAnswerLen = 0;
  }

  getStats(): Sue2Stats {
    const all = Array.from(this.surveys.values());
    const qArr = all.map(s => s.question.length);
    const aArr = all.map(s => s.answer.length);
    return {
      surveys: all.length,
      totalAdded: this.totalAdded,
      totalAnswered: this.totalAnswered,
      draft: all.filter(s => s.status === 'draft').length,
      open: all.filter(s => s.status === 'open').length,
      closed: all.filter(s => s.status === 'closed').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      totalQuestionLen: this.totalQuestionLen,
      totalAnswerLen: this.totalAnswerLen,
      avgQuestionLen: all.length > 0 ? Math.round((qArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      avgAnswerLen: all.length > 0 ? Math.round((aArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      uniqueQuestions: new Set(all.map(s => s.question)).size,
      uniqueAnswers: new Set(all.map(s => s.answer).filter(a => a !== '')).size,
    };
  }

  getSurvey(id: string): Survey | undefined {
    return this.surveys.get(id);
  }

  getAllSurveys(): Survey[] {
    return Array.from(this.surveys.values());
  }

  hasSurvey(id: string): boolean {
    return this.surveys.has(id);
  }

  getCount(): number {
    return this.surveys.size;
  }

  getQuestion(id: string): string | undefined {
    return this.surveys.get(id)?.question;
  }

  getAnswer(id: string): string {
    return this.surveys.get(id)?.answer ?? '';
  }

  getStatus(id: string): SurveyStatus | undefined {
    return this.surveys.get(id)?.status;
  }

  getHits(id: string): number {
    return this.surveys.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.surveys.get(id)?.active ?? false;
  }

  isDraft(id: string): boolean {
    return this.surveys.get(id)?.status === 'draft';
  }

  isOpen(id: string): boolean {
    return this.surveys.get(id)?.status === 'open';
  }

  isClosed(id: string): boolean {
    return this.surveys.get(id)?.status === 'closed';
  }

  isAnswered(id: string): boolean {
    return (this.surveys.get(id)?.answer ?? '') !== '';
  }

  getByStatus(status: SurveyStatus): Survey[] {
    return Array.from(this.surveys.values()).filter(s => s.status === status);
  }

  getActiveSurveys(): Survey[] {
    return Array.from(this.surveys.values()).filter(s => s.active);
  }

  getInactiveSurveys(): Survey[] {
    return Array.from(this.surveys.values()).filter(s => !s.active);
  }

  getAnsweredSurveys(): Survey[] {
    return Array.from(this.surveys.values()).filter(s => s.answer !== '');
  }

  getUnansweredSurveys(): Survey[] {
    return Array.from(this.surveys.values()).filter(s => s.answer === '');
  }

  getAllQuestions(): string[] {
    return [...new Set(Array.from(this.surveys.values()).map(s => s.question))];
  }

  getAllAnswers(): string[] {
    return [...new Set(Array.from(this.surveys.values()).map(s => s.answer).filter(a => a !== ''))];
  }

  getNewest(): Survey | null {
    const all = Array.from(this.surveys.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Survey | null {
    const all = Array.from(this.surveys.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.surveys.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.surveys.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalAnswered(): number {
    return this.totalAnswered;
  }

  clearAll(): void {
    this.surveys.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalAnswered = 0;
    this.totalQuestionLen = 0;
    this.totalAnswerLen = 0;
  }
}

export default SurveyEngine;