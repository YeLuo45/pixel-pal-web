/**
 * Belief Engine
 * generic-agent-design Belief Engine - Set + Strengthen + Weaken + Stats
 */

export interface Belief {
  id: string;
  proposition: string;
  confidence: number;
  evidence: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface BfeStats {
  beliefs: number;
  totalStrengthens: number;
  totalWeakens: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniquePropositions: number;
  avgConfidence: number;
  maxConfidence: number;
  minConfidence: number;
  avgEvidence: number;
  maxEvidence: number;
  minEvidence: number;
}

export class BeliefEngine {
  private beliefs: Map<string, Belief> = new Map();
  private counter = 0;
  private totalStrengthens = 0;
  private totalWeakens = 0;

  set(proposition: string, confidence: number = 0.5, evidence: number = 0): string {
    const id = `bfe-${++this.counter}`;
    this.beliefs.set(id, {
      id,
      proposition,
      confidence: Math.max(0, Math.min(1, confidence)),
      evidence,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  strengthen(id: string, amount: number = 0.1): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.confidence = Math.min(1, b.confidence + amount);
    b.evidence++;
    b.updated = Date.now();
    b.hits++;
    this.totalStrengthens++;
    return true;
  }

  weaken(id: string, amount: number = 0.1): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.confidence = Math.max(0, b.confidence - amount);
    if (b.evidence > 0) b.evidence--;
    b.updated = Date.now();
    b.hits++;
    this.totalWeakens++;
    return true;
  }

  remove(id: string): boolean {
    return this.beliefs.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setConfidence(id: string, confidence: number): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.confidence = Math.max(0, Math.min(1, confidence));
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.beliefs.values()) {
      b.confidence = 0.5;
      b.evidence = 0;
      b.hits = 0;
      b.active = true;
    }
    this.totalStrengthens = 0;
    this.totalWeakens = 0;
  }

  getStats(): BfeStats {
    const all = Array.from(this.beliefs.values());
    const confValues = all.map(b => b.confidence);
    const evValues = all.map(b => b.evidence);
    return {
      beliefs: all.length,
      totalStrengthens: this.totalStrengthens,
      totalWeakens: this.totalWeakens,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniquePropositions: new Set(all.map(b => b.proposition)).size,
      avgConfidence: all.length > 0 ? Math.round((confValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxConfidence: confValues.length > 0 ? Math.max(...confValues) : 0,
      minConfidence: confValues.length > 0 ? Math.min(...confValues) : 0,
      avgEvidence: all.length > 0 ? Math.round((evValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxEvidence: evValues.length > 0 ? Math.max(...evValues) : 0,
      minEvidence: evValues.length > 0 ? Math.min(...evValues) : 0,
    };
  }

  getBelief(id: string): Belief | undefined {
    return this.beliefs.get(id);
  }

  getAllBeliefs(): Belief[] {
    return Array.from(this.beliefs.values());
  }

  hasBelief(id: string): boolean {
    return this.beliefs.has(id);
  }

  getCount(): number {
    return this.beliefs.size;
  }

  getProposition(id: string): string | undefined {
    return this.beliefs.get(id)?.proposition;
  }

  getConfidence(id: string): number {
    return this.beliefs.get(id)?.confidence ?? 0;
  }

  getEvidence(id: string): number {
    return this.beliefs.get(id)?.evidence ?? 0;
  }

  getHits(id: string): number {
    return this.beliefs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.beliefs.get(id)?.active ?? false;
  }

  getActiveBeliefs(): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.active);
  }

  getInactiveBeliefs(): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => !b.active);
  }

  getAllPropositions(): string[] {
    return [...new Set(Array.from(this.beliefs.values()).map(b => b.proposition))];
  }

  getPropositionCount(): number {
    return this.getAllPropositions().length;
  }

  getByMinConfidence(min: number): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.confidence >= min);
  }

  getByMinEvidence(min: number): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.evidence >= min);
  }

  getMostConfident(): Belief | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.confidence > max.confidence ? b : max);
  }

  getNewest(): Belief | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Belief | null {
    const all = Array.from(this.beliefs.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.beliefs.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.beliefs.get(id)?.updated ?? 0;
  }

  getTotalStrengthens(): number {
    return this.totalStrengthens;
  }

  getTotalWeakens(): number {
    return this.totalWeakens;
  }

  clearAll(): void {
    this.beliefs.clear();
    this.counter = 0;
    this.totalStrengthens = 0;
    this.totalWeakens = 0;
  }
}

export default BeliefEngine;