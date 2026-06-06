/**
 * CuriosityEngine Tests
 * generic-agent-design Curiosity Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CuriosityEngine } from '../CuriosityEngine';

describe('CuriosityEngine', () => {
  let ce: CuriosityEngine;

  beforeEach(() => {
    ce = new CuriosityEngine();
  });

  afterEach(() => {
    ce.clearAll();
  });

  // ============================================================
  // ask / answer / explore
  // ============================================================
  describe('ask / answer / explore', () => {
    it('should ask', () => {
      expect(ce.ask('why?')).toBe('ce2-1');
    });

    it('should mark as active', () => {
      const id = ce.ask('why?');
      expect(ce.isActive(id)).toBe(true);
    });

    it('should mark as pending initially', () => {
      const id = ce.ask('why?');
      expect(ce.isPending(id)).toBe(true);
    });

    it('should answer', () => {
      const id = ce.ask('why?');
      expect(ce.answer(id)).toBe(true);
    });

    it('should mark as answered', () => {
      const id = ce.ask('why?');
      ce.answer(id);
      expect(ce.isAnswered(id)).toBe(true);
    });

    it('should not answer twice', () => {
      const id = ce.ask('why?');
      ce.answer(id);
      expect(ce.answer(id)).toBe(false);
    });

    it('should not answer inactive', () => {
      const id = ce.ask('why?');
      ce.setActive(id, false);
      expect(ce.answer(id)).toBe(false);
    });

    it('should return false for unknown answer', () => {
      expect(ce.answer('unknown')).toBe(false);
    });

    it('should explore', () => {
      const id = ce.ask('why?');
      expect(ce.explore(id, 'info1')).toBe(true);
    });

    it('should increment exploration count', () => {
      const id = ce.ask('why?');
      ce.explore(id, 'info1');
      expect(ce.getExplorationCount(id)).toBe(1);
    });

    it('should not explore inactive', () => {
      const id = ce.ask('why?');
      ce.setActive(id, false);
      expect(ce.explore(id, 'info1')).toBe(false);
    });

    it('should return false for unknown explore', () => {
      expect(ce.explore('unknown', 'info1')).toBe(false);
    });

    it('should unanswer', () => {
      const id = ce.ask('why?');
      ce.answer(id);
      expect(ce.unanswer(id)).toBe(true);
    });

    it('should mark as not answered on unanswer', () => {
      const id = ce.ask('why?');
      ce.answer(id);
      ce.unanswer(id);
      expect(ce.isAnswered(id)).toBe(false);
    });

    it('should not unanswer not answered', () => {
      const id = ce.ask('why?');
      expect(ce.unanswer(id)).toBe(false);
    });

    it('should return false for unknown unanswer', () => {
      expect(ce.unanswer('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ce.ask('q1');
      const stats = ce.getStats();
      expect(stats.questions).toBe(1);
    });

    it('should count answered', () => {
      const id = ce.ask('q1');
      ce.answer(id);
      expect(ce.getStats().answered).toBe(1);
    });

    it('should count pending', () => {
      ce.ask('q1');
      expect(ce.getStats().pending).toBe(1);
    });

    it('should count active', () => {
      ce.ask('q1');
      expect(ce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ce.ask('q1');
      ce.setActive(id, false);
      expect(ce.getStats().inactive).toBe(1);
    });

    it('should count total explorations', () => {
      const id = ce.ask('q1');
      ce.explore(id, 'i1');
      ce.explore(id, 'i2');
      expect(ce.getStats().totalExplorations).toBe(2);
    });

    it('should count total hits', () => {
      const id = ce.ask('q1');
      ce.answer(id);
      expect(ce.getStats().totalHits).toBe(1);
    });

    it('should compute avg explorations', () => {
      const id = ce.ask('q1');
      ce.explore(id, 'i1');
      expect(ce.getStats().avgExplorations).toBe(1);
    });

    it('should compute answer rate', () => {
      const id = ce.ask('q1');
      ce.answer(id);
      expect(ce.getStats().answerRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get question', () => {
      ce.ask('q1');
      expect(ce.getQuestion('ce2-1')?.text).toBe('q1');
    });

    it('should get all', () => {
      ce.ask('q1');
      expect(ce.getAllQuestions()).toHaveLength(1);
    });

    it('should remove', () => {
      ce.ask('q1');
      expect(ce.removeQuestion('ce2-1')).toBe(true);
    });

    it('should check existence', () => {
      ce.ask('q1');
      expect(ce.hasQuestion('ce2-1')).toBe(true);
    });

    it('should count', () => {
      expect(ce.getCount()).toBe(0);
      ce.ask('q1');
      expect(ce.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get text', () => {
      ce.ask('q1');
      expect(ce.getText('ce2-1')).toBe('q1');
    });

    it('should get explorations', () => {
      const id = ce.ask('q1');
      ce.explore(id, 'i1');
      expect(ce.getExplorations(id)).toEqual(['i1']);
    });

    it('should get exploration count', () => {
      ce.ask('q1');
      expect(ce.getExplorationCount('ce2-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = ce.ask('q1');
      ce.answer(id);
      expect(ce.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ce.ask('q1');
      expect(ce.setActive('ce2-1', false)).toBe(true);
    });

    it('should set text', () => {
      ce.ask('q1');
      expect(ce.setText('ce2-1', 'q2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ce.setActive('unknown', false)).toBe(false);
      expect(ce.setText('unknown', 'q')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ce.ask('q1');
      ce.answer(id);
      ce.explore(id, 'i1');
      ce.setActive(id, false);
      ce.resetAll();
      expect(ce.isAnswered(id)).toBe(false);
      expect(ce.getExplorationCount(id)).toBe(0);
      expect(ce.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get answered', () => {
      const id = ce.ask('q1');
      ce.answer(id);
      expect(ce.getAnsweredQuestions()).toHaveLength(1);
    });

    it('should get pending', () => {
      ce.ask('q1');
      expect(ce.getPendingQuestions()).toHaveLength(1);
    });

    it('should get active', () => {
      ce.ask('q1');
      expect(ce.getActiveQuestions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ce.ask('q1');
      ce.setActive('ce2-1', false);
      expect(ce.getInactiveQuestions()).toHaveLength(1);
    });

    it('should get by min explorations', () => {
      const id = ce.ask('q1');
      ce.explore(id, 'i1');
      ce.explore(id, 'i2');
      expect(ce.getByMinExplorations(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most explorations', () => {
      const id = ce.ask('q1');
      ce.explore(id, 'i1');
      ce.explore(id, 'i2');
      expect(ce.getMostExplorations()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ce.getMostExplorations()).toBeNull();
    });

    it('should get newest', () => {
      ce.ask('q1');
      expect(ce.getNewest()?.id).toBe('ce2-1');
    });

    it('should return null for empty newest', () => {
      expect(ce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ce.ask('q1');
      expect(ce.getOldest()?.id).toBe('ce2-1');
    });

    it('should return null for empty oldest', () => {
      expect(ce.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ce.ask('q1');
      expect(ce.getCreatedAt('ce2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ce.ask('q1');
      ce.answer(id);
      expect(ce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many questions', () => {
      for (let i = 0; i < 50; i++) {
        ce.ask(`q${i}`);
      }
      expect(ce.getCount()).toBe(50);
    });
  });
});