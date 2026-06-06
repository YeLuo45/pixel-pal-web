/**
 * Pattern Engine
 * generic-agent-design Pattern Engine - Define + Match + Stats
 */

export interface Pattern {
  id: string;
  name: string;
  template: string;
  matches: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface PE5Stats {
  patterns: number;
  totalMatches: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgMatches: number;
  maxMatches: number;
  minMatches: number;
  avgTemplateLength: number;
  maxTemplateLength: number;
  minTemplateLength: number;
}

export class PatternEngine {
  private patterns: Map<string, Pattern> = new Map();
  private counter = 0;
  private totalMatches = 0;

  define(name: string, template: string): string {
    const id = `pe5-${++this.counter}`;
    this.patterns.set(id, {
      id,
      name,
      template,
      matches: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  match(id: string): boolean {
    const p = this.patterns.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.matches++;
    p.history.push(Date.now());
    p.updated = Date.now();
    p.hits++;
    this.totalMatches++;
    return true;
  }

  reset(id: string): boolean {
    const p = this.patterns.get(id);
    if (!p) return false;
    p.matches = 0;
    p.history = [];
    p.updated = Date.now();
    return true;
  }

  getStats(): PE5Stats {
    const all = Array.from(this.patterns.values());
    const matchValues = all.map(p => p.matches);
    const tmplLengths = all.map(p => p.template.length);
    return {
      patterns: all.length,
      totalMatches: this.totalMatches,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      avgMatches: all.length > 0 ? Math.round((matchValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxMatches: matchValues.length > 0 ? Math.max(...matchValues) : 0,
      minMatches: matchValues.length > 0 ? Math.min(...matchValues) : 0,
      avgTemplateLength: all.length > 0 ? Math.round((tmplLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTemplateLength: tmplLengths.length > 0 ? Math.max(...tmplLengths) : 0,
      minTemplateLength: tmplLengths.length > 0 ? Math.min(...tmplLengths) : 0,
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

  getTemplate(id: string): string | undefined {
    return this.patterns.get(id)?.template;
  }

  getTemplateLength(id: string): number {
    return this.patterns.get(id)?.template.length ?? 0;
  }

  getMatches(id: string): number {
    return this.patterns.get(id)?.matches ?? 0;
  }

  getHistory(id: string): number[] {
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

  setTemplate(id: string, template: string): boolean {
    const p = this.patterns.get(id);
    if (!p) return false;
    p.template = template;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.patterns.values()) {
      p.matches = 0;
      p.hits = 0;
      p.history = [];
      p.active = true;
    }
    this.totalMatches = 0;
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

  clearAll(): void {
    this.patterns.clear();
    this.counter = 0;
    this.totalMatches = 0;
  }
}

export default PatternEngine;