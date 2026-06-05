/**
 * Strategy Planner
 * generic-agent-design Strategy Planner - Define + Select + Execute + Stats
 */

export interface Strategy {
  id: string;
  name: string;
  score: number;
  executions: number;
  created: number;
  updated: number;
  active: boolean;
}

export interface PlannerStats {
  strategies: number;
  totalExecutions: number;
  avgScore: number;
  active: number;
  inactive: number;
}

export class StrategyPlanner {
  private strategies: Map<string, Strategy> = new Map();
  private counter = 0;

  define(name: string, score: number): string {
    const id = `str-${++this.counter}`;
    this.strategies.set(id, {
      id,
      name,
      score,
      executions: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
    });
    return id;
  }

  select(top: number = 3): Strategy[] {
    return [...Array.from(this.strategies.values())]
      .filter(s => s.active)
      .sort((a, b) => b.score - a.score)
      .slice(0, top);
  }

  execute(id: string): boolean {
    const s = this.strategies.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.executions++;
    s.updated = Date.now();
    return true;
  }

  getStats(): PlannerStats {
    const all = Array.from(this.strategies.values());
    return {
      strategies: all.length,
      totalExecutions: all.reduce((s, x) => s + x.executions, 0),
      avgScore: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.score, 0) / all.length) * 100) / 100 : 0,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
    };
  }

  getStrategy(id: string): Strategy | undefined {
    return this.strategies.get(id);
  }

  getAllStrategies(): Strategy[] {
    return Array.from(this.strategies.values());
  }

  removeStrategy(id: string): boolean {
    return this.strategies.delete(id);
  }

  hasStrategy(id: string): boolean {
    return this.strategies.has(id);
  }

  getCount(): number {
    return this.strategies.size;
  }

  getName(id: string): string | undefined {
    return this.strategies.get(id)?.name;
  }

  getScore(id: string): number {
    return this.strategies.get(id)?.score ?? 0;
  }

  getExecutions(id: string): number {
    return this.strategies.get(id)?.executions ?? 0;
  }

  isActive(id: string): boolean {
    return this.strategies.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.strategies.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setScore(id: string, score: number): boolean {
    const s = this.strategies.get(id);
    if (!s) return false;
    s.score = score;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.strategies.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  resetExecutions(): void {
    for (const s of this.strategies.values()) s.executions = 0;
  }

  resetAll(): void {
    for (const s of this.strategies.values()) {
      s.executions = 0;
      s.active = true;
    }
  }

  getByName(name: string): Strategy[] {
    return Array.from(this.strategies.values()).filter(s => s.name === name);
  }

  getActiveStrategies(): Strategy[] {
    return Array.from(this.strategies.values()).filter(s => s.active);
  }

  getInactiveStrategies(): Strategy[] {
    return Array.from(this.strategies.values()).filter(s => !s.active);
  }

  getByMinScore(min: number): Strategy[] {
    return Array.from(this.strategies.values()).filter(s => s.score >= min);
  }

  getSortedByScore(): Strategy[] {
    return [...Array.from(this.strategies.values())].sort((a, b) => b.score - a.score);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.strategies.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getMostExecuted(): Strategy | null {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.executions > max.executions ? s : max);
  }

  getLeastExecuted(): Strategy | null {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.executions < min.executions ? s : min);
  }

  getHighestScore(): Strategy | null {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.score > max.score ? s : max);
  }

  getLowestScore(): Strategy | null {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.score < min.score ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.strategies.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.strategies.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.strategies.clear();
    this.counter = 0;
  }
}

export default StrategyPlanner;