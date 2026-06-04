/**
 * Adaptive Reasoner
 * generic-agent-design Adaptive Reasoner - Rules + Confidence + Chain + Explanation
 */

export interface Rule {
  id: string;
  conditions: string[];
  conclusion: string;
  confidence: number;
}

export interface InferenceResult {
  conclusion: string;
  confidence: number;
  chain: string[];
}

export class AdaptiveReasoner {
  private rules: Map<string, Rule> = new Map();
  private inferenceLog: { ruleId: string; facts: string[]; timestamp: number }[] = [];

  addRule(rule: Rule): void {
    this.rules.set(rule.id, { ...rule, conditions: [...rule.conditions] });
  }

  reason(facts: string[]): InferenceResult[] {
    const results: InferenceResult[] = [];

    for (const rule of this.rules.values()) {
      const matched = rule.conditions.every(c => facts.includes(c));
      if (matched) {
        const confidence = this.evaluateConfidence(rule, facts);
        results.push({
          conclusion: rule.conclusion,
          confidence,
          chain: [...rule.conditions, rule.conclusion],
        });
        this.inferenceLog.push({ ruleId: rule.id, facts: [...facts], timestamp: Date.now() });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  evaluateConfidence(rule: Rule, facts: string[]): number {
    if (rule.conditions.length === 0) return 0;
    const matched = rule.conditions.filter(c => facts.includes(c)).length;
    return Math.round((matched / rule.conditions.length) * rule.confidence * 100) / 100;
  }

  explain(ruleId: string): string {
    const rule = this.rules.get(ruleId);
    if (!rule) return '';

    const lines: string[] = [];
    lines.push(`Rule: ${rule.id}`);
    lines.push(`If: ${rule.conditions.join(' AND ')}`);
    lines.push(`Then: ${rule.conclusion}`);
    lines.push(`Confidence: ${rule.confidence}`);
    return lines.join('\n');
  }

  getRule(id: string): Rule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  removeRule(id: string): boolean {
    return this.rules.delete(id);
  }

  updateRuleConfidence(id: string, confidence: number): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;
    rule.confidence = Math.max(0, Math.min(1, confidence));
    return true;
  }

  addConditionToRule(ruleId: string, condition: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    if (!rule.conditions.includes(condition)) {
      rule.conditions.push(condition);
    }
    return true;
  }

  removeConditionFromRule(ruleId: string, condition: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    const idx = rule.conditions.indexOf(condition);
    if (idx === -1) return false;
    rule.conditions.splice(idx, 1);
    return true;
  }

  getConditions(ruleId: string): string[] {
    return [...(this.rules.get(ruleId)?.conditions ?? [])];
  }

  getConclusion(ruleId: string): string | undefined {
    return this.rules.get(ruleId)?.conclusion;
  }

  getRuleCount(): number {
    return this.rules.size;
  }

  hasRule(id: string): boolean {
    return this.rules.has(id);
  }

  getRulesByConclusion(conclusion: string): Rule[] {
    return Array.from(this.rules.values()).filter(r => r.conclusion === conclusion);
  }

  getAverageConfidence(): number {
    if (this.rules.size === 0) return 0;
    const sum = Array.from(this.rules.values()).reduce((acc, r) => acc + r.confidence, 0);
    return Math.round(sum / this.rules.size * 100) / 100;
  }

  getInferenceLog(): { ruleId: string; facts: string[]; timestamp: number }[] {
    return [...this.inferenceLog];
  }

  clearLog(): void {
    this.inferenceLog = [];
  }

  clearAll(): void {
    this.rules.clear();
    this.inferenceLog = [];
  }

  getTopConclusions(n: number): InferenceResult[] {
    const allResults: InferenceResult[] = [];
    const seen = new Set<string>();

    for (const rule of this.rules.values()) {
      if (!seen.has(rule.conclusion)) {
        seen.add(rule.conclusion);
        allResults.push({
          conclusion: rule.conclusion,
          confidence: rule.confidence,
          chain: [...rule.conditions, rule.conclusion],
        });
      }
    }

    return allResults.sort((a, b) => b.confidence - a.confidence).slice(0, n);
  }

  canConclude(conclusion: string, facts: string[]): boolean {
    for (const rule of this.rules.values()) {
      if (rule.conclusion === conclusion && rule.conditions.every(c => facts.includes(c))) {
        return true;
      }
    }
    return false;
  }
}

export default AdaptiveReasoner;