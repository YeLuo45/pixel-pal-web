/**
 * SentimentEngine Tests
 * generic-agent-design Sentiment Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SentimentEngine } from '../SentimentEngine';

describe('SentimentEngine', () => {
  let snt: SentimentEngine;

  beforeEach(() => {
    snt = new SentimentEngine();
  });

  afterEach(() => {
    snt.clearAll();
  });

  describe('score / classify / remove', () => {
    it('should score', () => {
      expect(snt.score('hello', 0.5)).toMatch(/^snt-/);
    });

    it('should set positive sentiment for > 0', () => {
      snt.score('hello', 0.5);
      expect(snt.getSentiment(snt.getAllItems()[0].id)).toBe('positive');
    });

    it('should set neutral sentiment for 0', () => {
      snt.score('hello', 0);
      expect(snt.getSentiment(snt.getAllItems()[0].id)).toBe('neutral');
    });

    it('should set negative sentiment for < 0', () => {
      snt.score('hello', -0.5);
      expect(snt.getSentiment(snt.getAllItems()[0].id)).toBe('negative');
    });

    it('should mark as active', () => {
      snt.score('hello', 0.5);
      expect(snt.isActive(snt.getAllItems()[0].id)).toBe(true);
    });

    it('should classify', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.classify(id, -0.5)).toBe(true);
    });

    it('should update sentiment on classify', () => {
      const id = snt.score('hello', 0.5);
      snt.classify(id, -0.5);
      expect(snt.isNegative(id)).toBe(true);
    });

    it('should not classify inactive', () => {
      const id = snt.score('hello', 0.5);
      snt.setActive(id, false);
      expect(snt.classify(id, -0.5)).toBe(false);
    });

    it('should return false for unknown classify', () => {
      expect(snt.classify('unknown', 0.5)).toBe(false);
    });

    it('should remove', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      snt.score('hello', 0.5);
      expect(snt.getStats().items).toBe(1);
    });

    it('should count total scored', () => {
      snt.score('hello', 0.5);
      expect(snt.getStats().totalScored).toBe(1);
    });

    it('should count total classified', () => {
      const id = snt.score('hello', 0.5);
      snt.classify(id, -0.5);
      expect(snt.getStats().totalClassified).toBe(1);
    });

    it('should count positive', () => {
      snt.score('hello', 0.5);
      expect(snt.getStats().positive).toBe(1);
    });

    it('should count neutral', () => {
      snt.score('hello', 0);
      expect(snt.getStats().neutral).toBe(1);
    });

    it('should count negative', () => {
      snt.score('hello', -0.5);
      expect(snt.getStats().negative).toBe(1);
    });

    it('should count active', () => {
      snt.score('hello', 0.5);
      expect(snt.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = snt.score('hello', 0.5);
      snt.setActive(id, false);
      expect(snt.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = snt.score('hello', 0.5);
      snt.classify(id, -0.5);
      expect(snt.getStats().totalHits).toBe(1);
    });

    it('should count unique texts', () => {
      snt.score('a', 0.5);
      snt.score('a', 0.5);
      expect(snt.getStats().uniqueTexts).toBe(1);
    });

    it('should count total score', () => {
      snt.score('hello', 0.5);
      expect(snt.getStats().totalScore).toBe(0.5);
    });

    it('should count total text len', () => {
      snt.score('hi', 0.5);
      expect(snt.getStats().totalTextLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get item', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.getItem(id)?.text).toBe('hello');
    });

    it('should get all', () => {
      snt.score('hello', 0.5);
      expect(snt.getAllItems()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.hasItem(id)).toBe(true);
    });

    it('should count', () => {
      expect(snt.getCount()).toBe(0);
      snt.score('hello', 0.5);
      expect(snt.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get text', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.getText(id)).toBe('hello');
    });

    it('should get score', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.getScore(id)).toBe(0.5);
    });

    it('should get hits', () => {
      const id = snt.score('hello', 0.5);
      snt.classify(id, -0.5);
      expect(snt.getHits(id)).toBe(1);
    });

    it('should check positive', () => {
      snt.score('hello', 0.5);
      expect(snt.isPositive(snt.getAllItems()[0].id)).toBe(true);
    });

    it('should check neutral', () => {
      snt.score('hello', 0);
      expect(snt.isNeutral(snt.getAllItems()[0].id)).toBe(true);
    });

    it('should check negative', () => {
      snt.score('hello', -0.5);
      expect(snt.isNegative(snt.getAllItems()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.setActive(id, false)).toBe(true);
    });

    it('should set text', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.setText(id, 'world')).toBe(true);
    });

    it('should set score', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.setScore(id, -0.5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(snt.setActive('unknown', false)).toBe(false);
      expect(snt.setText('unknown', 't')).toBe(false);
      expect(snt.setScore('unknown', 0.5)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = snt.score('hello', 0.5);
      snt.setActive(id, false);
      snt.resetAll();
      expect(snt.getScore(id)).toBe(0);
      expect(snt.isActive(id)).toBe(true);
    });
  });

  describe('by sentiment / state', () => {
    it('should get by sentiment', () => {
      snt.score('hello', 0.5);
      expect(snt.getBySentiment('positive')).toHaveLength(1);
    });

    it('should get active', () => {
      snt.score('hello', 0.5);
      expect(snt.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = snt.score('hello', 0.5);
      snt.setActive(id, false);
      expect(snt.getInactiveItems()).toHaveLength(1);
    });

    it('should get all texts', () => {
      snt.score('a', 0.5);
      snt.score('b', 0.5);
      expect(snt.getAllTexts()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      snt.score('hello', 0.5);
      expect(snt.getNewest()?.text).toBe('hello');
    });

    it('should return null for empty newest', () => {
      expect(snt.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      snt.score('hello', 0.5);
      expect(snt.getOldest()?.text).toBe('hello');
    });

    it('should return null for empty oldest', () => {
      expect(snt.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = snt.score('hello', 0.5);
      expect(snt.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = snt.score('hello', 0.5);
      snt.classify(id, -0.5);
      expect(snt.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total scored', () => {
      snt.score('hello', 0.5);
      expect(snt.getTotalScored()).toBe(1);
    });

    it('should get total classified', () => {
      const id = snt.score('hello', 0.5);
      snt.classify(id, -0.5);
      expect(snt.getTotalClassified()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many items', () => {
      for (let i = 0; i < 50; i++) {
        snt.score(`text${i}`, 0.5);
      }
      expect(snt.getCount()).toBe(50);
    });
  });
});