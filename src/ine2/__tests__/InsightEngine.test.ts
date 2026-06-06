/**
 * InsightEngine Tests
 * generic-agent-design Insight Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InsightEngine } from '../InsightEngine';

describe('InsightEngine', () => {
  let ine2: InsightEngine;

  beforeEach(() => {
    ine2 = new InsightEngine();
  });

  afterEach(() => {
    ine2.clearAll();
  });

  // ============================================================
  // generate / query / remove
  // ============================================================
  describe('generate / query / remove', () => {
    it('should generate', () => {
      expect(ine2.generate('obs1', 'pattern detected', 0.8)).toBe('ine2-1');
    });

    it('should mark as active', () => {
      const id = ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.isActive(id)).toBe(true);
    });

    it('should default confidence to 0.5', () => {
      const id = ine2.generate('obs1', 'pattern');
      expect(ine2.getConfidence(id)).toBe(0.5);
    });

    it('should query', () => {
      const id = ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.query(id)?.text).toBe('pattern');
    });

    it('should not query inactive', () => {
      const id = ine2.generate('obs1', 'pattern', 0.8);
      ine2.setActive(id, false);
      expect(ine2.query(id)).toBeUndefined();
    });

    it('should return undefined for unknown query', () => {
      expect(ine2.query('unknown')).toBeUndefined();
    });

    it('should remove', () => {
      const id = ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      const stats = ine2.getStats();
      expect(stats.insights).toBe(1);
    });

    it('should count total generated', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.getStats().totalGenerated).toBe(1);
    });

    it('should count active', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ine2.generate('obs1', 'pattern', 0.8);
      ine2.setActive(id, false);
      expect(ine2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ine2.generate('obs1', 'pattern', 0.8);
      ine2.query(id);
      expect(ine2.getStats().totalHits).toBe(1);
    });

    it('should count unique sources', () => {
      ine2.generate('a', 'p', 0.8);
      ine2.generate('b', 'p', 0.8);
      expect(ine2.getStats().uniqueSources).toBe(2);
    });

    it('should compute avg confidence', () => {
      ine2.generate('a', 'p', 0.5);
      ine2.generate('b', 'p', 0.9);
      expect(ine2.getStats().avgConfidence).toBe(0.7);
    });

    it('should get max confidence', () => {
      ine2.generate('a', 'p', 0.5);
      ine2.generate('b', 'p', 0.9);
      expect(ine2.getStats().maxConfidence).toBe(0.9);
    });

    it('should get min confidence', () => {
      ine2.generate('a', 'p', 0.5);
      ine2.generate('b', 'p', 0.9);
      expect(ine2.getStats().minConfidence).toBe(0.5);
    });

    it('should compute avg text length', () => {
      ine2.generate('a', 'hi', 0.5);
      expect(ine2.getStats().avgTextLength).toBe(2);
    });

    it('should get max text length', () => {
      ine2.generate('a', 'hi', 0.5);
      ine2.generate('a', 'hello', 0.5);
      expect(ine2.getStats().maxTextLength).toBe(5);
    });

    it('should get min text length', () => {
      ine2.generate('a', 'hi', 0.5);
      ine2.generate('a', 'hello', 0.5);
      expect(ine2.getStats().minTextLength).toBe(2);
    });

    it('should compute avg source length', () => {
      ine2.generate('a', 'p', 0.5);
      expect(ine2.getStats().avgSourceLength).toBe(1);
    });

    it('should get max source length', () => {
      ine2.generate('a', 'p', 0.5);
      ine2.generate('hello', 'p', 0.5);
      expect(ine2.getStats().maxSourceLength).toBe(5);
    });

    it('should get min source length', () => {
      ine2.generate('a', 'p', 0.5);
      ine2.generate('hello', 'p', 0.5);
      expect(ine2.getStats().minSourceLength).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get insight', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.getInsight('ine2-1')?.text).toBe('pattern');
    });

    it('should get all', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.getAllInsights()).toHaveLength(1);
    });

    it('should check existence', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.hasInsight('ine2-1')).toBe(true);
    });

    it('should count', () => {
      expect(ine2.getCount()).toBe(0);
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get source', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.getSource('ine2-1')).toBe('obs1');
    });

    it('should get text', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.getText('ine2-1')).toBe('pattern');
    });

    it('should get text length', () => {
      ine2.generate('obs1', 'pattern', 0.8);
      expect(ine2.getTextLength('ine2-1')).toBe(7);
    });

    it('should get source length', () => {
      ine2.generate('obs1', 'p', 0.5);
      expect(ine2.getSourceLength('ine2-1')).toBe(4);
    });

    it('should get history', () => {
      ine2.generate('obs1', 'p', 0.5);
      expect(ine2.getHistory('ine2-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = ine2.generate('obs1', 'p', 0.5);
      ine2.query(id);
      expect(ine2.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ine2.generate('obs1', 'p', 0.5);
      expect(ine2.setActive('ine2-1', false)).toBe(true);
    });

    it('should set confidence', () => {
      ine2.generate('obs1', 'p', 0.5);
      expect(ine2.setConfidence('ine2-1', 0.9)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ine2.setActive('unknown', false)).toBe(false);
      expect(ine2.setConfidence('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ine2.generate('obs1', 'p', 0.5);
      ine2.query(id);
      ine2.setActive(id, false);
      ine2.resetAll();
      expect(ine2.getHits(id)).toBe(0);
      expect(ine2.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by source / state
  // ============================================================
  describe('by source / state', () => {
    it('should get by source', () => {
      ine2.generate('obs1', 'p', 0.5);
      expect(ine2.getBySource('obs1')).toHaveLength(1);
    });

    it('should get active', () => {
      ine2.generate('obs1', 'p', 0.5);
      expect(ine2.getActiveInsights()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ine2.generate('obs1', 'p', 0.5);
      ine2.setActive('ine2-1', false);
      expect(ine2.getInactiveInsights()).toHaveLength(1);
    });

    it('should get all sources', () => {
      ine2.generate('a', 'p', 0.5);
      ine2.generate('b', 'p', 0.5);
      expect(ine2.getAllSources()).toHaveLength(2);
    });

    it('should get source count', () => {
      ine2.generate('a', 'p', 0.5);
      expect(ine2.getSourceCount()).toBe(1);
    });

    it('should get by min confidence', () => {
      ine2.generate('a', 'p', 0.5);
      ine2.generate('b', 'p', 0.9);
      expect(ine2.getByMinConfidence(0.8)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most confident', () => {
      ine2.generate('a', 'p', 0.5);
      ine2.generate('b', 'p', 0.9);
      expect(ine2.getMostConfident()?.id).toBe('ine2-2');
    });

    it('should return null for empty most', () => {
      expect(ine2.getMostConfident()).toBeNull();
    });

    it('should get newest', () => {
      ine2.generate('a', 'p', 0.5);
      expect(ine2.getNewest()?.id).toBe('ine2-1');
    });

    it('should return null for empty newest', () => {
      expect(ine2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ine2.generate('a', 'p', 0.5);
      expect(ine2.getOldest()?.id).toBe('ine2-1');
    });

    it('should return null for empty oldest', () => {
      expect(ine2.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ine2.generate('a', 'p', 0.5);
      expect(ine2.getCreatedAt('ine2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ine2.generate('a', 'p', 0.5);
      ine2.query(id);
      expect(ine2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total generated', () => {
      ine2.generate('a', 'p', 0.5);
      expect(ine2.getTotalGenerated()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many insights', () => {
      for (let i = 0; i < 50; i++) {
        ine2.generate(`obs${i}`, `p${i}`, 0.5);
      }
      expect(ine2.getCount()).toBe(50);
    });
  });
});