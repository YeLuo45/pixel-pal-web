/**
 * Decision Engine v2
 * generic-agent-design Decision Engine v2 - Define + Execute + Rescore + Stats
 */

export interface Decision {
  id: string;
  context: string;
  action: string;
  score: number;
  executed: number;
  created: number;
  updated: number;
  hits: number;
  active: boolean;
  history: number[];
}

export interface DE2Stats {
  decisions: number;
  totalExecutions: number;
  avgScore: number;
  active: number;
  inactive: number;
  avgExecutions: number;
  totalRescores: number;
}

export class DecisionEngineV2 {
  private decisions: Map<string, Decision> = new Map();
  private counter = 0;
  private totalRescores = 0;

  define(context: string, action: string, score: number): string {
    const id = `de-${++this.counter}`;
    this.decisions.set(id, {
      id,
      context,
      action,
      score: Math.max(0, Math.min(1, score)),
      executed: 0,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      active: true,
      history: [score],
    });
    return id;
  }

  execute(id: string): boolean {
    const d = this.decisions.get(id);
    if (!d) return false;
    if (!d.active) return false;
    d.executed++;
    d.hits++;
    d.updated = Date.now();
    return true;
  }

  rescore(id: string, score: number): boolean {
    const d = this.decisions.get(id);
    if (!d) return false;
    d.score = Math.max(0, Math.min(1, score));
    d.history.push(d.score);
    d.updated = Date.now();
    this.totalRescores++;
    return true;
  }

  getStats(): DE2Stats {
    const all = Array.from(this.decisions.values());
    return {
      decisions: all.length,
      totalExecutions: all.reduce((s, d) => s + d.executed, 0),
      avgScore: all.length > 0 ? Math.round((all.reduce((s, d) => s + d.score, 0) / all.length) * 100) / 100 : 0,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      avgExecutions: all.length > 0 ? Math.round((all.reduce((s, d) => s + d.executed, 0) / all.length) * 100) / 100 : 0,
      totalRescores: this.totalRescores,
    };
  }

  getDecision(id: string): Decision | undefined {
    return this.decisions.get(id);
  }

  getAllDecisions(): Decision[] {
    return Array.from(this.decisions.values());
  }

  removeDecision(id: string): boolean {
    return this.decisions.delete(id);
  }

  hasDecision(id: string): boolean {
    return this.decisions.has(id);
  }

  getCount(): number {
    return this.decisions.size;
  }

  getContext(id: string): string | undefined {
    return this.decisions.get(id)?.context;
  }

  getAction(id: string): string | undefined {
    return this.decisions.get(id)?.action;
  }

  getScore(id: string): number {
    return this.decisions.get(id)?.score ?? 0;
  }

  getExecutions(id: string): number {
    return this.decisions.get(id)?.executed ?? 0;
  }

  getHits(id: string): number {
    return this.decisions.get(id)?.hits ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.decisions.get(id)?.history ?? [])];
  }

  isActive(id: string): boolean {
    return this.decisions.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.decisions.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  setContext(id: string, context: string): boolean {
    const d = this.decisions.get(id);
    if (!d) return false;
    d.context = context;
    d.updated = Date.now();
    return true;
  }

  setAction(id: string, action: string): boolean {
    const d = this.decisions.get(id);
    if (!d) return false;
    d.action = action;
    d.updated = Date.now();
    return true;
  }

  setScore(id: string, score: number): boolean {
    const d = this.decisions.get(id);
    if (!d) return false;
    d.score = Math.max(0, Math.min(1, score));
    d.history.push(d.score);
    d.updated = Date.now();
    this.totalRescores++;
    return true;
  }

  resetExecutions(): void {
    for (const d of this.decisions.values()) d.executed = 0;
  }

  resetHistory(): void {
    for (const d of this.decisions.values()) d.history = [d.score];
  }

  resetAll(): void {
    for (const d of this.decisions.values()) {
      d.executed = 0;
      d.hits = 0;
      d.history = [d.score];
      d.active = true;
    }
    this.totalRescores = 0;
  }

  getByContext(context: string): Decision[] {
    return Array.from(this.decisions.values()).filter(d => d.context === context);
  }

  getActiveDecisions(): Decision[] {
    return Array.from(this.decisions.values()).filter(d => d.active);
  }

  getInactiveDecisions(): Decision[] {
    return Array.from(this.decisions.values()).filter(d => !d.active);
  }

  getByMinScore(min: number): Decision[] {
    return Array.from(this.decisions.values()).filter(d => d.score >= min);
  }

  getAllContexts(): string[] {
    return [...new Set(Array.from(this.decisions.values()).map(d => d.context))];
  }

  getContextCount(): number {
    return this.getAllContexts().length;
  }

  getMostExecuted(): Decision | null {
    const all = Array.from(this.decisions.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.executed > max.executed ? d : max);
  }

  getHighestScore(): Decision | null {
    const all = Array.from(this.decisions.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.score > max.score ? d : max);
  }

  getNewest(): Decision | null {
    const all = Array.from(this.decisions.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): Decision | null {
    const all = Array.from(this.decisions.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.decisions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.decisions.get(id)?.updated ?? 0;
  }

  getTotalRescores(): number {
    return this.totalRescores;
  }

  resetTotalRescores(): void {
    this.totalRescores = 0;
  }

  clearAll(): void {
    this.decisions.clear();
    this.counter = 0;
    this.totalRescores = 0;
  }
}

export default DecisionEngineV2;