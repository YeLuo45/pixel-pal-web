/**
 * Refactor Engine
 * claude-code-design Refactor Engine - AddRule + Apply + Stats
 */

export interface Refactor {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  applied: number;
  created: number;
  updated: number;
  hits: number;
  active: boolean;
  history: string[];
}

export interface REStats {
  rules: number;
  totalApplied: number;
  totalHits: number;
  active: number;
  inactive: number;
  avgApplied: number;
}

export class RefactorEngine {
  private rules: Map<string, Refactor> = new Map();
  private counter = 0;

  addRule(name: string, pattern: string, replacement: string): string {
    const id = `re-${++this.counter}`;
    this.rules.set(id, {
      id,
      name,
      pattern,
      replacement,
      applied: 0,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      active: true,
      history: [],
    });
    return id;
  }

  apply(id: string, code: string): string {
    const r = this.rules.get(id);
    if (!r) return code;
    if (!r.active) return code;
    try {
      const regex = new RegExp(r.pattern, 'g');
      const result = code.replace(regex, r.replacement);
      if (result !== code) {
        r.applied++;
        r.history.push(code);
      }
      r.hits++;
      r.updated = Date.now();
      return result;
    } catch {
      return code;
    }
  }

  applyAll(code: string): string {
    let result = code;
    for (const r of this.rules.values()) {
      if (r.active) {
        result = this.apply(r.id, result);
      }
    }
    return result;
  }

  getStats(): REStats {
    const all = Array.from(this.rules.values());
    return {
      rules: all.length,
      totalApplied: all.reduce((s, r) => s + r.applied, 0),
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      avgApplied: all.length > 0 ? Math.round((all.reduce((s, r) => s + r.applied, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getRule(id: string): Refactor | undefined {
    return this.rules.get(id);
  }

  getAllRules(): Refactor[] {
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

  getPattern(id: string): string | undefined {
    return this.rules.get(id)?.pattern;
  }

  getReplacement(id: string): string | undefined {
    return this.rules.get(id)?.replacement;
  }

  getApplied(id: string): number {
    return this.rules.get(id)?.applied ?? 0;
  }

  getHits(id: string): number {
    return this.rules.get(id)?.hits ?? 0;
  }

  getHistory(id: string): string[] {
    return [...(this.rules.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.rules.get(id)?.active ?? false;
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

  setPattern(id: string, pattern: string): boolean {
    const r = this.rules.get(id);
    if (!r) return false;
    r.pattern = pattern;
    r.updated = Date.now();
    return true;
  }

  setReplacement(id: string, replacement: string): boolean {
    const r = this.rules.get(id);
    if (!r) return false;
    r.replacement = replacement;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.rules.values()) {
      r.applied = 0;
      r.hits = 0;
      r.history = [];
      r.active = true;
    }
  }

  getByName(name: string): Refactor[] {
    return Array.from(this.rules.values()).filter(r => r.name === name);
  }

  getActiveRules(): Refactor[] {
    return Array.from(this.rules.values()).filter(r => r.active);
  }

  getInactiveRules(): Refactor[] {
    return Array.from(this.rules.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.rules.values()).map(r => r.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinApplied(min: number): Refactor[] {
    return Array.from(this.rules.values()).filter(r => r.applied >= min);
  }

  getMostApplied(): Refactor | null {
    const all = Array.from(this.rules.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.applied > max.applied ? r : max);
  }

  getNewest(): Refactor | null {
    const all = Array.from(this.rules.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Refactor | null {
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

  clearAll(): void {
    this.rules.clear();
    this.counter = 0;
  }
}

export default RefactorEngine;