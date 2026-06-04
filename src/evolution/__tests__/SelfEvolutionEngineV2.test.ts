/**
 * SelfEvolutionEngineV2 Tests
 * generic-agent-design Self-Evolution Engine v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SelfEvolutionEngineV2 } from '../SelfEvolutionEngineV2';

describe('SelfEvolutionEngineV2', () => {
  let engine: SelfEvolutionEngineV2;

  beforeEach(() => {
    engine = new SelfEvolutionEngineV2();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // trackMetrics
  // ============================================================
  describe('trackMetrics', () => {
    it('should track metrics with timestamp', () => {
      engine.trackMetrics({ accuracy: 0.9, speed: 0.8, resourceUsage: 0.2, timestamp: 1000 });
      expect(engine.getPerformanceHistory()).toHaveLength(1);
    });

    it('should track multiple metrics', () => {
      engine.trackMetrics({ accuracy: 0.9, speed: 0.8, resourceUsage: 0.2, timestamp: 1000 });
      engine.trackMetrics({ accuracy: 0.85, speed: 0.75, resourceUsage: 0.3, timestamp: 1001 });
      expect(engine.getPerformanceHistory()).toHaveLength(2);
    });

    it('should not mutate original', () => {
      const metrics = { accuracy: 0.9, speed: 0.8, resourceUsage: 0.2, timestamp: 1000 };
      engine.trackMetrics(metrics);
      metrics.accuracy = 0.5;
      expect(engine.getPerformanceHistory()[0].accuracy).toBe(0.9);
    });
  });

  // ============================================================
  // addRule (with weight)
  // ============================================================
  describe('addRule', () => {
    it('should add rule with weight', () => {
      engine.addRule({
        trigger: (m) => m.accuracy < 0.8,
        adjustment: 10,
        weight: 2,
      });
      expect(engine.getEvolutionCount()).toBe(0);
    });

    it('should allow many rules', () => {
      for (let i = 0; i < 10; i++) {
        engine.addRule({ trigger: () => true, adjustment: i, weight: 1 });
      }
      engine.trackMetrics({ accuracy: 0.9, speed: 0.8, resourceUsage: 0.2, timestamp: 1000 });
      const adj = engine.trigger();
      expect(adj).toBe(4.5); // average of 0..9
    });
  });

  // ============================================================
  // trigger (weighted)
  // ============================================================
  describe('trigger', () => {
    it('should return 0 with no metrics', () => {
      expect(engine.trigger()).toBe(0);
    });

    it('should apply weighted rules', () => {
      engine.addRule({ trigger: () => true, adjustment: 10, weight: 1 });
      engine.addRule({ trigger: () => true, adjustment: 20, weight: 2 });
      engine.trackMetrics({ accuracy: 0.9, speed: 0.8, resourceUsage: 0.2, timestamp: 1000 });
      // Weighted: (10*1 + 20*2) / (1+2) = 50/3 = 16.67
      expect(engine.trigger()).toBeCloseTo(16.67, 1);
    });

    it('should handle zero weight', () => {
      engine.addRule({ trigger: () => true, adjustment: 10, weight: 0 });
      engine.trackMetrics({ accuracy: 0.9, speed: 0.8, resourceUsage: 0.2, timestamp: 1000 });
      expect(engine.trigger()).toBe(0);
    });
  });

  // ============================================================
  // evolve
  // ============================================================
  describe('evolve', () => {
    it('should create new strategy with generations', () => {
      const strategy = engine.evolve();
      expect(strategy.id).toBe('strategy-v2-1');
      expect(strategy.generations).toBe(1);
    });

    it('should increment generation counter', () => {
      engine.evolve();
      engine.evolve();
      expect(engine.getGenerationCount()).toBe(2);
    });

    it('should set score based on metrics and adjustment', () => {
      engine.trackMetrics({ accuracy: 0.8, speed: 0.7, resourceUsage: 0.1, timestamp: 1000 });
      const strategy = engine.evolve();
      expect(strategy.score).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // getStrategies (with generations)
  // ============================================================
  describe('getStrategies', () => {
    it('should return all strategies', () => {
      engine.evolve();
      engine.evolve();
      expect(engine.getStrategies()).toHaveLength(2);
    });

    it('should filter by generation', () => {
      engine.evolve();
      engine.evolve();
      const gen1Strategies = engine.getStrategiesByGeneration(1);
      expect(gen1Strategies).toHaveLength(1);
    });
  });

  // ============================================================
  // getBestStrategy
  // ============================================================
  describe('getBestStrategy', () => {
    it('should return highest scoring strategy', () => {
      engine.trackMetrics({ accuracy: 0.3, speed: 0.3, resourceUsage: 0.3, timestamp: 1000 });
      engine.evolve();
      engine.addRule({ trigger: () => true, adjustment: 100, weight: 1 });
      engine.trackMetrics({ accuracy: 0.9, speed: 0.9, resourceUsage: 0.1, timestamp: 1001 });
      engine.evolve();
      expect(engine.getBestStrategy()?.id).toBe('strategy-v2-2');
    });
  });

  // ============================================================
  // mergeStrategies
  // ============================================================
  describe('mergeStrategies', () => {
    it('should merge two strategies', () => {
      engine.evolve();
      engine.evolve();
      const merged = engine.mergeStrategies('strategy-v2-1', 'strategy-v2-2');
      expect(merged).not.toBeNull();
      expect(merged!.id).toBe('strategy-v2-3');
      expect(merged!.generations).toBeGreaterThan(1);
    });

    it('should return null for unknown strategy', () => {
      engine.evolve();
      expect(engine.mergeStrategies('unknown', 'strategy-v2-1')).toBeNull();
    });
  });

  // ============================================================
  // deleteStrategy
  // ============================================================
  describe('deleteStrategy', () => {
    it('should delete strategy', () => {
      engine.evolve();
      expect(engine.deleteStrategy('strategy-v2-1')).toBe(true);
      expect(engine.getStrategies()).toHaveLength(0);
    });

    it('should return false for unknown', () => {
      expect(engine.deleteStrategy('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getAverageStrategyScore
  // ============================================================
  describe('getAverageStrategyScore', () => {
    it('should calculate average', () => {
      engine.trackMetrics({ accuracy: 0.5, speed: 0.5, resourceUsage: 0.5, timestamp: 1000 });
      engine.evolve();
      engine.evolve();
      expect(engine.getAverageStrategyScore()).toBeGreaterThan(0);
    });

    it('should return 0 for no strategies', () => {
      expect(engine.getAverageStrategyScore()).toBe(0);
    });
  });

  // ============================================================
  // pruneMetrics
  // ============================================================
  describe('pruneMetrics', () => {
    it('should keep only last n metrics', () => {
      for (let i = 0; i < 10; i++) {
        engine.trackMetrics({ accuracy: i / 10, speed: 0.5, resourceUsage: 0.1, timestamp: 1000 + i });
      }
      engine.pruneMetrics(5);
      expect(engine.getPerformanceHistory()).toHaveLength(5);
    });
  });

  // ============================================================
  // average metrics
  // ============================================================
  describe('average metrics', () => {
    it('should calculate average accuracy', () => {
      engine.trackMetrics({ accuracy: 0.8, speed: 0.5, resourceUsage: 0.2, timestamp: 1000 });
      engine.trackMetrics({ accuracy: 0.6, speed: 0.5, resourceUsage: 0.2, timestamp: 1001 });
      expect(engine.getAverageAccuracy()).toBe(0.7);
    });

    it('should return 0 for no history', () => {
      expect(engine.getAverageAccuracy()).toBe(0);
      expect(engine.getAverageSpeed()).toBe(0);
      expect(engine.getAverageResourceUsage()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle empty trigger', () => {
      engine.addRule({ trigger: () => false, adjustment: 10, weight: 1 });
      engine.trackMetrics({ accuracy: 0.5, speed: 0.5, resourceUsage: 0.1, timestamp: 1000 });
      expect(engine.trigger()).toBe(0);
    });

    it('should handle many evolutions', () => {
      for (let i = 0; i < 100; i++) {
        engine.evolve();
      }
      expect(engine.getStrategies()).toHaveLength(100);
    });

    it('should handle strategy mutation', () => {
      engine.evolve();
      const strategies = engine.getStrategies();
      strategies.push({ id: 'fake', name: 'F', score: 0, active: false, generations: 0 });
      expect(engine.getStrategies()).toHaveLength(1);
    });

    it('should handle extreme metric values', () => {
      engine.trackMetrics({ accuracy: 1.0, speed: 1.0, resourceUsage: 0.0, timestamp: 1000 });
      engine.trackMetrics({ accuracy: 0.0, speed: 0.0, resourceUsage: 1.0, timestamp: 1001 });
      expect(engine.getAverageAccuracy()).toBe(0.5);
    });
  });
});