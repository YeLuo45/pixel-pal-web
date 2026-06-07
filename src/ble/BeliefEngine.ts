/**
 * Belief Engine
 * generic-agent-design Belief Engine - Add + Revise + Stats
 */

export type BeliefStrength = 'weak' | 'moderate' | 'strong' | 'absolute';

export interface Belief {
  id: string;
  name: string;
  statement: string;
  strength: BeliefStrength;
  confidence: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface BleStats {
  beliefs: number;
  totalAdded: number;
  totalRevised: number;
  weak: number;
  moderate: number;
  strong: number;
  absolute: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalStatementLen: number;
  avgStatementLen: number;
  totalConfidence: number;
  avgConfidence: number;
  maxConfidence: number;
  minConfidence: number;
}

export class BeliefEngine {
  private beliefs: Map<string, Belief> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalRevised = 0;
  private totalStatementLen = 0;
  private totalConfidence = 0;

  add(name: string, statement: string, strength: BeliefStrength, confidence: number): string {
    const id = `ble-${++this.counter}`;
    this.beliefs.set(id, {
      id,
      name,
      statement,
      strength,
      confidence: Math.max(0, Math.min(1, confidence)),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalStatementLen += statement.length;
    this.totalConfidence += confidence;
    return id;
  }

  revise(id: string, confidence: number): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.confidence = Math.max(0, Math.min(1, confidence));
    b.updated = Date.now();
    b.hits++;
    this.totalRevised++;
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

  setName(id: string, name: string): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  setStatement(id: string, statement: string): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.statement = statement;
    b.updated = Date.now();
    return true;
  }

  setStrength(id: string, strength: BeliefStrength): boolean {
    const b = this.beliefs.get(id);
    if (!b) return false;
    b.strength = strength;
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
      b.active = true;
      b.hits = 0;
    }
    this.totalAdded = 0;
    this.totalRevised = 0;
    this.totalStatementLen = 0;
    this.totalConfidence = 0;
  }

  getStats(): BleStats {
    const all = Array.from(this.beliefs.values());
    const sArr = all.map(b => b.statement.length);
    const cArr = all.map(b => b.confidence);
    return {
      beliefs: all.length,
      totalAdded: this.totalAdded,
      totalRevised: this.totalRevised,
      weak: all.filter(b => b.strength === 'weak').length,
      moderate: all.filter(b => b.strength === 'moderate').length,
      strong: all.filter(b => b.strength === 'strong').length,
      absolute: all.filter(b => b.strength === 'absolute').length,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueNames: new Set(all.map(b => b.name)).size,
      totalStatementLen: this.totalStatementLen,
      avgStatementLen: all.length > 0 ? Math.round((sArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      totalConfidence: this.totalConfidence,
      avgConfidence: all.length > 0 ? Math.round((cArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxConfidence: cArr.length > 0 ? Math.max(...cArr) : 0,
      minConfidence: cArr.length > 0 ? Math.min(...cArr) : 0,
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

  getName(id: string): string | undefined {
    return this.beliefs.get(id)?.name;
  }

  getStatement(id: string): string | undefined {
    return this.beliefs.get(id)?.statement;
  }

  getStrength(id: string): BeliefStrength | undefined {
    return this.beliefs.get(id)?.strength;
  }

  getConfidence(id: string): number {
    return this.beliefs.get(id)?.confidence ?? 0;
  }

  getHits(id: string): number {
    return this.beliefs.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.beliefs.get(id)?.active ?? false;
  }

  isWeak(id: string): boolean {
    return this.beliefs.get(id)?.strength === 'weak';
  }

  isModerate(id: string): boolean {
    return this.beliefs.get(id)?.strength === 'moderate';
  }

  isStrong(id: string): boolean {
    return this.beliefs.get(id)?.strength === 'strong';
  }

  isAbsolute(id: string): boolean {
    return this.beliefs.get(id)?.strength === 'absolute';
  }

  getByStrength(strength: BeliefStrength): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.strength === strength);
  }

  getActiveBeliefs(): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => b.active);
  }

  getInactiveBeliefs(): Belief[] {
    return Array.from(this.beliefs.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.beliefs.values()).map(b => b.name))];
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

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalRevised(): number {
    return this.totalRevised;
  }

  clearAll(): void {
    this.beliefs.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalRevised = 0;
    this.totalStatementLen = 0;
    this.totalConfidence = 0;
  }
}

export default BeliefEngine;