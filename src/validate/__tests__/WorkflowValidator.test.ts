/**
 * WorkflowValidator Tests
 * chatdev-design Workflow Validator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkflowValidator } from '../WorkflowValidator';

describe('WorkflowValidator', () => {
  let validator: WorkflowValidator;

  beforeEach(() => {
    validator = new WorkflowValidator();
  });

  afterEach(() => {
    // noop
  });

  // ============================================================
  // validateDefinition
  // ============================================================
  describe('validateDefinition', () => {
    it('should validate correct definition', () => {
      const result = validator.validateDefinition({
        id: 'w1',
        steps: [{ name: 's1', dependencies: [] }, { name: 's2', dependencies: ['s1'] }],
      });
      expect(result.valid).toBe(true);
    });

    it('should reject empty steps', () => {
      const result = validator.validateDefinition({ id: 'w1', steps: [] });
      expect(result.valid).toBe(false);
    });

    it('should reject missing id', () => {
      const result = validator.validateDefinition({ id: '', steps: [{ name: 's1', dependencies: [] }] });
      expect(result.valid).toBe(false);
    });

    it('should reject unknown dependency', () => {
      const result = validator.validateDefinition({
        id: 'w1',
        steps: [{ name: 's1', dependencies: ['unknown'] }],
      });
      expect(result.valid).toBe(false);
    });
  });

  // ============================================================
  // validateExecution
  // ============================================================
  describe('validateExecution', () => {
    it('should validate execution', () => {
      const def = { id: 'w1', steps: [{ name: 's1', dependencies: [] }] };
      const result = validator.validateExecution(def, ['s1']);
      expect(result.valid).toBe(true);
    });

    it('should reject unknown executed step', () => {
      const def = { id: 'w1', steps: [{ name: 's1', dependencies: [] }] };
      const result = validator.validateExecution(def, ['unknown']);
      expect(result.valid).toBe(false);
    });

    it('should reject missing dependency in execution', () => {
      const def = { id: 'w1', steps: [{ name: 's1', dependencies: ['s2'] }, { name: 's2', dependencies: [] }] };
      const result = validator.validateExecution(def, ['s1']);
      expect(result.valid).toBe(false);
    });

    it('should accept when dependency is also executed', () => {
      const def = { id: 'w1', steps: [{ name: 's1', dependencies: ['s2'] }, { name: 's2', dependencies: [] }] };
      const result = validator.validateExecution(def, ['s1', 's2']);
      expect(result.valid).toBe(true);
    });
  });

  // ============================================================
  // validateDependencies
  // ============================================================
  describe('validateDependencies', () => {
    it('should validate no cycles', () => {
      const def = {
        id: 'w1',
        steps: [{ name: 's1', dependencies: [] }, { name: 's2', dependencies: ['s1'] }],
      };
      const result = validator.validateDependencies(def);
      expect(result.valid).toBe(true);
    });

    it('should detect cycles', () => {
      const def = {
        id: 'w1',
        steps: [{ name: 's1', dependencies: ['s2'] }, { name: 's2', dependencies: ['s1'] }],
      };
      const result = validator.validateDependencies(def);
      expect(result.valid).toBe(false);
    });
  });

  // ============================================================
  // validateResult
  // ============================================================
  describe('validateResult', () => {
    it('should validate complete results', () => {
      const def = { id: 'w1', steps: [{ name: 's1', dependencies: [] }] };
      const result = validator.validateResult(def, { s1: 'ok' });
      expect(result.valid).toBe(true);
    });

    it('should reject missing result', () => {
      const def = { id: 'w1', steps: [{ name: 's1', dependencies: [] }] };
      const result = validator.validateResult(def, {});
      expect(result.valid).toBe(false);
    });
  });

  // ============================================================
  // result queries
  // ============================================================
  describe('result queries', () => {
    it('should check hasErrors', () => {
      expect(validator.hasErrors({ valid: true, errors: [] })).toBe(false);
    });

    it('should count errors', () => {
      expect(validator.getErrorCount({ valid: false, errors: ['a', 'b'] })).toBe(2);
    });

    it('should merge results', () => {
      const merged = validator.mergeResults([
        { valid: true, errors: [] },
        { valid: false, errors: ['err'] },
      ]);
      expect(merged.valid).toBe(false);
    });

    it('should check isValid', () => {
      expect(validator.isValid({ valid: true, errors: [] })).toBe(true);
    });

    it('should check isInvalid', () => {
      expect(validator.isInvalid({ valid: false, errors: ['x'] })).toBe(true);
    });

    it('should get error messages', () => {
      expect(validator.getErrorMessages({ valid: false, errors: ['x'] })).toEqual(['x']);
    });

    it('should check hasError', () => {
      expect(validator.hasError({ valid: false, errors: ['x'] }, 'x')).toBe(true);
    });

    it('should clear result', () => {
      expect(validator.clearResult().valid).toBe(true);
    });

    it('should create result', () => {
      const result = validator.createResult(false, ['e1']);
      expect(result.valid).toBe(false);
    });
  });

  // ============================================================
  // static helpers
  // ============================================================
  describe('static helpers', () => {
    it('should create empty', () => {
      const r = WorkflowValidator.createEmpty();
      expect(r.valid).toBe(true);
    });

    it('should create invalid', () => {
      const r = WorkflowValidator.createInvalid(['e1']);
      expect(r.valid).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle complex workflow', () => {
      const def = {
        id: 'w1',
        steps: [
          { name: 's1', dependencies: [] },
          { name: 's2', dependencies: ['s1'] },
          { name: 's3', dependencies: ['s1'] },
          { name: 's4', dependencies: ['s2', 's3'] },
        ],
      };
      const result = validator.validateDefinition(def);
      expect(result.valid).toBe(true);
    });
  });
});