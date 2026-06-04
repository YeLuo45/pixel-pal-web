/**
 * Self Evolution Engine v2
 * generic-agent-design Self-Evolution Engine v2 - Performance Tracking v2 + Strategy Optimization
 */

export interface PerformanceMetricsV2 {
  accuracy: number;
  speed: number;
  resourceUsage: number;
  timestamp: number;
}

export interface AdaptationRuleV2 {
  trigger: (metrics: PerformanceMetricsV2) => boolean;
  adjustment: number;
  weight: number;
}

export interface StrategyV2 {
  id: string;
  name: string;
  score: number;
  active: boolean;
  generations: number;
}

export class SelfEvolutionEngineV2 {
  private metricsHistory: PerformanceMetricsV2[] = [];
  private rules: AdaptationRuleV2[] = [];
  private strategies: StrategyV2[] = [];
  private currentAdjustment = 0;
  private strategyCounter = 0;
  private evolutionCount = 0;
  private generationCounter = 0;

  /**
   * Track performance metrics with timestamp
   */
  trackMetrics(metrics: PerformanceMetricsV2): void {
    this.metricsHistory.push({ ...metrics });
  }

  /**
   * Add adaptation rule with weight
   */
  addRule(rule: AdaptationRuleV2): void {
    this.rules.push(rule);
  }

  /**
   * Trigger adaptation based on current metrics
   */
  trigger(): number {
    if (this.metricsHistory.length === 0) return 0;

    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    let totalAdjustment = 0;
    let totalWeight = 0;

    for (const rule of this.rules) {
      if (rule.trigger(latest)) {
        totalAdjustment += rule.adjustment * rule.weight;
        totalWeight += rule.weight;
      }
    }

    if (totalWeight > 0) {
      this.currentAdjustment = totalAdjustment / totalWeight;
    } else {
      this.currentAdjustment = totalAdjustment;
    }

    return this.currentAdjustment;
  }

  /**
   * Evolve and create a new strategy
   */
  evolve(): StrategyV2 {
    this.evolutionCount++;
    this.generationCounter++;
    const id = `strategy-v2-${++this.strategyCounter}`;
    const baseScore = this.calculateBaseScore();

    const strategy: StrategyV2 = {
      id,
      name: `Strategy V2 Gen ${this.generationCounter}`,
      score: baseScore + this.currentAdjustment,
      active: false,
      generations: this.generationCounter,
    };

    // Deactivate all others
    for (const s of this.strategies) {
      s.active = false;
    }

    this.strategies.push(strategy);
    strategy.active = true;

    return strategy;
  }

  /**
   * Get the active strategy
   */
  getActiveStrategy(): StrategyV2 | null {
    return this.strategies.find(s => s.active) ?? null;
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceMetricsV2[] {
    return [...this.metricsHistory];
  }

  /**
   * Get all strategies
   */
  getStrategies(): StrategyV2[] {
    return [...this.strategies];
  }

  /**
   * Get best strategy
   */
  getBestStrategy(): StrategyV2 | null {
    if (this.strategies.length === 0) return null;
    return this.strategies.reduce((best, s) => s.score > best.score ? s : best);
  }

  /**
   * Activate a strategy by id
   */
  activateStrategy(strategyId: string): boolean {
    const strategy = this.strategies.find(s => s.id === strategyId);
    if (!strategy) return false;

    for (const s of this.strategies) {
      s.active = s.id === strategyId;
    }

    return true;
  }

  /**
   * Calculate base score from history
   */
  private calculateBaseScore(): number {
    if (this.metricsHistory.length === 0) return 50;

    const sum = this.metricsHistory.reduce((acc, m) => {
      return acc + (m.accuracy + m.speed - m.resourceUsage);
    }, 0);

    return Math.round(sum / this.metricsHistory.length);
  }

  /**
   * Get evolution count
   */
  getEvolutionCount(): number {
    return this.evolutionCount;
  }

  /**
   * Get current adjustment
   */
  getCurrentAdjustment(): number {
    return this.currentAdjustment;
  }

  /**
   * Get generation counter
   */
  getGenerationCount(): number {
    return this.generationCounter;
  }

  /**
   * Get average accuracy
   */
  getAverageAccuracy(): number {
    if (this.metricsHistory.length === 0) return 0;
    const sum = this.metricsHistory.reduce((acc, m) => acc + m.accuracy, 0);
    return Math.round(sum / this.metricsHistory.length * 100) / 100;
  }

  /**
   * Get average speed
   */
  getAverageSpeed(): number {
    if (this.metricsHistory.length === 0) return 0;
    const sum = this.metricsHistory.reduce((acc, m) => acc + m.speed, 0);
    return Math.round(sum / this.metricsHistory.length * 100) / 100;
  }

  /**
   * Get average resource usage
   */
  getAverageResourceUsage(): number {
    if (this.metricsHistory.length === 0) return 0;
    const sum = this.metricsHistory.reduce((acc, m) => acc + m.resourceUsage, 0);
    return Math.round(sum / this.metricsHistory.length * 100) / 100;
  }

  /**
   * Prune old metrics (keep last n)
   */
  pruneMetrics(keepLast: number): void {
    if (this.metricsHistory.length > keepLast) {
      this.metricsHistory = this.metricsHistory.slice(-keepLast);
    }
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.metricsHistory = [];
    this.rules = [];
    this.strategies = [];
    this.currentAdjustment = 0;
    this.strategyCounter = 0;
    this.evolutionCount = 0;
    this.generationCounter = 0;
  }

  /**
   * Get strategy by id
   */
  getStrategy(strategyId: string): StrategyV2 | undefined {
    return this.strategies.find(s => s.id === strategyId);
  }

  /**
   * Get strategies by generation
   */
  getStrategiesByGeneration(gen: number): StrategyV2[] {
    return this.strategies.filter(s => s.generations === gen);
  }

  /**
   * Get average score across all strategies
   */
  getAverageStrategyScore(): number {
    if (this.strategies.length === 0) return 0;
    const sum = this.strategies.reduce((acc, s) => acc + s.score, 0);
    return Math.round(sum / this.strategies.length * 100) / 100;
  }

  /**
   * Delete strategy by id
   */
  deleteStrategy(strategyId: string): boolean {
    const index = this.strategies.findIndex(s => s.id === strategyId);
    if (index === -1) return false;
    this.strategies.splice(index, 1);
    return true;
  }

  /**
   * Merge two strategies (for breeding)
   */
  mergeStrategies(strategyId1: string, strategyId2: string): StrategyV2 | null {
    const s1 = this.getStrategy(strategyId1);
    const s2 = this.getStrategy(strategyId2);
    if (!s1 || !s2) return null;

    this.evolutionCount++;
    const merged: StrategyV2 = {
      id: `strategy-v2-${++this.strategyCounter}`,
      name: `Merged ${s1.name} x ${s2.name}`,
      score: (s1.score + s2.score) / 2,
      active: false,
      generations: Math.max(s1.generations, s2.generations) + 1,
    };

    this.strategies.push(merged);
    return merged;
  }
}

export default SelfEvolutionEngineV2;