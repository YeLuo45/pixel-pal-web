/**
 * KnowledgeEngine Tests
 * generic-agent-design Knowledge Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KnowledgeEngine } from '../KnowledgeEngine';

describe('KnowledgeEngine', () => {
  let kne: KnowledgeEngine;

  beforeEach(() => {
    kne = new KnowledgeEngine();
  });

  afterEach(() => {
    kne.clearAll();
  });

  describe('addFact / verify / forget / remove', () => {
    it('should add', () => {
      expect(kne.addFact('fact1')).toMatch(/^kne-/);
    });

    it('should default confidence to medium', () => {
      kne.addFact('fact1');
      expect(kne.getConfidence(kne.getAllFacts()[0].id)).toBe('medium');
    });

    it('should mark as active', () => {
      kne.addFact('fact1');
      expect(kne.isActive(kne.getAllFacts()[0].id)).toBe(true);
    });

    it('should verify', () => {
      const id = kne.addFact('fact1');
      expect(kne.verify(id)).toBe(true);
    });

    it('should increment verified', () => {
      const id = kne.addFact('fact1');
      kne.verify(id);
      expect(kne.getVerified(id)).toBe(1);
    });

    it('should not verify inactive', () => {
      const id = kne.addFact('fact1');
      kne.setActive(id, false);
      expect(kne.verify(id)).toBe(false);
    });

    it('should return false for unknown verify', () => {
      expect(kne.verify('unknown')).toBe(false);
    });

    it('should forget', () => {
      const id = kne.addFact('fact1');
      expect(kne.forget(id)).toBe(true);
    });

    it('should set inactive on forget', () => {
      const id = kne.addFact('fact1');
      kne.forget(id);
      expect(kne.isActive(id)).toBe(false);
    });

    it('should return false for unknown forget', () => {
      expect(kne.forget('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = kne.addFact('fact1');
      expect(kne.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      kne.addFact('fact1');
      expect(kne.getStats().facts).toBe(1);
    });

    it('should count total added', () => {
      kne.addFact('fact1');
      expect(kne.getStats().totalAdded).toBe(1);
    });

    it('should count total verified', () => {
      const id = kne.addFact('fact1');
      kne.verify(id);
      expect(kne.getStats().totalVerified).toBe(1);
    });

    it('should count total forgotten', () => {
      const id = kne.addFact('fact1');
      kne.forget(id);
      expect(kne.getStats().totalForgotten).toBe(1);
    });

    it('should count low', () => {
      kne.addFact('fact1', 'low');
      expect(kne.getStats().low).toBe(1);
    });

    it('should count medium', () => {
      kne.addFact('fact1', 'medium');
      expect(kne.getStats().medium).toBe(1);
    });

    it('should count high', () => {
      kne.addFact('fact1', 'high');
      expect(kne.getStats().high).toBe(1);
    });

    it('should count certain', () => {
      kne.addFact('fact1', 'certain');
      expect(kne.getStats().certain).toBe(1);
    });

    it('should count active', () => {
      kne.addFact('fact1');
      expect(kne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = kne.addFact('fact1');
      kne.forget(id);
      expect(kne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = kne.addFact('fact1');
      kne.verify(id);
      expect(kne.getStats().totalHits).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get fact', () => {
      const id = kne.addFact('fact1');
      expect(kne.getFact(id)?.statement).toBe('fact1');
    });

    it('should get all', () => {
      kne.addFact('fact1');
      expect(kne.getAllFacts()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = kne.addFact('fact1');
      expect(kne.hasFact(id)).toBe(true);
    });

    it('should count', () => {
      expect(kne.getCount()).toBe(0);
      kne.addFact('fact1');
      expect(kne.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get statement', () => {
      const id = kne.addFact('hello world');
      expect(kne.getStatement(id)).toBe('hello world');
    });

    it('should get confidence', () => {
      const id = kne.addFact('fact1', 'high');
      expect(kne.getConfidence(id)).toBe('high');
    });

    it('should get hits', () => {
      const id = kne.addFact('fact1');
      kne.verify(id);
      expect(kne.getHits(id)).toBe(1);
    });

    it('should check low', () => {
      kne.addFact('fact1', 'low');
      expect(kne.isLow(kne.getAllFacts()[0].id)).toBe(true);
    });

    it('should check medium', () => {
      kne.addFact('fact1', 'medium');
      expect(kne.isMedium(kne.getAllFacts()[0].id)).toBe(true);
    });

    it('should check high', () => {
      kne.addFact('fact1', 'high');
      expect(kne.isHigh(kne.getAllFacts()[0].id)).toBe(true);
    });

    it('should check certain', () => {
      kne.addFact('fact1', 'certain');
      expect(kne.isCertain(kne.getAllFacts()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = kne.addFact('fact1');
      expect(kne.setActive(id, false)).toBe(true);
    });

    it('should set statement', () => {
      const id = kne.addFact('fact1');
      expect(kne.setStatement(id, 'fact2')).toBe(true);
    });

    it('should set confidence', () => {
      const id = kne.addFact('fact1');
      expect(kne.setConfidence(id, 'high')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(kne.setActive('unknown', false)).toBe(false);
      expect(kne.setStatement('unknown', 'f')).toBe(false);
      expect(kne.setConfidence('unknown', 'low')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = kne.addFact('fact1');
      kne.verify(id);
      kne.forget(id);
      kne.resetAll();
      expect(kne.getVerified(id)).toBe(0);
      expect(kne.isActive(id)).toBe(true);
    });
  });

  describe('by confidence / state', () => {
    it('should get by confidence', () => {
      kne.addFact('fact1', 'high');
      expect(kne.getByConfidence('high')).toHaveLength(1);
    });

    it('should get active', () => {
      kne.addFact('fact1');
      expect(kne.getActiveFacts()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = kne.addFact('fact1');
      kne.forget(id);
      expect(kne.getInactiveFacts()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      kne.addFact('fact1');
      expect(kne.getNewest()?.statement).toBe('fact1');
    });

    it('should return null for empty newest', () => {
      expect(kne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      kne.addFact('fact1');
      expect(kne.getOldest()?.statement).toBe('fact1');
    });

    it('should return null for empty oldest', () => {
      expect(kne.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = kne.addFact('fact1');
      expect(kne.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = kne.addFact('fact1');
      kne.verify(id);
      expect(kne.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      kne.addFact('fact1');
      expect(kne.getTotalAdded()).toBe(1);
    });

    it('should get total verified', () => {
      const id = kne.addFact('fact1');
      kne.verify(id);
      expect(kne.getTotalVerified()).toBe(1);
    });

    it('should get total forgotten', () => {
      const id = kne.addFact('fact1');
      kne.forget(id);
      expect(kne.getTotalForgotten()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many facts', () => {
      for (let i = 0; i < 50; i++) {
        kne.addFact(`f${i}`);
      }
      expect(kne.getCount()).toBe(50);
    });
  });
});