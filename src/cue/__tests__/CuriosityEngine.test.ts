/**
 * CuriosityEngine Tests
 * generic-agent-design Curiosity Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CuriosityEngine } from '../CuriosityEngine';

describe('CuriosityEngine', () => {
  let cue: CuriosityEngine;

  beforeEach(() => {
    cue = new CuriosityEngine();
  });

  afterEach(() => {
    cue.clearAll();
  });

  describe('ask / explore / learn / remove', () => {
    it('should ask', () => {
      expect(cue.ask('topic1', 'question', 'normal')).toMatch(/^cue-/);
    });

    it('should default level to normal', () => {
      cue.ask('topic1', 'question');
      expect(cue.getLevel(cue.getAllQuestions()[0].id)).toBe('normal');
    });

    it('should mark as active', () => {
      cue.ask('topic1', 'question');
      expect(cue.isActive(cue.getAllQuestions()[0].id)).toBe(true);
    });

    it('should explore', () => {
      const id = cue.ask('topic1', 'question');
      expect(cue.explore(id)).toBe(true);
    });

    it('should increment explored', () => {
      const id = cue.ask('topic1', 'question');
      cue.explore(id);
      expect(cue.getExplored(id)).toBe(1);
    });

    it('should not explore inactive', () => {
      const id = cue.ask('topic1', 'question');
      cue.setActive(id, false);
      expect(cue.explore(id)).toBe(false);
    });

    it('should return false for unknown explore', () => {
      expect(cue.explore('unknown')).toBe(false);
    });

    it('should learn', () => {
      const id = cue.ask('topic1', 'question');
      expect(cue.learn(id)).toBe(true);
    });

    it('should increment learned', () => {
      const id = cue.ask('topic1', 'question');
      cue.learn(id);
      expect(cue.getLearned(id)).toBe(1);
    });

    it('should not learn inactive', () => {
      const id = cue.ask('topic1', 'question');
      cue.setActive(id, false);
      expect(cue.learn(id)).toBe(false);
    });

    it('should return false for unknown learn', () => {
      expect(cue.learn('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = cue.ask('topic1', 'question');
      expect(cue.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      cue.ask('topic1', 'question');
      expect(cue.getStats().questions).toBe(1);
    });

    it('should count total asked', () => {
      cue.ask('topic1', 'question');
      expect(cue.getStats().totalAsked).toBe(1);
    });

    it('should count total explored', () => {
      const id = cue.ask('topic1', 'question');
      cue.explore(id);
      expect(cue.getStats().totalExplored).toBe(1);
    });

    it('should count total learned', () => {
      const id = cue.ask('topic1', 'question');
      cue.learn(id);
      expect(cue.getStats().totalLearned).toBe(1);
    });

    it('should count low', () => {
      cue.ask('t1', 'q', 'low');
      expect(cue.getStats().low).toBe(1);
    });

    it('should count normal', () => {
      cue.ask('t1', 'q', 'normal');
      expect(cue.getStats().normal).toBe(1);
    });

    it('should count high', () => {
      cue.ask('t1', 'q', 'high');
      expect(cue.getStats().high).toBe(1);
    });

    it('should count extreme', () => {
      cue.ask('t1', 'q', 'extreme');
      expect(cue.getStats().extreme).toBe(1);
    });

    it('should count active', () => {
      cue.ask('t1', 'q');
      expect(cue.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cue.ask('t1', 'q');
      cue.setActive(id, false);
      expect(cue.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cue.ask('t1', 'q');
      cue.explore(id);
      expect(cue.getStats().totalHits).toBe(1);
    });

    it('should count unique topics', () => {
      cue.ask('a', 'q1');
      cue.ask('a', 'q2');
      expect(cue.getStats().uniqueTopics).toBe(1);
    });

    it('should count total text len', () => {
      cue.ask('t1', 'hi');
      expect(cue.getStats().totalTextLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get question', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.getQuestion(id)?.topic).toBe('t1');
    });

    it('should get all', () => {
      cue.ask('t1', 'q');
      expect(cue.getAllQuestions()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.hasQuestion(id)).toBe(true);
    });

    it('should count', () => {
      expect(cue.getCount()).toBe(0);
      cue.ask('t1', 'q');
      expect(cue.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get topic', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.getTopic(id)).toBe('t1');
    });

    it('should get text', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.getText(id)).toBe('q');
    });

    it('should get hits', () => {
      const id = cue.ask('t1', 'q');
      cue.explore(id);
      expect(cue.getHits(id)).toBe(1);
    });

    it('should check low', () => {
      cue.ask('t1', 'q', 'low');
      expect(cue.isLow(cue.getAllQuestions()[0].id)).toBe(true);
    });

    it('should check normal', () => {
      cue.ask('t1', 'q', 'normal');
      expect(cue.isNormal(cue.getAllQuestions()[0].id)).toBe(true);
    });

    it('should check high', () => {
      cue.ask('t1', 'q', 'high');
      expect(cue.isHigh(cue.getAllQuestions()[0].id)).toBe(true);
    });

    it('should check extreme', () => {
      cue.ask('t1', 'q', 'extreme');
      expect(cue.isExtreme(cue.getAllQuestions()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.setActive(id, false)).toBe(true);
    });

    it('should set topic', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.setTopic(id, 't2')).toBe(true);
    });

    it('should set text', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.setText(id, 'new')).toBe(true);
    });

    it('should set level', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.setLevel(id, 'high')).toBe(true);
    });

    it('should set explored', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.setExplored(id, 5)).toBe(true);
    });

    it('should set learned', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.setLearned(id, 3)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cue.setActive('unknown', false)).toBe(false);
      expect(cue.setTopic('unknown', 't')).toBe(false);
      expect(cue.setText('unknown', 't')).toBe(false);
      expect(cue.setLevel('unknown', 'low')).toBe(false);
      expect(cue.setExplored('unknown', 1)).toBe(false);
      expect(cue.setLearned('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = cue.ask('t1', 'q');
      cue.explore(id);
      cue.setActive(id, false);
      cue.resetAll();
      expect(cue.getExplored(id)).toBe(0);
      expect(cue.isActive(id)).toBe(true);
    });
  });

  describe('by level / state', () => {
    it('should get by level', () => {
      cue.ask('t1', 'q', 'low');
      expect(cue.getByLevel('low')).toHaveLength(1);
    });

    it('should get active', () => {
      cue.ask('t1', 'q');
      expect(cue.getActiveQuestions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = cue.ask('t1', 'q');
      cue.setActive(id, false);
      expect(cue.getInactiveQuestions()).toHaveLength(1);
    });

    it('should get all topics', () => {
      cue.ask('a', 'q1');
      cue.ask('b', 'q2');
      expect(cue.getAllTopics()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      cue.ask('t1', 'q');
      expect(cue.getNewest()?.topic).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(cue.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cue.ask('t1', 'q');
      expect(cue.getOldest()?.topic).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(cue.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = cue.ask('t1', 'q');
      expect(cue.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cue.ask('t1', 'q');
      cue.explore(id);
      expect(cue.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total asked', () => {
      cue.ask('t1', 'q');
      expect(cue.getTotalAsked()).toBe(1);
    });

    it('should get total explored', () => {
      const id = cue.ask('t1', 'q');
      cue.explore(id);
      expect(cue.getTotalExplored()).toBe(1);
    });

    it('should get total learned', () => {
      const id = cue.ask('t1', 'q');
      cue.learn(id);
      expect(cue.getTotalLearned()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many questions', () => {
      for (let i = 0; i < 50; i++) {
        cue.ask(`t${i}`, `q${i}`);
      }
      expect(cue.getCount()).toBe(50);
    });
  });
});