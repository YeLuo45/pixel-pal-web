import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdaptiveLearner, LearningData } from '../AdaptiveLearner';

describe('AdaptiveLearner', () => {
  describe('constructor', () => {
    it('should create an empty learner instance', () => {
      const learner = new AdaptiveLearner();
      const data = learner.getData();
      expect(data).toEqual([]);
    });

    it('should initialize empty patterns map', () => {
      const learner = new AdaptiveLearner();
      const pattern = learner.findPattern('chat');
      expect(pattern).toBeNull();
    });
  });

  describe('record', () => {
    it('should record interaction data', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const data = learner.getData();
      expect(data.length).toBe(1);
      expect(data[0].interactionType).toBe('chat');
      expect(data[0].outcome).toBe(0.5);
    });

    it('should record multiple interactions', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      learner.record('game', 0.7);
      learner.record('social', -0.2);
      const data = learner.getData();
      expect(data.length).toBe(3);
    });

    it('should set timestamp automatically', () => {
      const before = Date.now();
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const after = Date.now();
      const data = learner.getData();
      expect(data[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(data[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should store context when provided', () => {
      const learner = new AdaptiveLearner();
      const context = { topic: 'sports', duration: 30 };
      learner.record('chat', 0.5, context);
      const data = learner.getData();
      expect(data[0].context).toEqual(context);
    });

    it('should handle empty context', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const data = learner.getData();
      expect(data[0].context).toEqual({});
    });

    it('should accept negative outcomes', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', -0.5);
      learner.record('game', -1);
      const data = learner.getData();
      expect(data[0].outcome).toBe(-0.5);
      expect(data[1].outcome).toBe(-1);
    });

    it('should accept zero outcome', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0);
      const data = learner.getData();
      expect(data[0].outcome).toBe(0);
    });

    it('should accept full range outcome (-1 to 1)', () => {
      const learner = new AdaptiveLearner();
      [-1, -0.5, 0, 0.5, 1].forEach(outcome => {
        learner.record('chat', outcome);
      });
      const data = learner.getData();
      expect(data.length).toBe(5);
    });
  });

  describe('getData', () => {
    it('should return all recorded data when no limit provided', () => {
      const learner = new AdaptiveLearner();
      for (let i = 0; i < 10; i++) {
        learner.record('chat', i * 0.1);
      }
      const data = learner.getData();
      expect(data.length).toBe(10);
    });

    it('should return limited data when limit provided', () => {
      const learner = new AdaptiveLearner();
      for (let i = 0; i < 10; i++) {
        learner.record('chat', i * 0.1);
      }
      const data = learner.getData(5);
      expect(data.length).toBe(5);
    });

    it('should return most recent data when limit provided', () => {
      const learner = new AdaptiveLearner();
      for (let i = 0; i < 10; i++) {
        learner.record('chat', i * 0.1);
      }
      const data = learner.getData(3);
      // should be the last 3 records
      expect(data[0].outcome).toBe(0.7);
      expect(data[1].outcome).toBe(0.8);
      expect(data[2].outcome).toBe(0.9);
    });

    it('should return empty array when no data recorded', () => {
      const learner = new AdaptiveLearner();
      const data = learner.getData();
      expect(data).toEqual([]);
    });

    it('should return empty array when limit is 0', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const data = learner.getData(0);
      expect(data).toEqual([]);
    });
  });

  describe('findPattern', () => {
    it('should return null when no data for interaction type', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const pattern = learner.findPattern('game');
      expect(pattern).toBeNull();
    });

    it('should return array of outcomes for known interaction type', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      learner.record('chat', 0.7);
      learner.record('chat', 0.3);
      const pattern = learner.findPattern('chat');
      expect(pattern).toEqual([0.5, 0.7, 0.3]);
    });

    it('should return outcomes in chronological order', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.1);
      learner.record('chat', 0.5);
      learner.record('chat', 0.9);
      const pattern = learner.findPattern('chat');
      expect(pattern).toEqual([0.1, 0.5, 0.9]);
    });

    it('should return only outcomes for specified type', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      learner.record('game', 0.7);
      learner.record('chat', 0.3);
      learner.record('social', 0.2);
      const pattern = learner.findPattern('chat');
      expect(pattern).toEqual([0.5, 0.3]);
    });

    it('should return single outcome as single-element array', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const pattern = learner.findPattern('chat');
      expect(pattern).toHaveLength(1);
      expect(pattern).toEqual([0.5]);
    });
  });

  describe('predictOutcome', () => {
    it('should return 0 when no data available', () => {
      const learner = new AdaptiveLearner();
      const predicted = learner.predictOutcome('chat');
      expect(predicted).toBe(0);
    });

    it('should return average of recorded outcomes', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.2);
      learner.record('chat', 0.4);
      learner.record('chat', 0.6);
      const predicted = learner.predictOutcome('chat');
      expect(predicted).toBeCloseTo(0.4);
    });

    it('should return single outcome when only one recorded', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.7);
      const predicted = learner.predictOutcome('chat');
      expect(predicted).toBe(0.7);
    });

    it('should consider only specific interaction type', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.2);
      learner.record('game', 0.8);
      learner.record('chat', 0.4);
      const chatPredicted = learner.predictOutcome('chat');
      const gamePredicted = learner.predictOutcome('game');
      expect(chatPredicted).toBeCloseTo(0.3);
      expect(gamePredicted).toBe(0.8);
    });

    it('should handle context parameter without throwing', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5, { topic: 'sports' });
      const predicted = learner.predictOutcome('chat', { topic: 'music' });
      expect(typeof predicted).toBe('number');
    });

    it('should return value between -1 and 1 for valid inputs', () => {
      const learner = new AdaptiveLearner();
      for (let i = -10; i <= 10; i++) {
        learner.record('chat', i / 10);
      }
      const predicted = learner.predictOutcome('chat');
      expect(predicted).toBeGreaterThanOrEqual(-1);
      expect(predicted).toBeLessThanOrEqual(1);
    });
  });

  describe('getAdjustment', () => {
    it('should return 0 when no data for interaction type', () => {
      const learner = new AdaptiveLearner();
      const adjustment = learner.getAdjustment('chat');
      expect(adjustment).toBe(0);
    });

    it('should return scaled average for known interaction type', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      learner.record('chat', 0.5);
      const adjustment = learner.getAdjustment('chat');
      expect(adjustment).toBeCloseTo(0.25);
    });

    it('should return negative for poor outcomes', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', -0.5);
      learner.record('chat', -0.5);
      const adjustment = learner.getAdjustment('chat');
      expect(adjustment).toBeCloseTo(-0.25);
    });

    it('should return positive for good outcomes', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.8);
      learner.record('chat', 0.8);
      const adjustment = learner.getAdjustment('chat');
      expect(adjustment).toBeCloseTo(0.4);
    });

    it('should scale based on number of samples', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const singleAdjustment = learner.getAdjustment('chat');
      learner.record('chat', 0.5);
      learner.record('chat', 0.5);
      learner.record('chat', 0.5);
      const multiAdjustment = learner.getAdjustment('chat');
      // More data points should lead to more confident adjustment
      expect(multiAdjustment).toBeGreaterThan(singleAdjustment);
    });

    it('should handle single sample', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.6);
      const adjustment = learner.getAdjustment('chat');
      expect(adjustment).toBeCloseTo(0.15);
    });

    it('should return 0 for neutral outcomes', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0);
      const adjustment = learner.getAdjustment('chat');
      expect(adjustment).toBe(0);
    });
  });

  describe('getConfidence', () => {
    it('should return 0 when no data for interaction type', () => {
      const learner = new AdaptiveLearner();
      const confidence = learner.getConfidence('chat');
      expect(confidence).toBe(0);
    });

    it('should return low confidence for single sample', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const confidence = learner.getConfidence('chat');
      expect(confidence).toBeLessThan(0.5);
    });

    it('should return higher confidence for more samples', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      const singleConfidence = learner.getConfidence('chat');
      for (let i = 0; i < 9; i++) {
        learner.record('chat', 0.5);
      }
      const multiConfidence = learner.getConfidence('chat');
      expect(multiConfidence).toBeGreaterThan(singleConfidence);
    });

    it('should cap confidence at 1', () => {
      const learner = new AdaptiveLearner();
      for (let i = 0; i < 100; i++) {
        learner.record('chat', 0.5);
      }
      const confidence = learner.getConfidence('chat');
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should increase with sample size but approach limit', () => {
      const learner = new AdaptiveLearner();
      const confidences: number[] = [];
      for (let i = 0; i < 50; i++) {
        learner.record('chat', 0.5);
        confidences.push(learner.getConfidence('chat'));
      }
      // First few should increase quickly
      expect(confidences[5]).toBeGreaterThan(confidences[2]);
      // Later increases should be smaller
      const earlyGrowth = confidences[5] - confidences[2];
      const lateGrowth = confidences[25] - confidences[22];
      expect(Math.abs(lateGrowth)).toBeLessThan(Math.abs(earlyGrowth));
    });
  });

  describe('forgetOldData', () => {
    it('should remove data older than maxAge', () => {
      const learner = new AdaptiveLearner();
      vi.useFakeTimers();
      vi.setSystemTime(1000);
      learner.record('chat', 0.5);
      learner.record('chat', 0.6);
      vi.setSystemTime(2000);
      learner.record('chat', 0.7);
      learner.forgetOldData(500); // 500ms max age
      vi.useRealTimers();
      const data = learner.getData();
      expect(data.length).toBe(1);
    });

    it('should keep recent data within maxAge', () => {
      const learner = new AdaptiveLearner();
      vi.useFakeTimers();
      vi.setSystemTime(1000);
      learner.record('chat', 0.5);
      vi.setSystemTime(1500);
      learner.record('chat', 0.6);
      vi.setSystemTime(2000);
      learner.record('chat', 0.7);
      learner.forgetOldData(1000); // 1000ms max age
      vi.useRealTimers();
      const data = learner.getData();
      expect(data.length).toBe(2);
    });

    it('should not remove data when all within maxAge', () => {
      const learner = new AdaptiveLearner();
      vi.useFakeTimers();
      vi.setSystemTime(1000);
      learner.record('chat', 0.5);
      learner.record('chat', 0.6);
      learner.record('chat', 0.7);
      vi.setSystemTime(1500);
      learner.forgetOldData(1000);
      vi.useRealTimers();
      const data = learner.getData();
      expect(data.length).toBe(3);
    });

    it('should update patterns after forgetting', () => {
      const learner = new AdaptiveLearner();
      vi.useFakeTimers();
      vi.setSystemTime(1000);
      learner.record('chat', 0.5);
      learner.record('chat', 0.6);
      vi.setSystemTime(2000);
      learner.record('chat', 0.7);
      learner.forgetOldData(500);
      vi.useRealTimers();
      const pattern = learner.findPattern('chat');
      expect(pattern).toEqual([0.7]);
    });

    it('should handle 0 maxAge', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      learner.forgetOldData(0);
      const data = learner.getData();
      expect(data.length).toBe(0);
    });

    it('should handle very large maxAge', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 0.5);
      learner.record('chat', 0.6);
      learner.forgetOldData(Number.MAX_SAFE_INTEGER);
      const data = learner.getData();
      expect(data.length).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle many different interaction types', () => {
      const learner = new AdaptiveLearner();
      const types = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      types.forEach(type => {
        learner.record(type, 0.5);
      });
      types.forEach(type => {
        const pattern = learner.findPattern(type);
        expect(pattern).toEqual([0.5]);
      });
    });

    it('should handle rapid recording', () => {
      const learner = new AdaptiveLearner();
      for (let i = 0; i < 100; i++) {
        learner.record('chat', Math.random());
      }
      const data = learner.getData();
      expect(data.length).toBe(100);
    });

    it('should handle extreme outcome values', () => {
      const learner = new AdaptiveLearner();
      learner.record('chat', 1);
      learner.record('chat', -1);
      const predicted = learner.predictOutcome('chat');
      expect(predicted).toBe(0);
    });

    it('should handle context with nested objects', () => {
      const learner = new AdaptiveLearner();
      const context = {
        user: { name: 'Alice', preferences: { theme: 'dark' } },
        session: { id: 123, startTime: Date.now() },
      };
      learner.record('chat', 0.5, context);
      const data = learner.getData();
      expect(data[0].context).toEqual(context);
    });

    it('should maintain data order after forgetOldData', () => {
      const learner = new AdaptiveLearner();
      vi.useFakeTimers();
      vi.setSystemTime(1000);
      learner.record('chat', 0.1);
      learner.record('chat', 0.2);
      vi.setSystemTime(1500);
      learner.record('chat', 0.3);
      learner.forgetOldData(400);
      vi.setSystemTime(2000);
      learner.record('chat', 0.4);
      learner.forgetOldData(400);
      vi.useRealTimers();
      const data = learner.getData();
      expect(data[0].outcome).toBe(0.3);
      expect(data[1].outcome).toBe(0.4);
    });
  });
});