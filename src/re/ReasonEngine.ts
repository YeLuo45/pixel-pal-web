/**
 * Reason Engine
 * generic-agent-design Reason Engine - Register + Validate + Stats
 */

export interface Reason {
  id: string;
  name: string;
  premises: string[];
  conclusion: string;
  valid: boolean;
  validations: number;
  invalidations: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
}

export interface RE6Stats {
  reasons: number;
  totalValid: number;
  totalInvalid: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgPremises: number;
  maxPremises: number;
  minPremises: number;
  validityRate: number;
}

export class ReasonEngine {
  private reasons: Map<string, Reason> = new Map();
  private counter = 0;
  private totalValid = 0;
  private totalInvalid = 0;

  register(name: string, premises: string[], conclusion: string): string {
    const id = `re-${++this.counter}`;
    this.reasons.set(id, {
      id,
      name,
      premises: [...premises],
      conclusion,
      valid: false,
      validations: 0,
      invalidations: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  validate(id: string, allPremisesTrue: boolean): boolean {
    const r = this.reasons.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.valid = allPremisesTrue;
    r.history.push(allPremisesTrue);
    r.updated = Date.now();
    r.hits++;
    if (allPremisesTrue) {
      r.validations++;
      this.totalValid++;
    } else {
      r.invalidations++;
      this.totalInvalid++;
    }
    return true;
  }

  reset(id: string): boolean {
    const r = this.reasons.get(id);
    if (!r) return false;
    r.valid = false;
    r.validations = 0;
    r.invalidations = 0;
    r.history = [];
    r.updated = Date.now();
    return true;
  }

  getStats(): RE6Stats {
    const all = Array.from(this.reasons.values());
    const premiseCounts = all.map(r => r.premises.length);
    const completed = this.totalValid + this.totalInvalid;
    return {
      reasons: all.length,
      totalValid: this.totalValid,
      totalInvalid: this.totalInvalid,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
      avgPremises: all.length > 0 ? Math.round((premiseCounts.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPremises: premiseCounts.length > 0 ? Math.max(...premiseCounts) : 0,
      minPremises: premiseCounts.length > 0 ? Math.min(...premiseCounts) : 0,
      validityRate: completed > 0 ? Math.round((this.totalValid / completed) * 100) / 100 : 0,
    };
  }

  getReason(id: string): Reason | undefined {
    return this.reasons.get(id);
  }

  getAllReasons(): Reason[] {
    return Array.from(this.reasons.values());
  }

  removeReason(id: string): boolean {
    return this.reasons.delete(id);
  }

  hasReason(id: string): boolean {
    return this.reasons.has(id);
  }

  getCount(): number {
    return this.reasons.size;
  }

  getName(id: string): string | undefined {
    return this.reasons.get(id)?.name;
  }

  getPremises(id: string): string[] {
    return [...(this.reasons.get(id)?.premises ?? [])];
  }

  getPremiseCount(id: string): number {
    return this.reasons.get(id)?.premises.length ?? 0;
  }

  getConclusion(id: string): string | undefined {
    return this.reasons.get(id)?.conclusion;
  }

  isValid(id: string): boolean {
    return this.reasons.get(id)?.valid ?? false;
  }

  getValidations(id: string): number {
    return this.reasons.get(id)?.validations ?? 0;
  }

  getInvalidations(id: string): number {
    return this.reasons.get(id)?.invalidations ?? 0;
  }

  getHistory(id: string): boolean[] {
    return [...(this.reasons.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.reasons.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.reasons.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.reasons.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.reasons.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setPremises(id: string, premises: string[]): boolean {
    const r = this.reasons.get(id);
    if (!r) return false;
    r.premises = [...premises];
    r.updated = Date.now();
    return true;
  }

  setConclusion(id: string, conclusion: string): boolean {
    const r = this.reasons.get(id);
    if (!r) return false;
    r.conclusion = conclusion;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.reasons.values()) {
      r.valid = false;
      r.validations = 0;
      r.invalidations = 0;
      r.hits = 0;
      r.history = [];
      r.active = true;
    }
    this.totalValid = 0;
    this.totalInvalid = 0;
  }

  getByName(name: string): Reason[] {
    return Array.from(this.reasons.values()).filter(r => r.name === name);
  }

  getValidReasons(): Reason[] {
    return Array.from(this.reasons.values()).filter(r => r.valid);
  }

  getInvalidReasons(): Reason[] {
    return Array.from(this.reasons.values()).filter(r => r.hits > 0 && !r.valid);
  }

  getActiveReasons(): Reason[] {
    return Array.from(this.reasons.values()).filter(r => r.active);
  }

  getInactiveReasons(): Reason[] {
    return Array.from(this.reasons.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.reasons.values()).map(r => r.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinPremises(min: number): Reason[] {
    return Array.from(this.reasons.values()).filter(r => r.premises.length >= min);
  }

  getMostPremises(): Reason | null {
    const all = Array.from(this.reasons.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.premises.length > max.premises.length ? r : max);
  }

  getNewest(): Reason | null {
    const all = Array.from(this.reasons.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Reason | null {
    const all = Array.from(this.reasons.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.reasons.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.reasons.get(id)?.updated ?? 0;
  }

  getTotalValid(): number {
    return this.totalValid;
  }

  getTotalInvalid(): number {
    return this.totalInvalid;
  }

  clearAll(): void {
    this.reasons.clear();
    this.counter = 0;
    this.totalValid = 0;
    this.totalInvalid = 0;
  }
}

export default ReasonEngine;