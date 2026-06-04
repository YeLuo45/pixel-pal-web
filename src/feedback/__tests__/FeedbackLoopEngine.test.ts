/**
 * FeedbackLoopEngine Tests - V189
 * Tests for thunderbolt Feedback Loops implementation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeedbackLoopEngine, FeedbackSignal, FeedbackLoop } from '../FeedbackLoopEngine';

describe('FeedbackLoopEngine', () => {
  let engine: FeedbackLoopEngine;

  beforeEach(() => {
    engine = new FeedbackLoopEngine();
  });

  afterEach(() => {
    engine.clear();
  });

  describe('record()', () => {
    it('should record a positive feedback signal', () => {
      engine.record({
        type: 'positive',
        metric: 'accuracy',
        value: 0.95,
        source: 'test',
      });

      const loops = engine.getActiveLoops();
      expect(loops.length).toBe(1);
      expect(loops[0].signals.length).toBe(1);
      expect(loops[0].signals[0].type).toBe('positive');
      expect(loops[0].signals[0].metric).toBe('accuracy');
    });

    it('should record a negative feedback signal', () => {
      engine.record({
        type: 'negative',
        metric: 'latency',
        value: 200,
        source: 'test',
      });

      const loops = engine.getActiveLoops();
      expect(loops.length).toBe(1);
      expect(loops[0].signals[0].type).toBe('negative');
    });

    it('should record a neutral feedback signal', () => {
      engine.record({
        type: 'neutral',
        metric: 'throughput',
        value: 100,
        source: 'test',
      });

      const loops = engine.getActiveLoops();
      expect(loops[0].signals[0].type).toBe('neutral');
    });

    it('should add signals to existing loop for same metric', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test1' });
      engine.record({ type: 'negative', metric: 'accuracy', value: 0.8, source: 'test2' });

      const loops = engine.getActiveLoops();
      expect(loops.length).toBe(1);
      expect(loops[0].signals.length).toBe(2);
    });

    it('should create separate loops for different metrics', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      engine.record({ type: 'negative', metric: 'latency', value: 100, source: 'test' });

      const loops = engine.getActiveLoops();
      expect(loops.length).toBe(2);
    });

    it('should assign timestamp to signal', () => {
      const before = Date.now();
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      const after = Date.now();

      const loop = engine.getActiveLoops()[0];
      expect(loop.signals[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(loop.signals[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should limit signals to 100 per loop', () => {
      for (let i = 0; i < 150; i++) {
        engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      }

      const loop = engine.getActiveLoops()[0];
      expect(loop.signals.length).toBe(100);
    });
  });

  describe('evaluate()', () => {
    it('should return null for non-existent loop', () => {
      const result = engine.evaluate('non-existent');
      expect(result).toBeNull();
    });

    it('should return loop with stable state when no signals', () => {
      engine.record({ type: 'neutral', metric: 'accuracy', value: 0.5, source: 'test' });
      
      const loop = engine.evaluate('accuracy');
      expect(loop).not.toBeNull();
      expect(loop!.state).toBe('stable');
    });

    it('should return expanding state when positive signals dominate', () => {
      for (let i = 0; i < 10; i++) {
        engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      }

      const loop = engine.evaluate('accuracy');
      expect(loop!.state).toBe('expanding');
    });

    it('should return contracting state when negative signals dominate', () => {
      for (let i = 0; i < 10; i++) {
        engine.record({ type: 'negative', metric: 'accuracy', value: 0.3, source: 'test' });
      }

      const loop = engine.evaluate('accuracy');
      expect(loop!.state).toBe('contracting');
    });

    it('should return stable state with balanced signals', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.6, source: 'test' });
      engine.record({ type: 'negative', metric: 'accuracy', value: 0.4, source: 'test' });

      const loop = engine.evaluate('accuracy');
      expect(loop!.state).toBe('stable');
    });
  });

  describe('adjustThreshold()', () => {
    it('should adjust threshold by delta', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      
      engine.adjustThreshold('accuracy', 0.1);
      
      const loop = engine.getLoop('accuracy');
      expect(loop!.threshold).toBe(0.6);
    });

    it('should not allow threshold below 0.01', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      
      engine.adjustThreshold('accuracy', -10);
      
      const loop = engine.getLoop('accuracy');
      expect(loop!.threshold).toBe(0.01);
    });

    it('should do nothing for non-existent loop', () => {
      engine.adjustThreshold('non-existent', 0.1);
      // Should not throw
    });
  });

  describe('getActiveLoops()', () => {
    it('should return empty array when no loops', () => {
      expect(engine.getActiveLoops()).toEqual([]);
    });

    it('should return all active loops', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      engine.record({ type: 'negative', metric: 'latency', value: 100, source: 'test' });

      const loops = engine.getActiveLoops();
      expect(loops.length).toBe(2);
    });
  });

  describe('getLoop()', () => {
    it('should return undefined for non-existent loop', () => {
      expect(engine.getLoop('non-existent')).toBeUndefined();
    });

    it('should return loop by metric name', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });

      const loop = engine.getLoop('accuracy');
      expect(loop).toBeDefined();
      expect(loop!.id).toContain('accuracy');
    });
  });

  describe('clear()', () => {
    it('should remove all loops', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      engine.clear();
      
      expect(engine.getActiveLoops()).toEqual([]);
    });
  });

  describe('getLoopCount()', () => {
    it('should return 0 for empty engine', () => {
      expect(engine.getLoopCount()).toBe(0);
    });

    it('should return correct count', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      engine.record({ type: 'negative', metric: 'latency', value: 100, source: 'test' });
      
      expect(engine.getLoopCount()).toBe(2);
    });
  });

  describe('state transitions', () => {
    it('should transition from stable to expanding', () => {
      engine.record({ type: 'neutral', metric: 'accuracy', value: 0.5, source: 'test' });
      
      for (let i = 0; i < 8; i++) {
        engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });
      }

      const loop = engine.evaluate('accuracy');
      expect(loop!.state).toBe('expanding');
    });

    it('should transition from stable to contracting', () => {
      engine.record({ type: 'neutral', metric: 'accuracy', value: 0.5, source: 'test' });
      
      for (let i = 0; i < 8; i++) {
        engine.record({ type: 'negative', metric: 'accuracy', value: 0.2, source: 'test' });
      }

      const loop = engine.evaluate('accuracy');
      expect(loop!.state).toBe('contracting');
    });
  });

  describe('FeedbackLoop interface', () => {
    it('should have correct loop structure', () => {
      engine.record({ type: 'positive', metric: 'accuracy', value: 0.9, source: 'test' });

      const loop = engine.getLoop('accuracy')!;
      expect(loop.id).toBeDefined();
      expect(typeof loop.id).toBe('string');
      expect(loop.name).toBe('Feedback Loop: accuracy');
      expect(Array.isArray(loop.signals)).toBe(true);
      expect(['expanding', 'contracting', 'stable']).toContain(loop.state);
      expect(typeof loop.threshold).toBe('number');
      expect(typeof loop.adjustmentRate).toBe('number');
    });
  });
});