/**
 * Heuristic Engine
 * generic-agent-design Heuristic Engine - Register + Evaluate + Enable + Stats
 */

export interface Heuristic {
  id: string;
  name: string;
  priority: number;
  condition: (input: unknown) => boolean;
  action: string;
  enabled: boolean;
  matches: number;
  created: number;
  updated: number;
}

export interface HeurStats {
  heuristics: number;
  enabled: number;
  disabled: number;
  matches: number;
}

export class HeuristicEngine {
  private heuristics: Map<string, Heuristic> = new Map();
  private counter = 0;

  register(name: string, priority: number, condition: (input: unknown) => boolean, action: string): string {
    const id = `he-${++this.counter}`;
    this.heuristics.set(id, {
      id,
      name,
      priority,
      condition,
      action,
      enabled: true,
      matches: 0,
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  evaluate(input: unknown): Heuristic[] {
    const matches: Heuristic[] = [];
    for (const h of this.heuristics.values()) {
      if (h.enabled && h.condition(input)) {
        h.matches++;
        matches.push(h);
      }
    }
    return matches.sort((a, b) => b.priority - a.priority);
  }

  enable(id: string): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.enabled = true;
    h.updated = Date.now();
    return true;
  }

  disable(id: string): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.enabled = false;
    h.updated = Date.now();
    return true;
  }

  getStats(): HeurStats {
    const all = Array.from(this.heuristics.values());
    return {
      heuristics: all.length,
      enabled: all.filter(h => h.enabled).length,
      disabled: all.filter(h => !h.enabled).length,
      matches: all.reduce((s, h) => s + h.matches, 0),
    };
  }

  getHeuristic(id: string): Heuristic | undefined {
    return this.heuristics.get(id);
  }

  getAllHeuristics(): Heuristic[] {
    return Array.from(this.heuristics.values());
  }

  removeHeuristic(id: string): boolean {
    return this.heuristics.delete(id);
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

  getPriority(id: string): number {
    return this.heuristics.get(id)?.priority ?? 0;
  }

  getAction(id: string): string | undefined {
    return this.heuristics.get(id)?.action;
  }

  getMatches(id: string): number {
    return this.heuristics.get(id)?.matches ?? 0;
  }

  isEnabled(id: string): boolean {
    return this.heuristics.get(id)?.enabled ?? false;
  }

  setPriority(id: string, priority: number): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.priority = priority;
    h.updated = Date.now();
    return true;
  }

  setAction(id: string, action: string): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.action = action;
    h.updated = Date.now();
    return true;
  }

  setCondition(id: string, condition: (input: unknown) => boolean): boolean {
    const h = this.heuristics.get(id);
    if (!h) return false;
    h.condition = condition;
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

  resetMatches(): void {
    for (const h of this.heuristics.values()) h.matches = 0;
  }

  resetAll(): void {
    for (const h of this.heuristics.values()) {
      h.matches = 0;
      h.enabled = true;
    }
  }

  getByName(name: string): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => h.name === name);
  }

  getEnabled(): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => h.enabled);
  }

  getDisabled(): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => !h.enabled);
  }

  getByPriority(priority: number): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => h.priority === priority);
  }

  getByAction(action: string): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => h.action === action);
  }

  getByMinPriority(min: number): Heuristic[] {
    return Array.from(this.heuristics.values()).filter(h => h.priority >= min);
  }

  getSortedByPriority(): Heuristic[] {
    return [...Array.from(this.heuristics.values())].sort((a, b) => b.priority - a.priority);
  }

  getMostMatched(): Heuristic | null {
    const all = Array.from(this.heuristics.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.matches > max.matches ? h : max);
  }

  getLeastMatched(): Heuristic | null {
    const all = Array.from(this.heuristics.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.matches < min.matches ? h : min);
  }

  getAvgMatches(): number {
    const all = Array.from(this.heuristics.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((s, h) => s + h.matches, 0) / all.length) * 100) / 100;
  }

  getCreatedAt(id: string): number {
    return this.heuristics.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.heuristics.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.heuristics.clear();
    this.counter = 0;
  }
}

export default HeuristicEngine;