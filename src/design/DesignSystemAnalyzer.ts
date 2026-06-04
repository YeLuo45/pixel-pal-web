/**
 * Design System Analyzer
 * claude-code-design Design System Analyzer
 */

export type TokenType = 'color' | 'spacing' | 'typography' | 'shadow';
export type Severity = 'error' | 'warning' | 'info';

export interface DesignToken {
  name: string;
  value: string;
  type: TokenType;
}

export interface ComplianceRule {
  id: string;
  description: string;
  severity: Severity;
  check: (code: string) => boolean;
}

export interface ComplianceIssue {
  ruleId: string;
  message: string;
  location?: string;
}

export interface ComplianceReport {
  score: number;
  passed: number;
  failed: number;
  issues: ComplianceIssue[];
}

let ruleCounter = 0;
let tokenCounter = 0;

export class DesignSystemAnalyzer {
  private tokens: Map<string, DesignToken> = new Map();
  private rules: ComplianceRule[] = [];
  private lastScore: number = 0;

  /**
   * Add a design token
   */
  addToken(token: DesignToken): void {
    this.tokens.set(token.name, token);
  }

  /**
   * Add a compliance rule
   */
  addRule(rule: ComplianceRule): void {
    this.rules.push(rule);
  }

  /**
   * Analyze code for design system compliance
   */
  analyze(code: string): ComplianceReport {
    const issues: ComplianceIssue[] = [];
    let failed = 0;
    let passed = 0;

    for (const rule of this.rules) {
      try {
        const result = rule.check(code);
        if (!result) {
          issues.push({
            ruleId: rule.id,
            message: rule.description,
          });
          failed++;
        } else {
          passed++;
        }
      } catch {
        failed++;
        issues.push({
          ruleId: rule.id,
          message: `Rule ${rule.id} threw during check: ${rule.description}`,
        });
      }
    }

    const total = this.rules.length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 100;
    this.lastScore = score;

    return { score, passed, failed, issues };
  }

  /**
   * Get the last calculated score
   */
  getScore(): number {
    return this.lastScore;
  }

  /**
   * Get all design tokens
   */
  getTokens(): DesignToken[] {
    return Array.from(this.tokens.values());
  }

  /**
   * Get token by name
   */
  getToken(name: string): DesignToken | undefined {
    return this.tokens.get(name);
  }

  /**
   * Check if token exists
   */
  hasToken(name: string): boolean {
    return this.tokens.has(name);
  }

  /**
   * Remove a token
   */
  removeToken(name: string): boolean {
    return this.tokens.delete(name);
  }

  /**
   * Get all rules
   */
  getRules(): ComplianceRule[] {
    return [...this.rules];
  }

  /**
   * Remove a rule by id
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  /**
   * Clear all tokens and rules
   */
  clearAll(): void {
    this.tokens.clear();
    this.rules = [];
    this.lastScore = 0;
  }

  /**
   * Check code against a specific token usage
   */
  checkTokenUsage(code: string, tokenName: string): boolean {
    return code.includes(tokenName);
  }

  /**
   * Calculate coverage percentage
   */
  calculateCoverage(usedTokens: string[]): number {
    if (this.tokens.size === 0) return 100;
    const covered = usedTokens.filter(t => this.tokens.has(t)).length;
    return Math.round((covered / this.tokens.size) * 100);
  }

  /**
   * Generate token report
   */
  generateTokenReport(): { total: number; byType: Record<TokenType, number> } {
    const byType: Record<TokenType, number> = {
      color: 0,
      spacing: 0,
      typography: 0,
      shadow: 0,
    };

    for (const token of this.tokens.values()) {
      byType[token.type]++;
    }

    return { total: this.tokens.size, byType };
  }

  /**
   * Validate token value format
   */
  validateTokenValue(token: DesignToken): boolean {
    switch (token.type) {
      case 'color':
        return /^#[0-9A-Fa-f]{6}$/.test(token.value) || /^rgb/.test(token.value);
      case 'spacing':
        return /^\d+(\.\d+)?(px|rem|em)$/.test(token.value);
      case 'typography':
        return /^\d+(\.\d+)?(px|rem|em)$/.test(token.value) || /^(normal|bold|italic)/.test(token.value);
      case 'shadow':
        return /^\d+(\.\d+)?px/.test(token.value) || /^box-shadow/.test(token.value);
      default:
        return true;
    }
  }

  /**
   * Get rules by severity
   */
  getRulesBySeverity(severity: Severity): ComplianceRule[] {
    return this.rules.filter(r => r.severity === severity);
  }

  /**
   * Get issue count by severity
   */
  getIssueCountBySeverity(issues: ComplianceIssue[]): Record<Severity, number> {
    const counts: Record<Severity, number> = { error: 0, warning: 0, info: 0 };
    for (const rule of this.rules) {
      const found = issues.find(i => i.ruleId === rule.id);
      if (found) {
        counts[rule.severity]++;
      }
    }
    return counts;
  }
}

export default DesignSystemAnalyzer;