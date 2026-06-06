/**
 * Reasoner Engine
 * generic-agent-design Reasoner Engine - AddPremise + Infer + Reset + Stats
 */

export type ReasonStatus = 'pending' | 'inferred' | 'failed';

export interface Premise {
  id: string;
  statement: string;
  confidence: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Inference {
  id: string;
  conclusion: string;
  sources: string[];
  confidence: number;
  status: ReasonStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface RreStats {
  premises: number;
  inferences: number;
  totalInferred: number;
  totalFailed: number;
  pending: number;
  inferred: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgPremiseConfidence: number;
  maxPremiseConfidence: number;
  minPremiseConfidence: number;
  avgInferenceConfidence: number;
  uniqueStatements: number;
  uniqueConclusions: number;
}

export class ReasonerEngine {
  private premises: Map<string, Premise> = new Map();
  private inferences: Map<string, Inference> = new Map();
  private counter = 0;
  private inferCounter = 0;
  private totalInferred = 0;
  private totalFailed = 0;

  addPremise(statement: string, confidence: number = 0.5): string {
    const id = `rre-p-${++this.counter}`;
    this.premises.set(id, {
      id,
      statement,
      confidence: Math.max(0, Math.min(1, confidence)),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  infer(conclusion: string, sourceIds: string[] = []): string {
    const id = `rre-i-${++this.inferCounter}`;
    const sources = sourceIds.filter(sid => this.premises.has(sid));
    let avgConf = 0.5;
    if (sources.length > 0) {
      avgConf = sources.reduce((s, sid) => s + (this.premises.get(sid)?.confidence ?? 0), 0) / sources.length;
    }
    this.inferences.set(id, {
      id,
      conclusion,
      sources,
      confidence: avgConf,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  complete(id: string): boolean {
    const i = this.inferences.get(id);
    if (!i) return false;
    if (i.status !== 'pending') return false;
    i.status = 'inferred';
    i.updated = Date.now();
    i.hits++;
    this.totalInferred++;
    return true;
  }

  fail(id: string): boolean {
    const i = this.inferences.get(id);
    if (!i) return false;
    i.status = 'failed';
    i.updated = Date.now();
    i.hits++;
    this.totalFailed++;
    return true;
  }

  removePremise(id: string): boolean {
    return this.premises.delete(id);
  }

  removeInference(id: string): boolean {
    return this.inferences.delete(id);
  }

  setActivePremise(id: string, active: boolean): boolean {
    const p = this.premises.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setActiveInference(id: string, active: boolean): boolean {
    const i = this.inferences.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.premises.values()) {
      p.active = true;
      p.hits = 0;
    }
    for (const i of this.inferences.values()) {
      i.status = 'pending';
      i.active = true;
      i.hits = 0;
    }
    this.totalInferred = 0;
    this.totalFailed = 0;
  }

  getStats(): RreStats {
    const allPremises = Array.from(this.premises.values());
    const allInferences = Array.from(this.inferences.values());
    const preConf = allPremises.map(p => p.confidence);
    const infConf = allInferences.map(i => i.confidence);
    return {
      premises: allPremises.length,
      inferences: allInferences.length,
      totalInferred: this.totalInferred,
      totalFailed: this.totalFailed,
      pending: allInferences.filter(i => i.status === 'pending').length,
      inferred: allInferences.filter(i => i.status === 'inferred').length,
      failed: allInferences.filter(i => i.status === 'failed').length,
      active: allPremises.filter(p => p.active).length + allInferences.filter(i => i.active).length,
      inactive: allPremises.filter(p => !p.active).length + allInferences.filter(i => !i.active).length,
      totalHits: allPremises.reduce((s, p) => s + p.hits, 0) + allInferences.reduce((s, i) => s + i.hits, 0),
      avgPremiseConfidence: allPremises.length > 0 ? Math.round((preConf.reduce((s, v) => s + v, 0) / allPremises.length) * 100) / 100 : 0,
      maxPremiseConfidence: preConf.length > 0 ? Math.max(...preConf) : 0,
      minPremiseConfidence: preConf.length > 0 ? Math.min(...preConf) : 0,
      avgInferenceConfidence: allInferences.length > 0 ? Math.round((infConf.reduce((s, v) => s + v, 0) / allInferences.length) * 100) / 100 : 0,
      uniqueStatements: new Set(allPremises.map(p => p.statement)).size,
      uniqueConclusions: new Set(allInferences.map(i => i.conclusion)).size,
    };
  }

  getPremise(id: string): Premise | undefined {
    return this.premises.get(id);
  }

  getAllPremises(): Premise[] {
    return Array.from(this.premises.values());
  }

  getInference(id: string): Inference | undefined {
    return this.inferences.get(id);
  }

  getAllInferences(): Inference[] {
    return Array.from(this.inferences.values());
  }

  getCount(): number {
    return this.premises.size + this.inferences.size;
  }

  getPremiseCount(): number {
    return this.premises.size;
  }

  getInferenceCount(): number {
    return this.inferences.size;
  }

  getStatement(id: string): string | undefined {
    return this.premises.get(id)?.statement;
  }

  getConfidence(id: string): number {
    return this.premises.get(id)?.confidence ?? 0;
  }

  getConclusion(id: string): string | undefined {
    return this.inferences.get(id)?.conclusion;
  }

  getInferenceStatus(id: string): ReasonStatus | undefined {
    return this.inferences.get(id)?.status;
  }

  getHits(id: string): number {
    return this.premises.get(id)?.hits ?? this.inferences.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.premises.get(id)?.active ?? this.inferences.get(id)?.active ?? false;
  }

  isInferred(id: string): boolean {
    return this.inferences.get(id)?.status === 'inferred';
  }

  isFailed(id: string): boolean {
    return this.inferences.get(id)?.status === 'failed';
  }

  isPending(id: string): boolean {
    return this.inferences.get(id)?.status === 'pending';
  }

  clearAll(): void {
    this.premises.clear();
    this.inferences.clear();
    this.counter = 0;
    this.inferCounter = 0;
    this.totalInferred = 0;
    this.totalFailed = 0;
  }
}

export default ReasonerEngine;