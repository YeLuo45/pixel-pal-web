/**
 * InsightEngine Tests
 * generic-agent-design Insight Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InsightEngine } from '../InsightEngine';

describe('InsightEngine', () => {
  let ie: InsightEngine;

  beforeEach(() => {
    ie = new InsightEngine();
  });

  afterEach(() => {
    ie.clearAll();
  });

  // ============================================================
  // generate / verify
  // ============================================================
  describe('generate / verify', () => {
    it('should generate', () => {
      expect(ie.generate('t1', 'c1', 0.8)).toBe('ie-1');
    });

    it('should mark as active', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      expect(ie.isActive(id)).toBe(true);
    });

    it('should mark as unverified initially', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      expect(ie.isVerified(id)).toBe(false);
    });

    it('should verify', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      expect(ie.verify(id, true)).toBe(true);
    });

    it('should mark as verified', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      expect(ie.isVerified(id)).toBe(true);
    });

    it('should verify false', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      ie.verify(id, false);
      expect(ie.isVerified(id)).toBe(false);
    });

    it('should log history on verify', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      ie.verify(id, false);
      expect(ie.getHistory(id)).toEqual([true, false]);
    });

    it('should not verify inactive', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.setActive(id, false);
      expect(ie.verify(id, true)).toBe(false);
    });

    it('should return false for unknown verify', () => {
      expect(ie.verify('unknown', true)).toBe(false);
    });

    it('should set confidence', () => {
      const id = ie.generate('t1', 'c1', 0.5);
      expect(ie.setConfidence(id, 0.9)).toBe(true);
    });

    it('should not set confidence inactive', () => {
      const id = ie.generate('t1', 'c1', 0.5);
      ie.setActive(id, false);
      expect(ie.setConfidence(id, 0.9)).toBe(false);
    });

    it('should return false for unknown setConfidence', () => {
      expect(ie.setConfidence('unknown', 0.9)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ie.generate('t1', 'c1', 0.8);
      const stats = ie.getStats();
      expect(stats.insights).toBe(1);
    });

    it('should count verified', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      expect(ie.getStats().verified).toBe(1);
    });

    it('should count unverified', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getStats().unverified).toBe(1);
    });

    it('should count active', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.setActive(id, false);
      expect(ie.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      expect(ie.getStats().totalHits).toBe(1);
    });

    it('should compute avg confidence', () => {
      ie.generate('t1', 'c1', 0.5);
      ie.generate('t2', 'c2', 0.9);
      expect(ie.getStats().avgConfidence).toBe(0.7);
    });

    it('should get max confidence', () => {
      ie.generate('t1', 'c1', 0.5);
      ie.generate('t2', 'c2', 0.9);
      expect(ie.getStats().maxConfidence).toBe(0.9);
    });

    it('should get min confidence', () => {
      ie.generate('t1', 'c1', 0.5);
      ie.generate('t2', 'c2', 0.9);
      expect(ie.getStats().minConfidence).toBe(0.5);
    });

    it('should compute verify rate', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      expect(ie.getStats().verifyRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get insight', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getInsight('ie-1')?.topic).toBe('t1');
    });

    it('should get all', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getAllInsights()).toHaveLength(1);
    });

    it('should remove', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.removeInsight('ie-1')).toBe(true);
    });

    it('should check existence', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.hasInsight('ie-1')).toBe(true);
    });

    it('should count', () => {
      expect(ie.getCount()).toBe(0);
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get topic', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getTopic('ie-1')).toBe('t1');
    });

    it('should get content', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getContent('ie-1')).toBe('c1');
    });

    it('should get confidence', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getConfidence('ie-1')).toBe(0.8);
    });

    it('should get history', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getHistory('ie-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      expect(ie.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.setActive('ie-1', false)).toBe(true);
    });

    it('should set topic', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.setTopic('ie-1', 't2')).toBe(true);
    });

    it('should set content', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.setContent('ie-1', 'c2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ie.setActive('unknown', false)).toBe(false);
      expect(ie.setTopic('unknown', 't')).toBe(false);
      expect(ie.setContent('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      ie.setActive(id, false);
      ie.resetAll();
      expect(ie.isVerified(id)).toBe(false);
      expect(ie.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by topic / state
  // ============================================================
  describe('by topic / state', () => {
    it('should get by topic', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getByTopic('t1')).toHaveLength(1);
    });

    it('should get verified', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      expect(ie.getVerifiedInsights()).toHaveLength(1);
    });

    it('should get unverified', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getUnverifiedInsights()).toHaveLength(1);
    });

    it('should get active', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getActiveInsights()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ie.generate('t1', 'c1', 0.8);
      ie.setActive('ie-1', false);
      expect(ie.getInactiveInsights()).toHaveLength(1);
    });

    it('should get all topics', () => {
      ie.generate('t1', 'c1', 0.8);
      ie.generate('t2', 'c2', 0.8);
      expect(ie.getAllTopics()).toHaveLength(2);
    });

    it('should get topic count', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getTopicCount()).toBe(1);
    });

    it('should get by min confidence', () => {
      ie.generate('t1', 'c1', 0.5);
      ie.generate('t2', 'c2', 0.9);
      expect(ie.getByMinConfidence(0.7)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most confidence', () => {
      const id = ie.generate('t1', 'c1', 0.9);
      ie.generate('t2', 'c2', 0.5);
      expect(ie.getMostConfidence()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ie.getMostConfidence()).toBeNull();
    });

    it('should get newest', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getNewest()?.id).toBe('ie-1');
    });

    it('should return null for empty newest', () => {
      expect(ie.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getOldest()?.id).toBe('ie-1');
    });

    it('should return null for empty oldest', () => {
      expect(ie.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ie.generate('t1', 'c1', 0.8);
      expect(ie.getCreatedAt('ie-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ie.generate('t1', 'c1', 0.8);
      ie.verify(id, true);
      expect(ie.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many insights', () => {
      for (let i = 0; i < 50; i++) {
        ie.generate(`t${i}`, `c${i}`, 0.5);
      }
      expect(ie.getCount()).toBe(50);
    });
  });
});