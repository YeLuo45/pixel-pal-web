import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CodeQualityGates, QualityCheck, QualityGate, QualityGateResult } from '../CodeQualityGates';

describe('CodeQualityGates', () => {
  let gates: CodeQualityGates;

  beforeEach(() => {
    gates = new CodeQualityGates();
  });

  describe('runChecks', () => {
    it('should return non-empty check as passed for non-empty code', async () => {
      const code = 'const x = 1;';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'non-empty');
      expect(check?.passed).toBe(true);
      expect(check?.score).toBe(100);
    });

    it('should return non-empty check as failed for empty code', async () => {
      const code = '';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'non-empty');
      expect(check?.passed).toBe(false);
      expect(check?.score).toBe(0);
    });

    it('should return non-empty check as failed for whitespace-only code', async () => {
      const code = '   \n\t  ';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'non-empty');
      expect(check?.passed).toBe(false);
      expect(check?.score).toBe(0);
    });

    it('should pass minimum-length check for code >= 10 chars', async () => {
      const code = 'const x = 1;'; // 11 chars
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'minimum-length');
      expect(check?.passed).toBe(true);
    });

    it('should fail minimum-length check for code < 10 chars', async () => {
      const code = 'x=1';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'minimum-length');
      expect(check?.passed).toBe(false);
    });

    it('should cap minimum-length score at 100', async () => {
      const code = 'const very long code that exceeds minimum length significantly';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'minimum-length');
      expect(check?.score).toBe(100);
    });

    it('should pass valid-characters check for valid ASCII', async () => {
      const code = 'const x = 1;\nconsole.log(x);';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'valid-characters');
      expect(check?.passed).toBe(true);
      expect(check?.score).toBe(100);
    });

    it('should fail valid-characters check for invalid chars', async () => {
      const code = 'const x = 1;\x00null byte';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'valid-characters');
      expect(check?.passed).toBe(false);
      expect(check?.score).toBe(0);
    });

    it('should pass has-line-breaks check when code has newlines', async () => {
      const code = 'const x = 1;\nconst y = 2;';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'has-line-breaks');
      expect(check?.passed).toBe(true);
      expect(check?.score).toBe(100);
    });

    it('should fail has-line-breaks check for single-line code', async () => {
      const code = 'const x = 1;';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'has-line-breaks');
      expect(check?.passed).toBe(false);
      expect(check?.score).toBe(50);
    });

    it('should pass balanced-brackets for code with no brackets', async () => {
      const code = 'const x = 1;';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'balanced-brackets');
      expect(check?.passed).toBe(true);
      expect(check?.score).toBe(100);
    });

    it('should pass balanced-brackets for properly balanced brackets', async () => {
      const code = 'const arr = [1, 2, 3]; const obj = { a: 1 };';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'balanced-brackets');
      expect(check?.passed).toBe(true);
      expect(check?.score).toBe(100);
    });

    it('should fail balanced-brackets for unmatched opening brackets', async () => {
      const code = 'const arr = [1, 2, 3;'; // missing ]
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'balanced-brackets');
      expect(check?.passed).toBe(false);
      expect(check?.score).toBe(0);
    });

    it('should fail balanced-brackets for unmatched closing brackets', async () => {
      const code = 'const arr = 1, 2, 3];'; // missing [
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'balanced-brackets');
      expect(check?.passed).toBe(false);
      expect(check?.score).toBe(0);
    });

    it('should handle all bracket types correctly', async () => {
      const code = 'function test() { const arr = [1, 2, (3)]; return arr; }';
      const checks = await gates.runChecks(code);
      const check = checks.find(c => c.name === 'balanced-brackets');
      expect(check?.passed).toBe(true);
    });

    it('should return message for each check', async () => {
      const code = 'const x = 1;';
      const checks = await gates.runChecks(code);
      checks.forEach(check => {
        expect(check.message).toBeDefined();
        expect(typeof check.message).toBe('string');
      });
    });
  });

  describe('evaluate', () => {
    it('should return passed true when all checks meet thresholds', () => {
      const checks: QualityCheck[] = [
        { name: 'non-empty', passed: true, score: 100 },
        { name: 'minimum-length', passed: true, score: 100 },
      ];
      const gatesList: QualityGate[] = [
        { name: 'non-empty', threshold: 80, weight: 1 },
        { name: 'minimum-length', threshold: 80, weight: 1 },
      ];

      const result = gates.evaluate(checks, gatesList);

      expect(result.passed).toBe(true);
      expect(result.failedGates).toEqual([]);
    });

    it('should return passed false when any check fails threshold', () => {
      const checks: QualityCheck[] = [
        { name: 'non-empty', passed: true, score: 100 },
        { name: 'minimum-length', passed: false, score: 50 },
      ];
      const gatesList: QualityGate[] = [
        { name: 'non-empty', threshold: 80, weight: 1 },
        { name: 'minimum-length', threshold: 80, weight: 1 },
      ];

      const result = gates.evaluate(checks, gatesList);

      expect(result.passed).toBe(false);
      expect(result.failedGates).toContain('minimum-length');
    });

    it('should calculate weighted overall score correctly', () => {
      const checks: QualityCheck[] = [
        { name: 'check1', passed: true, score: 100 },
        { name: 'check2', passed: true, score: 50 },
      ];
      const gatesList: QualityGate[] = [
        { name: 'check1', threshold: 0, weight: 1 },
        { name: 'check2', threshold: 0, weight: 1 },
      ];

      const result = gates.evaluate(checks, gatesList);

      // (1 * 100 + 1 * 50) / 2 = 75
      expect(result.overallScore).toBe(75);
    });

    it('should return failed gates when check is missing', () => {
      const checks: QualityCheck[] = [
        { name: 'check1', passed: true, score: 100 },
      ];
      const gatesList: QualityGate[] = [
        { name: 'check1', threshold: 0, weight: 1 },
        { name: 'missing-check', threshold: 0, weight: 1 },
      ];

      const result = gates.evaluate(checks, gatesList);

      expect(result.passed).toBe(false);
      expect(result.failedGates).toContain('missing-check');
    });

    it('should handle empty checks array', () => {
      const checks: QualityCheck[] = [];
      const gatesList: QualityGate[] = [
        { name: 'gate1', threshold: 80, weight: 1 },
      ];

      const result = gates.evaluate(checks, gatesList);

      expect(result.passed).toBe(false);
      expect(result.overallScore).toBe(0);
      expect(result.failedGates).toEqual(['gate1']);
    });

    it('should handle empty gates array', () => {
      const checks: QualityCheck[] = [
        { name: 'check1', passed: true, score: 100 },
      ];
      const gatesList: QualityGate[] = [];

      const result = gates.evaluate(checks, gatesList);

      expect(result.passed).toBe(false);
      expect(result.overallScore).toBe(0);
      expect(result.failedGates).toEqual([]);
    });

    it('should calculate correct score with different weights', () => {
      const checks: QualityCheck[] = [
        { name: 'check1', passed: true, score: 100 },
        { name: 'check2', passed: true, score: 100 },
      ];
      const gatesList: QualityGate[] = [
        { name: 'check1', threshold: 0, weight: 3 },
        { name: 'check2', threshold: 0, weight: 1 },
      ];

      const result = gates.evaluate(checks, gatesList);

      // (3 * 100 + 1 * 100) / 4 = 100
      expect(result.overallScore).toBe(100);
    });

    it('should return all gates as failed when both arrays are empty', () => {
      const checks: QualityCheck[] = [];
      const gatesList: QualityGate[] = [];

      const result = gates.evaluate(checks, gatesList);

      expect(result.passed).toBe(false);
      expect(result.overallScore).toBe(0);
      expect(result.failedGates).toEqual([]);
    });
  });

  describe('setGate', () => {
    it('should add a new gate', () => {
      const gate: QualityGate = { name: 'test-gate', threshold: 80, weight: 1 };
      gates.setGate(gate);

      expect(gates.getGates()).toContainEqual(gate);
    });

    it('should replace existing gate with same name', () => {
      const gate1: QualityGate = { name: 'test-gate', threshold: 80, weight: 1 };
      const gate2: QualityGate = { name: 'test-gate', threshold: 90, weight: 2 };
      
      gates.setGate(gate1);
      gates.setGate(gate2);

      const result = gates.getGates();
      expect(result).toHaveLength(1);
      expect(result[0].threshold).toBe(90);
      expect(result[0].weight).toBe(2);
    });

    it('should allow multiple gates with different names', () => {
      gates.setGate({ name: 'gate1', threshold: 80, weight: 1 });
      gates.setGate({ name: 'gate2', threshold: 70, weight: 2 });

      expect(gates.getGates()).toHaveLength(2);
    });
  });

  describe('getGates', () => {
    it('should return empty array when no gates set', () => {
      expect(gates.getGates()).toEqual([]);
    });

    it('should return copy of gates array', () => {
      gates.setGate({ name: 'test', threshold: 80, weight: 1 });
      
      const gates1 = gates.getGates();
      const gates2 = gates.getGates();

      expect(gates1).toEqual(gates2);
      expect(gates1).not.toBe(gates2);
    });
  });

  describe('clearGates', () => {
    it('should remove all gates', () => {
      gates.setGate({ name: 'gate1', threshold: 80, weight: 1 });
      gates.setGate({ name: 'gate2', threshold: 70, weight: 2 });
      
      gates.clearGates();

      expect(gates.getGates()).toEqual([]);
    });
  });

  describe('runAndEvaluate', () => {
    it('should run checks and evaluate against current gates', async () => {
      gates.setGate({ name: 'non-empty', threshold: 80, weight: 1 });
      gates.setGate({ name: 'minimum-length', threshold: 80, weight: 1 });

      const result = await gates.runAndEvaluate('const x = 1;');

      expect(result.passed).toBe(true);
      expect(result.failedGates).toEqual([]);
    });

    it('should fail when checks do not meet gate thresholds', async () => {
      gates.setGate({ name: 'non-empty', threshold: 80, weight: 1 });
      gates.setGate({ name: 'minimum-length', threshold: 100, weight: 1 }); // very high threshold

      const result = await gates.runAndEvaluate('x'); // short code

      expect(result.passed).toBe(false);
      expect(result.failedGates.length).toBeGreaterThan(0);
    });
  });

  describe('interface contracts', () => {
    it('QualityCheck should have required properties', async () => {
      const checks = await gates.runChecks('const x = 1;');
      
      checks.forEach(check => {
        expect(check).toHaveProperty('name');
        expect(check).toHaveProperty('passed');
        expect(check).toHaveProperty('score');
        expect(typeof check.name).toBe('string');
        expect(typeof check.passed).toBe('boolean');
        expect(typeof check.score).toBe('number');
      });
    });

    it('QualityGate should have required properties', () => {
      const gate: QualityGate = { name: 'test', threshold: 80, weight: 1 };
      
      expect(gate).toHaveProperty('name');
      expect(gate).toHaveProperty('threshold');
      expect(gate).toHaveProperty('weight');
    });

    it('QualityGateResult should have required properties', () => {
      const result: QualityGateResult = {
        passed: true,
        overallScore: 100,
        failedGates: [],
      };

      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('failedGates');
    });
  });
});
