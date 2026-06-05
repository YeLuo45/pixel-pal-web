/**
 * Workflow Validator
 * chatdev-design Workflow Validator - Definition + Execution + Dependency + Result
 */

export interface WorkflowStep {
  name: string;
  dependencies: string[];
}

export interface WorkflowDef {
  id: string;
  steps: WorkflowStep[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class WorkflowValidator {
  validateDefinition(def: WorkflowDef): ValidationResult {
    const errors: string[] = [];
    if (!def.id) errors.push('Missing workflow id');
    if (!Array.isArray(def.steps) || def.steps.length === 0) {
      errors.push('Workflow has no steps');
    }
    const stepNames = new Set(def.steps.map(s => s.name));
    for (const step of def.steps) {
      if (!step.name) errors.push('Step missing name');
      for (const dep of step.dependencies) {
        if (!stepNames.has(dep)) {
          errors.push(`Step '${step.name}' has unknown dependency '${dep}'`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  validateExecution(def: WorkflowDef, executed: string[]): ValidationResult {
    const errors: string[] = [];
    const stepNames = new Set(def.steps.map(s => s.name));
    for (const step of executed) {
      if (!stepNames.has(step)) {
        errors.push(`Executed step '${step}' not in workflow definition`);
      }
    }
    // Check that all dependencies are executed before dependent
    for (const step of def.steps) {
      if (executed.includes(step.name)) {
        for (const dep of step.dependencies) {
          if (!executed.includes(dep)) {
            errors.push(`Step '${step.name}' executed before dependency '${dep}'`);
          }
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  validateDependencies(def: WorkflowDef): ValidationResult {
    const errors: string[] = [];
    // Check for cycles
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const hasCycle = (stepName: string): boolean => {
      visited.add(stepName);
      inStack.add(stepName);
      const step = def.steps.find(s => s.name === stepName);
      if (step) {
        for (const dep of step.dependencies) {
          if (!visited.has(dep) && hasCycle(dep)) return true;
          if (inStack.has(dep)) return true;
        }
      }
      inStack.delete(stepName);
      return false;
    };

    for (const step of def.steps) {
      if (!visited.has(step.name) && hasCycle(step.name)) {
        errors.push(`Dependency cycle detected involving step '${step.name}'`);
        break;
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateResult(def: WorkflowDef, results: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    for (const step of def.steps) {
      if (!(step.name in results)) {
        errors.push(`Step '${step.name}' has no result`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  hasErrors(result: ValidationResult): boolean {
    return result.errors.length > 0;
  }

  getErrorCount(result: ValidationResult): number {
    return result.errors.length;
  }

  mergeResults(results: ValidationResult[]): ValidationResult {
    const errors: string[] = [];
    for (const r of results) {
      errors.push(...r.errors);
    }
    return { valid: errors.length === 0, errors };
  }

  isValid(result: ValidationResult): boolean {
    return result.valid;
  }

  isInvalid(result: ValidationResult): boolean {
    return !result.valid;
  }

  getErrorMessages(result: ValidationResult): string[] {
    return [...result.errors];
  }

  hasError(result: ValidationResult, message: string): boolean {
    return result.errors.includes(message);
  }

  clearResult(): ValidationResult {
    return { valid: true, errors: [] };
  }

  createResult(valid: boolean, errors: string[]): ValidationResult {
    return { valid, errors: [...errors] };
  }

  static createEmpty(): ValidationResult {
    return { valid: true, errors: [] };
  }

  static createInvalid(errors: string[]): ValidationResult {
    return { valid: false, errors: [...errors] };
  }
}

export default WorkflowValidator;