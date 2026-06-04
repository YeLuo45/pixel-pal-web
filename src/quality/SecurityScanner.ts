/**
 * Enterprise Quality Gates - L2 Security Scanner
 * claude-code Enterprise Code Quality Gates V2
 */

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityResult {
  severity: Severity;
  category: string;
  message: string;
  location?: { file: string; line: number };
}

const SECURITY_PATTERNS = [
  { pattern: /eval\s*\(/g, severity: 'critical' as Severity, category: 'code-injection', message: 'Dangerous eval() usage detected' },
  { pattern: /innerHTML\s*=/g, severity: 'high' as Severity, category: 'xss', message: 'Potential XSS via innerHTML assignment' },
  { pattern: /document\.write/g, severity: 'high' as Severity, category: 'xss', message: 'document.write() can cause XSS vulnerabilities' },
  { pattern: /Function\s*\(\s*['"`]/g, severity: 'critical' as Severity, category: 'code-injection', message: 'Dynamic function construction from string' },
  { pattern: /setTimeout\s*\(\s*['"`]/g, severity: 'high' as Severity, category: 'code-injection', message: 'setTimeout string injection risk' },
  { pattern: /localStorage\.setItem.*['"`]/g, severity: 'medium' as Severity, category: 'storage', message: 'localStorage with string concatenation' },
  { pattern: /sessionStorage\.setItem.*['"`]/g, severity: 'medium' as Severity, category: 'storage', message: 'sessionStorage with string concatenation' },
  { pattern: /password\s*=\s*['"`]/gi, severity: 'high' as Severity, category: 'credentials', message: 'Hardcoded password detected' },
  { pattern: /apiKey\s*=\s*['"`]/gi, severity: 'high' as Severity, category: 'credentials', message: 'Hardcoded API key detected' },
  { pattern: /secret\s*=\s*['"`]/gi, severity: 'high' as Severity, category: 'credentials', message: 'Hardcoded secret detected' },
  { pattern: /\bMath\.random\(\)/g, severity: 'low' as Severity, category: 'randomness', message: 'Math.random() is not cryptographically secure' },
  { pattern: /console\.log.*['"`]/g, severity: 'low' as Severity, category: 'debugging', message: 'Console.log with string concatenation may leak data' },
  { pattern: /TODO.*password/gi, severity: 'medium' as Severity, category: 'comments', message: 'TODO comment mentioning password' },
  { pattern: /\.\/|\.\.\\/g, severity: 'low' as Severity, category: 'path-traversal', message: 'Relative path traversal detected' },
  { pattern: /window\.open/g, severity: 'low' as Severity, category: 'browser-api', message: 'window.open may be used for phishing' },
  { pattern: /crypto\.getRandomValues/g, severity: 'low' as Severity, category: 'crypto', message: 'For sensitive data, use Web Crypto API properly' },
];

export class SecurityScanner {
  private severityOrder: Record<Severity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  /**
   * Scan code for security vulnerabilities
   */
  scan(code: string): SecurityResult[] {
    const results: SecurityResult[] = [];

    for (const { pattern, severity, category, message } of SECURITY_PATTERNS) {
      // Reset regex state
      const regex = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(code)) !== null) {
        results.push({
          severity,
          category,
          message,
          location: {
            file: 'inline',
            line: this.getLineNumber(code, match.index),
          },
        });

        // Prevent infinite loop for global patterns
        if (!pattern.flags.includes('g')) break;
      }
    }

    return this.sortBySeverity(results);
  }

  /**
   * Check if code passes security gate
   */
  passesSecurityGate(code: string, maxSeverity: Severity = 'high'): boolean {
    const results = this.scan(code);
    const maxAllowed = this.severityOrder[maxSeverity];

    return !results.some((r) => this.severityOrder[r.severity] > maxAllowed);
  }

  /**
   * Get security score (100 = no issues)
   */
  getSecurityScore(code: string): number {
    const results = this.scan(code);
    const penaltyPerIssue: Record<Severity, number> = {
      critical: 25,
      high: 15,
      medium: 8,
      low: 2,
    };

    let totalPenalty = 0;
    for (const result of results) {
      totalPenalty += penaltyPerIssue[result.severity];
    }

    return Math.max(0, 100 - totalPenalty);
  }

  /**
   * Categorize issues by severity
   */
  categorizeBySeverity(results: SecurityResult[]): Record<Severity, number> {
    return {
      critical: results.filter((r) => r.severity === 'critical').length,
      high: results.filter((r) => r.severity === 'high').length,
      medium: results.filter((r) => r.severity === 'medium').length,
      low: results.filter((r) => r.severity === 'low').length,
    };
  }

  private getLineNumber(code: string, index: number): number {
    return code.substring(0, index).split('\n').length;
  }

  private sortBySeverity(results: SecurityResult[]): SecurityResult[] {
    return [...results].sort(
      (a, b) => this.severityOrder[b.severity] - this.severityOrder[a.severity]
    );
  }
}

export default SecurityScanner;