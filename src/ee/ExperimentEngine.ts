/**
 * Experiment Engine
 * generic-agent-design Experiment Engine - Design + Run + AddTrial + Stats
 */

export type ExperimentResult = 'pending' | 'confirmed' | 'rejected';

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  result: ExperimentResult;
  trials: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: ExperimentResult[];
}

export interface EEstats {
  experiments: number;
  confirmed: number;
  rejected: number;
  pending: number;
  active: number;
  inactive: number;
  totalTrials: number;
  avgTrials: number;
  totalHits: number;
  confirmRate: number;
}

export class ExperimentEngine {
  private experiments: Map<string, Experiment> = new Map();
  private counter = 0;

  design(name: string, hypothesis: string): string {
    const id = `ee-${++this.counter}`;
    this.experiments.set(id, {
      id,
      name,
      hypothesis,
      result: 'pending',
      trials: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: ['pending'],
    });
    return id;
  }

  run(id: string, confirmed: boolean): boolean {
    const e = this.experiments.get(id);
    if (!e) return false;
    if (!e.active) return false;
    if (e.result !== 'pending') return false;
    e.result = confirmed ? 'confirmed' : 'rejected';
    e.updated = Date.now();
    e.history.push(e.result);
    e.hits++;
    return true;
  }

  addTrial(id: string): boolean {
    const e = this.experiments.get(id);
    if (!e) return false;
    if (!e.active) return false;
    e.trials++;
    e.updated = Date.now();
    e.hits++;
    return true;
  }

  reset(id: string): boolean {
    const e = this.experiments.get(id);
    if (!e) return false;
    e.result = 'pending';
    e.trials = 0;
    e.history = ['pending'];
    e.updated = Date.now();
    return true;
  }

  getStats(): EEstats {
    const all = Array.from(this.experiments.values());
    const finished = all.filter(e => e.result !== 'pending');
    return {
      experiments: all.length,
      confirmed: all.filter(e => e.result === 'confirmed').length,
      rejected: all.filter(e => e.result === 'rejected').length,
      pending: all.filter(e => e.result === 'pending').length,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalTrials: all.reduce((s, e) => s + e.trials, 0),
      avgTrials: all.length > 0 ? Math.round((all.reduce((s, e) => s + e.trials, 0) / all.length) * 100) / 100 : 0,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      confirmRate: finished.length > 0 ? Math.round((all.filter(e => e.result === 'confirmed').length / finished.length) * 100) / 100 : 0,
    };
  }

  getExperiment(id: string): Experiment | undefined {
    return this.experiments.get(id);
  }

  getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  removeExperiment(id: string): boolean {
    return this.experiments.delete(id);
  }

  hasExperiment(id: string): boolean {
    return this.experiments.has(id);
  }

  getCount(): number {
    return this.experiments.size;
  }

  getName(id: string): string | undefined {
    return this.experiments.get(id)?.name;
  }

  getHypothesis(id: string): string | undefined {
    return this.experiments.get(id)?.hypothesis;
  }

  getResult(id: string): ExperimentResult | undefined {
    return this.experiments.get(id)?.result;
  }

  getTrials(id: string): number {
    return this.experiments.get(id)?.trials ?? 0;
  }

  getHistory(id: string): ExperimentResult[] {
    return [...(this.experiments.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.experiments.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.experiments.get(id)?.active ?? false;
  }

  isConfirmed(id: string): boolean {
    return this.experiments.get(id)?.result === 'confirmed';
  }

  isRejected(id: string): boolean {
    return this.experiments.get(id)?.result === 'rejected';
  }

  isPending(id: string): boolean {
    return this.experiments.get(id)?.result === 'pending';
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.experiments.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const e = this.experiments.get(id);
    if (!e) return false;
    e.name = name;
    e.updated = Date.now();
    return true;
  }

  setHypothesis(id: string, hypothesis: string): boolean {
    const e = this.experiments.get(id);
    if (!e) return false;
    e.hypothesis = hypothesis;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.experiments.values()) {
      e.result = 'pending';
      e.trials = 0;
      e.hits = 0;
      e.history = ['pending'];
      e.active = true;
    }
  }

  getByName(name: string): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => e.name === name);
  }

  getByResult(result: ExperimentResult): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => e.result === result);
  }

  getActiveExperiments(): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => e.active);
  }

  getInactiveExperiments(): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => !e.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.experiments.values()).map(e => e.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinTrials(min: number): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => e.trials >= min);
  }

  getMostTrials(): Experiment | null {
    const all = Array.from(this.experiments.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.trials > max.trials ? e : max);
  }

  getNewest(): Experiment | null {
    const all = Array.from(this.experiments.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): Experiment | null {
    const all = Array.from(this.experiments.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.experiments.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.experiments.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.experiments.clear();
    this.counter = 0;
  }
}

export default ExperimentEngine;