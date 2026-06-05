/**
 * Decision Engine
 * generic-agent-design Decision Engine - AddRule + Evaluate + Stats
 */

export interface DecisionRule {
  id: string;
  name: string;
  condition: (context: unknown) => boolean;
  action: string;
  priority: number;
  created: number;
  usageCount: number;
}

export interface Decision {
  id: string;
  ruleId: string;
  action: string;
  context: unknown;
  timestamp: number;
  fromCache: boolean;
}

export interface DecisionStats {
  rules: number;
  decisions: number;
  cacheHits: number;
  cacheMisses: number;
}

export class DecisionEngine {
  private rules: Map<string, DecisionRule> = new Map();
  private decisions: Decision[] = [];
  private cache: Map<string, Decision> = new Map();
  private counter = 0;

  addRule(rule: Omit<DecisionRule, 'created' | 'usageCount' | 'priority'> & { priority?: number }): boolean {
    if (this.rules.has(rule.id)) return false;
    this.rules.set(rule.id, {
      ...rule,
      priority: rule.priority ?? 0,
      created: Date.now(),
      usageCount: 0,
    });
    return true;
  }

  evaluate(context: unknown, useCache: boolean = true): Decision | null {
    // Check cache
    const cacheKey = this.getCacheKey(context);
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const decision: Decision = { ...cached, id: `dec-${++this.counter}`, fromCache: true };
      this.decisions.push(decision);
      return decision;
    }

    // Find matching rule
    const matching = Array.from(this.rules.values())
      .filter(r => r.condition(context))
      .sort((a, b) => b.priority - a.priority);

    if (matching.length === 0) return null;

    const rule = matching[0];
    rule.usageCount++;
    const decision: Decision = {
      id: `dec-${++this.counter}`,
      ruleId: rule.id,
      action: rule.action,
      context,
      timestamp: Date.now(),
      fromCache: false,
    };
    this.decisions.push(decision);
    if (useCache) this.cache.set(cacheKey, decision);
    return decision;
  }

  private getCacheKey(context: unknown): string {
    return JSON.stringify(context);
  }

  getStats(): DecisionStats {
    return {
      rules: this.rules.size,
      decisions: this.decisions.length,
      cacheHits: this.decisions.filter(d => d.fromCache).length,
      cacheMisses: this.decisions.filter(d => !d.fromCache).length,
    };
  }

  getRule(id: string): DecisionRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): DecisionRule[] {
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

  getAction(id: string): string | undefined {
    return this.rules.get(id)?.action;
  }

  getPriority(id: string): number {
    return this.rules.get(id)?.priority ?? 0;
  }

  setPriority(id: string, priority: number): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;
    rule.priority = priority;
    return true;
  }

  getDecision(id: string): Decision | undefined {
    return this.decisions.find(d => d.id === id);
  }

  getAllDecisions(): Decision[] {
    return [...this.decisions];
  }

  getDecisionsForRule(ruleId: string): Decision[] {
    return this.decisions.filter(d => d.ruleId === ruleId);
  }

  getDecisionCount(): number {
    return this.decisions.length;
  }

  getUsageCount(id: string): number {
    return this.rules.get(id)?.usageCount ?? 0;
  }

  getMostUsed(): DecisionRule | null {
    const all = Array.from(this.rules.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.usageCount > max.usageCount ? r : max);
  }

  getCreatedAt(id: string): number {
    return this.rules.get(id)?.created ?? 0;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearDecisions(): void {
    this.decisions = [];
  }

  clearAll(): void {
    this.rules.clear();
    this.decisions = [];
    this.cache.clear();
    this.counter = 0;
  }
}

export default DecisionEngine;