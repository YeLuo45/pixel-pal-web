/**
 * DecisionEngineV2 Tests
 * generic-agent-design Decision Engine v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DecisionEngineV2 } from '../DecisionEngineV2';

describe('DecisionEngineV2', () => {
  let de: DecisionEngineV2;

  beforeEach(() => {
    de = new DecisionEngineV2();
  });

  afterEach(() => {
    de.clearAll();
  });

  // ============================================================
  // define / execute / rescore
  // ============================================================
  describe('define / execute / rescore', () => {
    it('should define', () => {
      expect(de.define('ctx', 'act', 0.5)).toBe('de-1');
    });

    it('should clamp score', () => {
      const id = de.define('ctx', 'act', 1.5);
      expect(de.getScore(id)).toBe(1);
    });

    it('should execute', () => {
      const id = de.define('ctx', 'act', 0.5);
      expect(de.execute(id)).toBe(true);
    });

    it('should not execute inactive', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.setActive(id, false);
      expect(de.execute(id)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(de.execute('unknown')).toBe(false);
    });

    it('should rescore', () => {
      const id = de.define('ctx', 'act', 0.5);
      expect(de.rescore(id, 0.8)).toBe(true);
    });

    it('should clamp rescore', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.rescore(id, 1.5);
      expect(de.getScore(id)).toBe(1);
    });

    it('should return false for unknown rescore', () => {
      expect(de.rescore('unknown', 0.5)).toBe(false);
    });

    it('should track history', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.rescore(id, 0.8);
      expect(de.getHistory(id)).toEqual([0.5, 0.8]);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      de.define('ctx', 'act', 0.5);
      const stats = de.getStats();
      expect(stats.decisions).toBe(1);
    });

    it('should count total executions', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.execute(id);
      expect(de.getStats().totalExecutions).toBe(1);
    });

    it('should compute avg score', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getStats().avgScore).toBe(0.5);
    });

    it('should count active', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.setActive(id, false);
      expect(de.getStats().inactive).toBe(1);
    });

    it('should compute avg executions', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.execute(id);
      de.execute(id);
      expect(de.getStats().avgExecutions).toBe(2);
    });

    it('should count total rescores', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.rescore(id, 0.8);
      expect(de.getStats().totalRescores).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get decision', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getDecision('de-1')?.context).toBe('ctx');
    });

    it('should get all', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getAllDecisions()).toHaveLength(1);
    });

    it('should remove', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.removeDecision('de-1')).toBe(true);
    });

    it('should check existence', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.hasDecision('de-1')).toBe(true);
    });

    it('should count', () => {
      expect(de.getCount()).toBe(0);
      de.define('ctx', 'act', 0.5);
      expect(de.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get context', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getContext('de-1')).toBe('ctx');
    });

    it('should get action', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getAction('de-1')).toBe('act');
    });

    it('should get score', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getScore('de-1')).toBe(0.5);
    });

    it('should get executions', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.execute(id);
      expect(de.getExecutions(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.execute(id);
      expect(de.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getHistory('de-1')).toEqual([0.5]);
    });

    it('should check isActive', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.isActive('de-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = de.define('ctx', 'act', 0.5);
      expect(de.setActive(id, false)).toBe(true);
    });

    it('should set context', () => {
      const id = de.define('ctx', 'act', 0.5);
      expect(de.setContext(id, 'new')).toBe(true);
    });

    it('should set action', () => {
      const id = de.define('ctx', 'act', 0.5);
      expect(de.setAction(id, 'new')).toBe(true);
    });

    it('should set score', () => {
      const id = de.define('ctx', 'act', 0.5);
      expect(de.setScore(id, 0.8)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(de.setActive('unknown', false)).toBe(false);
      expect(de.setContext('unknown', 'c')).toBe(false);
      expect(de.setAction('unknown', 'a')).toBe(false);
      expect(de.setScore('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset executions', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.execute(id);
      de.resetExecutions();
      expect(de.getExecutions(id)).toBe(0);
    });

    it('should reset history', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.rescore(id, 0.8);
      de.resetHistory();
      expect(de.getHistory(id)).toEqual([0.8]);
    });

    it('should reset all', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.execute(id);
      de.setActive(id, false);
      de.resetAll();
      expect(de.getExecutions(id)).toBe(0);
      expect(de.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by context / state
  // ============================================================
  describe('by context / state', () => {
    it('should get by context', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getByContext('ctx')).toHaveLength(1);
    });

    it('should get active', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getActiveDecisions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.setActive(id, false);
      expect(de.getInactiveDecisions()).toHaveLength(1);
    });

    it('should get by min score', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getByMinScore(0.3)).toHaveLength(1);
    });

    it('should get all contexts', () => {
      de.define('ctx1', 'act', 0.5);
      de.define('ctx2', 'act', 0.5);
      expect(de.getAllContexts()).toHaveLength(2);
    });

    it('should get context count', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getContextCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most executed', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.execute(id);
      expect(de.getMostExecuted()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(de.getMostExecuted()).toBeNull();
    });

    it('should get highest score', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getHighestScore()?.id).toBe('de-1');
    });

    it('should return null for empty highest', () => {
      expect(de.getHighestScore()).toBeNull();
    });

    it('should get newest', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getNewest()?.id).toBe('de-1');
    });

    it('should return null for empty newest', () => {
      expect(de.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getOldest()?.id).toBe('de-1');
    });

    it('should return null for empty oldest', () => {
      expect(de.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      de.define('ctx', 'act', 0.5);
      expect(de.getCreatedAt('de-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.execute(id);
      expect(de.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total rescores
  // ============================================================
  describe('total rescores', () => {
    it('should get total rescores', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.rescore(id, 0.8);
      expect(de.getTotalRescores()).toBe(1);
    });

    it('should reset total rescores', () => {
      const id = de.define('ctx', 'act', 0.5);
      de.rescore(id, 0.8);
      de.resetTotalRescores();
      expect(de.getTotalRescores()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many decisions', () => {
      for (let i = 0; i < 50; i++) {
        de.define('ctx', 'act', 0.5);
      }
      expect(de.getCount()).toBe(50);
    });
  });
});