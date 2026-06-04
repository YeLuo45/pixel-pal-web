/**
 * Refactor Engine
 * claude-code-design Refactor Engine - Pattern + Auto + Risk + History
 */

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RefactorPattern {
  name: string;
  description: string;
  risk: RiskLevel;
}

export interface RefactorRecord {
  id: string;
  pattern: string;
  timestamp: number;
  success: boolean;
  code: string;
}

export class RefactorEngine {
  private patterns: Map<string, RefactorPattern> = new Map();
  private history: RefactorRecord[] = [];
  private counter = 0;

  addPattern(pattern: RefactorPattern): void {
    this.patterns.set(pattern.name, { ...pattern });
  }

  recognize(code: string): RefactorPattern[] {
    const recognized: RefactorPattern[] = [];

    if (code.length > 500) {
      const p = this.patterns.get('long-file');
      if (p) recognized.push(p);
    }
    if ((code.match(/if/g) || []).length > 5) {
      const p = this.patterns.get('complex-conditionals');
      if (p) recognized.push(p);
    }
    if ((code.match(/for|while/g) || []).length > 3) {
      const p = this.patterns.get('nested-loops');
      if (p) recognized.push(p);
    }
    if (code.includes('var ')) {
      const p = this.patterns.get('var-usage');
      if (p) recognized.push(p);
    }

    return recognized;
  }

  refactor(code: string, pattern: string): string {
    let refactored = code;
    const patternObj = this.patterns.get(pattern);
    if (!patternObj) return code;

    this.counter++;
    const record: RefactorRecord = {
      id: `rec-${this.counter}`,
      pattern,
      timestamp: Date.now(),
      success: false,
      code,
    };

    try {
      if (pattern === 'var-usage') {
        refactored = code.replace(/\bvar\s+/g, 'let ');
      } else if (pattern === 'long-file') {
        // Simulate refactoring by adding a comment
        refactored = `// Refactored: split this into smaller modules\n${code}`;
      } else if (pattern === 'complex-conditionals') {
        refactored = code.replace(/if\s*\((.*?)\)\s*{/g, 'if (($1)) {');
      } else if (pattern === 'nested-loops') {
        refactored = code.replace(/for\s*\((.*?)\)\s*{\s*for/g, 'for ($1) {\n  for');
      } else {
        refactored = `// Applied ${pattern}\n${code}`;
      }
      record.success = true;
    } catch {
      record.success = false;
    }

    this.history.push(record);
    return refactored;
  }

  assessRisk(pattern: string): RiskLevel {
    const p = this.patterns.get(pattern);
    return p?.risk ?? 'medium';
  }

  getHistory(): RefactorRecord[] {
    return [...this.history];
  }

  getPattern(name: string): RefactorPattern | undefined {
    return this.patterns.get(name);
  }

  getAllPatterns(): RefactorPattern[] {
    return Array.from(this.patterns.values());
  }

  removePattern(name: string): boolean {
    return this.patterns.delete(name);
  }

  getHistoryCount(): number {
    return this.history.length;
  }

  getSuccessfulRefactors(): RefactorRecord[] {
    return this.history.filter(r => r.success);
  }

  getFailedRefactors(): RefactorRecord[] {
    return this.history.filter(r => !r.success);
  }

  clearHistory(): void {
    this.history = [];
    this.counter = 0;
  }

  getSuccessRate(): number {
    if (this.history.length === 0) return 0;
    const successful = this.getSuccessfulRefactors().length;
    return Math.round((successful / this.history.length) * 100) / 100;
  }

  getRefactorByPattern(pattern: string): RefactorRecord[] {
    return this.history.filter(r => r.pattern === pattern);
  }

  getPatternCount(): number {
    return this.patterns.size;
  }

  hasPattern(name: string): boolean {
    return this.patterns.has(name);
  }

  getHighRiskPatterns(): RefactorPattern[] {
    return Array.from(this.patterns.values()).filter(p => p.risk === 'high');
  }

  getLowRiskPatterns(): RefactorPattern[] {
    return Array.from(this.patterns.values()).filter(p => p.risk === 'low');
  }

  getLastRefactor(): RefactorRecord | undefined {
    return this.history[this.history.length - 1];
  }

  clearAll(): void {
    this.patterns.clear();
    this.history = [];
    this.counter = 0;
  }
}

export default RefactorEngine;