/**
 * StrategyLibrary Tests
 * generic-agent-design Strategy Library
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StrategyLibrary } from '../StrategyLibrary';

describe('StrategyLibrary', () => {
  let library: StrategyLibrary;

  beforeEach(() => {
    library = new StrategyLibrary();
  });

  afterEach(() => {
    library.clearAll();
  });

  // ============================================================
  // addStrategy
  // ============================================================
  describe('addStrategy', () => {
    it('should add strategy', () => {
      expect(library.addStrategy({ id: 's1', name: 'test', applicability: () => true, description: 'desc' })).toBe(true);
    });

    it('should reject duplicate', () => {
      library.addStrategy({ id: 's1', name: 'test', applicability: () => true, description: 'desc' });
      expect(library.addStrategy({ id: 's1', name: 'test', applicability: () => true, description: 'desc' })).toBe(false);
    });
  });

  // ============================================================
  // apply
  // ============================================================
  describe('apply', () => {
    it('should apply', () => {
      library.addStrategy({ id: 's1', name: 'test', applicability: () => true, description: 'desc' });
      expect(library.apply('s1', 'ctx')).toBe(true);
    });

    it('should return false for non-applicable', () => {
      library.addStrategy({ id: 's1', name: 'test', applicability: () => false, description: 'desc' });
      expect(library.apply('s1', 'ctx')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(library.apply('unknown', 'ctx')).toBe(false);
    });

    it('should increment usage', () => {
      library.addStrategy({ id: 's1', name: 'test', applicability: () => true, description: 'desc' });
      library.apply('s1', 'ctx');
      expect(library.getUsageCount('s1')).toBe(1);
    });
  });

  // ============================================================
  // selectBest
  // ============================================================
  describe('selectBest', () => {
    it('should select best', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.addStrategy({ id: 's2', name: 'b', applicability: () => true, description: 'd' });
      library.setScore('s1', 0.9);
      library.setScore('s2', 0.5);
      expect(library.selectBest('ctx')?.id).toBe('s1');
    });

    it('should return null for no applicable', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => false, description: 'd' });
      expect(library.selectBest('ctx')).toBeNull();
    });
  });

  // ============================================================
  // getByScore
  // ============================================================
  describe('getByScore', () => {
    it('should get by min score', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.addStrategy({ id: 's2', name: 'b', applicability: () => true, description: 'd' });
      library.setScore('s1', 0.9);
      library.setScore('s2', 0.5);
      expect(library.getByScore(0.7)).toHaveLength(1);
    });
  });

  // ============================================================
  // score
  // ============================================================
  describe('score', () => {
    it('should set score', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.setScore('s1', 0.9)).toBe(true);
    });

    it('should clamp score', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.setScore('s1', 1.5);
      expect(library.getScore('s1')).toBe(1);
    });

    it('should return false for unknown', () => {
      expect(library.setScore('unknown', 0.5)).toBe(false);
    });

    it('should boost score', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.boostScore('s1', 0.2)).toBe(true);
    });

    it('should penalize score', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.penalize('s1', 0.2)).toBe(true);
    });

    it('should return false for boost on unknown', () => {
      expect(library.boostScore('unknown', 0.1)).toBe(false);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get strategy', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getStrategy('s1')?.name).toBe('a');
    });

    it('should get all', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getAllStrategies()).toHaveLength(1);
    });

    it('should remove', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.removeStrategy('s1')).toBe(true);
    });

    it('should check existence', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.hasStrategy('s1')).toBe(true);
    });

    it('should count', () => {
      expect(library.getCount()).toBe(0);
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getCount()).toBe(1);
    });
  });

  // ============================================================
  // name/description
  // ============================================================
  describe('name/description', () => {
    it('should get name', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getName('s1')).toBe('a');
    });

    it('should get description', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'desc' });
      expect(library.getDescription('s1')).toBe('desc');
    });
  });

  // ============================================================
  // applicable
  // ============================================================
  describe('applicable', () => {
    it('should get applicable', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getApplicable('ctx')).toHaveLength(1);
    });

    it('should get inapplicable', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => false, description: 'd' });
      expect(library.getInapplicable('ctx')).toHaveLength(1);
    });
  });

  // ============================================================
  // application stats
  // ============================================================
  describe('application stats', () => {
    it('should count applications', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.apply('s1', 'ctx');
      expect(library.getApplicationCount()).toBe(1);
    });

    it('should count successful', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.apply('s1', 'ctx');
      expect(library.getSuccessfulApplications()).toBe(1);
    });

    it('should count failed', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => false, description: 'd' });
      library.apply('s1', 'ctx');
      expect(library.getFailedApplications()).toBe(1);
    });

    it('should calculate success rate', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.apply('s1', 'ctx');
      expect(library.getSuccessRate()).toBe(1);
    });

    it('should return 0 for empty', () => {
      expect(library.getSuccessRate()).toBe(0);
    });

    it('should get applications for strategy', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.apply('s1', 'ctx');
      expect(library.getApplicationsForStrategy('s1')).toHaveLength(1);
    });
  });

  // ============================================================
  // usage
  // ============================================================
  describe('usage', () => {
    it('should get most used', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.addStrategy({ id: 's2', name: 'b', applicability: () => true, description: 'd' });
      library.apply('s1', 'ctx');
      library.apply('s1', 'ctx');
      expect(library.getMostUsed()?.id).toBe('s1');
    });

    it('should return null for empty', () => {
      expect(library.getMostUsed()).toBeNull();
    });

    it('should get least used', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getLeastUsed()?.id).toBe('s1');
    });

    it('should return null for empty least', () => {
      expect(library.getLeastUsed()).toBeNull();
    });
  });

  // ============================================================
  // score stats
  // ============================================================
  describe('score stats', () => {
    it('should get avg', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getAvgScore()).toBe(0.5);
    });

    it('should get max', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getMaxScore()).toBe(0.5);
    });

    it('should get min', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getMinScore()).toBe(0.5);
    });

    it('should return 0 for empty avg', () => {
      expect(library.getAvgScore()).toBe(0);
    });
  });

  // ============================================================
  // timestamps / clear
  // ============================================================
  describe('timestamps / clear', () => {
    it('should get created at', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      expect(library.getCreatedAt('s1')).toBeGreaterThan(0);
    });

    it('should clear applications', () => {
      library.addStrategy({ id: 's1', name: 'a', applicability: () => true, description: 'd' });
      library.apply('s1', 'ctx');
      library.clearApplications();
      expect(library.getApplicationCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many strategies', () => {
      for (let i = 0; i < 50; i++) {
        library.addStrategy({ id: `s${i}`, name: `s${i}`, applicability: () => true, description: 'd' });
      }
      expect(library.getCount()).toBe(50);
    });
  });
});