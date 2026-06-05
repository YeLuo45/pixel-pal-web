/**
 * Linter
 * claude-code-design Linter - AddRule + Check + Stats
 */

export type Severity = 'error' | 'warning' | 'info';

export interface LintRule {
  id: string;
  name: string;
  check: (code: string) => boolean;
  severity: Severity;
  message: string;
  enabled: boolean;
  hits: number;
  created: number;
}

export interface LintIssue {
  ruleId: string;
  message: string;
  severity: Severity;
  line: number;
}

export interface LintStats {
  rules: number;
  issues: number;
  errors: number;
  warnings: number;
  info: number;
}

export class Linter {
  private rules: Map<string, LintRule> = new Map();
  private issues: LintIssue[] = [];

  addRule(rule: Omit<LintRule, 'enabled' | 'hits' | 'created'> & { enabled?: boolean }): boolean {
    if (this.rules.has(rule.id)) return false;
    this.rules.set(rule.id, {
      ...rule,
      enabled: rule.enabled ?? true,
      hits: 0,
      created: Date.now(),
    });
    return true;
  }

  check(code: string): LintIssue[] {
    const issues: LintIssue[] = [];
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      if (rule.check(code)) {
        rule.hits++;
        issues.push({
          ruleId: rule.id,
          message: rule.message,
          severity: rule.severity,
          line: this.findLine(code, rule.id),
        });
      }
    }
    this.issues.push(...issues);
    return issues;
  }

  getStats(): LintStats {
    return {
      rules: this.rules.size,
      issues: this.issues.length,
      errors: this.issues.filter(i => i.severity === 'error').length,
      warnings: this.issues.filter(i => i.severity === 'warning').length,
      info: this.issues.filter(i => i.severity === 'info').length,
    };
  }

  getRule(id: string): LintRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): LintRule[] {
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

  getMessage(id: string): string | undefined {
    return this.rules.get(id)?.message;
  }

  getSeverity(id: string): Severity | undefined {
    return this.rules.get(id)?.severity;
  }

  isEnabled(id: string): boolean {
    return this.rules.get(id)?.enabled ?? false;
  }

  setEnabled(id: string, enabled: boolean): boolean {
    const rule = this.rules.get(id);
    if (!rule) return false;
    rule.enabled = enabled;
    return true;
  }

  getHits(id: string): number {
    return this.rules.get(id)?.hits ?? 0;
  }

  getAllIssues(): LintIssue[] {
    return [...this.issues];
  }

  getIssuesForRule(ruleId: string): LintIssue[] {
    return this.issues.filter(i => i.ruleId === ruleId);
  }

  getIssueCount(): number {
    return this.issues.length;
  }

  getErrors(): LintIssue[] {
    return this.issues.filter(i => i.severity === 'error');
  }

  getWarnings(): LintIssue[] {
    return this.issues.filter(i => i.severity === 'warning');
  }

  getInfo(): LintIssue[] {
    return this.issues.filter(i => i.severity === 'info');
  }

  clearIssues(): void {
    this.issues = [];
  }

  getBySeverity(severity: Severity): LintIssue[] {
    return this.issues.filter(i => i.severity === severity);
  }

  getCreatedAt(id: string): number {
    return this.rules.get(id)?.created ?? 0;
  }

  resetHits(): void {
    for (const rule of this.rules.values()) {
      rule.hits = 0;
    }
  }

  clearAll(): void {
    this.rules.clear();
    this.issues = [];
  }

  private findLine(code: string, _ruleId: string): number {
    return code.split('\n').length;
  }
}

export default Linter;