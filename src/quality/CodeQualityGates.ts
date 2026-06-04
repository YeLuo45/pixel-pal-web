/**
 * Code Quality Gates Module
 * Provides automated code quality checks, lint rules, and quality thresholds
 */

/**
 * Represents a single quality check result
 */
export interface QualityCheck {
  name: string;
  passed: boolean;
  score: number;
  message?: string;
}

/**
 * Represents a quality gate with threshold and weight
 */
export interface QualityGate {
  name: string;
  threshold: number;
  weight: number;
}

/**
 * Result of evaluating quality gates
 */
export interface QualityGateResult {
  passed: boolean;
  overallScore: number;
  failedGates: string[];
}

/**
 * Code Quality Gates Engine
 * Runs automated quality checks and evaluates against defined thresholds
 */
export class CodeQualityGates {
  private gates: QualityGate[] = [];

  /**
   * Run quality checks on the provided code
   * Currently implements basic checks; can be extended with actual linting tools
   */
  async runChecks(code: string): Promise<QualityCheck[]> {
    const checks: QualityCheck[] = [];

    // Check 1: Non-empty code
    checks.push({
      name: 'non-empty',
      passed: code.trim().length > 0,
      score: code.trim().length > 0 ? 100 : 0,
      message: code.trim().length > 0 ? 'Code is not empty' : 'Code is empty',
    });

    // Check 2: Has minimum length (basic complexity indicator)
    const minLength = 10;
    checks.push({
      name: 'minimum-length',
      passed: code.length >= minLength,
      score: Math.min(100, (code.length / minLength) * 100),
      message: code.length >= minLength
        ? `Code length ${code.length} meets minimum ${minLength}`
        : `Code length ${code.length} below minimum ${minLength}`,
    });

    // Check 3: Valid characters (no binary or invalid chars)
    const validPattern = /^[\x20-\x7E\t\n\r]*$/;
    const hasValidChars = validPattern.test(code);
    checks.push({
      name: 'valid-characters',
      passed: hasValidChars,
      score: hasValidChars ? 100 : 0,
      message: hasValidChars ? 'All characters are valid' : 'Code contains invalid characters',
    });

    // Check 4: Has line breaks (proper formatting)
    const hasLineBreaks = code.includes('\n') || code.includes('\r');
    checks.push({
      name: 'has-line-breaks',
      passed: hasLineBreaks,
      score: hasLineBreaks ? 100 : 50,
      message: hasLineBreaks ? 'Code has proper line breaks' : 'Code lacks line breaks',
    });

    // Check 5: Balanced brackets (basic syntax check)
    const brackets = code.match(/[{}()\[\]]/g) || [];
    let bracketScore = 100;
    if (brackets.length > 0) {
      const openBrackets = (code.match(/[{(\[]/g) || []).length;
      const closeBrackets = (code.match(/[})\]]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        bracketScore = 0;
      }
    }
    checks.push({
      name: 'balanced-brackets',
      passed: bracketScore === 100,
      score: bracketScore,
      message: bracketScore === 100
        ? 'Brackets are balanced'
        : 'Brackets are not balanced',
    });

    return checks;
  }

  /**
   * Evaluate checks against defined quality gates
   */
  evaluate(checks: QualityCheck[], gates: QualityGate[]): QualityGateResult {
    if (checks.length === 0 || gates.length === 0) {
      return {
        passed: false,
        overallScore: 0,
        failedGates: gates.map(g => g.name),
      };
    }

    // Calculate weighted overall score
    let totalWeight = 0;
    let weightedScore = 0;
    const failedGates: string[] = [];

    for (const gate of gates) {
      totalWeight += gate.weight;
      
      // Find matching check
      const check = checks.find(c => c.name === gate.name);
      
      if (check) {
        if (check.score >= gate.threshold) {
          weightedScore += gate.weight * (check.score / 100);
        } else {
          failedGates.push(gate.name);
        }
      } else {
        // If no matching check found, gate fails
        failedGates.push(gate.name);
      }
    }

    const overallScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    const passed = failedGates.length === 0;

    return {
      passed,
      overallScore,
      failedGates,
    };
  }

  /**
   * Set a quality gate
   */
  setGate(gate: QualityGate): void {
    // Remove existing gate with same name
    this.gates = this.gates.filter(g => g.name !== gate.name);
    this.gates.push(gate);
  }

  /**
   * Get all current quality gates
   */
  getGates(): QualityGate[] {
    return [...this.gates];
  }

  /**
   * Clear all quality gates
   */
  clearGates(): void {
    this.gates = [];
  }

  /**
   * Run checks and evaluate against current gates
   */
  async runAndEvaluate(code: string): Promise<QualityGateResult> {
    const checks = await this.runChecks(code);
    return this.evaluate(checks, this.gates);
  }
}

export default CodeQualityGates;
