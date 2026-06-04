/**
 * Style Enforcer
 * claude-code-design Style Enforcer - Rule + Detect + Fix + Report
 */

export type Severity = 'error' | 'warning' | 'info';

export interface StyleRule {
  name: string;
  pattern: RegExp;
  message: string;
  severity: Severity;
}

export interface Violation {
  rule: string;
  line: number;
  message: string;
  severity: Severity;
}

export interface StyleReport {
  total: number;
  errors: number;
  warnings: number;
  info: number;
}

export class StyleEnforcer {
  private rules: Map<string, StyleRule> = new Map();
  private violations: Violation[] = [];

  addRule(rule: StyleRule): void {
    this.rules.set(rule.name, { ...rule });
  }

  check(code: string): Violation[] {
    this.violations = [];
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const rule of this.rules.values()) {
        // Reset regex lastIndex for stateful patterns
        if (rule.pattern.global || rule.pattern.sticky) {
          rule.pattern.lastIndex = 0;
        }
        if (rule.pattern.test(line)) {
          this.violations.push({
            rule: rule.name,
            line: i + 1,
            message: rule.message,
            severity: rule.severity,
          });
        }
      }
    }
    return [...this.violations];
  }

  fix(code: string, ruleName: string, replacement: string): string {
    const rule = this.rules.get(ruleName);
    if (!rule) return code;
    return code.replace(rule.pattern, replacement);
  }

  generateReport(): StyleReport {
    const report: StyleReport = {
      total: this.violations.length,
      errors: 0,
      warnings: 0,
      info: 0,
    };
    for (const v of this.violations) {
      if (v.severity === 'error') report.errors++;
      else if (v.severity === 'warning') report.warnings++;
      else report.info++;
    }
    return report;
  }

  getRule(name: string): StyleRule | undefined {
    return this.rules.get(name);
  }

  getAllRules(): StyleRule[] {
    return Array.from(this.rules.values());
  }

  removeRule(name: string): boolean {
    return this.rules.delete(name);
  }

  hasRule(name: string): boolean {
    return this.rules.has(name);
  }

  getRuleCount(): number {
    return this.rules.size;
  }

  getViolations(): Violation[] {
    return [...this.violations];
  }

  getViolationsByRule(ruleName: string): Violation[] {
    return this.violations.filter(v => v.rule === ruleName);
  }

  getViolationsBySeverity(severity: Severity): Violation[] {
    return this.violations.filter(v => v.severity === severity);
  }

  getViolationsByLine(line: number): Violation[] {
    return this.violations.filter(v => v.line === line);
  }

  clearViolations(): void {
    this.violations = [];
  }

  clearAll(): void {
    this.rules.clear();
    this.violations = [];
  }

  checkRule(code: string, ruleName: string): Violation[] {
    const rule = this.rules.get(ruleName);
    if (!rule) return [];
    const lines = code.split('\n');
    const found: Violation[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (rule.pattern.global || rule.pattern.sticky) {
        rule.pattern.lastIndex = 0;
      }
      if (rule.pattern.test(lines[i])) {
        found.push({
          rule: rule.name,
          line: i + 1,
          message: rule.message,
          severity: rule.severity,
        });
      }
    }
    return found;
  }

  getErrorCount(): number {
    return this.violations.filter(v => v.severity === 'error').length;
  }

  getWarningCount(): number {
    return this.violations.filter(v => v.severity === 'warning').length;
  }

  getInfoCount(): number {
    return this.violations.filter(v => v.severity === 'info').length;
  }

  hasErrors(): boolean {
    return this.getErrorCount() > 0;
  }

  hasWarnings(): boolean {
    return this.getWarningCount() > 0;
  }
}

export default StyleEnforcer;