/**
 * IntuitionEngine Tests
 * generic-agent-design Intuition Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntuitionEngine } from '../IntuitionEngine';

describe('IntuitionEngine', () => {
  let iue: IntuitionEngine;

  beforeEach(() => {
    iue = new IntuitionEngine();
  });

  afterEach(() => {
    iue.clearAll();
  });

  describe('guess / refine / confirm / reject / remove', () => {
    it('should guess', () => {
      expect(iue.guess('q', 'a', 0.5)).toMatch(/^iue-/);
    });

    it('should default status to guessed', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getStatus(iue.getAllIntuitions()[0].id)).toBe('guessed');
    });

    it('should clamp confidence to 0-1', () => {
      const id = iue.guess('q', 'a', 2);
      expect(iue.getConfidence(id)).toBe(1);
    });

    it('should mark as active', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.isActive(iue.getAllIntuitions()[0].id)).toBe(true);
    });

    it('should refine', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.refine(id, 0.8)).toBe(true);
    });

    it('should clamp refine confidence to 0-1', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.refine(id, 2);
      expect(iue.getConfidence(id)).toBe(1);
    });

    it('should not refine inactive', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.setActive(id, false);
      expect(iue.refine(id, 0.8)).toBe(false);
    });

    it('should return false for unknown refine', () => {
      expect(iue.refine('unknown', 0.5)).toBe(false);
    });

    it('should confirm', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.confirm(id)).toBe(true);
    });

    it('should set confirmed status', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.confirm(id);
      expect(iue.isConfirmed(id)).toBe(true);
    });

    it('should not confirm inactive', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.setActive(id, false);
      expect(iue.confirm(id)).toBe(false);
    });

    it('should return false for unknown confirm', () => {
      expect(iue.confirm('unknown')).toBe(false);
    });

    it('should reject', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.reject(id)).toBe(true);
    });

    it('should set rejected status', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.reject(id);
      expect(iue.isRejected(id)).toBe(true);
    });

    it('should not reject inactive', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.setActive(id, false);
      expect(iue.reject(id)).toBe(false);
    });

    it('should return false for unknown reject', () => {
      expect(iue.reject('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getStats().intuitions).toBe(1);
    });

    it('should count total guessed', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getStats().totalGuessed).toBe(1);
    });

    it('should count total refined', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.refine(id, 0.8);
      expect(iue.getStats().totalRefined).toBe(1);
    });

    it('should count total confirmed', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.confirm(id);
      expect(iue.getStats().totalConfirmed).toBe(1);
    });

    it('should count total rejected', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.reject(id);
      expect(iue.getStats().totalRejected).toBe(1);
    });

    it('should count guessed', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getStats().guessed).toBe(1);
    });

    it('should count confirmed', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.confirm(id);
      expect(iue.getStats().confirmed).toBe(1);
    });

    it('should count rejected', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.reject(id);
      expect(iue.getStats().rejected).toBe(1);
    });

    it('should count active', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.setActive(id, false);
      expect(iue.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.refine(id, 0.8);
      expect(iue.getStats().totalHits).toBe(1);
    });

    it('should count unique questions', () => {
      iue.guess('a', 'x', 0.5);
      iue.guess('a', 'y', 0.5);
      expect(iue.getStats().uniqueQuestions).toBe(1);
    });

    it('should count total confidence', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getStats().totalConfidence).toBe(0.5);
    });
  });

  describe('queries', () => {
    it('should get intuition', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.getIntuition(id)?.question).toBe('q');
    });

    it('should get all', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getAllIntuitions()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.hasIntuition(id)).toBe(true);
    });

    it('should count', () => {
      expect(iue.getCount()).toBe(0);
      iue.guess('q', 'a', 0.5);
      expect(iue.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get question', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.getQuestion(id)).toBe('q');
    });

    it('should get answer', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.getAnswer(id)).toBe('a');
    });

    it('should get hits', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.refine(id, 0.8);
      expect(iue.getHits(id)).toBe(1);
    });

    it('should check guessed', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.isGuessed(iue.getAllIntuitions()[0].id)).toBe(true);
    });

    it('should check confirmed', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.confirm(id);
      expect(iue.isConfirmed(id)).toBe(true);
    });

    it('should check rejected', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.reject(id);
      expect(iue.isRejected(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.setActive(id, false)).toBe(true);
    });

    it('should set question', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.setQuestion(id, 'q2')).toBe(true);
    });

    it('should set answer', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.setAnswer(id, 'a2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(iue.setActive('unknown', false)).toBe(false);
      expect(iue.setQuestion('unknown', 'q')).toBe(false);
      expect(iue.setAnswer('unknown', 'a')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.confirm(id);
      iue.setActive(id, false);
      iue.resetAll();
      expect(iue.isGuessed(id)).toBe(true);
      expect(iue.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getByStatus('guessed')).toHaveLength(1);
    });

    it('should get active', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getActiveIntuitions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.setActive(id, false);
      expect(iue.getInactiveIntuitions()).toHaveLength(1);
    });

    it('should get all questions', () => {
      iue.guess('a', 'x', 0.5);
      iue.guess('b', 'y', 0.5);
      expect(iue.getAllQuestions()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getNewest()?.question).toBe('q');
    });

    it('should return null for empty newest', () => {
      expect(iue.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getOldest()?.question).toBe('q');
    });

    it('should return null for empty oldest', () => {
      expect(iue.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = iue.guess('q', 'a', 0.5);
      expect(iue.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.refine(id, 0.8);
      expect(iue.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total guessed', () => {
      iue.guess('q', 'a', 0.5);
      expect(iue.getTotalGuessed()).toBe(1);
    });

    it('should get total refined', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.refine(id, 0.8);
      expect(iue.getTotalRefined()).toBe(1);
    });

    it('should get total confirmed', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.confirm(id);
      expect(iue.getTotalConfirmed()).toBe(1);
    });

    it('should get total rejected', () => {
      const id = iue.guess('q', 'a', 0.5);
      iue.reject(id);
      expect(iue.getTotalRejected()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many intuitions', () => {
      for (let i = 0; i < 50; i++) {
        iue.guess(`q${i}`, 'a', 0.5);
      }
      expect(iue.getCount()).toBe(50);
    });
  });
});