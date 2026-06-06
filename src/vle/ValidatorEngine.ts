/**
 * Validator Engine
 * claude-code-design Validator Engine - Define + Validate + Reset + Stats
 */

function checkRule(rule: string, value: string): boolean {
  switch (rule) {
    case 'non-empty':
      return value.length > 0;
    case 'numeric':
      return /^\d+$/.test(value);
    case 'alpha':
      return /^[a-zA-Z]+$/.test(value);
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    default:
      return false;
  }
}

export interface Validator {
  id: string;
  name: string;
  rule: string;
  passed: number;
  failed: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface VleStats {
  validators: number;
  totalPassed: number;
  totalFailed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueRules: number;
  nonEmpty: number;
  numeric: number;
  alpha: number;
  email: number;
  passRate: number;
  avgPassed: number;
  maxPassed: number;
  minPassed: number;
  avgRuleLength: number;
}

export class ValidatorEngine {
  private validators: Map<string, Validator> = new Map();
  private counter = 0;
  private totalPassed = 0;
  private totalFailed = 0;

  define(name: string, rule: string = 'non-empty'): string {
    const id = `vle-${++this.counter}`;
    this.validators.set(id, {
      id,
      name,
      rule,
      passed: 0,
      failed: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  validate(id: string, value: string): boolean {
    const v = this.validators.get(id);
    if (!v) return false;
    if (!v.active) return false;
    const ok = checkRule(v.rule, value);
    if (ok) {
      v.passed++;
      this.totalPassed++;
    } else {
      v.failed++;
      this.totalFailed++;
    }
    v.history.push(ok ? 1 : 0);
    v.updated = Date.now();
    v.hits++;
    return ok;
  }

  reset(id: string): boolean {
    const v = this.validators.get(id);
    if (!v) return false;
    v.passed = 0;
    v.failed = 0;
    v.history = [];
    v.updated = Date.now();
    return true;
  }

  getStats(): VleStats {
    const all = Array.from(this.validators.values());
    const passedValues = all.map(v => v.passed);
    const ruleLengths = all.map(v => v.rule.length);
    const totalChecks = this.totalPassed + this.totalFailed;
    return {
      validators: all.length,
      totalPassed: this.totalPassed,
      totalFailed: this.totalFailed,
      active: all.filter(v => v.active).length,
      inactive: all.filter(v => !v.active).length,
      totalHits: all.reduce((s, v) => s + v.hits, 0),
      uniqueNames: new Set(all.map(v => v.name)).size,
      uniqueRules: new Set(all.map(v => v.rule)).size,
      nonEmpty: all.filter(v => v.rule === 'non-empty').length,
      numeric: all.filter(v => v.rule === 'numeric').length,
      alpha: all.filter(v => v.rule === 'alpha').length,
      email: all.filter(v => v.rule === 'email').length,
      passRate: totalChecks > 0 ? Math.round((this.totalPassed / totalChecks) * 100) / 100 : 0,
      avgPassed: all.length > 0 ? Math.round((passedValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPassed: passedValues.length > 0 ? Math.max(...passedValues) : 0,
      minPassed: passedValues.length > 0 ? Math.min(...passedValues) : 0,
      avgRuleLength: all.length > 0 ? Math.round((ruleLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getValidator(id: string): Validator | undefined {
    return this.validators.get(id);
  }

  getAllValidators(): Validator[] {
    return Array.from(this.validators.values());
  }

  removeValidator(id: string): boolean {
    return this.validators.delete(id);
  }

  hasValidator(id: string): boolean {
    return this.validators.has(id);
  }

  getCount(): number {
    return this.validators.size;
  }

  getName(id: string): string | undefined {
    return this.validators.get(id)?.name;
  }

  getRule(id: string): string | undefined {
    return this.validators.get(id)?.rule;
  }

  getRuleLength(id: string): number {
    return this.validators.get(id)?.rule.length ?? 0;
  }

  getPassed(id: string): number {
    return this.validators.get(id)?.passed ?? 0;
  }

  getFailed(id: string): number {
    return this.validators.get(id)?.failed ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.validators.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.validators.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.validators.get(id)?.active ?? false;
  }

  isNonEmpty(id: string): boolean {
    return this.validators.get(id)?.rule === 'non-empty';
  }

  isNumeric(id: string): boolean {
    return this.validators.get(id)?.rule === 'numeric';
  }

  isAlpha(id: string): boolean {
    return this.validators.get(id)?.rule === 'alpha';
  }

  isEmail(id: string): boolean {
    return this.validators.get(id)?.rule === 'email';
  }

  setActive(id: string, active: boolean): boolean {
    const v = this.validators.get(id);
    if (!v) return false;
    v.active = active;
    v.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const v = this.validators.get(id);
    if (!v) return false;
    v.name = name;
    v.updated = Date.now();
    return true;
  }

  setRule(id: string, rule: string): boolean {
    const v = this.validators.get(id);
    if (!v) return false;
    v.rule = rule;
    v.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const v of this.validators.values()) {
      v.passed = 0;
      v.failed = 0;
      v.hits = 0;
      v.history = [];
      v.active = true;
    }
    this.totalPassed = 0;
    this.totalFailed = 0;
  }

  getByName(name: string): Validator[] {
    return Array.from(this.validators.values()).filter(v => v.name === name);
  }

  getByRule(rule: string): Validator[] {
    return Array.from(this.validators.values()).filter(v => v.rule === rule);
  }

  getNonEmptyValidators(): Validator[] {
    return Array.from(this.validators.values()).filter(v => v.rule === 'non-empty');
  }

  getNumericValidators(): Validator[] {
    return Array.from(this.validators.values()).filter(v => v.rule === 'numeric');
  }

  getAlphaValidators(): Validator[] {
    return Array.from(this.validators.values()).filter(v => v.rule === 'alpha');
  }

  getEmailValidators(): Validator[] {
    return Array.from(this.validators.values()).filter(v => v.rule === 'email');
  }

  getActiveValidators(): Validator[] {
    return Array.from(this.validators.values()).filter(v => v.active);
  }

  getInactiveValidators(): Validator[] {
    return Array.from(this.validators.values()).filter(v => !v.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.validators.values()).map(v => v.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinPassed(min: number): Validator[] {
    return Array.from(this.validators.values()).filter(v => v.passed >= min);
  }

  getMostPassed(): Validator | null {
    const all = Array.from(this.validators.values());
    if (all.length === 0) return null;
    return all.reduce((max, v) => v.passed > max.passed ? v : max);
  }

  getNewest(): Validator | null {
    const all = Array.from(this.validators.values());
    if (all.length === 0) return null;
    return all.reduce((max, v) => v.created > max.created ? v : max);
  }

  getOldest(): Validator | null {
    const all = Array.from(this.validators.values());
    if (all.length === 0) return null;
    return all.reduce((min, v) => v.created < min.created ? v : min);
  }

  getCreatedAt(id: string): number {
    return this.validators.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.validators.get(id)?.updated ?? 0;
  }

  getTotalPassed(): number {
    return this.totalPassed;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.validators.clear();
    this.counter = 0;
    this.totalPassed = 0;
    this.totalFailed = 0;
  }
}

export default ValidatorEngine;