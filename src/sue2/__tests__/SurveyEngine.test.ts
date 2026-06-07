/**
 * SurveyEngine Tests
 * chatdev-design Survey Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SurveyEngine } from '../SurveyEngine';

describe('SurveyEngine', () => {
  let sue2: SurveyEngine;

  beforeEach(() => {
    sue2 = new SurveyEngine();
  });

  afterEach(() => {
    sue2.clearAll();
  });

  describe('addQuestion / answer / open / close / remove', () => {
    it('should add question', () => {
      expect(sue2.addQuestion('q1')).toMatch(/^sue2-/);
    });

    it('should default status to draft', () => {
      sue2.addQuestion('q1');
      expect(sue2.getStatus(sue2.getAllSurveys()[0].id)).toBe('draft');
    });

    it('should default answer to empty', () => {
      sue2.addQuestion('q1');
      expect(sue2.getAnswer(sue2.getAllSurveys()[0].id)).toBe('');
    });

    it('should mark as active', () => {
      sue2.addQuestion('q1');
      expect(sue2.isActive(sue2.getAllSurveys()[0].id)).toBe(true);
    });

    it('should answer', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.answer(id, 'a1')).toBe(true);
    });

    it('should not answer inactive', () => {
      const id = sue2.addQuestion('q1');
      sue2.setActive(id, false);
      expect(sue2.answer(id, 'a1')).toBe(false);
    });

    it('should return false for unknown answer', () => {
      expect(sue2.answer('unknown', 'a1')).toBe(false);
    });

    it('should open', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.open(id)).toBe(true);
    });

    it('should set open', () => {
      const id = sue2.addQuestion('q1');
      sue2.open(id);
      expect(sue2.isOpen(id)).toBe(true);
    });

    it('should return false for unknown open', () => {
      expect(sue2.open('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.close(id)).toBe(true);
    });

    it('should set closed', () => {
      const id = sue2.addQuestion('q1');
      sue2.close(id);
      expect(sue2.isClosed(id)).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(sue2.close('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sue2.addQuestion('q1');
      expect(sue2.getStats().surveys).toBe(1);
    });

    it('should count total added', () => {
      sue2.addQuestion('q1');
      expect(sue2.getStats().totalAdded).toBe(1);
    });

    it('should count total answered', () => {
      const id = sue2.addQuestion('q1');
      sue2.answer(id, 'a1');
      expect(sue2.getStats().totalAnswered).toBe(1);
    });

    it('should count draft', () => {
      sue2.addQuestion('q1');
      expect(sue2.getStats().draft).toBe(1);
    });

    it('should count open', () => {
      const id = sue2.addQuestion('q1');
      sue2.open(id);
      expect(sue2.getStats().open).toBe(1);
    });

    it('should count closed', () => {
      const id = sue2.addQuestion('q1');
      sue2.close(id);
      expect(sue2.getStats().closed).toBe(1);
    });

    it('should count active', () => {
      sue2.addQuestion('q1');
      expect(sue2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sue2.addQuestion('q1');
      sue2.setActive(id, false);
      expect(sue2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sue2.addQuestion('q1');
      sue2.answer(id, 'a1');
      expect(sue2.getStats().totalHits).toBe(1);
    });

    it('should count total question len', () => {
      sue2.addQuestion('q1');
      expect(sue2.getStats().totalQuestionLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get survey', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.getSurvey(id)?.question).toBe('q1');
    });

    it('should get all', () => {
      sue2.addQuestion('q1');
      expect(sue2.getAllSurveys()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.hasSurvey(id)).toBe(true);
    });

    it('should count', () => {
      expect(sue2.getCount()).toBe(0);
      sue2.addQuestion('q1');
      expect(sue2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get question', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.getQuestion(id)).toBe('q1');
    });

    it('should get answer', () => {
      const id = sue2.addQuestion('q1');
      sue2.answer(id, 'a1');
      expect(sue2.getAnswer(id)).toBe('a1');
    });

    it('should get hits', () => {
      const id = sue2.addQuestion('q1');
      sue2.answer(id, 'a1');
      expect(sue2.getHits(id)).toBe(1);
    });

    it('should check draft', () => {
      sue2.addQuestion('q1');
      expect(sue2.isDraft(sue2.getAllSurveys()[0].id)).toBe(true);
    });

    it('should check open', () => {
      const id = sue2.addQuestion('q1');
      sue2.open(id);
      expect(sue2.isOpen(id)).toBe(true);
    });

    it('should check closed', () => {
      const id = sue2.addQuestion('q1');
      sue2.close(id);
      expect(sue2.isClosed(id)).toBe(true);
    });

    it('should check answered', () => {
      const id = sue2.addQuestion('q1');
      sue2.answer(id, 'a1');
      expect(sue2.isAnswered(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.setActive(id, false)).toBe(true);
    });

    it('should set question', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.setQuestion(id, 'q2')).toBe(true);
    });

    it('should set answer', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.setAnswer(id, 'a1')).toBe(true);
    });

    it('should set status', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.setStatus(id, 'open')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sue2.setActive('unknown', false)).toBe(false);
      expect(sue2.setQuestion('unknown', 'q')).toBe(false);
      expect(sue2.setAnswer('unknown', 'a')).toBe(false);
      expect(sue2.setStatus('unknown', 'open')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = sue2.addQuestion('q1');
      sue2.close(id);
      sue2.setActive(id, false);
      sue2.resetAll();
      expect(sue2.isDraft(id)).toBe(true);
      expect(sue2.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      sue2.addQuestion('q1');
      expect(sue2.getByStatus('draft')).toHaveLength(1);
    });

    it('should get active', () => {
      sue2.addQuestion('q1');
      expect(sue2.getActiveSurveys()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sue2.addQuestion('q1');
      sue2.setActive(id, false);
      expect(sue2.getInactiveSurveys()).toHaveLength(1);
    });

    it('should get answered', () => {
      const id = sue2.addQuestion('q1');
      sue2.answer(id, 'a1');
      expect(sue2.getAnsweredSurveys()).toHaveLength(1);
    });

    it('should get unanswered', () => {
      sue2.addQuestion('q1');
      expect(sue2.getUnansweredSurveys()).toHaveLength(1);
    });

    it('should get all questions', () => {
      sue2.addQuestion('a');
      sue2.addQuestion('b');
      expect(sue2.getAllQuestions()).toHaveLength(2);
    });

    it('should get all answers', () => {
      const id1 = sue2.addQuestion('q1');
      sue2.answer(id1, 'a');
      expect(sue2.getAllAnswers()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sue2.addQuestion('q1');
      expect(sue2.getNewest()?.question).toBe('q1');
    });

    it('should return null for empty newest', () => {
      expect(sue2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sue2.addQuestion('q1');
      expect(sue2.getOldest()?.question).toBe('q1');
    });

    it('should return null for empty oldest', () => {
      expect(sue2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = sue2.addQuestion('q1');
      expect(sue2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sue2.addQuestion('q1');
      sue2.answer(id, 'a1');
      expect(sue2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      sue2.addQuestion('q1');
      expect(sue2.getTotalAdded()).toBe(1);
    });

    it('should get total answered', () => {
      const id = sue2.addQuestion('q1');
      sue2.answer(id, 'a1');
      expect(sue2.getTotalAnswered()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many surveys', () => {
      for (let i = 0; i < 50; i++) {
        sue2.addQuestion(`q${i}`);
      }
      expect(sue2.getCount()).toBe(50);
    });
  });
});