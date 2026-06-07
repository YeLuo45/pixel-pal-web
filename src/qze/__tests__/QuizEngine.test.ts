/**
 * QuizEngine Tests
 * chatdev-design Quiz Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuizEngine } from '../QuizEngine';

describe('QuizEngine', () => {
  let qze: QuizEngine;

  beforeEach(() => {
    qze = new QuizEngine();
  });

  afterEach(() => {
    qze.clearAll();
  });

  describe('add / answer / remove', () => {
    it('should add', () => {
      expect(qze.add('q1', 'a1')).toBe('qze-1');
    });

    it('should mark as active', () => {
      qze.add('q1', 'a1');
      expect(qze.isActive('qze-1')).toBe(true);
    });

    it('should answer', () => {
      qze.add('q1', 'a1');
      expect(qze.answer('qze-1', 'a1')).toBe(true);
    });

    it('should not answer inactive', () => {
      qze.add('q1', 'a1');
      qze.setActive('qze-1', false);
      expect(qze.answer('qze-1', 'a1')).toBe(false);
    });

    it('should return false for unknown answer', () => {
      expect(qze.answer('unknown', 'a')).toBe(false);
    });

    it('should remove', () => {
      qze.add('q1', 'a1');
      expect(qze.remove('qze-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      qze.add('q1', 'a1');
      expect(qze.getStats().questions).toBe(1);
    });

    it('should count total added', () => {
      qze.add('q1', 'a1');
      expect(qze.getStats().totalAdded).toBe(1);
    });

    it('should count total answered', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'a1');
      expect(qze.getStats().totalAnswered).toBe(1);
    });

    it('should count total correct', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'a1');
      expect(qze.getStats().totalCorrect).toBe(1);
    });

    it('should count total incorrect', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'wrong');
      expect(qze.getStats().totalIncorrect).toBe(1);
    });

    it('should count active', () => {
      qze.add('q1', 'a1');
      expect(qze.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      qze.add('q1', 'a1');
      qze.setActive('qze-1', false);
      expect(qze.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'a1');
      expect(qze.getStats().totalHits).toBe(1);
    });

    it('should count unique texts', () => {
      qze.add('a', 'x');
      qze.add('a', 'y');
      expect(qze.getStats().uniqueTexts).toBe(1);
    });

    it('should count unique answers', () => {
      qze.add('q1', 'a');
      qze.add('q2', 'a');
      expect(qze.getStats().uniqueAnswers).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get question', () => {
      qze.add('q1', 'a1');
      expect(qze.getQuestion('qze-1')?.text).toBe('q1');
    });

    it('should get all', () => {
      qze.add('q1', 'a1');
      expect(qze.getAllQuestions()).toHaveLength(1);
    });

    it('should check existence', () => {
      qze.add('q1', 'a1');
      expect(qze.hasQuestion('qze-1')).toBe(true);
    });

    it('should count', () => {
      expect(qze.getCount()).toBe(0);
      qze.add('q1', 'a1');
      expect(qze.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get text', () => {
      qze.add('q1', 'a1');
      expect(qze.getText('qze-1')).toBe('q1');
    });

    it('should get answer', () => {
      qze.add('q1', 'a1');
      expect(qze.getAnswer('qze-1')).toBe('a1');
    });

    it('should get hits', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'a1');
      expect(qze.getHits('qze-1')).toBe(1);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      qze.add('q1', 'a1');
      expect(qze.setActive('qze-1', false)).toBe(true);
    });

    it('should set text', () => {
      qze.add('q1', 'a1');
      expect(qze.setText('qze-1', 'q2')).toBe(true);
    });

    it('should set answer', () => {
      qze.add('q1', 'a1');
      expect(qze.setAnswer('qze-1', 'a2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(qze.setActive('unknown', false)).toBe(false);
      expect(qze.setText('unknown', 'q')).toBe(false);
      expect(qze.setAnswer('unknown', 'a')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'a1');
      qze.setActive('qze-1', false);
      qze.resetAll();
      expect(qze.getHits('qze-1')).toBe(0);
      expect(qze.isActive('qze-1')).toBe(true);
    });
  });

  describe('check', () => {
    it('should check correct', () => {
      qze.add('q1', 'a1');
      expect(qze.check('qze-1', 'a1')).toBe(true);
    });

    it('should check case insensitive', () => {
      qze.add('q1', 'A1');
      expect(qze.check('qze-1', 'a1')).toBe(true);
    });

    it('should check incorrect', () => {
      qze.add('q1', 'a1');
      expect(qze.check('qze-1', 'wrong')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(qze.check('unknown', 'a')).toBe(false);
    });
  });

  describe('by state', () => {
    it('should get active', () => {
      qze.add('q1', 'a1');
      expect(qze.getActiveQuestions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      qze.add('q1', 'a1');
      qze.setActive('qze-1', false);
      expect(qze.getInactiveQuestions()).toHaveLength(1);
    });

    it('should get all texts', () => {
      qze.add('a', 'x');
      qze.add('b', 'y');
      expect(qze.getAllTexts()).toHaveLength(2);
    });

    it('should get all answers', () => {
      qze.add('q1', 'a');
      qze.add('q2', 'b');
      expect(qze.getAllAnswers()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      qze.add('q1', 'a1');
      expect(qze.getNewest()?.id).toBe('qze-1');
    });

    it('should return null for empty newest', () => {
      expect(qze.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      qze.add('q1', 'a1');
      expect(qze.getOldest()?.id).toBe('qze-1');
    });

    it('should return null for empty oldest', () => {
      expect(qze.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      qze.add('q1', 'a1');
      expect(qze.getCreatedAt('qze-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'a1');
      expect(qze.getUpdatedAt('qze-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      qze.add('q1', 'a1');
      expect(qze.getTotalAdded()).toBe(1);
    });

    it('should get total answered', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'a1');
      expect(qze.getTotalAnswered()).toBe(1);
    });

    it('should get total correct', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'a1');
      expect(qze.getTotalCorrect()).toBe(1);
    });

    it('should get total incorrect', () => {
      qze.add('q1', 'a1');
      qze.answer('qze-1', 'wrong');
      expect(qze.getTotalIncorrect()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many questions', () => {
      for (let i = 0; i < 50; i++) {
        qze.add(`q${i}`, `a${i}`);
      }
      expect(qze.getCount()).toBe(50);
    });
  });
});