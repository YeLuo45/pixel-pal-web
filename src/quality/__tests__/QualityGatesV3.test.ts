/**
 * QualityGatesV3 Tests
 * claude-code-design Quality Gates v3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QualityGatesV3 } from '../QualityGatesV3';

describe('QualityGatesV3', () => {
  let gates: QualityGatesV3;

  beforeEach(() => {
    gates = new QualityGatesV3({
      maintainability: 85,
      testability: 80,
      reusability: 75,
      security: 90,
    });
  });

  // ============================================================
  // evaluate
  // ============================================================
  describe('evaluate', () => {
    it('should calculate weighted average', () => {
      const score = gates.evaluate();
      expect(score).toBe(82.5);
    });

    it('should return 0 for all zeros', () => {
      const zeroGates = new QualityGatesV3({
        maintainability: 0,
        testability: 0,
        reusability: 0,
        security: 0,
      });
      expect(zeroGates.evaluate()).toBe(0);
    });

    it('should return 100 for all 100s', () => {
      const perfectGates = new QualityGatesV3({
        maintainability: 100,
        testability: 100,
        reusability: 100,
        security: 100,
      });
      expect(perfectGates.evaluate()).toBe(100);
    });

    it('should handle mixed values', () => {
      const mixedGates = new QualityGatesV3({
        maintainability: 100,
        testability: 0,
        reusability: 100,
        security: 0,
      });
      expect(mixedGates.evaluate()).toBe(50);
    });
  });

  // ============================================================
  // canPass
  // ============================================================
  describe('canPass', () => {
    it('should return true when score >= threshold', () => {
      expect(gates.canPass(80)).toBe(true);
    });

    it('should return false when score < threshold', () => {
      expect(gates.canPass(90)).toBe(false);
    });

    it('should pass exact threshold', () => {
      expect(gates.canPass(82.5)).toBe(true);
    });
  });

  // ============================================================
  // getReport
  // ============================================================
  describe('getReport', () => {
    it('should return report with score and grade', () => {
      const report = gates.getReport();
      expect(report).toContain('Score=82.5');
      expect(report).toContain('Grade=B');
    });

    it('should return A grade for high score', () => {
      const perfectGates = new QualityGatesV3({
        maintainability: 100,
        testability: 100,
        reusability: 100,
        security: 100,
      });
      expect(perfectGates.getReport()).toContain('Grade=A');
    });

    it('should return F grade for low score', () => {
      const lowGates = new QualityGatesV3({
        maintainability: 30,
        testability: 30,
        reusability: 30,
        security: 30,
      });
      expect(lowGates.getReport()).toContain('Grade=F');
    });
  });

  // ============================================================
  // checkCompliance
  // ============================================================
  describe('checkCompliance', () => {
    it('should pass when all above threshold', () => {
      const result = gates.checkCompliance();
      expect(result.passed).toBe(true);
      expect(result.failedGates).toHaveLength(0);
    });

    it('should fail when below threshold', () => {
      const lowGates = new QualityGatesV3({
        maintainability: 60,
        testability: 60,
        reusability: 60,
        security: 60,
      });
      const result = lowGates.checkCompliance();
      expect(result.passed).toBe(false);
      expect(result.failedGates.length).toBeGreaterThan(0);
    });

    it('should calculate overall score', () => {
      const result = gates.checkCompliance();
      expect(result.overallScore).toBe(82.5);
    });
  });

  // ============================================================
  // getGates
  // ============================================================
  describe('getGates', () => {
    it('should return all gates', () => {
      const allGates = gates.getGates();
      expect(allGates).toHaveLength(4);
    });

    it('should not expose internal array', () => {
      const allGates = gates.getGates();
      allGates.push({ name: 'fake', threshold: 0, weight: 0 });
      expect(gates.getGates()).toHaveLength(4);
    });
  });

  // ============================================================
  // addGate
  // ============================================================
  describe('addGate', () => {
    it('should add new gate', () => {
      gates.addGate({ name: 'performance', threshold: 70, weight: 1 });
      expect(gates.getGates()).toHaveLength(5);
    });

    it('should affect compliance when metric is below threshold', () => {
      // Add a gate for an existing metric (maintainability is 85)
      gates.addGate({ name: 'maintainability', threshold: 95, weight: 1 });
      const result = gates.checkCompliance();
      expect(result.failedGates).toContain('maintainability');
    });
  });

  // ============================================================
  // getWeightedScore
  // ============================================================
  describe('getWeightedScore', () => {
    it('should return weighted score', () => {
      expect(gates.getWeightedScore()).toBe(82.5);
    });
  });

  // ============================================================
  // isGatePassed
  // ============================================================
  describe('isGatePassed', () => {
    it('should return true for passed gate', () => {
      expect(gates.isGatePassed('maintainability')).toBe(true);
    });

    it('should return false for failed gate', () => {
      const lowGates = new QualityGatesV3({
        maintainability: 60,
        testability: 60,
        reusability: 60,
        security: 60,
      });
      expect(lowGates.isGatePassed('maintainability')).toBe(false);
    });

    it('should return false for unknown gate', () => {
      expect(gates.isGatePassed('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getGrade
  // ============================================================
  describe('getGrade', () => {
    it('should return A grade', () => {
      const aGates = new QualityGatesV3({
        maintainability: 90,
        testability: 90,
        reusability: 90,
        security: 90,
      });
      expect(aGates.getGrade()).toBe('A');
    });

    it('should return B grade', () => {
      const bGates = new QualityGatesV3({
        maintainability: 80,
        testability: 80,
        reusability: 80,
        security: 80,
      });
      expect(bGates.getGrade()).toBe('B');
    });

    it('should return C grade', () => {
      const cGates = new QualityGatesV3({
        maintainability: 70,
        testability: 70,
        reusability: 70,
        security: 70,
      });
      expect(cGates.getGrade()).toBe('C');
    });

    it('should return D grade', () => {
      const dGates = new QualityGatesV3({
        maintainability: 60,
        testability: 60,
        reusability: 60,
        security: 60,
      });
      expect(dGates.getGrade()).toBe('D');
    });

    it('should return F grade', () => {
      const fGates = new QualityGatesV3({
        maintainability: 59,
        testability: 59,
        reusability: 59,
        security: 59,
      });
      expect(fGates.getGrade()).toBe('F');
    });
  });

  // ============================================================
  // getSummary
  // ============================================================
  describe('getSummary', () => {
    it('should return summary', () => {
      const summary = gates.getSummary();
      expect(summary).toContain('Score: 82.5');
      expect(summary).toContain('Grade: B');
      expect(summary).toContain('Passed: true');
    });

    it('should show failed for low score', () => {
      const lowGates = new QualityGatesV3({
        maintainability: 50,
        testability: 50,
        reusability: 50,
        security: 50,
      });
      const summary = lowGates.getSummary();
      expect(summary).toContain('Passed: false');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle extreme values', () => {
      const extreme = new QualityGatesV3({
        maintainability: 999,
        testability: 999,
        reusability: 999,
        security: 999,
      });
      expect(extreme.evaluate()).toBe(999);
    });

    it('should handle fractional values', () => {
      const fractional = new QualityGatesV3({
        maintainability: 33.33,
        testability: 33.33,
        reusability: 33.33,
        security: 33.33,
      });
      expect(fractional.evaluate()).toBeCloseTo(33.33, 1);
    });

    it('should not mutate internal metrics', () => {
      const metrics = { maintainability: 85, testability: 80, reusability: 75, security: 90 };
      const gates2 = new QualityGatesV3(metrics);
      gates2.setMetrics({ maintainability: 0, testability: 0, reusability: 0, security: 0 });
      expect(gates.getMetrics().maintainability).toBe(85);
    });
  });
});