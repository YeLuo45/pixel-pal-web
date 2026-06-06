/**
 * Linter Engine
 * claude-code-design Linter Engine - Define + Check + Stats
 */

export type Severity = 'error' | 'warning' | 'info';

export interface LintRule {
  id: string;
  name: string;
  severity: Severity;
  violations: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface LinterStats {
  rules: number;
  errors: number;
  warnings: number;
  infos: number;
  totalViolations: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueSeverities: number;
  avgViolations: number;
  maxViolations: number;
  minViolations: number;
}

export class LinterEngine {
  private rules: Map<string, LintRule> = new Map();
  private counter = 0;
  private totalViolations = 0;

  define(name: string, severity: Severity = 'warning'): string {
    const id = `le-${++this.counter}`;
    this.rules.set(id, {
      id,
      name,
      severity,
      violations: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  check(id: string, count: number = 1): boolean {
    const r = this.rules.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.violations += count;
    for (let i = 0; i < count; i++) {
      r.history.push(Date.now());
    }
    r.updated = Date.now();
    r.hits++;
    this.totalViolations += count;
    return true;
  }

  reset(id: string): boolean {
    const r = this.rules.get(id);
    if (!r) return false;
    r.violations = 0;
    r.history = [];
    r.updated = Date.now();
    return true;
  }

  getStats(): LinterStats {
    const all = Array.from(this.rules.values());
    const violationValues = all.map(r => r.violations);
    return {
      rules: all.length,
      errors: all.filter(r => r.severity === 'error').length,
      warnings: all.filter(r => r.severity === 'warning').length,
      infos: all.filter(r => r.severity === 'info').length,
      totalViolations: this.totalViolations,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
      uniqueSeverities: new Set(all.map(r => r.severity)).size,
      avgViolations: all.length > 0 ? Math.round((violationValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxViolations: violationValues.length > 0 ? Math.max(...violationValues) : 0,
      minViolations: violationValues.length > 0 ? Math.min(...violationValues) : 0,
    };
  }

  getRule(id: string): LintRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): LintRule[] {
    return Array.from(this.rules.values());
  }

  removeRule(id: string): boolean {
    return this.rules.delete(id);
  }

  hasRule(id: string): boolean {
    return this.rules.has(id);
  }

  getCount(): number {
    return this.rules.size;
  }

  getName(id: string): string | undefined {
    return this.rules.get(id)?.name;
  }

  getSeverity(id: string): Severity | undefined {
    return this.rules.get(id)?.severity;
  }

  getViolations(id: string): number {
    return this.rules.get(id)?.violations ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.rules.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.rules.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.rules.get(id)?.active ?? false;
  }

  isError(id: string): boolean {
    return this.rules.get(id)?.severity === 'error';
  }

  isWarning(id: string): boolean {
    return this.rules.get(id)?.severity === 'warning';
  }

  isInfo(id: string): boolean {
    return this.rules.get(id)?.severity === 'info';
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.rules.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.rules.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setSeverity(id: string, severity: Severity): boolean {
    const r = this.rules.get(id);
    if (!r) return false;
    r.severity = severity;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.rules.values()) {
      r.violations = 0;
      r.hits = 0;
      r.history = [];
      r.active = true;
    }
    this.totalViolations = 0;
  }

  getByName(name: string): LintRule[] {
    return Array.from(this.rules.values()).filter(r => r.name === name);
  }

  getBySeverity(severity: Severity): LintRule[] {
    return Array.from(this.rules.values()).filter(r => r.severity === severity);
  }

  getErrorRules(): LintRule[] {
    return Array.from(this.rules.values()).filter(r => r.severity === 'error');
  }

  getWarningRules(): LintRule[] {
    return Array.from(this.rules.values()).filter(r => r.severity === 'warning');
  }

  getInfoRules(): LintRule[] {
    return Array.from(this.rules.values()).filter(r => r.severity === 'info');
  }

  getActiveRules(): LintRule[] {
    return Array.from(this.rules.values()).filter(r => r.active);
  }

  getInactiveRules(): LintRule[] {
    return Array.from(this.rules.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.rules.values()).map(r => r.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinViolations(min: number): LintRule[] {
    return Array.from(this.rules.values()).filter(r => r.violations >= min);
  }

  getMostViolations(): LintRule | null {
    const all = Array.from(this.rules.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.violations > max.violations ? r : max);
  }

  getNewest(): LintRule | null {
    const all = Array.from(this.rules.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): LintRule | null {
    const all = Array.from(this.rules.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.rules.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.rules.get(id)?.updated ?? 0;
  }

  getTotalViolations(): number {
    return this.totalViolations;
  }

  clearAll(): void {
    this.rules.clear();
    this.counter = 0;
    this.totalViolations = 0;
  }
}

export default LinterEngine;