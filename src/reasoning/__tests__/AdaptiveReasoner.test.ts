/**
 * AdaptiveReasoner Tests
 * generic-agent-design Adaptive Reasoner
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdaptiveReasoner } from '../AdaptiveReasoner';

describe('AdaptiveReasoner', () => {
  let reasoner: AdaptiveReasoner;

  beforeEach(() => {
    reasoner = new AdaptiveReasoner();
  });

  afterEach(() => {
    reasoner.clearAll();
  });

  // ============================================================
  // addRule
  // ============================================================
  describe('addRule', () => {
    it('should add rule', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      expect(reasoner.getRuleCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const conditions = ['a'];
      reasoner.addRule({ id: 'r1', conditions, conclusion: 'b', confidence: 0.9 });
      conditions.push('c');
      expect(reasoner.getConditions('r1')).toEqual(['a']);
    });
  });

  // ============================================================
  // reason
  // ============================================================
  describe('reason', () => {
    it('should return empty for no matching rules', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      const results = reasoner.reason(['x']);
      expect(results).toHaveLength(0);
    });

    it('should return inference for matching rule', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      const results = reasoner.reason(['a']);
      expect(results).toHaveLength(1);
      expect(results[0].conclusion).toBe('b');
    });

    it('should require all conditions', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a', 'b'], conclusion: 'c', confidence: 0.9 });
      const results = reasoner.reason(['a']);
      expect(results).toHaveLength(0);
    });

    it('should sort by confidence', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'x', confidence: 0.5 });
      reasoner.addRule({ id: 'r2', conditions: ['a'], conclusion: 'y', confidence: 0.9 });
      const results = reasoner.reason(['a']);
      expect(results[0].conclusion).toBe('y');
    });

    it('should include chain', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a', 'b'], conclusion: 'c', confidence: 0.9 });
      const results = reasoner.reason(['a', 'b']);
      expect(results[0].chain).toContain('a');
      expect(results[0].chain).toContain('b');
      expect(results[0].chain).toContain('c');
    });
  });

  // ============================================================
  // evaluateConfidence
  // ============================================================
  describe('evaluateConfidence', () => {
    it('should return 0 for empty conditions', () => {
      const conf = reasoner.evaluateConfidence({ id: 'r1', conditions: [], conclusion: 'b', confidence: 0.9 }, ['a']);
      expect(conf).toBe(0);
    });

    it('should return full confidence for full match', () => {
      const conf = reasoner.evaluateConfidence({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 }, ['a']);
      expect(conf).toBe(0.9);
    });

    it('should return partial for partial match', () => {
      const conf = reasoner.evaluateConfidence({ id: 'r1', conditions: ['a', 'b'], conclusion: 'c', confidence: 0.9 }, ['a']);
      expect(conf).toBe(0.45);
    });
  });

  // ============================================================
  // explain
  // ============================================================
  describe('explain', () => {
    it('should return explanation for rule', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a', 'b'], conclusion: 'c', confidence: 0.9 });
      const explanation = reasoner.explain('r1');
      expect(explanation).toContain('r1');
      expect(explanation).toContain('a');
      expect(explanation).toContain('b');
      expect(explanation).toContain('c');
    });

    it('should return empty for unknown', () => {
      expect(reasoner.explain('unknown')).toBe('');
    });
  });

  // ============================================================
  // getRule / getAllRules
  // ============================================================
  describe('getRule / getAllRules', () => {
    it('should get rule by id', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      expect(reasoner.getRule('r1')?.conclusion).toBe('b');
    });

    it('should return all rules', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      reasoner.addRule({ id: 'r2', conditions: ['c'], conclusion: 'd', confidence: 0.8 });
      expect(reasoner.getAllRules()).toHaveLength(2);
    });
  });

  // ============================================================
  // removeRule
  // ============================================================
  describe('removeRule', () => {
    it('should remove rule', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      expect(reasoner.removeRule('r1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(reasoner.removeRule('unknown')).toBe(false);
    });
  });

  // ============================================================
  // updateRuleConfidence
  // ============================================================
  describe('updateRuleConfidence', () => {
    it('should update confidence', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.5 });
      expect(reasoner.updateRuleConfidence('r1', 0.9)).toBe(true);
      expect(reasoner.getRule('r1')?.confidence).toBe(0.9);
    });

    it('should clamp to 0-1', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.5 });
      reasoner.updateRuleConfidence('r1', 1.5);
      expect(reasoner.getRule('r1')?.confidence).toBe(1);
    });

    it('should return false for unknown', () => {
      expect(reasoner.updateRuleConfidence('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // conditions management
  // ============================================================
  describe('conditions management', () => {
    it('should add condition', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      expect(reasoner.addConditionToRule('r1', 'c')).toBe(true);
      expect(reasoner.getConditions('r1')).toContain('c');
    });

    it('should not add duplicate', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      reasoner.addConditionToRule('r1', 'a');
      expect(reasoner.getConditions('r1')).toHaveLength(1);
    });

    it('should remove condition', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a', 'b'], conclusion: 'c', confidence: 0.9 });
      expect(reasoner.removeConditionFromRule('r1', 'a')).toBe(true);
      expect(reasoner.getConditions('r1')).toEqual(['b']);
    });

    it('should return false for unknown', () => {
      expect(reasoner.addConditionToRule('unknown', 'x')).toBe(false);
      expect(reasoner.removeConditionFromRule('unknown', 'x')).toBe(false);
    });
  });

  // ============================================================
  // getConclusion
  // ============================================================
  describe('getConclusion', () => {
    it('should get conclusion', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      expect(reasoner.getConclusion('r1')).toBe('b');
    });

    it('should return undefined for unknown', () => {
      expect(reasoner.getConclusion('unknown')).toBeUndefined();
    });
  });

  // ============================================================
  // getRulesByConclusion
  // ============================================================
  describe('getRulesByConclusion', () => {
    it('should filter by conclusion', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      reasoner.addRule({ id: 'r2', conditions: ['c'], conclusion: 'b', confidence: 0.8 });
      expect(reasoner.getRulesByConclusion('b')).toHaveLength(2);
    });

    it('should return empty for no match', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      expect(reasoner.getRulesByConclusion('x')).toHaveLength(0);
    });
  });

  // ============================================================
  // getAverageConfidence
  // ============================================================
  describe('getAverageConfidence', () => {
    it('should calculate average', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.5 });
      reasoner.addRule({ id: 'r2', conditions: ['c'], conclusion: 'd', confidence: 0.7 });
      expect(reasoner.getAverageConfidence()).toBe(0.6);
    });

    it('should return 0 for empty', () => {
      expect(reasoner.getAverageConfidence()).toBe(0);
    });
  });

  // ============================================================
  // inference log
  // ============================================================
  describe('inference log', () => {
    it('should log inferences', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      reasoner.reason(['a']);
      expect(reasoner.getInferenceLog()).toHaveLength(1);
    });

    it('should clear log', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      reasoner.reason(['a']);
      reasoner.clearLog();
      expect(reasoner.getInferenceLog()).toHaveLength(0);
    });
  });

  // ============================================================
  // getTopConclusions / canConclude
  // ============================================================
  describe('getTopConclusions / canConclude', () => {
    it('should get top conclusions', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'x', confidence: 0.5 });
      reasoner.addRule({ id: 'r2', conditions: ['b'], conclusion: 'y', confidence: 0.9 });
      const top = reasoner.getTopConclusions(1);
      expect(top).toHaveLength(1);
      expect(top[0].conclusion).toBe('y');
    });

    it('should check canConclude', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a', 'b'], conclusion: 'c', confidence: 0.9 });
      expect(reasoner.canConclude('c', ['a', 'b'])).toBe(true);
      expect(reasoner.canConclude('c', ['a'])).toBe(false);
    });
  });

  // ============================================================
  // hasRule / count
  // ============================================================
  describe('hasRule / count', () => {
    it('should check rule existence', () => {
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      expect(reasoner.hasRule('r1')).toBe(true);
    });

    it('should count rules', () => {
      expect(reasoner.getRuleCount()).toBe(0);
      reasoner.addRule({ id: 'r1', conditions: ['a'], conclusion: 'b', confidence: 0.9 });
      expect(reasoner.getRuleCount()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many rules', () => {
      for (let i = 0; i < 100; i++) {
        reasoner.addRule({ id: `r${i}`, conditions: [`c${i}`], conclusion: `out${i}`, confidence: 0.5 });
      }
      expect(reasoner.getRuleCount()).toBe(100);
    });
  });
});