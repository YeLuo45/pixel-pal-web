/**
 * Code Quality Analyzer
 * claude-code-design Quality Analyzer - Complexity + Smell + Score + Suggestion
 */

export interface CodeFile {
  path: string;
  lines: number;
  functions: number;
  cyclomaticComplexity: number;
}

export interface QualityReport {
  score: number;
  smells: string[];
  suggestions: string[];
}

export class CodeQualityAnalyzer {
  private readonly SMELL_LONG_FILE = 500;
  private readonly SMELL_TOO_MANY_FUNCTIONS = 30;
  private readonly SMELL_HIGH_COMPLEXITY = 15;
  private readonly LONG_LINES_THRESHOLD = 100;

  analyze(file: CodeFile): QualityReport {
    const smells = this.getSmells(file);
    const score = this.getScore(file);
    const suggestions = this.suggest(file);
    return { score, smells, suggestions };
  }

  getSmells(file: CodeFile): string[] {
    const smells: string[] = [];

    if (file.lines > this.SMELL_LONG_FILE) {
      smells.push('long-file');
    }
    if (file.functions > this.SMELL_TOO_MANY_FUNCTIONS) {
      smells.push('too-many-functions');
    }
    if (file.cyclomaticComplexity > this.SMELL_HIGH_COMPLEXITY) {
      smells.push('high-complexity');
    }
    if (file.lines > 0 && file.functions > 0 && file.lines / file.functions > 50) {
      smells.push('long-method');
    }
    if (file.cyclomaticComplexity > 0 && file.functions > 0 && file.cyclomaticComplexity / file.functions > 3) {
      smells.push('complex-function');
    }

    return smells;
  }

  suggest(file: CodeFile): string[] {
    const suggestions: string[] = [];
    const smells = this.getSmells(file);

    if (smells.includes('long-file')) {
      suggestions.push('Split file into multiple smaller modules');
    }
    if (smells.includes('too-many-functions')) {
      suggestions.push('Extract related functions into separate classes/modules');
    }
    if (smells.includes('high-complexity')) {
      suggestions.push('Refactor to reduce cyclomatic complexity');
    }
    if (smells.includes('long-method')) {
      suggestions.push('Break down long methods into smaller ones');
    }
    if (smells.includes('complex-function')) {
      suggestions.push('Simplify complex functions with helper methods');
    }
    if (suggestions.length === 0) {
      suggestions.push('Code quality looks good');
    }

    return suggestions;
  }

  getScore(file: CodeFile): number {
    let score = 100;

    if (file.lines > this.SMELL_LONG_FILE) {
      score -= Math.min(30, Math.floor((file.lines - this.SMELL_LONG_FILE) / 100) * 5);
    }
    if (file.functions > this.SMELL_TOO_MANY_FUNCTIONS) {
      score -= Math.min(20, (file.functions - this.SMELL_TOO_MANY_FUNCTIONS) * 2);
    }
    if (file.cyclomaticComplexity > this.SMELL_HIGH_COMPLEXITY) {
      score -= Math.min(30, (file.cyclomaticComplexity - this.SMELL_HIGH_COMPLEXITY) * 3);
    }
    if (file.lines > 0 && file.functions > 0 && file.lines / file.functions > 50) {
      score -= 10;
    }
    if (file.cyclomaticComplexity > 0 && file.functions > 0 && file.cyclomaticComplexity / file.functions > 3) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  isHighQuality(file: CodeFile): boolean {
    return this.getScore(file) >= 80;
  }

  isLowQuality(file: CodeFile): boolean {
    return this.getScore(file) < 50;
  }

  getComplexityCategory(complexity: number): 'low' | 'medium' | 'high' {
    if (complexity < 5) return 'low';
    if (complexity < 10) return 'medium';
    return 'high';
  }

  getSizeCategory(lines: number): 'small' | 'medium' | 'large' {
    if (lines < 100) return 'small';
    if (lines < 500) return 'medium';
    return 'large';
  }

  getReportSummary(report: QualityReport): string {
    return `Score: ${report.score}, Smells: ${report.smells.length}, Suggestions: ${report.suggestions.length}`;
  }

  getTopSuggestion(file: CodeFile): string {
    const suggestions = this.suggest(file);
    return suggestions[0] ?? 'No suggestions';
  }

  hasSmell(file: CodeFile, smell: string): boolean {
    return this.getSmells(file).includes(smell);
  }

  countSmells(file: CodeFile): number {
    return this.getSmells(file).length;
  }

  compareQuality(a: CodeFile, b: CodeFile): number {
    return this.getScore(b) - this.getScore(a);
  }
}

export default CodeQualityAnalyzer;