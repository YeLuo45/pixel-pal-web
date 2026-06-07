/**
 * HeuristicEngine Tests
 * generic-agent-design Heuristic Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HeuristicEngine } from '../HeuristicEngine';

describe('HeuristicEngine', () => {
  let hue: HeuristicEngine;

  beforeEach(() => {
    hue = new HeuristicEngine();
  });

  afterEach(() => {
    hue.clearAll();
  });

  describe('addRule / evaluate / remove', () => {
    it('should add rule', () => {
      expect(hue.addRule('h1', 'rule', 1)).toMatch(/^hue-/);
    });

    it('should mark as active', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.isActive(hue.getAllHeuristics()[0].id)).toBe(true);
    });

    it('should evaluate', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.evaluate(id, true)).toBe(true);
    });

    it('should increment hits', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, false);
      expect(hue.getHits(id)).toBe(1);
    });

    it('should increment matches when true', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, true);
      expect(hue.getMatches(id)).toBe(1);
    });

    it('should not increment matches when false', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, false);
      expect(hue.getMatches(id)).toBe(0);
    });

    it('should not evaluate inactive', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.setActive(id, false);
      expect(hue.evaluate(id, true)).toBe(false);
    });

    it('should return false for unknown evaluate', () => {
      expect(hue.evaluate('unknown', true)).toBe(false);
    });

    it('should remove', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getStats().heuristics).toBe(1);
    });

    it('should count total added', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getStats().totalAdded).toBe(1);
    });

    it('should count total evaluated', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, true);
      expect(hue.getStats().totalEvaluated).toBe(1);
    });

    it('should count total matched', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, true);
      expect(hue.getStats().totalMatched).toBe(1);
    });

    it('should count rule', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getStats().rule).toBe(1);
    });

    it('should count pattern', () => {
      hue.addRule('h1', 'pattern', 1);
      expect(hue.getStats().pattern).toBe(1);
    });

    it('should count fallback', () => {
      hue.addRule('h1', 'fallback', 1);
      expect(hue.getStats().fallback).toBe(1);
    });

    it('should count default', () => {
      hue.addRule('h1', 'default', 1);
      expect(hue.getStats().default).toBe(1);
    });

    it('should count active', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.setActive(id, false);
      expect(hue.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, false);
      expect(hue.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      hue.addRule('a', 'rule', 1);
      hue.addRule('a', 'rule', 1);
      expect(hue.getStats().uniqueNames).toBe(1);
    });

    it('should count total priority', () => {
      hue.addRule('h1', 'rule', 5);
      expect(hue.getStats().totalPriority).toBe(5);
    });
  });

  describe('queries', () => {
    it('should get heuristic', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.getHeuristic(id)?.name).toBe('h1');
    });

    it('should get all', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getAllHeuristics()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.hasHeuristic(id)).toBe(true);
    });

    it('should count', () => {
      expect(hue.getCount()).toBe(0);
      hue.addRule('h1', 'rule', 1);
      expect(hue.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.getName(id)).toBe('h1');
    });

    it('should get priority', () => {
      const id = hue.addRule('h1', 'rule', 5);
      expect(hue.getPriority(id)).toBe(5);
    });

    it('should get hits', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, false);
      expect(hue.getHits(id)).toBe(1);
    });

    it('should get matches', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, true);
      expect(hue.getMatches(id)).toBe(1);
    });

    it('should check rule', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.isRule(hue.getAllHeuristics()[0].id)).toBe(true);
    });

    it('should check pattern', () => {
      hue.addRule('h1', 'pattern', 1);
      expect(hue.isPattern(hue.getAllHeuristics()[0].id)).toBe(true);
    });

    it('should check fallback', () => {
      hue.addRule('h1', 'fallback', 1);
      expect(hue.isFallback(hue.getAllHeuristics()[0].id)).toBe(true);
    });

    it('should check default', () => {
      hue.addRule('h1', 'default', 1);
      expect(hue.isDefault(hue.getAllHeuristics()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.setName(id, 'h2')).toBe(true);
    });

    it('should set type', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.setType(id, 'pattern')).toBe(true);
    });

    it('should set priority', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.setPriority(id, 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(hue.setActive('unknown', false)).toBe(false);
      expect(hue.setName('unknown', 'h')).toBe(false);
      expect(hue.setType('unknown', 'rule')).toBe(false);
      expect(hue.setPriority('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.setActive(id, false);
      hue.resetAll();
      expect(hue.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getByType('rule')).toHaveLength(1);
    });

    it('should get active', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getActiveHeuristics()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.setActive(id, false);
      expect(hue.getInactiveHeuristics()).toHaveLength(1);
    });

    it('should get all names', () => {
      hue.addRule('a', 'rule', 1);
      hue.addRule('b', 'rule', 1);
      expect(hue.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getNewest()?.name).toBe('h1');
    });

    it('should return null for empty newest', () => {
      expect(hue.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getOldest()?.name).toBe('h1');
    });

    it('should return null for empty oldest', () => {
      expect(hue.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = hue.addRule('h1', 'rule', 1);
      expect(hue.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, true);
      expect(hue.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      hue.addRule('h1', 'rule', 1);
      expect(hue.getTotalAdded()).toBe(1);
    });

    it('should get total evaluated', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, true);
      expect(hue.getTotalEvaluated()).toBe(1);
    });

    it('should get total matched', () => {
      const id = hue.addRule('h1', 'rule', 1);
      hue.evaluate(id, true);
      expect(hue.getTotalMatched()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many heuristics', () => {
      for (let i = 0; i < 50; i++) {
        hue.addRule(`h${i}`, 'rule', i);
      }
      expect(hue.getCount()).toBe(50);
    });
  });
});