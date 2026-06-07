/**
 * Knowledge Engine
 * generic-agent-design Knowledge Engine - AddFact + Verify + Forget + Stats
 */

export type KnowledgeConfidence = 'low' | 'medium' | 'high' | 'certain';

export interface KnowledgeFact {
  id: string;
  statement: string;
  confidence: KnowledgeConfidence;
  verified: number;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface KneStats {
  facts: number;
  totalAdded: number;
  totalVerified: number;
  totalForgotten: number;
  low: number;
  medium: number;
  high: number;
  certain: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalVerifiedSum: number;
  totalStatementLen: number;
  avgStatementLen: number;
  maxStatementLen: number;
}

export class KnowledgeEngine {
  private facts: Map<string, KnowledgeFact> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalVerified = 0;
  private totalForgotten = 0;
  private totalStatementLen = 0;

  addFact(statement: string, confidence: KnowledgeConfidence = 'medium'): string {
    const id = `kne-${++this.counter}`;
    this.facts.set(id, {
      id,
      statement,
      confidence,
      verified: 0,
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalStatementLen += statement.length;
    return id;
  }

  verify(id: string): boolean {
    const f = this.facts.get(id);
    if (!f) return false;
    if (!f.active) return false;
    f.verified++;
    f.updated = Date.now();
    f.hits++;
    this.totalVerified++;
    return true;
  }

  forget(id: string): boolean {
    const f = this.facts.get(id);
    if (!f) return false;
    f.active = false;
    f.updated = Date.now();
    this.totalForgotten++;
    return true;
  }

  remove(id: string): boolean {
    return this.facts.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const f = this.facts.get(id);
    if (!f) return false;
    f.active = active;
    f.updated = Date.now();
    return true;
  }

  setStatement(id: string, statement: string): boolean {
    const f = this.facts.get(id);
    if (!f) return false;
    f.statement = statement;
    f.updated = Date.now();
    return true;
  }

  setConfidence(id: string, confidence: KnowledgeConfidence): boolean {
    const f = this.facts.get(id);
    if (!f) return false;
    f.confidence = confidence;
    f.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const f of this.facts.values()) {
      f.verified = 0;
      f.active = true;
      f.hits = 0;
    }
    this.totalAdded = 0;
    this.totalVerified = 0;
    this.totalForgotten = 0;
    this.totalStatementLen = 0;
  }

  getStats(): KneStats {
    const all = Array.from(this.facts.values());
    const sArr = all.map(f => f.statement.length);
    return {
      facts: all.length,
      totalAdded: this.totalAdded,
      totalVerified: this.totalVerified,
      totalForgotten: this.totalForgotten,
      low: all.filter(f => f.confidence === 'low').length,
      medium: all.filter(f => f.confidence === 'medium').length,
      high: all.filter(f => f.confidence === 'high').length,
      certain: all.filter(f => f.confidence === 'certain').length,
      active: all.filter(f => f.active).length,
      inactive: all.filter(f => !f.active).length,
      totalHits: all.reduce((s, f) => s + f.hits, 0),
      totalVerifiedSum: all.reduce((s, f) => s + f.verified, 0),
      totalStatementLen: this.totalStatementLen,
      avgStatementLen: all.length > 0 ? Math.round((sArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxStatementLen: sArr.length > 0 ? Math.max(...sArr) : 0,
    };
  }

  getFact(id: string): KnowledgeFact | undefined {
    return this.facts.get(id);
  }

  getAllFacts(): KnowledgeFact[] {
    return Array.from(this.facts.values());
  }

  hasFact(id: string): boolean {
    return this.facts.has(id);
  }

  getCount(): number {
    return this.facts.size;
  }

  getStatement(id: string): string | undefined {
    return this.facts.get(id)?.statement;
  }

  getConfidence(id: string): KnowledgeConfidence | undefined {
    return this.facts.get(id)?.confidence;
  }

  getVerified(id: string): number {
    return this.facts.get(id)?.verified ?? 0;
  }

  getHits(id: string): number {
    return this.facts.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.facts.get(id)?.active ?? false;
  }

  isLow(id: string): boolean {
    return this.facts.get(id)?.confidence === 'low';
  }

  isMedium(id: string): boolean {
    return this.facts.get(id)?.confidence === 'medium';
  }

  isHigh(id: string): boolean {
    return this.facts.get(id)?.confidence === 'high';
  }

  isCertain(id: string): boolean {
    return this.facts.get(id)?.confidence === 'certain';
  }

  getByConfidence(confidence: KnowledgeConfidence): KnowledgeFact[] {
    return Array.from(this.facts.values()).filter(f => f.confidence === confidence);
  }

  getActiveFacts(): KnowledgeFact[] {
    return Array.from(this.facts.values()).filter(f => f.active);
  }

  getInactiveFacts(): KnowledgeFact[] {
    return Array.from(this.facts.values()).filter(f => !f.active);
  }

  getNewest(): KnowledgeFact | null {
    const all = Array.from(this.facts.values());
    if (all.length === 0) return null;
    return all.reduce((max, f) => f.created > max.created ? f : max);
  }

  getOldest(): KnowledgeFact | null {
    const all = Array.from(this.facts.values());
    if (all.length === 0) return null;
    return all.reduce((min, f) => f.created < min.created ? f : min);
  }

  getCreatedAt(id: string): number {
    return this.facts.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.facts.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalVerified(): number {
    return this.totalVerified;
  }

  getTotalForgotten(): number {
    return this.totalForgotten;
  }

  clearAll(): void {
    this.facts.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalVerified = 0;
    this.totalForgotten = 0;
    this.totalStatementLen = 0;
  }
}

export default KnowledgeEngine;