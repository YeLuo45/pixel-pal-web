/**
 * Refactor Tool
 * claude-code-design Refactor Tool - Analyze + Detect + Transform + Apply
 */

export interface RefactoringRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  description: string;
  created: number;
  usageCount: number;
}

export interface RefactoringResult {
  original: string;
  transformed: string;
  ruleId: string;
  appliedAt: number;
  changed: boolean;
}

export interface RefactorStats {
  rules: number;
  transformations: number;
  matches: number;
}

export class RefactorTool {
  private rules: Map<string, RefactoringRule> = new Map();
  private transformations: RefactoringResult[] = [];

  addRule(rule: Omit<RefactoringRule, 'created' | 'usageCount'>): boolean {
    if (this.rules.has(rule.id)) return false;
    this.rules.set(rule.id, {
      ...rule,
      created: Date.now(),
      usageCount: 0,
    });
    return true;
  }

  transform(code: string, ruleId: string): RefactoringResult | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;
    const original = code;
    const transformed = code.replace(new RegExp(rule.pattern, 'g'), rule.replacement);
    const changed = transformed !== original;
    rule.usageCount++;
    const result: RefactoringResult = {
      original,
      transformed,
      ruleId,
      appliedAt: Date.now(),
      changed,
    };
    this.transformations.push(result);
    return result;
  }

  detectPatterns(code: string): string[] {
    const matched: string[] = [];
    for (const rule of this.rules.values()) {
      if (new RegExp(rule.pattern).test(code)) {
        matched.push(rule.id);
      }
    }
    return matched;
  }

  getStats(): RefactorStats {
    const matches = this.transformations.filter(t => t.changed).length;
    return {
      rules: this.rules.size,
      transformations: this.transformations.length,
      matches,
    };
  }

  getRule(id: string): RefactoringRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): RefactoringRule[] {
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

  getDescription(id: string): string | undefined {
    return this.rules.get(id)?.description;
  }

  getPattern(id: string): string | undefined {
    return this.rules.get(id)?.pattern;
  }

  getReplacement(id: string): string | undefined {
    return this.rules.get(id)?.replacement;
  }

  updatePattern(id: string, pattern: string): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;
    rule.pattern = pattern;
    return true;
  }

  updateReplacement(id: string, replacement: string): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;
    rule.replacement = replacement;
    return true;
  }

  updateName(id: string, name: string): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;
    rule.name = name;
    return true;
  }

  getUsageCount(id: string): number {
    return this.rules.get(id)?.usageCount ?? 0;
  }

  getMostUsed(): RefactoringRule | null {
    const all = Array.from(this.rules.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.usageCount > max.usageCount ? r : max);
  }

  getLeastUsed(): RefactoringRule | null {
    const all = Array.from(this.rules.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.usageCount < min.usageCount ? r : min);
  }

  getTransformations(): RefactoringResult[] {
    return [...this.transformations];
  }

  getTransformationsForRule(ruleId: string): RefactoringResult[] {
    return this.transformations.filter(t => t.ruleId === ruleId);
  }

  getTransformationCount(): number {
    return this.transformations.length;
  }

  getChangedTransformationCount(): number {
    return this.transformations.filter(t => t.changed).length;
  }

  getUnchangedTransformationCount(): number {
    return this.transformations.filter(t => !t.changed).length;
  }

  clearTransformations(): void {
    this.transformations = [];
  }

  getCreatedAt(id: string): number {
    return this.rules.get(id)?.created ?? 0;
  }

  clearAll(): void {
    this.rules.clear();
    this.transformations = [];
  }
}

export default RefactorTool;