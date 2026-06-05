/**
 * Learning Module
 * generic-agent-design Learning Module - Record + Retrieve + Decay + Stats
 */

export interface Experience {
  id: string;
  context: string;
  outcome: string;
  score: number;
  decay: number;
  created: number;
  accessed: number;
  retrievals: number;
}

export interface LearningStats {
  experiences: number;
  total: number;
  avgScore: number;
  totalRetrievals: number;
}

export class LearningModule {
  private experiences: Map<string, Experience> = new Map();
  private totalRecorded = 0;
  private counter = 0;

  record(context: string, outcome: string, score: number): string {
    const id = `exp-${++this.counter}`;
    this.experiences.set(id, {
      id,
      context,
      outcome,
      score,
      decay: 1,
      created: Date.now(),
      accessed: Date.now(),
      retrievals: 0,
    });
    this.totalRecorded++;
    return id;
  }

  retrieve(threshold: number): Experience[] {
    const results: Experience[] = [];
    for (const exp of this.experiences.values()) {
      if (exp.score * exp.decay >= threshold) {
        exp.retrievals++;
        exp.accessed = Date.now();
        results.push(exp);
      }
    }
    return results.sort((a, b) => (b.score * b.decay) - (a.score * a.decay));
  }

  decay(): void {
    for (const exp of this.experiences.values()) {
      exp.decay = Math.max(0, exp.decay - 0.1);
    }
  }

  getStats(): LearningStats {
    const all = Array.from(this.experiences.values());
    return {
      experiences: all.length,
      total: this.totalRecorded,
      avgScore: all.length > 0 ? Math.round((all.reduce((s, e) => s + e.score, 0) / all.length) * 100) / 100 : 0,
      totalRetrievals: all.reduce((s, e) => s + e.retrievals, 0),
    };
  }

  getExperience(id: string): Experience | undefined {
    return this.experiences.get(id);
  }

  getAllExperiences(): Experience[] {
    return Array.from(this.experiences.values());
  }

  removeExperience(id: string): boolean {
    return this.experiences.delete(id);
  }

  hasExperience(id: string): boolean {
    return this.experiences.has(id);
  }

  getCount(): number {
    return this.experiences.size;
  }

  getContext(id: string): string | undefined {
    return this.experiences.get(id)?.context;
  }

  getOutcome(id: string): string | undefined {
    return this.experiences.get(id)?.outcome;
  }

  getScore(id: string): number {
    return this.experiences.get(id)?.score ?? 0;
  }

  getDecay(id: string): number {
    return this.experiences.get(id)?.decay ?? 0;
  }

  setDecay(id: string, decay: number): boolean {
    const e = this.experiences.get(id);
    if (!e) return false;
    e.decay = decay;
    return true;
  }

  setScore(id: string, score: number): boolean {
    const e = this.experiences.get(id);
    if (!e) return false;
    e.score = score;
    return true;
  }

  boost(id: string, amount: number): boolean {
    const e = this.experiences.get(id);
    if (!e) return false;
    e.score = Math.min(1, e.score + amount);
    return true;
  }

  penalize(id: string, amount: number): boolean {
    const e = this.experiences.get(id);
    if (!e) return false;
    e.score = Math.max(0, e.score - amount);
    return true;
  }

  getRetrievals(id: string): number {
    return this.experiences.get(id)?.retrievals ?? 0;
  }

  getRetrievalCount(): number {
    return this.getStats().totalRetrievals;
  }

  getCreatedAt(id: string): number {
    return this.experiences.get(id)?.created ?? 0;
  }

  getAccessedAt(id: string): number {
    return this.experiences.get(id)?.accessed ?? 0;
  }

  getByContext(context: string): Experience[] {
    return Array.from(this.experiences.values()).filter(e => e.context.includes(context));
  }

  getByOutcome(outcome: string): Experience[] {
    return Array.from(this.experiences.values()).filter(e => e.outcome.includes(outcome));
  }

  getHighScore(threshold: number): Experience[] {
    return Array.from(this.experiences.values()).filter(e => e.score >= threshold);
  }

  getLowScore(threshold: number): Experience[] {
    return Array.from(this.experiences.values()).filter(e => e.score < threshold);
  }

  getMostRetrieved(): Experience | null {
    const all = Array.from(this.experiences.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.retrievals > max.retrievals ? e : max);
  }

  getHighestScore(): Experience | null {
    const all = Array.from(this.experiences.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.score > max.score ? e : max);
  }

  getLowestScore(): Experience | null {
    const all = Array.from(this.experiences.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.score < min.score ? e : min);
  }

  getAvgDecay(): number {
    const all = Array.from(this.experiences.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((s, e) => s + e.decay, 0) / all.length) * 100) / 100;
  }

  resetAll(): void {
    for (const e of this.experiences.values()) {
      e.score = 0;
      e.decay = 1;
      e.retrievals = 0;
    }
  }

  clearAll(): void {
    this.experiences.clear();
    this.totalRecorded = 0;
    this.counter = 0;
  }
}

export default LearningModule;