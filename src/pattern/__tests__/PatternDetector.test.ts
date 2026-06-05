/**
 * PatternDetector Tests
 * generic-agent-design Pattern Detector
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PatternDetector } from '../PatternDetector';

describe('PatternDetector', () => {
  let detector: PatternDetector;

  beforeEach(() => {
    detector = new PatternDetector();
  });

  afterEach(() => {
    detector.clearAll();
  });

  // ============================================================
  // registerPattern
  // ============================================================
  describe('registerPattern', () => {
    it('should register valid pattern', () => {
      expect(detector.registerPattern({ id: 'p1', name: 'email', regex: '\\w+@\\w+', confidence: 0.9, occurrences: 0 })).toBe(true);
    });

    it('should reject invalid regex', () => {
      expect(detector.registerPattern({ id: 'p1', name: 'bad', regex: '[invalid(', confidence: 0.9, occurrences: 0 })).toBe(false);
    });
  });

  // ============================================================
  // detect
  // ============================================================
  describe('detect', () => {
    it('should detect pattern', () => {
      detector.registerPattern({ id: 'p1', name: 'email', regex: '\\w+@\\w+', confidence: 0.9, occurrences: 0 });
      const matches = detector.detect('user@example');
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should return empty for no match', () => {
      detector.registerPattern({ id: 'p1', name: 'email', regex: '\\w+@\\w+', confidence: 0.9, occurrences: 0 });
      expect(detector.detect('hello world')).toHaveLength(0);
    });
  });

  // ============================================================
  // learn
  // ============================================================
  describe('learn', () => {
    it('should learn', () => {
      detector.learn('user@example.com', 'email');
      expect(detector.getTrainingCount('email')).toBe(1);
    });

    it('should accumulate', () => {
      detector.learn('user1@example.com', 'email');
      detector.learn('user2@example.com', 'email');
      expect(detector.getTrainingCount('email')).toBe(2);
    });
  });

  // ============================================================
  // evaluate
  // ============================================================
  describe('evaluate', () => {
    it('should evaluate', () => {
      detector.registerPattern({ id: 'p1', name: 'email', regex: '\\w+@\\w+', confidence: 0.9, occurrences: 0 });
      expect(detector.evaluate('p1')).toBe(0.9);
    });

    it('should return 0 for unknown', () => {
      expect(detector.evaluate('unknown')).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get pattern', () => {
      detector.registerPattern({ id: 'p1', name: 'email', regex: '\\w+@\\w+', confidence: 0.9, occurrences: 0 });
      expect(detector.getPattern('p1')?.name).toBe('email');
    });

    it('should get all', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      expect(detector.getAllPatterns()).toHaveLength(1);
    });

    it('should remove', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      expect(detector.removePattern('p1')).toBe(true);
    });

    it('should check existence', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      expect(detector.hasPattern('p1')).toBe(true);
    });

    it('should count', () => {
      expect(detector.getCount()).toBe(0);
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      expect(detector.getCount()).toBe(1);
    });
  });

  // ============================================================
  // occurrences
  // ============================================================
  describe('occurrences', () => {
    it('should increment', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      expect(detector.incrementOccurrence('p1')).toBe(true);
    });

    it('should get occurrences', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      detector.incrementOccurrence('p1');
      expect(detector.getOccurrences('p1')).toBe(1);
    });

    it('should return 0 for unknown', () => {
      expect(detector.getOccurrences('unknown')).toBe(0);
    });

    it('should return false for unknown increment', () => {
      expect(detector.incrementOccurrence('unknown')).toBe(false);
    });
  });

  // ============================================================
  // confidence
  // ============================================================
  describe('confidence', () => {
    it('should set confidence', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      expect(detector.setConfidence('p1', 0.9)).toBe(true);
    });

    it('should clamp to [0, 1]', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      detector.setConfidence('p1', 1.5);
      expect(detector.getPattern('p1')?.confidence).toBe(1);
    });

    it('should return false for unknown', () => {
      expect(detector.setConfidence('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get by min confidence', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      detector.registerPattern({ id: 'p2', name: 'b', regex: 'b', confidence: 0.9, occurrences: 0 });
      expect(detector.getByMinConfidence(0.8)).toHaveLength(1);
    });

    it('should get best pattern', () => {
      detector.registerPattern({ id: 'p1', name: 'a', regex: 'a', confidence: 0.5, occurrences: 0 });
      detector.registerPattern({ id: 'p2', name: 'b', regex: 'b', confidence: 0.9, occurrences: 0 });
      expect(detector.getBestPattern()?.id).toBe('p2');
    });

    it('should return null for empty', () => {
      expect(detector.getBestPattern()).toBeNull();
    });
  });

  // ============================================================
  // training
  // ============================================================
  describe('training', () => {
    it('should get all labels', () => {
      detector.learn('a', 'l1');
      detector.learn('b', 'l2');
      expect(detector.getAllLabels()).toHaveLength(2);
    });

    it('should count labels', () => {
      detector.learn('a', 'l1');
      expect(detector.getLabelCount()).toBe(1);
    });

    it('should get training data', () => {
      detector.learn('a', 'l1');
      expect(detector.getTrainingData('l1')).toEqual(['a']);
    });

    it('should check hasLabel', () => {
      detector.learn('a', 'l1');
      expect(detector.hasLabel('l1')).toBe(true);
    });

    it('should remove training', () => {
      detector.learn('a', 'l1');
      expect(detector.removeTraining('l1')).toBe(true);
    });

    it('should clear training', () => {
      detector.learn('a', 'l1');
      detector.clearTraining();
      expect(detector.getLabelCount()).toBe(0);
    });
  });

  // ============================================================
  // static
  // ============================================================
  describe('static', () => {
    it('should generate id', () => {
      expect(PatternDetector.generateId('Email Pattern')).toBe('p-email-pattern');
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many patterns', () => {
      for (let i = 0; i < 50; i++) {
        detector.registerPattern({ id: `p${i}`, name: `p${i}`, regex: `${i}`, confidence: 0.5, occurrences: 0 });
      }
      expect(detector.getCount()).toBe(50);
    });
  });
});