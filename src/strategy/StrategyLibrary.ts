/**
 * Strategy Library
 * generic-agent-design Strategy Library - Define + Apply + Evaluate + Select
 */

export interface Strategy {
  id: string;
  name: string;
  score: number;
  applicability: (context: string) => boolean;
  description: string;
  usageCount: number;
  created: number;
}

export interface ApplicationRecord {
  strategyId: string;
  context: string;
  timestamp: number;
  success: boolean;
}

export class StrategyLibrary {
  private strategies: Map<string, Strategy> = new Map();
  private applications: ApplicationRecord[] = [];

  addStrategy(strategy: Omit<Strategy, 'usageCount' | 'created' | 'score'>): boolean {
    if (this.strategies.has(strategy.id)) return false;
    this.strategies.set(strategy.id, {
      ...strategy,
      score: 0.5,
      usageCount: 0,
      created: Date.now(),
    });
    return true;
  }

  apply(id: string, context: string): boolean {
    const strategy = this.strategies.get(id);
    if (!strategy) return false;
    const applicable = strategy.applicability(context);
    strategy.usageCount++;
    this.applications.push({
      strategyId: id,
      context,
      timestamp: Date.now(),
      success: applicable,
    });
    return applicable;
  }

  selectBest(context: string): Strategy | null {
    const applicable = Array.from(this.strategies.values())
      .filter(s => s.applicability(context));
    if (applicable.length === 0) return null;
    return applicable.reduce((best, s) => s.score > best.score ? s : best);
  }

  getByScore(min: number): Strategy[] {
    return Array.from(this.strategies.values()).filter(s => s.score >= min);
  }

  setScore(id: string, score: number): boolean {
    const strategy = this.strategies.get(id);
    if (!strategy) return false;
    strategy.score = Math.max(0, Math.min(1, score));
    return true;
  }

  getScore(id: string): number {
    return this.strategies.get(id)?.score ?? 0;
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

  getDescription(id: string): string | undefined {
    return this.strategies.get(id)?.description;
  }

  getUsageCount(id: string): number {
    return this.strategies.get(id)?.usageCount ?? 0;
  }

  getApplicable(context: string): Strategy[] {
    return Array.from(this.strategies.values()).filter(s => s.applicability(context));
  }

  getInapplicable(context: string): Strategy[] {
    return Array.from(this.strategies.values()).filter(s => !s.applicability(context));
  }

  getApplicationCount(): number {
    return this.applications.length;
  }

  getSuccessfulApplications(): number {
    return this.applications.filter(a => a.success).length;
  }

  getFailedApplications(): number {
    return this.applications.filter(a => !a.success).length;
  }

  getSuccessRate(): number {
    if (this.applications.length === 0) return 0;
    return Math.round((this.getSuccessfulApplications() / this.applications.length) * 100) / 100;
  }

  getApplicationsForStrategy(id: string): ApplicationRecord[] {
    return this.applications.filter(a => a.strategyId === id);
  }

  getMostUsed(): Strategy | null {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.usageCount > max.usageCount ? s : max);
  }

  getLeastUsed(): Strategy | null {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.usageCount < min.usageCount ? s : min);
  }

  getAvgScore(): number {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, s) => sum + s.score, 0) / all.length) * 100) / 100;
  }

  getMaxScore(): number {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return 0;
    return Math.max(...all.map(s => s.score));
  }

  getMinScore(): number {
    const all = Array.from(this.strategies.values());
    if (all.length === 0) return 0;
    return Math.min(...all.map(s => s.score));
  }

  boostScore(id: string, amount: number): boolean {
    const strategy = this.strategies.get(id);
    if (!strategy) return false;
    strategy.score = Math.max(0, Math.min(1, strategy.score + amount));
    return true;
  }

  penalize(id: string, amount: number): boolean {
    return this.boostScore(id, -amount);
  }

  getCreatedAt(id: string): number {
    return this.strategies.get(id)?.created ?? 0;
  }

  clearApplications(): void {
    this.applications = [];
  }

  clearAll(): void {
    this.strategies.clear();
    this.applications = [];
  }
}

export default StrategyLibrary;