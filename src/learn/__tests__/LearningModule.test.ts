/**
 * LearningModule Tests
 * generic-agent-design Learning Module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LearningModule } from '../LearningModule';

describe('LearningModule', () => {
  let lm: LearningModule;

  beforeEach(() => {
    lm = new LearningModule();
  });

  afterEach(() => {
    lm.clearAll();
  });

  // ============================================================
  // record / retrieve
  // ============================================================
  describe('record / retrieve', () => {
    it('should record', () => {
      const id = lm.record('ctx', 'outcome', 0.5);
      expect(id).toBe('exp-1');
    });

    it('should retrieve above threshold', () => {
      lm.record('ctx', 'outcome', 0.8);
      expect(lm.retrieve(0.5)).toHaveLength(1);
    });

    it('should not retrieve below threshold', () => {
      lm.record('ctx', 'outcome', 0.3);
      expect(lm.retrieve(0.5)).toHaveLength(0);
    });

    it('should consider decay in retrieval', () => {
      const id = lm.record('ctx', 'outcome', 0.5);
      lm.setDecay(id, 0.5); // effective score = 0.25
      expect(lm.retrieve(0.3)).toHaveLength(0);
    });
  });

  // ============================================================
  // decay
  // ============================================================
  describe('decay', () => {
    it('should decay', () => {
      const id = lm.record('ctx', 'outcome', 0.5);
      lm.decay();
      expect(lm.getDecay(id)).toBe(0.9);
    });

    it('should not go below 0', () => {
      const id = lm.record('ctx', 'outcome', 0.5);
      for (let i = 0; i < 15; i++) lm.decay();
      expect(lm.getDecay(id)).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      lm.record('ctx', 'outcome', 0.5);
      const stats = lm.getStats();
      expect(stats.experiences).toBe(1);
    });

    it('should count total', () => {
      lm.record('ctx', 'outcome', 0.5);
      lm.record('ctx2', 'outcome2', 0.6);
      expect(lm.getStats().total).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get experience', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getExperience('exp-1')?.context).toBe('ctx');
    });

    it('should get all', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getAllExperiences()).toHaveLength(1);
    });

    it('should remove', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.removeExperience('exp-1')).toBe(true);
    });

    it('should check existence', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.hasExperience('exp-1')).toBe(true);
    });

    it('should count', () => {
      expect(lm.getCount()).toBe(0);
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get context', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getContext('exp-1')).toBe('ctx');
    });

    it('should get outcome', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getOutcome('exp-1')).toBe('outcome');
    });

    it('should get score', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getScore('exp-1')).toBe(0.5);
    });

    it('should get decay', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getDecay('exp-1')).toBe(1);
    });

    it('should set decay', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.setDecay('exp-1', 0.5)).toBe(true);
    });

    it('should set score', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.setScore('exp-1', 0.8)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(lm.setDecay('unknown', 0.5)).toBe(false);
      expect(lm.setScore('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // boost / penalize
  // ============================================================
  describe('boost / penalize', () => {
    it('should boost', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.boost('exp-1', 0.3)).toBe(true);
    });

    it('should cap at 1', () => {
      lm.record('ctx', 'outcome', 0.9);
      lm.boost('exp-1', 0.5);
      expect(lm.getScore('exp-1')).toBe(1);
    });

    it('should penalize', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.penalize('exp-1', 0.3)).toBe(true);
    });

    it('should floor at 0', () => {
      lm.record('ctx', 'outcome', 0.1);
      lm.penalize('exp-1', 0.5);
      expect(lm.getScore('exp-1')).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(lm.boost('unknown', 0.1)).toBe(false);
      expect(lm.penalize('unknown', 0.1)).toBe(false);
    });
  });

  // ============================================================
  // retrievals
  // ============================================================
  describe('retrievals', () => {
    it('should get retrievals', () => {
      lm.record('ctx', 'outcome', 0.8);
      lm.retrieve(0.5);
      expect(lm.getRetrievals('exp-1')).toBe(1);
    });

    it('should get retrieval count', () => {
      lm.record('ctx', 'outcome', 0.8);
      lm.retrieve(0.5);
      expect(lm.getRetrievalCount()).toBe(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getCreatedAt('exp-1')).toBeGreaterThan(0);
    });

    it('should get accessed at', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getAccessedAt('exp-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // by context / outcome
  // ============================================================
  describe('by context / outcome', () => {
    it('should get by context', () => {
      lm.record('hello', 'outcome', 0.5);
      expect(lm.getByContext('hello')).toHaveLength(1);
    });

    it('should get by outcome', () => {
      lm.record('ctx', 'success', 0.5);
      expect(lm.getByOutcome('success')).toHaveLength(1);
    });
  });

  // ============================================================
  // by score
  // ============================================================
  describe('by score', () => {
    it('should get high score', () => {
      lm.record('ctx', 'outcome', 0.8);
      expect(lm.getHighScore(0.5)).toHaveLength(1);
    });

    it('should get low score', () => {
      lm.record('ctx', 'outcome', 0.3);
      expect(lm.getLowScore(0.5)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most retrieved', () => {
      lm.record('ctx', 'outcome', 0.8);
      lm.retrieve(0.5);
      expect(lm.getMostRetrieved()?.id).toBe('exp-1');
    });

    it('should return null for empty', () => {
      expect(lm.getMostRetrieved()).toBeNull();
    });

    it('should get highest score', () => {
      lm.record('ctx', 'outcome', 0.8);
      expect(lm.getHighestScore()?.id).toBe('exp-1');
    });

    it('should return null for empty highest', () => {
      expect(lm.getHighestScore()).toBeNull();
    });

    it('should get lowest score', () => {
      lm.record('ctx', 'outcome', 0.3);
      expect(lm.getLowestScore()?.id).toBe('exp-1');
    });

    it('should return null for empty lowest', () => {
      expect(lm.getLowestScore()).toBeNull();
    });
  });

  // ============================================================
  // decay aggregate
  // ============================================================
  describe('decay aggregate', () => {
    it('should get avg decay', () => {
      lm.record('ctx', 'outcome', 0.5);
      expect(lm.getAvgDecay()).toBe(1);
    });

    it('should return 0 for empty', () => {
      expect(lm.getAvgDecay()).toBe(0);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      lm.record('ctx', 'outcome', 0.5);
      lm.resetAll();
      expect(lm.getScore('exp-1')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many experiences', () => {
      for (let i = 0; i < 50; i++) {
        lm.record(`ctx${i}`, `outcome${i}`, 0.5);
      }
      expect(lm.getCount()).toBe(50);
    });
  });
});