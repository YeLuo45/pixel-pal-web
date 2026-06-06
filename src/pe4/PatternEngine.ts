/**
 * Pattern Engine
 * chatdev-design Pattern Engine - Register + Match + Stats
 */

export interface Pattern {
  id: string;
  name: string;
  regex: string;
  matches: number;
  misses: number;
  lastMatch: string | null;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
}

export interface PE5Stats {
  patterns: number;
  totalMatches: number;
  totalMisses: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgMatches: number;
  uniqueNames: number;
  uniqueRegex: number;
  matchRate: number;
}

export class PatternEngine {
  private patterns: Map<string, Pattern> = new Map();
  private counter = 0;
  private totalMatches = 0;
  private totalMisses = 0;

  register(name: string, regex: string): string {
    const id = `pe4-${++this.counter}`;
    this.patterns.set(id, {
      id,
      name,
      regex,
      matches: 0,
      misses: 0,
      lastMatch: null,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  match(id: string, input: string): boolean {
    const p = this.patterns.get(id);
    if (!p) return false;
    if (!p.active) return false;
    let result = false;
    try {
      const r = new RegExp(p.regex);
      result = r.test(input);
    } catch {
      result = false;
    }
    if (result) {
      p.matches++;
      p.lastMatch = input;
      this.totalMatches++;
    } else {
      p.misses++;
      this.totalMisses++;
    }
    p.history.push(result);
    p.updated = Date.now();
    p.hits++;
    return result;
  }

  getStats(): PE5Stats {
    const all = Array.from(this.patterns.values());
    const total = this.totalMatches + this.totalMisses;
    return {
      patterns: all.length,
      totalMatches: this.totalMatches,
      totalMisses: this.totalMisses,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      avgMatches: all.length > 0 ? Math.round((all.reduce((s, p) => s + p.matches, 0) / all.length) * 100) / 100 : 0,
      uniqueNames: new Set(all.map(p => p.name)).size,
      uniqueRegex: new Set(all.map(p => p.regex)).size,
      matchRate: total > 0 ? Math.round((this.totalMatches / total) * 100) / 100 : 0,
    };
  }

  getPattern(id: string): Pattern | undefined {
    return this.patterns.get(id);
  }

  getAllPatterns(): Pattern[] {
    return Array.from(this.patterns.values());
  }

  removePattern(id: string): boolean {
    return this.patterns.delete(id);
  }

  hasPattern(id: string): boolean {
    return this.patterns.has(id);
  }

  getCount(): number {
    return this.patterns.size;
  }

  getName(id: string): string | undefined {
    return this.patterns.get(id)?.name;
  }

  getRegex(id: string): string | undefined {
    return this.patterns.get(id)?.regex;
  }

  getMatches(id: string): number {
    return this.patterns.get(id)?.matches ?? 0;
  }

  getMisses(id: string): number {
    return this.patterns.get(id)?.misses ?? 0;
  }

  getLastMatch(id: string): string | null {
    return this.patterns.get(id)?.lastMatch ?? null;
  }

  getHistory(id: string): boolean[] {
    return [...(this.patterns.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.patterns.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.patterns.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.patterns.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.patterns.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setRegex(id: string, regex: string): boolean {
    const p = this.patterns.get(id);
    if (!p) return false;
    p.regex = regex;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.patterns.values()) {
      p.matches = 0;
      p.misses = 0;
      p.lastMatch = null;
      p.hits = 0;
      p.history = [];
      p.active = true;
    }
    this.totalMatches = 0;
    this.totalMisses = 0;
  }

  getByName(name: string): Pattern[] {
    return Array.from(this.patterns.values()).filter(p => p.name === name);
  }

  getActivePatterns(): Pattern[] {
    return Array.from(this.patterns.values()).filter(p => p.active);
  }

  getInactivePatterns(): Pattern[] {
    return Array.from(this.patterns.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.patterns.values()).map(p => p.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinMatches(min: number): Pattern[] {
    return Array.from(this.patterns.values()).filter(p => p.matches >= min);
  }

  getMostMatches(): Pattern | null {
    const all = Array.from(this.patterns.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.matches > max.matches ? p : max);
  }

  getNewest(): Pattern | null {
    const all = Array.from(this.patterns.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Pattern | null {
    const all = Array.from(this.patterns.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.patterns.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.patterns.get(id)?.updated ?? 0;
  }

  getTotalMatches(): number {
    return this.totalMatches;
  }

  getTotalMisses(): number {
    return this.totalMisses;
  }

  clearAll(): void {
    this.patterns.clear();
    this.counter = 0;
    this.totalMatches = 0;
    this.totalMisses = 0;
  }
}

export default PatternEngine;