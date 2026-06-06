/**
 * BeliefEngine Tests
 * generic-agent-design Belief Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BeliefEngine } from '../BeliefEngine';

describe('BeliefEngine', () => {
  let bfe: BeliefEngine;

  beforeEach(() => {
    bfe = new BeliefEngine();
  });

  afterEach(() => {
    bfe.clearAll();
  });

  // ============================================================
  // set / strengthen / weaken / remove
  // ============================================================
  describe('set / strengthen / weaken / remove', () => {
    it('should set', () => {
      expect(bfe.set('sky is blue', 0.8, 5)).toBe('bfe-1');
    });

    it('should default confidence to 0.5', () => {
      const id = bfe.set('p1');
      expect(bfe.getConfidence(id)).toBe(0.5);
    });

    it('should default evidence to 0', () => {
      const id = bfe.set('p1');
      expect(bfe.getEvidence(id)).toBe(0);
    });

    it('should clamp confidence to 0-1', () => {
      const id = bfe.set('p1', 1.5);
      expect(bfe.getConfidence(id)).toBe(1);
    });

    it('should mark as active', () => {
      const id = bfe.set('p1');
      expect(bfe.isActive(id)).toBe(true);
    });

    it('should strengthen', () => {
      const id = bfe.set('p1', 0.5);
      expect(bfe.strengthen(id, 0.1)).toBe(true);
    });

    it('should increment confidence on strengthen', () => {
      const id = bfe.set('p1', 0.5);
      bfe.strengthen(id, 0.1);
      expect(bfe.getConfidence(id)).toBeCloseTo(0.6, 5);
    });

    it('should increment evidence on strengthen', () => {
      const id = bfe.set('p1', 0.5);
      bfe.strengthen(id, 0.1);
      expect(bfe.getEvidence(id)).toBe(1);
    });

    it('should clamp to 1 on strengthen overflow', () => {
      const id = bfe.set('p1', 0.9);
      bfe.strengthen(id, 0.5);
      expect(bfe.getConfidence(id)).toBe(1);
    });

    it('should not strengthen inactive', () => {
      const id = bfe.set('p1', 0.5);
      bfe.setActive(id, false);
      expect(bfe.strengthen(id, 0.1)).toBe(false);
    });

    it('should return false for unknown strengthen', () => {
      expect(bfe.strengthen('unknown', 0.1)).toBe(false);
    });

    it('should weaken', () => {
      const id = bfe.set('p1', 0.5);
      expect(bfe.weaken(id, 0.1)).toBe(true);
    });

    it('should decrement confidence on weaken', () => {
      const id = bfe.set('p1', 0.5);
      bfe.weaken(id, 0.1);
      expect(bfe.getConfidence(id)).toBeCloseTo(0.4, 5);
    });

    it('should decrement evidence on weaken', () => {
      const id = bfe.set('p1', 0.5, 1);
      bfe.weaken(id, 0.1);
      expect(bfe.getEvidence(id)).toBe(0);
    });

    it('should not weaken below 0', () => {
      const id = bfe.set('p1', 0.1);
      bfe.weaken(id, 0.5);
      expect(bfe.getConfidence(id)).toBe(0);
    });

    it('should not weaken inactive', () => {
      const id = bfe.set('p1', 0.5);
      bfe.setActive(id, false);
      expect(bfe.weaken(id, 0.1)).toBe(false);
    });

    it('should return false for unknown weaken', () => {
      expect(bfe.weaken('unknown', 0.1)).toBe(false);
    });

    it('should remove', () => {
      const id = bfe.set('p1', 0.5);
      expect(bfe.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      bfe.set('p1', 0.5);
      const stats = bfe.getStats();
      expect(stats.beliefs).toBe(1);
    });

    it('should count total strengthens', () => {
      const id = bfe.set('p1', 0.5);
      bfe.strengthen(id, 0.1);
      expect(bfe.getStats().totalStrengthens).toBe(1);
    });

    it('should count total weakens', () => {
      const id = bfe.set('p1', 0.5);
      bfe.weaken(id, 0.1);
      expect(bfe.getStats().totalWeakens).toBe(1);
    });

    it('should count active', () => {
      bfe.set('p1', 0.5);
      expect(bfe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bfe.set('p1', 0.5);
      bfe.setActive(id, false);
      expect(bfe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = bfe.set('p1', 0.5);
      bfe.strengthen(id, 0.1);
      expect(bfe.getStats().totalHits).toBe(1);
    });

    it('should count unique propositions', () => {
      bfe.set('a', 0.5);
      bfe.set('a', 0.5);
      expect(bfe.getStats().uniquePropositions).toBe(1);
    });

    it('should compute avg confidence', () => {
      bfe.set('a', 0.5);
      bfe.set('b', 0.9);
      expect(bfe.getStats().avgConfidence).toBe(0.7);
    });

    it('should get max confidence', () => {
      bfe.set('a', 0.5);
      bfe.set('b', 0.9);
      expect(bfe.getStats().maxConfidence).toBe(0.9);
    });

    it('should get min confidence', () => {
      bfe.set('a', 0.5);
      bfe.set('b', 0.9);
      expect(bfe.getStats().minConfidence).toBe(0.5);
    });

    it('should compute avg evidence', () => {
      bfe.set('a', 0.5, 2);
      bfe.set('b', 0.5, 4);
      expect(bfe.getStats().avgEvidence).toBe(3);
    });

    it('should get max evidence', () => {
      bfe.set('a', 0.5, 1);
      bfe.set('b', 0.5, 5);
      expect(bfe.getStats().maxEvidence).toBe(5);
    });

    it('should get min evidence', () => {
      bfe.set('a', 0.5, 1);
      bfe.set('b', 0.5, 5);
      expect(bfe.getStats().minEvidence).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get belief', () => {
      bfe.set('p1', 0.5);
      expect(bfe.getBelief('bfe-1')?.proposition).toBe('p1');
    });

    it('should get all', () => {
      bfe.set('p1', 0.5);
      expect(bfe.getAllBeliefs()).toHaveLength(1);
    });

    it('should check existence', () => {
      bfe.set('p1', 0.5);
      expect(bfe.hasBelief('bfe-1')).toBe(true);
    });

    it('should count', () => {
      expect(bfe.getCount()).toBe(0);
      bfe.set('p1', 0.5);
      expect(bfe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get proposition', () => {
      bfe.set('p1', 0.5);
      expect(bfe.getProposition('bfe-1')).toBe('p1');
    });

    it('should get hits', () => {
      const id = bfe.set('p1', 0.5);
      bfe.strengthen(id, 0.1);
      expect(bfe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      bfe.set('p1', 0.5);
      expect(bfe.setActive('bfe-1', false)).toBe(true);
    });

    it('should set confidence', () => {
      bfe.set('p1', 0.5);
      expect(bfe.setConfidence('bfe-1', 0.9)).toBe(true);
    });

    it('should clamp confidence on setConfidence', () => {
      const id = bfe.set('p1', 0.5);
      bfe.setConfidence(id, 1.5);
      expect(bfe.getConfidence(id)).toBe(1);
    });

    it('should return false for unknown', () => {
      expect(bfe.setActive('unknown', false)).toBe(false);
      expect(bfe.setConfidence('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = bfe.set('p1', 0.9);
      bfe.strengthen(id, 0.1);
      bfe.setActive(id, false);
      bfe.resetAll();
      expect(bfe.getConfidence(id)).toBe(0.5);
      expect(bfe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by state
  // ============================================================
  describe('by state', () => {
    it('should get active', () => {
      bfe.set('p1', 0.5);
      expect(bfe.getActiveBeliefs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      bfe.set('p1', 0.5);
      bfe.setActive('bfe-1', false);
      expect(bfe.getInactiveBeliefs()).toHaveLength(1);
    });

    it('should get all propositions', () => {
      bfe.set('a', 0.5);
      bfe.set('b', 0.5);
      expect(bfe.getAllPropositions()).toHaveLength(2);
    });

    it('should get proposition count', () => {
      bfe.set('a', 0.5);
      expect(bfe.getPropositionCount()).toBe(1);
    });

    it('should get by min confidence', () => {
      bfe.set('a', 0.5);
      bfe.set('b', 0.9);
      expect(bfe.getByMinConfidence(0.7)).toHaveLength(1);
    });

    it('should get by min evidence', () => {
      bfe.set('a', 0.5, 1);
      bfe.set('b', 0.5, 5);
      expect(bfe.getByMinEvidence(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most confident', () => {
      bfe.set('a', 0.5);
      bfe.set('b', 0.9);
      expect(bfe.getMostConfident()?.id).toBe('bfe-2');
    });

    it('should return null for empty most', () => {
      expect(bfe.getMostConfident()).toBeNull();
    });

    it('should get newest', () => {
      bfe.set('p1', 0.5);
      expect(bfe.getNewest()?.id).toBe('bfe-1');
    });

    it('should return null for empty newest', () => {
      expect(bfe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bfe.set('p1', 0.5);
      expect(bfe.getOldest()?.id).toBe('bfe-1');
    });

    it('should return null for empty oldest', () => {
      expect(bfe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      bfe.set('p1', 0.5);
      expect(bfe.getCreatedAt('bfe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bfe.set('p1', 0.5);
      bfe.strengthen(id, 0.1);
      expect(bfe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total strengthens', () => {
      const id = bfe.set('p1', 0.5);
      bfe.strengthen(id, 0.1);
      expect(bfe.getTotalStrengthens()).toBe(1);
    });

    it('should get total weakens', () => {
      const id = bfe.set('p1', 0.5);
      bfe.weaken(id, 0.1);
      expect(bfe.getTotalWeakens()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many beliefs', () => {
      for (let i = 0; i < 50; i++) {
        bfe.set(`p${i}`, 0.5);
      }
      expect(bfe.getCount()).toBe(50);
    });
  });
});