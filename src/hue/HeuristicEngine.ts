/**
 * Heuristic Engine
 * generic-agent-design Heuristic Engine - AddRule + Evaluate + Stats
 */

export type HeuristicType = 'rule' | 'pattern' | 'fallback' | 'default';

export interface Heuristic {
  id: string;
  name: string;
  type: HeuristicType;
  priority: number;
  hits: number;
  matches: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface HueStats {
  heuristics: number;
  totalAdded: number;
  totalEvaluated: number;
  totalMatched: number;
  rule: number;
  pattern: number;
  fallback: number;
  default: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalMatches: number;
  uniqueNames: number;
  totalPriority: number;
  avgPriority: number;
  maxPriority: number;
  minPriority: number;
}

export class HeuristicEngine {
  private heuristics: Map<string, Heuristic> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalEvaluated = 0;
  private totalMatched = 0;
  private totalPriority = 0;

  addRule(name: string, type: HeuristicType, priority: number): string {
    const id = `hue-${++this.counter}`;
    this.heuristics.set(id, {
      id,
      name,
      type,
      priority,
      hits: 0,
      matches: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalPriority += priority;
    return id;
  }

  evaluate(id: string, matches: boolean): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    if (!h.active) return false;
    h.hits++;
    if (matches) h.matches++;
    h.updated = Date.now();
    this.totalEvaluated++;
    if (matches) this.totalMatched++;
    return true;
  }

  remove(id: string): boolean {
    return this.heuristics.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.active = active;
    h.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.name = name;
    h.updated = Date.now();
    return true;
  }

  setType(id: string, type: HeuristicType): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.type = type;
    h.updated = Date.now();
    return true;
  }

  setPriority(id: string, priority: number): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.priority = priority;
    h.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const h of this.heuristics.values()) {
      h.hits = 0;
      h.matches = 0;
      h.active = true;
    }
    this.totalAdded = 0;
    this.totalEvaluated = 0;
    this.totalMatched = 0;
    this.totalPriority = 0;
  }

  getStats(): HueStats {
    const all = Array.from(this.heuristics.values());
    const pArr = all.map(h => h.priority);
    return {
      heuristics: all.length,
      totalAdded: this.totalAdded,
      totalEvaluated: this.totalEvaluated,
      totalMatched: this.totalMatched,
      rule: all.filter(h => h.type === 'rule').length,
      pattern: all.filter(h => h.type === 'pattern').length,
      fallback: all.filter(h => h.type === 'fallback').length,
      default: all.filter(h => h.type === 'default').length,
      active: all.filter(h => h.active).length,
      inactive: all.filter(h => !h.active).length,
      totalHits: all.reduce((s, h) => s + h.hits, 0),
      totalMatches: all.reduce((s, h) => s + h.matches, 0),
      uniqueNames: new Set(all.map(h => h.name)).size,
      totalPriority: this.totalPriority,
      avgPriority: all.length > 0 ? Math.round((pArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPriority: pArr.length > 0 ? Math.max(...pArr) : 0,
      minPriority: pArr.length > 0 ? Math.min(...pArr) : 0,
    };
  }

  getHeuristic(id: string): Heuristic | undefined {
    return this.heuristics.get(id);
  }

  getAllHeuristics(): Heuristic[] {
    return Array.from(this.heuristics.values());
  }

  hasHeuristic(id: string): boolean {
    return this.heuristics.has(id);
  }

  getCount(): number {
    return this.heuristics.size;
  }

  getName(id: string): string | undefined {
    return this.heuristics.get(id)?.name;
  }

  getType(id: string): HeuristicType | undefined {
    return this.heuristics.get(id)?.type;
  }

  getPriority(id: string): number {
    return this.heuristics.get(id)?.priority ?? 0;
  }

  getHits(id: string): number {
    return this.heuristics.get(id)?.hits ?? 0;
  }

  getMatches(id: string): number {
    return this.heuristics.get(id)?.matches ?? 0;
  }

  isActive(id: string): boolean {
    return this.heuristics.get(id)?.active ?? false;
  }

  isRule(id: string): boolean {
    return this.heuristics.get(id)?.type === 'rule';
  }

  isPattern(id: string): boolean {
    return this.heuristics.get(id)?.type === 'pattern';
  }

  isFallback(id: string): boolean {
    return this.heuristics.get(id)?.type === 'fallback';
  }

  isDefault(id: string): boolean {
    return this.heuristics.get(id)?.type === 'default';
  }

  getByType(type: HeuristicType): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => h.type === type);
  }

  getActiveHeuristics(): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => h.active);
  }

  getInactiveHeuristics(): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => !h.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.heuristics.values()).map(h => h.name))];
  }

  getNewest(): Heuristic | null {
    const all = Array.from(this.heuristics.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.created > max.created ? h : max);
  }

  getOldest(): Heuristic | null {
    const all = Array.from(this.heuristics.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.created < min.created ? h : min);
  }

  getCreatedAt(id: string): number {
    return this.heuristics.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.heuristics.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalEvaluated(): number {
    return this.totalEvaluated;
  }

  getTotalMatched(): number {
    return this.totalMatched;
  }

  clearAll(): void {
    this.heuristics.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalEvaluated = 0;
    this.totalMatched = 0;
    this.totalPriority = 0;
  }
}

export default HeuristicEngine;